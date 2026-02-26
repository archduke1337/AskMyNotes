// ─── PATCH & DELETE /api/subjects/[id] ─────────────────────────
// DELETE now performs cascading cleanup of related data.
import { NextRequest, NextResponse } from "next/server";
import { databases, storage } from "@/lib/appwrite/server";
import { DATABASE_ID, COLLECTION_IDS, BUCKET_ID } from "@/lib/appwrite/config";
import { Query } from "node-appwrite";

const col = COLLECTION_IDS.subjects;

type Params = { params: Promise<{ id: string }> };

// ── PATCH — rename a subject ──────────────────────────────────────────
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const { name } = await req.json();

    if (!name) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }

    const updated = await databases.updateDocument(DATABASE_ID, col, id, { name });
    return NextResponse.json(updated);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ── DELETE — remove a subject + cascading cleanup ─────────────────────
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    // 1. Delete all note_files + their storage blobs
    const files = await databases.listDocuments(DATABASE_ID, COLLECTION_IDS.noteFiles, [
      Query.equal("subjectId", id),
      Query.limit(500),
    ]);
    for (const file of files.documents) {
      try {
        await storage.deleteFile(BUCKET_ID, file.storageFileId as string);
      } catch { /* blob may already be gone */ }
      await databases.deleteDocument(DATABASE_ID, COLLECTION_IDS.noteFiles, file.$id);
    }

    // 2. Delete all note_chunks
    const chunks = await databases.listDocuments(DATABASE_ID, COLLECTION_IDS.noteChunks, [
      Query.equal("subjectId", id),
      Query.limit(500),
    ]);
    await Promise.all(
      chunks.documents.map((d) => databases.deleteDocument(DATABASE_ID, COLLECTION_IDS.noteChunks, d.$id))
    );

    // 3. Delete all chat_history
    const chats = await databases.listDocuments(DATABASE_ID, COLLECTION_IDS.chatHistory, [
      Query.equal("subjectId", id),
      Query.limit(500),
    ]);
    await Promise.all(
      chats.documents.map((d) => databases.deleteDocument(DATABASE_ID, COLLECTION_IDS.chatHistory, d.$id))
    );

    // 4. Delete all study_mode items
    const study = await databases.listDocuments(DATABASE_ID, COLLECTION_IDS.studyMode, [
      Query.equal("subjectId", id),
      Query.limit(500),
    ]);
    await Promise.all(
      study.documents.map((d) => databases.deleteDocument(DATABASE_ID, COLLECTION_IDS.studyMode, d.$id))
    );

    // 5. Finally delete the subject itself
    await databases.deleteDocument(DATABASE_ID, col, id);

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
