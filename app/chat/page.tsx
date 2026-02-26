"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Send, Library, FileText, CheckCircle2, ChevronDown, Sparkles, Loader2, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { fetchSubjects, fetchChatMessages, sendChatMessage, clearChatHistory, sendVoiceChatMessage, fetchNoteFiles } from "@/lib/api";
import type { Subject, ChatMessage } from "@/lib/types";
import type { VoiceChatResponse } from "@/lib/api";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

export default function ChatPage() {
     const { user } = useAuth();
     const searchParams = useSearchParams();

     const [subjects, setSubjects] = useState<Subject[]>([]);
     const [activeSubjectId, setActiveSubjectId] = useState("");
     const [messages, setMessages] = useState<ChatMessage[]>([]);
     const [noteFiles, setNoteFiles] = useState<{ name: string; date: string }[]>([]);
     const [input, setInput] = useState("");
     const [isProcessing, setIsProcessing] = useState(false);
     const [loadingSubjects, setLoadingSubjects] = useState(true);
     const [loadingMessages, setLoadingMessages] = useState(false);
     const messagesEndRef = useRef<HTMLDivElement>(null);

     useGSAP(() => {
          const cards = gsap.utils.toArray<HTMLElement>('.gsap-hover');

          const onEnter = (e: Event) => {
               const target = e.currentTarget as HTMLElement;
               gsap.to(target, { y: -2, backgroundColor: "var(--color-bg-subtle)", duration: 0.15, ease: "power1.out" });
          };
          const onLeave = (e: Event) => {
               const target = e.currentTarget as HTMLElement;
               gsap.to(target, { y: 0, backgroundColor: "transparent", duration: 0.15, ease: "power1.out" });
          };

          cards.forEach((card) => {
               card.addEventListener("mouseenter", onEnter);
               card.addEventListener("mouseleave", onLeave);
          });

          return () => {
               cards.forEach((card) => {
                    card.removeEventListener("mouseenter", onEnter);
                    card.removeEventListener("mouseleave", onLeave);
               });
          };
     }, [noteFiles, activeSubjectId, messages]);

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
          finally { setLoadingSubjects(false); }
     }, [user, searchParams]);

     useEffect(() => { loadSubjects(); }, [loadSubjects]);

     // Load messages & files when subject changes
     const loadData = useCallback(async () => {
          if (!user || !activeSubjectId) { setMessages([]); setNoteFiles([]); return; }
          setLoadingMessages(true);
          try {
               const [msgs, files] = await Promise.all([
                    fetchChatMessages(user.$id, activeSubjectId),
                    fetchNoteFiles(user.$id, activeSubjectId),
               ]);
               setMessages(msgs);
               setNoteFiles(files.map((f) => ({ name: f.fileName, date: f.uploadedAt || f.$createdAt })));
          } catch { /* handled */ }
          finally { setLoadingMessages(false); }
     }, [user, activeSubjectId, setLoadingMessages]);

     useEffect(() => { loadData(); }, [loadData]);

     // Auto-scroll
     useEffect(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
     }, [messages]);

     const activeSubject = subjects.find((s) => s.$id === activeSubjectId);

     // Send message with RAG
     const handleSend = async () => {
          if (!user || !activeSubjectId || !input.trim() || isProcessing) return;
          const question = input.trim();
          setInput("");
          setIsProcessing(true);

          try {
               // Get AI response via RAG
               const response: VoiceChatResponse = await sendVoiceChatMessage({
                    userId: user.$id,
                    subjectId: activeSubjectId,
                    subjectName: activeSubject?.name || "",
                    question,
                    conversationHistory: messages.slice(-10).map((m) => ({
                         role: m.question ? ("user" as const) : ("assistant" as const),
                         content: m.question || m.answer || "",
                    })),
               });

               // Save to chat history
               await sendChatMessage({
                    userId: user.$id,
                    subjectId: activeSubjectId,
                    question,
                    answer: response.answer,
                    confidence: response.confidence as "High" | "Medium" | "Low",
                    citations: response.citations.map((c) => ({
                         fileId: "",
                         fileName: c.fileName,
                         reference: c.reference,
                         snippet: c.snippet,
                    })),
               });

               await loadData();
          } catch {
               // Save error as message
               await sendChatMessage({
                    userId: user.$id,
                    subjectId: activeSubjectId,
                    question,
                    answer: "Error: Failed to generate response. Please try again.",
                    confidence: "Low",
               });
               await loadData();
          } finally {
               setIsProcessing(false);
          }
     };

     const handleClear = async () => {
          if (!user || !activeSubjectId || !confirm("Clear all chat history for this subject?")) return;
          try {
               await clearChatHistory(user.$id, activeSubjectId);
               setMessages([]);
          } catch { /* handled */ }
     };

     const handleSubjectChange = (id: string) => {
          setActiveSubjectId(id);
          setMessages([]);
          setInput("");
     };

     const parseCitations = (msg: ChatMessage) => {
          if (!msg.citations) return [];
          if (Array.isArray(msg.citations)) return msg.citations;
          try { return JSON.parse(msg.citations as unknown as string); } catch { return []; }
     };

     if (loadingSubjects) {
          return <div className="flex items-center justify-center h-full"><Loader2 className="w-5 h-5 animate-spin text-text-tertiary" /></div>;
     }

     return (
          <div className="flex flex-col md:flex-row h-full bg-bg-app font-sans relative">
               <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-0"
                    style={{ backgroundImage: "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)", backgroundSize: "32px 32px" }}
               />

               {/* Left Column: Context */}
               <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-border-strong bg-bg-surface flex flex-col shrink-0 relative z-10 max-h-48 md:max-h-none">
                    <div className="border-b border-border-strong">
                         <div className="bg-text-primary text-bg-app px-4 py-2 flex items-center gap-2">
                              <Library className="w-4 h-4" strokeWidth={1.5} />
                              <span className="text-base font-mono font-bold uppercase tracking-widest">CONTEXT REGISTRY</span>
                         </div>
                         <div className="p-4 border-b border-border-strong">
                              <div className="relative border border-border-strong bg-bg-surface hover:bg-bg-subtle">
                                   <select
                                        className="w-full appearance-none bg-transparent pt-6 pb-2 px-4 text-base font-bold uppercase tracking-widest focus:outline-none cursor-pointer"
                                        value={activeSubjectId}
                                        onChange={(e) => handleSubjectChange(e.target.value)}
                                   >
                                        {subjects.length === 0 && <option value="">NO SUBJECTS</option>}
                                        {subjects.map((s) => <option key={s.$id} value={s.$id}>{s.name.toUpperCase()}</option>)}
                                   </select>
                                   <label className="absolute top-2 left-4 text-[8px] font-mono tracking-widest text-text-tertiary pointer-events-none">TARGET INDEX</label>
                                   <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" />
                              </div>
                              <div className="flex justify-between items-center mt-4">
                                   <span className="text-base font-mono tracking-widest uppercase text-text-tertiary">SOURCES:</span>
                                   <span className="text-base font-mono font-bold tracking-widest border border-border-strong px-2">{noteFiles.length}</span>
                              </div>
                         </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 hidden md:block">
                         <div className="text-base font-mono tracking-widest text-text-tertiary uppercase mb-4 border-b border-border-strong pb-2">SOURCES</div>
                         {noteFiles.length === 0 ? (
                              <p className="text-base font-mono text-text-tertiary">No files uploaded yet.</p>
                         ) : (
                              <ul className="space-y-3">
                                   {noteFiles.map((f, i) => (
                                        <li key={i} className="gsap-hover flex items-start gap-3 p-2 border border-transparent">
                                             <div className="w-7 h-7 flex items-center justify-center shrink-0 border border-border-strong">
                                                  <FileText className="w-3.5 h-3.5" strokeWidth={1.5} />
                                             </div>
                                             <p className="text-base font-mono font-bold tracking-widest uppercase leading-tight">{f.name}</p>
                                        </li>
                                   ))}
                              </ul>
                         )}
                    </div>

                    {messages.length > 0 && (
                         <div className="border-t border-border-strong p-3 hidden md:block">
                              <button onClick={handleClear} className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-border-default text-text-secondary text-base font-mono tracking-widest uppercase hover:bg-bg-subtle cursor-pointer">
                                   <Trash2 className="w-3 h-3" /> CLEAR HISTORY
                              </button>
                         </div>
                    )}
               </div>

               {/* Right Column: Chat */}
               <div className="flex-1 flex flex-col h-full bg-bg-app min-w-0 relative z-10">
                    <div className="h-12 border-b border-border-strong flex items-center justify-between px-4 md:px-6 shrink-0 bg-bg-surface">
                         <div className="flex items-center gap-3">
                              <div className={`w-3 h-3 ${isProcessing ? "bg-text-primary animate-pulse" : "bg-text-tertiary"}`} />
                              <h3 className="text-base font-mono font-bold tracking-widest uppercase">SYS.QUERY_TERMINAL</h3>
                         </div>
                         <div className="text-base font-mono tracking-widest uppercase text-text-tertiary">
                              {messages.length} MSG(S)
                         </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
                         {loadingMessages ? (
                              <div className="flex items-center justify-center py-12"><Loader2 className="w-4 h-4 animate-spin text-text-tertiary" /></div>
                         ) : messages.length === 0 ? (
                              <div className="flex flex-col items-center justify-center h-full text-center">
                                   <Sparkles className="w-8 h-8 text-text-tertiary/30 mb-4" />
                                   <p className="text-base font-mono tracking-widest uppercase text-text-tertiary">ASK A QUESTION ABOUT YOUR NOTES</p>
                              </div>
                         ) : (
                              messages.map((msg) => (
                                   <div key={msg.$id}>
                                        {/* User question */}
                                        <div className="flex justify-start pl-10 md:pl-12 relative mb-4">
                                             <div className="absolute left-0 top-0 text-base font-mono text-text-tertiary tracking-widest w-10 md:w-12 text-center pt-1 border-r border-border-strong mr-2">USR</div>
                                             <div className="border border-border-strong bg-text-primary text-bg-app p-3 md:p-4 max-w-2xl text-base font-mono uppercase tracking-wider leading-relaxed">
                                                  <span className="opacity-50 mr-2">&gt;</span>{msg.question}
                                             </div>
                                        </div>
                                        {/* AI answer */}
                                        {msg.answer && (
                                             <div className="flex justify-start pl-10 md:pl-12 relative">
                                                  <div className="absolute left-0 top-0 text-base font-mono tracking-widest w-10 md:w-12 text-center pt-1 border-r border-border-strong mr-2 font-bold flex flex-col items-center">
                                                       <Sparkles className="w-3 h-3 mb-1" />SYS
                                                  </div>
                                                  <div className="border border-border-strong bg-bg-surface p-4 md:p-6 max-w-4xl text-base font-mono tracking-wider leading-relaxed">
                                                       <div className="flex items-center justify-between border-b border-border-strong pb-3 mb-3">
                                                            <span className="bg-text-primary text-bg-app px-2 py-1 text-[10px] tracking-widest font-bold">QUERY_RESOLVED</span>
                                                            {msg.confidence && (
                                                                 <div className="flex items-center gap-2 border border-border-strong px-2 py-1 bg-bg-subtle">
                                                                      <CheckCircle2 className="w-3 h-3" strokeWidth={2} />
                                                                      <span className="text-[10px] font-bold tracking-widest shrink-0">CONFIDENCE: {msg.confidence}</span>
                                                                 </div>
                                                            )}
                                                       </div>
                                                       <p className="uppercase">{msg.answer}</p>
                                                       {(() => {
                                                            const cits = parseCitations(msg);
                                                            if (!cits.length) return null;
                                                            return (
                                                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 pt-4 border-t border-border-strong border-dashed">
                                                                      {cits.map((cit: { snippet?: string; fileName?: string; reference?: string }, i: number) => (
                                                                           <div key={i} className="border border-border-strong p-3">
                                                                                <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest mb-2 border-b border-border-strong pb-1">EVIDENCE NO.{i + 1}</p>
                                                                                {cit.snippet && <p className="text-base italic leading-normal mb-2">&quot;{cit.snippet}&quot;</p>}
                                                                                <div className="flex items-center gap-2 text-text-tertiary">
                                                                                     <FileText className="w-3 h-3 shrink-0" />
                                                                                     <span className="text-[10px] break-all uppercase">{cit.fileName} {"//"} {cit.reference}</span>
                                                                                </div>
                                                                           </div>
                                                                      ))}
                                                                 </div>
                                                            );
                                                       })()}
                                                  </div>
                                             </div>
                                        )}
                                   </div>
                              ))
                         )}

                         {isProcessing && (
                              <div className="flex justify-start pl-10 md:pl-12 relative">
                                   <div className="absolute left-0 top-0 text-base font-mono tracking-widest w-10 md:w-12 text-center pt-1 border-r border-border-strong mr-2 font-bold flex flex-col items-center">
                                        <Sparkles className="w-3 h-3 mb-1 animate-spin" />SYS
                                   </div>
                                   <div className="border border-border-strong bg-bg-surface p-6">
                                        <div className="flex items-center gap-3">
                                             <Loader2 className="w-4 h-4 animate-spin" />
                                             <span className="text-base font-mono tracking-widest uppercase text-text-tertiary">ANALYZING NOTES...</span>
                                        </div>
                                   </div>
                              </div>
                         )}
                         <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-3 md:p-4 bg-bg-surface border-t border-border-strong shrink-0">
                         <form
                              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                              className="flex items-center border border-border-strong relative focus-within:ring-1 focus-within:ring-text-primary bg-bg-surface h-12 md:h-14"
                         >
                              <div className="h-full border-r border-border-strong flex items-center px-3 md:px-4 font-mono font-bold text-base tracking-widest uppercase w-20 md:w-24 shrink-0">
                                   INPUT<span className="animate-ping ml-2 inline-flex h-1.5 w-1.5 bg-text-primary" />
                              </div>
                              <input
                                   type="text"
                                   value={input}
                                   onChange={(e) => setInput(e.target.value)}
                                   disabled={isProcessing || !activeSubjectId}
                                   placeholder={activeSubject ? `QUERY: ${activeSubject.name.toUpperCase()}...` : "SELECT A SUBJECT..."}
                                   className="flex-1 h-full bg-transparent px-3 md:px-4 text-base font-mono uppercase focus:outline-none placeholder:text-text-tertiary disabled:opacity-30"
                              />
                              <button
                                   type="submit"
                                   disabled={isProcessing || !activeSubjectId || !input.trim()}
                                   className="h-full border-l border-border-strong w-12 md:w-14 flex items-center justify-center hover:bg-text-primary hover:text-bg-app cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                              >
                                   <Send className="w-4 h-4" strokeWidth={1.5} />
                              </button>
                         </form>
                    </div>
               </div>
          </div>
     );
}
