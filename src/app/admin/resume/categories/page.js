"use client";
import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAuth } from '@/contexts/AuthContext';
import { ADMIN_PERMISSIONS } from '@/utils/userRoleService';
import '../../admin.css';
import toast from 'react-hot-toast';

export default function ResumeTemplateCategoriesPage() {
    const { hasPermission } = useAuth();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });

    // Fetch categories
    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/admin/resume-template-categories');
            const result = await response.json();

            if (result.success) {
                setCategories(result.data);
            } else {
                throw new Error(result.error || 'Failed to fetch categories');
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            toast.error(`Failed to fetch categories: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (hasPermission(ADMIN_PERMISSIONS.MANAGE_CONTENT)) {
            fetchCategories();
        }
    }, [hasPermission]);

    // Open add modal
    const openAddModal = () => {
        setFormData({ name: '', description: '' });
        setEditingCategory(null);
        setShowAddModal(true);
    };

    // Open edit modal
    const openEditModal = (category) => {
        setFormData({
            name: category.name,
            description: category.description || ''
        });
        setEditingCategory(category);
        setShowAddModal(true);
    };

    // Close modal
    const closeModal = () => {
        setShowAddModal(false);
        setEditingCategory(null);
        setFormData({ name: '', description: '' });
    };

    // Save category (create or update)
    const saveCategory = async () => {
        if (!formData.name.trim()) {
            toast.error('Category name is required');
            return;
        }

        try {
            const url = '/api/admin/resume-template-categories';
            const method = editingCategory ? 'PUT' : 'POST';
            const body = editingCategory
                ? { id: editingCategory.id, ...formData }
                : formData;

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const result = await response.json();

            if (result.success) {
                toast.success(editingCategory ? 'Category updated' : 'Category created');
                closeModal();
                fetchCategories();
            } else {
                throw new Error(result.error || 'Failed to save category');
            }
        } catch (error) {
            console.error('Error saving category:', error);
            toast.error(error.message || 'Failed to save category');
        }
    };

    // Delete category
    const deleteCategory = async (category) => {
        if (!confirm(`Are you sure you want to delete "${category.name}"? This action cannot be undone.`)) {
            return;
        }

        try {
            const response = await fetch(`/api/admin/resume-template-categories?id=${category.id}`, {
                method: 'DELETE'
            });

            const result = await response.json();

            if (result.success) {
                toast.success('Category deleted');
                fetchCategories();
            } else {
                throw new Error(result.error || 'Failed to delete category');
            }
        } catch (error) {
            console.error('Error deleting category:', error);
            toast.error(error.message || 'Failed to delete category');
        }
    };

    // Toggle category status
    const toggleStatus = async (category) => {
        const newStatus = category.status === 'active' ? 'inactive' : 'active';
        
        try {
            const response = await fetch('/api/admin/resume-template-categories', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: category.id,
                    status: newStatus
                })
            });

            const result = await response.json();

            if (result.success) {
                toast.success(`Category ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
                fetchCategories();
            } else {
                throw new Error(result.error || 'Failed to update status');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error(error.message || 'Failed to update status');
        }
    };

    if (!hasPermission(ADMIN_PERMISSIONS.MANAGE_CONTENT)) {
        return (
            <AdminLayout>
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <h2 style={{ color: 'var(--color-danger)' }}>Access Denied</h2>
                    <p>You don&apos;t have permission to manage resume template categories.</p>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="admin-dashboard">
                <div className="dashboard-header">
                    <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--color-heading-1)', margin: '0 0 8px 0' }}>Resume Template Categories</h1>
                    <p style={{ fontSize: '16px', color: 'var(--color-body)', margin: 0 }}>Manage categories for resume templates (Free, Simple, Premium, etc.)</p>
                </div>

                {/* Add New Category Button */}
                <div style={{ marginBottom: '20px' }}>
                    <button
                        onClick={openAddModal}
                        style={{
                            padding: '12px 24px',
                            backgroundColor: 'var(--color-primary)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '500'
                        }}
                    >
                        + Add New Category
                    </button>
                </div>

                {/* Categories List */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                        <div className="loading-spinner"></div>
                        <p style={{ marginTop: '16px', color: 'var(--color-body)' }}>Loading categories...</p>
                    </div>
                ) : (
                    <div className="activity-card">
                        <div style={{ padding: '24px' }}>
                            <div style={{ marginBottom: '20px' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: '500', color: 'var(--color-heading-1)', margin: '0 0 16px 0' }}>All Categories</h3>
                                <p style={{ fontSize: '14px', color: 'var(--color-body)', margin: 0 }}>Total categories: {categories.length}</p>
                            </div>
                            
                            {categories.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-body)' }}>
                                    <p>No categories found. Create your first category to get started.</p>
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <table style={{
                                        width: '100%',
                                        borderCollapse: 'collapse',
                                        background: '#fff',
                                        borderRadius: '8px',
                                        overflow: 'hidden'
                                    }}>
                                        <thead style={{ background: '#f8f9fa' }}>
                                            <tr>
                                                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', fontSize: '14px', color: 'var(--color-heading-1)', borderBottom: '1px solid #e9ecef' }}>Category Name</th>
                                                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', fontSize: '14px', color: 'var(--color-heading-1)', borderBottom: '1px solid #e9ecef' }}>Description</th>
                                                <th style={{ padding: '16px', textAlign: 'center', fontWeight: '600', fontSize: '14px', color: 'var(--color-heading-1)', borderBottom: '1px solid #e9ecef' }}>Templates</th>
                                                <th style={{ padding: '16px', textAlign: 'center', fontWeight: '600', fontSize: '14px', color: 'var(--color-heading-1)', borderBottom: '1px solid #e9ecef' }}>Status</th>
                                                <th style={{ padding: '16px', textAlign: 'center', fontWeight: '600', fontSize: '14px', color: 'var(--color-heading-1)', borderBottom: '1px solid #e9ecef' }}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {categories.map((category) => (
                                                <tr key={category.id} style={{ borderBottom: '1px solid #f8f9fa' }}>
                                                    <td style={{ padding: '16px', verticalAlign: 'top' }}>
                                                        <div style={{ fontWeight: '600', color: 'var(--color-heading-1)', marginBottom: '4px' }}>
                                                            {category.name}
                                                        </div>
                                                        <div style={{ fontSize: '12px', color: 'var(--color-body)' }}>
                                                            Slug: {category.slug}
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '16px', verticalAlign: 'top', color: 'var(--color-body)', fontSize: '14px' }}>
                                                        {category.description || <span style={{ fontStyle: 'italic', color: '#6c757d' }}>No description</span>}
                                                    </td>
                                                    <td style={{ padding: '16px', textAlign: 'center', verticalAlign: 'top' }}>
                                                        <span style={{ fontSize: '16px', fontWeight: '600', color: 'var(--color-heading-1)' }}>
                                                            {category.templateCount || 0}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '16px', textAlign: 'center', verticalAlign: 'top' }}>
                                                        <span style={{
                                                            padding: '6px 12px',
                                                            borderRadius: '20px',
                                                            fontSize: '12px',
                                                            fontWeight: '600',
                                                            textTransform: 'capitalize',
                                                            backgroundColor: category.status === 'active' ? '#d4edda' : '#f8d7da',
                                                            color: category.status === 'active' ? '#155724' : '#721c24',
                                                            cursor: 'pointer'
                                                        }}
                                                        onClick={() => toggleStatus(category)}
                                                        title="Click to toggle status"
                                                        >
                                                            {category.status}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '16px', textAlign: 'center', verticalAlign: 'top' }}>
                                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                                            <button
                                                                onClick={() => openEditModal(category)}
                                                                style={{
                                                                    padding: '6px 12px',
                                                                    backgroundColor: 'var(--color-primary)',
                                                                    color: '#fff',
                                                                    border: 'none',
                                                                    borderRadius: '4px',
                                                                    fontSize: '12px',
                                                                    cursor: 'pointer',
                                                                    fontWeight: '500'
                                                                }}
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                onClick={() => deleteCategory(category)}
                                                                style={{
                                                                    padding: '6px 12px',
                                                                    backgroundColor: '#dc3545',
                                                                    color: '#fff',
                                                                    border: 'none',
                                                                    borderRadius: '4px',
                                                                    fontSize: '12px',
                                                                    cursor: 'pointer',
                                                                    fontWeight: '500'
                                                                }}
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            {showAddModal && (
                <div className="modal-backdrop" onClick={closeModal}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h4 style={{ margin: 0 }}>{editingCategory ? 'Edit Category' : 'Add New Category'}</h4>
                            <button onClick={closeModal} className="modal-close">×</button>
                        </div>
                        <div className="modal-body">
                            <div>
                                <label>Category Name *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g., Free, Simple, Premium, Enterprise"
                                />
                            </div>
                            <div>
                                <label>Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Optional description for this category"
                                    rows={3}
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button onClick={closeModal} className="btn btn-secondary">Cancel</button>
                            <button onClick={saveCategory} className="btn btn-success">Save</button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
