"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { BrainCircuit, RefreshCcw, Check, X, Eye, Loader2, ChevronDown, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { fetchSubjects, fetchStudyItems, deleteStudyItem } from "@/lib/api";
import type { Subject, StudyModeItem, MCQContent, ShortAnswerContent } from "@/lib/types";

function StudyContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [activeSubjectId, setActiveSubjectId] = useState("");
  const [items, setItems] = useState<StudyModeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingItems, setLoadingItems] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [error, setError] = useState("");

  // Load subjects
  const loadSubjects = useCallback(async () => {
    if (!user) return;
    try {
      const data = await fetchSubjects(user.$id);
      setSubjects(data);
      const param = searchParams.get("subject");
      if (param && data.find((s) => s.$id === param)) setActiveSubjectId(param);
      else if (data.length > 0) setActiveSubjectId(data[0].$id);
    } catch { /* handled */ }
    finally { setLoading(false); }
  }, [user, searchParams]);

  useEffect(() => { loadSubjects(); }, [loadSubjects]);

  // Load study items
  const loadItems = useCallback(async () => {
    if (!user || !activeSubjectId) { setItems([]); return; }
    setLoadingItems(true);
    try {
      const data = await fetchStudyItems(user.$id, activeSubjectId);
      setItems(data);
    } catch { setError("Failed to load study items"); }
    finally { setLoadingItems(false); }
  }, [user, activeSubjectId]);

  useEffect(() => { loadItems(); }, [loadItems]);

  const activeSubject = subjects.find((s) => s.$id === activeSubjectId);

  // Generate study items via AI
  const handleGenerate = async () => {
    if (!user || !activeSubjectId) return;
    setGenerating(true);
    setError("");
    try {
      const res = await fetch("/api/study/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.$id, subjectId: activeSubjectId, count: 3 }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Failed: ${res.status}`);
      }
      await loadItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally { setGenerating(false); }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteStudyItem(id);
      setItems((prev) => prev.filter((item) => item.$id !== id));
    } catch { /* handled */ }
  };

  const toggleReveal = (id: string) => {
    setRevealed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const parseContent = (item: StudyModeItem): MCQContent | ShortAnswerContent => {
    if (typeof item.content === "string") {
      try { return JSON.parse(item.content); } catch { return item.content as unknown as MCQContent; }
    }
    return item.content;
  };

  const handleSubjectChange = (id: string) => {
    setActiveSubjectId(id);
    setRevealed(new Set());
    setSelectedAnswers({});
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full"><Loader2 className="w-5 h-5 animate-spin text-text-tertiary" /></div>;
  }

  const mcqItems = items.filter((i) => i.type === "mcq");
  const shortItems = items.filter((i) => i.type === "short");

  return (
    <div className="flex flex-col h-full bg-bg-app font-sans relative">
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-0"
        style={{ backgroundImage: "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)", backgroundSize: "64px 64px" }}
      />

      {/* Header */}
      <div className="h-12 border-b border-border-strong flex items-center justify-between px-4 md:px-6 shrink-0 bg-bg-surface relative z-10">
        <div className="flex items-center gap-3">
          <BrainCircuit className="w-4 h-4" strokeWidth={1.5} />
          <h2 className="text-[10px] font-mono tracking-widest uppercase font-bold">STUDY REGIMEN</h2>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          {/* Subject selector (compact) */}
          <div className="relative border border-border-strong bg-bg-surface">
            <select
              className="appearance-none bg-transparent py-1 pl-3 pr-7 text-[10px] font-mono font-bold uppercase tracking-widest focus:outline-none cursor-pointer"
              value={activeSubjectId}
              onChange={(e) => handleSubjectChange(e.target.value)}
            >
              {subjects.map((s) => <option key={s.$id} value={s.$id}>{s.name.toUpperCase()}</option>)}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" />
          </div>
          <button
            onClick={handleGenerate}
            disabled={generating || !activeSubjectId}
            className="flex items-center gap-2 border border-border-strong hover:bg-text-primary hover:text-bg-app px-3 py-1 font-mono text-[10px] uppercase tracking-widest cursor-pointer disabled:opacity-50"
          >
            {generating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
            <span className="hidden md:inline">GENERATE</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8 relative z-10 max-w-5xl mx-auto w-full">
        {error && (
          <div className="border border-danger/30 bg-danger/5 p-3 text-[10px] font-mono text-danger mb-6">
            {error}
            <button onClick={() => setError("")} className="ml-2 underline cursor-pointer">dismiss</button>
          </div>
        )}

        {loadingItems ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="w-5 h-5 animate-spin text-text-tertiary" /></div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <BrainCircuit className="w-10 h-10 text-text-tertiary/30 mb-4" />
            <p className="text-[10px] font-mono tracking-widest uppercase text-text-tertiary mb-2">NO STUDY ITEMS YET</p>
            <p className="text-[10px] font-mono text-text-tertiary mb-4">Upload notes and click GENERATE to create study questions.</p>
            <button onClick={handleGenerate} disabled={generating || !activeSubjectId} className="px-4 py-2 bg-text-primary text-bg-app text-[10px] font-mono tracking-widest uppercase font-bold disabled:opacity-50 cursor-pointer flex items-center gap-2">
              {generating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />} GENERATE QUESTIONS
            </button>
          </div>
        ) : (
          <>
            {/* MCQ Section */}
            {mcqItems.length > 0 && (
              <div className="mb-12">
                <div className="border-b border-border-default pb-2 mb-6 flex items-center justify-between">
                  <h3 className="font-mono text-xs font-bold uppercase tracking-widest">MULTIPLE CHOICE</h3>
                  <span className="text-[10px] font-mono tracking-widest text-text-tertiary">{mcqItems.length} ITEM(S)</span>
                </div>
                <div className="space-y-6">
                  {mcqItems.map((item, idx) => {
                    const content = parseContent(item) as MCQContent;
                    const isRevealed = revealed.has(item.$id);
                    const selected = selectedAnswers[item.$id];
                    return (
                      <div key={item.$id} className="border border-border-strong bg-bg-surface p-4 md:p-6">
                        <div className="flex justify-between items-start mb-4 border-b border-border-strong pb-3">
                          <span className="bg-text-primary text-bg-app font-mono text-[10px] font-bold px-2 py-1 tracking-widest uppercase">Q.{idx+1}</span>
                          <button onClick={() => handleDelete(item.$id)} className="text-[9px] font-mono text-text-tertiary hover:text-danger cursor-pointer">DELETE</button>
                        </div>
                        <p className="text-sm font-mono uppercase tracking-wider leading-relaxed mb-6">{content.question}</p>
                        <div className="space-y-3 font-mono text-xs uppercase">
                          {(content.options || []).map((opt, oi) => {
                            const letter = String.fromCharCode(65 + oi);
                            const isCorrect = opt === content.correctAnswer;
                            const isSelected = selected === opt;
                            return (
                              <button
                                key={oi}
                                onClick={() => {
                                  setSelectedAnswers((p) => ({ ...p, [item.$id]: opt }));
                                  setRevealed((p) => new Set(p).add(item.$id));
                                }}
                                className={`flex items-center gap-4 border p-3 md:p-4 w-full text-left cursor-pointer transition-colors ${
                                  isRevealed && isCorrect ? "border-text-primary bg-bg-subtle border-2" :
                                  isRevealed && isSelected && !isCorrect ? "border-danger bg-danger/5" :
                                  "border-border-strong hover:bg-bg-subtle"
                                }`}
                              >
                                <div className={`w-6 h-6 border flex items-center justify-center shrink-0 tracking-widest ${
                                  isRevealed && isCorrect ? "bg-text-primary text-bg-app border-text-primary" : "border-border-strong"
                                }`}>{letter}</div>
                                <span className="flex-1">{opt}</span>
                                {isRevealed && isCorrect && <Check className="w-4 h-4 shrink-0" strokeWidth={3} />}
                                {isRevealed && isSelected && !isCorrect && <X className="w-4 h-4 text-danger shrink-0" strokeWidth={3} />}
                              </button>
                            );
                          })}
                        </div>
                        {isRevealed && content.explanation && (
                          <div className="mt-6 border-t border-border-strong border-dashed pt-4">
                            <h4 className="font-mono text-[10px] font-bold tracking-widest uppercase mb-2">EXPLANATION</h4>
                            <p className="text-xs font-mono uppercase tracking-wider leading-relaxed text-text-secondary">{content.explanation}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Short Answer Section */}
            {shortItems.length > 0 && (
              <div className="mb-12">
                <div className="border-b border-border-default pb-2 mb-6 flex items-center justify-between">
                  <h3 className="font-mono text-xs font-bold uppercase tracking-widest">SHORT ANSWER</h3>
                  <span className="text-[10px] font-mono tracking-widest text-text-tertiary">{shortItems.length} ITEM(S)</span>
                </div>
                <div className="space-y-6">
                  {shortItems.map((item, idx) => {
                    const content = parseContent(item) as ShortAnswerContent;
                    const isRevealed = revealed.has(item.$id);
                    return (
                      <div key={item.$id} className="border border-border-strong bg-bg-surface p-4 md:p-6">
                        <div className="flex justify-between items-start mb-4 border-b border-border-strong pb-3">
                          <span className="font-mono text-[10px] font-bold tracking-widest uppercase">Q.{idx+1}</span>
                          <div className="flex items-center gap-3">
                            <button onClick={() => toggleReveal(item.$id)} className="flex items-center gap-2 font-mono text-[10px] tracking-widest font-bold border border-border-strong px-2 py-1 uppercase hover:bg-bg-subtle cursor-pointer">
                              <Eye className="w-3 h-3" /> {isRevealed ? "HIDE" : "REVEAL"}
                            </button>
                            <button onClick={() => handleDelete(item.$id)} className="text-[9px] font-mono text-text-tertiary hover:text-danger cursor-pointer">DELETE</button>
                          </div>
                        </div>
                        <p className="text-sm font-mono uppercase tracking-wider leading-relaxed mb-6">{content.question}</p>
                        <div className="border border-border-strong relative">
                          <textarea
                            className="w-full bg-transparent p-4 min-h-25 font-mono text-xs uppercase tracking-wider focus:outline-none focus:bg-bg-subtle placeholder:text-text-tertiary resize-none"
                            placeholder="[ENTER YOUR ANSWER...]"
                          />
                        </div>
                        {isRevealed && (
                          <div className="mt-6 border border-border-strong border-dashed bg-bg-subtle p-4 md:p-6">
                            <div className="flex items-center gap-2 mb-3">
                              <Check className="w-4 h-4" strokeWidth={2} />
                              <h4 className="font-mono text-[10px] font-bold tracking-widest uppercase">MODEL ANSWER</h4>
                            </div>
                            <p className="text-xs font-mono uppercase tracking-wider leading-relaxed text-text-secondary">{content.answer}</p>
                            {content.explanation && (
                              <p className="text-xs font-mono uppercase tracking-wider leading-relaxed text-text-tertiary mt-3 pt-3 border-t border-border-default">{content.explanation}</p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function StudyPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-full"><Loader2 className="w-5 h-5 animate-spin text-text-tertiary" /></div>}>
      <StudyContent />
    </Suspense>
  );
}
