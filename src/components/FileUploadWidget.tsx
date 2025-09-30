"use client";

import React, { useRef, useState } from "react";
import { saveResumeAnalysis, testSupabaseBasicConnection, testDatabaseConnection, testRLSPermissions } from "@/lib/database";

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

  const uploadFile = async (file: File) => {
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://localhost:8001/api/v1/resume/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const data: ApiResponse = await response.json();

      if (data.status === 'success') {
        // Test database connection first
        setIsSaving(true);

        // Step 1: Test basic Supabase connectivity
        console.log('🔍 Step 1: Testing basic Supabase connectivity...');
        const basicTest = await testSupabaseBasicConnection();

        if (!basicTest.success) {
          console.error('❌ Basic Supabase connectivity failed:', basicTest.error);
          console.error('   This indicates a fundamental issue with URL, API key, or network connectivity');
        } else {
          console.log('✅ Basic Supabase connectivity working');

          // Step 2: Test table-specific connection
          console.log('🔍 Step 2: Testing table connectivity...');
          const tableTest = await testDatabaseConnection();

          if (!tableTest.success) {
            console.error('❌ Table connectivity failed:', tableTest.error);
            if (tableTest.tableExists === false) {
              console.error('   The resume_analyses table does not exist. Please run the SQL schema from supabase_schema.sql');
            }
          } else {
            // Step 3: Test RLS permissions
            console.log('🔍 Step 3: Testing RLS permissions...');
            const rlsTest = await testRLSPermissions();
            if (!rlsTest.success) {
              console.error('❌ RLS permissions failed:', rlsTest.error);
              console.error('   You may need to check your RLS policies or authenticate with Supabase');
            } else {
              console.log('✅ All database tests passed');
            }
          }
        }

        // Save to database
        const saveResult = await saveResumeAnalysis(data);

        if (saveResult.success) {
          onUploadSuccess(data);
        } else {
          // Still show the results even if database save fails
          console.warn('Failed to save to database:', saveResult.error);
          onUploadSuccess(data);
        }
        setIsSaving(false);
      } else {
        onUploadError(data.message || 'Upload failed');
      }
    } catch (error) {
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
  );
}