// Admin management service for API calls
class AdminService {
  // Promote an existing user to admin
  static async createAdmin(userData) {
    try {
      const response = await fetch('/api/admin/users/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to promote user to admin');
      }

      return result;
    } catch (error) {
      console.error('Error promoting user to admin:', error);
      throw error;
    }
  }

  // Update admin user
  static async updateAdmin(uid, updateData) {
    try {
      const response = await fetch('/api/admin/users/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ uid, ...updateData }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to update admin');
      }

      return result;
    } catch (error) {
      console.error('Error updating admin:', error);
      throw error;
    }
  }

  // Get all users with optional filtering
  static async getUsers(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filters.role) params.append('role', filters.role);
      if (filters.limit) params.append('limit', filters.limit);
      if (filters.offset) params.append('offset', filters.offset);

      const url = `/api/admin/users/list?${params.toString()}`;
      console.log('🔍 Fetching users from:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('📊 Response status:', response.status);

      const result = await response.json();
      console.log('📋 Response data:', result);
      
      if (!response.ok) {
        throw new Error(result.error || `HTTP ${response.status}: Failed to get users`);
      }

      return result;
    } catch (error) {
      console.error('❌ Error getting users:', error);
      throw error;
    }
  }

  // Get admin users only
  static async getAdmins() {
    return this.getUsers({ role: 'admin' });
  }

  // Get super admin users only
  static async getSuperAdmins() {
    return this.getUsers({ role: 'super_admin' });
  }

  // Get all admin users (both admin and super_admin)
  static async getAllAdmins() {
    try {
      const [adminsResponse, superAdminsResponse] = await Promise.all([
        this.getUsers({ role: 'admin' }),
        this.getUsers({ role: 'super_admin' })
      ]);

      return {
        success: true,
        users: [...adminsResponse.users, ...superAdminsResponse.users],
        pagination: {
          total: adminsResponse.pagination.total + superAdminsResponse.pagination.total,
          limit: adminsResponse.pagination.limit,
          offset: adminsResponse.pagination.offset,
          hasMore: adminsResponse.pagination.hasMore || superAdminsResponse.pagination.hasMore
        }
      };
    } catch (error) {
      console.error('Error getting all admins:', error);
      throw error;
    }
  }
}

export default AdminService; 