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
<<<<<<< Updated upstream
    idle: agentActive ? "Ready - Waiting for input" : "Agent Offline",
    listening: "Listening - Speak now",
    processing: "Thinking...",
    speaking: "Responding...",
=======
    idle: agentActive ? "Ready" : "Offline",
    listening: "Listening...",
    processing: "Thinking...",
    speaking: "Speaking...",
>>>>>>> Stashed changes
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

  const handleSubjectChange = (newId: string) => {
    setActiveSubjectId(newId);
    clearConversation();
    if (agentActive) {
      setAgentActive(false);
      stopListening();
    }
  };

  const activeSubject = subjects.find((s) => s.$id === activeSubjectId);

  if (authLoading || loadingSubjects) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-5 h-5 animate-spin text-text-tertiary" />
      </div>
    );
  }

  if (!user) {
    return (
<<<<<<< Updated upstream
      <div className="flex items-center justify-center h-full text-sm font-medium text-text-tertiary">
=======
      <div className="flex items-center justify-center h-full text-sm font-medium text-text-tertiary tracking-wide">
>>>>>>> Stashed changes
        Authentication required. Please sign in.
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-full font-sans relative">
      {/* ── Left Panel: Voice Control ─────────────────────────────── */}
      <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-border-strong bg-bg-surface flex flex-col shrink-0 relative z-10">
        {/* Subject Selector */}
        <div className="border-b border-border-strong">
<<<<<<< Updated upstream
          <div className="bg-text-primary text-bg-app px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4" strokeWidth={1.5} />
              <span className="text-sm font-semibold tracking-wide">
                Voice Agent
              </span>
            </div>
            {agentActive && (
              <span className="flex items-center gap-2 text-xs font-semibold bg-bg-app text-text-primary px-2 py-0.5 rounded">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Live
=======
          <div className="bg-text-primary text-bg-app px-4 py-2 flex items-center gap-2">
            <Radio className="w-4 h-4" strokeWidth={1.5} />
            <span className="text-sm font-semibold tracking-wide">
              Voice Chat
            </span>
            {agentActive && (
              <span className="ml-auto flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs font-semibold tracking-wide">Live</span>
>>>>>>> Stashed changes
              </span>
            )}
          </div>

          <div className="p-4 border-b border-border-strong">
            <div className="relative border border-border-strong bg-bg-surface hover:bg-bg-subtle transition-colors">
              <select
<<<<<<< Updated upstream
                className="w-full appearance-none bg-transparent pt-6 pb-2 px-4 text-sm font-semibold focus:outline-none cursor-pointer"
=======
                className="w-full appearance-none bg-transparent pt-6 pb-2 px-4 text-sm font-semibold tracking-wide focus:outline-none cursor-pointer"
>>>>>>> Stashed changes
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
              <label className="absolute top-2 left-4 text-xs font-medium text-text-tertiary pointer-events-none">
                Subject
              </label>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Voice Agent Control Center */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-8 gap-6">
          {/* Agent Activation Button */}
          <button
            onClick={toggleAgent}
            disabled={!sttSupported || !activeSubjectId}
<<<<<<< Updated upstream
            className={`relative w-28 h-28 md:w-32 md:h-32 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer shadow-sm
              ${
                agentActive
                  ? agentState === "listening"
                    ? "border-text-primary bg-text-primary text-bg-app scale-[1.02]"
                    : agentState === "processing"
                    ? "border-border-default bg-bg-subtle"
                    : agentState === "speaking"
                    ? "border-text-primary bg-bg-subtle"
                    : "border-text-primary bg-bg-surface"
                  : "border-border-strong bg-bg-surface hover:bg-bg-subtle"
=======
            className={`relative w-28 h-28 md:w-32 md:h-32 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer
              ${agentActive
                ? agentState === "listening"
                  ? "border-text-primary bg-text-primary text-bg-app scale-105"
                  : agentState === "processing"
                    ? "border-text-tertiary bg-bg-subtle"
                    : agentState === "speaking"
                      ? "border-text-primary bg-bg-subtle"
                      : "border-text-primary bg-bg-surface"
                : "border-border-strong bg-bg-surface hover:bg-bg-subtle hover:border-text-secondary"
>>>>>>> Stashed changes
              }
              ${!sttSupported || !activeSubjectId
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
              <Power className="w-10 h-10 text-text-secondary" strokeWidth={1.5} />
            )}
          </button>

          {/* Status Label */}
          <div className="text-center space-y-2">
<<<<<<< Updated upstream
            <p className={`text-sm font-semibold tracking-wide ${agentActive ? "text-text-primary" : "text-text-secondary"}`}>
              {stateLabels[agentState]}
            </p>
            {interimTranscript && (
              <div className="bg-bg-subtle border border-border-strong px-4 py-2 rounded max-w-56 mt-3">
                <p className="text-xs text-text-secondary italic break-words">
=======
            <p
              className={`text-sm font-semibold tracking-wide ${agentActive ? "text-text-primary" : "text-text-tertiary"
                }`}
            >
              {stateLabels[agentState]}
            </p>
            {interimTranscript && (
              <div className="border border-border-default bg-bg-subtle px-3 py-2 max-w-56 rounded">
                <p className="text-xs text-text-secondary break-words italic">
>>>>>>> Stashed changes
                  &quot;{interimTranscript}&quot;
                </p>
              </div>
            )}
            {!agentActive && (
<<<<<<< Updated upstream
              <p className="text-xs text-text-tertiary max-w-52 mt-4 leading-relaxed mx-auto">
                Tap to activate Voice Agent. It will continuously listen, process, speak, and wait for your follow-up.
=======
              <p className="text-xs text-text-tertiary max-w-48 leading-relaxed">
                Tap to activate voice chat.
                <br />
                It will listen, respond, and continue the conversation.
>>>>>>> Stashed changes
              </p>
            )}
          </div>

          {/* Waveform indicator */}
          {(agentState === "listening" || agentState === "speaking") && (
            <div className="flex items-center gap-1.5 h-6 mt-2">
              {[...Array(9)].map((_, i) => (
                <div
                  key={i}
<<<<<<< Updated upstream
                  className={`w-[4px] rounded-full origin-bottom ${
                    agentState === "listening"
                      ? "bg-text-primary"
                      : "bg-text-secondary"
                  }`}
                  style={{
                    height: "24px",
                    animation: `pulse-bar ${
                      0.3 + i * 0.08
                    }s ease-in-out infinite alternate`,
=======
                  className={`w-[3px] rounded-full origin-bottom ${agentState === "listening"
                    ? "bg-text-primary"
                    : "bg-text-secondary"
                    }`}
                  style={{
                    height: "28px",
                    animation: `pulse-bar ${0.3 + i * 0.08
                      }s ease-in-out infinite alternate`,
>>>>>>> Stashed changes
                  }}
                />
              ))}
            </div>
          )}

          {/* Voice error */}
          {voiceError && (
<<<<<<< Updated upstream
            <div className="flex items-center gap-2 text-sm font-medium text-danger bg-danger/5 border border-danger/30 px-4 py-2 rounded max-w-56 mt-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span className="break-words leading-tight">{voiceError}</span>
=======
            <div className="flex items-center gap-2 text-xs font-medium text-text-secondary border border-border-default px-3 py-2 max-w-56 rounded bg-bg-subtle">
              <AlertTriangle className="w-4 h-4 shrink-0 text-text-secondary" />
              <span className="break-words">{voiceError}</span>
>>>>>>> Stashed changes
            </div>
          )}

          {!sttSupported && (
<<<<<<< Updated upstream
            <p className="text-sm text-text-tertiary text-center px-4">
=======
            <p className="text-sm font-medium text-text-tertiary text-center px-4">
>>>>>>> Stashed changes
              Speech recognition not supported.
              <br />
              Use Chrome or Edge.
            </p>
          )}
        </div>

        {/* Bottom Controls */}
        <div className="border-t border-border-strong p-4 space-y-3">
          {/* Manual mic button (for single-shot use without agent mode) */}
          {!agentActive && (
            <button
              onClick={toggleMic}
              disabled={!sttSupported || isProcessing || !activeSubjectId}
<<<<<<< Updated upstream
              className={`w-full flex items-center justify-center gap-2 px-3 py-2.5 border text-sm font-semibold rounded cursor-pointer transition-colors ${
                isListening
                  ? "border-text-primary bg-text-primary text-bg-app"
                  : "border-border-strong bg-bg-surface hover:bg-bg-subtle"
              } disabled:opacity-30`}
            >
              {isListening ? (
                <>
                  <MicOff className="w-4 h-4" /> Stop Listening
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4" /> Single Question
=======
              className={`w-full flex items-center justify-center gap-2 px-3 py-2.5 border text-xs font-semibold cursor-pointer transition-colors ${isListening
                  ? "border-text-primary bg-text-primary text-bg-app"
                  : "border-border-strong hover:bg-bg-subtle"
                } disabled:opacity-30`}
            >
              {isListening ? (
                <>
                  <MicOff className="w-4 h-4" /> Stop listening
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4" /> Single ask
>>>>>>> Stashed changes
                </>
              )}
            </button>
          )}

<<<<<<< Updated upstream
          <div className="w-full flex items-center justify-between px-3 py-2.5 bg-bg-subtle border border-border-default rounded text-sm font-medium text-text-secondary">
            <span className="flex items-center gap-2">
              <Volume2 className="w-4 h-4" />
              Output: Voice + Text
=======
          <div className="w-full flex items-center justify-between px-3 py-2 border border-border-default text-xs font-medium text-text-secondary">
            <span className="flex items-center gap-2">
              <Volume2 className="w-4 h-4" />
              Voice + Text
>>>>>>> Stashed changes
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-sm" />
          </div>

          {isSpeaking && (
            <button
              onClick={stopSpeaking}
<<<<<<< Updated upstream
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 border border-border-strong bg-text-primary text-bg-app text-sm font-semibold rounded cursor-pointer shadow-sm hover:opacity-90"
            >
              <VolumeX className="w-4 h-4" />
              Interrupt
=======
              className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-border-strong bg-text-primary text-bg-app text-xs font-semibold cursor-pointer rounded"
            >
              <VolumeX className="w-4 h-4" />
              Stop speaking
>>>>>>> Stashed changes
            </button>
          )}

          {messages.length > 0 && (
            <button
              onClick={clearConversation}
<<<<<<< Updated upstream
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 border border-border-default text-text-tertiary text-sm font-medium hover:bg-bg-subtle hover:text-text-secondary rounded cursor-pointer transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Clear Session
=======
              className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-border-default text-text-tertiary text-xs font-medium hover:bg-bg-subtle cursor-pointer rounded"
            >
              <Trash2 className="w-4 h-4" />
              Clear chat
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
              className={`w-3 h-3 rounded-full transition-colors ${
                agentActive ? "bg-text-primary animate-pulse" : "bg-text-tertiary"
              }`}
            />
            <h3 className="text-sm font-semibold tracking-wide text-text-primary">
              Conversation Transcript
=======
              className={`w-3 h-3 rounded-full transition-colors ${agentActive ? "bg-text-primary animate-pulse" : "bg-text-tertiary"
                }`}
            />
            <h3 className="text-sm font-semibold tracking-wide">
              Conversation
>>>>>>> Stashed changes
            </h3>
          </div>
          <div className="flex items-center gap-4">
            {activeSubject && (
              <span className="text-xs font-medium text-text-tertiary hidden md:block">
<<<<<<< Updated upstream
                Focus: {activeSubject.name}
              </span>
            )}
            <span className="text-xs font-semibold text-text-tertiary bg-bg-subtle px-2 py-0.5 rounded">
              {messages.filter((m) => m.role === "user").length} Turns
=======
                Subject: {activeSubject.name}
              </span>
            )}
            <span className="text-xs font-medium text-text-tertiary">
              Turns: {messages.filter((m) => m.role === "user").length}
>>>>>>> Stashed changes
            </span>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 md:space-y-8">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-20 h-20 border-2 border-border-default rounded-full flex items-center justify-center mb-6 bg-bg-surface shadow-sm text-text-tertiary">
                <Radio className="w-8 h-8" strokeWidth={1.5} />
              </div>
<<<<<<< Updated upstream
              <p className="text-sm font-semibold tracking-wide text-text-secondary mb-2">
                Voice Agent Ready
              </p>
              <p className="text-sm text-text-tertiary max-w-sm leading-relaxed">
                Activate the Voice Agent on the left and ask a question about your notes.
                <br />
                Follow-up questions are supported within the same session.
=======
              <p className="text-sm font-semibold text-text-secondary mb-2">
                Voice Assistant
              </p>
              <p className="text-sm text-text-tertiary max-w-md leading-relaxed text-balance">
                Tap the microphone to start a conversation.
                <br />
                The assistant will listen to your question, analyze your notes,
                <br />
                respond with voice, and listen for your follow-up.
>>>>>>> Stashed changes
              </p>
            </div>
          )}

          {messages.map((msg) =>
            msg.role === "user" ? (
<<<<<<< Updated upstream
              <div key={msg.id} className="flex justify-start pl-10 md:pl-12 relative group">
                <div className="absolute left-0 top-0 text-xs font-semibold text-text-tertiary w-10 md:w-12 text-center pt-2 md:pt-4">
                  You
                </div>
                <div className="bg-text-primary text-bg-app p-4 max-w-2xl text-sm leading-relaxed rounded-2xl rounded-tl-sm shadow-sm">
=======
              <div
                key={msg.id}
                className="flex justify-start pl-10 md:pl-12 relative group"
              >
                <div className="absolute left-0 top-0 text-xs font-medium text-text-tertiary w-10 md:w-12 text-center pt-1 border-r border-border-strong mr-2">
                  <Mic className="w-4 h-4 mx-auto mb-1" />
                  You
                </div>
                <div className="border border-border-strong bg-text-primary text-bg-app p-3 md:p-4 max-w-2xl text-sm leading-relaxed rounded-2xl rounded-tl-sm">
>>>>>>> Stashed changes
                  {msg.text}
                </div>
              </div>
            ) : (
<<<<<<< Updated upstream
              <div key={msg.id} className="flex justify-start pl-10 md:pl-12 relative group">
                <div className="absolute left-0 top-0 text-xs font-semibold text-text-primary w-10 md:w-12 text-center pt-2 md:pt-4 flex flex-col items-center">
                  <Sparkles className="w-4 h-4 mb-1 text-text-tertiary" />
                </div>

                <div className="border border-border-strong bg-bg-surface p-5 md:p-6 max-w-4xl text-sm leading-relaxed rounded-2xl rounded-tl-sm shadow-sm">
                  {/* Header with confidence */}
                  <div className="flex items-center justify-between border-b border-border-strong pb-4 mb-4">
                    <span className="text-xs font-semibold text-text-tertiary tracking-wide uppercase">
                      Voice Response
                    </span>
                    {msg.confidence && (
                      <div className="flex items-center gap-1.5 bg-text-primary/10 px-2 py-1 rounded text-text-primary">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span className="text-xs font-medium">
=======
              <div
                key={msg.id}
                className="flex justify-start pl-10 md:pl-12 relative group"
              >
                <div className="absolute left-0 top-0 text-xs font-medium w-10 md:w-12 text-center pt-1 border-r border-border-strong mr-2 flex flex-col items-center">
                  <Sparkles className="w-4 h-4 mb-1" />
                  AI
                </div>

                <div className="border border-border-strong bg-bg-surface p-4 md:p-6 max-w-4xl text-sm leading-relaxed rounded-2xl rounded-tl-sm">
                  {/* Header with confidence */}
                  <div className="flex items-center justify-between border-b border-border-strong pb-3 mb-3 gap-2">
                    <span className="text-xs font-semibold text-text-tertiary">
                      Voice Response
                    </span>
                    {msg.confidence && (
                      <div className="flex items-center gap-2 border border-border-strong px-2 py-1 bg-bg-subtle rounded text-xs text-text-secondary">
                        <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2} />
                        <span className="font-medium">
>>>>>>> Stashed changes
                          Confidence: {msg.confidence}
                        </span>
                      </div>
                    )}
                  </div>

<<<<<<< Updated upstream
                  {/* Answer text */}
                  <div className="space-y-4 text-text-primary">
                    <p className="whitespace-pre-wrap">{msg.text}</p>

                    {/* Citations */}
                    {msg.citations && msg.citations.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-border-default">
                        {msg.citations.map((cit, i) => (
                          <div key={i} className="bg-bg-app border border-border-default p-4 rounded">
                            <p className="text-xs font-semibold text-text-tertiary mb-2 uppercase">
                              {cit.snippet ? `Source ${i + 1}` : `Reference ${i + 1}`}
                            </p>
                            {cit.snippet && (
                              <p className="text-sm text-text-secondary italic leading-normal mb-3">
                                &quot;{cit.snippet}&quot;
                              </p>
                            )}
                            <div className="flex items-center gap-2 text-text-tertiary mt-auto text-xs">
                              <FileText className="w-3.5 h-3.5 shrink-0" />
                              <span className="break-all font-medium">
                                {cit.fileName} • {cit.reference}
                              </span>
                            </div>
=======
                  {/* Answer */}
                  <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                  {/* Citations */}
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 pt-4 border-t border-border-strong border-dashed">
                      {msg.citations.map((cit, i) => (
                        <div
                          key={i}
                          className="border border-border-strong p-3 rounded bg-bg-subtle/50"
                        >
                          <p className="text-xs font-semibold text-text-tertiary mb-2 border-b border-border-strong pb-1">
                            Source {i + 1}
                          </p>
                          {cit.snippet && (
                            <p className="text-sm italic leading-normal mb-2 text-text-secondary">
                              &quot;{cit.snippet}&quot;
                            </p>
                          )}
                          <div className="flex items-center gap-2 text-text-tertiary">
                            <FileText className="w-4 h-4 shrink-0" />
                            <span className="text-xs break-all">
                              {cit.fileName} • {cit.reference}
                            </span>
>>>>>>> Stashed changes
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Replay button */}
                  {ttsSupported && (
                    <button
                      onClick={() => speak(msg.text)}
<<<<<<< Updated upstream
                      className="mt-6 flex items-center gap-2 text-xs font-semibold text-text-tertiary hover:text-text-primary border border-border-default hover:border-border-strong px-3 py-1.5 cursor-pointer rounded transition-colors"
                    >
                      <Volume2 className="w-4 h-4" />
                      Replay Audio
=======
                      className="mt-4 flex items-center gap-2 text-xs font-medium text-text-tertiary hover:text-text-primary border border-border-default hover:border-border-strong px-3 py-1.5 cursor-pointer rounded"
                    >
                      <Volume2 className="w-4 h-4" />
                      Replay
>>>>>>> Stashed changes
                    </button>
                  )}
                </div>
              </div>
            )
          )}

          {/* Processing indicator */}
          {isProcessing && (
            <div className="flex justify-start pl-10 md:pl-12 relative">
<<<<<<< Updated upstream
              <div className="absolute left-0 top-0 text-xs font-semibold text-text-primary w-10 md:w-12 text-center pt-2 md:pt-4 flex flex-col items-center">
                <Sparkles className="w-4 h-4 mb-1 animate-pulse text-text-tertiary" />
              </div>
              <div className="border border-border-strong bg-bg-surface p-6 max-w-4xl rounded-2xl rounded-tl-sm shadow-sm">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-4 h-4 animate-spin text-text-primary" />
                  <span className="text-sm font-medium text-text-tertiary">
=======
              <div className="absolute left-0 top-0 text-xs font-medium w-10 md:w-12 text-center pt-1 border-r border-border-strong mr-2 flex flex-col items-center">
                <Sparkles className="w-4 h-4 mb-1 animate-spin" />
                AI
              </div>
              <div className="border border-border-strong bg-bg-surface p-6 max-w-4xl rounded-2xl rounded-tl-sm">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-sm font-medium text-text-secondary">
>>>>>>> Stashed changes
                    Thinking...
                  </span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Text Input Fallback */}
        <div className="p-4 bg-bg-surface border-t border-border-strong shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const input = e.currentTarget.elements.namedItem("voiceInput") as HTMLInputElement;
              if (input.value.trim()) {
                handleSendQuestion(input.value.trim());
                input.value = "";
              }
            }}
<<<<<<< Updated upstream
            className="flex items-center border border-border-strong relative group focus-within:ring-1 focus-within:ring-text-primary focus-within:border-text-primary bg-bg-surface rounded-lg overflow-hidden h-12 md:h-14 shadow-sm"
          >
            <div className="h-full px-4 font-semibold text-sm text-text-tertiary tracking-wide flex items-center bg-bg-subtle border-r border-border-strong">
               Ask
               {(agentActive || isListening) && (
                 <span className="animate-ping ml-2 inline-flex h-1.5 w-1.5 bg-text-primary rounded-full" />
               )}
=======
            className="flex items-center border border-border-strong relative group focus-within:ring-1 focus-within:ring-text-primary bg-bg-surface h-12 md:h-14 rounded"
          >
            <div className="h-full border-r border-border-strong flex items-center px-3 md:px-4 font-semibold text-sm w-20 md:w-24 shrink-0">
              Ask
              {(agentActive || isListening) && (
                <span className="animate-ping ml-2 inline-flex h-1.5 w-1.5 bg-text-primary rounded-full" />
              )}
>>>>>>> Stashed changes
            </div>
            <input
              name="voiceInput"
              type="text"
              disabled={isProcessing || !activeSubjectId}
              placeholder={
                activeSubject
<<<<<<< Updated upstream
                  ? `Type question about ${activeSubject.name}...`
                  : "Select a subject first..."
              }
              className="flex-1 h-full bg-transparent px-4 text-sm text-text-primary focus:outline-none placeholder:text-text-tertiary disabled:opacity-30"
=======
                  ? `Ask about ${activeSubject.name}...`
                  : "Select a subject first..."
              }
              className="flex-1 h-full bg-transparent px-3 md:px-4 text-sm focus:outline-none placeholder:text-text-tertiary disabled:opacity-30"
>>>>>>> Stashed changes
            />
            <button
              type="submit"
              disabled={isProcessing || !activeSubjectId}
              className="h-full border-l border-border-strong bg-text-primary text-bg-app px-6 flex items-center justify-center hover:bg-text-secondary cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-semibold"
            >
              <span className="sr-only">Send</span>
              <Sparkles className="w-4 h-4" strokeWidth={2} />
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
