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

    useEffect(() => {
        loadSitemapData();
    }, []);

    const loadSitemapData = async () => {
        try {
            setLoading(true);
            // Load from localStorage
            const savedData = localStorage.getItem('sitemap_data');
            if (savedData) {
                setSitemapData(JSON.parse(savedData));
            } else {
                // Initialize with default data
                const defaultData = {
                    lastGenerated: '',
                    totalPages: 0,
                    status: 'inactive',
                    urls: []
                };
                setSitemapData(defaultData);
            }
        } catch (error) {
            console.error('Error loading sitemap data:', error);
            toast.error('Failed to load sitemap data');
        } finally {
            setLoading(false);
        }
    };

    const generateSitemap = async () => {
        try {
            setGenerating(true);
            
            // Simulate sitemap generation with predefined pages
            const staticPages = [
                { url: '/', priority: '1.0', changefreq: 'weekly' },
                { url: '/about', priority: '0.8', changefreq: 'monthly' },
                { url: '/contact', priority: '0.8', changefreq: 'monthly' },
                { url: '/resume-audit', priority: '0.9', changefreq: 'weekly' },
                { url: '/resume-builder', priority: '0.9', changefreq: 'weekly' },
                { url: '/job-listing', priority: '0.8', changefreq: 'daily' },
                { url: '/blogs', priority: '0.7', changefreq: 'daily' },
                { url: '/downloadable-resources', priority: '0.6', changefreq: 'weekly' },
                { url: '/important-links', priority: '0.6', changefreq: 'weekly' },
                { url: '/privacy-policy', priority: '0.5', changefreq: 'yearly' },
                { url: '/terms-of-use', priority: '0.5', changefreq: 'yearly' },
                { url: '/faq', priority: '0.6', changefreq: 'monthly' },
                { url: '/career', priority: '0.7', changefreq: 'weekly' },
                { url: '/service', priority: '0.8', changefreq: 'monthly' },
                { url: '/case-studies', priority: '0.7', changefreq: 'monthly' }
            ];

            // Simulate processing delay
            await new Promise(resolve => setTimeout(resolve, 2000));

            const newSitemapData = {
                lastGenerated: new Date().toLocaleString(),
                totalPages: staticPages.length,
                status: 'active',
                urls: staticPages
            };

            setSitemapData(newSitemapData);
            localStorage.setItem('sitemap_data', JSON.stringify(newSitemapData));
            
            toast.success('Sitemap generated successfully');
        } catch (error) {
            console.error('Error generating sitemap:', error);
            toast.error('Failed to generate sitemap');
        } finally {
            setGenerating(false);
        }
    };

    const viewSitemap = () => {
        if (sitemapData.urls.length === 0) {
            toast.error('No sitemap data available. Please generate sitemap first.');
            return;
        }

        // Generate XML sitemap content
        const siteUrl = 'https://justjobsinfo.com';
        const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapData.urls.map(page => `  <url>
    <loc>${siteUrl}${page.url}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </url>`).join('\n')}
</urlset>`;

        // Open in new window
        const blob = new Blob([xmlContent], { type: 'application/xml' });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
        URL.revokeObjectURL(url);
    };

    const downloadSitemap = () => {
        if (sitemapData.urls.length === 0) {
            toast.error('No sitemap data available. Please generate sitemap first.');
            return;
        }

        // Generate XML sitemap content
        const siteUrl = 'https://justjobsinfo.com';
        const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapData.urls.map(page => `  <url>
    <loc>${siteUrl}${page.url}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </url>`).join('\n')}
</urlset>`;

        // Download the file
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
                                            style={{
                                                padding: '12px 24px',
                                                backgroundColor: '#6c757d',
                                                color: '#fff',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                fontSize: '14px',
                                                fontWeight: '500',
                                                minWidth: '180px'
                                            }}
                                        >
                                            Download Sitemap
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