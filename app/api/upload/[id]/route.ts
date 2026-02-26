// ─── DELETE /api/upload/[id] ────────────────────────────────────────────
// Deletes a note file record AND its storage blob.
import { NextRequest, NextResponse } from "next/server";
import { databases, storage } from "@/lib/appwrite/server";
import { DATABASE_ID, COLLECTION_IDS, BUCKET_ID } from "@/lib/appwrite/config";
import { validateSession, unauthorized } from "@/lib/auth/validateSession";
import { checkRateLimit, rateLimited, RATE_LIMITS } from "@/lib/rateLimit";

const col = COLLECTION_IDS.noteFiles;

type Params = { params: Promise<{ id: string }> };

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const session = await validateSession(req);
    if (!session) return unauthorized();

    const rl = checkRateLimit(`upload:del:${session.userId}`, RATE_LIMITS.general);
    if (!rl.allowed) return rateLimited(rl.resetMs);

    const { id } = await params;

    // Fetch the doc to get storageFileId + verify ownership
    const doc = await databases.getDocument(DATABASE_ID, col, id);
    if (doc.userId !== session.userId) return unauthorized("Forbidden");

    const storageFileId = doc.storageFileId as string;

    // Delete storage blob (swallow error if already gone)
    try {
      await storage.deleteFile(BUCKET_ID, storageFileId);
    } catch {
      /* file may already be removed */
    }

    // Delete metadata document
    await databases.deleteDocument(DATABASE_ID, col, id);

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
