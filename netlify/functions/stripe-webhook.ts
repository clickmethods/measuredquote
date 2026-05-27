// /api/stripe/webhook — verify Stripe signatures and sync subscription state.
//
// Stripe will POST raw JSON with a `Stripe-Signature` header. Netlify gives
// us `event.body` as the exact bytes Stripe sent (base64 when
// `isBase64Encoded` is true), which is what `stripe.webhooks.constructEvent`
// needs.
//
// Required env vars:
//   - STRIPE_SECRET_KEY
//   - STRIPE_WEBHOOK_SECRET    (whsec_…  — different value per environment)
//
// Events we care about (others are acknowledged but ignored):
//   - checkout.session.completed
//   - customer.subscription.created
//   - customer.subscription.updated
//   - customer.subscription.deleted
//   - invoice.payment_succeeded
//   - invoice.payment_failed

import type { Handler } from "@netlify/functions";
import { getServiceClient } from "../lib/supabase";
import { ok, badRequest, methodNotAllowed, serverError } from "../lib/response";

function rawBody(event: Parameters<Handler>[0]): Buffer {
  if (!event.body) return Buffer.alloc(0);
  if (event.isBase64Encoded) return Buffer.from(event.body, "base64");
  return Buffer.from(event.body, "utf8");
}

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") return methodNotAllowed(["POST"]);
  const secret = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || !webhookSecret) {
    return serverError("Stripe env not configured");
  }
  const sig = event.headers["stripe-signature"];
  if (!sig) return badRequest("missing stripe-signature");

  try {
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(secret);
    const body = rawBody(event);

    let stripeEvent: import("stripe").Stripe.Event;
    try {
      stripeEvent = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } catch (err) {
      // Bad signature -> 400 so Stripe will retry only on transient failures.
      return badRequest("signature verification failed", String(err));
    }

    const supabase = getServiceClient();

    switch (stripeEvent.type) {
      case "checkout.session.completed": {
        const session = stripeEvent.data.object as import("stripe").Stripe.Checkout.Session;
        const tenantId = session.client_reference_id ?? session.metadata?.tenant_id;
        const customerId =
          typeof session.customer === "string" ? session.customer : session.customer?.id;
        const subscriptionId =
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription?.id;
        if (tenantId && customerId) {
          await supabase
            .from("tenants")
            .update({ stripe_customer_id: customerId, updated_at: new Date().toISOString() })
            .eq("id", tenantId);
        }
        if (tenantId && subscriptionId) {
          await supabase.from("subscriptions").upsert(
            {
              tenant_id: tenantId,
              stripe_subscription_id: subscriptionId,
              status: "active",
              updated_at: new Date().toISOString(),
            },
            { onConflict: "stripe_subscription_id" },
          );
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = stripeEvent.data.object as import("stripe").Stripe.Subscription;
        const tenantId = sub.metadata?.tenant_id;
        if (!tenantId) break;
        const priceId = sub.items.data[0]?.price?.id ?? null;
        await supabase.from("subscriptions").upsert(
          {
            tenant_id: tenantId,
            stripe_subscription_id: sub.id,
            stripe_price_id: priceId,
            status: sub.status, // active | past_due | canceled | unpaid | trialing
            current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
            cancel_at_period_end: sub.cancel_at_period_end,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "stripe_subscription_id" },
        );
        // Mirror the high-level plan onto tenants for quick reads in the UI.
        await supabase
          .from("tenants")
          .update({
            plan_status: sub.status,
            updated_at: new Date().toISOString(),
          })
          .eq("id", tenantId);
        break;
      }

      case "invoice.payment_failed":
      case "invoice.payment_succeeded": {
        const invoice = stripeEvent.data.object as import("stripe").Stripe.Invoice;
        await supabase.from("audit_events").insert({
          tenant_id: invoice.metadata?.tenant_id ?? null,
          actor: "stripe",
          action: stripeEvent.type,
          target: invoice.id,
          payload: { amount: invoice.amount_paid, status: invoice.status },
        });
        break;
      }

      default:
        // Acknowledge anything we don't model so Stripe stops retrying.
        break;
    }

    return ok({ received: true, type: stripeEvent.type });
  } catch (err) {
    return serverError(err);
  }
};
