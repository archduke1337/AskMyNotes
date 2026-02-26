// ─── Appwrite Server Client ───────────────────────────────────────────
// Used ONLY in API routes / server‑side code (app/api/*).
// Never import this file from client components.
//
// Uses `node-appwrite` (server SDK) + the secret APPWRITE_API_KEY
// which must never be exposed to the browser.

import { Client, Databases, Storage, Users } from "node-appwrite";

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1")
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "")
  .setKey(process.env.APPWRITE_API_KEY || "");

export const databases = new Databases(client);
export const storage = new Storage(client);
export const users = new Users(client);

export default client;
