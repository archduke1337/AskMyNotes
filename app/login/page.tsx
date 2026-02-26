"use client";

import { useState } from "react";
import { useAuth } from "@/lib/context/AuthContext";
import Link from "next/link";
import { Loader2 } from "lucide-react";

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
                         <h1 className="text-sm tracking-wide font-semibold text-center">Sign in</h1>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                         {error && (
                              <div className="p-3 border border-black bg-black text-white text-xs font-semibold tracking-wide">
                                   Error: {error}
                              </div>
                         )}

                         <div className="space-y-2">
                              <label className="text-xs font-semibold tracking-wide text-black/60 block">Email</label>
                              <input
                                   type="email"
                                   value={email}
                                   onChange={(e) => setEmail(e.target.value)}
                                   className="w-full border border-black p-3 text-sm focus:outline-none focus:ring-1 focus:ring-black rounded-none bg-white placeholder:text-black/30"
                                   placeholder="you@example.com"
                                   required
                              />
                         </div>

                         <div className="space-y-2">
                              <label className="text-xs font-semibold tracking-wide text-black/60 block">Password</label>
                              <input
                                   type="password"
                                   value={password}
                                   onChange={(e) => setPassword(e.target.value)}
                                   className="w-full border border-black p-3 text-sm focus:outline-none focus:ring-1 focus:ring-black rounded-none bg-white placeholder:text-black/30"
                                   placeholder="••••••••"
                                   required
                              />
                         </div>

                         <button
                              type="submit"
                              disabled={isSubmitting}
                              className="w-full p-4 border border-black bg-white text-black font-semibold tracking-wide text-sm hover:bg-black hover:text-white transition-colors disabled:opacity-50 flex justify-center items-center h-12"
                         >
                              {isSubmitting ? <Loader2 className="animate-spin w-4 h-4 text-current" /> : "Sign in"}
                         </button>
                    </form>

                    <div className="border-t border-black p-4 text-center">
                         <p className="text-xs font-semibold tracking-wide text-black/60">
                              Don&apos;t have an account?{" "}
                              <Link href="/register" className="text-black font-semibold hover:underline hover:bg-black/5 px-2 py-1 transition-colors border border-transparent hover:border-black rounded">
                                   Sign up
                              </Link>
                         </p>
                    </div>
               </div>
          </div>
     );
}
