"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
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
  Power,
  Radio,
} from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { useVoice } from "@/lib/hooks/useVoice";
import { fetchSubjects, sendVoiceChatMessage } from "@/lib/api";
import type { Subject } from "@/lib/types";
import type { ConversationTurn, VoiceChatResponse } from "@/lib/api";

// ── Agent state machine ───────────────────────────────────────────────
type AgentState = "idle" | "listening" | "processing" | "speaking";

// ── Message types for the UI ──────────────────────────────────────────
interface VoiceMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  confidence?: "High" | "Medium" | "Low";
  citations?: { fileName: string; reference: string; snippet: string }[];
  timestamp: Date;
}

function VoiceChatContent() {
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
  const [loadingSubjects, setLoadingSubjects] = useState(true);

  // Agent mode: continuous conversation loop
  const [agentActive, setAgentActive] = useState(false);
  const agentActiveRef = useRef(false);
  const isProcessingRef = useRef(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const conversationHistoryRef = useRef<ConversationTurn[]>([]);

  // Keep refs in sync
  useEffect(() => {
    agentActiveRef.current = agentActive;
  }, [agentActive]);
  useEffect(() => {
    isProcessingRef.current = isProcessing;
  }, [isProcessing]);

  // ── Derive agent state ───────────────────────────────────────────────
  const agentState: AgentState = isListening
    ? "listening"
    : isProcessing
    ? "processing"
    : isSpeaking
    ? "speaking"
    : "idle";

  const stateLabels: Record<AgentState, string> = {
    idle: agentActive ? "READY — WAITING FOR INPUT" : "AGENT OFFLINE",
    listening: "LISTENING — SPEAK NOW",
    processing: "THINKING...",
    speaking: "RESPONDING...",
  };

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
    } catch {
      /* handled */
    } finally {
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
    if (transcript && !isListening && !isProcessingRef.current) {
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

    const userMsg: VoiceMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      text: question.trim(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);

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

      conversationHistoryRef.current.push({
        role: "assistant",
        content: response.answer,
      });

      setIsProcessing(false);

      // ALWAYS respond with BOTH text + voice
      // Text is already shown above via setMessages.
      // Now speak the response aloud:
      if (ttsSupported) {
        await speak(response.answer);
      }

      // After speaking finishes, auto-start listening if agent is active
      if (agentActiveRef.current) {
        await new Promise((r) => setTimeout(r, 400));
        if (agentActiveRef.current && !isProcessingRef.current) {
          startListening();
        }
      }
    } catch (err) {
      const errMsg =
        err instanceof Error ? err.message : "Failed to get response";
      const errorMsg: VoiceMessage = {
        id: `e-${Date.now()}`,
        role: "assistant",
        text: `Error: ${errMsg}`,
        confidence: "Low",
        citations: [],
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
      setIsProcessing(false);

<<<<<<< HEAD
               {/* ── Left Panel: Voice Control ─────────────────────────────── */}
               <div className="w-80 border-r border-black bg-white flex flex-col shrink-0 relative z-10">
                    {/* Subject Selector */}
                    <div className="border-b border-black">
                         <div className="bg-black text-white px-4 py-2 flex items-center gap-2">
                              <Volume2 className="w-4 h-4" strokeWidth={1.5} />
                              <span className="text-sm font-semibold tracking-wide">
                                   Voice Chat
                              </span>
                         </div>

                         <div className="p-4 border-b border-black">
                              <div className="relative border border-black bg-white group hover:bg-black/5">
                                   <select
                                        className="w-full appearance-none bg-transparent pt-6 pb-2 px-4 text-xs font-bold uppercase tracking-widest focus:outline-none cursor-pointer text-black"
                                        value={activeSubjectId}
                                        onChange={(e) => handleSubjectChange(e.target.value)}
                                   >
                                        {subjects.length === 0 && (
                                             <option value="">No subjects</option>
                                        )}
                                        {subjects.map((s) => (
                                             <option key={s.$id} value={s.$id}>
                                                  {s.name}
                                             </option>
                                        ))}
                                   </select>
                                   <label className="absolute top-2 left-4 text-xs font-medium text-black/50 pointer-events-none">
                                        Subject
                                   </label>
                                   <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black pointer-events-none" />
                              </div>
                         </div>
                    </div>
=======
      // Even on error, continue listening in agent mode
      if (agentActiveRef.current) {
        await new Promise((r) => setTimeout(r, 500));
        if (agentActiveRef.current) startListening();
      }
    }
  };

  // ── Toggle agent mode ────────────────────────────────────────────────
  const toggleAgent = () => {
    if (agentActive) {
      // Deactivate agent
      setAgentActive(false);
      stopListening();
      stopSpeaking();
    } else {
      // Activate agent → start listening immediately
      setAgentActive(true);
      if (isSpeaking) stopSpeaking();
      startListening();
    }
  };
>>>>>>> fcda0fa2098c15b38aeb7b14a9f108f3a54e1b80

  // ── Manual mic toggle (single-shot) ──────────────────────────────────
  const toggleMic = () => {
    if (isListening) {
      stopListening();
    } else {
      if (isSpeaking) stopSpeaking();
      startListening();
    }
  };

  const clearConversation = () => {
    setMessages([]);
    conversationHistoryRef.current = [];
    stopSpeaking();
  };

<<<<<<< HEAD
                         {/* Status Label */}
                         <div className="text-center">
                              <p className="text-sm font-semibold tracking-wide text-black">
                                   {isProcessing
                                        ? "Processing..."
                                        : isListening
                                             ? "Listening..."
                                             : isSpeaking
                                                  ? "Speaking..."
                                                  : "Press to speak"}
                              </p>
                              {interimTranscript && (
                                   <p className="text-sm text-black/50 mt-2 max-w-48 wrap-break-word">
                                        &quot;{interimTranscript}&quot;
                                   </p>
                              )}
                         </div>
=======
  const handleSubjectChange = (newId: string) => {
    setActiveSubjectId(newId);
    clearConversation();
    if (agentActive) {
      setAgentActive(false);
      stopListening();
    }
  };
>>>>>>> fcda0fa2098c15b38aeb7b14a9f108f3a54e1b80

  const activeSubject = subjects.find((s) => s.$id === activeSubjectId);

  if (authLoading || loadingSubjects) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-5 h-5 animate-spin text-text-tertiary" />
      </div>
    );
  }

