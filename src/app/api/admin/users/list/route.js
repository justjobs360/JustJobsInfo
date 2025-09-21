import { NextResponse } from 'next/server';
import * as admin from 'firebase-admin';
import { requireAdmin } from '@/utils/adminAuth';

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  try {
    console.log('🔧 Initializing Firebase Admin SDK...');
    console.log('🔧 Project ID:', process.env.FIREBASE_PROJECT_ID);
    console.log('🔧 Client Email:', process.env.FIREBASE_CLIENT_EMAIL);
    console.log('🔧 Private Key exists:', !!process.env.FIREBASE_PRIVATE_KEY);
    console.log('🔧 Private Key length:', process.env.FIREBASE_PRIVATE_KEY?.length);
    
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    
    if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !privateKey) {
      throw new Error('Missing required Firebase Admin SDK environment variables');
    }
    
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey,
      }),
    });
    console.log('✅ Firebase Admin SDK initialized successfully');
  } catch (error) {
    console.error('❌ Firebase Admin initialization error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
  }
}

export async function GET(request) {
  try {
    // Check admin authentication
    const auth = await requireAdmin(request);
    if (!auth.ok) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }
    
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role'); // Optional filter by role
    const limit = parseInt(searchParams.get('limit')) || 100;
    const offset = parseInt(searchParams.get('offset')) || 0;

    let query = admin.firestore().collection('users');

    // Filter by role if specified
    if (role && role !== 'all') {
      query = query.where('role', '==', role);
    }

    // Get users with pagination - simplified approach
    let snapshot;
    
    try {
      snapshot = await query
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get();
    } catch (orderByError) {
      // If ordering fails (e.g., no createdAt field), try without it
      snapshot = await query
        .limit(limit)
        .get();
    }

    const users = [];
    snapshot.forEach((doc) => {
      try {
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
          isActive: userData.isActive !== false // Default to true if not set
        });
      } catch (docError) {
        console.error(`❌ Error processing document ${doc.id}:`, docError);
        // Continue processing other documents
      }
    });

    // For now, use the snapshot size as total count
    // In a production app, you might want to implement proper pagination
    const total = snapshot.size;

    return NextResponse.json({
      success: true,
      users,
      pagination: {
        total,
        limit,
        offset,
        hasMore: false // Simplified for now
      }
    });

  } catch (error) {
    console.error('❌ Error getting users:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      code: error.code
    });
    
    return NextResponse.json({ 
      success: false, 
      error: `Failed to get users: ${error.message}` 
    }, { status: 500 });
  }
} 