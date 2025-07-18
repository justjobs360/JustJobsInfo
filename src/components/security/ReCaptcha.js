'use client';

import { useEffect, useRef, useState } from 'react';

const ReCaptcha = ({ onVerify, onError, onExpire }) => {
    const recaptchaRef = useRef(null);
    const widgetIdRef = useRef(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [error, setError] = useState(null);
    const [isRendered, setIsRendered] = useState(false);
    const mounted = useRef(true);

    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
    
    useEffect(() => {
        mounted.current = true;
        return () => {
            mounted.current = false;
            // Clean up widget on unmount
            if (widgetIdRef.current !== null && window.grecaptcha) {
                try {
                    window.grecaptcha.reset(widgetIdRef.current);
                } catch (e) {
                    // Silent cleanup
                }
            }
        };
    }, []);

    useEffect(() => {
        if (!siteKey) {
            const errorMsg = 'reCAPTCHA site key is not configured';
            setError(errorMsg);
            onError?.(errorMsg);
            return;
        }

        let checkInterval;
        let retryCount = 0;
        const maxRetries = 10;

        const loadScript = () => {
            // Check if script already exists
            if (document.querySelector('script[src*="recaptcha"]')) {
                checkLoaded();
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://www.google.com/recaptcha/api.js';
            script.async = true;
            script.defer = true;
            
            script.onload = () => {
                if (mounted.current) {
                    checkLoaded();
                }
            };
            
            script.onerror = () => {
                if (mounted.current) {
                    retryCount++;
                    if (retryCount < maxRetries) {
                        // Retry loading the script after a short delay
                        setTimeout(() => {
                            if (mounted.current) {
                                loadScript();
                            }
                        }, 2000);
                    } else {
                        const errorMsg = 'Failed to load reCAPTCHA script after multiple attempts';
                        setError(errorMsg);
                        onError?.(errorMsg);
                    }
                }
            };
            
            document.head.appendChild(script);
        };

        const checkLoaded = () => {
            if (window.grecaptcha && window.grecaptcha.render) {
                if (mounted.current) {
                    setIsLoaded(true);
                    clearInterval(checkInterval);
                }
                return;
            }

            // Set up interval to check for API readiness with exponential backoff
            let checkDelay = 100;
            checkInterval = setInterval(() => {
                if (window.grecaptcha && window.grecaptcha.render) {
                    if (mounted.current) {
                        setIsLoaded(true);
                        clearInterval(checkInterval);
                    }
                } else {
                    // Increase delay gradually to avoid overwhelming the system
                    checkDelay = Math.min(checkDelay * 1.1, 2000);
                    clearInterval(checkInterval);
                    checkInterval = setInterval(() => {
                        if (window.grecaptcha && window.grecaptcha.render) {
                            if (mounted.current) {
                                setIsLoaded(true);
                                clearInterval(checkInterval);
                            }
                        }
                    }, checkDelay);
                }
            }, checkDelay);
        };

        loadScript();

        return () => {
            clearInterval(checkInterval);
        };
    }, [siteKey, onError]);

    useEffect(() => {
        if (!isLoaded || !recaptchaRef.current || isRendered) {
            return;
        }

        const renderRecaptcha = () => {
            try {
                // Check if element already has reCAPTCHA content
                if (recaptchaRef.current.innerHTML.trim() !== '') {
                    return;
                }

                // Extra delay to ensure DOM is ready
                setTimeout(() => {
                    if (!mounted.current || !recaptchaRef.current || isRendered) {
                        return;
                    }

                    try {
                        const widgetId = window.grecaptcha.render(recaptchaRef.current, {
                            sitekey: siteKey,
                            callback: (token) => {
                                onVerify?.(token);
                            },
                            'expired-callback': () => {
                                onExpire?.();
                            },
                            'error-callback': () => {
                                const errorMsg = 'reCAPTCHA verification failed';
                                setError(errorMsg);
                                onError?.(errorMsg);
                            }
                        });
                        
                        widgetIdRef.current = widgetId;
                        setIsRendered(true);
                        
                        // Verify the widget is in DOM
                        setTimeout(() => {
                            // Silent verification
                        }, 100);
                        
                    } catch (renderError) {
                        if (renderError.message.includes('already been rendered')) {
                            setIsRendered(true);
                            return;
                        }
                        const errorMsg = 'Failed to render reCAPTCHA';
                        setError(errorMsg);
                        onError?.(errorMsg);
                    }
                }, 100);
                
            } catch (error) {
                const errorMsg = 'Failed to setup reCAPTCHA rendering';
                setError(errorMsg);
                onError?.(errorMsg);
            }
        };

        renderRecaptcha();
    }, [isLoaded, siteKey, onVerify, onError, onExpire, isRendered]);

    const reset = () => {
        if (widgetIdRef.current !== null && window.grecaptcha) {
            try {
                window.grecaptcha.reset(widgetIdRef.current);
                setError(null);
            } catch (e) {
                // Silent reset failure
            }
        }
    };

    // Expose reset method to parent components
    useEffect(() => {
        if (recaptchaRef.current) {
            recaptchaRef.current.reset = reset;
        }
    }, []);

    if (error) {
        return (
            <div className="recaptcha-error" style={{ 
                color: '#dc3545', 
                fontSize: '14px', 
                marginTop: '10px',
                padding: '10px',
                border: '1px solid #dc3545',
                borderRadius: '4px',
                backgroundColor: '#f8d7da'
            }}>
                {error}
            </div>
        );
    }

    return (
        <div 
            ref={recaptchaRef} 
            className="recaptcha-container"
            style={{ 
                marginTop: '15px',
                marginBottom: '15px'
            }}
        />
    );
};

export default ReCaptcha; 