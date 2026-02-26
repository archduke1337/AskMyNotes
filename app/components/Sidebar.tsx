"use client";

import {
     LayoutDashboard,
     Library,
     FileUp,
     MessageSquare,
     GraduationCap,
     Settings,
     BookOpen
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
     { name: "Dashboard", href: "/", icon: LayoutDashboard },
     { name: "Subjects", href: "/subjects", icon: Library },
     { name: "Upload Notes", href: "/upload", icon: FileUp },
     { name: "Chat", href: "/chat", icon: MessageSquare },
     { name: "Study Mode", href: "/study", icon: GraduationCap },
];

export default function Sidebar() {
     const pathname = usePathname();

     return (
          <aside className="w-64 border-r border-border-subtle bg-bg-surface shrink-0 flex-col hidden md:flex">
               {/* Brand area */}
               <div className="h-16 flex items-center px-6 border-b border-border-subtle">
                    <Link href="/" className="font-semibold text-lg text-brand-700 tracking-tight flex items-center gap-2">
                         <BookOpen className="w-5 h-5 text-brand-500" />
                         AskMyNotes
                    </Link>
               </div>

               {/* Navigation */}
               <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
                    <div className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-3 px-3">
                         Menu
                    </div>

                    {navItems.map((item) => {
                         const isActive = pathname === item.href;
                         const Icon = item.icon;

                         return (
                              <Link
                                   key={item.name}
                                   href={item.href}
                                   className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
                                             ? "bg-brand-50 text-brand-700"
                                             : "text-text-secondary hover:bg-bg-subtle hover:text-text-primary"
                                        }`}
                              >
                                   <Icon className="w-4 h-4" />
                                   {item.name}
                              </Link>
                         );
                    })}

                    <div className="mt-8 mb-3">
                         <div className="text-xs font-semibold text-text-tertiary uppercase tracking-wider px-3">
                              System
                         </div>
                    </div>
                    <Link
                         href="/settings"
                         className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${pathname === "/settings"
                                   ? "bg-brand-50 text-brand-700"
                                   : "text-text-secondary hover:bg-bg-subtle hover:text-text-primary"
                              }`}
                    >
                         <Settings className="w-4 h-4" />
                         Settings
                    </Link>
               </nav>
          </aside>
     );
}
