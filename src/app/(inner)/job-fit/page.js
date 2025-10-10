"use client";
import React, { useState } from 'react';
import BackToTop from "@/components/common/BackToTop";
import HeaderOne from "@/components/header/HeaderOne";
import FooterOneDynamic from "@/components/footer/FooterOneDynamic";
import JobFitUpload from "@/components/job-fit/JobFitUpload";
import JobFitResults from "@/components/job-fit/JobFitResults";
import HowItWorks from "@/components/job-fit/HowItWorks";
import JobFitHistory from "@/components/job-fit/JobFitHistory";
import CtaOne from "@/components/cta/CtaOne";
import { JobFitService } from '@/utils/jobFitService';
import { useAuth } from '@/contexts/AuthContext';
import DynamicMetaTags from "@/components/common/DynamicMetaTags";
import './job-fit.css';

export default function JobFitPage() {
    const { user } = useAuth();
    const [analysisData, setAnalysisData] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');
    const [resetKey, setResetKey] = useState(0);

    const handleAnalysisSubmit = async (formData) => {
        setIsProcessing(true);
        setError('');
        
        try {
            // Validate file
            if (!formData.resumeFile) {
                setError('Please upload a resume file');
                return;
            }

            // Call the job fit analysis API using utility service with user for authentication
            const result = await JobFitService.analyzeJobFit(formData, user);

            if (result.success) {
                setAnalysisData(result.data);
            } else {
                setError(result.error || 'Failed to analyze job fit. Please try again.');
            }
        } catch (error) {
            console.error('Job fit analysis error:', error);
            
            // Provide more specific error messages
            if (error.message.includes('network') || error.message.includes('fetch')) {
                setError('Network error. Please check your connection and try again.');
            } else if (error.message.includes('timeout')) {
                setError('Request timed out. Please try again with a smaller file.');
            } else if (error.message.includes('500')) {
                setError('Server error. Please try again later or contact support if the issue persists.');
            } else {
                setError(error.message || 'Failed to analyze job fit. Please try again.');
            }
        } finally {
            setIsProcessing(false);
        }
    };

    const handleNewAnalysis = () => {
        setAnalysisData(null);
        setError('');
        setResetKey(prev => prev + 1); // Increment reset key to trigger form reset
    };

    return (
        <DynamicMetaTags pageName="Job Fit Analysis">
            <HeaderOne />
            <div className="job-fit-page">
                <div className="container">
                   

                    {/* Error Display */}
                    {error && (
                        <div className="error-message" style={{
                            background: 'rgba(220, 53, 69, 0.1)',
                            color: '#dc3545',
                            padding: '15px 20px',
                            borderRadius: '8px',
                            border: '1px solid rgba(220, 53, 69, 0.2)',
                            marginBottom: '30px',
                            textAlign: 'center',
                            fontWeight: '500'
                        }}>
                            ⚠️ {error}
                        </div>
                    )}

                    {/* Main Content */}
                    <div className="analysis-main-content">
                        {!analysisData ? (
                            <>
                                <JobFitUpload 
                                    key={resetKey}
                                    onAnalysisSubmit={handleAnalysisSubmit}
                                    isProcessing={isProcessing}
                                />
                                {!isProcessing && <HowItWorks />}
                            </>
                        ) : (
                            <JobFitResults 
                                analysisData={analysisData}
                                onNewAnalysis={handleNewAnalysis}
                            />
                        )}
                    </div>

                    {/* History Section - Only show when not processing and not showing results */}
                    {!isProcessing && !analysisData && user && (
                        <div style={{ marginTop: '60px', marginBottom: '40px' }}>
                            <JobFitHistory embedded={true} />
                        </div>
                    )}
                </div>
            </div>
            <CtaOne />
            <BackToTop />
            <FooterOneDynamic />
        </DynamicMetaTags>
    );
}
