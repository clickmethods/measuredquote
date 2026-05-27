// /api/events — widget event ingestion (Netlify Function skeleton).
//
// In production every page view, step transition, and lead submission from
// the public estimator widget is sent here. The function must:
//   1. Validate the request (widget token OR authenticated dashboard user).
//   2. Stamp the event with `tenant_id`, `received_at`, and the source IP
//      (Netlify sets `x-nf-client-connection-ip`).
//   3. Insert into `widget_events`.
//
// This mirrors the Express implementation in `server/routes.ts` so we can
// swap them without touching the frontend.

import type { Handler } from "@netlify/functions";
import { getServiceClient } from "../lib/supabase";
import { verifyWidgetToken, getBearer } from "../lib/auth";
import {
  ok,
  created,
  badRequest,
  forbidden,
  methodNotAllowed,
  preflight,
  serverError,
} from "../lib/response";

interface EventInput {
  session_id: string;
  event_type: string;
  trade?: string;
  step?: string;
  language?: string;
  source_url?: string;
  metadata?: Record<string, unknown>;
}

export const handler: Handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return preflight();
  if (event.httpMethod !== "GET" && event.httpMethod !== "POST") {
    return methodNotAllowed(["GET", "POST", "OPTIONS"]);
  }

  try {
    const supabase = getServiceClient();

    // --- GET (dashboard) ----------------------------------------------------
    if (event.httpMethod === "GET") {
      const bearer = getBearer(event);
      if (!bearer) return forbidden("dashboard auth required");
      const { data: userData, error: userErr } = await supabase.auth.getUser(bearer);
      if (userErr || !userData?.user) return forbidden("invalid session");
      const { data: membership } = await supabase
        .from("tenant_members")
        .select("tenant_id")
        .eq("user_id", userData.user.id)
        .limit(1)
        .single();
      if (!membership) return forbidden("no tenant");

      const limit = Math.min(Number(event.queryStringParameters?.limit) || 200, 1000);
      const { data: events, error } = await supabase
        .from("widget_events")
        .select("*")
        .eq("tenant_id", membership.tenant_id)
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) return serverError(error);
      return ok(events ?? []);
    }

    // --- POST (widget ingestion) -------------------------------------------
    if (!event.body) return badRequest("missing body");
    const payload = JSON.parse(event.body) as EventInput;
    if (!payload.session_id || !payload.event_type) {
      return badRequest("session_id and event_type are required");
    }

    // Determine tenant: either via widget token or via dashboard session.
    let tenantId: string | null = null;
    const widgetToken = event.headers["x-measuredquote-widget-token"];
    if (widgetToken && typeof widgetToken === "string") {
      const tenantIdFromTok = widgetToken.split(".")[0];
      const { data: tenant } = await supabase
        .from("tenants")
        .select("id, widget_token_secret, status")
        .eq("id", tenantIdFromTok)
        .single();
      if (!tenant || tenant.status !== "active") return forbidden("widget token invalid");
      const verified = verifyWidgetToken(widgetToken, tenant.widget_token_secret);
      if (!verified) return forbidden("widget token signature mismatch");
      tenantId = tenant.id;
    } else {
      const bearer = getBearer(event);
      if (!bearer) return forbidden("missing credentials");
      const { data: userData } = await supabase.auth.getUser(bearer);
      const { data: membership } = await supabase
        .from("tenant_members")
        .select("tenant_id")
        .eq("user_id", userData?.user?.id ?? "")
        .limit(1)
        .single();
      tenantId = membership?.tenant_id ?? null;
    }
    if (!tenantId) return forbidden("no tenant");

    const ip =
      (event.headers["x-nf-client-connection-ip"] as string) ||
      (event.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
      null;

    const { data: inserted, error } = await supabase
      .from("widget_events")
      .insert({
        tenant_id: tenantId,
        session_id: payload.session_id,
        event_type: payload.event_type,
        trade: payload.trade ?? "",
        step: payload.step ?? "",
        language: payload.language ?? "en",
        source_url: payload.source_url ?? "",
        metadata: payload.metadata ?? {},
        ip_address: ip,
      })
      .select()
      .single();
    if (error) return serverError(error);
    return created({ id: inserted.id });
  } catch (err) {
    return serverError(err);
  }
};
