<<<<<<< HEAD
"use client";

import { useEffect, useState, useCallback } from "react";
import { BookOpen, FileText, Info, ChevronDown, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { fetchSubjects, fetchStudyItems } from "@/lib/api";
import { useSearchParams } from "next/navigation";
import type { Subject, StudyModeItem, MCQContent, ShortAnswerContent } from "@/lib/types";

export default function StudyModePage() {
     const { user, loading: authLoading } = useAuth();
     const searchParams = useSearchParams();

     const [subjects, setSubjects] = useState<Subject[]>([]);
     const [activeSubjectId, setActiveSubjectId] = useState("");
     const [items, setItems] = useState<StudyModeItem[]>([]);
     const [loading, setLoading] = useState(true);

     // Load subjects
     const loadSubjects = useCallback(async () => {
          if (!user) return;
          try {
               const data = await fetchSubjects(user.$id);
               setSubjects(data);
               const paramSubject = searchParams.get("subject");
               if (paramSubject && data.find((s) => s.$id === paramSubject)) {
                    setActiveSubjectId(paramSubject);
               } else if (data.length > 0 && !activeSubjectId) {
                    setActiveSubjectId(data[0].$id);
               }
          } catch { /* handled below */ } finally {
               setLoading(false);
          }
     }, [user, searchParams, activeSubjectId]);

     // Load study items
     const loadItems = useCallback(async () => {
          if (!user || !activeSubjectId) { setItems([]); return; }
          try {
               setLoading(true);
               const data = await fetchStudyItems(user.$id, activeSubjectId);
               setItems(data);
          } catch { /* non-critical */ } finally {
               setLoading(false);
          }
     }, [user, activeSubjectId]);

     useEffect(() => {
          if (!authLoading && user) loadSubjects();
          if (!authLoading && !user) setLoading(false);
     }, [authLoading, user, loadSubjects]);

     useEffect(() => {
          if (activeSubjectId) loadItems();
     }, [activeSubjectId, loadItems]);

     const activeSubject = subjects.find((s) => s.$id === activeSubjectId);

     // Separate MCQs and short answers
     const mcqs = items.filter((i) => i.type === "mcq");
     const shorts = items.filter((i) => i.type === "short");

     // Parse content safely (may be JSON string from Appwrite)
     function parseMCQ(item: StudyModeItem): MCQContent {
          const c = typeof item.content === "string" ? JSON.parse(item.content) : item.content;
          return c as MCQContent;
     }

     function parseShort(item: StudyModeItem): ShortAnswerContent {
          const c = typeof item.content === "string" ? JSON.parse(item.content) : item.content;
          return c as ShortAnswerContent;
     }

     if (authLoading || loading) {
          return (
               <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
               </div>
          );
     }

     if (!user) {
          return (
               <div className="flex items-center justify-center h-full">
                    <p className="text-text-secondary">Please sign in to use study mode.</p>
               </div>
          );
     }
=======
import { BrainCircuit, PlayCircle, Eye, RefreshCcw, Check, X } from "lucide-react";
>>>>>>> 065bb2dba4e726280e7710154014d2849637cf78

export default function StudyPage() {
     return (
<<<<<<< HEAD
          <div className="p-8 max-w-5xl mx-auto h-full overflow-y-auto">
               {/* Header */}
               <div className="mb-10 pb-6 border-b border-border-default">
                    <div className="flex items-center gap-3 mb-2">
                         <BookOpen className="w-6 h-6 text-brand-600" />
                         <h1 className="text-2xl font-semibold tracking-tight text-text-primary">Study Mode</h1>
                    </div>

                    {/* Subject selector */}
                    {subjects.length > 0 ? (
                         <div className="relative mt-4 max-w-xs">
                              <select
                                   className="w-full appearance-none bg-bg-app border border-border-default rounded-lg pl-4 pr-10 py-2.5 text-sm font-medium text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
                                   value={activeSubjectId}
                                   onChange={(e) => setActiveSubjectId(e.target.value)}
                              >
                                   {subjects.map((s) => (
                                        <option key={s.$id} value={s.$id}>{s.name}</option>
                                   ))}
                              </select>
                              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary pointer-events-none" />
                         </div>
                    ) : (
                         <p className="text-text-secondary text-sm mt-2">No subjects found. Create one from the Dashboard.</p>
                    )}

                    {activeSubject && (
                         <p className="text-text-secondary text-sm mt-3">
                              Self-assessment for <strong>{activeSubject.name}</strong> based on your uploaded notes.
                         </p>
                    )}
               </div>

               {items.length === 0 && (
                    <div className="text-center py-16">
                         <BookOpen className="w-10 h-10 text-brand-200 mx-auto mb-4" />
                         <p className="text-text-secondary text-sm">No study content generated yet for this subject.</p>
                         <p className="text-text-tertiary text-xs mt-1">Study items will appear here once generated.</p>
                    </div>
               )}

               {/* Multiple Choice Section */}
               {mcqs.length > 0 && (
                    <section className="mb-14">
                         <div className="flex items-center justify-between mb-6">
                              <h2 className="text-xl font-semibold text-text-primary tracking-tight">
                                   Part 1: Multiple Choice Questions ({mcqs.length})
                              </h2>
                         </div>
                         <div className="space-y-6">
                              {mcqs.map((item, index) => {
                                   const q = parseMCQ(item);
                                   return (
                                        <div key={item.$id} className="bg-bg-surface border border-border-default rounded-xl p-6 shadow-sm">
                                             <h3 className="text-base font-semibold text-text-primary mb-4 leading-relaxed">
                                                  <span className="text-brand-600 mr-2">{index + 1}.</span>
                                                  {q.question}
                                             </h3>

                                             <div className="space-y-3 mb-6">
                                                  {q.options.map((opt, i) => {
                                                       const isCorrect = opt === q.correctAnswer;
                                                       return (
                                                            <div key={i} className={`px-4 py-3 rounded-lg border text-sm font-medium flex items-center gap-3 cursor-pointer ${isCorrect
                                                                      ? "bg-[#Edf7ed] border-[#C5E1A5] text-[#1E4620]"
                                                                      : "bg-bg-app border-border-subtle text-text-primary"
                                                                 }`}>
                                                                 <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${isCorrect ? "border-[#1E4620] bg-[#1E4620]" : "border-border-strong bg-bg-surface"
                                                                      }`}>
                                                                      {isCorrect && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                                                                 </div>
                                                                 {opt}
                                                            </div>
                                                       );
                                                  })}
                                             </div>

                                             <div className="bg-brand-50 rounded-lg p-5 border border-brand-100">
                                                  <div className="flex items-center gap-2 font-semibold text-brand-800 text-sm mb-2">
                                                       <Info className="w-4 h-4 shrink-0" />
                                                       Explanation
                                                  </div>
                                                  <p className="text-sm text-brand-900 leading-relaxed mb-4">{q.explanation}</p>
                                                  {item.citations?.length > 0 && (
                                                       <div className="flex items-center gap-2 text-xs font-medium text-brand-700 w-fit bg-brand-100/50 px-3 py-1.5 border border-brand-200 rounded-md">
                                                            <FileText className="w-3 h-3 shrink-0" />
                                                            Citation: {item.citations[0]?.reference || "Notes"}
                                                       </div>
                                                  )}
                                             </div>
                                        </div>
                                   );
                              })}
                         </div>
                    </section>
               )}

               {/* Short Answer Section */}
               {shorts.length > 0 && (
                    <section className="mb-10">
                         <div className="flex items-center justify-between mb-6">
                              <h2 className="text-xl font-semibold text-text-primary tracking-tight">
                                   Part 2: Short Answer Questions ({shorts.length})
                              </h2>
                         </div>
                         <div className="space-y-6">
                              {shorts.map((item, index) => {
                                   const q = parseShort(item);
                                   return (
                                        <div key={item.$id} className="bg-bg-surface border border-border-default rounded-xl p-6 shadow-sm">
                                             <h3 className="text-base font-semibold text-text-primary mb-4 leading-relaxed">
                                                  <span className="text-brand-600 mr-2">{index + 1}.</span>
                                                  {q.question}
                                             </h3>

                                             <div className="mb-6">
                                                  <div className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-2">Ideal Answer</div>
                                                  <div className="bg-bg-app border border-border-subtle rounded-lg p-4 text-sm text-text-primary leading-relaxed font-medium">
                                                       {q.answer}
                                                  </div>
                                             </div>

                                             <div className="bg-brand-50 rounded-lg p-5 border border-brand-100">
                                                  <div className="flex items-center gap-2 font-semibold text-brand-800 text-sm mb-2">
                                                       <Info className="w-4 h-4 shrink-0" />
                                                       Key Concept
                                                  </div>
                                                  <p className="text-sm text-brand-900 leading-relaxed mb-4">{q.explanation}</p>
                                                  {item.citations?.length > 0 && (
                                                       <div className="flex items-center gap-2 text-xs font-medium text-brand-700 w-fit bg-brand-100/50 px-3 py-1.5 border border-brand-200 rounded-md">
                                                            <FileText className="w-3 h-3 shrink-0" />
                                                            Citation: {item.citations[0]?.reference || "Notes"}
                                                       </div>
                                                  )}
                                             </div>
                                        </div>
                                   );
                              })}
                         </div>
                    </section>
               )}
=======
          <div className="flex flex-col h-full bg-white font-sans text-black relative">
               <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-0"
                    style={{ backgroundImage: "linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)", backgroundSize: "64px 64px" }}>
               </div>

               {/* Header */}
               <div className="h-12 border-b border-black flex items-center justify-between px-6 shrink-0 bg-white relative z-10 transition-none">
                    <div className="flex items-center gap-3">
                         <BrainCircuit className="w-4 h-4 text-black" strokeWidth={1.5} />
                         <h2 className="text-[10px] font-mono tracking-widest uppercase font-bold text-black">ACTIVE STUDY REGIMEN // EXAM.PREP</h2>
                    </div>

                    <div className="flex items-center gap-4">
                         <div className="bg-black text-white px-2 py-1 text-[9px] font-mono font-bold tracking-widest uppercase">
                              TARGET: ADVANCED CALCULUS
                         </div>
                         <button className="flex items-center gap-2 border border-black hover:bg-black hover:text-white px-3 py-1 font-mono text-[10px] uppercase tracking-widest transition-none cursor-pointer">
                              <RefreshCcw className="w-3 h-3" />
                              RE-GENERATE PROTOCOL
                         </button>
                    </div>
               </div>

               <div className="flex-1 overflow-y-auto p-8 relative z-10 max-w-5xl mx-auto w-full">

                    {/* Flashcard / MCQ Module */}
                    <div className="mb-12">
                         <div className="border-b border-black/30 pb-2 mb-6 flex items-center justify-between">
                              <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-black">TEST.MODULE: MULTIPLE CHOICE</h3>
                              <span className="text-[10px] font-mono tracking-widest text-black/50">01 / 05</span>
                         </div>

                         <div className="border border-black bg-white group cursor-pointer hover:bg-black/5 transition-none p-8">
                              <div className="flex justify-between items-start mb-6 border-b border-black pb-4">
                                   <span className="bg-black text-white font-mono text-[10px] font-bold px-2 py-1 tracking-widest uppercase">QUESTION NO.1</span>
                                   <span className="border border-black font-mono text-[9px] px-2 py-0.5 font-bold uppercase text-black">DIFFICULTY: HARD</span>
                              </div>

                              <p className="text-sm font-mono uppercase tracking-wider leading-relaxed text-black mb-10">
                                   When applying the Chain Rule to differentiate h(x) = sin³(x²), what is the correct first step in decomposition?
                              </p>

                              <div className="space-y-4 font-mono text-xs uppercase cursor-default">

                                   <div className="flex items-center gap-4 border border-black p-4 bg-white hover:bg-black hover:text-white group transition-none">
                                        <div className="w-6 h-6 border tracking-widest border-black flex items-center justify-center shrink-0">A</div>
                                        <span className="flex-1 group-hover:text-white">Treat sin(x) as the outer function and x² as the inner.</span>
                                        <div className="w-4 h-4"></div>
                                   </div>

                                   {/* Selected / Correct Answer style */}
                                   <div className="flex items-center gap-4 border-2 border-black p-4 bg-black/5 transition-none">
                                        <div className="w-6 h-6 bg-black text-white border border-black flex items-center justify-center shrink-0 tracking-widest">B</div>
                                        <span className="flex-1 font-bold">Treat u³ as the outermost function where u = sin(x²).</span>
                                        <Check className="w-4 h-4 text-black shrink-0" strokeWidth={3} />
                                   </div>

                                   <div className="flex items-center gap-4 border border-black p-4 bg-white hover:bg-black hover:text-white group transition-none">
                                        <div className="w-6 h-6 border tracking-widest border-black flex items-center justify-center shrink-0">C</div>
                                        <span className="flex-1 group-hover:text-white">Differentiate x² first and multiply by 3.</span>
                                        <div className="w-4 h-4"></div>
                                   </div>

                              </div>

                              {/* Explanation Area */}
                              <div className="mt-8 border-t border-dashed border-black pt-6">
                                   <div className="flex items-center gap-2 mb-3">
                                        <PlayCircle className="w-4 h-4 text-black" strokeWidth={1.5} />
                                        <h4 className="font-mono text-[10px] font-bold tracking-widest uppercase text-black">LOGICAL BREAKDOWN</h4>
                                   </div>
                                   <p className="text-xs font-mono uppercase tracking-wider leading-relaxed text-black/70">
                                        Correct. h(x) = (sin(x³))². The outermost function is the power of 3. Therefore, d/dx [u³] = 3u² * du/dx. Next you apply the chain rule again to the inner function sin(x²).
                                   </p>
                              </div>
                         </div>
                    </div>

                    {/* Short Answer Module */}
                    <div>
                         <div className="border-b border-black/30 pb-2 mb-6 flex items-center justify-between">
                              <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-black">TEST.MODULE: SHORT ANSWER</h3>
                              <span className="text-[10px] font-mono tracking-widest text-black/50">01 / 03</span>
                         </div>

                         <div className="border border-black bg-white p-8 group">
                              <div className="flex justify-between items-start mb-6 border-b border-black pb-4">
                                   <span className="font-mono text-[10px] font-bold tracking-widest uppercase text-black">QUESTION NO.2</span>
                                   <button className="flex items-center gap-2 font-mono text-[10px] tracking-widest font-bold border border-black px-2 py-1 uppercase text-black hover:bg-black hover:text-white transition-none cursor-pointer">
                                        <Eye className="w-3 h-3" />
                                        REVEAL MASTER_COPY
                                   </button>
                              </div>

                              <p className="text-sm font-mono uppercase tracking-wider leading-relaxed text-black mb-8">
                                   Briefly describe why l'Hôpital's rule is invalid if the limit does not evaluate to an indeterminate form like 0/0 or ∞/∞.
                              </p>

                              <div className="border border-black relative">
                                   <div className="absolute top-0 right-0 bg-black text-white px-2 py-1 text-[8px] font-mono font-bold tracking-widest uppercase">EVALUATION_MODE: MANUAL</div>
                                   <textarea
                                        className="w-full bg-transparent p-4 min-h-[120px] font-mono text-xs uppercase tracking-wider focus:outline-none focus:bg-black/5 transition-none text-black placeholder:text-black/30 resize-none"
                                        placeholder="[ENTER HYPOTHESIS HERE...]"
                                   />
                              </div>

                              {/* Hidden answer state (mock visible as if button was clicked) */}
                              <div className="mt-8 border border-black border-dashed bg-black/5 p-6">
                                   <div className="flex items-center gap-2 mb-3">
                                        <Check className="w-4 h-4 text-black" strokeWidth={2} />
                                        <h4 className="font-mono text-[10px] font-bold tracking-widest uppercase text-black">MASTER.COPY.REVEAL</h4>
                                   </div>
                                   <p className="text-xs font-mono uppercase tracking-wider leading-relaxed text-black/80">
                                        L'Hôpital's rule is derived from linear approximations near a point. If the limits of the numerator and denominator are finite and non-zero, direct substitution yields the exact limit. Applying derivatives alters the fundamental ratio of the original functions improperly.
                                   </p>

                                   <div className="mt-4 flex gap-4 border-t border-black/30 pt-4 cursor-default">
                                        <span className="font-mono text-[9px] font-bold tracking-widest uppercase text-black/50">SELF EVALUATION:</span>
                                        <button className="flex items-center gap-1 font-mono text-[9px] tracking-widest text-black border border-black hover:bg-[#df2c2c] hover:text-white hover:border-[#df2c2c] px-2 py-0.5 transition-none">
                                             <X className="w-3 h-3" /> INCORRECT
                                        </button>
                                        <button className="flex items-center gap-1 font-mono text-[9px] tracking-widest text-black border border-black hover:bg-black hover:text-white px-2 py-0.5 transition-none">
                                             <Check className="w-3 h-3" strokeWidth={2} /> CORRECT
                                        </button>
                                   </div>
                              </div>

                         </div>
                    </div>

               </div>
>>>>>>> 065bb2dba4e726280e7710154014d2849637cf78
          </div>
     );
}
