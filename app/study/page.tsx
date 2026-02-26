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

     return (
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
          </div>
     );
}
