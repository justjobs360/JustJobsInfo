import { NextResponse } from 'next/server';
import { getDatabase } from '@/utils/mongodb';
import { requireAdmin } from '@/utils/adminAuth';
import { ObjectId } from 'mongodb';

export async function GET(request, { params }) {
  try {
    // Check admin authentication
    const auth = await requireAdmin(request);
    if (!auth.ok) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const { id } = params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid author ID' 
      }, { status: 400 });
    }

    const db = await getDatabase();
    const authorsCollection = db.collection('authors');

    const author = await authorsCollection.findOne({ _id: new ObjectId(id) });

    if (!author) {
      return NextResponse.json({ 
        success: false, 
        error: 'Author not found' 
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: author
    });

  } catch (error) {
    console.error('Error fetching author:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch author' 
    }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    // Check admin authentication
    const auth = await requireAdmin(request);
    if (!auth.ok) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const { id } = params;
    const body = await request.json();
    const { name, email, bio, image, title, socialLinks, isActive } = body;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid author ID' 
      }, { status: 400 });
    }

    // Validation
    if (!name || !email) {
      return NextResponse.json({ 
        success: false, 
        error: 'Name and email are required' 
      }, { status: 400 });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid email format' 
      }, { status: 400 });
    }

    const db = await getDatabase();
    const authorsCollection = db.collection('authors');

    // Check if author exists
    const existingAuthor = await authorsCollection.findOne({ _id: new ObjectId(id) });
    if (!existingAuthor) {
      return NextResponse.json({ 
        success: false, 
        error: 'Author not found' 
      }, { status: 404 });
    }

    // Check if another author with this email exists (excluding current author)
    const duplicateAuthor = await authorsCollection.findOne({ 
      email: email.trim().toLowerCase(),
      _id: { $ne: new ObjectId(id) }
    });
    if (duplicateAuthor) {
      return NextResponse.json({ 
        success: false, 
        error: 'Another author with this email already exists' 
      }, { status: 400 });
    }

    // Update author
    const updateData = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      bio: bio?.trim() || '',
      image: image?.trim() || '',
      title: title?.trim() || '',
      socialLinks: socialLinks || {
        twitter: '',
        linkedin: '',
        website: '',
        github: ''
      },
      isActive: isActive !== undefined ? isActive : true,
      updatedAt: new Date(),
      updatedBy: auth.email
    };

    const result = await authorsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Author not found' 
      }, { status: 404 });
    }

    // Get updated author
    const updatedAuthor = await authorsCollection.findOne({ _id: new ObjectId(id) });

    return NextResponse.json({
      success: true,
      message: 'Author updated successfully',
      data: updatedAuthor
    });

  } catch (error) {
    console.error('Error updating author:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update author' 
    }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    // Check admin authentication
    const auth = await requireAdmin(request);
    if (!auth.ok) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const { id } = params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid author ID' 
      }, { status: 400 });
    }

    const db = await getDatabase();
    const authorsCollection = db.collection('authors');
    const blogsCollection = db.collection('blogs');

    // Check if author exists
    const existingAuthor = await authorsCollection.findOne({ _id: new ObjectId(id) });
    if (!existingAuthor) {
      return NextResponse.json({ 
        success: false, 
        error: 'Author not found' 
      }, { status: 404 });
    }

    // Check if author has any blog posts
    const blogCount = await blogsCollection.countDocuments({ authorId: id });
    if (blogCount > 0) {
      return NextResponse.json({ 
        success: false, 
        error: `Cannot delete author. They have ${blogCount} blog post(s) associated with them.` 
      }, { status: 400 });
    }

    // Delete author
    const result = await authorsCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Author not found' 
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Author deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting author:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to delete author' 
    }, { status: 500 });
  }
}
