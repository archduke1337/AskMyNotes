 import { UploadCloud, FileText, ChevronDown, Trash2 } from "lucide-react";

export default function UploadPage() {
     const uploadedFiles = [
          { id: 1, name: "Lecture_01_Limits.pdf", type: "PDF", date: "Oct 12, 2023" },
          { id: 2, name: "Homework_Summary.txt", type: "TXT", date: "Oct 14, 2023" },
     ];

     return (
          <div className="p-8 max-w-4xl mx-auto h-full overflow-y-auto">
               <div className="mb-8">
                    <h1 className="text-2xl font-semibold tracking-tight text-text-primary">Upload Notes</h1>
                    <p className="text-text-secondary mt-2">Add study materials to your subjects for the AI to process.</p>
               </div>

               <div className="bg-bg-surface border border-border-default rounded-xl p-6 mb-8 shadow-sm">
                    <label className="block text-sm font-semibold text-text-primary mb-2">Subject</label>
                    <div className="relative">
                         <select className="w-full appearance-none bg-bg-app border border-border-default rounded-lg pl-4 pr-10 py-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer">
                              <option>Advanced Calculus</option>
                              <option>Organic Chemistry</option>
                         </select>
                         <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary pointer-events-none" />
                    </div>
               </div>

               <div className="bg-bg-subtle border-2 border-dashed border-border-strong rounded-xl p-12 flex flex-col items-center justify-center text-center cursor-pointer mb-8">
                    <div className="w-12 h-12 bg-bg-surface border border-border-default rounded-full flex items-center justify-center mb-4">
                         <UploadCloud className="w-5 h-5 text-brand-600" />
                    </div>
                    <h3 className="text-base font-semibold text-text-primary mb-1">Click or drag files to upload</h3>
                    <p className="text-sm text-text-secondary">Supported formats: PDF, TXT (Max 50MB)</p>
               </div>

               <div>
                    <h2 className="text-lg font-semibold text-text-primary mb-4">Uploaded Files</h2>
                    <div className="border border-border-default rounded-xl bg-bg-surface overflow-hidden">
                         <table className="w-full text-left text-sm">
                              <thead className="bg-bg-subtle border-b border-border-default text-text-secondary">
                                   <tr>
                                        <th className="px-6 py-3 font-medium">File Name</th>
                                        <th className="px-6 py-3 font-medium">Type</th>
                                        <th className="px-6 py-3 font-medium">Upload Date</th>
                                        <th className="px-6 py-3 font-medium text-right">Action</th>
                                   </tr>
                              </thead>
                              <tbody className="divide-y divide-border-subtle">
                                   {uploadedFiles.map((file) => (
                                        <tr key={file.id}>
                                             <td className="px-6 py-4 flex items-center gap-3 text-text-primary font-medium">
                                                  <FileText className="w-4 h-4 text-text-tertiary" />
                                                  {file.name}
                                             </td>
                                             <td className="px-6 py-4 text-text-secondary">{file.type}</td>
                                             <td className="px-6 py-4 text-text-secondary">{file.date}</td>
                                             <td className="px-6 py-4 text-right">
                                                  <button className="p-2 text-text-tertiary cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500 rounded-lg">
                                                       <Trash2 className="w-4 h-4" />
                                                  </button>
                                             </td>
                                        </tr>
                                   ))}
                              </tbody>
                         </table>
                    </div>
               </div>
          </div>
     );
}
