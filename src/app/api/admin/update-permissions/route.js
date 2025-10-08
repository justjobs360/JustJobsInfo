import { NextResponse } from 'next/server';
import { requireAdmin } from '@/utils/adminAuth';
import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = 'justjobsdata';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

let client;
let clientPromise;

if (process.env.NODE_ENV === 'development') {
  if (!global._updatePermissionsMongoClientPromise) {
    client = new MongoClient(MONGODB_URI);
    global._updatePermissionsMongoClientPromise = client.connect();
  }
  clientPromise = global._updatePermissionsMongoClientPromise;
} else {
  client = new MongoClient(MONGODB_URI);
  clientPromise = client.connect();
}

// POST - Update admin permissions to include MANAGE_FOOTER
export async function POST(request) {
  try {
    const authResult = await requireAdmin(request);
    if (!authResult.ok) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    // Only super admins can update permissions
    if (authResult.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Only super admins can update permissions' },
        { status: 403 }
      );
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const usersCollection = db.collection('users');

    // Update all admin users to include MANAGE_FOOTER permission
    const result = await usersCollection.updateMany(
      {
        role: { $in: ['admin', 'super_admin'] },
        permissions: { $exists: true }
      },
      {
        $addToSet: {
          permissions: 'manage_footer'
        },
        $set: {
          updatedAt: new Date().toISOString(),
          updatedBy: 'system'
        }
      }
    );

    return NextResponse.json({
      success: true,
      message: `Updated ${result.modifiedCount} admin users with MANAGE_FOOTER permission`,
      modifiedCount: result.modifiedCount
    });

  } catch (error) {
    console.error('Error updating permissions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
