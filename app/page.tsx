"use client";

import { useState, useEffect, useCallback } from "react";
import { Folder, Plus, Loader2, Trash2, MessageSquare, Upload, BookOpen, Mic } from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { fetchSubjects, createSubject, deleteSubject, fetchNoteFiles } from "@/lib/api";
import type { Subject } from "@/lib/types";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

export default function Dashboard() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [fileCounts, setFileCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState("");

  useGSAP(() => {
    const cards = gsap.utils.toArray<HTMLElement>('.gsap-hover');

    const onEnter = (e: Event) => {
      const target = e.currentTarget as HTMLElement;
      gsap.to(target, { y: -2, backgroundColor: "var(--color-bg-subtle)", duration: 0.15, ease: "power1.out" });
    };
    const onLeave = (e: Event) => {
      const target = e.currentTarget as HTMLElement;
      gsap.to(target, { y: 0, backgroundColor: "transparent", duration: 0.15, ease: "power1.out" });
    };

    cards.forEach((card) => {
      card.addEventListener("mouseenter", onEnter);
      card.addEventListener("mouseleave", onLeave);
    });

    return () => {
      cards.forEach((card) => {
        card.removeEventListener("mouseenter", onEnter);
        card.removeEventListener("mouseleave", onLeave);
      });
    };
  }, [subjects, showCreate]);

  const loadSubjects = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await fetchSubjects(user.$id);
      setSubjects(data);
      // Load file counts for each subject
      const counts: Record<string, number> = {};
      await Promise.all(
        data.map(async (s) => {
          try {
            const files = await fetchNoteFiles(user.$id, s.$id);
            counts[s.$id] = files.length;
          } catch {
            counts[s.$id] = 0;
          }
        })
      );
      setFileCounts(counts);
    } catch {
      setError("Failed to load subjects");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadSubjects();
  }, [loadSubjects]);

  const handleCreate = async () => {
    if (!user || !newName.trim()) return;
    setCreating(true);
    setError("");
    try {
      await createSubject(user.$id, newName.trim());
      setNewName("");
      setShowCreate(false);
      await loadSubjects();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create subject");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this subject and all its data?")) return;
    setDeleting(id);
    try {
      await deleteSubject(id);
      await loadSubjects();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setDeleting(null);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }).toUpperCase();
    } catch {
      return "—";
    }
  };

  return (
    <div className="flex flex-col h-full bg-bg-app relative">
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      <div className="h-12 border-b border-border-strong flex items-center justify-between px-4 md:px-6 shrink-0 bg-bg-surface relative">
        <div className="text-base font-mono font-bold tracking-widest uppercase">
          INDEX: SUBJECT LISTING // LOCAL.REGISTRY
        </div>
        <div className="text-base font-mono text-text-tertiary tracking-widest uppercase">
          RECORDS: {String(subjects.length).padStart(3, "0")} ACTIVE
        </div>
      </div>

      <div className="p-4 md:p-8 w-full max-w-6xl mx-auto space-y-8 relative flex-1 overflow-y-auto">
        {error && (
          <div className="border border-danger/30 bg-danger/5 p-3 text-base font-mono text-danger">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-5 h-5 animate-spin text-text-tertiary" />
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block">
              <table className="w-full text-left border-collapse border border-border-strong font-sans bg-bg-surface">
                <thead>
                  <tr className="border-b border-border-strong text-base font-mono uppercase bg-text-primary text-bg-app">
                    <th className="py-2 px-4 border-r border-bg-app/20 font-bold tracking-widest w-16">ID NO.</th>
                    <th className="py-2 px-4 border-r border-bg-app/20 font-bold tracking-widest">SUBJECT CLASSIFICATION</th>
                    <th className="py-2 px-4 border-r border-bg-app/20 font-bold tracking-widest text-center w-32">VOLUMES</th>
                    <th className="py-2 px-4 border-r border-bg-app/20 font-bold tracking-widest w-40">LAST MODIFIED</th>
                    <th className="py-2 px-4 font-bold tracking-widest w-48 text-center">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="text-base">
                  {subjects.map((subject, idx) => (
                    <tr key={subject.$id} className="gsap-hover border-b border-border-strong cursor-default">
                      <td className="py-4 px-4 border-r border-border-strong font-mono text-text-tertiary tracking-widest text-base">
                        #{String(idx + 1).padStart(2, "0")}
                      </td>
                      <td className="py-4 px-4 border-r border-border-strong">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 border border-border-strong flex items-center justify-center shrink-0">
                            <Folder className="w-4 h-4" strokeWidth={1.5} />
                          </div>
                          <h3 className="font-bold uppercase tracking-wider text-base">{subject.name}</h3>
                        </div>
                      </td>
                      <td className="py-4 px-4 border-r border-border-strong text-center font-mono font-bold border-dashed">
                        {fileCounts[subject.$id] ?? "–"}
                      </td>
                      <td className="py-4 px-4 border-r border-border-strong font-mono text-base text-text-tertiary uppercase">
                        {formatDate(subject.$updatedAt || subject.createdAt)}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-center gap-1">
                          <Link href={`/chat?subject=${subject.$id}`} className="p-1.5 border border-border-default hover:bg-text-primary hover:text-bg-app" title="Chat">
                            <MessageSquare className="w-3 h-3" strokeWidth={1.5} />
                          </Link>
                          <Link href={`/upload?subject=${subject.$id}`} className="p-1.5 border border-border-default hover:bg-text-primary hover:text-bg-app" title="Upload">
                            <Upload className="w-3 h-3" strokeWidth={1.5} />
                          </Link>
                          <Link href={`/voice-chat?subject=${subject.$id}`} className="p-1.5 border border-border-default hover:bg-text-primary hover:text-bg-app" title="Voice">
                            <Mic className="w-3 h-3" strokeWidth={1.5} />
                          </Link>
                          <Link href={`/study?subject=${subject.$id}`} className="p-1.5 border border-border-default hover:bg-text-primary hover:text-bg-app" title="Study">
                            <BookOpen className="w-3 h-3" strokeWidth={1.5} />
                          </Link>
                          <button
                            onClick={() => handleDelete(subject.$id)}
                            disabled={deleting === subject.$id}
                            className="p-1.5 border border-border-default hover:bg-danger hover:text-white hover:border-danger disabled:opacity-50 cursor-pointer"
                            title="Delete"
                          >
                            {deleting === subject.$id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Trash2 className="w-3 h-3" strokeWidth={1.5} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {/* Create New Row */}
                  {!showCreate ? (
                    <tr
                      onClick={() => subjects.length < 3 && setShowCreate(true)}
                      className={`gsap-hover border-b border-border-default cursor-pointer group ${subjects.length >= 3 ? "opacity-30 cursor-not-allowed pointer-events-none" : ""}`}
                    >
                      <td className="py-4 px-4 border-r border-border-strong text-center font-mono text-text-tertiary">-</td>
                      <td colSpan={4} className="py-4 px-4 text-center font-bold uppercase tracking-widest text-base">
                        <div className="flex items-center justify-center gap-2">
                          <Plus className="w-4 h-4" strokeWidth={2} />
                          {subjects.length >= 3 ? "MAX 3 SUBJECTS REACHED" : "INITIALIZE NEW RECORD"}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    <tr className="border-b border-border-strong bg-bg-subtle">
                      <td className="py-4 px-4 border-r border-border-strong text-center font-mono text-text-tertiary">+</td>
                      <td colSpan={3} className="py-3 px-4">
                        <input
                          autoFocus
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleCreate();
                            if (e.key === "Escape") { setShowCreate(false); setNewName(""); }
                          }}
                          placeholder="ENTER SUBJECT NAME..."
                          className="w-full bg-transparent border-b border-border-strong py-1 text-base font-bold uppercase tracking-widest focus:outline-none placeholder:text-text-tertiary"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2 justify-center">
                          <button onClick={handleCreate} disabled={creating || !newName.trim()} className="px-3 py-1.5 bg-text-primary text-bg-app text-base font-mono tracking-widest uppercase font-bold disabled:opacity-50 cursor-pointer">
                            {creating ? <Loader2 className="w-3 h-3 animate-spin" /> : "SAVE"}
                          </button>
                          <button onClick={() => { setShowCreate(false); setNewName(""); }} className="px-3 py-1.5 border border-border-strong text-base font-mono tracking-widest uppercase cursor-pointer">
                            CANCEL
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
              {subjects.map((subject) => (
                <div key={subject.$id} className="gsap-hover border border-border-strong bg-bg-surface p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Folder className="w-4 h-4 shrink-0" strokeWidth={1.5} />
                      <h3 className="font-bold uppercase tracking-wider text-base">{subject.name}</h3>
                    </div>
                    <span className="text-base font-mono text-text-tertiary">
                      {fileCounts[subject.$id] ?? 0} files
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link href={`/chat?subject=${subject.$id}`} className="flex-1 py-2 border border-border-default text-center text-base font-mono tracking-widest uppercase hover:bg-bg-subtle">CHAT</Link>
                    <Link href={`/upload?subject=${subject.$id}`} className="flex-1 py-2 border border-border-default text-center text-base font-mono tracking-widest uppercase hover:bg-bg-subtle">UPLOAD</Link>
                    <Link href={`/study?subject=${subject.$id}`} className="flex-1 py-2 border border-border-default text-center text-base font-mono tracking-widest uppercase hover:bg-bg-subtle">STUDY</Link>
                    <button onClick={() => handleDelete(subject.$id)} className="py-2 px-3 border border-danger/30 text-danger text-base font-mono tracking-widest uppercase hover:bg-danger/5 cursor-pointer">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}

              {subjects.length < 3 && (
                <div className="gsap-hover border border-border-default border-dashed bg-bg-surface p-4">
                  {!showCreate ? (
                    <button onClick={() => setShowCreate(true)} className="w-full flex items-center justify-center gap-2 py-3 text-base font-mono tracking-widest uppercase font-bold text-text-secondary hover:text-text-primary cursor-pointer">
                      <Plus className="w-4 h-4" /> ADD SUBJECT
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <input
                        autoFocus
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); if (e.key === "Escape") { setShowCreate(false); setNewName(""); } }}
                        placeholder="Subject name..."
                        className="w-full bg-transparent border-b border-border-strong py-2 text-base font-bold uppercase tracking-widest focus:outline-none"
                      />
                      <div className="flex gap-2">
                        <button onClick={handleCreate} disabled={creating || !newName.trim()} className="flex-1 py-2 bg-text-primary text-bg-app text-base font-mono tracking-widest uppercase font-bold disabled:opacity-50 cursor-pointer">
                          {creating ? "..." : "SAVE"}
                        </button>
                        <button onClick={() => { setShowCreate(false); setNewName(""); }} className="flex-1 py-2 border border-border-strong text-base font-mono tracking-widest uppercase cursor-pointer">
                          CANCEL
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {subjects.length === 0 && !showCreate && (
                <div className="text-center py-12 text-text-tertiary">
                  <Folder className="w-8 h-8 mx-auto mb-3 opacity-30" />
                  <p className="text-base font-mono tracking-widest uppercase">NO SUBJECTS FOUND</p>
                  <p className="text-base font-mono text-text-tertiary mt-1">CREATE YOUR FIRST SUBJECT TO BEGIN</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
