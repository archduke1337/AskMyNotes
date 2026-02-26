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
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
