"use client";
import React, { useState, useEffect } from 'react';
import BackToTop from "@/components/common/BackToTop";
import HeaderOne from "@/components/header/HeaderOne";
import FooterOneDynamic from "@/components/footer/FooterOneDynamic";
import JobFitHistory from "@/components/job-fit/JobFitHistory";
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import DynamicMetaTags from "@/components/common/DynamicMetaTags";
import './account.css';

export default function AccountPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('job-fit');

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <DynamicMetaTags pageName="My Account">
                <HeaderOne />
                <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ 
                            display: 'inline-block',
                            width: '50px',
                            height: '50px',
                            border: '5px solid #f3f3f3',
                            borderTop: '5px solid var(--color-primary)',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite'
                        }}></div>
                        <p style={{ marginTop: '20px', color: 'var(--color-body)' }}>Loading...</p>
                    </div>
                </div>
                <FooterOneDynamic />
            </DynamicMetaTags>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <DynamicMetaTags pageName="My Account">
            <HeaderOne />
            <div className="account-page">
                <div className="container">
                    {/* Page Header */}
                    <div className="page-header" style={{ 
                        paddingTop: '60px', 
                        paddingBottom: '40px',
                        borderBottom: '1px solid #e9ecef',
                        marginBottom: '40px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '16px' }}>
                            <div style={{
                                width: '60px',
                                height: '60px',
                                borderRadius: '50%',
                                background: 'var(--color-primary)',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '24px',
                                fontWeight: '600'
                            }}>
                                {user.email?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <div>
                                <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--color-heading-1)', margin: '0 0 8px 0' }}>
                                    My Account
                                </h1>
                                <p style={{ fontSize: '16px', color: 'var(--color-body)', margin: 0 }}>
                                    {user.email}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Tab Navigation */}
                    <div className="account-tabs" style={{ marginBottom: '40px' }}>
                        <div style={{ 
                            display: 'flex', 
                            gap: '12px', 
                            borderBottom: '2px solid #e9ecef',
                            flexWrap: 'wrap'
                        }}>
                            <button
                                onClick={() => setActiveTab('job-fit')}
                                style={{
                                    padding: '8px 16px',
                                    border: 'none',
                                    background: activeTab === 'job-fit' ? 'var(--color-primary)' : 'transparent',
                                    color: activeTab === 'job-fit' ? 'white' : 'var(--color-body)',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                    fontWeight: '500',
                                    transition: 'all 0.3s ease',
                                    marginBottom: '-2px',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                📊 Job Fit History
                            </button>
                        </div>
                    </div>

                    {/* Tab Content */}
                    <div className="tab-content" style={{ paddingBottom: '60px' }}>
                        {activeTab === 'job-fit' && (
                            <div>
                                <JobFitHistory embedded={false} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <BackToTop />
            <FooterOneDynamic />

            <style jsx>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </DynamicMetaTags>
    );
}

