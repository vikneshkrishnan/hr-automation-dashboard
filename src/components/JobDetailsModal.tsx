"use client";

import React from "react";

interface Job {
  id: string;
  title: string;
  department?: string;
  description?: string;
  requirements?: string[];
  responsibilities?: string[];
  skills?: string[];
  location?: string;
  job_type?: string;
  experience_level?: string;
  min_experience_years?: number;
  max_experience_years?: number;
  salary_min?: number;
  salary_max?: number;
  remote_allowed?: boolean;
  is_active?: boolean;
  created_at?: string;
}

interface JobDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: Job | null;
}

export default function JobDetailsModal({ isOpen, onClose, job }: JobDetailsModalProps) {
  if (!isOpen || !job) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{job.title}</h2>
            {job.department && (
              <p className="text-sm text-gray-600 mt-1">{job.department}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status Badge */}
          {job.is_active !== undefined && (
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                job.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {job.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          )}

          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Job Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {job.location && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Location</p>
                  <p className="text-gray-900 mt-1">
                    {job.location}
                    {job.remote_allowed && <span className="text-purple-600 ml-2">(Remote Available)</span>}
                  </p>
                </div>
              )}

              {job.job_type && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Job Type</p>
                  <p className="text-gray-900 mt-1 capitalize">{job.job_type.replace('-', ' ')}</p>
                </div>
              )}

              {job.experience_level && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Experience Level</p>
                  <p className="text-gray-900 mt-1 capitalize">{job.experience_level}</p>
                </div>
              )}

              {(job.min_experience_years !== undefined || job.max_experience_years !== undefined) && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Years of Experience</p>
                  <p className="text-gray-900 mt-1">
                    {job.min_experience_years !== undefined && job.max_experience_years !== undefined
                      ? `${job.min_experience_years}-${job.max_experience_years} years`
                      : job.min_experience_years !== undefined
                      ? `${job.min_experience_years}+ years`
                      : `Up to ${job.max_experience_years} years`}
                  </p>
                </div>
              )}

              {(job.salary_min || job.salary_max) && (
                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-gray-500">Salary Range</p>
                  <p className="text-gray-900 mt-1">
                    {job.salary_min && job.salary_max
                      ? `$${job.salary_min.toLocaleString()} - $${job.salary_max.toLocaleString()}`
                      : job.salary_min
                      ? `From $${job.salary_min.toLocaleString()}`
                      : `Up to $${job.salary_max?.toLocaleString()}`}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {job.description && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{job.description}</p>
            </div>
          )}

          {/* Responsibilities */}
          {job.responsibilities && job.responsibilities.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Responsibilities</h3>
              <ul className="space-y-2">
                {job.responsibilities.map((resp, index) => (
                  <li key={index} className="flex items-start">
                    <svg className="h-5 w-5 text-purple-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">{resp}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Requirements */}
          {job.requirements && job.requirements.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Requirements</h3>
              <ul className="space-y-2">
                {job.requirements.map((req, index) => (
                  <li key={index} className="flex items-start">
                    <svg className="h-5 w-5 text-purple-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Skills */}
          {job.skills && job.skills.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Required Skills</h3>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Created Date */}
          {job.created_at && (
            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Posted on {new Date(job.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
