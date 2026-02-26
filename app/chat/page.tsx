"use client";

import { useState } from "react";
import { Send, Library, FileText, CheckCircle2, Sparkles, ChevronDown } from "lucide-react";

type SubjectId = 1 | 2;

const subjectsData = {
     1: {
          id: 1,
          name: "Advanced Calculus",
          notesCount: 24,
          sources: [
               { name: "Chapter_3_Derivatives.pdf", date: "Indexed today", active: true },
               { name: "Lecture_01_Limits.pdf", date: "Indexed 3 days ago", active: false }
          ],
          messages: [
               { role: "user", text: "Explain the chain rule in simple terms and provide an example from the notes." },
               {
                    role: "assistant",
                    text: "The chain rule is a formula to compute the derivative of a composite function. If you have a function nested inside another function, like f(g(x)), the chain rule tells you to take the derivative of the outer function f, leaving the inner function g untouched, and multiply it by the derivative of the inner function.",
                    formula: "Formula: d/dx [f(g(x))] = f'(g(x)) * g'(x)",
                    snippet: "\"To differentiate composed functions, we apply the chain rule: dy/dx = (dy/du) * (du/dx). For example, if y = sin(x²), we let u = x².\"",
                    citation: "Chapter_3_Derivatives.pdf — Page 14, Section 3.4",
                    confidence: "High Confidence"
               }
          ]
     },
     2: {
          id: 2,
          name: "Organic Chemistry",
          notesCount: 18,
          sources: [
               { name: "Week_4_Reactions.pdf", date: "Indexed yesterday", active: true },
               { name: "Lab_Manual.txt", date: "Indexed 5 days ago", active: false }
          ],
          messages: [
               { role: "user", text: "What is an SN2 reaction?" },
               {
                    role: "assistant",
                    text: "An SN2 reaction is a direct displacement process. The nucleophile attacks the electrophilic carbon exactly as the leaving group detaches, all in one concerted step. This always results in the inversion of stereochemistry at the reaction center.",
                    formula: "Rate = k[Nucleophile][Substrate]",
                    snippet: "\"SN2 reactions proceed with stereochemical inversion. They are favored by strong nucleophiles and unhindered substrates.\"",
                    citation: "Week_4_Reactions.pdf — Page 22, Section 4.1",
                    confidence: "High Confidence"
               }
          ]
     }
};

