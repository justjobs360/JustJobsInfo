"use client";
import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAuth } from '@/contexts/AuthContext';
import { ADMIN_PERMISSIONS, DEFAULT_ADMIN_PERMISSIONS, SUPER_ADMIN_PERMISSIONS } from '@/utils/userRoleService';
import UserRoleService from '@/utils/userRoleService';
import toast from 'react-hot-toast';
import '../admin.css';

export default function AdminManagementPage() {
    const { hasPermission, isSuperAdmin } = useAuth();
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        role: 'admin', // 'admin' or 'super_admin'
        permissions: DEFAULT_ADMIN_PERMISSIONS
    });

    useEffect(() => {
        loadAdmins();
    }, []);

    const loadAdmins = async () => {
        try {
            const adminList = await UserRoleService.getAllAdmins();
            setAdmins(adminList);
        } catch (error) {
            console.error('Error loading admins:', error);
            toast.error('Failed to load admins');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateAdmin = async (e) => {
        e.preventDefault();
        
        if (!formData.email) {
            toast.error('Please enter an email address');
            return;
        }

        if (!formData.role) {
            toast.error('Please select a role');
            return;
        }

        try {
            // Set permissions based on role
            const permissions = formData.role === 'super_admin' 
                ? SUPER_ADMIN_PERMISSIONS 
                : formData.permissions;

            // In a real app, you would first create the user account in Firebase Auth
            // For now, we'll simulate creating an admin role
            const success = await UserRoleService.createAdmin('temp-user-id', formData.email, permissions, formData.role);
            
            if (success) {
                toast.success(`${formData.role === 'super_admin' ? 'Super Admin' : 'Admin'} created successfully`);
                setShowCreateForm(false);
                setFormData({ 
                    email: '', 
                    role: 'admin',
                    permissions: DEFAULT_ADMIN_PERMISSIONS 
                });
                loadAdmins();
            } else {
                toast.error('Failed to create admin');
            }
        } catch (error) {
            console.error('Error creating admin:', error);
            toast.error('Error creating admin');
        }
    };

    const handleRemoveAdmin = async (userId) => {
        if (!confirm('Are you sure you want to remove this admin?')) {
            return;
        }

        try {
            const success = await UserRoleService.removeAdminRole(userId);
            if (success) {
                toast.success('Admin role removed successfully');
                loadAdmins();
            } else {
                toast.error('Failed to remove admin role');
            }
        } catch (error) {
            console.error('Error removing admin:', error);
            toast.error('Error removing admin');
        }
    };

    const handleUpdateRole = async (userId, newRole) => {
        if (!confirm(`Are you sure you want to change this admin's role to ${newRole === 'super_admin' ? 'Super Admin' : 'Regular Admin'}?`)) {
            return;
        }

        try {
            const success = await UserRoleService.updateAdminRole(userId, newRole);
            if (success) {
                toast.success(`Admin role updated to ${newRole === 'super_admin' ? 'Super Admin' : 'Regular Admin'}`);
                loadAdmins();
            } else {
                toast.error('Failed to update admin role');
            }
        } catch (error) {
            console.error('Error updating admin role:', error);
            toast.error('Error updating admin role');
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
                        {showCreateForm ? 'Cancel' : 'Create New Admin'}
                    </button>
                </div>

                {/* Create Admin Form */}
                {showCreateForm && (
                    <div className="activity-card" style={{ marginBottom: '20px' }}>
                        <div style={{ padding: '24px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: '500', color: 'var(--color-heading-1)', margin: '0 0 16px 0' }}>Create New Admin</h3>
                            <form onSubmit={handleCreateAdmin}>
                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Email Address:</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                        style={{
                                            width: '100%',
                                            padding: '8px 12px',
                                            border: '1px solid #ddd',
                                            borderRadius: '4px',
                                            fontSize: '14px'
                                        }}
                                        placeholder="admin@example.com"
                                        required
                                    />
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
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        width: '250px'
                                    }}
                                >
                                    Create {formData.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                                </button>
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
                                                    {admin.role === 'super_admin' ? (
                                                        <button
                                                            onClick={() => handleUpdateRole(admin.id, 'admin')}
                                                            style={{
                                                                padding: '4px 8px',
                                                                backgroundColor: 'var(--color-warning)',
                                                                color: '#fff',
                                                                border: 'none',
                                                                borderRadius: '4px',
                                                                fontSize: '12px',
                                                                cursor: 'pointer'
                                                            }}
                                                            title="Change to Regular Admin"
                                                        >
                                                            Make Admin
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleUpdateRole(admin.id, 'super_admin')}
                                                            style={{
                                                                padding: '4px 8px',
                                                                backgroundColor: '#dc3545',
                                                                color: '#fff',
                                                                border: 'none',
                                                                borderRadius: '4px',
                                                                fontSize: '12px',
                                                                cursor: 'pointer'
                                                            }}
                                                            title="Change to Super Admin"
                                                        >
                                                            Make Super Admin
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleRemoveAdmin(admin.id)}
                                                        style={{
                                                            padding: '4px 8px',
                                                            backgroundColor: '#dc3545',
                                                            color: '#fff',
                                                            border: 'none',
                                                            borderRadius: '4px',
                                                            fontSize: '12px',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        Remove
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