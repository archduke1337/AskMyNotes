// ─── GET & POST /api/chunks ─────────────────────────────────────────────
// note_chunks — the RAG backbone.
import { NextRequest, NextResponse } from "next/server";
import { databases } from "@/lib/appwrite/server";
import { DATABASE_ID, COLLECTION_IDS } from "@/lib/appwrite/config";
import { ID, Query } from "node-appwrite";
import { validateSession, unauthorized } from "@/lib/auth/validateSession";
import { checkRateLimit, rateLimited, RATE_LIMITS } from "@/lib/rateLimit";

const col = COLLECTION_IDS.noteChunks;

// ── GET — list chunks for a subject (or a specific file) ──────────────
export async function GET(req: NextRequest) {
  try {
    const session = await validateSession(req);
    if (!session) return unauthorized();

    const rl = checkRateLimit(`chunks:get:${session.userId}`, RATE_LIMITS.general);
    if (!rl.allowed) return rateLimited(rl.resetMs);

    const subjectId = req.nextUrl.searchParams.get("subjectId");
    const fileId = req.nextUrl.searchParams.get("fileId");

    const queries = [Query.equal("userId", session.userId)];
    if (subjectId) queries.push(Query.equal("subjectId", subjectId));
    if (fileId) queries.push(Query.equal("fileId", fileId));
    queries.push(Query.limit(250));

    const res = await databases.listDocuments(DATABASE_ID, col, queries);
    return NextResponse.json(res.documents);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ── POST — create one or many chunks (batch) ─────────────────────────
export async function POST(req: NextRequest) {
  try {
    const session = await validateSession(req);
    if (!session) return unauthorized();

    const rl = checkRateLimit(`chunks:post:${session.userId}`, RATE_LIMITS.general);
    if (!rl.allowed) return rateLimited(rl.resetMs);

    const { chunks } = (await req.json()) as {
      chunks: {
        subjectId: string;
        fileId: string;
        chunkText: string;
        reference: string;
        embedding: string;
      }[];
    };

    if (!chunks?.length) {
      return NextResponse.json(
        { error: "chunks[] are required" },
        { status: 400 }
      );
    }

    const results = await Promise.all(
      chunks.map((c) =>
        databases.createDocument(DATABASE_ID, col, ID.unique(), {
          ...c,
          userId: session.userId,
        })
      )
    );

    return NextResponse.json(results, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
