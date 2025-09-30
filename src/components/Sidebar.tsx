"use client";

import React from "react";

interface NavigationItem {
  name: string;
  icon: React.ReactNode;
  page: string;
}

interface SidebarProps {
  isCollapsed: boolean;
  activePage: string;
  onPageChange: (page: string) => void;
}

export default function Sidebar({ isCollapsed, activePage, onPageChange }: SidebarProps) {
  const navigationItems: NavigationItem[] = [
    {
      name: "Dashboard",
      page: "dashboard",
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
    },
    {
      name: "Resume Analyzer",
      page: "resume-analyzer",
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className={`${isCollapsed ? 'w-16' : 'w-64'} bg-slate-900 border-r border-slate-800 h-full flex flex-col transition-all duration-300`}>
      {/* Navigation Items */}
      <nav className={`flex-1 ${isCollapsed ? 'px-2' : 'px-4'} py-6 space-y-1`}>
        {navigationItems.map((item) => (
          <button
            key={item.name}
            onClick={() => onPageChange(item.page)}
            className={`flex items-center w-full ${isCollapsed ? 'px-2 py-3 justify-center' : 'px-3 py-2.5'} text-sm font-medium rounded-lg transition-colors ${
              activePage === item.page
                ? "bg-blue-600 text-white shadow-lg"
                : "text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
            title={isCollapsed ? item.name : undefined}
          >
            <span className={isCollapsed ? '' : 'mr-3'}>{item.icon}</span>
            {!isCollapsed && item.name}
          </button>
        ))}
      </nav>

      {/* Settings at bottom */}
      <div className={`${isCollapsed ? 'px-2' : 'px-4'} py-4 border-t border-slate-800`}>
        <a
          href="#"
          className={`flex items-center ${isCollapsed ? 'px-2 py-3 justify-center' : 'px-3 py-2.5'} text-sm font-medium text-slate-300 rounded-lg hover:bg-slate-800 hover:text-white transition-colors`}
          title={isCollapsed ? 'Settings' : undefined}
        >
          <svg
            className={`h-5 w-5 ${isCollapsed ? '' : 'mr-3'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          {!isCollapsed && 'Settings'}
        </a>
      </div>
    </div>
  );
}