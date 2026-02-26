import { UploadCloud, FileText, ChevronDown, Trash2 } from "lucide-react";

export default function UploadPage() {
     return (
          <div className="flex flex-col h-full bg-white relative font-sans">
               <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
                    style={{ backgroundImage: "linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)", backgroundSize: "32px 32px" }}>
               </div>

               <div className="h-12 border-b border-black flex items-center justify-between px-6 shrink-0 bg-white relative z-10">
                    <div className="text-[10px] font-mono font-bold tracking-widest uppercase text-black">
                         PROCESS: DATA INGESTION // FORM.01
                    </div>
               </div>

               <div className="p-8 w-full max-w-4xl mx-auto space-y-8 relative z-10">
                    {/* Form Container */}
                    <div className="border border-black bg-white">
                         <div className="border-b border-black p-4 bg-black text-white">
                              <h2 className="text-xs font-mono font-bold tracking-widest uppercase">UPLOAD NEW RECORD (PDF / TXT)</h2>
                         </div>

                         <div className="p-6 space-y-8">
                              {/* Subject Registry Selector */}
                              <div className="grid grid-cols-[160px_1fr] border border-black group">
                                   <div className="p-4 border-r border-black bg-black/5 flex items-center justify-center text-[10px] font-mono font-bold uppercase tracking-widest text-black">
                                        TARGET INDEX REF.
                                   </div>
                                   <div className="relative">
                                        <select className="w-full h-full p-4 appearance-none bg-transparent text-sm font-bold uppercase tracking-widest text-black focus:outline-none cursor-pointer">
                                             <option>-- SELECT PRIMARY CLASSIFICATION --</option>
                                             <option>ADVANCED CALCULUS [MTH-401]</option>
                                             <option>ORGANIC CHEMISTRY [CHM-302]</option>
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none w-6 h-6 border border-black flex items-center justify-center">
                                             <ChevronDown className="w-3 h-3 text-black" strokeWidth={2} />
                                        </div>
                                   </div>
                              </div>

                              {/* Ingestion Dropzone */}
                              <div className="border border-dashed border-black hover:bg-black/5 transition-none cursor-pointer group flex flex-col items-center justify-center py-24 relative overflow-hidden">
                                   <div className="w-12 h-12 border border-black flex items-center justify-center mb-6 bg-white group-hover:scale-110 transition-transform">
                                        <UploadCloud className="w-5 h-5 text-black" strokeWidth={1.5} />
                                   </div>
                                   <h3 className="font-bold text-sm text-black uppercase tracking-widest">TRANSMIT FILES HERE</h3>
                                   <p className="text-[10px] font-mono text-black/60 uppercase mt-2 tracking-widest text-center max-w-sm leading-relaxed">
                                        DRAG & DROP SECURE RECORDS.<br />
                                        MAX SIZE: 50MB // FORMATS: .PDF .TXT
                                   </p>
                                   <div className="mt-8">
                                        <button className="px-6 py-2 border border-black bg-white hover:bg-black hover:text-white font-mono text-[10px] font-bold tracking-widest transition-none">
                                             BROWSE LOCAL STORAGE
                                        </button>
                                   </div>
                              </div>
                         </div>
                    </div>

                    {/* Upload Session Log */}
                    <div className="border border-black bg-white">
                         <div className="border-b border-black p-2 bg-black/5 flex justify-between items-center">
                              <h3 className="text-[10px] font-mono font-bold tracking-widest uppercase text-black ml-2">UPLOAD_SESSION_LOG.XLS</h3>
                              <span className="text-[10px] font-mono text-black/50 px-2 tracking-widest">2 RECORD(S)</span>
                         </div>
                         <table className="w-full text-left border-collapse font-sans text-xs">
                              <tbody className="font-mono">
                                   <tr className="border-b border-black hover:bg-black/5 relative group">
                                        <td className="w-12 border-r border-black p-3 text-center text-black/30 group-hover:text-black">
                                             <FileText className="w-4 h-4 mx-auto" />
                                        </td>
                                        <td className="p-3 border-r border-black font-bold uppercase tracking-widest text-[10px] text-black">Chapter_3_Derivatives.pdf</td>
                                        <td className="p-3 border-r border-black text-[10px] text-black/50 w-24 text-right border-dashed">4.2 MB</td>
                                        <td className="p-3 w-32 border-r border-black">
                                             <div className="h-6 w-full border border-black p-0.5 relative group">
                                                  {/* Strict black progress bar */}
                                                  <div className="h-full bg-black w-[100%] transition-none"></div>
                                                  <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-white mix-blend-difference tracking-widest">100% COMPLETE</span>
                                             </div>
                                        </td>
                                        <td className="w-12 p-3 text-center">
                                             <button className="relative border border-black w-6 h-6 mx-auto flex items-center justify-center hover:bg-black hover:text-white transition-none text-black">
                                                  <Trash2 className="w-3 h-3" strokeWidth={1.5} />
                                             </button>
                                        </td>
                                   </tr>
                                   <tr className="hover:bg-black/5 relative group">
                                        <td className="w-12 border-r border-black p-3 text-center text-black/30 group-hover:text-black">
                                             <FileText className="w-4 h-4 mx-auto" />
                                        </td>
                                        <td className="p-3 border-r border-black font-bold uppercase tracking-widest text-[10px] text-black">Lecture_01_Limits.pdf</td>
                                        <td className="p-3 border-r border-black text-[10px] text-black/50 w-24 text-right border-dashed">1.8 MB</td>
                                        <td className="p-3 w-32 border-r border-black text-center">
                                             <span className="text-[10px] font-bold tracking-widest text-black uppercase">QUEUED</span>
                                        </td>
                                        <td className="w-12 p-3 text-center">
                                             <button className="relative border border-black w-6 h-6 mx-auto flex items-center justify-center hover:bg-black hover:text-white transition-none text-black">
                                                  <Trash2 className="w-3 h-3" strokeWidth={1.5} />
                                             </button>
                                        </td>
                                   </tr>
                              </tbody>
                         </table>
                    </div>
               </div>
          </div>
     );
}
