import { NextResponse } from 'next/server';
import JobAlertService from '@/utils/jobAlertService';

export async function POST(request) {
  try {
    const body = await request.json();
    const { unsubscribeToken } = body;

    if (!unsubscribeToken) {
      return NextResponse.json(
        { success: false, error: 'Unsubscribe token is required' },
        { status: 400 }
      );
    }

    const jobAlertService = new JobAlertService();
    const result = await jobAlertService.unsubscribeUser(unsubscribeToken);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message
    });

  } catch (error) {
    console.error('Error in job alerts unsubscribe API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unsubscribe token is required' },
        { status: 400 }
      );
    }

    const jobAlertService = new JobAlertService();
    const result = await jobAlertService.getUserByToken(token);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    // Unsubscribe the user
    const unsubscribeResult = await jobAlertService.unsubscribeUser(token);

    if (!unsubscribeResult.success) {
      return NextResponse.json(
        { success: false, error: unsubscribeResult.error },
        { status: 500 }
      );
    }

    // Return success page HTML
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Unsubscribed - JustJobsInfo</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f9fafb;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
          }
          .container {
            background: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            text-align: center;
            max-width: 500px;
            width: 90%;
          }
          .success-icon {
            font-size: 48px;
            color: #10b981;
            margin-bottom: 20px;
          }
          h1 {
            color: #1f2937;
            margin-bottom: 16px;
          }
          p {
            color: #6b7280;
            line-height: 1.6;
            margin-bottom: 24px;
          }
          .btn {
            background: #2563eb;
            color: white;
            padding: 12px 24px;
            border-radius: 6px;
            text-decoration: none;
            font-weight: 600;
            display: inline-block;
          }
          .btn:hover {
            background: #1d4ed8;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="success-icon">✓</div>
          <h1>Successfully Unsubscribed</h1>
          <p>
            You have been unsubscribed from job alerts. You will no longer receive 
            email notifications about new job opportunities.
          </p>
          <p>
            If you change your mind, you can always subscribe again by visiting our 
            job alerts page.
          </p>
          <a href="/job-alerts" class="btn">Visit Job Alerts Page</a>
        </div>
      </body>
      </html>
    `;

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
      },
    });

  } catch (error) {
    console.error('Error in job alerts unsubscribe GET API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
