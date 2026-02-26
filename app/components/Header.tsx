import { Search, Hash } from "lucide-react";

export default function Header() {
     return (
          <header className="h-16 flex items-center justify-between px-4 border-b border-black bg-white shrink-0 sticky top-0 z-10 w-full table-fixed">
               <div className="flex items-center gap-4 border-r border-black pr-4 h-full">
                    {/* Page Abstract */}
                    <div className="flex items-center gap-2">
                         <Hash className="w-4 h-4 text-black/50" strokeWidth={1.5} />
                         <h2 className="text-xs font-mono tracking-widest text-black uppercase font-bold">DIRECTORY ROOT</h2>
                    </div>
               </div>

               <div className="flex h-full w-full">
                    {/* Search */}
                    <div className="flex-1 flex items-center border-l border-black relative group px-4">
                         <label htmlFor="search-directory" className="text-[10px] font-mono absolute -top-[5px] left-3 bg-white px-1 leading-none uppercase text-black/50 tracking-wider">
                              Query Catalog
                         </label>
                         <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black" strokeWidth={1.5} />
                         <input
                              id="search-directory"
                              type="text"
                              placeholder="FIND RECORD..."
                              className="w-full h-8 bg-transparent border-b border-black/20 pl-7 pr-4 py-1 text-xs font-mono text-black focus:outline-none focus:border-black transition-none uppercase placeholder:text-black/30"
                         />
                    </div>

                    {/* User Abstract Area */}
                    <div className="flex items-center h-full border-l border-black shrink-0 px-4 hover:bg-black/5 cursor-pointer">
                         <div className="flex items-center gap-3 text-left">
                              <div className="w-6 h-6 bg-black flex items-center justify-center text-white font-mono text-[10px] tracking-widest font-bold shrink-0">
                                   SM
                              </div>
                              <div>
                                   <p className="text-[10px] font-mono font-bold text-black uppercase leading-none mb-0.5 tracking-wider">OPERATOR: SM</p>
                                   <p className="text-[9px] font-mono text-black/50 uppercase leading-none tracking-widest">ACCESS: SCHOLAR</p>
                              </div>
                         </div>
                    </div>
               </div>
          </header>
     );
}
