// /api/webhooks/deliveries — read-only feed of recent webhook deliveries.

import type { Handler } from "@netlify/functions";
import { getServiceClient } from "../lib/supabase";
import { getBearer } from "../lib/auth";
import { ok, forbidden, methodNotAllowed, preflight, serverError } from "../lib/response";

export const handler: Handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return preflight();
  if (event.httpMethod !== "GET") return methodNotAllowed(["GET", "OPTIONS"]);

  try {
    const bearer = getBearer(event);
    if (!bearer) return forbidden("auth required");
    const supabase = getServiceClient();
    const { data: userData } = await supabase.auth.getUser(bearer);
    if (!userData?.user) return forbidden("invalid session");
    const { data: m } = await supabase
      .from("tenant_members")
      .select("tenant_id")
      .eq("user_id", userData.user.id)
      .limit(1)
      .single();
    if (!m) return forbidden("no tenant");

    const limit = Math.min(Number(event.queryStringParameters?.limit) || 25, 200);
    const { data, error } = await supabase
      .from("webhook_deliveries")
      .select("*")
      .eq("tenant_id", m.tenant_id)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) return serverError(error);
    return ok(data ?? []);
  } catch (err) {
    return serverError(err);
  }
};
