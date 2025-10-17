"use client";
import { useEffect, useState } from 'react';
import "../../public/assets/css/plugins/fontawesome.css";
import "../../public/assets/css/plugins/magnifying-popup.css";
import "../../public/assets/css/plugins/swiper.css";
import "../../public/assets/css/plugins/metismenu.css";
import "../../public/assets/css/vendor/bootstrap.min.css";
import 'react-modal-video/css/modal-video.min.css';
import { Toaster } from 'react-hot-toast';

// Import your custom styles LAST to override plugin styles
import "../../public/assets/css/style.css";

import Script from 'next/script';
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
  if (!verificationCode) return null;
  
  useEffect(() => {
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

export const metadata = {
  title: "JustJobsInfo - Professional Resume and Career Services",
  description: "Professional resume writing services, career guidance, and job search resources to help you land your dream job.",
  icons: {
    icon: "/assets/images/logo/favicon.png",
  },
};

function LayoutContent({ children }) {
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
        strategy="afterInteractive"
      />

      <GDPRConsent />
    </>
  );
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className='index-one'>
        <LayoutContent>{children}</LayoutContent>
      </body>
    </html>
  );
}
