"use client";
import React from "react";
import { useEffect } from "react";
import Rellax from "rellax";
import AOS from "aos";
import { ReactSVG } from 'react-svg';
import { useAuth } from '@/contexts/AuthContext';
import "aos/dist/aos.css";
import "./banner.css";

function BannerOne() {
    const { isAuthenticated } = useAuth();
    
    useEffect(() => {
        if (typeof window !== "undefined") {
            new Rellax(".rellax", { speed: -1 });
        }
    }, []);
    
    useEffect(() => {
        AOS.init({
            disableMutationObserver: true,
            once: true,
        });
    }, []);
    
    return (
        <div>
            <div className="rts-banner-area-start">
                <div className="container">
                    <div className="row align-items-center">
                        
                        <div className="col-lg-12">
                            <div className="banner-wrapper-one align-items-center ">
                                <span className="pre-title" data-aos="fade-up" data-aos-duration="1000"></span>
                                <h1 className="title" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="300">
                                Boost <span>Your Career </span><br></br>with AI Precision
                                    
                                </h1>
                                <p data-aos="fade-up" data-aos-delay="500">
                                Streamlined accuracy in resume auditing made easy. No trade-offs, just confidence in your career journey


                                </p>
                                {!isAuthenticated && (
                                    <a
                                        href="/register"
                                        className="rts-btn btn-primary landingbtnmedia" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="700" 
                                    >
                                        Register Now
                                        <ReactSVG
                                            className="injectable"
                                            src="assets/images/banner/01.svg"
                                            alt="icons"
                                        />
                                    </a>
                                )}
                            </div>
                        </div>

                        
                    </div>
                </div>
            </div>
        </div>
    );
}

export default BannerOne; 