import { NextResponse } from 'next/server';

export async function PUT(request) {
  try {
    const body = await request.json();
    const { uid, role, permissions, updatedBy } = body;
    
    if (!uid) {
      return NextResponse.json({ 
        success: false, 
        error: 'User UID is required' 
      }, { status: 400 });
    }
    
    // Mock response - in a real implementation, this would update the user in Firestore
    console.log(`Mock: Updating user ${uid} to role: ${role || 'user'} with permissions:`, permissions);
    
    if (role === 'user') {
      return NextResponse.json({
        success: true,
        message: 'User successfully demoted to regular user',
        user: {
          uid,
          email: 'user@example.com',
          role: 'user',
          permissions: [],
          updatedAt: new Date().toISOString(),
          updatedBy: updatedBy || 'admin_management'
        }
      });
    } else {
      // Set permissions based on role and provided permissions
      let finalPermissions;
      if (role === 'super_admin') {
        finalPermissions = ['view_dashboard', 'manage_seo', 'manage_content', 'manage_blog_posts', 'manage_admins', 'manage_users'];
      } else {
        finalPermissions = permissions || ['view_dashboard', 'manage_seo', 'manage_content', 'manage_blog_posts'];
      }
      
      return NextResponse.json({
        success: true,
        message: `User successfully updated to ${role}`,
        user: {
          uid,
          email: 'admin@example.com',
          role: role,
          permissions: finalPermissions,
          updatedAt: new Date().toISOString(),
          updatedBy: updatedBy || 'admin_management'
        }
      });
    }
    
  } catch (error) {
    console.error('Error updating admin user:', error);
    return NextResponse.json({ 
      success: false, 
      error: `Failed to update admin user: ${error.message}` 
    }, { status: 500 });
  }
}
