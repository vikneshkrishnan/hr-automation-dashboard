import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getSession, createSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }

    // Get current session
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { companyId } = body;

    // Validation
    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      );
    }

    // Update user's company_id
    const { error } = await supabase.rpc('update_user_company', {
      p_user_id: session.userId,
      p_company_id: companyId,
    });

    if (error) {
      console.error('Update company error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to update company' },
        { status: 500 }
      );
    }

    // Update session with new company_id
    await createSession({
      userId: session.userId,
      email: session.email,
      fullName: session.fullName,
      role: session.role,
      companyId: companyId,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Company updated successfully',
        user: {
          id: session.userId,
          email: session.email,
          fullName: session.fullName,
          role: session.role,
          companyId: companyId,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update company error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
