// /api/leads — Netlify Function skeleton.
//
// Production responsibilities:
//   GET    /api/leads                  -> list leads for the current tenant (RLS-scoped)
//   POST   /api/leads                  -> create a lead (widget token OR user JWT)
//   GET    /api/leads/:id              -> fetch a single lead by id
//   GET    /api/leads/:id/proposal.pdf -> stream the proposal PDF (handled here
//                                         by importing the same pdfkit helper
//                                         the Express server uses, then writing
//                                         the buffer as base64).
//
// This file is a SKELETON: it lays out the shape of the handler and the
// places where Supabase + tenant scoping plug in. Today the live app still
// uses the Express version in `server/routes.ts`; flipping over to Netlify
// is a deploy concern, not a code change.

import type { Handler, HandlerEvent } from "@netlify/functions";
import { getServiceClient } from "../lib/supabase";
import { getBearer, verifyWidgetToken } from "../lib/auth";
import { renderProposalPdf } from "../lib/pdf";
import { fanoutEvent } from "../lib/webhooks";
import {
  ok,
  badRequest,
  created,
  forbidden,
  notFound,
  methodNotAllowed,
  preflight,
  serverError,
} from "../lib/response";

interface LeadInput {
  name: string;
  email: string;
  phone: string;
  address: string;
  language?: string;
  trade: string;
  measurement: number;
  measurement_unit: "sqft" | "lf";
  material: string;
  addons?: unknown[];
  low_estimate: number;
  high_estimate: number;
  line_items?: unknown[];
  geometry?: unknown;
  source_url?: string;
}

function parseLeadIdFromPath(path: string): { id: string | null; isPdf: boolean } {
  // matches /.netlify/functions/leads/<id> and /.netlify/functions/leads/<id>/proposal.pdf
  const m = /\/leads\/([^/]+)(\/proposal\.pdf)?$/.exec(path);
  if (!m) return { id: null, isPdf: false };
  return { id: m[1], isPdf: Boolean(m[2]) };
}

async function authorize(event: HandlerEvent): Promise<{ tenantId: string } | { error: string }> {
  const bearer = getBearer(event);
  const widgetToken = event.headers["x-measuredquote-widget-token"];

  // Widget path: look up tenant's widget_token_secret and verify.
  if (widgetToken && typeof widgetToken === "string") {
    const tenantId = widgetToken.split(".")[0];
    if (!tenantId) return { error: "invalid widget token" };
    const supabase = getServiceClient();
    const { data: tenant, error } = await supabase
      .from("tenants")
      .select("id, widget_token_secret, status")
      .eq("id", tenantId)
      .single();
    if (error || !tenant) return { error: "tenant not found" };
    if (tenant.status !== "active") return { error: "tenant inactive" };
    const verified = verifyWidgetToken(widgetToken, tenant.widget_token_secret);
    if (!verified) return { error: "widget token signature mismatch" };
    return { tenantId: tenant.id };
  }

  // User session path: trust Supabase JWT, look up tenant membership.
  if (bearer) {
    const supabase = getServiceClient();
    const { data: userData, error: userErr } = await supabase.auth.getUser(bearer);
    if (userErr || !userData?.user) return { error: "invalid session" };
    const { data: membership } = await supabase
      .from("tenant_members")
      .select("tenant_id, role")
      .eq("user_id", userData.user.id)
      .limit(1)
      .single();
    if (!membership) return { error: "no tenant membership" };
    return { tenantId: membership.tenant_id };
  }

  return { error: "missing credentials" };
}

export const handler: Handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return preflight();

  try {
    const auth = await authorize(event);
    if ("error" in auth) return forbidden(auth.error);
    const { tenantId } = auth;

    const { id, isPdf } = parseLeadIdFromPath(event.path);
    const supabase = getServiceClient();

    // --- GET single / PDF ----------------------------------------------------
    if (id && event.httpMethod === "GET") {
      const { data: lead, error } = await supabase
        .from("leads")
        .select("*")
        .eq("tenant_id", tenantId)
        .eq("id", id)
        .single();
      if (error || !lead) return notFound("lead not found");

      if (isPdf) {
        // Optional tenant join for branding (best-effort).
        const { data: tenant } = await supabase
          .from("tenants")
          .select("name, brand_color, contact_email")
          .eq("id", tenantId)
          .single();
        const pdf = await renderProposalPdf({
          id: lead.id,
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          address: lead.address,
          language: lead.language ?? "en",
          trade: lead.trade,
          measurement: lead.measurement,
          measurement_unit: lead.measurement_unit,
          material: lead.material,
          low_estimate: lead.low_estimate,
          high_estimate: lead.high_estimate,
          line_items: lead.line_items,
          addons: lead.addons,
          created_at: lead.created_at,
          tenant: tenant ?? null,
        });
        return {
          statusCode: 200,
          headers: {
            "Content-Type": "application/pdf",
            "Cache-Control": "private, max-age=0, no-store",
            "Content-Disposition": `inline; filename=\"measuredquote-estimate-${lead.id}.pdf\"`,
          },
          body: pdf.toString("base64"),
          isBase64Encoded: true,
        };
      }
      return ok(lead);
    }

    // --- LIST ----------------------------------------------------------------
    if (!id && event.httpMethod === "GET") {
      const { data: leads, error } = await supabase
        .from("leads")
        .select("*")
        .eq("tenant_id", tenantId)
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) return serverError(error);
      return ok(leads ?? []);
    }

    // --- CREATE --------------------------------------------------------------
    if (!id && event.httpMethod === "POST") {
      if (!event.body) return badRequest("missing body");
      const payload = JSON.parse(event.body) as LeadInput;

      // Lightweight validation — production should use the Zod schema in
      // `shared/schema.ts` (re-exported as a Supabase-friendly version).
      const requiredKeys: (keyof LeadInput)[] = [
        "name",
        "email",
        "phone",
        "address",
        "trade",
        "measurement",
        "measurement_unit",
        "material",
        "low_estimate",
        "high_estimate",
      ];
      for (const k of requiredKeys) {
        if (payload[k] === undefined || payload[k] === null || payload[k] === "") {
          return badRequest(`missing field: ${k}`);
        }
      }

      const { data: lead, error } = await supabase
        .from("leads")
        .insert({
          tenant_id: tenantId,
          name: payload.name,
          email: payload.email,
          phone: payload.phone,
          address: payload.address,
          language: payload.language ?? "en",
          trade: payload.trade,
          measurement: payload.measurement,
          measurement_unit: payload.measurement_unit,
          material: payload.material,
          addons: payload.addons ?? [],
          low_estimate: payload.low_estimate,
          high_estimate: payload.high_estimate,
          line_items: payload.line_items ?? [],
          geometry: payload.geometry ?? null,
          source_url: payload.source_url ?? "demo.measuredquote.com",
          status: "new",
        })
        .select()
        .single();
      if (error) return serverError(error);

      // Fire-and-forget webhook fan-out. Failures never block the API caller;
      // a richer retry queue is tracked as a Phase 6 item.
      fanoutEvent(tenantId, "lead.created", { lead }).catch(() => undefined);
      return created(lead);
    }

    return methodNotAllowed(["GET", "POST", "OPTIONS"]);
  } catch (err) {
    return serverError(err);
  }
};
