// ─── POST /api/upload  &  GET /api/upload?subjectId= ───────────────
// Handles file upload to Appwrite Storage + saving metadata in note_files.
import { NextRequest, NextResponse } from "next/server";
import { databases, storage } from "@/lib/appwrite/server";
import { DATABASE_ID, COLLECTION_IDS, BUCKET_ID } from "@/lib/appwrite/config";
import { ID, Query } from "node-appwrite";
import { InputFile } from "node-appwrite/file";
import { validateSession, unauthorized } from "@/lib/auth/validateSession";
import { checkRateLimit, rateLimited, RATE_LIMITS } from "@/lib/rateLimit";

const col = COLLECTION_IDS.noteFiles;

// ── GET — list uploaded files for a subject ───────────────────────────
export async function GET(req: NextRequest) {
  try {
    const session = await validateSession(req);
    if (!session) return unauthorized();

    const rl = checkRateLimit(`upload:get:${session.userId}`, RATE_LIMITS.general);
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
      Query.orderDesc("$createdAt"),
    ]);

    return NextResponse.json(res.documents);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ── POST — upload a file + save metadata ──────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const session = await validateSession(req);
    if (!session) return unauthorized();

    const rl = checkRateLimit(`upload:post:${session.userId}`, RATE_LIMITS.general);
    if (!rl.allowed) return rateLimited(rl.resetMs);

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const subjectId = formData.get("subjectId") as string | null;

    if (!file || !subjectId) {
      return NextResponse.json(
        { error: "file and subjectId are required" },
        { status: 400 }
      );
    }

    // Determine file type
    const ext = file.name.split(".").pop()?.toLowerCase();
    const fileType = ext === "pdf" ? "pdf" : "txt";

    // 1. Upload binary to Appwrite Storage
    const buffer = Buffer.from(await file.arrayBuffer());
    const inputFile = InputFile.fromBuffer(buffer, file.name);
    const uploaded = await storage.createFile(BUCKET_ID, ID.unique(), inputFile);

    // 2. Save metadata document
    const doc = await databases.createDocument(
      DATABASE_ID,
      col,
      ID.unique(),
      {
        subjectId,
        userId: session.userId,
        fileName: file.name,
        fileType,
        storageFileId: uploaded.$id,
      }
    );

    return NextResponse.json(doc, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
