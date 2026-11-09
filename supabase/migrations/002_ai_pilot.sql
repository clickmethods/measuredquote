-- 002_ai_pilot.sql
-- Lead desk persistence for the AI pilot features:
--   * notes            : append-only internal notes (typed or voice-dictated)
--   * last_activity_at : drives the 48h "Needs Follow-Up" queue
-- Status already supports won/lost (Win/Loss outcomes).

alter table public.leads
  add column if not exists notes jsonb not null default '[]'::jsonb,
  add column if not exists last_activity_at timestamptz not null default now();

-- Backfill: existing leads' last activity = their last update.
update public.leads set last_activity_at = coalesce(updated_at, created_at)
  where last_activity_at is null or last_activity_at > coalesce(updated_at, created_at);

create index if not exists idx_leads_tenant_activity
  on public.leads(tenant_id, last_activity_at);
