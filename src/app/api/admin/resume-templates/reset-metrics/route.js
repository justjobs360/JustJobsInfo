import { NextResponse } from 'next/server';
import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
    console.log('✅ Firebase Admin SDK initialized (reset-metrics)');
  } catch (error) {
    console.error('❌ Firebase Admin initialization error:', error);
  }
}

// POST /api/admin/resume-templates/reset-metrics
// One-time migration: set downloadCount=0 and remove rating from all templates
export async function POST() {
  try {
    const db = admin.firestore();
    const snap = await db.collection('resumeTemplates').get();
    let updated = 0;
    for (const doc of snap.docs) {
      const data = doc.data();
      const updates = { lastUpdated: new Date().toISOString() };
      updates.downloadCount = 0;
      if (Object.prototype.hasOwnProperty.call(data, 'rating')) {
        updates.rating = admin.firestore.FieldValue.delete();
      }
      await doc.ref.update(updates);
      updated += 1;
    }
    return NextResponse.json({ success: true, updated });
  } catch (error) {
    console.error('❌ Error resetting template metrics:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}


