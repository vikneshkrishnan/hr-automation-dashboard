"use client";

import React, { useRef, useState } from "react";
import { saveResumeAnalysis } from "@/lib/database";
import { useToast } from "@/contexts/ToastContext";
import AnalysisModal from "./AnalysisModal";

interface CandidateInfo {
  candidate_id: string;
  name: string;
  email: string;
  phone: string;
  skills: string[];
  experience_years: number;
  work_experiences: WorkExperience[];
  experience_calculation: {
    total_years: number;
    calculation_method: string;
    breakdown: string[];
    notes: string;
  };
  location: string;
}

interface WorkExperience {
  company_name: string;
  job_title: string;
  start_date: string;
  end_date: string;
  duration_years: number;
  is_current: boolean;
  description: string;
}

interface ApiResponse {
  status: string;
  message: string;
  candidate_id: string;
  candidate_info: CandidateInfo;
  sections: {
    summary: string;
    experience: string;
    education: string;
    skills: string;
    projects: string;
    certifications: string;
  };
}

interface FileUploadWidgetProps {
  onUploadSuccess: (data: ApiResponse) => void;
  onUploadError: (error: string) => void;
}

export default function FileUploadWidget({ onUploadSuccess, onUploadError }: FileUploadWidgetProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const { showToast } = useToast();

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    setShowModal(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://localhost:8000/api/v1/resume/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const data: ApiResponse = await response.json();

      if (data.status === 'success') {
        // Save to database
        setIsSaving(true);
        const saveResult = await saveResumeAnalysis(data);

        if (saveResult.success) {
          showToast('Resume analyzed and saved successfully!', 'success');
          onUploadSuccess(data);
        } else {
          // Check if it's a duplicate resume
          if (saveResult.isDuplicate) {
            // For duplicates, don't show results - just show error
            console.warn('Duplicate resume detected:', saveResult.error);
            showToast(saveResult.error || 'This resume has already been analyzed', 'error', 5000);
            setShowModal(false);
            setIsSaving(false);
            setIsUploading(false);
            return; // Exit early, don't call onUploadSuccess
          }

          // For other database errors, show results but warn about save failure
          console.warn('Failed to save to database:', saveResult.error);
          showToast('Resume analyzed but not saved to database', 'info');

          // Show database error details
          if (saveResult.error) {
            console.error('Database Error Details:', saveResult.error);
            showToast(saveResult.error, 'error', 5000);
          }

          onUploadSuccess(data);
        }
        setIsSaving(false);
        setShowModal(false);
      } else {
        setShowModal(false);
        onUploadError(data.message || 'Upload failed');
      }
    } catch (error) {
      setShowModal(false);
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      onUploadError(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type === "application/pdf") {
        await uploadFile(file);
      } else {
        onUploadError("Please upload a PDF file only.");
      }
    }
  };

  const handleButtonClick = () => {
    if (!isUploading && !isSaving) {
      fileInputRef.current?.click();
    }
  };

  const isProcessing = isUploading || isSaving;

  return (
    <>
      <AnalysisModal isOpen={showModal} />

      <div className="flex items-center">
        <button
        onClick={handleButtonClick}
        disabled={isProcessing}
        className={`inline-flex items-center px-6 py-3 font-semibold rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all duration-200 shadow-sm hover:shadow-md whitespace-nowrap ${
          isProcessing
            ? 'bg-blue-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
      >
        {isProcessing ? (
          <>
            <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {isUploading ? 'Analyzing...' : 'Saving...'}
          </>
        ) : (
          <>
            <svg
              className="h-5 w-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            Upload Resume
          </>
        )}
      </button>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isProcessing}
        />
      </div>
    </>
  );
}