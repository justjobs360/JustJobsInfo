"use client"
import { useState, useEffect } from 'react';

const BackToTop = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const initializeProgress = () => {
            try {
                const progressPath = document.querySelector('.progress-circle path');
                if (!progressPath) {
                    return null; // Element not found
                }

                const pathLength = progressPath.getTotalLength();
                progressPath.style.strokeDasharray = `${pathLength} ${pathLength}`;
                progressPath.style.strokeDashoffset = pathLength;

                const updateProgress = () => {
                    const scroll = window.pageYOffset;
                    const height = document.documentElement.scrollHeight - window.innerHeight;
                    const progress = pathLength - (scroll * pathLength / height);
                    
                    if (progressPath && progressPath.style) {
                        progressPath.style.strokeDashoffset = progress;
                    }

                    // Show/hide back to top button
                    setIsVisible(scroll > 50);
                };

                window.addEventListener('scroll', updateProgress);
                updateProgress(); // Call initially to set progress

                return () => {
                    window.removeEventListener('scroll', updateProgress);
                };
            } catch (error) {
                console.warn('Error initializing progress animation:', error);
            }
        };

        // Try to initialize immediately
        const cleanup = initializeProgress();
        
        // If no cleanup function (element not found), try again after a short delay
        if (!cleanup) {
            const timeoutId = setTimeout(() => {
                initializeProgress();
            }, 100);
            
            return () => {
                clearTimeout(timeoutId);
            };
        }

        return cleanup;
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    return (
        <>
            {/* Back to Top Button with Progress Circle */}
            <div className={`progress-wrap ${isVisible ? 'active-progress' : ''}`}>
                <svg 
                    className="progress-circle svg-content" 
                    width="100%" 
                    height="100%" 
                    viewBox="-1 -1 102 102"
                    onClick={scrollToTop}
                    style={{ cursor: 'pointer' }}
                >
                    <path 
                        d="M50,1 a49,49 0 0,1 0,98 a49,49 0 0,1 0,-98" 
                        style={{
                            transition: 'stroke-dashoffset 10ms linear',
                            stroke: '#2148ff',
                            strokeWidth: '2px',
                            fill: 'none'
                        }}
                    />
                </svg>
            </div>

            <style jsx>{`
                .progress-wrap {
                    position: fixed;
                    right: 30px;
                    bottom: 30px;
                    height: 50px;
                    width: 50px;
                    cursor: pointer;
                    display: block;
                    border-radius: 50%;
                    box-shadow: 0 4px 15px rgba(33, 72, 255, 0.3);
                    background-color: #ffffff;
                    z-index: 1000;
                    opacity: 0;
                    visibility: hidden;
                    transform: translateY(15px);
                    transition: all 0.3s ease;
                }

                .progress-wrap.active-progress {
                    opacity: 1;
                    visibility: visible;
                    transform: translateY(0);
                }

                .progress-wrap:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 6px 20px rgba(33, 72, 255, 0.4);
                }

                .progress-wrap-icon {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    color: #2148ff;
                    font-size: 16px;
                    font-weight: bold;
                }

                .progress-circle {
                    position: absolute;
                    top: 0;
                    left: 0;
                }

                @media (max-width: 768px) {
                    .progress-wrap {
                        right: 20px;
                        bottom: 20px;
                        height: 45px;
                        width: 45px;
                    }
                }
            `}</style>
        </>
    );
};

export default BackToTop;
