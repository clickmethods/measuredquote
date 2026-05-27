-- ============================================================================
-- MeasuredQuote — Phase 4 production schema
-- ============================================================================
-- This migration translates the Phase 3 SQLite schema into production-grade
-- Postgres with multi-tenancy, Row Level Security, and the supporting tables
-- needed for Stripe Billing, audit logging, and the public widget.
--
-- Run with the Supabase CLI:
--   supabase db push
-- ...or via the SQL editor.
--
-- Conventions
-- ------------
--   * Primary keys are uuid (gen_random_uuid()) for forward portability.
--   * Every tenant-owned table has `tenant_id uuid not null references tenants(id)`.
--   * Every table carries `created_at` + `updated_at timestamptz` with
--     `default now()` and a trigger that bumps `updated_at` on update.
--   * RLS is enabled on every tenant-owned table. Policies use the helper
--     functions `app.is_tenant_member(uuid)` and `app.tenant_role(uuid)`.
--   * Service-role connections (used by Netlify Functions) bypass RLS, so
--     functions must still apply `eq("tenant_id", X)` filters as defense in
--     depth.
-- ============================================================================

create extension if not exists "pgcrypto";

-- Helper schema for tenancy functions. Kept separate from `public` so it's
-- obvious which functions are app-defined helpers.
create schema if not exists app;

