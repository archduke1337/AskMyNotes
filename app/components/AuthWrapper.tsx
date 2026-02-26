"use client";

import { useAuth } from "@/lib/context/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

const publicRoutes = ["/login", "/register"];

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
     const { user, loading } = useAuth();
     const pathname = usePathname();
     const router = useRouter();
     useEffect(() => {
          if (!loading) {
               if (!user && !publicRoutes.includes(pathname)) {
                    router.push("/login");
               } else if (user && publicRoutes.includes(pathname)) {
                    router.push("/");
               }
          }
     }, [user, loading, pathname, router]);

     // Prevent access checks while loading
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

     const isPublic = publicRoutes.includes(pathname);

     if (isPublic) {
          return <main className="flex-1 overflow-y-auto w-full h-screen bg-white text-black">{children}</main>;
     }

     // If not public but also not logged in, wait for redirect
     if (!user && !isPublic) {
          return null;
     }

     return (
          <>
               <Sidebar />
               <div className="flex-1 flex flex-col min-w-0 h-full">
                    <Header />
                    <main className="flex-1 overflow-y-auto w-full bg-white text-black">
                         {children}
                    </main>
               </div>
          </>
     );
}
