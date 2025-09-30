# Database Schema Documentation

This folder contains all SQL scripts for setting up the HR Automation Dashboard database in Supabase.

## 📁 Files Overview

### 1. `resume_analysis_schema.sql`
**Purpose**: Sets up the resume analysis storage system

**What it creates:**
- `resume_analyses` table - Stores complete resume analysis responses as JSONB
- Indexes for efficient querying (candidate_id, email, name, created_at)
- GIN index on JSONB data for fast JSON queries
- Row Level Security (RLS) policies
- Auto-updating timestamps with triggers

**When to use:**
- First-time database setup
- When you need to store and query resume analysis data

**Run order**: Can be run independently or after auth setup

---

### 2. `auth_functions_fix.sql` ⭐ **RECOMMENDED**
**Purpose**: Quick fix for authentication function issues

**What it does:**
- Drops old authentication functions
- Creates new functions with correct parameter names
- Sets up proper permissions
- Includes verification query

**When to use:**
- ✅ When you get "Could not find the function" errors
- ✅ When function parameter names don't match
- ✅ If you have existing policies and table
- ✅ **Use this if you got a "policy already exists" error**

**Advantages:**
- Minimal changes to database
- Doesn't touch existing tables or policies
- Safe to run multiple times
- Fastest solution

---

### 3. `auth_full_migration.sql`
**Purpose**: Complete authentication system setup

**What it creates:**
- `hr_users` table with secure password storage
- All authentication functions with correct parameters
- Row Level Security policies
- Indexes and triggers
- Proper permissions

**When to use:**
- First-time authentication setup
- Fresh database with no existing auth tables
- Complete database reset

**Note**: Contains exception handling for existing policies

---

## 🚀 Quick Start Guide

### For New Projects
```sql
-- Step 1: Set up resume analysis
-- Run: resume_analysis_schema.sql

-- Step 2: Set up authentication
-- Run: auth_full_migration.sql
```

### For Existing Projects (Fixing Function Errors)
```sql
-- Run: auth_functions_fix.sql
```

---

## 📋 Execution Instructions

### How to Run SQL Scripts in Supabase

1. **Open Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project
   - Navigate to **SQL Editor** from left sidebar

2. **Execute Script**
   - Click **New Query**
   - Copy the entire contents of the SQL file
   - Paste into the editor
   - Click **Run** (or press Cmd/Ctrl + Enter)

3. **Verify Success**
   - Check the output for success messages
   - Verify no error messages appear
   - Run verification queries (included in scripts)

---

## 🔍 Verification Queries

### Check if authentication functions exist
```sql
SELECT
    proname as function_name,
    pg_get_function_arguments(oid) as parameters
FROM pg_proc
WHERE proname IN ('verify_user_password', 'register_hr_user', 'update_last_login')
ORDER BY proname;
```

**Expected output:**
| function_name | parameters |
|--------------|------------|
| register_hr_user | p_email text, p_password text, p_full_name text |
| update_last_login | p_user_id uuid |
| verify_user_password | p_email text, p_password text |

### Check if tables exist
```sql
SELECT table_name, table_type
FROM information_schema.tables
WHERE table_name IN ('hr_users', 'resume_analyses')
ORDER BY table_name;
```

### Check if pgcrypto extension is enabled
```sql
SELECT extname FROM pg_extension WHERE extname = 'pgcrypto';
```

### View all users
```sql
SELECT id, email, full_name, role, is_active, created_at
FROM hr_users
ORDER BY created_at DESC;
```

---

## 🛠️ Troubleshooting

### Error: "Could not find the function public.register_hr_user"
**Solution**: Run `auth_functions_fix.sql`

### Error: "policy already exists"
**Solution**: Use `auth_functions_fix.sql` instead of `auth_full_migration.sql`

### Error: "relation hr_users does not exist"
**Solution**: Run `auth_full_migration.sql` to create the table

### Error: "extension pgcrypto does not exist"
**Solution**:
```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;
```

---

## 🔐 Security Features

### Password Storage
- Passwords are hashed using PostgreSQL's `crypt()` function
- Uses Blowfish algorithm (`gen_salt('bf')`)
- Never stored in plain text

### Row Level Security (RLS)
- Enabled on all tables
- Users can only access their own data
- Policies enforce data isolation

### Function Security
- Functions use `SECURITY DEFINER` for controlled access
- Proper permission grants to `anon` and `authenticated` roles
- Input validation and sanitization in application layer

---

## 📝 Function Descriptions

### `register_hr_user(p_email, p_password, p_full_name)`
- Registers new HR user with hashed password
- Returns: UUID of new user
- Throws exception if email already exists

### `verify_user_password(p_email, p_password)`
- Verifies login credentials
- Returns: User details if valid, empty if invalid
- Only returns active users

### `update_last_login(p_user_id)`
- Updates last_login_at timestamp
- Called after successful login
- Returns: void

---

## 📚 Additional Resources

- [Supabase SQL Documentation](https://supabase.com/docs/guides/database)
- [PostgreSQL pgcrypto](https://www.postgresql.org/docs/current/pgcrypto.html)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

---

## 🔄 Schema Updates

To update existing schemas:
1. Create a new migration file with timestamp
2. Test in development environment first
3. Backup production data before applying
4. Run migration during low-traffic periods

## 📧 Support

For issues or questions:
1. Check the main `AUTH_SETUP_GUIDE.md` in project root
2. Verify all environment variables are set
3. Check server logs for detailed error messages