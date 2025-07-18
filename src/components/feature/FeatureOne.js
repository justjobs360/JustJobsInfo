"use client";
import React from "react";
import { useEffect } from "react";
import Rellax from "rellax";
function FeatureOne() {
    useEffect(() => {
        if (typeof window !== "undefined") {
            new Rellax(".rellax", { speed: 1 });
        }
    }, []);
    return (
        <div>

            {/* about-iamge-feature-area */}
            <div className="rts-image-feature-area">
                <div className="container-full">
                    <div className="row">
                        <div className="col-lg-6">
                            <div className="thumbnail-about-mid jarallax">
                                <img
                                    className="jarallax-img"
                                    src="assets/images/about/02.webp"
                                    alt="about"
                                />
                            </div>
                        </div>
                        <div className="col-lg-6">
                            <div className="thumbnail-about-mid jarallax">
                                <img
                                    className="jarallax-img"
                                    src="assets/images/about/03.webp"
                                    alt="about"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* about-iamge-feature-area end */}

        </div>
    )
}

export default FeatureOne