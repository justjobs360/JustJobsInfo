import { MongoClient, ObjectId } from 'mongodb';

let client = null;
let db = null;

// MongoDB connection configuration
const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = 'resumeCollection';
const BLOG_COLLECTION = 'Blogs';

// Connect to MongoDB
async function connectToMongoDB() {
  if (client) {
    console.log('🔌 Using existing MongoDB connection');
    return client;
  }

  try {
    console.log('🔌 Connecting to MongoDB for Blogs...');
    console.log('🔌 MongoDB URI:', MONGODB_URI ? 'Set' : 'Not set');
    console.log('🔌 Database name:', DB_NAME);
    console.log('🔌 Collection name:', BLOG_COLLECTION);
    
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not set');
    }
    
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    db = client.db(DB_NAME);
    console.log('✅ Connected to MongoDB successfully for Blogs');
    
    // Test the connection by listing collections
    const collections = await db.listCollections().toArray();
    console.log('📚 Available collections:', collections.map(c => c.name));
    
    return client;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    console.error('❌ Error details:', {
      message: error.message,
      code: error.code,
      name: error.name
    });
    throw error;
  }
}

// Get database instance
async function getDatabase() {
  if (!db) {
    await connectToMongoDB();
  }
  return db;
}

// Get blog collection instance
async function getBlogCollection() {
  const database = await getDatabase();
  return database.collection(BLOG_COLLECTION);
}

// Create a new blog post
async function createBlog(blogData) {
  try {
    const collection = await getBlogCollection();
    
    const blogDocument = {
      ...blogData,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'published', // draft, published, archived
      views: 0,
      likes: 0,
      comments: []
    };
    
    console.log('💾 Creating new blog post...');
    const result = await collection.insertOne(blogDocument);
    
    console.log(`✅ Blog post created successfully with ID: ${result.insertedId}`);
    return result.insertedId;
    
  } catch (error) {
    console.error('❌ Error creating blog post:', error);
    throw error;
  }
}

// Get all blog posts with pagination and search
async function getBlogs(page = 1, limit = 6, search = '', category = '', status = 'published') {
  try {
    console.log('🔍 Getting blogs with filters:', { page, limit, search, category, status });
    
    const collection = await getBlogCollection();
    console.log('✅ Collection obtained successfully');
    
    // Build filter
    const filter = {};
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }
    if (category) {
      filter.category = category;
    }
    if (status) {
      filter.status = status;
    }
    
    console.log('🔍 Applied filter:', filter);
    
    // Calculate skip value for pagination
    const skip = (page - 1) * limit;
    
    // Get total count for pagination
    const totalCount = await collection.countDocuments(filter);
    console.log('📊 Total documents found:', totalCount);
    
    // Get blogs with pagination
    const blogs = await collection
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
    
    console.log('📝 Retrieved blogs:', blogs.length);
    
    return {
      blogs,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasNextPage: page < Math.ceil(totalCount / limit),
        hasPrevPage: page > 1
      }
    };
    
  } catch (error) {
    console.error('❌ Error fetching blogs:', error);
    console.error('❌ Error stack:', error.stack);
    throw error;
  }
}

// Get blog post by slug
async function getBlogBySlug(slug) {
  try {
    const collection = await getBlogCollection();
    
    const blog = await collection.findOne({ slug });
    
    if (blog) {
      // Increment view count
      await collection.updateOne(
        { _id: blog._id },
        { $inc: { views: 1 } }
      );
    }
    
    return blog;
    
  } catch (error) {
    console.error('❌ Error fetching blog by slug:', error);
    throw error;
  }
}

// Get blog post by ID
async function getBlogById(id) {
  try {
    const collection = await getBlogCollection();
    
    // Convert string ID to ObjectId if needed
    const objectId = typeof id === 'string' ? new ObjectId(id) : id;
    
    const blog = await collection.findOne({ _id: objectId });
    return blog;
    
  } catch (error) {
    console.error('❌ Error fetching blog by ID:', error);
    throw error;
  }
}

