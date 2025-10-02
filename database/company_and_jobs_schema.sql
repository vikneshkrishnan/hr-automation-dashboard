-- ============================================
-- Company and Jobs Schema Migration
-- ============================================
-- This script creates companies and jobs tables with proper relationships
-- Execute this in your Supabase SQL Editor AFTER running auth_full_migration.sql

-- Step 1: Create companies table
CREATE TABLE IF NOT EXISTS companies (
    -- Primary key
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    -- Company information
    company_name TEXT NOT NULL,
    industry TEXT,
    company_size TEXT,
    website TEXT,
    description TEXT,
    logo_url TEXT,

    -- Contact information
    contact_email TEXT,
    contact_phone TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    country TEXT,
    postal_code TEXT,

    -- Account status
    is_active BOOLEAN DEFAULT true NOT NULL,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Step 2: Create jobs table
CREATE TABLE IF NOT EXISTS jobs (
    -- Primary key
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    -- Foreign key to companies
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

    -- Job information
    title TEXT NOT NULL,
    department TEXT,
    description TEXT,
    requirements TEXT[],
    responsibilities TEXT[],
    skills TEXT[],

    -- Job details
    location TEXT,
    job_type TEXT DEFAULT 'full-time',  -- full-time, part-time, contract, internship
    experience_level TEXT,  -- entry, mid, senior, lead
    min_experience_years INTEGER,
    max_experience_years INTEGER,
    salary_min DECIMAL(10, 2),
    salary_max DECIMAL(10, 2),
    salary_currency TEXT DEFAULT 'USD',

    -- Employment details
    remote_allowed BOOLEAN DEFAULT false,
    benefits TEXT[],

    -- Application details
    application_deadline TIMESTAMPTZ,
    positions_available INTEGER DEFAULT 1,

    -- Status
    is_active BOOLEAN DEFAULT true NOT NULL,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    -- Metadata
    created_by UUID,  -- HR user who created the job
    updated_by UUID   -- HR user who last updated the job
);

-- Step 3: Update hr_users table to add company_id
ALTER TABLE hr_users
    ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE SET NULL;

-- Step 4: Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_companies_company_name ON companies(company_name);
CREATE INDEX IF NOT EXISTS idx_companies_is_active ON companies(is_active);
CREATE INDEX IF NOT EXISTS idx_companies_created_at ON companies(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_jobs_company_id ON jobs(company_id);
CREATE INDEX IF NOT EXISTS idx_jobs_is_active ON jobs(is_active);
CREATE INDEX IF NOT EXISTS idx_jobs_job_type ON jobs(job_type);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_hr_users_company_id ON hr_users(company_id);

-- Step 5: Create updated_at triggers for new tables
DROP TRIGGER IF EXISTS update_companies_updated_at ON companies;
CREATE TRIGGER update_companies_updated_at
    BEFORE UPDATE ON companies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_jobs_updated_at ON jobs;
CREATE TRIGGER update_jobs_updated_at
    BEFORE UPDATE ON jobs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Step 6: Enable Row Level Security (RLS)
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- Step 7: Create RLS policies for companies
DO $$
BEGIN
    -- Anyone can view active companies
    IF EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'companies'
        AND policyname = 'Anyone can view active companies'
    ) THEN
        DROP POLICY "Anyone can view active companies" ON companies;
    END IF;

    CREATE POLICY "Anyone can view active companies"
        ON companies FOR SELECT
        TO anon, authenticated
        USING (is_active = true);

    -- Authenticated users can insert companies
    IF EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'companies'
        AND policyname = 'Authenticated users can create companies'
    ) THEN
        DROP POLICY "Authenticated users can create companies" ON companies;
    END IF;

    CREATE POLICY "Authenticated users can create companies"
        ON companies FOR INSERT
        TO authenticated
        WITH CHECK (true);

    -- HR users can update their own company
    IF EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'companies'
        AND policyname = 'HR users can update their company'
    ) THEN
        DROP POLICY "HR users can update their company" ON companies;
    END IF;

    CREATE POLICY "HR users can update their company"
        ON companies FOR UPDATE
        TO authenticated
        USING (
            id IN (
                SELECT company_id FROM hr_users
                WHERE id = auth.uid()::uuid
            )
        );

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Company policy creation warning: %. Continuing...', SQLERRM;
END $$;

-- Step 8: Create RLS policies for jobs
DO $$
BEGIN
    -- Anyone can view active jobs for active companies
    IF EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'jobs'
        AND policyname = 'Anyone can view active jobs'
    ) THEN
        DROP POLICY "Anyone can view active jobs" ON jobs;
    END IF;

    CREATE POLICY "Anyone can view active jobs"
        ON jobs FOR SELECT
        TO anon, authenticated
        USING (
            is_active = true
            AND company_id IN (SELECT id FROM companies WHERE is_active = true)
        );

    -- HR users can create jobs for their company
    IF EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'jobs'
        AND policyname = 'HR users can create jobs for their company'
    ) THEN
        DROP POLICY "HR users can create jobs for their company" ON jobs;
    END IF;

    CREATE POLICY "HR users can create jobs for their company"
        ON jobs FOR INSERT
        TO authenticated
        WITH CHECK (
            company_id IN (
                SELECT company_id FROM hr_users
                WHERE id = auth.uid()::uuid
            )
        );

    -- HR users can update jobs for their company
    IF EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'jobs'
        AND policyname = 'HR users can update their company jobs'
    ) THEN
        DROP POLICY "HR users can update their company jobs" ON jobs;
    END IF;

    CREATE POLICY "HR users can update their company jobs"
        ON jobs FOR UPDATE
        TO authenticated
        USING (
            company_id IN (
                SELECT company_id FROM hr_users
                WHERE id = auth.uid()::uuid
            )
        );

    -- HR users can delete jobs for their company
    IF EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'jobs'
        AND policyname = 'HR users can delete their company jobs'
    ) THEN
        DROP POLICY "HR users can delete their company jobs" ON jobs;
    END IF;

    CREATE POLICY "HR users can delete their company jobs"
        ON jobs FOR DELETE
        TO authenticated
        USING (
            company_id IN (
                SELECT company_id FROM hr_users
                WHERE id = auth.uid()::uuid
            )
        );

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Job policy creation warning: %. Continuing...', SQLERRM;
END $$;

