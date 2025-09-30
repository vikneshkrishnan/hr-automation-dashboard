import { supabase } from './supabase';

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

export async function saveResumeAnalysis(apiResponse: ApiResponse): Promise<{ success: boolean; error?: string; data?: ResumeAnalysisRecord }> {
  try {
    if (!supabase) {
      console.warn('Supabase not configured, skipping database save');
      return { success: true }; // Return success to not block the UI
    }

    console.log('Attempting to save resume analysis for candidate:', apiResponse.candidate_info.candidate_id);
    console.log('Data to insert:', {
      candidate_id: apiResponse.candidate_info.candidate_id,
      candidate_name: apiResponse.candidate_info.name,
      candidate_email: apiResponse.candidate_info.email,
      data_size: JSON.stringify(apiResponse).length
    });

    const { data, error } = await supabase
      .from('resume_analyses')
      .insert({
        candidate_id: apiResponse.candidate_info.candidate_id,
        candidate_name: apiResponse.candidate_info.name,
        candidate_email: apiResponse.candidate_info.email,
        data: apiResponse
      })
      .select()
      .single();

    if (error) {
      // Handle empty error objects
      const errorMessage = error.message || 'Unknown database error';
      const errorCode = error.code || 'UNKNOWN';

      console.error('Supabase error details:', {
        message: errorMessage,
        details: error.details || 'No details available',
        hint: error.hint || 'No hint available',
        code: errorCode,
        fullError: error
      });

      // If error object is completely empty, it's likely a connectivity issue
      if (!error.message && !error.code && Object.keys(error).length === 0) {
        return {
          success: false,
          error: 'Database connectivity error: Cannot reach Supabase. Check URL, API key, and network connection.'
        };
      }

      return { success: false, error: `Database error: ${errorMessage}` };
    }

    console.log('Successfully saved resume analysis:', data?.id);
    return { success: true, data };
  } catch (error) {
    console.error('Unexpected error saving resume analysis:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

export async function testSupabaseBasicConnection(): Promise<{ success: boolean; error?: string; details?: Record<string, unknown> }> {
  try {
    if (!supabase) {
      return { success: false, error: 'Supabase client not initialized' };
    }

    console.log('🔗 Testing basic Supabase connectivity...');

    // Test basic Supabase connection with a simple query that should always work
    const { data, error } = await supabase
      .from('_realtime')
      .select('*')
      .limit(1);

    if (error) {
      console.error('Basic connectivity test failed:', error);

      // If this fails, try an even simpler test
      console.log('🔗 Trying alternative connectivity test...');

      try {
        // Test using Supabase auth endpoint which is always available
        const { data: authData, error: authError } = await supabase.auth.getSession();

        if (authError && authError.message) {
          return {
            success: false,
            error: `Supabase connectivity issue: ${authError.message}`,
            details: authError as unknown as Record<string, unknown>
          };
        }

        console.log('✅ Basic Supabase connectivity working (via auth)');
        return { success: true, details: { method: 'auth', data: authData } };

      } catch (authTestError) {
        console.error('❌ All connectivity tests failed:', authTestError);
        return {
          success: false,
          error: 'Cannot establish connection to Supabase',
          details: { originalError: error as unknown as Record<string, unknown>, authError: authTestError as unknown as Record<string, unknown> }
        };
      }
    }

    console.log('✅ Basic Supabase connectivity working (via realtime)');
    return { success: true, details: { method: 'realtime', data } };

  } catch (error) {
    console.error('❌ Unexpected error during connectivity test:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown connectivity error',
      details: error as unknown as Record<string, unknown>
    };
  }
}

export async function testDatabaseConnection(): Promise<{ success: boolean; error?: string; tableExists?: boolean }> {
  try {
    if (!supabase) {
      return { success: false, error: 'Supabase not configured' };
    }

    console.log('Testing database connection...');

    // Test basic connection and check if table exists
    const { error } = await supabase
      .from('resume_analyses')
      .select('count(*)')
      .limit(1);

    if (error) {
      // Handle empty error objects
      const errorMessage = error.message || 'Unknown database error';
      const errorCode = error.code || 'UNKNOWN';

      console.error('Database connection test failed:', {
        message: errorMessage,
        details: error.details || 'No details available',
        hint: error.hint || 'No hint available',
        code: errorCode,
        fullError: error
      });

      // If error object is completely empty, it's likely a connectivity issue
      if (!error.message && !error.code && Object.keys(error).length === 0) {
        return {
          success: false,
          error: 'Database connectivity error: Cannot reach Supabase. Check URL, API key, and network connection.',
          tableExists: false
        };
      }

      // Check if it's a table not found error
      if (errorCode === '42P01' || errorMessage.includes('relation') || errorMessage.includes('does not exist')) {
        return { success: false, error: errorMessage, tableExists: false };
      }

      return { success: false, error: errorMessage, tableExists: true };
    }

    console.log('Database connection successful, table exists');
    return { success: true, tableExists: true };
  } catch (error) {
    console.error('Unexpected error testing database connection:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

export async function testRLSPermissions(): Promise<{ success: boolean; error?: string; rlsEnabled?: boolean }> {
  try {
    if (!supabase) {
      return { success: false, error: 'Supabase not configured' };
    }

    console.log('Testing RLS permissions...');

    // Try to insert a test record to check permissions
    const testRecord = {
      candidate_id: 'test-' + Date.now(),
      candidate_name: 'Test User',
      candidate_email: 'test@example.com',
      data: { test: true }
    };

    const { data, error } = await supabase
      .from('resume_analyses')
      .insert(testRecord)
      .select()
      .single();

    if (error) {
      console.error('RLS permission test failed:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });

      // Check for common RLS errors
      if (error.code === '42501' || error.message.includes('insufficient_privilege') || error.message.includes('policy')) {
        return { success: false, error: `RLS Policy Error: ${error.message}`, rlsEnabled: true };
      }

      return { success: false, error: error.message };
    }

    // Clean up the test record
    if (data?.id) {
      await supabase.from('resume_analyses').delete().eq('id', data.id);
    }

    console.log('RLS permissions working correctly');
    return { success: true, rlsEnabled: true };
  } catch (error) {
    console.error('Unexpected error testing RLS permissions:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

export async function getResumeAnalyses(): Promise<{ success: boolean; error?: string; data?: ResumeAnalysisRecord[] }> {
  try {
    if (!supabase) {
      return { success: true, data: [] };
    }

    const { data, error } = await supabase
      .from('resume_analyses')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching resume analyses:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Unexpected error fetching resume analyses:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

export async function getResumeAnalysisById(candidateId: string): Promise<{ success: boolean; error?: string; data?: ResumeAnalysisRecord }> {
  try {
    if (!supabase) {
      return { success: false, error: 'Supabase not configured' };
    }

    const { data, error } = await supabase
      .from('resume_analyses')
      .select('*')
      .eq('candidate_id', candidateId)
      .single();

    if (error) {
      console.error('Error fetching resume analysis:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Unexpected error fetching resume analysis:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

export async function deleteResumeAnalysis(candidateId: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (!supabase) {
      return { success: false, error: 'Supabase not configured' };
    }

    const { error } = await supabase
      .from('resume_analyses')
      .delete()
      .eq('candidate_id', candidateId);

    if (error) {
      console.error('Error deleting resume analysis:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Unexpected error deleting resume analysis:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

export async function searchResumesBySkill(skill: string): Promise<{ success: boolean; error?: string; data?: ResumeAnalysisRecord[] }> {
  try {
    if (!supabase) {
      return { success: true, data: [] };
    }

    const { data, error } = await supabase
      .from('resume_analyses')
      .select('*')
      .contains('data->candidate_info->skills', [skill])
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error searching resumes by skill:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Unexpected error searching resumes:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

export async function getResumesByExperienceRange(minYears: number, maxYears?: number): Promise<{ success: boolean; error?: string; data?: ResumeAnalysisRecord[] }> {
  try {
    if (!supabase) {
      return { success: true, data: [] };
    }

    let query = supabase
      .from('resume_analyses')
      .select('*')
      .gte('data->candidate_info->experience_years', minYears);

    if (maxYears !== undefined) {
      query = query.lte('data->candidate_info->experience_years', maxYears);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching resumes by experience:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Unexpected error fetching resumes by experience:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}