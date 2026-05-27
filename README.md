# MeasuredQuote

A white-label lead-capture and instant-estimate widget for residential
contractors. Homeowners measure their project on a satellite map, pick
material + add-ons, and get a price range in the contractor's brand. The
contractor sees the lead in a dashboard, with webhooks to their CRM
(GoHighLevel, Follow Up Boss, HubSpot, Zapier, n8n).

> Phase 5 status: local production-ready build. Phase 6 will wire it to a
> live GitHub repo, Netlify site, and Supabase project once those are
> selected by the operator.

## Stack

- **Frontend** — React 18, Vite, Tailwind CSS, shadcn/ui, wouter (hash routing)
- **Backend (demo)** — Express 5 with SQLite via better-sqlite3 + Drizzle ORM
- **Backend (prod)** — Netlify Functions backed by Supabase Postgres
- **Auth** — Supabase Auth (magic link + password)
- **Billing** — Stripe Checkout + Customer Portal, webhook-driven plan sync
- **PDF** — pdfkit, shared between Express and Netlify Functions

## Local development

```bash
# Install
npm install

# Run dev server (Express + Vite on the same port)
npm run dev

# Build (frontend + bundled server)
npm run build

# Start production server (after build)
npm start
```

Hash routes:

- `/` — landing page
- `/#/demo` — demo hub
- `/#/demo/:tradeId` — trade-specific estimator (concrete, asphalt, etc.)
- `/#/dashboard` — contractor dashboard (8 tabs incl. Settings + Production)
- `/#/login` — Supabase auth (no-op in demo mode)
- `/#/onboarding` — first-run tenant setup
- `/#/quote/:id` — homeowner-facing quote package

## Environment variables

Copy `.env.example` to `.env` and fill in. Three groups:

- **Client (`VITE_*`)** — bundled into the browser. Safe to expose.
  - `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` — enables Supabase Auth +
    production code paths. Without these the app runs in **demo mode**
    against the local SQLite.
  - `VITE_STRIPE_PUBLISHABLE_KEY` — optional, surface Stripe in the UI.
  - `VITE_GOOGLE_MAPS_BROWSER_KEY` — optional, swaps the simulated map for
    a real Google Maps tile. Recommended to restrict by referrer.
  - `VITE_APP_URL`, `VITE_EMBED_HOST` — used by Production tab to detect
    domain status and render the embed snippet.

- **Server / Netlify Functions** — never exposed to the browser.
  - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
  - `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_STARTER`,
    `STRIPE_PRICE_PRO`
  - `APP_URL`, `WEBHOOK_SIGNING_PEPPER`, `GOOGLE_MAPS_SERVER_KEY`

## Project layout

```
client/                       # Vite-served React app
  public/widget/v1/widget.js  # Embeddable loader
  src/pages/                  # Landing, Dashboard, Login, Onboarding…
  src/components/dashboard/   # Tabs: Leads, Analytics, Settings, Production…
  src/lib/supabase.ts         # Browser Supabase client + env guards
  src/lib/tenant.ts           # Session + tenant hook
server/                       # Express prototype backend (SQLite)
  routes.ts, storage.ts, pdf.ts, webhooks.ts
netlify/
  lib/                        # Shared helpers (response, supabase, auth, pdf, webhooks)
  functions/                  # leads, events, integrations, webhook-deliveries,
                              # tenants, widget-token, proposal-pdf, stripe-*
supabase/
  migrations/001_measuredquote_phase4.sql
  seed.sql
scripts/
  export-sqlite-to-supabase.ts # Demo data migration helper
.github/workflows/ci.yml      # Build + typecheck on push
```

## Embed widget

Drop on any contractor site:

```html
<script
  src="https://embed.measuredquote.com/widget/v1/widget.js"
  data-mq-tenant="ten_xxxxxxxxxxxx"
  data-mq-trade="concrete"
  data-mq-language="en"
  data-mq-mount="#mq-estimator"
  async
></script>
<div id="mq-estimator"></div>
```

See `client/public/widget/v1/demo.html` for a working reference page.

## Deployment

### Netlify

```bash
# Connect repo, then in the site UI confirm:
#   build command:  npm run build
#   publish dir:    dist/public
#   functions dir:  netlify/functions
# All redirects + headers come from netlify.toml.
```

### Supabase

```bash
# Install Supabase CLI
brew install supabase/tap/supabase

# Link the project (Phase 6 — once project is created)
supabase link --project-ref <project-ref>

# Apply migration
supabase db push   # or paste supabase/migrations/001_measuredquote_phase4.sql
                   # into the SQL editor.

# Optional: seed a demo tenant
supabase db query --file supabase/seed.sql
```

### Stripe

1. Create Products + Prices for Starter and Pro. Note the price IDs.
2. Add a webhook endpoint pointing at `https://<your-domain>/api/stripe/webhook`.
3. Subscribe to `checkout.session.completed`, `customer.subscription.*`,
   `invoice.payment_*`.
4. Copy the signing secret into `STRIPE_WEBHOOK_SECRET` in Netlify env.

Detailed launch sequence: see
`/home/user/workspace/measuredquote-launch-checklist.md`.

## Data migration

To move existing demo SQLite data into Supabase:

```bash
# Dry-run (prints what would happen, no writes)
npx tsx scripts/export-sqlite-to-supabase.ts --tenant-id <tenant-id> --dry-run

# Real import (requires SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in env)
npx tsx scripts/export-sqlite-to-supabase.ts --tenant-id <tenant-id>
```

## Documentation

- `/home/user/workspace/measuredquote-phase2-HANDOFF.md` — initial widget + dashboard
- `/home/user/workspace/measuredquote-phase3-HANDOFF.md` — integrations + PDFs
- `/home/user/workspace/measuredquote-phase4-HANDOFF.md` — Netlify/Supabase/Stripe scaffolding
- `/home/user/workspace/measuredquote-phase5-HANDOFF.md` — production wiring
- `/home/user/workspace/measuredquote-netlify-supabase-stripe-plan.md` — architecture plan
- `/home/user/workspace/measuredquote-launch-checklist.md` — go-live sequence

## License

Internal prototype. Not yet licensed for redistribution.
