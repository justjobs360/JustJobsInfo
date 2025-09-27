"use client";
import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAuth } from '@/contexts/AuthContext';
import { USER_ROLES, ADMIN_PERMISSIONS } from '@/utils/userRoleService';
import toast from 'react-hot-toast';
import '../admin.css';

export default function UserManagementPage() {
    const { hasPermission, isSuperAdmin, user } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [operationLoading, setOperationLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [dataSource, setDataSource] = useState(null);
    const [syncing, setSyncing] = useState(false);

    const loadUsers = useCallback(async () => {
        try {
            setLoading(true);
            
            // Get the current user's ID token for authentication
            if (!user) {
                toast.error('User not authenticated');
                return;
            }
            
            const idToken = await user.getIdToken();
            
            const response = await fetch('/api/admin/users/hybrid-list', {
                headers: {
                    'Authorization': `Bearer ${idToken}`,
                    'Content-Type': 'application/json'
                }
            });
            const result = await response.json();
            
            if (result.success) {
                setUsers(result.users || []);
                setDataSource(result.source || 'unknown');
            } else {
                toast.error(`Failed to load users: ${result.error}`);
                setUsers([]);
            }
        } catch (error) {
            console.error('Error loading users:', error);
            toast.error('Failed to load users');
            setUsers([]);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    const handleUpdateUserRole = async (userId, newRole) => {
        if (!confirm(`Are you sure you want to change this user's role to ${newRole === 'super_admin' ? 'Super Admin' : newRole === 'admin' ? 'Admin' : 'User'}?`)) {
            return;
        }

        setOperationLoading(true);
        try {
            const idToken = await user.getIdToken();
            const response = await fetch('/api/admin/users/simple-update', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${idToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    uid: userId,
                    role: newRole,
                    updatedBy: 'admin'
                })
            });

            const result = await response.json();
            
            if (result.success) {
                toast.success(result.message);
                await loadUsers(); // Refresh the list
            } else {
                toast.error(`Failed to update user role: ${result.error}`);
            }
        } catch (error) {
            console.error('Error updating user role:', error);
            toast.error('Failed to update user role');
        } finally {
            setOperationLoading(false);
        }
    };

    const handleRevokeAccess = async (userId) => {
        if (!confirm('Are you sure you want to revoke this user\'s access? This will remove their admin privileges.')) {
            return;
        }

        setOperationLoading(true);
        try {
            const idToken = await user.getIdToken();
            const response = await fetch('/api/admin/users/simple-update', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${idToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    uid: userId,
                    role: 'user',
                    updatedBy: 'admin'
                })
            });

            const result = await response.json();
            
            if (result.success) {
                toast.success('User access revoked successfully');
                await loadUsers(); // Refresh the list
            } else {
                toast.error(`Failed to revoke access: ${result.error}`);
            }
        } catch (error) {
            console.error('Error revoking access:', error);
            toast.error('Failed to revoke access');
        } finally {
            setOperationLoading(false);
        }
    };

    const handleSyncUsers = async () => {
        try {
            setSyncing(true);
            console.log('🔄 Syncing users from Firebase Auth to Firestore...');
            
            if (!user) {
                toast.error('User not authenticated');
                return;
            }
            
            const idToken = await user.getIdToken(true);
            
            const response = await fetch('/api/admin/users/sync', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${idToken}`,
                    'Content-Type': 'application/json'
                }
            });
            
            const result = await response.json();
            
            if (result.success) {
                toast.success(`Sync completed: ${result.stats.createdCount} created, ${result.stats.updatedCount} updated`);
                await loadUsers(); // Refresh the user list
            } else {
                toast.error(`Sync failed: ${result.error}`);
            }
        } catch (error) {
            console.error('Error syncing users:', error);
            toast.error(`Failed to sync users: ${error.message}`);
        } finally {
            setSyncing(false);
        }
    };

    const handleRemoveUser = async (userId, userEmail) => {
        if (!confirm(`Are you sure you want to permanently remove user "${userEmail}"? This action cannot be undone.`)) {
            return;
        }

        setOperationLoading(true);
        try {
            console.log('🔄 Removing user...');
            
            if (!user) {
                toast.error('User not authenticated');
                return;
            }
            
            const idToken = await user.getIdToken(true);
            
            const response = await fetch('/api/admin/users/delete', {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${idToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ uid: userId })
            });
            
            const result = await response.json();
            
            if (result.success) {
                toast.success(`User "${userEmail}" removed successfully`);
                await loadUsers(); // Refresh the user list
            } else {
                toast.error(`Failed to remove user: ${result.error}`);
            }
        } catch (error) {
            console.error('Error removing user:', error);
            toast.error(`Failed to remove user: ${error.message}`);
        } finally {
            setOperationLoading(false);
        }
    };

    // Filter users based on search term, role, and status
    const filteredUsers = users.filter(user => {
        const matchesSearch = !searchTerm || 
            user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.uid?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        const matchesStatus = statusFilter === 'all' || 
            (statusFilter === 'active' && user.isActive !== false) ||
            (statusFilter === 'inactive' && user.isActive === false);

        return matchesSearch && matchesRole && matchesStatus;
    });

    // Get user statistics
    const stats = {
        total: users.length,
        admins: users.filter(u => u.role === 'admin').length,
        superAdmins: users.filter(u => u.role === 'super_admin').length,
        regularUsers: users.filter(u => u.role === 'user').length,
        active: users.filter(u => u.isActive !== false).length,
        inactive: users.filter(u => u.isActive === false).length
    };

    if (!isSuperAdmin()) {
        return (
            <AdminLayout>
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <h2 style={{ color: 'var(--color-danger)' }}>Access Denied</h2>
                    <p>Only super admins can manage users.</p>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="admin-dashboard">
                <div className="dashboard-header">
                    <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--color-heading-1)', margin: '0 0 8px 0' }}>
                        User Management
                    </h1>
                    <p style={{ fontSize: '16px', color: 'var(--color-body)', margin: 0 }}>
                        View and manage all registered users
                    </p>
                </div>

                {/* Statistics */}
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                    gap: '20px', 
                    marginBottom: '30px' 
                }}>
                    <div className="activity-card">
                        <div style={{ padding: '20px', textAlign: 'center' }}>
                            <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--color-primary)', margin: '0 0 8px 0' }}>
                                {stats.total}
                            </h3>
                            <p style={{ fontSize: '14px', color: 'var(--color-body)', margin: 0 }}>Total Users</p>
                        </div>
                    </div>
                    <div className="activity-card">
                        <div style={{ padding: '20px', textAlign: 'center' }}>
                            <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--color-success)', margin: '0 0 8px 0' }}>
                                {stats.regularUsers}
                            </h3>
                            <p style={{ fontSize: '14px', color: 'var(--color-body)', margin: 0 }}>Regular Users</p>
                        </div>
                    </div>
                    <div className="activity-card">
                        <div style={{ padding: '20px', textAlign: 'center' }}>
                            <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--color-warning)', margin: '0 0 8px 0' }}>
                                {stats.admins}
                            </h3>
                            <p style={{ fontSize: '14px', color: 'var(--color-body)', margin: 0 }}>Admin Users</p>
                        </div>
                    </div>
                    <div className="activity-card">
                        <div style={{ padding: '20px', textAlign: 'center' }}>
                            <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc3545', margin: '0 0 8px 0' }}>
                                {stats.superAdmins}
                            </h3>
                            <p style={{ fontSize: '14px', color: 'var(--color-body)', margin: 0 }}>Super Admin Users</p>
                        </div>
                    </div>
                </div>

                {/* Search and Filter */}
                <div style={{ 
                    display: 'flex', 
                    gap: '16px', 
                    marginBottom: '20px',
                    flexWrap: 'wrap',
                    alignItems: 'center'
                }}>
                    <input
                        type="text"
                        placeholder="Search by email or UID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            padding: '8px 12px',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            fontSize: '14px',
                            minWidth: '200px'
                        }}
                    />
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        style={{
                            padding: '8px 12px',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            fontSize: '14px'
                        }}
                    >
                        <option value="all">All Roles</option>
                        <option value="user">Regular Users</option>
                        <option value="admin">Admin Users</option>
                        <option value="super_admin">Super Admin Users</option>
                    </select>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        style={{
                            padding: '8px 12px',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            fontSize: '14px'
                        }}
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                    <button
                        onClick={loadUsers}
                        disabled={loading}
                        style={{
                            padding: '6px 12px',
                            backgroundColor: 'transparent',
                            color: 'var(--color-primary)',
                            border: '1px solid var(--color-primary)',
                            borderRadius: '4px',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            fontSize: '12px',
                            fontWeight: '500',
                            opacity: loading ? 0.7 : 1,
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                            if (!loading) {
                                e.target.style.backgroundColor = 'var(--color-primary)';
                                e.target.style.color = '#fff';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!loading) {
                                e.target.style.backgroundColor = 'transparent';
                                e.target.style.color = 'var(--color-primary)';
                            }
                        }}
                    >
                        {loading ? 'Loading...' : 'Refresh'}
                    </button>
                    <button
                        onClick={handleSyncUsers}
                        disabled={syncing || loading}
                        style={{
                            padding: '6px 12px',
                            backgroundColor: 'transparent',
                            color: '#28a745',
                            border: '1px solid #28a745',
                            borderRadius: '4px',
                            cursor: syncing ? 'not-allowed' : 'pointer',
                            fontSize: '12px',
                            fontWeight: '500',
                            opacity: syncing ? 0.7 : 1,
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                            if (!syncing) {
                                e.target.style.backgroundColor = '#28a745';
                                e.target.style.color = '#fff';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!syncing) {
                                e.target.style.backgroundColor = 'transparent';
                                e.target.style.color = '#28a745';
                            }
                        }}
                    >
                        {syncing ? 'Syncing...' : 'Sync'}
                    </button>
                </div>

                {/* Users List */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                        <div className="loading-spinner"></div>
                        <p style={{ marginTop: '16px' }}>Loading users...</p>
                    </div>
                ) : (
                    <div className="activity-card">
                        <div style={{ padding: '24px' }}>
                            <div style={{ marginBottom: '20px' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: '500', color: 'var(--color-heading-1)', margin: '0 0 16px 0' }}>
                                    Users ({filteredUsers.length} of {users.length})
                                </h3>
                                {searchTerm && (
                                    <p style={{ fontSize: '14px', color: 'var(--color-body)', margin: '0 0 8px 0' }}>
                                        Filtered by: &quot;{searchTerm}&quot;
                                    </p>
                                )}
                            </div>
                            
                            <div className="activity-list">
                                {filteredUsers.length > 0 ? (
                                    filteredUsers.map((user) => (
                                        <div key={user.id} className="activity-item">
                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                <span style={{ 
                                                    fontSize: '14px', 
                                                    color: 'var(--color-body)', 
                                                    marginRight: '12px' 
                                                }}>
                                                    {user.role === 'super_admin' ? '👑' : user.role === 'admin' ? '👤' : '👥'}
                                                </span>
                                                <div style={{ flex: 1 }}>
                                                    <p style={{ fontSize: '14px', fontWeight: '500', color: 'var(--color-heading-1)', margin: '0 0 2px 0' }}>
                                                        {user.email || 'No email'}
                                                    </p>
                                                    <p style={{ fontSize: '12px', color: 'var(--color-body)', margin: '0 0 2px 0' }}>
                                                        UID: {user.uid}
                                                    </p>
                                                    <p style={{ fontSize: '12px', color: 'var(--color-body)', margin: 0 }}>
                                                        Registered: {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                                                        {user.createdBy && ` by ${user.createdBy}`}
                                                    </p>
                                                    {user.updatedAt && (
                                                        <p style={{ fontSize: '12px', color: 'var(--color-body)', margin: '2px 0 0 0' }}>
                                                            Last Updated: {new Date(user.updatedAt).toLocaleDateString()}
                                                            {user.updatedBy && ` by ${user.updatedBy}`}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                <span style={{ 
                                                    fontSize: '12px', 
                                                    padding: '4px 8px', 
                                                    borderRadius: '12px',
                                                    backgroundColor: user.role === 'super_admin' ? '#dc3545' : 
                                                                  user.role === 'admin' ? 'var(--color-primary)' : 'var(--color-success)',
                                                    color: '#fff'
                                                }}>
                                                    {user.role === 'super_admin' ? 'Super Admin' : 
                                                     user.role === 'admin' ? 'Admin' : 'User'}
                                                </span>
                                                <span style={{ 
                                                    fontSize: '12px', 
                                                    padding: '4px 8px', 
                                                    borderRadius: '12px',
                                                    backgroundColor: user.isActive === false ? '#dc3545' : 'var(--color-success)',
                                                    color: '#fff'
                                                }}>
                                                    {user.isActive === false ? 'Inactive' : 'Active'}
                                                </span>
                                                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                                    {user.role !== 'super_admin' && (
                                                        <button
                                                            onClick={() => handleUpdateUserRole(user.uid, 'super_admin')}
                                                            style={{
                                                                padding: '4px 8px',
                                                                backgroundColor: '#dc3545',
                                                                color: '#fff',
                                                                border: 'none',
                                                                borderRadius: '4px',
                                                                fontSize: '12px',
                                                                cursor: operationLoading ? 'not-allowed' : 'pointer',
                                                                opacity: operationLoading ? 0.7 : 1
                                                            }}
                                                            title="Make Super Admin"
                                                            disabled={operationLoading}
                                                        >
                                                            {operationLoading ? 'Updating...' : 'Make Super Admin'}
                                                        </button>
                                                    )}
                                                    {user.role !== 'admin' && (
                                                        <button
                                                            onClick={() => handleUpdateUserRole(user.uid, 'admin')}
                                                            style={{
                                                                padding: '4px 8px',
                                                                backgroundColor: 'var(--color-warning)',
                                                                color: '#fff',
                                                                border: 'none',
                                                                borderRadius: '4px',
                                                                fontSize: '12px',
                                                                cursor: operationLoading ? 'not-allowed' : 'pointer',
                                                                opacity: operationLoading ? 0.7 : 1
                                                            }}
                                                            title="Make Admin"
                                                            disabled={operationLoading}
                                                        >
                                                            {operationLoading ? 'Updating...' : 'Make Admin'}
                                                        </button>
                                                    )}
                                                    {user.role !== 'user' && (
                                                        <button
                                                            onClick={() => {
                                                                if (confirm('Are you sure you want to revoke this user\'s access?')) {
                                                                    handleRevokeAccess(user.uid);
                                                                }
                                                            }}
                                                            style={{
                                                                padding: '4px 8px',
                                                                backgroundColor: '#6c757d',
                                                                color: '#fff',
                                                                border: 'none',
                                                                borderRadius: '4px',
                                                                fontSize: '12px',
                                                                cursor: operationLoading ? 'not-allowed' : 'pointer',
                                                                opacity: operationLoading ? 0.7 : 1
                                                            }}
                                                            title="Revoke Access"
                                                            disabled={operationLoading}
                                                        >
                                                            {operationLoading ? 'Revoking...' : 'Revoke Access'}
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleRemoveUser(user.uid, user.email)}
                                                        style={{
                                                            padding: '4px 8px',
                                                            backgroundColor: '#dc3545',
                                                            color: '#fff',
                                                            border: 'none',
                                                            borderRadius: '4px',
                                                            fontSize: '12px',
                                                            cursor: operationLoading ? 'not-allowed' : 'pointer',
                                                            opacity: operationLoading ? 0.7 : 1
                                                        }}
                                                        title="Permanently Remove User"
                                                        disabled={operationLoading}
                                                    >
                                                        {operationLoading ? 'Removing...' : 'Remove'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div style={{ textAlign: 'center', padding: '40px' }}>
                                        <p style={{ fontSize: '16px', color: 'var(--color-body)', margin: '0 0 8px 0' }}>No users found</p>
                                        <p style={{ fontSize: '14px', color: 'var(--color-body)', margin: 0 }}>
                                            {searchTerm || roleFilter !== 'all' || statusFilter !== 'all' 
                                                ? 'Try adjusting your filters' 
                                                : 'No users have been registered yet'}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
