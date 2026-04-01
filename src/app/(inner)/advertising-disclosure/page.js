"use client";
import BackToTop from "@/components/common/BackToTop";
import Breadcrumb from "@/components/common/Breadcrumb";
import FooterOneDynamic from "@/components/footer/FooterOneDynamic";
import HeaderOne from "@/components/header/HeaderOne";
import DynamicMetaTags from "@/components/common/DynamicMetaTags";
import "../legal-pages.css";

export default function AdvertisingDisclosurePage() {
  return (
    <DynamicMetaTags pageName="Advertising Disclosure">
      <div>
        <HeaderOne />
        <Breadcrumb />

        <div className="service-area-details-wrapper legal-page">
          <div className="container">
            <div className="row">
              <div className="col-lg-12">
                <div className="inner-content">
                  <div className="top">
                    <h1 className="title">Advertising Disclosure</h1>
                    <p className="disc">Last updated: April 1, 2026</p>
                  </div>
                  <div className="mid-content">
                    <p className="disc">
                      justjobs.info participates in online advertising programs,
                      including Google AdSense. We may display third-party ads on
                      some pages of this website.
                    </p>

                    <h3 className="title mt--40 mb--20">How Ads Work</h3>
                    <p className="disc">
                      Ads can be served based on page content, user location, and
                      browsing behavior, subject to your cookie preferences and
                      applicable laws. We do not personally endorse every product or
                      service shown in ads.
                    </p>

                    <h3 className="title mt--40 mb--20">Your Privacy Choices</h3>
                    <p className="disc">
                      You can accept or reject advertising cookies through our cookie
                      consent settings. You can also manage ad personalization in
                      your Google Ads Settings.
                    </p>

                    <h3 className="title mt--40 mb--20">Editorial Independence</h3>
                    <p className="disc">
                      Advertising does not influence our editorial content, job
                      listings, resume resources, or career guidance recommendations.
                    </p>

                    <h3 className="title mt--40 mb--20">Contact</h3>
                    <p className="disc">
                      For questions about advertising on justjobs.info, contact us
                      at enquiries@justjobs.info.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <FooterOneDynamic />
        <BackToTop />
      </div>
    </DynamicMetaTags>
  );
}
