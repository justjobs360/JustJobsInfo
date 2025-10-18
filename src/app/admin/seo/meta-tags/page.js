"use client";
import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAuth } from '@/contexts/AuthContext';
import { ADMIN_PERMISSIONS } from '@/utils/userRoleService';
import toast from 'react-hot-toast';
import '../../admin.css';

export default function MetaTagsPage() {
    const { hasPermission } = useAuth();
    const [metaTags, setMetaTags] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingTag, setEditingTag] = useState(null);
    const [formData, setFormData] = useState({
        page: '',
        title: '',
        description: '',
        keywords: '',
        ogImage: '',
        author: 'JustJobsInfo Team',
        publishDate: new Date().toISOString().split('T')[0],
        ogType: 'website',
        status: 'active'
    });
    const [saving, setSaving] = useState(false);
    const [validation, setValidation] = useState({
        titleLength: 0,
        descriptionLength: 0,
        isDuplicate: false,
        duplicatePage: null
    });

    useEffect(() => {
        loadMetaTags();
    }, []);

    // Real-time validation effect
    useEffect(() => {
        const titleLength = formData.title.length;
        const descriptionLength = formData.description.length;
        
        // Check for duplicates
        const duplicate = metaTags.find(tag => 
            tag.page.toLowerCase() === formData.page.toLowerCase().trim() &&
            (!editingTag || tag.id !== editingTag.id)
        );
        
        setValidation({
            titleLength,
            descriptionLength,
            isDuplicate: !!duplicate,
            duplicatePage: duplicate?.page || null
        });
    }, [formData.title, formData.description, formData.page, metaTags, editingTag]);

    // Validation helper functions
    const getTitleStatus = () => {
        const len = validation.titleLength;
        if (len === 0) return { color: '#666', text: 'Enter a title', status: 'empty' };
        if (len < 50) return { color: '#dc3545', text: 'Too short (min 50 chars)', status: 'error' };
        if (len >= 50 && len <= 60) return { color: '#28a745', text: 'Perfect length!', status: 'success' };
        if (len > 60 && len <= 70) return { color: '#ffc107', text: 'Acceptable but a bit long', status: 'warning' };
        return { color: '#dc3545', text: 'Too long (max 70 chars)', status: 'error' };
    };

    const getDescriptionStatus = () => {
        const len = validation.descriptionLength;
        if (len === 0) return { color: '#666', text: 'Enter a description', status: 'empty' };
        if (len < 120) return { color: '#dc3545', text: 'Too short (min 120 chars)', status: 'error' };
        if (len >= 120 && len <= 160) return { color: '#28a745', text: 'Perfect length!', status: 'success' };
        if (len > 160 && len <= 180) return { color: '#ffc107', text: 'Acceptable but a bit long', status: 'warning' };
        return { color: '#dc3545', text: 'Too long (max 180 chars)', status: 'error' };
    };

    const loadMetaTags = async () => {
        try {
            setLoading(true);
            console.log('📋 Loading meta tags from API...');
            
            const response = await fetch('/api/admin/meta-tags', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            
            const result = await response.json();
            
            if (result.success) {
                setMetaTags(result.data);
                console.log('✅ Meta tags loaded successfully:', result.data.length, 'tags');
            } else {
                throw new Error(result.error || 'Failed to load meta tags');
            }
        } catch (error) {
            console.error('❌ Error loading meta tags:', error);
            toast.error('Failed to load meta tags: ' + error.message);
            
            // Set empty array as fallback
            setMetaTags([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            
            // Validate form
            if (!formData.page.trim() || !formData.title.trim() || !formData.description.trim()) {
                toast.error('Page, title, and description are required');
                return;
            }

            console.log('💾 Saving meta tag...', editingTag ? 'UPDATE' : 'CREATE');
            
            const method = editingTag ? 'PUT' : 'POST';
            const payload = editingTag ? { id: editingTag.id, ...formData } : formData;
            
            const response = await fetch('/api/admin/meta-tags', {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (result.success) {
                toast.success(result.message || (editingTag ? 'Meta tag updated successfully!' : 'Meta tag created successfully!'));
                
                // Reload meta tags to get the latest data
                await loadMetaTags();
                
                // Reset form
                setFormData({
                    page: '',
                    title: '',
                    description: '',
                    keywords: '',
                    ogImage: '',
                    author: 'JustJobsInfo Team',
                    publishDate: new Date().toISOString().split('T')[0],
                    ogType: 'website',
                    status: 'active'
                });
                setShowForm(false);
                setEditingTag(null);
            } else {
                throw new Error(result.error || 'Failed to save meta tag');
            }
        } catch (error) {
            console.error('❌ Error saving meta tag:', error);
            toast.error('Failed to save meta tag: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (tag) => {
        setEditingTag(tag);
        setFormData({
            page: tag.page,
            title: tag.title,
            description: tag.description,
            keywords: tag.keywords,
            ogImage: tag.ogImage,
            author: tag.author || 'JustJobsInfo Team',
            publishDate: tag.publishDate ? new Date(tag.publishDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            ogType: tag.ogType || 'website',
            status: tag.status
        });
        setShowForm(true);
    };

    const handleDelete = async (tagId) => {
        if (confirm('Are you sure you want to delete this meta tag?')) {
            try {
                console.log('🗑️ Deleting meta tag:', tagId);
                
                const response = await fetch(`/api/admin/meta-tags?id=${tagId}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                const result = await response.json();

                if (result.success) {
                    toast.success('Meta tag deleted successfully');
                    // Reload meta tags to get the latest data
                    await loadMetaTags();
                } else {
                    throw new Error(result.error || 'Failed to delete meta tag');
                }
            } catch (error) {
                console.error('❌ Error deleting meta tag:', error);
                toast.error('Failed to delete meta tag: ' + error.message);
            }
        }
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingTag(null);
        setFormData({
            page: '',
            title: '',
            description: '',
            keywords: '',
            ogImage: '',
            author: 'JustJobsInfo Team',
            publishDate: new Date().toISOString().split('T')[0],
            ogType: 'website',
            status: 'active'
        });
    };

    if (!hasPermission(ADMIN_PERMISSIONS.MANAGE_META_TAGS)) {
        return (
            <AdminLayout>
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <h2 style={{ color: 'var(--color-danger)' }}>Access Denied</h2>
                    <p>You don&apos;t have permission to manage meta tags.</p>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="admin-dashboard">
                <div className="dashboard-header">
                    <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--color-heading-1)', margin: '0 0 8px 0' }}>Meta Tags Management</h1>
                    <p style={{ fontSize: '16px', color: 'var(--color-body)', margin: 0 }}>Manage meta tags and SEO elements for all pages</p>
                    
                    {/* Quick Links */}
                    <div style={{ marginTop: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <a 
                            href="/admin/seo/settings"
                            style={{
                                padding: '8px 16px',
                                backgroundColor: 'var(--color-secondary)',
                                color: '#fff',
                                textDecoration: 'none',
                                borderRadius: '4px',
                                fontSize: '14px',
                                fontWeight: '500',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            ⚙️ SEO Settings
                        </a>
                        <a 
                            href="/admin/seo/sitemap"
                            style={{
                                padding: '8px 16px',
                                backgroundColor: 'var(--color-warning)',
                                color: '#fff',
                                textDecoration: 'none',
                                borderRadius: '4px',
                                fontSize: '14px',
                                fontWeight: '500',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            🗺️ Manage Sitemap
                        </a>
                        <a 
                            href="/admin/seo/robots"
                            style={{
                                padding: '8px 16px',
                                backgroundColor: 'var(--color-info)',
                                color: '#fff',
                                textDecoration: 'none',
                                borderRadius: '4px',
                                fontSize: '14px',
                                fontWeight: '500',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            🤖 Manage Robots.txt
                        </a>
                    </div>
                </div>

                {/* Add New Meta Tag Button */}
                <div style={{ marginBottom: '20px' }}>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        style={{
                            padding: '12px 24px',
                            backgroundColor: 'var(--color-primary)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '500',
                            minWidth: '200px'
                        }}
                    >
                        {showForm ? 'Cancel' : '+ Add New Meta Tag'}
                    </button>
                </div>

                {/* Add/Edit Form */}
                {showForm && (
                    <div className="activity-card" style={{ marginBottom: '20px' }}>
                        <div style={{ padding: '24px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: '500', color: 'var(--color-heading-1)', margin: '0 0 20px 0' }}>
                                {editingTag ? 'Edit Meta Tag' : 'Add New Meta Tag'}
                            </h3>
                            
                            <div style={{ display: 'grid', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Page Name:</label>
                                    <input
                                        type="text"
                                        list="page-suggestions"
                                        value={formData.page}
                                        onChange={(e) => setFormData({...formData, page: e.target.value})}
                                        style={{
                                            width: '100%',
                                            padding: '8px 12px',
                                            border: '1px solid #ddd',
                                            borderRadius: '4px',
                                            fontSize: '14px'
                                        }}
                                        placeholder="e.g., Home, About Us, Contact"
                                    />
                                    <datalist id="page-suggestions">
                                        <option value="Home" />
                                        <option value="About Us" />
                                        <option value="Services" />
                                        <option value="Resume Audit" />
                                        <option value="Contact" />
                                        <option value="Blogs" />
                                        <option value="Privacy Policy" />
                                        <option value="Terms of Service" />
                                        <option value="Career Resources" />
                                        <option value="Job Search Tips" />
                                        <option value="Resume Templates" />
                                    </datalist>
                                    <small style={{ color: '#666', fontSize: '12px' }}>
                                        💡 Choose from suggestions or enter a custom page name
                                    </small>
                                </div>
                                
                                <div>
                                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Title:</label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                                        style={{
                                            width: '100%',
                                            padding: '8px 12px',
                                            border: `2px solid ${getTitleStatus().status === 'success' ? '#28a745' : getTitleStatus().status === 'error' ? '#dc3545' : getTitleStatus().status === 'warning' ? '#ffc107' : '#ddd'}`,
                                            borderRadius: '4px',
                                            fontSize: '14px'
                                        }}
                                        placeholder="Page title for SEO"
                                    />
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '12px' }}>
                                        <span style={{ color: getTitleStatus().color, fontWeight: '500' }}>
                                            {getTitleStatus().text}
                                        </span>
                                        <span style={{ color: getTitleStatus().color }}>
                                            {validation.titleLength} / 60 chars {getTitleStatus().status === 'success' && '✓'}
                                        </span>
                                    </div>
                                </div>
                                
                                <div>
                                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Description:</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                                        rows="3"
                                        style={{
                                            width: '100%',
                                            padding: '8px 12px',
                                            border: `2px solid ${getDescriptionStatus().status === 'success' ? '#28a745' : getDescriptionStatus().status === 'error' ? '#dc3545' : getDescriptionStatus().status === 'warning' ? '#ffc107' : '#ddd'}`,
                                            borderRadius: '4px',
                                            fontSize: '14px',
                                            resize: 'vertical'
                                        }}
                                        placeholder="Meta description for SEO"
                                    />
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '12px' }}>
                                        <span style={{ color: getDescriptionStatus().color, fontWeight: '500' }}>
                                            {getDescriptionStatus().text}
                                        </span>
                                        <span style={{ color: getDescriptionStatus().color }}>
                                            {validation.descriptionLength} / 160 chars {getDescriptionStatus().status === 'success' && '✓'}
                                        </span>
                                    </div>
                                </div>
                                
                                <div>
                                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Keywords:</label>
                                    <input
                                        type="text"
                                        value={formData.keywords}
                                        onChange={(e) => setFormData({...formData, keywords: e.target.value})}
                                        style={{
                                            width: '100%',
                                            padding: '8px 12px',
                                            border: '1px solid #ddd',
                                            borderRadius: '4px',
                                            fontSize: '14px'
                                        }}
                                        placeholder="keyword1, keyword2, keyword3"
                                    />
                                </div>
                                
                                <div>
                                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>OG Image URL:</label>
                                    <input
                                        type="text"
                                        value={formData.ogImage}
                                        onChange={(e) => setFormData({...formData, ogImage: e.target.value})}
                                        style={{
                                            width: '100%',
                                            padding: '8px 12px',
                                            border: '1px solid #ddd',
                                            borderRadius: '4px',
                                            fontSize: '14px'
                                        }}
                                        placeholder="/assets/images/og-images/og-home.webp"
                                    />
                                    <small style={{ color: '#666', fontSize: '12px', display: 'block', marginTop: '4px' }}>
                                        💡 Recommended: 1200x630px image. Available OG images: og-home.webp, og-about.webp, og-contact.webp, og-blog.webp, og-services.webp, etc.
                                    </small>
                                </div>
                                
                                <div>
                                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Author:</label>
                                    <input
                                        type="text"
                                        value={formData.author}
                                        onChange={(e) => setFormData({...formData, author: e.target.value})}
                                        style={{
                                            width: '100%',
                                            padding: '8px 12px',
                                            border: '1px solid #ddd',
                                            borderRadius: '4px',
                                            fontSize: '14px'
                                        }}
                                        placeholder="Author name"
                                    />
                                    <small style={{ color: '#666', fontSize: '12px' }}>
                                        💡 For blog posts, use the actual author name. For pages, use &quot;JustJobsInfo Team&quot;
                                    </small>
                                </div>
                                
                                <div>
                                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Publish Date:</label>
                                    <input
                                        type="date"
                                        value={formData.publishDate}
                                        onChange={(e) => setFormData({...formData, publishDate: e.target.value})}
                                        style={{
                                            width: '100%',
                                            padding: '8px 12px',
                                            border: '1px solid #ddd',
                                            borderRadius: '4px',
                                            fontSize: '14px'
                                        }}
                                    />
                                    <small style={{ color: '#666', fontSize: '12px' }}>
                                        💡 Used for social media and article meta tags
                                    </small>
                                </div>
                                
                                <div>
                                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Open Graph Type:</label>
                                    <select
                                        value={formData.ogType}
                                        onChange={(e) => setFormData({...formData, ogType: e.target.value})}
                                        style={{
                                            width: '100%',
                                            padding: '8px 12px',
                                            border: '1px solid #ddd',
                                            borderRadius: '4px',
                                            fontSize: '14px'
                                        }}
                                    >
                                        <option value="website">Website</option>
                                        <option value="article">Article</option>
                                        <option value="blog">Blog</option>
                                    </select>
                                    <small style={{ color: '#666', fontSize: '12px' }}>
                                        💡 Use &quot;article&quot; for blog posts, &quot;website&quot; for regular pages
                                    </small>
                                </div>
                                
                                <div>
                                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Status:</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                                        style={{
                                            width: '100%',
                                            padding: '8px 12px',
                                            border: '1px solid #ddd',
                                            borderRadius: '4px',
                                            fontSize: '14px'
                                        }}
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>

                                {/* Validation Warnings */}
                                {validation.isDuplicate && (
                                    <div style={{ 
                                        padding: '12px', 
                                        backgroundColor: '#fff3cd', 
                                        border: '1px solid #ffc107', 
                                        borderRadius: '4px',
                                        color: '#856404',
                                        fontSize: '14px'
                                    }}>
                                        ⚠️ <strong>Duplicate Page:</strong> A meta tag for &quot;{validation.duplicatePage}&quot; already exists. {!editingTag && 'This will create a duplicate entry.'}
                                    </div>
                                )}

                                {!formData.ogImage && (
                                    <div style={{ 
                                        padding: '12px', 
                                        backgroundColor: '#d1ecf1', 
                                        border: '1px solid #bee5eb', 
                                        borderRadius: '4px',
                                        color: '#0c5460',
                                        fontSize: '14px'
                                    }}>
                                        ℹ️ <strong>Missing OG Image:</strong> Adding an Open Graph image (1200x630px) improves social media sharing appearance.
                                    </div>
                                )}
                                
                                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        style={{
                                            padding: '10px 20px',
                                            backgroundColor: saving ? '#ccc' : 'var(--color-success)',
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: saving ? 'not-allowed' : 'pointer',
                                            fontSize: '14px',
                                            fontWeight: '500'
                                        }}
                                    >
                                        {saving ? 'Saving...' : (editingTag ? 'Update' : 'Create')}
                                    </button>
                                    <button
                                        onClick={handleCancel}
                                        style={{
                                            padding: '10px 20px',
                                            backgroundColor: '#6c757d',
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontSize: '14px',
                                            fontWeight: '500'
                                        }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Meta Tags List */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                        <div className="loading-spinner"></div>
                        <p style={{ marginTop: '16px' }}>Loading meta tags...</p>
                    </div>
                ) : (
                    <div className="activity-card">
                        <div style={{ padding: '24px' }}>
                            <div style={{ marginBottom: '20px' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: '500', color: 'var(--color-heading-1)', margin: '0 0 16px 0' }}>All Meta Tags</h3>
                                <p style={{ fontSize: '14px', color: 'var(--color-body)', margin: 0 }}>Total meta tags: {metaTags.length}</p>
                            </div>
                            
                            <div className="activity-list">
                                {metaTags.map((tag) => (
                                    <div key={tag.id} className="activity-item">
                                        <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                                            <span style={{ fontSize: '14px', color: 'var(--color-body)', marginRight: '12px' }}>🏷️</span>
                                            <div style={{ flex: 1 }}>
                                                <p style={{ fontSize: '14px', fontWeight: '500', color: 'var(--color-heading-1)', margin: '0 0 2px 0' }}>{tag.page}</p>
                                                <p style={{ fontSize: '12px', color: 'var(--color-body)', margin: '0 0 4px 0' }}>
                                                    Title: {tag.title.substring(0, 60)}...
                                                </p>
                                                <p style={{ fontSize: '12px', color: 'var(--color-body)', margin: 0 }}>
                                                    Description: {tag.description.substring(0, 80)}...
                                                </p>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <span style={{ 
                                                fontSize: '12px', 
                                                padding: '4px 8px', 
                                                borderRadius: '12px',
                                                backgroundColor: tag.status === 'active' ? 'var(--color-success)' : '#6c757d',
                                                color: '#fff'
                                            }}>
                                                {tag.status}
                                            </span>
                                            <button
                                                onClick={() => handleEdit(tag)}
                                                style={{
                                                    padding: '4px 8px',
                                                    backgroundColor: 'var(--color-primary)',
                                                    color: '#fff',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    fontSize: '12px',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(tag.id)}
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
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
} 
