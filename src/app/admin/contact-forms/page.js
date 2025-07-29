"use client";
import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAuth } from '@/contexts/AuthContext';
import '../admin.css';

export default function ContactFormsPage() {
    const { isSuperAdmin } = useAuth();
    const [contactForms, setContactForms] = useState([]);
    const [filteredForms, setFilteredForms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [selectedForm, setSelectedForm] = useState(null);
    const [showModal, setShowModal] = useState(false);


    useEffect(() => {
        async function fetchForms() {
            setLoading(true);
            try {
                const res = await fetch('/api/contact-forms');
                const data = await res.json();
                if (data.success) {
                    setContactForms(data.data);
                    setFilteredForms(data.data);
                } else {
                    setContactForms([]);
                    setFilteredForms([]);
                }
            } catch (err) {
                setContactForms([]);
                setFilteredForms([]);
            } finally {
                setLoading(false);
            }
        }
        fetchForms();
    }, []);

    // Filter and search forms
    useEffect(() => {
        let filtered = contactForms;
        
        // Filter by type
        if (filterType !== 'all') {
            filtered = filtered.filter(form => form.formType === filterType);
        }
        
        // Search
        if (searchTerm) {
            filtered = filtered.filter(form => 
                form.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                form.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                form.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                form.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                form.help?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        setFilteredForms(filtered);
    }, [contactForms, searchTerm, filterType]);

    const handleViewForm = (form) => {
        setSelectedForm(form);
        setShowModal(true);
    };



    const handleDelete = async (formId) => {
        if (!confirm('Are you sure you want to delete this form submission?')) {
            return;
        }
        
        try {
            const response = await fetch(`/api/contact-forms/${formId}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                setContactForms(prev => prev.filter(form => form._id !== formId));
                alert('Form submission deleted successfully');
            } else {
                alert('Failed to delete form submission');
            }
        } catch (error) {
            alert('Error deleting form submission');
        }
    };

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

                {/* Filters and Search */}
                <div style={{ marginBottom: '20px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <label style={{ fontSize: '14px', fontWeight: '500' }}>Filter by:</label>
                        <select 
                            value={filterType} 
                            onChange={(e) => setFilterType(e.target.value)}
                            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                        >
                            <option value="all">All Forms</option>
                            <option value="contact">Contact Us</option>
                            <option value="consultation">Free Consultation</option>
                        </select>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <label style={{ fontSize: '14px', fontWeight: '500' }}>Search:</label>
                        <input
                            type="text"
                            placeholder="Search by name, email, or message..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd', minWidth: '250px' }}
                        />
                    </div>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                        <div className="loading-spinner"></div>
                        <p style={{ marginTop: '16px' }}>Loading contact forms...</p>
                    </div>
                ) : (
                    <div className="activity-card">
                        <div style={{ padding: '24px' }}>
                            <div style={{ marginBottom: '20px' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: '500', color: 'var(--color-heading-1)', margin: '0 0 16px 0' }}>
                                    Contact Form Submissions ({filteredForms.length} of {contactForms.length})
                                </h3>
                            </div>
                            
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ background: '#f5f5f5' }}>
                                            <th style={{ padding: '8px', border: '1px solid #eee' }}>Type</th>
                                            <th style={{ padding: '8px', border: '1px solid #eee' }}>Name</th>
                                            <th style={{ padding: '8px', border: '1px solid #eee' }}>Email</th>
                                            <th style={{ padding: '8px', border: '1px solid #eee' }}>Phone</th>
                                            <th style={{ padding: '8px', border: '1px solid #eee' }}>Message</th>
                                            <th style={{ padding: '8px', border: '1px solid #eee' }}>Date</th>
                                            <th style={{ padding: '8px', border: '1px solid #eee' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredForms.map((form) => (
                                            <tr key={form._id}>
                                                <td style={{ padding: '8px', border: '1px solid #eee' }}>
                                                    <span style={{ 
                                                        padding: '4px 8px', 
                                                        borderRadius: '12px', 
                                                        fontSize: '12px',
                                                        backgroundColor: form.formType === 'contact' ? '#007bff' : '#28a745',
                                                        color: 'white'
                                                    }}>
                                                        {form.formType || '-'}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '8px', border: '1px solid #eee' }}>{form.first_name} {form.last_name}</td>
                                                <td style={{ padding: '8px', border: '1px solid #eee' }}>{form.email}</td>
                                                <td style={{ padding: '8px', border: '1px solid #eee' }}>{form.phone || '-'}</td>
                                                <td style={{ padding: '8px', border: '1px solid #eee' }}>
                                                    {(form.message || form.help || '').substring(0, 50)}...
                                                </td>
                                                <td style={{ padding: '8px', border: '1px solid #eee' }}>
                                                    {form.createdAt ? new Date(form.createdAt).toLocaleString() : '-'}
                                                </td>
                                                <td style={{ padding: '8px', border: '1px solid #eee' }}>
                                                    <div style={{ display: 'flex', gap: '4px' }}>
                                                        <button
                                                            onClick={() => handleViewForm(form)}
                                                            style={{
                                                                padding: '4px 8px',
                                                                backgroundColor: '#007bff',
                                                                color: 'white',
                                                                border: 'none',
                                                                borderRadius: '4px',
                                                                fontSize: '12px',
                                                                cursor: 'pointer'
                                                            }}
                                                        >
                                                            View
                                                        </button>

                                                        <button
                                                            onClick={() => handleDelete(form._id)}
                                                            style={{
                                                                padding: '4px 8px',
                                                                backgroundColor: '#dc3545',
                                                                color: 'white',
                                                                border: 'none',
                                                                borderRadius: '4px',
                                                                fontSize: '12px',
                                                                cursor: 'pointer'
                                                            }}
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal for viewing form details */}
                {showModal && selectedForm && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000
                    }}>
                        <div style={{
                            backgroundColor: 'white',
                            padding: '24px',
                            borderRadius: '8px',
                            maxWidth: '600px',
                            width: '90%',
                            maxHeight: '80vh',
                            overflowY: 'auto'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <h3 style={{ margin: 0 }}>Form Submission Details</h3>
                                <button
                                    onClick={() => setShowModal(false)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        fontSize: '24px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    ×
                                </button>
                            </div>
                            
                            <div style={{ marginBottom: '16px' }}>
                                <strong>Form Type:</strong> {selectedForm.formType}
                            </div>
                            <div style={{ marginBottom: '16px' }}>
                                <strong>Name:</strong> {selectedForm.first_name} {selectedForm.last_name}
                            </div>
                            <div style={{ marginBottom: '16px' }}>
                                <strong>Email:</strong> {selectedForm.email}
                            </div>
                            <div style={{ marginBottom: '16px' }}>
                                <strong>Phone:</strong> {selectedForm.phone || 'Not provided'}
                            </div>
                            <div style={{ marginBottom: '16px' }}>
                                <strong>Help Topic:</strong> {selectedForm.help || 'Not provided'}
                            </div>
                            <div style={{ marginBottom: '16px' }}>
                                <strong>Message:</strong>
                                <div style={{ 
                                    marginTop: '8px', 
                                    padding: '12px', 
                                    backgroundColor: '#f8f9fa', 
                                    borderRadius: '4px',
                                    whiteSpace: 'pre-wrap'
                                }}>
                                    {selectedForm.message || selectedForm.help}
                                </div>
                            </div>
                            <div style={{ marginBottom: '16px' }}>
                                <strong>Submitted:</strong> {selectedForm.createdAt ? new Date(selectedForm.createdAt).toLocaleString() : 'Unknown'}
                            </div>
                            
                            <div style={{ marginTop: '24px', display: 'flex', gap: '8px' }}>
                                <button
                                    onClick={() => setShowModal(false)}
                                    style={{
                                        padding: '8px 16px',
                                        backgroundColor: '#6c757d',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
} 