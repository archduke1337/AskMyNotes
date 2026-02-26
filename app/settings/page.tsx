"use client";

import { useAuth } from "@/lib/context/AuthContext";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Sun, Moon, LogOut, User, Mail, Shield, Loader2 } from "lucide-react";

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleLogout = async () => {
    await logout();
    router.push("/auth");
  };

  if (!mounted) {
    return <div className="flex items-center justify-center h-full"><Loader2 className="w-5 h-5 animate-spin text-text-tertiary" /></div>;
  }

  return (
    <div className="flex flex-col h-full bg-bg-app relative">
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)", backgroundSize: "64px 64px" }}
      />

      <div className="h-12 border-b border-border-strong flex items-center px-4 md:px-6 shrink-0 bg-bg-surface relative z-10">
        <h2 className="text-sm font-semibold tracking-wide">Settings</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8 relative z-10 max-w-2xl mx-auto w-full space-y-6">
        {/* User Profile */}
        <div className="border border-border-strong bg-bg-surface">
          <div className="border-b border-border-strong p-4 bg-text-primary text-bg-app">
            <h3 className="text-sm font-semibold tracking-wide">Profile</h3>
          </div>
          <div className="p-4 md:p-6 space-y-4">
            <div className="flex items-center gap-4 border border-border-strong p-4">
              <div className="w-12 h-12 bg-text-primary text-bg-app flex items-center justify-center text-lg font-bold shrink-0 rounded">
                {user?.name?.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) || "??"}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-semibold tracking-wide">{user?.name || "Unknown"}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3 h-3 text-text-tertiary" />
                  <p className="text-xs text-text-secondary">{user?.email || "—"}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 border border-border-strong p-3 bg-bg-subtle">
              <span className="text-xs font-medium text-text-tertiary">
                ID: {user?.$id || "—"}
              </span>
            </div>
          </div>
        </div>

        {/* Theme */}
        <div className="border border-border-strong bg-bg-surface">
          <div className="border-b border-border-strong p-4 bg-bg-subtle">
            <h3 className="text-sm font-semibold tracking-wide">Theme</h3>
          </div>
          <div className="p-4 md:p-6">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setTheme("light")}
                className={`flex items-center justify-center gap-3 p-4 border text-sm font-semibold tracking-wide cursor-pointer rounded transition-colors ${resolvedTheme === "light"
                    ? "border-text-primary bg-bg-subtle border-2"
                    : "border-border-strong hover:bg-bg-subtle"
                  }`}
              >
                <Sun className="w-4 h-4" /> Light
              </button>
              <button
                onClick={() => setTheme("dark")}
                className={`flex items-center justify-center gap-3 p-4 border text-sm font-semibold tracking-wide cursor-pointer rounded transition-colors ${resolvedTheme === "dark"
                    ? "border-text-primary bg-bg-subtle border-2"
                    : "border-border-strong hover:bg-bg-subtle"
                  }`}
              >
                <Moon className="w-4 h-4" /> Dark
              </button>
            </div>
            <p className="text-xs text-text-tertiary mt-3">
              Current: {(theme || "system")}
            </p>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="border border-danger/30 bg-bg-surface">
          <div className="border-b border-danger/30 p-4 bg-danger/5">
            <h3 className="text-sm font-semibold tracking-wide text-danger">Danger Zone</h3>
          </div>
          <div className="p-4 md:p-6">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-3 border border-danger text-danger text-sm tracking-wide font-semibold hover:bg-danger hover:text-white cursor-pointer rounded transition-colors"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>

        {/* App Info */}
        <div className="border border-border-subtle bg-bg-surface p-4 text-center">
          <p className="text-xs font-medium text-text-tertiary tracking-wide">
            AskMyNotes v0.1.0-alpha
          </p>
          <p className="text-[10px] text-text-tertiary mt-1">
            Next.js 16 • Appwrite • OpenAI
          </p>
        </div>
      </div>
    </div>
  );
}
