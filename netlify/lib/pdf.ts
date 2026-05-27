// Shared proposal PDF renderer for Netlify Functions.
//
// We deliberately keep this independent of the SQLite `Lead` shape used by
// the Express prototype so the same code can render either the SQLite-backed
// demo data or the Supabase `leads` row. Pass a normalized object.

import PDFDocument from "pdfkit";
import { PassThrough } from "node:stream";

const TRADE_LABEL: Record<string, string> = {
  concrete: "Concrete",
  asphalt: "Asphalt paving",
  landscape: "Landscape installation",
  decks: "Deck construction",
  roofing: "Roofing",
  fencing: "Fencing",
};

const COLORS = {
  ink: "#0a0a0a",
  muted: "#71717a",
  border: "#e4e4e7",
  surface: "#f4f4f5",
  accent: "#ea580c",
  accentSoft: "#fff7ed",
};

export interface ProposalLead {
  id: string | number;
  name: string;
  email: string;
  phone: string;
  address: string;
  language?: string;
  trade: string;
  measurement: number;
  measurement_unit: "sqft" | "lf";
  material: string;
  low_estimate: number;
  high_estimate: number;
  line_items?: Array<{ label: string; amount: number }> | string | null;
  addons?: string[] | string | null;
  created_at?: string | number | Date;
  tenant?: { name?: string; brand_color?: string; contact_email?: string } | null;
}

function parseList<T>(v: unknown, fallback: T): T {
  if (v == null) return fallback;
  if (typeof v === "string") {
    try {
      return JSON.parse(v) as T;
    } catch {
      return fallback;
    }
  }
  return v as T;
}

function money(n: number): string {
  return "$" + Math.round(n).toLocaleString("en-US");
}

