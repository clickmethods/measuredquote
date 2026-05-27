import type { Express } from "express";
import { createServer } from 'node:http';
import type { Server } from 'node:http';
import { storage } from "./storage";
import { insertLeadSchema, insertWidgetEventSchema } from "@shared/schema";
import type { Integration } from "@shared/schema";
import { z } from "zod";
import { deliverWebhook, fanoutLeadCreated } from "./webhooks";
import { streamLeadPdf } from "./pdf";

/** Convert an integration row to its API representation, masking the secret. */
function publicIntegration(i: Integration) {
  const hasSecret = !!(i.secret && i.secret.length > 0);
  return {
    id: i.id,
    provider: i.provider,
    displayName: i.displayName,
    category: i.category,
    enabled: !!i.enabled,
    endpoint: i.endpoint,
    secretMasked: hasSecret ? "••••••••" + i.secret.slice(-4) : "",
    hasSecret,
    authHeaderMasked: i.authHeader ? "set" : "",
    events: safeParseArray(i.eventsJson),
    lastStatus: i.lastStatus,
    lastStatusCode: i.lastStatusCode,
    lastTestedAt: i.lastTestedAt,
    lastDeliveredAt: i.lastDeliveredAt,
    createdAt: i.createdAt,
    updatedAt: i.updatedAt,
  };
}

