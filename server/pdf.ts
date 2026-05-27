import PDFDocument from "pdfkit";
import type { Lead } from "@shared/schema";

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

interface LineItem {
  label: string;
  amount: number;
}

function safeParse<T>(s: string, fallback: T): T {
  try {
    return JSON.parse(s) as T;
  } catch {
    return fallback;
  }
}

function money(n: number): string {
  return "$" + Math.round(n).toLocaleString("en-US");
}

/**
 * Streams a printable estimate PDF for a lead.
 * Branded MeasuredQuote / Ortiz Concrete (demo contractor).
 */
export function streamLeadPdf(res: NodeJS.WritableStream, lead: Lead): void {
  const doc = new PDFDocument({
    size: "LETTER",
    margins: { top: 56, bottom: 56, left: 56, right: 56 },
    info: {
      Title: `MeasuredQuote Estimate #${String(lead.id).padStart(4, "0")}`,
      Author: "Ortiz Concrete",
      Subject: `Project estimate for ${lead.name}`,
      Creator: "MeasuredQuote",
    },
  });

  doc.pipe(res);

  const W = doc.page.width - 112; // content width inside margins
  const LEFT = 56;
  const RIGHT = LEFT + W;
  const tradeLabel = TRADE_LABEL[lead.trade] ?? lead.trade;
  const lineItems = safeParse<LineItem[]>(lead.lineItemsJson, []);
  const addons = safeParse<string[]>(lead.addonsJson, []);
  const subtotal = lineItems.reduce((s, l) => s + l.amount, 0);
  const created = new Date(lead.createdAt);
  const validUntil = new Date(lead.createdAt + 1000 * 60 * 60 * 24 * 30);
  const measurementLabel = `${lead.measurement.toLocaleString()} ${lead.measurementUnit === "sqft" ? "sq ft" : "linear ft"}`;
  const midpoint = (lead.lowEstimate + lead.highEstimate) / 2;

  // --- Header band ---------------------------------------------------------
  doc.save();
  doc.rect(0, 0, doc.page.width, 110).fill(COLORS.ink);

  // Logo mark — a simple geometric square + wordmark, all in PDF primitives.
  doc.save();
  doc.translate(LEFT, 38);
  doc.fillColor(COLORS.accent).rect(0, 0, 18, 18).fill();
  doc.fillColor("#ffffff").rect(22, 4, 4, 14).fill();
  doc.fillColor("#ffffff").rect(28, 0, 4, 18).fill();
  doc.restore();

  doc
    .fillColor("#ffffff")
    .font("Helvetica-Bold")
    .fontSize(14)
    .text("MeasuredQuote", LEFT + 42, 41);

  doc
    .fillColor("rgba(255,255,255,0.65)")
    .font("Helvetica")
    .fontSize(8)
    .text("PROJECT ESTIMATE · PREPARED BY ORTIZ CONCRETE", LEFT, 70, { characterSpacing: 1 });

  doc
    .fillColor("#ffffff")
    .font("Helvetica-Bold")
    .fontSize(18)
    .text(`Estimate #${String(lead.id).padStart(4, "0")}`, LEFT, 82);

  // Right-side meta
  const metaX = RIGHT - 200;
  doc
    .fillColor("rgba(255,255,255,0.85)")
    .font("Helvetica")
    .fontSize(9)
    .text(`Issued    ${created.toLocaleDateString()}`, metaX, 41, { width: 200, align: "right" })
    .text(`Valid     ${validUntil.toLocaleDateString()}`, metaX, 55, { width: 200, align: "right" })
    .text(`Language  ${(lead.language || "en").toUpperCase()}`, metaX, 69, { width: 200, align: "right" });
  doc.restore();

  doc.y = 140;

  // --- Parties -------------------------------------------------------------
  const partyTop = doc.y;
  drawBlockTitle(doc, "PREPARED FOR", LEFT, partyTop);
  doc.fillColor(COLORS.ink).font("Helvetica-Bold").fontSize(13).text(lead.name, LEFT, partyTop + 14);
  doc.fillColor(COLORS.ink).font("Helvetica").fontSize(10);
  doc.text(lead.email, LEFT, partyTop + 32);
  doc.text(lead.phone, LEFT, partyTop + 46);
  doc.fillColor(COLORS.muted).fontSize(10).text(lead.address, LEFT, partyTop + 60, { width: W / 2 - 16 });

  const COL2 = LEFT + W / 2;
  drawBlockTitle(doc, "PREPARED BY", COL2, partyTop);
  doc.fillColor(COLORS.ink).font("Helvetica-Bold").fontSize(13).text("Ortiz Concrete", COL2, partyTop + 14);
  doc.fillColor(COLORS.ink).font("Helvetica").fontSize(10);
  doc.text("License #PL-19238 · CA", COL2, partyTop + 32);
  doc.text("sales@ortizconcrete.com", COL2, partyTop + 46);
  doc.text("+1 (720) 555-0134", COL2, partyTop + 60);

  doc.y = partyTop + 96;

  // --- Project scope card --------------------------------------------------
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
  drawScopeCell(doc, "Trade", tradeLabel, LEFT + 16, scopeY + 32, scopeColW);
  drawScopeCell(doc, "Measurement", measurementLabel, LEFT + 16 + scopeColW, scopeY + 32, scopeColW);
  drawScopeCell(doc, "Material / finish", lead.material, LEFT + 16 + scopeColW * 2, scopeY + 32, scopeColW);

  doc.y = scopeY + 100;

  // --- Hero estimate range -------------------------------------------------
  const heroY = doc.y;
  doc.save();
  doc.roundedRect(LEFT, heroY, W, 96, 10).fillAndStroke(COLORS.accentSoft, COLORS.accent);
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
    .text(`${money(lead.lowEstimate)}  –  ${money(lead.highEstimate)}`, LEFT + 18, heroY + 32);

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

  // --- Line items ----------------------------------------------------------
  sectionHeader(doc, "Line items", LEFT, doc.y);
  doc.y += 22;

  const tableTop = doc.y;
  doc.save();
  doc.rect(LEFT, tableTop, W, 22).fill(COLORS.surface);
  doc.restore();
  doc
    .fillColor(COLORS.muted)
    .font("Helvetica")
    .fontSize(8)
    .text("DESCRIPTION", LEFT + 14, tableTop + 8, { characterSpacing: 1 });
  doc.text("AMOUNT", RIGHT - 90, tableTop + 8, { width: 80, align: "right", characterSpacing: 1 });

  let rowY = tableTop + 22;
  doc.font("Helvetica").fontSize(10).fillColor(COLORS.ink);
  for (const li of lineItems) {
    const rowH = 22;
    doc.text(li.label, LEFT + 14, rowY + 6, { width: W - 120 });
    doc.text(money(li.amount), RIGHT - 90, rowY + 6, { width: 80, align: "right" });
    rowY += rowH;
    doc.save().strokeColor(COLORS.border).lineWidth(0.5).moveTo(LEFT, rowY).lineTo(RIGHT, rowY).stroke().restore();
  }
  // subtotal
  doc.save();
  doc.rect(LEFT, rowY, W, 26).fill(COLORS.surface);
  doc.restore();
  doc.fillColor(COLORS.ink).font("Helvetica-Bold").fontSize(10);
  doc.text("Subtotal (pre-margin)", LEFT + 14, rowY + 8);
  doc.text(money(subtotal), RIGHT - 90, rowY + 8, { width: 80, align: "right" });
  rowY += 26;

  doc.y = rowY + 8;

  // Addons chips
  if (addons.length > 0) {
    let chipX = LEFT;
    const chipY = doc.y + 4;
    doc.font("Helvetica").fontSize(9).fillColor(COLORS.muted);
    for (const a of addons) {
      const w = doc.widthOfString(a) + 14;
      doc.save();
      doc.roundedRect(chipX, chipY, w, 18, 9).fillAndStroke(COLORS.surface, COLORS.border);
      doc.restore();
      doc.fillColor(COLORS.ink).text(a, chipX + 7, chipY + 5);
      chipX += w + 6;
      if (chipX > RIGHT - 100) {
        chipX = LEFT;
        doc.y = chipY + 22;
      }
    }
    doc.y = chipY + 28;
  }

  // --- Assumptions & exclusions -------------------------------------------
  doc.y += 6;
  if (doc.y > 620) doc.addPage();
  const colY = doc.y;
  twoColList(
    doc,
    LEFT,
    colY,
    W / 2 - 8,
    "Assumptions",
    [
      "Standard site access from the street, no slope greater than 5°.",
      "Existing surface in serviceable condition unless tear-out add-on selected.",
      "Single mobilization; weather windows of 3+ consecutive dry days.",
      "Markup includes overhead, insurance, and one-year workmanship warranty.",
    ],
  );
  twoColList(
    doc,
    LEFT + W / 2 + 8,
    colY,
    W / 2 - 8,
    "Exclusions",
    [
      "Permits, drainage redesign, or structural engineering.",
      "Hidden utilities or buried obstructions discovered during excavation.",
      "Landscape restoration outside the marked work area.",
      "HOA review and design approval timelines.",
    ],
  );

  doc.y = colY + 150;

  // --- Next steps ----------------------------------------------------------
  if (doc.y > 640) doc.addPage();
  sectionHeader(doc, "Next steps", LEFT, doc.y);
  doc.y += 22;
  const stepY = doc.y;
  const stepW = (W - 16) / 3;
  drawStep(doc, 1, "Confirm site visit", "Pick a 30-min on-site window for measurement verification.", LEFT, stepY, stepW);
  drawStep(doc, 2, "Lock the scope", "Finalize material, finishes, and add-ons. Issue a fixed-price contract.", LEFT + stepW + 8, stepY, stepW);
  drawStep(doc, 3, "Schedule install", "10% deposit reserves the calendar. Final payment due on completion.", LEFT + (stepW + 8) * 2, stepY, stepW);
  doc.y = stepY + 92;

  // --- Footer --------------------------------------------------------------
  if (doc.y > 700) doc.addPage();
  doc.save().strokeColor(COLORS.border).lineWidth(0.5).moveTo(LEFT, doc.y).lineTo(RIGHT, doc.y).stroke().restore();
  doc
    .fillColor(COLORS.muted)
    .font("Helvetica")
    .fontSize(8)
    .text("Prepared with MeasuredQuote · measuredquote.com", LEFT, doc.y + 10, { characterSpacing: 1 })
    .text(
      `Estimate #${String(lead.id).padStart(4, "0")} · ${created.toLocaleString()}`,
      LEFT,
      doc.y + 10,
      { width: W, align: "right", characterSpacing: 1 },
    );

  doc.end();
}

