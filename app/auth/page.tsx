"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import { Loader2, LogIn, UserPlus, AlertTriangle } from "lucide-react";
import Image from "next/image";

export default function AuthPage() {
  const { user, loading, login, register } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace("/");
  }, [loading, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      if (mode === "register") {
        await register(email, password, name);
      } else {
        await login(email, password);
      }
      router.replace("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-bg-app">
        <Loader2 className="w-5 h-5 animate-spin text-text-tertiary" />
      </div>
    );
  }

  if (user) return null; // redirecting

  return (
    <div className="flex items-center justify-center h-full bg-bg-app relative p-4">
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="w-full max-w-md border border-border-strong bg-bg-surface relative z-10">
        {/* Header */}
        <div className="border-b border-border-strong p-6 text-center">
          <div className="relative w-48 h-12 mx-auto mb-4">
            <Image src="/image.png" alt="AskMyNotes" fill className="object-contain" sizes="192px" />
          </div>
          <p className="text-base font-mono tracking-widest text-text-tertiary uppercase">
            {mode === "login" ? "AUTHENTICATION TERMINAL" : "NEW OPERATOR REGISTRATION"}
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex border-b border-border-strong">
          <button
            type="button"
            onClick={() => { setMode("login"); setError(""); }}
            className={`flex-1 py-3 text-base font-mono tracking-widest uppercase font-bold flex items-center justify-center gap-2 cursor-pointer border-b-2 transition-colors ${
              mode === "login" ? "border-text-primary text-text-primary" : "border-transparent text-text-tertiary hover:text-text-primary"
            }`}
          >
            <LogIn className="w-3 h-3" /> SIGN IN
          </button>
          <button
            type="button"
            onClick={() => { setMode("register"); setError(""); }}
            className={`flex-1 py-3 text-base font-mono tracking-widest uppercase font-bold flex items-center justify-center gap-2 cursor-pointer border-b-2 transition-colors ${
              mode === "register" ? "border-text-primary text-text-primary" : "border-transparent text-text-tertiary hover:text-text-primary"
            }`}
          >
            <UserPlus className="w-3 h-3" /> REGISTER
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="flex items-center gap-2 border border-danger/30 bg-danger/5 p-3 text-base font-mono text-danger">
              <AlertTriangle className="w-3 h-3 shrink-0" />
              {error}
            </div>
          )}

          {mode === "register" && (
            <div className="border border-border-strong">
              <label className="block px-4 pt-3 text-[8px] font-mono tracking-widest uppercase text-text-tertiary">
                OPERATOR NAME
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 pb-3 pt-1 text-base font-mono bg-transparent focus:outline-none"
                placeholder="Enter your name..."
              />
            </div>
          )}

          <div className="border border-border-strong">
            <label className="block px-4 pt-3 text-[8px] font-mono tracking-widest uppercase text-text-tertiary">
              EMAIL ADDRESS
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 pb-3 pt-1 text-base font-mono bg-transparent focus:outline-none"
              placeholder="operator@domain.com"
            />
          </div>

          <div className="border border-border-strong">
            <label className="block px-4 pt-3 text-[8px] font-mono tracking-widest uppercase text-text-tertiary">
              ACCESS KEY
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full px-4 pb-3 pt-1 text-base font-mono bg-transparent focus:outline-none"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 bg-text-primary text-bg-app font-mono text-base tracking-widest uppercase font-bold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 cursor-pointer"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : mode === "login" ? (
              <><LogIn className="w-4 h-4" /> AUTHENTICATE</>
            ) : (
              <><UserPlus className="w-4 h-4" /> CREATE ACCOUNT</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