function safeParseArray(s: string): string[] {
  try {
    const v = JSON.parse(s);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // ===== Leads =====
  app.get("/api/leads", async (_req, res) => {
    const list = await storage.listLeads();
    res.json(list);
  });

  app.get("/api/leads/:id", async (req, res) => {
    const lead = await storage.getLead(Number(req.params.id));
    if (!lead) return res.status(404).json({ error: "not_found" });
    res.json(lead);
  });

  app.post("/api/leads", async (req, res) => {
    const parse = insertLeadSchema.safeParse(req.body);
    if (!parse.success) return res.status(400).json({ error: "validation", details: parse.error.flatten() });
    const lead = await storage.createLead(parse.data);
    res.json(lead);
    // Fan out to integrations in the background — never block the response.
    fanoutLeadCreated(lead).catch((err) =>
      console.error("[fanout] lead.created failed", err?.message ?? err),
    );
  });

  app.patch("/api/leads/:id/status", async (req, res) => {
    const schema = z.object({ status: z.enum(["new", "contacted", "scheduled", "quoted", "won", "lost"]) });
    const parse = schema.safeParse(req.body);
    if (!parse.success) return res.status(400).json({ error: "validation" });
    const lead = await storage.updateLeadStatus(Number(req.params.id), parse.data.status);
    if (!lead) return res.status(404).json({ error: "not_found" });
    res.json(lead);
  });

  // ===== Proposal PDF =====
  app.get("/api/leads/:id/proposal.pdf", async (req, res) => {
    const lead = await storage.getLead(Number(req.params.id));
    if (!lead) return res.status(404).json({ error: "not_found" });
    const filename = `MeasuredQuote-Estimate-${String(lead.id).padStart(4, "0")}.pdf`;
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${filename}"`);
    res.setHeader("Cache-Control", "private, max-age=60");
    try {
      streamLeadPdf(res, lead);
    } catch (err: any) {
      console.error("[pdf] generation failed", err?.message ?? err);
      if (!res.headersSent) res.status(500).json({ error: "pdf_failed" });
    }
  });

  // ===== Integrations =====
  app.get("/api/integrations", async (_req, res) => {
    const list = await storage.listIntegrations();
    res.json(list.map(publicIntegration));
  });

  const upsertSchema = z.object({
    provider: z.string().min(1),
    displayName: z.string().min(1),
    category: z.enum(["crm", "automation", "webhook"]).default("webhook"),
    enabled: z.boolean().optional(),
    endpoint: z.string().url().or(z.literal("")).optional(),
    secret: z.string().optional(),       // raw secret (only ever written, never returned)
    authHeader: z.string().optional(),
    events: z.array(z.string()).optional(),
  });

  app.post("/api/integrations", async (req, res) => {
    const parse = upsertSchema.safeParse(req.body);
    if (!parse.success) return res.status(400).json({ error: "validation", details: parse.error.flatten() });
    const v = parse.data;
    const existing = await storage.getIntegrationByProvider(v.provider);
    const patch = {
      provider: v.provider,
      displayName: v.displayName,
      category: v.category,
      enabled: v.enabled ? 1 : 0,
      endpoint: v.endpoint ?? "",
      secret: v.secret ?? "",
      authHeader: v.authHeader ?? "",
      eventsJson: JSON.stringify(v.events ?? ["lead.created"]),
    };
    if (existing) {
      const updated = await storage.updateIntegration(existing.id, patch as any);
      return res.json(publicIntegration(updated!));
    }
    const created = await storage.createIntegration(patch as any);
    return res.json(publicIntegration(created));
  });

  app.patch("/api/integrations/:id", async (req, res) => {
    const id = Number(req.params.id);
    const partial = z
      .object({
        displayName: z.string().optional(),
        enabled: z.boolean().optional(),
        endpoint: z.string().url().or(z.literal("")).optional(),
        secret: z.string().optional(),
        authHeader: z.string().optional(),
        events: z.array(z.string()).optional(),
      })
      .safeParse(req.body);
    if (!partial.success) return res.status(400).json({ error: "validation", details: partial.error.flatten() });
    const v = partial.data;
    const patch: Record<string, unknown> = {};
    if (v.displayName !== undefined) patch.displayName = v.displayName;
    if (v.enabled !== undefined) patch.enabled = v.enabled ? 1 : 0;
    if (v.endpoint !== undefined) patch.endpoint = v.endpoint;
    if (v.secret !== undefined && v.secret !== "" && !v.secret.startsWith("••")) patch.secret = v.secret;
    if (v.authHeader !== undefined) patch.authHeader = v.authHeader;
    if (v.events !== undefined) patch.eventsJson = JSON.stringify(v.events);
    const updated = await storage.updateIntegration(id, patch as any);
    if (!updated) return res.status(404).json({ error: "not_found" });
    res.json(publicIntegration(updated));
  });

  app.post("/api/integrations/:id/test", async (req, res) => {
    const id = Number(req.params.id);
    const integration = await storage.getIntegration(id);
    if (!integration) return res.status(404).json({ error: "not_found" });
    const result = await deliverWebhook(
      integration,
      "test.ping",
      {
        message: "Test ping from MeasuredQuote",
        tenant: "ortiz-concrete",
        sample: {
          name: "Test Lead",
          trade: "concrete",
          lowEstimate: 9000,
          highEstimate: 11000,
        },
      },
      { testedOnly: true },
    );
    res.json(result);
  });

  // ===== Webhook deliveries log =====
  app.get("/api/webhooks/deliveries", async (req, res) => {
    const limit = Math.min(200, Number(req.query.limit ?? 50) || 50);
    const list = await storage.listDeliveries(limit);
    res.json(
      list.map((d) => ({
        id: d.id,
        integrationId: d.integrationId,
        provider: d.provider,
        eventType: d.eventType,
        endpoint: d.endpoint,
        status: d.status,
        statusCode: d.statusCode,
        responseSnippet: d.responseSnippet,
        attempt: d.attempt,
        durationMs: d.durationMs,
        createdAt: d.createdAt,
      })),
    );
  });

  // ===== Widget events =====
  app.post("/api/events", async (req, res) => {
    const parse = insertWidgetEventSchema.safeParse(req.body);
    if (!parse.success) return res.status(400).json({ error: "validation", details: parse.error.flatten() });
    const ev = await storage.createEvent(parse.data);
    res.json({ id: ev.id, ok: true });
  });

  app.get("/api/events", async (req, res) => {
    const limit = Math.min(2000, Number(req.query.limit ?? 500) || 500);
    const list = await storage.listEvents(limit);
    res.json(list);
  });

  return httpServer;
}
