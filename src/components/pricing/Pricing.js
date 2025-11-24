"use client"
import React from 'react'
import { ReactSVG } from 'react-svg';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';

function Pricing() {
    const { isAuthenticated } = useAuth();
    
    return (
        <div>
            {/* pricing area start */}
            <div className="rts-pricing-area rts-section-gapTop bg-gradient-pricing">
                <div className="bg-shape-area">
                    <Image
                        loading="lazy"
                        src="/assets/images/pricing/01.webp"
                        alt="Abstract pricing background shape"
                        width={935}
                        height={397}
                        sizes="(max-width: 1024px) 80vw, 935px"
                        className="pricing-bg-shape"
                    />
                </div>
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="text-center-title-bg-white">
                                <h2 className="title" style={{ fontSize: 64 }}>
                                    Pricing
                                </h2>
                                <p>
                                Start free. Register only if you want to unlock more tools and features.    
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="container-pricing">
                    <div className="row mt--80 g-0">
                        <div className="col-lg-6 col-md-6 col-sm-6 col-12">
                            <div className="single-pricing-area border-left">
                                <div className="head">
                                    <span className="pre">Starter</span>
                                    <h3 className="title">Free</h3>
                                    <p>Free Forever, Free Audit.</p>
                                    <ul style={{textAlign: 'left'}}>
                                        <li>Basic Grammar Audit</li>
                                        <li>1 Basic Template</li>
                                        <li>Unlimited Job Browsing</li>
                                        <li>1 Job Alert</li>
                                        <li>Limited Download Access</li>
                                    </ul>
                                </div>
                                <div className="body">
                                    {!isAuthenticated && (
                                    <a href="/register" className="rts-btn btn-border">
                                        Register Now
                                        <ReactSVG
                                            className="injectable"
                                            src="assets/images/service/icons/13.svg"
                                            alt="arrow"
                                        />
                                    </a>
                                    )}
                                    <span>No credit card required!</span>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-6 col-md-6 col-sm-6 col-12">
                            <div className="single-pricing-area">
                                <div className="head">
                                    <span className="pre">Member</span>
                                    <h3 className="title">$0</h3>
                                    <p>Registered Users.</p>
                                    <ul style={{textAlign: 'left'}}>
                                        <li>Advanced Audit</li>
                                        <li>All Template</li>
                                        <li>Unlimited Job Browsing</li>
                                        <li>Job Alerts + Early Access</li>
                                        <li>Unlimited Download Access</li>
                                    </ul>
                                </div>
                                <div className="body">
                                    {!isAuthenticated && (
                                    <a href="/register" className="rts-btn btn-border">
                                        Register Now
                                        <ReactSVG
                                            className="injectable"
                                            src="assets/images/service/icons/13.svg"
                                            alt="arrow"
                                        />
                                    </a>
                                    )}
                                    <span>No credit card required!</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <span className="moneyback d-block m-auto pt--80">
                    No credit cards required, 30 days money-back guarantee*
                </span>
            </div>
            {/* pricing area end */}
        </div>
    )
}

export default Pricing
