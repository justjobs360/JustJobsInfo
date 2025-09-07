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
    console.log('🔐 Firebase env present:', {
      projectId: !!process.env.FIREBASE_PROJECT_ID,
      clientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
      privateKeyLen: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.length : 0,
    });
  } catch (error) {
    console.error('❌ Firebase Admin initialization error:', error);
  }
}

// Template data structure - using templates from resume-builder
const DEFAULT_TEMPLATES = [
  {
    id: 1,
    name: 'Harvard Professional',
    category: 'Professional',
    description: 'A clean and professional template perfect for corporate roles',
    imageUrl: '/assets/resumes/templateone.webp',
    downloads: 1250,
    rating: 4.8,
    status: 'active',
    features: ['Clean design', 'ATS-friendly', 'Professional layout'],
    tags: ['modern', 'professional', 'clean', 'harvard', 'simple'],
    createdAt: '2024-01-15T10:00:00Z',
    lastUpdated: '2024-01-15T10:00:00Z'
  },
  {
    id: 2,
    name: 'Modern Creative',
    category: 'Creative',
    description: 'A modern and creative template for creative professionals',
    imageUrl: '/assets/resumes/templatetwo.png',
    downloads: 890,
    rating: 4.6,
    status: 'active',
    features: ['Modern design', 'Color accents', 'Creative layout'],
    tags: ['modern', 'creative', 'design', 'simple'],
    createdAt: '2024-01-10T10:00:00Z',
    lastUpdated: '2024-01-10T10:00:00Z'
  },
  {
    id: 3,
    name: 'Modern Two-Column',
    category: 'Modern',
    description: 'A minimalist template focusing on content and clarity',
    imageUrl: '/assets/resumes/templatethree.png',
    downloads: 567,
    rating: 4.9,
    status: 'active',
    features: ['Two-column layout', 'Sidebar design', 'Professional focus'],
    tags: ['modern', 'two-column', 'professional', 'sidebar', 'clean'],
    createdAt: '2024-01-20T10:00:00Z',
    lastUpdated: '2024-01-20T10:00:00Z'
  },
  {
    id: 4,
    name: 'Modern Blue Professional',
    category: 'Professional',
    description: 'A premium template for executive and senior positions',
    imageUrl: '/assets/resumes/templatefour.png',
    downloads: 234,
    rating: 4.7,
    status: 'active',
    features: ['Blue theme', 'Professional styling', 'Executive focus'],
    tags: ['modern', 'professional', 'blue', 'clean', 'tech', 'business'],
    createdAt: '2024-01-18T10:00:00Z',
    lastUpdated: '2024-01-18T10:00:00Z'
  },
  {
    id: 5,
    name: 'Professional Two-Column',
    category: 'Professional',
    description: 'A tech-focused template for IT and technology roles',
    imageUrl: '/assets/resumes/templatefive.png',
    downloads: 445,
    rating: 4.5,
    status: 'active',
    features: ['Two-column layout', 'Professional design', 'Clean structure'],
    tags: ['modern', 'professional', 'two-column', 'sidebar', 'business', 'clean'],
    createdAt: '2024-01-12T10:00:00Z',
    lastUpdated: '2024-01-12T10:00:00Z'
  },
  {
    id: 6,
    name: 'Modern Green Professional',
    category: 'Professional',
    description: 'An academic template perfect for research and education roles',
    imageUrl: '/assets/resumes/templatesix.png',
    downloads: 378,
    rating: 4.6,
    status: 'active',
    features: ['Green theme', 'Professional layout', 'Clean typography'],
    tags: ['modern', 'professional', 'green', 'clean', 'business', 'sans-serif'],
    createdAt: '2024-01-08T10:00:00Z',
    lastUpdated: '2024-01-08T10:00:00Z'
  },
  {
    id: 7,
    name: 'Modern Professional',
    category: 'Modern',
    description: 'A dynamic template for startup and entrepreneurial roles',
    imageUrl: '/assets/resumes/templateseven.png',
    downloads: 156,
    rating: 4.4,
    status: 'active',
    features: ['Modern design', 'Photo header', 'Professional styling'],
    tags: ['modern', 'professional', 'clean', 'photo', 'business', 'contemporary'],
    createdAt: '2024-01-22T10:00:00Z',
    lastUpdated: '2024-01-22T10:00:00Z'
  }
];

