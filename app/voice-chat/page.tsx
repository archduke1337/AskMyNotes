"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import {
     Mic,
     MicOff,
     Volume2,
     VolumeX,
     Loader2,
     FileText,
     CheckCircle2,
     ChevronDown,
     Sparkles,
     Trash2,
     AlertTriangle,
} from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { useVoice } from "@/lib/hooks/useVoice";
import { fetchSubjects, sendVoiceChatMessage } from "@/lib/api";
import type { Subject } from "@/lib/types";
import type { ConversationTurn, VoiceChatResponse } from "@/lib/api";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

// ── Message types for the UI ──────────────────────────────────────────
interface VoiceMessage {
     id: string;
     role: "user" | "assistant";
     text: string;
     confidence?: "High" | "Medium" | "Low";
     citations?: { fileName: string; reference: string; snippet: string }[];
     timestamp: Date;
}

export default function VoiceChatPage() {
     const { user, loading: authLoading } = useAuth();
     const searchParams = useSearchParams();
     const {
          sttSupported,
          ttsSupported,
          isListening,
          isSpeaking,
          transcript,
          interimTranscript,
          startListening,
          stopListening,
          speak,
          stopSpeaking,
          clearTranscript,
          error: voiceError,
     } = useVoice();

     // ── State ────────────────────────────────────────────────────────────
     const [subjects, setSubjects] = useState<Subject[]>([]);
     const [activeSubjectId, setActiveSubjectId] = useState("");
     const [messages, setMessages] = useState<VoiceMessage[]>([]);
     const [isProcessing, setIsProcessing] = useState(false);
     const [autoSpeak, setAutoSpeak] = useState(true);
     const [loadingSubjects, setLoadingSubjects] = useState(true);

     const messagesEndRef = useRef<HTMLDivElement>(null);
     const conversationHistoryRef = useRef<ConversationTurn[]>([]);

     useGSAP(() => {
          const cards = gsap.utils.toArray<HTMLElement>('.gsap-hover');

          const onEnter = (e: Event) => {
               const target = e.currentTarget as HTMLElement;
               gsap.to(target, { y: -2, backgroundColor: "rgba(0,0,0,0.05)", duration: 0.15, ease: "power1.out" });
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
     }, [messages, activeSubjectId]);

     // ── Load subjects ────────────────────────────────────────────────────
     const loadSubjects = useCallback(async () => {
          if (!user) return;
          try {
               const data = await fetchSubjects(user.$id);
               setSubjects(data);
               const param = searchParams.get("subject");
               if (param && data.find((s) => s.$id === param)) {
                    setActiveSubjectId(param);
               } else if (data.length > 0) {
                    setActiveSubjectId(data[0].$id);
               }
          } catch { /* handled */ } finally {
               setLoadingSubjects(false);
          }
     }, [user, searchParams]);

     useEffect(() => {
          if (!authLoading && user) loadSubjects();
          if (!authLoading && !user) setLoadingSubjects(false);
     }, [authLoading, user, loadSubjects]);

     // ── Auto-scroll ─────────────────────────────────────────────────────
     useEffect(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
     }, [messages]);

     // ── When transcript finalizes, auto-send ─────────────────────────────
     useEffect(() => {
          if (transcript && !isListening && !isProcessing) {
               handleSendQuestion(transcript);
               clearTranscript();
          }
          // eslint-disable-next-line react-hooks/exhaustive-deps
     }, [transcript, isListening]);

     // ── Send question to AI ──────────────────────────────────────────────
     const handleSendQuestion = async (question: string) => {
          if (!user || !activeSubjectId || !question.trim()) return;

          const activeSubject = subjects.find((s) => s.$id === activeSubjectId);
          if (!activeSubject) return;

          // Add user message
          const userMsg: VoiceMessage = {
               id: `u-${Date.now()}`,
               role: "user",
               text: question.trim(),
               timestamp: new Date(),
          };
          setMessages((prev) => [...prev, userMsg]);

          // Update conversation history
          conversationHistoryRef.current.push({
               role: "user",
               content: question.trim(),
          });

          setIsProcessing(true);

          try {
               const response: VoiceChatResponse = await sendVoiceChatMessage({
                    userId: user.$id,
                    subjectId: activeSubjectId,
                    subjectName: activeSubject.name,
                    question: question.trim(),
                    conversationHistory: conversationHistoryRef.current.slice(-10),
               });

               const assistantMsg: VoiceMessage = {
                    id: `a-${Date.now()}`,
                    role: "assistant",
                    text: response.answer,
                    confidence: response.confidence,
                    citations: response.citations,
                    timestamp: new Date(),
               };
               setMessages((prev) => [...prev, assistantMsg]);

               // Update conversation history
               conversationHistoryRef.current.push({
                    role: "assistant",
                    content: response.answer,
               });

               // Auto-speak the response
               if (autoSpeak && ttsSupported) {
                    speak(response.answer);
               }
          } catch (err) {
               const errMsg = err instanceof Error ? err.message : "Failed to get response";
               const errorMsg: VoiceMessage = {
                    id: `e-${Date.now()}`,
                    role: "assistant",
                    text: `Error: ${errMsg}`,
                    confidence: "Low",
                    citations: [],
                    timestamp: new Date(),
               };
               setMessages((prev) => [...prev, errorMsg]);
          } finally {
               setIsProcessing(false);
          }
     };

     // ── Clear conversation ───────────────────────────────────────────────
     const clearConversation = () => {
          setMessages([]);
          conversationHistoryRef.current = [];
          stopSpeaking();
     };

     // ── Subject change resets conversation ───────────────────────────────
     const handleSubjectChange = (newId: string) => {
          setActiveSubjectId(newId);
          clearConversation();
     };

     const activeSubject = subjects.find((s) => s.$id === activeSubjectId);

     // ── Auth loading ─────────────────────────────────────────────────────
     if (authLoading || loadingSubjects) {
          return (
               <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-5 h-5 animate-spin text-black/50" />
               </div>
          );
     }

     if (!user) {
          return (
               <div className="flex items-center justify-center h-full font-mono text-base uppercase tracking-widest text-black/50">
                    Authentication required. Please sign in.
               </div>
          );
     }

     return (
          <div className="flex h-full bg-white font-sans text-black relative">
               {/* Background Grid */}
               <div
                    className="absolute inset-0 pointer-events-none opacity-[0.03] z-0"
                    style={{
                         backgroundImage:
                              "linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)",
                         backgroundSize: "32px 32px",
                    }}
               />

               {/* ── Left Panel: Voice Control ─────────────────────────────── */}
               <div className="w-80 border-r border-black bg-white flex flex-col shrink-0 relative z-10">
                    {/* Subject Selector */}
                    <div className="border-b border-black">
                         <div className="bg-black text-white px-4 py-2 flex items-center gap-2">
                              <Volume2 className="w-4 h-4" strokeWidth={1.5} />
                              <span className="text-base font-mono font-bold uppercase tracking-widest">
                                   VOICE TERMINAL
                              </span>
                         </div>

                         <div className="p-4 border-b border-black">
                              <div className="relative border border-black bg-white group hover:bg-black/5">
                                   <select
                                        className="w-full appearance-none bg-transparent pt-6 pb-2 px-4 text-base font-bold uppercase tracking-widest focus:outline-none cursor-pointer text-black"
                                        value={activeSubjectId}
                                        onChange={(e) => handleSubjectChange(e.target.value)}
                                   >
                                        {subjects.length === 0 && (
                                             <option value="">NO SUBJECTS</option>
                                        )}
                                        {subjects.map((s) => (
                                             <option key={s.$id} value={s.$id}>
                                                  {s.name.toUpperCase()}
                                             </option>
                                        ))}
                                   </select>
                                   <label className="absolute top-2 left-4 text-[8px] font-mono tracking-widest text-black/50 pointer-events-none">
                                        TARGET SUBJECT
                                   </label>
                                   <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black pointer-events-none" />
                              </div>
                         </div>
                    </div>

                    {/* Voice Control Center */}
                    <div className="flex-1 flex flex-col items-center justify-center p-8 gap-6">
                         {/* Microphone Button */}
                         <button
                              onClick={() => {
                                   if (isListening) {
                                        stopListening();
                                   } else {
                                        if (isSpeaking) stopSpeaking();
                                        startListening();
                                   }
                              }}
                              disabled={!sttSupported || isProcessing || !activeSubjectId}
                              className={`relative w-28 h-28 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer
                                   ${isListening
                                        ? "border-black bg-black text-white scale-110"
                                        : "border-black bg-white text-black hover:bg-black/5"
                                   }
                                   ${(!sttSupported || isProcessing || !activeSubjectId) ? "opacity-30 cursor-not-allowed" : ""}
                              `}
                         >
                              {/* Pulse ring when listening */}
                              {isListening && (
                                   <>
                                        <div className="absolute inset-0 rounded-full border-2 border-black animate-ping opacity-20" />
                                        <div className="absolute -inset-2 rounded-full border border-black/30 animate-pulse" />
                                   </>
                              )}

                              {isProcessing ? (
                                   <Loader2 className="w-8 h-8 animate-spin" />
                              ) : isListening ? (
                                   <MicOff className="w-8 h-8" strokeWidth={1.5} />
                              ) : (
                                   <Mic className="w-8 h-8" strokeWidth={1.5} />
                              )}
                         </button>

                         {/* Status Label */}
                         <div className="text-center">
                              <p className="text-base font-mono font-bold tracking-widest uppercase text-black">
                                   {isProcessing
                                        ? "PROCESSING QUERY..."
                                        : isListening
                                             ? "LISTENING — SPEAK NOW"
                                             : isSpeaking
                                                  ? "SPEAKING RESPONSE"
                                                  : "PRESS TO SPEAK"}
                              </p>
                              {interimTranscript && (
                                   <p className="text-base font-mono text-black/50 mt-2 max-w-48 wrap-break-word">
                                        &quot;{interimTranscript}&quot;
                                   </p>
                              )}
                         </div>

                         {/* Waveform indicator */}
                         {(isListening || isSpeaking) && (
                              <div className="flex items-center gap-1 h-8">
                                   {[...Array(7)].map((_, i) => (
                                        <div
                                             key={i}
                                             className="w-1 bg-black rounded-full"
                                             style={{
                                                  height: `${12 + Math.random() * 20}px`,
                                                  animation: `pulse ${0.4 + i * 0.1}s ease-in-out infinite alternate`,
                                             }}
                                        />
                                   ))}
                              </div>
                         )}

                         {/* Voice error */}
                         {voiceError && (
                              <div className="flex items-center gap-2 text-base font-mono text-black/60 border border-black/30 px-3 py-2">
                                   <AlertTriangle className="w-3 h-3 shrink-0" />
                                   {voiceError}
                              </div>
                         )}

                         {!sttSupported && (
                              <p className="text-base font-mono text-black/40 text-center px-4">
                                   SPEECH RECOGNITION NOT SUPPORTED.
                                   <br />
                                   USE CHROME OR EDGE.
                              </p>
                         )}
                    </div>

                    {/* Bottom Controls */}
                    <div className="border-t border-black p-4 space-y-3">
                         {/* Auto-speak toggle */}
                         <button
                              onClick={() => setAutoSpeak(!autoSpeak)}
                              className="w-full flex items-center justify-between px-3 py-2 border border-black text-base font-mono tracking-widest uppercase hover:bg-black/5 cursor-pointer"
                         >
                              <span className="flex items-center gap-2">
                                   {autoSpeak ? (
                                        <Volume2 className="w-3 h-3" />
                                   ) : (
                                        <VolumeX className="w-3 h-3" />
                                   )}
                                   AUTO-SPEAK: {autoSpeak ? "ON" : "OFF"}
                              </span>
                         </button>

                         {/* Stop speaking */}
                         {isSpeaking && (
                              <button
                                   onClick={stopSpeaking}
                                   className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-black bg-black text-white text-base font-mono tracking-widest uppercase cursor-pointer"
                              >
                                   <VolumeX className="w-3 h-3" />
                                   STOP SPEAKING
                              </button>
                         )}

                         {/* Clear conversation */}
                         {messages.length > 0 && (
                              <button
                                   onClick={clearConversation}
                                   className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-black/30 text-black/60 text-base font-mono tracking-widest uppercase hover:bg-black/5 cursor-pointer"
                              >
                                   <Trash2 className="w-3 h-3" />
                                   CLEAR SESSION
                              </button>
                         )}
                    </div>
               </div>

               {/* ── Right Panel: Conversation Transcript ──────────────────── */}
               <div className="flex-1 flex flex-col h-full bg-white min-w-0 relative z-10">
                    {/* Header */}
                    <div className="h-12 border-b border-black flex items-center justify-between px-6 shrink-0 bg-white">
                         <div className="flex items-center gap-3">
                              <div className={`w-3 h-3 ${isListening || isSpeaking || isProcessing ? "bg-black animate-pulse" : "bg-black/30"}`} />
                              <h3 className="text-base font-mono font-bold tracking-widest uppercase text-black">
                                   SYS.VOICE_TEACHER_TERMINAL
                              </h3>
                         </div>
                         <div className="flex items-center gap-4">
                              {activeSubject && (
                                   <span className="text-base font-mono tracking-widest uppercase text-black/50">
                                        SCOPE: {activeSubject.name.toUpperCase()}
                                   </span>
                              )}
                              <span className="text-base font-mono tracking-widest uppercase text-black/50">
                                   TURNS: {messages.filter((m) => m.role === "user").length}
                              </span>
                         </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                         {messages.length === 0 && (
                              <div className="flex flex-col items-center justify-center h-full text-center">
                                   <div className="w-16 h-16 border-2 border-black/20 rounded-full flex items-center justify-center mb-6">
                                        <Mic className="w-6 h-6 text-black/30" strokeWidth={1.5} />
                                   </div>
                                   <p className="text-base font-mono tracking-widest uppercase text-black/40 mb-2">
                                        VOICE TEACHER READY
                                   </p>
                                   <p className="text-base font-mono text-black/30 max-w-sm leading-relaxed">
                                        PRESS THE MICROPHONE BUTTON AND ASK A QUESTION ABOUT YOUR NOTES.
                                        <br />
                                        FOLLOW-UP QUESTIONS ARE SUPPORTED WITHIN THE SAME SESSION.
                                   </p>
                              </div>
                         )}

                         {messages.map((msg) =>
                              msg.role === "user" ? (
                                   <div key={msg.id} className="flex justify-start pl-12 relative group">
                                        <div className="absolute left-0 top-0 text-base font-mono text-black/30 tracking-widest w-12 text-center pt-1 border-r border-black mr-2">
                                             <Mic className="w-3 h-3 mx-auto mb-1" />
                                             USR
                                        </div>
                                        <div className="border border-black bg-black text-white p-4 max-w-2xl text-base font-mono uppercase tracking-wider leading-relaxed">
                                             <span className="text-white/50 mr-2">&gt;</span>
                                             {msg.text}
                                        </div>
                                   </div>
                              ) : (
                                   <div key={msg.id} className="flex justify-start pl-12 relative group">
                                        <div className="absolute left-0 top-0 text-base font-mono text-black tracking-widest w-12 text-center pt-1 border-r border-black mr-2 font-bold flex flex-col items-center">
                                             <Sparkles className="w-3 h-3 mb-1" />
                                             SYS
                                        </div>

                                        <div className="border border-black bg-white p-6 max-w-4xl text-base font-mono tracking-wider leading-relaxed">
                                             {/* Header with confidence */}
                                             <div className="flex items-center justify-between border-b border-black pb-4 mb-4">
                                                  <span className="bg-black text-white px-2 py-1 text-[10px] tracking-widest font-bold">
                                                       VOICE_RESPONSE
                                                  </span>
                                                  {msg.confidence && (
                                                       <div className="flex items-center gap-2 border border-black px-2 py-1 bg-black/5">
                                                            <CheckCircle2 className="w-3 h-3 text-black" strokeWidth={2} />
                                                            <span className="text-[10px] font-bold tracking-widest font-mono shrink-0">
                                                                 CONFIDENCE: {msg.confidence.toUpperCase()}
                                                            </span>
                                                       </div>
                                                  )}
                                             </div>

                                             {/* Answer text */}
                                             <div className="space-y-4 text-black">
                                                  <p className="uppercase">{msg.text}</p>

                                                  {/* Citations */}
                                                  {msg.citations && msg.citations.length > 0 && (
                                                       <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-black border-dashed">
                                                            {msg.citations.map((cit, i) => (
                                                                 <div key={i} className="border border-black p-3">
                                                                      <p className="text-[10px] font-bold text-black/50 uppercase tracking-widest mb-2 border-b border-black pb-1">
                                                                           {cit.snippet
                                                                                ? `EVIDENCE NO.${i + 1}`
                                                                                : `CITATION REF NO.${i + 1}`}
                                                                      </p>
                                                                      {cit.snippet && (
                                                                           <p className="text-base text-black italic leading-normal mb-2">
                                                                                &quot;{cit.snippet}&quot;
                                                                           </p>
                                                                      )}
                                                                      <div className="flex items-center gap-2 text-black/70 mt-auto">
                                                                           <FileText className="w-3 h-3 shrink-0" />
                                                                           <span className="text-[10px] break-all uppercase">
                                                                                {cit.fileName} // {cit.reference}
                                                                           </span>
                                                                      </div>
                                                                 </div>
                                                            ))}
                                                       </div>
                                                  )}
                                             </div>

                                             {/* Replay button */}
                                             {ttsSupported && (
                                                  <button
                                                       onClick={() => speak(msg.text)}
                                                       className="mt-4 flex items-center gap-2 text-[10px] font-mono tracking-widest uppercase text-black/50 hover:text-black border border-black/20 hover:border-black px-3 py-1.5 cursor-pointer"
                                                  >
                                                       <Volume2 className="w-3 h-3" />
                                                       REPLAY AUDIO
                                                  </button>
                                             )}
                                        </div>
                                   </div>
                              )
                         )}

                         {/* Processing indicator */}
                         {isProcessing && (
                              <div className="flex justify-start pl-12 relative">
                                   <div className="absolute left-0 top-0 text-base font-mono text-black tracking-widest w-12 text-center pt-1 border-r border-black mr-2 font-bold flex flex-col items-center">
                                        <Sparkles className="w-3 h-3 mb-1 animate-spin" />
                                        SYS
                                   </div>
                                   <div className="border border-black bg-white p-6 max-w-4xl">
                                        <div className="flex items-center gap-3">
                                             <Loader2 className="w-4 h-4 animate-spin text-black" />
                                             <span className="text-base font-mono tracking-widest uppercase text-black/50">
                                                  ANALYZING NOTES & GENERATING RESPONSE...
                                             </span>
                                        </div>
                                   </div>
                              </div>
                         )}

                         <div ref={messagesEndRef} />
                    </div>

                    {/* Text Input Fallback */}
                    <div className="p-4 bg-white border-t border-black shrink-0">
                         <form
                              onSubmit={(e) => {
                                   e.preventDefault();
                                   const input = e.currentTarget.elements.namedItem("voiceInput") as HTMLInputElement;
                                   if (input.value.trim()) {
                                        handleSendQuestion(input.value.trim());
                                        input.value = "";
                                   }
                              }}
                              className="flex items-center border border-black relative group focus-within:ring-1 focus-within:ring-black focus-within:bg-black/5 bg-white h-14"
                         >
                              <div className="h-full border-r border-black flex items-center px-4 font-mono font-bold text-base tracking-widest text-black uppercase w-24">
                                   INPUT
                                   <span className="animate-ping ml-2 inline-flex h-1.5 w-1.5 bg-black" />
                              </div>
                              <input
                                   name="voiceInput"
                                   type="text"
                                   disabled={isProcessing || !activeSubjectId}
                                   placeholder={
                                        activeSubject
                                             ? `TYPE OR SPEAK: ${activeSubject.name.toUpperCase()}...`
                                             : "SELECT A SUBJECT FIRST..."
                                   }
                                   className="flex-1 h-full bg-transparent px-4 text-base font-mono uppercase text-black focus:outline-none placeholder:text-black/30 disabled:opacity-30"
                              />
                              <button
                                   type="submit"
                                   disabled={isProcessing || !activeSubjectId}
                                   className="h-full border-l border-black w-14 flex items-center justify-center hover:bg-black hover:text-white text-black cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                              >
                                   <span className="sr-only">Send</span>
                                   <Sparkles className="w-4 h-4" strokeWidth={1.5} />
                              </button>
                         </form>
                    </div>
               </div>
          </div>
     );
}
