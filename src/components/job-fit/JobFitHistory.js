"use client";
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function JobFitHistory({ embedded = false }) {
    const { user } = useAuth();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        if (user) {
            fetchHistory();
        }
    }, [user]);

    const fetchHistory = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch('/api/user/job-fit-history', {
                headers: {
                    'x-user-id': user.uid,
                    'x-user-email': user.email
                }
            });

            const data = await response.json();

            if (data.success) {
                setHistory(data.data);
            } else {
                setError(data.error || 'Failed to load history');
            }
        } catch (err) {
            console.error('Error fetching history:', err);
            setError('Failed to load history');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadReport = async (analysisId, jobTitle) => {
        try {
            const response = await fetch(`/api/user/job-fit-report/${analysisId}`, {
                headers: {
                    'x-user-id': user.uid,
                    'x-user-email': user.email
                }
            });

            if (!response.ok) {
                throw new Error('Failed to download report');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `JobFit_${jobTitle.replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().split('T')[0]}.docx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err) {
            console.error('Error downloading report:', err);
            alert('Failed to download report. Please try again.');
        }
    };

    const getScoreColor = (score) => {
        if (score >= 80) return '#28a745';
        if (score >= 60) return '#ffc107';
        if (score >= 40) return '#fd7e14';
        return '#dc3545';
    };

    // Pagination
    const totalPages = Math.ceil(history.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedHistory = history.slice(startIndex, startIndex + itemsPerPage);

    if (!user) {
        return (
            <div style={{ 
                textAlign: 'center', 
                padding: embedded ? '40px 20px' : '60px 20px',
                background: '#f8f9fa',
                borderRadius: '8px',
                margin: embedded ? '0' : '40px 0'
            }}>
                <span style={{ fontSize: '48px' }}>🔒</span>
                <h3 style={{ color: 'var(--color-heading-1)', margin: '16px 0 8px 0' }}>Login Required</h3>
                <p style={{ color: 'var(--color-body)', margin: '0 0 20px 0' }}>
                    Please log in to view your job fit analysis history.
                </p>
                <a 
                    href="/login" 
                    style={{
                        display: 'inline-block',
                        padding: '10px 24px',
                        background: 'var(--color-primary)',
                        color: 'white',
                        borderRadius: '6px',
                        textDecoration: 'none',
                        fontWeight: '500'
                    }}
                >
                    Log In
                </a>
            </div>
        );
    }

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '40px' }}>
                <div style={{ 
                    display: 'inline-block',
                    width: '40px',
                    height: '40px',
                    border: '4px solid #f3f3f3',
                    borderTop: '4px solid var(--color-primary)',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                }}></div>
                <p style={{ marginTop: '16px', color: 'var(--color-body)' }}>Loading your history...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ 
                textAlign: 'center', 
                padding: '40px',
                background: '#fff3cd',
                borderRadius: '8px',
                border: '1px solid #ffc107'
            }}>
                <span style={{ fontSize: '48px' }}>⚠️</span>
                <h3 style={{ color: 'var(--color-heading-1)', margin: '16px 0 8px 0' }}>Error</h3>
                <p style={{ color: 'var(--color-body)', margin: '0 0 20px 0' }}>{error}</p>
                <button
                    onClick={fetchHistory}
                    style={{
                        padding: '8px 20px',
                        background: 'var(--color-primary)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer'
                    }}
                >
                    Try Again
                </button>
            </div>
        );
    }

    if (history.length === 0) {
        return (
            <div style={{ 
                textAlign: 'center', 
                padding: embedded ? '40px 20px' : '60px 20px',
                background: '#f8f9fa',
                borderRadius: '8px',
                margin: embedded ? '0' : '40px 0'
            }}>
                <span style={{ fontSize: '48px' }}>📊</span>
                <h3 style={{ color: 'var(--color-heading-1)', margin: '16px 0 8px 0' }}>No Analysis History</h3>
                <p style={{ color: 'var(--color-body)', margin: 0 }}>
                    You haven't performed any job fit analyses yet. Try analyzing a job description above to get started!
                </p>
            </div>
        );
    }

    return (
        <div className="job-fit-history-section" style={{ marginTop: embedded ? '0' : '40px' }}>
            {!embedded && (
                <div style={{ marginBottom: '30px' }}>
                    <h2 style={{ fontSize: '28px', fontWeight: '600', color: 'var(--color-heading-1)', marginBottom: '8px' }}>
                        Your Analysis History
                    </h2>
                    <p style={{ color: 'var(--color-body)', margin: 0 }}>
                        View and download your previous job fit analysis reports
                    </p>
                </div>
            )}

            {/* Desktop Table View */}
            <div className="history-table-desktop" style={{ display: 'block' }}>
                <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #e9ecef', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: '#f8f9fa' }}>
                            <tr>
                                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', fontSize: '14px', color: 'var(--color-heading-1)', borderBottom: '1px solid #e9ecef' }}>
                                    Job Details
                                </th>
                                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', fontSize: '14px', color: 'var(--color-heading-1)', borderBottom: '1px solid #e9ecef' }}>
                                    Fit Score
                                </th>
                                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', fontSize: '14px', color: 'var(--color-heading-1)', borderBottom: '1px solid #e9ecef' }}>
                                    Date
                                </th>
                                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', fontSize: '14px', color: 'var(--color-heading-1)', borderBottom: '1px solid #e9ecef' }}>
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedHistory.map((item, index) => (
                                <tr key={item.id} style={{ borderBottom: index < paginatedHistory.length - 1 ? '1px solid #f8f9fa' : 'none' }}>
                                    <td style={{ padding: '16px', verticalAlign: 'top' }}>
                                        <div>
                                            <div style={{ fontWeight: '500', color: 'var(--color-heading-1)', marginBottom: '4px', fontSize: '14px' }}>
                                                {item.jobTitle}
                                            </div>
                                            <div style={{ fontSize: '12px', color: 'var(--color-body)', marginBottom: '2px' }}>
                                                {item.companyName}
                                            </div>
                                            {item.industrySector && (
                                                <div style={{ fontSize: '12px', color: 'var(--color-body)' }}>
                                                    {item.industrySector}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px', verticalAlign: 'top' }}>
                                        <div style={{ 
                                            display: 'inline-block',
                                            padding: '6px 12px',
                                            borderRadius: '20px',
                                            fontSize: '14px',
                                            fontWeight: '600',
                                            background: item.fitScore >= 80 ? '#d4edda' : item.fitScore >= 60 ? '#fff3cd' : '#f8d7da',
                                            color: getScoreColor(item.fitScore)
                                        }}>
                                            {item.fitScore}/100
                                        </div>
                                        <div style={{ fontSize: '11px', color: 'var(--color-body)', marginTop: '4px' }}>
                                            {item.fitLevel}
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px', verticalAlign: 'top' }}>
                                        <div style={{ fontSize: '13px', color: 'var(--color-body)' }}>
                                            {new Date(item.createdAt).toLocaleDateString()}
                                        </div>
                                        <div style={{ fontSize: '11px', color: 'var(--color-body)', marginTop: '2px' }}>
                                            {item.timeAgo}
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px', verticalAlign: 'top' }}>
                                        <button
                                            onClick={() => handleDownloadReport(item.id, item.jobTitle)}
                                            style={{
                                                padding: '6px 12px',
                                                background: 'var(--color-primary)',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                fontSize: '12px',
                                                fontWeight: '500',
                                                transition: 'all 0.3s ease'
                                            }}
                                            onMouseOver={(e) => e.target.style.background = '#0056b3'}
                                            onMouseOut={(e) => e.target.style.background = 'var(--color-primary)'}
                                        >
                                            📥 Download Report
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
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        style={{
                            padding: '8px 16px',
                            border: '1px solid #e9ecef',
                            background: currentPage === 1 ? '#f8f9fa' : 'white',
                            color: currentPage === 1 ? '#999' : 'var(--color-heading-1)',
                            borderRadius: '6px',
                            cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                        }}
                    >
                        Previous
                    </button>
                    <span style={{ color: 'var(--color-body)', fontSize: '14px' }}>
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        style={{
                            padding: '8px 16px',
                            border: '1px solid #e9ecef',
                            background: currentPage === totalPages ? '#f8f9fa' : 'white',
                            color: currentPage === totalPages ? '#999' : 'var(--color-heading-1)',
                            borderRadius: '6px',
                            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                        }}
                    >
                        Next
                    </button>
                </div>
            )}

            <style jsx>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                @media (max-width: 768px) {
                    .history-table-desktop table {
                        font-size: 12px;
                    }
                    .history-table-desktop th,
                    .history-table-desktop td {
                        padding: 12px 8px !important;
                    }
                }
            `}</style>
        </div>
    );
}

