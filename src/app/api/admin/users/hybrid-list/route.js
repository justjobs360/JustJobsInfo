import { NextResponse } from 'next/server';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
      })
    });
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
  }
}

export async function GET(request) {
  try {
    console.log('🔍 Attempting to fetch real users from Firestore...');
    
    // Get real users from Firestore
    const usersSnapshot = await admin.firestore().collection('users').get();
    
    const users = [];
    usersSnapshot.forEach((doc) => {
      const userData = doc.data();
      users.push({
        id: doc.id,
        uid: userData.uid || doc.id,
        email: userData.email,
        role: userData.role || 'user',
        permissions: userData.permissions || [],
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt,
        createdBy: userData.createdBy,
        updatedBy: userData.updatedBy,
        isActive: userData.isActive !== false
      });
    });

    console.log(`✅ Successfully fetched ${users.length} real users from Firestore`);
    
    return NextResponse.json({
      success: true,
      users,
      source: 'firestore',
      pagination: {
        total: users.length,
        limit: 100,
        offset: 0,
        hasMore: false
      }
    });


  } catch (error) {
    console.error('❌ Error in hybrid user list:', error);
    return NextResponse.json({ 
      success: false, 
      error: `Failed to fetch users: ${error.message}` 
    }, { status: 500 });
  }
}
