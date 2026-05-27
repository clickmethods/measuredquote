// Shared outbound webhook delivery used by Netlify Functions.
//
// Mirrors the Express implementation in `server/webhooks.ts` so behavior is
// identical regardless of which server is fronting the database. Differences
// vs. the Express version:
//   - Persists the delivery row via Supabase (`webhook_deliveries`) instead
//     of SQLite.
//   - Signs with the per-integration secret falling back to the
//     `WEBHOOK_SIGNING_PEPPER` env var when no secret is configured.
//   - Never throws so callers can fire-and-forget.

import { createHmac } from "node:crypto";
import { getServiceClient } from "./supabase";

const PRIVATE_HOST_RX = /^(localhost|127\.|10\.|192\.168\.|169\.254\.|::1|fc|fd)/i;

export interface IntegrationRow {
  id: string;
  tenant_id: string;
  provider: string;
  endpoint: string | null;
  secret: string | null;
  auth_header: string | null;
  events: string[] | null;
  enabled: boolean;
}

export interface DeliveryResult {
  status: "success" | "failure" | "skipped";
  statusCode?: number;
  responseSnippet: string;
  durationMs: number;
  reason?: string;
}

function isPrivateUrl(u: string): boolean {
  try {
    const url = new URL(u);
    return PRIVATE_HOST_RX.test(url.hostname);
  } catch {
    return true;
  }
}

function sign(body: string, secret: string, timestamp: string): string {
  const pepper = process.env.WEBHOOK_SIGNING_PEPPER || "measuredquote-demo-secret";
  return createHmac("sha256", secret || pepper)
    .update(`${timestamp}.${body}`)
    .digest("hex");
}

async function recordDelivery(
  integration: IntegrationRow,
  eventType: string,
  endpoint: string,
  requestPayload: string,
  result: DeliveryResult,
  attempt = 1,
): Promise<{ id: string | null }> {
  try {
    const supabase = getServiceClient();
    const { data } = await supabase
      .from("webhook_deliveries")
      .insert({
        tenant_id: integration.tenant_id,
        integration_id: integration.id,
        provider: integration.provider,
        event_type: eventType,
        endpoint,
        request_payload: requestPayload,
        status: result.status,
        status_code: result.statusCode ?? null,
        response_snippet: result.responseSnippet,
        attempt,
        duration_ms: result.durationMs,
      })
      .select("id")
      .single();
    return { id: data?.id ?? null };
  } catch {
    // Persistence is best-effort; never crash the caller.
    return { id: null };
  }
}

export async function deliverWebhook(
  integration: IntegrationRow,
  eventType: string,
  payloadObj: Record<string, unknown>,
  opts: { testedOnly?: boolean } = {},
): Promise<DeliveryResult & { deliveryId: string | null }> {
  const endpoint = (integration.endpoint || "").trim();
  const body = JSON.stringify({
    event: eventType,
    integration: integration.provider,
    delivered_at: new Date().toISOString(),
    ...payloadObj,
  });

  if (!endpoint) {
    const result: DeliveryResult = {
      status: "skipped",
      responseSnippet: "no_endpoint_configured",
      durationMs: 0,
      reason: "endpoint not set",
    };
    const { id } = await recordDelivery(integration, eventType, "", body, result);
    return { ...result, deliveryId: id };
  }

  if (isPrivateUrl(endpoint)) {
    const result: DeliveryResult = {
      status: "skipped",
      responseSnippet: "private_endpoint_blocked",
      durationMs: 0,
      reason: "endpoint is loopback/private",
    };
    const { id } = await recordDelivery(integration, eventType, endpoint, body, result);
    return { ...result, deliveryId: id };
  }

  const timestamp = String(Math.floor(Date.now() / 1000));
  const signature = sign(body, integration.secret ?? "", timestamp);
  const headers: Record<string, string> = {
    "content-type": "application/json",
    "user-agent": "MeasuredQuote-Webhook/1.0",
    "x-measuredquote-event": eventType,
    "x-measuredquote-timestamp": timestamp,
    "x-measuredquote-signature": `v1=${signature}`,
  };
  if (integration.auth_header) headers.authorization = integration.auth_header;

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
  } catch (err: unknown) {
    snippet = (err instanceof Error ? err.message : String(err)).slice(0, 400);
    status = "failure";
  }

  const result: DeliveryResult = {
    status,
    statusCode,
    responseSnippet: snippet,
    durationMs: Date.now() - started,
  };
  const { id } = await recordDelivery(integration, eventType, endpoint, body, result);

  // Mirror summary onto the integrations row for the dashboard's "last delivery"
  // pill. testedOnly distinguishes manual test pings from real fan-outs.
  try {
    const supabase = getServiceClient();
    await supabase
      .from("integrations")
      .update({
        last_delivered_at: opts.testedOnly ? undefined : new Date().toISOString(),
        last_status: status,
        last_status_code: statusCode ?? null,
        last_tested_at: opts.testedOnly ? new Date().toISOString() : undefined,
        updated_at: new Date().toISOString(),
      })
      .eq("id", integration.id);
  } catch {
    // ignore — these columns may not yet exist; non-fatal
  }

  return { ...result, deliveryId: id };
}

export async function fanoutEvent(
  tenantId: string,
  eventType: string,
  payload: Record<string, unknown>,
): Promise<void> {
  try {
    const supabase = getServiceClient();
    const { data: rows } = await supabase
      .from("integrations")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("enabled", true);
    const subs = (rows ?? []).filter((r: IntegrationRow) =>
      Array.isArray(r.events) ? r.events.includes(eventType) : true,
    );
    await Promise.all(
      subs.map((i: IntegrationRow) =>
        deliverWebhook(i, eventType, payload).catch(() => undefined),
      ),
    );
  } catch {
    // Fan-out failures must never bubble up to the API caller.
  }
}
