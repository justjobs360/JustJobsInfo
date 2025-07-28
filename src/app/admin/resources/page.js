"use client";
import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAuth } from '@/contexts/AuthContext';
import { ADMIN_PERMISSIONS } from '@/utils/userRoleService';
import '../admin.css';

export default function ResourcesPage() {
    const { hasPermission } = useAuth();
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Mock data
        setTimeout(() => {
            setResources([
                { 
                    id: 1, 
                    title: 'Resume Writing Guide', 
                    type: 'PDF',
                    category: 'Career Guides',
                    downloads: 2340,
                    fileSize: '2.5 MB',
                    status: 'active',
                    lastUpdated: '2024-01-15'
                },
                { 
                    id: 2, 
                    title: 'Interview Preparation Checklist', 
                    type: 'PDF',
                    category: 'Interview Prep',
                    downloads: 1567,
                    fileSize: '1.8 MB',
                    status: 'active',
                    lastUpdated: '2024-01-10'
                },
                { 
                    id: 3, 
                    title: 'Job Search Strategy Template', 
                    type: 'DOCX',
                    category: 'Job Search',
                    downloads: 890,
                    fileSize: '3.2 MB',
                    status: 'active',
                    lastUpdated: '2024-01-20'
                },
                { 
                    id: 4, 
                    title: 'Salary Negotiation Tips', 
                    type: 'PDF',
                    category: 'Career Guides',
                    downloads: 1234,
                    fileSize: '1.5 MB',
                    status: 'draft',
                    lastUpdated: '2024-01-18'
                },
                { 
                    id: 5, 
                    title: 'Networking Guide', 
                    type: 'PDF',
                    category: 'Networking',
                    downloads: 678,
                    fileSize: '2.1 MB',
                    status: 'active',
                    lastUpdated: '2024-01-12'
                }
            ]);
            setLoading(false);
        }, 1000);
    }, []);

    if (!hasPermission(ADMIN_PERMISSIONS.MANAGE_CONTENT)) {
        return (
            <AdminLayout>
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <h2 style={{ color: 'var(--color-danger)' }}>Access Denied</h2>
                    <p>You don't have permission to manage resources.</p>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="admin-dashboard">
                <div className="dashboard-header">
                    <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--color-heading-1)', margin: '0 0 8px 0' }}>Resources Management</h1>
                    <p style={{ fontSize: '16px', color: 'var(--color-body)', margin: 0 }}>Add, edit, and manage downloadable resources</p>
                </div>

                {/* Add New Resource Button */}
                <div style={{ marginBottom: '20px' }}>
                    <button
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
                        + Add New Resource
                    </button>
                </div>

                {/* Resources List */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                        <div className="loading-spinner"></div>
                        <p style={{ marginTop: '16px' }}>Loading resources...</p>
                    </div>
                ) : (
                    <div className="activity-card">
                        <div style={{ padding: '24px' }}>
                            <div style={{ marginBottom: '20px' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: '500', color: 'var(--color-heading-1)', margin: '0 0 16px 0' }}>All Resources</h3>
                                <p style={{ fontSize: '14px', color: 'var(--color-body)', margin: 0 }}>Total resources: {resources.length}</p>
                            </div>
                            
                            <div className="activity-list">
                                {resources.map((resource) => (
                                    <div key={resource.id} className="activity-item">
                                        <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                                            <span style={{ fontSize: '14px', color: 'var(--color-body)', marginRight: '12px' }}>📚</span>
                                            <div style={{ flex: 1 }}>
                                                <p style={{ fontSize: '14px', fontWeight: '500', color: 'var(--color-heading-1)', margin: '0 0 2px 0' }}>{resource.title}</p>
                                                <p style={{ fontSize: '12px', color: 'var(--color-body)', margin: '0 0 4px 0' }}>
                                                    Category: {resource.category} • Type: {resource.type} • Size: {resource.fileSize}
                                                </p>
                                                <p style={{ fontSize: '12px', color: 'var(--color-body)', margin: '0 0 4px 0' }}>
                                                    Downloads: {resource.downloads} • Updated: {resource.lastUpdated}
                                                </p>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <span style={{ 
                                                fontSize: '12px', 
                                                padding: '4px 8px', 
                                                borderRadius: '12px',
                                                backgroundColor: resource.status === 'active' ? 'var(--color-success)' : '#ffc107',
                                                color: '#fff'
                                            }}>
                                                {resource.status}
                                            </span>
                                            <button
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