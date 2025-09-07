import { NextResponse } from 'next/server';
import JobAlertService from '@/utils/jobAlertService';
import { validateEmail } from '@/utils/validation';

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      email,
      name,
      keywords = [],
      locations = [],
      remoteOnly = false,
      employmentTypes = ['Full-time', 'Part-time', 'Contract'],
      seniority = ['Entry', 'Mid', 'Senior', 'Executive'],
      frequency = 'immediate'
    } = body;

    // Validation
    if (!email || !validateEmail(email)) {
      return NextResponse.json(
        { success: false, error: 'Valid email is required' },
        { status: 400 }
      );
    }

    if (!name || name.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: 'Name is required (minimum 2 characters)' },
        { status: 400 }
      );
    }

    if (keywords.length === 0 && locations.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one keyword or location is required' },
        { status: 400 }
      );
    }

    // Validate frequency
    const validFrequencies = ['immediate', 'daily', 'weekly'];
    if (!validFrequencies.includes(frequency)) {
      return NextResponse.json(
        { success: false, error: 'Invalid frequency. Must be immediate, daily, or weekly' },
        { status: 400 }
      );
    }

    const jobAlertService = new JobAlertService();
    const result = await jobAlertService.subscribeUser({
      email: email.trim(),
      name: name.trim(),
      keywords: keywords.filter(k => k.trim().length > 0),
      locations: locations.filter(l => l.trim().length > 0),
      remoteOnly,
      employmentTypes,
      seniority,
      frequency
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      isNewUser: result.isNewUser
    });

  } catch (error) {
    console.error('Error in job alerts subscribe API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email || !validateEmail(email)) {
      return NextResponse.json(
        { success: false, error: 'Valid email is required' },
        { status: 400 }
      );
    }

    const jobAlertService = new JobAlertService();
    const result = await jobAlertService.getUserPreferences(email);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      preferences: result.preferences
    });

  } catch (error) {
    console.error('Error in job alerts get preferences API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
