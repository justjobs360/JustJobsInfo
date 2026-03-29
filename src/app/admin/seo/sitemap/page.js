"use client";

import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAuth } from '@/contexts/AuthContext';
import { ADMIN_PERMISSIONS } from '@/utils/userRoleService';
import toast from 'react-hot-toast';
import '../../admin.css';

export default function AdminSitemapPage() {
  const { hasPermission, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [status, setStatus] = useState({
    cached: false,
    urlCount: 0,
    updatedAt: null,
    updatedBy: null,
  });

  const loadStatus = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const idToken = await user.getIdToken();
      const res = await fetch('/api/admin/sitemap/status', {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to load status');
      }
      setStatus({
        cached: data.cached,
        urlCount: data.urlCount ?? 0,
        updatedAt: data.updatedAt,
        updatedBy: data.updatedBy,
      });
    } catch (e) {
      console.error(e);
      toast.error(e.message || 'Failed to load sitemap status');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user && hasPermission(ADMIN_PERMISSIONS.MANAGE_SEO)) {
      loadStatus();
    }
  }, [user, hasPermission, loadStatus]);

  const handleRegenerate = async () => {
    if (!user) return;
    try {
      setRegenerating(true);
      const idToken = await user.getIdToken(true);
      const res = await fetch('/api/admin/sitemap/regenerate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Regeneration failed');
      }
      toast.success(`Sitemap updated: ${data.urlCount} URLs`);
      await loadStatus();
    } catch (e) {
      console.error(e);
      toast.error(e.message || 'Failed to regenerate sitemap');
    } finally {
      setRegenerating(false);
    }
  };

  const publicSitemapHref =
    typeof window !== 'undefined'
      ? `${window.location.origin}/sitemap.xml`
      : 'https://www.justjobs.info/sitemap.xml';

  if (!hasPermission(ADMIN_PERMISSIONS.MANAGE_SEO)) {
    return (
      <AdminLayout>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <h2 style={{ color: 'var(--color-danger)' }}>Access Denied</h2>
          <p>You don&apos;t have permission to manage the sitemap.</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-dashboard">
        <div className="dashboard-header">
          <h1
            style={{
              fontSize: '32px',
              fontWeight: 'bold',
              color: 'var(--color-heading-1)',
              margin: '0 0 8px 0',
            }}
          >
            XML Sitemap
          </h1>
          <p style={{ fontSize: '16px', color: 'var(--color-body)', margin: 0 }}>
            Generate and store the sitemap in MongoDB. <code>/sitemap.xml</code> and{' '}
            <code>/sitemap.xml/</code> both return the same XML (200 — no redirect). Submit{' '}
            <code>https://www.justjobs.info/sitemap.xml</code> in Search Console so Google does not hit a redirect.
          </p>
        </div>

        <div className="activity-card">
          <div style={{ padding: '24px' }}>
            {loading ? (
              <p>Loading status…</p>
            ) : (
              <ul style={{ marginBottom: '20px', lineHeight: 1.6 }}>
                <li>
                  <strong>Cached:</strong> {status.cached ? 'Yes' : 'No (will be created on regenerate or first visit)'}
                </li>
                <li>
                  <strong>URL count:</strong> {status.urlCount}
                </li>
                <li>
                  <strong>Last updated:</strong>{' '}
                  {status.updatedAt ? new Date(status.updatedAt).toLocaleString() : '—'}
                </li>
              </ul>
            )}

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
              <button
                type="button"
                onClick={handleRegenerate}
                disabled={regenerating || !user}
                style={{
                  padding: '12px 24px',
                  backgroundColor: regenerating ? '#ccc' : 'var(--color-success)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: regenerating ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                }}
              >
                {regenerating ? 'Generating…' : 'Generate / update sitemap'}
              </button>
              <a
                href="/sitemap.xml"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: '12px 24px',
                  backgroundColor: 'var(--color-primary)',
                  color: '#fff',
                  borderRadius: '4px',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: '500',
                }}
              >
                Open live sitemap
              </a>
              <button
                type="button"
                onClick={() => loadStatus()}
                disabled={loading}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#6c757d',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                Refresh status
              </button>
            </div>

            <p style={{ marginTop: '20px', fontSize: '14px', color: 'var(--color-body)' }}>
              After publishing or editing blog posts, click generate so new URLs are included. Deploys also refresh
              the cache via the build step when <code>MONGODB_URI</code> is set.
            </p>
            <p style={{ fontSize: '13px', color: '#666' }}>
              Suggested Search Console submission:{' '}
              <a href={publicSitemapHref}>{publicSitemapHref}</a>
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
