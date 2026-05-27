// /api/widget/token — mint a fresh widget token for the calling tenant.
//
// Called by the dashboard "Copy widget snippet" UI in production. The token
// is bound to the tenant's `widget_token_secret` and rotates if that secret
// is rotated. Format: `<tenant_id>.<token_id>.<hmac_sha256>` (see auth.ts).

import type { Handler } from "@netlify/functions";
import { getServiceClient } from "../lib/supabase";
import { getBearer, signWidgetToken } from "../lib/auth";
import { ok, forbidden, methodNotAllowed, preflight, serverError } from "../lib/response";
import { randomBytes } from "node:crypto";

export const handler: Handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return preflight();
  if (event.httpMethod !== "POST") return methodNotAllowed(["POST", "OPTIONS"]);

  try {
    const bearer = getBearer(event);
    if (!bearer) return forbidden("auth required");
    const supabase = getServiceClient();
    const { data: userData } = await supabase.auth.getUser(bearer);
    if (!userData?.user) return forbidden("invalid session");

    const { data: m } = await supabase
      .from("tenant_members")
      .select("tenant_id, role")
      .eq("user_id", userData.user.id)
      .limit(1)
      .single();
    if (!m) return forbidden("no tenant");
    if (m.role !== "owner" && m.role !== "admin") {
      return forbidden("only owners/admins can mint widget tokens");
    }

    const { data: tenant } = await supabase
      .from("tenants")
      .select("id, widget_token_secret")
      .eq("id", m.tenant_id)
      .single();
    if (!tenant?.widget_token_secret) return forbidden("tenant has no widget secret");

    const tokenId = randomBytes(8).toString("hex");
    const token = signWidgetToken(tenant.id, tokenId, tenant.widget_token_secret);

    return ok({ token, tenant_id: tenant.id, token_id: tokenId });
  } catch (err) {
    return serverError(err);
  }
};
