import { NextResponse } from 'next/server';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } = process.env;
  if (FIREBASE_PROJECT_ID && FIREBASE_CLIENT_EMAIL && FIREBASE_PRIVATE_KEY) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: FIREBASE_PROJECT_ID,
        clientEmail: FIREBASE_CLIENT_EMAIL,
        privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    });
  } else {
    // Avoid crashing the build when env vars are missing on the build server
    console.warn('Firebase Admin not initialized: missing FIREBASE_* environment variables.');
  }
}

export async function POST(request) {
  try {
    if (!admin.apps.length) {
      return NextResponse.json({
        success: false,
        error: 'Server configuration error: Firebase Admin credentials are not set.'
      }, { status: 500 });
    }
    const { idToken } = await request.json();

    if (!idToken) {
      return NextResponse.json({ 
        success: false, 
        error: 'No ID token provided' 
      }, { status: 401 });
    }

    // Verify the Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken, true);
    
    if (!decodedToken.uid) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid token' 
      }, { status: 401 });
    }

    // Get user role from Firestore
    const userDoc = await admin.firestore().collection('users').doc(decodedToken.uid).get();
    
    if (!userDoc.exists) {
      return NextResponse.json({ 
        success: false, 
        error: 'User not found' 
      }, { status: 404 });
    }

    const userData = userDoc.data();
    const isAdmin = userData.role === 'admin' || userData.role === 'super_admin';

    if (!isAdmin) {
      return NextResponse.json({ 
        success: false, 
        error: 'Access denied. Admin privileges required.' 
      }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      user: {
        uid: decodedToken.uid,
        email: decodedToken.email,
        role: userData.role,
        permissions: userData.permissions || []
      }
    });

  } catch (error) {
    console.error('Admin auth error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Authentication failed' 
    }, { status: 500 });
  }
} 