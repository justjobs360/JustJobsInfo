"use client";
import React, { useState, useEffect } from 'react';

const GDPRConsent = () => {
    const [showBanner, setShowBanner] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [preferences, setPreferences] = useState({
        essential: true, // Always required
        functional: false,
        analytics: false
    });

    useEffect(() => {
        // Check if user has already given consent
        const consent = localStorage.getItem('gdpr-consent');
        if (!consent) {
            setShowBanner(true);
        }

        // Check screen size for mobile responsiveness
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);

        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const handleAcceptAll = () => {
        const consent = {
            essential: true,
            functional: true,
            analytics: true,
            timestamp: new Date().toISOString()
        };
        localStorage.setItem('gdpr-consent', JSON.stringify(consent));
        setShowBanner(false);
    };

    const handleAcceptSelected = () => {
        const consent = {
            ...preferences,
            timestamp: new Date().toISOString()
        };
        localStorage.setItem('gdpr-consent', JSON.stringify(consent));
        setShowBanner(false);
    };

    const handleDecline = () => {
        const consent = {
            essential: true, // Essential cookies are always required
            functional: false,
            analytics: false,
            timestamp: new Date().toISOString()
        };
        localStorage.setItem('gdpr-consent', JSON.stringify(consent));
        setShowBanner(false);
    };

    const handlePreferenceChange = (type) => {
        if (type === 'essential') return; // Essential cannot be disabled
        setPreferences(prev => ({
            ...prev,
            [type]: !prev[type]
        }));
    };

    // Modern Elegant Toggle Switch Component
    const ToggleSwitch = ({ checked, onChange, disabled = false }) => (
        <div
            onClick={() => !disabled && onChange()}
            style={{
                position: 'relative',
                width: isMobile ? '44px' : '48px',
                height: isMobile ? '24px' : '28px',
                background: checked ? '#2563eb' : '#e5e7eb',
                borderRadius: '999px',
                cursor: disabled ? 'not-allowed' : 'pointer',
                transition: 'background 0.25s cubic-bezier(.4,0,.2,1)',
                display: 'flex',
                alignItems: 'center',
                padding: '0 3px',
                boxShadow: checked ? '0 2px 8px rgba(37,99,235,0.10)' : '0 1px 4px rgba(0,0,0,0.06)',
                opacity: disabled ? 0.6 : 1,
                border: 'none',
                flexShrink: 0
            }}
        >
            <div
                style={{
                    width: isMobile ? '22px' : '24px',
                    height: isMobile ? '22px' : '24px',
                    background: '#fff',
                    borderRadius: '50%',
                    transform: checked ? `translateX(${isMobile ? '20px' : '20px'})` : 'translateX(0)',
                    transition: 'background 0.25s cubic-bezier(.4,0,.2,1), transform 0.25s cubic-bezier(.4,0,.2,1)',
                    boxShadow: checked ? '0 2px 8px rgba(37,99,235,0.15)' : '0 1px 4px rgba(0,0,0,0.10)',
                    border: '1.5px solid #f3f4f6',
                }}
            />
        </div>
    );

    if (!showBanner) return null;

    return (
        <>
            <div className="gdpr-consent-banner" style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                background: '#fff',
                color: '#222',
                borderTop: '1px solid #ddd',
                padding: isMobile ? '12px 10px' : '16px 24px',
                zIndex: 9999,
                fontFamily: 'inherit',
                fontSize: isMobile ? '13px' : '15px',
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                alignItems: isMobile ? 'flex-start' : 'center',
                justifyContent: 'space-between',
                gap: isMobile ? '10px' : '24px',
                filter: showDetails ? 'blur(2px)' : 'none',
                pointerEvents: showDetails ? 'none' : 'auto',
            }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <strong style={{ display: 'block', marginBottom: 4 }}>Your Privacy</strong>
                    <span>
                        By clicking &#39;Accept All Cookies&#39; you agree to the storing of cookies on your device to enhance site navigation, analyze site usage, and assist in our marketing efforts.
                        <a href="/privacy-policy" style={{ color: '#0056b3', textDecoration: 'underline', marginLeft: 6 }}>Learn More</a>
                    </span>
                </div>
                <div style={{ 
                    display: 'flex', 
                    flexDirection: isMobile ? 'column' : 'row',
                    gap: isMobile ? '8px' : '12px',
                    alignItems: 'center',
                    minWidth: isMobile ? '100%' : '360px', 
                    justifyContent: 'flex-end',
                    width: isMobile ? '100%' : undefined
                }}>
                    <button onClick={handleDecline} style={{
                        background: 'none',
                        border: '1px solid #222',
                        color: '#222',
                        padding: '10px 0',
                        borderRadius: 4,
                        cursor: 'pointer',
                        fontWeight: 500,
                        fontSize: '15px',
                        width: isMobile ? '100%' : '140px',
                        minWidth: isMobile ? undefined : '140px',
                        textAlign: 'center',
                        transition: 'background 0.2s, color 0.2s',
                        marginBottom: isMobile ? '0' : undefined
                    }}>Reject</button>
                    <button onClick={() => setShowDetails(true)} style={{
                        background: 'none',
                        border: '1px solid #222',
                        color: '#222',
                        padding: '10px 0',
                        borderRadius: 4,
                        cursor: 'pointer',
                        fontWeight: 500,
                        fontSize: '15px',
                        width: isMobile ? '100%' : '140px',
                        minWidth: isMobile ? undefined : '140px',
                        textAlign: 'center',
                        transition: 'background 0.2s, color 0.2s',
                        marginBottom: isMobile ? '0' : undefined
                    }}>Cookie Settings</button>
                    <button onClick={handleAcceptAll} style={{
                        background: '#222',
                        border: '1px solid #222',
                        color: '#fff',
                        padding: '10px 0',
                        borderRadius: 4,
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: '15px',
                        width: isMobile ? '100%' : '140px',
                        minWidth: isMobile ? undefined : '140px',
                        textAlign: 'center',
                        transition: 'background 0.2s, color 0.2s',
                        marginBottom: isMobile ? '0' : undefined
                    }}>Accept All Cookies</button>
                </div>
            </div>
            {showDetails && (
                <>
                    {/* Backdrop */}
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        background: 'rgba(0,0,0,0.35)',
                        zIndex: 10000,
                    }} onClick={() => setShowDetails(false)} />
                    {/* Modal */}
                    <div style={{
                        position: 'fixed',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        background: '#f8f9fa',
                        borderRadius: isMobile ? '12px' : '16px',
                        border: '1px solid #ddd',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
                        zIndex: 10001,
                        width: isMobile ? '95vw' : '800px',
                        maxWidth: '98vw',
                        padding: isMobile ? '20px' : '40px',
                        maxHeight: '90vh',
                        overflowY: 'auto',
                    }} onClick={e => e.stopPropagation()}>
                        <h4 style={{
                            margin: '0 0 20px 0',
                            fontSize: isMobile ? '18px' : '20px',
                            fontWeight: '600',
                            color: '#222',
                            letterSpacing: '-0.01em',
                            textAlign: 'center'
                        }}>
                            Cookie Preferences
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '16px' : '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: isMobile ? '12px' : '20px' }}>
                                <div style={{ marginTop: '2px' }}>
                                    <ToggleSwitch
                                        checked={preferences.essential}
                                        onChange={() => {}}
                                        disabled={true}
                                    />
                                </div>
                                <div style={{ flex: '1' }}>
                                    <strong style={{
                                        fontSize: isMobile ? '14px' : '16px',
                                        fontWeight: '600',
                                        color: '#222',
                                        display: 'block',
                                        marginBottom: '6px',
                                        letterSpacing: '0.01em'
                                    }}>
                                        Essential Cookies
                                    </strong>
                                    <p style={{
                                        margin: '0',
                                        fontSize: isMobile ? '13px' : '15px',
                                        color: '#666',
                                        lineHeight: '1.6',
                                        fontWeight: '400'
                                    }}>
                                        {isMobile
                                            ? "Required for basic site functionality, authentication, and security. Cannot be disabled."
                                            : "Required for basic site functionality, authentication, and security. These cookies enable core features like user login, session management, and security measures. They cannot be disabled as they are necessary for the website to function properly."
                                        }
                                    </p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: isMobile ? '12px' : '20px' }}>
                                <div style={{ marginTop: '2px' }}>
                                    <ToggleSwitch
                                        checked={preferences.functional}
                                        onChange={() => handlePreferenceChange('functional')}
                                    />
                                </div>
                                <div style={{ flex: '1' }}>
                                    <strong style={{
                                        fontSize: isMobile ? '14px' : '16px',
                                        fontWeight: '600',
                                        color: '#222',
                                        display: 'block',
                                        marginBottom: '6px',
                                        letterSpacing: '0.01em'
                                    }}>
                                        Functional Cookies
                                    </strong>
                                    <p style={{
                                        margin: '0',
                                        fontSize: isMobile ? '13px' : '15px',
                                        color: '#666',
                                        lineHeight: '1.6',
                                        fontWeight: '400'
                                    }}>
                                        {isMobile
                                            ? "Enable resume saving, job bookmarks, and personalized preferences."
                                            : "Enable enhanced functionality and personalization. These cookies allow us to save your resume drafts, remember your job bookmarks, store your application preferences, and provide a more personalized experience tailored to your needs."
                                        }
                                    </p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: isMobile ? '12px' : '20px' }}>
                                <div style={{ marginTop: '2px' }}>
                                    <ToggleSwitch
                                        checked={preferences.analytics}
                                        onChange={() => handlePreferenceChange('analytics')}
                                    />
                                </div>
                                <div style={{ flex: '1' }}>
                                    <strong style={{
                                        fontSize: isMobile ? '14px' : '16px',
                                        fontWeight: '600',
                                        color: '#222',
                                        display: 'block',
                                        marginBottom: '6px',
                                        letterSpacing: '0.01em'
                                    }}>
                                        Analytics Cookies
                                    </strong>
                                    <p style={{
                                        margin: '0',
                                        fontSize: isMobile ? '13px' : '15px',
                                        color: '#666',
                                        lineHeight: '1.6',
                                        fontWeight: '400'
                                    }}>
                                        {isMobile
                                            ? "Help us improve our services by collecting anonymous usage data."
                                            : "Help us improve our services by collecting anonymous usage data. These cookies provide insights into how users interact with our platform, helping us optimize performance, identify popular features, and enhance the overall user experience. No personal information is collected."
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '12px', marginTop: '20px', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => setShowDetails(false)}
                                style={{
                                    background: 'none',
                                    border: '1px solid #222',
                                    color: '#222',
                                    padding: '10px 0',
                                    borderRadius: 4,
                                    cursor: 'pointer',
                                    fontWeight: 500,
                                    fontSize: '15px',
                                    width: '140px',
                                    minWidth: '140px',
                                    textAlign: 'center',
                                    transition: 'background 0.2s, color 0.2s',
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAcceptSelected}
                                style={{
                                    background: '#222',
                                    border: '1px solid #222',
                                    color: '#fff',
                                    padding: '10px 0',
                                    borderRadius: 4,
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                    fontSize: '15px',
                                    width: '140px',
                                    minWidth: '140px',
                                    textAlign: 'center',
                                    transition: 'background 0.2s, color 0.2s',
                                }}
                            >
                                Save Preferences
                            </button>
                        </div>
                    </div>
                </>
            )}
        </>
    );
};

export default GDPRConsent; 
