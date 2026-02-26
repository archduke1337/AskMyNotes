"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { UploadCloud, FileText, ChevronDown, Trash2, Loader2, AlertTriangle } from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { fetchSubjects, fetchNoteFiles, uploadNoteFile, deleteNoteFile } from "@/lib/api";
import type { Subject, NoteFile } from "@/lib/types";

function UploadContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [activeSubjectId, setActiveSubjectId] = useState("");
  const [files, setFiles] = useState<NoteFile[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  // Load subjects
  const loadSubjects = useCallback(async () => {
    if (!user) return;
    try {
      const data = await fetchSubjects(user.$id);
      setSubjects(data);
      const param = searchParams.get("subject");
      if (param && data.find((s) => s.$id === param)) {
        setActiveSubjectId(param);
      } else if (data.length > 0) {
        setActiveSubjectId(data[0].$id);
      }
    } catch { setError("Failed to load subjects"); }
    finally { setLoadingSubjects(false); }
  }, [user, searchParams]);

  useEffect(() => { loadSubjects(); }, [loadSubjects]);

  // Load files when subject changes
  const loadFiles = useCallback(async () => {
    if (!user || !activeSubjectId) { setFiles([]); return; }
    setLoadingFiles(true);
    try {
      const data = await fetchNoteFiles(user.$id, activeSubjectId);
      setFiles(data);
    } catch { setError("Failed to load files"); }
    finally { setLoadingFiles(false); }
  }, [user, activeSubjectId]);

  useEffect(() => { loadFiles(); }, [loadFiles]);

  // Upload handler
  const handleUpload = async (fileList: FileList | null) => {
    if (!fileList || !user || !activeSubjectId) return;
    setError("");
    setUploading(true);
    setUploadProgress(0);

    try {
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        const ext = file.name.split(".").pop()?.toLowerCase();
        if (ext !== "pdf" && ext !== "txt") {
          setError(`${file.name}: Only PDF and TXT files are allowed`);
          continue;
        }
        if (file.size > 50 * 1024 * 1024) {
          setError(`${file.name}: File exceeds 50MB limit`);
          continue;
        }
        setUploadProgress(Math.round(((i) / fileList.length) * 100));
        await uploadNoteFile(user.$id, activeSubjectId, file);
        setUploadProgress(Math.round(((i + 1) / fileList.length) * 100));
      }
      await loadFiles();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (fileId: string) => {
    if (!confirm("Delete this file?")) return;
    setDeleting(fileId);
    try {
      await deleteNoteFile(fileId);
      await loadFiles();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally { setDeleting(null); }
  };

  // Drag & drop handlers
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragOver(true); };
  const handleDragLeave = () => setDragOver(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleUpload(e.dataTransfer.files);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  if (loadingSubjects) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-5 h-5 animate-spin text-text-tertiary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-bg-app relative font-sans">
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)", backgroundSize: "32px 32px" }}
      />

      <div className="h-12 border-b border-border-strong flex items-center justify-between px-4 md:px-6 shrink-0 bg-bg-surface relative z-10">
        <div className="text-[10px] font-mono font-bold tracking-widest uppercase">
          PROCESS: DATA INGESTION // FORM.01
        </div>
      </div>

      <div className="p-4 md:p-8 w-full max-w-4xl mx-auto space-y-6 md:space-y-8 relative z-10 flex-1 overflow-y-auto">
        {error && (
          <div className="flex items-center gap-2 border border-danger/30 bg-danger/5 p-3 text-[10px] font-mono text-danger">
            <AlertTriangle className="w-3 h-3 shrink-0" />
            {error}
            <button onClick={() => setError("")} className="ml-auto text-danger hover:underline cursor-pointer">DISMISS</button>
          </div>
        )}

        <div className="border border-border-strong bg-bg-surface">
          <div className="border-b border-border-strong p-4 bg-text-primary text-bg-app">
            <h2 className="text-xs font-mono font-bold tracking-widest uppercase">UPLOAD NEW RECORD (PDF / TXT)</h2>
          </div>

          <div className="p-4 md:p-6 space-y-6 md:space-y-8">
            {/* Subject Selector */}
            <div className="grid grid-cols-1 md:grid-cols-[160px_1fr] border border-border-strong">
              <div className="p-3 md:p-4 border-b md:border-b-0 md:border-r border-border-strong bg-bg-subtle flex items-center justify-center text-[10px] font-mono font-bold uppercase tracking-widest">
                TARGET INDEX
              </div>
              <div className="relative">
                <select
                  className="w-full h-full p-3 md:p-4 appearance-none bg-transparent text-sm font-bold uppercase tracking-widest focus:outline-none cursor-pointer"
                  value={activeSubjectId}
                  onChange={(e) => setActiveSubjectId(e.target.value)}
                >
                  {subjects.length === 0 && <option value="">NO SUBJECTS AVAILABLE</option>}
                  {subjects.map((s) => (
                    <option key={s.$id} value={s.$id}>{s.name.toUpperCase()}</option>
                  ))}
                </select>
                <div className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <ChevronDown className="w-4 h-4" strokeWidth={2} />
                </div>
              </div>
            </div>

            {/* Dropzone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border border-dashed cursor-pointer flex flex-col items-center justify-center py-16 md:py-24 relative overflow-hidden transition-colors ${
                dragOver ? "border-text-primary bg-bg-subtle" : "border-border-strong hover:bg-bg-subtle"
              } ${uploading ? "pointer-events-none opacity-60" : ""} ${!activeSubjectId ? "opacity-30 pointer-events-none" : ""}`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.txt"
                multiple
                className="hidden"
                onChange={(e) => handleUpload(e.target.files)}
              />
              {uploading ? (
                <>
                  <Loader2 className="w-8 h-8 animate-spin mb-4" />
                  <p className="text-[10px] font-mono tracking-widest uppercase">UPLOADING... {uploadProgress}%</p>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 border border-border-strong flex items-center justify-center mb-6 bg-bg-surface">
                    <UploadCloud className="w-5 h-5" strokeWidth={1.5} />
                  </div>
                  <h3 className="font-bold text-sm uppercase tracking-widest">TRANSMIT FILES HERE</h3>
                  <p className="text-[10px] font-mono text-text-tertiary uppercase mt-2 tracking-widest text-center max-w-sm leading-relaxed">
                    DRAG & DROP OR CLICK TO BROWSE.<br />
                    MAX SIZE: 50MB // FORMATS: .PDF .TXT
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* File List */}
        {activeSubjectId && (
          <div className="border border-border-strong bg-bg-surface">
            <div className="border-b border-border-strong p-2 bg-bg-subtle flex justify-between items-center">
              <h3 className="text-[10px] font-mono font-bold tracking-widest uppercase ml-2">UPLOAD_SESSION_LOG</h3>
              <span className="text-[10px] font-mono text-text-tertiary px-2 tracking-widest">
                {loadingFiles ? "..." : `${files.length} RECORD(S)`}
              </span>
            </div>

            {loadingFiles ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-4 h-4 animate-spin text-text-tertiary" />
              </div>
            ) : files.length === 0 ? (
              <div className="text-center py-8 text-[10px] font-mono text-text-tertiary tracking-widest uppercase">
                NO FILES UPLOADED YET
              </div>
            ) : (
              <table className="w-full text-left border-collapse font-sans text-xs">
                <tbody className="font-mono">
                  {files.map((file) => (
                    <tr key={file.$id} className="border-b border-border-strong last:border-b-0 hover:bg-bg-subtle group">
                      <td className="w-10 md:w-12 border-r border-border-strong p-3 text-center text-text-tertiary group-hover:text-text-primary">
                        <FileText className="w-4 h-4 mx-auto" />
                      </td>
                      <td className="p-3 border-r border-border-strong font-bold uppercase tracking-widest text-[10px] truncate max-w-30 md:max-w-none">
                        {file.fileName}
                      </td>
                      <td className="p-3 border-r border-border-strong text-[10px] text-text-tertiary w-20 text-right border-dashed hidden md:table-cell">
                        {file.fileType.toUpperCase()}
                      </td>
                      <td className="w-10 md:w-12 p-3 text-center">
                        <button
                          onClick={() => handleDelete(file.$id)}
                          disabled={deleting === file.$id}
                          className="border border-border-default w-6 h-6 mx-auto flex items-center justify-center hover:bg-danger hover:text-white hover:border-danger disabled:opacity-50 cursor-pointer"
                        >
                          {deleting === file.$id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Trash2 className="w-3 h-3" strokeWidth={1.5} />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function UploadPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-full"><Loader2 className="w-5 h-5 animate-spin text-text-tertiary" /></div>}>
      <UploadContent />
    </Suspense>
  );
}
