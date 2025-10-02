import { NextRequest, NextResponse } from 'next/server';
import { getCompanyById, updateCompany, deleteCompany } from '@/lib/company-database';
import { sanitizeInput } from '@/lib/auth';

/**
 * GET /api/company/[id]
 * Fetch a company by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      );
    }

    const result = await getCompanyById(id);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { company: result.data },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in GET /api/company/[id]:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/company/[id]
 * Update a company
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const sanitizedUpdates: Record<string, unknown> = {};
    Object.keys(body).forEach((key) => {
      if (body[key] !== undefined && body[key] !== null) {
        if (typeof body[key] === 'string') {
          sanitizedUpdates[key] = sanitizeInput(body[key]);
        } else {
          sanitizedUpdates[key] = body[key];
        }
      }
    });

    // Update company
    const result = await updateCompany(id, sanitizedUpdates);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Company updated successfully',
        company: result.data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in PUT /api/company/[id]:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/company/[id]
 * Delete a company (soft delete)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      );
    }

    const result = await deleteCompany(id);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Company deleted successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in DELETE /api/company/[id]:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
