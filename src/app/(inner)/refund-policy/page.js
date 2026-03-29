'use client';

import BackToTop from '@/components/common/BackToTop';
import Breadcrumb from '@/components/common/Breadcrumb';
import FooterOneDynamic from '@/components/footer/FooterOneDynamic';
import HeaderTwo from '@/components/header/HeaderOne';
import '../legal-pages.css';

export default function RefundPolicyPage() {
  return (
    <div>
      <HeaderTwo />
      <Breadcrumb />

      <div className="container-large">
        <div className="service-single-area-banner bg_image jarallax" data-jarallax="1.5" />
      </div>

      <div>
        <div className="service-area-details-wrapper legal-page">
          <div className="container">
            <div className="row">
              <div className="col-lg-12">
                <div className="inner-content">
                  <div className="top">
                    <h1 className="title">Refund Policy</h1>
                    <p className="disc">
                      This Refund Policy describes how refunds may apply when you use paid or premium features on
                      justjobs.info, if and when they are offered.
                    </p>
                    <p className="disc">Last updated: January 15, 2026</p>
                  </div>
                  <div className="mid-content" style={{ marginBottom: 0, paddingBottom: 0 }}>
                    <h3 className="title mt--40 mb--20">Scope</h3>
                    <p className="disc">
                      JustJobsInfo (<strong>we</strong>, <strong>us</strong>) provides career tools and information
                      through justjobs.info (the <strong>Service</strong>). Many parts of the Service are free. If you
                      purchase a paid product, subscription, or one-time service from us, this policy explains refund
                      eligibility unless a separate agreement or checkout terms say otherwise.
                    </p>

                    <h3 className="title mt--40 mb--20">Eligibility</h3>
                    <p className="disc">
                      Refund rules depend on the specific product you bought. Where required by law, you will receive
                      any refund you are legally entitled to. Where we offer a voluntary satisfaction guarantee, we
                      will honor the terms shown at purchase.
                    </p>
                    <ul className="disc-list">
                      <li>
                        If a payment was taken in error or you were charged twice for the same purchase, contact us
                        and we will investigate and correct it.
                      </li>
                      <li>
                        For subscriptions, you may cancel renewal at any time through your account or payment provider;
                        cancellation stops future charges but does not always refund the current billing period unless
                        stated at purchase or required by law.
                      </li>
                      <li>
                        We do not guarantee refunds for change of mind if the product or service was delivered as
                        described, except where our checkout terms or applicable law provide otherwise.
                      </li>
                    </ul>

                    <h3 className="title mt--40 mb--20">How to request a refund</h3>
                    <p className="disc">
                      Email <strong>enquiries@justjobs.info</strong> with the email you used to pay, the date of
                      purchase, and a short description of the issue. We aim to respond within a reasonable time.
                    </p>

                    <h3 className="title mt--40 mb--20">Processing</h3>
                    <p className="disc">
                      Approved refunds are returned to the original payment method when possible. Timing may depend on
                      your bank or card issuer.
                    </p>

                    <h3 className="title mt--40 mb--20">Changes</h3>
                    <p className="disc">
                      We may update this Refund Policy from time to time. The &quot;Last updated&quot; date above will
                      change when we do. Continued use of paid features after changes constitutes acceptance where
                      permitted by law.
                    </p>

                    <h3 className="title mt--40 mb--20">Contact</h3>
                    <p className="disc">
                      Questions about refunds: <strong>enquiries@justjobs.info</strong>
                    </p>
                    <style
                      dangerouslySetInnerHTML={{
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
                                            `,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <FooterOneDynamic />
      <BackToTop />
    </div>
  );
}
