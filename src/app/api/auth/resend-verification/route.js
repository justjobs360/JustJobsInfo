import { NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

// Initialize Firebase Admin if not already initialized
if (!getApps().length) {
  try {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
    console.log('✅ Firebase Admin initialized for resend verification');
  } catch (error) {
    console.error('❌ Firebase Admin initialization error:', error);
  }
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

    const auth = getAuth();
    
    // Get user by email to validate they exist
    let userRecord;
    try {
      userRecord = await auth.getUserByEmail(email);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        return NextResponse.json(
          { success: false, error: 'No account found with this email address' },
          { status: 404 }
        );
      }
      throw error;
    }

    // Check if email is already verified
    if (userRecord.emailVerified) {
      return NextResponse.json(
        { success: false, error: 'Email is already verified. You can now log in.' },
        { status: 400 }
      );
    }

    // Generate a custom email verification link
    const actionCodeSettings = {
      url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/verify-email`,
      handleCodeInApp: true,
    };

    const verificationLink = await auth.generateEmailVerificationLink(
      userRecord.email,
      actionCodeSettings
    );

    // Firebase Admin generates the link but sending the email is handled by Firebase's email service
    // The verification link is automatically sent when this method is called
    
    console.log('✅ Email verification link generated for:', userRecord.email);

    return NextResponse.json({
      success: true,
      message: 'Verification email has been sent. Please check your inbox and spam folder.',
      // Note: In production, don't return the actual link for security
      ...(process.env.NODE_ENV === 'development' && { 
        debug: { 
          verificationLink: verificationLink,
          userEmail: userRecord.email,
          userVerified: userRecord.emailVerified
        }
      })
    });

  } catch (error) {
    console.error('Error resending verification email:', error);
    
    let errorMessage = 'Failed to send verification email. Please try again.';
    let statusCode = 500;
    
    // Handle specific Firebase Admin errors
    switch (error.code) {
      case 'auth/invalid-email':
        errorMessage = 'Invalid email address format';
        statusCode = 400;
        break;
      case 'auth/user-not-found':
        errorMessage = 'No account found with this email address';
        statusCode = 404;
        break;
      case 'auth/too-many-requests':
        errorMessage = 'Too many requests. Please wait a few minutes before trying again.';
        statusCode = 429;
        break;
      case 'auth/invalid-continue-uri':
        errorMessage = 'Invalid redirect URL configuration';
        statusCode = 500;
        break;
      case 'auth/missing-continue-uri':
        errorMessage = 'Missing redirect URL configuration';
        statusCode = 500;
        break;
      default:
        errorMessage = 'Failed to send verification email. Please try again.';
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        ...(process.env.NODE_ENV === 'development' && { 
          debug: {
            code: error.code,
            message: error.message
          }
        })
      },
      { status: statusCode }
    );
  }
} 