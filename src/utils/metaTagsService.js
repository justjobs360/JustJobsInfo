/**
 * Meta Tags Service
 * Utility functions for managing meta tags across the application
 */

// Get meta tags for a specific page
export const getMetaTagsForPage = async (pageName) => {
    try {
        console.log('🔍 Fetching meta tags for:', pageName);
        
        // Clean and format page name for API call
        const cleanPageName = pageName
            .replace(/^\//, '') // Remove leading slash
            .replace(/\/$/, '') // Remove trailing slash
            .toLowerCase() || 'home';
        
        const response = await fetch(`/api/meta-tags/${encodeURIComponent(cleanPageName)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        
        const result = await response.json();
        
        if (result.success) {
            return result.data;
        } else {
            console.warn('Failed to fetch meta tags for page:', cleanPageName);
            return getDefaultMetaTags(pageName);
        }
    } catch (error) {
        console.error('Error fetching meta tags:', error);
        return getDefaultMetaTags(pageName);
    }
};

// Get default meta tags for fallback
export const getDefaultMetaTags = (pageName = 'Home') => {
    const defaults = {
        'home': {
            title: 'JustJobsInfo - Professional Resume and Career Services',
            description: 'Professional resume writing services, career guidance, and job search resources to help you land your dream job.',
            keywords: 'resume writing, career services, job search, professional development',
            ogImage: '/assets/images/logo/logo-dark.png'
        },
        'about': {
            title: 'About JustJobsInfo - Our Story and Mission',
            description: 'Learn about JustJobsInfo and our mission to help professionals succeed in their careers through expert resume services.',
            keywords: 'about us, company, mission, career services, professional development',
            ogImage: '/assets/images/about/about-og.jpg'
        },
        'resume-audit': {
            title: 'Free Resume Audit - Professional Resume Review | JustJobsInfo',
            description: 'Get a free professional resume audit and improve your chances of landing your dream job. Expert analysis and recommendations.',
            keywords: 'resume audit, resume review, free resume check, CV analysis',
            ogImage: '/assets/images/service/resume-audit-og.jpg'
        },
        'contact': {
            title: 'Contact JustJobsInfo - Get in Touch for Resume Services',
            description: 'Contact JustJobsInfo for professional resume services, career guidance, and job search assistance.',
            keywords: 'contact, get in touch, resume services, career help',
            ogImage: '/assets/images/contact/contact-og.jpg'
        },
        'blogs': {
            title: 'Career Blog - Job Search Tips and Resume Advice | JustJobsInfo',
            description: 'Read our latest career advice, job search tips, and resume writing guides to advance your professional journey.',
            keywords: 'career blog, job search tips, resume advice, career guidance',
            ogImage: '/assets/images/blog/blog-og.jpg'
        },
        'services': {
            title: 'Professional Resume and Career Services | JustJobsInfo',
            description: 'Comprehensive resume writing and career services to help you stand out in the job market.',
            keywords: 'resume services, career services, professional writing, job search help',
            ogImage: '/assets/images/service/services-og.jpg'
        }
    };
    
    const cleanPageName = pageName.toLowerCase().replace(/[\/\s]/g, '-');
    
    return defaults[cleanPageName] || defaults['home'];
};

// Update document head with meta tags
export const updateDocumentMeta = (metaTags) => {
    if (typeof window === 'undefined') return; // Skip on server-side
    
    try {
        // Update title
        if (metaTags.title) {
            document.title = metaTags.title;
        }
        
        // Get current URL for canonical and og:url
        const currentUrl = metaTags.canonicalUrl || window.location.href;
        const fullImageUrl = metaTags.ogImage?.startsWith('http') 
            ? metaTags.ogImage 
            : `https://justjobs.info${metaTags.ogImage}`;
        
        // Update or create meta tags with enhanced Open Graph
        const metaUpdates = [
            { name: 'description', content: metaTags.description },
            { name: 'keywords', content: metaTags.keywords },
            
            // Open Graph tags
            { property: 'og:title', content: metaTags.title },
            { property: 'og:description', content: metaTags.description },
            { property: 'og:image', content: fullImageUrl },
            { property: 'og:image:width', content: '1200' },
            { property: 'og:image:height', content: '630' },
            { property: 'og:image:alt', content: metaTags.title },
            { property: 'og:url', content: currentUrl },
            { property: 'og:type', content: metaTags.ogType || 'website' },
            { property: 'og:site_name', content: 'JustJobsInfo' },
            
            // Twitter Card tags
            { name: 'twitter:card', content: 'summary_large_image' },
            { name: 'twitter:title', content: metaTags.title },
            { name: 'twitter:description', content: metaTags.description },
            { name: 'twitter:image', content: fullImageUrl },
            { name: 'twitter:image:alt', content: metaTags.title },
            { name: 'twitter:site', content: '@justjobsinfo' },
        ];
        
        metaUpdates.forEach(({ name, property, content }) => {
            if (!content) return;
            
            const selector = name ? `meta[name="${name}"]` : `meta[property="${property}"]`;
            let metaElement = document.querySelector(selector);
            
            if (metaElement) {
                metaElement.setAttribute('content', content);
            } else {
                metaElement = document.createElement('meta');
                if (name) metaElement.setAttribute('name', name);
                if (property) metaElement.setAttribute('property', property);
                metaElement.setAttribute('content', content);
                document.head.appendChild(metaElement);
            }
        });
        
        // Add canonical link tag
        let canonicalElement = document.querySelector('link[rel="canonical"]');
        if (canonicalElement) {
            canonicalElement.setAttribute('href', currentUrl);
        } else {
            canonicalElement = document.createElement('link');
            canonicalElement.setAttribute('rel', 'canonical');
            canonicalElement.setAttribute('href', currentUrl);
            document.head.appendChild(canonicalElement);
        }
        
        console.log('✅ Meta tags updated successfully for:', metaTags.title);
    } catch (error) {
        console.error('Error updating document meta tags:', error);
    }
};

// Generate structured data for SEO
export const generateStructuredData = (metaTags, pageType = 'WebPage') => {
    const structuredData = {
        "@context": "https://schema.org",
        "@type": pageType,
        "name": metaTags.title,
        "description": metaTags.description,
        "url": typeof window !== 'undefined' ? window.location.href : '',
        "image": metaTags.ogImage,
        "publisher": {
            "@type": "Organization",
            "name": "JustJobsInfo",
            "logo": {
                "@type": "ImageObject",
                "url": "/assets/images/logo/logo-dark.png"
            }
        }
    };
    
    return structuredData;
};

// Note: useMetaTags hook is now in /hooks/useMetaTags.js

// Admin helper functions
export const getPageSuggestions = () => {
    return [
        'Home',
        'About Us',
        'Services',
        'Resume Audit',
        'Contact',
        'Blogs',
        'Privacy Policy',
        'Terms of Service',
        'Career Resources',
        'Job Search Tips',
        'Resume Templates'
    ];
};

export const validateMetaTag = (metaTag) => {
    const errors = [];
    
    if (!metaTag.page?.trim()) {
        errors.push('Page name is required');
    }
    
    if (!metaTag.title?.trim()) {
        errors.push('Title is required');
    } else if (metaTag.title.length > 60) {
        errors.push('Title should be 60 characters or less for optimal SEO');
    }
    
    if (!metaTag.description?.trim()) {
        errors.push('Description is required');
    } else if (metaTag.description.length > 160) {
        errors.push('Description should be 160 characters or less for optimal SEO');
    }
    
    if (metaTag.keywords && metaTag.keywords.length > 200) {
        errors.push('Keywords should be 200 characters or less');
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
};
