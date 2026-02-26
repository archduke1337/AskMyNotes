"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { UploadCloud, FileText, ChevronDown, Trash2, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { fetchSubjects, fetchNoteFiles, uploadNoteFile, deleteNoteFile } from "@/lib/api";
import type { Subject, NoteFile } from "@/lib/types";

export default function UploadPage() {
     const { user, loading: authLoading } = useAuth();
     const fileInputRef = useRef<HTMLInputElement>(null);

     const [subjects, setSubjects] = useState<Subject[]>([]);
     const [selectedSubjectId, setSelectedSubjectId] = useState("");
     const [files, setFiles] = useState<NoteFile[]>([]);
     const [loading, setLoading] = useState(true);
     const [uploading, setUploading] = useState(false);
     const [error, setError] = useState("");

     // Load subjects
     const loadSubjects = useCallback(async () => {
          if (!user) return;
          try {
               const data = await fetchSubjects(user.$id);
               setSubjects(data);
               if (data.length > 0 && !selectedSubjectId) {
                    setSelectedSubjectId(data[0].$id);
               }
          } catch (err: unknown) {
               setError(err instanceof Error ? err.message : "Failed to load subjects");
          }
     }, [user, selectedSubjectId]);

     // Load files for selected subject
     const loadFiles = useCallback(async () => {
          if (!user || !selectedSubjectId) { setFiles([]); setLoading(false); return; }
          try {
               setLoading(true);
               const data = await fetchNoteFiles(user.$id, selectedSubjectId);
               setFiles(data);
          } catch (err: unknown) {
               setError(err instanceof Error ? err.message : "Failed to load files");
          } finally {
               setLoading(false);
          }
     }, [user, selectedSubjectId]);

     useEffect(() => {
          if (!authLoading && user) loadSubjects();
          if (!authLoading && !user) setLoading(false);
     }, [authLoading, user, loadSubjects]);

     useEffect(() => {
          if (selectedSubjectId) loadFiles();
     }, [selectedSubjectId, loadFiles]);

     // Handle file upload
     const handleUpload = async (fileList: FileList | null) => {
          if (!fileList || !user || !selectedSubjectId) return;
          setError("");
          setUploading(true);
          try {
               for (const file of Array.from(fileList)) {
                    await uploadNoteFile(user.$id, selectedSubjectId, file);
               }
               await loadFiles();
          } catch (err: unknown) {
               setError(err instanceof Error ? err.message : "Upload failed");
          } finally {
               setUploading(false);
               if (fileInputRef.current) fileInputRef.current.value = "";
          }
     };

     // Handle delete
     const handleDelete = async (fileId: string) => {
          if (!confirm("Delete this file?")) return;
          try {
               await deleteNoteFile(fileId);
               await loadFiles();
          } catch (err: unknown) {
               setError(err instanceof Error ? err.message : "Failed to delete file");
          }
     };

     // Handle drop zone
     const handleDrop = (e: React.DragEvent) => {
          e.preventDefault();
          handleUpload(e.dataTransfer.files);
     };

     if (authLoading || (loading && subjects.length === 0)) {
          return (
               <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
               </div>
          );
     }

     if (!user) {
          return (
               <div className="flex items-center justify-center h-full">
                    <p className="text-text-secondary">Please sign in to upload notes.</p>
               </div>
          );
     }

     return (
          <div className="p-8 max-w-4xl mx-auto h-full overflow-y-auto">
               <div className="mb-8">
                    <h1 className="text-2xl font-semibold tracking-tight text-text-primary">Upload Notes</h1>
                    <p className="text-text-secondary mt-2">Add study materials to your subjects for the AI to process.</p>
               </div>

               {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                         {error}
                    </div>
               )}

               {/* Subject Selector */}
               <div className="bg-bg-surface border border-border-default rounded-xl p-6 mb-8 shadow-sm">
                    <label className="block text-sm font-semibold text-text-primary mb-2">Subject</label>
                    {subjects.length > 0 ? (
                         <div className="relative">
                              <select
                                   className="w-full appearance-none bg-bg-app border border-border-default rounded-lg pl-4 pr-10 py-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
                                   value={selectedSubjectId}
                                   onChange={(e) => setSelectedSubjectId(e.target.value)}
                              >
                                   {subjects.map((s) => (
                                        <option key={s.$id} value={s.$id}>{s.name}</option>
                                   ))}
                              </select>
                              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary pointer-events-none" />
                         </div>
                    ) : (
                         <p className="text-sm text-text-tertiary">No subjects found. Create one from the Dashboard first.</p>
                    )}
               </div>

               {/* Drop Zone */}
               {selectedSubjectId && (
                    <div
                         className="bg-bg-subtle border-2 border-dashed border-border-strong rounded-xl p-12 flex flex-col items-center justify-center text-center cursor-pointer mb-8 hover:border-brand-400 hover:bg-brand-50 transition-colors"
                         onClick={() => fileInputRef.current?.click()}
                         onDragOver={(e) => e.preventDefault()}
                         onDrop={handleDrop}
                    >
                         <input
                              ref={fileInputRef}
                              type="file"
                              accept=".pdf,.txt"
                              multiple
                              className="hidden"
                              onChange={(e) => handleUpload(e.target.files)}
                         />
                         <div className="w-12 h-12 bg-bg-surface border border-border-default rounded-full flex items-center justify-center mb-4">
                              {uploading ? (
                                   <Loader2 className="w-5 h-5 animate-spin text-brand-600" />
                              ) : (
                                   <UploadCloud className="w-5 h-5 text-brand-600" />
                              )}
                         </div>
                         <h3 className="text-base font-semibold text-text-primary mb-1">
                              {uploading ? "Uploading…" : "Click or drag files to upload"}
                         </h3>
                         <p className="text-sm text-text-secondary">Supported formats: PDF, TXT (Max 50MB)</p>
                    </div>
               )}

               {/* Uploaded Files Table */}
               <div>
                    <h2 className="text-lg font-semibold text-text-primary mb-4">Uploaded Files</h2>
                    {loading ? (
                         <div className="flex justify-center py-8">
                              <Loader2 className="w-5 h-5 animate-spin text-brand-500" />
                         </div>
                    ) : files.length === 0 ? (
                         <div className="border border-border-default rounded-xl bg-bg-surface p-8 text-center">
                              <p className="text-sm text-text-tertiary">No files uploaded yet for this subject.</p>
                         </div>
                    ) : (
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
                                        {files.map((file) => (
                                             <tr key={file.$id}>
                                                  <td className="px-6 py-4 flex items-center gap-3 text-text-primary font-medium">
                                                       <FileText className="w-4 h-4 text-text-tertiary" />
                                                       {file.fileName}
                                                  </td>
                                                  <td className="px-6 py-4 text-text-secondary uppercase">{file.fileType}</td>
                                                  <td className="px-6 py-4 text-text-secondary">
                                                       {new Date(file.uploadedAt).toLocaleDateString()}
                                                  </td>
                                                  <td className="px-6 py-4 text-right">
                                                       <button
                                                            onClick={() => handleDelete(file.$id)}
                                                            className="p-2 text-text-tertiary hover:text-red-600 cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500 rounded-lg transition-colors"
                                                       >
                                                            <Trash2 className="w-4 h-4" />
                                                       </button>
                                                  </td>
                                             </tr>
                                        ))}
                                   </tbody>
                              </table>
                         </div>
                    )}
               </div>
          </div>
     );
}
