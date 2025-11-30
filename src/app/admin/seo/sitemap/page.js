"use client";
import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAuth } from '@/contexts/AuthContext';
import { ADMIN_PERMISSIONS } from '@/utils/userRoleService';
import toast from 'react-hot-toast';
import '../../admin.css';

export default function SitemapPage() {
    const { hasPermission } = useAuth();
    const [sitemapData, setSitemapData] = useState({
        lastGenerated: '',
        totalPages: 0,
        status: 'inactive',
        urls: []
    });
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [sitemapXml, setSitemapXml] = useState(null);

    useEffect(() => {
        loadSitemapData();
    }, []);

    const loadSitemapData = async () => {
        try {
            setLoading(true);
            console.log('📋 Loading sitemap configuration from database...');
            
            const response = await fetch('/api/admin/sitemap-config', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            
            const result = await response.json();
            
            if (result.success) {
                const data = result.data;
                setSitemapData({
                    lastGenerated: data.lastGenerated ? new Date(data.lastGenerated).toLocaleString() : '',
                    totalPages: data.totalPages || 0,
                    status: data.totalPages > 0 ? 'active' : 'inactive',
                    urls: data.urls || []
                });
                console.log('✅ Sitemap configuration loaded successfully');
            } else {
                throw new Error(result.error || 'Failed to load sitemap configuration');
            }
        } catch (error) {
            console.error('❌ Error loading sitemap data:', error);
            toast.error('Failed to load sitemap data');
            
            // Initialize with default data on error
            setSitemapData({
                lastGenerated: '',
                totalPages: 0,
                status: 'inactive',
                urls: []
            });
        } finally {
            setLoading(false);
        }
    };

    const generateSitemap = async () => {
        try {
            setGenerating(true);
            console.log('🗺️ Generating sitemap configuration...');
            
            // Load meta tags from database to build comprehensive sitemap
            const metaTagsResponse = await fetch('/api/admin/meta-tags');
            const metaTagsResult = await metaTagsResponse.json();
            
            let staticPages = [];
            
            if (metaTagsResult.success && metaTagsResult.data.length > 0) {
                // Use meta tags data to build sitemap
                staticPages = metaTagsResult.data
                    .filter(tag => tag.status === 'active')
                    .map(tag => {
                        // Determine priority based on page type
                        let priority = '0.5';
                        let changefreq = 'monthly';
                        
                        if (tag.page === '/') {
                            priority = '1.0';
                            changefreq = 'weekly';
                        } else if (tag.page.includes('resume') || tag.page.includes('job')) {
                            priority = '0.9';
                            changefreq = 'weekly';
                        } else if (tag.page.includes('blog')) {
                            priority = '0.7';
                            changefreq = 'daily';
                        } else if (tag.page.includes('service')) {
                            priority = '0.8';
                            changefreq = 'monthly';
                        } else if (tag.page.includes('policy') || tag.page.includes('terms')) {
                            priority = '0.5';
                            changefreq = 'yearly';
                        }
                        
                        return {
                            url: tag.page,
                            priority: priority,
                            changefreq: changefreq,
                            lastmod: new Date().toISOString().split('T')[0]
                        };
                    });
            } else {
                // Fallback to predefined pages
                staticPages = [
                    { url: '/', priority: '1.0', changefreq: 'weekly' },
                    { url: '/about', priority: '0.8', changefreq: 'monthly' },
                    { url: '/contact', priority: '0.8', changefreq: 'monthly' },
                    { url: '/resume-audit', priority: '0.9', changefreq: 'weekly' },
                    { url: '/resume-builder', priority: '0.9', changefreq: 'weekly' },
                    { url: '/job-listing', priority: '0.8', changefreq: 'daily' },
                    { url: '/blogs', priority: '0.7', changefreq: 'daily' },
                    { url: '/service', priority: '0.8', changefreq: 'monthly' }
                ].map(page => ({
                    ...page,
                    lastmod: new Date().toISOString().split('T')[0]
                }));
            }

            // Save to database
            const response = await fetch('/api/admin/sitemap-config', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    urls: staticPages,
                    mode: 'replace'
                }),
            });

            const result = await response.json();

            if (result.success) {
                const newSitemapData = {
                    lastGenerated: new Date().toLocaleString(),
                    totalPages: staticPages.length,
                    status: 'active',
                    urls: staticPages
                };

                setSitemapData(newSitemapData);
                console.log('✅ Sitemap configuration saved to database');

                // Generate sitemap XML for download
                try {
                    const writeResp = await fetch('/api/admin/generate-sitemap', { method: 'POST' });
                    
                    if (!writeResp.ok) {
                        throw new Error('Failed to generate sitemap XML');
                    }
                    
                    const writeJson = await writeResp.json();
                    
                    if (writeJson.success && writeJson.xml) {
                        setSitemapXml(writeJson.xml);
                        toast.success(`Sitemap generated successfully with ${writeJson.count} URLs. You can download it below.`);
                        console.log('✅ Sitemap XML generated:', writeJson.count, 'URLs');
                    } else {
                        throw new Error(writeJson.error || 'Failed to generate sitemap XML');
                    }
                } catch (e) {
                    console.error('❌ Error generating sitemap XML:', e);
                    toast.error('Sitemap config saved, but failed to generate XML: ' + e.message);
                }
            } else {
                throw new Error(result.error || 'Failed to generate sitemap');
            }
        } catch (error) {
            console.error('❌ Error generating sitemap:', error);
            toast.error('Failed to generate sitemap: ' + error.message);
        } finally {
            setGenerating(false);
        }
    };

    const viewSitemap = () => {
        // Always open the static sitemap.xml served from public
        window.open('/sitemap.xml', '_blank');
    };

    const downloadSitemap = async () => {
        try {
            let xmlContent = sitemapXml;
            
            // If we have XML in state, use it; otherwise try to fetch from server
            if (!xmlContent) {
                const res = await fetch('/api/admin/generate-sitemap', { method: 'POST' });
                if (!res.ok) throw new Error('Failed to generate sitemap');
                const result = await res.json();
                if (!result.success || !result.xml) {
                    throw new Error('Failed to get sitemap XML');
                }
                xmlContent = result.xml;
                setSitemapXml(xmlContent);
            }
            
            // Create blob and download
            const blob = new Blob([xmlContent], { type: 'application/xml' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'sitemap.xml';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            toast.success('Sitemap downloaded successfully');
        } catch (e) {
            console.error('❌ Download sitemap error:', e);
            toast.error('Could not download sitemap.xml: ' + e.message);
        }
    };

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

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                        <div className="loading-spinner"></div>
                        <p style={{ marginTop: '16px' }}>Loading sitemap data...</p>
                    </div>
                ) : (
                    <>
                        <div className="activity-card">
                            <div style={{ padding: '24px' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: '500', color: 'var(--color-heading-1)', margin: '0 0 20px 0' }}>Sitemap Status</h3>
                                
                                <div style={{ display: 'grid', gap: '20px' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Last Generated:</label>
                                        <p style={{ fontSize: '14px', color: 'var(--color-body)' }}>
                                            {sitemapData.lastGenerated || 'Never generated'}
                                        </p>
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

                                    <div style={{ marginTop: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                        <button
                                            onClick={generateSitemap}
                                            disabled={generating}
                                            style={{
                                                padding: '12px 24px',
                                                backgroundColor: generating ? '#ccc' : 'var(--color-primary)',
                                                color: '#fff',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: generating ? 'not-allowed' : 'pointer',
                                                fontSize: '14px',
                                                fontWeight: '500',
                                                minWidth: '180px'
                                            }}
                                        >
                                            {generating ? 'Generating...' : 'Generate Sitemap'}
                                        </button>
                                        <button
                                            onClick={viewSitemap}
                                            style={{
                                                padding: '12px 24px',
                                                backgroundColor: 'var(--color-success)',
                                                color: '#fff',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                fontSize: '14px',
                                                fontWeight: '500',
                                                minWidth: '150px'
                                            }}
                                        >
                                            View Sitemap
                                        </button>
                                        <button
                                            onClick={downloadSitemap}
                                            disabled={!sitemapXml && !sitemapData.totalPages}
                                            style={{
                                                padding: '12px 24px',
                                                backgroundColor: (!sitemapXml && !sitemapData.totalPages) ? '#ccc' : '#6c757d',
                                                color: '#fff',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: (!sitemapXml && !sitemapData.totalPages) ? 'not-allowed' : 'pointer',
                                                fontSize: '14px',
                                                fontWeight: '500',
                                                minWidth: '180px'
                                            }}
                                        >
                                            {sitemapXml ? 'Download Sitemap' : 'Download Sitemap (Generate First)'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sitemap URLs List */}
                        {sitemapData.urls && sitemapData.urls.length > 0 && (
                            <div className="activity-card" style={{ marginTop: '20px' }}>
                                <div style={{ padding: '24px' }}>
                                    <h3 style={{ fontSize: '18px', fontWeight: '500', color: 'var(--color-heading-1)', margin: '0 0 20px 0' }}>
                                        Sitemap URLs ({sitemapData.urls.length})
                                    </h3>
                                    
                                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                            <thead>
                                                <tr style={{ borderBottom: '1px solid #ddd' }}>
                                                    <th style={{ padding: '8px', textAlign: 'left', fontSize: '14px', fontWeight: '500' }}>URL</th>
                                                    <th style={{ padding: '8px', textAlign: 'center', fontSize: '14px', fontWeight: '500' }}>Priority</th>
                                                    <th style={{ padding: '8px', textAlign: 'center', fontSize: '14px', fontWeight: '500' }}>Change Frequency</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {sitemapData.urls.map((url, index) => (
                                                    <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                                                        <td style={{ padding: '8px', fontSize: '14px' }}>{url.url}</td>
                                                        <td style={{ padding: '8px', textAlign: 'center', fontSize: '14px' }}>{url.priority}</td>
                                                        <td style={{ padding: '8px', textAlign: 'center', fontSize: '14px' }}>{url.changefreq}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </AdminLayout>
    );
} 
