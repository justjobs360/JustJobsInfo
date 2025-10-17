"use client";
import React, { useState, useEffect } from 'react';
import BackToTop from "@/components/common/BackToTop";
import Breadcrumb from "@/components/common/Breadcrumb";
import HeaderOne from "@/components/header/HeaderOne";
import FooterOneDynamic from "@/components/footer/FooterOneDynamic";
import './important-links.css';

export default function ImportantLinksPage() {
    const [resourceCategories, setResourceCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchImportantLinks = async () => {
        try {
            setLoading(true);
            setError(null);
            
            console.log('📡 Fetching important links from API...');
            const response = await fetch('/api/important-links');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (result.success) {
                console.log('✅ Successfully fetched important links:', result.data.length);
                setResourceCategories(result.data);
            } else {
                throw new Error(result.message || 'Failed to fetch important links');
            }
        } catch (error) {
            console.error('❌ Error fetching important links:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchImportantLinks();
    }, []);

    if (loading) {
        return (
            <>
                <HeaderOne />
                <div className="important-links-page rts-section-gap">
                    <div className="container">
                        <div className="page-header text-center mb--50">
                            <h1 className="title">Important Links</h1>
                            <p className="subtitle">Curated resources to help you succeed in your job search</p>
                        </div>
                        <div style={{ textAlign: 'center', padding: '40px' }}>
                            <div className="loading-spinner"></div>
                            <p style={{ marginTop: '16px' }}>Loading important links...</p>
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
                <div className="important-links-page rts-section-gap">
                    <div className="container">
                        <div className="page-header text-center mb--50">
                            <h1 className="title">Important Links</h1>
                            <p className="subtitle">Curated resources to help you succeed in your job search</p>
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
            <div className="important-links-page rts-section-gap">
                <div className="container">
                    <div className="page-header text-center mb--50">
                        <h1 className="title">Important Links</h1>
                        <p className="subtitle">Curated resources to help you succeed in your job search</p>
                    </div>

                    <div className="resource-categories">
                        {resourceCategories.map((category, index) => (
                            <div key={category._id || index} className="category-section mb--30">
                                <h2 className="category-title">{category.title}</h2>
                                <p className="category-description">{category.subtitle}</p>
                                
                                <div className="links-grid">
                                    {category.links && category.links.map((link, linkIndex) => (
                                        <a 
                                            key={linkIndex}
                                            href={link.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="resource-link"
                                        >
                                            <h3 className="link-title">{link.name}</h3>
                                            <p className="link-description">{link.description}</p>
                                        </a>
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
