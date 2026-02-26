import { FileText, Clock, MessageSquare, GraduationCap, Plus, Lock } from "lucide-react";

export default function Dashboard() {
  // Mocking 2 subjects to demonstrate the "Slot Remaining / Add Subject" state. 
  // If you add a 3rd subject, the "Maximum Reached" disabled card will appear automatically.
  const subjects = [
    {
      id: 1,
      name: "Advanced Calculus",
      notesCount: 24,
      lastUpdated: "2 hours ago",
    },
    {
      id: 2,
      name: "Organic Chemistry",
      notesCount: 18,
      lastUpdated: "Yesterday",
    }
  ];

  const maxSubjects = 3;
  const canAddMore = subjects.length < maxSubjects;
  const slotsRemaining = maxSubjects - subjects.length;

  return (
    <div className="p-8 max-w-6xl mx-auto h-full overflow-y-auto">
      {/* Dashboard Top Area */}
      <div className="mb-10 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-text-primary">Your Subjects</h1>
          <p className="text-text-secondary mt-2">Manage your uploaded materials and study routines.</p>
        </div>
        <div className="bg-bg-subtle border border-border-subtle px-4 py-2 rounded-full text-sm font-medium text-text-secondary flex items-center gap-2 shadow-sm">
          <span>{subjects.length} / {maxSubjects} Slots Used</span>
          {!canAddMore && <Lock className="w-3.5 h-3.5 text-text-tertiary" />}
        </div>
      </div>

      {/* Grid View mimicking Art Archive inventory cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* Render Active Subject Cards */}
        {subjects.map((subject) => (
          <div
            key={subject.id}
            className="group flex flex-col bg-bg-surface border border-border-default rounded-xl p-6 shadow-sm hover:shadow-card transition-all h-[280px]"
          >
            {/* Card Header & Metadata */}
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-text-primary group-hover:text-brand-600 transition-colors">
                {subject.name}
              </h3>

              <div className="mt-6 flex flex-col gap-3">
                <div className="flex items-center text-sm text-text-secondary">
                  <FileText className="w-4 h-4 mr-3 text-text-tertiary" />
                  <span>{subject.notesCount} Notes uploaded</span>
                </div>
                <div className="flex items-center text-sm text-text-secondary">
                  <Clock className="w-4 h-4 mr-3 text-text-tertiary" />
                  <span>Updated {subject.lastUpdated}</span>
                </div>
              </div>
            </div>

            {/* Card Actions */}
            <div className="mt-auto pt-5 border-t border-border-subtle flex gap-3">
              <button className="flex-1 bg-brand-50 text-brand-700 hover:bg-brand-100 hover:text-brand-800 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Chat
              </button>
              <button className="flex-1 bg-bg-surface border border-border-strong hover:bg-bg-subtle text-text-primary py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                <GraduationCap className="w-4 h-4" />
                Study
              </button>
            </div>
          </div>
        ))}

        {/* Dynamic State: Add Subject or Disabled Card */}
        {canAddMore ? (
          <button className="group flex flex-col items-center justify-center bg-transparent border-2 border-dashed border-border-strong hover:border-brand-400 hover:bg-brand-50 rounded-xl transition-all h-[280px] text-text-secondary hover:text-brand-700 outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2">
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
            <span className="text-sm mt-2 text-text-tertiary">3 of 3 subjects active</span>
          </div>
        )}

      </div>
    </div>
  );
}
