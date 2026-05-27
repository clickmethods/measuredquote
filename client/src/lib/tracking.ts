import { apiRequest } from "./queryClient";

/**
 * Lightweight client-side event tracker.
 *
 * Persists nothing in the browser (sandbox blocks localStorage); the session id
 * lives in module state so it survives in-app navigation but resets on full reload.
 * Calls fire-and-forget — never throws, never blocks UI.
 */

function makeSessionId(): string {
  return (
    "s_" +
    Math.random().toString(36).slice(2, 10) +
    Date.now().toString(36).slice(-6)
  );
}

let sessionId = makeSessionId();

export function getSessionId(): string {
  return sessionId;
}

export function resetSession(): void {
  sessionId = makeSessionId();
}

export type WidgetEventType =
  | "widget_started"
  | "language_selected"
  | "lead_form_completed"
  | "measurement_completed"
  | "options_completed"
  | "estimate_viewed"
  | "lead_submitted"
  | "lead_booked";

export interface TrackOpts {
  trade?: string;
  step?: string;
  language?: string;
  sourceUrl?: string;
  tenant?: string;
  metadata?: Record<string, unknown>;
}

export function trackEvent(eventType: WidgetEventType, opts: TrackOpts = {}): void {
  // Best-effort source URL
  const sourceUrl =
    opts.sourceUrl ||
    (typeof window !== "undefined" ? window.location.host || "demo.measuredquote.com" : "demo.measuredquote.com");

  const body = {
    sessionId,
    eventType,
    trade: opts.trade ?? "",
    step: opts.step ?? "",
    language: opts.language ?? "en",
    sourceUrl,
    tenant: opts.tenant ?? "default",
    metadataJson: JSON.stringify(opts.metadata ?? {}),
  };

  // Fire and forget. Swallow errors — tracking must never break the widget.
  apiRequest("POST", "/api/events", body).catch(() => {
    /* ignore */
  });
}
