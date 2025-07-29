import { NextResponse } from 'next/server';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    });
    console.log('✅ Firebase Admin SDK initialized successfully');
  } catch (error) {
    console.error('❌ Firebase Admin initialization error:', error);
  }
}

export async function GET() {
  try {
    console.log('🧪 Testing Firebase Admin SDK...');
    
    // Check if Firebase Admin is initialized
    if (!admin.apps.length) {
      return NextResponse.json({
        success: false,
        error: 'Firebase Admin SDK not initialized'
      }, { status: 500 });
    }

    // Test Firestore connection
    const db = admin.firestore();
    console.log('📊 Firestore instance created');

    // Test a simple query
    const usersRef = db.collection('users');
    console.log('📋 Users collection reference created');

    // Try to get a count (this will fail if there are no documents, but that's okay)
    try {
      const snapshot = await usersRef.limit(1).get();
      console.log(`📊 Found ${snapshot.size} users in collection`);
      
      return NextResponse.json({
        success: true,
        message: 'Firebase Admin SDK is working correctly',
        userCount: snapshot.size,
        firebaseInitialized: admin.apps.length > 0
      });
    } catch (firestoreError) {
      console.error('❌ Firestore error:', firestoreError);
      return NextResponse.json({
        success: false,
        error: `Firestore error: ${firestoreError.message}`,
        firebaseInitialized: admin.apps.length > 0
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ Test endpoint error:', error);
    return NextResponse.json({
      success: false,
      error: `Test failed: ${error.message}`,
      firebaseInitialized: admin.apps.length > 0
    }, { status: 500 });
  }
} 