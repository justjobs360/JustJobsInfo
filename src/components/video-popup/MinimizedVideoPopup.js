"use client"
import React, { useState, useEffect } from 'react';
import './MinimizedVideoPopup.css';

const MinimizedVideoPopup = ({ 
    videoTitle = 'Watch Our Video',
    videoSource = '/justjobsinfo.mp4',
    autoShow = true,
    delay = 3000 // Show after 3 seconds
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isMinimized, setIsMinimized] = useState(true);
    const [isMaximized, setIsMaximized] = useState(false);
    const [isClosed, setIsClosed] = useState(false);
    const [gdprBannerHeight, setGdprBannerHeight] = useState(0);
    const [videoError, setVideoError] = useState(false);

    // Get the clean video source without query params
    const getCleanVideoSource = (source) => {
        return source.includes('?') ? source.split('?')[0] : source;
    };

    useEffect(() => {
        // Check if GDPR banner exists and get its height
        const checkGdprBanner = () => {
            const gdprBanner = document.querySelector('.gdpr-consent-banner');
            if (gdprBanner) {
                const height = gdprBanner.offsetHeight;
                setGdprBannerHeight(height);
            } else {
                setGdprBannerHeight(0);
            }
        };

        // Initial check
        checkGdprBanner();

        // Watch for GDPR banner changes
        const observer = new MutationObserver(checkGdprBanner);
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        // Check if user has closed the video before (stored in localStorage)
        // Use page-specific key to allow different videos on different pages
        const storageKey = `videoPopupClosed_${videoSource}`;
        const hasClosedBefore = localStorage.getItem(storageKey);
        
        if (autoShow && !hasClosedBefore && !isClosed) {
            const timer = setTimeout(() => {
                setIsVisible(true);
            }, delay);
            return () => clearTimeout(timer);
        }
    }, [autoShow, delay, isClosed, videoSource]);

    const handleClose = () => {
        setIsClosed(true);
        setIsVisible(false);
        setIsMaximized(false);
        // Restore body scroll
        if (typeof window !== 'undefined') {
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.width = '';
        }
        // Remember user's preference (page-specific)
        const storageKey = `videoPopupClosed_${videoSource}`;
        localStorage.setItem(storageKey, 'true');
    };

    const handleToggleMinimize = () => {
        setIsMinimized(!isMinimized);
        setIsMaximized(false);
        // Restore body scroll
        if (typeof window !== 'undefined') {
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.width = '';
        }
    };

    const handleExpand = () => {
        // On mobile, expand to YouTube-style player (not fullscreen)
        setIsMinimized(false);
        setIsMaximized(false);
    };

    const handleToggleMaximize = () => {
        const newMaximized = !isMaximized;
        setIsMaximized(newMaximized);
        setIsMinimized(false);
        
        // Lock body scroll on mobile when maximized
        if (typeof window !== 'undefined') {
            if (window.innerWidth <= 768 && newMaximized) {
                document.body.style.overflow = 'hidden';
                document.body.style.position = 'fixed';
                document.body.style.width = '100%';
            } else {
                document.body.style.overflow = '';
                document.body.style.position = '';
                document.body.style.width = '';
            }
        }
    };

    if (isClosed || !isVisible) {
        return null;
    }

    return (
        <div 
            className={`minimized-video-popup ${isMinimized ? 'minimized' : isMaximized ? 'maximized' : 'expanded'}`}
            style={
                !isMaximized ? {
                    bottom: gdprBannerHeight > 0 ? `${gdprBannerHeight + 20}px` : '20px'
                } : {}
            }
        >
            {isMinimized ? (
                // Minimized state - YouTube style
                <div className="minimized-player" onClick={handleExpand}>
                    <div className="video-thumbnail">
                        <video 
                            src={getCleanVideoSource(videoSource)}
                            muted
                            loop
                            playsInline
                            autoPlay
                            preload="metadata"
                            className="thumbnail-video"
                            key={`thumbnail-${videoSource}`}
                            onLoadStart={() => {
                                console.log('Loading thumbnail video:', getCleanVideoSource(videoSource));
                            }}
                            onLoadedData={() => {
                                console.log('Thumbnail video loaded successfully');
                                setVideoError(false);
                            }}
                            onError={(e) => {
                                console.error('Thumbnail video load error:', e);
                                console.error('Video source:', getCleanVideoSource(videoSource));
                                console.error('Full video element:', e.target);
                                setVideoError(true);
                            }}
                        />
                        <div className="play-overlay">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                                <path d="M8 5v14l11-7z"/>
                            </svg>
                        </div>
                    </div>
                    <div className="video-info">
                        <p className="video-title-minimized" style={{ textAlign: 'left' }}>{videoTitle}</p>
                    </div>
                    <button 
                        className="close-btn-minimized" 
                        onClick={(e) => {
                            e.stopPropagation();
                            handleClose();
                        }}
                        aria-label="Close video"
                    >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M12.854 3.146a.5.5 0 0 0-.708 0L8 7.293 3.854 3.146a.5.5 0 1 0-.708.708L7.293 8l-4.147 4.146a.5.5 0 0 0 .708.708L8 8.707l4.146 4.147a.5.5 0 0 0 .708-.708L8.707 8l4.147-4.146a.5.5 0 0 0 0-.708z"/>
                        </svg>
                    </button>
                </div>
            ) : (
                // Expanded state
                <div className="expanded-player">
                    <div className="player-header">
                        <span className="video-title-expanded">{videoTitle}</span>
                        <div className="player-controls">
                            {!isMaximized && (
                                <button 
                                    className="maximize-btn" 
                                    onClick={handleToggleMaximize}
                                    aria-label="Maximize video"
                                >
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                        <path d="M3 3.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5v-9zM4 4v8h8V4H4z"/>
                                        <path d="M4.5 2a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 1 0V3h1a.5.5 0 0 0 0-1h-1.5a.5.5 0 0 0-.5.5zm9 0a.5.5 0 0 0-.5-.5h-1.5a.5.5 0 0 0 0 1H12v.5a.5.5 0 0 0 1 0v-1a.5.5 0 0 0-.5-.5zM2 11.5a.5.5 0 0 0 .5.5h1.5a.5.5 0 0 0 0-1H3v-.5a.5.5 0 0 0-1 0v1zm11.5.5a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-1 0v.5h-.5a.5.5 0 0 0 0 1h1z"/>
                                    </svg>
                                </button>
                            )}
                            {isMaximized && (
                                <button 
                                    className="restore-btn" 
                                    onClick={handleToggleMaximize}
                                    aria-label="Restore video"
                                >
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                        <path d="M5.5 2a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 1 0V3h1a.5.5 0 0 0 0-1h-1.5a.5.5 0 0 0-.5.5zm9 0a.5.5 0 0 0-.5-.5h-1.5a.5.5 0 0 0 0 1H12v.5a.5.5 0 0 0 1 0v-1a.5.5 0 0 0-.5-.5zM2 10.5a.5.5 0 0 0 .5.5h1.5a.5.5 0 0 0 0-1H3v-.5a.5.5 0 0 0-1 0v1zm11.5.5a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-1 0v.5h-.5a.5.5 0 0 0 0 1h1z"/>
                                        <path d="M4 4v8h8V4H4zm1 7V5h6v6H5z"/>
                                    </svg>
                                </button>
                            )}
                            <button 
                                className="minimize-btn" 
                                onClick={handleToggleMinimize}
                                aria-label="Minimize video"
                            >
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                    <path d="M2 8a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11A.5.5 0 0 1 2 8z"/>
                                </svg>
                            </button>
                            <button 
                                className="close-btn-expanded" 
                                onClick={handleClose}
                                aria-label="Close video"
                            >
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                    <path d="M12.854 3.146a.5.5 0 0 0-.708 0L8 7.293 3.854 3.146a.5.5 0 1 0-.708.708L7.293 8l-4.147 4.146a.5.5 0 0 0 .708.708L8 8.707l4.146 4.147a.5.5 0 0 0 .708-.708L8.707 8l4.147-4.146a.5.5 0 0 0 0-.708z"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div className="video-container">
                        <video
                            src={getCleanVideoSource(videoSource)}
                            controls
                            autoPlay
                            playsInline
                            className="main-video-player"
                            preload="auto"
                            key={`main-${videoSource}`}
                            onLoadStart={() => {
                                console.log('Loading main video:', getCleanVideoSource(videoSource));
                            }}
                            onLoadedData={() => {
                                console.log('Main video loaded successfully');
                                setVideoError(false);
                            }}
                            onError={(e) => {
                                console.error('Main video load error:', e);
                                console.error('Video source:', getCleanVideoSource(videoSource));
                                console.error('Full video element:', e.target);
                                console.error('Network state:', e.target.networkState);
                                console.error('Ready state:', e.target.readyState);
                                setVideoError(true);
                            }}
                        >
                            Your browser does not support the video tag.
                        </video>
                        {videoError && (
                            <div style={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                color: 'white',
                                textAlign: 'center',
                                padding: '20px'
                            }}>
                                <p>⚠️ Video failed to load</p>
                                <p style={{ fontSize: '12px', marginTop: '10px' }}>
                                    Source: {getCleanVideoSource(videoSource)}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MinimizedVideoPopup;

