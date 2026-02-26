import { BookOpen, FileText, Info } from "lucide-react";

export default function StudyModePage() {
     const mcqs = [
          {
               id: 1,
               question: "Which of the following best describes the purpose of the Chain Rule?",
               options: [
                    "To find the limit of a discontinuous function",
                    "To differentiate a composite function",
                    "To integrate a polynomial",
                    "To find the tangent plane of a surface"
               ],
               correctAnswer: "To differentiate a composite function",
               explanation: "The Chain Rule specifically addresses composite functions by taking the derivative of the outer function evaluated at the inner function, multiplied by the derivative of the inner function.",
               citation: "Chapter_3_Derivatives.pdf — Page 14"
          },
          {
               id: 2,
               question: "If f(x) = sin(x²), what is f'(x) using the chain rule?",
               options: [
                    "cos(x²)",
                    "2x * cos(x²)",
                    "sin(2x)",
                    "-2x * cos(x²)"
               ],
               correctAnswer: "2x * cos(x²)",
               explanation: "The outer function is sin(u) yielding cos(u), and inner is x² yielding 2x. Multiplying them gives 2x * cos(x²).",
               citation: "Chapter_3_Derivatives.pdf — Page 15"
          }
     ];

     const shortAnswers = [
          {
               id: 1,
               question: "Explain the difference between a local maximum and an absolute maximum.",
               answer: "A local maximum is the highest point within a specific, restricted interval or neighborhood around a point. An absolute maximum is the highest point over the entire domain of the function.",
               explanation: "While a function can have multiple local maxima, it can only have one absolute maximum value (though it may occur at multiple x-values).",
               citation: "Chapter_4_Applications_of_Derivatives.pdf — Page 8"
          }
     ];

     return (
          <div className="p-8 max-w-5xl mx-auto h-full overflow-y-auto">
               {/* Header */}
               <div className="mb-10 pb-6 border-b border-border-default">
                    <div className="flex items-center gap-3 mb-2">
                         <BookOpen className="w-6 h-6 text-brand-600" />
                         <h1 className="text-2xl font-semibold tracking-tight text-text-primary">Study Mode</h1>
                    </div>
                    <p className="text-text-secondary text-sm">Self-assessment for <strong>Advanced Calculus</strong> based on your uploaded notes.</p>
               </div>

               {/* Multiple Choice Section */}
               <section className="mb-14">
                    <div className="flex items-center justify-between mb-6">
                         <h2 className="text-xl font-semibold text-text-primary tracking-tight">Part 1: Multiple Choice Questions (5)</h2>
                    </div>
                    <div className="space-y-6">
                         {mcqs.map((q, index) => (
                              <div key={q.id} className="bg-bg-surface border border-border-default rounded-xl p-6 shadow-sm">
                                   <h3 className="text-base font-semibold text-text-primary mb-4 leading-relaxed">
                                        <span className="text-brand-600 mr-2">{index + 1}.</span>
                                        {q.question}
                                   </h3>

                                   <div className="space-y-3 mb-6">
                                        {q.options.map((opt, i) => {
                                             const isCorrect = opt === q.correctAnswer;
                                             return (
                                                  <div key={i} className={`px-4 py-3 rounded-lg border text-sm font-medium flex items-center gap-3 cursor-pointer ${isCorrect
                                                            ? "bg-[#Edf7ed] border-[#C5E1A5] text-[#1E4620]"
                                                            : "bg-bg-app border-border-subtle text-text-primary"
                                                       }`}>
                                                       <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${isCorrect ? "border-[#1E4620] bg-[#1E4620]" : "border-border-strong bg-bg-surface"
                                                            }`}>
                                                            {isCorrect && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                                                       </div>
                                                       {opt}
                                                  </div>
                                             );
                                        })}
                                   </div>

                                   {/* Answer Key / Explanation */}
                                   <div className="bg-brand-50 rounded-lg p-5 border border-brand-100">
                                        <div className="flex items-center gap-2 font-semibold text-brand-800 text-sm mb-2">
                                             <Info className="w-4 h-4 shrink-0" />
                                             Explanation
                                        </div>
                                        <p className="text-sm text-brand-900 leading-relaxed mb-4">{q.explanation}</p>
                                        <div className="flex items-center gap-2 text-xs font-medium text-brand-700 w-fit bg-brand-100/50 px-3 py-1.5 border border-brand-200 rounded-md">
                                             <FileText className="w-3 h-3 shrink-0" />
                                             Citation: {q.citation}
                                        </div>
                                   </div>
                              </div>
                         ))}
                    </div>
               </section>

               {/* Short Answer Section */}
               <section className="mb-10">
                    <div className="flex items-center justify-between mb-6">
                         <h2 className="text-xl font-semibold text-text-primary tracking-tight">Part 2: Short Answer Questions (3)</h2>
                    </div>
                    <div className="space-y-6">
                         {shortAnswers.map((q, index) => (
                              <div key={q.id} className="bg-bg-surface border border-border-default rounded-xl p-6 shadow-sm">
                                   <h3 className="text-base font-semibold text-text-primary mb-4 leading-relaxed">
                                        <span className="text-brand-600 mr-2">{index + 1}.</span>
                                        {q.question}
                                   </h3>

                                   <div className="mb-6">
                                        <div className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-2">Ideal Answer</div>
                                        <div className="bg-bg-app border border-border-subtle rounded-lg p-4 text-sm text-text-primary leading-relaxed font-medium">
                                             {q.answer}
                                        </div>
                                   </div>

                                   {/* Explanation & Citation */}
                                   <div className="bg-brand-50 rounded-lg p-5 border border-brand-100">
                                        <div className="flex items-center gap-2 font-semibold text-brand-800 text-sm mb-2">
                                             <Info className="w-4 h-4 shrink-0" />
                                             Key Concept
                                        </div>
                                        <p className="text-sm text-brand-900 leading-relaxed mb-4">{q.explanation}</p>
                                        <div className="flex items-center gap-2 text-xs font-medium text-brand-700 w-fit bg-brand-100/50 px-3 py-1.5 border border-brand-200 rounded-md">
                                             <FileText className="w-3 h-3 shrink-0" />
                                             Citation: {q.citation}
                                        </div>
                                   </div>
                              </div>
                         ))}
                    </div>
               </section>
          </div>
     );
}
