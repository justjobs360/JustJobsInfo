import React from 'react'

function ServiceSingle() {
    const styling = {
        backgroundImage: `url(assets/images/service/06.webp)`,
    };
    return (
        <div>
            <div className="container-large">
                {/* service area start */}
                <div
                    className="service-single-area-banner bg_image jarallax" style={styling}
                    data-jarallax="1.5"
                ></div>
                {/* service area end */}
            </div>

        </div>
    )
}

export default ServiceSingle