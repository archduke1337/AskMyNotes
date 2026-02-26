// ─── Appwrite Configuration ───────────────────────────────────────────
// Fill in your Appwrite project details here.
// All IDs are centralised so every service file references the same constants.

export const APPWRITE_CONFIG = {
  endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1",
  projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "",
} as const;

// ─── Database ─────────────────────────────────────────────────────────
export const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "";

// ─── Collection IDs ───────────────────────────────────────────────────
export const COLLECTION_IDS = {
  subjects: process.env.NEXT_PUBLIC_COLLECTION_SUBJECTS || "subjects",
  noteFiles: process.env.NEXT_PUBLIC_COLLECTION_NOTE_FILES || "note_files",
  noteChunks: process.env.NEXT_PUBLIC_COLLECTION_NOTE_CHUNKS || "note_chunks",
  chatHistory: process.env.NEXT_PUBLIC_COLLECTION_CHAT_HISTORY || "chat_history",
  studyMode: process.env.NEXT_PUBLIC_COLLECTION_STUDY_MODE || "study_mode",
} as const;

// ─── Storage Bucket ───────────────────────────────────────────────────
export const BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID || "notes_files";

// ─── App Constants ────────────────────────────────────────────────────
export const MAX_SUBJECTS = 3;
export const ALLOWED_FILE_TYPES = ["application/pdf", "text/plain"] as const;
export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB
