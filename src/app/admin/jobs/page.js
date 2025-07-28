"use client";
import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAuth } from '@/contexts/AuthContext';
import { ADMIN_PERMISSIONS } from '@/utils/userRoleService';
import '../admin.css';

export default function JobListingsPage() {
    const { hasPermission, isSuperAdmin } = useAuth();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Mock data
        setTimeout(() => {
            setJobs([
                { 
                    id: 1, 
                    title: 'Senior Software Engineer', 
                    company: 'Tech Corp',
                    location: 'New York, NY',
                    type: 'Full-time',
                    salary: '$120,000 - $150,000',
                    status: 'active',
                    featured: true,
                    applications: 45,
                    postedDate: '2024-01-20'
                },
                { 
                    id: 2, 
                    title: 'Marketing Manager', 
                    company: 'Digital Solutions',
                    location: 'Remote',
                    type: 'Full-time',
                    salary: '$80,000 - $100,000',
                    status: 'active',
                    featured: false,
                    applications: 23,
                    postedDate: '2024-01-18'
                },
                { 
                    id: 3, 
                    title: 'UX Designer', 
                    company: 'Creative Agency',
                    location: 'San Francisco, CA',
                    type: 'Contract',
                    salary: '$90,000 - $110,000',
                    status: 'expired',
                    featured: false,
                    applications: 12,
                    postedDate: '2024-01-10'
                },
                { 
                    id: 4, 
                    title: 'Data Analyst', 
                    company: 'Analytics Inc',
                    location: 'Chicago, IL',
                    type: 'Full-time',
                    salary: '$70,000 - $85,000',
                    status: 'active',
                    featured: true,
                    applications: 67,
                    postedDate: '2024-01-22'
                }
            ]);
            setLoading(false);
        }, 1000);
    }, []);

    if (!isSuperAdmin()) {
        return (
            <AdminLayout>
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <h2 style={{ color: 'var(--color-danger)' }}>Access Denied</h2>
                    <p>Only super admins can manage job listings.</p>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="admin-dashboard">
                <div className="dashboard-header">
                    <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--color-heading-1)', margin: '0 0 8px 0' }}>Job Listings Management</h1>
                    <p style={{ fontSize: '16px', color: 'var(--color-body)', margin: 0 }}>Add, edit, and manage job postings</p>
                </div>

                {/* Add New Job Button */}
                <div style={{ marginBottom: '20px' }}>
                    <button
                        style={{
                            padding: '12px 24px',
                            backgroundColor: 'var(--color-primary)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '500',
                            width: '250px'
                        }}
                    >
                        + Add New Job
                    </button>
                </div>

                {/* Jobs List */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                        <div className="loading-spinner"></div>
                        <p style={{ marginTop: '16px' }}>Loading job listings...</p>
                    </div>
                ) : (
                    <div className="activity-card">
                        <div style={{ padding: '24px' }}>
                            <div style={{ marginBottom: '20px' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: '500', color: 'var(--color-heading-1)', margin: '0 0 16px 0' }}>All Job Listings</h3>
                                <p style={{ fontSize: '14px', color: 'var(--color-body)', margin: 0 }}>Total jobs: {jobs.length}</p>
                            </div>
                            
                            <div className="activity-list">
                                {jobs.map((job) => (
                                    <div key={job.id} className="activity-item">
                                        <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                                            <span style={{ fontSize: '14px', color: 'var(--color-body)', marginRight: '12px' }}>💼</span>
                                            <div style={{ flex: 1 }}>
                                                <p style={{ fontSize: '14px', fontWeight: '500', color: 'var(--color-heading-1)', margin: '0 0 2px 0' }}>{job.title}</p>
                                                <p style={{ fontSize: '12px', color: 'var(--color-body)', margin: '0 0 4px 0' }}>
                                                    {job.company} • {job.location} • {job.type}
                                                </p>
                                                <p style={{ fontSize: '12px', color: 'var(--color-body)', margin: '0 0 4px 0' }}>
                                                    Salary: {job.salary} • Posted: {job.postedDate}
                                                </p>
                                                <p style={{ fontSize: '12px', color: 'var(--color-body)', margin: 0 }}>
                                                    Applications: {job.applications}
                                                </p>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            {job.featured && (
                                                <span style={{ 
                                                    fontSize: '10px', 
                                                    padding: '2px 6px', 
                                                    backgroundColor: '#ffc107',
                                                    borderRadius: '8px',
                                                    color: '#000'
                                                }}>
                                                    FEATURED
                                                </span>
                                            )}
                                            <span style={{ 
                                                fontSize: '12px', 
                                                padding: '4px 8px', 
                                                borderRadius: '12px',
                                                backgroundColor: job.status === 'active' ? 'var(--color-success)' : '#6c757d',
                                                color: '#fff'
                                            }}>
                                                {job.status}
                                            </span>
                                            <button
                                                style={{
                                                    padding: '4px 8px',
                                                    backgroundColor: 'var(--color-primary)',
                                                    color: '#fff',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    fontSize: '12px',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                style={{
                                                    padding: '4px 8px',
                                                    backgroundColor: job.featured ? '#6c757d' : '#ffc107',
                                                    color: '#fff',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    fontSize: '12px',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                {job.featured ? 'Unfeature' : 'Feature'}
                                            </button>
                                            <button
                                                style={{
                                                    padding: '4px 8px',
                                                    backgroundColor: '#dc3545',
                                                    color: '#fff',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    fontSize: '12px',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
} 