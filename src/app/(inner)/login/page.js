\"use client\";
import React, { useState } from 'react';
import Image from 'next/image';
import { signInWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { auth } from '@/config/firebase';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import BackToTop from "@/components/common/BackToTop";
import Breadcrumb from "@/components/common/Breadcrumb";
import HeaderOne from "@/components/header/HeaderOne";
import FooterOneDynamic from "@/components/footer/FooterOneDynamic";
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import './login.css';

export default function LoginPage() {
    const router = useRouter();
    const { isAuthenticated } = useAuth();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        agreeToTerms: false
    });

    // Redirect if already authenticated
    React.useEffect(() => {
        if (isAuthenticated) {
            router.push('/');
        }
    }, [isAuthenticated, router]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };
 
    const handleSubmit = async (e) => {
      e.preventDefault();

        if (!auth) {
            toast.error('Authentication service is not available');
            return;
        }

        // Check terms of use agreement
        if (!formData.agreeToTerms) {
            toast.error('You must agree to the Terms of Use to login');
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            toast.error('Please enter a valid email address!');
            return;
        }

        // Validate password
        if (formData.password.length < 6) {
            toast.error('Password must be at least 6 characters long!');
            return;
        }

        setLoading(true);

      try {
        const userCredential = await signInWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        );

        // Check if email is verified
        if (!userCredential.user.emailVerified) {
          // Sign out the user since they're not verified
          await auth.signOut();
          
          // Show a more user-friendly message with options
          toast.error('Please verify your email before logging in. Check your inbox for the verification link.');
          
          // Store email for potential resend
          sessionStorage.setItem('unverifiedEmail', formData.email);
          
          // Redirect to a verification page or show modal
          router.push('/verify-email?unverified=true');
          return;
        }
            
        toast.success('Successfully logged in!');
        router.push('/'); // or your desired redirect path
      } catch (error) {
            let errorMessage = 'An error occurred during login';
            
            switch (error.code) {
                case 'auth/invalid-email':
                    errorMessage = 'Please enter a valid email address';
                    break;
                case 'auth/user-disabled':
                    errorMessage = 'This account has been disabled';
                    break;
                case 'auth/user-not-found':
                    errorMessage = 'No account found with this email';
                    break;
                case 'auth/wrong-password':
                    errorMessage = 'Incorrect password';
                    break;
                case 'auth/too-many-requests':
                    errorMessage = 'Too many failed attempts. Please try again later';
                    break;
                default:
                    errorMessage = error.message;
            }
            
            toast.error(errorMessage);
        } finally {
            setLoading(false);
      }
    };

    // Don't render the login form if user is already authenticated
    if (isAuthenticated) {
        return null;
    }

    return (
        <>
            <HeaderOne />
            <Breadcrumb />
            <div className="login-page-wrapper">
                <div className="container-fluid p-0">
                    <div className="row g-0">
                        <div className="col-lg-7">
                            <div className="login-form-wrapper">
                                <div className="login-header text-center">
                                    <Link href="/" className="logo-area">
                                        <Image
                                            className="header-logo"
                                            src="/assets/images/logo/justjobslogo.png"
                                            alt="logo"
                                            width={160}
                                            height={50}
                                        />
                                    </Link>
                                    <h2 className="title">Welcome Back</h2>
                                    <p className="subtitle">Please enter your credentials to login</p>
                                </div>

                                <form onSubmit={handleSubmit} className="login-form">
                                    <div className="form-group">
                                        <input
                                            type="email"
                                            name="email"
                                            placeholder="Email Address"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            disabled={loading}
                                        />
                                    </div>
                                    <div className="form-group password-group">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            placeholder="Password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            required
                                            disabled={loading}
                                        />
                                        <span 
                                            className="password-toggle"
                                            onClick={togglePasswordVisibility}
                                        >
                                            {showPassword ? "👁️" : "👁️‍🗨️"}
                                        </span>
                                    </div>

                                    <div className="form-options">
                                        <label className="custom-checkbox remember-me">
                                            <input type="checkbox" id="remember" disabled={loading} />
                                            <span className="checkmark"></span>
                                            <span>Remember me</span>
                                        </label>
                                        <Link href="/forgot-password" className="forgot-password">
                                            Forgot Password?
                                        </Link>
                                    </div>

                                    <div className="form-group">
                                        <label className="custom-checkbox terms-agreement">
                                            <input 
                                                type="checkbox" 
                                                name="agreeToTerms"
                                                checked={formData.agreeToTerms}
                                                onChange={handleChange}
                                                disabled={loading} 
                                                required
                                            />
                                            <span className="checkmark"></span>
                                            <span>I agree to the <Link href="/terms-of-use">Terms of Use</Link> and <Link href="/privacy-policy">Privacy Policy</Link></span>
                                        </label>
                                    </div>

                                    <button 
                                        type="submit" 
                                        className="rts-btn btn-primary"
                                        disabled={loading}
                                    >
                                        {loading ? 'Logging in...' : 'Login'}
                                        <img
                                            className="injectable"
                                            src="/assets/images/service/icons/13.svg"
                                            alt="arrow"
                                        />
                                    </button>

                                    <div className="register-link text-center">
                                        Don&apos;t have an account? <Link href="/register">Register here</Link>
                                    </div>
                                </form>
                            </div>
                        </div>
                        <div className="col-lg-5">
                            <div className="login-image-wrapper">
                                <img
                                    src="/assets/images/banner/01.webp"
                                    alt="Login"
                                    className="login-image"
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
