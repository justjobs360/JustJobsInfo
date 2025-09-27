"use client"
import BackToTop from "@/components/common/BackToTop";
import FooterOne from "@/components/footer/FooterOne";
import HeaderTwo from "@/components/header/HeaderOne";
import "../legal-pages.css";

export default function Home() {
    return (
        <div>
            <HeaderTwo />

            <div className="container-large">
                {/* banner area for consistent spacing with site styles */}
                <div className="service-single-area-banner bg_image jarallax" data-jarallax="1.5"></div>
            </div>

            <div>
                <div className="service-area-details-wrapper legal-page">
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-12">
                                <div className="inner-content">
                                    <div className="top">
                                        <h1 className="title">Cookies Policy</h1>
                                        <p className="disc">
                                            This Cookies Policy explains how justjobs.info uses cookies and similar tracking technologies.
                                        </p>
                                    </div>
                                    <div className="mid-content" style={{marginBottom: 0,  paddingBottom: 0}}>
                                        <h3 className="title mt--40 mb--20">What Are Cookies</h3>
                                        <p className="disc">
                                            Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently and to provide a better user experience.
                                        </p>
                                        
                                        <h3 className="title mt--40 mb--20">How We Use Cookies</h3>
                                        <p className="disc">
                                            We use cookies to enhance your browsing experience, analyze site traffic, personalize content, and provide social media features. Cookies help us understand how you use our website and improve our services.
                                        </p>
                                        
                                        <h3 className="title mt--40 mb--20">Types of Cookies We Use</h3>
                                        <h4 className="title mt--30 mb--15">Essential Cookies</h4>
                                        <p className="disc">
                                            These cookies are necessary for the website to function properly. They enable core functionality such as security, network management, and accessibility. You cannot opt-out of these cookies.
                                        </p>
                                        
                                        <h4 className="title mt--30 mb--15">Performance Cookies</h4>
                                        <p className="disc">
                                            These cookies collect information about how visitors use our website, which pages are visited most often, and if users get error messages from web pages. These cookies help us improve the performance of our website.
                                        </p>
                                        
                                        <h4 className="title mt--30 mb--15">Functionality Cookies</h4>
                                        <p className="disc">
                                            These cookies allow our website to remember choices you make (such as your user name, language, or region) and provide enhanced, more personal features.
                                        </p>
                                        
                                        <h4 className="title mt--30 mb--15">Targeting/Advertising Cookies</h4>
                                        <p className="disc">
                                            These cookies are used to deliver advertisements more relevant to you and your interests. They are also used to limit the number of times you see an advertisement and help measure the effectiveness of advertising campaigns.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="service-area-details-wrapper border-bottom legal-page" style={{ marginTop: '0', paddingTop: '0px' }}>
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-12">
                                <div className="inner-content">
                                    <div className="mid-content pt--0">
                                        <h3 className="title mt--40 mb--20">Third-Party Cookies</h3>
                                        <p className="disc">
                                            Some cookies on our website are placed by third-party services that appear on our pages. We use various third-party services such as Google Analytics to analyze website usage and improve our services.
                                        </p>
                                        
                                        <h3 className="title mt--40 mb--20">Managing Your Cookie Preferences</h3>
                                        <p className="disc">
                                            Most web browsers automatically accept cookies, but you can modify your browser settings to decline cookies if you prefer. Please note that disabling cookies may affect the functionality of our website and your user experience.
                                        </p>
                                        <p className="disc">
                                            You can manage your cookie preferences through your browser settings:
                                        </p>
                                        <ul className="disc-list">
                                            <li><strong>Chrome:</strong> Settings &gt; Privacy and security &gt; Cookies and other site data</li>
                                            <li><strong>Firefox:</strong> Options &gt; Privacy &amp; Security &gt; Cookies and Site Data</li>
                                            <li><strong>Safari:</strong> Preferences &gt; Privacy &gt; Manage Website Data</li>
                                            <li><strong>Edge:</strong> Settings &gt; Cookies and site permissions &gt; Cookies and site data</li>
                                        </ul>
                                        <style dangerouslySetInnerHTML={{
                                            __html: `
                                                .service-area-details-wrapper .mid-content ul.disc li::marker,
                                                .service-area-details-wrapper .mid-content ul.disc-list li::marker {
                                                    font-size: 20px !important;
                                                    color: #007bff !important;
                                                    font-weight: bold !important;
                                                }
                                                .service-area-details-wrapper .mid-content ul.disc li,
                                                .service-area-details-wrapper .mid-content ul.disc-list li {
                                                    font-size: 20px !important;
                                                    line-height: 1.6 !important;
                                                    margin-bottom: 12px !important;
                                                }
                                                .service-area-details-wrapper .mid-content ul.disc,
                                                .service-area-details-wrapper .mid-content ul.disc-list {
                                                    padding-left: 20px !important;
                                                    list-style-type: disc !important;
                                                }
                                            `
                                        }} />
                                        
                                        <h3 className="title mt--40 mb--20">Cookie Consent</h3>
                                        <p className="disc">
                                            By continuing to use our website, you consent to our use of cookies as described in this policy. When you first visit our website, you will see a cookie consent banner that allows you to accept or decline non-essential cookies.
                                        </p>
                                        
                                        <h3 className="title mt--40 mb--20">Updates to This Policy</h3>
                                        <p className="disc">
                                            We may update this Cookies Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. Please check this page periodically for updates.
                                        </p>
                                        
                                        <h3 className="title mt--40 mb--20">Contact Us</h3>
                                        <p className="disc">
                                            If you have any questions about our use of cookies or this Cookies Policy, please contact us at: enquiries@justjobs.info
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <FooterOne />
            <BackToTop />
        </div>
    );
}
