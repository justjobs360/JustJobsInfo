import React from 'react'

function ServiceList() {
  return (
<>
  {/* service-we-provice-area start */}
  <div className="rts-service-provide-area rts-section-gap">
    <div className="container-s-float">
      <div className="row">
        <div className="col-lg-12">
          <div
            className="single-service-list wow fadeInUp"
            data-wow-offset={120}
            data-wow-delay=".2s"
          >
            <div className="icon">
              <img src="assets/images/service/icons/42.svg" alt="service" />
            </div>
            <div className="main-information-area">
              <h3 className="title">Resume Audit & Enhancement</h3>
              <p className="disc">
              Get expert feedback and actionable tips to polish your resume and stand out in job applications.
              </p>
            </div>
            <a href="#" className="arrow-btn">
              <img src="assets/images/service/icons/13.svg" alt="service" />
            </a>
          </div>
          <div
            className="single-service-list wow fadeInUp"
            data-wow-offset={120}
            data-wow-delay=".4s"
          >
            <div className="icon">
              <img src="assets/images/service/icons/43.svg" alt="service" />
            </div>
            <div className="main-information-area">
              <h3 className="title">Custom Resume Builder</h3>
              <p className="disc">
              Create professional, ATS-friendly resumes quickly using our intuitive online builder designed for all career stages.
              </p>
            </div>
            <a href="#" className="arrow-btn">
              <img src="assets/images/service/icons/13.svg" alt="service" />
            </a>
          </div>
          <div
            className="single-service-list wow fadeInUp"
            data-wow-offset={120}
            data-wow-delay=".6s"
          >
            <div className="icon">
              <img src="assets/images/service/icons/44.svg" alt="service" />
            </div>
            <div className="main-information-area">
              <h3 className="title">Extensive Job Listings</h3>
              <p className="disc">
              Discover the latest job openings across multiple industries and locations tailored to your skills and goals.
              </p>
            </div>
            <a href="#" className="arrow-btn">
              <img src="assets/images/service/icons/13.svg" alt="service" />
            </a>
          </div>
          <div
            className="single-service-list wow fadeInUp"
            data-wow-offset={120}
            data-wow-delay=".8s"
          >
            <div className="icon">
              <img src="assets/images/service/icons/45.svg" alt="service" />
            </div>
            <div className="main-information-area">
              <h3 className="title">Career Resources & Guidance</h3>
              <p className="disc">
              Access articles, tutorials, and expert advice to navigate job searches, interviews, and career growth.
              </p>
            </div>
            <a href="#" className="arrow-btn">
              <img src="assets/images/service/icons/13.svg" alt="service" />
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
  {/* service-we-provice-area end */}
</>

  )
}

export default ServiceList