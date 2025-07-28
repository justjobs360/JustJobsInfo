"use client";
import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAuth } from '@/contexts/AuthContext';
import { ADMIN_PERMISSIONS } from '@/utils/userRoleService';
import '../../admin.css';

export default function RobotsPage() {
    const { hasPermission } = useAuth();
    const [robotsContent, setRobotsContent] = useState(`User-agent: *
Allow: /

# Disallow admin areas
Disallow: /admin/
Disallow: /api/

# Sitemap
Sitemap: https://justjobsinfo.com/sitemap.xml`);

    if (!hasPermission(ADMIN_PERMISSIONS.MANAGE_ROBOTS_TXT)) {
        return (
            <AdminLayout>
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <h2 style={{ color: 'var(--color-danger)' }}>Access Denied</h2>
                    <p>You don&apos;t have permission to manage robots.txt.</p>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="admin-dashboard">
                <div className="dashboard-header">
                    <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--color-heading-1)', margin: '0 0 8px 0' }}>Robots.txt Management</h1>
                    <p style={{ fontSize: '16px', color: 'var(--color-body)', margin: 0 }}>Edit robots.txt file for search engine crawlers</p>
                </div>

                <div className="activity-card">
                    <div style={{ padding: '24px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: '500', color: 'var(--color-heading-1)', margin: '0 0 20px 0' }}>Robots.txt Content</h3>
                        
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Content:</label>
                            <textarea
                                value={robotsContent}
                                onChange={(e) => setRobotsContent(e.target.value)}
                                rows="15"
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    fontSize: '14px',
                                    fontFamily: 'monospace',
                                    resize: 'vertical'
                                }}
                                placeholder="Enter robots.txt content..."
                            />
                        </div>

                        <div style={{ marginTop: '20px' }}>
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
                                    marginRight: '10px',
                                    width: '250px'
                                }}
                            >
                                Save Changes
                            </button>
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
                                View Robots.txt
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
} 