<<<<<<< HEAD
                         {!sttSupported && (
                              <p className="text-sm text-black/50 text-center px-4">
                                   Speech recognition not supported.
                                   <br />
                                   Use Chrome or Edge.
                              </p>
                         )}
                    </div>

                    {/* Bottom Controls */}
                    <div className="border-t border-black p-4 space-y-3">
                         {/* Auto-speak toggle */}
                         <button
                              onClick={() => setAutoSpeak(!autoSpeak)}
                              className="w-full flex items-center justify-between px-3 py-2 border border-black text-xs font-semibold hover:bg-black/5 cursor-pointer rounded transition-colors"
                         >
                              <span className="flex items-center gap-2">
                                   {autoSpeak ? (
                                        <Volume2 className="w-4 h-4" />
                                   ) : (
                                        <VolumeX className="w-4 h-4" />
                                   )}
                                   Auto-speak: {autoSpeak ? "On" : "Off"}
                              </span>
                         </button>

                         {/* Stop speaking */}
                         {isSpeaking && (
                              <button
                                   onClick={stopSpeaking}
                                   className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-black bg-black text-white text-xs font-semibold cursor-pointer rounded transition-colors"
                              >
                                   <VolumeX className="w-4 h-4" />
                                   Stop Speaking
                              </button>
                         )}

                         {/* Clear conversation */}
                         {messages.length > 0 && (
                              <button
                                   onClick={clearConversation}
                                   className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-black/30 text-black/60 text-xs font-semibold hover:bg-black/5 cursor-pointer rounded transition-colors"
                              >
                                   <Trash2 className="w-4 h-4" />
                                   Clear Session
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
                              <h3 className="text-sm font-semibold tracking-wide text-black">
                                   Voice Teacher
                              </h3>
                         </div>
                         <div className="flex items-center gap-4">
                              {activeSubject && (
                                   <span className="text-xs font-medium text-black/50">
                                        Subject: {activeSubject.name}
                                   </span>
                              )}
                              <span className="text-xs font-medium text-black/50">
                                   Turns: {messages.filter((m) => m.role === "user").length}
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
                                   <p className="text-sm font-semibold tracking-wide text-black/40 mb-2">
                                        Voice Teacher Ready
                                   </p>
                                   <p className="text-sm text-black/50 max-w-sm leading-relaxed">
                                        Press the microphone button and ask a question about your notes.
                                        <br />
                                        Follow-up questions are supported within the same session.
                                   </p>
                              </div>
                         )}

                         {messages.map((msg) =>
                              msg.role === "user" ? (
                                   <div key={msg.id} className="flex justify-start pl-12 relative group">
                                        <div className="absolute left-0 top-0 text-xs font-semibold text-black/30 w-12 text-center pt-2 md:pt-4">
                                             You
                                        </div>
                                        <div className="bg-black text-white p-4 max-w-2xl text-sm leading-relaxed rounded-2xl rounded-tl-sm shadow-sm">
                                             {msg.text}
                                        </div>
                                   </div>
                              ) : (
                                   <div key={msg.id} className="flex justify-start pl-12 relative group">
                                        <div className="absolute left-0 top-0 text-xs font-semibold text-black w-12 text-center pt-2 md:pt-4 flex flex-col items-center">
                                             <Sparkles className="w-4 h-4 mb-1" />
                                        </div>

                                        <div className="border border-black/10 bg-white p-6 max-w-4xl text-sm leading-relaxed rounded-2xl rounded-tl-sm shadow-sm">
                                             {/* Header with confidence */}
                                             <div className="flex items-center justify-between border-b border-black/10 pb-4 mb-4">
                                                  <span className="text-xs font-semibold text-black/50">
                                                       Voice Response
                                                  </span>
                                                  {msg.confidence && (
                                                       <div className="flex items-center gap-1.5 bg-black/5 px-2 py-1 rounded">
                                                            <CheckCircle2 className="w-3.5 h-3.5 text-black/60" />
                                                            <span className="text-xs font-medium text-black/60">
                                                                 Confidence: {msg.confidence}
                                                            </span>
                                                       </div>
                                                  )}
                                             </div>

                                             {/* Answer text */}
                                             <div className="space-y-4 text-black text-sm whitespace-pre-wrap">
                                                  <p>{msg.text}</p>

                                                  {/* Citations */}
                                                  {msg.citations && msg.citations.length > 0 && (
                                                       <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-black/10">
                                                            {msg.citations.map((cit, i) => (
                                                                 <div key={i} className="bg-black/5 p-4 rounded">
                                                                      <p className="text-xs font-semibold text-black/50 mb-2">
                                                                           {cit.snippet
                                                                                ? `Source ${i + 1}`
                                                                                : `Reference ${i + 1}`}
                                                                      </p>
                                                                      {cit.snippet && (
                                                                           <p className="text-sm text-black/70 italic leading-normal mb-3">
                                                                                &quot;{cit.snippet}&quot;
                                                                           </p>
                                                                      )}
                                                                      <div className="flex items-center gap-2 text-black/50 mt-auto text-xs">
                                                                           <FileText className="w-3.5 h-3.5 shrink-0" />
                                                                           <span className="break-all">
                                                                                {cit.fileName} • {cit.reference}
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
                                                       className="mt-4 flex items-center gap-2 text-xs font-semibold text-black/50 hover:text-black border border-black/10 hover:border-black/30 px-3 py-1.5 cursor-pointer rounded transition-colors"
                                                  >
                                                       <Volume2 className="w-4 h-4" />
                                                       Replay Audio
                                                  </button>
                                             )}
                                        </div>
                                   </div>
                              )
                         )}

                         {/* Processing indicator */}
                         {isProcessing && (
                              <div className="flex justify-start pl-12 relative">
                                   <div className="absolute left-0 top-0 text-xs font-semibold text-black w-12 text-center pt-2 md:pt-4 flex flex-col items-center">
                                        <Sparkles className="w-4 h-4 mb-1 animate-pulse" />
                                   </div>
                                   <div className="border border-black/10 bg-white p-6 max-w-4xl rounded-2xl rounded-tl-sm shadow-sm">
                                        <div className="flex items-center gap-3">
                                             <Loader2 className="w-4 h-4 animate-spin text-black" />
                                             <span className="text-sm font-medium text-black/50">
                                                  Thinking...
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
                              <div className="h-full px-4 font-semibold text-sm text-black/50 tracking-wide flex items-center w-16">
                                   Ask
                              </div>
                              <input
                                   name="voiceInput"
                                   type="text"
                                   disabled={isProcessing || !activeSubjectId}
                                   placeholder={
                                        activeSubject
                                             ? `Ask about ${activeSubject.name}...`
                                             : "Select a subject first..."
                                   }
                                   className="flex-1 h-full bg-transparent px-4 text-sm text-black focus:outline-none placeholder:text-black/30 disabled:opacity-30"
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
=======
  if (!user) {
    return (
      <div className="flex items-center justify-center h-full font-mono text-xs uppercase tracking-widest text-text-tertiary">
        Authentication required. Please sign in.
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-full bg-bg-app font-sans relative">
      {/* Background Grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03] z-0"
        style={{
          backgroundImage:
            "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* ── Left Panel: Voice Agent Control ──────────────────────── */}
      <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-border-strong bg-bg-surface flex flex-col shrink-0 relative z-10">
        {/* Subject Selector */}
        <div className="border-b border-border-strong">
          <div className="bg-text-primary text-bg-app px-4 py-2 flex items-center gap-2">
            <Radio className="w-4 h-4" strokeWidth={1.5} />
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest">
              AI VOICE AGENT
            </span>
            {agentActive && (
              <span className="ml-auto flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-[8px] tracking-widest">LIVE</span>
              </span>
            )}
>>>>>>> fcda0fa2098c15b38aeb7b14a9f108f3a54e1b80
          </div>

          <div className="p-4 border-b border-border-strong">
            <div className="relative border border-border-strong bg-bg-surface hover:bg-bg-subtle">
              <select
                className="w-full appearance-none bg-transparent pt-6 pb-2 px-4 text-xs font-bold uppercase tracking-widest focus:outline-none cursor-pointer"
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
              <label className="absolute top-2 left-4 text-[8px] font-mono tracking-widest text-text-tertiary pointer-events-none">
                TARGET SUBJECT
              </label>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Voice Agent Control Center */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-8 gap-5">
          {/* Agent Activation Button */}
          <button
            onClick={toggleAgent}
            disabled={!sttSupported || !activeSubjectId}
            className={`relative w-28 h-28 md:w-32 md:h-32 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer
              ${
                agentActive
                  ? agentState === "listening"
                    ? "border-text-primary bg-text-primary text-bg-app scale-105"
                    : agentState === "processing"
                    ? "border-text-tertiary bg-bg-subtle"
                    : agentState === "speaking"
                    ? "border-text-primary bg-bg-subtle"
                    : "border-text-primary bg-bg-surface"
                  : "border-border-strong bg-bg-surface hover:bg-bg-subtle hover:border-text-secondary"
              }
              ${
                !sttSupported || !activeSubjectId
                  ? "opacity-30 cursor-not-allowed"
                  : ""
              }
            `}
          >
            {/* Ripple effects when active */}
            {agentActive && agentState === "listening" && (
              <>
                <div className="absolute inset-0 rounded-full border-2 border-text-primary animate-ping opacity-20" />
                <div className="absolute -inset-3 rounded-full border border-border-default animate-pulse opacity-40" />
                <div className="absolute -inset-6 rounded-full border border-border-subtle animate-pulse opacity-20" />
              </>
            )}
            {agentActive && agentState === "speaking" && (
              <div className="absolute inset-0 rounded-full border-2 border-text-primary opacity-30 animate-pulse" />
            )}

            {/* Icon */}
            {agentState === "processing" ? (
              <Loader2 className="w-10 h-10 animate-spin" />
            ) : agentActive ? (
              agentState === "listening" ? (
                <Mic className="w-10 h-10" strokeWidth={1.5} />
              ) : agentState === "speaking" ? (
                <Volume2 className="w-10 h-10" strokeWidth={1.5} />
              ) : (
                <Power className="w-10 h-10" strokeWidth={1.5} />
              )
            ) : (
              <Power className="w-10 h-10" strokeWidth={1.5} />
            )}
          </button>

          {/* State Label */}
          <div className="text-center space-y-2">
            <p
              className={`text-[11px] font-mono font-bold tracking-widest uppercase ${
                agentActive ? "text-text-primary" : "text-text-tertiary"
              }`}
            >
              {stateLabels[agentState]}
            </p>
            {interimTranscript && (
              <div className="border border-border-default bg-bg-subtle px-3 py-2 max-w-56">
                <p className="text-[10px] font-mono text-text-secondary break-words">
                  &quot;{interimTranscript}&quot;
                </p>
              </div>
            )}
            {!agentActive && (
              <p className="text-[9px] font-mono text-text-tertiary tracking-widest max-w-48 leading-relaxed">
                TAP TO ACTIVATE VOICE AGENT.
                <br />
                IT WILL LISTEN, RESPOND, AND
                <br />
                CONTINUE THE CONVERSATION.
              </p>
            )}
          </div>

          {/* Waveform indicator */}
          {(agentState === "listening" || agentState === "speaking") && (
            <div className="flex items-center gap-1 h-8">
              {[...Array(9)].map((_, i) => (
                <div
                  key={i}
                  className={`w-[3px] rounded-full origin-bottom ${
                    agentState === "listening"
                      ? "bg-text-primary"
                      : "bg-text-secondary"
                  }`}
                  style={{
                    height: "28px",
                    animation: `pulse-bar ${
                      0.3 + i * 0.08
                    }s ease-in-out infinite alternate`,
                  }}
                />
              ))}
            </div>
          )}

          {/* Voice error */}
          {voiceError && (
            <div className="flex items-center gap-2 text-[10px] font-mono text-text-secondary border border-border-default px-3 py-2 max-w-56">
              <AlertTriangle className="w-3 h-3 shrink-0" />
              <span className="break-words">{voiceError}</span>
            </div>
          )}

          {!sttSupported && (
            <p className="text-[10px] font-mono text-text-tertiary text-center px-4">
              SPEECH RECOGNITION NOT SUPPORTED.
              <br />
              USE CHROME OR EDGE.
            </p>
          )}
        </div>

        {/* Bottom Controls */}
        <div className="border-t border-border-strong p-4 space-y-2">
          {/* Manual mic button (for single-shot use without agent mode) */}
          {!agentActive && (
            <button
              onClick={toggleMic}
              disabled={!sttSupported || isProcessing || !activeSubjectId}
              className={`w-full flex items-center justify-center gap-2 px-3 py-2.5 border font-mono text-[10px] tracking-widest uppercase font-bold cursor-pointer transition-colors ${
                isListening
                  ? "border-text-primary bg-text-primary text-bg-app"
                  : "border-border-strong hover:bg-bg-subtle"
              } disabled:opacity-30`}
            >
              {isListening ? (
                <>
                  <MicOff className="w-3 h-3" /> STOP LISTENING
                </>
              ) : (
                <>
                  <Mic className="w-3 h-3" /> SINGLE QUESTION
                </>
              )}
            </button>
          )}

          <div className="w-full flex items-center justify-between px-3 py-2 border border-border-default text-[10px] font-mono tracking-widest uppercase text-text-secondary">
            <span className="flex items-center gap-2">
              <Volume2 className="w-3 h-3" />
              OUTPUT: VOICE + TEXT
            </span>
            <span className="w-2 h-2 rounded-full bg-green-500" />
          </div>

          {isSpeaking && (
            <button
              onClick={stopSpeaking}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-border-strong bg-text-primary text-bg-app text-[10px] font-mono tracking-widest uppercase cursor-pointer"
            >
              <VolumeX className="w-3 h-3" />
              INTERRUPT
            </button>
          )}

          {messages.length > 0 && (
            <button
              onClick={clearConversation}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-border-default text-text-tertiary text-[10px] font-mono tracking-widest uppercase hover:bg-bg-subtle cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
              CLEAR SESSION
            </button>
          )}
        </div>
      </div>

      {/* ── Right Panel: Conversation Transcript ──────────────────── */}
      <div className="flex-1 flex flex-col h-full bg-bg-app min-w-0 relative z-10">
        {/* Header */}
        <div className="h-12 border-b border-border-strong flex items-center justify-between px-4 md:px-6 shrink-0 bg-bg-surface">
          <div className="flex items-center gap-3">
            <div
              className={`w-3 h-3 transition-colors ${
                agentActive ? "bg-text-primary animate-pulse" : "bg-text-tertiary"
              }`}
            />
            <h3 className="text-[10px] font-mono font-bold tracking-widest uppercase">
              CONVERSATION TRANSCRIPT
            </h3>
          </div>
          <div className="flex items-center gap-4">
            {activeSubject && (
              <span className="text-[10px] font-mono tracking-widest uppercase text-text-tertiary hidden md:block">
                SCOPE: {activeSubject.name.toUpperCase()}
              </span>
            )}
            <span className="text-[10px] font-mono tracking-widest uppercase text-text-tertiary">
              {messages.filter((m) => m.role === "user").length} TURN(S)
            </span>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-20 h-20 border-2 border-border-default rounded-full flex items-center justify-center mb-6 relative">
                <Radio
                  className="w-8 h-8 text-text-tertiary"
                  strokeWidth={1.5}
                />
              </div>
              <p className="text-xs font-mono tracking-widest uppercase text-text-secondary mb-2 font-bold">
                AI VOICE AGENT
              </p>
              <p className="text-[10px] font-mono text-text-tertiary max-w-md leading-relaxed">
                TAP THE POWER BUTTON TO START A CONVERSATION.
                <br />
                THE AGENT WILL LISTEN TO YOUR QUESTION, ANALYZE YOUR NOTES,
                <br />
                RESPOND WITH VOICE, AND THEN LISTEN FOR YOUR FOLLOW-UP.
              </p>
            </div>
          )}

          {messages.map((msg) =>
            msg.role === "user" ? (
              <div
                key={msg.id}
                className="flex justify-start pl-10 md:pl-12 relative group"
              >
                <div className="absolute left-0 top-0 text-[10px] font-mono text-text-tertiary tracking-widest w-10 md:w-12 text-center pt-1 border-r border-border-strong mr-2">
                  <Mic className="w-3 h-3 mx-auto mb-1" />
                  YOU
                </div>
                <div className="border border-border-strong bg-text-primary text-bg-app p-3 md:p-4 max-w-2xl text-xs font-mono uppercase tracking-wider leading-relaxed">
                  <span className="opacity-50 mr-2">&gt;</span>
                  {msg.text}
                </div>
              </div>
            ) : (
              <div
                key={msg.id}
                className="flex justify-start pl-10 md:pl-12 relative group"
              >
                <div className="absolute left-0 top-0 text-[10px] font-mono tracking-widest w-10 md:w-12 text-center pt-1 border-r border-border-strong mr-2 font-bold flex flex-col items-center">
                  <Sparkles className="w-3 h-3 mb-1" />
                  AI
                </div>

                <div className="border border-border-strong bg-bg-surface p-4 md:p-6 max-w-4xl text-xs font-mono tracking-wider leading-relaxed">
                  {/* Header with confidence */}
                  <div className="flex items-center justify-between border-b border-border-strong pb-3 mb-3 gap-2">
                    <span className="bg-text-primary text-bg-app px-2 py-1 text-[9px] tracking-widest font-bold shrink-0">
                      RESPONSE
                    </span>
                    {msg.confidence && (
                      <div className="flex items-center gap-2 border border-border-strong px-2 py-1 bg-bg-subtle">
                        <CheckCircle2 className="w-3 h-3" strokeWidth={2} />
                        <span className="text-[9px] font-bold tracking-widest font-mono shrink-0">
                          {msg.confidence.toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Answer */}
                  <p className="uppercase leading-relaxed">{msg.text}</p>

                  {/* Citations */}
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 pt-4 border-t border-border-strong border-dashed">
                      {msg.citations.map((cit, i) => (
                        <div
                          key={i}
                          className="border border-border-strong p-3"
                        >
                          <p className="text-[9px] font-bold text-text-tertiary uppercase tracking-widest mb-2 border-b border-border-strong pb-1">
                            EVIDENCE NO.{i + 1}
                          </p>
                          {cit.snippet && (
                            <p className="text-[10px] italic leading-normal mb-2">
                              &quot;{cit.snippet}&quot;
                            </p>
                          )}
                          <div className="flex items-center gap-2 text-text-tertiary">
                            <FileText className="w-3 h-3 shrink-0" />
                            <span className="text-[9px] break-all uppercase">
                              {cit.fileName} // {cit.reference}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Replay button */}
                  {ttsSupported && (
                    <button
                      onClick={() => speak(msg.text)}
                      className="mt-3 flex items-center gap-2 text-[9px] font-mono tracking-widest uppercase text-text-tertiary hover:text-text-primary border border-border-default hover:border-border-strong px-3 py-1.5 cursor-pointer"
                    >
                      <Volume2 className="w-3 h-3" />
                      REPLAY
                    </button>
                  )}
                </div>
              </div>
            )
          )}

          {/* Processing indicator */}
          {isProcessing && (
            <div className="flex justify-start pl-10 md:pl-12 relative">
              <div className="absolute left-0 top-0 text-[10px] font-mono tracking-widest w-10 md:w-12 text-center pt-1 border-r border-border-strong mr-2 font-bold flex flex-col items-center">
                <Sparkles className="w-3 h-3 mb-1 animate-spin" />
                AI
              </div>
              <div className="border border-border-strong bg-bg-surface p-6 max-w-4xl">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-[10px] font-mono tracking-widest uppercase text-text-tertiary">
                    ANALYZING NOTES & GENERATING RESPONSE...
                  </span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Text Input Fallback */}
        <div className="p-3 md:p-4 bg-bg-surface border-t border-border-strong shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const input = e.currentTarget.elements.namedItem(
                "voiceInput"
              ) as HTMLInputElement;
              if (input.value.trim()) {
                handleSendQuestion(input.value.trim());
                input.value = "";
              }
            }}
            className="flex items-center border border-border-strong relative group focus-within:ring-1 focus-within:ring-text-primary bg-bg-surface h-12 md:h-14"
          >
            <div className="h-full border-r border-border-strong flex items-center px-3 md:px-4 font-mono font-bold text-[10px] tracking-widest uppercase w-20 md:w-24 shrink-0">
              INPUT
              {(agentActive || isListening) && (
                <span className="animate-ping ml-2 inline-flex h-1.5 w-1.5 bg-text-primary" />
              )}
            </div>
            <input
              name="voiceInput"
              type="text"
              disabled={isProcessing || !activeSubjectId}
              placeholder={
                activeSubject
                  ? `TYPE: ${activeSubject.name.toUpperCase()}...`
                  : "SELECT A SUBJECT FIRST..."
              }
              className="flex-1 h-full bg-transparent px-3 md:px-4 text-xs font-mono uppercase focus:outline-none placeholder:text-text-tertiary disabled:opacity-30"
            />
            <button
              type="submit"
              disabled={isProcessing || !activeSubjectId}
              className="h-full border-l border-border-strong w-12 md:w-14 flex items-center justify-center hover:bg-text-primary hover:text-bg-app cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
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

// Wrap in Suspense for useSearchParams
export default function VoiceChatPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-5 h-5 animate-spin text-text-tertiary" />
        </div>
      }
    >
      <VoiceChatContent />
    </Suspense>
  );
}
