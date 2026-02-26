// ─── DELETE /api/study/[id] ─────────────────────────────────────────────
import { NextRequest, NextResponse } from "next/server";
import { databases } from "@/lib/appwrite/server";
import { DATABASE_ID, COLLECTION_IDS } from "@/lib/appwrite/config";

const col = COLLECTION_IDS.studyMode;

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    await databases.deleteDocument(DATABASE_ID, col, id);
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
