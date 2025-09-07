import { NextResponse } from 'next/server';
import JobAlertService from '@/utils/jobAlertService';
import JobMatchingService from '@/utils/jobMatchingService';
import BrevoService from '@/utils/brevoService';

// Simple admin authentication check
function isAdmin(request) {
  // In production, implement proper admin authentication
  // For now, we'll use a simple header check
  const adminKey = request.headers.get('x-admin-key');
  return adminKey === process.env.ADMIN_KEY || process.env.NODE_ENV === 'development';
}

export async function GET(request) {
  try {
    if (!isAdmin(request)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'stats':
        return await getStats();
      case 'subscribers':
        return await getSubscribers();
      case 'jobs':
        return await getJobStats();
      default:
        return NextResponse.json({
          success: true,
          message: 'Job Alerts Admin API',
          endpoints: [
            'GET ?action=stats - Get subscription statistics',
            'GET ?action=subscribers - Get all subscribers',
            'GET ?action=jobs - Get job statistics',
            'POST - Send job alerts (with body parameters)'
          ]
        });
    }
  } catch (error) {
    console.error('Error in admin job alerts API:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    if (!isAdmin(request)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { 
      action,
      testEmail,
      dryRun = false,
      maxUsers = 10
    } = body;

    switch (action) {
      case 'send-test':
        return await sendTestEmail(testEmail);
      case 'send-alerts':
        return await sendJobAlerts({ dryRun, maxUsers });
      case 'create-test-subscriber':
        return await createTestSubscriber();
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action. Use: send-test, send-alerts, or create-test-subscriber' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in admin job alerts POST API:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

async function getStats() {
  try {
    const jobAlertService = new JobAlertService();
    const result = await jobAlertService.getStats();
    
    if (!result.success) {
      throw new Error(result.error);
    }

    return NextResponse.json({
      success: true,
      stats: result.stats
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

async function getSubscribers() {
  try {
    const jobAlertService = new JobAlertService();
    const result = await jobAlertService.getActiveSubscribers();
    
    if (!result.success) {
      throw new Error(result.error);
    }

    // Remove sensitive data
    const sanitizedSubscribers = result.subscribers.map(sub => ({
      email: sub.email,
      name: sub.name,
      keywords: sub.keywords,
      locations: sub.locations,
      frequency: sub.frequency,
      remoteOnly: sub.remoteOnly,
      createdAt: sub.createdAt,
      lastSentAt: sub.lastSentAt,
      totalSent: sub.totalSent
    }));

    return NextResponse.json({
      success: true,
      subscribers: sanitizedSubscribers,
      count: sanitizedSubscribers.length
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

async function getJobStats() {
  try {
    const jobMatchingService = new JobMatchingService();
    const result = await jobMatchingService.getJobStats();
    
    if (!result.success) {
      throw new Error(result.error);
    }

    return NextResponse.json({
      success: true,
      stats: result.stats
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

async function sendTestEmail(testEmail) {
  try {
    if (!testEmail) {
      return NextResponse.json(
        { success: false, error: 'testEmail is required' },
        { status: 400 }
      );
    }

    const brevoService = new BrevoService();
    const result = await brevoService.sendTestEmail(testEmail);

    if (!result.success) {
      throw new Error(result.error);
    }

    return NextResponse.json({
      success: true,
      message: `Test email sent to ${testEmail}`,
      messageId: result.messageId
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

async function sendJobAlerts({ dryRun, maxUsers }) {
  try {
    // Call the main job alerts send API
    const response = await fetch(`${process.env.APP_URL || 'http://localhost:3000'}/api/job-alerts/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        testMode: false,
        dryRun,
        maxUsers
      })
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

async function createTestSubscriber() {
  try {
    const jobAlertService = new JobAlertService();
    
    const testSubscriber = {
      email: 'test@example.com',
      name: 'Test User',
      keywords: ['software engineer', 'javascript', 'react'],
      locations: ['San Francisco', 'New York', 'Remote'],
      remoteOnly: false,
      employmentTypes: ['Full-time', 'Part-time'],
      seniority: ['Mid', 'Senior'],
      frequency: 'immediate'
    };

    const result = await jobAlertService.subscribeUser(testSubscriber);

    if (!result.success) {
      throw new Error(result.error);
    }

    return NextResponse.json({
      success: true,
      message: 'Test subscriber created successfully',
      subscriber: {
        email: testSubscriber.email,
        name: testSubscriber.name,
        isNewUser: result.isNewUser
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
