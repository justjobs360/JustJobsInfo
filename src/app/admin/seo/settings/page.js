"use client";
import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAuth } from '@/contexts/AuthContext';
import { ADMIN_PERMISSIONS } from '@/utils/userRoleService';
import '../../admin.css';

export default function SEOSettingsPage() {
    const { hasPermission } = useAuth();
    const [settings, setSettings] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Mock data
        setTimeout(() => {
            setSettings({
                siteTitle: 'JustJobsInfo - Professional Resume and Career Services',
                siteDescription: 'Professional resume writing services, career guidance, and job search resources',
                siteLogo: '/images/logo/justjobslogo.png',
                siteUrl: 'https://justjobsinfo.com',
                googleAnalyticsId: 'GA-123456789',
                googleSearchConsole: 'https://search.google.com/search-console',
                socialMedia: {
                    facebook: 'https://facebook.com/justjobsinfo',
                    twitter: 'https://twitter.com/justjobsinfo',
                    linkedin: 'https://linkedin.com/company/justjobsinfo'
                }
            });
            setLoading(false);
        }, 1000);
    }, []);

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
                                                value={settings.socialMedia?.facebook}
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
                                                value={settings.socialMedia?.twitter}
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
                                                value={settings.socialMedia?.linkedin}
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
                                        Save Settings
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