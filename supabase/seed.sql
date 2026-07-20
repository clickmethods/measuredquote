-- Demo tenant + integrations seed.
--
-- Safe to re-run: each insert uses `on conflict do nothing` against a known
-- slug / unique pair. Use this for local Supabase development only.

insert into public.tenants (id, name, slug, status, plan_status, contact_email, brand_color)
values (
  '11111111-1111-1111-1111-111111111111',
  'Ortiz Concrete (Demo)',
  'demo-ortiz-concrete',
  'active',
  'trialing',
  'demo@measuredquote.com',
  '#0F172A'
)
on conflict (id) do nothing;

-- The five demo integrations that ship with Phase 3.
insert into public.integrations (tenant_id, provider, display_name, category, enabled, endpoint, events)
values
  ('11111111-1111-1111-1111-111111111111','webhook','Custom Webhook','automation',true,'https://example.com/webhooks/measuredquote-demo','["lead.created","lead.status_changed"]'),
  ('11111111-1111-1111-1111-111111111111','followupboss','Follow Up Boss','crm',true,'https://api.followupboss.com/v1/events','["lead.created"]'),
  ('11111111-1111-1111-1111-111111111111','hubspot','HubSpot','crm',false,'https://api.hubapi.com/contacts/v1','["lead.created"]'),
  ('11111111-1111-1111-1111-111111111111','zapier','Zapier','automation',true,'https://hooks.zapier.com/hooks/catch/demo','["lead.created","lead.status_changed"]'),
  ('11111111-1111-1111-1111-111111111111','n8n','n8n','automation',true,'https://n8n.demo.invalid/webhook/measuredquote','["lead.created"]')
on conflict (tenant_id, provider) do nothing;
