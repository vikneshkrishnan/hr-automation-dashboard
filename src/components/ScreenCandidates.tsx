"use client";

import React, { useState } from "react";
import { useToast } from "@/contexts/ToastContext";

interface ScreeningRequest {
  title: string;
  description: string;
  required_skills: string[];
  preferred_skills: string[];
  experience_years: number;
  limit: number;
}

interface ScreenedCandidate {
  candidate_id: string;
  name: string;
  score: number;
  fit_score: number;
  recommendation: string;
  strengths: string[];
  concerns: string[];
  next_steps: string;
}

interface ScreeningResponse {
  status: string;
  total_candidates: number;
  candidates: ScreenedCandidate[];
  job_id: string;
}

export default function ScreenCandidates() {
  const [formData, setFormData] = useState<ScreeningRequest>({
    title: "",
    description: "",
    required_skills: [],
    preferred_skills: [],
    experience_years: 0,
    limit: 10,
  });

  const [requiredSkillInput, setRequiredSkillInput] = useState("");
  const [preferredSkillInput, setPreferredSkillInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<ScreeningResponse | null>(null);
  const [expandedCandidate, setExpandedCandidate] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const { showToast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "experience_years" || name === "limit" ? parseInt(value) || 0 : value,
    }));
  };

  const addSkill = (type: "required" | "preferred") => {
    const input = type === "required" ? requiredSkillInput : preferredSkillInput;
    if (!input.trim()) return;

    const field = type === "required" ? "required_skills" : "preferred_skills";
    if (!formData[field].includes(input.trim())) {
      setFormData((prev) => ({
        ...prev,
        [field]: [...prev[field], input.trim()],
      }));
    }

    if (type === "required") {
      setRequiredSkillInput("");
    } else {
      setPreferredSkillInput("");
    }
  };

  const removeSkill = (type: "required" | "preferred", skill: string) => {
    const field = type === "required" ? "required_skills" : "preferred_skills";
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((s) => s !== skill),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setShowModal(true);
    setError(null);
    setResults(null);

    try {
      const response = await fetch("http://localhost:8000/api/v1/candidates/screen", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`Screening failed: ${response.statusText}`);
      }

      const data: ScreeningResponse = await response.json();
      setResults(data);
      setShowModal(false);

      // Show success toast
      if (data.total_candidates === 0) {
        showToast("No matching candidates found. Try adjusting your requirements.", "info");
      } else {
        showToast(`Successfully found ${data.total_candidates} matching candidate${data.total_candidates !== 1 ? 's' : ''}!`, "success");
      }
    } catch (err) {
      setShowModal(false);
      const errorMessage = err instanceof Error ? err.message : "Failed to screen candidates";
      setError(errorMessage);
      showToast(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation.toLowerCase()) {
      case "strong_match":
        return "bg-green-100 text-green-800 border-green-200";
      case "good_match":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "potential_match":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "weak_match":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  const getRecommendationLabel = (recommendation: string) => {
    return recommendation.split("_").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
  };

  const toggleCandidate = (candidateId: string) => {
    setExpandedCandidate(expandedCandidate === candidateId ? null : candidateId);
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Screen Candidates</h1>
        <p className="text-slate-600">Find the best candidates for your job opening using AI-powered screening</p>
      </div>

      {/* Job Requirements Form */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Job Requirements</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Job Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-2">
              Job Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-900 text-slate-900"
              placeholder="e.g., Senior Python Developer"
            />
          </div>

          {/* Job Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-2">
              Job Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows={4}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-900 text-slate-900"
              placeholder="Describe the role, responsibilities, and what you're looking for..."
            />
          </div>

          {/* Required Skills */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Required Skills *
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={requiredSkillInput}
                onChange={(e) => setRequiredSkillInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSkill("required"))}
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-900 text-slate-900"
                placeholder="Type a skill and press Enter or click Add"
              />
              <button
                type="button"
                onClick={() => addSkill("required")}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.required_skills.map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-slate-900"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill("required", skill)}
                    className="ml-2 text-red-600 hover:text-red-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Preferred Skills */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Preferred Skills
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={preferredSkillInput}
                onChange={(e) => setPreferredSkillInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSkill("preferred"))}
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-900 text-slate-900"
                placeholder="Type a skill and press Enter or click Add"
              />
              <button
                type="button"
                onClick={() => addSkill("preferred")}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.preferred_skills.map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-slate-900"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill("preferred", skill)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Experience Years and Limit */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="experience_years" className="block text-sm font-medium text-slate-700 mb-2">
                Minimum Experience (years) *
              </label>
              <input
                type="number"
                id="experience_years"
                name="experience_years"
                value={formData.experience_years}
                onChange={handleInputChange}
                required
                min="0"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900"
              />
            </div>
            <div>
              <label htmlFor="limit" className="block text-sm font-medium text-slate-700 mb-2">
                Maximum Results
              </label>
              <input
                type="number"
                id="limit"
                name="limit"
                value={formData.limit}
                onChange={handleInputChange}
                min="1"
                max="50"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all duration-200 disabled:bg-slate-400 disabled:cursor-not-allowed"
          >
            {loading ? "Screening Candidates..." : "Screen Candidates"}
          </button>
        </form>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
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
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Analyzing candidates...</p>
          </div>
        </div>
      )}

      {/* Results */}
      {results && !loading && (
        <div className="space-y-6">
          {/* Results Header */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Screening Results</h2>
                <p className="text-slate-600 mt-1">
                  Found {results.total_candidates} matching candidate{results.total_candidates !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="text-sm text-slate-500">
                Job ID: {results.job_id}
              </div>
            </div>
          </div>

          {/* Candidates List */}
          {results.candidates.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
              <svg className="h-16 w-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No Matching Candidates</h3>
              <p className="text-slate-600">Try adjusting your requirements or adding more candidates</p>
            </div>
          ) : (
            <div className="space-y-4">
              {results.candidates.map((candidate) => (
                <div
                  key={candidate.candidate_id}
                  className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
                >
                  {/* Candidate Header */}
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">{candidate.name}</h3>
                        <div className="flex flex-wrap gap-3">
                          <div className="flex items-center text-sm text-slate-600">
                            <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            Score: {candidate.score}%
                          </div>
                          <div className="flex items-center text-sm text-slate-600">
                            <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                              />
                            </svg>
                            Fit: {(candidate.fit_score * 100).toFixed(0)}%
                          </div>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getRecommendationColor(candidate.recommendation)}`}>
                            {getRecommendationLabel(candidate.recommendation)}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleCandidate(candidate.candidate_id)}
                        className="ml-4 text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        {expandedCandidate === candidate.candidate_id ? (
                          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                        ) : (
                          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        )}
                      </button>
                    </div>

                    {/* Expanded Details */}
                    {expandedCandidate === candidate.candidate_id && (
                      <div className="mt-6 space-y-4">
                        {/* Strengths */}
                        {candidate.strengths.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold text-slate-900 mb-2 flex items-center">
                              <svg className="h-4 w-4 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Strengths
                            </h4>
                            <ul className="space-y-1">
                              {candidate.strengths.map((strength, index) => (
                                <li key={index} className="text-sm text-slate-700 pl-6">• {strength}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Concerns */}
                        {candidate.concerns.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold text-slate-900 mb-2 flex items-center">
                              <svg className="h-4 w-4 text-orange-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                              </svg>
                              Concerns
                            </h4>
                            <ul className="space-y-1">
                              {candidate.concerns.map((concern, index) => (
                                <li key={index} className="text-sm text-slate-700 pl-6">• {concern}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Next Steps */}
                        {candidate.next_steps && (
                          <div>
                            <h4 className="text-sm font-semibold text-slate-900 mb-2 flex items-center">
                              <svg className="h-4 w-4 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                              </svg>
                              Next Steps
                            </h4>
                            <p className="text-sm text-slate-700 pl-6">{candidate.next_steps}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Screening Modal */}
      {showModal && (
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
                      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                    />
                  </svg>
                </div>
              </div>

              {/* Title */}
              <h3 className="text-2xl font-bold text-slate-900 mb-3">
                AI Agents Screening Candidates
              </h3>

              {/* Description */}
              <p className="text-slate-600 mb-6">
                Analyzing candidates against job requirements and calculating fit scores...
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
                  <span>Matching required skills</span>
                </div>
                <div className="flex items-center text-sm text-slate-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3 animate-pulse" style={{ animationDelay: '200ms' }}></div>
                  <span>Evaluating candidate experience</span>
                </div>
                <div className="flex items-center text-sm text-slate-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3 animate-pulse" style={{ animationDelay: '400ms' }}></div>
                  <span>Calculating fit scores</span>
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
      )}
    </div>
  );
}
