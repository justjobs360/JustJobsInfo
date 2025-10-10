"use client";
import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAuth } from '@/contexts/AuthContext';
import { ADMIN_PERMISSIONS } from '@/utils/userRoleService';
import '../admin.css';

export default function JobFitStatsPage() {
    const { hasPermission } = useAuth();
    const [stats, setStats] = useState({
        totalAnalyses: 0,
        thisMonthAnalyses: 0,
        thisWeekAnalyses: 0,
        todayAnalyses: 0,
        averageFitScore: 0,
        userStats: { authenticated: 0, guests: 0 },
        recentActivity: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Analysis viewer state
    const [activeTab, setActiveTab] = useState('stats');
    const [analyses, setAnalyses] = useState([]);
    const [analysisLoading, setAnalysisLoading] = useState(false);
    const [analysisError, setAnalysisError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalAnalyses, setTotalAnalyses] = useState(0);

    // Fetch real job fit statistics
    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                console.log('🔄 Fetching job fit stats...');
                
                const response = await fetch('/api/admin/job-fit-stats', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                const result = await response.json();
                console.log('📊 Stats API response:', result);

                if (!response.ok) {
                    throw new Error(result.error || `HTTP ${response.status}: Failed to fetch stats`);
                }

                if (result.success) {
                    setStats(result.data);
                    setError(null);
                } else {
                    throw new Error(result.error || 'Failed to fetch statistics');
                }
            } catch (err) {
                console.error('❌ Error fetching stats:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (hasPermission(ADMIN_PERMISSIONS.VIEW_ANALYTICS)) {
            fetchStats();
        }
    }, [hasPermission]);

    // Fetch Analyses function
    const fetchAnalyses = async (page = 1, search = '') => {
        try {
            setAnalysisLoading(true);
            console.log('🔄 Fetching Job Fit Analyses...', { page, search });
            
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '20',
                search,
                sortBy: 'createdAt',
                sortOrder: 'desc'
            });

            const response = await fetch(`/api/admin/job-fit-list?${params}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const result = await response.json();
            console.log('📋 Analyses API response:', result);

            if (!response.ok) {
                throw new Error(result.error || `HTTP ${response.status}: Failed to fetch analyses`);
            }

            if (result.success) {
                setAnalyses(result.data.analyses);
                setCurrentPage(result.data.pagination.currentPage);
                setTotalPages(result.data.pagination.totalPages);
                setTotalAnalyses(result.data.pagination.totalCount);
                setAnalysisError(null);
            } else {
                throw new Error(result.error || 'Failed to fetch analyses');
            }
        } catch (err) {
            console.error('❌ Error fetching analyses:', err);
            setAnalysisError(err.message);
        } finally {
            setAnalysisLoading(false);
        }
    };

    // Load analyses when switching to analyses tab
    useEffect(() => {
        if (activeTab === 'analyses' && hasPermission(ADMIN_PERMISSIONS.VIEW_ANALYTICS)) {
            fetchAnalyses(currentPage, searchTerm);
        }
    }, [activeTab, currentPage, hasPermission]);

    // Handle search with debouncing
    useEffect(() => {
        if (activeTab === 'analyses') {
            const timer = setTimeout(() => {
                setCurrentPage(1);
                fetchAnalyses(1, searchTerm);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [searchTerm, activeTab]);

    if (!hasPermission(ADMIN_PERMISSIONS.VIEW_ANALYTICS)) {
        return (
            <AdminLayout>
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <h2 style={{ color: 'var(--color-danger)' }}>Access Denied</h2>
                    <p>You don&apos;t have permission to view job fit stats.</p>
                </div>
            </AdminLayout>
        );
    }

    // Show loading state
    if (loading) {
        return (
            <AdminLayout>
                <div className="admin-dashboard">
                    <div className="dashboard-header">
                        <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--color-heading-1)', margin: '0 0 8px 0' }}>Job Fit Management</h1>
                        <p style={{ fontSize: '16px', color: 'var(--color-body)', margin: 0 }}>Loading statistics...</p>
                    </div>
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                        <div style={{ fontSize: '18px', color: 'var(--color-body)' }}>📊 Loading job fit statistics...</div>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    // Show error state
    if (error) {
        return (
            <AdminLayout>
                <div className="admin-dashboard">
                    <div className="dashboard-header">
                        <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--color-heading-1)', margin: '0 0 8px 0' }}>Job Fit Management</h1>
                        <p style={{ fontSize: '16px', color: 'var(--color-body)', margin: 0 }}>Error loading statistics</p>
                    </div>
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                        <div style={{ color: 'var(--color-danger)', marginBottom: '16px' }}>❌ Error loading statistics</div>
                        <div style={{ color: 'var(--color-body)', fontSize: '14px' }}>{error}</div>
                        <button 
                            onClick={() => window.location.reload()} 
                            style={{ 
                                marginTop: '16px', 
                                padding: '8px 16px', 
                                background: 'var(--color-primary)', 
                                color: 'white', 
                                border: 'none', 
                                borderRadius: '4px', 
                                cursor: 'pointer' 
                            }}
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="admin-dashboard">
                <div className="dashboard-header">
                    <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--color-heading-1)', margin: '0 0 8px 0' }}>Job Fit Management</h1>
                    <p style={{ fontSize: '16px', color: 'var(--color-body)', margin: 0 }}>Track statistics and manage job fit analyses</p>
                </div>

                {/* Tab Navigation */}
                <div className="admin-tabs">
                    <div className="tab-list-scroll" style={{ display: 'flex', gap: '8px', flexWrap: 'nowrap', overflowX: 'auto' }}>
                        <button
                            onClick={() => setActiveTab('stats')}
                            style={{
                                padding: '8px 16px',
                                border: 'none',
                                background: activeTab === 'stats' ? 'var(--color-primary)' : 'transparent',
                                color: activeTab === 'stats' ? 'white' : 'var(--color-body)',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '13px',
                                fontWeight: '500',
                                transition: 'all 0.3s ease',
                                whiteSpace: 'nowrap',
                                width: '150px'
                            }}
                        >
                            📊 Statistics
                        </button>
                        <button
                            onClick={() => setActiveTab('analyses')}
                            style={{
                                padding: '8px 16px',
                                border: 'none',
                                background: activeTab === 'analyses' ? 'var(--color-primary)' : 'transparent',
                                color: activeTab === 'analyses' ? 'white' : 'var(--color-body)',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '13px',
                                fontWeight: '500',
                                transition: 'all 0.3s ease',
                                whiteSpace: 'nowrap',
                                width: '150px'
                            }}
                        >
                            📁 Analyses ({stats.totalAnalyses})
                        </button>
                    </div>
                </div>

                {/* Statistics Tab */}
                {activeTab === 'stats' && (
                    <>
                {/* Stats Grid */}
                <div className="stats-grid">
                    <div className="stat-card" style={{ borderLeftColor: 'var(--color-primary)' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <div style={{ flexShrink: 0 }}>
                                <span style={{ fontSize: '24px' }}>📊</span>
                            </div>
                            <div style={{ marginLeft: '16px' }}>
                                <p style={{ fontSize: '14px', fontWeight: '500', color: 'var(--color-body)', margin: '0 0 4px 0' }}>Total Analyses</p>
                                        <p style={{ fontSize: '24px', fontWeight: '600', color: 'var(--color-heading-1)', margin: 0 }}>{stats.totalAnalyses.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>

                    <div className="stat-card" style={{ borderLeftColor: 'var(--color-success)' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <div style={{ flexShrink: 0 }}>
                                        <span style={{ fontSize: '24px' }}>📅</span>
                            </div>
                            <div style={{ marginLeft: '16px' }}>
                                <p style={{ fontSize: '14px', fontWeight: '500', color: 'var(--color-body)', margin: '0 0 4px 0' }}>This Month</p>
                                        <p style={{ fontSize: '24px', fontWeight: '600', color: 'var(--color-heading-1)', margin: 0 }}>{stats.thisMonthAnalyses}</p>
                            </div>
                        </div>
                    </div>

                    <div className="stat-card" style={{ borderLeftColor: '#6f42c1' }}>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <div style={{ flexShrink: 0 }}>
                                        <span style={{ fontSize: '24px' }}>📈</span>
                                    </div>
                                    <div style={{ marginLeft: '16px' }}>
                                        <p style={{ fontSize: '14px', fontWeight: '500', color: 'var(--color-body)', margin: '0 0 4px 0' }}>This Week</p>
                                        <p style={{ fontSize: '24px', fontWeight: '600', color: 'var(--color-heading-1)', margin: 0 }}>{stats.thisWeekAnalyses}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="stat-card" style={{ borderLeftColor: 'var(--color-warning)' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <div style={{ flexShrink: 0 }}>
                                <span style={{ fontSize: '24px' }}>⭐</span>
                            </div>
                            <div style={{ marginLeft: '16px' }}>
                                <p style={{ fontSize: '14px', fontWeight: '500', color: 'var(--color-body)', margin: '0 0 4px 0' }}>Average Fit Score</p>
                                <p style={{ fontSize: '24px', fontWeight: '600', color: 'var(--color-heading-1)', margin: 0 }}>{stats.averageFitScore}/100</p>
                            </div>
                        </div>
                    </div>

                            <div className="stat-card" style={{ borderLeftColor: '#17a2b8' }}>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <div style={{ flexShrink: 0 }}>
                                        <span style={{ fontSize: '24px' }}>👥</span>
                                    </div>
                                    <div style={{ marginLeft: '16px' }}>
                                        <p style={{ fontSize: '14px', fontWeight: '500', color: 'var(--color-body)', margin: '0 0 4px 0' }}>Registered Users</p>
                                        <p style={{ fontSize: '24px', fontWeight: '600', color: 'var(--color-heading-1)', margin: 0 }}>{stats.userStats.authenticated}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="stat-card" style={{ borderLeftColor: '#28a745' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <div style={{ flexShrink: 0 }}>
                                        <span style={{ fontSize: '24px' }}>🌟</span>
                            </div>
                            <div style={{ marginLeft: '16px' }}>
                                        <p style={{ fontSize: '14px', fontWeight: '500', color: 'var(--color-body)', margin: '0 0 4px 0' }}>Today</p>
                                        <p style={{ fontSize: '24px', fontWeight: '600', color: 'var(--color-heading-1)', margin: 0 }}>{stats.todayAnalyses}</p>
                            </div>
                        </div>
                    </div>
                </div>

                        {/* Recent Activity */}
                <div className="activity-card">
                    <div style={{ padding: '24px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: '500', color: 'var(--color-heading-1)', margin: '0 0 20px 0' }}>Recent Activity</h3>
                        
                        <div className="activity-list">
                                    {stats.recentActivity && stats.recentActivity.length > 0 ? (
                                        stats.recentActivity.map((activity, index) => (
                                            <div key={activity.id || index} className="activity-item">
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <span style={{ fontSize: '14px', color: 'var(--color-body)', marginRight: '12px' }}>📊</span>
                                    <div>
                                                        <p style={{ fontSize: '14px', fontWeight: '500', color: 'var(--color-heading-1)', margin: '0 0 2px 0' }}>
                                                            {activity.message}
                                                        </p>
                                                        <p style={{ fontSize: '12px', color: 'var(--color-body)', margin: 0 }}>
                                                            {activity.details} • {activity.timeAgo}
                                                        </p>
                                    </div>
                                </div>
                            </div>
                                        ))
                                    ) : (
                                        <div style={{ textAlign: 'center', padding: '20px', color: 'var(--color-body)' }}>
                                            <span style={{ fontSize: '16px' }}>📭</span>
                                            <p style={{ margin: '8px 0 0 0', fontSize: '14px' }}>No recent activity found</p>
                                        </div>
                                    )}
                                    </div>
                                </div>
                            </div>

                        {/* User Breakdown */}
                        {stats.userStats && (
                            <div className="activity-card">
                                <div style={{ padding: '24px' }}>
                                    <h3 style={{ fontSize: '18px', fontWeight: '500', color: 'var(--color-heading-1)', margin: '0 0 20px 0' }}>User Breakdown</h3>
                                    
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                                        <div style={{ padding: '16px', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #e9ecef' }}>
                                            <div style={{ fontSize: '20px', fontWeight: '600', color: 'var(--color-primary)', marginBottom: '4px' }}>
                                                {stats.userStats.authenticated}
                                            </div>
                                            <div style={{ fontSize: '14px', color: 'var(--color-body)' }}>Registered Users</div>
                                        </div>
                                        
                                        <div style={{ padding: '16px', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #e9ecef' }}>
                                            <div style={{ fontSize: '20px', fontWeight: '600', color: 'var(--color-warning)', marginBottom: '4px' }}>
                                                {stats.userStats.guests}
                                            </div>
                                            <div style={{ fontSize: '14px', color: 'var(--color-body)' }}>Guest Users</div>
                                        </div>
                                        
                                        <div style={{ padding: '16px', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #e9ecef' }}>
                                            <div style={{ fontSize: '20px', fontWeight: '600', color: 'var(--color-success)', marginBottom: '4px' }}>
                                                {((stats.userStats.authenticated / (stats.userStats.authenticated + stats.userStats.guests)) * 100 || 0).toFixed(1)}%
                                            </div>
                                            <div style={{ fontSize: '14px', color: 'var(--color-body)' }}>Registration Rate</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        )}
                    </>
                )}

                {/* Analyses Viewer Tab */}
                {activeTab === 'analyses' && (
                    <div>
                        {/* Search and Controls */}
                        <div style={{ marginBottom: '24px', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                            <div style={{ flex: '1', minWidth: '300px' }}>
                                <input
                                    type="text"
                                    placeholder="Search by job title, company, or user email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        border: '1px solid #e9ecef',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        outline: 'none',
                                        transition: 'border-color 0.3s ease'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
                                    onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
                                />
                            </div>
                            <div style={{ color: 'var(--color-body)', fontSize: '14px', whiteSpace: 'nowrap' }}>
                                {totalAnalyses} analyses total
                            </div>
                        </div>

                        {/* Analysis List Content */}
                        {analysisLoading ? (
                            <div style={{ textAlign: 'center', padding: '40px' }}>
                                <div style={{ fontSize: '18px', color: 'var(--color-body)' }}>📋 Loading analyses...</div>
                            </div>
                        ) : analysisError ? (
                            <div style={{ textAlign: 'center', padding: '40px' }}>
                                <div style={{ color: 'var(--color-danger)', marginBottom: '16px' }}>❌ Error loading analyses</div>
                                <div style={{ color: 'var(--color-body)', fontSize: '14px', marginBottom: '16px' }}>{analysisError}</div>
                                <button 
                                    onClick={() => fetchAnalyses(currentPage, searchTerm)} 
                                    style={{ 
                                        padding: '8px 16px', 
                                        background: 'var(--color-primary)', 
                                        color: 'white', 
                                        border: 'none', 
                                        borderRadius: '4px', 
                                        cursor: 'pointer' 
                                    }}
                                >
                                    Retry
                                </button>
                            </div>
                        ) : analyses.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px' }}>
                                <span style={{ fontSize: '48px' }}>📭</span>
                                <h3 style={{ color: 'var(--color-heading-1)', margin: '16px 0 8px 0' }}>No Analyses Found</h3>
                                <p style={{ color: 'var(--color-body)', margin: 0 }}>
                                    {searchTerm ? 'Try adjusting your search criteria' : 'No job fit analyses have been performed yet'}
                                </p>
                            </div>
                        ) : (
                            <>
                                {/* Analysis Table */}
                                <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #e9ecef', overflow: 'hidden' }}>
                                    <div className="table-responsive">
                                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                            <thead style={{ background: '#f8f9fa' }}>
                                                <tr>
                                                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', fontSize: '14px', color: 'var(--color-heading-1)', borderBottom: '1px solid #e9ecef' }}>
                                                        Job Details
                                                    </th>
                                                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', fontSize: '14px', color: 'var(--color-heading-1)', borderBottom: '1px solid #e9ecef' }}>
                                                        User
                                                    </th>
                                                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', fontSize: '14px', color: 'var(--color-heading-1)', borderBottom: '1px solid #e9ecef' }}>
                                                        Fit Score
                                                    </th>
                                                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', fontSize: '14px', color: 'var(--color-heading-1)', borderBottom: '1px solid #e9ecef' }}>
                                                        Resume
                                                    </th>
                                                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', fontSize: '14px', color: 'var(--color-heading-1)', borderBottom: '1px solid #e9ecef' }}>
                                                        Created
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {analyses.map((analysis, index) => (
                                                    <tr key={analysis.id} style={{ borderBottom: index < analyses.length - 1 ? '1px solid #f8f9fa' : 'none' }}>
                                                        <td style={{ padding: '16px', verticalAlign: 'top' }}>
                                                            <div>
                                                                <div style={{ fontWeight: '500', color: 'var(--color-heading-1)', marginBottom: '4px', fontSize: '14px' }}>
                                                                    {analysis.jobTitle || 'Untitled Position'}
                                                                </div>
                                                                <div style={{ fontSize: '12px', color: 'var(--color-body)', marginBottom: '2px' }}>
                                                                    {analysis.companyName || 'Company not specified'}
                                                                </div>
                                                                {analysis.industrySector && (
                                                                    <div style={{ fontSize: '12px', color: 'var(--color-body)' }}>
                                                                        Industry: {analysis.industrySector}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td style={{ padding: '16px', verticalAlign: 'top' }}>
                                                            <div>
                                                                <div style={{ fontWeight: '500', color: 'var(--color-heading-1)', fontSize: '14px', marginBottom: '2px' }}>
                                                                    {analysis.userType}
                                                                </div>
                                                                <div style={{ fontSize: '12px', color: 'var(--color-body)' }}>
                                                                    {analysis.userEmail}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td style={{ padding: '16px', verticalAlign: 'top' }}>
                                                            <div style={{ 
                                                                display: 'inline-block',
                                                                padding: '4px 8px',
                                                                borderRadius: '12px',
                                                                fontSize: '12px',
                                                                fontWeight: '600',
                                                                background: analysis.fitScore >= 80 ? '#d4edda' : analysis.fitScore >= 60 ? '#fff3cd' : '#f8d7da',
                                                                color: analysis.fitScore >= 80 ? '#155724' : analysis.fitScore >= 60 ? '#856404' : '#721c24'
                                                            }}>
                                                                {analysis.fitScore}/100
                                                            </div>
                                                            <div style={{ fontSize: '11px', color: 'var(--color-body)', marginTop: '4px' }}>
                                                                {analysis.fitLevel}
                                                            </div>
                                                        </td>
                                                        <td style={{ padding: '16px', verticalAlign: 'top' }}>
                                                            <div>
                                                                <div style={{ fontSize: '12px', color: 'var(--color-body)', marginBottom: '4px' }}>
                                                                    {analysis.resumeFileName || 'N/A'}
                                                                </div>
                                                                <div style={{ fontSize: '11px', color: 'var(--color-body)', marginBottom: '6px' }}>
                                                                    {analysis.resumeFileSize ? `${(analysis.resumeFileSize / 1024).toFixed(1)} KB` : ''}
                                                                </div>
                                                                <a
                                                                    href={`/api/admin/job-fit-resume/${analysis.id}`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    style={{
                                                                        fontSize: '12px',
                                                                        color: 'var(--color-primary)',
                                                                        textDecoration: 'none',
                                                                        display: 'inline-flex',
                                                                        alignItems: 'center',
                                                                        gap: '4px',
                                                                        padding: '4px 8px',
                                                                        borderRadius: '4px',
                                                                        border: '1px solid var(--color-primary)',
                                                                        transition: 'all 0.3s ease'
                                                                    }}
                                                                    onMouseOver={(e) => {
                                                                        e.target.style.background = 'var(--color-primary)';
                                                                        e.target.style.color = 'white';
                                                                    }}
                                                                    onMouseOut={(e) => {
                                                                        e.target.style.background = 'transparent';
                                                                        e.target.style.color = 'var(--color-primary)';
                                                                    }}
                                                                >
                                                                    📥 Download
                                                                </a>
                                                            </div>
                                                        </td>
                                                        <td style={{ padding: '16px', verticalAlign: 'top' }}>
                                                            <div style={{ fontSize: '12px', color: 'var(--color-body)' }}>
                                                                {analysis.timeAgo}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                    </div>
                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                            disabled={currentPage === 1}
                                            style={{
                                                padding: '8px 12px',
                                                background: currentPage === 1 ? '#f8f9fa' : 'var(--color-primary)',
                                                color: currentPage === 1 ? 'var(--color-body)' : 'white',
                                                border: '1px solid #e9ecef',
                                                borderRadius: '4px',
                                                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                                                fontSize: '12px'
                                            }}
                                        >
                                            ← Previous
                                        </button>
                                        
                                        <span style={{ fontSize: '14px', color: 'var(--color-body)', margin: '0 16px' }}>
                                            Page {currentPage} of {totalPages}
                                        </span>
                                        
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                            disabled={currentPage === totalPages}
                                            style={{
                                                padding: '8px 12px',
                                                background: currentPage === totalPages ? '#f8f9fa' : 'var(--color-primary)',
                                                color: currentPage === totalPages ? 'var(--color-body)' : 'white',
                                                border: '1px solid #e9ecef',
                                                borderRadius: '4px',
                                                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                                                fontSize: '12px'
                                            }}
                                        >
                                            Next →
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}

