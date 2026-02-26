"use client";

import { Search, Bell, ChevronDown, LogOut } from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { usePathname } from "next/navigation";

export default function Header() {
     const { user, logout } = useAuth();
     const pathname = usePathname();

     // Derive page title from pathname
     const pageTitle = (() => {
          switch (pathname) {
               case "/": return "Dashboard";
               case "/upload": return "Upload Notes";
               case "/chat": return "Chat";
               case "/study": return "Study Mode";
               case "/settings": return "Settings";
               default: return "Dashboard";
          }
     })();

     // User initials from name or email
     const initials = user
          ? (user.name || user.email || "?")
               .split(" ")
               .map((w) => w[0])
               .join("")
               .toUpperCase()
               .slice(0, 2)
          : "?";

     const displayName = user?.name || user?.email || "Guest";

     return (
          <header className="h-16 flex items-center justify-between px-8 border-b border-border-subtle bg-bg-surface shrink-0 sticky top-0 z-10 w-full">
               <div className="flex items-center gap-4">
                    <h2 className="text-xl font-semibold text-text-primary tracking-tight">{pageTitle}</h2>
               </div>

               <div className="flex items-center space-x-6">
                    {/* Search */}
                    <div className="relative w-64 group hidden lg:block">
                         <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary group-focus-within:text-brand-500 transition-colors" />
                         <input
                              type="text"
                              placeholder="Search notes, tags..."
                              className="w-full bg-bg-subtle border border-border-default rounded-lg pl-9 pr-4 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-all placeholder:text-text-tertiary"
                         />
                    </div>

                    {/* Quick Actions */}
                    <div className="flex items-center space-x-2">
                         <button className="relative p-2 text-text-secondary hover:text-text-primary rounded-full hover:bg-bg-subtle transition-colors">
                              <Bell className="w-5 h-5" />
                         </button>
                    </div>

                    {/* Divider */}
                    <div className="h-8 w-px bg-border-subtle mx-2" />

                    {/* User Profile Area */}
                    {user ? (
                         <div className="flex items-center gap-3">
                              <div className="flex items-center gap-3 p-1.5 rounded-lg text-left">
                                   <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-semibold text-sm border border-brand-200 shrink-0">
                                        {initials}
                                   </div>
                                   <div className="hidden md:block">
                                        <p className="text-sm font-medium text-text-primary leading-none mb-1">{displayName}</p>
                                        <p className="text-xs text-text-tertiary leading-none">Student</p>
                                   </div>
                              </div>
                              <button
                                   onClick={logout}
                                   className="p-2 text-text-tertiary hover:text-red-600 rounded-lg hover:bg-bg-subtle transition-colors"
                                   title="Sign out"
                              >
                                   <LogOut className="w-4 h-4" />
                              </button>
                         </div>
                    ) : (
                         <div className="flex items-center gap-3 p-1.5 rounded-lg text-left">
                              <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center text-neutral-500 font-semibold text-sm shrink-0">
                                   ?
                              </div>
                              <div className="hidden md:block">
                                   <p className="text-sm font-medium text-text-secondary leading-none">Not signed in</p>
                              </div>
                         </div>
                    )}
               </div>
          </header>
     );
}
