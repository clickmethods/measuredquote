# MeasuredQuote — Build Doc
Updated: July 6, 2026

## What this is
Contractor SaaS: website widget that lets homeowners measure their own project
on satellite view and get an instant estimate. Leads flow to a contractor
dashboard/CRM. Business model: $49 trial → $99 website+widget subscription,
$150/mo add-on marketing services. First verticals: residential fence,
concrete, temp fence rental, roofing.

## Live URLs
- App + widget host: https://measuredquote.netlify.app
- Embed demo page:   https://measuredquote.netlify.app/widget/v1/demo.html
- Repo:              https://github.com/clickmethods/measuredquote (branch: main)
- Supabase project:  buirkmlyluzumjbkzczm (us-west-2)

## Architecture
- `frontend/` — deployed SPA (blue Kimi UI): marketing site, demo hub, six
  trade estimators + temp-fence, dashboard, login/onboarding, embed page.
  React + Vite + react-router (hash routing). Netlify builds THIS.
- `client/` — legacy Perplexity UI. Kept for local Express dev only. Not deployed.
- `netlify/functions/` — API: leads, tenants, integrations, widget-token,
  stripe-checkout/portal/webhook, proposal-pdf, events, webhook-deliveries.
- `supabase/` — migration 001 (9 tables, RLS on all) + demo seed. APPLIED.
- `server/` — Express dev server (SQLite prototype). Not used in production.
- Widget embed: `/widget/v1/widget.js` mounts sandboxed iframe → `/#/embed`.
  Auth via HMAC-signed widget token header (`x-measuredquote-widget-token`).

## Estimator flow (conversion-optimized, July 6 restructure)
start → address only (Places autocomplete) → satellite map draw → materials/
add-ons → RESULTS: rough price range shown free, itemized line-item estimate +
PDF gated behind name + phone (email optional). Lead submits to the API at the
moment of unlock with the exact prices shown. English only — multi-language
removed.

## Environment variables (Netlify)
- SUPABASE_URL / SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY
- VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY
- VITE_APP_URL / VITE_EMBED_HOST = https://measuredquote.netlify.app
- VITE_MAPS_API_KEY = AIzaSyDgJr... (referrer-restricted; needs Maps JS +
  Places + Geocoding APIs enabled)

## Demo tenant (for embed testing)
- Tenant: Ortiz Concrete (Demo), id 11111111-1111-1111-1111-111111111111
- Widget secret: set in DB July 6
- Test token: 11111111-1111-1111-1111-111111111111.c9da3df14a9b2db5.630139fb7e819eb0b441696db5391f865044743f4ca6d2d48692aa28a1a0577a
- Embed snippet: script src widget.js + data-mq-tenant + data-mq-trade
  (fencing | concrete | temp-fence | roofing) + data-mq-token + data-mq-mount

## Done
- [x] Supabase migration + seed applied, RLS verified
- [x] Netlify deploys frontend/ with functions
- [x] Embed loader + /#/embed page wired end to end (frame header fixed)
- [x] Login (magic link + password), onboarding, live leads in dashboard
- [x] Temp Fence trade (chain link vs panels, 6'/8', windscreen/gates/ballast)
- [x] English-only; language step removed
- [x] Phone-gate results flow; lead fires on unlock with real prices
- [x] Widget secret + signed test token for demo tenant

## Next / open items
- [ ] Netlify: set VITE_MAPS_API_KEY + clear-cache redeploy (autocomplete dead until then)
- [ ] Supabase Auth → URL Configuration: site URL + redirect allow-list
- [ ] End-to-end lead test on the four test sites (launch gate)
- [ ] Lead email/SMS alerts to contractor (functions fan out webhooks already;
      no direct email yet) — wire Resend/Twilio or GHL webhook
- [ ] Dashboard: Settings/Embed tabs still mock — wire to /api/tenants + widget-token
- [ ] Stripe products + price IDs (gates billing, not testing)
- [ ] Tenant-level pricing overrides (configs are hardcoded defaults today)
- [ ] Temp fence: rental duration field (price scales with months, not just LF)
- [ ] Rotate: Supabase DB password, GitHub PAT (both appeared in chat)
- [ ] Custom domains: app.measuredquote.com / embed.measuredquote.com
- [ ] Strip leftover dead i18n data (nameEs fields in configs) — cosmetic

## Security notes
- Browser Maps key is public by design; protected by referrer + API restrictions.
- service_role key: server-side env only, never VITE_.
- Old Kimi Maps key (AIzaSyC7cG...) is compromised — delete in Google Cloud.
