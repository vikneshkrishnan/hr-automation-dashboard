import { supabase } from './supabase';

// ============================================
// Type Definitions
// ============================================

export interface Company {
  id?: string;
  company_name: string;
  industry?: string;
  company_size?: string;
  website?: string;
  description?: string;
  logo_url?: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Job {
  id?: string;
  company_id: string;
  title: string;
  department?: string;
  description?: string;
  requirements?: string[];
  responsibilities?: string[];
  skills?: string[];
  location?: string;
  job_type?: 'full-time' | 'part-time' | 'contract' | 'internship';
  experience_level?: 'entry' | 'mid' | 'senior' | 'lead';
  min_experience_years?: number;
  max_experience_years?: number;
  salary_min?: number;
  salary_max?: number;
  salary_currency?: string;
  remote_allowed?: boolean;
  benefits?: string[];
  application_deadline?: string;
  positions_available?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

// ============================================
// Company Functions
// ============================================

/**
 * Create a new company
 */
export async function createCompany(company: Omit<Company, 'id' | 'created_at' | 'updated_at'>): Promise<{ success: boolean; error?: string; data?: Company }> {
  try {
    if (!supabase) {
      return { success: false, error: 'Supabase not configured' };
    }

    console.log('Creating company:', company.company_name);

    const { data, error } = await supabase.rpc('create_company', {
      p_company_name: company.company_name,
      p_industry: company.industry || null,
      p_company_size: company.company_size || null,
      p_website: company.website || null,
      p_description: company.description || null,
      p_contact_email: company.contact_email || null,
      p_contact_phone: company.contact_phone || null,
      p_address: company.address || null,
      p_city: company.city || null,
      p_state: company.state || null,
      p_country: company.country || null,
      p_postal_code: company.postal_code || null,
    });

    if (error) {
      console.error('Error creating company:', error);
      return { success: false, error: error.message };
    }

    // Fetch the created company
    const { data: companyData, error: fetchError } = await supabase
      .from('companies')
      .select('*')
      .eq('id', data)
      .single();

    if (fetchError) {
      console.error('Error fetching created company:', fetchError);
      return { success: false, error: fetchError.message };
    }

    console.log('Company created successfully:', data);
    return { success: true, data: companyData };
  } catch (error) {
    console.error('Unexpected error creating company:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Get all companies
 */
export async function getCompanies(): Promise<{ success: boolean; error?: string; data?: Company[] }> {
  try {
    if (!supabase) {
      return { success: true, data: [] };
    }

    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching companies:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Unexpected error fetching companies:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Get company by ID
 */
export async function getCompanyById(companyId: string): Promise<{ success: boolean; error?: string; data?: Company }> {
  try {
    if (!supabase) {
      return { success: false, error: 'Supabase not configured' };
    }

    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .single();

    if (error) {
      console.error('Error fetching company:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Unexpected error fetching company:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Update company
 */
export async function updateCompany(companyId: string, updates: Partial<Company>): Promise<{ success: boolean; error?: string; data?: Company }> {
  try {
    if (!supabase) {
      return { success: false, error: 'Supabase not configured' };
    }

    const { data, error } = await supabase
      .from('companies')
      .update(updates)
      .eq('id', companyId)
      .select()
      .single();

    if (error) {
      console.error('Error updating company:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Unexpected error updating company:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Delete company (soft delete by setting is_active to false)
 */
export async function deleteCompany(companyId: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (!supabase) {
      return { success: false, error: 'Supabase not configured' };
    }

    const { error } = await supabase
      .from('companies')
      .update({ is_active: false })
      .eq('id', companyId);

    if (error) {
      console.error('Error deleting company:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Unexpected error deleting company:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

// ============================================
// Job Functions
// ============================================

/**
 * Create a new job
 */
export async function createJob(job: Omit<Job, 'id' | 'created_at' | 'updated_at'>): Promise<{ success: boolean; error?: string; data?: string }> {
  try {
    if (!supabase) {
      return { success: false, error: 'Supabase not configured' };
    }

    console.log('Creating job:', job.title);

    const { data, error } = await supabase.rpc('create_job', {
      p_company_id: job.company_id,
      p_title: job.title,
      p_department: job.department || null,
      p_description: job.description || null,
      p_requirements: job.requirements || null,
      p_responsibilities: job.responsibilities || null,
      p_skills: job.skills || null,
      p_location: job.location || null,
      p_job_type: job.job_type || 'full-time',
      p_experience_level: job.experience_level || null,
      p_min_experience_years: job.min_experience_years || null,
      p_max_experience_years: job.max_experience_years || null,
      p_salary_min: job.salary_min || null,
      p_salary_max: job.salary_max || null,
      p_remote_allowed: job.remote_allowed || false,
      p_created_by: job.created_by || null,
    });

    if (error) {
      console.error('Error creating job:', error);
      return { success: false, error: error.message };
    }

    console.log('Job created successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Unexpected error creating job:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Get all jobs
 */
export async function getJobs(companyId?: string): Promise<{ success: boolean; error?: string; data?: Job[] }> {
  try {
    if (!supabase) {
      return { success: true, data: [] };
    }

    let query = supabase
      .from('jobs')
      .select('*')
      .order('created_at', { ascending: false });

    if (companyId) {
      query = query.eq('company_id', companyId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching jobs:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Unexpected error fetching jobs:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Get job by ID
 */
export async function getJobById(jobId: string): Promise<{ success: boolean; error?: string; data?: Job }> {
  try {
    if (!supabase) {
      return { success: false, error: 'Supabase not configured' };
    }

    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (error) {
      console.error('Error fetching job:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Unexpected error fetching job:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Update job
 */
export async function updateJob(jobId: string, updates: Partial<Job>): Promise<{ success: boolean; error?: string; data?: Job }> {
  try {
    if (!supabase) {
      return { success: false, error: 'Supabase not configured' };
    }

    const { data, error } = await supabase
      .from('jobs')
      .update(updates)
      .eq('id', jobId)
      .select()
      .single();

    if (error) {
      console.error('Error updating job:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Unexpected error updating job:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Delete job (soft delete by setting is_active to false)
 */
export async function deleteJob(jobId: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (!supabase) {
      return { success: false, error: 'Supabase not configured' };
    }

    const { error } = await supabase
      .from('jobs')
      .update({ is_active: false })
      .eq('id', jobId);

    if (error) {
      console.error('Error deleting job:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Unexpected error deleting job:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Search jobs by skills
 */
export async function searchJobsBySkills(skills: string[]): Promise<{ success: boolean; error?: string; data?: Job[] }> {
  try {
    if (!supabase) {
      return { success: true, data: [] };
    }

    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .overlaps('skills', skills)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error searching jobs:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Unexpected error searching jobs:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}
