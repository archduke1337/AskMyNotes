// ─── DELETE /api/chunks/[id] ────────────────────────────────────────────
import { NextRequest, NextResponse } from "next/server";
import { databases } from "@/lib/appwrite/server";
import { DATABASE_ID, COLLECTION_IDS } from "@/lib/appwrite/config";
import { validateSession, unauthorized } from "@/lib/auth/validateSession";
import { checkRateLimit, rateLimited, RATE_LIMITS } from "@/lib/rateLimit";

const col = COLLECTION_IDS.noteChunks;

type Params = { params: Promise<{ id: string }> };

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const session = await validateSession(req);
    if (!session) return unauthorized();

    const rl = checkRateLimit(`chunks:del:${session.userId}`, RATE_LIMITS.general);
    if (!rl.allowed) return rateLimited(rl.resetMs);

    const { id } = await params;

    // Verify ownership
    const doc = await databases.getDocument(DATABASE_ID, col, id);
    if (doc.userId !== session.userId) return unauthorized("Forbidden");

    await databases.deleteDocument(DATABASE_ID, col, id);
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
