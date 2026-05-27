// Minimal shared response helpers for Netlify Functions.
//
// All MeasuredQuote functions use these so we keep JSON shape, CORS, and
// status codes consistent. We avoid `Buffer`/`Readable` so the file works
// uniformly on the Lambda and Edge runtimes.

import type { HandlerResponse } from "@netlify/functions";

const DEFAULT_HEADERS: Record<string, string> = {
  "Content-Type": "application/json; charset=utf-8",
  // Adjust origin to your app URL in production via env var APP_URL.
  "Access-Control-Allow-Origin": process.env.APP_URL || "*",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, x-measuredquote-tenant, x-measuredquote-widget-token",
  Vary: "Origin",
};

export function ok<T>(body: T, init: { headers?: Record<string, string> } = {}): HandlerResponse {
  return {
    statusCode: 200,
    headers: { ...DEFAULT_HEADERS, ...(init.headers || {}) },
    body: JSON.stringify(body),
  };
}

export function created<T>(body: T): HandlerResponse {
  return { statusCode: 201, headers: DEFAULT_HEADERS, body: JSON.stringify(body) };
}

export function noContent(): HandlerResponse {
  return { statusCode: 204, headers: DEFAULT_HEADERS, body: "" };
}

export function badRequest(message: string, details?: unknown): HandlerResponse {
  return {
    statusCode: 400,
    headers: DEFAULT_HEADERS,
    body: JSON.stringify({ error: "bad_request", message, details }),
  };
}

export function unauthorized(message = "unauthorized"): HandlerResponse {
  return {
    statusCode: 401,
    headers: DEFAULT_HEADERS,
    body: JSON.stringify({ error: "unauthorized", message }),
  };
}

export function forbidden(message = "forbidden"): HandlerResponse {
  return {
    statusCode: 403,
    headers: DEFAULT_HEADERS,
    body: JSON.stringify({ error: "forbidden", message }),
  };
}

export function notFound(message = "not found"): HandlerResponse {
  return {
    statusCode: 404,
    headers: DEFAULT_HEADERS,
    body: JSON.stringify({ error: "not_found", message }),
  };
}

export function methodNotAllowed(allowed: string[]): HandlerResponse {
  return {
    statusCode: 405,
    headers: { ...DEFAULT_HEADERS, Allow: allowed.join(", ") },
    body: JSON.stringify({ error: "method_not_allowed", allowed }),
  };
}

export function serverError(err: unknown): HandlerResponse {
  // Intentionally do not leak the error body in production.
  const message =
    process.env.NODE_ENV === "production"
      ? "internal server error"
      : err instanceof Error
      ? err.message
      : String(err);
  return {
    statusCode: 500,
    headers: DEFAULT_HEADERS,
    body: JSON.stringify({ error: "internal_error", message }),
  };
}

export function preflight(): HandlerResponse {
  return { statusCode: 204, headers: DEFAULT_HEADERS, body: "" };
}
