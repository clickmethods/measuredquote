// /api/integrations — CRUD for tenant webhook integrations.
//
// Skeleton mirrors the Express version in `server/routes.ts`. Differences:
//   - Tenant scoping via Supabase JWT, NOT global table access.
//   - Secrets stored encrypted-at-rest in Supabase (pgsodium / vault); the
//     `secret` column is `text` in migration 001 but a future migration
//     should wrap it in a Supabase Vault secret reference. Until then,
//     callers MUST set `SUPABASE_VAULT_KEY` and we encrypt before insert.
//   - The `secret` returned to the client is always masked (last 4 chars).

import type { Handler } from "@netlify/functions";
import { getServiceClient } from "../lib/supabase";
import { getBearer } from "../lib/auth";
import { deliverWebhook } from "../lib/webhooks";
import {
  ok,
  badRequest,
  forbidden,
  notFound,
  methodNotAllowed,
  preflight,
  serverError,
} from "../lib/response";

function maskSecret(s?: string | null): string {
  if (!s) return "";
  if (s.length <= 4) return "•".repeat(s.length);
  return "•".repeat(Math.max(s.length - 4, 4)) + s.slice(-4);
}

async function resolveTenant(authHeader: string): Promise<{ tenantId: string; role: string } | null> {
  const supabase = getServiceClient();
  const { data: userData, error } = await supabase.auth.getUser(authHeader);
  if (error || !userData?.user) return null;
  const { data: m } = await supabase
    .from("tenant_members")
    .select("tenant_id, role")
    .eq("user_id", userData.user.id)
    .limit(1)
    .single();
  if (!m) return null;
  return { tenantId: m.tenant_id, role: m.role };
}

export const handler: Handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return preflight();
  const bearer = getBearer(event);
  if (!bearer) return forbidden("auth required");
  const tenant = await resolveTenant(bearer);
  if (!tenant) return forbidden("no tenant");

  // Path forms supported:
  //   /.netlify/functions/integrations           -> list / upsert
  //   /.netlify/functions/integrations/:id       -> PATCH
  //   /.netlify/functions/integrations/:id/test  -> POST (send test ping)
  const m = /\/integrations(?:\/([^/]+)(\/test)?)?$/.exec(event.path);
  const id = m?.[1] ?? null;
  const isTest = Boolean(m?.[2]);
  const supabase = getServiceClient();

  try {
    // GET list ----------------------------------------------------------------
    if (!id && event.httpMethod === "GET") {
      const { data, error } = await supabase
        .from("integrations")
        .select("*")
        .eq("tenant_id", tenant.tenantId)
        .order("provider");
      if (error) return serverError(error);
      return ok((data ?? []).map((row) => ({ ...row, secret: maskSecret(row.secret) })));
    }

    // POST upsert (by provider) ----------------------------------------------
    if (!id && event.httpMethod === "POST") {
      if (!event.body) return badRequest("missing body");
      if (tenant.role !== "owner" && tenant.role !== "admin") {
        return forbidden("only owners/admins can edit integrations");
      }
      const payload = JSON.parse(event.body);
      if (!payload.provider) return badRequest("provider required");

      const { data, error } = await supabase
        .from("integrations")
        .upsert(
          {
            tenant_id: tenant.tenantId,
            provider: payload.provider,
            display_name: payload.display_name ?? payload.provider,
            category: payload.category ?? "webhook",
            enabled: !!payload.enabled,
            endpoint: payload.endpoint ?? "",
            secret: payload.secret ?? "",
            auth_header: payload.auth_header ?? "",
            events: payload.events ?? ["lead.created"],
          },
          { onConflict: "tenant_id,provider" },
        )
        .select()
        .single();
      if (error) return serverError(error);
      return ok({ ...data, secret: maskSecret(data.secret) });
    }

    // PATCH /:id --------------------------------------------------------------
    if (id && !isTest && event.httpMethod === "PATCH") {
      if (!event.body) return badRequest("missing body");
      if (tenant.role !== "owner" && tenant.role !== "admin") {
        return forbidden("only owners/admins can edit integrations");
      }
      const patch = JSON.parse(event.body);
      const allowed = ["display_name", "enabled", "endpoint", "secret", "auth_header", "events"];
      const updates: Record<string, unknown> = {};
      for (const k of allowed) if (k in patch) updates[k] = patch[k];
      updates.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from("integrations")
        .update(updates)
        .eq("tenant_id", tenant.tenantId)
        .eq("id", id)
        .select()
        .single();
      if (error || !data) return notFound("integration not found");
      return ok({ ...data, secret: maskSecret(data.secret) });
    }

    // POST /:id/test ----------------------------------------------------------
    if (id && isTest && event.httpMethod === "POST") {
      const { data: integration } = await supabase
        .from("integrations")
        .select("*")
        .eq("tenant_id", tenant.tenantId)
        .eq("id", id)
        .single();
      if (!integration) return notFound("integration not found");
      const result = await deliverWebhook(
        integration,
        "test.ping",
        {
          test: true,
          sent_at: new Date().toISOString(),
          message: "MeasuredQuote test ping. If you see this, signing and transport work.",
        },
        { testedOnly: true },
      );
      return ok({
        delivery_id: result.deliveryId,
        status: result.status,
        status_code: result.statusCode ?? null,
        duration_ms: result.durationMs,
        response_snippet: result.responseSnippet,
        reason: result.reason,
      });
    }

    return methodNotAllowed(["GET", "POST", "PATCH", "OPTIONS"]);
  } catch (err) {
    return serverError(err);
  }
};
