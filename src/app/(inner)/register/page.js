"use client";
import React, { useState, useRef } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '@/config/firebase';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Link from 'next/link';
import './register.css';
import BackToTop from "@/components/common/BackToTop";
import HeaderOne from "@/components/header/HeaderOne";
import FooterOne from "@/components/footer/FooterOne";
import ReCaptcha from "@/components/security/ReCaptcha";


export default function RegisterPage() {
    const router = useRouter();
    const recaptchaRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [recaptchaToken, setRecaptchaToken] = useState(null);
    const [validationErrors, setValidationErrors] = useState({});
    const [passwordStrength, setPasswordStrength] = useState({
        score: 0,
        feedback: [],
        isValid: false
    });
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        // Honeypot field - should remain empty
        website_url: '',
        agreeToTerms: false
    });

    const checkPasswordStrength = (password) => {
        const feedback = [];
        let score = 0;

        // Length check - reduced from 8 to 6
        if (password.length >= 6) {
            score += 1;
        } else {
            feedback.push('At least 6 characters');
        }

        // Uppercase check
        if (/[A-Z]/.test(password)) {
            score += 1;
        } else {
            feedback.push('One uppercase letter (A-Z)');
        }

        // Lowercase check
        if (/[a-z]/.test(password)) {
            score += 1;
        } else {
            feedback.push('One lowercase letter (a-z)');
        }

        // Number check
        if (/\d/.test(password)) {
            score += 1;
        } else {
            feedback.push('One number (0-9)');
        }

        // Special character check - made optional
        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            score += 1;
        } else {
            feedback.push('One special character (!@#$%^&*) - optional');
        }

        // Removed common sequence check - no longer blocking common sequences
        // if (/123|abc|qwe|password|admin/i.test(password)) {
        //     feedback.push('Avoid common sequences (123, abc, password)');
        // }

        return {
            score,
            feedback,
            isValid: score >= 3 // Reduced from 4 to 3 requirements
        };
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });

        // Real-time password strength check
        if (name === 'password') {
            const strength = checkPasswordStrength(value);
            setPasswordStrength(strength);
        }

        // Clear validation error for this field
        if (validationErrors[name]) {
            setValidationErrors({
                ...validationErrors,
                [name]: null
            });
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    const handleRecaptchaVerify = (token) => {
        setRecaptchaToken(token);
    };

    const handleRecaptchaExpired = () => {
        setRecaptchaToken(null);
        toast.error('reCAPTCHA expired, please verify again');
    };

    const handleRecaptchaError = (error) => {
        setRecaptchaToken(null);
        // Only show error toast for actual failures, not development mode duplicates
        if (error && !error.includes('already been rendered')) {
            toast.error('reCAPTCHA verification failed');
        }
    };

    const validateForm = () => {
        const errors = {};

        // Basic validation
        if (!formData.name.trim()) {
            errors.name = 'Name is required';
        }

        if (!formData.email.trim()) {
            errors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = 'Please enter a valid email address';
        }

        if (!formData.password) {
            errors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            errors.password = 'Password must be at least 6 characters';
        }

        if (!formData.confirmPassword) {
            errors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }

        // Check honeypot
        if (formData.website_url !== '') {
            errors.general = 'Spam detected';
        }

        // Check reCAPTCHA
        if (!recaptchaToken) {
            errors.recaptcha = 'Please complete the reCAPTCHA verification';
        }

        // Check terms of use agreement
        if (!formData.agreeToTerms) {
            errors.agreeToTerms = 'You must agree to the Terms of Use to register';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const verifyRecaptcha = async (token) => {
        try {
            const response = await fetch('/api/verify-recaptcha', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token }),
            });

            const result = await response.json();
            return result.success;
        } catch (error) {
            return false;
        }
    };

    const validateRegistrationData = async (data) => {
        try {
            const response = await fetch('/api/validate-registration', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.message);
            }

            return result;
        } catch (error) {
            throw error;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Client-side validation
        if (!validateForm()) {
            const firstError = Object.keys(validationErrors)[0];
            if (firstError && validationErrors[firstError]) {
                toast.error(validationErrors[firstError]);
            }
            return;
        }

        if (!auth) {
            toast.error('Authentication service is not available');
            return;
        }

        setLoading(true);

        try {
            // 1. Verify reCAPTCHA server-side
            const recaptchaValid = await verifyRecaptcha(recaptchaToken);
            if (!recaptchaValid) {
                throw new Error('reCAPTCHA verification failed');
            }

            // 2. Server-side spam protection and validation
            await validateRegistrationData(formData);

            // 3. Create Firebase account
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                formData.email,
                formData.password
            );

            // 4. Update the user's display name
            await updateProfile(userCredential.user, {
                displayName: formData.name
            });

            toast.success('Account created successfully! Please login.');
            router.push('/login');

        } catch (error) {
            // Reset reCAPTCHA on error
            if (recaptchaRef.current && recaptchaRef.current.reset) {
                recaptchaRef.current.reset();
            }
            setRecaptchaToken(null);

            let errorMessage = 'An error occurred during registration';
            
            // Handle specific Firebase errors
            if (error.code) {
                switch (error.code) {
                    case 'auth/email-already-in-use':
                        errorMessage = 'This email is already registered. Please login instead.';
                        break;
                    case 'auth/invalid-email':
                        errorMessage = 'Please enter a valid email address.';
                        break;
                    case 'auth/operation-not-allowed':
                        errorMessage = 'Email/password accounts are not enabled. Please contact support.';
                        break;
                    case 'auth/weak-password':
                        errorMessage = 'Password is too weak. Please use a stronger password.';
                        break;
                    default:
                        errorMessage = error.message;
                }
            } else {
                // Handle our custom validation errors
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
            <div className="register-page-wrapper">
                <div className="container-fluid p-0">
                    <div className="row g-0">
                        <div className="col-lg-5">
                            <div className="register-image-wrapper">
                                <img 
                                    src="/assets/images/banner/02.jpg" 
                                    alt="Register" 
                                    className="register-image"
                                />
                            </div>
                        </div>
                        <div className="col-lg-7">
                            <div className="register-form-wrapper">
                                <div className="register-header text-center">
                                    <Link href="/" className="logo-area">
                                        <img className='header-logo' src="/assets/images/logo/justjobslogo.png" alt="logo" />
                                    </Link>
                                    <h2 className="title">Create Account</h2>
                                    <p className="subtitle">Please fill in the details to register</p>
                                </div>

                                <form onSubmit={handleSubmit} className="register-form">
                                    {/* Honeypot field - hidden from users */}
                                    <div style={{ display: 'none' }}>
                                        <input
                                            type="text"
                                            name="website_url"
                                            value={formData.website_url}
                                            onChange={handleChange}
                                            tabIndex="-1"
                                            autoComplete="off"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <input
                                            type="text"
                                            name="name"
                                            placeholder="Full Name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            disabled={loading}
                                            className={validationErrors.name ? 'error' : ''}
                                        />
                                        {validationErrors.name && (
                                            <span className="error-text">{validationErrors.name}</span>
                                        )}
                                    </div>

                                    <div className="form-group">
                                        <input
                                            type="email"
                                            name="email"
                                            placeholder="Email Address"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            disabled={loading}
                                            className={validationErrors.email ? 'error' : ''}
                                        />
                                        {validationErrors.email && (
                                            <span className="error-text">{validationErrors.email}</span>
                                        )}
                                    </div>

                                    <div className="form-group password-group">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            placeholder="Password (min. 6 characters)"
                                            value={formData.password}
                                            onChange={handleChange}
                                            required
                                            disabled={loading}
                                            className={validationErrors.password ? 'error' : ''}
                                        />
                                        <span 
                                            className="password-toggle"
                                            onClick={togglePasswordVisibility}
                                        >
                                            {showPassword ? "👁️" : "👁️‍🗨️"}
                                        </span>
                                        {validationErrors.password && (
                                            <span className="error-text">{validationErrors.password}</span>
                                        )}

                                        {/* Password Strength Indicator */}
                                        {formData.password && (
                                            <div className="password-strength-container" style={{ marginTop: '8px' }}>
                                                <div className="password-strength-bar">
                                                    <div 
                                                        className="password-strength-fill"
                                                        style={{
                                                            width: `${(passwordStrength.score / 5) * 100}%`,
                                                            backgroundColor: 
                                                                passwordStrength.score < 2 ? '#dc3545' :
                                                                passwordStrength.score < 4 ? '#ffc107' : '#28a745',
                                                            height: '4px',
                                                            borderRadius: '2px',
                                                            transition: 'all 0.3s ease'
                                                        }}
                                                    ></div>
                                                </div>
                                                <div className="password-strength-text" style={{ 
                                                    fontSize: '12px', 
                                                    marginTop: '4px',
                                                    color: passwordStrength.isValid ? '#28a745' : '#dc3545'
                                                }}>
                                                    {passwordStrength.isValid ? (
                                                        <span>✅ Strong password!</span>
                                                    ) : (
                                                        <div>
                                                            <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>
                                                                Password needs:
                                                            </div>
                                                            {passwordStrength.feedback.map((item, index) => (
                                                                <div key={index} style={{ fontSize: '11px' }}>
                                                                    • {item}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="form-group password-group">
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            name="confirmPassword"
                                            placeholder="Confirm Password"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            required
                                            disabled={loading}
                                            className={validationErrors.confirmPassword ? 'error' : ''}
                                        />
                                        <span 
                                            className="password-toggle"
                                            onClick={toggleConfirmPasswordVisibility}
                                        >
                                            {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                                        </span>
                                        {validationErrors.confirmPassword && (
                                            <span className="error-text">{validationErrors.confirmPassword}</span>
                                        )}
                                    </div>

                                    {/* reCAPTCHA */}
                                    <div className="form-group recaptcha-group">
                                        <ReCaptcha
                                            ref={recaptchaRef}
                                            onVerify={handleRecaptchaVerify}
                                            onExpired={handleRecaptchaExpired}
                                            onError={handleRecaptchaError}
                                        />
                                        {validationErrors.recaptcha && (
                                            <span className="error-text">{validationErrors.recaptcha}</span>
                                        )}
                                    </div>

                                    <div className="form-group">
                                        <label className="custom-checkbox remember-me">
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
                                        {validationErrors.agreeToTerms && (
                                            <span className="error-text">{validationErrors.agreeToTerms}</span>
                                        )}
                                    </div>

                                    <button 
                                        type="submit" 
                                        className="rts-btn btn-primary"
                                        disabled={loading || !recaptchaToken}
                                    >
                                        {loading ? 'Creating Account...' : 'Register'}
                                        <img
                                            className="injectable"
                                            src="/assets/images/service/icons/13.svg"
                                            alt="arrow"
                                        />
                                    </button>

                                    <div className="login-link text-center">
                                        Already have an account? <Link href="/login">Login here</Link>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <BackToTop />
            <FooterOne />
        </>
    );
} 