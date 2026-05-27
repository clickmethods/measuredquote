// /api/tenants — tenant onboarding + settings.
//
// Endpoints:
//   GET   /api/tenants/me        -> hydrate current tenant for the dashboard
//   POST  /api/tenants           -> first-time tenant onboarding (creates a
//                                   tenants row + tenant_members row for the
//                                   calling user as `owner`)
//   PATCH /api/tenants/me        -> update brand / settings (owner/admin only)
//
// Used by the new Onboarding and Settings UI in the dashboard.

import type { Handler } from "@netlify/functions";
import { getServiceClient } from "../lib/supabase";
import { getBearer } from "../lib/auth";
import {
  ok,
  created,
  badRequest,
  forbidden,
  methodNotAllowed,
  preflight,
  serverError,
} from "../lib/response";
import { randomBytes } from "node:crypto";

const ALLOWED_FIELDS = [
  "name",
  "website",
  "domain",
  "contact_email",
  "brand_color",
  "logo_url",
  "trades",
  "widget_domain",
  "notification_email",
] as const;

function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || `tenant-${randomBytes(3).toString("hex")}`
  );
}

export const handler: Handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return preflight();
  const bearer = getBearer(event);
  if (!bearer) return forbidden("auth required");

  try {
    const supabase = getServiceClient();
    const { data: userData } = await supabase.auth.getUser(bearer);
    if (!userData?.user) return forbidden("invalid session");
    const userId = userData.user.id;

    // POST /api/tenants — first-time onboarding.
    if (event.httpMethod === "POST" && /\/tenants\/?$/.test(event.path)) {
      const existing = await supabase
        .from("tenant_members")
        .select("tenant_id")
        .eq("user_id", userId)
        .limit(1)
        .single();
      if (existing.data) return badRequest("user already has a tenant");

      const body = event.body ? JSON.parse(event.body) : {};
      if (!body.name) return badRequest("name is required");
      const widgetSecret = randomBytes(32).toString("hex");

      const { data: tenant, error } = await supabase
        .from("tenants")
        .insert({
          name: String(body.name).trim(),
          slug: slugify(body.name),
          website: body.website ?? null,
          domain: body.domain ?? null,
          contact_email: body.contact_email ?? userData.user.email ?? null,
          notification_email: body.notification_email ?? userData.user.email ?? null,
          brand_color: body.brand_color ?? "#ea580c",
          logo_url: body.logo_url ?? null,
          trades: body.trades ?? ["concrete"],
          widget_domain: body.widget_domain ?? null,
          widget_token_secret: widgetSecret,
          status: "active",
          plan_status: "trialing",
        })
        .select()
        .single();
      if (error) return serverError(error);

      const { error: memberErr } = await supabase
        .from("tenant_members")
        .insert({ tenant_id: tenant.id, user_id: userId, role: "owner" });
      if (memberErr) return serverError(memberErr);

      return created({ tenant });
    }

    // Resolve the caller's tenant.
    const { data: membership } = await supabase
      .from("tenant_members")
      .select("tenant_id, role")
      .eq("user_id", userId)
      .limit(1)
      .single();

    // GET /api/tenants/me
    if (event.httpMethod === "GET") {
      if (!membership) return ok({ tenant: null });
      const { data: tenant } = await supabase
        .from("tenants")
        .select("*")
        .eq("id", membership.tenant_id)
        .single();
      return ok({ tenant, role: membership.role });
    }

    // PATCH /api/tenants/me
    if (event.httpMethod === "PATCH") {
      if (!membership) return forbidden("no tenant");
      if (membership.role !== "owner" && membership.role !== "admin") {
        return forbidden("only owners/admins can edit tenant settings");
      }
      const patch = event.body ? JSON.parse(event.body) : {};
      const updates: Record<string, unknown> = {};
      for (const k of ALLOWED_FIELDS) if (k in patch) updates[k] = patch[k];
      updates.updated_at = new Date().toISOString();
      const { data: tenant, error } = await supabase
        .from("tenants")
        .update(updates)
        .eq("id", membership.tenant_id)
        .select()
        .single();
      if (error) return serverError(error);
      return ok({ tenant });
    }

    return methodNotAllowed(["GET", "POST", "PATCH", "OPTIONS"]);
  } catch (err) {
    return serverError(err);
  }
};
