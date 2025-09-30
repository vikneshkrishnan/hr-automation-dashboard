"use client";

import React from "react";

interface AnalysisModalProps {
  isOpen: boolean;
}

export default function AnalysisModal({ isOpen }: AnalysisModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-fade-in"></div>

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 animate-scale-in">
        <div className="text-center">
          {/* Animated Icon */}
          <div className="relative mx-auto mb-6 w-20 h-20">
            {/* Spinning outer ring */}
            <div className="absolute inset-0 border-4 border-blue-200 rounded-full animate-spin-slow"></div>
            <div className="absolute inset-2 border-4 border-t-blue-600 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>

            {/* Center icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h3 className="text-2xl font-bold text-slate-900 mb-3">
            AI Agents Analyzing
          </h3>

          {/* Description */}
          <p className="text-slate-600 mb-6">
            Our intelligent agents are processing the resume and extracting key candidate information...
          </p>

          {/* Animated dots */}
          <div className="flex justify-center space-x-2">
            <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>

          {/* Processing steps (subtle animation) */}
          <div className="mt-8 space-y-3 text-left">
            <div className="flex items-center text-sm text-slate-600">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3 animate-pulse"></div>
              <span>Extracting personal information</span>
            </div>
            <div className="flex items-center text-sm text-slate-600">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3 animate-pulse" style={{ animationDelay: '200ms' }}></div>
              <span>Analyzing work experience</span>
            </div>
            <div className="flex items-center text-sm text-slate-600">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3 animate-pulse" style={{ animationDelay: '400ms' }}></div>
              <span>Identifying skills and qualifications</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }

        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }

        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
      `}</style>
    </div>
  );
}
