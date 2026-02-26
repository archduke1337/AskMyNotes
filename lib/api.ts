// ─── Client‑side API helper ────────────────────────────────────────────
// All frontend components call these functions.
// They hit Next.js API routes → Appwrite Server SDK.
// No Appwrite SDK calls happen directly from the browser (except Auth).

import type { Subject, NoteFile, NoteChunk, ChatMessage, StudyModeItem, Citation } from "@/lib/types";

// ─── Generic fetch wrapper ────────────────────────────────────────────
async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `API error ${res.status}`);
  }
  return res.json();
}

// ═══════════════════════════════════════════════════════════════════════
// SUBJECTS
// ═══════════════════════════════════════════════════════════════════════

export async function fetchSubjects(userId: string): Promise<Subject[]> {
  return api(`/api/subjects?userId=${encodeURIComponent(userId)}`);
}

export async function createSubject(userId: string, name: string): Promise<Subject> {
  return api("/api/subjects", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, name }),
  });
}

export async function updateSubject(subjectId: string, name: string): Promise<Subject> {
  return api(`/api/subjects/${subjectId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
}

export async function deleteSubject(subjectId: string): Promise<void> {
  await api(`/api/subjects/${subjectId}`, { method: "DELETE" });
}

// ═══════════════════════════════════════════════════════════════════════
// NOTE FILES (Upload)
// ═══════════════════════════════════════════════════════════════════════

export async function fetchNoteFiles(userId: string, subjectId: string): Promise<NoteFile[]> {
  return api(
    `/api/upload?userId=${encodeURIComponent(userId)}&subjectId=${encodeURIComponent(subjectId)}`
  );
}

export async function uploadNoteFile(
  userId: string,
  subjectId: string,
  file: File
): Promise<NoteFile> {
  const form = new FormData();
  form.append("file", file);
  form.append("userId", userId);
  form.append("subjectId", subjectId);

  return api("/api/upload", { method: "POST", body: form });
}

export async function deleteNoteFile(fileId: string): Promise<void> {
  await api(`/api/upload/${fileId}`, { method: "DELETE" });
}

// ═══════════════════════════════════════════════════════════════════════
// NOTE CHUNKS
// ═══════════════════════════════════════════════════════════════════════

export async function fetchNoteChunks(
  userId: string,
  subjectId: string,
  fileId?: string
): Promise<NoteChunk[]> {
  let url = `/api/chunks?userId=${encodeURIComponent(userId)}&subjectId=${encodeURIComponent(subjectId)}`;
  if (fileId) url += `&fileId=${encodeURIComponent(fileId)}`;
  return api(url);
}

export async function createNoteChunks(
  userId: string,
  chunks: {
    subjectId: string;
    fileId: string;
    chunkText: string;
    reference: string;
    embedding: string;
  }[]
): Promise<NoteChunk[]> {
  return api("/api/chunks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, chunks }),
  });
}

export async function deleteNoteChunk(chunkId: string): Promise<void> {
  await api(`/api/chunks/${chunkId}`, { method: "DELETE" });
}

// ═══════════════════════════════════════════════════════════════════════
// CHAT HISTORY
// ═══════════════════════════════════════════════════════════════════════

export async function fetchChatMessages(
  userId: string,
  subjectId: string
): Promise<ChatMessage[]> {
  return api(
    `/api/chat?userId=${encodeURIComponent(userId)}&subjectId=${encodeURIComponent(subjectId)}`
  );
}

export async function sendChatMessage(data: {
  userId: string;
  subjectId: string;
  question: string;
  answer?: string;
  confidence?: "High" | "Medium" | "Low";
  citations?: Citation[];
}): Promise<ChatMessage> {
  return api("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function clearChatHistory(userId: string, subjectId: string): Promise<void> {
  await api(
    `/api/chat?userId=${encodeURIComponent(userId)}&subjectId=${encodeURIComponent(subjectId)}`,
    { method: "DELETE" }
  );
}

// ═══════════════════════════════════════════════════════════════════════
// STUDY MODE
// ═══════════════════════════════════════════════════════════════════════

export async function fetchStudyItems(
  userId: string,
  subjectId: string,
  type?: "mcq" | "short"
): Promise<StudyModeItem[]> {
  let url = `/api/study?userId=${encodeURIComponent(userId)}&subjectId=${encodeURIComponent(subjectId)}`;
  if (type) url += `&type=${type}`;
  return api(url);
}

export async function createStudyItem(data: {
  userId: string;
  subjectId: string;
  type: "mcq" | "short";
  content: Record<string, unknown>;
  citations?: Citation[];
}): Promise<StudyModeItem> {
  return api("/api/study", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function deleteStudyItem(itemId: string): Promise<void> {
  await api(`/api/study/${itemId}`, { method: "DELETE" });
}
