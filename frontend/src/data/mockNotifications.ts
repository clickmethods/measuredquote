export interface NotificationSettings {
  email_alerts: boolean
  email_confirmation_homeowner: boolean
  daily_digest: boolean
  sms_alerts: boolean
  sms_phone: string
  webhook_pushes: boolean
  webhook_url: string
  send_on_every_lead: boolean
  send_only_booked: boolean
}

export const mockNotificationSettings: NotificationSettings = {
  email_alerts: true,
  email_confirmation_homeowner: true,
  daily_digest: false,
  sms_alerts: false,
  sms_phone: '(512) 555-0100',
  webhook_pushes: true,
  webhook_url: 'https://hooks.zapier.com/hooks/catch/123456/abcdef/',
  send_on_every_lead: true,
  send_only_booked: false,
}

export interface WebhookDelivery {
  id: string
  timestamp: string
  lead_name: string
  trade: string
  status: '200 OK' | 'Failed' | 'Pending' | 'Retrying'
  status_code?: number
}

export const mockWebhookDeliveries: WebhookDelivery[] = [
  {
    id: 'del_001',
    timestamp: '2025-06-27T14:30:00Z',
    lead_name: 'John Smith',
    trade: 'Concrete',
    status: '200 OK',
    status_code: 200,
  },
  {
    id: 'del_002',
    timestamp: '2025-06-27T12:15:00Z',
    lead_name: 'Sarah Johnson',
    trade: 'Roofing',
    status: '200 OK',
    status_code: 200,
  },
  {
    id: 'del_003',
    timestamp: '2025-06-27T10:45:00Z',
    lead_name: 'Michael Chen',
    trade: 'Asphalt',
    status: 'Failed',
    status_code: 500,
  },
  {
    id: 'del_004',
    timestamp: '2025-06-27T09:20:00Z',
    lead_name: 'Emily Rodriguez',
    trade: 'Deck',
    status: '200 OK',
    status_code: 200,
  },
  {
    id: 'del_005',
    timestamp: '2025-06-27T08:00:00Z',
    lead_name: 'David Kim',
    trade: 'Fence',
    status: '200 OK',
    status_code: 200,
  },
  {
    id: 'del_006',
    timestamp: '2025-06-26T22:30:00Z',
    lead_name: 'Amanda Foster',
    trade: 'Landscape',
    status: 'Failed',
    status_code: 404,
  },
  {
    id: 'del_007',
    timestamp: '2025-06-26T18:10:00Z',
    lead_name: 'Robert Lee',
    trade: 'Concrete',
    status: '200 OK',
    status_code: 200,
  },
]

export interface EmailTemplate {
  id: string
  name: string
  subject: string
  recipient: string
  body_html: string
}

