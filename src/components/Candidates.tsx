"use client";

import React, { useState, useEffect } from "react";
import { getResumeAnalyses } from "@/lib/database";

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

interface ResumeAnalysisRecord {
  id?: string;
  candidate_id: string;
  candidate_name: string;
  candidate_email: string;
  data: ApiResponse;
  created_at?: string;
  updated_at?: string;
}

export default function Candidates() {
  const [candidates, setCandidates] = useState<ResumeAnalysisRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<ResumeAnalysisRecord | null>(null);

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    setLoading(true);
    setError(null);
    const result = await getResumeAnalyses();

    if (result.success && result.data) {
      setCandidates(result.data);
    } else {
      setError(result.error || "Failed to load candidates");
    }
    setLoading(false);
  };

  const handleViewResume = (candidate: ResumeAnalysisRecord) => {
    setSelectedCandidate(candidate);
  };

  const closeModal = () => {
    setSelectedCandidate(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading candidates...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <svg className="h-5 w-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Candidates</h1>
        <p className="text-slate-600">View and manage all analyzed candidate resumes</p>
      </div>

      {/* Candidates Table */}
      {candidates.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <svg className="h-16 w-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No Candidates Found</h3>
          <p className="text-slate-600">Start by uploading resumes in the Resume Analyzer</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {candidates.map((candidate) => (
                <tr key={candidate.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-slate-900">{candidate.candidate_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-600">{candidate.candidate_email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-600">
                      {candidate.data?.candidate_info?.phone || "N/A"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => handleViewResume(candidate)}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                      <svg className="h-4 w-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                      View Resume
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Resume Modal */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={closeModal}>
          {/* Backdrop */}
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"></div>

          {/* Modal */}
          <div
            className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  {selectedCandidate.candidate_name}
                </h2>
                <p className="text-sm text-slate-600 mt-1">{selectedCandidate.candidate_email}</p>
              </div>
              <button
                onClick={closeModal}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-6 space-y-6">
              {/* Contact Information */}
              <div className="bg-slate-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-slate-900 mb-3">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-600">Email</p>
                    <p className="text-sm font-medium text-slate-900">{selectedCandidate.data.candidate_info.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Phone</p>
                    <p className="text-sm font-medium text-slate-900">{selectedCandidate.data.candidate_info.phone || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Location</p>
                    <p className="text-sm font-medium text-slate-900">{selectedCandidate.data.candidate_info.location || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Experience</p>
                    <p className="text-sm font-medium text-slate-900">
                      {selectedCandidate.data.candidate_info.experience_years} years
                    </p>
                  </div>
                </div>
              </div>

              {/* Skills */}
              {selectedCandidate.data.candidate_info.skills && selectedCandidate.data.candidate_info.skills.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedCandidate.data.candidate_info.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Work Experience */}
              {selectedCandidate.data.candidate_info.work_experiences && selectedCandidate.data.candidate_info.work_experiences.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">Work Experience</h3>
                  <div className="space-y-4">
                    {selectedCandidate.data.candidate_info.work_experiences.map((exp, index) => (
                      <div key={index} className="border-l-4 border-blue-500 pl-4">
                        <h4 className="font-semibold text-slate-900">{exp.job_title}</h4>
                        <p className="text-sm text-slate-600">{exp.company_name}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          {exp.start_date} - {exp.is_current ? "Present" : exp.end_date} ({exp.duration_years} years)
                        </p>
                        {exp.description && (
                          <p className="text-sm text-slate-700 mt-2">{exp.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
