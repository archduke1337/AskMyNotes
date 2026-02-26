// ─── POST /api/study/generate ───────────────────────────────────
// AI-powered study question generator.
// Fetches note chunks for a subject, calls OpenAI to generate
// MCQ and short-answer questions, saves them to study_mode.

import { NextRequest, NextResponse } from "next/server";
import { databases } from "@/lib/appwrite/server";
import { DATABASE_ID, COLLECTION_IDS } from "@/lib/appwrite/config";
import { Query, ID } from "node-appwrite";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "" });

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
    const { userId, subjectId, count = 3 } = await req.json();

    if (!userId || !subjectId) {
      return NextResponse.json(
        { error: "userId and subjectId are required" },
        { status: 400 }
      );
    }

    // 1. Fetch note chunks
    const chunksRes = await databases.listDocuments(
      DATABASE_ID,
      COLLECTION_IDS.noteChunks,
      [
        Query.equal("userId", userId),
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
        Query.equal("userId", userId),
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
${context}

RESPONSE FORMAT (JSON array):
[
  {
    "type": "mcq",
    "content": {
      "question": "The question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "The correct option text (must match one of the options exactly)",
      "explanation": "Why this is the correct answer"
    },
    "citations": [{ "fileName": "source.pdf", "reference": "Page X", "snippet": "relevant quote" }]
  },
  {
    "type": "short",
    "content": {
      "question": "The question text",
      "answer": "The model answer",
      "explanation": "Additional explanation"
    },
    "citations": [{ "fileName": "source.pdf", "reference": "Page X", "snippet": "relevant quote" }]
  }
]

Rules:
- Questions must be based ONLY on the provided notes
- Each question should test understanding, not just recall
- Provide clear, educational explanations
- Include at least one citation per question
- Return valid JSON only, no markdown fences`;

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
      max_tokens: 3000,
      response_format: { type: "json_object" },
    });

    const raw = completion.choices[0]?.message?.content || "{}";
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
          userId,
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
