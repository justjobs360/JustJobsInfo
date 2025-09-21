import { NextResponse } from 'next/server';
import * as admin from 'firebase-admin';
import { requireAdmin } from '@/utils/adminAuth';

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
  }
}

export async function PUT(request) {
  try {
    // Check admin authentication
    const auth = await requireAdmin(request);
    if (!auth.ok) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }
    
    // Only super admins can update admin users
    if (auth.role !== 'super_admin') {
      return NextResponse.json({ 
        success: false, 
        error: 'Only super admins can update admin users' 
      }, { status: 403 });
    }
    
    const body = await request.json();
    const { uid, role, permissions, updatedBy } = body;
    
    if (!uid) {
      return NextResponse.json({ 
        success: false, 
        error: 'User UID is required' 
      }, { status: 400 });
    }
    
    // Check if user document exists
    const userDoc = await admin.firestore().collection('users').doc(uid).get();
    
    if (!userDoc.exists) {
      return NextResponse.json({ 
        success: false, 
        error: 'User not found' 
      }, { status: 404 });
    }
    
    const existingData = userDoc.data();
    
    // Prepare update data
    const updateData = {
      updatedAt: new Date().toISOString(),
      updatedBy: updatedBy || auth.uid
    };
    
    // Update role if provided
    if (role && ['user', 'admin', 'super_admin'].includes(role)) {
      updateData.role = role;
      
      // Set permissions based on role
      if (role === 'super_admin') {
        updateData.permissions = ['view_dashboard', 'manage_seo', 'manage_content', 'manage_blog_posts', 'manage_admins', 'manage_users'];
      } else if (role === 'admin') {
        updateData.permissions = permissions || ['view_dashboard', 'manage_seo', 'manage_content', 'manage_blog_posts'];
      } else if (role === 'user') {
        updateData.permissions = [];
      }
    }
    
    // Update permissions if provided and role is admin
    if (permissions && Array.isArray(permissions) && existingData.role === 'admin') {
      updateData.permissions = permissions;
    }
    
    // Don't allow regular admins to update super admins
    if (existingData.role === 'super_admin' && auth.uid !== uid) {
      return NextResponse.json({ 
        success: false, 
        error: 'Cannot modify super admin accounts' 
      }, { status: 403 });
    }
    
    // Update the user document
    await admin.firestore().collection('users').doc(uid).update(updateData);
    
    // Get updated user data
    const updatedUserDoc = await admin.firestore().collection('users').doc(uid).get();
    const updatedUserData = updatedUserDoc.data();
    
    return NextResponse.json({
      success: true,
      message: `User successfully updated`,
      user: {
        uid,
        email: updatedUserData.email,
        role: updatedUserData.role,
        permissions: updatedUserData.permissions,
        updatedAt: updatedUserData.updatedAt,
        updatedBy: updatedUserData.updatedBy
      }
    });
    
  } catch (error) {
    console.error('Error updating admin user:', error);
    return NextResponse.json({ 
      success: false, 
      error: `Failed to update admin user: ${error.message}` 
    }, { status: 500 });
  }
}
