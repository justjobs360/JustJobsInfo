import React from 'react'
import Link from 'next/link';
function page() {
    return (

        <>
            {/* rts coming soon area start */}
            <div className="rts-coming-soon-area rts-section-gap d-flex align-items-center h-100-vh">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="page-not-found-main">
                                <h1 className="title">404</h1>
                                <h3 className="para">Page Not Found</h3>
                                <p>
                                    Sorry, the page you seems looking for, has been moved, redirected
                                    or removed permanently.
                                </p>
                                <Link href="/#" className="rts-btn btn-primary">
                                    Go Back Home
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* rts coming soon area end */}
        </>
    )
}

export default page