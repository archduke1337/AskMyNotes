// ─── GET & POST /api/chat ───────────────────────────────────────────────
// chat_history — stores Q&A per subject.
import { NextRequest, NextResponse } from "next/server";
import { databases } from "@/lib/appwrite/server";
import { DATABASE_ID, COLLECTION_IDS } from "@/lib/appwrite/config";
import { ID, Query } from "node-appwrite";
import { validateSession, unauthorized } from "@/lib/auth/validateSession";
import { checkRateLimit, rateLimited, RATE_LIMITS } from "@/lib/rateLimit";

const col = COLLECTION_IDS.chatHistory;

// ── GET — list chat messages for a subject ────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const session = await validateSession(req);
    if (!session) return unauthorized();

    const rl = checkRateLimit(`chat:get:${session.userId}`, RATE_LIMITS.general);
    if (!rl.allowed) return rateLimited(rl.resetMs);

    const subjectId = req.nextUrl.searchParams.get("subjectId");

    if (!subjectId) {
      return NextResponse.json(
        { error: "subjectId is required" },
        { status: 400 }
      );
    }

    const res = await databases.listDocuments(DATABASE_ID, col, [
      Query.equal("userId", session.userId),
      Query.equal("subjectId", subjectId),
      Query.orderAsc("$createdAt"),
      Query.limit(100),
    ]);

    return NextResponse.json(res.documents);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ── POST — save a Q&A message ─────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const session = await validateSession(req);
    if (!session) return unauthorized();

    const rl = checkRateLimit(`chat:post:${session.userId}`, RATE_LIMITS.general);
    if (!rl.allowed) return rateLimited(rl.resetMs);

    const { subjectId, question, answer, confidence, citations } =
      await req.json();

    if (!subjectId || !question) {
      return NextResponse.json(
        { error: "subjectId and question are required" },
        { status: 400 }
      );
    }

    const doc = await databases.createDocument(DATABASE_ID, col, ID.unique(), {
      userId: session.userId,
      subjectId,
      question,
      answer: answer ?? null,
      confidence: confidence ?? null,
      citations: citations ? JSON.stringify(citations) : null,
    });

    return NextResponse.json(doc, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ── DELETE — clear all chat for a subject ─────────────────────────────
export async function DELETE(req: NextRequest) {
  try {
    const session = await validateSession(req);
    if (!session) return unauthorized();

    const rl = checkRateLimit(`chat:del:${session.userId}`, RATE_LIMITS.general);
    if (!rl.allowed) return rateLimited(rl.resetMs);

    const subjectId = req.nextUrl.searchParams.get("subjectId");

    if (!subjectId) {
      return NextResponse.json(
        { error: "subjectId is required" },
        { status: 400 }
      );
    }

    const res = await databases.listDocuments(DATABASE_ID, col, [
      Query.equal("userId", session.userId),
      Query.equal("subjectId", subjectId),
      Query.limit(500),
    ]);

    await Promise.all(
      res.documents.map((d) => databases.deleteDocument(DATABASE_ID, col, d.$id))
    );

    return NextResponse.json({ success: true, deleted: res.documents.length });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