// Initialize templates in Firestore if they don't exist
async function initializeTemplates() {
  try {
    const db = admin.firestore();
    const templatesRef = db.collection('resumeTemplates');
    const templatesSnapshot = await templatesRef.get();

    if (templatesSnapshot.empty) {
      console.log('📝 Initializing default resume templates...');
      for (const template of DEFAULT_TEMPLATES) {
        const templateRef = db.collection('resumeTemplates').doc(template.id.toString());
        await templateRef.set({
          ...template,
          // Start actual metrics at zero; real values will accumulate via tracking endpoint
          downloadCount: 0,
          rating: undefined,
          tags: template.tags || [],
          createdAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString()
        });
      }
      console.log('✅ Default templates initialized');
    } else {
      console.log(`ℹ️ resumeTemplates already exists with ${templatesSnapshot.size} docs`);
    }
  } catch (error) {
    console.error('❌ Error initializing templates:', error);
  }
}

// GET /api/admin/resume-templates - Get all resume templates
export async function GET() {
  try {
    console.log('📋 Fetching resume templates...');

    // Initialize templates if needed
    await initializeTemplates();

    const db = admin.firestore();
    const templatesRef = db.collection('resumeTemplates');
    const templatesSnapshot = await templatesRef.get();

    const templates = [];
    templatesSnapshot.forEach((doc) => {
      const data = doc.data();
      templates.push({
        id: parseInt(doc.id),
        name: data.name,
        category: data.category,
        description: data.description,
        imageUrl: data.imageUrl,
        downloads: data.downloadCount || 0,
        // rating intentionally omitted from response until we implement real reviews
        status: data.status,
        features: data.features,
        tags: data.tags || [],
        createdAt: data.createdAt,
        lastUpdated: data.lastUpdated
      });
    });

    console.log('🧾 Firestore returned templates:', templates.map(t => ({ id: t.id, name: t.name, status: t.status, downloads: t.downloads })));

    // Sort by ID for consistent ordering
    templates.sort((a, b) => a.id - b.id);

    console.log(`✅ Found ${templates.length} resume templates`);
    return NextResponse.json({
      success: true,
      data: templates,
      total: templates.length
    });

  } catch (error) {
    console.error('❌ Error fetching resume templates:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/admin/resume-templates - Update template status
export async function POST(request) {
  try {
    const body = await request.json();
    const { id, status } = body;

    console.log(`🔄 Updating template ${id} status to ${status}...`);

    if (!id || !status) {
      return NextResponse.json(
        { success: false, error: 'Template ID and status are required' },
        { status: 400 }
      );
    }

    if (!['active', 'inactive', 'draft'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status. Must be active, inactive, or draft' },
        { status: 400 }
      );
    }

    const db = admin.firestore();
    const templateRef = db.collection('resumeTemplates').doc(id.toString());
    const templateDoc = await templateRef.get();

    if (!templateDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Template not found' },
        { status: 404 }
      );
    }

    await templateRef.update({
      status: status,
      lastUpdated: new Date().toISOString()
    });

    console.log(`✅ Template ${id} status updated to ${status}`);
    return NextResponse.json({
      success: true,
      message: `Template status updated to ${status}`
    });

  } catch (error) {
    console.error('❌ Error updating template status:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/admin/resume-templates - Update template fields (no creation)
export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, name, category, description, imageUrl, status, tags, features } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Template ID is required' },
        { status: 400 }
      );
    }

    const db = admin.firestore();
    const templateRef = db.collection('resumeTemplates').doc(id.toString());
    const templateDoc = await templateRef.get();

    if (!templateDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Template not found' },
        { status: 404 }
      );
    }

    const updatePayload = { lastUpdated: new Date().toISOString() };
    if (typeof name === 'string') updatePayload.name = name;
    if (typeof category === 'string') updatePayload.category = category;
    if (typeof description === 'string') updatePayload.description = description;
    if (typeof imageUrl === 'string') updatePayload.imageUrl = imageUrl;
    if (typeof status === 'string' && ['active', 'inactive', 'draft'].includes(status)) updatePayload.status = status;
    if (Array.isArray(tags)) updatePayload.tags = tags;
    if (Array.isArray(features)) updatePayload.features = features;

    await templateRef.update(updatePayload);

    console.log(`✏️ Updated template ${id}:`, Object.keys(updatePayload));
    return NextResponse.json({ success: true, message: 'Template updated' });
  } catch (error) {
    console.error('❌ Error updating template:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
