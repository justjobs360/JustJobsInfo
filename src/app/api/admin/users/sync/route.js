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
    
    // Only super admins can sync users
    if (auth.role !== 'super_admin') {
      return NextResponse.json({ 
        success: false, 
        error: 'Only super admins can sync users' 
      }, { status: 403 });
    }
    
    console.log('🔄 Starting user sync from Firebase Auth to Firestore...');
    
    // Get all users from Firebase Auth
    const authService = admin.auth();
    const listUsersResult = await authService.listUsers();
    const authUsers = listUsersResult.users;
    
    console.log(`📊 Found ${authUsers.length} users in Firebase Auth`);
    
    const db = admin.firestore();
    const batch = db.batch();
    let syncedCount = 0;
    let createdCount = 0;
    let updatedCount = 0;
    
    for (const authUser of authUsers) {
      const userRef = db.collection('users').doc(authUser.uid);
      const userDoc = await userRef.get();
      
      if (userDoc.exists) {
        // User exists in Firestore, update only auth-related fields
        const updateData = {
          email: authUser.email,
          emailVerified: authUser.emailVerified,
          displayName: authUser.displayName || '',
          photoURL: authUser.photoURL || '',
          phoneNumber: authUser.phoneNumber || '',
          isActive: !authUser.disabled,
          lastSignInTime: authUser.metadata.lastSignInTime,
          updatedAt: new Date().toISOString(),
          syncedAt: new Date().toISOString()
        };
        
        batch.update(userRef, updateData);
        updatedCount++;
        console.log(`📝 Updated user: ${authUser.email}`);
      } else {
        // User doesn't exist in Firestore, create new document
        const userData = {
          uid: authUser.uid,
          email: authUser.email,
          emailVerified: authUser.emailVerified,
          displayName: authUser.displayName || '',
          photoURL: authUser.photoURL || '',
          phoneNumber: authUser.phoneNumber || '',
          role: 'user', // Default role for new users
          permissions: [], // Default empty permissions
          isActive: !authUser.disabled,
          authCreatedAt: authUser.metadata.creationTime,
          lastSignInTime: authUser.metadata.lastSignInTime,
          createdAt: new Date().toISOString(),
          createdBy: 'auth_sync',
          updatedAt: new Date().toISOString(),
          syncedAt: new Date().toISOString()
        };
        
        batch.set(userRef, userData);
        createdCount++;
        console.log(`➕ Created user: ${authUser.email}`);
      }
      
      syncedCount++;
    }
    
    // Commit all changes
    await batch.commit();
    
    console.log(`✅ User sync completed successfully!`);
    console.log(`📊 Results: ${syncedCount} total, ${createdCount} created, ${updatedCount} updated`);
    
    return NextResponse.json({
      success: true,
      message: 'User sync completed successfully',
      stats: {
        totalAuthUsers: authUsers.length,
        syncedCount,
        createdCount,
        updatedCount
      }
    });
    
  } catch (error) {
    console.error('❌ Error syncing users:', error);
    return NextResponse.json({ 
      success: false, 
      error: `Failed to sync users: ${error.message}` 
    }, { status: 500 });
  }
}
