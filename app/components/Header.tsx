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
    router.push("/auth");
  };

  return (
    <header className="h-14 md:h-16 flex items-center justify-between px-3 md:px-4 border-b border-border-strong bg-bg-surface shrink-0 sticky top-0 z-10 w-full">
      <div className="flex items-center gap-2 md:gap-4 md:border-r md:border-border-strong md:pr-4 h-full">
        <button
          onClick={onMenuToggle}
          className="md:hidden p-1.5 hover:bg-bg-subtle cursor-pointer"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" strokeWidth={1.5} />
        </button>
        <div className="flex items-center gap-2">
          <Hash className="w-4 h-4 text-text-tertiary hidden md:block" strokeWidth={1.5} />
          <h2 className="text-[10px] font-mono tracking-widest uppercase font-bold">
            DIRECTORY ROOT
          </h2>
        </div>
      </div>

      <div className="flex h-full flex-1 min-w-0">
        {/* Search */}
        <div className="hidden md:flex flex-1 items-center border-l border-border-strong relative group px-4">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
            strokeWidth={1.5}
          />
          <input
            id="search-directory"
            type="text"
            placeholder="FIND RECORD..."
            className="w-full h-8 bg-transparent border-b border-border-subtle pl-7 pr-4 py-1 text-xs font-mono focus:outline-none focus:border-border-strong uppercase placeholder:text-text-tertiary"
          />
        </div>

        {/* User Area */}
        <div className="flex items-center h-full border-l border-border-strong shrink-0 px-2 md:px-4">
          <div className="flex items-center gap-2 md:gap-3 text-left">
            <div className="w-6 h-6 bg-text-primary text-bg-app flex items-center justify-center font-mono text-[10px] tracking-widest font-bold shrink-0">
              {initials}
            </div>
            <div className="hidden md:block">
              <p className="text-[10px] font-mono font-bold uppercase leading-none mb-0.5 tracking-wider">
                OPERATOR: {initials}
              </p>
              <p className="text-[9px] font-mono text-text-tertiary uppercase leading-none tracking-widest">
                {user?.email || "—"}
              </p>
            </div>
            {user && (
              <button
                onClick={handleLogout}
                className="ml-1 p-1.5 border border-border-subtle hover:border-border-strong hover:bg-text-primary hover:text-bg-app cursor-pointer transition-colors"
                title="Logout"
              >
                <LogOut className="w-3 h-3" strokeWidth={1.5} />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
