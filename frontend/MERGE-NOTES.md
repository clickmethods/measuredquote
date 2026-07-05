# MeasuredQuote frontend merge — Kimi UX on the MQ platform

This package is the Kimi-built frontend (marketing site, demo hub, six trade
estimators, dashboard UI, trade configs, ES translations, PDF) rewired to run
on the MeasuredQuote platform (Supabase + Netlify Functions + embed loader).

## What changed vs. the Kimi original

1. **`src/lib/googleMapsLoader.ts`** — hardcoded Maps API key removed; now reads
   `VITE_MAPS_API_KEY`. Rotate the old key (`AIzaSyC7cG...`) and referrer-restrict
   the new one.
2. **`src/lib/mq.ts`** (new) — platform bridge: embed param parsing, lead POST to
   `/.netlify/functions/leads`, and the postMessage protocol
   (`source: "measuredquote"`, `resize`, `lead.created`) that matches
   `public/widget/v1/widget.js`.
3. **`src/pages/EmbedPage.tsx`** (new) + `#/embed` route in `App.tsx` — bare
   estimator (no navbar/footer) rendered inside the widget iframe, with
   auto-resize reporting to the parent loader.
4. **`src/components/estimator/EstimatorWidget.tsx`** — accepts a `tenant` prop
   and fires lead submission when the homeowner completes the materials step
   (before results, matching the lead-gate placement). Prices are sent as null;
   the backend should recompute from `selections` + tenant pricing config.
5. **`public/widget/v1/`** — the MeasuredQuote embed loader + demo page copied in
   so one deploy serves both the app and the embeddable script.
6. **`src/vite-env.d.ts`** (new) — env typings.
7. **`.env.example`** (new).

## Still to merge from the MeasuredQuote repo (source not in the zip I had)

- Netlify functions: `leads`, `stripe-checkout`, etc. → `netlify/functions/`
- `supabase/migrations/001_measuredquote_phase4.sql`
- Supabase auth pages (login, tenant onboarding) and the Settings/Production
  dashboard tabs — replace Kimi's mock dashboard data with Supabase queries
- `netlify.toml`, CI workflow, README from Phase 5

## Lead payload contract (frontend → `/.netlify/functions/leads`)

```json
{
  "tenant": "ten_xxx | null",
  "trade": "concrete",
  "language": "en",
  "name": "", "email": "", "phone": "", "address": "",
  "measurement": 640, "measurementUnit": "sqft",
  "selections": { "materialId": "...", "addonIds": [], "addonQuantities": {} },
  "lowPrice": null, "highPrice": null,
  "sourceUrl": "https://contractor-site.com/estimate"
}
```

If the existing `leads` function expects different field names, adapt
`submitLead()` in `src/lib/mq.ts` — it's the single integration point.

## Run

```bash
cp .env.example .env   # fill in VITE_MAPS_API_KEY
npm install
npm run dev            # app at /, embed at /#/embed?trade=fencing
```
