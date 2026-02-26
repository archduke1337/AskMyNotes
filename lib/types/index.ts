// ─── AskMyNotes — Appwrite Document Types ─────────────────────────────
// These mirror the Appwrite collections defined in the schema.
// Appwrite auto‑generates `$id`, `$createdAt`, `$updatedAt`, `$permissions`.

import { Models } from "appwrite";

// ─── Base Document (extends Appwrite's built‑in fields) ───────────────
export type AppwriteDocument = Models.Document;

// ─── Auth User (from Appwrite Auth — not a custom collection) ─────────
export type AuthUser = Models.User<Models.Preferences>;

// ─── 1. Subject ───────────────────────────────────────────────────────
export interface Subject extends AppwriteDocument {
  userId: string;
  name: string;
  createdAt: string; // ISO‑8601 datetime
}

// ─── 2. NoteFile ──────────────────────────────────────────────────────
export interface NoteFile extends AppwriteDocument {
  subjectId: string;
  userId: string;
  fileName: string;
  fileType: "pdf" | "txt";
  storageFileId: string;
  uploadedAt: string; // ISO‑8601 datetime
}

// ─── 3. NoteChunk (RAG backbone) ──────────────────────────────────────
export interface NoteChunk extends AppwriteDocument {
  subjectId: string;
  fileId: string;
  userId: string;
  chunkText: string;
  reference: string; // e.g. "Page 14, Section 3.4"
  embedding: number[]; // vector embedding
  createdAt: string;
}

// ─── 4. ChatMessage ───────────────────────────────────────────────────
export interface ChatMessage extends AppwriteDocument {
  subjectId: string;
  userId: string;
  question: string;
  answer?: string;
  confidence?: "High" | "Medium" | "Low";
  citations?: Citation[];
  createdAt: string;
}

export interface Citation {
  fileId: string;
  fileName: string;
  reference: string; // page / section
  snippet: string;   // evidence text
}

// ─── 5. StudyModeItem ─────────────────────────────────────────────────
export interface StudyModeItem extends AppwriteDocument {
  subjectId: string;
  userId: string;
  type: "mcq" | "short";
  content: MCQContent | ShortAnswerContent;
  citations: Citation[];
  createdAt: string;
}

export interface MCQContent {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface ShortAnswerContent {
  question: string;
  answer: string;
  explanation: string;
}
