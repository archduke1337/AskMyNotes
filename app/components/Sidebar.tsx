"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Folder, Upload, MessageSquare, BookOpen, Settings, Mic, X } from "lucide-react";
import Image from "next/image";

interface SidebarProps {
  onClose?: () => void;
}

const navItems = [
  { name: "Dashboard", href: "/", icon: Folder },
  { name: "Upload", href: "/upload", icon: Upload },
  { name: "Chat", href: "/chat", icon: MessageSquare },
  { name: "Voice Chat", href: "/voice-chat", icon: Mic },
  { name: "Study Mode", href: "/study", icon: BookOpen },
];

export default function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-56 border-r border-border-strong bg-bg-surface flex flex-col shrink-0 h-full">
      {/* Brand Header */}
      <div className="h-14 md:h-16 flex items-center justify-center border-b border-border-strong shrink-0 relative px-4">
        <Image
          src="/image.png"
          alt="AskMyNotes Logo"
          className="object-contain"
          fill
          sizes="224px"
          priority
        />
        {/* Mobile close */}
        <button
          onClick={onClose}
          className="absolute right-2 top-1/2 -translate-y-1/2 md:hidden p-1 hover:bg-bg-subtle z-10 cursor-pointer"
          aria-label="Close sidebar"
        >
          <X className="w-4 h-4" strokeWidth={1.5} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col overflow-y-auto">
        <div className="text-xs font-semibold text-text-tertiary px-4 pt-6 pb-2 uppercase border-b border-border-strong tracking-wider">
          Menu
        </div>
        <div className="flex flex-col border-b border-border-strong border-dashed pb-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium border-l-2 transition-colors ${isActive
                    ? "text-text-primary bg-bg-subtle border-l-text-primary"
                    : "text-text-secondary hover:text-text-primary hover:bg-bg-subtle border-l-transparent"
                  }`}
              >
                <item.icon
                  className={`w-4 h-4 shrink-0 ${isActive ? "text-text-primary" : "text-text-tertiary"}`}
                  strokeWidth={1.5}
                />
                {item.name}
              </Link>
            );
          })}
        </div>

        {/* System Management */}
        <div className="mt-auto">
          <div className="text-xs font-semibold text-text-tertiary px-4 pt-4 pb-2 uppercase border-t border-b border-border-strong tracking-wider">
            System
          </div>
          <Link
            href="/settings"
            onClick={onClose}
            className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${pathname === "/settings"
                ? "text-text-primary bg-bg-subtle"
                : "text-text-secondary hover:text-text-primary hover:bg-bg-subtle"
              }`}
          >
            <Settings className="w-4 h-4 shrink-0 border-transparent" strokeWidth={1.5} />
            Settings
          </Link>
        </div>
      </nav>

      <div className="p-4 border-t border-border-strong">
        <div className="text-[10px] font-mono leading-tight text-center text-text-tertiary uppercase">
          Status: Online <br /> v.0.1.0-alpha
        </div>
      </div>
    </aside>
  );
}
