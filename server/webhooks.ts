import crypto from "node:crypto";
import { storage } from "./storage";
import type { Integration, Lead } from "@shared/schema";

const PRIVATE_HOST_RX = /^(localhost|127\.|10\.|192\.168\.|169\.254\.|::1|fc|fd)/i;

/**
 * Returns true when the URL points at a private/loopback/link-local host.
 * We refuse to deliver to those by default so the sandbox cannot be used
 * to probe internal services.
 */
function isPrivateUrl(u: string): boolean {
  try {
    const url = new URL(u);
    if (PRIVATE_HOST_RX.test(url.hostname)) return true;
    return false;
  } catch {
    return true;
  }
}

function sign(body: string, secret: string, timestamp: string): string {
  return crypto
    .createHmac("sha256", secret || "measuredquote-demo-secret")
    .update(`${timestamp}.${body}`)
    .digest("hex");
}

export interface DeliveryResult {
  status: "success" | "failure" | "skipped";
  statusCode?: number;
  responseSnippet: string;
  durationMs: number;
  reason?: string;
}

export async function deliverWebhook(
  integration: Integration,
  eventType: string,
  payloadObj: Record<string, unknown>,
  opts: { testedOnly?: boolean } = {},
): Promise<DeliveryResult> {
  const endpoint = (integration.endpoint || "").trim();
  const body = JSON.stringify({
    event: eventType,
    integration: integration.provider,
    delivered_at: new Date().toISOString(),
    ...payloadObj,
  });

  // No endpoint configured -> log a skipped delivery so the UI can show intent
  if (!endpoint) {
    const result: DeliveryResult = {
      status: "skipped",
      responseSnippet: "no_endpoint_configured",
      durationMs: 0,
      reason: "endpoint not set",
    };
    await storage.createDelivery({
      integrationId: integration.id,
      provider: integration.provider,
      eventType,
      endpoint: "",
      requestPayload: body,
      status: result.status,
      statusCode: null,
      responseSnippet: result.responseSnippet,
      attempt: 1,
      durationMs: 0,
    });
    return result;
  }

  // Refuse private/loopback by default
  if (isPrivateUrl(endpoint)) {
    const result: DeliveryResult = {
      status: "skipped",
      responseSnippet: "private_endpoint_blocked",
      durationMs: 0,
      reason: "endpoint is loopback/private",
    };
    await storage.createDelivery({
      integrationId: integration.id,
      provider: integration.provider,
      eventType,
      endpoint,
      requestPayload: body,
      status: result.status,
      statusCode: null,
      responseSnippet: result.responseSnippet,
      attempt: 1,
      durationMs: 0,
    });
    return result;
  }

  const timestamp = String(Math.floor(Date.now() / 1000));
  const signature = sign(body, integration.secret, timestamp);
  const headers: Record<string, string> = {
    "content-type": "application/json",
    "user-agent": "MeasuredQuote-Webhook/1.0",
    "x-measuredquote-event": eventType,
    "x-measuredquote-timestamp": timestamp,
    "x-measuredquote-signature": `v1=${signature}`,
  };
  if (integration.authHeader) headers["authorization"] = integration.authHeader;

  const started = Date.now();
  let statusCode: number | undefined;
  let snippet = "";
  let status: DeliveryResult["status"] = "failure";

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 7000);
    const res = await fetch(endpoint, {
      method: "POST",
      headers,
      body,
      signal: controller.signal,
    });
    clearTimeout(timer);
    statusCode = res.status;
    const text = await res.text().catch(() => "");
    snippet = text.slice(0, 400);
    status = res.ok ? "success" : "failure";
  } catch (err: any) {
    snippet = (err?.message || String(err)).slice(0, 400);
    status = "failure";
  }

  const durationMs = Date.now() - started;

  await storage.createDelivery({
    integrationId: integration.id,
    provider: integration.provider,
    eventType,
    endpoint,
    requestPayload: body,
    status,
    statusCode: statusCode ?? null,
    responseSnippet: snippet,
    attempt: 1,
    durationMs,
  });

  await storage.recordIntegrationDelivery(integration.id, status, statusCode, opts.testedOnly);

  return { status, statusCode, responseSnippet: snippet, durationMs };
}

/**
 * Fan out a lead.created event to every enabled integration that subscribes
 * to it. Runs in the background — failures never block the API response.
 */
export async function fanoutLeadCreated(lead: Lead): Promise<void> {
  const integrations = await storage.listEnabledIntegrationsForEvent("lead.created");
  if (integrations.length === 0) return;
  const payload = {
    lead: {
      id: lead.id,
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      address: lead.address,
      trade: lead.trade,
      measurement: lead.measurement,
      measurementUnit: lead.measurementUnit,
      material: lead.material,
      lowEstimate: lead.lowEstimate,
      highEstimate: lead.highEstimate,
      language: lead.language,
      sourceUrl: lead.sourceUrl,
      status: lead.status,
      createdAt: lead.createdAt,
    },
  };
  await Promise.all(
    integrations.map((i) =>
      deliverWebhook(i, "lead.created", payload).catch((err) => {
        console.error(`[webhook] ${i.provider} failed`, err?.message ?? err);
      }),
    ),
  );
}
