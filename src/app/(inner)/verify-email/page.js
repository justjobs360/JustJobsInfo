"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { auth } from '@/config/firebase';
import { applyActionCode, checkActionCode } from 'firebase/auth';
import toast from 'react-hot-toast';
import BackToTop from "@/components/common/BackToTop";
import HeaderOne from "@/components/header/HeaderOne";
import FooterOneDynamic from "@/components/footer/FooterOneDynamic";
import Link from 'next/link';

export default function VerifyEmailPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [verificationStatus, setVerificationStatus] = useState('verifying'); // 'verifying', 'success', 'error', 'unverified'
    const [errorMessage, setErrorMessage] = useState('');
    const [unverifiedEmail, setUnverifiedEmail] = useState('');
    const [isResending, setIsResending] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    useEffect(() => {
        const handleEmailVerification = async () => {
            // Check if user is unverified (redirected from login or just registered)
            const isUnverified = searchParams.get('unverified');
            if (isUnverified) {
                const email = sessionStorage.getItem('unverifiedEmail');
                setUnverifiedEmail(email);
                setVerificationStatus('unverified');
                return;
            }

            try {
                // Get the oobCode from URL parameters
                const oobCode = searchParams.get('oobCode');
                
                if (!oobCode) {
                    setVerificationStatus('error');
                    setErrorMessage('Invalid verification link. Please check your email for the correct link.');
                    console.error('No oobCode found in URL parameters:', window.location.search);
                    return;
                }

                console.log('Processing verification with oobCode:', oobCode.substring(0, 20) + '...');

                // Apply the verification code
                await applyActionCode(auth, oobCode);
                
                console.log('Email verification successful');
                setVerificationStatus('success');
                toast.success('Email verified successfully! You can now login.');
                
                // Redirect to login after 3 seconds
                setTimeout(() => {
                    router.push('/login');
                }, 3000);

            } catch (error) {
                console.error('Email verification error:', error);
                setVerificationStatus('error');
                
                let errorMsg = 'Email verification failed. Please try again.';
                
                switch (error.code) {
                    case 'auth/invalid-action-code':
                        errorMsg = 'Invalid or expired verification link. Please request a new one.';
                        break;
                    case 'auth/user-disabled':
                        errorMsg = 'This account has been disabled. Please contact support.';
                        break;
                    case 'auth/user-not-found':
                        errorMsg = 'User not found. Please register again.';
                        break;
                    case 'auth/expired-action-code':
                        errorMsg = 'Verification link has expired. Please request a new one.';
                        break;
                    case 'auth/email-already-verified':
                        errorMsg = 'Your email is already verified. You can now login.';
                        // If already verified, redirect to login after a short delay
                        setTimeout(() => {
                            router.push('/login');
                        }, 2000);
                        break;
                    default:
                        errorMsg = error.message || 'Email verification failed. Please try again.';
                }
                
                setErrorMessage(errorMsg);
                toast.error(errorMsg);
            }
        };

        handleEmailVerification();
    }, [searchParams, router]);

    const handleResendVerification = async () => {
        if (!unverifiedEmail) {
            toast.error('No email found. Please try logging in again.');
            return;
        }

        try {
            setIsResending(true);
            
            // Import Firebase Auth functions
            const { getAuth, sendEmailVerification, signInWithEmailAndPassword, signOut } = await import('firebase/auth');
            
            // Get auth instance
            const auth = getAuth();
            
            // We need to temporarily sign in the user to send verification email
            // This is a limitation of Firebase - verification emails can only be sent for the currently signed-in user
            
            // For this to work, we'd need the user's password, which we don't have
            // So we'll fall back to the server-side approach which generates a new verification link
            
            const response = await fetch('/api/auth/resend-verification', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: unverifiedEmail }),
            });

            const data = await response.json();

            if (data.success) {
                toast.success('Verification email sent! Please check your inbox and spam folder.');
                setEmailSent(true);
                
                // Show debug info in development
                if (process.env.NODE_ENV === 'development' && data.debug?.verificationLink) {
                    console.log('🔗 Verification Link (Development Only):', data.debug.verificationLink);
                }
            } else {
                toast.error(data.error || 'Failed to send verification email.');
            }
        } catch (error) {
            console.error('Error resending verification:', error);
            toast.error('Failed to send verification email. Please try again.');
        } finally {
            setIsResending(false);
        }
    };

    const renderContent = () => {
        switch (verificationStatus) {
            case 'verifying':
                return (
                    <div className="verification-content">
                        <div className="loading-spinner"></div>
                        <h2>Verifying Your Email</h2>
                        <p>Please wait while we verify your email address...</p>
                    </div>
                );
            
            case 'unverified':
                return (
                    <div className="verification-content">
                        <div className="warning-icon">⚠️</div>
                        <h2>Email Verification Required</h2>
                        <p>Your email address ({unverifiedEmail}) has not been verified yet.</p>
                        <p>We&apos;ve sent a verification email to your inbox. Please check your email and click the verification link.</p>
                        <p>If you didn&apos;t receive the email, you can request a new one below.</p>
                        <div className="action-buttons">
                            <button 
                                onClick={handleResendVerification}
                                disabled={isResending}
                                className="rts-btn btn-primary"
                                style={{
                                    opacity: isResending ? 0.7 : 1,
                                    cursor: isResending ? 'not-allowed' : 'pointer',
                                    marginBottom: '10px'
                                }}
                            >
                                {isResending ? 'Sending...' : (emailSent ? 'Email Sent!' : 'Resend Verification Email')}
                                {!isResending && (
                                    <img
                                        className="injectable"
                                        src="/assets/images/service/icons/13.svg"
                                        alt="arrow"
                                    />
                                )}
                            </button>
                            {emailSent && (
                                <p style={{ color: '#28a745', fontSize: '14px', marginTop: '10px' }}>
                                    ✅ Verification email sent! Please check your inbox and spam folder.
                                </p>
                            )}
                            <Link href="/login" className="login-link" style={{ marginTop: '20px' }}>
                                Go to Login
                            </Link>
                        </div>
                    </div>
                );
            
            case 'success':
                return (
                    <div className="verification-content">
                        <div className="success-icon">✅</div>
                        <h2>Email Verified Successfully!</h2>
                        <p>Your email has been verified. You can now login to your account.</p>
                        <p>Redirecting to login page...</p>
                        <Link href="/login" className="login-link" style={{ marginTop: '20px' }}>
                            Go to Login
                        </Link>
                    </div>
                );
            
            case 'error':
                return (
                    <div className="verification-content">
                        <div className="error-icon">❌</div>
                        <h2>Verification Failed</h2>
                        <p>{errorMessage}</p>
                        <div className="action-buttons">
                            <Link href="/register" className="btn-secondary">
                                Register Again
                            </Link>
                            <Link href="/login" className="login-link" style={{ marginTop: '20px' }}>
                                Go to Login
                            </Link>
                        </div>
                    </div>
                );
            
            default:
                return null;
        }
    };

    return (
        <>
            <HeaderOne />
            <div className="verify-email-page-wrapper">
                <div className="container-fluid p-0">
                    <div className="row g-0">
                        <div className="col-lg-12">
                            <div className="verify-form-wrapper">
                                <div className="verify-header text-center">
                                    <Link href="/" className="logo-area">
                                        <img className='header-logo' src="/assets/images/logo/justjobslogo.png" alt="logo" />
                                    </Link>
                                    <h2 className="title">Email Verification</h2>
                                    <p className="subtitle">Complete your account verification</p>
                                </div>
                                
                                <div className="verify-content">
                                    {renderContent()}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <FooterOneDynamic />
            <BackToTop />

            <style jsx>{`
                .verify-email-page-wrapper {
                    min-height: 90vh;
                    display: flex;
                    align-items: center;
                    background-color: #f8f9fa;
                }
                
                .verify-form-wrapper {
                    background: #fff;
                    padding: 40px;
                    height: auto;
                    min-height: 70vh;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    max-width: 450px;
                    margin: 0 auto;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1), 0 4px 10px rgba(0, 0, 0, 0.05), 0 -4px 10px rgba(0, 0, 0, 0.05);
                    border-radius: 12px;
                    transition: all 0.3s ease;
                }
                
                .verify-form-wrapper:hover {
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15), 0 8px 20px rgba(0, 0, 0, 0.1);
                    transform: translateY(-5px);
                }
                
                .verify-header {
                    margin-bottom: 40px;
                }
                
                .verify-header .header-logo {
                    width: 160px;
                    height: auto;
                    margin-bottom: 30px;
                }
                
                .verify-header .title {
                    font-size: 32px;
                    font-weight: 500;
                    margin-bottom: 15px;
                    color: #262626;
                }
                
                .verify-header .subtitle {
                    color: #6D6D6D;
                    font-size: 16px;
                }
                
                .verify-content {
                    max-width: 400px;
                    margin: 0 auto;
                    width: 100%;
                }
                
                .verification-content {
                    text-align: center;
                    padding: 20px 0;
                }
                
                .loading-spinner {
                    width: 50px;
                    height: 50px;
                    border: 4px solid #f3f3f3;
                    border-top: 4px solid #6B6B8A;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 20px;
                }
                
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                
                .success-icon, .error-icon, .warning-icon {
                    font-size: 48px;
                    margin-bottom: 20px;
                }
                
                .verification-content h2 {
                    font-size: 24px;
                    font-weight: 500;
                    color: #262626;
                    margin-bottom: 15px;
                }
                
                .verification-content p {
                    color: #6D6D6D;
                    margin-bottom: 20px;
                    line-height: 1.6;
                    font-size: 16px;
                }
                
                .action-buttons {
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                    justify-content: center;
                    align-items: center;
                    margin-top: 30px;
                }
                
                .rts-btn {
                    padding: 17px 15px;
                    background: var(--color-primary);
                    gap: 31px;
                    height: 48px;
                    position: relative;
                    overflow: hidden;
                    border: 1px solid var(--color-primary);
                    color: white;
                    text-decoration: none;
                    font-weight: 500;
                    transition: all 0.3s ease;
                    cursor: pointer;
                    font-size: 16px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    min-width: 140px;
                    border-radius: 0;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                }
                
                .rts-btn:hover {
                    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
                    transform: translateY(-2px);
                }
                
                .rts-btn::before {
                    content: "";
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    transition: opacity 0.5s, border 0.5s;
                }
                
                .rts-btn::after {
                    content: "";
                    position: absolute;
                    top: 1%;
                    left: 0%;
                    width: 200px;
                    height: 200px;
                    background-color: #fff;
                    border-color: transparent;
                    border-radius: 50%;
                    transform: translate(-10px, -70px) scale(0.1);
                    opacity: 0;
                    z-index: -1;
                    transition: transform 0.5s, opacity 0.5s, background-color 0.5s;
                }
                
                .rts-btn:hover {
                    color: var(--color-primary);
                }
                
                .rts-btn:hover::before {
                    opacity: 0;
                }
                
                .rts-btn:hover::after {
                    opacity: 1;
                    transform: scaleX(1.5) scaleY(1.5);
                }
                
                .rts-btn img {
                    max-width: 22px;
                    height: auto;
                }
                
                .rts-btn img.injectable {
                    max-width: 22px;
                    height: auto;
                }
                
                .rts-btn:hover img.injectable {
                    filter: brightness(0) saturate(100%) invert(27%) sepia(51%) saturate(2878%) hue-rotate(346deg) brightness(104%) contrast(97%);
                }
                
                .btn-secondary {
                    background: #6c757d;
                    color: white;
                    padding: 17px 15px;
                    border: 1px solid #6c757d;
                    border-radius: 0;
                    text-decoration: none;
                    font-weight: 500;
                    transition: all 0.3s ease;
                    cursor: pointer;
                    font-size: 16px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    min-width: 140px;
                    height: 48px;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                }
                
                .btn-secondary:hover {
                    background: #545b62;
                    border-color: #545b62;
                    color: white;
                    transform: translateY(-2px);
                    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
                }
                
                .login-link {
                    color: #6B6B8A;
                    text-decoration: none;
                    font-weight: 500;
                    font-size: 16px;
                    transition: all 0.3s ease;
                    display: inline-block;
                }
                
                .login-link:hover {
                    color: #5a5a7a;
                    text-decoration: underline;
                    transform: translateY(-1px);
                }
                
                @media only screen and (max-width: 991px) {
                    .verify-form-wrapper {
                        height: auto;
                        min-height: 90vh;
                    }
                    
                    .verify-header .title {
                        font-size: 28px;
                    }
                }
                
                @media (max-width: 768px) {
                    .verify-form-wrapper {
                        padding: 30px 20px;
                        margin: 20px;
                    }
                    
                    .verify-header .title {
                        font-size: 24px;
                    }
                    
                    .action-buttons {
                        flex-direction: column;
                        align-items: center;
                    }
                    
                    .rts-btn, .btn-secondary {
                        width: 100%;
                        max-width: 200px;
                    }
                }
            `}</style>
        </>
    );
} 
