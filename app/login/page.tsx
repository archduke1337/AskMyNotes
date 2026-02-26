"use client";

import { useState, useRef } from "react";
import { useAuth } from "@/lib/context/AuthContext";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

export default function LoginPage() {
     const { login } = useAuth();
     const [email, setEmail] = useState("");
     const [password, setPassword] = useState("");
     const [error, setError] = useState("");
     const [isSubmitting, setIsSubmitting] = useState(false);
     const containerRef = useRef<HTMLDivElement>(null);

     useGSAP(
          () => {
               // Fast, rigid terminal boot sequence
               gsap.fromTo(
                    containerRef.current,
                    { opacity: 0, y: 10 },
                    { opacity: 1, y: 0, duration: 0.15, ease: "power2.out" }
               );

               gsap.fromTo(
                    ".gsap-reveal",
                    { opacity: 0, x: -10 },
                    {
                         opacity: 1,
                         x: 0,
                         duration: 0.15,
                         stagger: 0.05,
                         ease: "power2.out",
                         delay: 0.1,
                    }
               );
          },
          { scope: containerRef }
     );

     const handleSubmit = async (e: React.FormEvent) => {
          e.preventDefault();
          setError("");
          setIsSubmitting(true);
          try {
               await login(email, password);
               // AuthWrapper will handle redirect
          } catch (err: unknown) {
               setError(err instanceof Error ? err.message : "Failed to authenticate.");
               setIsSubmitting(false);
          }
     };

     return (
          <div className="flex flex-col items-center justify-center h-full bg-bg-app relative font-sans p-4">
               <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-0"
                    style={{ backgroundImage: "linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)", backgroundSize: "64px 64px" }}>
               </div>

               <div ref={containerRef} className="w-full max-w-sm border border-border-strong bg-white z-10 opacity-0 relative">
                    <div className="border-b border-border-strong p-4 bg-black text-white">
                         <h1 className="font-mono text-base tracking-widest uppercase font-bold text-center">ACCESS_TERMINAL // LOGIN</h1>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                         {error && (
                              <div className="p-3 border border-border-strong bg-black text-white text-base font-mono uppercase tracking-wide">
                                   ERROR: {error}
                              </div>
                         )}

                         <div className="space-y-2 gsap-reveal">
                              <label className="text-base font-mono tracking-widest uppercase text-text-tertiary block">Identificator (Email)</label>
                              <input
                                   type="email"
                                   value={email}
                                   onChange={(e) => setEmail(e.target.value)}
                                   className="w-full border border-border-strong p-3 text-base font-mono uppercase focus:outline-none focus:ring-1 focus:ring-black rounded-none bg-white"
                                   placeholder="UID@DOMAIN.COM"
                                   required
                              />
                         </div>

                         <div className="space-y-2 gsap-reveal">
                              <label className="text-base font-mono tracking-widest uppercase text-text-tertiary block">Passcode</label>
                              <input
                                   type="password"
                                   value={password}
                                   onChange={(e) => setPassword(e.target.value)}
                                   className="w-full border border-border-strong p-3 text-base font-mono focus:outline-none focus:ring-1 focus:ring-black rounded-none bg-white"
                                   placeholder="••••••••"
                                   required
                              />
                         </div>

                         <button
                              type="submit"
                              disabled={isSubmitting}
                              className="gsap-reveal w-full p-4 border border-border-strong bg-white text-text-primary font-bold uppercase tracking-widest text-base hover:bg-black hover:text-white transition-none disabled:opacity-50 flex justify-center items-center h-12"
                         >
                              {isSubmitting ? <span className="animate-ping inline-flex h-2 w-2 bg-current" /> : "AUTHENTICATE"}
                         </button>
                    </form>

                    <div className="border-t border-border-strong p-4 text-center">
                         <p className="text-base font-mono tracking-widest text-text-tertiary uppercase">
                              UNREGISTERED?{" "}
                              <Link href="/register" className="text-text-primary font-bold hover:underline hover:bg-black/5 px-2 py-1 transition-none border border-transparent hover:border-black">
                                   INITIALIZE NEW RECORD
                              </Link>
                         </p>
                    </div>
               </div>
          </div>
     );
}
