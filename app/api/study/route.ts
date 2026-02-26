// ─── GET & POST /api/study ──────────────────────────────────────────────
// study_mode — generated MCQs & short‑answer questions.
import { NextRequest, NextResponse } from "next/server";
import { databases } from "@/lib/appwrite/server";
import { DATABASE_ID, COLLECTION_IDS } from "@/lib/appwrite/config";
import { ID, Query } from "node-appwrite";

const col = COLLECTION_IDS.studyMode;

// ── GET — list study items for a subject ──────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");
    const subjectId = req.nextUrl.searchParams.get("subjectId");
    const type = req.nextUrl.searchParams.get("type"); // "mcq" | "short"

    if (!userId || !subjectId) {
      return NextResponse.json(
        { error: "userId and subjectId are required" },
        { status: 400 }
      );
    }

    const queries = [
      Query.equal("userId", userId),
      Query.equal("subjectId", subjectId),
      Query.orderDesc("$createdAt"),
    ];
    if (type) queries.push(Query.equal("type", type));

    const res = await databases.listDocuments(DATABASE_ID, col, queries);
    return NextResponse.json(res.documents);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ── POST — create a study item ────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const { userId, subjectId, type, content, citations } = await req.json();

    if (!userId || !subjectId || !type || !content) {
      return NextResponse.json(
        { error: "userId, subjectId, type, and content are required" },
        { status: 400 }
      );
    }

    const doc = await databases.createDocument(DATABASE_ID, col, ID.unique(), {
      userId,
      subjectId,
      type,
      content: JSON.stringify(content),
      citations: citations ? JSON.stringify(citations) : "[]",
    });

    return NextResponse.json(doc, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
