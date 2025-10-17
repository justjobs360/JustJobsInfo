"use client";
import React, { useState, useEffect } from 'react';
import BackToTop from "@/components/common/BackToTop";
import Breadcrumb from "@/components/common/Breadcrumb";
import HeaderOne from "@/components/header/HeaderOne";
import FooterOneDynamic from "@/components/footer/FooterOneDynamic";
import './downloadable-resources.css';

export default function DownloadableResourcesPage() {
    const [resourceCategories, setResourceCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchDownloadableResources = async () => {
        try {
            setLoading(true);
            setError(null);
            
            console.log('📡 Fetching downloadable resources from API...');
            const response = await fetch('/api/downloadable-resources');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (result.success) {
                console.log('✅ Successfully fetched downloadable resources:', result.data.length);
                setResourceCategories(result.data);
            } else {
                throw new Error(result.message || 'Failed to fetch downloadable resources');
            }
        } catch (error) {
            console.error('❌ Error fetching downloadable resources:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDownloadableResources();
    }, []);

    if (loading) {
        return (
            <>
                <HeaderOne />
                <div className="downloadable-resources-page rts-section-gap">
                    <div className="container">
                        <div className="page-header text-center mb--50">
                            <h1 className="title">Downloadable Resources</h1>
                            <p className="subtitle">Access our collection of free resources to help you succeed in your job search</p>
                        </div>
                        <div style={{ textAlign: 'center', padding: '40px' }}>
                            <div className="loading-spinner"></div>
                            <p style={{ marginTop: '16px' }}>Loading downloadable resources...</p>
                        </div>
                    </div>
                </div>
                <BackToTop />
                <FooterOneDynamic />
            </>
        );
    }

    if (error) {
        return (
            <>
                <HeaderOne />
                <div className="downloadable-resources-page rts-section-gap">
                    <div className="container">
                        <div className="page-header text-center mb--50">
                            <h1 className="title">Downloadable Resources</h1>
                            <p className="subtitle">Access our collection of free resources to help you succeed in your job search</p>
                        </div>
                        <div style={{ 
                            textAlign: 'center', 
                            padding: '40px',
                            backgroundColor: '#f8d7da',
                            color: '#721c24',
                            border: '1px solid #f5c6cb',
                            borderRadius: '4px'
                        }}>
                            <strong>Error:</strong> {error}
                        </div>
                    </div>
                </div>
                <BackToTop />
                <FooterOneDynamic />
            </>
        );
    }

    return (
        <>
            <HeaderOne />
            <Breadcrumb />
            <div className="downloadable-resources-page rts-section-gap">
                <div className="container">
                    <div className="page-header text-center mb--50">
                        <h1 className="title">Downloadable Resources</h1>
                        <p className="subtitle">Access our collection of free resources to help you succeed in your job search</p>
                    </div>

                    <div className="resource-categories">
                        {resourceCategories.map((category, index) => (
                            <div key={category._id || index} className="category-section mb--30">
                                <h2 className="category-title">{category.title}</h2>
                                <p className="category-description">{category.subtitle}</p>

                                <div className="resources-grid">
                                    {category.resources && category.resources.map((resource, resourceIndex) => (
                                        <div key={resourceIndex} className="resource-card">
                                            <div className="resource-icon">
                                                <img src={resource.icon} alt={resource.format} />
                                            </div>
                                            <div className="resource-content">
                                                <h3 className="resource-title">{resource.name}</h3>
                                                <p className="resource-description">{resource.description}</p>
                                                <div className="resource-meta">
                                                    <span className="format-badge">{resource.format}</span>
                                                    <a 
                                                        href={resource.downloadUrl}
                                                        className="download-btn"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        Download
                                                        <img 
                                                            src="/assets/images/service/icons/13.svg" 
                                                            alt="download"
                                                            className="injectable"
                                                        />
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <BackToTop />
            <FooterOneDynamic />
        </>
    );
}
