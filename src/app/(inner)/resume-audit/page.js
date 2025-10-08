"use client";
import React, { useState } from 'react';
import BackToTop from "@/components/common/BackToTop";
import HeaderOne from "@/components/header/HeaderOne";
import FooterOneDynamic from "@/components/footer/FooterOneDynamic";
import ResumeUpload from "@/components/resume-audit/ResumeUpload";
import AuditResults from "@/components/resume-audit/AuditResults";
import HowItWorks from "@/components/resume-audit/HowItWorks";
import CtaOne from "@/components/cta/CtaOne";
import { CVAuditService } from '@/utils/cvAuditService';
import { useAuth } from '@/contexts/AuthContext';
import DynamicMetaTags from "@/components/common/DynamicMetaTags";
import './resume-audit.css';

export default function ResumeAuditPage() {
    const { user } = useAuth();
    const [auditData, setAuditData] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');

    const handleFileUploaded = async (fileData) => {
        setIsProcessing(true);
        setError('');
        
        try {
            // Validate file using utility service
            const validationErrors = CVAuditService.validateFile(fileData.file);
            if (validationErrors.length > 0) {
                setError(validationErrors[0]);
                return;
            }

            // Call the CV audit API using utility service with user for authentication
            const result = await CVAuditService.auditCV(fileData.file, user);

            if (result.success) {
                setAuditData(result.data);
            } else {
                setError(result.error || 'Failed to analyze resume. Please try again.');
            }
        } catch (error) {
            console.error('CV audit error:', error);
            
            // Provide more specific error messages
            if (error.message.includes('network') || error.message.includes('fetch')) {
                setError('Network error. Please check your connection and try again.');
            } else if (error.message.includes('timeout')) {
                setError('Request timed out. Please try again with a smaller file.');
            } else if (error.message.includes('500')) {
                setError('Server error. Please try again later or contact support if the issue persists.');
            } else {
                setError(error.message || 'Failed to analyze resume. Please try again.');
            }
        } finally {
            setIsProcessing(false);
        }
    };

    const handleNewAudit = () => {
        setAuditData(null);
        setError('');
    };

    return (
        <DynamicMetaTags pageName="Resume Audit">
            <HeaderOne />
            <div className="resume-audit-page">
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
                    <div className="audit-main-content">
                        {!auditData ? (
                            <>
                                <ResumeUpload 
                                    onFileUploaded={handleFileUploaded}
                                    isProcessing={isProcessing}
                                />
                                {!isProcessing && <HowItWorks />}
                            </>
                        ) : (
                            <AuditResults 
                                auditData={auditData}
                                onNewAudit={handleNewAudit}
                            />
                        )}
                    </div>
                </div>
            </div>
            <CtaOne />
            <BackToTop />
            <FooterOneDynamic />
        </DynamicMetaTags>
    );
}
