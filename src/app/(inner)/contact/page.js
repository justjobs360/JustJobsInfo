"use client"
import BackToTop from "@/components/common/BackToTop";
import FooterOne from "@/components/footer/FooterOne";
import HeaderTwo from "@/components/header/HeaderTwo";
import React, { useRef, useState } from "react";
import { ReactSVG } from 'react-svg';
import HeaderOne from "@/components/header/HeaderOne";
import ReCaptcha from "@/components/security/ReCaptcha";
import DynamicMetaTags from "@/components/common/DynamicMetaTags";
import toast from 'react-hot-toast';

export default function Home() {
    const form = useRef();
    const recaptchaRef = useRef();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [recaptchaToken, setRecaptchaToken] = useState(null);
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        message: '',
        agree: false
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const validateForm = () => {
        if (!formData.first_name.trim()) {
            toast.error('First name is required');
            return false;
        }
        if (!formData.last_name.trim()) {
            toast.error('Last name is required');
            return false;
        }
        if (!formData.email.trim()) {
            toast.error('Email is required');
            return false;
        }
        if (!formData.message.trim()) {
            toast.error('Message is required');
            return false;
        }
        if (!formData.agree) {
            toast.error('You must agree to our terms of service');
            return false;
        }
        if (!recaptchaToken) {
            toast.error('Please complete the reCAPTCHA verification');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }
        setIsSubmitting(true);
        try {
            // Verify reCAPTCHA on server side
            const recaptchaResponse = await fetch('/api/verify-recaptcha', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token: recaptchaToken }),
            });
            if (!recaptchaResponse.ok) {
                throw new Error('reCAPTCHA verification failed');
            }
            // Save to backend
            const response = await fetch('/api/contact-forms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, formType: 'contact' }),
            });
            const result = await response.json();
            if (result.success) {
                toast.success("Message sent successfully!");
                setFormData({
                    first_name: '',
                    last_name: '',
                    email: '',
                    phone: '',
                    message: '',
                    agree: false
                });
                setRecaptchaToken(null);
                if (recaptchaRef.current?.reset) recaptchaRef.current.reset();
            } else {
                toast.error(result.error || 'Failed to send message.');
            }
        } catch (error) {
            toast.error("Failed to send message. Please try again later.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRecaptchaVerify = (token) => {
        setRecaptchaToken(token);
    };

    const handleRecaptchaError = (error) => {
        console.error('reCAPTCHA error:', error);
        toast.error('reCAPTCHA verification failed. Please try again.');
        setRecaptchaToken(null);
    };

    const handleRecaptchaExpire = () => {
        setRecaptchaToken(null);
        toast.warning('reCAPTCHA expired. Please verify again.');
    };

    return (
        <DynamicMetaTags pageName="Contact">
            <div className='#'>
            <HeaderOne />

            <>
                {/* contact banner areas start */}
                <div className="contact-page-banner jarallax bg_iamge"></div>
                {/* contact banner areas end */}
                {/* contact area form wrapper start */}
                <div className="contact-area-form-wrapper rts-section-gapTop">
                    <div className="container-contact">
                        <div className="row">
                            <div className="col-lg-12">
                                <div className="text-center-title-bg-white">
                                    <h2 className="title">Get in Touch with Us</h2>
                                    <p>We&apos;d love to hear from you. Please fill out this form.</p>
                                </div>
                            </div>
                            <div className="col-lg-12">
                                <form
                                    ref={form}
                                    onSubmit={handleSubmit}
                                    className="contact-form"
                                    id="contact-form"
                                >
                                    <div className="half-input-wrapper">
                                        <div className="single">
                                            <label htmlFor="first_name">First name *</label>
                                            <input
                                                type="text"
                                                id="first_name"
                                                name="first_name"
                                                placeholder="First name"
                                                value={formData.first_name}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                        <div className="single">
                                            <label htmlFor="last_name">Last name *</label>
                                            <input
                                                type="text"
                                                id="last_name"
                                                name="last_name"
                                                placeholder="Last name"
                                                value={formData.last_name}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="single">
                                        <label htmlFor="email">Email *</label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            placeholder="you@company.com"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="single">
                                        <label htmlFor="phone">Phone</label>
                                        <input
                                            type="text"
                                            id="phone"
                                            name="phone"
                                            placeholder="+1 (555) 000-0000"
                                            value={formData.phone}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="single">
                                        <label htmlFor="message">Message *</label>
                                        <textarea
                                            id="message"
                                            name="message"
                                            placeholder="Leave us a message..."
                                            value={formData.message}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    
                                    {/* reCAPTCHA */}
                                    <div className="single">
                                        <ReCaptcha
                                            ref={recaptchaRef}
                                            onVerify={handleRecaptchaVerify}
                                            onError={handleRecaptchaError}
                                            onExpire={handleRecaptchaExpire}
                                        />
                                    </div>

                                    <div className="form-check">
                                        <label className="form-check-label" htmlFor="agree" style={{display: 'flex', alignItems: 'center', cursor: 'pointer'}}>
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            id="agree"
                                            name="agree"
                                            checked={formData.agree}
                                            onChange={handleChange}
                                            required
                                                style={{marginRight: '8px'}}
                                        />
                                            <span>I agree to the <a href="/terms-of-use" target="_blank">Terms of Service</a> and <a href="/privacy-policy" target="_blank">Privacy Policy</a> *</span>
                                        </label>
                                    </div>

                                    <button 
                                        type="submit" 
                                        className="rts-btn btn-primary"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? 'Sending...' : 'Send message'}
                                        {!isSubmitting && (
                                            <ReactSVG
                                                src="assets/images/service/icons/13.svg"
                                                alt="arrow"
                                            />
                                        )}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
                {/* contact area form wrapper end */}
                <div className="rts-google-map-area rts-section-gapTop">
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-12">
                                <div className="google-map-wrapper">
                                    <iframe
                                        src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d946285.8392348334!2d-3.2765753!3d54.7023545!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2suk!4v1731922050679!5m2!1sen!2suk"
                                        width={600}
                                        height={500}
                                        style={{ border: 0 }}
                                        allowFullScreen=""
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* rts location area end */}
            </>

            <FooterOne />
            <BackToTop />
        </div>
        </DynamicMetaTags>
    );
}
