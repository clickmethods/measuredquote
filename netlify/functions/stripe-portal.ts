// /api/stripe/portal — create a Stripe Customer Portal session.
//
// The portal lets the tenant owner update payment method, cancel, swap
// plan, and view invoices. Requires the tenant already has a
// `stripe_customer_id` (created by stripe-checkout).
//
// Env vars:
//   - STRIPE_SECRET_KEY
//   - APP_URL                 (return URL after the portal closes)

import type { Handler } from "@netlify/functions";
import { getServiceClient } from "../lib/supabase";
import { getBearer } from "../lib/auth";
import {
  ok,
  badRequest,
  forbidden,
  methodNotAllowed,
  preflight,
  serverError,
} from "../lib/response";

export const handler: Handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return preflight();
  if (event.httpMethod !== "POST") return methodNotAllowed(["POST", "OPTIONS"]);

  try {
    const secret = process.env.STRIPE_SECRET_KEY;
    if (!secret) return serverError("STRIPE_SECRET_KEY not configured");

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
    if (m.role !== "owner") return forbidden("only owners can manage billing");

    const { data: tenant } = await supabase
      .from("tenants")
      .select("id, stripe_customer_id")
      .eq("id", m.tenant_id)
      .single();
    if (!tenant?.stripe_customer_id) {
      return badRequest("no Stripe customer; complete checkout first");
    }

    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(secret);
    const session = await stripe.billingPortal.sessions.create({
      customer: tenant.stripe_customer_id,
      return_url: `${process.env.APP_URL || ""}/#/dashboard`,
    });
    return ok({ url: session.url });
  } catch (err) {
    return serverError(err);
  }
};
