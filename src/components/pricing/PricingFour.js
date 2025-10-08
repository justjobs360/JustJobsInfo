import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

function PricingFour() {
    return (
        <>
            {/* rts pricing area start */}
            <div className="rts-pricing-area rts-section-gap">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="text-center-title-bg-white">
                                <h2 className="title">Flexibility, Affordable Pricing</h2>
                                <p>
                                Bringing innovation within reach so you can solve some of today’s career challenges.
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="row g-0 mt--80">
                        <div className="col-lg-4 col-md-6 col-sm-12">
                            <div className="single-pricing-area-start-2 border-left">
                                <div className="head-area">
                                    <div className="icon">
                                        <Image src="/assets/images/pricing/01.svg" alt="pricing" width={50} height={50} />
                                    </div>
                                    <p>Starter</p>
                                    <h2 className="title">Free</h2>
                                    <span>Free Forever, Free Audit.</span>
                                </div>
                                <div className="body-areas">
                                    <div className="single-check">
                                        <Image src="/assets/images/pricing/icon/04.png" alt="pricing" width={20} height={20} />
                                        <p>Access to all basic features</p>
                                    </div>
                                    <div className="single-check">
                                        <Image src="/assets/images/pricing/icon/04.png" alt="pricing" width={20} height={20} />
                                        <p>Basic Grammar Audit</p>
                                    </div>
                                    <div className="single-check">
                                        <Image src="/assets/images/pricing/icon/04.png" alt="pricing" width={20} height={20} />
                                        <p>1 Basic Template</p>
                                    </div>
                                    <div className="single-check">
                                        <Image src="/assets/images/pricing/icon/04.png" alt="pricing" width={20} height={20} />
                                        <p>Unlimited Job Browsing</p>
                                    </div>
                                    <div className="single-check">
                                        <Image src="/assets/images/pricing/icon/04.png" alt="pricing" width={20} height={20} />
                                        <p>Basic chat and email support</p>
                                    </div>
                                </div>
                                <div className="footer-pricing">
                                    <Link href="/" className="btn-bold rts-btn btn-border">
                                        Get started
                                        <Image src="/assets/images/service/icons/13.svg" alt="arrow" width={20} height={20} />
                                    </Link>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-4 col-md-6 col-sm-12">
                            <div className="single-pricing-area-start-2 active">
                                <span className="tag">Popular</span>
                                <div className="head-area">
                                    <div className="icon">
                                        <Image src="/assets/images/pricing/02.svg" alt="pricing" width={50} height={50} />
                                    </div>
                                    <p>Member</p>
                                    <h2 className="title">$0</h2>
                                    <span>Registered users.</span>
                                </div>
                                <div className="body-areas">
                                    <div className="single-check">
                                        <Image src="/assets/images/pricing/icon/05.png" alt="pricing" width={20} height={20} />
                                        <p>Access to all basic features</p>
                                    </div>
                                    <div className="single-check">
                                        <Image src="/assets/images/pricing/icon/05.png" alt="pricing" width={20} height={20} />
                                        <p>Advanced audit</p>
                                    </div>
                                    <div className="single-check">
                                        <Image src="/assets/images/pricing/icon/05.png" alt="pricing" width={20} height={20} />
                                        <p>Premium Templates</p>
                                    </div>
                                    <div className="single-check">
                                        <Image src="/assets/images/pricing/icon/05.png" alt="pricing" width={20} height={20} />
                                        <p>Unlimited Job Browsing</p>
                                    </div>
                                    <div className="single-check">
                                        <Image src="/assets/images/pricing/icon/05.png" alt="pricing" width={20} height={20} />
                                        <p>Premium chat and email support</p>
                                    </div>
                                </div>
                                <div className="footer-pricing">
                                    <Link href="/login" className="btn-bold rts-btn btn-border">
                                        Get started
                                        <Image src="/assets/images/service/icons/13.svg" alt="arrow" width={20} height={20} />
                                    </Link>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-4 col-md-6 col-sm-12">
                            <div className="single-pricing-area-start-2">
                                <div className="head-area">
                                    <div className="icon">
                                        <Image src="/assets/images/pricing/03.svg" alt="pricing" width={50} height={50} />
                                    </div>
                                    <p>Agency</p>
                                    <h2 className="title">Call</h2>
                                    <span>Let’s collaborate.</span>
                                </div>
                                <div className="body-areas">
                                    <div className="single-check">
                                        <Image src="/assets/images/pricing/icon/04.png" alt="pricing" width={20} height={20} />
                                        <p>Partnerships</p>
                                    </div>
                                    <div className="single-check">
                                        <Image src="/assets/images/pricing/icon/04.png" alt="pricing" width={20} height={20} />
                                        <p>Collaboration</p>
                                    </div>
                                    <div className="single-check">
                                        <Image src="/assets/images/pricing/icon/04.png" alt="pricing" width={20} height={20} />
                                        <p>Idea sharing</p>
                                    </div>
                                    <div className="single-check">
                                        <Image src="/assets/images/pricing/icon/04.png" alt="pricing" width={20} height={20} />
                                        <p>Sponsorships</p>
                                    </div>
                                    <div className="single-check">
                                        <Image src="/assets/images/pricing/icon/04.png" alt="pricing" width={20} height={20} />
                                        <p>Corporate Social Responsibility</p>
                                    </div>
                                </div>
                                <div className="footer-pricing">
                                    <Link href="/contact" className="btn-bold rts-btn btn-border">
                                        Get started
                                        <Image src="/assets/images/service/icons/13.svg" alt="arrow" width={20} height={20} />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="container">
                    <div className="row  rts-section-gapTop">
                        <div className="col-lg-12 text-center">
                            <p>No credit cards required, 30 days money-back guarantee*</p>
                        </div>
                    </div>
                </div>
            </div>
            {/* rts pricing area end */}
        </>

    )
}

export default PricingFour
