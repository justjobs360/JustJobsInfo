import { NextResponse } from 'next/server';
import * as admin from 'firebase-admin';
import { ADMIN_PERMISSIONS, DEFAULT_ADMIN_PERMISSIONS, SUPER_ADMIN_PERMISSIONS } from '@/utils/userRoleService';

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
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
  }
}

export async function POST(request) {
  try {
    const { email, uid, role, permissions, createdBy } = await request.json();

    // Validate required fields - either email or uid must be provided
    if (!email && !uid) {
      return NextResponse.json({ 
        success: false, 
        error: 'Either email or uid is required' 
      }, { status: 400 });
    }

    if (!role) {
      return NextResponse.json({ 
        success: false, 
        error: 'Role is required' 
      }, { status: 400 });
    }

    // Validate role
    if (role !== 'admin' && role !== 'super_admin') {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid role. Must be "admin" or "super_admin"' 
      }, { status: 400 });
    }

    // Set permissions based on role
    const finalPermissions = role === 'super_admin' 
      ? SUPER_ADMIN_PERMISSIONS 
      : (permissions || DEFAULT_ADMIN_PERMISSIONS);

    let userRecord;
    let userEmail;

    if (uid) {
      // Use existing user by UID
      try {
        userRecord = await admin.auth().getUser(uid);
        userEmail = userRecord.email;
        console.log(`✅ Found existing user by UID: ${userEmail}`);
      } catch (error) {
        return NextResponse.json({ 
          success: false, 
          error: `User with UID ${uid} not found in Firebase Auth` 
        }, { status: 404 });
      }
    } else {
      // Use existing user by email
      try {
        userRecord = await admin.auth().getUserByEmail(email);
        userEmail = email;
        console.log(`✅ Found existing user by email: ${userEmail}`);
      } catch (error) {
        return NextResponse.json({ 
          success: false, 
          error: `User with email ${email} not found in Firebase Auth` 
        }, { status: 404 });
      }
    }

    // Check if user already has admin role in Firestore
    const existingUserDoc = await admin.firestore().collection('users').doc(userRecord.uid).get();
    
    if (existingUserDoc.exists) {
      const existingData = existingUserDoc.data();
      if (existingData.role === 'admin' || existingData.role === 'super_admin') {
        return NextResponse.json({ 
          success: false, 
          error: `User ${userEmail} is already an admin` 
        }, { status: 409 });
      }
    }

    // Create or update user document in Firestore
    const userData = {
      uid: userRecord.uid,
      email: userEmail,
      role,
      permissions: finalPermissions,
      createdAt: existingUserDoc.exists ? existingUserDoc.data().createdAt : new Date().toISOString(),
      createdBy: createdBy || 'super_admin',
      updatedAt: new Date().toISOString(),
      isActive: true
    };

    await admin.firestore().collection('users').doc(userRecord.uid).set(userData, { merge: true });

    return NextResponse.json({
      success: true,
      user: {
        uid: userRecord.uid,
        email: userEmail,
        role,
        permissions: finalPermissions,
        createdAt: userData.createdAt
      },
      message: `${userEmail} promoted to ${role === 'super_admin' ? 'Super Admin' : 'Admin'} successfully`
    });

  } catch (error) {
    console.error('Error promoting user to admin:', error);
    
    // Handle specific Firebase Auth errors
    if (error.code === 'auth/user-not-found') {
      return NextResponse.json({ 
        success: false, 
        error: 'User not found in Firebase Auth' 
      }, { status: 404 });
    }

    return NextResponse.json({ 
      success: false, 
      error: `Failed to promote user to admin: ${error.message}` 
    }, { status: 500 });
  }
} 