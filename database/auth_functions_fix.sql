-- ============================================
-- Fix Authentication Functions - Quick Migration
-- ============================================
-- This script ONLY updates the authentication functions to fix parameter names
-- Run this if you're getting "Could not find the function" errors
-- This is the safest and quickest fix for the registration issue

-- Step 1: Drop old functions (removes any existing versions)
DROP FUNCTION IF EXISTS verify_user_password(TEXT, TEXT);
DROP FUNCTION IF EXISTS register_hr_user(TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS update_last_login(UUID);

-- Step 2: Ensure pgcrypto extension is enabled (safe to run multiple times)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Step 3: Create verify_user_password function with correct parameter names
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

-- Step 4: Create register_hr_user function with correct parameter names and order
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

-- Step 5: Create update_last_login function with correct parameter name
CREATE OR REPLACE FUNCTION update_last_login(p_user_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE hr_users
    SET last_login_at = NOW()
    WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 6: Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION verify_user_password(TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION register_hr_user(TEXT, TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION update_last_login(UUID) TO authenticated;

-- Step 7: Verify the functions were created successfully
SELECT
    proname as function_name,
    pg_get_function_arguments(oid) as parameters,
    'SUCCESS ✓' as status
FROM pg_proc
WHERE proname IN ('verify_user_password', 'register_hr_user', 'update_last_login')
AND pg_get_function_arguments(oid) LIKE '%p_%'
ORDER BY proname;

-- You should see 3 rows with the correct parameter names starting with "p_"