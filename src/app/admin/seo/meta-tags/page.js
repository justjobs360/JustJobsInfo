"use client";
import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAuth } from '@/contexts/AuthContext';
import { ADMIN_PERMISSIONS } from '@/utils/userRoleService';
import '../../admin.css';

export default function MetaTagsPage() {
    const { hasPermission } = useAuth();
    const [metaTags, setMetaTags] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Mock data
        setTimeout(() => {
            setMetaTags([
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
            ]);
            setLoading(false);
        }, 1000);
    }, []);

    if (!hasPermission(ADMIN_PERMISSIONS.MANAGE_META_TAGS)) {
        return (
            <AdminLayout>
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <h2 style={{ color: 'var(--color-danger)' }}>Access Denied</h2>
                    <p>You don't have permission to manage meta tags.</p>
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
                        + Add New Meta Tag
                    </button>
                </div>

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