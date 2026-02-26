"use client";

import { Search, Menu, LogOut } from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { useRouter } from "next/navigation";

interface HeaderProps {
  onMenuToggle?: () => void;
}

export default function Header({ onMenuToggle }: HeaderProps) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const initials = user?.name
    ? user.name.charAt(0).toUpperCase()
    : "?";

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
      </div>

      <div className="flex h-full flex-1 min-w-0">
        {/* Search */}
        <div className="hidden md:flex flex-1 items-center border-l border-border-strong relative group px-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" strokeWidth={1.5} />
          <input
            id="search-directory"
            type="text"
            placeholder="Search catalog..."
            className="w-full h-8 bg-transparent border-b border-border-subtle pl-7 pr-4 py-1 text-sm font-mono focus:outline-none focus:border-border-strong placeholder:text-text-tertiary text-text-primary"
          />
        </div>

        {/* User Abstract Area */}
        <div className="flex items-center h-full border-l border-border-strong shrink-0 px-2 md:px-4 group relative">
          <div className="flex items-center gap-2 md:gap-3 text-left">
            <div
              className="w-8 h-8 bg-text-primary flex items-center justify-center text-bg-app font-mono text-base tracking-widest font-bold shrink-0 cursor-default group"
              title={user ? `${user.name} (${user.email})` : "Profile"}
            >
              {initials}
            </div>
            <div className="hidden md:block w-32 truncate" title={user ? `${user.name} (${user.email})` : "Profile"}>
              <p className="text-sm font-mono font-bold text-text-primary uppercase leading-none mb-0.5 tracking-wider truncate">
                OP: {user?.name || "UNKNOWN NODE"}
              </p>
              <p className="text-xs font-mono text-text-tertiary uppercase leading-none tracking-widest truncate">
                ACCESS: SCHOLAR
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="ml-2 md:ml-4 flex items-center justify-center transition-none cursor-pointer border border-border-subtle p-2 hover:bg-bg-subtle hover:border-border-strong hover:text-danger"
            title="Terminate Session"
          >
            <LogOut className="w-4 h-4 shrink-0" strokeWidth={2} />
          </button>
        </div>
      </div>
    </header>
  );
}
