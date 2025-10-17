"use client";
import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAuth } from '@/contexts/AuthContext';
import { ADMIN_PERMISSIONS } from '@/utils/userRoleService';
import toast from 'react-hot-toast';
import '../../admin.css';

export default function RobotsPage() {
    const { hasPermission } = useAuth();
    const [robotsContent, setRobotsContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadRobotsContent();
    }, []);

    const loadRobotsContent = async () => {
        try {
            setLoading(true);
            console.log('📋 Loading robots.txt from database...');
            
            const response = await fetch('/api/admin/robots-txt', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            
            const result = await response.json();
            
            if (result.success) {
                setRobotsContent(result.data.content);
                console.log('✅ Robots.txt loaded successfully');
            } else {
                throw new Error(result.error || 'Failed to load robots.txt');
            }
        } catch (error) {
            console.error('❌ Error loading robots.txt content:', error);
            toast.error('Failed to load robots.txt content');
            
            // Set default content on error
            const defaultContent = `User-agent: *
Allow: /

# Disallow admin areas
Disallow: /admin/
Disallow: /api/

# Allow specific paths
Allow: /api/blogs/
Allow: /api/jobs/

# Sitemap
Sitemap: https://justjobs.info/sitemap.xml

# Crawl delay (optional)
Crawl-delay: 1`;
            setRobotsContent(defaultContent);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            
            // Validate content
            if (!robotsContent.trim()) {
                toast.error('Robots.txt content cannot be empty');
                return;
            }

            console.log('💾 Saving robots.txt to database...');
            
            const response = await fetch('/api/admin/robots-txt', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ content: robotsContent }),
            });

            const result = await response.json();

            if (result.success) {
                toast.success('Robots.txt saved successfully');
                console.log('✅ Robots.txt saved');
            } else {
                throw new Error(result.error || 'Failed to save robots.txt');
            }
        } catch (error) {
            console.error('❌ Error saving robots.txt:', error);
            toast.error('Failed to save robots.txt: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleViewRobots = () => {
        // Open robots.txt in a new window/tab
        const blob = new Blob([robotsContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
        URL.revokeObjectURL(url);
    };

    const handleReset = () => {
        if (confirm('Are you sure you want to reset to default robots.txt content? This will overwrite any custom changes.')) {
            const defaultContent = `User-agent: *
Allow: /

# Disallow admin areas
Disallow: /admin/
Disallow: /api/

# Allow specific paths
Allow: /api/blogs/
Allow: /api/jobs/

# Sitemap
Sitemap: https://justjobs.info/sitemap.xml

# Crawl delay (optional)
Crawl-delay: 1`;
            setRobotsContent(defaultContent);
            toast.success('Reset to default content');
        }
    };

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

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                        <div className="loading-spinner"></div>
                        <p style={{ marginTop: '16px' }}>Loading robots.txt...</p>
                    </div>
                ) : (
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

                            <div style={{ marginTop: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    style={{
                                        padding: '12px 24px',
                                        backgroundColor: saving ? '#ccc' : 'var(--color-success)',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: saving ? 'not-allowed' : 'pointer',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        minWidth: '150px'
                                    }}
                                >
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                                <button
                                    onClick={handleViewRobots}
                                    style={{
                                        padding: '12px 24px',
                                        backgroundColor: 'var(--color-primary)',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        minWidth: '150px'
                                    }}
                                >
                                    View Robots.txt
                                </button>
                                <button
                                    onClick={handleReset}
                                    style={{
                                        padding: '12px 24px',
                                        backgroundColor: '#6c757d',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        minWidth: '150px'
                                    }}
                                >
                                    Reset to Default
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
} 
