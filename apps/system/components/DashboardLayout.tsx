"use client";

import Sidebar from "./Sidebar";
import { logout } from "../lib/auth";

interface DashboardLayoutProps {
  children: React.ReactNode;
  navItems: {
    label: string;
    href: string;
  }[];
  roleTitle: string;
}

export default function DashboardLayout({
  children,
  navItems,
  roleTitle,
}: DashboardLayoutProps) {
  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar items={navItems} title={roleTitle} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 shadow-sm">
          <div className="px-4 py-3 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                {roleTitle}
              </h2>
            </div>
            <button
              onClick={logout}
              className="px-3 py-1.5 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto">
          <div className="p-4 lg:p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
