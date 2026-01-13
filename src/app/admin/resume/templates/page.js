"use client";
import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAuth } from '@/contexts/AuthContext';
import { ADMIN_PERMISSIONS } from '@/utils/userRoleService';
import '../../admin.css';
import toast from 'react-hot-toast';

export default function ResumeTemplatesPage() {
    const { hasPermission } = useAuth();
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingStatus, setUpdatingStatus] = useState(null);
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        inactive: 0,
        draft: 0,
        totalDownloads: 0
    });

    // Local UI state: search/filter and edit modal
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [editingTemplate, setEditingTemplate] = useState(null);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [categories, setCategories] = useState([]);
    const [activeTab, setActiveTab] = useState('templates'); // 'templates' or 'categories'
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [categoryFormData, setCategoryFormData] = useState({ name: '', description: '' });
    const [categoriesLoading, setCategoriesLoading] = useState(false);

    // Fetch categories from API
    const fetchCategories = async () => {
        try {
            setCategoriesLoading(true);
            const response = await fetch('/api/admin/resume-template-categories');
            const result = await response.json();
            if (result.success && Array.isArray(result.data)) {
                setCategories(result.data);
                // Also update the filter dropdown with active categories only
                const activeCategories = result.data.filter(cat => cat.status === 'active');
                // This will be used for the template filter dropdown
            } else {
                setCategories([]);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            setCategories([]);
            toast.error('Failed to fetch categories');
        } finally {
            setCategoriesLoading(false);
        }
    };

    // Fetch templates from API
    const fetchTemplates = async () => {
        try {
            setLoading(true);
            console.log('🔄 Fetching resume templates...');

            const templatesRes = await fetch('/api/admin/resume-templates');
            const templatesJson = await templatesRes.json();
            
            // Try to fetch download stats, but don't fail if it doesn't exist
            let downloadsJson = { success: false, data: { totalDownloads: 0 } };
            try {
                const downloadsRes = await fetch('/api/admin/resume-templates/download');
                downloadsJson = await downloadsRes.json();
            } catch (error) {
                console.log('Download stats not available yet, using zero values');
            }

            if (templatesJson.success) {
                setTemplates(templatesJson.data);
                const totalDownloads = downloadsJson?.success ? (downloadsJson.stats?.totalDownloads || 0) : templatesJson.data.reduce((sum, t) => sum + (t.downloads || 0), 0);
                calculateStats(templatesJson.data, totalDownloads);
                console.log(`✅ Fetched ${templatesJson.data.length} templates`);
            } else {
                throw new Error(templatesJson.error || 'Failed to fetch templates');
            }
        } catch (error) {
            console.error('❌ Error fetching templates:', error);
            toast.error(`Failed to fetch templates: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    // Calculate statistics
    const calculateStats = (templateData, totalDownloadsOverride) => {
        const stats = {
            total: templateData.length,
            active: templateData.filter(t => t.status === 'active').length,
            inactive: templateData.filter(t => t.status === 'inactive').length,
            draft: templateData.filter(t => t.status === 'draft').length,
            totalDownloads: typeof totalDownloadsOverride === 'number' ? totalDownloadsOverride : templateData.reduce((sum, t) => sum + (t.downloads || 0), 0)
        };
        setStats(stats);
    };

    useEffect(() => {
        if (hasPermission(ADMIN_PERMISSIONS.MANAGE_CONTENT)) {
            fetchCategories();
            fetchTemplates();
        }
    }, [hasPermission]);

    // Category management functions
    const openCategoryModal = (category = null) => {
        if (category) {
            setCategoryFormData({ name: category.name, description: category.description || '' });
            setEditingCategory(category);
        } else {
            setCategoryFormData({ name: '', description: '' });
            setEditingCategory(null);
        }
        setShowCategoryModal(true);
    };

    const closeCategoryModal = () => {
        setShowCategoryModal(false);
        setEditingCategory(null);
        setCategoryFormData({ name: '', description: '' });
    };

    const saveCategory = async () => {
        if (!categoryFormData.name.trim()) {
            toast.error('Category name is required');
            return;
        }

        try {
            const url = '/api/admin/resume-template-categories';
            const method = editingCategory ? 'PUT' : 'POST';
            const body = editingCategory
                ? { id: editingCategory.id, ...categoryFormData }
                : categoryFormData;

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const result = await response.json();

            if (result.success) {
                toast.success(editingCategory ? 'Category updated' : 'Category created');
                closeCategoryModal();
                fetchCategories();
            } else {
                throw new Error(result.error || 'Failed to save category');
            }
        } catch (error) {
            console.error('Error saving category:', error);
            toast.error(error.message || 'Failed to save category');
        }
    };

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

    const toggleCategoryStatus = async (category) => {
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

    // Toggle template status
    const toggleStatus = async (templateId, currentStatus) => {
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';

        try {
            setUpdatingStatus(templateId);
            console.log(`🔄 Updating template ${templateId} status to ${newStatus}...`);

            const response = await fetch('/api/admin/resume-templates', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: templateId,
                    status: newStatus
                })
            });

            const result = await response.json();

            if (result.success) {
                toast.success(`Template ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
                // Update local state
                setTemplates(prev => prev.map(template =>
                    template.id === templateId
                        ? { ...template, status: newStatus }
                        : template
                ));
                // Recalculate stats
                const updatedTemplates = templates.map(template =>
                    template.id === templateId
                        ? { ...template, status: newStatus }
                        : template
                );
                calculateStats(updatedTemplates);
            } else {
                throw new Error(result.error || 'Failed to update template status');
            }
        } catch (error) {
            console.error('❌ Error updating template status:', error);
            toast.error(`Failed to update template: ${error.message}`);
        } finally {
            setUpdatingStatus(null);
        }
    };

    // Derived: filtered view (search + status + category)
    const filteredTemplates = templates.filter(t => {
        const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
        const matchesCategory = categoryFilter === 'all' || (t.category || '') === categoryFilter;
        const term = searchTerm.trim().toLowerCase();
        const matchesSearch = term.length === 0 || (
            (t.name || '').toLowerCase().includes(term) ||
            (t.description || '').toLowerCase().includes(term) ||
            (Array.isArray(t.tags) ? t.tags : []).some(tag => (tag || '').toLowerCase().includes(term))
        );
        return matchesStatus && matchesCategory && matchesSearch;
    });

    const openEdit = (template) => {
        try {
            if (!template || !template.id) {
                toast.error('Invalid template data');
                return;
            }
            // Ensure categories are loaded before opening edit
            if (!Array.isArray(categories) || categories.length === 0) {
                fetchCategories();
            }
            // Create a safe copy of the template with all required fields
            setEditingTemplate({
                id: template.id,
                name: template.name || '',
                category: template.category || '',
                description: template.description || '',
                imageUrl: template.imageUrl || '',
                status: template.status || 'active',
                tags: Array.isArray(template.tags) ? [...template.tags] : [],
                features: Array.isArray(template.features) ? [...template.features] : []
            });
        } catch (error) {
            console.error('Error opening edit modal:', error);
            toast.error('Failed to open edit modal: ' + error.message);
        }
    };
    const closeEdit = () => setEditingTemplate(null);

    const saveEdit = async () => {
        if (!editingTemplate || !editingTemplate.id) {
            toast.error('Invalid template data');
            return;
        }
        try {
            const response = await fetch('/api/admin/resume-templates', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: editingTemplate.id,
                    name: editingTemplate.name || '',
                    category: editingTemplate.category || '',
                    description: editingTemplate.description || '',
                    imageUrl: editingTemplate.imageUrl || '',
                    status: editingTemplate.status || 'active',
                    tags: Array.isArray(editingTemplate.tags) ? editingTemplate.tags : [],
                    features: Array.isArray(editingTemplate.features) ? editingTemplate.features : [],
                })
            });
            const result = await response.json();
            if (!result.success) throw new Error(result.error || 'Failed to update');
            toast.success('Template updated');
            closeEdit();
            fetchTemplates();
        } catch (e) {
            console.error('Error saving template:', e);
            toast.error(e.message || 'Failed to update template');
        }
    };

    if (!hasPermission(ADMIN_PERMISSIONS.MANAGE_CONTENT)) {
        return (
            <AdminLayout>
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <h2 style={{ color: 'var(--color-danger)' }}>Access Denied</h2>
                    <p>You don&apos;t have permission to manage resume templates.</p>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="admin-dashboard">
                <div className="dashboard-header">
                    <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--color-heading-1)', margin: '0 0 8px 0' }}>Resume Templates & Categories</h1>
                    <p style={{ fontSize: '16px', color: 'var(--color-body)', margin: 0 }}>Manage resume templates, categories, view download statistics, and control template availability</p>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '2px solid #e9ecef' }}>
                    <button
                        onClick={() => setActiveTab('templates')}
                        style={{
                            padding: '12px 24px',
                            background: 'none',
                            border: 'none',
                            borderBottom: activeTab === 'templates' ? '3px solid var(--color-primary)' : '3px solid transparent',
                            color: activeTab === 'templates' ? 'var(--color-primary)' : 'var(--color-body)',
                            fontWeight: activeTab === 'templates' ? '600' : '500',
                            cursor: 'pointer',
                            fontSize: '16px',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        📄 Templates
                    </button>
                    <button
                        onClick={() => setActiveTab('categories')}
                        style={{
                            padding: '12px 24px',
                            background: 'none',
                            border: 'none',
                            borderBottom: activeTab === 'categories' ? '3px solid var(--color-primary)' : '3px solid transparent',
                            color: activeTab === 'categories' ? 'var(--color-primary)' : 'var(--color-body)',
                            fontWeight: activeTab === 'categories' ? '600' : '500',
                            cursor: 'pointer',
                            fontSize: '16px',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        🏷️ Categories
                    </button>
                </div>

                {/* Statistics Cards */}
                {!loading && (
                    <div className="stats-grid" style={{ marginBottom: '30px' }}>
                        <div className="stat-card" style={{ borderLeftColor: 'var(--color-primary)' }}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <div style={{ flexShrink: 0 }}>
                                    <span style={{ fontSize: '24px' }}>📄</span>
                                </div>
                                <div style={{ marginLeft: '16px' }}>
                                    <p style={{ fontSize: '14px', fontWeight: '500', color: 'var(--color-body)', margin: '0 0 4px 0' }}>Total Templates</p>
                                    <p style={{ fontSize: '24px', fontWeight: '600', color: 'var(--color-heading-1)', margin: 0 }}>{stats.total}</p>
                                </div>
                            </div>
                        </div>

                        <div className="stat-card" style={{ borderLeftColor: 'var(--color-success)' }}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <div style={{ flexShrink: 0 }}>
                                    <span style={{ fontSize: '24px' }}>✅</span>
                                </div>
                                <div style={{ marginLeft: '16px' }}>
                                    <p style={{ fontSize: '14px', fontWeight: '500', color: 'var(--color-body)', margin: '0 0 4px 0' }}>Active Templates</p>
                                    <p style={{ fontSize: '24px', fontWeight: '600', color: 'var(--color-heading-1)', margin: 0 }}>{stats.active}</p>
                                </div>
                            </div>
                        </div>

                        <div className="stat-card" style={{ borderLeftColor: 'var(--color-warning)' }}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <div style={{ flexShrink: 0 }}>
                                    <span style={{ fontSize: '24px' }}>📊</span>
                                </div>
                                <div style={{ marginLeft: '16px' }}>
                                    <p style={{ fontSize: '14px', fontWeight: '500', color: 'var(--color-body)', margin: '0 0 4px 0' }}>Total Downloads</p>
                                    <p style={{ fontSize: '24px', fontWeight: '600', color: 'var(--color-heading-1)', margin: 0 }}>{stats.totalDownloads.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>

                        <div className="stat-card" style={{ borderLeftColor: '#6f42c1' }}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <div style={{ flexShrink: 0 }}>
                                    <span style={{ fontSize: '24px' }}>📝</span>
                                </div>
                                <div style={{ marginLeft: '16px' }}>
                                    <p style={{ fontSize: '14px', fontWeight: '500', color: 'var(--color-body)', margin: '0 0 4px 0' }}>Draft Templates</p>
                                    <p style={{ fontSize: '24px', fontWeight: '600', color: 'var(--color-heading-1)', margin: 0 }}>{stats.draft}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Categories Tab */}
                {activeTab === 'categories' && (
                    <>
                        <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h3 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--color-heading-1)', margin: '0 0 4px 0' }}>Template Categories</h3>
                                <p style={{ fontSize: '14px', color: 'var(--color-body)', margin: 0 }}>Manage categories for organizing resume templates</p>
                            </div>
                            <button
                                onClick={() => openCategoryModal()}
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

                        {categoriesLoading ? (
                            <div style={{ textAlign: 'center', padding: '40px' }}>
                                <div className="loading-spinner"></div>
                                <p style={{ marginTop: '16px', color: 'var(--color-body)' }}>Loading categories...</p>
                            </div>
                        ) : (
                            <div className="activity-card">
                                <div style={{ padding: '24px' }}>
                                    {categories.length === 0 ? (
                                        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-body)' }}>
                                            <p>No categories found. Create your first category to get started.</p>
                                        </div>
                                    ) : (
                                        <div className="table-responsive">
                                            <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '8px', overflow: 'hidden' }}>
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
                                                                <span
                                                                    onClick={() => toggleCategoryStatus(category)}
                                                                    style={{
                                                                        padding: '6px 12px',
                                                                        borderRadius: '20px',
                                                                        fontSize: '12px',
                                                                        fontWeight: '600',
                                                                        textTransform: 'capitalize',
                                                                        backgroundColor: category.status === 'active' ? '#d4edda' : '#f8d7da',
                                                                        color: category.status === 'active' ? '#155724' : '#721c24',
                                                                        cursor: 'pointer',
                                                                        display: 'inline-block'
                                                                    }}
                                                                    title="Click to toggle status"
                                                                >
                                                                    {category.status}
                                                                </span>
                                                            </td>
                                                            <td style={{ padding: '16px', textAlign: 'center', verticalAlign: 'top' }}>
                                                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                                                    <button
                                                                        onClick={() => openCategoryModal(category)}
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
                    </>
                )}

                {/* Templates Tab */}
                {activeTab === 'templates' && (
                    <>
                {/* Templates List */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                        <div className="loading-spinner"></div>
                        <p style={{ marginTop: '16px', color: 'var(--color-body)' }}>Loading templates...</p>
                    </div>
                ) : (
                    <div className="activity-card">
                        <div style={{ padding: '24px' }}>
                            <div style={{ marginBottom: '20px' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: '500', color: 'var(--color-heading-1)', margin: '0 0 16px 0' }}>Resume Templates</h3>
                                <p style={{ fontSize: '14px', color: 'var(--color-body)', margin: 0 }}>
                                    Manage template visibility and view usage statistics
                                </p>
                            </div>

                            {/* Controls: search + filter */}
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap' }}>
                                <input
                                    placeholder="Search name, description, tags"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{ padding: '8px 12px', border: '1px solid #e9ecef', borderRadius: '6px', minWidth: '240px' }}
                                />
                                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ padding: '8px 12px', border: '1px solid #e9ecef', borderRadius: '6px' }}>
                                    <option value="all">All Statuses</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="draft">Draft</option>
                                </select>
                                <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} style={{ padding: '8px 12px', border: '1px solid #e9ecef', borderRadius: '6px' }}>
                                    <option value="all">All Categories</option>
                                    {Array.isArray(categories) && categories.filter(cat => cat.status === 'active').map(cat => (
                                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="table-responsive">
                                <table style={{
                                    width: '100%',
                                    borderCollapse: 'collapse',
                                    background: '#fff',
                                    borderRadius: '8px',
                                    overflow: 'hidden',
                                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                                }}>
                                    <thead style={{ background: '#f8f9fa' }}>
                                        <tr>
                                            <th style={{
                                                padding: '16px',
                                                textAlign: 'left',
                                                fontWeight: '600',
                                                fontSize: '14px',
                                                color: 'var(--color-heading-1)',
                                                borderBottom: '1px solid #e9ecef'
                                            }}>
                                                Template Details
                                            </th>
                                            <th style={{
                                                padding: '16px',
                                                textAlign: 'left',
                                                fontWeight: '600',
                                                fontSize: '14px',
                                                color: 'var(--color-heading-1)',
                                                borderBottom: '1px solid #e9ecef'
                                            }}>
                                                Category
                                            </th>
                                            <th style={{
                                                padding: '16px',
                                                textAlign: 'center',
                                                fontWeight: '600',
                                                fontSize: '14px',
                                                color: 'var(--color-heading-1)',
                                                borderBottom: '1px solid #e9ecef'
                                            }}>
                                                Downloads
                                            </th>
                                            
                                            <th style={{
                                                padding: '16px',
                                                textAlign: 'center',
                                                fontWeight: '600',
                                                fontSize: '14px',
                                                color: 'var(--color-heading-1)',
                                                borderBottom: '1px solid #e9ecef'
                                            }}>
                                                Status
                                            </th>
                                            <th style={{
                                                padding: '16px',
                                                textAlign: 'center',
                                                fontWeight: '600',
                                                fontSize: '14px',
                                                color: 'var(--color-heading-1)',
                                                borderBottom: '1px solid #e9ecef'
                                            }}>
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredTemplates.map((template) => (
                                            <tr key={template.id} style={{
                                                borderBottom: '1px solid #f8f9fa',
                                                transition: 'background-color 0.3s ease'
                                            }}
                                            onMouseEnter={(e) => e.target.closest('tr').style.backgroundColor = '#f8f9fa'}
                                            onMouseLeave={(e) => e.target.closest('tr').style.backgroundColor = 'transparent'}
                                            >
                                                <td style={{ padding: '16px', verticalAlign: 'top' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                        <img
                                                            src={template.imageUrl}
                                                            alt={template.name}
                                                            className="template-image-mobile"
                                                            style={{
                                                                width: '60px',
                                                                height: '60px',
                                                                objectFit: 'cover',
                                                                borderRadius: '4px',
                                                                border: '1px solid #e9ecef'
                                                            }}
                                                        />
                                                        <div>
                                                            <div style={{
                                                                fontWeight: '600',
                                                                color: 'var(--color-heading-1)',
                                                                marginBottom: '4px'
                                                            }}
                                                            className="template-details-mobile"
                                                            >
                                                                {template.name}
                                                            </div>
                                                            <div style={{
                                                                fontSize: '12px',
                                                                color: 'var(--color-body)',
                                                                lineHeight: '1.4'
                                                            }}
                                                            className="template-details-mobile"
                                                            >
                                                                {template.description}
                                                            </div>
                                                            {template.tags && template.tags.length > 0 && (
                                                                <div style={{
                                                                    marginTop: '6px',
                                                                    display: 'flex',
                                                                    flexWrap: 'wrap',
                                                                    gap: '4px'
                                                                }}>
                                                                    {template.tags.slice(0, 3).map((tag, index) => (
                                                                        <span key={index} style={{
                                                                            fontSize: '10px',
                                                                            padding: '2px 6px',
                                                                            background: '#f0f0f0',
                                                                            borderRadius: '8px',
                                                                            color: 'var(--color-body)',
                                                                            fontWeight: '500'
                                                                        }}>
                                                                            {tag}
                                                                        </span>
                                                                    ))}
                                                                    {template.tags.length > 3 && (
                                                                        <span style={{
                                                                            fontSize: '10px',
                                                                            padding: '2px 6px',
                                                                            background: '#f0f0f0',
                                                                            borderRadius: '8px',
                                                                            color: 'var(--color-body)',
                                                                            fontWeight: '500'
                                                                        }}>
                                                                            +{template.tags.length - 3}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '16px', verticalAlign: 'top' }}>
                                                    <span style={{
                                                        padding: '4px 8px',
                                                        background: '#e9ecef',
                                                        borderRadius: '12px',
                                                        fontSize: '12px',
                                                        color: 'var(--color-body)',
                                                        fontWeight: '500'
                                                    }}>
                                                        {template.category}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '16px', textAlign: 'center', verticalAlign: 'top' }}>
                                                    <div style={{
                                                        fontSize: '16px',
                                                        fontWeight: '600',
                                                        color: 'var(--color-heading-1)'
                                                    }}>
                                                        {template.downloads?.toLocaleString() || 0}
                                                    </div>
                                                    <div style={{
                                                        fontSize: '12px',
                                                        color: 'var(--color-body)'
                                                    }}>
                                                        downloads
                                                    </div>
                                                </td>
                                                {/* Rating column removed from row */}
                                                <td style={{ padding: '16px', textAlign: 'center', verticalAlign: 'top' }}>
                                                    <span style={{
                                                        padding: '6px 12px',
                                                        borderRadius: '20px',
                                                        fontSize: '12px',
                                                        fontWeight: '600',
                                                        textTransform: 'capitalize',
                                                        backgroundColor: template.status === 'active' ? '#d4edda' :
                                                                       template.status === 'inactive' ? '#f8d7da' : '#fff3cd',
                                                        color: template.status === 'active' ? '#155724' :
                                                              template.status === 'inactive' ? '#721c24' : '#856404'
                                                    }}>
                                                        {template.status}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '16px', textAlign: 'center', verticalAlign: 'top' }}>
                                                    <div className="mobile-actions" style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                                                        <button
                                                            onClick={() => toggleStatus(template.id, template.status)}
                                                            disabled={updatingStatus === template.id}
                                                            className="mobile-action-btn"
                                                            style={{
                                                                padding: '8px 16px',
                                                                backgroundColor: template.status === 'active' ? '#dc3545' : '#28a745',
                                                                color: '#fff',
                                                                border: 'none',
                                                                borderRadius: '6px',
                                                                fontSize: '12px',
                                                                fontWeight: '500',
                                                                cursor: updatingStatus === template.id ? 'not-allowed' : 'pointer',
                                                                opacity: updatingStatus === template.id ? 0.6 : 1,
                                                                transition: 'all 0.3s ease',
                                                                minWidth: '80px'
                                                            }}
                                                        >
                                                            {updatingStatus === template.id ? '...' :
                                                             template.status === 'active' ? 'Deactivate' : 'Activate'}
                                                        </button>
                                                        <button
                                                            className="mobile-action-btn"
                                                            style={{
                                                                padding: '6px 12px',
                                                                backgroundColor: '#198754',
                                                                color: '#fff',
                                                                border: 'none',
                                                                borderRadius: '4px',
                                                                fontSize: '11px',
                                                                cursor: 'pointer',
                                                                fontWeight: '500'
                                                            }}
                                                            onClick={() => openEdit(template)}
                                                        >
                                                            Edit
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
                    </>
                )}
            </div>

            {/* Category Modal */}
            {showCategoryModal && (
                <div className="modal-backdrop" onClick={closeCategoryModal}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h4 style={{ margin: 0 }}>{editingCategory ? 'Edit Category' : 'Add New Category'}</h4>
                            <button onClick={closeCategoryModal} className="modal-close">×</button>
                        </div>
                        <div className="modal-body">
                            <div>
                                <label>Category Name *</label>
                                <input
                                    type="text"
                                    value={categoryFormData.name}
                                    onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                                    placeholder="e.g., Free, Simple, Premium, Enterprise"
                                />
                            </div>
                            <div>
                                <label>Description</label>
                                <textarea
                                    value={categoryFormData.description}
                                    onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
                                    placeholder="Optional description for this category"
                                    rows={3}
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button onClick={closeCategoryModal} className="btn btn-secondary">Cancel</button>
                            <button onClick={saveCategory} className="btn btn-success">Save</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Template Modal */}
            {editingTemplate && editingTemplate.id && (
                <div className="modal-backdrop" onClick={closeEdit} style={{ zIndex: 2000, position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="modal" onClick={(e) => e.stopPropagation()} style={{ zIndex: 2001, maxWidth: '900px', backgroundColor: '#fff', borderRadius: '12px', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                        <div className="modal-header">
                            <h4 style={{ margin: 0 }}>Edit: {editingTemplate?.name || 'Template'}</h4>
                            <button onClick={closeEdit} className="modal-close">×</button>
                        </div>
                        <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <div>
                                <label>Name</label>
                                <input 
                                    value={editingTemplate?.name || ''} 
                                    onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })} 
                                />
                            </div>
                            <div>
                                <label>Category *</label>
                                <select 
                                    value={editingTemplate?.category || ''} 
                                    onChange={(e) => editingTemplate && setEditingTemplate({ ...editingTemplate, category: e.target.value })}
                                >
                                    <option value="">Select a category</option>
                                    {Array.isArray(categories) && categories.filter(cat => cat && cat.status === 'active').length > 0 ? (
                                        categories.filter(cat => cat && cat.status === 'active').map(cat => (
                                            <option key={cat.id || cat.name} value={cat.name}>{cat.name}</option>
                                        ))
                                    ) : (
                                        <option value="" disabled>No categories available. Switch to Categories tab to add categories.</option>
                                    )}
                                </select>
                                <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--color-body)' }}>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            closeEdit();
                                            setActiveTab('categories');
                                        }}
                                        style={{ 
                                            background: 'none', 
                                            border: 'none', 
                                            color: 'var(--color-primary)', 
                                            textDecoration: 'underline',
                                            cursor: 'pointer',
                                            padding: 0,
                                            fontSize: '12px'
                                        }}
                                    >
                                        Manage categories →
                                    </button>
                                </div>
                            </div>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label>Description</label>
                                <textarea 
                                    value={editingTemplate?.description || ''} 
                                    onChange={(e) => setEditingTemplate({ ...editingTemplate, description: e.target.value })} 
                                />
                            </div>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label>Image URL</label>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8, alignItems: 'center' }}>
                                    <input
                                        placeholder="/assets/... or https://example.com/image.png"
                                        value={editingTemplate?.imageUrl || ''}
                                        onChange={(e) => setEditingTemplate({ ...editingTemplate, imageUrl: e.target.value })}
                                    />
                                    <label className="btn btn-primary" style={{ margin: 0, cursor: 'pointer' }}>
                                        {uploadingImage ? 'Uploading...' : 'Upload'}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            style={{ display: 'none' }}
                                            onChange={async (e) => {
                                                if (!e.target.files || !e.target.files[0]) return;
                                                try {
                                                    setUploadingImage(true);
                                                    const file = e.target.files[0];
                                                    const formData = new FormData();
                                                    formData.append('image', file);
                                                    formData.append('type', 'resumes');
                                                    const res = await fetch('/api/upload-image', { method: 'POST', body: formData });
                                                    const json = await res.json();
                                                    if (!json.success) throw new Error(json.error || 'Upload failed');
                                    const url = json?.data?.url;
                                    if (url && editingTemplate) {
                                        setEditingTemplate({ ...editingTemplate, imageUrl: url });
                                    }
                                    toast.success('Image uploaded');
                                                } catch (err) {
                                                    console.error(err);
                                                    toast.error(err.message || 'Failed to upload');
                                                } finally {
                                                    setUploadingImage(false);
                                                    e.target.value = '';
                                                }
                                            }}
                                        />
                                    </label>
                                </div>
                                <div style={{ marginTop: 8, fontSize: 12, color: 'var(--color-body)' }}>
                                    You can paste an external URL (https://...) or upload an image. Uploaded files are stored under /public/uploads/resumes.
                                </div>
                                {editingTemplate?.imageUrl && (
                                    <div style={{ marginTop: 10 }}>
                                        <img src={editingTemplate.imageUrl} alt="Template preview" style={{ maxWidth: '100%', border: '1px solid #e9ecef', borderRadius: 6 }} />
                                    </div>
                                )}
                            </div>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label>Status</label>
                                <select 
                                    value={editingTemplate?.status || 'active'} 
                                    onChange={(e) => setEditingTemplate({ ...editingTemplate, status: e.target.value })}
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="draft">Draft</option>
                                </select>
                            </div>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label>Tags (comma separated)</label>
                                <input 
                                    value={(editingTemplate?.tags || []).join(', ')} 
                                    onChange={(e) => setEditingTemplate({ ...editingTemplate, tags: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} 
                                />
                            </div>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label>Features (one per line)</label>
                                <textarea 
                                    value={(editingTemplate?.features || []).join('\n')} 
                                    onChange={(e) => setEditingTemplate({ ...editingTemplate, features: e.target.value.split('\n').map(s => s.trim()).filter(Boolean) })} 
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button onClick={saveEdit} className="btn btn-success">Save</button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
} 
