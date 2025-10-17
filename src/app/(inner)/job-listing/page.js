"use client";

import React, { useState, useEffect, useRef, Fragment } from 'react';
import BackToTop from "@/components/common/BackToTop";
import Breadcrumb from "@/components/common/Breadcrumb";
import HeaderOne from "@/components/header/HeaderOne";
import FooterOneDynamic from "@/components/footer/FooterOneDynamic";
import ShareJobModal from "@/components/modals/ShareJobModal";
import './job-listing.css';
import { useRouter, useSearchParams } from 'next/navigation';

export default function JobListingPage() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(1);
    const [searchFilters, setSearchFilters] = useState({
        query: '', // Default to empty string to list all jobs
        location: '',
        employmentType: '',
        remoteOnly: false,
        datePosted: '',
        minSalary: '',
        maxSalary: ''
    });
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [expandedJobs, setExpandedJobs] = useState(new Set());
    const [bookmarkedJobs, setBookmarkedJobs] = useState(new Set());
    const [showLocationPrompt, setShowLocationPrompt] = useState(false);
    const [userLocationInput, setUserLocationInput] = useState('');
    const [shareModalOpen, setShareModalOpen] = useState(false);
    const [selectedJobForShare, setSelectedJobForShare] = useState(null);
    const triedGeo = useRef(false);
    const initialSearchTriggered = useRef(false);
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        // Handle industry parameter from URL (on every navigation)
        if (searchParams && searchParams.get('industry')) {
            const industry = searchParams.get('industry');
            // Always update the query when industry parameter changes
            setSearchFilters(prev => ({ ...prev, query: industry }));
            // Reset the search trigger flag to allow new search
            initialSearchTriggered.current = false;
        }
        
        // On first load, try to auto-detect location using browser geolocation
        if (!triedGeo.current && !searchFilters.location) {
            triedGeo.current = true;
            
            if ('geolocation' in navigator) {
                navigator.geolocation.getCurrentPosition(
                    async (position) => {
                        const { latitude, longitude } = position.coords;
                        
                        try {
                            // Call our backend API to convert coordinates to country
                            const response = await fetch(`/api/geolocate?lat=${latitude}&lon=${longitude}`);
                            const data = await response.json();
                            
                            if (data.success && data.country) {
                                setSearchFilters(prev => ({ ...prev, location: data.country }));
                            } else {
                                setShowLocationPrompt(true);
                            }
                        } catch (error) {
                            setShowLocationPrompt(true);
                        }
                    },
                    (error) => {
                        setShowLocationPrompt(true);
                    },
                    {
                        enableHighAccuracy: false,
                        timeout: 10000,
                        maximumAge: 300000 // 5 minutes
                    }
                );
            } else {
                setShowLocationPrompt(true);
            }
        }
        
        // Expand job from URL param
        if (searchParams && searchParams.get('job')) {
            const jobId = searchParams.get('job');
            setExpandedJobs(new Set([jobId]));
            setTimeout(() => {
                const el = document.getElementById(`job-${jobId}`);
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 500);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]); // Run when URL search params change (industry navigation)

    // Trigger search when filters change
    useEffect(() => {
        if (searchFilters.query || searchFilters.location) {
            searchJobs(true);
        }
    }, [searchFilters.query, searchFilters.location, searchFilters.employmentType, searchFilters.remoteOnly, searchFilters.datePosted]);


    const handleLocationSubmit = (e) => {
        e.preventDefault();
        if (userLocationInput.trim()) {
            console.log('User entered location:', userLocationInput.trim());
            setSearchFilters(prev => ({ ...prev, location: userLocationInput.trim() }));
            setShowLocationPrompt(false);
        }
    };

    // Add a button to allow user to change location
    const handleChangeLocation = () => {
        setShowLocationPrompt(true);
        setUserLocationInput('');
    };

    // Modified searchJobs to optionally accept a location and query override
    const searchJobs = async (reset = false, locationOverride = null, queryOverride = null) => {
        setLoading(true);
        
        try {
            // Build API URL with search parameters
            const params = new URLSearchParams();
            
            // Use override if provided, else current filter
            const queryToUse = queryOverride !== null ? queryOverride : searchFilters.query;
            if (queryToUse) params.append('query', queryToUse);
            const locationToUse = locationOverride !== null ? locationOverride : searchFilters.location;
            if (locationToUse) params.append('location', locationToUse);
            if (searchFilters.employmentType) {
                // Map frontend values to API values
                const typeMapping = {
                    'Full-time': 'FULLTIME',
                    'Part-time': 'PARTTIME', 
                    'Contract': 'CONTRACTOR',
                    'Internship': 'INTERN'
                };
                params.append('employment_types', typeMapping[searchFilters.employmentType] || searchFilters.employmentType);
            }
            if (searchFilters.remoteOnly) params.append('remote_jobs_only', 'true');
            if (searchFilters.datePosted && searchFilters.datePosted !== '') {
                // Map frontend values to API values
                const dateMapping = {
                    'today': 'today',
                    '3days': '3days', 
                    'week': 'week',
                    'month': 'month'
                };
                params.append('date_posted', dateMapping[searchFilters.datePosted] || searchFilters.datePosted);
            }
            
            const currentPage = reset ? 1 : page;
            params.append('page', currentPage.toString());

            const apiUrl = `/api/jobs/search?${params.toString()}`;
            console.log('Fetching jobs from:', apiUrl);

            const response = await fetch(apiUrl);
            const result = await response.json();

            if (!result.success) {
                console.error('API Error:', result.error);
                // Show error message to user but don't clear existing jobs
                return;
            }

            const newJobs = result.data || [];
            
            // If we tried geo and got no jobs, fallback to United Kingdom (only once)
            if (reset && locationToUse && newJobs.length === 0 && !triedGeoFallback.current && locationToUse !== 'United Kingdom') {
                triedGeoFallback.current = true;
                setSearchFilters(prev => ({ ...prev, location: 'United Kingdom', query: '' }));
                await searchJobs(true, 'United Kingdom', '');
                return;
            }
            
            if (reset) {
                setJobs(newJobs);
                setPage(1);
            } else {
                setJobs(prev => [...prev, ...newJobs]);
            }
            
            setHasMore(result.hasMore && newJobs.length > 0);
            
            if (reset) {
                setPage(2); // Set to 2 since we just loaded page 1
            } else {
                setPage(prev => prev + 1);
            }
            
        } catch (error) {
            console.error('Error searching jobs:', error);
            // Don't clear existing jobs on error, just log it
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        searchJobs(true);
    };

    const loadMoreJobs = () => {
        // searchJobs(false) will use the current page state and increment it
        searchJobs(false);
    };

    const formatSalary = (min, max) => {
        const fmt = (v) => (Number(v) / 1000).toFixed(1);
        if (!min && !max) return "Salary not specified";
        if (min && max) return `$${fmt(min)}k - $${fmt(max)}k`;
        if (min) return `$${fmt(min)}k+`;
        return `Up to $${fmt(max)}k`;
    };

    const getSalaryEstimate = async (jobTitle, location) => {
        try {
            const response = await fetch('/api/jobs/salary-estimate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    job_title: jobTitle,
                    location: location
                }),
            });
            
            const result = await response.json();
            if (result.success) {
                return result.data;
            }
        } catch (error) {
            console.error('Error getting salary estimate:', error);
        }
        return null;
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) return "1 day ago";
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.ceil(diffDays/7)} weeks ago`;
        return `${Math.ceil(diffDays/30)} months ago`;
    };

    // Update formatJobDescription to split on semicolons and big dots
    const formatJobDescription = (description) => {
        if (!description) return [];
        let cleanDescription = description.replace(/\s+/g, ' ').trim();

        // Split on semicolons, big dots, and sentence endings
        let parts = cleanDescription.split(/([;•●‣▪️◆▶️►◉◦])|(?<=[.!?])\s+(?=[A-Z])/);
        let paragraphs = [];
        let current = '';
        parts.forEach((part, idx) => {
            if (!part) return;
            if (part.match(/^[;•●‣▪️◆▶️►◉◦]$/)) {
                if (current.trim()) paragraphs.push(current.trim());
                paragraphs.push(''); // blank line (2 line breaks)
                current = '';
            } else {
                current += part;
            }
        });
        if (current.trim()) paragraphs.push(current.trim());
        // Remove empty strings at the end
        while (paragraphs.length && paragraphs[paragraphs.length-1] === '') paragraphs.pop();
        return paragraphs;
    };

    const getQualityIndicator = (score) => {
        switch(score) {
            case 'high': return '';
            case 'medium': return 'medium';
            case 'low': return 'low';
            default: return 'medium';
        }
    };

    const toggleJobExpanded = (jobId) => {
        const newExpanded = new Set(expandedJobs);
        if (newExpanded.has(jobId)) {
            newExpanded.delete(jobId);
        } else {
            newExpanded.add(jobId);
        }
        setExpandedJobs(newExpanded);
    };

    const isJobExpanded = (jobId) => {
        return expandedJobs.has(jobId);
    };

    // Bookmark functionality
    const toggleBookmark = (jobId, job) => {
        const newBookmarked = new Set(bookmarkedJobs);
        const bookmarksData = JSON.parse(localStorage.getItem('bookmarkedJobs') || '[]');
        if (newBookmarked.has(jobId)) {
            newBookmarked.delete(jobId);
            // Remove from localStorage
            const updatedBookmarks = bookmarksData.filter(j => j.id !== jobId);
            localStorage.setItem('bookmarkedJobs', JSON.stringify(updatedBookmarks));
        } else {
            // Prevent duplicates
            if (!bookmarksData.some(j => j.id === jobId)) {
                newBookmarked.add(jobId);
                const jobData = {
                    id: jobId,
                    title: job.job_title,
                    company: job.company_name,
                    location: job.location,
                    url: job.apply_link,
                    bookmarkedAt: new Date().toISOString(),
                    company_logo: job.company_logo || '',
                    employment_type: job.employment_type || '',
                    posted_at: job.posted_at || '',
                    is_remote: job.is_remote || false
                };
                bookmarksData.push(jobData);
                localStorage.setItem('bookmarkedJobs', JSON.stringify(bookmarksData));
            }
        }
        setBookmarkedJobs(newBookmarked);
    };

    const isJobBookmarked = (jobId) => {
        return bookmarkedJobs.has(jobId);
    };

    // Share functionality
    const handleShareJob = (job) => {
        setSelectedJobForShare(job);
        setShareModalOpen(true);
    };

    const handleCloseShareModal = () => {
        setShareModalOpen(false);
        setSelectedJobForShare(null);
    };

    // Load bookmarked jobs from localStorage on mount and sync on storage events
    useEffect(() => {
        const syncBookmarks = () => {
            const bookmarksData = JSON.parse(localStorage.getItem('bookmarkedJobs') || '[]');
            const bookmarkedIds = new Set(bookmarksData.map(job => job.id));
            setBookmarkedJobs(bookmarkedIds);
        };
        syncBookmarks();
        window.addEventListener('storage', syncBookmarks);
        return () => window.removeEventListener('storage', syncBookmarks);
    }, []);

    return (
        <>
            <HeaderOne />
            <Breadcrumb />
            {showLocationPrompt && (
                <div 
                    className="location-prompt-modal" 
                    style={{position: 'fixed', top:0, left:0, width:'100vw', height:'100vh', background:'rgba(0,0,0,0.5)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center'}}
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            setShowLocationPrompt(false);
                        }
                    }}
                >
                    <div style={{background:'#fff', padding: '2rem', borderRadius: '8px', maxWidth: '90vw', minWidth: '300px', position: 'relative'}}>
                        <button 
                            onClick={() => setShowLocationPrompt(false)}
                            style={{
                                position: 'absolute',
                                top: '1px',
                                right: '1px',
                                background: '#f5f5f5',
                                border: '1px solid #ddd',
                                borderRadius: '50%',
                                fontSize: '18px',
                                cursor: 'pointer',
                                color: '#333',
                                padding: '0',
                                lineHeight: '1',
                                width: '28px',
                                height: '28px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                zIndex: 1001,
                                transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.background = '#e0e0e0';
                                e.target.style.color = '#000';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.background = '#f5f5f5';
                                e.target.style.color = '#333';
                            }}
                            aria-label="Close location prompt"
                        >
                            ×
                        </button>
                        <h4>Please enter your country or location to see relevant jobs:</h4>
                        <form onSubmit={handleLocationSubmit} style={{marginTop:'1rem'}}>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="e.g. United Kingdom, Canada, India"
                                value={userLocationInput}
                                onChange={e => setUserLocationInput(e.target.value)}
                                autoFocus
                            />
                            <button type="submit" className="rts-btn btn-primary mt-3 w-100">Show Jobs</button>
                        </form>
                    </div>
                </div>
            )}
            {/* Add a button to change location if already set */}
            {searchFilters.location && (
                <div style={{textAlign:'right', margin:'1rem 2rem 0 0'}}>
                    <button className="rts-btn btn-border" onClick={handleChangeLocation}>
                        Change Location (Current: {searchFilters.location})
                    </button>
                </div>
            )}
            
            <div className="job-listing-page">
                {/* Hero Section */}
                <div className="job-listing-hero rts-section-gap">
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-12 text-center">
                                <div className="banner-wrapper-one">
                                    <h1 className="job-listing-title">Find Your Dream Job</h1>
                                    <p className="job-listing-subtitle">
                                        Discover lots of job opportunities from top companies
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search Section */}
                <div className="job-search-section">
                    <div className="container">
                        <form onSubmit={handleSearch} className="job-search-form">
                            <div className="row g-3">
                                <div className="col-md-4">
                                    <div className="form-group">
                                        <label htmlFor="jobQuery">Job Title or Keywords</label>
                                        <input
                                            type="text"
                                            id="jobQuery"
                                            className="form-control"
                                            placeholder="e.g. Software Engineer, Marketing"
                                            value={searchFilters.query}
                                            onChange={(e) => setSearchFilters({...searchFilters, query: e.target.value})}
                                        />
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <div className="form-group">
                                        <label htmlFor="jobLocation">Location</label>
                                        <input
                                            type="text"
                                            id="jobLocation"
                                            className="form-control"
                                            placeholder="City, State or Remote"
                                            value={searchFilters.location}
                                            onChange={(e) => setSearchFilters({...searchFilters, location: e.target.value})}
                                        />
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <div className="form-group">
                                        <label htmlFor="employmentType">Job Type</label>
                                        <select 
                                            id="employmentType"
                                            className="form-control"
                                            value={searchFilters.employmentType}
                                            onChange={(e) => setSearchFilters({...searchFilters, employmentType: e.target.value})}
                                        >
                                            <option value="">All Types</option>
                                            <option value="Full-time">Full-time</option>
                                            <option value="Part-time">Part-time</option>
                                            <option value="Contract">Contract</option>
                                            <option value="Internship">Internship</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="col-md-2">
                                    <div className="form-group">
                                        <label>&nbsp;</label>
                                        <button type="submit" className="rts-btn btn-primary w-100" disabled={loading}>
                                            {loading ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                    Searching...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="fas fa-search me-2"></i>
                                                    Search Jobs
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="row mt-3">
                                <div className="col-md-6">
                                    <div className="form-check">
                                        <label className="form-check-label" htmlFor="remoteOnly" style={{display: 'flex', alignItems: 'center', cursor: 'pointer'}}>
                                        <input 
                                            className="form-check-input" 
                                            type="checkbox" 
                                            id="remoteOnly"
                                            checked={searchFilters.remoteOnly}
                                            onChange={(e) => setSearchFilters({...searchFilters, remoteOnly: e.target.checked})}
                                                style={{marginRight: '8px'}}
                                        />
                                            <span>Remote jobs only</span>
                                        </label>
                                    </div>
                                </div>
                                <div className="col-md-6 search-filters-toggle">
                                    <span
                                        className="advanced-filters-link"
                                        role="button"
                                        tabIndex={0}
                                        onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                                        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setShowAdvancedFilters(!showAdvancedFilters); }}
                                        style={{ color: '#1976d2', textDecoration: 'underline', cursor: 'pointer', fontWeight: 400, background: 'none', border: 'none', padding: 0, fontSize: 'inherit' }}
                                    >
                                        {showAdvancedFilters ? 'Hide' : 'Show'} Advanced Filters
                                    </span>
                                </div>
                            </div>

                            {showAdvancedFilters && (
                                <div className="advanced-filters">
                                    <div className="row g-3">
                                        <div className="col-md-3">
                                            <label htmlFor="datePosted">Date Posted</label>
                                            <select 
                                                id="datePosted"
                                                className="form-control"
                                                value={searchFilters.datePosted}
                                                onChange={(e) => setSearchFilters({...searchFilters, datePosted: e.target.value})}
                                            >
                                                <option value="">Any time</option>
                                                <option value="today">Today</option>
                                                <option value="3days">Last 3 days</option>
                                                <option value="week">Last week</option>
                                                <option value="month">Last month</option>
                                            </select>
                                        </div>
                                        <div className="col-md-3">
                                            <label htmlFor="experienceLevel">Experience Level</label>
                                            <select 
                                                id="experienceLevel"
                                                className="form-control"
                                                value={searchFilters.experienceLevel || ''}
                                                onChange={(e) => setSearchFilters({...searchFilters, experienceLevel: e.target.value})}
                                            >
                                                <option value="">Any Level</option>
                                                <option value="entry">Entry Level</option>
                                                <option value="mid">Mid Level</option>
                                                <option value="senior">Senior Level</option>
                                                <option value="executive">Executive</option>
                                            </select>
                                        </div>
                                        <div className="col-md-3">
                                            <label htmlFor="jobCategory">Job Category</label>
                                            <select 
                                                id="jobCategory"
                                                className="form-control"
                                                value={searchFilters.jobCategory || ''}
                                                onChange={(e) => setSearchFilters({...searchFilters, jobCategory: e.target.value})}
                                            >
                                                <option value="">All Categories</option>
                                                <option value="technology">Technology</option>
                                                <option value="marketing">Marketing</option>
                                                <option value="sales">Sales</option>
                                                <option value="finance">Finance</option>
                                                <option value="healthcare">Healthcare</option>
                                                <option value="education">Education</option>
                                                <option value="design">Design</option>
                                                <option value="operations">Operations</option>
                                            </select>
                                        </div>
                                        <div className="col-md-3">
                                            <label htmlFor="companySize">Company Size</label>
                                            <select 
                                                id="companySize"
                                                className="form-control"
                                                value={searchFilters.companySize || ''}
                                                onChange={(e) => setSearchFilters({...searchFilters, companySize: e.target.value})}
                                            >
                                                <option value="">Any Size</option>
                                                <option value="startup">Startup (1-50)</option>
                                                <option value="small">Small (51-200)</option>
                                                <option value="medium">Medium (201-1000)</option>
                                                <option value="large">Large (1000+)</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="row g-3 mt-2">
                                        <div className="col-md-6">
                                            <label>Salary Range (USD)</label>
                                            <div className="salary-range-inputs">
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    placeholder="Min salary"
                                                    value={searchFilters.minSalary}
                                                    onChange={(e) => setSearchFilters({...searchFilters, minSalary: e.target.value})}
                                                />
                                                <span className="salary-range-separator">to</span>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    placeholder="Max salary"
                                                    value={searchFilters.maxSalary}
                                                    onChange={(e) => setSearchFilters({...searchFilters, maxSalary: e.target.value})}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <label>Additional Filters</label>
                                            <div className="additional-filters">
                                                <div className="form-check">
                                                    <label className="form-check-label" htmlFor="hasBenefits" style={{display: 'flex', alignItems: 'center', cursor: 'pointer'}}>
                                                        <input 
                                                            className="form-check-input" 
                                                            type="checkbox" 
                                                            id="hasBenefits"
                                                            checked={searchFilters.hasBenefits || false}
                                                            onChange={(e) => setSearchFilters({...searchFilters, hasBenefits: e.target.checked})}
                                                            style={{marginRight: '8px'}}
                                                        />
                                                        <span>Has Benefits</span>
                                                    </label>
                                                </div>
                                                <div className="form-check">
                                                    <label className="form-check-label" htmlFor="equityOffered" style={{display: 'flex', alignItems: 'center', cursor: 'pointer'}}>
                                                        <input 
                                                            className="form-check-input" 
                                                            type="checkbox" 
                                                            id="equityOffered"
                                                            checked={searchFilters.equityOffered || false}
                                                            onChange={(e) => setSearchFilters({...searchFilters, equityOffered: e.target.checked})}
                                                            style={{marginRight: '8px'}}
                                                        />
                                                        <span>Equity Offered</span>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </form>
                    </div>
                </div>

                {/* Results Section */}
                <div className="job-results-section rts-section-gapBottom">
                    <div className="container">
                        <div className="job-results-header">
                            <div className="title-center-style-two">
                                <h2 className="title">Job Search Results</h2>
                                <p className="disc">
                                    {jobs.length > 0 ? `Found ${jobs.length} job opportunities` : 'Start searching to find job opportunities'}
                                </p>
                            </div>
                        </div>

                        {loading && jobs.length === 0 ? (
                            <div className="loading-state">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                                <p>Searching for the perfect jobs for you...</p>
                            </div>
                        ) : jobs.length === 0 && (
                            <div className="no-results" style={{
                                textAlign: 'center',
                                padding: '3rem 1rem',
                                background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                                borderRadius: '12px',
                                border: '1px solid #dee2e6'
                            }}>
                                {loading && (
                                    <div className="loading-state">
                                        <div className="spinner-border text-primary" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                        <p>Searching for the perfect jobs for you...</p>
                                    </div>
                                )}
                                <div className="no-results-icon" style={{
                                    fontSize: '4rem',
                                    color: '#6c757d',
                                    marginBottom: '1.5rem'
                                }}>
                                    <i className="fas fa-search"></i>
                                </div>
                                <h4 style={{color: '#495057', marginBottom: '1rem'}}>No Jobs Found</h4>
                                <p style={{color: '#6c757d', marginBottom: '2rem', fontSize: '1.1rem'}}>
                                    Don&apos;t worry! Let&apos;s try some alternatives to help you find the perfect opportunity.
                                </p>
                                
                                <div className="suggestions-grid" style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                                    gap: '1rem',
                                    marginBottom: '2rem'
                                }}>
                                    <div className="suggestion-card" style={{
                                        background: 'white',
                                        padding: '1.5rem',
                                        borderRadius: '8px',
                                        border: '1px solid #e9ecef',
                                        textAlign: 'left'
                                    }}>
                                        <h6 style={{color: '#495057', marginBottom: '0.75rem'}}>
                                            <i className="fas fa-home text-primary me-2"></i>
                                            Try Remote Work
                                        </h6>
                                        <p style={{color: '#6c757d', fontSize: '0.9rem', marginBottom: '1rem'}}>
                                            Expand your search with remote opportunities
                                        </p>
                                        <button 
                                            className="rts-btn btn-outline-primary btn-sm w-100"
                                            onClick={() => {
                                                setSearchFilters(prev => ({ ...prev, remoteOnly: true }));
                                                searchJobs(true);
                                            }}
                                        >
                                            Search Remote Jobs
                                </button>
                                    </div>
                                    
                                    <div className="suggestion-card" style={{
                                        background: 'white',
                                        padding: '1.5rem',
                                        borderRadius: '8px',
                                        border: '1px solid #e9ecef',
                                        textAlign: 'left'
                                    }}>
                                        <h6 style={{color: '#495057', marginBottom: '0.75rem'}}>
                                            <i className="fas fa-clock text-success me-2"></i>
                                            Recent Opportunities
                                        </h6>
                                        <p style={{color: '#6c757d', fontSize: '0.9rem', marginBottom: '1rem'}}>
                                            Find jobs posted in the last week
                                        </p>
                                        <button 
                                            className="rts-btn btn-outline-success btn-sm w-100"
                                            onClick={() => {
                                                setSearchFilters(prev => ({ ...prev, datePosted: 'week' }));
                                                searchJobs(true);
                                            }}
                                        >
                                            Recent Jobs
                                        </button>
                                    </div>
                                    
                                    <div className="suggestion-card" style={{
                                        background: 'white',
                                        padding: '1.5rem',
                                        borderRadius: '8px',
                                        border: '1px solid #e9ecef',
                                        textAlign: 'left'
                                    }}>
                                        <h6 style={{color: '#495057', marginBottom: '0.75rem'}}>
                                            <i className="fas fa-globe text-info me-2"></i>
                                            Different Location
                                        </h6>
                                        <p style={{color: '#6c757d', fontSize: '0.9rem', marginBottom: '1rem'}}>
                                            Explore opportunities in other countries
                                        </p>
                                        <button 
                                            className="rts-btn btn-outline-info btn-sm w-100"
                                            onClick={() => {
                                                setSearchFilters(prev => ({ ...prev, location: 'United States' }));
                                                searchJobs(true);
                                            }}
                                        >
                                            US Jobs
                                        </button>
                                    </div>
                                    
                                    <div className="suggestion-card" style={{
                                        background: 'white',
                                        padding: '1.5rem',
                                        borderRadius: '8px',
                                        border: '1px solid #e9ecef',
                                        textAlign: 'left'
                                    }}>
                                        <h6 style={{color: '#495057', marginBottom: '0.75rem'}}>
                                            <i className="fas fa-briefcase text-warning me-2"></i>
                                            All Job Types
                                        </h6>
                                        <p style={{color: '#6c757d', fontSize: '0.9rem', marginBottom: '1rem'}}>
                                            Remove restrictions to see more options
                                        </p>
                                        <button 
                                            className="rts-btn btn-outline-warning btn-sm w-100"
                                            onClick={() => {
                                                setSearchFilters(prev => ({ 
                                                    ...prev, 
                                                    employmentType: '', 
                                                    remoteOnly: false 
                                                }));
                                                searchJobs(true);
                                            }}
                                        >
                                            Show All Jobs
                                </button>
                                    </div>
                                </div>
                            </div>
                        )}
                        {jobs.length > 0 && (
                            <>
                                {jobs.map((job) => (
                                    <div key={job.id} className="job-accordion-card" id={`job-${job.id}`}>
                                        <div className={`job-quality-indicator ${getQualityIndicator(job.quality_score)}`}></div>
                                        
                                        {/* Collapsed Header - Always Visible */}
                                        <div 
                                            className="job-accordion-header"
                                            onClick={() => toggleJobExpanded(job.id)}
                                            role="button"
                                            tabIndex={0}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' || e.key === ' ') {
                                                    e.preventDefault();
                                                    toggleJobExpanded(job.id);
                                                }
                                            }}
                                        >
                                            <div className="job-summary">
                                                <div className="job-summary-main">
                                                    <h4 className="job-title">{job.job_title}</h4>
                                                    <div className="company-name">{job.company_name}</div>
                                                    <div className="job-location">{job.location}</div>
                                                    <div className="job-type-time">
                                                        <span className="job-type">{job.employment_type}</span>
                                                        <span className="job-posted-time">{formatDate(job.posted_at)}</span>
                                                        {job.is_remote && <span className="remote-badge">Remote</span>}
                                                    </div>
                                                </div>
                                                
                                                <div className="job-summary-right">
                                                    <div className="company-logo">
                                                        {job.company_logo ? (
                                                            <img 
                                                                src={job.company_logo} 
                                                                alt={`${job.company_name} logo`}
                                                                onError={(e) => {
                                                                    e.target.style.display = 'none';
                                                                    e.target.nextSibling.style.display = 'flex';
                                                                }}
                                                            />
                                                        ) : null}
                                                        <div className="company-initial" style={{
                                                            display: job.company_logo ? 'none' : 'flex',
                                                            background: '#2563eb', // solid color instead of gradient
                                                        }}>
                                                            {job.company_name.charAt(0)}
                                                        </div>
                                                    </div>
                                                    <div className="job-actions">
                                                        <button
                                                            className={`bookmark-btn ${isJobBookmarked(job.id) ? 'bookmarked' : ''}`}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                toggleBookmark(job.id, job);
                                                            }}
                                                            title={isJobBookmarked(job.id) ? 'Remove from bookmarks' : 'Add to bookmarks'}
                                                        >
                                                            {isJobBookmarked(job.id) ? '★' : '☆'}
                                                        </button>
                                                    <div className="expand-indicator">
                                                        <i className={`fas ${isJobExpanded(job.id) ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* Salary and Benefits Preview */}
                                            <div className="job-preview-info">
                                                <div className="salary-preview">
                                                    {formatSalary(job.salary_min, job.salary_max)}
                                                </div>
                                                <div className="benefits-preview">
                                                    {job.benefits.slice(0, 2).map((benefit, index) => (
                                                        <span key={index} className="benefit-tag-small">
                                                            {benefit}
                                                        </span>
                                                    ))}
                                                    {job.benefits.length > 2 && (
                                                        <span className="benefit-tag-small more-benefits">
                                                            +{job.benefits.length - 2} more
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="apply-preview">
                                                    <a 
                                                        href={job.apply_link} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="rts-btn btn-primary apply-btn-compact"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        Apply Now
                                                    </a>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Expanded Content - Shows when clicked */}
                                        {isJobExpanded(job.id) && (
                                            <div className="job-accordion-content">
                                                <div className="job-detailed-info">
                                                    {/* Shareable Link */}
                                                    <div className="share-link-right">
                                                        <button
                                                            className="rts-btn btn-border btn-sm"
                                                            style={{ fontSize: '13px', marginBottom: '8px' }}
                                                            onClick={e => { 
                                                                e.stopPropagation(); 
                                                                handleShareJob(job);
                                                            }}
                                                        >
                                                            <i className="fas fa-share-alt me-1"></i> Share this job
                                                        </button>
                                                    </div>
                                                    {/* Job Description */}
                                                    <div className="job-section">
                                                        <h5 className="section-title">Job Description</h5>
                                                        <div className="job-description-full">
                                                            {(() => {
                                                                const desc = job.job_description || '';
                                                                const parts = desc.split(/(?=•)/g);
                                                                return parts.map((part, idx) => {
                                                                    if (part.startsWith('•')) {
                                                                        // This is a bullet point
                                                                        const bulletText = part.slice(1).trim();
                                                                        // Check if bullet text contains a period
                                                                        const periodIdx = bulletText.indexOf('.');
                                                                        if (periodIdx !== -1 && periodIdx < bulletText.length - 1) {
                                                                            // Split at the period
                                                                            const beforePeriod = bulletText.slice(0, periodIdx + 1);
                                                                            const afterPeriod = bulletText.slice(periodIdx + 1).trim();
                                                                            return (
                                                                                <Fragment key={idx}>
                                                                                    <li>{beforePeriod}</li>
                                                                                    {afterPeriod && <p>{afterPeriod}</p>}
                                                                                </Fragment>
                                                                            );
                                                                        }
                                                                        return <li key={idx}>{bulletText}</li>;
                                                                    } else {
                                                                        // This is regular text - split by semicolons
                                                                        const textParts = part.split(';').map(p => p.trim()).filter(Boolean);
                                                                        return textParts.map((textPart, textIdx) => {
                                                                            // Check if this text part comes after the last period and before bullets
                                                                            const lastPeriodIdx = textPart.lastIndexOf('.');
                                                                            if (lastPeriodIdx !== -1 && lastPeriodIdx < textPart.length - 1) {
                                                                                // Split at the last period
                                                                                const beforePeriod = textPart.slice(0, lastPeriodIdx + 1);
                                                                                const afterPeriod = textPart.slice(lastPeriodIdx + 1).trim();
                                                                                                                return (
                                    <Fragment key={`${idx}-${textIdx}`}>
                                        <p>{beforePeriod}</p>
                                        {afterPeriod && <p>{afterPeriod}</p>}
                                    </Fragment>
                                );
                                                                            }
                                                                            return <p key={`${idx}-${textIdx}`}>{textPart}</p>;
                                                                        });
                                                                    }
                                                                });
                                                            })()}
                                                        </div>
                                                    </div>

                                                    {/* Job Details Grid */}
                                                    <div className="job-section">
                                                        <h5 className="section-title">Job Details</h5>
                                                        <div className="job-details-grid">
                                                            <div className="detail-item">
                                                                <strong>Employment Type:</strong>
                                                                <span>{job.employment_type}</span>
                                                            </div>
                                                            <div className="detail-item">
                                                                <strong>Experience Level:</strong>
                                                                <span>{job.experience_level}</span>
                                                            </div>
                                                            <div className="detail-item">
                                                                <strong>Location:</strong>
                                                                <span>{job.location}</span>
                                                            </div>
                                                            <div className="detail-item">
                                                                <strong>Remote Work:</strong>
                                                                <span>{job.is_remote ? 'Yes' : 'No'}</span>
                                                            </div>
                                                            <div className="detail-item">
                                                                <strong>Posted:</strong>
                                                                <span>{formatDate(job.posted_at)}</span>
                                                            </div>
                                                            {/*
                                                            <div className="detail-item">
                                                                <strong>Job Quality:</strong>
                                                                <span className={`quality-badge ${job.quality_score}`}>
                                                                    {job.quality_score.charAt(0).toUpperCase() + job.quality_score.slice(1)}
                                                                </span>
                                                            </div>
                                                            */}
                                                        </div>
                                                    </div>

                                                    {/* Salary Information */}
                                                    <div className="job-section">
                                                        <h5 className="section-title">Compensation</h5>
                                                        <div className="salary-info">
                                                            <div className="salary-range">
                                                                <strong>Salary Range:</strong> {formatSalary(job.salary_min, job.salary_max)}
                                                            </div>
                                                            <div className="salary-estimate-full">
                                                                <small>
                                                                    <i className="fas fa-chart-line"></i>
                                                                    Market-based estimate
                                                                    <span className="confidence-badge" title="Data Confidence">
                                                                        ✓
                                                                    </span>
                                                                </small>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Benefits */}
                                                    {job.benefits && job.benefits.length > 0 && (
                                                        <div className="job-section">
                                                            <h5 className="section-title">Benefits & Perks</h5>
                                                            <div className="benefits-grid">
                                                                {job.benefits.map((benefit, index) => (
                                                                    <div key={index} className="benefit-item">
                                                                        <i className="fas fa-check-circle"></i>
                                                                        <span>{benefit}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Job Highlights */}
                                                    {job.job_highlights && Object.keys(job.job_highlights).length > 0 && (
                                                        <div className="job-section">
                                                            <h5 className="section-title">Job Highlights</h5>
                                                            <div className="highlights-grid">
                                                                {Object.entries(job.job_highlights).map(([key, values]) => (
                                                                    values && values.length > 0 && (
                                                                        <div key={key} className="highlight-category">
                                                                            <h6 className="highlight-title">
                                                                                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                                                            </h6>
                                                                            <ul className="highlight-list">
                                                                                {values.slice(0, 5).map((item, index) => (
                                                                                    <li key={index}>{item}</li>
                                                                                ))}
                                                                            </ul>
                                                                        </div>
                                                                    )
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Apply Section */}
                                                    <div className="job-section apply-section">
                                                        <div className="apply-info">
                                                            <h5 className="section-title">Ready to Apply?</h5>
                                                            <p>Click the button below to apply directly on the company&apos;s website.</p>
                                                        </div>
                                                        <a 
                                                            href={job.apply_link} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="rts-btn btn-primary apply-btn-full"
                                                        >
                                                            <i className="fas fa-external-link-alt"></i>
                                                            Apply on Company Website
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </>
                        )}

                                {hasMore && (
                                    <div className="load-more-section">
                                        <button 
                                            className="rts-btn btn-border load-more-btn"
                                            onClick={loadMoreJobs}
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                    Loading More Jobs...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="fas fa-plus me-2"></i>
                                                    Load More Jobs
                                                </>
                                            )}
                                        </button>
                                    </div>
                        )}
                    </div>
                </div>
            </div>

            <FooterOneDynamic />
            <BackToTop />
            
            {/* Share Job Modal */}
            <ShareJobModal 
                isOpen={shareModalOpen}
                onClose={handleCloseShareModal}
                job={selectedJobForShare}
            />
        </>
    );
}
