-- Supabase SQL Schema for Resume Analysis Storage (With Anonymous Access)
-- This script creates a table to store resume analysis responses as JSON blobs
-- Updated to allow anonymous users to insert and read data

-- Create the resume_analyses table
CREATE TABLE IF NOT EXISTS resume_analyses (
    -- Primary key
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    -- Extracted key fields for quick access and searching
    candidate_id TEXT NOT NULL UNIQUE,
    candidate_name TEXT NOT NULL,
    candidate_email TEXT NOT NULL,

    -- Complete API response stored as JSONB
    data JSONB NOT NULL,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_resume_analyses_candidate_id ON resume_analyses(candidate_id);
CREATE INDEX IF NOT EXISTS idx_resume_analyses_candidate_email ON resume_analyses(candidate_email);
CREATE INDEX IF NOT EXISTS idx_resume_analyses_candidate_name ON resume_analyses(candidate_name);
CREATE INDEX IF NOT EXISTS idx_resume_analyses_created_at ON resume_analyses(created_at DESC);

-- Optional: Create a GIN index on the JSONB column for efficient JSON queries
-- This allows fast queries on any JSON field within the data column
CREATE INDEX IF NOT EXISTS idx_resume_analyses_data_gin ON resume_analyses USING GIN (data);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_resume_analyses_updated_at ON resume_analyses;
CREATE TRIGGER update_resume_analyses_updated_at
    BEFORE UPDATE ON resume_analyses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE resume_analyses ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Authenticated users can view resume analyses" ON resume_analyses;
DROP POLICY IF EXISTS "Authenticated users can insert resume analyses" ON resume_analyses;
DROP POLICY IF EXISTS "Authenticated users can update resume analyses" ON resume_analyses;
DROP POLICY IF EXISTS "Authenticated users can delete resume analyses" ON resume_analyses;
DROP POLICY IF EXISTS "Anyone can view resume analyses" ON resume_analyses;
DROP POLICY IF EXISTS "Anyone can insert resume analyses" ON resume_analyses;

-- Create policies for ANONYMOUS (anon) and authenticated users
-- Policy: Anyone (including anonymous) can read all resume analyses
CREATE POLICY "Anyone can view resume analyses"
    ON resume_analyses FOR SELECT
    TO anon, authenticated
    USING (true);

-- Policy: Anyone (including anonymous) can insert new resume analyses
CREATE POLICY "Anyone can insert resume analyses"
    ON resume_analyses FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- Policy: Authenticated users can update resume analyses
CREATE POLICY "Authenticated users can update resume analyses"
    ON resume_analyses FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Policy: Authenticated users can delete resume analyses
CREATE POLICY "Authenticated users can delete resume analyses"
    ON resume_analyses FOR DELETE
    TO authenticated
    USING (true);

-- Grant permissions to both anonymous and authenticated users
GRANT SELECT, INSERT ON resume_analyses TO anon;
GRANT ALL ON resume_analyses TO authenticated;

-- Sample insert statement (for reference)
-- This shows how to insert data from your API response
COMMENT ON TABLE resume_analyses IS 'Stores complete resume analysis responses from the API as JSON blobs.

Sample insert:
INSERT INTO resume_analyses (candidate_id, candidate_name, candidate_email, data)
VALUES (
    ''579128b8-d5dc-4fba-aaf8-d4512804a204'',
    ''Viknesh Krishnan'',
    ''vikneshkrishnan20@gmail.com'',
    ''{ /* Full JSON response from API */ }''::jsonb
);';

-- Sample queries (for reference)
COMMENT ON COLUMN resume_analyses.data IS 'Complete API response stored as JSONB.

Sample queries:
-- Get all candidates with 5+ years experience:
SELECT * FROM resume_analyses
WHERE (data->''candidate_info''->>''experience_years'')::int >= 5;

-- Search for specific skills:
SELECT * FROM resume_analyses
WHERE data->''candidate_info''->>''skills'' @> ''"React"'';

-- Get work experiences for a candidate:
SELECT
    candidate_name,
    jsonb_array_elements(data->''candidate_info''->>''work_experiences'') as work_exp
FROM resume_analyses
WHERE candidate_id = ''579128b8-d5dc-4fba-aaf8-d4512804a204'';

-- Search by location:
SELECT * FROM resume_analyses
WHERE data->''candidate_info''->>''location'' = ''Kuala Lumpur'';
';

-- Verification queries (run these to check everything is set up correctly)
-- Check if RLS is enabled:
-- SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'resume_analyses';

-- Check policies:
-- SELECT * FROM pg_policies WHERE tablename = 'resume_analyses';

-- Test insert as anonymous user (should succeed):
-- INSERT INTO resume_analyses (candidate_id, candidate_name, candidate_email, data)
-- VALUES ('test-123', 'Test User', 'test@example.com', '{"test": true}'::jsonb);
