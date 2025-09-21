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

export async function POST(request) {
  try {
    // Check admin authentication
    const auth = await requireAdmin(request);
    if (!auth.ok) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }
    
    // Only super admins can create other admins
    if (auth.role !== 'super_admin') {
      return NextResponse.json({ 
        success: false, 
        error: 'Only super admins can create other admins' 
      }, { status: 403 });
    }
    
    const body = await request.json();
    const { email, uid, role = 'admin', permissions = [] } = body;
    
    if (!email && !uid) {
      return NextResponse.json({ 
        success: false, 
        error: 'Either email or uid is required' 
      }, { status: 400 });
    }
    
    if (!role || !['admin', 'super_admin'].includes(role)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid role. Must be admin or super_admin' 
      }, { status: 400 });
    }
    
    let targetUid = uid;
    
    // If email is provided but no uid, try to find the user by email
    if (email && !uid) {
      try {
        const userRecord = await admin.auth().getUserByEmail(email);
        targetUid = userRecord.uid;
      } catch (error) {
        return NextResponse.json({ 
          success: false, 
          error: `User with email ${email} not found` 
        }, { status: 404 });
      }
    }
    
    // Check if user document already exists
    const existingUserDoc = await admin.firestore().collection('users').doc(targetUid).get();
    
    if (existingUserDoc.exists) {
      const existingData = existingUserDoc.data();
      if (existingData.role === 'admin' || existingData.role === 'super_admin') {
        return NextResponse.json({ 
          success: false, 
          error: 'User is already an admin' 
        }, { status: 409 });
      }
    }
    
    // Set permissions based on role
    const finalPermissions = role === 'super_admin' 
      ? ['view_dashboard', 'manage_seo', 'manage_content', 'manage_blog_posts', 'manage_admins', 'manage_users']
      : permissions;
    
    // Create or update user document
    const userData = {
      role,
      permissions: finalPermissions,
      email: email || (existingUserDoc.exists ? existingUserDoc.data().email : ''),
      createdAt: existingUserDoc.exists ? existingUserDoc.data().createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      updatedBy: auth.uid
    };
    
    await admin.firestore().collection('users').doc(targetUid).set(userData, { merge: true });
    
    return NextResponse.json({
      success: true,
      message: `User successfully promoted to ${role}`,
      user: {
        uid: targetUid,
        email: userData.email,
        role,
        permissions: finalPermissions
      }
    });
    
  } catch (error) {
    console.error('Error creating admin user:', error);
    return NextResponse.json({ 
      success: false, 
      error: `Failed to create admin user: ${error.message}` 
    }, { status: 500 });
  }
}
