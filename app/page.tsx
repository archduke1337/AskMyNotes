import { Folder, MoreVertical, Plus } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="flex flex-col h-full bg-white relative">
      <div className="absolute inset-0 pointer-events-none opacity-5"
        style={{ backgroundImage: "linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)", backgroundSize: "64px 64px" }}>
      </div>

      <div className="h-12 border-b border-black flex items-center justify-between px-6 shrink-0 bg-white relative">
        <div className="text-[10px] font-mono font-bold tracking-widest uppercase text-black">
          INDEX: SUBJECT LISTING // LOCAL.REGISTRY
        </div>
        <div className="text-[10px] font-mono text-black/50 tracking-widest uppercase">
          RECORDS: 003 ACTIVE
        </div>
      </div>

      <div className="p-8 w-full max-w-6xl mx-auto space-y-8 relative">
        <table className="w-full text-left border-collapse border border-black font-sans bg-white">
          <thead>
            <tr className="border-b border-black text-[10px] font-mono uppercase bg-black text-white">
              <th className="py-2 px-4 border-r border-black/30 font-bold tracking-widest w-16">ID NO.</th>
              <th className="py-2 px-4 border-r border-black/30 font-bold tracking-widest">SUBJECT CLASSIFICATION</th>
              <th className="py-2 px-4 border-r border-black/30 font-bold tracking-widest text-center w-32">VOLUMES (FILES)</th>
              <th className="py-2 px-4 border-r border-black/30 font-bold tracking-widest w-40">LAST MODIFIED</th>
              <th className="py-2 px-4 font-bold tracking-widest w-24 text-center">ACTION</th>
            </tr>
          </thead>
          <tbody className="text-xs">

<<<<<<< HEAD
      {/* Grid View */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* Render Active Subject Cards */}
        {subjects.map((subject) => (
          <div
            key={subject.$id}
            className="group flex flex-col bg-bg-surface border border-border-default rounded-xl p-6 shadow-sm hover:shadow-card transition-all h-70"
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
=======
            <tr className="border-b border-black hover:bg-black/5 cursor-pointer">
              <td className="py-4 px-4 border-r border-black font-mono text-black/50 tracking-widest text-[10px]">#01</td>
              <td className="py-4 px-4 border-r border-black">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 border border-black flex items-center justify-center shrink-0">
                    <Folder className="w-4 h-4 text-black" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="font-bold uppercase tracking-wider text-black text-sm">ADVANCED CALCULUS</h3>
                    <p className="text-[10px] font-mono uppercase text-black/50 mt-1">CODE: MTH-401</p>
                  </div>
                </div>
              </td>
              <td className="py-4 px-4 border-r border-black text-center font-mono font-bold text-black border-dashed">
                24
              </td>
              <td className="py-4 px-4 border-r border-black font-mono text-[10px] text-black/60 uppercase">
                NOV 2. 2026 // 14:00Z
              </td>
              <td className="py-4 px-4 text-center">
                <button className="p-2 border border-black hover:bg-black hover:text-white transition-none group w-full flex justify-center">
                  <span className="sr-only">Access Record</span>
                  <MoreVertical className="w-4 h-4 text-black group-hover:text-white" strokeWidth={1} />
>>>>>>> 065bb2dba4e726280e7710154014d2849637cf78
                </button>
              </td>
            </tr>

            <tr className="border-b border-black hover:bg-black/5 cursor-pointer">
              <td className="py-4 px-4 border-r border-black font-mono text-black/50 tracking-widest text-[10px]">#02</td>
              <td className="py-4 px-4 border-r border-black">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 border border-black flex items-center justify-center shrink-0">
                    <Folder className="w-4 h-4 text-black" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="font-bold uppercase tracking-wider text-black text-sm">ORGANIC CHEMISTRY</h3>
                    <p className="text-[10px] font-mono uppercase text-black/50 mt-1">CODE: CHM-302</p>
                  </div>
                </div>
              </td>
              <td className="py-4 px-4 border-r border-black text-center font-mono font-bold text-black border-dashed">
                18
              </td>
              <td className="py-4 px-4 border-r border-black font-mono text-[10px] text-black/60 uppercase">
                OCT 28. 2026 // 09:12Z
              </td>
              <td className="py-4 px-4 text-center">
                <button className="p-2 border border-black hover:bg-black hover:text-white transition-none group w-full flex justify-center">
                  <span className="sr-only">Access Record</span>
                  <MoreVertical className="w-4 h-4 text-black group-hover:text-white" strokeWidth={1} />
                </button>
              </td>
            </tr>

            {/* Empty 'Create New' Row */}
            <tr className="border-b border-black/50 hover:bg-black/5 hover:border-black cursor-pointer group transition-none">
              <td className="py-4 px-4 border-r border-black text-center font-mono text-black/30 group-hover:text-black transition-none">-</td>
              <td colSpan={4} className="py-4 px-4 border-r border-black text-center font-bold uppercase tracking-widest text-[10px] text-black">
                <div className="flex items-center justify-center gap-2">
                  <Plus className="w-4 h-4" strokeWidth={2} />
                  INITIALIZE NEW RECORD
                </div>
<<<<<<< HEAD
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
            className="group flex flex-col items-center justify-center bg-transparent border-2 border-dashed border-border-strong hover:border-brand-400 hover:bg-brand-50 rounded-xl transition-all h-70 text-text-secondary hover:text-brand-700 outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
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
          <div className="flex flex-col items-center justify-center bg-bg-subtle border border-border-subtle rounded-xl h-70">
            <div className="w-12 h-12 rounded-full bg-border-subtle flex items-center justify-center mb-5 opacity-50">
              <Lock className="w-5 h-5 text-text-tertiary" />
            </div>
            <span className="font-semibold text-base text-text-secondary">Maximum Reached</span>
            <span className="text-sm mt-2 text-text-tertiary">{MAX_SUBJECTS} of {MAX_SUBJECTS} subjects active</span>
          </div>
        )}
=======
              </td>
            </tr>
          </tbody>
        </table>
>>>>>>> 065bb2dba4e726280e7710154014d2849637cf78
      </div>
    </div>
  );
}
