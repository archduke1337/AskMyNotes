// ─── In-memory sliding window rate limiter ────────────────────────────
// Suitable for single-instance deployments.  For multi-instance / edge,
// swap with a Redis-backed implementation.

import { NextResponse } from "next/server";

// ── Per-key timestamp store ───────────────────────────────────────────
const store = new Map<string, number[]>();

export interface RateLimitConfig {
  /** Maximum number of requests allowed within the window. */
  maxRequests: number;
  /** Time window in milliseconds. */
  windowMs: number;
}

// ── Preset tiers ──────────────────────────────────────────────────────
export const RATE_LIMITS = {
  /** Standard CRUD endpoints — 30 req / 60 s */
  general: { maxRequests: 30, windowMs: 60_000 } satisfies RateLimitConfig,
  /** AI / LLM endpoints — 10 req / 60 s */
  ai: { maxRequests: 10, windowMs: 60_000 } satisfies RateLimitConfig,
  /** Auth actions (login / register) — 5 req / 60 s */
  auth: { maxRequests: 5, windowMs: 60_000 } satisfies RateLimitConfig,
} as const;

// ── Core check ────────────────────────────────────────────────────────
export function checkRateLimit(
  key: string,
  config: RateLimitConfig
): { allowed: boolean; remaining: number; resetMs: number } {
  const now = Date.now();
  const windowStart = now - config.windowMs;

  // Keep only timestamps inside the current window
  const timestamps = (store.get(key) || []).filter((t) => t > windowStart);

  if (timestamps.length >= config.maxRequests) {
    const resetMs = timestamps[0] + config.windowMs - now;
    return { allowed: false, remaining: 0, resetMs };
  }

  timestamps.push(now);
  store.set(key, timestamps);

  return {
    allowed: true,
    remaining: config.maxRequests - timestamps.length,
    resetMs: config.windowMs,
  };
}

// ── Convenience: returns a 429 response when limit exceeded ───────────
export function rateLimited(resetMs: number) {
  return NextResponse.json(
    { error: "Too many requests. Please try again later." },
    {
      status: 429,
      headers: { "Retry-After": String(Math.ceil(resetMs / 1000)) },
    }
  );
}

// ── Periodic cleanup of stale keys (every 2 min) ─────────────────────
if (typeof globalThis !== "undefined") {
  const CLEANUP_INTERVAL = 2 * 60_000;
  const cleanup = () => {
    const now = Date.now();
    for (const [key, timestamps] of store.entries()) {
      const live = timestamps.filter((t) => t > now - 120_000);
      if (live.length === 0) store.delete(key);
      else store.set(key, live);
    }
  };
  // Use globalThis to avoid duplicate intervals during hot-reload
  const g = globalThis as unknown as { __rateLimit_cleanup?: NodeJS.Timeout };
  if (!g.__rateLimit_cleanup) {
    g.__rateLimit_cleanup = setInterval(cleanup, CLEANUP_INTERVAL);
  }
}
