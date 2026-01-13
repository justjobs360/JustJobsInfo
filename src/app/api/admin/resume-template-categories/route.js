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

// Default categories to initialize
const DEFAULT_CATEGORIES = [
  { name: 'Free', description: 'Free templates available to all users' },
  { name: 'Simple', description: 'Simple and clean template designs' },
  { name: 'Modern', description: 'Modern and contemporary template styles' },
  { name: 'Premium', description: 'Premium templates with advanced features' },
  { name: 'Professional', description: 'Professional templates for corporate roles' },
  { name: 'Creative', description: 'Creative templates for design professionals' },
  { name: 'Executive', description: 'Executive-level templates for senior positions' },
  { name: 'Enterprise', description: 'Enterprise-grade templates with premium features' }
];

// Initialize default categories
async function initializeCategories(db) {
  try {
    const categoriesRef = db.collection('resumeTemplateCategories');
    const categoriesSnapshot = await categoriesRef.get();

    if (categoriesSnapshot.empty) {
      console.log('📝 Initializing default resume template categories...');
      for (const category of DEFAULT_CATEGORIES) {
        const slug = category.name
          .toLowerCase()
          .trim()
          .replace(/[^\w\s-]/g, '')
          .replace(/[\s_-]+/g, '-')
          .replace(/^-+|-+$/g, '');

        const now = new Date().toISOString();
        await categoriesRef.add({
          name: category.name,
          slug,
          description: category.description,
          templateCount: 0,
          status: 'active',
          createdAt: now,
          lastUpdated: now
        });
      }
      console.log('✅ Default categories initialized');
    } else {
      // Check for missing categories and add them
      const existingNames = new Set();
      categoriesSnapshot.forEach(doc => {
        existingNames.add(doc.data().name);
      });

      const missingCategories = DEFAULT_CATEGORIES.filter(cat => !existingNames.has(cat.name));

      if (missingCategories.length > 0) {
        console.log(`📝 Adding ${missingCategories.length} missing categories...`);
        for (const category of missingCategories) {
          const slug = category.name
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');

          const now = new Date().toISOString();
          await categoriesRef.add({
            name: category.name,
            slug,
            description: category.description,
            templateCount: 0,
            status: 'active',
            createdAt: now,
            lastUpdated: now
          });
        }
        console.log('✅ Missing categories added');
      }
    }
  } catch (error) {
    console.error('❌ Error initializing categories:', error);
  }
}

// GET /api/admin/resume-template-categories - Get all categories
export async function GET() {
  try {
    const db = admin.firestore();
    
    // Initialize categories if needed
    await initializeCategories(db);
    
    const categoriesRef = db.collection('resumeTemplateCategories');
    const categoriesSnapshot = await categoriesRef.get();

    const categories = [];
    categoriesSnapshot.forEach((doc) => {
      const data = doc.data();
      categories.push({
        id: doc.id,
        name: data.name,
        slug: data.slug,
        description: data.description || '',
        templateCount: data.templateCount || 0,
        status: data.status || 'active',
        createdAt: data.createdAt,
        lastUpdated: data.lastUpdated
      });
    });

    // Sort by name
    categories.sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json({
      success: true,
      data: categories,
      total: categories.length
    });

  } catch (error) {
    console.error('❌ Error fetching resume template categories:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/admin/resume-template-categories - Create a new category
export async function POST(request) {
  try {
    const body = await request.json();
    const { name, description } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Category name is required' },
        { status: 400 }
      );
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const db = admin.firestore();
    const categoriesRef = db.collection('resumeTemplateCategories');

    // Check if category with same name or slug already exists
    const existingSnapshot = await categoriesRef
      .where('slug', '==', slug)
      .get();

    if (!existingSnapshot.empty) {
      return NextResponse.json(
        { success: false, error: 'A category with this name already exists' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const categoryData = {
      name: name.trim(),
      slug,
      description: description?.trim() || '',
      templateCount: 0,
      status: 'active',
      createdAt: now,
      lastUpdated: now
    };

    const docRef = await categoriesRef.add(categoryData);

    console.log(`✅ Created resume template category: ${name} (${docRef.id})`);
    return NextResponse.json({
      success: true,
      data: {
        id: docRef.id,
        ...categoryData
      }
    });

  } catch (error) {
    console.error('❌ Error creating resume template category:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/admin/resume-template-categories - Update a category
export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, name, description, status } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Category ID is required' },
        { status: 400 }
      );
    }

    const db = admin.firestore();
    const categoryRef = db.collection('resumeTemplateCategories').doc(id);
    const categoryDoc = await categoryRef.get();

    if (!categoryDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }

    const updatePayload = { lastUpdated: new Date().toISOString() };

    if (typeof name === 'string' && name.trim().length > 0) {
      const newSlug = name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');

      // Check if another category has this slug
      const existingSnapshot = await db.collection('resumeTemplateCategories')
        .where('slug', '==', newSlug)
        .get();

      const hasConflict = existingSnapshot.docs.some(doc => doc.id !== id);
      if (hasConflict) {
        return NextResponse.json(
          { success: false, error: 'A category with this name already exists' },
          { status: 400 }
        );
      }

      updatePayload.name = name.trim();
      updatePayload.slug = newSlug;
    }

    if (typeof description === 'string') {
      updatePayload.description = description.trim();
    }

    if (typeof status === 'string' && ['active', 'inactive'].includes(status)) {
      updatePayload.status = status;
    }

    await categoryRef.update(updatePayload);

    console.log(`✏️ Updated resume template category ${id}`);
    return NextResponse.json({ success: true, message: 'Category updated' });

  } catch (error) {
    console.error('❌ Error updating resume template category:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/resume-template-categories - Delete a category
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Category ID is required' },
        { status: 400 }
      );
    }

    const db = admin.firestore();
    const categoryRef = db.collection('resumeTemplateCategories').doc(id);
    const categoryDoc = await categoryRef.get();

    if (!categoryDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }

    // Check if any templates are using this category
    const templatesSnapshot = await db.collection('resumeTemplates')
      .where('category', '==', categoryDoc.data().name)
      .get();

    if (!templatesSnapshot.empty) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Cannot delete category. ${templatesSnapshot.size} template(s) are using this category. Please reassign them first.` 
        },
        { status: 400 }
      );
    }

    await categoryRef.delete();

    console.log(`🗑️ Deleted resume template category ${id}`);
    return NextResponse.json({ success: true, message: 'Category deleted' });

  } catch (error) {
    console.error('❌ Error deleting resume template category:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
