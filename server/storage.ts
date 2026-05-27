import {
  leads,
  integrations,
  webhookDeliveries,
  widgetEvents,
} from '@shared/schema';
import type {
  Lead,
  InsertLead,
  Integration,
  InsertIntegration,
  WebhookDelivery,
  WidgetEvent,
  InsertWidgetEvent,
} from '@shared/schema';
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { desc, eq } from "drizzle-orm";

const sqlite = new Database("data.db");
sqlite.pragma("journal_mode = WAL");

// Bootstrap schema (no migrations in prototype)
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    language TEXT NOT NULL DEFAULT 'en',
    trade TEXT NOT NULL,
    measurement REAL NOT NULL,
    measurement_unit TEXT NOT NULL,
    material TEXT NOT NULL,
    addons_json TEXT NOT NULL DEFAULT '[]',
    low_estimate REAL NOT NULL,
    high_estimate REAL NOT NULL,
    line_items_json TEXT NOT NULL DEFAULT '[]',
    geometry_json TEXT NOT NULL DEFAULT 'null',
    source_url TEXT NOT NULL DEFAULT 'demo.measuredquote.com',
    status TEXT NOT NULL DEFAULT 'new',
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS integrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    provider TEXT NOT NULL,
    display_name TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'webhook',
    enabled INTEGER NOT NULL DEFAULT 0,
    endpoint TEXT NOT NULL DEFAULT '',
    secret TEXT NOT NULL DEFAULT '',
    auth_header TEXT NOT NULL DEFAULT '',
    events_json TEXT NOT NULL DEFAULT '["lead.created"]',
    last_status TEXT NOT NULL DEFAULT '',
    last_status_code INTEGER,
    last_tested_at INTEGER,
    last_delivered_at INTEGER,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS webhook_deliveries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    integration_id INTEGER,
    provider TEXT NOT NULL,
    event_type TEXT NOT NULL,
    endpoint TEXT NOT NULL,
    request_payload TEXT NOT NULL,
    status TEXT NOT NULL,
    status_code INTEGER,
    response_snippet TEXT NOT NULL DEFAULT '',
    attempt INTEGER NOT NULL DEFAULT 1,
    duration_ms INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS widget_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    trade TEXT NOT NULL DEFAULT '',
    step TEXT NOT NULL DEFAULT '',
    language TEXT NOT NULL DEFAULT 'en',
    source_url TEXT NOT NULL DEFAULT '',
    tenant TEXT NOT NULL DEFAULT 'default',
    metadata_json TEXT NOT NULL DEFAULT '{}',
    created_at INTEGER NOT NULL
  );
