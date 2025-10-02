import { NextRequest, NextResponse } from 'next/server';
import { createJob, getJobs } from '@/lib/company-database';
import { sanitizeInput } from '@/lib/auth';

/**
 * GET /api/jobs
 * Fetch all jobs (optionally filtered by company_id)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const companyId = searchParams.get('company_id');

    const result = await getJobs(companyId || undefined);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { jobs: result.data },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in GET /api/jobs:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/jobs
 * Create a new job
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      company_id,
      title,
      description,
      requirements,
      responsibilities,
      skills,
      location,
      job_type,
      experience_level,
      salary_min,
      salary_max,
      salary_currency,
      remote_allowed,
      benefits,
      application_deadline,
      positions_available,
      created_by,
    } = body;

    // Validation
    if (!company_id) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      );
    }

    if (!title) {
      return NextResponse.json(
        { error: 'Job title is required' },
        { status: 400 }
      );
    }

    // Sanitize string inputs
    const sanitizedData = {
      company_id,
      title: sanitizeInput(title),
      description: description ? sanitizeInput(description) : undefined,
      requirements: requirements || undefined,
      responsibilities: responsibilities || undefined,
      skills: skills || undefined,
      location: location ? sanitizeInput(location) : undefined,
      job_type: job_type || 'full-time',
      experience_level: experience_level ? sanitizeInput(experience_level) : undefined,
      salary_min: salary_min || undefined,
      salary_max: salary_max || undefined,
      salary_currency: salary_currency || 'USD',
      remote_allowed: remote_allowed || false,
      benefits: benefits || undefined,
      application_deadline: application_deadline || undefined,
      positions_available: positions_available || 1,
      created_by: created_by || undefined,
    };

    // Create job
    const result = await createJob(sanitizedData);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Job created successfully',
        jobId: result.data,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in POST /api/jobs:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
