"use client";

import React, { useEffect, useState } from 'react';
import BackToTop from "@/components/common/BackToTop";
import Breadcrumb from "@/components/common/Breadcrumb";
import HeaderOne from "@/components/header/HeaderOne";
import FooterOneDynamic from "@/components/footer/FooterOneDynamic";
import './job-alerts.css';
import '../job-listing/job-listing.css';

const JOB_ALERTS_KEY = 'jobAlertsEnabled';
const BOOKMARKS_KEY = 'bookmarkedJobs';

export default function JobAlertsPage() {
  const [alertsEnabled, setAlertsEnabled] = useState(false);
  const [bookmarkedJobs, setBookmarkedJobs] = useState([]);
  
  // Job alert subscription state
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriptionForm, setSubscriptionForm] = useState({
    email: '',
    name: '',
    keywords: '',
    locations: '',
    remoteOnly: false,
    employmentTypes: ['Full-time', 'Part-time', 'Contract'],
    seniority: ['Entry', 'Mid', 'Senior', 'Executive'],
    frequency: 'daily'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  // Load state from localStorage on mount
  useEffect(() => {
    const enabled = localStorage.getItem(JOB_ALERTS_KEY);
    setAlertsEnabled(enabled === 'true');
    const bookmarks = localStorage.getItem(BOOKMARKS_KEY);
    setBookmarkedJobs(bookmarks ? JSON.parse(bookmarks) : []);
    
    // Check if user is already subscribed
    checkSubscriptionStatus();
  }, []);

  // Check if user is already subscribed to job alerts
  const checkSubscriptionStatus = async () => {
    const savedEmail = localStorage.getItem('userEmail');
    if (savedEmail) {
      try {
        const response = await fetch(`/api/job-alerts/subscribe?email=${encodeURIComponent(savedEmail)}`);
        const data = await response.json();
        
        if (data.success && data.preferences) {
          setIsSubscribed(true);
          setSubscriptionForm({
            email: data.preferences.email,
            name: data.preferences.name,
            keywords: data.preferences.keywords.join(', '),
            locations: data.preferences.locations.join(', '),
            remoteOnly: data.preferences.remoteOnly,
            employmentTypes: data.preferences.employmentTypes,
            seniority: data.preferences.seniority,
            frequency: data.preferences.frequency
          });
        }
      } catch (error) {
        console.error('Error checking subscription status:', error);
      }
    }
  };

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

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSubscriptionForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle employment type changes
  const handleEmploymentTypeChange = (type) => {
    setSubscriptionForm(prev => ({
      ...prev,
      employmentTypes: prev.employmentTypes.includes(type)
        ? prev.employmentTypes.filter(t => t !== type)
        : [...prev.employmentTypes, type]
    }));
  };

  // Handle seniority changes
  const handleSeniorityChange = (level) => {
    setSubscriptionForm(prev => ({
      ...prev,
      seniority: prev.seniority.includes(level)
        ? prev.seniority.filter(s => s !== level)
        : [...prev.seniority, level]
    }));
  };

  // Handle subscription form submission
  const handleSubscriptionSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const formData = {
        email: subscriptionForm.email.trim(),
        name: subscriptionForm.name.trim(),
        keywords: subscriptionForm.keywords.split(',').map(k => k.trim()).filter(k => k),
        locations: subscriptionForm.locations.split(',').map(l => l.trim()).filter(l => l),
        remoteOnly: subscriptionForm.remoteOnly,
        employmentTypes: subscriptionForm.employmentTypes,
        seniority: subscriptionForm.seniority,
        frequency: subscriptionForm.frequency
      };

      const response = await fetch('/api/job-alerts/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        setIsSubscribed(true);
        setMessage(data.message);
        setMessageType('success');
        localStorage.setItem('userEmail', formData.email);
      } else {
        setMessage(data.error || 'Failed to subscribe to job alerts');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Error subscribing to job alerts:', error);
      setMessage('An error occurred. Please try again.');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle unsubscribe
  const handleUnsubscribe = async () => {
    if (!confirm('Are you sure you want to unsubscribe from job alerts?')) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/job-alerts/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          unsubscribeToken: localStorage.getItem('unsubscribeToken')
        })
      });

      const data = await response.json();

      if (data.success) {
        setIsSubscribed(false);
        setMessage('Successfully unsubscribed from job alerts');
        setMessageType('success');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('unsubscribeToken');
      } else {
        setMessage(data.error || 'Failed to unsubscribe');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Error unsubscribing:', error);
      setMessage('An error occurred. Please try again.');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <HeaderOne />
      <Breadcrumb />
      
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
                {/* Job Alerts Subscription Section */}
                <div className="alerts-subscription-section">
                  <div className="card">
                    <div className="card-body">
                      <h3 className="section-title mb-3">Job Alerts</h3>
                      <p className="text-muted mb-4">
                        Get notified when new jobs match your preferences
                      </p>

                      {/* Message Display */}
                      {message && (
                        <div className={`alert ${messageType === 'success' ? 'alert-success' : 'alert-danger'} mb-4`}>
                          {message}
                        </div>
                      )}

                      {!isSubscribed ? (
                        /* Subscription Form */
                        <form onSubmit={handleSubscriptionSubmit}>
                          <div className="row">
                            <div className="col-md-6 mb-3">
                              <label htmlFor="email" className="form-label">Email Address *</label>
                              <input
                                type="email"
                                className="form-control"
                                id="email"
                                name="email"
                                value={subscriptionForm.email}
                                onChange={handleInputChange}
                                required
                                placeholder="your@email.com"
                              />
                            </div>
                            <div className="col-md-6 mb-3">
                              <label htmlFor="name" className="form-label">Full Name *</label>
                              <input
                                type="text"
                                className="form-control"
                                id="name"
                                name="name"
                                value={subscriptionForm.name}
                                onChange={handleInputChange}
                                required
                                placeholder="Your full name"
                              />
                            </div>
                          </div>

                          <div className="row">
                            <div className="col-md-6 mb-3">
                              <label htmlFor="keywords" className="form-label">Keywords *</label>
                              <input
                                type="text"
                                className="form-control"
                                id="keywords"
                                name="keywords"
                                value={subscriptionForm.keywords}
                                onChange={handleInputChange}
                                required
                                placeholder="e.g., software engineer, react, javascript"
                              />
                              <div className="form-text">Separate multiple keywords with commas</div>
                            </div>
                            <div className="col-md-6 mb-3">
                              <label htmlFor="locations" className="form-label">Locations</label>
                              <input
                                type="text"
                                className="form-control"
                                id="locations"
                                name="locations"
                                value={subscriptionForm.locations}
                                onChange={handleInputChange}
                                placeholder="e.g., New York, San Francisco, Remote"
                              />
                              <div className="form-text">Separate multiple locations with commas</div>
                            </div>
                          </div>

                          <div className="row">
                            <div className="col-md-6 mb-3">
                              <label className="form-label">Employment Types</label>
                              <div className="d-flex flex-wrap gap-2">
                                {['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship'].map(type => (
                                  <div key={type} className="form-check">
                                    <input
                                      className="form-check-input"
                                      type="checkbox"
                                      id={`emp-${type}`}
                                      checked={subscriptionForm.employmentTypes.includes(type)}
                                      onChange={() => handleEmploymentTypeChange(type)}
                                    />
                                    <label className="form-check-label" htmlFor={`emp-${type}`}>
                                      {type}
                                    </label>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div className="col-md-6 mb-3">
                              <label className="form-label">Seniority Levels</label>
                              <div className="d-flex flex-wrap gap-2">
                                {['Entry', 'Mid', 'Senior', 'Executive'].map(level => (
                                  <div key={level} className="form-check">
                                    <input
                                      className="form-check-input"
                                      type="checkbox"
                                      id={`sen-${level}`}
                                      checked={subscriptionForm.seniority.includes(level)}
                                      onChange={() => handleSeniorityChange(level)}
                                    />
                                    <label className="form-check-label" htmlFor={`sen-${level}`}>
                                      {level}
                                    </label>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="row">
                            <div className="col-md-6 mb-3">
                              <div className="form-check">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  id="remoteOnly"
                                  name="remoteOnly"
                                  checked={subscriptionForm.remoteOnly}
                                  onChange={handleInputChange}
                                />
                                <label className="form-check-label" htmlFor="remoteOnly">
                                  Remote jobs only
                                </label>
                              </div>
                            </div>
                          </div>

                          <div className="d-grid">
                            <button
                              type="submit"
                              className="rts-btn btn-primary btn-lg"
                              disabled={isLoading}
                            >
                              {isLoading ? 'Subscribing...' : 'Subscribe to Job Alerts'}
                            </button>
                          </div>
                        </form>
                      ) : (
                        /* Subscription Management */
                        <div className="subscription-management">
                          <div className="alert alert-success mb-4">
                            <h5 className="alert-heading">✓ Subscribed to Job Alerts</h5>
                            <p className="mb-0">You&apos;re receiving job alerts for:</p>
                            <ul className="mb-0 mt-2">
                              <li><strong>Keywords:</strong> {subscriptionForm.keywords || 'None specified'}</li>
                              <li><strong>Locations:</strong> {subscriptionForm.locations || 'Any location'}</li>
                              {/* Frequency omitted from UI */}
                              <li><strong>Remote only:</strong> {subscriptionForm.remoteOnly ? 'Yes' : 'No'}</li>
                            </ul>
                          </div>
                          
                          <div className="d-flex gap-2">
                            <button
                              onClick={() => setIsSubscribed(false)}
                              className="btn btn-outline-primary"
                              disabled={isLoading}
                            >
                              Update Preferences
                            </button>
                            <button
                              onClick={handleUnsubscribe}
                              className="btn btn-outline-danger"
                              disabled={isLoading}
                            >
                              {isLoading ? 'Unsubscribing...' : 'Unsubscribe'}
                            </button>
                          </div>
                        </div>
                      )}
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
                                      href={job.url || `/job-listing?job=${encodeURIComponent(job.id)}`} 
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

      <FooterOneDynamic />
      <BackToTop />
    </>
  );
} 
