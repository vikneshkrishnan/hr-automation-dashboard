import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { validateEmail, sanitizeInput, createSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { email, password } = body;

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const sanitizedEmail = sanitizeInput(email.toLowerCase());

    // Validate email format
    if (!validateEmail(sanitizedEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Call Supabase function to verify password
    const { data, error } = await supabase.rpc('verify_user_password', {
      p_email: sanitizedEmail,
      p_password: password,
    });

    if (error) {
      // Log detailed error for debugging
      console.error('Login error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        fullError: error,
      });

      // Return more detailed error in development mode
      const isDevelopment = process.env.NODE_ENV === 'development';
      return NextResponse.json(
        {
          error: 'Login failed. Please try again.',
          ...(isDevelopment && {
            debug: {
              message: error.message,
              code: error.code,
              hint: error.hint,
              details: error.details,
            }
          })
        },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const user = data[0];

    // Update last login timestamp
    await supabase.rpc('update_last_login', { p_user_id: user.user_id });

    // Create session
    await createSession({
      userId: user.user_id,
      email: user.user_email,
      fullName: user.user_full_name,
      role: user.user_role,
      companyId: user.user_company_id,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Login successful',
        user: {
          id: user.user_id,
          email: user.user_email,
          fullName: user.user_full_name,
          role: user.user_role,
          companyId: user.user_company_id,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}