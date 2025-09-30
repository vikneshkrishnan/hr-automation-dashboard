# HR Authentication Setup Guide

This guide will help you set up the authentication system for your HR Automation Dashboard.

## Prerequisites

- Supabase account and project created
- Database access credentials

## Step 1: Execute SQL Migration

### 1.1 Open Supabase Dashboard
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **SQL Editor** from the left sidebar

### 1.2 Choose Your Migration Script

**Option A: Quick Fix (Recommended for existing setups)**
- Use `database/auth_functions_fix.sql` - Only updates the authentication functions
- Safest option if your table and policies already exist
- **Use this if you got a "policy already exists" error**

**Option B: Full Migration (For new setups)**
- Use `database/auth_full_migration.sql` - Complete setup including table, policies, and functions
- Best for first-time setup or fresh database

💡 **Tip**: See `database/README.md` for detailed information about each script

### 1.3 Run the Migration Script
1. Click **New Query**
2. Copy the entire contents of your chosen script from the `database/` folder
3. Paste it into the SQL editor
4. Click **Run** (or press Cmd/Ctrl + Enter)

### 1.4 Verify Success
After running the script, you should see output showing 3 functions:
- `register_hr_user(p_email text, p_password text, p_full_name text)`
- `update_last_login(p_user_id uuid)`
- `verify_user_password(p_email text, p_password text)`

If you see these functions with the correct parameter names, the migration was successful! ✅

## Step 2: Configure Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# JWT Secret (generate a secure random string)
JWT_SECRET=your-secret-key-here-make-it-long-and-random
```

### 2.1 Get Supabase Credentials
1. In Supabase Dashboard, go to **Settings** → **API**
2. Copy **Project URL** → paste as `NEXT_PUBLIC_SUPABASE_URL`
3. Copy **Project API keys** → **anon/public** → paste as `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 2.2 Generate JWT Secret
Run this command to generate a secure JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Step 3: Install Dependencies (Already Done)

If you need to reinstall:
```bash
npm install
```

## Step 4: Start the Development Server

```bash
npm run dev
```

The application should now be running at `http://localhost:3000`

## Step 5: Test Authentication

### 5.1 Test Registration
1. Navigate to `http://localhost:3000/register`
2. Fill in the registration form:
   - **Full Name**: John Doe
   - **Email**: john@example.com
   - **Password**: Test123!@# (must meet complexity requirements)
   - **Confirm Password**: Test123!@#
3. Click **Create account**
4. You should see "Registration successful!" message

### 5.2 Test Login
1. You'll be redirected to the login page
2. Enter your credentials:
   - **Email**: john@example.com
   - **Password**: Test123!@#
3. Click **Sign in**
4. You should be redirected to the dashboard

## Troubleshooting

### Error: "Could not find the function"
**Cause**: SQL migration not executed or old functions still exist
**Solution**:
1. Run the quick fix script: `database/auth_functions_fix.sql`
2. Or drop old functions manually in Supabase SQL Editor:
   ```sql
   DROP FUNCTION IF EXISTS verify_user_password;
   DROP FUNCTION IF EXISTS register_hr_user;
   DROP FUNCTION IF EXISTS update_last_login;
   ```
3. Then re-run the migration script

### Error: "policy already exists"
**Cause**: The migration script tried to create policies that already exist
**Solution**:
- Use `database/auth_functions_fix.sql` instead of `database/auth_full_migration.sql`
- This script only updates the functions and doesn't touch policies

### Error: "Database not configured"
**Cause**: Missing or invalid environment variables
**Solution**:
1. Verify `.env.local` file exists in root directory
2. Check that `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set correctly
3. Restart the dev server after changing environment variables

### Error: "Email already exists"
**Cause**: Attempting to register with an email that's already in the database
**Solution**:
- Use a different email, OR
- Delete the existing user from Supabase:
  ```sql
  DELETE FROM hr_users WHERE email = 'john@example.com';
  ```

### Error: "Invalid email or password" (during login)
**Cause**: Incorrect credentials or user doesn't exist
**Solution**:
1. Verify you're using the correct email and password
2. Check if user exists in database:
   ```sql
   SELECT email, full_name, is_active FROM hr_users WHERE email = 'john@example.com';
   ```
3. Ensure `is_active` is `true`

### Error: "pgcrypto extension not found"
**Cause**: pgcrypto extension not enabled
**Solution**:
Run in Supabase SQL Editor:
```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;
```

### Password Requirements Not Met
Passwords must contain:
- At least 8 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one number (0-9)
- At least one special character (!@#$%^&*(),.?":{}|<>)

Example valid password: `SecurePass123!`

## Verifying Database Setup

Run these queries in Supabase SQL Editor to verify everything is set up correctly:

### Check if table exists
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_name = 'hr_users';
```

### Check if functions exist with correct signatures
```sql
SELECT
    proname as function_name,
    pg_get_function_arguments(oid) as parameters
FROM pg_proc
WHERE proname IN ('verify_user_password', 'register_hr_user', 'update_last_login')
ORDER BY proname;
```

Expected output:
| function_name | parameters |
|--------------|------------|
| register_hr_user | p_email text, p_password text, p_full_name text |
| update_last_login | p_user_id uuid |
| verify_user_password | p_email text, p_password text |

### Check if extensions are enabled
```sql
SELECT extname FROM pg_extension WHERE extname = 'pgcrypto';
```

### List all users in database
```sql
SELECT id, email, full_name, role, is_active, created_at, last_login_at
FROM hr_users
ORDER BY created_at DESC;
```

## Security Notes

1. **Never commit `.env.local`** to version control (it's already in `.gitignore`)
2. **Use strong JWT secrets** in production (32+ characters, random)
3. **Enable HTTPS** in production
4. **Regularly rotate JWT secrets** as a security best practice
5. **Monitor failed login attempts** for suspicious activity

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [PostgreSQL pgcrypto](https://www.postgresql.org/docs/current/pgcrypto.html)

## Support

If you encounter issues not covered in this guide:
1. Check the browser console for client-side errors
2. Check the terminal/server logs for backend errors
3. Enable development mode to see detailed error messages
4. Verify all SQL functions are created with correct signatures