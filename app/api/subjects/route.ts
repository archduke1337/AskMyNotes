// ─── GET & POST /api/subjects ──────────────────────────────────────────
import { NextRequest, NextResponse } from "next/server";
import { databases } from "@/lib/appwrite/server";
import { DATABASE_ID, COLLECTION_IDS, MAX_SUBJECTS } from "@/lib/appwrite/config";
import { ID, Query } from "node-appwrite";

const col = COLLECTION_IDS.subjects;

// ── GET  — list subjects for a user ───────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");
    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const res = await databases.listDocuments(DATABASE_ID, col, [
      Query.equal("userId", userId),
      Query.orderDesc("$createdAt"),
      Query.limit(MAX_SUBJECTS),
    ]);

    return NextResponse.json(res.documents);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ── POST — create a new subject (max 3 enforced) ─────────────────────
export async function POST(req: NextRequest) {
  try {
    const { userId, name } = await req.json();

    if (!userId || !name) {
      return NextResponse.json(
        { error: "userId and name are required" },
        { status: 400 }
      );
    }

    // Enforce max 3 subjects
    const existing = await databases.listDocuments(DATABASE_ID, col, [
      Query.equal("userId", userId),
    ]);

    if (existing.total >= MAX_SUBJECTS) {
      return NextResponse.json(
        { error: `Maximum of ${MAX_SUBJECTS} subjects allowed` },
        { status: 400 }
      );
    }

    const subject = await databases.createDocument(
      DATABASE_ID,
      col,
      ID.unique(),
      {
        userId,
        name,
      }
    );

    return NextResponse.json(subject, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
