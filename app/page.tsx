"use client";

import { useEffect, useState, useCallback } from "react";
import { FileText, Clock, MessageSquare, GraduationCap, Plus, Lock, Loader2, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { fetchSubjects, createSubject, deleteSubject } from "@/lib/api";
import type { Subject } from "@/lib/types";
import Link from "next/link";

const MAX_SUBJECTS = 3;

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [error, setError] = useState("");

  const loadSubjects = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await fetchSubjects(user.$id);
      setSubjects(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load subjects");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading && user) loadSubjects();
    if (!authLoading && !user) setLoading(false);
  }, [authLoading, user, loadSubjects]);

  const handleCreate = async () => {
    if (!user || !newName.trim()) return;
    try {
      setCreating(true);
      setError("");
      await createSubject(user.$id, newName.trim());
      setNewName("");
      setShowAddModal(false);
      await loadSubjects();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create subject");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (subjectId: string) => {
    if (!confirm("Delete this subject? This cannot be undone.")) return;
    try {
      await deleteSubject(subjectId);
      await loadSubjects();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete subject");
    }
  };

  const canAddMore = subjects.length < MAX_SUBJECTS;
  const slotsRemaining = MAX_SUBJECTS - subjects.length;

  // ── Auth guard ──────────────────────────────────────────────────────
  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-text-secondary">Please sign in to view your subjects.</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto h-full overflow-y-auto">
      {/* Dashboard Top Area */}
      <div className="mb-10 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-text-primary">Your Subjects</h1>
          <p className="text-text-secondary mt-2">Manage your uploaded materials and study routines.</p>
        </div>
        <div className="bg-bg-subtle border border-border-subtle px-4 py-2 rounded-full text-sm font-medium text-text-secondary flex items-center gap-2 shadow-sm">
          <span>{subjects.length} / {MAX_SUBJECTS} Slots Used</span>
          {!canAddMore && <Lock className="w-3.5 h-3.5 text-text-tertiary" />}
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Grid View */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* Render Active Subject Cards */}
        {subjects.map((subject) => (
          <div
            key={subject.$id}
            className="group flex flex-col bg-bg-surface border border-border-default rounded-xl p-6 shadow-sm hover:shadow-card transition-all h-[280px]"
          >
            {/* Card Header & Metadata */}
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <h3 className="text-lg font-semibold text-text-primary group-hover:text-brand-600 transition-colors">
                  {subject.name}
                </h3>
                <button
                  onClick={() => handleDelete(subject.$id)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 text-text-tertiary hover:text-red-600 rounded-lg transition-all"
                  title="Delete subject"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-6 flex flex-col gap-3">
                <div className="flex items-center text-sm text-text-secondary">
                  <FileText className="w-4 h-4 mr-3 text-text-tertiary" />
                  <span>Subject active</span>
                </div>
                <div className="flex items-center text-sm text-text-secondary">
                  <Clock className="w-4 h-4 mr-3 text-text-tertiary" />
                  <span>Created {new Date(subject.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Card Actions */}
            <div className="mt-auto pt-5 border-t border-border-subtle flex gap-3">
              <Link
                href={`/chat?subject=${subject.$id}`}
                className="flex-1 bg-brand-50 text-brand-700 hover:bg-brand-100 hover:text-brand-800 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                Chat
              </Link>
              <Link
                href={`/study?subject=${subject.$id}`}
                className="flex-1 bg-bg-surface border border-border-strong hover:bg-bg-subtle text-text-primary py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                <GraduationCap className="w-4 h-4" />
                Study
              </Link>
            </div>
          </div>
        ))}

        {/* Dynamic State: Add Subject or Disabled Card */}
        {canAddMore ? (
          <button
            onClick={() => setShowAddModal(true)}
            className="group flex flex-col items-center justify-center bg-transparent border-2 border-dashed border-border-strong hover:border-brand-400 hover:bg-brand-50 rounded-xl transition-all h-[280px] text-text-secondary hover:text-brand-700 outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
          >
            <div className="w-12 h-12 rounded-full bg-bg-surface border border-border-default shadow-sm group-hover:bg-brand-100 group-hover:border-brand-200 flex items-center justify-center mb-5 transition-colors">
              <Plus className="w-5 h-5 text-text-primary group-hover:text-brand-700 transition-colors" />
            </div>
            <span className="font-semibold text-base text-text-primary group-hover:text-brand-800 transition-colors">Add New Subject</span>
            <span className="text-sm mt-2 text-text-tertiary group-hover:text-brand-600 transition-colors">
              {slotsRemaining} slot{slotsRemaining !== 1 ? 's' : ''} remaining
            </span>
          </button>
        ) : (
          <div className="flex flex-col items-center justify-center bg-bg-subtle border border-border-subtle rounded-xl h-[280px]">
            <div className="w-12 h-12 rounded-full bg-border-subtle flex items-center justify-center mb-5 opacity-50">
              <Lock className="w-5 h-5 text-text-tertiary" />
            </div>
            <span className="font-semibold text-base text-text-secondary">Maximum Reached</span>
            <span className="text-sm mt-2 text-text-tertiary">{MAX_SUBJECTS} of {MAX_SUBJECTS} subjects active</span>
          </div>
        )}
      </div>

      {/* Add Subject Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-bg-surface rounded-xl p-6 w-full max-w-md shadow-lg border border-border-default">
            <h2 className="text-lg font-semibold text-text-primary mb-4">Add New Subject</h2>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Advanced Calculus"
              className="w-full bg-bg-app border border-border-default rounded-lg px-4 py-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-500 mb-4"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => { setShowAddModal(false); setNewName(""); }}
                className="px-4 py-2 text-sm font-medium text-text-secondary hover:bg-bg-subtle rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={creating || !newName.trim()}
                className="px-4 py-2 text-sm font-medium bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {creating && <Loader2 className="w-3 h-3 animate-spin" />}
                Create Subject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
