"use client";

import React from "react";

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

interface ResumeResultsProps {
  data: ApiResponse;
  onReset: () => void;
}

export default function ResumeResults({ data, onReset }: ResumeResultsProps) {
  const { candidate_info } = data;

  const formatDate = (dateString: string) => {
    if (dateString === "Current") return "Present";
    return dateString;
  };

  return (
    <div className="space-y-6">
      {/* Header with candidate name and reset button */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Resume Analysis</h1>
          <p className="text-slate-600">Analysis complete for {candidate_info.name}</p>
        </div>
        <button
          onClick={onReset}
          className="inline-flex items-center px-4 py-2 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 focus:outline-none focus:ring-4 focus:ring-slate-200 transition-all duration-200"
        >
          <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Upload New Resume
        </button>
      </div>

      {/* Candidate Information Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Personal Information */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Personal Information</h3>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-slate-600">Name</label>
              <p className="text-slate-900">{candidate_info.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Email</label>
              <p className="text-slate-900">{candidate_info.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Phone</label>
              <p className="text-slate-900">{candidate_info.phone}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Location</label>
              <p className="text-slate-900">{candidate_info.location}</p>
            </div>
          </div>
        </div>

        {/* Experience Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Experience Summary</h3>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-slate-600">Total Experience</label>
              <p className="text-2xl font-bold text-blue-600">{candidate_info.experience_years} years</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Positions Held</label>
              <p className="text-slate-900">{candidate_info.work_experiences.length} positions</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Calculation Method</label>
              <p className="text-sm text-slate-700">{candidate_info.experience_calculation.calculation_method}</p>
            </div>
          </div>
        </div>

        {/* Skills Overview */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Skills Overview</h3>
          <div>
            <label className="text-sm font-medium text-slate-600">Total Skills</label>
            <p className="text-2xl font-bold text-green-600 mb-3">{candidate_info.skills.length}</p>
            <div className="max-h-32 overflow-y-auto">
              <div className="flex flex-wrap gap-1">
                {candidate_info.skills.slice(0, 6).map((skill, index) => (
                  <span
                    key={index}
                    className="inline-block px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded-md"
                  >
                    {skill}
                  </span>
                ))}
                {candidate_info.skills.length > 6 && (
                  <span className="inline-block px-2 py-1 bg-slate-200 text-slate-600 text-xs rounded-md">
                    +{candidate_info.skills.length - 6} more
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Work Experience */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-6">Work Experience</h3>
        <div className="space-y-6">
          {candidate_info.work_experiences.map((experience, index) => (
            <div key={index} className="border-l-4 border-blue-200 pl-6 pb-6 last:pb-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                <div>
                  <h4 className="text-lg font-semibold text-slate-900">{experience.job_title}</h4>
                  <p className="text-blue-600 font-medium">{experience.company_name}</p>
                </div>
                <div className="mt-2 sm:mt-0 text-sm text-slate-600">
                  <span className="flex items-center">
                    <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    {formatDate(experience.start_date)} - {formatDate(experience.end_date)}
                    {experience.is_current && (
                      <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                        Current
                      </span>
                    )}
                  </span>
                  <span className="text-slate-500 text-xs">
                    {experience.duration_years} year{experience.duration_years !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
              <p className="text-slate-700 text-sm leading-relaxed">{experience.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* All Skills */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">All Skills</h3>
        <div className="flex flex-wrap gap-2">
          {candidate_info.skills.map((skill, index) => (
            <span
              key={index}
              className="inline-block px-3 py-2 bg-blue-50 text-blue-700 text-sm rounded-lg border border-blue-200"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Experience Breakdown */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Experience Calculation Breakdown</h3>
        <div className="space-y-2">
          {candidate_info.experience_calculation.breakdown.map((item, index) => (
            <p key={index} className="text-sm text-slate-600">{item}</p>
          ))}
          <p className="text-sm text-slate-500 mt-4">{candidate_info.experience_calculation.notes}</p>
        </div>
      </div>
    </div>
  );
}