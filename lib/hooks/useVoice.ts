// ─── useVoice — Speech Recognition (STT) + Speech Synthesis (TTS) ────
// Browser‑native, zero dependencies. Works in Chrome, Edge, Safari.
// Falls back gracefully when APIs aren't available.

"use client";

import { useState, useRef, useCallback, useEffect } from "react";

// ── Extend Window for vendor‑prefixed SpeechRecognition ───────────────
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

function getSpeechRecognition(): SpeechRecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any;
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

// ── Hook ──────────────────────────────────────────────────────────────
export interface UseVoiceReturn {
  /** Whether the browser supports Speech Recognition */
  sttSupported: boolean;
  /** Whether the browser supports Speech Synthesis */
  ttsSupported: boolean;
  /** Currently listening for voice input */
  isListening: boolean;
  /** Currently speaking output */
  isSpeaking: boolean;
  /** Transcribed text (final result) */
  transcript: string;
  /** Interim (partial) transcription while speaking */
  interimTranscript: string;
  /** Start microphone listening */
  startListening: () => void;
  /** Stop microphone listening */
  stopListening: () => void;
  /** Speak text aloud */
  speak: (text: string) => void;
  /** Stop speaking */
  stopSpeaking: () => void;
  /** Clear transcript */
  clearTranscript: () => void;
  /** Last STT error */
  error: string | null;
}

export function useVoice(): UseVoiceReturn {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  const sttSupported = typeof window !== "undefined" && !!getSpeechRecognition();
  const ttsSupported = typeof window !== "undefined" && "speechSynthesis" in window;

  // Initialise synthesis ref
  useEffect(() => {
    if (ttsSupported) {
      synthRef.current = window.speechSynthesis;
    }
  }, [ttsSupported]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
      synthRef.current?.cancel();
    };
  }, []);

  // ── STT: Start listening ────────────────────────────────────────────
  const startListening = useCallback(() => {
    const SR = getSpeechRecognition();
    if (!SR) {
      setError("Speech recognition not supported in this browser.");
      return;
    }

    // Stop any prior instance
    recognitionRef.current?.abort();

    const recognition = new SR();
    recognition.continuous = false; // single utterance
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
      setTranscript("");
      setInterimTranscript("");
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = "";
      let final = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }

      if (final) setTranscript(final);
      setInterimTranscript(interim);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error !== "aborted") {
        setError(`Speech recognition error: ${event.error}`);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimTranscript("");
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, []);

  // ── STT: Stop listening ─────────────────────────────────────────────
  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  // ── TTS: Speak text ─────────────────────────────────────────────────
  const speak = useCallback(
    (text: string) => {
      if (!synthRef.current) return;

      // Cancel any current speech
      synthRef.current.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      utterance.lang = "en-US";

      // Try to pick a natural voice
      const voices = synthRef.current.getVoices();
      const preferred = voices.find(
        (v) =>
          v.lang.startsWith("en") &&
          (v.name.includes("Natural") ||
            v.name.includes("Google") ||
            v.name.includes("Samantha") ||
            v.name.includes("Daniel"))
      );
      if (preferred) utterance.voice = preferred;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      synthRef.current.speak(utterance);
    },
    []
  );

  // ── TTS: Stop speaking ──────────────────────────────────────────────
  const stopSpeaking = useCallback(() => {
    synthRef.current?.cancel();
    setIsSpeaking(false);
  }, []);

  // ── Clear transcript ────────────────────────────────────────────────
  const clearTranscript = useCallback(() => {
    setTranscript("");
    setInterimTranscript("");
  }, []);

  return {
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
    error,
  };
}