function drawBlockTitle(doc: PDFKit.PDFDocument, label: string, x: number, y: number) {
  doc
    .fillColor(COLORS.muted)
    .font("Helvetica")
    .fontSize(8)
    .text(label, x, y, { characterSpacing: 1 });
}

function drawScopeCell(doc: PDFKit.PDFDocument, label: string, value: string, x: number, y: number, w: number) {
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

function sectionHeader(doc: PDFKit.PDFDocument, label: string, x: number, y: number) {
  doc
    .fillColor(COLORS.ink)
    .font("Helvetica-Bold")
    .fontSize(13)
    .text(label, x, y);
}

function twoColList(
  doc: PDFKit.PDFDocument,
  x: number,
  y: number,
  w: number,
  title: string,
  items: string[],
) {
  drawBlockTitle(doc, title.toUpperCase(), x, y);
  doc.font("Helvetica").fontSize(9.5).fillColor(COLORS.ink);
  let cy = y + 16;
  for (const it of items) {
    doc.fillColor(COLORS.accent).text("•", x, cy);
    doc.fillColor(COLORS.ink).text(it, x + 10, cy, { width: w - 10 });
    cy = doc.y + 4;
  }
}

function drawStep(
  doc: PDFKit.PDFDocument,
  n: number,
  title: string,
  body: string,
  x: number,
  y: number,
  w: number,
) {
  doc.save();
  doc.roundedRect(x, y, w, 78, 8).fillAndStroke(COLORS.surface, COLORS.border);
  doc.restore();
  doc.save();
  doc.roundedRect(x + 12, y + 12, 22, 18, 4).fill(COLORS.ink);
  doc.restore();
  doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(10).text(`0${n}`, x + 12, y + 16, { width: 22, align: "center" });
  doc
    .fillColor(COLORS.ink)
    .font("Helvetica-Bold")
    .fontSize(11)
    .text(title, x + 12, y + 38, { width: w - 24 });
  doc
    .fillColor(COLORS.muted)
    .font("Helvetica")
    .fontSize(9)
    .text(body, x + 12, y + 54, { width: w - 24 });
}
