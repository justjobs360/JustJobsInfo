import { NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

// Initialize Firebase Admin if not already initialized
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

export async function POST(request) {
  try {
    const { email, testType = 'verification' } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    const auth = getAuth();

    // Test different email scenarios
    let result;
    
    switch (testType) {
      case 'verification':
        // Send a test verification email
        result = await auth.generateEmailVerificationLink(
          email,
          `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/verify-email`
        );
        break;
        
      case 'password-reset':
        // Send a test password reset email
        result = await auth.generatePasswordResetLink(
          email,
          `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password`
        );
        break;
        
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid test type' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message: `Test ${testType} email generated successfully`,
      data: {
        email,
        testType,
        actionUrl: result,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error testing email deliverability:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to test email deliverability',
        details: error.message
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Email deliverability test endpoint',
    usage: {
      method: 'POST',
      body: {
        email: 'test@example.com',
        testType: 'verification' // or 'password-reset'
      }
    },
    testingTools: [
      'https://www.mail-tester.com/',
      'https://glockapps.com/',
      'https://250ok.com/',
      'https://senderscore.org/'
    ]
  });
} 
