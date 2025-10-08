"use client";
import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAuth } from '@/contexts/AuthContext';
import { ADMIN_PERMISSIONS } from '@/utils/userRoleService';
import toast from 'react-hot-toast';
import '../../admin.css';

export default function SEOSettingsPage() {
    const { hasPermission } = useAuth();
    const [settings, setSettings] = useState({
        siteTitle: '',
        siteDescription: '',
        siteLogo: '',
        siteUrl: '',
        googleAnalyticsId: '',
        googleSearchConsole: '',
        socialMedia: {
            facebook: '',
            twitter: '',
            linkedin: ''
        }
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            setLoading(true);
            // Try to load from localStorage first
            const savedSettings = localStorage.getItem('seo_settings');
            if (savedSettings) {
                setSettings(JSON.parse(savedSettings));
            } else {
                // Set default values
                setSettings({
                    siteTitle: 'JustJobsInfo - Professional Resume and Career Services',
                    siteDescription: 'Professional resume writing services, career guidance, and job search resources',
                    siteLogo: '/images/logo/justjobslogo.png',
                    siteUrl: 'https://justjobsinfo.com',
                    googleAnalyticsId: '',
                    googleSearchConsole: '',
                    socialMedia: {
                        facebook: '',
                        twitter: '',
                        linkedin: ''
                    }
                });
            }
        } catch (error) {
            console.error('Error loading settings:', error);
            toast.error('Failed to load SEO settings');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            
            // Validate required fields
            if (!settings.siteTitle.trim()) {
                toast.error('Site title is required');
                return;
            }
            if (!settings.siteDescription.trim()) {
                toast.error('Site description is required');
                return;
            }
            if (!settings.siteUrl.trim()) {
                toast.error('Site URL is required');
                return;
            }

            // Save to localStorage (in a real app, this would be an API call)
            localStorage.setItem('seo_settings', JSON.stringify(settings));
            
            toast.success('SEO settings saved successfully');
        } catch (error) {
            console.error('Error saving settings:', error);
            toast.error('Failed to save SEO settings');
        } finally {
            setSaving(false);
        }
    };

    const handleInputChange = (field, value) => {
        if (field.includes('.')) {
            const [parent, child] = field.split('.');
            setSettings(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setSettings(prev => ({
                ...prev,
                [field]: value
            }));
        }
    };

    if (!hasPermission(ADMIN_PERMISSIONS.MANAGE_SEO)) {
        return (
            <AdminLayout>
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <h2 style={{ color: 'var(--color-danger)' }}>Access Denied</h2>
                    <p>You don&apos;t have permission to manage SEO settings.</p>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="admin-dashboard">
                <div className="dashboard-header">
                    <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--color-heading-1)', margin: '0 0 8px 0' }}>SEO Settings</h1>
                    <p style={{ fontSize: '16px', color: 'var(--color-body)', margin: 0 }}>Configure basic SEO settings for your website</p>
                    
                    {/* Quick Links */}
                    <div style={{ marginTop: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <a 
                            href="/admin/seo/meta-tags"
                            style={{
                                padding: '8px 16px',
                                backgroundColor: 'var(--color-primary)',
                                color: '#fff',
                                textDecoration: 'none',
                                borderRadius: '4px',
                                fontSize: '14px',
                                fontWeight: '500',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            🏷️ Manage Meta Tags
                        </a>
                        <a 
                            href="/admin/seo/sitemap"
                            style={{
                                padding: '8px 16px',
                                backgroundColor: 'var(--color-secondary)',
                                color: '#fff',
                                textDecoration: 'none',
                                borderRadius: '4px',
                                fontSize: '14px',
                                fontWeight: '500',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            🗺️ Manage Sitemap
                        </a>
                        <a 
                            href="/admin/seo/robots"
                            style={{
                                padding: '8px 16px',
                                backgroundColor: 'var(--color-warning)',
                                color: '#fff',
                                textDecoration: 'none',
                                borderRadius: '4px',
                                fontSize: '14px',
                                fontWeight: '500',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            🤖 Manage Robots.txt
                        </a>
                    </div>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                        <div className="loading-spinner"></div>
                        <p style={{ marginTop: '16px' }}>Loading settings...</p>
                    </div>
                ) : (
                    <div className="activity-card">
                        <div style={{ padding: '24px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: '500', color: 'var(--color-heading-1)', margin: '0 0 20px 0' }}>Basic Settings</h3>
                            
                            <div style={{ display: 'grid', gap: '20px' }}>
                                {/* Site Title */}
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Site Title:</label>
                                    <input
                                        type="text"
                                        value={settings.siteTitle}
                                        onChange={(e) => handleInputChange('siteTitle', e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            border: '1px solid #ddd',
                                            borderRadius: '4px',
                                            fontSize: '14px'
                                        }}
                                        placeholder="Enter site title"
                                    />
                                </div>

                                {/* Site Description */}
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Site Description:</label>
                                    <textarea
                                        value={settings.siteDescription}
                                        onChange={(e) => handleInputChange('siteDescription', e.target.value)}
                                        rows="3"
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            border: '1px solid #ddd',
                                            borderRadius: '4px',
                                            fontSize: '14px',
                                            resize: 'vertical'
                                        }}
                                        placeholder="Enter site description"
                                    />
                                </div>

                                {/* Site URL */}
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Site URL:</label>
                                    <input
                                        type="url"
                                        value={settings.siteUrl}
                                        onChange={(e) => handleInputChange('siteUrl', e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            border: '1px solid #ddd',
                                            borderRadius: '4px',
                                            fontSize: '14px'
                                        }}
                                        placeholder="https://yourwebsite.com"
                                    />
                                </div>

                                {/* Google Analytics */}
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Google Analytics ID:</label>
                                    <input
                                        type="text"
                                        value={settings.googleAnalyticsId}
                                        onChange={(e) => handleInputChange('googleAnalyticsId', e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            border: '1px solid #ddd',
                                            borderRadius: '4px',
                                            fontSize: '14px'
                                        }}
                                        placeholder="GA-XXXXXXXXX"
                                    />
                                </div>

                                {/* Social Media */}
                                <div>
                                    <h4 style={{ fontSize: '16px', fontWeight: '500', margin: '0 0 12px 0' }}>Social Media URLs:</h4>
                                    <div style={{ display: 'grid', gap: '12px' }}>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>Facebook:</label>
                                            <input
                                                type="url"
                                                value={settings.socialMedia?.facebook || ''}
                                                onChange={(e) => handleInputChange('socialMedia.facebook', e.target.value)}
                                                style={{
                                                    width: '100%',
                                                    padding: '8px 12px',
                                                    border: '1px solid #ddd',
                                                    borderRadius: '4px',
                                                    fontSize: '14px'
                                                }}
                                                placeholder="https://facebook.com/yourpage"
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>Twitter:</label>
                                            <input
                                                type="url"
                                                value={settings.socialMedia?.twitter || ''}
                                                onChange={(e) => handleInputChange('socialMedia.twitter', e.target.value)}
                                                style={{
                                                    width: '100%',
                                                    padding: '8px 12px',
                                                    border: '1px solid #ddd',
                                                    borderRadius: '4px',
                                                    fontSize: '14px'
                                                }}
                                                placeholder="https://twitter.com/yourhandle"
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>LinkedIn:</label>
                                            <input
                                                type="url"
                                                value={settings.socialMedia?.linkedin || ''}
                                                onChange={(e) => handleInputChange('socialMedia.linkedin', e.target.value)}
                                                style={{
                                                    width: '100%',
                                                    padding: '8px 12px',
                                                    border: '1px solid #ddd',
                                                    borderRadius: '4px',
                                                    fontSize: '14px'
                                                }}
                                                placeholder="https://linkedin.com/company/yourcompany"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Save Button */}
                                <div style={{ marginTop: '20px' }}>
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
                                            width: '250px'
                                        }}
                                    >
                                        {saving ? 'Saving...' : 'Save Settings'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
} 
