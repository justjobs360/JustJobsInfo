import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/config/firebase';

// User roles
export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin'
};

// Admin permissions - granular permissions for different admin functions
export const ADMIN_PERMISSIONS = {
    // Dashboard
    VIEW_DASHBOARD: 'view_dashboard',
    
    // SEO Management
    MANAGE_SEO: 'manage_seo',
    VIEW_SEO_ANALYTICS: 'view_seo_analytics',
    MANAGE_META_TAGS: 'manage_meta_tags',
    MANAGE_SITEMAP: 'manage_sitemap',
    MANAGE_ROBOTS_TXT: 'manage_robots_txt',
    
    // Content Management
    MANAGE_CONTENT: 'manage_content',
    MANAGE_BLOG_POSTS: 'manage_blog_posts',
    MANAGE_PAGES: 'manage_pages',
    MANAGE_FOOTER: 'manage_footer',
    
    // Analytics
    VIEW_ANALYTICS: 'view_analytics',
    
    // User Management
    MANAGE_USERS: 'manage_users'
};

// Default permissions for regular admins (SEO-focused)
export const DEFAULT_ADMIN_PERMISSIONS = [
    ADMIN_PERMISSIONS.VIEW_DASHBOARD,
    ADMIN_PERMISSIONS.MANAGE_SEO,
    ADMIN_PERMISSIONS.VIEW_SEO_ANALYTICS,
    ADMIN_PERMISSIONS.MANAGE_META_TAGS,
    ADMIN_PERMISSIONS.MANAGE_SITEMAP,
    ADMIN_PERMISSIONS.MANAGE_ROBOTS_TXT,
    ADMIN_PERMISSIONS.MANAGE_CONTENT,
    ADMIN_PERMISSIONS.MANAGE_BLOG_POSTS,
    ADMIN_PERMISSIONS.MANAGE_PAGES,
    ADMIN_PERMISSIONS.MANAGE_FOOTER,
    ADMIN_PERMISSIONS.VIEW_ANALYTICS
];

// Super admin has all permissions
export const SUPER_ADMIN_PERMISSIONS = [
    ...DEFAULT_ADMIN_PERMISSIONS,
    // Super admin specific permissions
    'manage_admins',
    ADMIN_PERMISSIONS.MANAGE_USERS
];

class UserRoleService {
  // Get user role and permissions
  static async getUserRole(userId) {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        return userDoc.data();
      }
      return { role: USER_ROLES.USER, permissions: [] };
    } catch (error) {
      console.error('Error getting user role:', error);
      return { role: USER_ROLES.USER, permissions: [] };
    }
  }

  // Set user role (super admin only)
  static async setUserRole(userId, role, permissions = []) {
    try {
      await setDoc(doc(db, 'users', userId), {
        role,
        permissions,
        updatedAt: new Date().toISOString(),
        updatedBy: 'super_admin' // Track who made the change
      }, { merge: true });
      return true;
    } catch (error) {
      console.error('Error setting user role:', error);
      return false;
    }
  }

  // Check if user is admin
  static async isAdmin(userId) {
    const userData = await this.getUserRole(userId);
    return userData.role === USER_ROLES.ADMIN || userData.role === USER_ROLES.SUPER_ADMIN;
  }

  // Check if user is super admin
  static async isSuperAdmin(userId) {
    const userData = await this.getUserRole(userId);
    return userData.role === USER_ROLES.SUPER_ADMIN;
  }

  // Check if user has specific permission
  static async hasPermission(userId, permission) {
    const userData = await this.getUserRole(userId);
    return userData.permissions.includes(permission);
  }

  // Get all admins (super admin only)
  static async getAllAdmins() {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('role', 'in', [USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN]));
      const querySnapshot = await getDocs(q);
      
      const admins = [];
      querySnapshot.forEach((doc) => {
        admins.push({
          id: doc.id,
          uid: doc.id, // Ensure uid is available for compatibility
          ...doc.data()
        });
      });
      
      return admins;
    } catch (error) {
      console.error('Error getting admins:', error);
      return [];
    }
  }

  // Create admin (super admin only)
  static async createAdmin(userId, email, permissions = DEFAULT_ADMIN_PERMISSIONS, role = USER_ROLES.ADMIN) {
    try {
      // Validate role
      if (role !== USER_ROLES.ADMIN && role !== USER_ROLES.SUPER_ADMIN) {
        console.error('Invalid role:', role);
        return false;
      }

      // Set permissions based on role
      const finalPermissions = role === USER_ROLES.SUPER_ADMIN 
        ? SUPER_ADMIN_PERMISSIONS 
        : permissions;

      await setDoc(doc(db, 'users', userId), {
        role,
        permissions: finalPermissions,
        email,
        createdAt: new Date().toISOString(),
        createdBy: 'super_admin',
        updatedAt: new Date().toISOString()
      });
      return true;
    } catch (error) {
      console.error('Error creating admin:', error);
      return false;
    }
  }

  // Update admin permissions (super admin only)
  static async updateAdminPermissions(userId, permissions) {
    try {
      await updateDoc(doc(db, 'users', userId), {
        permissions,
        updatedAt: new Date().toISOString(),
        updatedBy: 'super_admin'
      });
      return true;
    } catch (error) {
      console.error('Error updating admin permissions:', error);
      return false;
    }
  }

  // Update admin role (super admin only)
  static async updateAdminRole(userId, newRole) {
    try {
      // Validate role
      if (newRole !== USER_ROLES.ADMIN && newRole !== USER_ROLES.SUPER_ADMIN) {
        console.error('Invalid role:', newRole);
        return false;
      }

      // Set permissions based on new role
      const permissions = newRole === USER_ROLES.SUPER_ADMIN 
        ? SUPER_ADMIN_PERMISSIONS 
        : DEFAULT_ADMIN_PERMISSIONS;

      await updateDoc(doc(db, 'users', userId), {
        role: newRole,
        permissions,
        updatedAt: new Date().toISOString(),
        updatedBy: 'super_admin'
      });
      return true;
    } catch (error) {
      console.error('Error updating admin role:', error);
      return false;
    }
  }

  // Remove admin role (super admin only)
  static async removeAdminRole(userId) {
    try {
      await updateDoc(doc(db, 'users', userId), {
        role: USER_ROLES.USER,
        permissions: [],
        updatedAt: new Date().toISOString(),
        updatedBy: 'super_admin'
      });
      return true;
    } catch (error) {
      console.error('Error removing admin role:', error);
      return false;
    }
  }

  // Get all users (super admin only)
  static async getAllUsers() {
    try {
      const usersRef = collection(db, 'users');
      const querySnapshot = await getDocs(usersRef);
      
      const users = [];
      querySnapshot.forEach((doc) => {
        users.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return users;
    } catch (error) {
      console.error('Error getting users:', error);
      return [];
    }
  }
}

export default UserRoleService; 
