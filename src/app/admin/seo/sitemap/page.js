"use client";
import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAuth } from '@/contexts/AuthContext';
import { ADMIN_PERMISSIONS } from '@/utils/userRoleService';
import '../../admin.css';

export default function SitemapPage() {
    const { hasPermission } = useAuth();
    const [sitemapData, setSitemapData] = useState({
        lastGenerated: '2024-01-25 10:30:00',
        totalPages: 15,
        status: 'active'
    });

    if (!hasPermission(ADMIN_PERMISSIONS.MANAGE_SITEMAP)) {
        return (
            <AdminLayout>
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <h2 style={{ color: 'var(--color-danger)' }}>Access Denied</h2>
                    <p>You don&apos;t have permission to manage sitemap.</p>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="admin-dashboard">
                <div className="dashboard-header">
                    <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--color-heading-1)', margin: '0 0 8px 0' }}>Sitemap Management</h1>
                    <p style={{ fontSize: '16px', color: 'var(--color-body)', margin: 0 }}>Manage XML sitemap for search engines</p>
                </div>

                <div className="activity-card">
                    <div style={{ padding: '24px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: '500', color: 'var(--color-heading-1)', margin: '0 0 20px 0' }}>Sitemap Status</h3>
                        
                        <div style={{ display: 'grid', gap: '20px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Last Generated:</label>
                                <p style={{ fontSize: '14px', color: 'var(--color-body)' }}>{sitemapData.lastGenerated}</p>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Total Pages:</label>
                                <p style={{ fontSize: '14px', color: 'var(--color-body)' }}>{sitemapData.totalPages}</p>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Status:</label>
                                <span style={{ 
                                    fontSize: '12px', 
                                    padding: '4px 8px', 
                                    borderRadius: '12px',
                                    backgroundColor: sitemapData.status === 'active' ? 'var(--color-success)' : '#6c757d',
                                    color: '#fff'
                                }}>
                                    {sitemapData.status}
                                </span>
                            </div>

                            <div style={{ marginTop: '20px' }}>
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
                                        marginRight: '10px',
                                        width: '250px'
                                    }}
                                >
                                    Regenerate Sitemap
                                </button>
                                <button
                                    style={{
                                        padding: '12px 24px',
                                        backgroundColor: 'var(--color-success)',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        width: '250px'
                                    }}
                                >
                                    View Sitemap
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
} 