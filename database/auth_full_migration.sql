-- ============================================
-- HR Authentication Migration Script
-- ============================================
-- This script drops old functions and recreates them with correct parameter names
-- Execute this in your Supabase SQL Editor

-- Step 1: Drop existing functions (if they exist)
DROP FUNCTION IF EXISTS verify_user_password(TEXT, TEXT);
DROP FUNCTION IF EXISTS register_hr_user(TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS update_last_login(UUID);

-- Step 2: Enable pgcrypto extension for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Step 3: Create or update the hr_users table
CREATE TABLE IF NOT EXISTS hr_users (
    -- Primary key
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    -- User credentials and information
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT DEFAULT 'hr' NOT NULL,

    -- Account status
    is_active BOOLEAN DEFAULT true NOT NULL,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    last_login_at TIMESTAMPTZ
);

-- Step 4: Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_hr_users_email ON hr_users(email);
CREATE INDEX IF NOT EXISTS idx_hr_users_is_active ON hr_users(is_active);
CREATE INDEX IF NOT EXISTS idx_hr_users_created_at ON hr_users(created_at DESC);

-- Step 5: Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 6: Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_hr_users_updated_at ON hr_users;
CREATE TRIGGER update_hr_users_updated_at
    BEFORE UPDATE ON hr_users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Step 7: Enable Row Level Security (RLS)
ALTER TABLE hr_users ENABLE ROW LEVEL SECURITY;

-- Step 8: Safely create or recreate policies
DO $$
BEGIN
    -- Drop and recreate "Users can view their own data" policy
    IF EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'hr_users'
        AND policyname = 'Users can view their own data'
    ) THEN
        DROP POLICY "Users can view their own data" ON hr_users;
    END IF;

    CREATE POLICY "Users can view their own data"
        ON hr_users FOR SELECT
        TO authenticated
        USING (auth.uid()::text = id::text);

    -- Drop and recreate "Users can update their own data" policy
    IF EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'hr_users'
        AND policyname = 'Users can update their own data'
    ) THEN
        DROP POLICY "Users can update their own data" ON hr_users;
    END IF;

    CREATE POLICY "Users can update their own data"
        ON hr_users FOR UPDATE
        TO authenticated
        USING (auth.uid()::text = id::text);

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Policy creation warning: %. Continuing...', SQLERRM;
END $$;

-- Step 9: Create function to verify passwords (with correct parameter names)
CREATE OR REPLACE FUNCTION verify_user_password(p_email TEXT, p_password TEXT)
RETURNS TABLE(user_id UUID, user_full_name TEXT, user_email TEXT, user_role TEXT) AS $$
BEGIN
    RETURN QUERY
    SELECT
        id,
        full_name,
        email,
        role
    FROM hr_users
    WHERE
        email = p_email
        AND password_hash = crypt(p_password, password_hash)
        AND is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 10: Create function to register new users (with correct parameter names and order)
CREATE OR REPLACE FUNCTION register_hr_user(
    p_email TEXT,
    p_password TEXT,
    p_full_name TEXT
)
RETURNS UUID AS $$
DECLARE
    new_user_id UUID;
BEGIN
    -- Insert new user with hashed password
    INSERT INTO hr_users (email, password_hash, full_name)
    VALUES (
        p_email,
        crypt(p_password, gen_salt('bf')),
        p_full_name
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

-- Step 11: Create function to update last login timestamp
CREATE OR REPLACE FUNCTION update_last_login(p_user_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE hr_users
    SET last_login_at = NOW()
    WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 12: Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION verify_user_password(TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION register_hr_user(TEXT, TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION update_last_login(UUID) TO authenticated;

-- Step 13: Grant table permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Step 14: Add comments for documentation
COMMENT ON TABLE hr_users IS 'Stores HR user authentication data with secure password hashing using bcrypt';
COMMENT ON COLUMN hr_users.password_hash IS 'Password hashed using PostgreSQL crypt() with blowfish algorithm';
COMMENT ON FUNCTION verify_user_password(TEXT, TEXT) IS 'Securely verifies user password and returns user data if valid';
COMMENT ON FUNCTION register_hr_user(TEXT, TEXT, TEXT) IS 'Registers a new HR user with automatic password hashing. Parameters: p_email, p_password, p_full_name';
COMMENT ON FUNCTION update_last_login(UUID) IS 'Updates the last login timestamp for a user';

-- Verification: Check if functions were created successfully
SELECT
    proname as function_name,
    pg_get_function_arguments(oid) as parameters
FROM pg_proc
WHERE proname IN ('verify_user_password', 'register_hr_user', 'update_last_login')
ORDER BY proname;