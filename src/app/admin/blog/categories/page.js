"use client";
import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAuth } from '@/contexts/AuthContext';
import { ADMIN_PERMISSIONS } from '@/utils/userRoleService';
import '../../admin.css';

export default function BlogCategoriesPage() {
    const { hasPermission } = useAuth();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Mock data
        setTimeout(() => {
            setCategories([
                { id: 1, name: 'Career Tips', slug: 'career-tips', postCount: 15, status: 'active' },
                { id: 2, name: 'Interview', slug: 'interview', postCount: 8, status: 'active' },
                { id: 3, name: 'SEO', slug: 'seo', postCount: 12, status: 'active' },
                { id: 4, name: 'Job Search', slug: 'job-search', postCount: 6, status: 'active' },
                { id: 5, name: 'Resume Writing', slug: 'resume-writing', postCount: 10, status: 'active' }
            ]);
            setLoading(false);
        }, 1000);
    }, []);

    if (!hasPermission(ADMIN_PERMISSIONS.MANAGE_BLOG_POSTS)) {
        return (
            <AdminLayout>
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <h2 style={{ color: 'var(--color-danger)' }}>Access Denied</h2>
                    <p>You don&apos;t have permission to manage blog categories.</p>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="admin-dashboard">
                <div className="dashboard-header">
                    <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--color-heading-1)', margin: '0 0 8px 0' }}>Blog Categories</h1>
                    <p style={{ fontSize: '16px', color: 'var(--color-body)', margin: 0 }}>Manage blog post categories</p>
                </div>

                {/* Add New Category Button */}
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
                        + Add New Category
                    </button>
                </div>

                {/* Categories List */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                        <div className="loading-spinner"></div>
                        <p style={{ marginTop: '16px' }}>Loading categories...</p>
                    </div>
                ) : (
                    <div className="activity-card">
                        <div style={{ padding: '24px' }}>
                            <div style={{ marginBottom: '20px' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: '500', color: 'var(--color-heading-1)', margin: '0 0 16px 0' }}>All Categories</h3>
                                <p style={{ fontSize: '14px', color: 'var(--color-body)', margin: 0 }}>Total categories: {categories.length}</p>
                            </div>
                            
                            <div className="activity-list">
                                {categories.map((category) => (
                                    <div key={category.id} className="activity-item">
                                        <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                                            <span style={{ fontSize: '14px', color: 'var(--color-body)', marginRight: '12px' }}>🏷️</span>
                                            <div style={{ flex: 1 }}>
                                                <p style={{ fontSize: '14px', fontWeight: '500', color: 'var(--color-heading-1)', margin: '0 0 2px 0' }}>{category.name}</p>
                                                <p style={{ fontSize: '12px', color: 'var(--color-body)', margin: 0 }}>
                                                    Slug: {category.slug} | Posts: {category.postCount}
                                                </p>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <span style={{ 
                                                fontSize: '12px', 
                                                padding: '4px 8px', 
                                                borderRadius: '12px',
                                                backgroundColor: category.status === 'active' ? 'var(--color-success)' : '#6c757d',
                                                color: '#fff'
                                            }}>
                                                {category.status}
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
