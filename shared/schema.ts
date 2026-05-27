import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const leads = sqliteTable("leads", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  address: text("address").notNull(),
  language: text("language").notNull().default("en"),
  trade: text("trade").notNull(), // concrete | asphalt | landscape | decks | roofing | fencing
  measurement: real("measurement").notNull(), // sqft or linear feet
  measurementUnit: text("measurement_unit").notNull(), // 'sqft' | 'lf'
  material: text("material").notNull(),
  addonsJson: text("addons_json").notNull().default("[]"),
  lowEstimate: real("low_estimate").notNull(),
  highEstimate: real("high_estimate").notNull(),
  lineItemsJson: text("line_items_json").notNull().default("[]"),
  geometryJson: text("geometry_json").notNull().default("null"),
  sourceUrl: text("source_url").notNull().default("demo.measuredquote.com"),
  status: text("status").notNull().default("new"), // new | contacted | scheduled | quoted | won | lost
  createdAt: integer("created_at").notNull(),
});

export const insertLeadSchema = createInsertSchema(leads).omit({ id: true, createdAt: true });
export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Lead = typeof leads.$inferSelect;

/* ============================================================
 * Phase 3: Integrations, webhook deliveries, widget events
 * ============================================================ */

export const integrations = sqliteTable("integrations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  provider: text("provider").notNull(), // gohighlevel | followupboss | hubspot | zapier | n8n | webhook
  displayName: text("display_name").notNull(),
  category: text("category").notNull().default("webhook"), // crm | automation | webhook
  enabled: integer("enabled").notNull().default(0), // boolean 0/1
  endpoint: text("endpoint").notNull().default(""),
  // Secret is stored server-side; never returned in full to the client (masked on read).
  secret: text("secret").notNull().default(""),
  authHeader: text("auth_header").notNull().default(""), // e.g. "Bearer …"
  // JSON array of event types like ["lead.created","lead.status_changed"]
  eventsJson: text("events_json").notNull().default('["lead.created"]'),
  lastStatus: text("last_status").notNull().default(""), // success | failure | ""
  lastStatusCode: integer("last_status_code"),
  lastTestedAt: integer("last_tested_at"),
  lastDeliveredAt: integer("last_delivered_at"),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

export const insertIntegrationSchema = createInsertSchema(integrations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastStatus: true,
  lastStatusCode: true,
  lastTestedAt: true,
  lastDeliveredAt: true,
});
export type InsertIntegration = z.infer<typeof insertIntegrationSchema>;
export type Integration = typeof integrations.$inferSelect;

export const webhookDeliveries = sqliteTable("webhook_deliveries", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  integrationId: integer("integration_id"),
  provider: text("provider").notNull(),
  eventType: text("event_type").notNull(), // lead.created, test.ping, lead.status_changed, etc.
  endpoint: text("endpoint").notNull(),
  requestPayload: text("request_payload").notNull(),
  status: text("status").notNull(), // success | failure | skipped
  statusCode: integer("status_code"),
  responseSnippet: text("response_snippet").notNull().default(""),
  attempt: integer("attempt").notNull().default(1),
  durationMs: integer("duration_ms").notNull().default(0),
  createdAt: integer("created_at").notNull(),
});
export type WebhookDelivery = typeof webhookDeliveries.$inferSelect;

export const widgetEvents = sqliteTable("widget_events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  sessionId: text("session_id").notNull(),
  eventType: text("event_type").notNull(),
  trade: text("trade").notNull().default(""),
  step: text("step").notNull().default(""),
  language: text("language").notNull().default("en"),
  sourceUrl: text("source_url").notNull().default(""),
  tenant: text("tenant").notNull().default("default"),
  metadataJson: text("metadata_json").notNull().default("{}"),
  createdAt: integer("created_at").notNull(),
});

export const insertWidgetEventSchema = createInsertSchema(widgetEvents).omit({
  id: true,
  createdAt: true,
});
export type InsertWidgetEvent = z.infer<typeof insertWidgetEventSchema>;
export type WidgetEvent = typeof widgetEvents.$inferSelect;
