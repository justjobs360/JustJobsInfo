
import BackToTop from "@/components/common/BackToTop";
import FooterOne from "@/components/footer/FooterOne";
import HeaderTwo from "@/components/header/HeaderTwo";

export default function Home() {
    return (
        <div className='#'>
            <HeaderTwo />




            <>
                {/* career single banner area start */}
                <div className="career-single-banner-area ptb--60 bg-light">
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-12">
                                <div className="career-page-single-banner center-aligh">
                                    <span className="pre">Technology</span>
                                    <h1 className="title">IT Consultant</h1>
                                    <h3 className="title">
                                        $1000 - $1200 <span>USD/ Monthly</span>
                                    </h3>
                                    <div className="single-career-wrapper">
                                        <div className="single">
                                            <h5 className="title">Position</h5>
                                            <span>IT Consultant</span>
                                        </div>
                                        <div className="single">
                                            <h5 className="title">Location</h5>
                                            <span>1860 Hedge Street</span>
                                        </div>
                                        <div className="single">
                                            <h5 className="title">Employment Type</h5>
                                            <span>Full-time</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* career single banner area end */}
                {/* apply form here */}
                <div className="apply-form-area-start rts-section-gapTop">
                    <div className="container-contact">
                        <div className="row">
                            <div className="col-lg-12">
                                <div className="text-center-title-bg-white">
                                    <h2 className="title">Personal information</h2>
                                    <p>We’d love to hear from you. Please fill out this form.</p>
                                </div>
                            </div>
                            <div className="col-lg-12">
                                <div className="apply-job-form">
                                    <form
                                        className="contact-form"
                                        action="mailer.php"
                                        method="post"
                                        id="contact-form"
                                    >
                                        <div className="half-input-wrapper">
                                            <div className="single">
                                                <label htmlFor="name">First name *</label>
                                                <input
                                                    type="text"
                                                    id="name"
                                                    name="first_name"
                                                    placeholder="First name"
                                                    required=""
                                                />
                                            </div>
                                            <div className="single">
                                                <label htmlFor="last">Last name</label>
                                                <input
                                                    type="text"
                                                    id="last"
                                                    name="last_name"
                                                    placeholder="Last name"
                                                    required=""
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
                                                required=""
                                            />
                                        </div>
                                        <div className="single">
                                            <label htmlFor="headline">Headline (Optional)</label>
                                            <input
                                                type="email"
                                                id="email"
                                                name="headline"
                                                placeholder="Job Headline"
                                                required=""
                                            />
                                        </div>
                                        <div className="single">
                                            <label htmlFor="Location">Current Location (Optional)</label>
                                            <input
                                                type="email"
                                                id="email"
                                                name="Location"
                                                placeholder="Your Location"
                                                required=""
                                            />
                                        </div>
                                        <div className="single">
                                            <label htmlFor="phone">Phone *</label>
                                            <input
                                                type="text"
                                                id="phone"
                                                name="phone"
                                                placeholder="+1 (555) 000-0000"
                                                required=""
                                            />
                                        </div>
                                        <div className="single">
                                            <label htmlFor="message">Summary (Optional)</label>
                                            <textarea
                                                id="message"
                                                name="message"
                                                placeholder="Leave a Summary"
                                                required=""
                                                defaultValue={""}
                                            />
                                        </div>
                                        <label className="filelabel">
                                            <i className="fa fa-paperclip"></i>
                                            <span className="title">Upload Your Cv (Required)</span>
                                            <input
                                                className="FileUpload1"
                                                id="FileInput"
                                                name="booking_attachment"
                                                type="file"
                                            />
                                        </label>
                                        <button type="submit" className="rts-btn btn-primary">
                                            Apply Now
                                        </button>
                                    </form>
                                </div>
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
