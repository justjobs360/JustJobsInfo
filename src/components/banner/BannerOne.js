"use client";
import React, { useEffect } from "react";
import { ReactSVG } from 'react-svg';
import { useAuth } from '@/contexts/AuthContext';
import "./banner.css";
import useAOS from '@/hooks/useAOS';

function BannerOne() {
    const { isAuthenticated } = useAuth();
    
    useEffect(() => {
        let instance;
        const loadRellax = async () => {
            if (typeof window === "undefined") return;
            const rellaxModule = await import('rellax');
            const Rellax = rellaxModule.default ?? rellaxModule;
            instance = new Rellax(".rellax", { speed: -1 });
        };

        loadRellax();

        return () => {
            if (instance?.destroy) {
                instance.destroy();
            }
        };
    }, []);
    
    useAOS();
    
    return (
        <div>
            <div className="rts-banner-area-start">
                <div className="container">
                    <div className="row align-items-center">
                        
                        <div className="col-lg-12">
                            <div className="banner-wrapper-one align-items-center ">
                                <span className="pre-title" data-aos="fade-up" data-aos-duration="1000"></span>
                                <h1 className="title" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="300">
                                Boost <span>Your Career </span><br></br>with Precision
                                    
                                </h1>
                                <p data-aos="fade-up" data-aos-delay="500">
                                Streamlined accuracy in resume auditing made easy. No trade-offs, just confidence in your career journey


                                </p>
                                <div className="banner-buttons-container" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="700">
                                    <a
                                        href="/resume-audit"
                                        className="rts-btn btn-primary landingbtnmedia"
                                    >
                                        Audit Your Resume
                                        <ReactSVG
                                            className="injectable"
                                            src="assets/images/service/icons/08.svg"
                                            alt="audit icon"
                                        />
                                    </a>
                                    
                                    <a
                                        href="/job-fit"
                                        className="rts-btn btn-primary landingbtnmedia"
                                    >
                                        Job Fit
                                        <ReactSVG
                                            className="injectable"
                                            src="assets/images/service/icons/12.svg"
                                            alt="job fit icon"
                                        />
                                    </a>
                                    <a
                                        href="/resume-builder"
                                        className="rts-btn btn-primary landingbtnmedia"
                                    >
                                        Create Your Resume
                                        <ReactSVG
                                            className="injectable"
                                            src="assets/images/service/icons/09.svg"
                                            alt="create icon"
                                        />
                                    </a>
                                </div>
                            </div>
                        </div>

                        
                    </div>
                </div>
            </div>
        </div>
    );
}

export default BannerOne; 
