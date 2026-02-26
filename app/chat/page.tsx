"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Send, Library, FileText, CheckCircle2, Sparkles, ChevronDown, Loader2, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { fetchSubjects, fetchNoteFiles, fetchChatMessages, sendChatMessage, clearChatHistory } from "@/lib/api";
import { useSearchParams } from "next/navigation";
import type { Subject, NoteFile, ChatMessage } from "@/lib/types";

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
          <div className="flex h-full bg-bg-app">
               {/* Left Column: Active Subject Context */}
               <div className="w-80 border-r border-border-subtle bg-bg-surface flex flex-col shrink-0">
                    <div className="p-6 border-b border-border-subtle">
                         <div className="text-xs font-semibold text-brand-600 uppercase tracking-wider mb-2">Active Subject</div>

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
                                                  </div>
                                                  <p className="text-sm text-text-primary leading-relaxed">{msg.answer}</p>
                                             </div>
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

                    {/* Input Area */}
                    <div className="p-6 bg-bg-surface border-t border-border-subtle shrink-0">
                         <div className="max-w-4xl mx-auto relative focus-within:ring-2 focus-within:ring-brand-500 rounded-xl">
                              <input
                                   type="text"
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
                              </button>
                         </div>
                    </div>
               </div>
          </div>
     );
}
