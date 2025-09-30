import React from "react";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 px-6 py-4">
      <div className="flex items-center justify-between text-sm text-slate-600">
        <div className="flex items-center space-x-4">
          <span>© 2024 HR AutoResume</span>
          <span>All rights reserved</span>
        </div>
        <div className="flex items-center space-x-4">
          <span>Version 1.0.0</span>
          <a href="#" className="hover:text-slate-900 transition-colors">
            Help & Support
          </a>
        </div>
      </div>
    </footer>
  );
}