"use client";
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Script from 'next/script';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/contexts/AuthContext';

// Lazy load GDPR consent - not critical for initial render
const GDPRConsent = dynamic(() => import('@/components/common/GDPRConsent'), {
  ssr: false
});

// Google Analytics Component
function GoogleAnalytics({ gaId }) {
  if (!gaId) return null;
  
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}');
        `}
      </Script>
    </>
  );
}

function GoogleAdSense({ publisherId, enabled }) {
  if (!publisherId || !enabled) return null;

  return (
    <>
      <Script
        id="google-adsense"
        async
        strategy="afterInteractive"
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`}
        crossOrigin="anonymous"
      />
      <Script id="google-adsense-init" strategy="afterInteractive">
        {`
          window.adsbygoogle = window.adsbygoogle || [];
          try {
            (adsbygoogle = window.adsbygoogle || []).push({
              google_ad_client: '${publisherId}',
              enable_page_level_ads: true
            });
          } catch (e) {}
        `}
      </Script>
    </>
  );
}

// Search Console Verification Component
function SearchConsoleVerification({ verificationCode }) {
  useEffect(() => {
    if (!verificationCode) return;
    
    // Add Google Search Console verification meta tag
    const metaTag = document.createElement('meta');
    metaTag.name = 'google-site-verification';
    metaTag.content = verificationCode;
    document.head.appendChild(metaTag);
    
    return () => {
      // Cleanup on unmount
      const existingTag = document.querySelector(`meta[name="google-site-verification"][content="${verificationCode}"]`);
      if (existingTag) {
        document.head.removeChild(existingTag);
      }
    };
  }, [verificationCode]);
  
  return null;
}

export default function ClientLayout({ children }) {
  const [seoSettings, setSeoSettings] = useState(null);
  const [adConsent, setAdConsent] = useState(false);
  
  useEffect(() => {
    // Fetch SEO settings for Google Analytics and Search Console - defer to avoid blocking
    const fetchSeoSettings = async () => {
      try {
        // Use requestIdleCallback for better performance
        const fetchData = async () => {
        const response = await fetch('/api/admin/seo-settings');
        const result = await response.json();
        
        if (result.success) {
          setSeoSettings(result.data);
          }
        };

        if (typeof requestIdleCallback !== 'undefined') {
          requestIdleCallback(fetchData, { timeout: 2000 });
        } else {
          setTimeout(fetchData, 100);
        }
      } catch (error) {
        console.error('Failed to load SEO settings:', error);
      }
    };
    
    fetchSeoSettings();
  }, []);

  useEffect(() => {
    const readConsent = () => {
      try {
        const raw = localStorage.getItem('gdpr-consent');
        if (!raw) {
          setAdConsent(false);
          return;
        }
        const parsed = JSON.parse(raw);
        setAdConsent(!!parsed.advertising);
      } catch (error) {
        setAdConsent(false);
      }
    };

    readConsent();
    window.addEventListener('gdpr-consent-updated', readConsent);
    return () => window.removeEventListener('gdpr-consent-updated', readConsent);
  }, []);
  
  return (
    <>
      {/* Google Analytics */}
      {seoSettings?.googleAnalyticsId && (
        <GoogleAnalytics gaId={seoSettings.googleAnalyticsId} />
      )}
      <GoogleAdSense publisherId="ca-pub-3944364034379577" enabled={adConsent} />
      
      {/* Search Console Verification */}
      {seoSettings?.googleSearchConsole && (
        <SearchConsoleVerification verificationCode={seoSettings.googleSearchConsole} />
      )}
      
      <AuthProvider>
        {children}
      </AuthProvider>

      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#333',
            color: '#fff',
          },
          success: {
            duration: 3000,
            style: {
              background: '#4CAF50',
            },
          },
          error: {
            duration: 4000,
            style: {
              background: '#f44336',
            },
          },
        }}
      />

      <Script
        src="/assets/js/plugins/smooth-scroll.js"
        strategy="lazyOnload"
      />

      <GDPRConsent />
    </>
  );
}

