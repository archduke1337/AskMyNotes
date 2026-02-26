"use client";

import { useState } from "react";
import { useAuth } from "@/lib/context/AuthContext";
import Link from "next/link";

export default function LoginPage() {
     const { login } = useAuth();
     const [email, setEmail] = useState("");
     const [password, setPassword] = useState("");
     const [error, setError] = useState("");
     const [isSubmitting, setIsSubmitting] = useState(false);

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
          <div className="flex flex-col items-center justify-center h-full bg-white relative font-sans p-4">
               <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-0"
                    style={{ backgroundImage: "linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)", backgroundSize: "64px 64px" }}>
               </div>

               <div className="w-full max-w-sm border border-black bg-white z-10 shadow-[4px_4px_0_0_#000]">
                    <div className="border-b border-black p-4 bg-black text-white">
                         <h1 className="font-mono text-xs tracking-widest uppercase font-bold text-center">ACCESS_TERMINAL // LOGIN</h1>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                         {error && (
                              <div className="p-3 border border-black bg-black text-white text-[10px] font-mono uppercase tracking-wide">
                                   ERROR: {error}
                              </div>
                         )}

                         <div className="space-y-2">
                              <label className="text-[10px] font-mono tracking-widest uppercase text-black/60 block">Identificator (Email)</label>
                              <input
                                   type="email"
                                   value={email}
                                   onChange={(e) => setEmail(e.target.value)}
                                   className="w-full border border-black p-3 text-sm font-mono uppercase focus:outline-none focus:ring-1 focus:ring-black rounded-none bg-white"
                                   placeholder="UID@DOMAIN.COM"
                                   required
                              />
                         </div>

                         <div className="space-y-2">
                              <label className="text-[10px] font-mono tracking-widest uppercase text-black/60 block">Passcode</label>
                              <input
                                   type="password"
                                   value={password}
                                   onChange={(e) => setPassword(e.target.value)}
                                   className="w-full border border-black p-3 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-black rounded-none bg-white"
                                   placeholder="••••••••"
                                   required
                              />
                         </div>

                         <button
                              type="submit"
                              disabled={isSubmitting}
                              className="w-full p-4 border border-black bg-white text-black font-bold uppercase tracking-widest text-xs hover:bg-black hover:text-white transition-none disabled:opacity-50 flex justify-center items-center h-12"
                         >
                              {isSubmitting ? <span className="animate-ping inline-flex h-2 w-2 bg-current" /> : "AUTHENTICATE"}
                         </button>
                    </form>

                    <div className="border-t border-black p-4 text-center">
                         <p className="text-[10px] font-mono tracking-widest text-black/60 uppercase">
                              UNREGISTERED?{" "}
                              <Link href="/register" className="text-black font-bold hover:underline hover:bg-black/5 px-2 py-1 transition-none border border-transparent hover:border-black">
                                   INITIALIZE NEW RECORD
                              </Link>
                         </p>
                    </div>
               </div>
          </div>
     );
}
