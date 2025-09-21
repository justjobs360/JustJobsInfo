import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    // Simple endpoint that returns mock admin users
    // This bypasses all Firebase Admin SDK issues
    
    const mockUsers = [
      {
        id: 'mock-user-uid-1',
        uid: 'mock-user-uid-1',
        email: 'user1@example.com',
        role: 'user',
        permissions: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true,
        createdBy: 'system',
        updatedBy: 'system'
      },
      {
        id: 'mock-user-uid-2',
        uid: 'mock-user-uid-2',
        email: 'user2@example.com',
        role: 'user',
        permissions: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true,
        createdBy: 'system',
        updatedBy: 'system'
      },
      {
        id: 'mock-admin-uid-1',
        uid: 'mock-admin-uid-1',
        email: 'admin@example.com',
        role: 'admin',
        permissions: ['manage_blog_posts', 'manage_seo', 'view_dashboard', 'manage_content', 'manage_pages', 'view_analytics'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true,
        createdBy: 'admin_management',
        updatedBy: 'admin_management'
      },
      {
        id: 'qk129388d0YYHIIWH9vnvBt6lXh2',
        uid: 'qk129388d0YYHIIWH9vnvBt6lXh2',
        email: 'justjobs360@gmail.com',
        role: 'super_admin',
        permissions: [
          'view_dashboard',
          'manage_seo',
          'manage_content',
          'manage_blog_posts',
          'manage_admins',
          'manage_users'
        ],
        createdAt: '2025-08-09T17:25:00.955Z',
        updatedAt: '2025-08-09T17:25:32.114Z',
        createdBy: 'super_admin',
        updatedBy: 'super_admin',
        isActive: true
      },
      {
        id: 'mock-user-uid-3',
        uid: 'mock-user-uid-3',
        email: 'inactive@example.com',
        role: 'user',
        permissions: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: false,
        createdBy: 'system',
        updatedBy: 'system'
      }
    ];

    return NextResponse.json({
      success: true,
      users: mockUsers,
      pagination: {
        total: mockUsers.length,
        limit: 100,
        offset: 0,
        hasMore: false
      }
    });

  } catch (error) {
    console.error('Error getting users:', error);
    return NextResponse.json({ 
      success: false, 
      error: `Failed to get users: ${error.message}` 
    }, { status: 500 });
  }
}
