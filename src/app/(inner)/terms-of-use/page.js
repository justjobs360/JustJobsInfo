"use client"
import BackToTop from "@/components/common/BackToTop";
import FooterOne from "@/components/footer/FooterOne";
import HeaderTwo from "@/components/header/HeaderTwo";
import { ReactSVG } from 'react-svg';
import "../legal-pages.css";
export default function Home() {
    return (
        <div className='#'>
            <HeaderTwo />

            <>
                <div className="container-large">
                    {/* service area start */}
                    <div
                        className="service-single-area-banner bg_image jarallax"
                        data-jarallax="1.5"
                    ></div>
                    {/* service area end */}
                </div>
                <div className="service-area-details-wrapper legal-page">
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-12">
                                <div className="inner-content">
                                    <div className="top">
                                        <h1 className="title">Terms and Conditions</h1>
                                        <p className="disc">
                                            Welcome to justjobs!
                                        </p>
                                    </div>
                                    <div className="mid-content">
                                        <p className="disc">
                                            These terms and conditions outline the rules and regulations for the use of justjobs&apos;s Website, located at https://justjobs.info.
                                        </p>
                                        <p className="disc">
                                            By accessing this website we assume you accept these terms and conditions. Do not continue to use justjobs.info if you do not agree to take all of the terms and conditions stated on this page.
                                        </p>
                                        <p className="disc">
                                            The following terminology applies to these Terms and Conditions, Privacy Statement and Disclaimer Notice and all Agreements: &quot;Client&quot;, &quot;You&quot; and &quot;Your&quot; refers to you, the person log on this website and compliant to the Company&apos;s terms and conditions. &quot;The Company&quot;, &quot;Ourselves&quot;, &quot;We&quot;, &quot;Our&quot; and &quot;Us&quot;, refers to our Company. &quot;Party&quot;, &quot;Parties&quot;, or &quot;Us&quot;, refers to both the Client and ourselves.
                                        </p>
                                        
                                        <h3 className="title mt--40 mb--20">Cookies</h3>
                                        <p className="disc">
                                            We employ the use of cookies. By accessing justjobs.info, you agreed to use cookies in agreement with the justjobs.info&apos;s Privacy Policy. Most interactive websites use cookies to let us retrieve the user&apos;s details for each visit. Cookies are used by our website to enable the functionality of certain areas to make it easier for people visiting our website.
                                        </p>
                                        
                                        <h3 className="title mt--40 mb--20">License</h3>
                                        <p className="disc">
                                            Unless otherwise stated, justjobs.info and/or its licensors own the intellectual property rights for all material on justjobs.info. All intellectual property rights are reserved. You may access this from justjobs.info for your own personal use subjected to restrictions set in these terms and conditions.
                                        </p>
                                        <p className="disc">You must not:</p>
                                        <ul className="disc-list">
                                            <li>Republish material from justjobs.info</li>
                                            <li>Sell, rent or sub-license material from justjobs.info</li>
                                            <li>Reproduce, duplicate or copy material from justjobs.info</li>
                                            <li>Redistribute content from justjobs.info</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="service-area-details-wrapper border-bottom legal-page">
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-12">
                                <div className="inner-content">
                                    <div className="mid-content pt--0">
                                        <h3 className="title mt--40 mb--20">User Comments and Content</h3>
                                        <p className="disc">
                                            Parts of this website offer an opportunity for users to post and exchange opinions and information in certain areas of the website. justjobs.info does not filter, edit, publish or review Comments prior to their presence on the website. Comments do not reflect the views and opinions of justjobs.info, its agents and/or affiliates.
                                        </p>
                                        <p className="disc">You warrant and represent that:</p>
                                        <ul className="disc-list">
                                            <li>You are entitled to post the Comments on our website and have all necessary licenses and consents to do so</li>
                                            <li>The Comments do not invade any intellectual property right, including without limitation copyright, patent or trademark of any third party</li>
                                            <li>The Comments do not contain any defamatory, libelous, offensive, indecent or otherwise unlawful material</li>
                                            <li>The Comments will not be used to solicit or promote business or present commercial activities or unlawful activity</li>
                                        </ul>
                                        
                                        <h3 className="title mt--40 mb--20">Hyperlinking to our Content</h3>
                                        <p className="disc">
                                            The following organizations may link to our Website without prior written approval: Government agencies, Search engines, News organizations, Online directory distributors, and System wide Accredited Businesses.
                                        </p>
                                        
                                        <h3 className="title mt--40 mb--20">Content Liability</h3>
                                        <p className="disc">
                                            We shall not be held responsible for any content that appears on your Website. You agree to protect and defend us against all claims that arise on your Website. No link(s) should appear on any Website that may be interpreted as libelous, obscene or criminal.
                                        </p>
                                        
                                        <h3 className="title mt--40 mb--20">Disclaimer</h3>
                                        <p className="disc">
                                            To the maximum extent permitted by applicable law, we exclude all representations, warranties and conditions relating to our website and the use of this website. The limitations and prohibitions of liability govern all liabilities arising under the disclaimer, including liabilities arising in contract, in tort and for breach of statutory duty.
                                        </p>
                                        <p className="disc">
                                            As long as the website and the information and services on the website are provided free of charge, we will not be liable for any loss or damage of any nature.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* rts call to action area start */}
                <div className="rts-call-to-action-area-about rts-section-gapTop">
                    <div className="container pb--80">
                        <div className="row">
                            <div className="col-lg-12">
                                <h2 className="title">Book a Free Consultation</h2>
                                <p className="disc">
                                    Schedule a no-obligation consultation to discuss your unique needs
                                    and how Luminous can elevate your business technology.
                                </p>
                                <a
                                    href="#"
                                    className="rts-btn btn-primary wow fadeInUp"
                                    data-wow-delay=".5s"
                                >
                                    View Solutions
                                    <ReactSVG
                                        src="assets/images/service/icons/13.svg"
                                        alt="arrow"
                                    />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </>



            <FooterOne />
            <BackToTop />
        </div>
    );
}

