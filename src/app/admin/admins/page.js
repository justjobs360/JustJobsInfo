"use client";
import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAuth } from '@/contexts/AuthContext';
import { ADMIN_PERMISSIONS, DEFAULT_ADMIN_PERMISSIONS } from '@/utils/userRoleService';
import toast from 'react-hot-toast';
import '../admin.css';

export default function AdminManagementPage() {
    const { isSuperAdmin, user } = useAuth();
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [operationLoading, setOperationLoading] = useState(false);
    const [editingAdmin, setEditingAdmin] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [formData, setFormData] = useState({
        email: '',
        uid: '',
        role: 'admin',
        permissions: [...DEFAULT_ADMIN_PERMISSIONS]
    });

    const loadAdmins = useCallback(async () => {
        try {
            setLoading(true);
            console.log('🔄 Loading admin users...');
            
            // Simple direct approach - use the existing working users API
            if (!user) {
                toast.error('User not authenticated');
                return;
            }
            
            const idToken = await user.getIdToken(true);
            
            // Use hybrid endpoint that tries real Firestore first, falls back to mock if needed
            const response = await fetch('/api/admin/users/hybrid-list', {
                headers: {
                    'Authorization': `Bearer ${idToken}`,
                    'Content-Type': 'application/json'
                }
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Filter for admin users on the client side
                const adminUsers = (result.users || []).filter(user => 
                    user.role === 'admin' || user.role === 'super_admin'
                );
                setAdmins(adminUsers);
                console.log(`✅ Loaded ${adminUsers.length} admin users`);
            } else {
                console.log('⚠️ Failed to load admin users:', result.error);
                setAdmins([]);
                toast.error(`Failed to load admin users: ${result.error}`);
            }
        } catch (error) {
            console.error('❌ Error loading admin users:', error);
            toast.error(`Failed to load admin users: ${error.message}`);
            setAdmins([]);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        loadAdmins();
    }, [loadAdmins]);

    // Helper functions
    const resetForm = () => {
        setFormData({
            email: '',
            uid: '',
            role: 'admin',
            permissions: [...DEFAULT_ADMIN_PERMISSIONS]
        });
    };

    const togglePermission = (permission) => {
        setFormData(prev => ({
            ...prev,
            permissions: prev.permissions.includes(permission)
                ? prev.permissions.filter(p => p !== permission)
                : [...prev.permissions, permission]
        }));
    };

    const handleRoleChange = (role) => {
        setFormData(prev => ({
            ...prev,
            role,
            permissions: role === 'super_admin' 
                ? Object.values(ADMIN_PERMISSIONS) 
                : DEFAULT_ADMIN_PERMISSIONS
        }));
    };

    const handleEditAdmin = (admin) => {
        setEditingAdmin(admin);
        setFormData({
            email: admin.email,
            uid: admin.uid || '',
            role: admin.role,
            permissions: admin.permissions || DEFAULT_ADMIN_PERMISSIONS
        });
        setShowEditForm(true);
        setShowCreateForm(false);
    };

    const handleCancelEdit = () => {
        setShowEditForm(false);
        setEditingAdmin(null);
        resetForm();
    };

    // Filter admins based on search and role filter
    const filteredAdmins = admins.filter(admin => {
        const matchesSearch = admin.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'all' || admin.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    const handleCreateAdmin = async (e) => {
        e.preventDefault();
        
        if (!formData.email && !formData.uid) {
            toast.error('Please enter either an email address or user UID');
            return;
        }

        if (!formData.role) {
            toast.error('Please select a role');
            return;
        }

        setOperationLoading(true);
        try {
            console.log('🔄 Creating admin user...');
            
            const idToken = await user.getIdToken(true);
            
            const response = await fetch('/api/admin/users/create', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${idToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: formData.email,
                    uid: formData.uid,
                role: formData.role,
                    permissions: formData.permissions
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                toast.success(result.message);
                setShowCreateForm(false);
                resetForm();
                await loadAdmins(); // Refresh the list
            } else {
                toast.error(result.error || 'Failed to create admin user');
            }
        } catch (error) {
            console.error('Error creating admin user:', error);
            toast.error(error.message || 'Failed to create admin user');
        } finally {
            setOperationLoading(false);
        }
    };

    const handleRemoveAdmin = async (userId) => {
        if (!confirm('Are you sure you want to remove admin privileges from this user?')) {
            return;
        }

        setOperationLoading(true);
        try {
            console.log('🔄 Removing admin privileges...');
            
            const idToken = await user.getIdToken(true);
            
            const response = await fetch('/api/admin/users/update', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${idToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    uid: userId,
                role: 'user',
                    permissions: [],
                    updatedBy: 'admin_management'
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                toast.success('Admin privileges removed successfully');
                await loadAdmins(); // Refresh the list
            } else {
                toast.error(result.error || 'Failed to remove admin privileges');
            }
        } catch (error) {
            console.error('Error removing admin role:', error);
            toast.error(error.message || 'Failed to remove admin privileges');
        } finally {
            setOperationLoading(false);
        }
    };

    const handleUpdateRole = async (userId, newRole) => {
        if (!confirm(`Are you sure you want to change this user's role to ${newRole === 'super_admin' ? 'Super Admin' : 'Regular Admin'}?`)) {
            return;
        }

        setOperationLoading(true);
        try {
            console.log('🔄 Updating user role...');
            
            const idToken = await user.getIdToken(true);
            
            const response = await fetch('/api/admin/users/update', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${idToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    uid: userId,
                role: newRole,
                    updatedBy: 'admin_management'
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                toast.success(result.message || 'User role updated successfully');
                await loadAdmins(); // Refresh the list
            } else {
                toast.error(result.error || 'Failed to update user role');
            }
        } catch (error) {
            console.error('Error updating user role:', error);
            toast.error(error.message || 'Failed to update user role');
        } finally {
            setOperationLoading(false);
        }
    };

    const handleUpdateAdmin = async (e) => {
        e.preventDefault();
        
        if (!editingAdmin) {
            toast.error('No admin selected for editing');
            return;
        }

        setOperationLoading(true);
        try {
            console.log('🔄 Updating admin user...');
            
            const idToken = await user.getIdToken(true);
            
            const response = await fetch('/api/admin/users/update', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${idToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    uid: editingAdmin.uid,
                role: formData.role,
                permissions: formData.permissions,
                    updatedBy: 'admin_management'
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                toast.success(result.message || 'Admin updated successfully');
                setShowEditForm(false);
                setEditingAdmin(null);
                resetForm();
                await loadAdmins(); // Refresh the list
            } else {
                toast.error(result.error || 'Failed to update admin');
            }
        } catch (error) {
            console.error('Error updating admin:', error);
            toast.error(error.message || 'Failed to update admin');
        } finally {
            setOperationLoading(false);
        }
    };

    // Check if user is super admin
    if (!isSuperAdmin()) {
        return (
            <AdminLayout>
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <h2 style={{ color: 'var(--color-danger)' }}>Access Denied</h2>
                    <p>Only super admins can manage other admins.</p>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="admin-dashboard">
                <div className="dashboard-header">
                    <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--color-heading-1)', margin: '0 0 8px 0' }}>
                        Admin Management
                    </h1>
                    <p style={{ fontSize: '16px', color: 'var(--color-body)', margin: 0 }}>
                        Create and manage admin accounts
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
                                {admins.length}
                            </h3>
                            <p style={{ fontSize: '14px', color: 'var(--color-body)', margin: 0 }}>Total Admins</p>
                        </div>
                    </div>
                    <div className="activity-card">
                        <div style={{ padding: '20px', textAlign: 'center' }}>
                            <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc3545', margin: '0 0 8px 0' }}>
                                {admins.filter(a => a.role === 'super_admin').length}
                            </h3>
                            <p style={{ fontSize: '14px', color: 'var(--color-body)', margin: 0 }}>Super Admins</p>
                        </div>
                    </div>
                    <div className="activity-card">
                        <div style={{ padding: '20px', textAlign: 'center' }}>
                            <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--color-success)', margin: '0 0 8px 0' }}>
                                {admins.filter(a => a.role === 'admin').length}
                            </h3>
                            <p style={{ fontSize: '14px', color: 'var(--color-body)', margin: 0 }}>Regular Admins</p>
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
                        placeholder="Search by email..."
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
                        <option value="super_admin">Super Admins</option>
                        <option value="admin">Regular Admins</option>
                    </select>
                    <button
                        onClick={loadAdmins}
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
                </div>

                {/* Action Buttons */}
                <div style={{ 
                    display: 'flex', 
                    gap: '8px', 
                    marginBottom: '20px',
                    alignItems: 'center'
                }}>
                    <button
                        onClick={() => {
                            setShowCreateForm(!showCreateForm);
                            setShowEditForm(false);
                            setEditingAdmin(null);
                            resetForm();
                        }}
                        style={{
                            padding: '6px 12px',
                            backgroundColor: 'var(--color-primary)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '500'
                        }}
                    >
                        {showCreateForm ? 'Cancel' : 'Promote User to Admin'}
                    </button>
                </div>

                {/* Create Admin Form */}
                {showCreateForm && (
                    <div className="activity-card" style={{ marginBottom: '20px' }}>
                        <div style={{ padding: '24px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: '500', color: 'var(--color-heading-1)', margin: '0 0 16px 0' }}>
                                Promote User to Admin
                            </h3>
                            <form onSubmit={handleCreateAdmin}>
                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                                        Email Address or User UID:
                                    </label>
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData(prev => ({ 
                                                    ...prev, 
                                                    email: e.target.value,
                                                    uid: '' // Clear UID when email is entered
                                            }))}
                                            style={{
                                                flex: 1,
                                                padding: '8px 12px',
                                                border: '1px solid #ddd',
                                                borderRadius: '4px',
                                                fontSize: '14px'
                                            }}
                                            placeholder="admin@example.com"
                                        />
                                        <span style={{ fontSize: '14px', color: 'var(--color-body)' }}>OR</span>
                                        <input
                                            type="text"
                                            value={formData.uid}
                                            onChange={(e) => setFormData(prev => ({ 
                                                    ...prev, 
                                                    uid: e.target.value,
                                                    email: '' // Clear email when UID is entered
                                            }))}
                                            style={{
                                                flex: 1,
                                                padding: '8px 12px',
                                                border: '1px solid #ddd',
                                                borderRadius: '4px',
                                                fontSize: '14px'
                                            }}
                                            placeholder="User UID"
                                        />
                                    </div>
                                    <p style={{ fontSize: '12px', color: 'var(--color-body)', marginTop: '4px' }}>
                                        Enter either the email address or UID of an existing user to promote them to admin
                                    </p>
                                </div>

                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                                        Role:
                                    </label>
                                    <div style={{ display: 'flex', gap: '16px' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', fontSize: '14px' }}>
                                            <input
                                                type="radio"
                                                name="role"
                                                value="admin"
                                                checked={formData.role === 'admin'}
                                                onChange={(e) => handleRoleChange(e.target.value)}
                                                style={{ marginRight: '8px' }}
                                            />
                                            Regular Admin
                                        </label>
                                        <label style={{ display: 'flex', alignItems: 'center', fontSize: '14px' }}>
                                            <input
                                                type="radio"
                                                name="role"
                                                value="super_admin"
                                                checked={formData.role === 'super_admin'}
                                                onChange={(e) => handleRoleChange(e.target.value)}
                                                style={{ marginRight: '8px' }}
                                            />
                                            Super Admin
                                        </label>
                                    </div>
                                </div>

                                {formData.role === 'admin' && (
                                    <div style={{ marginBottom: '16px' }}>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                                            Permissions:
                                        </label>
                                        <div style={{ 
                                            display: 'grid', 
                                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                                            gap: '8px',
                                            maxHeight: '200px',
                                            overflowY: 'auto',
                                            padding: '8px',
                                            border: '1px solid #ddd',
                                            borderRadius: '4px'
                                        }}>
                                            {Object.entries(ADMIN_PERMISSIONS).map(([key, permission]) => (
                                                <label key={permission} style={{ display: 'flex', alignItems: 'center', fontSize: '14px' }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.permissions.includes(permission)}
                                                        onChange={() => togglePermission(permission)}
                                                        style={{ marginRight: '8px' }}
                                                    />
                                                    {key.replace(/_/g, ' ').toLowerCase()}
                                                </label>
                                            ))}
                                        </div>
                                        <p style={{ fontSize: '12px', color: 'var(--color-body)', marginTop: '4px' }}>
                                            Super Admins automatically get all permissions
                                        </p>
                                    </div>
                                )}

                                {formData.role === 'super_admin' && (
                                    <div style={{ marginBottom: '16px' }}>
                                        <div style={{ 
                                            padding: '12px', 
                                            backgroundColor: '#fff3cd', 
                                            border: '1px solid #ffeaa7',
                                            borderRadius: '4px',
                                            fontSize: '14px',
                                            color: '#856404'
                                        }}>
                                            <strong>⚠️ Super Admin Warning:</strong> Super admins have full system access and can create other super admins. 
                                            Only create super admin accounts for trusted individuals.
                                        </div>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                                                            style={{
                                            padding: '8px 16px',
                                            backgroundColor: formData.role === 'super_admin' ? '#dc3545' : 'var(--color-success)',
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: operationLoading ? 'not-allowed' : 'pointer',
                                            fontSize: '14px',
                                            opacity: operationLoading ? 0.7 : 1
                                        }}
                                        disabled={operationLoading}
                                >
                                    {operationLoading ? 'Creating...' : `Promote to ${formData.role === 'super_admin' ? 'Super Admin' : 'Admin'}`}
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* Edit Admin Form */}
                {showEditForm && editingAdmin && (
                    <div className="activity-card" style={{ marginBottom: '20px' }}>
                        <div style={{ padding: '24px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: '500', color: 'var(--color-heading-1)', margin: '0 0 16px 0' }}>
                                Edit Admin: {editingAdmin.email}
                            </h3>
                            <form onSubmit={handleUpdateAdmin}>
                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                                        Email Address:
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        disabled
                                        style={{
                                            width: '100%',
                                            padding: '8px 12px',
                                            border: '1px solid #ddd',
                                            borderRadius: '4px',
                                            fontSize: '14px',
                                            backgroundColor: '#f5f5f5'
                                        }}
                                    />
                                    <p style={{ fontSize: '12px', color: 'var(--color-body)', marginTop: '4px' }}>
                                        Email cannot be changed
                                    </p>
                                </div>

                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                                        Role:
                                    </label>
                                    <div style={{ display: 'flex', gap: '16px' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', fontSize: '14px' }}>
                                            <input
                                                type="radio"
                                                name="editRole"
                                                value="admin"
                                                checked={formData.role === 'admin'}
                                                onChange={(e) => handleRoleChange(e.target.value)}
                                                style={{ marginRight: '8px' }}
                                            />
                                            Regular Admin
                                        </label>
                                        <label style={{ display: 'flex', alignItems: 'center', fontSize: '14px' }}>
                                            <input
                                                type="radio"
                                                name="editRole"
                                                value="super_admin"
                                                checked={formData.role === 'super_admin'}
                                                onChange={(e) => handleRoleChange(e.target.value)}
                                                style={{ marginRight: '8px' }}
                                            />
                                            Super Admin
                                        </label>
                                    </div>
                                </div>

                                {formData.role === 'admin' && (
                                    <div style={{ marginBottom: '16px' }}>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                                            Permissions:
                                        </label>
                                        <div style={{ 
                                            display: 'grid', 
                                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                                            gap: '8px',
                                            maxHeight: '200px',
                                            overflowY: 'auto',
                                            padding: '8px',
                                            border: '1px solid #ddd',
                                            borderRadius: '4px'
                                        }}>
                                            {Object.entries(ADMIN_PERMISSIONS).map(([key, permission]) => (
                                                <label key={permission} style={{ display: 'flex', alignItems: 'center', fontSize: '14px' }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.permissions.includes(permission)}
                                                        onChange={() => togglePermission(permission)}
                                                        style={{ marginRight: '8px' }}
                                                    />
                                                    {key.replace(/_/g, ' ').toLowerCase()}
                                                </label>
                                            ))}
                                        </div>
                                        <p style={{ fontSize: '12px', color: 'var(--color-body)', marginTop: '4px' }}>
                                            Super Admins automatically get all permissions
                                        </p>
                                    </div>
                                )}

                                {formData.role === 'super_admin' && (
                                    <div style={{ marginBottom: '16px' }}>
                                        <div style={{ 
                                            padding: '12px', 
                                            backgroundColor: '#fff3cd', 
                                            border: '1px solid #ffeaa7',
                                            borderRadius: '4px',
                                            fontSize: '14px',
                                            color: '#856404'
                                        }}>
                                            <strong>⚠️ Super Admin Warning:</strong> Super admins have full system access and can create other super admins. 
                                            Only create super admin accounts for trusted individuals.
                                        </div>
                                    </div>
                                )}

                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button
                                        type="submit"
                                        style={{
                                            padding: '8px 16px',
                                            backgroundColor: formData.role === 'super_admin' ? '#dc3545' : 'var(--color-success)',
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: operationLoading ? 'not-allowed' : 'pointer',
                                            fontSize: '14px',
                                            opacity: operationLoading ? 0.7 : 1
                                        }}
                                        disabled={operationLoading}
                                    >
                                        {operationLoading ? 'Updating...' : 'Update Admin'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleCancelEdit}
                                        style={{
                                            padding: '8px 16px',
                                            backgroundColor: '#6c757d',
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: operationLoading ? 'not-allowed' : 'pointer',
                                            fontSize: '14px',
                                            opacity: operationLoading ? 0.7 : 1
                                        }}
                                        disabled={operationLoading}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Admins List */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                        <div className="loading-spinner"></div>
                        <p style={{ marginTop: '16px' }}>Loading admin users...</p>
                    </div>
                ) : (
                    <div className="activity-card">
                        <div style={{ padding: '24px' }}>
                            <div style={{ marginBottom: '20px' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: '500', color: 'var(--color-heading-1)', margin: '0 0 16px 0' }}>
                                    Admin Users ({filteredAdmins.length} of {admins.length})
                                </h3>
                                {searchTerm && (
                                    <p style={{ fontSize: '14px', color: 'var(--color-body)', margin: '0 0 8px 0' }}>
                                        Filtered by: &quot;{searchTerm}&quot;
                                    </p>
                                )}
                            </div>
                            
                            <div className="activity-list">
                                {filteredAdmins.length > 0 ? (
                                    filteredAdmins.map((admin) => (
                                        <div key={admin.uid || admin.id} className="activity-item">
                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                <span style={{ 
                                                    fontSize: '14px', 
                                                    color: 'var(--color-body)', 
                                                    marginRight: '12px' 
                                                }}>
                                                    {admin.role === 'super_admin' ? '👑' : '👤'}
                                                </span>
                                                <div>
                                                    <p style={{ fontSize: '14px', fontWeight: '500', color: 'var(--color-heading-1)', margin: '0 0 2px 0' }}>
                                                        {admin.email}
                                                    </p>
                                                    <p style={{ fontSize: '12px', color: 'var(--color-body)', margin: 0 }}>
                                                        Created: {admin.createdAt ? new Date(admin.createdAt).toLocaleDateString() : 'Unknown'}
                                                        {admin.createdBy && ` by ${admin.createdBy}`}
                                                    </p>
                                                    <p style={{ fontSize: '12px', color: 'var(--color-body)', margin: '4px 0 0 0' }}>
                                                        Last Updated: {admin.updatedAt ? new Date(admin.updatedAt).toLocaleDateString() : 'Unknown'}
                                                        {admin.updatedBy && ` by ${admin.updatedBy}`}
                                                    </p>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                <span style={{ 
                                                    fontSize: '12px', 
                                                    padding: '4px 8px', 
                                                    borderRadius: '12px',
                                                    backgroundColor: admin.role === 'super_admin' ? '#dc3545' : 'var(--color-primary)',
                                                    color: '#fff'
                                                }}>
                                                    {admin.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                                                </span>
                                                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                                    <button
                                                        onClick={() => handleEditAdmin(admin)}
                                                        style={{
                                                            padding: '4px 8px',
                                                            backgroundColor: 'var(--color-primary)',
                                                            color: '#fff',
                                                            border: 'none',
                                                            borderRadius: '4px',
                                                            fontSize: '12px',
                                                            cursor: operationLoading ? 'not-allowed' : 'pointer',
                                                            opacity: operationLoading ? 0.7 : 1
                                                        }}
                                                        disabled={operationLoading}
                                                        title="Edit Admin"
                                                    >
                                                        Edit
                                                    </button>
                                                    {admin.role === 'super_admin' ? (
                                                        <button
                                                            onClick={() => handleUpdateRole(admin.uid || admin.id, 'admin')}
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
                                                            disabled={operationLoading}
                                                            title="Change to Regular Admin"
                                                        >
                                                            Make Admin
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleUpdateRole(admin.uid || admin.id, 'super_admin')}
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
                                                            disabled={operationLoading}
                                                            title="Change to Super Admin"
                                                        >
                                                            Make Super Admin
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => {
                                                            if (confirm('Are you sure you want to remove admin privileges from this user?')) {
                                                                handleRemoveAdmin(admin.uid || admin.id);
                                                            }
                                                        }}
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
                                                        disabled={operationLoading}
                                                        title="Remove Admin Privileges"
                                                    >
                                                        Remove Admin
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div style={{ textAlign: 'center', padding: '40px' }}>
                                        <p style={{ fontSize: '16px', color: 'var(--color-body)', margin: '0 0 8px 0' }}>
                                            No admin users found
                                        </p>
                                        <p style={{ fontSize: '14px', color: 'var(--color-body)', margin: 0 }}>
                                            Create your first admin account above
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
