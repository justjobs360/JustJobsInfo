\"use client\";
import React, { useState } from 'react';
import Image from 'next/image';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/config/firebase';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import BackToTop from "@/components/common/BackToTop";
import Breadcrumb from "@/components/common/Breadcrumb";
import HeaderOne from "@/components/header/HeaderOne";
import FooterOneDynamic from "@/components/footer/FooterOneDynamic";
import Link from 'next/link';
import './forgot-password.css';

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!auth) {
            toast.error('Authentication service is not available');
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            toast.error('Please enter a valid email address!');
            return;
        }

        setLoading(true);

        try {
            await sendPasswordResetEmail(auth, email);
            toast.success('Password reset email sent! Please check your inbox.');
            router.push('/login');
        } catch (error) {
            let errorMessage = 'An error occurred while sending the reset email';
            
            switch (error.code) {
                case 'auth/invalid-email':
                    errorMessage = 'Please enter a valid email address';
                    break;
                case 'auth/user-not-found':
                    errorMessage = 'No account found with this email';
                    break;
                case 'auth/too-many-requests':
                    errorMessage = 'Too many attempts. Please try again later';
                    break;
                default:
                    errorMessage = error.message;
            }
            
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <HeaderOne />
            <Breadcrumb />
            <div className="forgot-password-page-wrapper">
                <div className="container-fluid p-0">
                    <div className="row g-0">
                        <div className="col-lg-7">
                            <div className="forgot-password-form-wrapper">
                                <div className="forgot-password-header text-center">
                                    <Link href="/" className="logo-area">
                                        <Image
                                            className="header-logo"
                                            src="/assets/images/logo/justjobslogo.png"
                                            alt="logo"
                                            width={160}
                                            height={50}
                                        />
                                    </Link>
                                    <h2 className="title">Reset Your Password</h2>
                                    <p className="subtitle">Enter your email address and we&apos;ll send you a link to reset your password</p>
                                </div>

                                <form onSubmit={handleSubmit} className="forgot-password-form">
                                    <div className="form-group">
                                        <input
                                            type="email"
                                            placeholder="Email Address"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            disabled={loading}
                                        />
                                    </div>

                                    <button 
                                        type="submit" 
                                        className="rts-btn btn-primary"
                                        disabled={loading}
                                    >
                                        {loading ? 'Sending...' : 'Send Reset Link'}
                                        <img
                                            className="injectable"
                                            src="/assets/images/service/icons/13.svg"
                                            alt="arrow"
                                        />
                                    </button>

                                    <div className="back-to-login text-center">
                                        Remember your password? <Link href="/login">Back to Login</Link>
                                    </div>
                                </form>
                            </div>
                        </div>
                        <div className="col-lg-5">
                            <div className="forgot-password-image-wrapper">
                                <img
                                    src="/assets/images/banner/01.webp"
                                    alt="Forgot Password"
                                    className="forgot-password-image"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <BackToTop />
            <FooterOneDynamic />
        </>
    );
} 