`);

export const db = drizzle(sqlite);

export interface IStorage {
  // leads
  listLeads(): Promise<Lead[]>;
  getLead(id: number): Promise<Lead | undefined>;
  createLead(lead: InsertLead): Promise<Lead>;
  updateLeadStatus(id: number, status: string): Promise<Lead | undefined>;

  // integrations
  listIntegrations(): Promise<Integration[]>;
  getIntegration(id: number): Promise<Integration | undefined>;
  getIntegrationByProvider(provider: string): Promise<Integration | undefined>;
  createIntegration(data: InsertIntegration): Promise<Integration>;
  updateIntegration(id: number, patch: Partial<InsertIntegration>): Promise<Integration | undefined>;
  recordIntegrationDelivery(id: number, status: string, code?: number, testedOnly?: boolean): Promise<void>;
  listEnabledIntegrationsForEvent(event: string): Promise<Integration[]>;

  // deliveries
  listDeliveries(limit?: number): Promise<WebhookDelivery[]>;
  createDelivery(d: Omit<WebhookDelivery, "id" | "createdAt">): Promise<WebhookDelivery>;

  // widget events
  listEvents(limit?: number): Promise<WidgetEvent[]>;
  createEvent(e: InsertWidgetEvent): Promise<WidgetEvent>;
}

export class DatabaseStorage implements IStorage {
  async listLeads(): Promise<Lead[]> {
    return db.select().from(leads).orderBy(desc(leads.createdAt)).all();
  }
  async getLead(id: number): Promise<Lead | undefined> {
    return db.select().from(leads).where(eq(leads.id, id)).get();
  }
  async createLead(insertLead: InsertLead): Promise<Lead> {
    return db.insert(leads).values({ ...insertLead, createdAt: Date.now() }).returning().get();
  }
  async updateLeadStatus(id: number, status: string): Promise<Lead | undefined> {
    return db.update(leads).set({ status }).where(eq(leads.id, id)).returning().get();
  }

  // ---- integrations ----
  async listIntegrations(): Promise<Integration[]> {
    return db.select().from(integrations).orderBy(integrations.id).all();
  }
  async getIntegration(id: number): Promise<Integration | undefined> {
    return db.select().from(integrations).where(eq(integrations.id, id)).get();
  }
  async getIntegrationByProvider(provider: string): Promise<Integration | undefined> {
    return db.select().from(integrations).where(eq(integrations.provider, provider)).get();
  }
  async createIntegration(data: InsertIntegration): Promise<Integration> {
    const now = Date.now();
    return db
      .insert(integrations)
      .values({ ...data, createdAt: now, updatedAt: now })
      .returning()
      .get();
  }
  async updateIntegration(id: number, patch: Partial<InsertIntegration>): Promise<Integration | undefined> {
    return db
      .update(integrations)
      .set({ ...patch, updatedAt: Date.now() })
      .where(eq(integrations.id, id))
      .returning()
      .get();
  }
  async recordIntegrationDelivery(id: number, status: string, code?: number, testedOnly = false): Promise<void> {
    const now = Date.now();
    const patch: Record<string, unknown> = {
      lastStatus: status,
      lastStatusCode: code ?? null,
      updatedAt: now,
    };
    if (testedOnly) patch.lastTestedAt = now;
    else patch.lastDeliveredAt = now;
    db.update(integrations).set(patch as any).where(eq(integrations.id, id)).run();
  }
  async listEnabledIntegrationsForEvent(event: string): Promise<Integration[]> {
    const all = db.select().from(integrations).where(eq(integrations.enabled, 1)).all();
    return all.filter((i) => {
      try {
        const evs: string[] = JSON.parse(i.eventsJson || "[]");
        return evs.includes(event);
      } catch {
        return false;
      }
    });
  }

  // ---- deliveries ----
  async listDeliveries(limit = 50): Promise<WebhookDelivery[]> {
    return db
      .select()
      .from(webhookDeliveries)
      .orderBy(desc(webhookDeliveries.createdAt))
      .limit(limit)
      .all();
  }
  async createDelivery(d: Omit<WebhookDelivery, "id" | "createdAt">): Promise<WebhookDelivery> {
    return db
      .insert(webhookDeliveries)
      .values({ ...d, createdAt: Date.now() })
      .returning()
      .get();
  }

  // ---- widget events ----
  async listEvents(limit = 1000): Promise<WidgetEvent[]> {
    return db
      .select()
      .from(widgetEvents)
      .orderBy(desc(widgetEvents.createdAt))
      .limit(limit)
      .all();
  }
  async createEvent(e: InsertWidgetEvent): Promise<WidgetEvent> {
    return db
      .insert(widgetEvents)
      .values({ ...e, createdAt: Date.now() })
      .returning()
      .get();
  }
}

export const storage = new DatabaseStorage();

// ============================================================
// Seed demo data
// ============================================================

async function seedLeads() {
  const existing = await storage.listLeads();
  if (existing.length > 0) return;
  const samples: InsertLead[] = [
    {
      name: "Marcus Chen", email: "marcus.chen@gmail.com", phone: "(415) 555-0182",
      address: "4821 Hawthorne Way, Pleasanton, CA 94566", language: "en",
      trade: "concrete", measurement: 612, measurementUnit: "sqft",
      material: "Stamped concrete", addonsJson: JSON.stringify(["Wire mesh", "Premium sealant"]),
      lowEstimate: 9180, highEstimate: 11220,
      lineItemsJson: JSON.stringify([
        { label: "Stamped concrete @ $14/sqft", amount: 8568 },
        { label: "Wire mesh @ $1.50/sqft", amount: 918 },
        { label: "Premium sealant (flat)", amount: 450 },
      ]),
      geometryJson: "null", sourceUrl: "kellysconcretebay.com", status: "new",
    },
    {
      name: "Priya Patel", email: "priya.p@outlook.com", phone: "(408) 555-0241",
      address: "189 Walnut Grove Ave, San Jose, CA 95128", language: "en",
      trade: "fencing", measurement: 184, measurementUnit: "lf",
      material: "Cedar 6' privacy", addonsJson: JSON.stringify(["Walk gate"]),
      lowEstimate: 6440, highEstimate: 7820,
      lineItemsJson: JSON.stringify([
        { label: "Cedar privacy @ $35/lf", amount: 6440 },
        { label: "Walk gate (flat)", amount: 400 },
      ]),
      geometryJson: "null", sourceUrl: "norcalfence.co", status: "contacted",
    },
    {
      name: "Daniel Romero", email: "droemro@yahoo.com", phone: "(925) 555-0117",
      address: "77 Foothill Blvd, Walnut Creek, CA 94595", language: "es",
      trade: "roofing", measurement: 2210, measurementUnit: "sqft",
      material: "Architectural shingles", addonsJson: JSON.stringify(["Tear-off", "Ridge vent"]),
      lowEstimate: 19250, highEstimate: 23520,
      lineItemsJson: JSON.stringify([
        { label: "Architectural shingles @ $8/sqft", amount: 17680 },
        { label: "Tear-off @ $1.50/sqft", amount: 3315 },
        { label: "Ridge vent (flat)", amount: 650 },
      ]),
      geometryJson: "null", sourceUrl: "summitroofingco.com", status: "scheduled",
    },
    {
      name: "Aisha Williams", email: "aisha.w@gmail.com", phone: "(510) 555-0398",
      address: "2240 Acacia St, Oakland, CA 94619", language: "en",
      trade: "landscape", measurement: 880, measurementUnit: "sqft",
      material: "Concrete pavers", addonsJson: JSON.stringify(["Topsoil prep"]),
      lowEstimate: 17600, highEstimate: 22440,
      lineItemsJson: JSON.stringify([
        { label: "Concrete pavers @ $22/sqft", amount: 19360 },
        { label: "Topsoil prep @ $0.80/sqft", amount: 704 },
      ]),
      geometryJson: "null", sourceUrl: "greenleaflandscapes.io", status: "quoted",
    },
    {
      name: "Tom Whitaker", email: "tom@whitakerhomes.com", phone: "(707) 555-0026",
      address: "1102 Vineyard Pl, Napa, CA 94559", language: "en",
      trade: "decks", measurement: 360, measurementUnit: "sqft",
      material: "Trex / TimberTech composite", addonsJson: JSON.stringify(["Aluminum railing", "Step lighting"]),
      lowEstimate: 16560, highEstimate: 20240,
      lineItemsJson: JSON.stringify([
        { label: "Composite decking @ $48/sqft", amount: 17280 },
        { label: "Aluminum railing (flat)", amount: 2000 },
        { label: "Step lighting (flat)", amount: 480 },
      ]),
      geometryJson: "null", sourceUrl: "vineyarddecks.com", status: "won",
    },
    {
      name: "Jessica Bauer", email: "jess.bauer@protonmail.com", phone: "(650) 555-0473",
      address: "55 Bayshore Dr, Redwood City, CA 94063", language: "en",
      trade: "asphalt", measurement: 4400, measurementUnit: "sqft",
      material: "Heavy-duty 3\" asphalt", addonsJson: JSON.stringify(["Sealcoating", "Line striping"]),
      lowEstimate: 41360, highEstimate: 50560,
      lineItemsJson: JSON.stringify([
        { label: "Heavy-duty asphalt @ $9.50/sqft", amount: 41800 },
        { label: "Sealcoating @ $0.40/sqft", amount: 1760 },
        { label: "Line striping (flat)", amount: 800 },
      ]),
      geometryJson: "null", sourceUrl: "baypavingpros.com", status: "new",
    },
  ];
  const now = Date.now();
  for (let i = 0; i < samples.length; i++) {
    const ageDays = i * 2 + Math.random() * 2;
    const ts = now - Math.floor(ageDays * 24 * 60 * 60 * 1000);
    db.insert(leads).values({ ...samples[i], createdAt: ts }).run();
  }
}

async function seedIntegrations() {
  const existing = await storage.listIntegrations();
  if (existing.length > 0) return;
  const now = Date.now();
  const samples: InsertIntegration[] = [
    {
      provider: "gohighlevel", displayName: "GoHighLevel", category: "crm",
      enabled: 1, endpoint: "https://services.leadconnectorhq.com/hooks/demo",
      secret: "", authHeader: "",
      eventsJson: JSON.stringify(["lead.created"]),
    },
    {
      provider: "followupboss", displayName: "Follow Up Boss", category: "crm",
      enabled: 1, endpoint: "https://api.followupboss.com/v1/events",
      secret: "", authHeader: "",
      eventsJson: JSON.stringify(["lead.created"]),
    },
    {
      provider: "hubspot", displayName: "HubSpot", category: "crm",
      enabled: 0, endpoint: "",
      secret: "", authHeader: "",
      eventsJson: JSON.stringify(["lead.created"]),
    },
    {
      provider: "zapier", displayName: "Zapier", category: "automation",
      enabled: 1, endpoint: "https://hooks.zapier.com/hooks/catch/demo/lead-mq",
      secret: "", authHeader: "",
      eventsJson: JSON.stringify(["lead.created"]),
    },
    {
      provider: "n8n", displayName: "n8n / custom webhook", category: "webhook",
      enabled: 1, endpoint: "https://flow.studio.dev/webhook/measuredquote",
      secret: "", authHeader: "",
      eventsJson: JSON.stringify(["lead.created"]),
    },
  ];
  for (const s of samples) {
    db.insert(integrations).values({ ...s, createdAt: now, updatedAt: now }).run();
  }
}

seedLeads().catch((e) => console.error("seed leads error", e));
seedIntegrations().catch((e) => console.error("seed integrations error", e));
