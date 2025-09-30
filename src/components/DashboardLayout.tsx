"use client";

import React, { useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Footer from "./Footer";

interface DashboardLayoutProps {
  children: React.ReactNode;
  activePage: string;
  onPageChange: (page: string) => void;
}

export default function DashboardLayout({ children, activePage, onPageChange }: DashboardLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <Header onToggleSidebar={toggleSidebar} />

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          activePage={activePage}
          onPageChange={onPageChange}
        />

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="h-full flex flex-col">
            <div className="flex-1 p-6">
              {children}
            </div>
            <Footer />
          </div>
        </main>
      </div>
    </div>
  );
}