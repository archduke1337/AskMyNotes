// ─── Appwrite Client (Browser / Client‑side) ──────────────────────────
// Used ONLY for authentication (session management).
// All DB / Storage calls go through Next.js API routes → server SDK.

import { Client, Account } from "appwrite";
import { APPWRITE_CONFIG } from "@/lib/appwrite/config";

const client = new Client()
  .setEndpoint(APPWRITE_CONFIG.endpoint)
  .setProject(APPWRITE_CONFIG.projectId);

// Only Account is exposed to the browser
export const account = new Account(client);

export default client;
