"use client";
import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAuth } from '@/contexts/AuthContext';
import { ADMIN_PERMISSIONS } from '@/utils/userRoleService';
import '../../admin.css';

export default function ResumeStatsPage() {
    const { hasPermission } = useAuth();
    const [stats, setStats] = useState({
        totalAudits: 0,
        thisMonthAudits: 0,
        thisWeekAudits: 0,
        todayAudits: 0,
        averageScore: 0,
        userStats: { authenticated: 0, guests: 0 },
        recentActivity: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // CV viewer state
    const [activeTab, setActiveTab] = useState('stats');
    const [cvs, setCvs] = useState([]);
    const [cvLoading, setCvLoading] = useState(false);
    const [cvError, setCvError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalCvs, setTotalCvs] = useState(0);

    // Fetch real audit statistics
    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                console.log('🔄 Fetching resume audit stats...');
                
                const response = await fetch('/api/admin/resume-audit-stats', {
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

    // Fetch CVs function
    const fetchCvs = async (page = 1, search = '') => {
        try {
            setCvLoading(true);
            console.log('🔄 Fetching CVs...', { page, search });
            
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '20',
                search,
                sortBy: 'createdAt',
                sortOrder: 'desc'
            });

            const response = await fetch(`/api/admin/cv-list?${params}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const result = await response.json();
            console.log('📋 CVs API response:', result);

            if (!response.ok) {
                throw new Error(result.error || `HTTP ${response.status}: Failed to fetch CVs`);
            }

            if (result.success) {
                setCvs(result.data.cvs);
                setCurrentPage(result.data.pagination.currentPage);
                setTotalPages(result.data.pagination.totalPages);
                setTotalCvs(result.data.pagination.totalCount);
                setCvError(null);
            } else {
                throw new Error(result.error || 'Failed to fetch CVs');
            }
        } catch (err) {
            console.error('❌ Error fetching CVs:', err);
            setCvError(err.message);
        } finally {
            setCvLoading(false);
        }
    };

    // Load CVs when switching to CVs tab
    useEffect(() => {
        if (activeTab === 'cvs' && hasPermission(ADMIN_PERMISSIONS.VIEW_ANALYTICS)) {
            fetchCvs(currentPage, searchTerm);
        }
    }, [activeTab, currentPage, hasPermission]);

    // Handle search with debouncing
    useEffect(() => {
        if (activeTab === 'cvs') {
            const timer = setTimeout(() => {
                setCurrentPage(1);
                fetchCvs(1, searchTerm);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [searchTerm, activeTab]);

    // Handle CV download
    const handleDownloadCv = async (cvId, fileName) => {
        try {
            console.log('📥 Downloading CV:', cvId, fileName);
            
            const response = await fetch(`/api/admin/cv-download/${cvId}`, {
                method: 'GET',
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to download CV');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            
            console.log('✅ CV downloaded successfully');
        } catch (err) {
            console.error('❌ Error downloading CV:', err);
            alert(`Failed to download CV: ${err.message}`);
        }
    };

    if (!hasPermission(ADMIN_PERMISSIONS.VIEW_ANALYTICS)) {
        return (
            <AdminLayout>
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <h2 style={{ color: 'var(--color-danger)' }}>Access Denied</h2>
                    <p>You don&apos;t have permission to view resume audit stats.</p>
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
                        <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--color-heading-1)', margin: '0 0 8px 0' }}>Resume Audit Management</h1>
                        <p style={{ fontSize: '16px', color: 'var(--color-body)', margin: 0 }}>Loading statistics...</p>
                    </div>
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                        <div style={{ fontSize: '18px', color: 'var(--color-body)' }}>📊 Loading audit statistics...</div>
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
                        <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--color-heading-1)', margin: '0 0 8px 0' }}>Resume Audit Management</h1>
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
                    <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--color-heading-1)', margin: '0 0 8px 0' }}>Resume Audit Management</h1>
                    <p style={{ fontSize: '16px', color: 'var(--color-body)', margin: 0 }}>Track statistics and manage uploaded CVs</p>
                </div>

                {/* Tab Navigation */}
                <div style={{ marginBottom: '24px', borderBottom: '1px solid #e9ecef' }}>
                    <div style={{ display: 'flex', gap: '0' }}>
                        <button
                            onClick={() => setActiveTab('stats')}
                            style={{
                                padding: '12px 24px',
                                border: 'none',
                                background: activeTab === 'stats' ? 'var(--color-primary)' : 'transparent',
                                color: activeTab === 'stats' ? 'white' : 'var(--color-body)',
                                borderRadius: '8px 8px 0 0',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '500',
                                borderBottom: activeTab === 'stats' ? '2px solid var(--color-primary)' : '2px solid transparent',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            📊 Statistics
                        </button>
                        <button
                            onClick={() => setActiveTab('cvs')}
                            style={{
                                padding: '12px 24px',
                                border: 'none',
                                background: activeTab === 'cvs' ? 'var(--color-primary)' : 'transparent',
                                color: activeTab === 'cvs' ? 'white' : 'var(--color-body)',
                                borderRadius: '8px 8px 0 0',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '500',
                                borderBottom: activeTab === 'cvs' ? '2px solid var(--color-primary)' : '2px solid transparent',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            📁 Uploaded CVs ({stats.totalAudits})
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
                                <p style={{ fontSize: '14px', fontWeight: '500', color: 'var(--color-body)', margin: '0 0 4px 0' }}>Total Audits</p>
                                        <p style={{ fontSize: '24px', fontWeight: '600', color: 'var(--color-heading-1)', margin: 0 }}>{stats.totalAudits.toLocaleString()}</p>
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
                                        <p style={{ fontSize: '24px', fontWeight: '600', color: 'var(--color-heading-1)', margin: 0 }}>{stats.thisMonthAudits}</p>
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
                                        <p style={{ fontSize: '24px', fontWeight: '600', color: 'var(--color-heading-1)', margin: 0 }}>{stats.thisWeekAudits}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="stat-card" style={{ borderLeftColor: 'var(--color-warning)' }}>
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
                                        <p style={{ fontSize: '24px', fontWeight: '600', color: 'var(--color-heading-1)', margin: 0 }}>{stats.todayAudits}</p>
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

                {/* CV Viewer Tab */}
                {activeTab === 'cvs' && (
                    <div>
                        {/* Search and Controls */}
                        <div style={{ marginBottom: '24px', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                            <div style={{ flex: '1', minWidth: '300px' }}>
                                <input
                                    type="text"
                                    placeholder="Search by filename, user email, or user ID..."
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
                                {totalCvs} CVs total
                            </div>
                        </div>

                        {/* CV List Content */}
                        {cvLoading ? (
                            <div style={{ textAlign: 'center', padding: '40px' }}>
                                <div style={{ fontSize: '18px', color: 'var(--color-body)' }}>📋 Loading CVs...</div>
                            </div>
                        ) : cvError ? (
                            <div style={{ textAlign: 'center', padding: '40px' }}>
                                <div style={{ color: 'var(--color-danger)', marginBottom: '16px' }}>❌ Error loading CVs</div>
                                <div style={{ color: 'var(--color-body)', fontSize: '14px', marginBottom: '16px' }}>{cvError}</div>
                                <button 
                                    onClick={() => fetchCvs(currentPage, searchTerm)} 
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
                        ) : cvs.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px' }}>
                                <span style={{ fontSize: '48px' }}>📭</span>
                                <h3 style={{ color: 'var(--color-heading-1)', margin: '16px 0 8px 0' }}>No CVs Found</h3>
                                <p style={{ color: 'var(--color-body)', margin: 0 }}>
                                    {searchTerm ? 'Try adjusting your search criteria' : 'No CVs have been uploaded yet'}
                                </p>
                            </div>
                        ) : (
                            <>
                                {/* CV Table */}
                                <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #e9ecef', overflow: 'hidden' }}>
                                    <div style={{ overflowX: 'auto' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                            <thead style={{ background: '#f8f9fa' }}>
                                                <tr>
                                                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', fontSize: '14px', color: 'var(--color-heading-1)', borderBottom: '1px solid #e9ecef' }}>
                                                        File Details
                                                    </th>
                                                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', fontSize: '14px', color: 'var(--color-heading-1)', borderBottom: '1px solid #e9ecef' }}>
                                                        User
                                                    </th>
                                                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', fontSize: '14px', color: 'var(--color-heading-1)', borderBottom: '1px solid #e9ecef' }}>
                                                        Score
                                                    </th>
                                                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', fontSize: '14px', color: 'var(--color-heading-1)', borderBottom: '1px solid #e9ecef' }}>
                                                        Uploaded
                                                    </th>
                                                    <th style={{ padding: '16px', textAlign: 'center', fontWeight: '600', fontSize: '14px', color: 'var(--color-heading-1)', borderBottom: '1px solid #e9ecef' }}>
                                                        Actions
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {cvs.map((cv, index) => (
                                                    <tr key={cv.id} style={{ borderBottom: index < cvs.length - 1 ? '1px solid #f8f9fa' : 'none' }}>
                                                        <td style={{ padding: '16px', verticalAlign: 'top' }}>
                                                            <div>
                                                                <div style={{ fontWeight: '500', color: 'var(--color-heading-1)', marginBottom: '4px', fontSize: '14px' }}>
                                                                    {cv.fileName}
                                                                </div>
                                                                <div style={{ fontSize: '12px', color: 'var(--color-body)', marginBottom: '2px' }}>
                                                                    {cv.fileSizeFormatted} • {cv.fileType}
                                                                </div>
                                                                <div style={{ fontSize: '12px', color: 'var(--color-body)' }}>
                                                                    {cv.extractedTextLength} characters extracted
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td style={{ padding: '16px', verticalAlign: 'top' }}>
                                                            <div>
                                                                <div style={{ fontWeight: '500', color: 'var(--color-heading-1)', fontSize: '14px', marginBottom: '2px' }}>
                                                                    {cv.userType}
                                                                </div>
                                                                <div style={{ fontSize: '12px', color: 'var(--color-body)' }}>
                                                                    {cv.userEmail}
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
                                                                background: cv.score >= 80 ? '#d4edda' : cv.score >= 60 ? '#fff3cd' : '#f8d7da',
                                                                color: cv.score >= 80 ? '#155724' : cv.score >= 60 ? '#856404' : '#721c24'
                                                            }}>
                                                                {cv.score}/100
                                                            </div>
                                                        </td>
                                                        <td style={{ padding: '16px', verticalAlign: 'top' }}>
                                                            <div style={{ fontSize: '12px', color: 'var(--color-body)' }}>
                                                                {cv.timeAgo}
                                                            </div>
                                                        </td>
                                                        <td style={{ padding: '16px', textAlign: 'center', verticalAlign: 'top' }}>
                                                            <button
                                                                onClick={() => handleDownloadCv(cv.id, cv.fileName)}
                                                                style={{
                                                                    padding: '6px 12px',
                                                                    background: 'var(--color-primary)',
                                                                    color: 'white',
                                                                    border: 'none',
                                                                    borderRadius: '4px',
                                                                    cursor: 'pointer',
                                                                    fontSize: '12px',
                                                                    fontWeight: '500',
                                                                    transition: 'background-color 0.3s ease'
                                                                }}
                                                                onMouseEnter={(e) => e.target.style.background = '#1a4ba1'}
                                                                onMouseLeave={(e) => e.target.style.background = 'var(--color-primary)'}
                                                            >
                                                                📥 Download
                                                            </button>
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
