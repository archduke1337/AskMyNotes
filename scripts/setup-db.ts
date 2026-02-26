// ─── Appwrite Database Setup Script ────────────────────────────────────
// Run once:  npx tsx scripts/setup-db.ts
//
// Creates the database, all collections with attributes, and the
// storage bucket exactly matching the AskMyNotes schema.
//
// Requirements:
//   1. Set APPWRITE_API_KEY in your environment (server‑side key).
//   2. Fill NEXT_PUBLIC_APPWRITE_ENDPOINT and NEXT_PUBLIC_APPWRITE_PROJECT_ID
//      in .env.local (or export them).
// ──────────────────────────────────────────────────────────────────────

import { Client, Databases, Storage, ID } from "node-appwrite";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const endpoint =
  process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1";
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "";
const apiKey = process.env.APPWRITE_API_KEY || "";

if (!projectId || !apiKey) {
  console.error(
    "❌  Missing NEXT_PUBLIC_APPWRITE_PROJECT_ID or APPWRITE_API_KEY"
  );
  process.exit(1);
}

const client = new Client()
  .setEndpoint(endpoint)
  .setProject(projectId)
  .setKey(apiKey);

const db = new Databases(client);
const stg = new Storage(client);

// ─── IDs ──────────────────────────────────────────────────────────────
const DATABASE_ID = "askmynotes_db";

const COLLECTIONS = {
  subjects: "subjects",
  noteFiles: "note_files",
  noteChunks: "note_chunks",
  chatHistory: "chat_history",
  studyMode: "study_mode",
} as const;

const BUCKET_ID = "notes_files";

// ─── Helpers ──────────────────────────────────────────────────────────
async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function safeCreate<T>(label: string, fn: () => Promise<T>): Promise<T | null> {
  try {
    const result = await fn();
    console.log(`  ✅  ${label}`);
    return result;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("already exists") || msg.includes("Attribute already")) {
      console.log(`  ⏩  ${label} (already exists)`);
      return null;
    }
    throw err;
  }
}

// ─── Database ─────────────────────────────────────────────────────────
async function createDatabase() {
  console.log("\n📦 Creating database…");
  await safeCreate("Database", () =>
    db.create(DATABASE_ID, "AskMyNotes")
  );
}

// ─── Collection factory ───────────────────────────────────────────────
async function createCollection(id: string, name: string) {
  await safeCreate(`Collection: ${name}`, () =>
    db.createCollection(DATABASE_ID, id, name)
  );
}

async function strAttr(colId: string, key: string, size = 255, required = true) {
  await safeCreate(`  attr ${colId}.${key}`, () =>
    db.createStringAttribute(DATABASE_ID, colId, key, size, required)
  );
}

async function datetimeAttr(colId: string, key: string, required = true) {
  await safeCreate(`  attr ${colId}.${key}`, () =>
    db.createDatetimeAttribute(DATABASE_ID, colId, key, required)
  );
}

// Note: Appwrite doesn't have a native float-array attribute type.
// Embeddings are stored as a JSON string in a large string attribute.

// ─── Subjects ─────────────────────────────────────────────────────────
async function setupSubjects() {
  const id = COLLECTIONS.subjects;
  console.log("\n📚 Setting up subjects…");
  await createCollection(id, "Subjects");
  await strAttr(id, "userId");
  await strAttr(id, "name");
  await datetimeAttr(id, "createdAt");
  await sleep(2000); // wait for attributes to settle
}

// ─── NoteFiles ────────────────────────────────────────────────────────
async function setupNoteFiles() {
  const id = COLLECTIONS.noteFiles;
  console.log("\n📄 Setting up note_files…");
  await createCollection(id, "Note Files");
  await strAttr(id, "subjectId");
  await strAttr(id, "userId");
  await strAttr(id, "fileName");
  await strAttr(id, "fileType", 10);
  await strAttr(id, "storageFileId");
  await datetimeAttr(id, "uploadedAt");
  await sleep(2000);
}

// ─── NoteChunks ───────────────────────────────────────────────────────
async function setupNoteChunks() {
  const id = COLLECTIONS.noteChunks;
  console.log("\n🧩 Setting up note_chunks…");
  await createCollection(id, "Note Chunks");
  await strAttr(id, "subjectId");
  await strAttr(id, "fileId");
  await strAttr(id, "userId");
  await strAttr(id, "chunkText", 10000);
  await strAttr(id, "reference", 500);
  // Appwrite doesn't have a native float‑array attribute in all plans.
  // We store embeddings as a JSON string alternatively:
  await strAttr(id, "embedding", 100000);
  await datetimeAttr(id, "createdAt");
  await sleep(2000);
}

// ─── ChatHistory ──────────────────────────────────────────────────────
async function setupChatHistory() {
  const id = COLLECTIONS.chatHistory;
  console.log("\n💬 Setting up chat_history…");
  await createCollection(id, "Chat History");
  await strAttr(id, "subjectId");
  await strAttr(id, "userId");
  await strAttr(id, "question", 5000);
  await strAttr(id, "answer", 10000, false);
  await strAttr(id, "confidence", 10, false);
  await strAttr(id, "citations", 10000, false); // JSON string of Citation[]
  await datetimeAttr(id, "createdAt");
  await sleep(2000);
}

// ─── StudyMode ────────────────────────────────────────────────────────
async function setupStudyMode() {
  const id = COLLECTIONS.studyMode;
  console.log("\n🎓 Setting up study_mode…");
  await createCollection(id, "Study Mode");
  await strAttr(id, "subjectId");
  await strAttr(id, "userId");
  await strAttr(id, "type", 10);
  await strAttr(id, "content", 10000); // JSON string
  await strAttr(id, "citations", 10000); // JSON string of Citation[]
  await datetimeAttr(id, "createdAt");
  await sleep(2000);
}

// ─── Storage Bucket ───────────────────────────────────────────────────
async function setupBucket() {
  console.log("\n🗄️  Setting up storage bucket…");
  await safeCreate("Bucket: notes_files", () =>
    stg.createBucket(
      BUCKET_ID,
      "Notes Files",
      undefined, // permissions (set per file)
      false,     // fileSecurity
      true,      // enabled
      50 * 1024 * 1024, // 50 MB max file size
      ["pdf", "txt"],   // allowed extensions
    )
  );
}

// ─── Main ─────────────────────────────────────────────────────────────
async function main() {
  console.log("🚀 AskMyNotes — Appwrite Database Setup");
  console.log(`   Endpoint : ${endpoint}`);
  console.log(`   Project  : ${projectId}`);

  await createDatabase();
  await setupSubjects();
  await setupNoteFiles();
  await setupNoteChunks();
  await setupChatHistory();
  await setupStudyMode();
  await setupBucket();

  console.log("\n────────────────────────────────────────");
  console.log("✅ Setup complete!");
  console.log(`   Database ID : ${DATABASE_ID}`);
  console.log(`   Bucket ID   : ${BUCKET_ID}`);
  console.log("   Add these to your .env.local:");
  console.log(`     NEXT_PUBLIC_APPWRITE_DATABASE_ID=${DATABASE_ID}`);
  console.log(`     NEXT_PUBLIC_APPWRITE_BUCKET_ID=${BUCKET_ID}`);
  console.log("────────────────────────────────────────\n");
}

main().catch((err) => {
  console.error("❌ Setup failed:", err);
  process.exit(1);
});
