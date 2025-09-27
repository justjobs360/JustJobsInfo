import { NextResponse } from 'next/server';
import { getDatabase } from '@/utils/mongodb';
import { requireAdmin } from '@/utils/adminAuth';

export async function GET(request) {
  try {
    // Check admin authentication
    const auth = await requireAdmin(request);
    if (!auth.ok) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 50;
    const search = searchParams.get('search') || '';
    const skip = (page - 1) * limit;

    const db = await getDatabase();
    const authorsCollection = db.collection('authors');

    // Build search query
    let query = {};
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { bio: { $regex: search, $options: 'i' } }
        ]
      };
    }

    // Get authors with pagination
    const authors = await authorsCollection
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    // Get total count
    const totalCount = await authorsCollection.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: {
        authors,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalCount,
          hasNextPage: page < Math.ceil(totalCount / limit),
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Error fetching authors:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch authors' 
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    // Check admin authentication
    const auth = await requireAdmin(request);
    if (!auth.ok) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    const { name, email, bio, image, title, socialLinks } = body;

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

    // Check if author with this email already exists
    const existingAuthor = await authorsCollection.findOne({ email });
    if (existingAuthor) {
      return NextResponse.json({ 
        success: false, 
        error: 'Author with this email already exists' 
      }, { status: 400 });
    }

    // Create author document
    const authorData = {
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
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: auth.email,
      updatedBy: auth.email
    };

    const result = await authorsCollection.insertOne(authorData);

    return NextResponse.json({
      success: true,
      message: 'Author created successfully',
      data: {
        id: result.insertedId,
        author: authorData
      }
    });

  } catch (error) {
    console.error('Error creating author:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create author' 
    }, { status: 500 });
  }
}