export default function ChatPage() {
     const [activeSubjectId, setActiveSubjectId] = useState<SubjectId>(1);
     const activeSubject = subjectsData[activeSubjectId];

     return (
          <div className="flex h-full bg-bg-app">
               {/* Left Column: Active Subject Context */}
               <div className="w-80 border-r border-border-subtle bg-bg-surface flex flex-col shrink-0">
                    <div className="p-6 border-b border-border-subtle">
                         <div className="text-xs font-semibold text-brand-600 uppercase tracking-wider mb-2">Active Subject</div>

                         <div className="relative mt-2">
                              <select
                                   className="w-full appearance-none bg-bg-app border border-border-default rounded-lg pl-10 pr-10 py-3 text-base font-semibold text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
                                   value={activeSubjectId}
                                   onChange={(e) => setActiveSubjectId(Number(e.target.value) as SubjectId)}
                              >
                                   <option value={1}>Advanced Calculus</option>
                                   <option value={2}>Organic Chemistry</option>
                              </select>
                              <Library className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary pointer-events-none" />
                              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary pointer-events-none" />
                         </div>

                         <p className="text-sm text-text-secondary mt-3">{activeSubject.notesCount} notes active in context</p>
                    </div>

                    <div className="p-6 flex-1 overflow-y-auto">
                         <h3 className="text-sm font-semibold text-text-primary mb-4">Context Sources</h3>
                         <ul className="space-y-4">
                              {activeSubject.sources.map((source, index) => (
                                   <li key={index} className="flex items-start gap-3 text-sm">
                                        <FileText className={`w-4 h-4 mt-0.5 shrink-0 ${source.active ? 'text-brand-500' : 'text-text-tertiary'}`} />
                                        <div>
                                             <p className={`font-medium ${source.active ? 'text-text-primary' : 'text-text-secondary'}`}>{source.name}</p>
                                             <p className="text-xs text-text-tertiary mt-0.5">{source.date}</p>
                                        </div>
                                   </li>
                              ))}
                         </ul>
                    </div>
               </div>

               {/* Right Column: Chat Interface */}
               <div className="flex-1 flex flex-col h-full bg-bg-app min-w-0">
                    {/* Chat Header */}
                    <div className="h-16 border-b border-border-subtle bg-bg-surface flex items-center px-8 shrink-0 justify-between">
                         <h3 className="font-semibold text-text-primary">Study Assistant</h3>
                    </div>

                    {/* Chat Messages */}
                    <div className="flex-1 overflow-y-auto p-8 space-y-8">

                         {activeSubject.messages.map((msg, idx) => (
                              msg.role === "user" ? (
                                   <div key={idx} className="flex justify-end">
                                        <div className="bg-brand-600 text-white p-5 rounded-2xl rounded-tr-sm max-w-2xl shadow-sm">
                                             <p className="text-sm leading-relaxed font-medium">{msg.text}</p>
                                        </div>
                                   </div>
                              ) : (
                                   <div key={idx} className="flex justify-start">
                                        <div className="bg-bg-surface border border-border-default p-6 rounded-2xl rounded-tl-sm max-w-3xl shadow-sm">

                                             <div className="flex items-center justify-between mb-4">
                                                  <div className="flex items-center gap-2 text-brand-700 font-semibold text-sm">
                                                       <div className="w-6 h-6 rounded-full bg-brand-100 flex items-center justify-center shrink-0">
                                                            <Sparkles className="w-3 h-3 text-brand-700" />
                                                       </div>
                                                       Study Assistant
                                                  </div>

                                                  {/* Confidence Badge */}
                                                  <div className="bg-[#Edf7ed] text-[#1E4620] border border-[#C5E1A5] px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5">
                                                       <CheckCircle2 className="w-3 h-3 shrink-0" />
                                                       {msg.confidence}
                                                  </div>
                                             </div>

                                             {/* Answer */}
                                             <div className="text-sm text-text-primary leading-relaxed space-y-4">
                                                  <p>{msg.text}</p>
                                                  {msg.formula && (
                                                       <p className="bg-bg-app p-3 rounded font-mono text-xs border border-border-subtle text-text-secondary">{msg.formula}</p>
                                                  )}
                                             </div>

                                             {/* Evidence Snippet */}
                                             {msg.snippet && (
                                                  <div className="mt-5 bg-bg-subtle p-4 rounded-lg border-l-4 border-brand-400">
                                                       <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Evidence Snippet</p>
                                                       <p className="text-sm text-text-primary italic">{msg.snippet}</p>
                                                  </div>
                                             )}

                                             {/* Citation */}
                                             {msg.citation && (
                                                  <div className="mt-4 flex items-center gap-2 text-xs font-medium text-brand-600 px-3 py-2 bg-brand-50 rounded-lg w-fit border border-brand-100">
                                                       <FileText className="w-3 h-3 shrink-0" />
                                                       Citation: {msg.citation}
                                                  </div>
                                             )}

                                        </div>
                                   </div>
                              )
                         ))}

                    </div>

                    {/* Input Area */}
                    <div className="p-6 bg-bg-surface border-t border-border-subtle shrink-0">
                         <div className="max-w-4xl mx-auto relative focus-within:ring-2 focus-within:ring-brand-500 rounded-xl">
                              <input
                                   type="text"
                                   placeholder={`Ask a question about ${activeSubject.name}...`}
                                   className="w-full bg-bg-subtle border border-border-default rounded-xl pl-5 pr-14 py-4 text-sm text-text-primary focus:outline-none shadow-sm"
                              />
                              <button className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-brand-600 text-white rounded-lg flex items-center justify-center cursor-pointer">
                                   <Send className="w-4 h-4 ml-0.5 shrink-0" />
                              </button>
                         </div>
                    </div>
               </div>
          </div>
     );
}
