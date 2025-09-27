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
        recentCVs: 0,
        totalBlogs: 0,
        publishedBlogs: 0,
        totalImportantLinks: 0,
        totalDownloadableResources: 0,
        seoScore: 0,
        recentActivity: [],
        metrics: {}
    });
    const [apiStats, setApiStats] = useState({
        monthlyUsage: 0,
        monthlyLimit: 100,
        usagePercentage: 0,
        nearLimit: false,
        isPrewarming: false,
        lastPrewarmTime: null,
        cacheStatus: 'HEALTHY'
    });
    const [prewarming, setPrewarming] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchApiStats = async () => {
        try {
            const response = await fetch('/api/jobs/cache-stats');
            const data = await response.json();
            
            if (data.success) {
                setApiStats(data.stats);
            } else {
                console.error('Failed to fetch API stats:', data.error);
            }
        } catch (error) {
            console.error('Error fetching API stats:', error);
        }
    };

    const triggerPrewarm = async () => {
        setPrewarming(true);
        try {
            const response = await fetch('/api/cron/prewarm-cache', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ force: true })
            });
            
            const data = await response.json();
            
            if (data.success) {
                alert(`Cache prewarming completed! Cached ${data.cached} searches.`);
                fetchApiStats(); // Refresh API stats
            } else {
                alert(`Prewarming failed: ${data.message}`);
            }
        } catch (error) {
            console.error('Error triggering prewarm:', error);
            alert('Failed to trigger cache prewarming');
        } finally {
            setPrewarming(false);
        }
    };

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
        fetchApiStats(); // Fetch API stats
        
        // Refresh API stats every 30 seconds
        const interval = setInterval(fetchApiStats, 30000);
        return () => clearInterval(interval);
    }, [isSuperAdmin]);

    const StatCard = ({ title, value, icon, color, loading = false, subtitle = null }) => (
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
                        <>
                            <p style={{ fontSize: '24px', fontWeight: '600', color: 'var(--color-heading-1)', margin: 0 }}>{value}</p>
                            {subtitle && (
                                <p style={{ fontSize: '12px', color: 'var(--color-body)', margin: '2px 0 0 0' }}>{subtitle}</p>
                            )}
                        </>
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
                                value={stats.totalCVs.toLocaleString()}
                                subtitle={stats.recentCVs > 0 ? `${stats.recentCVs} today` : 'No recent audits'}
                                icon="📄"
                                color="var(--color-success)"
                            />
                            <StatCard
                                title="Blog Posts"
                                value={stats.publishedBlogs}
                                subtitle={`${stats.totalBlogs} total posts`}
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

                {/* API Usage Monitoring - Only for Super Admin */}
                {isSuperAdmin() && (
                    <div className="api-usage-section">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ fontSize: '20px', fontWeight: '500', color: 'var(--color-heading-1)', margin: 0 }}>
                                🔧 API Usage Monitoring
                            </h2>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button 
                                    onClick={() => fetchApiStats()}
                                    className="btn btn-secondary btn-sm"
                                >
                                    Refresh
                                </button>
                                <button 
                                    onClick={triggerPrewarm}
                                    disabled={prewarming || apiStats.nearLimit}
                                    className="btn btn-primary btn-sm"
                                >
                                    {prewarming ? 'Prewarming...' : 'Force Prewarm'}
                                </button>
                            </div>
                        </div>

                        <div className="api-stats-grid">
                            <div className="api-stat-card">
                                <div className="api-stat-header">
                                    <h3>Monthly API Usage</h3>
                                    <span className={`status-badge ${apiStats.nearLimit ? 'warning' : 'success'}`}>
                                        {apiStats.cacheStatus}
                                    </span>
                                </div>
                                <div className="api-stat-content">
                                    <div className="usage-bar">
                                        <div 
                                            className="usage-fill" 
                                            style={{ 
                                                width: `${Math.min(apiStats.usagePercentage, 100)}%`,
                                                backgroundColor: apiStats.nearLimit ? '#dc3545' : apiStats.usagePercentage > 70 ? '#ffc107' : '#28a745'
                                            }}
                                        ></div>
                                    </div>
                                    <div className="usage-text">
                                        <strong>{apiStats.monthlyUsage}</strong> / {apiStats.monthlyLimit} calls
                                        <span className="percentage">({apiStats.usagePercentage.toFixed(1)}%)</span>
                                    </div>
                                </div>
                            </div>

                            <div className="api-stat-card">
                                <div className="api-stat-header">
                                    <h3>Remaining Calls</h3>
                                </div>
                                <div className="api-stat-content">
                                    <div className="big-number">{apiStats.monthlyLimit - apiStats.monthlyUsage}</div>
                                    <div className="stat-description">
                                        {apiStats.monthlyLimit - apiStats.monthlyUsage > 50 ? 'Plenty of calls remaining' : 
                                         apiStats.monthlyLimit - apiStats.monthlyUsage > 20 ? 'Moderate usage' : 
                                         apiStats.monthlyLimit - apiStats.monthlyUsage > 0 ? 'Low remaining calls' : 'No calls remaining'}
                                    </div>
                                </div>
                            </div>

                            <div className="api-stat-card">
                                <div className="api-stat-header">
                                    <h3>Cache Status</h3>
                                </div>
                                <div className="api-stat-content">
                                    <div className="cache-info">
                                        <div className="cache-item">
                                            <span className="label">Prewarming:</span>
                                            <span className={`value ${apiStats.isPrewarming ? 'active' : 'inactive'}`}>
                                                {apiStats.isPrewarming ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                        <div className="cache-item">
                                            <span className="label">Last Prewarm:</span>
                                            <span className="value">
                                                {apiStats.lastPrewarmTime !== null ? 
                                                  `${Math.round((Date.now() - apiStats.lastPrewarmTime) / (1000 * 60 * 60))} hours ago` : 
                                                  'Never'
                                                }
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="api-info-section">
                            <h4>💡 How It Works</h4>
                            <div className="api-info-grid">
                                <div className="api-info-card">
                                    <strong>🎯 Smart Caching</strong>
                                    <p>Popular searches cached for 24h, reducing API calls by 95%</p>
                                </div>
                                <div className="api-info-card">
                                    <strong>⚡ Background Prewarming</strong>
                                    <p>Cache refreshed every 12h with popular searches</p>
                                </div>
                                <div className="api-info-card">
                                    <strong>🛡️ Budget Protection</strong>
                                    <p>Serves stale cache when approaching limit</p>
                                </div>
                                <div className="api-info-card">
                                    <strong>📊 Real-time Monitoring</strong>
                                    <p>Live tracking ensures we never exceed limits</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

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

                {/* Recent Activity Section */}
                {stats.recentActivity && stats.recentActivity.length > 0 && (
                    <div className="dashboard-section">
                        <h2 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--color-heading-1)', marginBottom: '20px' }}>
                            📊 Recent Activity
                        </h2>
                        <div className="activity-card">
                            <div style={{ padding: '20px' }}>
                                {stats.recentActivity.map((activity, index) => (
                                    <div key={activity.id} className="activity-item" style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        padding: '12px 0',
                                        borderBottom: index < stats.recentActivity.length - 1 ? '1px solid #f0f0f0' : 'none'
                                    }}>
                                        <div style={{ 
                                            width: '40px', 
                                            height: '40px', 
                                            borderRadius: '50%', 
                                            background: activity.type === 'cv-audit' ? 'var(--color-success)' : 
                                                       activity.type === 'blog' ? 'var(--color-primary)' : 'var(--color-warning)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginRight: '16px'
                                        }}>
                                            <span style={{ fontSize: '16px', color: 'white' }}>
                                                {activity.type === 'cv-audit' ? '📄' : 
                                                 activity.type === 'blog' ? '📰' : '🔗'}
                                            </span>
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <p style={{ fontSize: '14px', fontWeight: '500', color: 'var(--color-heading-1)', margin: '0 0 4px 0' }}>
                                                {activity.action}
                                            </p>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <p style={{ fontSize: '12px', color: 'var(--color-body)', margin: 0 }}>
                                                    {activity.user}
                                                </p>
                                                <span style={{ fontSize: '10px', color: '#ccc' }}>•</span>
                                                <p style={{ fontSize: '12px', color: 'var(--color-body)', margin: 0 }}>
                                                    {activity.time}
                                                </p>
                                                {activity.score && (
                                                    <>
                                                        <span style={{ fontSize: '10px', color: '#ccc' }}>•</span>
                                                        <span style={{ 
                                                            fontSize: '10px', 
                                                            padding: '2px 6px',
                                                            borderRadius: '10px',
                                                            background: activity.score >= 80 ? '#d4edda' : activity.score >= 60 ? '#fff3cd' : '#f8d7da',
                                                            color: activity.score >= 80 ? '#155724' : activity.score >= 60 ? '#856404' : '#721c24'
                                                        }}>
                                                            Score: {activity.score}/100
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

            </div>
            
            {/* API Usage Styles */}
            <style jsx>{`
                .api-usage-section {
                    background: #f8f9fa;
                    padding: 30px;
                    border-radius: 8px;
                    margin: 30px 0;
                    border: 1px solid #e9ecef;
                }
                
                .api-stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 20px;
                    margin-bottom: 30px;
                }
                
                .api-stat-card {
                    background: white;
                    border: 1px solid #eee;
                    border-radius: 8px;
                    padding: 20px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                
                .api-stat-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 15px;
                }
                
                .api-stat-header h3 {
                    margin: 0;
                    font-size: 16px;
                    color: #333;
                }
                
                .status-badge {
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 12px;
                    font-weight: 600;
                    text-transform: uppercase;
                }
                
                .status-badge.success {
                    background: #d4edda;
                    color: #155724;
                }
                
                .status-badge.warning {
                    background: #fff3cd;
                    color: #856404;
                }
                
                .usage-bar {
                    height: 8px;
                    background: #f8f9fa;
                    border-radius: 4px;
                    overflow: hidden;
                    margin-bottom: 10px;
                }
                
                .usage-fill {
                    height: 100%;
                    transition: width 0.3s ease;
                }
                
                .usage-text {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-size: 14px;
                }
                
                .percentage {
                    color: #666;
                    font-weight: normal;
                }
                
                .big-number {
                    font-size: 32px;
                    font-weight: bold;
                    color: var(--color-primary);
                    margin-bottom: 5px;
                }
                
                .stat-description {
                    color: #666;
                    font-size: 14px;
                }
                
                .cache-info {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }
                
                .cache-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-size: 14px;
                }
                
                .cache-item .label {
                    color: #666;
                }
                
                .cache-item .value.active {
                    color: #28a745;
                    font-weight: 600;
                }
                
                .cache-item .value.inactive {
                    color: #666;
                }
                
                .api-info-section {
                    background: white;
                    padding: 20px;
                    border-radius: 6px;
                    border-left: 4px solid var(--color-primary);
                }
                
                .api-info-section h4 {
                    margin: 0 0 15px 0;
                    font-size: 16px;
                    color: #333;
                }
                
                .api-info-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 15px;
                }
                
                .api-info-card {
                    padding: 15px;
                    background: #f8f9fa;
                    border-radius: 6px;
                    border-left: 3px solid var(--color-primary);
                }
                
                .api-info-card strong {
                    display: block;
                    margin-bottom: 5px;
                    font-size: 14px;
                    color: #333;
                }
                
                .api-info-card p {
                    margin: 0;
                    font-size: 13px;
                    color: #666;
                    line-height: 1.4;
                }
                
                .btn-sm {
                    padding: 6px 12px;
                    font-size: 12px;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                
                .btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }
                
                .btn-primary {
                    background: var(--color-primary);
                    color: white;
                }
                
                .btn-primary:hover:not(:disabled) {
                    background: #0056b3;
                }
                
                .btn-secondary {
                    background: #6c757d;
                    color: white;
                }
                
                .btn-secondary:hover:not(:disabled) {
                    background: #545b62;
                }
                
                @media (max-width: 768px) {
                    .api-stats-grid {
                        grid-template-columns: 1fr;
                    }
                    
                    .api-info-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </AdminLayout>
    );
} 