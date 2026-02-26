// ─── Server-side session validation ───────────────────────────────────
// Validates an Appwrite JWT from the Authorization header.
// Creates a per-request client scoped to the caller's session
// (does NOT use the admin API key).

import { Client, Account } from "node-appwrite";
import { NextRequest, NextResponse } from "next/server";

export interface AuthSession {
  userId: string;
  email: string;
  name: string;
}

/**
 * Validate the JWT in the incoming request's Authorization header.
 * Returns the authenticated user's info, or `null` if invalid / missing.
 */
export async function validateSession(
  req: NextRequest
): Promise<AuthSession | null> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const jwt = authHeader.slice(7);
  if (!jwt) return null;

  const client = new Client()
    .setEndpoint(
      process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT ||
        "https://cloud.appwrite.io/v1"
    )
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "")
    .setJWT(jwt);

  try {
    const acc = new Account(client);
    const user = await acc.get();
    return { userId: user.$id, email: user.email, name: user.name };
  } catch {
    return null;
  }
}

/** Shorthand — returns a 401 JSON response. */
export function unauthorized(message = "Unauthorized") {
  return NextResponse.json({ error: message }, { status: 401 });
}