-- Step 9: Create function to register a new company
CREATE OR REPLACE FUNCTION create_company(
    p_company_name TEXT,
    p_industry TEXT DEFAULT NULL,
    p_company_size TEXT DEFAULT NULL,
    p_website TEXT DEFAULT NULL,
    p_description TEXT DEFAULT NULL,
    p_contact_email TEXT DEFAULT NULL,
    p_contact_phone TEXT DEFAULT NULL,
    p_address TEXT DEFAULT NULL,
    p_city TEXT DEFAULT NULL,
    p_state TEXT DEFAULT NULL,
    p_country TEXT DEFAULT NULL,
    p_postal_code TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    new_company_id UUID;
BEGIN
    INSERT INTO companies (
        company_name,
        industry,
        company_size,
        website,
        description,
        contact_email,
        contact_phone,
        address,
        city,
        state,
        country,
        postal_code
    )
    VALUES (
        p_company_name,
        p_industry,
        p_company_size,
        p_website,
        p_description,
        p_contact_email,
        p_contact_phone,
        p_address,
        p_city,
        p_state,
        p_country,
        p_postal_code
    )
    RETURNING id INTO new_company_id;

    RETURN new_company_id;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to create company: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 10: Create function to register HR user with company
CREATE OR REPLACE FUNCTION register_hr_user_with_company(
    p_email TEXT,
    p_password TEXT,
    p_full_name TEXT,
    p_company_id UUID
)
RETURNS UUID AS $$
DECLARE
    new_user_id UUID;
BEGIN
    -- Verify company exists and is active
    IF NOT EXISTS (SELECT 1 FROM companies WHERE id = p_company_id AND is_active = true) THEN
        RAISE EXCEPTION 'Company not found or inactive';
    END IF;

    -- Insert new user with hashed password and company_id
    INSERT INTO hr_users (email, password_hash, full_name, company_id)
    VALUES (
        p_email,
        crypt(p_password, gen_salt('bf')),
        p_full_name,
        p_company_id
    )
    RETURNING id INTO new_user_id;

    RETURN new_user_id;
EXCEPTION
    WHEN unique_violation THEN
        RAISE EXCEPTION 'Email already exists';
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Registration failed: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 11: Create function to create a new job
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

-- Step 12: Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION create_company TO anon, authenticated;
GRANT EXECUTE ON FUNCTION register_hr_user_with_company(TEXT, TEXT, TEXT, UUID) TO anon;
GRANT EXECUTE ON FUNCTION create_job TO authenticated;

-- Step 13: Grant table permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON companies TO anon, authenticated;
GRANT SELECT ON jobs TO anon, authenticated;

-- Step 14: Update verify_user_password function to include company_id
-- Drop existing function first to allow changing return type
DROP FUNCTION IF EXISTS verify_user_password(TEXT, TEXT);

CREATE OR REPLACE FUNCTION verify_user_password(p_email TEXT, p_password TEXT)
RETURNS TABLE(user_id UUID, user_full_name TEXT, user_email TEXT, user_role TEXT, user_company_id UUID) AS $$
BEGIN
    RETURN QUERY
    SELECT
        id,
        full_name,
        email,
        role,
        company_id
    FROM hr_users
    WHERE
        email = p_email
        AND password_hash = crypt(p_password, password_hash)
        AND is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION verify_user_password(TEXT, TEXT) TO anon;

-- Step 16: Create function to update user's company_id
CREATE OR REPLACE FUNCTION update_user_company(p_user_id UUID, p_company_id UUID)
RETURNS void AS $$
BEGIN
    -- Verify company exists and is active
    IF NOT EXISTS (SELECT 1 FROM companies WHERE id = p_company_id AND is_active = true) THEN
        RAISE EXCEPTION 'Company not found or inactive';
    END IF;

    -- Update user's company_id
    UPDATE hr_users
    SET company_id = p_company_id
    WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION update_user_company(UUID, UUID) TO authenticated;

-- Step 17: Add comments for documentation
COMMENT ON TABLE companies IS 'Stores company information for multi-tenant HR system';
COMMENT ON TABLE jobs IS 'Stores job postings associated with companies';
COMMENT ON COLUMN hr_users.company_id IS 'Foreign key reference to the company this HR user belongs to';
COMMENT ON FUNCTION create_company IS 'Creates a new company and returns the company ID';
COMMENT ON FUNCTION register_hr_user_with_company IS 'Registers a new HR user linked to a company';
COMMENT ON FUNCTION create_job IS 'Creates a new job posting for a company';

-- Verification: Check if tables and functions were created successfully
SELECT
    tablename,
    schemaname
FROM pg_tables
WHERE tablename IN ('companies', 'jobs')
ORDER BY tablename;

SELECT
    proname as function_name,
    pg_get_function_arguments(oid) as parameters
FROM pg_proc
WHERE proname IN ('create_company', 'register_hr_user_with_company', 'create_job')
ORDER BY proname;
