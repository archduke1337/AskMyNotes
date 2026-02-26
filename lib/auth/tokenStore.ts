// ─── Client‑side JWT token store ──────────────────────────────────────
// A simple module‑level store so that the `lib/api.ts` fetch wrapper
// can attach the Authorization header without needing React context.
//
// AuthContext sets the token after login / refresh;
// the api helper reads it before every request.

let _token: string | null = null;

/** Called by AuthContext after obtaining a JWT. */
export function setAuthToken(token: string | null) {
  _token = token;
}

/** Called by the api fetch wrapper before every request. */
export function getAuthToken(): string | null {
  return _token;
}
