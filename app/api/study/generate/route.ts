// ─── POST /api/study/generate ───────────────────────────────────
// AI-powered study question generator.
// Fetches note chunks for a subject, calls Gemini to generate
// MCQ and short-answer questions, saves them to study_mode.

import { NextRequest, NextResponse } from "next/server";
import { databases } from "@/lib/appwrite/server";
import { DATABASE_ID, COLLECTION_IDS } from "@/lib/appwrite/config";
import { Query, ID } from "node-appwrite";
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { validateSession, unauthorized } from "@/lib/auth/validateSession";
import { checkRateLimit, rateLimited, RATE_LIMITS } from "@/lib/rateLimit";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

interface ChunkDoc {
  $id: string;
  chunkText: string;
  reference: string;
  fileId: string;
}

interface FileDoc {
  $id: string;
  fileName: string;
}

export async function POST(req: NextRequest) {
  try {
    const session = await validateSession(req);
    if (!session) return unauthorized();

    const rl = checkRateLimit(`study-gen:${session.userId}`, RATE_LIMITS.ai);
    if (!rl.allowed) return rateLimited(rl.resetMs);

    const { subjectId, count = 3 } = await req.json();

    if (!subjectId) {
      return NextResponse.json(
        { error: "subjectId is required" },
        { status: 400 }
      );
    }

    // 1. Fetch note chunks
    const chunksRes = await databases.listDocuments(
      DATABASE_ID,
      COLLECTION_IDS.noteChunks,
      [
        Query.equal("userId", session.userId),
        Query.equal("subjectId", subjectId),
        Query.limit(50),
      ]
    );

    const chunks = chunksRes.documents as unknown as ChunkDoc[];

    if (chunks.length === 0) {
      return NextResponse.json(
        { error: "No notes found for this subject. Upload notes first." },
        { status: 400 }
      );
    }

    // 2. Fetch file names for citations
    const filesRes = await databases.listDocuments(
      DATABASE_ID,
      COLLECTION_IDS.noteFiles,
      [
        Query.equal("userId", session.userId),
        Query.equal("subjectId", subjectId),
        Query.limit(50),
      ]
    );

    const fileMap = new Map<string, string>();
    for (const f of filesRes.documents as unknown as FileDoc[]) {
      fileMap.set(f.$id, f.fileName);
    }

    // 3. Build context
    const context = chunks
      .map((c, i) => {
        const fileName = fileMap.get(c.fileId) || "Unknown";
        return `[Passage ${i + 1}] (Source: ${fileName}, ${c.reference})\n${c.chunkText}`;
      })
      .join("\n\n---\n\n");

    // 4. Call OpenAI to generate questions
    const mcqCount = Math.ceil(count / 2);
    const shortCount = count - mcqCount;

    const prompt = `Based on the following study notes, generate exactly ${mcqCount} multiple-choice questions and ${shortCount} short-answer questions.
    
    NOTES:
    ${context}`;

    const responseSchema: Schema = {
      type: Type.OBJECT,
      properties: {
        items: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              type: {
                type: Type.STRING,
                description: "'mcq' or 'short'"
              },
              content: {
                type: Type.OBJECT,
                description: "Contains 'question', 'options', 'correctAnswer', 'explanation' for MCQ OR 'question', 'answer', 'explanation' for Short Answer.",
              },
              citations: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    fileName: { type: Type.STRING },
                    reference: { type: Type.STRING },
                    snippet: { type: Type.STRING },
                  }
                }
              }
            }
          }
        }
      }
    };

    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
      contents: prompt,
      config: {
        temperature: 0.5,
        maxOutputTokens: 3000,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      }
    });

    const raw = response.text || "{}";
    let parsed: { items?: unknown[]; questions?: unknown[] };

    try {
      const obj = JSON.parse(raw);
      // Handle both { items: [...] } and direct array formats
      parsed = { items: Array.isArray(obj) ? obj : (obj.items || obj.questions || []) };
    } catch {
      return NextResponse.json(
        { error: "Failed to parse AI response" },
        { status: 500 }
      );
    }

    const items = parsed.items || [];

    // 5. Save to database
    const results = await Promise.all(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      items.map((item: any) =>
        databases.createDocument(DATABASE_ID, COLLECTION_IDS.studyMode, ID.unique(), {
          userId: session.userId,
          subjectId,
          type: item.type || "mcq",
          content: JSON.stringify(item.content || {}),
          citations: JSON.stringify(item.citations || []),
        })
      )
    );

    return NextResponse.json({ success: true, count: results.length }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[study/generate] Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
