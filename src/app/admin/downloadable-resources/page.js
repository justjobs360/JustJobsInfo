"use client";
import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAuth } from '@/contexts/AuthContext';
import { ADMIN_PERMISSIONS } from '@/utils/userRoleService';
import '../admin.css';

export default function DownloadableResourcesPage() {
    const { hasPermission } = useAuth();
    const [downloadableResources, setDownloadableResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editingResource, setEditingResource] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        subtitle: '',
        category: '',
        status: 'active',
        resources: []
    });

    const fetchDownloadableResources = async () => {
        try {
            setLoading(true);
            setError(null);
            
            console.log('📡 Fetching downloadable resources from API...');
            const response = await fetch('/api/downloadable-resources');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (result.success) {
                console.log('✅ Successfully fetched downloadable resources:', result.data.length);
                setDownloadableResources(result.data);
            } else {
                throw new Error(result.message || 'Failed to fetch downloadable resources');
            }
        } catch (error) {
            console.error('❌ Error fetching downloadable resources:', error);
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

    const handleResourceChange = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            resources: prev.resources.map((resource, i) => 
                i === index ? { ...resource, [field]: value } : resource
            )
        }));
    };

    const addResource = () => {
        setFormData(prev => ({
            ...prev,
            resources: [...prev.resources, { 
                name: '', 
                description: '', 
                format: '', 
                icon: '', 
                downloadUrl: '', 
                downloads: 0, 
                fileSize: '' 
            }]
        }));
    };

    const removeResource = (index) => {
        setFormData(prev => ({
            ...prev,
            resources: prev.resources.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const url = editingResource ? `/api/downloadable-resources/${editingResource._id}` : '/api/downloadable-resources';
            const method = editingResource ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            if (result.success) {
                console.log('✅ Successfully saved downloadable resource');
                setShowForm(false);
                setEditingResource(null);
                setFormData({
                    title: '',
                    subtitle: '',
                    category: '',
                    status: 'active',
                    resources: []
                });
                fetchDownloadableResources();
            } else {
                throw new Error(result.message || 'Failed to save downloadable resource');
            }
        } catch (error) {
            console.error('❌ Error saving downloadable resource:', error);
            setError(error.message);
        }
    };

    const handleEdit = (resource) => {
        setEditingResource(resource);
        setFormData({
            title: resource.title,
            subtitle: resource.subtitle,
            category: resource.category,
            status: resource.status,
            resources: resource.resources || []
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this downloadable resource?')) {
            return;
        }

        try {
            const response = await fetch(`/api/downloadable-resources/${id}`, {
                method: 'DELETE',
            });

            const result = await response.json();

            if (result.success) {
                console.log('✅ Successfully deleted downloadable resource');
                fetchDownloadableResources();
            } else {
                throw new Error(result.message || 'Failed to delete downloadable resource');
            }
        } catch (error) {
            console.error('❌ Error deleting downloadable resource:', error);
            setError(error.message);
        }
    };

    const resetForm = () => {
        setShowForm(false);
        setEditingResource(null);
        setFormData({
            title: '',
            subtitle: '',
            category: '',
            status: 'active',
            resources: []
        });
    };

    useEffect(() => {
        fetchDownloadableResources();
    }, []);

    if (!hasPermission(ADMIN_PERMISSIONS.MANAGE_CONTENT)) {
        return (
            <AdminLayout>
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <h2 style={{ color: 'var(--color-danger)' }}>Access Denied</h2>
                    <p>You don't have permission to manage downloadable resources.</p>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="admin-dashboard">
                <div className="dashboard-header">
                    <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--color-heading-1)', margin: '0 0 8px 0' }}>Downloadable Resources Management</h1>
                    <p style={{ fontSize: '16px', color: 'var(--color-body)', margin: 0 }}>Add, edit, and manage downloadable resources for job seekers</p>
                </div>

                {/* Add New Resource Button */}
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
                        + Add New Resource Category
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
                                {editingResource ? 'Edit Resource Category' : 'Add New Resource Category'}
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
                                        <label style={{ fontSize: '14px', fontWeight: '500' }}>Resources</label>
                                        <button
                                            type="button"
                                            onClick={addResource}
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
                                            + Add Resource
                                        </button>
                                    </div>
                                    
                                    {formData.resources.map((resource, index) => (
                                        <div key={index} style={{ 
                                            border: '1px solid var(--color-border)', 
                                            borderRadius: '4px', 
                                            padding: '12px', 
                                            marginBottom: '8px' 
                                        }}>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                                                <input
                                                    type="text"
                                                    placeholder="Resource Name"
                                                    value={resource.name}
                                                    onChange={(e) => handleResourceChange(index, 'name', e.target.value)}
                                                    style={{
                                                        padding: '6px 8px',
                                                        border: '1px solid var(--color-border)',
                                                        borderRadius: '4px',
                                                        fontSize: '12px'
                                                    }}
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Format (PDF, Word, etc.)"
                                                    value={resource.format}
                                                    onChange={(e) => handleResourceChange(index, 'format', e.target.value)}
                                                    style={{
                                                        padding: '6px 8px',
                                                        border: '1px solid var(--color-border)',
                                                        borderRadius: '4px',
                                                        fontSize: '12px'
                                                    }}
                                                />
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                                                <input
                                                    type="url"
                                                    placeholder="Download URL"
                                                    value={resource.downloadUrl}
                                                    onChange={(e) => handleResourceChange(index, 'downloadUrl', e.target.value)}
                                                    style={{
                                                        padding: '6px 8px',
                                                        border: '1px solid var(--color-border)',
                                                        borderRadius: '4px',
                                                        fontSize: '12px'
                                                    }}
                                                />
                                                <input
                                                    type="url"
                                                    placeholder="Icon URL"
                                                    value={resource.icon}
                                                    onChange={(e) => handleResourceChange(index, 'icon', e.target.value)}
                                                    style={{
                                                        padding: '6px 8px',
                                                        border: '1px solid var(--color-border)',
                                                        borderRadius: '4px',
                                                        fontSize: '12px'
                                                    }}
                                                />
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                                                <input
                                                    type="number"
                                                    placeholder="Downloads Count"
                                                    value={resource.downloads}
                                                    onChange={(e) => handleResourceChange(index, 'downloads', parseInt(e.target.value) || 0)}
                                                    style={{
                                                        padding: '6px 8px',
                                                        border: '1px solid var(--color-border)',
                                                        borderRadius: '4px',
                                                        fontSize: '12px'
                                                    }}
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="File Size (e.g., 2.5 MB)"
                                                    value={resource.fileSize}
                                                    onChange={(e) => handleResourceChange(index, 'fileSize', e.target.value)}
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
                                                    value={resource.description}
                                                    onChange={(e) => handleResourceChange(index, 'description', e.target.value)}
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
                                                    onClick={() => removeResource(index)}
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
                                        {editingResource ? 'Update Resource Category' : 'Create Resource Category'}
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

                {/* Downloadable Resources Table */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                        <div className="loading-spinner"></div>
                        <p style={{ marginTop: '16px' }}>Loading downloadable resources...</p>
                    </div>
                ) : (
                    <div className="activity-card">
                        <div style={{ padding: '24px' }}>
                            <div style={{ marginBottom: '20px' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: '500', color: 'var(--color-heading-1)', margin: '0 0 16px 0' }}>All Downloadable Resource Categories</h3>
                                <p style={{ fontSize: '14px', color: 'var(--color-body)', margin: 0 }}>Total categories: {downloadableResources.length}</p>
                            </div>
                            
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                                            <th style={{ textAlign: 'left', padding: '12px', fontSize: '14px', fontWeight: '500' }}>Title</th>
                                            <th style={{ textAlign: 'left', padding: '12px', fontSize: '14px', fontWeight: '500' }}>Category</th>
                                            <th style={{ textAlign: 'left', padding: '12px', fontSize: '14px', fontWeight: '500' }}>Resources Count</th>
                                            <th style={{ textAlign: 'left', padding: '12px', fontSize: '14px', fontWeight: '500' }}>Status</th>
                                            <th style={{ textAlign: 'left', padding: '12px', fontSize: '14px', fontWeight: '500' }}>Updated</th>
                                            <th style={{ textAlign: 'center', padding: '12px', fontSize: '14px', fontWeight: '500' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {downloadableResources.map((resourceCategory) => (
                                            <tr key={resourceCategory._id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                                <td style={{ padding: '12px', fontSize: '14px' }}>
                                                    <div>
                                                        <div style={{ fontWeight: '500', color: 'var(--color-heading-1)' }}>{resourceCategory.title}</div>
                                                        <div style={{ fontSize: '12px', color: 'var(--color-body)', marginTop: '2px' }}>{resourceCategory.subtitle}</div>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '12px', fontSize: '14px' }}>{resourceCategory.category}</td>
                                                <td style={{ padding: '12px', fontSize: '14px' }}>{resourceCategory.resources?.length || 0}</td>
                                                <td style={{ padding: '12px', fontSize: '14px' }}>
                                                    <span style={{ 
                                                        fontSize: '12px', 
                                                        padding: '4px 8px', 
                                                        borderRadius: '12px',
                                                        backgroundColor: resourceCategory.status === 'active' ? 'var(--color-success)' : '#ffc107',
                                                        color: '#fff'
                                                    }}>
                                                        {resourceCategory.status}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '12px', fontSize: '14px' }}>
                                                    {new Date(resourceCategory.updatedAt).toLocaleDateString()}
                                                </td>
                                                <td style={{ padding: '12px', fontSize: '14px', textAlign: 'center' }}>
                                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                                        <button
                                                            onClick={() => handleEdit(resourceCategory)}
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
                                                            onClick={() => handleDelete(resourceCategory._id)}
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