// Update blog post
async function updateBlog(id, updateData) {
  try {
    const collection = await getBlogCollection();
    
    // Convert string ID to ObjectId if needed
    const objectId = typeof id === 'string' ? new ObjectId(id) : id;
    
    const result = await collection.updateOne(
      { _id: objectId },
      { 
        $set: {
          ...updateData,
          updatedAt: new Date()
        }
      }
    );
    
    return result.modifiedCount > 0;
    
  } catch (error) {
    console.error('❌ Error updating blog:', error);
    throw error;
  }
}

// Delete blog post
async function deleteBlog(id) {
  try {
    const collection = await getBlogCollection();
    
    // Convert string ID to ObjectId if needed
    const objectId = typeof id === 'string' ? new ObjectId(id) : id;
    
    const result = await collection.deleteOne({ _id: objectId });
    return result.deletedCount > 0;
    
  } catch (error) {
    console.error('❌ Error deleting blog:', error);
    throw error;
  }
}

// Get blog categories
async function getBlogCategories() {
  try {
    const collection = await getBlogCollection();
    
    const categories = await collection.distinct('category');
    return categories;
    
  } catch (error) {
    console.error('❌ Error fetching blog categories:', error);
    throw error;
  }
}

// Get recent blog posts
async function getRecentBlogs(limit = 3) {
  try {
    const collection = await getBlogCollection();
    
    const blogs = await collection
      .find({ status: 'published' })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();
    
    return blogs;
    
  } catch (error) {
    console.error('❌ Error fetching recent blogs:', error);
    throw error;
  }
}

// Add comment to blog
async function addComment(blogId, commentData) {
  try {
    const collection = await getBlogCollection();
    
    // Convert string ID to ObjectId if needed
    const objectId = typeof blogId === 'string' ? new ObjectId(blogId) : blogId;
    
    const comment = {
      ...commentData,
      id: Date.now(),
      createdAt: new Date(),
      _id: new ObjectId() // Generate a unique ID for the comment
    };
    
    const result = await collection.updateOne(
      { _id: objectId },
      { 
        $push: { comments: comment },
        $inc: { commentCount: 1 }
      }
    );
    
    return result.modifiedCount > 0;
    
  } catch (error) {
    console.error('❌ Error adding comment:', error);
    throw error;
  }
}

// Get comments for a specific blog
async function getBlogComments(blogId) {
  try {
    const collection = await getBlogCollection();
    
    // Convert string ID to ObjectId if needed
    const objectId = typeof blogId === 'string' ? new ObjectId(blogId) : blogId;
    
    const blog = await collection.findOne(
      { _id: objectId },
      { projection: { comments: 1 } }
    );
    
    return blog ? blog.comments || [] : [];
    
  } catch (error) {
    console.error('❌ Error fetching blog comments:', error);
    throw error;
  }
}

// Get blog statistics
async function getBlogStats() {
  try {
    const collection = await getBlogCollection();
    
    const stats = await collection.aggregate([
      {
        $group: {
          _id: null,
          totalBlogs: { $sum: 1 },
          totalViews: { $sum: '$views' },
          totalLikes: { $sum: '$likes' },
          publishedBlogs: {
            $sum: { $cond: [{ $eq: ['$status', 'published'] }, 1, 0] }
          }
        }
      }
    ]).toArray();
    
    return stats[0] || {
      totalBlogs: 0,
      totalViews: 0,
      totalLikes: 0,
      publishedBlogs: 0
    };
    
  } catch (error) {
    console.error('❌ Error fetching blog stats:', error);
    throw error;
  }
}

