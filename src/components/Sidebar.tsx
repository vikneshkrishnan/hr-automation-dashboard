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
      name: "Jobs",
      page: "jobs",
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className={`${isCollapsed ? 'w-16' : 'w-64'} bg-gradient-to-b from-purple-700 via-purple-600 to-purple-800 h-full flex flex-col transition-all duration-300 shadow-xl`}>
      {/* Logo Section */}
      {!isCollapsed && (
        <div className="px-6 py-6 border-b border-purple-500/30">
          <h2 className="text-2xl font-bold text-white tracking-tight">HR AutoResume</h2>
          <p className="text-purple-200 text-xs mt-1">AI-Powered Recruitment</p>
        </div>
      )}

      {/* Navigation Items */}
      <nav className={`flex-1 ${isCollapsed ? 'px-2' : 'px-4'} py-6 space-y-2`}>
        {navigationItems.map((item) => (
          <button
            key={item.name}
            onClick={() => onPageChange(item.page)}
            className={`flex items-center w-full ${isCollapsed ? 'px-3 py-3 justify-center' : 'px-4 py-3'} text-sm font-semibold rounded-xl transition-all duration-200 ${
              activePage === item.page
                ? "bg-white text-purple-700 shadow-lg transform scale-105"
                : "text-white hover:bg-purple-500/30 hover:translate-x-1"
            }`}
            title={isCollapsed ? item.name : undefined}
          >
            <span className={isCollapsed ? '' : 'mr-3'}>{item.icon}</span>
            {!isCollapsed && <span className="flex-1 text-left">{item.name}</span>}
            {!isCollapsed && activePage === item.page && (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        ))}
      </nav>

      {/* Settings at bottom */}
      <div className={`${isCollapsed ? 'px-2' : 'px-4'} py-4 border-t border-purple-500/30`}>
        <a
          href="#"
          className={`flex items-center ${isCollapsed ? 'px-3 py-3 justify-center' : 'px-4 py-3'} text-sm font-semibold text-white rounded-xl hover:bg-purple-500/30 transition-all duration-200`}
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