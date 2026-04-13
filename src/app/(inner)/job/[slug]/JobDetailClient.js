"use client";

import React, { useState, useEffect, Fragment } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import BackToTop from "@/components/common/BackToTop";
import Breadcrumb from "@/components/common/Breadcrumb";
import HeaderOne from "@/components/header/HeaderOne";
import FooterOneDynamic from "@/components/footer/FooterOneDynamic";
import ShareJobModal from "@/components/modals/ShareJobModal";

function slugToTitle(slug) {
  if (!slug) return '';
  return slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function formatSalary(min, max) {
  const fmt = (v) => (Number(v) / 1000).toFixed(1);
  if (!min && !max) return "Salary not specified";
  if (min && max) return `$${fmt(min)}k - $${fmt(max)}k`;
  if (min) return `$${fmt(min)}k+`;
  return `Up to $${fmt(max)}k`;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) return "1 day ago";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
  return `${Math.ceil(diffDays / 30)} months ago`;
}

export default function JobDetailClient() {
  const { slug } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  useEffect(() => {
    if (!slug) return;

    const query = slug.replace(/-/g, ' ');

    async function fetchJob() {
      setLoading(true);
      try {
        const res = await fetch(`/api/jobs/search?query=${encodeURIComponent(query)}&page=1`);
        const result = await res.json();
        if (result.success && result.data && result.data.length > 0) {
          setJob(result.data[0]);
          document.title = `${result.data[0].job_title} at ${result.data[0].company_name} | JustJobsInfo`;
        } else {
          setNotFound(true);
        }
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }

    fetchJob();
  }, [slug]);

  return (
    <>
      <HeaderOne />
      <Breadcrumb />

      <div className="job-detail-page rts-section-gap">
        <div className="container">
          {loading && (
            <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p style={{ marginTop: '1rem', color: '#6c757d' }}>Loading job details...</p>
            </div>
          )}

          {!loading && notFound && (
            <div style={{
              textAlign: 'center',
              padding: '4rem 1rem',
              background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
              borderRadius: '12px',
              border: '1px solid #dee2e6',
              maxWidth: '700px',
              margin: '0 auto',
            }}>
              <div style={{ fontSize: '4rem', color: '#6c757d', marginBottom: '1.5rem' }}>
                <i className="fas fa-briefcase"></i>
              </div>
              <h2 style={{ color: '#495057', marginBottom: '1rem' }}>Job No Longer Available</h2>
              <p style={{ color: '#6c757d', marginBottom: '0.5rem', fontSize: '1.1rem' }}>
                The position <strong>{slugToTitle(slug)}</strong> may have been filled or the listing has expired.
              </p>
              <p style={{ color: '#6c757d', marginBottom: '2rem', fontSize: '1rem' }}>
                Listings are updated regularly — browse our current openings below.
              </p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link href="/job-listing" className="rts-btn btn-primary" style={{ textDecoration: 'none' }}>
                  <i className="fas fa-search" style={{ marginRight: '0.5rem' }}></i>
                  Browse All Jobs
                </Link>
                <Link href="/" className="rts-btn btn-border" style={{ textDecoration: 'none' }}>
                  <i className="fas fa-home" style={{ marginRight: '0.5rem' }}></i>
                  Go Home
                </Link>
              </div>
            </div>
          )}

          {!loading && job && (
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
              {/* Job Header */}
              <div style={{
                background: '#fff',
                borderRadius: '12px',
                padding: '2rem',
                border: '1px solid #e5e7eb',
                marginBottom: '1.5rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem', flexWrap: 'wrap' }}>
                  <div style={{ flex: '0 0 auto' }}>
                    {job.company_logo ? (
                      <img
                        src={job.company_logo}
                        alt={`${job.company_name} logo`}
                        style={{ width: 72, height: 72, objectFit: 'contain', borderRadius: 8, border: '1px solid #e5e7eb' }}
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <div style={{
                        width: 72, height: 72, borderRadius: 8,
                        background: '#2563eb', color: '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '2rem', fontWeight: 700,
                      }}>
                        {(job.company_name || '?').charAt(0)}
                      </div>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0 0 0.5rem', color: '#1f2937' }}>
                      {job.job_title}
                    </h1>
                    <p style={{ fontSize: '1.15rem', color: '#4b5563', margin: '0 0 0.5rem' }}>{job.company_name}</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', color: '#6b7280', fontSize: '0.95rem' }}>
                      <span><i className="fas fa-map-marker-alt" style={{ marginRight: 4 }}></i>{job.location}</span>
                      <span><i className="fas fa-briefcase" style={{ marginRight: 4 }}></i>{job.employment_type}</span>
                      <span><i className="fas fa-clock" style={{ marginRight: 4 }}></i>{formatDate(job.posted_at)}</span>
                      {job.is_remote && <span className="remote-badge" style={{ background: '#dcfce7', color: '#166534', padding: '2px 10px', borderRadius: 999, fontSize: '0.85rem', fontWeight: 500 }}>Remote</span>}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
                  <a href={job.apply_link} target="_blank" rel="noopener noreferrer" className="rts-btn btn-primary" style={{ textDecoration: 'none' }}>
                    <i className="fas fa-external-link-alt" style={{ marginRight: '0.5rem' }}></i>
                    Apply Now
                  </a>
                  <button className="rts-btn btn-border" onClick={() => setShareModalOpen(true)}>
                    <i className="fas fa-share-alt" style={{ marginRight: '0.5rem' }}></i>
                    Share
                  </button>
                </div>
              </div>

              {/* Salary */}
              <div style={{
                background: '#fff', borderRadius: '12px', padding: '1.5rem',
                border: '1px solid #e5e7eb', marginBottom: '1.5rem',
              }}>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 600, margin: '0 0 0.75rem', color: '#1f2937' }}>Compensation</h2>
                <p style={{ fontSize: '1.25rem', fontWeight: 600, color: '#2563eb', margin: 0 }}>{formatSalary(job.salary_min, job.salary_max)}</p>
              </div>

              {/* Description */}
              <div style={{
                background: '#fff', borderRadius: '12px', padding: '1.5rem',
                border: '1px solid #e5e7eb', marginBottom: '1.5rem',
              }}>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 600, margin: '0 0 0.75rem', color: '#1f2937' }}>Job Description</h2>
                <div style={{ color: '#374151', lineHeight: 1.7 }}>
                  {(() => {
                    const desc = job.job_description || '';
                    const parts = desc.split(/(?=•)/g);
                    return parts.map((part, idx) => {
                      if (part.startsWith('•')) {
                        return <li key={idx} style={{ marginBottom: '0.35rem' }}>{part.slice(1).trim()}</li>;
                      }
                      const sentences = part.split(/;/).map(s => s.trim()).filter(Boolean);
                      return sentences.map((s, si) => <p key={`${idx}-${si}`} style={{ marginBottom: '0.75rem' }}>{s}</p>);
                    });
                  })()}
                </div>
              </div>

              {/* Details Grid */}
              <div style={{
                background: '#fff', borderRadius: '12px', padding: '1.5rem',
                border: '1px solid #e5e7eb', marginBottom: '1.5rem',
              }}>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 600, margin: '0 0 0.75rem', color: '#1f2937' }}>Job Details</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  {[
                    ['Employment Type', job.employment_type],
                    ['Location', job.location],
                    ['Remote Work', job.is_remote ? 'Yes' : 'No'],
                    ['Posted', formatDate(job.posted_at)],
                  ].map(([label, value]) => (
                    <div key={label} style={{ padding: '0.75rem', background: '#f9fafb', borderRadius: 8 }}>
                      <div style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: 2 }}>{label}</div>
                      <div style={{ fontWeight: 500, color: '#1f2937' }}>{value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Benefits */}
              {job.benefits && job.benefits.length > 0 && (
                <div style={{
                  background: '#fff', borderRadius: '12px', padding: '1.5rem',
                  border: '1px solid #e5e7eb', marginBottom: '1.5rem',
                }}>
                  <h2 style={{ fontSize: '1.15rem', fontWeight: 600, margin: '0 0 0.75rem', color: '#1f2937' }}>Benefits &amp; Perks</h2>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {job.benefits.map((b, i) => (
                      <span key={i} style={{ background: '#eff6ff', color: '#1d4ed8', padding: '4px 12px', borderRadius: 999, fontSize: '0.9rem' }}>
                        <i className="fas fa-check-circle" style={{ marginRight: 4 }}></i>{b}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Highlights */}
              {job.job_highlights && Object.keys(job.job_highlights).length > 0 && (
                <div style={{
                  background: '#fff', borderRadius: '12px', padding: '1.5rem',
                  border: '1px solid #e5e7eb', marginBottom: '1.5rem',
                }}>
                  <h2 style={{ fontSize: '1.15rem', fontWeight: 600, margin: '0 0 0.75rem', color: '#1f2937' }}>Job Highlights</h2>
                  {Object.entries(job.job_highlights).map(([key, values]) =>
                    values && values.length > 0 ? (
                      <div key={key} style={{ marginBottom: '1rem' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}
                        </h3>
                        <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                          {values.slice(0, 5).map((item, i) => (
                            <li key={i} style={{ marginBottom: '0.25rem', color: '#4b5563' }}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null
                  )}
                </div>
              )}

              {/* Apply CTA */}
              <div style={{
                background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                borderRadius: '12px', padding: '2rem', textAlign: 'center',
                border: '1px solid #bfdbfe',
              }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1e40af', margin: '0 0 0.5rem' }}>Ready to Apply?</h2>
                <p style={{ color: '#3b82f6', marginBottom: '1rem' }}>Click below to apply directly on the company&apos;s website.</p>
                <a href={job.apply_link} target="_blank" rel="noopener noreferrer" className="rts-btn btn-primary" style={{ textDecoration: 'none' }}>
                  <i className="fas fa-external-link-alt" style={{ marginRight: '0.5rem' }}></i>
                  Apply on Company Website
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      <FooterOneDynamic />
      <BackToTop />

      <ShareJobModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        job={job}
      />
    </>
  );
}