// Initialize blogs with default data
async function initializeBlogs() {
  try {
    const collection = await getBlogCollection();
    
    // Check if blogs already exist
    const existingBlogs = await collection.countDocuments();
    if (existingBlogs > 0) {
      console.log('📝 Blogs already exist, skipping initialization');
      return;
    }
    
    // Default blog data
    const defaultBlogs = [
      {
        slug: "Future-of-cloud-computing1",
        image: "01.webp",
        bannerImg: "/assets/images/blog/01.webp",
        category: "Business Solution",
        title: "Future of cloud computing",
        author: "David Smith",
        authorImg: "/assets/images/testimonials/01.png",
        publishedDate: "15 Jan, 2023",
        description: "Collaboratively pontificate bleeding edge resources with inexpensive methodologies globally initiate multidisciplinary compatible architectures pidiously repurpose leading edge growth strategies with just in time web readiness communicate timely meta services.",
        content: `
          <p>Collaboratively pontificate bleeding edge resources with inexpensive methodologies globally initiate multidisciplinary compatible architectures pidiously repurpose leading edge growth strategies with just in time web readiness communicate timely meta services.</p>
          
          <p>Onubia semper vel donec torquent fusce mauris felis aptent lacinia nisl, lectus himenaeos euismod molestie iaculis interdum in laoreet condimentum dictum, quisque quam risus sollicitudin gravida ut odio per a et. Gravida maecenas lobortis suscipit mus sociosqu convallis, mollis vestibulum donec aliquam risus sapien ridiculus, nulla sollicitudin eget in venenatis.</p>
          
          <div className="rts-quote-area text-center">
            <h5 className="title">
              "Placerat pretium tristique mattis tellus accuan metus dictumst vivamus odio nulla fusce auctor into suscipit habitasse class congue potenti iaculis"
            </h5>
            <a href="#" className="name">Daniel X. Horrar</a>
            <span>Author</span>
          </div>
          
          <p>Ultrices iaculis commodo parturient euismod pulvinar donec cum eget a, accumsan viverra cras praesent cubilia dignissim ad rhoncus. Gravida maecenas lobortis suscipit mus sociosqu convallis, mollis vestibulum donec aliquam risus sapien ridiculus, nulla sollicitudin eget in venenatis.</p>
        `,
        tags: ["Cloud Computing", "Technology", "Business"],
        status: "published",
        views: 0,
        likes: 0,
        comments: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        slug: "UX-review-presentations",
        image: "02.webp",
        bannerImg: "/assets/images/blog/02.webp",
        category: "Business Solution",
        title: "UX review presentations",
        author: "David Smith",
        authorImg: "/assets/images/testimonials/01.png",
        publishedDate: "15 Jan, 2023",
        description: "Collaboratively pontificate bleeding edge resources with inexpensive methodologies globally initiate multidisciplinary compatible architectures pidiously repurpose leading edge growth strategies with just in time web readiness communicate timely meta services.",
        content: `
          <p>Collaboratively pontificate bleeding edge resources with inexpensive methodologies globally initiate multidisciplinary compatible architectures pidiously repurpose leading edge growth strategies with just in time web readiness communicate timely meta services.</p>
          
          <p>Onubia semper vel donec torquent fusce mauris felis aptent lacinia nisl, lectus himenaeos euismod molestie iaculis interdum in laoreet condimentum dictum, quisque quam risus sollicitudin gravida ut odio per a et.</p>
        `,
        tags: ["UX Design", "Presentations", "Business"],
        status: "published",
        views: 0,
        likes: 0,
        comments: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        slug: "protecting-your-business",
        image: "03.webp",
        bannerImg: "/assets/images/blog/03.webp",
        category: "Business Solution",
        title: "Protecting your business",
        author: "David Smith",
        authorImg: "/assets/images/testimonials/01.png",
        publishedDate: "15 Jan, 2023",
        description: "Collaboratively pontificate bleeding edge resources with inexpensive methodologies globally initiate multidisciplinary compatible architectures pidiously repurpose leading edge growth strategies with just in time web readiness communicate timely meta services.",
        content: `
          <p>Collaboratively pontificate bleeding edge resources with inexpensive methodologies globally initiate multidisciplinary compatible architectures pidiously repurpose leading edge growth strategies with just in time web readiness communicate timely meta services.</p>
          
          <p>Onubia semper vel donec torquent fusce mauris felis aptent lacinia nisl, lectus himenaeos euismod molestie iaculis interdum in laoreet condimentum dictum, quisque quam risus sollicitudin gravida ut odio per a et.</p>
        `,
        tags: ["Security", "Business", "Protection"],
        status: "published",
        views: 0,
        likes: 0,
        comments: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        slug: "story-of-cloud-computing",
        image: "14.webp",
        bannerImg: "/assets/images/blog/14.webp",
        category: "Business Solution",
        title: "Story of cloud computing",
        author: "David Smith",
        authorImg: "/assets/images/testimonials/01.png",
        publishedDate: "15 Jan, 2023",
        description: "Collaboratively pontificate bleeding edge resources with inexpensive methodologies globally initiate multidisciplinary compatible architectures pidiously repurpose leading edge growth strategies with just in time web readiness communicate timely meta services.",
        content: `
          <p>Collaboratively pontificate bleeding edge resources with inexpensive methodologies globally initiate multidisciplinary compatible architectures pidiously repurpose leading edge growth strategies with just in time web readiness communicate timely meta services.</p>
          
          <p>Onubia semper vel donec torquent fusce mauris felis aptent lacinia nisl, lectus himenaeos euismod molestie iaculis interdum in laoreet condimentum dictum, quisque quam risus sollicitudin gravida ut odio per a et.</p>
        `,
        tags: ["Cloud Computing", "Technology", "Story"],
        status: "published",
        views: 0,
        likes: 0,
        comments: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        slug: "ui-ux-design-presentations",
        image: "15.webp",
        bannerImg: "/assets/images/blog/15.webp",
        category: "Business Solution",
        title: "UI/UX Design presentations",
        author: "David Smith",
        authorImg: "/assets/images/testimonials/01.png",
        publishedDate: "15 Jan, 2023",
        description: "Collaboratively pontificate bleeding edge resources with inexpensive methodologies globally initiate multidisciplinary compatible architectures pidiously repurpose leading edge growth strategies with just in time web readiness communicate timely meta services.",
        content: `
          <p>Collaboratively pontificate bleeding edge resources with inexpensive methodologies globally initiate multidisciplinary compatible architectures pidiously repurpose leading edge growth strategies with just in time web readiness communicate timely meta services.</p>
          
          <p>Onubia semper vel donec torquent fusce mauris felis aptent lacinia nisl, lectus himenaeos euismod molestie iaculis interdum in laoreet condimentum dictum, quisque quam risus sollicitudin gravida ut odio per a et.</p>
        `,
        tags: ["UI/UX", "Design", "Presentations"],
        status: "published",
        views: 0,
        likes: 0,
        comments: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        slug: "secure-your-Website",
        image: "16.webp",
        bannerImg: "/assets/images/blog/16.webp",
        category: "Business Solution",
        title: "Secure your Website",
        author: "David Smith",
        authorImg: "/assets/images/testimonials/01.png",
        publishedDate: "15 Jan, 2023",
        description: "Collaboratively pontificate bleeding edge resources with inexpensive methodologies globally initiate multidisciplinary compatible architectures pidiously repurpose leading edge growth strategies with just in time web readiness communicate timely meta services.",
        content: `
          <p>Collaboratively pontificate bleeding edge resources with inexpensive methodologies globally initiate multidisciplinary compatible architectures pidiously repurpose leading edge growth strategies with just in time web readiness communicate timely meta services.</p>
          
          <p>Onubia semper vel donec torquent fusce mauris felis aptent lacinia nisl, lectus himenaeos euismod molestie iaculis interdum in laoreet condimentum dictum, quisque quam risus sollicitudin gravida ut odio per a et.</p>
        `,
        tags: ["Security", "Website", "Protection"],
        status: "published",
        views: 0,
        likes: 0,
        comments: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    console.log('📝 Initializing blogs with default data...');
    const result = await collection.insertMany(defaultBlogs);
    
    console.log(`✅ ${result.insertedCount} default blogs created successfully`);
    return result.insertedIds;
    
  } catch (error) {
    console.error('❌ Error initializing blogs:', error);
    throw error;
  }
}

// Close MongoDB connection
async function closeConnection() {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log('🔌 MongoDB connection closed for Blogs');
  }
}

export {
  connectToMongoDB,
  getDatabase,
  getBlogCollection,
  createBlog,
  getBlogs,
  getBlogBySlug,
  getBlogById,
  updateBlog,
  deleteBlog,
  getBlogCategories,
  getRecentBlogs,
  addComment,
  getBlogComments,
  getBlogStats,
  initializeBlogs,
  closeConnection
}; 