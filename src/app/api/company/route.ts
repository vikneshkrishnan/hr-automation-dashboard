import { NextRequest, NextResponse } from 'next/server';
import { createCompany, getCompanies } from '@/lib/company-database';
import { sanitizeInput } from '@/lib/auth';

/**
 * GET /api/company
 * Fetch all companies
 */
export async function GET() {
  try {
    const result = await getCompanies();

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { companies: result.data },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in GET /api/company:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/company
 * Create a new company
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      company_name,
      industry,
      company_size,
      website,
      description,
      contact_email,
      contact_phone,
      address,
      city,
      state,
      country,
      postal_code,
    } = body;

    // Validation
    if (!company_name) {
      return NextResponse.json(
        { error: 'Company name is required' },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const sanitizedData = {
      company_name: sanitizeInput(company_name),
      industry: industry ? sanitizeInput(industry) : undefined,
      company_size: company_size ? sanitizeInput(company_size) : undefined,
      website: website ? sanitizeInput(website) : undefined,
      description: description ? sanitizeInput(description) : undefined,
      contact_email: contact_email ? sanitizeInput(contact_email.toLowerCase()) : undefined,
      contact_phone: contact_phone ? sanitizeInput(contact_phone) : undefined,
      address: address ? sanitizeInput(address) : undefined,
      city: city ? sanitizeInput(city) : undefined,
      state: state ? sanitizeInput(state) : undefined,
      country: country ? sanitizeInput(country) : undefined,
      postal_code: postal_code ? sanitizeInput(postal_code) : undefined,
    };

    // Create company
    const result = await createCompany(sanitizedData);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Company created successfully',
        company: result.data,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in POST /api/company:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
