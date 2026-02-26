// ─── useVoice — Speech Recognition (STT) + Speech Synthesis (TTS) ────
// Browser‑native, zero dependencies. Works in Chrome, Edge, Safari.
// Supports "voice agent" mode: auto-listen after speaking, continuous conversation.

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
  /** Speak text aloud, returns a promise that resolves when speech ends */
  speak: (text: string) => Promise<void>;
  /** Stop speaking */
  stopSpeaking: () => void;
  /** Clear transcript */
  clearTranscript: () => void;
  /** Last STT error */
  error: string | null;
}

// Chrome has a bug where speechSynthesis stops after ~15 seconds of continuous
// speech. The workaround is to split text into smaller chunks at sentence
// boundaries and speak them sequentially.
function splitTextForTTS(text: string, maxLen = 180): string[] {
  if (text.length <= maxLen) return [text];

  const chunks: string[] = [];
  // Split on sentence-ending punctuation
  const sentences = text.match(/[^.!?]+[.!?]+\s*|[^.!?]+$/g) || [text];
  let current = "";

  for (const sentence of sentences) {
    if ((current + sentence).length > maxLen && current.length > 0) {
      chunks.push(current.trim());
      current = sentence;
    } else {
      current += sentence;
    }
  }
  if (current.trim()) chunks.push(current.trim());

  return chunks;
}

export function useVoice(): UseVoiceReturn {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const speakingAbortRef = useRef(false);
  // Chrome bug workaround: periodically resume speechSynthesis
  const resumeTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const sttSupported =
    typeof window !== "undefined" && !!getSpeechRecognition();
  const ttsSupported =
    typeof window !== "undefined" && "speechSynthesis" in window;

  // Initialise synthesis ref
  useEffect(() => {
    if (ttsSupported) {
      synthRef.current = window.speechSynthesis;
      // Pre-load voices (needed in Chrome)
      synthRef.current.getVoices();
    }
  }, [ttsSupported]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
      synthRef.current?.cancel();
      if (resumeTimerRef.current) clearInterval(resumeTimerRef.current);
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
    recognition.continuous = false; // single utterance mode — auto-stops on silence
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
      // "no-speech" is common when user is silent— don't show as error
      if (event.error !== "aborted" && event.error !== "no-speech") {
        setError(`Speech recognition error: ${event.error}`);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimTranscript("");
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch (e) {
      // Handle "recognition already started" edge case
      console.warn("Recognition start failed:", e);
      setIsListening(false);
    }
  }, []);

  // ── STT: Stop listening ─────────────────────────────────────────────
  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  // ── TTS: Speak text (with chunking to avoid Chrome bug) ─────────────
  const speak = useCallback(
    (text: string): Promise<void> => {
      return new Promise((resolve) => {
        if (!synthRef.current) {
          resolve();
          return;
        }

        // Cancel any current speech
        synthRef.current.cancel();
        speakingAbortRef.current = false;

        const chunks = splitTextForTTS(text);
        let currentIndex = 0;

        setIsSpeaking(true);

        // Chrome bug: speechSynthesis pauses after ~15s.
        // Workaround: call .resume() periodically.
        if (resumeTimerRef.current) clearInterval(resumeTimerRef.current);
        resumeTimerRef.current = setInterval(() => {
          if (synthRef.current && synthRef.current.speaking) {
            synthRef.current.resume();
          }
        }, 5000);

        const speakNext = () => {
          if (speakingAbortRef.current || currentIndex >= chunks.length) {
            setIsSpeaking(false);
            if (resumeTimerRef.current) {
              clearInterval(resumeTimerRef.current);
              resumeTimerRef.current = null;
            }
            resolve();
            return;
          }

          const utterance = new SpeechSynthesisUtterance(chunks[currentIndex]);
          utterance.rate = 1.0;
          utterance.pitch = 1.0;
          utterance.volume = 1.0;
          utterance.lang = "en-US";

          // Pick a natural-sounding voice
          const voices = synthRef.current!.getVoices();
          const preferred = voices.find(
            (v) =>
              v.lang.startsWith("en") &&
              (v.name.includes("Natural") ||
                v.name.includes("Google") ||
                v.name.includes("Samantha") ||
                v.name.includes("Daniel") ||
                v.name.includes("Microsoft") ||
                v.name.includes("Zira") ||
                v.name.includes("David"))
          );
          if (preferred) utterance.voice = preferred;

          utterance.onend = () => {
            currentIndex++;
            speakNext();
          };

          utterance.onerror = () => {
            setIsSpeaking(false);
            if (resumeTimerRef.current) {
              clearInterval(resumeTimerRef.current);
              resumeTimerRef.current = null;
            }
            resolve();
          };

          synthRef.current!.speak(utterance);
        };

        speakNext();
      });
    },
    []
  );

  // ── TTS: Stop speaking ──────────────────────────────────────────────
  const stopSpeaking = useCallback(() => {
    speakingAbortRef.current = true;
    synthRef.current?.cancel();
    setIsSpeaking(false);
    if (resumeTimerRef.current) {
      clearInterval(resumeTimerRef.current);
      resumeTimerRef.current = null;
    }
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
