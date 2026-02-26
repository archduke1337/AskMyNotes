"use client";

import { Search, Hash, Menu, LogOut } from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { useRouter } from "next/navigation";

interface HeaderProps {
  onMenuToggle?: () => void;
}

export default function Header({ onMenuToggle }: HeaderProps) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "??";

  const handleLogout = async () => {
    await logout();
    router.push("/login"); // Updated specifically to redirect to your new login
  };

  return (
    <header className="h-14 md:h-16 flex items-center justify-between px-3 md:px-4 border-b border-border-strong bg-bg-surface shrink-0 sticky top-0 z-10 w-full">
      <div className="flex items-center gap-2 md:gap-4 md:border-r md:border-border-strong md:pr-4 h-full">
        <button
          onClick={onMenuToggle}
          className="md:hidden p-1.5 hover:bg-bg-subtle cursor-pointer transition-colors"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5 text-text-primary" strokeWidth={1.5} />
        </button>
        <div className="flex items-center gap-2">
          <Hash className="w-4 h-4 text-text-tertiary hidden md:block" strokeWidth={1.5} />
          <h2 className="text-sm font-semibold tracking-wide text-text-primary">
            Home
          </h2>
        </div>
      </div>

      <div className="flex h-full flex-1 min-w-0">
        {/* Search */}
        <div className="hidden md:flex flex-1 items-center border-l border-border-strong relative group px-4">
          <label htmlFor="search-directory" className="text-xs font-medium absolute -top-1.25 left-3 bg-bg-surface px-1 text-text-tertiary shadow-[0_0_0_2px_var(--bg-surface)]">
            Search
          </label>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" strokeWidth={1.5} />
          <input
            id="search-directory"
            type="text"
            placeholder="Search records..."
            className="w-full h-8 bg-transparent border-b border-border-subtle pl-7 pr-4 py-1 text-sm focus:outline-none focus:border-border-strong placeholder:text-text-tertiary text-text-primary"
          />
        </div>

        {/* User Abstract Area */}
        <div className="flex items-center h-full border-l border-border-strong shrink-0 px-2 md:px-4 group relative">
          <div className="flex items-center gap-2 md:gap-3 text-left">
            <div className="w-8 h-8 bg-text-primary flex items-center justify-center text-bg-app text-sm font-bold shrink-0 rounded-full">
              {initials}
            </div>
            <div className="hidden md:block w-32 truncate">
              <p className="text-sm font-semibold text-text-primary mb-0.5 truncate">
                {user?.name || "Unknown"}
              </p>
              <p className="text-xs text-text-tertiary truncate">
                User
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="ml-2 sm:ml-4 sm:absolute sm:right-0 sm:top-0 sm:h-full sm:w-12 sm:bg-text-primary sm:text-bg-app flex items-center justify-center sm:opacity-0 sm:group-hover:opacity-100 transition-none cursor-pointer border border-border-strong sm:border-0 p-1.5 sm:p-0 hover:bg-bg-subtle sm:hover:bg-text-secondary"
            title="Sign out"
          >
            <LogOut className="w-4 h-4 shrink-0" strokeWidth={2} />
          </button>
        </div>
      </div>
    </header>
  );
}
