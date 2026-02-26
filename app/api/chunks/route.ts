// ─── GET & POST /api/chunks ─────────────────────────────────────────────
// note_chunks — the RAG backbone.
import { NextRequest, NextResponse } from "next/server";
import { databases } from "@/lib/appwrite/server";
import { DATABASE_ID, COLLECTION_IDS } from "@/lib/appwrite/config";
import { ID, Query } from "node-appwrite";

const col = COLLECTION_IDS.noteChunks;

// ── GET — list chunks for a subject (or a specific file) ──────────────
export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");
    const subjectId = req.nextUrl.searchParams.get("subjectId");
    const fileId = req.nextUrl.searchParams.get("fileId");

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const queries = [Query.equal("userId", userId)];
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
    const { userId, chunks } = (await req.json()) as {
      userId: string;
      chunks: {
        subjectId: string;
        fileId: string;
        chunkText: string;
        reference: string;
        embedding: string; // JSON‑stringified float array
      }[];
    };

    if (!userId || !chunks?.length) {
      return NextResponse.json(
        { error: "userId and chunks[] are required" },
        { status: 400 }
      );
    }

    const results = await Promise.all(
      chunks.map((c) =>
        databases.createDocument(DATABASE_ID, col, ID.unique(), {
          ...c,
          userId,
          createdAt: new Date().toISOString(),
        })
      )
    );

    return NextResponse.json(results, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
