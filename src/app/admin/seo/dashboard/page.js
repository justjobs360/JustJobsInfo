"use client";
import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAuth } from '@/contexts/AuthContext';
import { ADMIN_PERMISSIONS } from '@/utils/userRoleService';
import Link from 'next/link';
import '../../admin.css';

export default function SEODashboardPage() {
    const { hasPermission } = useAuth();
    const [dashboardData, setDashboardData] = useState({
        metaTags: { total: 0, active: 0, inactive: 0 },
        sitemap: { totalPages: 0, lastGenerated: null, status: 'inactive' },
        robotsTxt: { exists: false, lastUpdated: null },
        seoSettings: { configured: false }
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            
            // Fetch meta tags data
            const metaTagsResponse = await fetch('/api/admin/meta-tags');
            const metaTagsResult = await metaTagsResponse.json();
            
            // Fetch sitemap data
            const sitemapResponse = await fetch('/api/admin/sitemap-config');
            const sitemapResult = await sitemapResponse.json();
            
            // Fetch robots.txt data
            const robotsResponse = await fetch('/api/admin/robots-txt');
            const robotsResult = await robotsResponse.json();
            
            // Fetch SEO settings
            const settingsResponse = await fetch('/api/admin/seo-settings');
            const settingsResult = await settingsResponse.json();
            
            // Process meta tags
            const metaTags = {
                total: metaTagsResult.success ? metaTagsResult.data.length : 0,
                active: metaTagsResult.success ? metaTagsResult.data.filter(t => t.status === 'active').length : 0,
                inactive: metaTagsResult.success ? metaTagsResult.data.filter(t => t.status === 'inactive').length : 0
            };
            
            // Process sitemap
            const sitemap = {
                totalPages: sitemapResult.success ? sitemapResult.data.totalPages : 0,
                lastGenerated: sitemapResult.success ? sitemapResult.data.lastGenerated : null,
                status: sitemapResult.success && sitemapResult.data.totalPages > 0 ? 'active' : 'inactive'
            };
            
            // Process robots.txt
            const robotsTxt = {
                exists: robotsResult.success && robotsResult.data.content && robotsResult.data.content.length > 0,
                lastUpdated: robotsResult.success ? robotsResult.data.updatedAt : null
            };
            
            // Process SEO settings
            const seoSettings = {
                configured: settingsResult.success && settingsResult.data.siteUrl && settingsResult.data.siteTitle
            };
            
            setDashboardData({
                metaTags,
                sitemap,
                robotsTxt,
                seoSettings
            });
            
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!hasPermission(ADMIN_PERMISSIONS.MANAGE_SEO)) {
        return (
            <AdminLayout>
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <h2 style={{ color: 'var(--color-danger)' }}>Access Denied</h2>
                    <p>You don&apos;t have permission to view the SEO dashboard.</p>
                </div>
            </AdminLayout>
        );
    }

    const getCoveragePercentage = () => {
        const targetPages = 68; // Total pages we want to cover
        return Math.round((dashboardData.metaTags.active / targetPages) * 100);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active':
            case 'good':
                return 'var(--color-success)';
            case 'warning':
                return 'var(--color-warning)';
            case 'inactive':
            case 'error':
                return 'var(--color-danger)';
            default:
                return '#6c757d';
        }
    };

    return (
        <AdminLayout>
            <div className="admin-dashboard">
                <div className="dashboard-header">
                    <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--color-heading-1)', margin: '0 0 8px 0' }}>
                        SEO Dashboard
                    </h1>
                    <p style={{ fontSize: '16px', color: 'var(--color-body)', margin: 0 }}>
                        Monitor your technical SEO health and coverage
                    </p>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                        <div className="loading-spinner"></div>
                        <p style={{ marginTop: '16px' }}>Loading dashboard data...</p>
                    </div>
                ) : (
                    <>
                        {/* Quick Stats */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                            {/* Meta Tags Coverage */}
                            <div className="activity-card">
                                <div style={{ padding: '24px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                                        <span style={{ fontSize: '32px', marginRight: '12px' }}>🏷️</span>
                                        <div>
                                            <h3 style={{ fontSize: '16px', fontWeight: '500', margin: '0 0 4px 0' }}>Meta Tags</h3>
                                            <p style={{ fontSize: '12px', color: 'var(--color-body)', margin: 0 }}>Page Coverage</p>
                                        </div>
                                    </div>
                                    <div style={{ marginBottom: '12px' }}>
                                        <div style={{ fontSize: '36px', fontWeight: 'bold', color: 'var(--color-heading-1)' }}>
                                            {dashboardData.metaTags.active}/68
                                        </div>
                                        <div style={{ fontSize: '14px', color: 'var(--color-body)' }}>
                                            {getCoveragePercentage()}% Complete
                                        </div>
                                    </div>
                                    <div style={{ width: '100%', height: '8px', backgroundColor: '#f3f4f6', borderRadius: '4px', overflow: 'hidden' }}>
                                        <div style={{ 
                                            width: `${getCoveragePercentage()}%`, 
                                            height: '100%', 
                                            backgroundColor: getCoveragePercentage() >= 90 ? 'var(--color-success)' : getCoveragePercentage() >= 50 ? 'var(--color-warning)' : 'var(--color-danger)',
                                            transition: 'width 0.3s'
                                        }}></div>
                                    </div>
                                    <Link href="/admin/seo/meta-tags" style={{ display: 'block', marginTop: '16px', color: 'var(--color-primary)', textDecoration: 'none', fontSize: '14px' }}>
                                        Manage Meta Tags →
                                    </Link>
                                </div>
                            </div>

                            {/* Sitemap Status */}
                            <div className="activity-card">
                                <div style={{ padding: '24px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                                        <span style={{ fontSize: '32px', marginRight: '12px' }}>🗺️</span>
                                        <div>
                                            <h3 style={{ fontSize: '16px', fontWeight: '500', margin: '0 0 4px 0' }}>Sitemap</h3>
                                            <p style={{ fontSize: '12px', color: 'var(--color-body)', margin: 0 }}>XML Sitemap</p>
                                        </div>
                                    </div>
                                    <div style={{ marginBottom: '12px' }}>
                                        <div style={{ fontSize: '36px', fontWeight: 'bold', color: 'var(--color-heading-1)' }}>
                                            {dashboardData.sitemap.totalPages}
                                        </div>
                                        <div style={{ fontSize: '14px', color: 'var(--color-body)' }}>
                                            URLs in Sitemap
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                                        <span style={{
                                            fontSize: '12px',
                                            padding: '4px 8px',
                                            borderRadius: '12px',
                                            backgroundColor: getStatusColor(dashboardData.sitemap.status),
                                            color: '#fff'
                                        }}>
                                            {dashboardData.sitemap.status}
                                        </span>
                                        {dashboardData.sitemap.lastGenerated && (
                                            <span style={{ fontSize: '12px', color: 'var(--color-body)' }}>
                                                Updated: {new Date(dashboardData.sitemap.lastGenerated).toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>
                                    <Link href="/admin/seo/sitemap" style={{ display: 'block', color: 'var(--color-primary)', textDecoration: 'none', fontSize: '14px' }}>
                                        Manage Sitemap →
                                    </Link>
                                </div>
                            </div>

                            {/* Robots.txt Status */}
                            <div className="activity-card">
                                <div style={{ padding: '24px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                                        <span style={{ fontSize: '32px', marginRight: '12px' }}>🤖</span>
                                        <div>
                                            <h3 style={{ fontSize: '16px', fontWeight: '500', margin: '0 0 4px 0' }}>Robots.txt</h3>
                                            <p style={{ fontSize: '12px', color: 'var(--color-body)', margin: 0 }}>Crawler Rules</p>
                                        </div>
                                    </div>
                                    <div style={{ marginBottom: '12px' }}>
                                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--color-heading-1)', marginBottom: '8px' }}>
                                            {dashboardData.robotsTxt.exists ? '✓ Configured' : '✗ Not Set'}
                                        </div>
                                        <div style={{ fontSize: '14px', color: 'var(--color-body)' }}>
                                            {dashboardData.robotsTxt.exists ? 'Robots.txt is active' : 'Configure robots.txt'}
                                        </div>
                                    </div>
                                    <div style={{ marginBottom: '16px' }}>
                                        {dashboardData.robotsTxt.exists ? (
                                            <a href="/robots.txt" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', padding: '6px 12px', backgroundColor: 'var(--color-success)', color: '#fff', borderRadius: '4px', textDecoration: 'none', fontSize: '12px', marginRight: '8px' }}>
                                                View Live
                                            </a>
                                        ) : null}
                                    </div>
                                    <Link href="/admin/seo/robots" style={{ display: 'block', color: 'var(--color-primary)', textDecoration: 'none', fontSize: '14px' }}>
                                        Manage Robots.txt →
                                    </Link>
                                </div>
                            </div>

                            {/* SEO Settings */}
                            <div className="activity-card">
                                <div style={{ padding: '24px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                                        <span style={{ fontSize: '32px', marginRight: '12px' }}>⚙️</span>
                                        <div>
                                            <h3 style={{ fontSize: '16px', fontWeight: '500', margin: '0 0 4px 0' }}>SEO Settings</h3>
                                            <p style={{ fontSize: '12px', color: 'var(--color-body)', margin: 0 }}>Configuration</p>
                                        </div>
                                    </div>
                                    <div style={{ marginBottom: '12px' }}>
                                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--color-heading-1)', marginBottom: '8px' }}>
                                            {dashboardData.seoSettings.configured ? '✓ Configured' : '✗ Not Set'}
                                        </div>
                                        <div style={{ fontSize: '14px', color: 'var(--color-body)' }}>
                                            {dashboardData.seoSettings.configured ? 'Settings are configured' : 'Configure site settings'}
                                        </div>
                                    </div>
                                    <Link href="/admin/seo/settings" style={{ display: 'block', marginTop: '24px', color: 'var(--color-primary)', textDecoration: 'none', fontSize: '14px' }}>
                                        Manage Settings →
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* SEO Health Checklist */}
                        <div className="activity-card" style={{ marginBottom: '20px' }}>
                            <div style={{ padding: '24px' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: '500', color: 'var(--color-heading-1)', margin: '0 0 20px 0' }}>
                                    SEO Health Checklist
                                </h3>
                                
                                <div style={{ display: 'grid', gap: '12px' }}>
                                    <ChecklistItem 
                                        label="Meta tags configured for all 68 pages"
                                        status={dashboardData.metaTags.active >= 68 ? 'complete' : dashboardData.metaTags.active > 0 ? 'partial' : 'incomplete'}
                                    />
                                    <ChecklistItem 
                                        label="Robots.txt is configured and accessible"
                                        status={dashboardData.robotsTxt.exists ? 'complete' : 'incomplete'}
                                    />
                                    <ChecklistItem 
                                        label="XML Sitemap is generated and accessible"
                                        status={dashboardData.sitemap.status === 'active' ? 'complete' : 'incomplete'}
                                    />
                                    <ChecklistItem 
                                        label="Site-wide SEO settings configured"
                                        status={dashboardData.seoSettings.configured ? 'complete' : 'incomplete'}
                                    />
                                    <ChecklistItem 
                                        label="Canonical URLs implemented"
                                        status="complete"
                                    />
                                    <ChecklistItem 
                                        label="Open Graph tags enhanced"
                                        status="complete"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="activity-card">
                            <div style={{ padding: '24px' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: '500', color: 'var(--color-heading-1)', margin: '0 0 20px 0' }}>
                                    Quick Actions
                                </h3>
                                
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                                    <Link href="/admin/seo/meta-tags" style={{ padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '8px', textDecoration: 'none', color: 'inherit', transition: 'background 0.2s' }}
                                        onMouseOver={e => e.currentTarget.style.backgroundColor = '#e9ecef'}
                                        onMouseOut={e => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                                    >
                                        <div style={{ fontSize: '24px', marginBottom: '8px' }}>🏷️</div>
                                        <div style={{ fontSize: '14px', fontWeight: '500' }}>Add Meta Tags</div>
                                        <div style={{ fontSize: '12px', color: 'var(--color-body)' }}>Create or edit page meta tags</div>
                                    </Link>
                                    
                                    <Link href="/admin/seo/sitemap" style={{ padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '8px', textDecoration: 'none', color: 'inherit', transition: 'background 0.2s' }}
                                        onMouseOver={e => e.currentTarget.style.backgroundColor = '#e9ecef'}
                                        onMouseOut={e => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                                    >
                                        <div style={{ fontSize: '24px', marginBottom: '8px' }}>🗺️</div>
                                        <div style={{ fontSize: '14px', fontWeight: '500' }}>Generate Sitemap</div>
                                        <div style={{ fontSize: '12px', color: 'var(--color-body)' }}>Update XML sitemap</div>
                                    </Link>
                                    
                                    <Link href="/admin/seo/robots" style={{ padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '8px', textDecoration: 'none', color: 'inherit', transition: 'background 0.2s' }}
                                        onMouseOver={e => e.currentTarget.style.backgroundColor = '#e9ecef'}
                                        onMouseOut={e => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                                    >
                                        <div style={{ fontSize: '24px', marginBottom: '8px' }}>🤖</div>
                                        <div style={{ fontSize: '14px', fontWeight: '500' }}>Edit Robots.txt</div>
                                        <div style={{ fontSize: '12px', color: 'var(--color-body)' }}>Configure crawler rules</div>
                                    </Link>
                                    
                                    <Link href="/admin/seo/settings" style={{ padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '8px', textDecoration: 'none', color: 'inherit', transition: 'background 0.2s' }}
                                        onMouseOver={e => e.currentTarget.style.backgroundColor = '#e9ecef'}
                                        onMouseOut={e => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                                    >
                                        <div style={{ fontSize: '24px', marginBottom: '8px' }}>⚙️</div>
                                        <div style={{ fontSize: '14px', fontWeight: '500' }}>SEO Settings</div>
                                        <div style={{ fontSize: '12px', color: 'var(--color-body)' }}>Update site configuration</div>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </AdminLayout>
    );
}

function ChecklistItem({ label, status }) {
    const getIcon = () => {
        switch (status) {
            case 'complete':
                return '✓';
            case 'partial':
                return '⚠';
            case 'incomplete':
                return '✗';
            default:
                return '○';
        }
    };
    
    const getColor = () => {
        switch (status) {
            case 'complete':
                return 'var(--color-success)';
            case 'partial':
                return 'var(--color-warning)';
            case 'incomplete':
                return 'var(--color-danger)';
            default:
                return '#6c757d';
        }
    };
    
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ 
                width: '24px', 
                height: '24px', 
                borderRadius: '50%', 
                backgroundColor: getColor(),
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: 'bold',
                flexShrink: 0
            }}>
                {getIcon()}
            </div>
            <div style={{ fontSize: '14px', color: 'var(--color-body)' }}>
                {label}
            </div>
        </div>
    );
}

