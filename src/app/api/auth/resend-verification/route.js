import { NextResponse } from 'next/server';
import { getAuth, sendEmailVerification } from 'firebase-admin/auth';
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
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    // Get user by email
    const auth = getAuth();
    const userRecord = await auth.getUserByEmail(email);

    if (!userRecord) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    if (userRecord.emailVerified) {
      return NextResponse.json(
        { success: false, error: 'Email is already verified' },
        { status: 400 }
      );
    }

    // Generate verification email
    const verificationLink = await auth.generateEmailVerificationLink(
      userRecord.email,
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/verify-email`
    );

    // Send verification email
    await auth.sendCustomVerificationEmail(userRecord.uid, {
      url: verificationLink,
      handleCodeInApp: false,
    });

    return NextResponse.json({
      success: true,
      message: 'Verification email sent successfully'
    });

  } catch (error) {
    console.error('Error resending verification email:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to send verification email. Please try again.' 
      },
      { status: 500 }
    );
  }
} 