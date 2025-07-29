"use client";
import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAuth } from '@/contexts/AuthContext';
import { ADMIN_PERMISSIONS, DEFAULT_ADMIN_PERMISSIONS, SUPER_ADMIN_PERMISSIONS } from '@/utils/userRoleService';
import AdminService from '@/utils/adminService';
import toast from 'react-hot-toast';
import '../admin.css';

export default function AdminManagementPage() {
    const { hasPermission, isSuperAdmin } = useAuth();
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        uid: '',
        role: 'admin', // 'admin' or 'super_admin'
        permissions: DEFAULT_ADMIN_PERMISSIONS
    });
    const [editingAdmin, setEditingAdmin] = useState(null);
    const [showEditForm, setShowEditForm] = useState(false);
    const [operationLoading, setOperationLoading] = useState(false);

    useEffect(() => {
        loadAdmins();
    }, []);

    const loadAdmins = async () => {
        try {
            console.log('🔄 Loading admins...');
            setLoading(true); // Force loading state
            const result = await AdminService.getAllAdmins();
            console.log('📊 Admin load result:', result);
            
            if (result && result.users) {
                setAdmins(result.users);
            } else {
                console.log('⚠️ No users found or invalid response');
                setAdmins([]);
            }
        } catch (error) {
            console.error('❌ Error loading admins:', error);
            toast.error(`Failed to load admins: ${error.message}`);
            setAdmins([]);
        } finally {
            setLoading(false);
        }
    };

    // Force refresh function
    const forceRefresh = async () => {
        console.log('🔄 Forcing admin list refresh...');
        setLoading(true); // Show loading state
        await loadAdmins();
        // Small delay to show the refresh happened
        setTimeout(() => {
            setLoading(false);
        }, 500);
    };

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
            // Set permissions based on role
            const permissions = formData.role === 'super_admin' 
                ? SUPER_ADMIN_PERMISSIONS 
                : formData.permissions;

            const adminData = {
                role: formData.role,
                permissions: permissions,
                createdBy: 'super_admin'
            };

            // Add email or uid to the request
            if (formData.email) {
                adminData.email = formData.email;
            } else {
                adminData.uid = formData.uid;
            }

            const result = await AdminService.createAdmin(adminData);
            
            if (result.success) {
                toast.success(result.message);
                setShowCreateForm(false);
                setFormData({ 
                    email: '', 
                    uid: '',
                    role: 'admin',
                    permissions: DEFAULT_ADMIN_PERMISSIONS 
                });
                // Force immediate refresh
                await forceRefresh();
            } else {
                toast.error('Failed to promote user to admin');
            }
        } catch (error) {
            console.error('Error promoting user to admin:', error);
            toast.error(error.message || 'Error promoting user to admin');
        } finally {
            setOperationLoading(false);
        }
    };

    const handleRemoveAdmin = async (userId) => {
        if (!confirm('Are you sure you want to remove this admin?')) {
            return;
        }

        setOperationLoading(true);
        try {
            const result = await AdminService.updateAdmin(userId, {
                role: 'user',
                updatedBy: 'super_admin'
            });
            
            if (result.success) {
                toast.success('Admin role removed successfully');
                // Force immediate refresh
                await forceRefresh();
            } else {
                toast.error('Failed to remove admin role');
            }
        } catch (error) {
            console.error('Error removing admin:', error);
            toast.error(error.message || 'Error removing admin');
        } finally {
            setOperationLoading(false);
        }
    };

    const handleUpdateRole = async (userId, newRole) => {
        if (!confirm(`Are you sure you want to change this admin's role to ${newRole === 'super_admin' ? 'Super Admin' : 'Regular Admin'}?`)) {
            return;
        }

        setOperationLoading(true);
        try {
            const result = await AdminService.updateAdmin(userId, {
                role: newRole,
                updatedBy: 'super_admin'
            });
            
            if (result.success) {
                toast.success(result.message);
                // Force immediate refresh
                await forceRefresh();
            } else {
                toast.error('Failed to update admin role');
            }
        } catch (error) {
            console.error('Error updating admin role:', error);
            toast.error(error.message || 'Error updating admin role');
        } finally {
            setOperationLoading(false);
        }
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
            // Reset permissions when role changes
            permissions: role === 'super_admin' ? SUPER_ADMIN_PERMISSIONS : DEFAULT_ADMIN_PERMISSIONS
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

    const handleUpdateAdmin = async (e) => {
        e.preventDefault();
        
        if (!editingAdmin) {
            toast.error('No admin selected for editing');
            return;
        }

        setOperationLoading(true);
        try {
            const result = await AdminService.updateAdmin(editingAdmin.uid, {
                role: formData.role,
                permissions: formData.permissions,
                updatedBy: 'super_admin'
            });
            
            if (result.success) {
                toast.success(result.message);
                setShowEditForm(false);
                setEditingAdmin(null);
                setFormData({ 
                    email: '', 
                    uid: '',
                    role: 'admin',
                    permissions: DEFAULT_ADMIN_PERMISSIONS 
                });
                // Force immediate refresh
                await forceRefresh();
            } else {
                toast.error('Failed to update admin');
            }
        } catch (error) {
            console.error('Error updating admin:', error);
            toast.error(error.message || 'Error updating admin');
        } finally {
            setOperationLoading(false);
        }
    };

    const handleCancelEdit = () => {
        setShowEditForm(false);
        setEditingAdmin(null);
        setFormData({ 
            email: '', 
            uid: '',
            role: 'admin',
            permissions: DEFAULT_ADMIN_PERMISSIONS 
        });
    };

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
                    <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--color-heading-1)', margin: '0 0 8px 0' }}>Admin Management</h1>
                    <p style={{ fontSize: '16px', color: 'var(--color-body)', margin: 0 }}>Create and manage admin accounts</p>
                </div>

                {/* Create Admin Button */}
                <div style={{ marginBottom: '20px' }}>
                    <button
                        onClick={() => setShowCreateForm(!showCreateForm)}
                        style={{
                            padding: '12px 24px',
                            backgroundColor: 'var(--color-primary)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '500',
                            width: '250px'
                        }}
                    >
                        {showCreateForm ? 'Cancel' : 'Promote User to Admin'}
                    </button>
                </div>

                {/* Create Admin Form */}
                {showCreateForm && (
                    <div className="activity-card" style={{ marginBottom: '20px' }}>
                        <div style={{ padding: '24px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: '500', color: 'var(--color-heading-1)', margin: '0 0 16px 0' }}>Promote User to Admin</h3>
                            <form onSubmit={handleCreateAdmin}>
                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Email Address (or User UID):</label>
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => {
                                                setFormData(prev => ({ 
                                                    ...prev, 
                                                    email: e.target.value,
                                                    uid: '' // Clear UID when email is entered
                                                }));
                                            }}
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
                                            onChange={(e) => {
                                                setFormData(prev => ({ 
                                                    ...prev, 
                                                    uid: e.target.value,
                                                    email: '' // Clear email when UID is entered
                                                }));
                                            }}
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
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Role:</label>
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
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Permissions:</label>
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
                                            width: '250px',
                                            opacity: operationLoading ? 0.7 : 1
                                        }}
                                        disabled={operationLoading}
                                >
                                    {operationLoading ? 'Promoting...' : `Promote to ${formData.role === 'super_admin' ? 'Super Admin' : 'Admin'}`}
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
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Email Address:</label>
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
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Role:</label>
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
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Permissions:</label>
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
                                            width: '120px',
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
                                            width: '120px',
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
                        <p style={{ marginTop: '16px' }}>Loading admins...</p>
                    </div>
                ) : (
                    <div className="activity-card">
                        <div style={{ padding: '24px' }}>
                            <div style={{ marginBottom: '20px' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: '500', color: 'var(--color-heading-1)', margin: '0 0 16px 0' }}>All Admins</h3>
                                <div style={{ display: 'flex', gap: '16px', marginBottom: '8px' }}>
                                    <p style={{ fontSize: '14px', color: 'var(--color-body)', margin: 0 }}>
                                        Total admins: {admins.length}
                                    </p>
                                    <p style={{ fontSize: '14px', color: 'var(--color-body)', margin: 0 }}>
                                        Super admins: {admins.filter(a => a.role === 'super_admin').length}
                                    </p>
                                    <p style={{ fontSize: '14px', color: 'var(--color-body)', margin: 0 }}>
                                        Regular admins: {admins.filter(a => a.role === 'admin').length}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="activity-list">
                                {admins.length > 0 ? (
                                    admins.map((admin) => (
                                        <div key={admin.id} className="activity-item">
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
                                                <div style={{ display: 'flex', gap: '4px' }}>
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
                                                            width: '150px',
                                                            opacity: operationLoading ? 0.7 : 1
                                                        }}
                                                        title="Edit Admin"
                                                        disabled={operationLoading}
                                                    >
                                                        {operationLoading ? 'Loading...' : 'Edit'}
                                                    </button>
                                                    {admin.role === 'super_admin' ? (
                                                        <button
                                                            onClick={() => handleUpdateRole(admin.uid, 'admin')}
                                                            style={{
                                                                padding: '4px 8px',
                                                                backgroundColor: 'var(--color-warning)',
                                                                color: '#fff',
                                                                border: 'none',
                                                                borderRadius: '4px',
                                                                fontSize: '12px',
                                                                cursor: operationLoading ? 'not-allowed' : 'pointer',
                                                                width: '150px',
                                                                opacity: operationLoading ? 0.7 : 1
                                                            }}
                                                            title="Change to Regular Admin"
                                                            disabled={operationLoading}
                                                        >
                                                            {operationLoading ? 'Updating...' : 'Make Admin'}
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleUpdateRole(admin.uid, 'super_admin')}
                                                            style={{
                                                                padding: '4px 8px',
                                                                backgroundColor: '#dc3545',
                                                                color: '#fff',
                                                                border: 'none',
                                                                borderRadius: '4px',
                                                                fontSize: '12px',
                                                                cursor: operationLoading ? 'not-allowed' : 'pointer',
                                                                width: '150px',
                                                                opacity: operationLoading ? 0.7 : 1
                                                            }}
                                                            title="Change to Super Admin"
                                                            disabled={operationLoading}
                                                        >
                                                            {operationLoading ? 'Updating...' : 'Make Super Admin'}
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleRemoveAdmin(admin.uid)}
                                                        style={{
                                                            padding: '4px 8px',
                                                            backgroundColor: '#dc3545',
                                                            color: '#fff',
                                                            border: 'none',
                                                            borderRadius: '4px',
                                                            fontSize: '12px',
                                                            cursor: operationLoading ? 'not-allowed' : 'pointer',
                                                            width: '150px',
                                                            opacity: operationLoading ? 0.7 : 1
                                                        }}
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
                                        <p style={{ fontSize: '16px', color: 'var(--color-body)', margin: '0 0 8px 0' }}>No admins found</p>
                                        <p style={{ fontSize: '14px', color: 'var(--color-body)', margin: 0 }}>Create your first admin account above</p>
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