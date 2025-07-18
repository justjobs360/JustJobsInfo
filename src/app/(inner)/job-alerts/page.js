"use client";

import React, { useEffect, useState } from 'react';
import BackToTop from "@/components/common/BackToTop";
import HeaderOne from "@/components/header/HeaderOne";
import FooterOne from "@/components/footer/FooterOne";
import './job-alerts.css';
import '../job-listing/job-listing.css';

const JOB_ALERTS_KEY = 'jobAlertsEnabled';
const BOOKMARKS_KEY = 'bookmarkedJobs';

export default function JobAlertsPage() {
  const [alertsEnabled, setAlertsEnabled] = useState(false);
  const [bookmarkedJobs, setBookmarkedJobs] = useState([]);

  // Load state from localStorage on mount
  useEffect(() => {
    const enabled = localStorage.getItem(JOB_ALERTS_KEY);
    setAlertsEnabled(enabled === 'true');
    const bookmarks = localStorage.getItem(BOOKMARKS_KEY);
    setBookmarkedJobs(bookmarks ? JSON.parse(bookmarks) : []);
  }, []);

  // Persist alerts toggle
  const handleToggle = () => {
    const newValue = !alertsEnabled;
    setAlertsEnabled(newValue);
    localStorage.setItem(JOB_ALERTS_KEY, newValue);
  };

  // Remove bookmark
  const removeBookmark = (jobId) => {
    const updatedBookmarks = bookmarkedJobs.filter(job => job.id !== jobId);
    setBookmarkedJobs(updatedBookmarks);
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updatedBookmarks));
  };

  return (
    <>
      <HeaderOne />
      
      <div className="job-alerts-page">
        {/* Hero Section */}
        <div className="job-alerts-hero rts-section-gap">
          <div className="container">
            <div className="row">
              <div className="col-lg-12 text-center">
                <div className="banner-wrapper-one">
                  <h1 className="job-alerts-title">Job Alerts & Bookmarks</h1>
                  <p className="job-alerts-subtitle">
                    Stay updated with new job opportunities and manage your saved positions
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="job-alerts-content rts-section-gap">
          <div className="container">
            <div className="row">
              <div className="col-lg-8 mx-auto">
                {/* Job Alerts Toggle Section */}
                <div className="alerts-toggle-section">
                  <div className="card">
                    <div className="card-body">
                      <div className="d-flex align-items-center justify-content-between">
                        <div>
                          <h3 className="section-title mb-2">Job Alerts</h3>
                          <p className="text-muted mb-0">
                            Get notified when new jobs match your preferences
                          </p>
                        </div>
                        <label className="custom-switch">
                          <input
                            type="checkbox"
                            checked={alertsEnabled}
                            onChange={handleToggle}
                            className="custom-switch-input"
                          />
                          <span className="custom-switch-slider"></span>
                          <span className="custom-switch-label ms-2">{alertsEnabled ? 'Enabled' : 'Disabled'}</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bookmarked Jobs Section */}
                <div className="bookmarks-section mt-5">
                  <div className="job-results-section">
                    <div className="container">
                      <div className="job-results-header">
                        <div className="title-center-style-two">
                          <h2 className="title">Bookmarked Jobs</h2>
                          <p className="disc">
                            {bookmarkedJobs.length > 0 ? `You have ${bookmarkedJobs.length} bookmarked job${bookmarkedJobs.length > 1 ? 's' : ''}` : 'No bookmarked jobs yet'}
                          </p>
                        </div>
                      </div>
                      {bookmarkedJobs.length === 0 ? (
                        <div className="empty-state text-center py-5">
                          <div className="empty-icon mb-3">
                            <span style={{fontSize: '3rem', color: '#ccc'}}>★</span>
                          </div>
                          <h4 className="text-muted mb-2">No bookmarked jobs yet</h4>
                          <p className="text-muted mb-4">
                            When you bookmark jobs while browsing, they&apos;ll appear here for easy access.
                          </p>
                          <a href="/job-listing" className="rts-btn btn-primary">
                            Browse Jobs
                          </a>
                        </div>
                      ) : (
                        <>
                          {bookmarkedJobs.map((job, idx) => (
                            <div key={job.id || idx} className="job-accordion-card">
                              <div className="job-accordion-header" style={{ cursor: 'default' }}>
                                <div className="job-summary">
                                  <div className="job-summary-main">
                                    <h4 className="job-title">{job.title}</h4>
                                    <div className="company-name">{job.company}</div>
                                    <div className="job-location">{job.location}</div>
                                    <div className="job-type-time">
                                      <span className="job-type">{job.employment_type}</span>
                                      <span className="job-posted-time">{job.posted_at ? new Date(job.posted_at).toLocaleDateString() : ''}</span>
                                      {job.is_remote && <span className="remote-badge">Remote</span>}
                                    </div>
                                  </div>
                                  <div className="job-summary-right" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px', minWidth: '90px'}}>
                                    <div className="company-logo">
                                      {job.company_logo ? (
                                        <img 
                                          src={job.company_logo} 
                                          alt={`${job.company} logo`}
                                          onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                                        />
                                      ) : null}
                                      <div className="company-initial" style={{
                                        display: job.company_logo ? 'none' : 'flex',
                                        background: '#2563eb',
                                      }}>
                                        {job.company?.charAt(0)}
                                      </div>
                                    </div>
                                    <a 
                                      href={job.url || '#'} 
                                      target="_blank" 
                                      rel="noopener noreferrer" 
                                      className="rts-btn btn-primary btn-sm job-alerts-view-btn"
                                      style={{margin: '10px 0 0 0', width: '168px', textAlign: 'center', fontSize: '16px', fontWeight: 600, padding: '12px 0', display: 'block', boxSizing: 'border-box', minWidth: '168px', maxWidth: '168px', WebkitAppearance: 'none', MozAppearance: 'none', appearance: 'none', outline: 'none', border: 'none', background: '#2563eb', color: '#fff', cursor: 'pointer', transition: 'all 0.2s', boxShadow: 'none', lineHeight: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: 'inherit', zIndex: 1, position: 'relative'}}>
                                      View Job
                                    </a>
                                    <button
                                      className="bookmark-btn bookmarked"
                                      onClick={() => removeBookmark(job.id)}
                                      title="Remove from bookmarks"
                                      style={{marginTop: '8px'}}
                                    >
                                      ★
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <FooterOne />
      <BackToTop />
    </>
  );
} 