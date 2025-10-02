-- Add missing columns to jobs table if they don't exist
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS department TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS min_experience_years INTEGER;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS max_experience_years INTEGER;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_jobs_department ON jobs(department);
CREATE INDEX IF NOT EXISTS idx_jobs_experience ON jobs(min_experience_years, max_experience_years);

-- Update the create_job function to include department
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN
        SELECT oid::regprocedure
        FROM pg_proc
        WHERE proname = 'create_job'
    LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS ' || r.oid::regprocedure || ' CASCADE';
    END LOOP;
END $$;

CREATE OR REPLACE FUNCTION create_job(
    p_company_id UUID,
    p_title TEXT,
    p_department TEXT DEFAULT NULL,
    p_description TEXT DEFAULT NULL,
    p_requirements TEXT[] DEFAULT NULL,
    p_responsibilities TEXT[] DEFAULT NULL,
    p_skills TEXT[] DEFAULT NULL,
    p_location TEXT DEFAULT NULL,
    p_job_type TEXT DEFAULT 'full-time',
    p_experience_level TEXT DEFAULT NULL,
    p_min_experience_years INTEGER DEFAULT NULL,
    p_max_experience_years INTEGER DEFAULT NULL,
    p_salary_min DECIMAL DEFAULT NULL,
    p_salary_max DECIMAL DEFAULT NULL,
    p_remote_allowed BOOLEAN DEFAULT false,
    p_created_by UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    new_job_id UUID;
BEGIN
    -- Verify company exists and is active
    IF NOT EXISTS (SELECT 1 FROM companies WHERE id = p_company_id AND is_active = true) THEN
        RAISE EXCEPTION 'Company not found or inactive';
    END IF;

    INSERT INTO jobs (
        company_id,
        title,
        department,
        description,
        requirements,
        responsibilities,
        skills,
        location,
        job_type,
        experience_level,
        min_experience_years,
        max_experience_years,
        salary_min,
        salary_max,
        remote_allowed,
        created_by
    )
    VALUES (
        p_company_id,
        p_title,
        p_department,
        p_description,
        p_requirements,
        p_responsibilities,
        p_skills,
        p_location,
        p_job_type,
        p_experience_level,
        p_min_experience_years,
        p_max_experience_years,
        p_salary_min,
        p_salary_max,
        p_remote_allowed,
        p_created_by
    )
    RETURNING id INTO new_job_id;

    RETURN new_job_id;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to create job: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION create_job TO authenticated;
