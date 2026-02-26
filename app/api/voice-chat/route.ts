// ─── POST /api/voice-chat ───────────────────────────────────────────
// AI‑powered teacher conversation with multi‑turn context.
// Performs RAG: fetches note chunks for the subject, builds context,
// calls OpenAI, returns structured answer with citations + confidence.
// Enforces subject scoping & refusal when content not found.

import { NextRequest, NextResponse } from "next/server";
import { databases } from "@/lib/appwrite/server";
import { DATABASE_ID, COLLECTION_IDS } from "@/lib/appwrite/config";
import { Query } from "node-appwrite";
import { GoogleGenAI, Type, Schema } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

// ── Types ─────────────────────────────────────────────────────────────
interface ConversationTurn {
  role: "user" | "assistant";
  content: string;
}

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

// ── POST — answer a voice question within subject scope ───────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      userId,
      subjectId,
      subjectName,
      question,
      conversationHistory = [],
    } = body as {
      userId: string;
      subjectId: string;
      subjectName: string;
      question: string;
      conversationHistory: ConversationTurn[];
    };

    if (!userId || !subjectId || !question) {
      return NextResponse.json(
        { error: "userId, subjectId, and question are required" },
        { status: 400 }
      );
    }

    // 1. Fetch note chunks for this subject (RAG context)
    const chunksRes = await databases.listDocuments(
      DATABASE_ID,
      COLLECTION_IDS.noteChunks,
      [
        Query.equal("userId", userId),
        Query.equal("subjectId", subjectId),
        Query.limit(100),
      ]
    );

    const chunks = chunksRes.documents as unknown as ChunkDoc[];

    // 2. Fetch file metadata so we can map fileId → fileName for citations
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

    // 3. Build context passages
    const contextPassages = chunks
      .map((c, i) => {
        const fileName = fileMap.get(c.fileId) || "Unknown File";
        return `[Passage ${i + 1}] (Source: ${fileName}, ${c.reference})\n${c.chunkText}`;
      })
      .join("\n\n---\n\n");

    const hasContext = chunks.length > 0;

    // 4. Build system prompt
    const systemPrompt = `You are a knowledgeable, patient teacher helping a student study the subject "${subjectName}".

STRICT RULES:
1. SUBJECT SCOPING: Only answer questions related to "${subjectName}" using the provided notes context. If the student asks about something outside this subject or something not covered in their notes, you MUST respond with exactly: "Not found in your notes for ${subjectName}."
2. CITATIONS: When you use information from a passage, cite it. Include the source file name and reference (page/section).
3. CONFIDENCE: Assess your confidence based on how well the notes cover the topic:
   - "High" = directly addressed in the notes
   - "Medium" = partially covered or inferred from notes
   - "Low" = barely mentioned, mostly extrapolation
4. EVIDENCE SNIPPETS: Quote brief relevant excerpts directly from the passages.
5. MULTI-TURN: The student may ask follow-ups like "give an example", "simplify it", "compare it with the previous concept". Use the conversation history to understand context.
6. TEACHING STYLE: Be warm, clear, and encouraging. Explain concepts as a teacher would — with analogies, step-by-step reasoning, and examples drawn from the notes.

${hasContext ? `NOTES CONTEXT FOR "${subjectName}":\n\n${contextPassages}` : `No notes have been uploaded for "${subjectName}" yet.`}

RESPONSE FORMAT (JSON):
{
  "answer": "Your detailed, teacher-like explanation here",
  "confidence": "High" | "Medium" | "Low",
  "citations": [
    {
      "fileName": "source_file.pdf",
      "reference": "Page X, Section Y",
      "snippet": "brief quote from the notes"
    }
  ]
}

If no relevant information is found, respond with:
{
  "answer": "Not found in your notes for ${subjectName}.",
  "confidence": "Low",
  "citations": []
}

Always respond with valid JSON only. No markdown fences.`;

    // 5. Build messages array with multi-turn history for Gemini
    // We append the system prompt to the context block as Gemini's system instructions.
    
    const parts = [];
    
    // Add history
    const recentHistory = conversationHistory.slice(-10);
    for (const turn of recentHistory) {
      parts.push({
        text: `${turn.role.toUpperCase()}: ${turn.content}`
      });
    }

    // Add current question
    parts.push({
      text: `USER: ${question}`
    });

    const responseSchema: Schema = {
      type: Type.OBJECT,
      properties: {
        answer: {
          type: Type.STRING,
          description: "Your detailed, teacher-like explanation here.",
        },
        confidence: {
          type: Type.STRING,
          description: "'High', 'Medium', or 'Low' confidence score.",
        },
        citations: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              fileName: { type: Type.STRING },
              reference: { type: Type.STRING },
              snippet: { type: Type.STRING }
            }
          }
        }
      },
      required: ["answer", "confidence", "citations"]
    };

    // 6. Call Google Gemini 
    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
      contents: parts,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.3,
        maxOutputTokens: 1500,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      }
    });

    const raw = response.text || "{}";

    let parsed: {
      answer: string;
      confidence: string;
      citations: { fileName: string; reference: string; snippet: string }[];
    };

    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = {
        answer: raw,
        confidence: "Low",
        citations: [],
      };
    }

    return NextResponse.json({
      answer: parsed.answer || "I couldn't generate a response.",
      confidence: parsed.confidence || "Low",
      citations: parsed.citations || [],
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[voice-chat] Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
