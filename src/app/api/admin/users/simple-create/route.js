import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, uid, role = 'admin', permissions = [] } = body;
    
    if (!email && !uid) {
      return NextResponse.json({ 
        success: false, 
        error: 'Either email or UID is required' 
      }, { status: 400 });
    }
    
    if (!['admin', 'super_admin'].includes(role)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid role. Must be admin or super_admin' 
      }, { status: 400 });
    }
    
    // Mock response - in a real implementation, this would create the user in Firestore
    console.log(`Mock: Creating ${role} user with email: ${email || 'UID: ' + uid}`);
    
    // Set permissions based on role
    const finalPermissions = role === 'super_admin' 
      ? ['view_dashboard', 'manage_seo', 'manage_content', 'manage_blog_posts', 'manage_admins', 'manage_users']
      : permissions;
    
    return NextResponse.json({
      success: true,
      message: `User successfully promoted to ${role}`,
      user: {
        uid: uid || `mock-uid-${Date.now()}`,
        email: email || 'user@example.com',
        role: role,
        permissions: finalPermissions,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'admin_management',
        updatedBy: 'admin_management',
        isActive: true
      }
    });
    
  } catch (error) {
    console.error('Error creating admin user:', error);
    return NextResponse.json({ 
      success: false, 
      error: `Failed to create admin user: ${error.message}` 
    }, { status: 500 });
  }
}
