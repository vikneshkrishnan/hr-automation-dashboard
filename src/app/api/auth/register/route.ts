import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { validateEmail, validatePassword, sanitizeInput } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { email, password, fullName, confirmPassword } = body;

    // Validation
    if (!email || !password || !fullName || !confirmPassword) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: 'Passwords do not match' },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const sanitizedEmail = sanitizeInput(email.toLowerCase());
    const sanitizedFullName = sanitizeInput(fullName);

    // Validate email format
    if (!validateEmail(sanitizedEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: passwordValidation.errors.join(', ') },
        { status: 400 }
      );
    }

    // Validate full name
    if (sanitizedFullName.length < 2) {
      return NextResponse.json(
        { error: 'Full name must be at least 2 characters long' },
        { status: 400 }
      );
    }

    // Call Supabase function to register user
    const { data, error } = await supabase.rpc('register_hr_user', {
      p_email: sanitizedEmail,
      p_password: password,
      p_full_name: sanitizedFullName,
    });

    if (error) {
      // Log detailed error for debugging
      console.error('Registration error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        fullError: error,
      });

      if (error.message.includes('Email already exists')) {
        return NextResponse.json(
          { error: 'An account with this email already exists' },
          { status: 409 }
        );
      }

      // Return more detailed error in development mode
      const isDevelopment = process.env.NODE_ENV === 'development';
      return NextResponse.json(
        {
          error: 'Registration failed. Please try again.',
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

    return NextResponse.json(
      {
        success: true,
        message: 'Registration successful! Please login.',
        userId: data,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}