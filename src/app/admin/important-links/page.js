"use client";
import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAuth } from '@/contexts/AuthContext';
import { ADMIN_PERMISSIONS } from '@/utils/userRoleService';
import '../admin.css';

export default function ImportantLinksPage() {
    const { hasPermission } = useAuth();
    const [importantLinks, setImportantLinks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editingLink, setEditingLink] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        subtitle: '',
        category: '',
        status: 'active',
        links: []
    });

    const fetchImportantLinks = async () => {
        try {
            setLoading(true);
            setError(null);
            
            console.log('📡 Fetching important links from API...');
            const response = await fetch('/api/important-links');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (result.success) {
                console.log('✅ Successfully fetched important links:', result.data.length);
                setImportantLinks(result.data);
            } else {
                throw new Error(result.message || 'Failed to fetch important links');
            }
        } catch (error) {
            console.error('❌ Error fetching important links:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleLinkChange = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            links: prev.links.map((link, i) => 
                i === index ? { ...link, [field]: value } : link
            )
        }));
    };

    const addLink = () => {
        setFormData(prev => ({
            ...prev,
            links: [...prev.links, { name: '', url: '', description: '' }]
        }));
    };

    const removeLink = (index) => {
        setFormData(prev => ({
            ...prev,
            links: prev.links.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const url = editingLink ? `/api/important-links/${editingLink._id}` : '/api/important-links';
            const method = editingLink ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            if (result.success) {
                console.log('✅ Successfully saved important link');
                setShowForm(false);
                setEditingLink(null);
                setFormData({
                    title: '',
                    subtitle: '',
                    category: '',
                    status: 'active',
                    links: []
                });
                fetchImportantLinks();
            } else {
                throw new Error(result.message || 'Failed to save important link');
            }
        } catch (error) {
            console.error('❌ Error saving important link:', error);
            setError(error.message);
        }
    };

    const handleEdit = (link) => {
        setEditingLink(link);
        setFormData({
            title: link.title,
            subtitle: link.subtitle,
            category: link.category,
            status: link.status,
            links: link.links || []
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this important link?')) {
            return;
        }

        try {
            const response = await fetch(`/api/important-links/${id}`, {
                method: 'DELETE',
            });

            const result = await response.json();

            if (result.success) {
                console.log('✅ Successfully deleted important link');
                fetchImportantLinks();
            } else {
                throw new Error(result.message || 'Failed to delete important link');
            }
        } catch (error) {
            console.error('❌ Error deleting important link:', error);
            setError(error.message);
        }
    };

    const resetForm = () => {
        setShowForm(false);
        setEditingLink(null);
        setFormData({
            title: '',
            subtitle: '',
            category: '',
            status: 'active',
            links: []
        });
    };

    useEffect(() => {
        fetchImportantLinks();
    }, []);

    if (!hasPermission(ADMIN_PERMISSIONS.MANAGE_CONTENT)) {
        return (
            <AdminLayout>
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <h2 style={{ color: 'var(--color-danger)' }}>Access Denied</h2>
                    <p>You don't have permission to manage important links.</p>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="admin-dashboard">
                <div className="dashboard-header">
                    <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--color-heading-1)', margin: '0 0 8px 0' }}>Important Links Management</h1>
                    <p style={{ fontSize: '16px', color: 'var(--color-body)', margin: 0 }}>Add, edit, and manage important links for job seekers</p>
                </div>

                {/* Add New Link Button */}
                <div style={{ marginBottom: '20px' }}>
                    <button
                        onClick={() => setShowForm(true)}
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
                        + Add New Link Category
                    </button>
                </div>

                {/* Error Message */}
                {error && (
                    <div style={{ 
                        padding: '15px', 
                        backgroundColor: '#f8d7da', 
                        color: '#721c24', 
                        border: '1px solid #f5c6cb', 
                        borderRadius: '4px', 
                        marginBottom: '20px' 
                    }}>
                        <strong>Error:</strong> {error}
                    </div>
                )}

                {/* Add/Edit Form */}
                {showForm && (
                    <div className="activity-card" style={{ marginBottom: '20px' }}>
                        <div style={{ padding: '24px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: '500', color: 'var(--color-heading-1)', margin: '0 0 16px 0' }}>
                                {editingLink ? 'Edit Link Category' : 'Add New Link Category'}
                            </h3>
                            
                            <form onSubmit={handleSubmit}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>Title</label>
                                        <input
                                            type="text"
                                            name="title"
                                            value={formData.title}
                                            onChange={handleInputChange}
                                            required
                                            style={{
                                                width: '100%',
                                                padding: '8px 12px',
                                                border: '1px solid var(--color-border)',
                                                borderRadius: '4px',
                                                fontSize: '14px'
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>Category</label>
                                        <input
                                            type="text"
                                            name="category"
                                            value={formData.category}
                                            onChange={handleInputChange}
                                            required
                                            style={{
                                                width: '100%',
                                                padding: '8px 12px',
                                                border: '1px solid var(--color-border)',
                                                borderRadius: '4px',
                                                fontSize: '14px'
                                            }}
                                        />
                                    </div>
                                </div>
                                
                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>Subtitle</label>
                                    <textarea
                                        name="subtitle"
                                        value={formData.subtitle}
                                        onChange={handleInputChange}
                                        required
                                        rows="3"
                                        style={{
                                            width: '100%',
                                            padding: '8px 12px',
                                            border: '1px solid var(--color-border)',
                                            borderRadius: '4px',
                                            fontSize: '14px',
                                            resize: 'vertical'
                                        }}
                                    />
                                </div>

                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>Status</label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleInputChange}
                                        style={{
                                            width: '100%',
                                            padding: '8px 12px',
                                            border: '1px solid var(--color-border)',
                                            borderRadius: '4px',
                                            fontSize: '14px'
                                        }}
                                    >
                                        <option value="active">Active</option>
                                        <option value="draft">Draft</option>
                                    </select>
                                </div>

                                <div style={{ marginBottom: '16px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                        <label style={{ fontSize: '14px', fontWeight: '500' }}>Links</label>
                                        <button
                                            type="button"
                                            onClick={addLink}
                                            style={{
                                                padding: '4px 8px',
                                                backgroundColor: 'var(--color-success)',
                                                color: '#fff',
                                                border: 'none',
                                                borderRadius: '4px',
                                                fontSize: '12px',
                                                cursor: 'pointer',
                                                width: '150px'
                                            }}
                                        >
                                            + Add Link
                                        </button>
                                    </div>
                                    
                                    {formData.links.map((link, index) => (
                                        <div key={index} style={{ 
                                            border: '1px solid var(--color-border)', 
                                            borderRadius: '4px', 
                                            padding: '12px', 
                                            marginBottom: '8px' 
                                        }}>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                                                <input
                                                    type="text"
                                                    placeholder="Link Name"
                                                    value={link.name}
                                                    onChange={(e) => handleLinkChange(index, 'name', e.target.value)}
                                                    style={{
                                                        padding: '6px 8px',
                                                        border: '1px solid var(--color-border)',
                                                        borderRadius: '4px',
                                                        fontSize: '12px'
                                                    }}
                                                />
                                                <input
                                                    type="url"
                                                    placeholder="URL"
                                                    value={link.url}
                                                    onChange={(e) => handleLinkChange(index, 'url', e.target.value)}
                                                    style={{
                                                        padding: '6px 8px',
                                                        border: '1px solid var(--color-border)',
                                                        borderRadius: '4px',
                                                        fontSize: '12px'
                                                    }}
                                                />
                                            </div>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <textarea
                                                    placeholder="Description"
                                                    value={link.description}
                                                    onChange={(e) => handleLinkChange(index, 'description', e.target.value)}
                                                    rows="2"
                                                    style={{
                                                        flex: 1,
                                                        padding: '6px 8px',
                                                        border: '1px solid var(--color-border)',
                                                        borderRadius: '4px',
                                                        fontSize: '12px',
                                                        resize: 'vertical'
                                                    }}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeLink(index)}
                                                    style={{
                                                        padding: '6px 8px',
                                                        backgroundColor: '#dc3545',
                                                        color: '#fff',
                                                        border: 'none',
                                                        borderRadius: '4px',
                                                        fontSize: '12px',
                                                        cursor: 'pointer',
                                                        width: '150px'
                                                    }}
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button
                                        type="submit"
                                        style={{
                                            padding: '8px 16px',
                                            backgroundColor: 'var(--color-success)',
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontSize: '14px',
                                            width: '250px'
                                        }}
                                    >
                                        {editingLink ? 'Update Link Category' : 'Create Link Category'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        style={{
                                            padding: '8px 16px',
                                            backgroundColor: '#6c757d',
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontSize: '14px'
                                        }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Important Links Table */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                        <div className="loading-spinner"></div>
                        <p style={{ marginTop: '16px' }}>Loading important links...</p>
                    </div>
                ) : (
                    <div className="activity-card">
                        <div style={{ padding: '24px' }}>
                            <div style={{ marginBottom: '20px' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: '500', color: 'var(--color-heading-1)', margin: '0 0 16px 0' }}>All Important Link Categories</h3>
                                <p style={{ fontSize: '14px', color: 'var(--color-body)', margin: 0 }}>Total categories: {importantLinks.length}</p>
                            </div>
                            
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                                            <th style={{ textAlign: 'left', padding: '12px', fontSize: '14px', fontWeight: '500' }}>Title</th>
                                            <th style={{ textAlign: 'left', padding: '12px', fontSize: '14px', fontWeight: '500' }}>Category</th>
                                            <th style={{ textAlign: 'left', padding: '12px', fontSize: '14px', fontWeight: '500' }}>Links Count</th>
                                            <th style={{ textAlign: 'left', padding: '12px', fontSize: '14px', fontWeight: '500' }}>Status</th>
                                            <th style={{ textAlign: 'left', padding: '12px', fontSize: '14px', fontWeight: '500' }}>Updated</th>
                                            <th style={{ textAlign: 'center', padding: '12px', fontSize: '14px', fontWeight: '500' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {importantLinks.map((linkCategory) => (
                                            <tr key={linkCategory._id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                                <td style={{ padding: '12px', fontSize: '14px' }}>
                                                    <div>
                                                        <div style={{ fontWeight: '500', color: 'var(--color-heading-1)' }}>{linkCategory.title}</div>
                                                        <div style={{ fontSize: '12px', color: 'var(--color-body)', marginTop: '2px' }}>{linkCategory.subtitle}</div>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '12px', fontSize: '14px' }}>{linkCategory.category}</td>
                                                <td style={{ padding: '12px', fontSize: '14px' }}>{linkCategory.links?.length || 0}</td>
                                                <td style={{ padding: '12px', fontSize: '14px' }}>
                                                    <span style={{ 
                                                        fontSize: '12px', 
                                                        padding: '4px 8px', 
                                                        borderRadius: '12px',
                                                        backgroundColor: linkCategory.status === 'active' ? 'var(--color-success)' : '#ffc107',
                                                        color: '#fff'
                                                    }}>
                                                        {linkCategory.status}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '12px', fontSize: '14px' }}>
                                                    {new Date(linkCategory.updatedAt).toLocaleDateString()}
                                                </td>
                                                <td style={{ padding: '12px', fontSize: '14px', textAlign: 'center' }}>
                                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                                        <button
                                                            onClick={() => handleEdit(linkCategory)}
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
                                                            onClick={() => handleDelete(linkCategory._id)}
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
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
} 