export const mockEmailTemplates: EmailTemplate[] = [
  {
    id: 'tpl_contractor_alert',
    name: 'Contractor Lead Alert',
    subject: 'New Lead: {{lead.name}} — {{lead.trade}} | ${{lead.estimate_low}}-${{lead.estimate_high}}',
    recipient: 'Contractor',
    body_html: `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>New Lead Alert</title></head>
<body style="margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;background:#F8FAFC;">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 0;">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;border:1px solid #E2E8F0;">
<tr><td style="background:#2563EB;padding:20px 24px;color:#fff;font-size:18px;font-weight:bold;">
New Lead Alert
</td></tr>
<tr><td style="padding:24px;">
<p style="margin:0 0 16px;color:#334155;font-size:14px;">You have a new lead from your Draw-to-Quote estimator.</p>
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F8FAFC;border-radius:8px;padding:16px;margin-bottom:16px;">
<tr><td style="padding:4px 0;color:#94A3B8;font-size:12px;width:120px;">Name</td><td style="padding:4px 0;color:#0F172A;font-size:13px;font-weight:bold;">John Smith</td></tr>
<tr><td style="padding:4px 0;color:#94A3B8;font-size:12px;">Email</td><td style="padding:4px 0;color:#0F172A;font-size:13px;">john@example.com</td></tr>
<tr><td style="padding:4px 0;color:#94A3B8;font-size:12px;">Phone</td><td style="padding:4px 0;color:#0F172A;font-size:13px;">(555) 123-4567</td></tr>
<tr><td style="padding:4px 0;color:#94A3B8;font-size:12px;">Address</td><td style="padding:4px 0;color:#0F172A;font-size:13px;">123 Main St, Los Angeles, CA 90210</td></tr>
<tr><td style="padding:4px 0;color:#94A3B8;font-size:12px;">Trade</td><td style="padding:4px 0;color:#0F172A;font-size:13px;">Concrete</td></tr>
<tr><td style="padding:4px 0;color:#94A3B8;font-size:12px;">Material</td><td style="padding:4px 0;color:#0F172A;font-size:13px;">Stamped Concrete</td></tr>
<tr><td style="padding:4px 0;color:#94A3B8;font-size:12px;">Measurement</td><td style="padding:4px 0;color:#0F172A;font-size:13px;">1,250 sq ft</td></tr>
<tr><td style="padding:4px 0;color:#94A3B8;font-size:12px;">Add-ons</td><td style="padding:4px 0;color:#0F172A;font-size:13px;">Wire Mesh, Premium Sealant</td></tr>
</table>
<div style="background:#DCFCE7;border:1px solid #BBF7D0;border-radius:8px;padding:16px;text-align:center;margin-bottom:20px;">
<p style="margin:0 0 4px;color:#15803D;font-size:12px;font-weight:bold;">ESTIMATE RANGE</p>
<p style="margin:0;color:#15803D;font-size:22px;font-weight:bold;">$14,200 — $17,800</p>
</div>
<a href="#" style="display:inline-block;background:#2563EB;color:#fff;text-decoration:none;padding:12px 24px;border-radius:6px;font-size:14px;font-weight:bold;">View in Dashboard</a>
</td></tr>
<tr><td style="padding:16px 24px;border-top:1px solid #E2E8F0;color:#94A3B8;font-size:11px;text-align:center;">
Sent by Draw-to-Quote &middot; <a href="#" style="color:#2563EB;">Unsubscribe</a>
</td></tr>
</table>
</td></tr></table>
</body></html>`,
  },
  {
    id: 'tpl_homeowner_confirmation',
    name: 'Homeowner Confirmation',
    subject: 'Your {{lead.trade}} Estimate from Premier Construction Co.',
    recipient: 'Homeowner',
    body_html: `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>Your Estimate</title></head>
<body style="margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;background:#F8FAFC;">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 0;">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;border:1px solid #E2E8F0;">
<tr><td style="background:#0F172A;padding:20px 24px;color:#fff;font-size:18px;font-weight:bold;text-align:center;">
Premier Construction Co.
</td></tr>
<tr><td style="padding:24px;text-align:center;">
<p style="margin:0 0 8px;color:#0F172A;font-size:20px;font-weight:bold;">Thank you, John!</p>
<p style="margin:0 0 24px;color:#64748B;font-size:14px;">Here is your estimate for <strong>Stamped Concrete</strong>.</p>
<div style="background:#F8FAFC;border-radius:8px;padding:20px;margin-bottom:20px;text-align:center;">
<p style="margin:0 0 4px;color:#94A3B8;font-size:12px;font-weight:bold;text-transform:uppercase;letter-spacing:0.5px;">Estimated Range</p>
<p style="margin:0 0 4px;color:#2563EB;font-size:28px;font-weight:bold;">$14,200 — $17,800</p>
<p style="margin:0;color:#94A3B8;font-size:12px;">Based on 1,250 sq ft + selected add-ons</p>
</div>
<table width="100%" cellpadding="0" cellspacing="0" style="text-align:left;margin-bottom:20px;">
<tr><td style="padding:4px 0;color:#94A3B8;font-size:12px;width:140px;">Project</td><td style="padding:4px 0;color:#0F172A;font-size:13px;">Stamped Concrete</td></tr>
<tr><td style="padding:4px 0;color:#94A3B8;font-size:12px;">Area</td><td style="padding:4px 0;color:#0F172A;font-size:13px;">1,250 sq ft</td></tr>
<tr><td style="padding:4px 0;color:#94A3B8;font-size:12px;">Add-ons</td><td style="padding:4px 0;color:#0F172A;font-size:13px;">Wire Mesh, Premium Sealant</td></tr>
</table>
<div style="background:#EFF6FF;border:1px solid #BFDBFE;border-radius:8px;padding:16px;margin-bottom:20px;">
<p style="margin:0;color:#1D4ED8;font-size:13px;text-align:center;">A contractor will contact you within <strong>24 hours</strong> to discuss next steps.</p>
</div>
<p style="margin:0;color:#94A3B8;font-size:12px;text-align:center;">Questions? Reply to this email or call us at (512) 555-0100.</p>
</td></tr>
<tr><td style="padding:16px 24px;border-top:1px solid #E2E8F0;color:#94A3B8;font-size:11px;text-align:center;">
Powered by <a href="#" style="color:#2563EB;text-decoration:none;">Draw-to-Quote</a>
</td></tr>
</table>
</td></tr></table>
</body></html>`,
  },
]

export interface SMSTemplate {
  id: string
  name: string
  body: string
}

export const mockSMSTemplate: SMSTemplate = {
  id: 'sms_lead_alert',
  name: 'Lead Alert SMS',
  body: 'New lead: {{name}} | {{trade}} | ${{low}}-${{high}} | {{address}}',
}

export const sampleLeadPayload = {
  event: 'lead.new',
  timestamp: '2025-06-27T14:30:00Z',
  lead: {
    id: 'lead_12345',
    name: 'John Smith',
    email: 'john@example.com',
    phone: '(555) 123-4567',
    address: '123 Main St, Los Angeles, CA 90210',
    trade: 'concrete',
    measurement: 1250,
    measurement_unit: 'sq ft',
    material: 'Stamped Concrete',
    addons: ['Wire Mesh', 'Premium Sealant'],
    estimate_low: 14200,
    estimate_high: 17800,
    language: 'en',
    source_url: 'https://contractor-site.com/concrete-estimator',
  },
}
