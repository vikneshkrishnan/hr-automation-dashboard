"use client";

import React, { useState, useEffect } from "react";

interface Job {
  id: string;
  title: string;
  department?: string;
  description?: string;
  requirements?: string[];
  responsibilities?: string[];
  skills?: string[];
  location?: string;
  min_experience_years?: number;
  max_experience_years?: number;
  salary_min?: number;
  salary_max?: number;
  remote_allowed?: boolean;
}

interface CreateJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  job?: Job | null; // Optional job prop for edit mode
}

export default function CreateJobModal({ isOpen, onClose, onSuccess, job }: CreateJobModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    department: "",
    description: "",
    responsibilities: [""],
    required_skills: [""],
    preferred_skills: [""],
    min_experience_years: "",
    max_experience_years: "",
    location: "",
    remote_allowed: false,
    salary_min: "",
    salary_max: "",
  });

  // Pre-fill form when editing
  useEffect(() => {
    if (job && isOpen) {
      setFormData({
        title: job.title || "",
        department: job.department || "",
        description: job.description || "",
        responsibilities: job.responsibilities && job.responsibilities.length > 0 ? job.responsibilities : [""],
        required_skills: job.requirements && job.requirements.length > 0 ? job.requirements : [""],
        preferred_skills: job.skills && job.skills.length > 0 ? job.skills.filter(s => !job.requirements?.includes(s)) : [""],
        min_experience_years: job.min_experience_years?.toString() || "",
        max_experience_years: job.max_experience_years?.toString() || "",
        location: job.location || "",
        remote_allowed: job.remote_allowed || false,
        salary_min: job.salary_min?.toString() || "",
        salary_max: job.salary_max?.toString() || "",
      });
    } else if (!job && isOpen) {
      // Reset form when creating new job
      setFormData({
        title: "",
        department: "",
        description: "",
        responsibilities: [""],
        required_skills: [""],
        preferred_skills: [""],
        min_experience_years: "",
        max_experience_years: "",
        location: "",
        remote_allowed: false,
        salary_min: "",
        salary_max: "",
      });
    }
  }, [job, isOpen]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });

    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleArrayInput = (field: "responsibilities" | "required_skills" | "preferred_skills", index: number, value: string) => {
    const newArray = [...formData[field]];
    newArray[index] = value;
    setFormData({ ...formData, [field]: newArray });
  };

  const addArrayItem = (field: "responsibilities" | "required_skills" | "preferred_skills") => {
    setFormData({ ...formData, [field]: [...formData[field], ""] });
  };

  const removeArrayItem = (field: "responsibilities" | "required_skills" | "preferred_skills", index: number) => {
    const newArray = formData[field].filter((_, i) => i !== index);
    setFormData({ ...formData, [field]: newArray.length ? newArray : [""] });
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Job title is required";
    }

    if (!formData.department.trim()) {
      newErrors.department = "Department is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Job description is required";
    }

    const validResponsibilities = formData.responsibilities.filter(r => r.trim());
    if (validResponsibilities.length === 0) {
      newErrors.responsibilities = "At least one responsibility is required";
    }

    const validRequiredSkills = formData.required_skills.filter(s => s.trim());
    if (validRequiredSkills.length === 0) {
      newErrors.required_skills = "At least one required skill is required";
    }

    if (formData.min_experience_years && formData.max_experience_years) {
      const min = parseInt(formData.min_experience_years);
      const max = parseInt(formData.max_experience_years);
      if (min > max) {
        newErrors.max_experience_years = "Max experience must be greater than min experience";
      }
    }

    if (!formData.location.trim()) {
      newErrors.location = "Location is required";
    }

    if (formData.salary_min && formData.salary_max) {
      const min = parseFloat(formData.salary_min);
      const max = parseFloat(formData.salary_max);
      if (min > max) {
        newErrors.salary_max = "Max salary must be greater than min salary";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Get user from session to get company_id
      const sessionResponse = await fetch('/api/auth/session');
      const sessionData = await sessionResponse.json();

      if (!sessionData.authenticated || !sessionData.user.companyId) {
        throw new Error('User not authenticated or company not set');
      }

      const jobData = {
        company_id: sessionData.user.companyId,
        title: formData.title,
        department: formData.department,
        description: formData.description,
        responsibilities: formData.responsibilities.filter(r => r.trim()),
        requirements: formData.required_skills.filter(s => s.trim()),
        skills: [
          ...formData.required_skills.filter(s => s.trim()),
          ...formData.preferred_skills.filter(s => s.trim())
        ],
        location: formData.location,
        remote_allowed: formData.remote_allowed,
        min_experience_years: formData.min_experience_years ? parseInt(formData.min_experience_years) : undefined,
        max_experience_years: formData.max_experience_years ? parseInt(formData.max_experience_years) : undefined,
        salary_min: formData.salary_min ? parseFloat(formData.salary_min) : undefined,
        salary_max: formData.salary_max ? parseFloat(formData.salary_max) : undefined,
        created_by: sessionData.user.id,
      };

      // Use PUT for edit mode, POST for create mode
      const url = job ? `/api/jobs/${job.id}` : '/api/jobs';
      const method = job ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create job');
      }

      // Show success toast (will be handled by parent component)
      onSuccess();

      // Reset form
      setFormData({
        title: "",
        department: "",
        description: "",
        responsibilities: [""],
        required_skills: [""],
        preferred_skills: [""],
        min_experience_years: "",
        max_experience_years: "",
        location: "",
        remote_allowed: false,
        salary_min: "",
        salary_max: "",
      });

      onClose();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setErrors({ general: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-2xl font-bold text-gray-900">{job ? 'Edit Job' : 'Create New Job'}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isLoading}
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Loading Overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-sm rounded-2xl z-10 flex items-center justify-center">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600"></div>
                <p className="mt-4 text-purple-600 font-semibold">{job ? 'Updating job...' : 'Creating job...'}</p>
              </div>
            </div>
          )}

          {errors.general && (
            <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4">
              <p className="text-sm font-medium text-red-800">{errors.general}</p>
            </div>
          )}

          <div className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Job Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border ${errors.title ? 'border-red-300' : 'border-gray-300'} rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-black placeholder:text-black`}
                    placeholder="e.g., Senior Software Engineer"
                  />
                  {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Department <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border ${errors.department ? 'border-red-300' : 'border-gray-300'} rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-black placeholder:text-black`}
                    placeholder="e.g., Engineering"
                  />
                  {errors.department && <p className="mt-1 text-sm text-red-600">{errors.department}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Job Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className={`w-full px-4 py-3 border ${errors.description ? 'border-red-300' : 'border-gray-300'} rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-black placeholder:text-black`}
                    placeholder="Describe the role and what the candidate will be doing..."
                  />
                  {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                </div>
              </div>
            </div>

            {/* Responsibilities */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Responsibilities <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                {formData.responsibilities.map((resp, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={resp}
                      onChange={(e) => handleArrayInput("responsibilities", index, e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-black placeholder:text-black"
                      placeholder={`Responsibility ${index + 1}`}
                    />
                    {formData.responsibilities.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem("responsibilities", index)}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => addArrayItem("responsibilities")}
                className="mt-2 text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                + Add Responsibility
              </button>
              {errors.responsibilities && <p className="mt-1 text-sm text-red-600">{errors.responsibilities}</p>}
            </div>

            {/* Required Skills */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Required Skills <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                {formData.required_skills.map((skill, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={skill}
                      onChange={(e) => handleArrayInput("required_skills", index, e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-black placeholder:text-black"
                      placeholder={`Required skill ${index + 1}`}
                    />
                    {formData.required_skills.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem("required_skills", index)}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => addArrayItem("required_skills")}
                className="mt-2 text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                + Add Required Skill
              </button>
              {errors.required_skills && <p className="mt-1 text-sm text-red-600">{errors.required_skills}</p>}
            </div>

            {/* Preferred Skills */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Preferred Skills
              </label>
              <div className="space-y-2">
                {formData.preferred_skills.map((skill, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={skill}
                      onChange={(e) => handleArrayInput("preferred_skills", index, e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-black placeholder:text-black"
                      placeholder={`Preferred skill ${index + 1}`}
                    />
                    {formData.preferred_skills.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem("preferred_skills", index)}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => addArrayItem("preferred_skills")}
                className="mt-2 text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                + Add Preferred Skill
              </button>
            </div>

            {/* Experience & Location */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Experience & Location</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Min Experience (years)
                  </label>
                  <input
                    type="number"
                    name="min_experience_years"
                    value={formData.min_experience_years}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-black placeholder:text-black"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Max Experience (years)
                  </label>
                  <input
                    type="number"
                    name="max_experience_years"
                    value={formData.max_experience_years}
                    onChange={handleInputChange}
                    min="0"
                    className={`w-full px-4 py-3 border ${errors.max_experience_years ? 'border-red-300' : 'border-gray-300'} rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-black placeholder:text-black`}
                    placeholder="0"
                  />
                  {errors.max_experience_years && <p className="mt-1 text-sm text-red-600">{errors.max_experience_years}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Location <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border ${errors.location ? 'border-red-300' : 'border-gray-300'} rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-black placeholder:text-black`}
                    placeholder="e.g., New York, NY"
                  />
                  {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location}</p>}
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="remote_allowed"
                    checked={formData.remote_allowed}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-700">
                    Remote work allowed
                  </label>
                </div>
              </div>
            </div>

            {/* Compensation */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Compensation</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Min Salary
                  </label>
                  <input
                    type="number"
                    name="salary_min"
                    value={formData.salary_min}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-black placeholder:text-black"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Max Salary
                  </label>
                  <input
                    type="number"
                    name="salary_max"
                    value={formData.salary_max}
                    onChange={handleInputChange}
                    min="0"
                    className={`w-full px-4 py-3 border ${errors.salary_max ? 'border-red-300' : 'border-gray-300'} rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-black placeholder:text-black`}
                    placeholder="0"
                  />
                  {errors.salary_max && <p className="mt-1 text-sm text-red-600">{errors.salary_max}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-4 focus:ring-purple-300 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50"
            >
              {job ? 'Update Job' : 'Create Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
