import { NextResponse } from 'next/server';
import * as admin from 'firebase-admin';

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
    console.log('✅ Firebase Admin SDK initialized successfully');
  } catch (error) {
    console.error('❌ Firebase Admin initialization error:', error);
  }
}

// POST /api/admin/resume-templates/download - Track template downloads
export async function POST(request) {
  try {
    const body = await request.json();
    const { templateId } = body;

    console.log(`📥 Tracking download for template ${templateId}...`);

    if (!templateId) {
      return NextResponse.json(
        { success: false, error: 'Template ID is required' },
        { status: 400 }
      );
    }

    const db = admin.firestore();
    const templateRef = db.collection('resumeTemplates').doc(templateId.toString());
    const templateDoc = await templateRef.get();

    if (!templateDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Template not found' },
        { status: 404 }
      );
    }

    // Increment download count
    await templateRef.update({
      downloadCount: admin.firestore.FieldValue.increment(1),
      lastUpdated: new Date().toISOString()
    });

    // Also increment total downloads in a summary document
    const summaryRef = db.collection('resumeTemplateStats').doc('summary');
    const summaryDoc = await summaryRef.get();

    if (summaryDoc.exists) {
      await summaryRef.update({
        totalDownloads: admin.firestore.FieldValue.increment(1),
        lastDownload: new Date().toISOString()
      });
    } else {
      // Determine actual number of templates for accurate stats
      const templatesSnapshot = await db.collection('resumeTemplates').get();
      await summaryRef.set({
        totalDownloads: 1,
        totalTemplates: templatesSnapshot.size || 0,
        lastDownload: new Date().toISOString(),
        createdAt: new Date().toISOString()
      });
    }

    console.log(`✅ Download tracked for template ${templateId}`);
    return NextResponse.json({
      success: true,
      message: 'Download tracked successfully'
    });

  } catch (error) {
    console.error('❌ Error tracking download:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// GET /api/admin/resume-templates/download - Get download statistics
export async function GET() {
  try {
    console.log('📊 Fetching download statistics...');

    const db = admin.firestore();
    const summaryRef = db.collection('resumeTemplateStats').doc('summary');
    const summaryDoc = await summaryRef.get();

    let stats = {
      totalDownloads: 0,
      totalTemplates: 7,
      lastDownload: null
    };

    if (summaryDoc.exists) {
      const data = summaryDoc.data();
      stats = {
        totalDownloads: data.totalDownloads || 0,
        totalTemplates: data.totalTemplates || 7,
        lastDownload: data.lastDownload
      };
    }

    console.log('✅ Download statistics retrieved');
    return NextResponse.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('❌ Error fetching download statistics:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
