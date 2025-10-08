"use client";
import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAuth } from '@/contexts/AuthContext';
import { ADMIN_PERMISSIONS } from '@/utils/userRoleService';
import '../admin.css';

export default function PagesManagementPage() {
    const { hasPermission } = useAuth();
    const [pages, setPages] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Mock data
        setTimeout(() => {
            setPages([
                { 
                    id: 1, 
                    title: 'About Us', 
                    slug: 'about',
                    status: 'published',
                    lastModified: '2024-01-15',
                    author: 'Admin User'
                },
                { 
                    id: 2, 
                    title: 'Contact', 
                    slug: 'contact',
                    status: 'published',
                    lastModified: '2024-01-10',
                    author: 'Admin User'
                },
                { 
                    id: 3, 
                    title: 'Privacy Policy', 
                    slug: 'privacy-policy',
                    status: 'published',
                    lastModified: '2024-01-05',
                    author: 'Admin User'
                },
                { 
                    id: 4, 
                    title: 'Terms of Service', 
                    slug: 'terms-of-service',
                    status: 'draft',
                    lastModified: '2024-01-20',
                    author: 'Admin User'
                },
                { 
                    id: 5, 
                    title: 'FAQ', 
                    slug: 'faq',
                    status: 'published',
                    lastModified: '2024-01-12',
                    author: 'Admin User'
                }
            ]);
            setLoading(false);
        }, 1000);
    }, []);

    if (!hasPermission(ADMIN_PERMISSIONS.MANAGE_PAGES)) {
        return (
            <AdminLayout>
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <h2 style={{ color: 'var(--color-danger)' }}>Access Denied</h2>
                    <p>You don&apos;t have permission to manage pages.</p>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="admin-dashboard">
                <div className="dashboard-header">
                    <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--color-heading-1)', margin: '0 0 8px 0' }}>Pages Management</h1>
                    <p style={{ fontSize: '16px', color: 'var(--color-body)', margin: 0 }}>Add, edit, and manage website pages</p>
                </div>

                {/* Add New Page Button */}
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
                        + Add New Page
                    </button>
                </div>

                {/* Pages List */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                        <div className="loading-spinner"></div>
                        <p style={{ marginTop: '16px' }}>Loading pages...</p>
                    </div>
                ) : (
                    <div className="activity-card">
                        <div style={{ padding: '24px' }}>
                            <div style={{ marginBottom: '20px' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: '500', color: 'var(--color-heading-1)', margin: '0 0 16px 0' }}>All Pages</h3>
                                <p style={{ fontSize: '14px', color: 'var(--color-body)', margin: 0 }}>Total pages: {pages.length}</p>
                            </div>
                            
                            <div className="activity-list">
                                {pages.map((page) => (
                                    <div key={page.id} className="activity-item">
                                        <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                                            <span style={{ fontSize: '14px', color: 'var(--color-body)', marginRight: '12px' }}>📄</span>
                                            <div style={{ flex: 1 }}>
                                                <p style={{ fontSize: '14px', fontWeight: '500', color: 'var(--color-heading-1)', margin: '0 0 2px 0' }}>{page.title}</p>
                                                <p style={{ fontSize: '12px', color: 'var(--color-body)', margin: 0 }}>
                                                    Slug: {page.slug} | Author: {page.author} | Modified: {page.lastModified}
                                                </p>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <span style={{ 
                                                fontSize: '12px', 
                                                padding: '4px 8px', 
                                                borderRadius: '12px',
                                                backgroundColor: page.status === 'published' ? 'var(--color-success)' : '#ffc107',
                                                color: '#fff'
                                            }}>
                                                {page.status}
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
