"use client";

<<<<<<< HEAD
import { useEffect, useState, useCallback, useRef } from "react";
import { Send, Library, FileText, CheckCircle2, Sparkles, ChevronDown, Loader2, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { fetchSubjects, fetchNoteFiles, fetchChatMessages, sendChatMessage, clearChatHistory } from "@/lib/api";
import { useSearchParams } from "next/navigation";
import type { Subject, NoteFile, ChatMessage } from "@/lib/types";
=======
import { useState } from "react";
import { Send, Library, FileText, CheckCircle2, ChevronDown, Sparkles } from "lucide-react";

type SubjectId = 1 | 2;

const subjectsData = {
     1: {
          id: 1,
          name: "ADVANCED CALCULUS",
          notesCount: 24,
          sources: [
               { name: "CHAPTER_3_DERIVATIVES.PDF", date: "INDEXED TODAY", active: true },
               { name: "LECTURE_01_LIMITS.PDF", date: "INDEXED 3 DAYS AGO", active: false }
          ],
          messages: [
               { role: "user", text: "EXPLAIN THE CHAIN RULE IN SIMPLE TERMS AND PROVIDE AN EXAMPLE." },
               {
                    role: "assistant",
                    text: "THE CHAIN RULE IS A FORMULA TO COMPUTE THE DERIVATIVE OF A COMPOSITE FUNCTION. IF YOU HAVE A FUNCTION NESTED INSIDE ANOTHER FUNCTION, LIKE F(G(X)), THE CHAIN RULE TELLS YOU TO TAKE THE DERIVATIVE OF THE OUTER FUNCTION F, LEAVING THE INNER FUNCTION G UNTOUCHED, AND MULTIPLY IT BY THE DERIVATIVE OF THE INNER FUNCTION.",
                    formula: "FORMULA: d/dx [f(g(x))] = f'(g(x)) * g'(x)",
                    snippet: "\"TO DIFFERENTIATE COMPOSED FUNCTIONS, WE APPLY THE CHAIN RULE: dy/dx = (dy/du) * (du/dx). FOR EXAMPLE, IF y = sin(x²), WE LET u = x².\"",
                    citation: "CHAPTER_3_DERIVATIVES.PDF // PAGE 14.3.4",
                    confidence: "CONFIDENCE: HIGH"
               }
          ]
     },
     2: {
          id: 2,
          name: "ORGANIC CHEMISTRY",
          notesCount: 18,
          sources: [
               { name: "WEEK_4_REACTIONS.PDF", date: "INDEXED YESTERDAY", active: true },
               { name: "LAB_MANUAL.TXT", date: "INDEXED 5 DAYS AGO", active: false }
          ],
          messages: [
               { role: "user", text: "WHAT IS AN SN2 REACTION?" },
               {
                    role: "assistant",
                    text: "AN SN2 REACTION IS A DIRECT DISPLACEMENT PROCESS. THE NUCLEOPHILE ATTACKS THE ELECTROPHILIC CARBON EXACTLY AS THE LEAVING GROUP DETACHES, ALL IN ONE CONCERTED STEP. THIS ALWAYS RESULTS IN THE INVERSION OF STEREOCHEMISTRY.",
                    formula: "RATE = k[NUCLEOPHILE][SUBSTRATE]",
                    snippet: "\"SN2 REACTIONS PROCEED WITH STEREOCHEMICAL INVERSION. THEY ARE FAVORED BY STRONG NUCLEOPHILES.\"",
                    citation: "WEEK_4_REACTIONS.PDF // PAGE 22.4.1",
                    confidence: "CONFIDENCE: HIGH"
               }
          ]
     }
};
>>>>>>> 065bb2dba4e726280e7710154014d2849637cf78

export default function ChatPage() {
     const { user, loading: authLoading } = useAuth();
     const searchParams = useSearchParams();
     const messagesEndRef = useRef<HTMLDivElement>(null);

     const [subjects, setSubjects] = useState<Subject[]>([]);
     const [activeSubjectId, setActiveSubjectId] = useState("");
     const [files, setFiles] = useState<NoteFile[]>([]);
     const [messages, setMessages] = useState<ChatMessage[]>([]);
     const [input, setInput] = useState("");
     const [loading, setLoading] = useState(true);
     const [sending, setSending] = useState(false);
     const [error, setError] = useState("");

     // Load subjects
     const loadSubjects = useCallback(async () => {
          if (!user) return;
          try {
               const data = await fetchSubjects(user.$id);
               setSubjects(data);
               // Use subject from query param, or first available
               const paramSubject = searchParams.get("subject");
               if (paramSubject && data.find((s) => s.$id === paramSubject)) {
                    setActiveSubjectId(paramSubject);
               } else if (data.length > 0 && !activeSubjectId) {
                    setActiveSubjectId(data[0].$id);
               }
          } catch (err: unknown) {
               setError(err instanceof Error ? err.message : "Failed to load subjects");
          } finally {
               setLoading(false);
          }
     }, [user, searchParams, activeSubjectId]);

     // Load files for context panel
     const loadFiles = useCallback(async () => {
          if (!user || !activeSubjectId) { setFiles([]); return; }
          try {
               const data = await fetchNoteFiles(user.$id, activeSubjectId);
               setFiles(data);
          } catch { /* non-critical */ }
     }, [user, activeSubjectId]);

     // Load chat messages
     const loadMessages = useCallback(async () => {
          if (!user || !activeSubjectId) { setMessages([]); return; }
          try {
               const data = await fetchChatMessages(user.$id, activeSubjectId);
               setMessages(data);
          } catch (err: unknown) {
               setError(err instanceof Error ? err.message : "Failed to load messages");
          }
     }, [user, activeSubjectId]);

     useEffect(() => {
          if (!authLoading && user) loadSubjects();
          if (!authLoading && !user) setLoading(false);
     }, [authLoading, user, loadSubjects]);

     useEffect(() => {
          if (activeSubjectId) {
               loadFiles();
               loadMessages();
          }
     }, [activeSubjectId, loadFiles, loadMessages]);

     // Auto-scroll to bottom
     useEffect(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
     }, [messages]);

     // Send message
     const handleSend = async () => {
          if (!user || !activeSubjectId || !input.trim()) return;
          const question = input.trim();
          setInput("");
          setSending(true);
          setError("");
          try {
               await sendChatMessage({
                    userId: user.$id,
                    subjectId: activeSubjectId,
                    question,
               });
               await loadMessages();
          } catch (err: unknown) {
               setError(err instanceof Error ? err.message : "Failed to send message");
          } finally {
               setSending(false);
          }
     };

     // Clear chat
     const handleClear = async () => {
          if (!user || !activeSubjectId) return;
          if (!confirm("Clear all chat history for this subject?")) return;
          try {
               await clearChatHistory(user.$id, activeSubjectId);
               setMessages([]);
          } catch (err: unknown) {
               setError(err instanceof Error ? err.message : "Failed to clear chat");
          }
     };

     const activeSubject = subjects.find((s) => s.$id === activeSubjectId);

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
                    <p className="text-text-secondary">Please sign in to use the chat.</p>
               </div>
          );
     }

     return (
          <div className="flex h-full bg-white font-sans text-black relative">
               {/* Background Grid Pattern */}
               <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-0"
                    style={{ backgroundImage: "linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)", backgroundSize: "32px 32px" }}>
               </div>

<<<<<<< HEAD
                         {subjects.length > 0 ? (
                              <div className="relative mt-2">
                                   <select
                                        className="w-full appearance-none bg-bg-app border border-border-default rounded-lg pl-10 pr-10 py-3 text-base font-semibold text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
                                        value={activeSubjectId}
                                        onChange={(e) => setActiveSubjectId(e.target.value)}
                                   >
                                        {subjects.map((s) => (
                                             <option key={s.$id} value={s.$id}>{s.name}</option>
                                        ))}
                                   </select>
                                   <Library className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary pointer-events-none" />
                                   <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary pointer-events-none" />
                              </div>
                         ) : (
                              <p className="text-sm text-text-tertiary mt-2">No subjects found.</p>
                         )}

                         <p className="text-sm text-text-secondary mt-3">{files.length} file{files.length !== 1 ? "s" : ""} in context</p>
                    </div>

                    <div className="p-6 flex-1 overflow-y-auto">
                         <h3 className="text-sm font-semibold text-text-primary mb-4">Context Sources</h3>
                         {files.length === 0 ? (
                              <p className="text-xs text-text-tertiary">No files uploaded for this subject.</p>
                         ) : (
                              <ul className="space-y-4">
                                   {files.map((f) => (
                                        <li key={f.$id} className="flex items-start gap-3 text-sm">
                                             <FileText className="w-4 h-4 mt-0.5 shrink-0 text-brand-500" />
                                             <div>
                                                  <p className="font-medium text-text-primary">{f.fileName}</p>
                                                  <p className="text-xs text-text-tertiary mt-0.5">
                                                       {new Date(f.uploadedAt).toLocaleDateString()}
                                                  </p>
                                             </div>
                                        </li>
                                   ))}
                              </ul>
                         )}
                    </div>
               </div>

               {/* Right Column: Chat Interface */}
               <div className="flex-1 flex flex-col h-full bg-bg-app min-w-0">
                    {/* Chat Header */}
                    <div className="h-16 border-b border-border-subtle bg-bg-surface flex items-center px-8 shrink-0 justify-between">
                         <h3 className="font-semibold text-text-primary">Study Assistant</h3>
                         {messages.length > 0 && (
                              <button
                                   onClick={handleClear}
                                   className="text-xs text-text-tertiary hover:text-red-600 flex items-center gap-1 transition-colors"
                              >
                                   <Trash2 className="w-3 h-3" />
                                   Clear
                              </button>
                         )}
                    </div>

                    {error && (
                         <div className="mx-8 mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
                              {error}
                         </div>
                    )}

                    {/* Chat Messages */}
                    <div className="flex-1 overflow-y-auto p-8 space-y-8">
                         {messages.length === 0 && !sending && (
                              <div className="flex items-center justify-center h-full">
                                   <div className="text-center">
                                        <Sparkles className="w-8 h-8 text-brand-300 mx-auto mb-3" />
                                        <p className="text-text-secondary text-sm">
                                             {activeSubject ? `Ask a question about ${activeSubject.name}` : "Select a subject to start chatting"}
                                        </p>
                                   </div>
                              </div>
                         )}

                         {messages.map((msg) => (
                              <div key={msg.$id}>
                                   {/* User question */}
                                   <div className="flex justify-end mb-6">
                                        <div className="bg-brand-600 text-white p-5 rounded-2xl rounded-tr-sm max-w-2xl shadow-sm">
                                             <p className="text-sm leading-relaxed font-medium">{msg.question}</p>
                                        </div>
                                   </div>

                                   {/* Assistant answer */}
                                   {msg.answer && (
                                        <div className="flex justify-start">
                                             <div className="bg-bg-surface border border-border-default p-6 rounded-2xl rounded-tl-sm max-w-3xl shadow-sm">
                                                  <div className="flex items-center justify-between mb-4">
                                                       <div className="flex items-center gap-2 text-brand-700 font-semibold text-sm">
                                                            <div className="w-6 h-6 rounded-full bg-brand-100 flex items-center justify-center shrink-0">
                                                                 <Sparkles className="w-3 h-3 text-brand-700" />
                                                            </div>
                                                            Study Assistant
                                                       </div>
                                                       {msg.confidence && (
                                                            <div className="bg-[#Edf7ed] text-[#1E4620] border border-[#C5E1A5] px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5">
                                                                 <CheckCircle2 className="w-3 h-3 shrink-0" />
                                                                 {msg.confidence} Confidence
                                                            </div>
                                                       )}
=======
               {/* Left Column: Context Archive */}
               <div className="w-80 border-r border-black bg-white flex flex-col shrink-0 relative z-10">
                    <div className="border-b border-black">
                         <div className="bg-black text-white px-4 py-2 flex items-center gap-2">
                              <Library className="w-4 h-4" strokeWidth={1.5} />
                              <span className="text-[10px] font-mono font-bold uppercase tracking-widest">CONTEXT REGISTRY</span>
                         </div>

                         <div className="p-4 border-b border-black">
                              <div className="relative border border-black bg-white group hover:bg-black/5">
                                   <select
                                        className="w-full appearance-none bg-transparent pt-6 pb-2 px-4 text-xs font-bold uppercase tracking-widest focus:outline-none cursor-pointer text-black"
                                        value={activeSubjectId}
                                        onChange={(e) => setActiveSubjectId(Number(e.target.value) as SubjectId)}
                                   >
                                        <option value={1}>ADVANCED CALCULUS</option>
                                        <option value={2}>ORGANIC CHEMISTRY</option>
                                   </select>
                                   <label className="absolute top-2 left-4 text-[8px] font-mono tracking-widest text-black/50 pointer-events-none">TARGET INDEX</label>
                                   <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black pointer-events-none" />
                              </div>

                              <div className="flex justify-between items-center mt-4">
                                   <span className="text-[10px] font-mono tracking-widest uppercase text-black/50">VOLUMES LOADED:</span>
                                   <span className="text-xs font-mono font-bold tracking-widest text-black border border-black px-2">{activeSubject.notesCount}</span>
                              </div>
                         </div>
                    </div>

                    <div className="flex-1 overflow-y-auto w-full p-4">
                         <div className="text-[10px] font-mono tracking-widest text-black/50 uppercase mb-4 border-b border-black pb-2">
                              ACTIVE SOURCES LISTING
                         </div>
                         <ul className="space-y-4">
                              {activeSubject.sources.map((source, index) => (
                                   <li key={index} className="flex items-start gap-4">
                                        <div className={`w-8 h-8 flex items-center justify-center shrink-0 border ${source.active ? 'border-black bg-black text-white' : 'border-black/30 text-black/30'}`}>
                                             <FileText className="w-4 h-4" strokeWidth={1.5} />
                                        </div>
                                        <div className="pt-0.5">
                                             <p className={`text-[10px] font-mono font-bold tracking-widest uppercase leading-tight ${source.active ? 'text-black' : 'text-black/50'}`}>
                                                  {source.name}
                                             </p>
                                             <p className="text-[9px] font-mono text-black/40 mt-1 uppercase tracking-widest">{source.date}</p>
                                        </div>
                                   </li>
                              ))}
                         </ul>
                    </div>
               </div>

               {/* Right Column: Terminal Chat Interface */}
               <div className="flex-1 flex flex-col h-full bg-white min-w-0 relative z-10 border-r border-black">

                    {/* Terminal Header */}
                    <div className="h-12 border-b border-black flex items-center justify-between px-6 shrink-0 bg-white shadow-none">
                         <div className="flex items-center gap-3">
                              <div className="w-3 h-3 bg-black animate-pulse"></div>
                              <h3 className="text-[10px] font-mono font-bold tracking-widest uppercase text-black">SYS.QUERY_PROCESS_TERMINAL</h3>
                         </div>
                         <div className="text-[10px] font-mono tracking-widest uppercase text-black/50">I/O MODE: ACTIVE</div>
                    </div>

                    {/* Message Log */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">

                         {activeSubject.messages.map((msg, idx) => (
                              msg.role === "user" ? (
                                   <div key={idx} className="flex justify-start pl-12 relative group">
                                        <div className="absolute left-0 top-0 text-[10px] font-mono text-black/30 tracking-widest w-12 text-center pt-1 border-r border-black mr-2">
                                             USR
                                        </div>
                                        <div className="border border-black bg-black text-white p-4 max-w-2xl text-xs font-mono uppercase tracking-wider leading-relaxed">
                                             <span className="text-white/50 mr-2">&gt;</span>{msg.text}
                                        </div>
                                   </div>
                              ) : (
                                   <div key={idx} className="flex justify-start pl-12 relative group">
                                        <div className="absolute left-0 top-0 text-[10px] font-mono text-black tracking-widest w-12 text-center pt-1 border-r border-black mr-2 font-bold flex flex-col items-center">
                                             <Sparkles className="w-3 h-3 mb-1" />
                                             SYS
                                        </div>

                                        <div className="border border-black bg-white p-6 max-w-4xl text-xs font-mono uppercase tracking-wider leading-relaxed">

                                             <div className="flex items-center justify-between border-b border-black pb-4 mb-4">
                                                  <span className="bg-black text-white px-2 py-1 text-[9px] tracking-widest font-bold">QUERY_RESOLVED</span>
                                                  <div className="flex items-center gap-2 border border-black px-2 py-1 bg-black/5">
                                                       <CheckCircle2 className="w-3 h-3 text-black" strokeWidth={2} />
                                                       <span className="text-[9px] font-bold tracking-widest font-mono shrink-0">{msg.confidence}</span>
>>>>>>> 065bb2dba4e726280e7710154014d2849637cf78
                                                  </div>
                                                  <p className="text-sm text-text-primary leading-relaxed">{msg.answer}</p>
                                             </div>
<<<<<<< HEAD
=======

                                             <div className="space-y-4 text-black">
                                                  <p>{msg.text}</p>

                                                  {msg.formula && (
                                                       <div className="border border-black p-3 bg-[#f0f0f0] flex gap-3 items-center text-black">
                                                            <div className="w-4 h-4 bg-black shrink-0 flex items-center justify-center font-bold text-white leading-none">∑</div>
                                                            <span>{msg.formula}</span>
                                                       </div>
                                                  )}

                                                  <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-black border-dashed">
                                                       {msg.snippet && (
                                                            <div className="border border-black p-3">
                                                                 <p className="text-[9px] font-bold text-black/50 uppercase tracking-widest mb-2 border-b border-black pb-1">EXTRACTED EVIDENCE NO.1</p>
                                                                 <p className="text-[10px] text-black italic leading-normal">{msg.snippet}</p>
                                                            </div>
                                                       )}

                                                       {msg.citation && (
                                                            <div className="border border-black p-3 bg-black flex flex-col justify-between">
                                                                 <p className="text-[9px] font-bold text-white/50 uppercase tracking-widest mb-2 border-b border-white/30 pb-1">CITATION REF FILE</p>
                                                                 <div className="flex items-center gap-2 text-white mt-auto">
                                                                      <FileText className="w-4 h-4 shrink-0" />
                                                                      <span className="text-[9px] break-all">{msg.citation}</span>
                                                                 </div>
                                                            </div>
                                                       )}
                                                  </div>
                                             </div>

>>>>>>> 065bb2dba4e726280e7710154014d2849637cf78
                                        </div>
                                   )}
                              </div>
                         ))}

                         {sending && (
                              <div className="flex justify-start">
                                   <div className="bg-bg-surface border border-border-default p-6 rounded-2xl rounded-tl-sm shadow-sm">
                                        <Loader2 className="w-5 h-5 animate-spin text-brand-500" />
                                   </div>
                              </div>
                         )}

                         <div ref={messagesEndRef} />
                    </div>

                    {/* Input Terminal */}
                    <div className="p-4 bg-white border-t border-black shrink-0 relative">
                         <div className="flex items-center border border-black relative group focus-within:ring-1 focus-within:ring-black focus-within:bg-black/5 bg-white transition-none h-14">
                              <div className="h-full border-r border-black flex items-center px-4 font-mono font-bold text-[10px] tracking-widest text-black uppercase w-24">
                                   INPUT<span className="animate-ping ml-2 inline-flex h-1.5 w-1.5 bg-black"></span>
                              </div>
                              <input
                                   type="text"
<<<<<<< HEAD
                                   value={input}
                                   onChange={(e) => setInput(e.target.value)}
                                   onKeyDown={(e) => e.key === "Enter" && !sending && handleSend()}
                                   placeholder={activeSubject ? `Ask a question about ${activeSubject.name}...` : "Select a subject first…"}
                                   disabled={!activeSubjectId || sending}
                                   className="w-full bg-bg-subtle border border-border-default rounded-xl pl-5 pr-14 py-4 text-sm text-text-primary focus:outline-none shadow-sm disabled:opacity-50"
                              />
                              <button
                                   onClick={handleSend}
                                   disabled={!input.trim() || sending || !activeSubjectId}
                                   className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-brand-600 text-white rounded-lg flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                   <Send className="w-4 h-4 ml-0.5 shrink-0" />
=======
                                   placeholder={`QUERY INDEX: ${activeSubject.name}...`}
                                   className="flex-1 h-full bg-transparent px-4 text-xs font-mono uppercase text-black focus:outline-none placeholder:text-black/30"
                              />
                              <button className="h-full border-l border-black w-14 flex items-center justify-center hover:bg-black hover:text-white transition-none text-black group-focus-within:bg-black group-focus-within:text-white cursor-pointer group-hover:bg-black/5">
                                   <span className="sr-only">Transmit</span>
                                   <Send className="w-4 h-4" strokeWidth={1.5} />
>>>>>>> 065bb2dba4e726280e7710154014d2849637cf78
                              </button>
                         </div>
                    </div>
               </div>
          </div>
     );
}