-- ----------------------------------------------------------------------------
-- updated_at trigger function
-- ----------------------------------------------------------------------------
create or replace function app.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ----------------------------------------------------------------------------
-- tenants
-- ----------------------------------------------------------------------------
create table if not exists public.tenants (
  id                   uuid primary key default gen_random_uuid(),
  name                 text not null,
  slug                 text not null unique,
  status               text not null default 'active'
                       check (status in ('active','suspended','closed')),
  plan_status          text not null default 'trialing'
                       check (plan_status in ('trialing','active','past_due','canceled','unpaid')),
  stripe_customer_id   text unique,
  widget_token_secret  text not null default encode(gen_random_bytes(32), 'hex'),
  brand_color          text not null default '#0F172A',
  contact_email        text,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create trigger trg_tenants_updated_at
  before update on public.tenants
  for each row execute function app.set_updated_at();

create index if not exists idx_tenants_slug on public.tenants(slug);

-- ----------------------------------------------------------------------------
-- tenant_members  (one row per (auth.users, tenant) pair)
-- ----------------------------------------------------------------------------
create table if not exists public.tenant_members (
  tenant_id   uuid not null references public.tenants(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  role        text not null default 'member'
              check (role in ('owner','admin','member','viewer')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  primary key (tenant_id, user_id)
);

create index if not exists idx_tenant_members_user on public.tenant_members(user_id);

create trigger trg_tenant_members_updated_at
  before update on public.tenant_members
  for each row execute function app.set_updated_at();

-- ----------------------------------------------------------------------------
-- Tenancy helper functions (used by RLS policies below)
-- ----------------------------------------------------------------------------
create or replace function app.is_tenant_member(t uuid)
returns boolean
language sql stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.tenant_members
    where tenant_id = t and user_id = auth.uid()
  );
$$;

create or replace function app.tenant_role(t uuid)
returns text
language sql stable
security definer
set search_path = public
as $$
  select role from public.tenant_members
   where tenant_id = t and user_id = auth.uid()
   limit 1;
$$;

-- ----------------------------------------------------------------------------
-- leads
-- ----------------------------------------------------------------------------
create table if not exists public.leads (
  id                  uuid primary key default gen_random_uuid(),
  tenant_id           uuid not null references public.tenants(id) on delete cascade,
  name                text not null,
  email               text not null,
  phone               text not null,
  address             text not null,
  language            text not null default 'en',
  trade               text not null,
  measurement         numeric(12,2) not null,
  measurement_unit    text not null check (measurement_unit in ('sqft','lf')),
  material            text not null,
  addons              jsonb not null default '[]'::jsonb,
  low_estimate        numeric(12,2) not null,
  high_estimate       numeric(12,2) not null,
  line_items          jsonb not null default '[]'::jsonb,
  geometry            jsonb,
  source_url          text not null default 'demo.measuredquote.com',
  status              text not null default 'new'
                      check (status in ('new','contacted','scheduled','quoted','won','lost')),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists idx_leads_tenant_created on public.leads(tenant_id, created_at desc);
create index if not exists idx_leads_tenant_status  on public.leads(tenant_id, status);
create index if not exists idx_leads_email          on public.leads(tenant_id, email);

create trigger trg_leads_updated_at
  before update on public.leads
  for each row execute function app.set_updated_at();

-- ----------------------------------------------------------------------------
-- estimate_sessions  (optional: persistent session state for the widget)
-- ----------------------------------------------------------------------------
-- Useful if the widget is multi-step and needs to resume across reloads,
-- and gives us a join key from anonymous events -> created lead.
create table if not exists public.estimate_sessions (
  id           uuid primary key default gen_random_uuid(),
  tenant_id    uuid not null references public.tenants(id) on delete cascade,
  session_id   text not null,
  lead_id      uuid references public.leads(id) on delete set null,
  state        jsonb not null default '{}'::jsonb,
  expires_at   timestamptz not null default (now() + interval '7 days'),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (tenant_id, session_id)
);

create index if not exists idx_estimate_sessions_tenant on public.estimate_sessions(tenant_id);

create trigger trg_estimate_sessions_updated_at
  before update on public.estimate_sessions
  for each row execute function app.set_updated_at();

-- ----------------------------------------------------------------------------
-- integrations
-- ----------------------------------------------------------------------------
create table if not exists public.integrations (
  id                uuid primary key default gen_random_uuid(),
  tenant_id         uuid not null references public.tenants(id) on delete cascade,
  provider          text not null,  -- gohighlevel | followupboss | hubspot | zapier | n8n | webhook
  display_name      text not null,
  category          text not null default 'webhook'
                    check (category in ('crm','automation','webhook')),
  enabled           boolean not null default false,
  endpoint          text not null default '',
  -- NOTE: production should wrap this in Supabase Vault. The column type
  -- stays text so existing client code keeps working during the migration.
  secret            text not null default '',
  auth_header       text not null default '',
  events            jsonb not null default '["lead.created"]'::jsonb,
  last_status       text not null default '',
  last_status_code  integer,
  last_tested_at    timestamptz,
  last_delivered_at timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique (tenant_id, provider)
);

create index if not exists idx_integrations_tenant on public.integrations(tenant_id);

create trigger trg_integrations_updated_at
  before update on public.integrations
  for each row execute function app.set_updated_at();

-- ----------------------------------------------------------------------------
-- webhook_deliveries
-- ----------------------------------------------------------------------------
create table if not exists public.webhook_deliveries (
  id                uuid primary key default gen_random_uuid(),
  tenant_id         uuid not null references public.tenants(id) on delete cascade,
  integration_id    uuid references public.integrations(id) on delete set null,
  provider          text not null,
  event_type        text not null,
  endpoint          text not null,
  request_payload   jsonb not null default '{}'::jsonb,
  status            text not null check (status in ('success','failure','skipped','retrying')),
  status_code       integer,
  response_snippet  text not null default '',
  attempt           integer not null default 1,
  duration_ms       integer not null default 0,
  created_at        timestamptz not null default now()
);

create index if not exists idx_webhook_deliveries_tenant_created
  on public.webhook_deliveries(tenant_id, created_at desc);
create index if not exists idx_webhook_deliveries_integration
  on public.webhook_deliveries(integration_id);

-- ----------------------------------------------------------------------------
-- widget_events
-- ----------------------------------------------------------------------------
create table if not exists public.widget_events (
  id            uuid primary key default gen_random_uuid(),
  tenant_id     uuid not null references public.tenants(id) on delete cascade,
  session_id    text not null,
  event_type    text not null,
  trade         text not null default '',
  step          text not null default '',
  language      text not null default 'en',
  source_url    text not null default '',
  metadata      jsonb not null default '{}'::jsonb,
  ip_address    inet,
  created_at    timestamptz not null default now()
);

create index if not exists idx_widget_events_tenant_created
  on public.widget_events(tenant_id, created_at desc);
create index if not exists idx_widget_events_tenant_event
  on public.widget_events(tenant_id, event_type);
create index if not exists idx_widget_events_session
  on public.widget_events(tenant_id, session_id);

-- ----------------------------------------------------------------------------
-- subscriptions  (mirror of Stripe state, source of truth for plan checks)
-- ----------------------------------------------------------------------------
create table if not exists public.subscriptions (
  id                      uuid primary key default gen_random_uuid(),
  tenant_id               uuid not null references public.tenants(id) on delete cascade,
  stripe_subscription_id  text not null unique,
  stripe_price_id         text,
  status                  text not null,  -- mirrors Stripe Subscription.status
  current_period_end      timestamptz,
  cancel_at_period_end    boolean not null default false,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

create index if not exists idx_subscriptions_tenant on public.subscriptions(tenant_id);

create trigger trg_subscriptions_updated_at
  before update on public.subscriptions
  for each row execute function app.set_updated_at();

-- ----------------------------------------------------------------------------
-- audit_events
-- ----------------------------------------------------------------------------
create table if not exists public.audit_events (
  id           uuid primary key default gen_random_uuid(),
  tenant_id    uuid references public.tenants(id) on delete set null,
  actor        text not null,    -- user:<uuid>, stripe, system, widget
  action       text not null,    -- lead.created, integration.updated, billing.invoice_paid
  target       text,             -- free-form (lead id, integration id, invoice id, ...)
  payload      jsonb not null default '{}'::jsonb,
  ip_address   inet,
  created_at   timestamptz not null default now()
);

create index if not exists idx_audit_events_tenant_created
  on public.audit_events(tenant_id, created_at desc);

-- ============================================================================
-- Row Level Security
-- ============================================================================
alter table public.tenants            enable row level security;
alter table public.tenant_members     enable row level security;
alter table public.leads              enable row level security;
alter table public.estimate_sessions  enable row level security;
alter table public.integrations       enable row level security;
alter table public.webhook_deliveries enable row level security;
alter table public.widget_events      enable row level security;
alter table public.subscriptions      enable row level security;
alter table public.audit_events       enable row level security;

-- tenants ---------------------------------------------------------------------
create policy "members read their tenant" on public.tenants
  for select using (app.is_tenant_member(id));

create policy "owners update their tenant" on public.tenants
  for update using (app.tenant_role(id) = 'owner')
  with check (app.tenant_role(id) = 'owner');

-- tenant_members --------------------------------------------------------------
create policy "members read their memberships" on public.tenant_members
  for select using (app.is_tenant_member(tenant_id));

create policy "owners and admins manage members" on public.tenant_members
  for all using (app.tenant_role(tenant_id) in ('owner','admin'))
  with check (app.tenant_role(tenant_id) in ('owner','admin'));

-- leads -----------------------------------------------------------------------
create policy "tenant members read leads" on public.leads
  for select using (app.is_tenant_member(tenant_id));

create policy "tenant members write leads" on public.leads
  for all using (app.is_tenant_member(tenant_id))
  with check (app.is_tenant_member(tenant_id));

-- estimate_sessions -----------------------------------------------------------
create policy "tenant members read sessions" on public.estimate_sessions
  for select using (app.is_tenant_member(tenant_id));
create policy "tenant members write sessions" on public.estimate_sessions
  for all using (app.is_tenant_member(tenant_id))
  with check (app.is_tenant_member(tenant_id));

-- integrations ----------------------------------------------------------------
create policy "tenant members read integrations" on public.integrations
  for select using (app.is_tenant_member(tenant_id));

create policy "owners and admins write integrations" on public.integrations
  for all using (app.tenant_role(tenant_id) in ('owner','admin'))
  with check (app.tenant_role(tenant_id) in ('owner','admin'));

-- webhook_deliveries (read-only from dashboard; writes are service-role only) -
create policy "tenant members read deliveries" on public.webhook_deliveries
  for select using (app.is_tenant_member(tenant_id));

-- widget_events ---------------------------------------------------------------
create policy "tenant members read events" on public.widget_events
  for select using (app.is_tenant_member(tenant_id));

-- subscriptions ---------------------------------------------------------------
create policy "tenant members read subscriptions" on public.subscriptions
  for select using (app.is_tenant_member(tenant_id));

-- audit_events ----------------------------------------------------------------
create policy "owners and admins read audit" on public.audit_events
  for select using (app.tenant_role(tenant_id) in ('owner','admin'));

-- ============================================================================
-- Public widget inserts
-- ----------------------------------------------------------------------------
-- The public estimator widget creates `widget_events` and (sometimes) `leads`
-- without an authenticated user. We deliberately do NOT grant the anon role
-- direct insert on these tables — instead, all public inserts must go through
-- a Netlify Function that:
--
--   1. Verifies the request's widget token signature against the tenant's
--      `widget_token_secret` (see netlify/lib/auth.ts:verifyWidgetToken).
--   2. Uses the service-role key to insert, scoped to the verified tenant.
--
-- This keeps the database completely isolated from arbitrary anonymous
-- writes (no scrapers, no spam guns), while still letting us serve the
-- widget from any contractor's site without per-site CORS configuration.
--
-- If you ever want direct anon -> DB inserts (e.g. via Supabase Edge
-- Functions), the safe pattern is:
--
--   create policy "anon widget insert" on public.widget_events
--     for insert to anon
--     with check (
--       app.verify_widget_token(
--         (current_setting('request.headers', true)::jsonb ->> 'x-measuredquote-widget-token'),
--         tenant_id
--       )
--     );
--
-- ...where `app.verify_widget_token` does HMAC validation in plpgsql. We
-- have left this OFF by default — the function-mediated path is simpler
-- and easier to monitor.
-- ============================================================================

-- A no-op placeholder so anon CANNOT directly insert. (Equivalent to no
-- policy at all on `for insert`; included here as documentation.)
revoke insert on public.widget_events from anon;
revoke insert on public.leads          from anon;