/** Render the proposal PDF and resolve with the full Buffer. */
export async function renderProposalPdf(lead: ProposalLead): Promise<Buffer> {
  const doc = new PDFDocument({
    size: "LETTER",
    margins: { top: 56, bottom: 56, left: 56, right: 56 },
    info: {
      Title: `MeasuredQuote Estimate #${String(lead.id).padStart(4, "0")}`,
      Author: lead.tenant?.name || "MeasuredQuote",
      Subject: `Project estimate for ${lead.name}`,
      Creator: "MeasuredQuote",
    },
  });

  const stream = new PassThrough();
  doc.pipe(stream);

  const W = doc.page.width - 112;
  const LEFT = 56;
  const RIGHT = LEFT + W;
  const tradeLabel = TRADE_LABEL[lead.trade] ?? lead.trade;
  const lineItems = parseList<Array<{ label: string; amount: number }>>(lead.line_items, []);
  const addons = parseList<string[]>(lead.addons, []);
  const subtotal = lineItems.reduce((s, l) => s + l.amount, 0);
  const created = new Date(lead.created_at ?? Date.now());
  const validUntil = new Date(created.getTime() + 1000 * 60 * 60 * 24 * 30);
  const measurementLabel = `${lead.measurement.toLocaleString()} ${
    lead.measurement_unit === "sqft" ? "sq ft" : "linear ft"
  }`;
  const midpoint = (lead.low_estimate + lead.high_estimate) / 2;
  const accent = lead.tenant?.brand_color || COLORS.accent;
  const contractor = lead.tenant?.name || "Your contractor";

  // Header band
  doc.save();
  doc.rect(0, 0, doc.page.width, 110).fill(COLORS.ink);
  doc.fillColor(accent).rect(LEFT, 38, 18, 18).fill();
  doc.fillColor("#ffffff").rect(LEFT + 22, 42, 4, 14).fill();
  doc.fillColor("#ffffff").rect(LEFT + 28, 38, 4, 18).fill();
  doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(14).text("MeasuredQuote", LEFT + 42, 41);
  doc
    .fillColor("rgba(255,255,255,0.65)")
    .font("Helvetica")
    .fontSize(8)
    .text(`PROJECT ESTIMATE · PREPARED BY ${contractor.toUpperCase()}`, LEFT, 70, {
      characterSpacing: 1,
    });
  doc
    .fillColor("#ffffff")
    .font("Helvetica-Bold")
    .fontSize(18)
    .text(`Estimate #${String(lead.id).padStart(4, "0")}`, LEFT, 82);
  const metaX = RIGHT - 200;
  doc
    .fillColor("rgba(255,255,255,0.85)")
    .font("Helvetica")
    .fontSize(9)
    .text(`Issued    ${created.toLocaleDateString()}`, metaX, 41, { width: 200, align: "right" })
    .text(`Valid     ${validUntil.toLocaleDateString()}`, metaX, 55, { width: 200, align: "right" })
    .text(`Language  ${(lead.language || "en").toUpperCase()}`, metaX, 69, {
      width: 200,
      align: "right",
    });
  doc.restore();

  doc.y = 140;
  const partyTop = doc.y;
  doc.fillColor(COLORS.muted).font("Helvetica").fontSize(8).text("PREPARED FOR", LEFT, partyTop, {
    characterSpacing: 1,
  });
  doc.fillColor(COLORS.ink).font("Helvetica-Bold").fontSize(13).text(lead.name, LEFT, partyTop + 14);
  doc.font("Helvetica").fontSize(10);
  doc.text(lead.email, LEFT, partyTop + 32);
  doc.text(lead.phone, LEFT, partyTop + 46);
  doc
    .fillColor(COLORS.muted)
    .fontSize(10)
    .text(lead.address, LEFT, partyTop + 60, { width: W / 2 - 16 });

  const COL2 = LEFT + W / 2;
  doc.fillColor(COLORS.muted).fontSize(8).text("PREPARED BY", COL2, partyTop, {
    characterSpacing: 1,
  });
  doc.fillColor(COLORS.ink).font("Helvetica-Bold").fontSize(13).text(contractor, COL2, partyTop + 14);
  doc.font("Helvetica").fontSize(10);
  doc.text(lead.tenant?.contact_email || "sales@example.com", COL2, partyTop + 32);

  doc.y = partyTop + 96;

  // Project scope card
  const scopeY = doc.y;
  doc.save();
  doc.roundedRect(LEFT, scopeY, W, 82, 8).fillAndStroke(COLORS.surface, COLORS.border);
  doc.restore();
  doc
    .fillColor(COLORS.muted)
    .font("Helvetica")
    .fontSize(8)
    .text("PROJECT SCOPE", LEFT + 16, scopeY + 14, { characterSpacing: 1 });
  const scopeColW = (W - 32) / 3;
  drawCell(doc, "Trade", tradeLabel, LEFT + 16, scopeY + 32, scopeColW);
  drawCell(doc, "Measurement", measurementLabel, LEFT + 16 + scopeColW, scopeY + 32, scopeColW);
  drawCell(doc, "Material / finish", lead.material, LEFT + 16 + scopeColW * 2, scopeY + 32, scopeColW);

  doc.y = scopeY + 100;

  // Hero range
  const heroY = doc.y;
  doc.save();
  doc.roundedRect(LEFT, heroY, W, 96, 10).fillAndStroke(COLORS.accentSoft, accent);
  doc.restore();
  doc
    .fillColor(COLORS.ink)
    .font("Helvetica")
    .fontSize(8)
    .text("ESTIMATED INVESTMENT RANGE", LEFT + 18, heroY + 16, { characterSpacing: 1 });
  doc
    .fillColor(COLORS.ink)
    .font("Helvetica-Bold")
    .fontSize(28)
    .text(`${money(lead.low_estimate)}  –  ${money(lead.high_estimate)}`, LEFT + 18, heroY + 32);
  doc
    .fillColor(COLORS.muted)
    .font("Helvetica")
    .fontSize(10)
    .text(
      `Midpoint ${money(midpoint)}. Final price confirmed after on-site walkthrough.`,
      LEFT + 18,
      heroY + 72,
    );

  doc.y = heroY + 116;

  // Line items
  if (lineItems.length > 0) {
    doc.fillColor(COLORS.ink).font("Helvetica-Bold").fontSize(13).text("Line items", LEFT, doc.y);
    doc.y += 22;
    const tableTop = doc.y;
    doc.save();
    doc.rect(LEFT, tableTop, W, 22).fill(COLORS.surface);
    doc.restore();
    doc.fillColor(COLORS.muted).font("Helvetica").fontSize(8);
    doc.text("DESCRIPTION", LEFT + 14, tableTop + 8, { characterSpacing: 1 });
    doc.text("AMOUNT", RIGHT - 90, tableTop + 8, { width: 80, align: "right", characterSpacing: 1 });
    let rowY = tableTop + 22;
    doc.font("Helvetica").fontSize(10).fillColor(COLORS.ink);
    for (const li of lineItems) {
      doc.text(li.label, LEFT + 14, rowY + 6, { width: W - 120 });
      doc.text(money(li.amount), RIGHT - 90, rowY + 6, { width: 80, align: "right" });
      rowY += 22;
    }
    doc.save();
    doc.rect(LEFT, rowY, W, 26).fill(COLORS.surface);
    doc.restore();
    doc.fillColor(COLORS.ink).font("Helvetica-Bold").fontSize(10);
    doc.text("Subtotal (pre-margin)", LEFT + 14, rowY + 8);
    doc.text(money(subtotal), RIGHT - 90, rowY + 8, { width: 80, align: "right" });
    doc.y = rowY + 32;
  }

  if (addons.length > 0) {
    doc.font("Helvetica").fontSize(9).fillColor(COLORS.muted).text("ADD-ONS", LEFT, doc.y, {
      characterSpacing: 1,
    });
    doc.y += 14;
    doc.fillColor(COLORS.ink).fontSize(10).text(addons.join(" · "), LEFT, doc.y, { width: W });
    doc.y += 20;
  }

  // Footer
  if (doc.y > 700) doc.addPage();
  doc.save().strokeColor(COLORS.border).lineWidth(0.5).moveTo(LEFT, doc.y).lineTo(RIGHT, doc.y).stroke().restore();
  doc
    .fillColor(COLORS.muted)
    .font("Helvetica")
    .fontSize(8)
    .text("Prepared with MeasuredQuote · measuredquote.com", LEFT, doc.y + 10, {
      characterSpacing: 1,
    });

  doc.end();

  return await new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on("data", (c) => chunks.push(Buffer.from(c)));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);
  });
}

function drawCell(
  doc: PDFKit.PDFDocument,
  label: string,
  value: string,
  x: number,
  y: number,
  w: number,
) {
  doc
    .fillColor(COLORS.muted)
    .font("Helvetica")
    .fontSize(7)
    .text(label.toUpperCase(), x, y, { width: w, characterSpacing: 1 });
  doc
    .fillColor(COLORS.ink)
    .font("Helvetica-Bold")
    .fontSize(11)
    .text(value, x, y + 12, { width: w });
}
