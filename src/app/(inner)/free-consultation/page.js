"use client"
import BackToTop from "@/components/common/BackToTop";
import FooterOne from "@/components/footer/FooterOne";
import HeaderTwo from "@/components/header/HeaderTwo";
import Testimonials from "@/components/testimonials/Testimonials";
import { useEffect, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import HeaderOne from "@/components/header/HeaderOne";
import ReCaptcha from "@/components/security/ReCaptcha";
import toast from 'react-hot-toast';

export default function Home() {
    const [recaptchaToken, setRecaptchaToken] = useState(null);
    const [recaptchaError, setRecaptchaError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        help: '',
        message: ''
    });

    useEffect(() => {
        AOS.init({
            disableMutationObserver: true,
            once: true,
        });
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleRecaptchaVerify = (token) => {
        setRecaptchaToken(token);
        setRecaptchaError(null);
    };
    const handleRecaptchaError = (error) => {
        setRecaptchaError(error);
        setRecaptchaToken(null);
    };
    const handleRecaptchaExpire = () => {
        setRecaptchaToken(null);
        setRecaptchaError('reCAPTCHA has expired. Please verify again.');
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        if (!recaptchaToken) {
            setRecaptchaError('Please complete the reCAPTCHA verification');
            return;
        }
        setIsSubmitting(true);
        try {
            // Save to backend
            const response = await fetch('/api/contact-forms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, formType: 'consultation' }),
            });
            const result = await response.json();
            if (result.success) {
                toast.success('Thank you for your message! We will get back to you soon.');
                setFormData({ first_name: '', last_name: '', email: '', phone: '', help: '', message: '' });
                setRecaptchaToken(null);
            } else {
                setRecaptchaError(result.error || 'Failed to send message.');
            }
        } catch (error) {
            setRecaptchaError('An error occurred. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };
    return (
        <div className='#'>
            <HeaderOne />

            <>
                <div className="rts-career-banner-area rts-section-gap">
                    <div className="container">
                        <div className="row align-items-center">
                            <div className="col-lg-6">
                                <div className="career-banner-wrapper">
                                    <h1 className="title" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="100">
                                    Unlock Your Next Career Opportunity
                                    </h1>
                                    <p className="disc" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="300">
                                    Explore a wide range of job openings from top employers. Whether you&apos;re starting out, advancing your career, or making a change, Justjobs Info connects you to roles that match your skills and ambitions. Browse our latest listings and take the next step toward your professional goals.
                                    </p>
                                    <a href="/job-listing" className="rts-btn btn-primary btn-bold" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="300">
                                        Current Openings
                                    </a>
                                </div>
                            </div>
                            <div className="col-lg-6 pl--30 pl_md--15 pl_sm--10 mt_md--30 mt_sm--30">
                                <div
                                    className="thumbnail-top thumbnail-consultancy" data-aos="zoom-out" data-aos-duration="1000" data-aos-delay="100"
                                >
                                    <img
                                        className="jarallax-img"
                                        src="assets/images/consultancy/02.webp"
                                        alt="career"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="consultancy-bottom rts-section-gapBottom career-two-section">
                    <div className="container">
                        <div className="row align-items-center">
                            <div className="col-lg-6 pr--40 pr_md--15 pr_sm--10">
                                <div className="thumbnail-consultancy" data-aos="zoom-out" data-aos-duration="1000" data-aos-delay="100">
                                    <img
                                        className="jarallax-img"
                                        src="assets/images/consultancy/01.webp"
                                        alt="consultancy"
                                    />
                                </div>
                            </div>
                            <div className="col-lg-6 pt_md--50 mt_sm--30">
                                <div className="career-right-two-wrapper">
                                    <h2 className="title">
                                    Our Career Support &amp; <br /> Job Search Services
                                    </h2>
                                    <p>
                                    We provide personalized career support and resources to help you succeed at every stage of your job search. Whether you&apos;re building your resume, exploring new opportunities, or preparing for interviews, Justjobs Info is here to guide you.
                                    </p>
                                    <div className="check-wrapper-main">
                                        <div className="single-wrapper">
                                            <div className="check-wrapper">
                                                <div className="single-check">
                                                    <img src="assets/images/service/01.svg" alt="service" />
                                                    <p>Resume Building & Optimization</p>
                                                </div>
                                                <div className="single-check">
                                                    <img src="assets/images/service/01.svg" alt="service" />
                                                    <p>Personalized Career Consultations</p>
                                                </div>
                                                <div className="single-check">
                                                    <img src="assets/images/service/01.svg" alt="service" />
                                                    <p>Curated Job Listings</p>
                                                </div>
                                                <div className="single-check">
                                                    <img src="assets/images/service/01.svg" alt="service" />
                                                    <p>Interview Preparation & Tips</p>
                                                </div>
                                                <div className="single-check">
                                                    <img src="assets/images/service/01.svg" alt="service" />
                                                    <p>Career Growth Resources
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="rts-solution-area rts-section-gapBottom">
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-12">
                                <div className="title-center-style-two">
                                    <h2 className="title">Step-by-Step to Excellence</h2>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="container-consulting mt--80 mt_sm--30">
                        <div className="row">
                            <div className="col-lg-12">
                                <div className="consulting-step">
                                    <div className="timeline-line" />
                                    <div className="single-consulting-one">
                                        <div className="thumbnail">
                                            <img src="assets/images/consultancy/03.webp" alt="consulting" />
                                        </div>
                                        <div className="right-area">
                                            <h4 className="title">Discovery Phase</h4>
                                            <p>
                                                Understanding your business goals and challenges.
                                            </p>
                                        </div>
                                        <div className="timeline-dot">
                                            <div className="time-line-circle" />
                                        </div>
                                    </div>
                                    <div className="single-consulting-one">
                                        <div className="thumbnail">
                                            <img src="assets/images/consultancy/04.webp" alt="consulting" />
                                        </div>
                                        <div className="right-area">
                                            <h4 className="title">Analysis</h4>
                                            <p>
                                                Starting in knowing your business goals and challenges.
                                            </p>
                                        </div>
                                        <div className="timeline-dot">
                                            <div className="time-line-circle" />
                                        </div>
                                    </div>
                                    <div className="single-consulting-one">
                                        <div className="thumbnail">
                                            <img src="assets/images/consultancy/05.webp" alt="consulting" />
                                        </div>
                                        <div className="right-area">
                                            <h4 className="title">Strategy Design</h4>
                                            <p>
                                                Crafting a customized IT roadmap.
                                            </p>
                                        </div>
                                        <div className="timeline-dot">
                                            <div className="time-line-circle" />
                                        </div>
                                    </div>
                                    <div className="single-consulting-one">
                                        <div className="thumbnail">
                                            <img src="assets/images/consultancy/06.webp" alt="consulting" />
                                        </div>
                                        <div className="right-area">
                                            <h4 className="title">Implementation</h4>
                                            <p>
                                                Understanding your business goals and challenges.
                                            </p>
                                        </div>
                                        <div className="timeline-dot">
                                            <div className="time-line-circle" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>





            <Testimonials />
            <div>
                <>
                    {/* shedule a  consultation start */}
                    <div className="shedule-a-consultation rts-section-gapTop">
                        <div className="container">
                            <div className="row align-items-center">
                                <div className="col-lg-5">
                                    <div className="shedule-consulting-left">
                                        <h2 className="title">
                                        Let&apos;s Advance Your <br /> Career Together
                                        </h2>
                                        <p className="disc">
                                        We&apos;re here to support your career journey with expert guidance, resume help, and job connections. Reach out to Justjobs Info for career support or even partnership opportunities
                                        </p>
                                        <div className="check-wrapper">
                                            <p className="top">What&apos;s Included</p>
                                            <div className="single-wrapper">
                                                <div className="check-wrapper">
                                                    <div className="single-check">
                                                        <img src="assets/images/service/01.svg" alt="service" />
                                                        <p> Understanding your career needs
                                                        .</p>
                                                    </div>
                                                    <div className="single-check">
                                                        <img src="assets/images/service/01.svg" alt="service" />
                                                        <p>Insights and actionable recommendations
                                                        .</p>
                                                    </div>
                                                    <div className="single-check">
                                                        <img src="assets/images/service/01.svg" alt="service" />
                                                        <p>No obligation.</p>
                                                    </div>
                                                </div>
                                            </div>
                                            {/* 
                                            <p className="call">
                                                Call us at: <a href="#">+1 (555) 123-4567</a>
                                            </p>
                                            */}
                                            
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-6 offset-lg-1 mt_sm--30">
                                    <form onSubmit={handleFormSubmit} className="consulting-form">
                                        <p>Looking forward to hearing from you. Drop us a note!</p>
                                        <div className="input-half-wrapper">
                                            <div className="single">
                                                <input type="text" placeholder="First name" required="" name="first_name" value={formData.first_name} onChange={handleChange} />
                                            </div>
                                            <div className="single">
                                                <input type="text" placeholder="Last name" required="" name="last_name" value={formData.last_name} onChange={handleChange} />
                                            </div>
                                        </div>
                                        <div className="input-half-wrapper">
                                            <div className="single">
                                                <input type="email" placeholder="Company email" required="" name="email" value={formData.email} onChange={handleChange} />
                                            </div>
                                            <div className="single">
                                                <input type="tel" placeholder="Phone Number" name="phone" value={formData.phone} onChange={handleChange} />
                                            </div>
                                        </div>
                                        <input type="text" placeholder="How can we Help You?" name="help" value={formData.help} onChange={handleChange} />
                                        <textarea
                                            name="message"
                                            id="message"
                                            placeholder="Write a Message "
                                            required=""
                                            value={formData.message}
                                            onChange={handleChange}
                                        />
                                        
                                        {/* reCAPTCHA Component */}
                                        <ReCaptcha
                                            onVerify={handleRecaptchaVerify}
                                            onError={handleRecaptchaError}
                                            onExpire={handleRecaptchaExpire}
                                        />
                                        
                                        {/* Error Message Display */}
                                        {recaptchaError && (
                                            <div style={{
                                                color: '#dc3545',
                                                fontSize: '14px',
                                                marginBottom: '15px',
                                                padding: '10px',
                                                border: '1px solid #dc3545',
                                                borderRadius: '4px',
                                                backgroundColor: '#f8d7da'
                                            }}>
                                                {recaptchaError}
                                            </div>
                                        )}
                                        
                                        <button 
                                            type="submit" 
                                            className="rts-btn btn-primary"
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? 'Submitting...' : 'Submit'}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* shedule a  consultation end */}
                </>


            </div>
            <FooterOne />
            <BackToTop />
        </div>
    );
}
