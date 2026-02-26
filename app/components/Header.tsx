import { Search, Bell, ChevronDown } from "lucide-react";

export default function Header() {
     return (
          <header className="h-16 flex items-center justify-between px-8 border-b border-border-subtle bg-bg-surface flex-shrink-0 sticky top-0 z-10 w-full">
               <div className="flex items-center gap-4">
                    {/* Page Title */}
                    <h2 className="text-xl font-semibold text-text-primary tracking-tight">Dashboard</h2>
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
                              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent-blue rounded-full border-2 border-bg-surface"></span>
                         </button>
                    </div>

                    {/* Divider */}
                    <div className="h-8 w-px bg-border-subtle mx-2" />

                    {/* User Profile Area */}
                    <button className="flex items-center gap-3 hover:bg-bg-subtle p-1.5 rounded-lg transition-colors text-left">
                         <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-semibold text-sm border border-brand-200 shrink-0">
                              SM
                         </div>
                         <div className="hidden md:block">
                              <p className="text-sm font-medium text-text-primary leading-none mb-1">Sahil Mane</p>
                              <p className="text-xs text-text-tertiary leading-none">Student</p>
                         </div>
                         <ChevronDown className="w-4 h-4 text-text-tertiary hidden md:block" />
                    </button>

               </div>
          </header>
     );
}
