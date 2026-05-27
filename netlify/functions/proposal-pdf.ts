// /api/leads/:id/proposal.pdf — dedicated PDF endpoint.
//
// Netlify exposes this as a separate function so its execution can be tuned
// independently (PDF generation is CPU-bound and benefits from a higher
// memory tier). The catch-all `/api/leads/:id/proposal.pdf` also resolves
// through `leads.ts` to keep backwards compatibility; deployments may
// redirect the more specific path here for performance.

import type { Handler } from "@netlify/functions";
import { getServiceClient } from "../lib/supabase";
import { getBearer, verifyWidgetToken } from "../lib/auth";
import { renderProposalPdf } from "../lib/pdf";
import { forbidden, methodNotAllowed, notFound, preflight, serverError, badRequest } from "../lib/response";

function parseId(path: string): string | null {
  const m = /\/leads\/([^/]+)\/proposal\.pdf$/.exec(path) || /\/proposal-pdf\/([^/]+)/.exec(path);
  return m?.[1] ?? null;
}

async function authorize(event: Parameters<Handler>[0]): Promise<{ tenantId: string } | { error: string }> {
  const bearer = getBearer(event);
  const widgetToken = event.headers["x-measuredquote-widget-token"];

  if (widgetToken && typeof widgetToken === "string") {
    const tenantId = widgetToken.split(".")[0];
    if (!tenantId) return { error: "invalid widget token" };
    const supabase = getServiceClient();
    const { data: tenant } = await supabase
      .from("tenants")
      .select("id, widget_token_secret, status")
      .eq("id", tenantId)
      .single();
    if (!tenant || tenant.status !== "active") return { error: "tenant inactive" };
    const verified = verifyWidgetToken(widgetToken, tenant.widget_token_secret);
    if (!verified) return { error: "widget token signature mismatch" };
    return { tenantId: tenant.id };
  }

  if (bearer) {
    const supabase = getServiceClient();
    const { data: userData } = await supabase.auth.getUser(bearer);
    if (!userData?.user) return { error: "invalid session" };
    const { data: m } = await supabase
      .from("tenant_members")
      .select("tenant_id")
      .eq("user_id", userData.user.id)
      .limit(1)
      .single();
    if (!m) return { error: "no tenant" };
    return { tenantId: m.tenant_id };
  }

  return { error: "missing credentials" };
}

export const handler: Handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return preflight();
  if (event.httpMethod !== "GET") return methodNotAllowed(["GET", "OPTIONS"]);

  try {
    const auth = await authorize(event);
    if ("error" in auth) return forbidden(auth.error);

    const id = parseId(event.path);
    if (!id) return badRequest("missing lead id");

    const supabase = getServiceClient();
    const { data: lead } = await supabase
      .from("leads")
      .select("*")
      .eq("tenant_id", auth.tenantId)
      .eq("id", id)
      .single();
    if (!lead) return notFound("lead not found");

    const { data: tenant } = await supabase
      .from("tenants")
      .select("name, brand_color, contact_email")
      .eq("id", auth.tenantId)
      .single();

    const pdf = await renderProposalPdf({
      id: lead.id,
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      address: lead.address,
      language: lead.language ?? "en",
      trade: lead.trade,
      measurement: lead.measurement,
      measurement_unit: lead.measurement_unit,
      material: lead.material,
      low_estimate: lead.low_estimate,
      high_estimate: lead.high_estimate,
      line_items: lead.line_items,
      addons: lead.addons,
      created_at: lead.created_at,
      tenant: tenant ?? null,
    });

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Cache-Control": "private, max-age=0, no-store",
        "Content-Disposition": `inline; filename="measuredquote-estimate-${lead.id}.pdf"`,
      },
      body: pdf.toString("base64"),
      isBase64Encoded: true,
    };
  } catch (err) {
    return serverError(err);
  }
};
