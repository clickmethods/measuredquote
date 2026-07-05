// Auth helper for Netlify Functions.
//
// MeasuredQuote uses Supabase Auth. The browser stores the session JWT in
// the browser auth flow and forwards it to our functions
// as `Authorization: Bearer <jwt>`.
//
// In addition to user sessions, the public estimator widget signs each
// request with a tenant-scoped widget token (HS256 JWT signed with the
// per-tenant `widget_token_secret` stored in the `tenants` table). Public
// inserts (creating a lead from a website visitor) only succeed if a valid
// widget token is presented; see migration 001 for the matching policies.

import { createHmac, timingSafeEqual } from "node:crypto";
import type { HandlerEvent } from "@netlify/functions";

export type AuthContext =
  | { kind: "user"; jwt: string; userId: string; tenantId?: string }
  | { kind: "widget"; tenantId: string; tokenId: string }
  | { kind: "anonymous" };

export function getBearer(event: HandlerEvent): string | null {
  const h = event.headers.authorization || event.headers.Authorization;
  if (!h) return null;
  const m = /^Bearer\s+(.+)$/i.exec(h);
  return m ? m[1] : null;
}

// Verifies a widget token of the form `<tenant_id>.<token_id>.<hmac_sha256>`.
// We deliberately avoid full JWT for the public widget because (a) the
// payload is trivial, (b) we want a token format that's easy to rotate at
// the tenant level, and (c) it's verifiable in pure node:crypto without a
// dependency.
export function verifyWidgetToken(
  token: string,
  tenantSecret: string,
): { tenantId: string; tokenId: string } | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [tenantId, tokenId, sig] = parts;
  if (!tenantId || !tokenId || !sig) return null;

  const expected = createHmac("sha256", tenantSecret)
    .update(`${tenantId}.${tokenId}`)
    .digest("hex");

  // timingSafeEqual requires equal-length buffers.
  const a = Buffer.from(sig, "hex");
  const b = Buffer.from(expected, "hex");
  if (a.length !== b.length) return null;
  if (!timingSafeEqual(a, b)) return null;

  return { tenantId, tokenId };
}

// Build a widget token using a tenant's `widget_token_secret`. Used by the
// dashboard "Copy widget snippet" UI in production.
export function signWidgetToken(tenantId: string, tokenId: string, tenantSecret: string): string {
  const sig = createHmac("sha256", tenantSecret).update(`${tenantId}.${tokenId}`).digest("hex");
  return `${tenantId}.${tokenId}.${sig}`;
}
