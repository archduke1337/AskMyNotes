import { BrainCircuit, PlayCircle, Eye, RefreshCcw, Check, X } from "lucide-react";

export default function StudyPage() {
     return (
          <div className="flex flex-col h-full bg-white font-sans text-black relative">
               <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-0"
                    style={{ backgroundImage: "linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)", backgroundSize: "64px 64px" }}>
               </div>

               {/* Header */}
               <div className="h-12 border-b border-black flex items-center justify-between px-6 shrink-0 bg-white relative z-10 transition-none">
                    <div className="flex items-center gap-3">
                         <BrainCircuit className="w-4 h-4 text-black" strokeWidth={1.5} />
                         <h2 className="text-[10px] font-mono tracking-widest uppercase font-bold text-black">ACTIVE STUDY REGIMEN // EXAM.PREP</h2>
                    </div>

                    <div className="flex items-center gap-4">
                         <div className="bg-black text-white px-2 py-1 text-[9px] font-mono font-bold tracking-widest uppercase">
                              TARGET: ADVANCED CALCULUS
                         </div>
                         <button className="flex items-center gap-2 border border-black hover:bg-black hover:text-white px-3 py-1 font-mono text-[10px] uppercase tracking-widest transition-none cursor-pointer">
                              <RefreshCcw className="w-3 h-3" />
                              RE-GENERATE PROTOCOL
                         </button>
                    </div>
               </div>

               <div className="flex-1 overflow-y-auto p-8 relative z-10 max-w-5xl mx-auto w-full">

                    {/* Flashcard / MCQ Module */}
                    <div className="mb-12">
                         <div className="border-b border-black/30 pb-2 mb-6 flex items-center justify-between">
                              <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-black">TEST.MODULE: MULTIPLE CHOICE</h3>
                              <span className="text-[10px] font-mono tracking-widest text-black/50">01 / 05</span>
                         </div>

                         <div className="border border-black bg-white group cursor-pointer hover:bg-black/5 transition-none p-8">
                              <div className="flex justify-between items-start mb-6 border-b border-black pb-4">
                                   <span className="bg-black text-white font-mono text-[10px] font-bold px-2 py-1 tracking-widest uppercase">QUESTION NO.1</span>
                                   <span className="border border-black font-mono text-[9px] px-2 py-0.5 font-bold uppercase text-black">DIFFICULTY: HARD</span>
                              </div>

                              <p className="text-sm font-mono uppercase tracking-wider leading-relaxed text-black mb-10">
                                   When applying the Chain Rule to differentiate h(x) = sin³(x²), what is the correct first step in decomposition?
                              </p>

                              <div className="space-y-4 font-mono text-xs uppercase cursor-default">

                                   <div className="flex items-center gap-4 border border-black p-4 bg-white hover:bg-black hover:text-white group transition-none">
                                        <div className="w-6 h-6 border tracking-widest border-black flex items-center justify-center shrink-0">A</div>
                                        <span className="flex-1 group-hover:text-white">Treat sin(x) as the outer function and x² as the inner.</span>
                                        <div className="w-4 h-4"></div>
                                   </div>

                                   {/* Selected / Correct Answer style */}
                                   <div className="flex items-center gap-4 border-2 border-black p-4 bg-black/5 transition-none">
                                        <div className="w-6 h-6 bg-black text-white border border-black flex items-center justify-center shrink-0 tracking-widest">B</div>
                                        <span className="flex-1 font-bold">Treat u³ as the outermost function where u = sin(x²).</span>
                                        <Check className="w-4 h-4 text-black shrink-0" strokeWidth={3} />
                                   </div>

                                   <div className="flex items-center gap-4 border border-black p-4 bg-white hover:bg-black hover:text-white group transition-none">
                                        <div className="w-6 h-6 border tracking-widest border-black flex items-center justify-center shrink-0">C</div>
                                        <span className="flex-1 group-hover:text-white">Differentiate x² first and multiply by 3.</span>
                                        <div className="w-4 h-4"></div>
                                   </div>

                              </div>

                              {/* Explanation Area */}
                              <div className="mt-8 border-t border-dashed border-black pt-6">
                                   <div className="flex items-center gap-2 mb-3">
                                        <PlayCircle className="w-4 h-4 text-black" strokeWidth={1.5} />
                                        <h4 className="font-mono text-[10px] font-bold tracking-widest uppercase text-black">LOGICAL BREAKDOWN</h4>
                                   </div>
                                   <p className="text-xs font-mono uppercase tracking-wider leading-relaxed text-black/70">
                                        Correct. h(x) = (sin(x³))². The outermost function is the power of 3. Therefore, d/dx [u³] = 3u² * du/dx. Next you apply the chain rule again to the inner function sin(x²).
                                   </p>
                              </div>
                         </div>
                    </div>

                    {/* Short Answer Module */}
                    <div>
                         <div className="border-b border-black/30 pb-2 mb-6 flex items-center justify-between">
                              <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-black">TEST.MODULE: SHORT ANSWER</h3>
                              <span className="text-[10px] font-mono tracking-widest text-black/50">01 / 03</span>
                         </div>

                         <div className="border border-black bg-white p-8 group">
                              <div className="flex justify-between items-start mb-6 border-b border-black pb-4">
                                   <span className="font-mono text-[10px] font-bold tracking-widest uppercase text-black">QUESTION NO.2</span>
                                   <button className="flex items-center gap-2 font-mono text-[10px] tracking-widest font-bold border border-black px-2 py-1 uppercase text-black hover:bg-black hover:text-white transition-none cursor-pointer">
                                        <Eye className="w-3 h-3" />
                                        REVEAL MASTER_COPY
                                   </button>
                              </div>

                              <p className="text-sm font-mono uppercase tracking-wider leading-relaxed text-black mb-8">
                                   Briefly describe why l'Hôpital's rule is invalid if the limit does not evaluate to an indeterminate form like 0/0 or ∞/∞.
                              </p>

                              <div className="border border-black relative">
                                   <div className="absolute top-0 right-0 bg-black text-white px-2 py-1 text-[8px] font-mono font-bold tracking-widest uppercase">EVALUATION_MODE: MANUAL</div>
                                   <textarea
                                        className="w-full bg-transparent p-4 min-h-[120px] font-mono text-xs uppercase tracking-wider focus:outline-none focus:bg-black/5 transition-none text-black placeholder:text-black/30 resize-none"
                                        placeholder="[ENTER HYPOTHESIS HERE...]"
                                   />
                              </div>

                              {/* Hidden answer state (mock visible as if button was clicked) */}
                              <div className="mt-8 border border-black border-dashed bg-black/5 p-6">
                                   <div className="flex items-center gap-2 mb-3">
                                        <Check className="w-4 h-4 text-black" strokeWidth={2} />
                                        <h4 className="font-mono text-[10px] font-bold tracking-widest uppercase text-black">MASTER.COPY.REVEAL</h4>
                                   </div>
                                   <p className="text-xs font-mono uppercase tracking-wider leading-relaxed text-black/80">
                                        L'Hôpital's rule is derived from linear approximations near a point. If the limits of the numerator and denominator are finite and non-zero, direct substitution yields the exact limit. Applying derivatives alters the fundamental ratio of the original functions improperly.
                                   </p>

                                   <div className="mt-4 flex gap-4 border-t border-black/30 pt-4 cursor-default">
                                        <span className="font-mono text-[9px] font-bold tracking-widest uppercase text-black/50">SELF EVALUATION:</span>
                                        <button className="flex items-center gap-1 font-mono text-[9px] tracking-widest text-black border border-black hover:bg-[#df2c2c] hover:text-white hover:border-[#df2c2c] px-2 py-0.5 transition-none">
                                             <X className="w-3 h-3" /> INCORRECT
                                        </button>
                                        <button className="flex items-center gap-1 font-mono text-[9px] tracking-widest text-black border border-black hover:bg-black hover:text-white px-2 py-0.5 transition-none">
                                             <Check className="w-3 h-3" strokeWidth={2} /> CORRECT
                                        </button>
                                   </div>
                              </div>

                         </div>
                    </div>

               </div>
          </div>
     );
}
