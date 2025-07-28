"use client";
import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAuth } from '@/contexts/AuthContext';
import { ADMIN_PERMISSIONS } from '@/utils/userRoleService';
import '../../admin.css';

export default function ResumeStatsPage() {
    const { hasPermission } = useAuth();
    const [stats, setStats] = useState({
        totalAudits: 1250,
        thisMonth: 156,
        thisWeek: 23,
        today: 5,
        averageScore: 78,
        templatesUsed: 890,
        downloads: 2340
    });

    if (!hasPermission(ADMIN_PERMISSIONS.VIEW_ANALYTICS)) {
        return (
            <AdminLayout>
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <h2 style={{ color: 'var(--color-danger)' }}>Access Denied</h2>
                    <p>You don't have permission to view resume audit stats.</p>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="admin-dashboard">
                <div className="dashboard-header">
                    <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--color-heading-1)', margin: '0 0 8px 0' }}>Resume Audit Statistics</h1>
                    <p style={{ fontSize: '16px', color: 'var(--color-body)', margin: 0 }}>Track resume audit usage and performance</p>
                </div>

                {/* Stats Grid */}
                <div className="stats-grid">
                    <div className="stat-card" style={{ borderLeftColor: 'var(--color-primary)' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <div style={{ flexShrink: 0 }}>
                                <span style={{ fontSize: '24px' }}>📊</span>
                            </div>
                            <div style={{ marginLeft: '16px' }}>
                                <p style={{ fontSize: '14px', fontWeight: '500', color: 'var(--color-body)', margin: '0 0 4px 0' }}>Total Audits</p>
                                <p style={{ fontSize: '24px', fontWeight: '600', color: 'var(--color-heading-1)', margin: 0 }}>{stats.totalAudits}</p>
                            </div>
                        </div>
                    </div>

                    <div className="stat-card" style={{ borderLeftColor: 'var(--color-success)' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <div style={{ flexShrink: 0 }}>
                                <span style={{ fontSize: '24px' }}>📈</span>
                            </div>
                            <div style={{ marginLeft: '16px' }}>
                                <p style={{ fontSize: '14px', fontWeight: '500', color: 'var(--color-body)', margin: '0 0 4px 0' }}>This Month</p>
                                <p style={{ fontSize: '24px', fontWeight: '600', color: 'var(--color-heading-1)', margin: 0 }}>{stats.thisMonth}</p>
                            </div>
                        </div>
                    </div>

                    <div className="stat-card" style={{ borderLeftColor: '#6f42c1' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <div style={{ flexShrink: 0 }}>
                                <span style={{ fontSize: '24px' }}>⭐</span>
                            </div>
                            <div style={{ marginLeft: '16px' }}>
                                <p style={{ fontSize: '14px', fontWeight: '500', color: 'var(--color-body)', margin: '0 0 4px 0' }}>Average Score</p>
                                <p style={{ fontSize: '24px', fontWeight: '600', color: 'var(--color-heading-1)', margin: 0 }}>{stats.averageScore}/100</p>
                            </div>
                        </div>
                    </div>

                    <div className="stat-card" style={{ borderLeftColor: 'var(--color-warning)' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <div style={{ flexShrink: 0 }}>
                                <span style={{ fontSize: '24px' }}>📥</span>
                            </div>
                            <div style={{ marginLeft: '16px' }}>
                                <p style={{ fontSize: '14px', fontWeight: '500', color: 'var(--color-body)', margin: '0 0 4px 0' }}>Downloads</p>
                                <p style={{ fontSize: '24px', fontWeight: '600', color: 'var(--color-heading-1)', margin: 0 }}>{stats.downloads}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Detailed Stats */}
                <div className="activity-card">
                    <div style={{ padding: '24px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: '500', color: 'var(--color-heading-1)', margin: '0 0 20px 0' }}>Recent Activity</h3>
                        
                        <div className="activity-list">
                            <div className="activity-item">
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <span style={{ fontSize: '14px', color: 'var(--color-body)', marginRight: '12px' }}>📊</span>
                                    <div>
                                        <p style={{ fontSize: '14px', fontWeight: '500', color: 'var(--color-heading-1)', margin: '0 0 2px 0' }}>Resume audit completed</p>
                                        <p style={{ fontSize: '12px', color: 'var(--color-body)', margin: 0 }}>Score: 85/100 • 2 minutes ago</p>
                                    </div>
                                </div>
                            </div>

                            <div className="activity-item">
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <span style={{ fontSize: '14px', color: 'var(--color-body)', marginRight: '12px' }}>📥</span>
                                    <div>
                                        <p style={{ fontSize: '14px', fontWeight: '500', color: 'var(--color-heading-1)', margin: '0 0 2px 0' }}>Template downloaded</p>
                                        <p style={{ fontSize: '12px', color: 'var(--color-body)', margin: 0 }}>Professional Classic • 5 minutes ago</p>
                                    </div>
                                </div>
                            </div>

                            <div className="activity-item">
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <span style={{ fontSize: '14px', color: 'var(--color-body)', marginRight: '12px' }}>📊</span>
                                    <div>
                                        <p style={{ fontSize: '14px', fontWeight: '500', color: 'var(--color-heading-1)', margin: '0 0 2px 0' }}>Resume audit completed</p>
                                        <p style={{ fontSize: '12px', color: 'var(--color-body)', margin: 0 }}>Score: 72/100 • 10 minutes ago</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
} 