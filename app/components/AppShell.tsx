"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import Sidebar from "./Sidebar";
import Header from "./Header";

import { ReactLenis } from 'lenis/react';

const publicRoutes = ["/login", "/register", "/auth"];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isPublicRoute = publicRoutes.includes(pathname);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line
    setMounted(true);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line
    setSidebarOpen(false);
  }, [pathname]);

  // Redirect to login if not logged in
  useEffect(() => {
    if (!loading && mounted) {
      if (!user && !isPublicRoute) {
        router.push("/login"); // Updated specifically to redirect to your new login
      } else if (user && isPublicRoute) {
        router.push("/");
      }
    }
  }, [loading, user, isPublicRoute, router, mounted]);

  // Public pages render without shell and hydration wrappers
  if (isPublicRoute) {
    return (
      <ReactLenis className="flex-1 overflow-y-auto w-full h-screen bg-white text-black" options={{ lerp: 0.1, duration: 1.5, smoothWheel: true }} root={false}>
        <main>{children}</main>
      </ReactLenis>
    );
  }

  // Loading state (Brutalist aesthetic)
  if (loading) {
    return (
      <div className="flex flex-col h-screen w-full items-center justify-center bg-white border-16 border-black p-8 font-sans">
        <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin mb-8"></div>
        <p className="font-mono text-base font-bold uppercase tracking-widest text-black">
          INITIALIZING SECURE SESSION...
        </p>
      </div>
    );
  }

  // Not authenticated — redirecting wait
  if (!user && !isPublicRoute) return null;

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      <div className="flex-1 flex flex-col min-w-0 h-full">
        <Header onMenuToggle={() => setSidebarOpen((v) => !v)} />
        <main className="flex-1 flex flex-col min-h-0 overflow-hidden w-full">{children}</main>
      </div>
    </>
  );
}
