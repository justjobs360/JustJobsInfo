import { NextResponse } from 'next/server';
import * as admin from 'firebase-admin';
import { DEFAULT_ADMIN_PERMISSIONS, SUPER_ADMIN_PERMISSIONS } from '@/utils/userRoleService';

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

export async function PUT(request) {
  try {
    const { uid, role, permissions, updatedBy } = await request.json();

    // Validate required fields
    if (!uid || !role) {
      return NextResponse.json({ 
        success: false, 
        error: 'User ID and role are required' 
      }, { status: 400 });
    }

    // Validate role
    if (role !== 'admin' && role !== 'super_admin' && role !== 'user') {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid role. Must be "user", "admin", or "super_admin"' 
      }, { status: 400 });
    }

    // Get current user data
    const userDoc = await admin.firestore().collection('users').doc(uid).get();
    if (!userDoc.exists) {
      return NextResponse.json({ 
        success: false, 
        error: 'User not found' 
      }, { status: 404 });
    }

    const currentUserData = userDoc.data();

    // Set permissions based on role
    let finalPermissions = [];
    if (role === 'super_admin') {
      finalPermissions = SUPER_ADMIN_PERMISSIONS;
    } else if (role === 'admin') {
      finalPermissions = permissions || DEFAULT_ADMIN_PERMISSIONS;
    } else {
      // Regular user - no permissions
      finalPermissions = [];
    }

    // Update user document in Firestore
    const updateData = {
      role,
      permissions: finalPermissions,
      updatedAt: new Date().toISOString(),
      updatedBy: updatedBy || 'super_admin'
    };

    await admin.firestore().collection('users').doc(uid).update(updateData);

    return NextResponse.json({
      success: true,
      user: {
        uid,
        role,
        permissions: finalPermissions,
        updatedAt: updateData.updatedAt
      },
      message: `User role updated to ${role === 'super_admin' ? 'Super Admin' : role === 'admin' ? 'Admin' : 'User'}`
    });

  } catch (error) {
    console.error('Error updating admin user:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update admin user' 
    }, { status: 500 });
  }
} 