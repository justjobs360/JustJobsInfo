"use client"
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import ModalVideo from 'react-modal-video';
import 'react-modal-video/css/modal-video.min.css';
import { ReactSVG } from 'react-svg';
function LargeVideoTwo() {
    const [isOpen, setIsOpen] = useState(false);
    const videoLink = 'https://www.youtube.com/watch?v=tVbtTL_sJHI'; // Define the video link here
    const [videoId, setVideoId] = useState(null);
    useEffect(() => {
        // Extract the video ID from the video link
        if (videoLink) {
            const urlParts = videoLink.split('v='); // Assuming YouTube URL with 'v=' param
            const id = urlParts.length > 1 ? urlParts[1].split('&')[0] : null;
            setVideoId(id);
        }
    }, [videoLink]);
    // Console log to debug
    console.log('Video ID:', videoId);
    return (
        <div>
            <div className="video-counter-bg">
                {/* large video-area */}
                <div className="large-video-area rts-bg-video position-relative">
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-12">
                                <div className="rts-bg-video-area-large jarallax">
                                    <div className="vedio-icone">
                                        <Link href={'#'} className="vedio-icone">
                                            <span id="play-video" className="video-play-button" onClick={() => setIsOpen(true)}>
                                                {/* <img
                                                        src="assets/images/about/shape/play-btn.png"
                                                        alt="Play btn"
                                                    /> */}
                                                <span />
                                            </span>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* large video-area end */}
                {/* rts Counter area start */}
                <div className="rts-counter-area">
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-12">
                                <div className="counter-up-wrapper-5">
                                    <div className="single-counter-area">
                                        <h3 className="title">
                                            <span className="counter">240</span>+
                                        </h3>
                                        <p>Satisfied Clients</p>
                                    </div>
                                    <div className="single-counter-area">
                                        <h3 className="title">
                                            <span className="counter">20</span>%
                                        </h3>
                                        <p>Growing Potentiel</p>
                                    </div>
                                    <div className="single-counter-area">
                                        <h3 className="title">
                                            <span className="counter">24</span>+
                                        </h3>
                                        <p>Headquarters</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* rts Counter area end */}
            </div>
            {videoId && (
                <ModalVideo
                    channel="youtube"
                    isOpen={isOpen}
                    videoId={videoId} // Pass the dynamic video ID here
                    onClose={() => setIsOpen(false)}
                />
            )}
        </div>
    )
}

export default LargeVideoTwo