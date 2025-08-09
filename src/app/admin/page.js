"use client";
import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAuth } from '@/contexts/AuthContext';
import { ADMIN_PERMISSIONS } from '@/utils/userRoleService';
import './admin.css';

export default function AdminDashboard() {
    const { userRole, hasPermission, isSuperAdmin } = useAuth();
    const [stats, setStats] = useState({
        totalAdmins: 0,
        totalCVs: 0,
        totalBlogs: 0,
        totalImportantLinks: 0,
        totalDownloadableResources: 0,
        seoScore: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Fetch dashboard stats
                const statsResponse = await fetch('/api/admin/dashboard-stats');
                const statsResult = await statsResponse.json();

                if (!statsResult.success) {
                    throw new Error(statsResult.message || 'Failed to fetch dashboard stats');
                }

                let dashboardStats = {
                    ...statsResult.data,
                    totalAdmins: 0 // Will be fetched separately for super admins
                };

                // If super admin, fetch admin stats
                if (isSuperAdmin()) {
                    try {
                        const adminResponse = await fetch('/api/admin/admin-stats');
                        const adminResult = await adminResponse.json();

                        if (adminResult.success) {
                            dashboardStats.totalAdmins = adminResult.data.totalAdmins;
                        }
                    } catch (adminError) {
                        console.error('Error fetching admin stats:', adminError);
                        // Don't fail the entire dashboard if admin stats fail
                    }
                }

                setStats(dashboardStats);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [isSuperAdmin]);

    const StatCard = ({ title, value, icon, color, loading = false }) => (
        <div className="stat-card" style={{ borderLeftColor: color }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ flexShrink: 0 }}>
                    <span style={{ fontSize: '24px' }}>{icon}</span>
                </div>
                <div style={{ marginLeft: '16px' }}>
                    <p style={{ fontSize: '14px', fontWeight: '500', color: 'var(--color-body)', margin: '0 0 4px 0' }}>{title}</p>
                    {loading ? (
                        <div style={{ height: '24px', width: '60px', backgroundColor: '#f0f0f0', borderRadius: '4px' }}></div>
                    ) : (
                        <p style={{ fontSize: '24px', fontWeight: '600', color: 'var(--color-heading-1)', margin: 0 }}>{value}</p>
                    )}
                </div>
            </div>
        </div>
    );

    const QuickAction = ({ title, description, icon, href, permission }) => {
        if (permission && !hasPermission(permission)) {
            return null;
        }

        return (
            <a href={href} className="quick-action-card">
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ fontSize: '24px', marginRight: '16px' }}>{icon}</span>
                    <div>
                        <h3 style={{ fontSize: '18px', fontWeight: '500', color: 'var(--color-heading-1)', margin: '0 0 4px 0' }}>{title}</h3>
                        <p style={{ fontSize: '14px', color: 'var(--color-body)', margin: 0 }}>{description}</p>
                    </div>
                </div>
            </a>
        );
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="admin-dashboard">
                    <div className="dashboard-header">
                        <div style={{ height: '32px', width: '300px', backgroundColor: '#f0f0f0', borderRadius: '4px', marginBottom: '8px' }}></div>
                        <div style={{ height: '16px', width: '200px', backgroundColor: '#f0f0f0', borderRadius: '4px' }}></div>
                    </div>
                    
                    <div className="stats-grid">
                        {[...Array(4)].map((_, index) => (
                            <div key={index} className="stat-card" style={{ borderLeftColor: '#ddd' }}>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <div style={{ width: '24px', height: '24px', backgroundColor: '#f0f0f0', borderRadius: '4px' }}></div>
                                    <div style={{ marginLeft: '16px', flex: 1 }}>
                                        <div style={{ height: '14px', width: '80px', backgroundColor: '#f0f0f0', borderRadius: '4px', marginBottom: '4px' }}></div>
                                        <div style={{ height: '24px', width: '60px', backgroundColor: '#f0f0f0', borderRadius: '4px' }}></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </AdminLayout>
        );
    }

    if (error) {
        return (
            <AdminLayout>
                <div className="admin-dashboard">
                    <div className="dashboard-header">
                        <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--color-heading-1)', margin: '0 0 8px 0' }}>
                            Dashboard Error
                        </h1>
                        <p style={{ fontSize: '16px', color: 'var(--color-danger)', margin: 0 }}>
                            {error}
                        </p>
                    </div>
                    <button 
                        onClick={() => window.location.reload()} 
                        style={{
                            padding: '12px 24px',
                            backgroundColor: 'var(--color-primary)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '500'
                        }}
                    >
                        Retry
                    </button>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="admin-dashboard">
                {/* Header */}
                <div className="dashboard-header">
                    <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--color-heading-1)', margin: '0 0 8px 0' }}>
                        {isSuperAdmin() ? 'Super Admin Dashboard' : 'SEO Admin Dashboard'}
                    </h1>
                    <p style={{ fontSize: '16px', color: 'var(--color-body)', margin: 0 }}>
                        {isSuperAdmin() 
                            ? 'Full system administration and control' 
                            : 'SEO and content management dashboard'
                        }
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="stats-grid">
                    {isSuperAdmin() ? (
                        // Super Admin Stats
                        <>
                            <StatCard
                                title="Total Admins"
                                value={stats.totalAdmins}
                                icon="👑"
                                color="#6f42c1"
                            />
                            <StatCard
                                title="CV Audits"
                                value={stats.totalCVs}
                                icon="📄"
                                color="var(--color-success)"
                            />
                            <StatCard
                                title="Blog Posts"
                                value={stats.totalBlogs}
                                icon="📰"
                                color="var(--color-primary)"
                            />
                            <StatCard
                                title="Important Links"
                                value={stats.totalImportantLinks}
                                icon="🔗"
                                color="var(--color-warning)"
                            />
                        </>
                    ) : (
                        // Regular Admin Stats (SEO focused)
                        <>
                            <StatCard
                                title="SEO Score"
                                value={`${stats.seoScore}/100`}
                                icon="🔍"
                                color="var(--color-primary)"
                            />
                            <StatCard
                                title="Blog Posts"
                                value={stats.totalBlogs}
                                icon="📰"
                                color="var(--color-success)"
                            />
                            <StatCard
                                title="Important Links"
                                value={stats.totalImportantLinks}
                                icon="🔗"
                                color="#6f42c1"
                            />
                            <StatCard
                                title="Downloadable Resources"
                                value={stats.totalDownloadableResources}
                                icon="📥"
                                color="var(--color-warning)"
                            />
                        </>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="quick-actions-section">
                    <h2 style={{ fontSize: '20px', fontWeight: '500', color: 'var(--color-heading-1)', margin: '0 0 20px 0' }}>Quick Actions</h2>
                    <div className="quick-actions-grid">
                        {isSuperAdmin() ? (
                            // Super Admin Actions
                            <>
                                <QuickAction
                                    title="Manage Admins"
                                    description="Create and manage admin accounts"
                                    icon="👑"
                                    href="/admin/admins"
                                />
                                <QuickAction
                                    title="Contact Forms"
                                    description="View and manage contact form submissions"
                                    icon="📧"
                                    href="/admin/contact-forms"
                                />
                                <QuickAction
                                    title="Job Listings"
                                    description="Manage job postings and listings"
                                    icon="💼"
                                    href="/admin/jobs"
                                />
                                <QuickAction
                                    title="Blog Management"
                                    description="Manage blog posts and content"
                                    icon="📰"
                                    href="/admin/blog"
                                    permission={ADMIN_PERMISSIONS.MANAGE_BLOG_POSTS}
                                />
                                <QuickAction
                                    title="SEO Settings"
                                    description="Configure SEO settings and optimization"
                                    icon="🔍"
                                    href="/admin/seo/settings"
                                    permission={ADMIN_PERMISSIONS.MANAGE_SEO}
                                />
                                <QuickAction
                                    title="Resume Templates"
                                    description="Manage resume templates and resources"
                                    icon="📋"
                                    href="/admin/resume/templates"
                                    permission={ADMIN_PERMISSIONS.MANAGE_CONTENT}
                                />
                                <QuickAction
                                    title="Important Links"
                                    description="Manage important links for job seekers"
                                    icon="🔗"
                                    href="/admin/important-links"
                                    permission={ADMIN_PERMISSIONS.MANAGE_CONTENT}
                                />
                                <QuickAction
                                    title="Downloadable Resources"
                                    description="Manage downloadable resources and files"
                                    icon="📥"
                                    href="/admin/downloadable-resources"
                                    permission={ADMIN_PERMISSIONS.MANAGE_CONTENT}
                                />
                            </>
                        ) : (
                            // Regular Admin Actions (SEO focused)
                            <>
                                <QuickAction
                                    title="SEO Management"
                                    description="Manage SEO settings and optimization"
                                    icon="🔍"
                                    href="/admin/seo/settings"
                                    permission={ADMIN_PERMISSIONS.MANAGE_SEO}
                                />
                                <QuickAction
                                    title="Meta Tags"
                                    description="Manage meta tags and descriptions"
                                    icon="🏷️"
                                    href="/admin/seo/meta-tags"
                                    permission={ADMIN_PERMISSIONS.MANAGE_META_TAGS}
                                />
                                <QuickAction
                                    title="Sitemap"
                                    description="Manage XML sitemap"
                                    icon="🗺️"
                                    href="/admin/seo/sitemap"
                                    permission={ADMIN_PERMISSIONS.MANAGE_SITEMAP}
                                />
                                <QuickAction
                                    title="Robots.txt"
                                    description="Manage robots.txt file"
                                    icon="🤖"
                                    href="/admin/seo/robots"
                                    permission={ADMIN_PERMISSIONS.MANAGE_ROBOTS_TXT}
                                />
                                <QuickAction
                                    title="Blog Management"
                                    description="Manage blog posts and content"
                                    icon="📰"
                                    href="/admin/blog"
                                    permission={ADMIN_PERMISSIONS.MANAGE_BLOG_POSTS}
                                />
                                <QuickAction
                                    title="Important Links"
                                    description="Manage important links for job seekers"
                                    icon="🔗"
                                    href="/admin/important-links"
                                    permission={ADMIN_PERMISSIONS.MANAGE_CONTENT}
                                />
                                <QuickAction
                                    title="Downloadable Resources"
                                    description="Manage downloadable resources and files"
                                    icon="📥"
                                    href="/admin/downloadable-resources"
                                    permission={ADMIN_PERMISSIONS.MANAGE_CONTENT}
                                />
                            </>
                        )}
                    </div>
                </div>


            </div>
        </AdminLayout>
    );
} 