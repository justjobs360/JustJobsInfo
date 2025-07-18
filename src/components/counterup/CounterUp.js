import React from 'react'

function CounterUp() {
    return (
        <div>
            {/* counter area start */}
            <div className="counter-up-wrapper">
                <div className="container-full">
                    <div className="row g-0">
                        <div className="col-lg-3 col-md-4 col-sm-6 col-12">
                            <div className="single-counter-up-one">
                                <p>CV Enhancement</p>
                                <h3 className="title">
                                    +<span className="counter">146</span>%
                                </h3>
                            </div>
                        </div>
                        <div className="col-lg-3 col-md-4 col-sm-6 col-12">
                            <div className="single-counter-up-one">
                                <p>Community users</p>
                                <h3 className="title">
                                    <span className="counter">100</span>K
                                </h3>
                            </div>
                        </div>
                        <div className="col-lg-3 col-md-4 col-sm-6 col-12">
                            <div className="single-counter-up-one">
                                <p>Audit Improvements</p>
                                <h3 className="title">
                                    <span className="counter">89</span>%
                                </h3>
                            </div>
                        </div>
                        <div className="col-lg-3 col-md-4 col-sm-6 col-12">
                            <div className="single-counter-up-one">
                                <p>Job Openings</p>
                                <h3 className="title">
                                    <span className="counter">7200</span>+
                                </h3>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* counter area end */}
        </div>
    )
}

export default CounterUp