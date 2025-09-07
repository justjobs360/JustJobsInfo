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
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({
        title: '', company: '', location: '', type: 'Full-time',
        salary_min: '', salary_max: '', description: '', apply_link: '', featured: false, status: 'active'
    });

    useEffect(() => {
        const load = async () => {
            try {
                let headers = {};
                try {
                    const { auth } = await import('@/config/firebase');
                    const currentUser = auth.currentUser;
                    if (currentUser) {
                        const idToken = await currentUser.getIdToken(true);
                        headers = { Authorization: `Bearer ${idToken}` };
                    }
                } catch {}
                const res = await fetch('/api/admin/jobs?status=active&limit=100', { headers });
                const data = await res.json();
                if (data.success) {
                    const mapped = (data.jobs || []).map(j => ({
                        id: j.id,
                        title: j.title,
                        company: j.company,
                        location: j.location,
                        type: j.type,
                        salary: j.salary_min || j.salary_max ? `$${((j.salary_min||0)/1000).toFixed(1)}k - $${((j.salary_max||0)/1000).toFixed(1)}k` : 'N/A',
                        status: j.status,
                        featured: j.featured,
                        applications: j.applications || 0,
                        postedDate: j.posted_at ? new Date(j.posted_at).toISOString().slice(0,10) : ''
                    }));
                    setJobs(mapped);
                }
            } catch (e) {
            } finally {
                setLoading(false);
            }
        };
        load();
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

                {/* Actions */}
                <div style={{ marginBottom: '20px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
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
                    onClick={() => { setEditing(null); setForm({ title:'', company:'', location:'', type:'Full-time', salary_min:'', salary_max:'', description:'', apply_link:'', featured:false, status:'active' }); setShowForm(true); }}
                    >
                        + Add New Job
                    </button>
                    <button
                        style={{
                            padding: '12px 24px',
                            backgroundColor: '#6c757d',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '500'
                        }}
                        onClick={async ()=>{
                            try {
                                let headers = { 'Content-Type': 'application/json' };
                                try {
                                    const { auth } = await import('@/config/firebase');
                                    const currentUser = auth.currentUser;
                                    if (currentUser) {
                                        const idToken = await currentUser.getIdToken(true);
                                        headers = { ...headers, Authorization: `Bearer ${idToken}` };
                                    }
                                } catch {}
                                const res = await fetch('/api/admin/cache/clear', { method: 'POST', headers });
                                const data = await res.json();
                                if (data.success) {
                                    alert('Cache cleared successfully');
                                } else {
                                    alert('Failed to clear cache');
                                }
                            } catch (e) {
                                alert('Error clearing cache');
                            }
                        }}
                    >
                        Clear Cache
                    </button>
                </div>

                {showForm && (
                    <div className="activity-card" style={{ marginBottom: '24px' }}>
                        <div style={{ padding: '28px' }}>
                            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '16px' }}>
                                <div>
                                    <h3 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--color-heading-1)', margin: 0 }}>{editing ? 'Edit Job' : 'Create Job'}</h3>
                                    <p style={{ fontSize: '12px', color: 'var(--color-body)', margin: '6px 0 0 0' }}>Provide clear details so candidates can assess fit quickly.</p>
                                </div>
                            </div>

                            <div className="row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: 6 }}>Job Title</label>
                                    <input className="form-control" placeholder="e.g., Senior Software Engineer" value={form.title} onChange={e=>setForm({...form, title:e.target.value})} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: 6 }}>Company</label>
                                    <input className="form-control" placeholder="Company name" value={form.company} onChange={e=>setForm({...form, company:e.target.value})} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: 6 }}>Location</label>
                                    <input className="form-control" placeholder="City, Country or Remote" value={form.location} onChange={e=>setForm({...form, location:e.target.value})} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: 6 }}>Employment Type</label>
                                    <select className="form-control" value={form.type} onChange={e=>setForm({...form, type:e.target.value})}>
                                        <option>Full-time</option>
                                        <option>Part-time</option>
                                        <option>Contract</option>
                                        <option>Internship</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: 6 }}>Salary Min (USD)</label>
                                    <input className="form-control" type="number" placeholder="e.g., 70000" value={form.salary_min} onChange={e=>setForm({...form, salary_min:e.target.value})} />
                                    <small style={{ color: 'var(--color-body)', fontSize: 11 }}>Enter annual base in USD.</small>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: 6 }}>Salary Max (USD)</label>
                                    <input className="form-control" type="number" placeholder="e.g., 120000" value={form.salary_max} onChange={e=>setForm({...form, salary_max:e.target.value})} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: 6 }}>Apply Link</label>
                                    <input className="form-control" placeholder="https://..." value={form.apply_link} onChange={e=>setForm({...form, apply_link:e.target.value})} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: 6 }}>Status</label>
                                    <select className="form-control" value={form.status} onChange={e=>setForm({...form, status:e.target.value})}>
                                        <option value="active">Active</option>
                                        <option value="expired">Expired</option>
                                    </select>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 22 }}>
                                    <input id="featuredToggle" type="checkbox" className="form-check-input" checked={form.featured} onChange={e=>setForm({...form, featured:e.target.checked})} />
                                    <label htmlFor="featuredToggle" className="form-check-label" style={{ fontSize: 13, fontWeight: 600 }}>Featured (shows at top)</label>
                                </div>
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: 6 }}>Description</label>
                                    <textarea className="form-control" placeholder="Key responsibilities, requirements, benefits..." rows={6} value={form.description} onChange={e=>setForm({...form, description:e.target.value})} />
                                </div>
                            </div>

                            <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
                                <button className="rts-btn btn-primary" style={{ padding: '10px 18px', fontSize: 14 }} onClick={async ()=>{
                                    try {
                                        let headers = { 'Content-Type': 'application/json' };
                                        try {
                                            const { auth } = await import('@/config/firebase');
                                            const currentUser = auth.currentUser;
                                            if (currentUser) {
                                                const idToken = await currentUser.getIdToken(true);
                                                headers = { ...headers, Authorization: `Bearer ${idToken}` };
                                            }
                                        } catch {}
                                        if (editing) {
                                            const res = await fetch(`/api/admin/jobs/${editing}`, { method:'PUT', headers, body: JSON.stringify({ ...form, salary_min: form.salary_min?Number(form.salary_min):null, salary_max: form.salary_max?Number(form.salary_max):null }) });
                                            const data = await res.json();
                                        } else {
                                            const res = await fetch('/api/admin/jobs', { method:'POST', headers, body: JSON.stringify({ ...form, salary_min: form.salary_min?Number(form.salary_min):null, salary_max: form.salary_max?Number(form.salary_max):null }) });
                                            const data = await res.json();
                                        }
                                        // reload list
                                        const reloadHeaders = { ...headers };
                                        delete reloadHeaders['Content-Type'];
                                        const res2 = await fetch('/api/admin/jobs?status=active&limit=100', { headers: reloadHeaders });
                                        const d2 = await res2.json();
                                        if (d2.success) {
                                            const mapped = (d2.jobs || []).map(j => ({
                                                id: j.id,
                                                title: j.title,
                                                company: j.company,
                                                location: j.location,
                                                type: j.type,
                                                salary: j.salary_min || j.salary_max ? `$${((j.salary_min||0)/1000).toFixed(1)}k - $${((j.salary_max||0)/1000).toFixed(1)}k` : 'N/A',
                                                status: j.status,
                                                featured: j.featured,
                                                applications: j.applications || 0,
                                                postedDate: j.posted_at ? new Date(j.posted_at).toISOString().slice(0,10) : ''
                                            }));
                                            setJobs(mapped);
                                        }
                                        setShowForm(false);
                                        setEditing(null);
                                    } catch {}
                                }}>Save</button>
                                <button className="rts-btn btn-border" style={{ padding: '10px 18px', fontSize: 14 }} onClick={()=>{ setShowForm(false); setEditing(null); }}>Cancel</button>
                            </div>
                        </div>
                    </div>
                )}

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
                                            onClick={()=>{ setEditing(job.id); setForm({ title:job.title, company:job.company, location:job.location, type:job.type, salary_min:'', salary_max:'', description:'', apply_link:'', featured:job.featured, status:job.status }); setShowForm(true); }}
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
                                            onClick={async ()=>{
                                                try {
                                                    let headers = { 'Content-Type': 'application/json' };
                                                    try {
                                                        const { auth } = await import('@/config/firebase');
                                                        const currentUser = auth.currentUser;
                                                        if (currentUser) {
                                                            const idToken = await currentUser.getIdToken(true);
                                                            headers = { ...headers, Authorization: `Bearer ${idToken}` };
                                                        }
                                                    } catch {}
                                                    await fetch(`/api/admin/jobs/${job.id}`, { method:'PUT', headers, body: JSON.stringify({ featured: !job.featured }) });
                                                    const reloadHeaders = { ...headers };
                                                    delete reloadHeaders['Content-Type'];
                                                    const res2 = await fetch('/api/admin/jobs?status=active&limit=100', { headers: reloadHeaders });
                                                    const d2 = await res2.json();
                                                    if (d2.success) {
                                                        const mapped = (d2.jobs || []).map(j => ({
                                                            id: j.id, title: j.title, company: j.company, location: j.location, type: j.type,
                                                            salary: j.salary_min || j.salary_max ? `$${((j.salary_min||0)/1000).toFixed(1)}k - $${((j.salary_max||0)/1000).toFixed(1)}k` : 'N/A',
                                                            status: j.status, featured: j.featured, applications: j.applications || 0,
                                                            postedDate: j.posted_at ? new Date(j.posted_at).toISOString().slice(0,10) : ''
                                                        }));
                                                        setJobs(mapped);
                                                    }
                                                } catch {}
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
                                            onClick={async ()=>{
                                                try {
                                                    let headers = {};
                                                    try {
                                                        const { auth } = await import('@/config/firebase');
                                                        const currentUser = auth.currentUser;
                                                        if (currentUser) {
                                                            const idToken = await currentUser.getIdToken(true);
                                                            headers = { Authorization: `Bearer ${idToken}` };
                                                        }
                                                    } catch {}
                                                    await fetch(`/api/admin/jobs/${job.id}`, { method:'DELETE', headers });
                                                    setJobs(prev => prev.filter(j => j.id !== job.id));
                                                } catch {}
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