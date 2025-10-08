"use client"
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import ModalVideo from 'react-modal-video';
import 'react-modal-video/css/modal-video.min.css';
import { ReactSVG } from 'react-svg';
function LargeVideo() {

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
            {/* large video area start */}
            <div className="alrge-video-area rts-section-gap">
                
                <div className="container-large">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="title-video-top banner-wrapper-one">
                                <p className="large">
                                Effortless Resume <span>Audits</span>, Elevated by AI Precision. 
                                    
                                </p>
                                <p>
                                Because adding complexity to your resume audits would likely be confusing. We&apos;re here to simplify it with clarity and precision.
                                </p>
                            </div>
                        </div>
                        
                        
                    </div>
                </div>
            </div>
           
        </div>
    )
}

export default LargeVideo
