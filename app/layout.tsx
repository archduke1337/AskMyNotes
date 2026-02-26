import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AskMyNotes | Student Dashboard",
  description: "A professional, calm workspace for students to organize notes and study.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased font-sans h-screen w-full overflow-hidden flex bg-bg-app text-text-primary`}>
        {/* Sidebar Component */}
        <Sidebar />

        <div className="flex-1 flex flex-col min-w-0 h-full">
          {/* Top Header Component */}
          <Header />

          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto w-full">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
