"use client";
import { useEffect, useState } from 'react';
import Script from 'next/script';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/contexts/AuthContext';
import GDPRConsent from '@/components/common/GDPRConsent';

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
  
  useEffect(() => {
    // Fetch SEO settings for Google Analytics and Search Console
    const fetchSeoSettings = async () => {
      try {
        const response = await fetch('/api/admin/seo-settings');
        const result = await response.json();
        
        if (result.success) {
          setSeoSettings(result.data);
        }
      } catch (error) {
        console.error('Failed to load SEO settings:', error);
      }
    };
    
    fetchSeoSettings();
  }, []);
  
  return (
    <>
      {/* Google Analytics */}
      {seoSettings?.googleAnalyticsId && (
        <GoogleAnalytics gaId={seoSettings.googleAnalyticsId} />
      )}
      
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

