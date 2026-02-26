"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Folder, Upload, MessageSquare, BookOpen, Settings } from "lucide-react";

const navItems = [
     { name: "CATALOG", href: "/", icon: Folder },
     { name: "INGEST", href: "/upload", icon: Upload },
     { name: "QUERY", href: "/chat", icon: MessageSquare },
     { name: "STUDY", href: "/study", icon: BookOpen },
];

export default function Sidebar() {
     const pathname = usePathname();

     return (
          <aside className="w-56 border-r border-black bg-white flex flex-col shrink-0">
               {/* Brand Header */}
               <div className="h-16 flex items-center px-4 border-b border-black shrink-0">
                    <h1 className="font-mono text-xs tracking-widest uppercase font-bold text-black truncate">
                         ARCHIVE // 001
                    </h1>
               </div>

               {/* Navigation */}
               <nav className="flex-1 flex flex-col overflow-y-auto">
                    <div className="text-[10px] font-mono tracking-widest text-black/50 px-4 pt-6 pb-2 uppercase border-b border-black">
                         Primary Indices
                    </div>
                    <div className="flex flex-col border-b border-black border-dashed pb-2">
                         {navItems.map((item) => {
                              const isActive = pathname === item.href;
                              return (
                                   <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`flex items-center gap-3 px-4 py-3 text-xs tracking-widest font-mono uppercase transition-none border-b border-transparent ${isActive
                                                  ? "text-black bg-black/5 border-l-2 border-l-black"
                                                  : "text-black/60 hover:text-black hover:bg-black/5 border-l-2 border-l-transparent"
                                             }`}
                                   >
                                        <item.icon className={`w-4 h-4 shrink-0 ${isActive ? "text-black" : "text-black/50"}`} strokeWidth={1.5} />
                                        {item.name}
                                   </Link>
                              );
                         })}
                    </div>

                    {/* System Management */}
                    <div className="mt-auto">
                         <div className="text-[10px] font-mono tracking-widest text-black/50 px-4 pt-4 pb-2 uppercase border-t border-b border-black">
                              System
                         </div>
                         <Link
                              href="/settings"
                              className="flex items-center gap-3 px-4 py-3 text-xs tracking-widest font-mono uppercase text-black/60 hover:text-black hover:bg-black/5 transition-none"
                         >
                              <Settings className="w-4 h-4 shrink-0" strokeWidth={1.5} />
                              CONFIGURATION
                         </Link>
                    </div>
               </nav>

               <div className="p-4 border-t border-black bg-white">
                    <div className="text-[10px] font-mono leading-tight text-center text-black/40 uppercase">
                         Status: Online <br /> v.0.1.0-alpha
                    </div>
               </div>
          </aside>
     );
}
