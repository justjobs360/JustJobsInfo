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

export async function DELETE(request) {
  try {
    // Check admin authentication
    const auth = await requireAdmin(request);
    if (!auth.ok) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }
    
    // Only super admins can delete users
    if (auth.role !== 'super_admin') {
      return NextResponse.json({ 
        success: false, 
        error: 'Only super admins can delete users' 
      }, { status: 403 });
    }
    
    const body = await request.json();
    const { uid } = body;
    
    if (!uid) {
      return NextResponse.json({ 
        success: false, 
        error: 'User UID is required' 
      }, { status: 400 });
    }
    
    // Don't allow deleting yourself
    if (uid === auth.uid) {
      return NextResponse.json({ 
        success: false, 
        error: 'You cannot delete your own account' 
      }, { status: 403 });
    }
    
    console.log(`🔄 Deleting user: ${uid}`);
    
    // Check if user exists in Firestore first
    const db = admin.firestore();
    const userDoc = await db.collection('users').doc(uid).get();
    
    if (!userDoc.exists) {
      return NextResponse.json({ 
        success: false, 
        error: 'User not found in database' 
      }, { status: 404 });
    }
    
    const userData = userDoc.data();
    
    // Don't allow deleting super admins
    if (userData.role === 'super_admin') {
      return NextResponse.json({ 
        success: false, 
        error: 'Cannot delete super admin accounts' 
      }, { status: 403 });
    }
    
    try {
      // Delete user from Firebase Auth
      await admin.auth().deleteUser(uid);
      console.log(`✅ Deleted user from Firebase Auth: ${uid}`);
    } catch (authError) {
      console.log(`⚠️ Could not delete from Firebase Auth: ${authError.message}`);
      // Continue with Firestore deletion even if Auth deletion fails
    }
    
    // Delete user document from Firestore
    await db.collection('users').doc(uid).delete();
    console.log(`✅ Deleted user from Firestore: ${uid}`);
    
    return NextResponse.json({
      success: true,
      message: `User "${userData.email}" has been permanently removed`,
      deletedUser: {
        uid,
        email: userData.email,
        role: userData.role
      }
    });
    
  } catch (error) {
    console.error('❌ Error deleting user:', error);
    return NextResponse.json({ 
      success: false, 
      error: `Failed to delete user: ${error.message}` 
    }, { status: 500 });
  }
}
