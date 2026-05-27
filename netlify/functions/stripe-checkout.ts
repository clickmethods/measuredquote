// /api/stripe/checkout — create a Stripe Checkout session for the caller's tenant.
//
// This handler creates a subscription Checkout session and returns the
// hosted-page URL. The browser navigates to it; on success Stripe redirects
// back to APP_URL + /#/dashboard?billing=success, on cancel APP_URL +
// /#/dashboard?billing=cancel.
//
// Env vars required:
//   - STRIPE_SECRET_KEY              (sk_live_… or sk_test_…)
//   - STRIPE_PRICE_STARTER           (Stripe price id for Starter plan)
//   - STRIPE_PRICE_PRO               (Stripe price id for Pro plan)
//   - APP_URL                        (e.g. https://app.measuredquote.com)
//
// Note: we deliberately do NOT pin a Stripe API version here so this file
// stays valid against whatever version the connected Stripe account is on.
// Production should pin it explicitly.

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

const PRICE_BY_PLAN: Record<string, string | undefined> = {
  starter: process.env.STRIPE_PRICE_STARTER,
  pro: process.env.STRIPE_PRICE_PRO,
};

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
    const { data: membership } = await supabase
      .from("tenant_members")
      .select("tenant_id, role")
      .eq("user_id", userData.user.id)
      .limit(1)
      .single();
    if (!membership) return forbidden("no tenant");
    if (membership.role !== "owner") return forbidden("only owners can manage billing");

    const body = event.body ? JSON.parse(event.body) : {};
    const plan = String(body.plan || "starter").toLowerCase();
    const price = PRICE_BY_PLAN[plan];
    if (!price) return badRequest(`unknown plan: ${plan}`);

    // Look up tenant for an existing stripe_customer_id so repeat checkouts
    // reuse the same customer record.
    const { data: tenant } = await supabase
      .from("tenants")
      .select("id, name, stripe_customer_id")
      .eq("id", membership.tenant_id)
      .single();
    if (!tenant) return forbidden("tenant missing");

    // Lazy-load Stripe so the function bundle stays small when not used.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(secret);

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: tenant.stripe_customer_id || undefined,
      customer_email: !tenant.stripe_customer_id ? userData.user.email ?? undefined : undefined,
      line_items: [{ price, quantity: 1 }],
      allow_promotion_codes: true,
      // Always pass tenant id in client_reference_id so the webhook can
      // correlate the resulting subscription back to our tenant row.
      client_reference_id: tenant.id,
      subscription_data: { metadata: { tenant_id: tenant.id } },
      success_url: `${process.env.APP_URL || ""}/#/dashboard?billing=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.APP_URL || ""}/#/dashboard?billing=cancel`,
    });

    return ok({ url: session.url, id: session.id });
  } catch (err) {
    return serverError(err);
  }
};
