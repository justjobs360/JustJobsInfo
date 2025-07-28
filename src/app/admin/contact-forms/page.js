"use client";
import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAuth } from '@/contexts/AuthContext';
import { ADMIN_PERMISSIONS } from '@/utils/userRoleService';
import '../admin.css';

export default function ContactFormsPage() {
    const { hasPermission, isSuperAdmin } = useAuth();
    const [contactForms, setContactForms] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Mock data
        setTimeout(() => {
            setContactForms([
                { 
                    id: 1, 
                    name: 'John Doe', 
                    email: 'john@example.com',
                    subject: 'Resume Review Request',
                    message: 'I would like to get my resume reviewed by your team. Can you help me?',
                    status: 'new',
                    date: '2024-01-25 14:30:00'
                },
                { 
                    id: 2, 
                    name: 'Jane Smith', 
                    email: 'jane@example.com',
                    subject: 'Career Advice Needed',
                    message: 'I am looking for career guidance and would like to schedule a consultation.',
                    status: 'read',
                    date: '2024-01-24 10:15:00'
                },
                { 
                    id: 3, 
                    name: 'Bob Johnson', 
                    email: 'bob@example.com',
                    subject: 'General Inquiry',
                    message: 'What services do you offer for job seekers?',
                    status: 'replied',
                    date: '2024-01-23 16:45:00'
                },
                { 
                    id: 4, 
                    name: 'Alice Brown', 
                    email: 'alice@example.com',
                    subject: 'Pricing Information',
                    message: 'Can you provide pricing details for your resume writing services?',
                    status: 'new',
                    date: '2024-01-25 09:20:00'
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
                    <p>Only super admins can access contact forms.</p>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="admin-dashboard">
                <div className="dashboard-header">
                    <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--color-heading-1)', margin: '0 0 8px 0' }}>Contact Forms</h1>
                    <p style={{ fontSize: '16px', color: 'var(--color-body)', margin: 0 }}>View and manage contact form submissions</p>
                </div>

                {/* Contact Forms List */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                        <div className="loading-spinner"></div>
                        <p style={{ marginTop: '16px' }}>Loading contact forms...</p>
                    </div>
                ) : (
                    <div className="activity-card">
                        <div style={{ padding: '24px' }}>
                            <div style={{ marginBottom: '20px' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: '500', color: 'var(--color-heading-1)', margin: '0 0 16px 0' }}>All Contact Form Submissions</h3>
                                <p style={{ fontSize: '14px', color: 'var(--color-body)', margin: 0 }}>Total submissions: {contactForms.length}</p>
                            </div>
                            
                            <div className="activity-list">
                                {contactForms.map((form) => (
                                    <div key={form.id} className="activity-item">
                                        <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                                            <span style={{ fontSize: '14px', color: 'var(--color-body)', marginRight: '12px' }}>📧</span>
                                            <div style={{ flex: 1 }}>
                                                <p style={{ fontSize: '14px', fontWeight: '500', color: 'var(--color-heading-1)', margin: '0 0 2px 0' }}>{form.subject}</p>
                                                <p style={{ fontSize: '12px', color: 'var(--color-body)', margin: '0 0 4px 0' }}>
                                                    From: {form.name} ({form.email})
                                                </p>
                                                <p style={{ fontSize: '12px', color: 'var(--color-body)', margin: '0 0 4px 0' }}>
                                                    Message: {form.message.substring(0, 80)}...
                                                </p>
                                                <p style={{ fontSize: '12px', color: 'var(--color-body)', margin: 0 }}>
                                                    Date: {form.date}
                                                </p>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <span style={{ 
                                                fontSize: '12px', 
                                                padding: '4px 8px', 
                                                borderRadius: '12px',
                                                backgroundColor: form.status === 'new' ? '#dc3545' : 
                                                               form.status === 'read' ? '#ffc107' : 'var(--color-success)',
                                                color: '#fff'
                                            }}>
                                                {form.status}
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
                                                View
                                            </button>
                                            <button
                                                style={{
                                                    padding: '4px 8px',
                                                    backgroundColor: 'var(--color-success)',
                                                    color: '#fff',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    fontSize: '12px',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                Reply
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