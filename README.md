# HR AutoResume

AI-powered resume analysis and candidate management system built with Next.js, Tailwind CSS, and Supabase.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Detailed Setup](#detailed-setup)
  - [Authentication Setup](#authentication-setup)
  - [Database Setup](#database-setup)
- [Development](#development)
- [Project Structure](#project-structure)
- [Troubleshooting](#troubleshooting)
- [Security Considerations](#security-considerations)
- [Deployment](#deployment)

## Features

- 🤖 **AI-Powered Resume Analysis** - Automatically extract candidate information from PDF resumes
- 👤 **User Authentication** - Secure JWT-based authentication with bcrypt password hashing
- 💾 **Database Storage** - Store and manage resume analyses in Supabase
- 🎨 **Modern UI** - Clean, responsive interface built with Tailwind CSS v4
- 🔔 **Toast Notifications** - User-friendly feedback system
- ✨ **Animated Modals** - Engaging UI with loading animations
- 🔍 **Duplicate Detection** - Prevents re-analysis of already processed resumes

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: Supabase (PostgreSQL)
- **Authentication**: JWT + bcrypt
- **Backend API**: Python FastAPI (separate service)

## Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account ([sign up free](https://supabase.com))
- Backend API service running on `localhost:8000` (for resume processing)

## Quick Start

```bash
# 1. Clone and install dependencies
npm install

# 2. Create environment file
cp .env.example .env.local
# Edit .env.local with your credentials

# 3. Set up database (see Database Setup section)

# 4. Start development server
npm run dev
```

Visit `http://localhost:3000` to see the application.

---

## Detailed Setup

### Authentication Setup

#### Step 1: Execute SQL Migration

1. Go to your Supabase dashboard at [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **SQL Editor** from the left sidebar
4. Click **New Query**

**Choose your migration script:**

- **For first-time setup**: Use `database/auth_full_migration.sql`
- **For updates only**: Use `database/auth_functions_fix.sql` (if you got "policy already exists" error)

5. Copy the entire contents of the chosen script
6. Paste into SQL editor and click **Run**

#### Step 2: Configure Environment Variables

Create `.env.local` in the project root:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# JWT Secret (generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
JWT_SECRET=your-secret-key-here-make-it-long-and-random
```

**Get Supabase credentials:**
1. In Supabase Dashboard → **Settings** → **API**
2. Copy **Project URL** → paste as `NEXT_PUBLIC_SUPABASE_URL`
3. Copy **anon public** key → paste as `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Generate JWT secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### Step 3: Test Authentication

1. Start dev server: `npm run dev`
2. Navigate to `http://localhost:3000/register`
3. Create an account (password must have 8+ chars, uppercase, lowercase, number, special char)
4. Login at `http://localhost:3000/login`
5. You should see the dashboard

### Database Setup

The database stores analyzed resume data for future reference and searching.

#### Step 1: Run Database Schema

1. In Supabase Dashboard → **SQL Editor**
2. Click **New Query**
3. Copy contents of `database/resume_analysis_schema_with_anon.sql`
4. Paste and click **Run**

This creates the `resume_analyses` table with proper permissions for anonymous users.

#### Step 2: Verify Setup

Check that the table was created:

1. Go to **Table Editor** in Supabase
2. Look for `resume_analyses` table
3. Verify columns: `id`, `candidate_id`, `candidate_name`, `candidate_email`, `data`, `created_at`, `updated_at`

Test permissions with this query in SQL Editor:

```sql
-- This should succeed if RLS policies are correct
INSERT INTO resume_analyses (candidate_id, candidate_name, candidate_email, data)
VALUES ('test-123', 'Test User', 'test@example.com', '{"test": true}'::jsonb);

-- Clean up
DELETE FROM resume_analyses WHERE candidate_id = 'test-123';
```

#### Step 3: Test Integration

1. Ensure backend API is running on `localhost:8000`
2. Upload a PDF resume through the UI
3. Check browser console for success logs:
   - ✅ Supabase client initialization
   - 📝 Attempting to save resume analysis
   - ✅ Successfully saved resume analysis
4. Verify in Supabase **Table Editor** → `resume_analyses`

---

## Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

### Backend API Setup

The resume analysis backend is a separate Python FastAPI service. Ensure it's running on `localhost:8000` before testing uploads.

Backend API endpoint: `POST http://localhost:8000/api/v1/resume/upload`

---

## Project Structure

```
hr-automation-dashboard/
├── src/
│   ├── app/                    # Next.js app router pages
│   │   ├── page.tsx           # Main dashboard page
│   │   ├── login/             # Login page
│   │   └── register/          # Registration page
│   ├── components/            # React components
│   │   ├── Dashboard.tsx      # Dashboard overview
│   │   ├── ResumeAnalyzer.tsx # Resume upload interface
│   │   ├── FileUploadWidget.tsx
│   │   ├── ResumeResults.tsx  # Analysis results display
│   │   ├── Toast.tsx          # Toast notification
│   │   └── AnalysisModal.tsx  # Loading animation
│   ├── contexts/              # React contexts
│   │   ├── AuthContext.tsx    # Authentication state
│   │   └── ToastContext.tsx   # Toast notifications
│   ├── lib/                   # Utility functions
│   │   ├── database.ts        # Supabase operations
│   │   └── supabase.ts        # Supabase client
│   └── app/globals.css        # Global styles
├── database/                  # SQL migration scripts
│   ├── auth_full_migration.sql
│   ├── auth_functions_fix.sql
│   └── resume_analysis_schema_with_anon.sql
└── public/                    # Static assets
```

---

## Troubleshooting

### Authentication Issues

**Error: "Could not find the function"**
- **Cause**: SQL migration not executed or using old function signatures
- **Solution**: Run `database/auth_functions_fix.sql` in Supabase SQL Editor

**Error: "policy already exists"**
- **Cause**: Full migration script run when policies already exist
- **Solution**: Use `database/auth_functions_fix.sql` instead of full migration

**Error: "Invalid email or password"**
- Verify credentials are correct
- Check if user exists: `SELECT * FROM hr_users WHERE email = 'your@email.com';`
- Ensure `is_active = true`

**Password requirements:**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (!@#$%^&*(),.?":{}|<>)

### Database Issues

**Error: "Supabase not configured"**
- Check `.env.local` exists with valid `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Restart dev server after changing environment variables
- Check browser console for initialization logs

**Error: "Permission denied" / "Row Level Security policy violation"**
- Run `database/resume_analysis_schema_with_anon.sql`
- This script includes RLS policies for anonymous users

**Error: "Database table not found"**
- Table `resume_analyses` doesn't exist
- Run `database/resume_analysis_schema_with_anon.sql`
- Verify in Supabase Table Editor

**Error: "Duplicate resume detected"**
- This is expected behavior - prevents re-analyzing same candidate
- The `candidate_id` column has a UNIQUE constraint
- To re-analyze, delete the old record first:
  ```sql
  DELETE FROM resume_analyses WHERE candidate_id = 'the-candidate-id';
  ```

**Resume analyzed but not saved to database**
- Check browser console for specific error
- Most common: RLS policies not set up correctly
- Solution: Run `database/resume_analysis_schema_with_anon.sql`

### Backend API Issues

**Error: "Failed to fetch"**
- Backend API not running on `localhost:8000`
- Check CORS settings in backend
- Verify API endpoint: `http://localhost:8000/api/v1/resume/upload`

---

## Security Considerations

### Development vs Production

⚠️ **Current setup allows anonymous users to read/write data.** This is suitable for development but must be secured for production.

### Recommended Production Security

1. **Authentication Required**
   - Connect Supabase Auth with JWT auth system
   - Update RLS policies to require authentication
   - Remove anonymous user permissions

2. **Use Service Role Key on Backend**
   - Move database operations to Next.js API routes
   - Use `SUPABASE_SERVICE_ROLE_KEY` server-side only
   - Never expose service role key to client

3. **Row Level Security Policies**
   ```sql
   -- Example: Users can only see their own data
   CREATE POLICY "Users can view own analyses"
       ON resume_analyses FOR SELECT
       TO authenticated
       USING (auth.uid()::text = user_id);
   ```

4. **Environment Variables**
   - Never commit `.env.local` to version control
   - Use strong, random JWT secrets (32+ characters)
   - Rotate secrets regularly

5. **HTTPS Only**
   - Enforce HTTPS in production
   - Set secure cookie flags
   - Enable HSTS headers

---

## Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `JWT_SECRET`
4. Deploy!

### Environment Variables for Production

Ensure these are set in your deployment platform:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
JWT_SECRET=long-random-production-secret
```

⚠️ **Use different Supabase projects for development and production!**

---

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS v4 Docs](https://tailwindcss.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

---

## License

MIT

## Support

For issues or questions:
1. Check browser console for client errors
2. Check terminal for server errors
3. Review troubleshooting section above
4. Enable development mode for detailed error messages
