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
        status: 'active'
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadMetaTags();
    }, []);

    const loadMetaTags = async () => {
        try {
            setLoading(true);
            // Load from localStorage
            const savedTags = localStorage.getItem('meta_tags');
            if (savedTags) {
                setMetaTags(JSON.parse(savedTags));
            } else {
                // Set default meta tags
                const defaultTags = [
                    { 
                        id: 1, 
                        page: 'Home', 
                        title: 'JustJobsInfo - Professional Resume and Career Services',
                        description: 'Professional resume writing services, career guidance, and job search resources',
                        keywords: 'resume writing, career services, job search, professional development',
                        ogImage: '/images/og-home.jpg',
                        status: 'active'
                    },
                    { 
                        id: 2, 
                        page: 'About Us', 
                        title: 'About JustJobsInfo - Our Story and Mission',
                        description: 'Learn about JustJobsInfo and our mission to help professionals succeed in their careers',
                        keywords: 'about us, company, mission, career services',
                        ogImage: '/images/og-about.jpg',
                        status: 'active'
                    },
                    { 
                        id: 3, 
                        page: 'Resume Audit', 
                        title: 'Free Resume Audit - Professional Resume Review',
                        description: 'Get a free professional resume audit and improve your chances of landing your dream job',
                        keywords: 'resume audit, resume review, free resume check',
                        ogImage: '/images/og-resume-audit.jpg',
                        status: 'active'
                    },
                    { 
                        id: 4, 
                        page: 'Contact', 
                        title: 'Contact JustJobsInfo - Get in Touch',
                        description: 'Contact JustJobsInfo for professional resume services and career guidance',
                        keywords: 'contact, get in touch, resume services',
                        ogImage: '/images/og-contact.jpg',
                        status: 'active'
                    }
                ];
                setMetaTags(defaultTags);
                localStorage.setItem('meta_tags', JSON.stringify(defaultTags));
            }
        } catch (error) {
            console.error('Error loading meta tags:', error);
            toast.error('Failed to load meta tags');
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

            let updatedTags;
            if (editingTag) {
                // Update existing tag
                updatedTags = metaTags.map(tag => 
                    tag.id === editingTag.id ? { ...formData, id: editingTag.id } : tag
                );
                toast.success('Meta tag updated successfully');
            } else {
                // Add new tag
                const newTag = {
                    ...formData,
                    id: Date.now() // Simple ID generation
                };
                updatedTags = [...metaTags, newTag];
                toast.success('Meta tag created successfully');
            }

            setMetaTags(updatedTags);
            localStorage.setItem('meta_tags', JSON.stringify(updatedTags));
            
            // Reset form
            setFormData({
                page: '',
                title: '',
                description: '',
                keywords: '',
                ogImage: '',
                status: 'active'
            });
            setShowForm(false);
            setEditingTag(null);
        } catch (error) {
            console.error('Error saving meta tag:', error);
            toast.error('Failed to save meta tag');
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
            status: tag.status
        });
        setShowForm(true);
    };

    const handleDelete = async (tagId) => {
        if (confirm('Are you sure you want to delete this meta tag?')) {
            try {
                const updatedTags = metaTags.filter(tag => tag.id !== tagId);
                setMetaTags(updatedTags);
                localStorage.setItem('meta_tags', JSON.stringify(updatedTags));
                toast.success('Meta tag deleted successfully');
            } catch (error) {
                console.error('Error deleting meta tag:', error);
                toast.error('Failed to delete meta tag');
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
                                            border: '1px solid #ddd',
                                            borderRadius: '4px',
                                            fontSize: '14px'
                                        }}
                                        placeholder="Page title for SEO"
                                    />
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
                                            border: '1px solid #ddd',
                                            borderRadius: '4px',
                                            fontSize: '14px',
                                            resize: 'vertical'
                                        }}
                                        placeholder="Meta description for SEO"
                                    />
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
                                        type="url"
                                        value={formData.ogImage}
                                        onChange={(e) => setFormData({...formData, ogImage: e.target.value})}
                                        style={{
                                            width: '100%',
                                            padding: '8px 12px',
                                            border: '1px solid #ddd',
                                            borderRadius: '4px',
                                            fontSize: '14px'
                                        }}
                                        placeholder="/images/og-image.jpg"
                                    />
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