"use client";
import React from "react";

function LargeImage() {
    const styling = {
        backgroundImage: `url(assets/images/service/05.webp)`,
    };
    return (
        <>
            {/* large iamge area start */}
            <div className="large-image-area-bg-service-page jarallax rts-section-gap" style={styling}>
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12"></div>
                    </div>
                </div>
            </div>
            {/* large iamge area end */}
        </>
    )
}

export default LargeImage