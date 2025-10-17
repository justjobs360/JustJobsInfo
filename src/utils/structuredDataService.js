/**
 * Structured Data Service
 * Utility functions for generating JSON-LD schema markup for SEO
 */

/**
 * Generate Organization schema (site-wide)
 * @returns {Object} Organization structured data
 */
export const generateOrganizationSchema = () => {
    return {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "JustJobsInfo",
        "url": "https://justjobs.info",
        "logo": {
            "@type": "ImageObject",
            "url": "https://justjobs.info/assets/images/logo/logo-dark.png",
            "width": "200",
            "height": "60"
        },
        "description": "Professional resume writing services, career guidance, and job search resources to help you land your dream job.",
        "address": {
            "@type": "PostalAddress",
            "addressCountry": "US"
        },
        "sameAs": [
            "https://www.facebook.com/justjobsinfo",
            "https://twitter.com/justjobsinfo",
            "https://www.linkedin.com/company/justjobsinfo"
        ],
        "contactPoint": {
            "@type": "ContactPoint",
            "contactType": "customer service",
            "email": "hello@justjobs.info"
        }
    };
};

/**
 * Generate WebSite schema (homepage)
 * @returns {Object} WebSite structured data
 */
export const generateWebSiteSchema = () => {
    return {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "JustJobsInfo",
        "url": "https://justjobs.info",
        "description": "Professional resume writing services, career guidance, and job search resources",
        "publisher": {
            "@type": "Organization",
            "name": "JustJobsInfo",
            "logo": {
                "@type": "ImageObject",
                "url": "https://justjobs.info/assets/images/logo/logo-dark.png"
            }
        },
        "potentialAction": {
            "@type": "SearchAction",
            "target": {
                "@type": "EntryPoint",
                "urlTemplate": "https://justjobs.info/job-listing?q={search_term_string}"
            },
            "query-input": "required name=search_term_string"
        }
    };
};

/**
 * Generate WebPage schema (all pages)
 * @param {Object} params - Page parameters
 * @param {string} params.title - Page title
 * @param {string} params.description - Page description
 * @param {string} params.url - Page URL
 * @param {string} params.image - Page image URL
 * @param {string} params.datePublished - Publication date (optional)
 * @param {string} params.dateModified - Last modified date (optional)
 * @returns {Object} WebPage structured data
 */
export const generateWebPageSchema = ({ title, description, url, image, datePublished, dateModified }) => {
    const schema = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": title,
        "description": description,
        "url": url,
        "publisher": {
            "@type": "Organization",
            "name": "JustJobsInfo",
            "logo": {
                "@type": "ImageObject",
                "url": "https://justjobs.info/assets/images/logo/logo-dark.png"
            }
        }
    };
    
    if (image) {
        schema.image = {
            "@type": "ImageObject",
            "url": image,
            "width": "1200",
            "height": "630"
        };
    }
    
    if (datePublished) {
        schema.datePublished = datePublished;
    }
    
    if (dateModified) {
        schema.dateModified = dateModified;
    }
    
    return schema;
};

/**
 * Generate BreadcrumbList schema (inner pages)
 * @param {Array} breadcrumbs - Array of breadcrumb items
 * @param {string} breadcrumbs[].name - Breadcrumb name
 * @param {string} breadcrumbs[].url - Breadcrumb URL
 * @returns {Object} BreadcrumbList structured data
 */
export const generateBreadcrumbSchema = (breadcrumbs) => {
    if (!breadcrumbs || breadcrumbs.length === 0) {
        return null;
    }
    
    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": breadcrumbs.map((crumb, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": crumb.name,
            "item": crumb.url
        }))
    };
};

/**
 * Generate Service schema (service pages)
 * @param {Object} params - Service parameters
 * @param {string} params.name - Service name
 * @param {string} params.description - Service description
 * @param {string} params.url - Service URL
 * @param {string} params.image - Service image URL
 * @param {string} params.serviceType - Type of service
 * @param {Object} params.provider - Service provider info (optional)
 * @returns {Object} Service structured data
 */
export const generateServiceSchema = ({ name, description, url, image, serviceType, provider }) => {
    const schema = {
        "@context": "https://schema.org",
        "@type": "Service",
        "name": name,
        "description": description,
        "url": url,
        "serviceType": serviceType || "Professional Service",
        "provider": provider || {
            "@type": "Organization",
            "name": "JustJobsInfo",
            "url": "https://justjobs.info"
        }
    };
    
    if (image) {
        schema.image = {
            "@type": "ImageObject",
            "url": image
        };
    }
    
    return schema;
};

/**
 * Generate BlogPosting schema (blog pages)
 * @param {Object} params - Blog post parameters
 * @param {string} params.title - Blog title
 * @param {string} params.description - Blog description
 * @param {string} params.url - Blog URL
 * @param {string} params.image - Blog featured image URL
 * @param {string} params.datePublished - Publication date
 * @param {string} params.dateModified - Last modified date
 * @param {Object} params.author - Author information
 * @param {string} params.author.name - Author name
 * @param {string} params.author.url - Author URL (optional)
 * @returns {Object} BlogPosting structured data
 */
export const generateBlogPostingSchema = ({ title, description, url, image, datePublished, dateModified, author }) => {
    const schema = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": title,
        "description": description,
        "url": url,
        "datePublished": datePublished,
        "dateModified": dateModified || datePublished,
        "author": {
            "@type": "Person",
            "name": author?.name || "JustJobsInfo Team"
        },
        "publisher": {
            "@type": "Organization",
            "name": "JustJobsInfo",
            "logo": {
                "@type": "ImageObject",
                "url": "https://justjobs.info/assets/images/logo/logo-dark.png"
            }
        }
    };
    
    if (image) {
        schema.image = {
            "@type": "ImageObject",
            "url": image,
            "width": "1200",
            "height": "630"
        };
    }
    
    if (author?.url) {
        schema.author.url = author.url;
    }
    
    return schema;
};

/**
 * Generate JobPosting schema (job listing pages)
 * @param {Object} params - Job posting parameters
 * @param {string} params.title - Job title
 * @param {string} params.description - Job description
 * @param {string} params.url - Job URL
 * @param {string} params.datePosted - Date posted
 * @param {string} params.validThrough - Valid through date (optional)
 * @param {string} params.employmentType - Employment type (FULL_TIME, PART_TIME, etc.)
 * @param {Object} params.hiringOrganization - Hiring organization info
 * @param {string} params.hiringOrganization.name - Company name
 * @param {string} params.hiringOrganization.url - Company URL (optional)
 * @param {Object} params.jobLocation - Job location info
 * @param {string} params.jobLocation.address - Location address
 * @param {string} params.jobLocation.city - City
 * @param {string} params.jobLocation.state - State
 * @param {string} params.jobLocation.country - Country
 * @param {boolean} params.remoteWork - Is remote work available
 * @returns {Object} JobPosting structured data
 */
export const generateJobPostingSchema = ({ 
    title, 
    description, 
    url, 
    datePosted, 
    validThrough,
    employmentType, 
    hiringOrganization,
    jobLocation,
    remoteWork
}) => {
    const schema = {
        "@context": "https://schema.org",
        "@type": "JobPosting",
        "title": title,
        "description": description,
        "url": url,
        "datePosted": datePosted,
        "employmentType": employmentType || "FULL_TIME",
        "hiringOrganization": {
            "@type": "Organization",
            "name": hiringOrganization?.name || "Various Employers"
        }
    };
    
    if (validThrough) {
        schema.validThrough = validThrough;
    }
    
    if (hiringOrganization?.url) {
        schema.hiringOrganization.url = hiringOrganization.url;
    }
    
    if (jobLocation) {
        schema.jobLocation = {
            "@type": "Place",
            "address": {
                "@type": "PostalAddress",
                "streetAddress": jobLocation.address || "",
                "addressLocality": jobLocation.city || "",
                "addressRegion": jobLocation.state || "",
                "addressCountry": jobLocation.country || "US"
            }
        };
    }
    
    if (remoteWork) {
        schema.jobLocationType = "TELECOMMUTE";
    }
    
    return schema;
};

/**
 * Generate FAQ schema (FAQ pages)
 * @param {Array} faqs - Array of FAQ items
 * @param {string} faqs[].question - Question text
 * @param {string} faqs[].answer - Answer text
 * @returns {Object} FAQPage structured data
 */
export const generateFAQSchema = (faqs) => {
    if (!faqs || faqs.length === 0) {
        return null;
    }
    
    return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqs.map(faq => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.answer
            }
        }))
    };
};

/**
 * Inject structured data into document head
 * @param {Object|Array} structuredData - Structured data object or array of objects
 * @returns {void}
 */
export const injectStructuredData = (structuredData) => {
    if (typeof window === 'undefined') return;
    
    try {
        // Remove any existing structured data scripts
        const existingScripts = document.querySelectorAll('script[type="application/ld+json"]');
        existingScripts.forEach(script => {
            if (script.getAttribute('data-dynamic') === 'true') {
                script.remove();
            }
        });
        
        // Convert single object to array for uniform handling
        const dataArray = Array.isArray(structuredData) ? structuredData : [structuredData];
        
        // Filter out null/undefined entries
        const validData = dataArray.filter(data => data !== null && data !== undefined);
        
        if (validData.length === 0) return;
        
        // Create and inject new script tags
        validData.forEach(data => {
            const script = document.createElement('script');
            script.type = 'application/ld+json';
            script.setAttribute('data-dynamic', 'true');
            script.textContent = JSON.stringify(data);
            document.head.appendChild(script);
        });
        
        console.log('✅ Structured data injected:', validData.length, 'schemas');
    } catch (error) {
        console.error('❌ Error injecting structured data:', error);
    }
};

/**
 * Generate breadcrumbs from URL path
 * @param {string} pathname - Current URL pathname
 * @param {Object} customNames - Custom names for paths (optional)
 * @returns {Array} Array of breadcrumb items
 */
export const generateBreadcrumbsFromPath = (pathname, customNames = {}) => {
    if (!pathname || pathname === '/') {
        return [];
    }
    
    const paths = pathname.split('/').filter(Boolean);
    const breadcrumbs = [
        { name: 'Home', url: 'https://justjobs.info/' }
    ];
    
    let currentPath = '';
    
    paths.forEach((path, index) => {
        currentPath += `/${path}`;
        
        // Format path name (replace hyphens with spaces, capitalize)
        let name = customNames[path] || path
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
        
        breadcrumbs.push({
            name: name,
            url: `https://justjobs.info${currentPath}`
        });
    });
    
    return breadcrumbs;
};

/**
 * Helper to generate all structured data for a page
 * @param {Object} params - Page parameters
 * @returns {Array} Array of structured data objects
 */
export const generateAllStructuredData = (params) => {
    const schemas = [];
    
    // Always include Organization schema
    schemas.push(generateOrganizationSchema());
    
    // Add WebSite schema for homepage
    if (params.isHomepage) {
        schemas.push(generateWebSiteSchema());
    }
    
    // Add WebPage schema for all pages
    if (params.page) {
        schemas.push(generateWebPageSchema(params.page));
    }
    
    // Add Breadcrumb schema for inner pages
    if (params.breadcrumbs && params.breadcrumbs.length > 0) {
        const breadcrumbSchema = generateBreadcrumbSchema(params.breadcrumbs);
        if (breadcrumbSchema) {
            schemas.push(breadcrumbSchema);
        }
    }
    
    // Add Service schema for service pages
    if (params.service) {
        schemas.push(generateServiceSchema(params.service));
    }
    
    // Add BlogPosting schema for blog posts
    if (params.blog) {
        schemas.push(generateBlogPostingSchema(params.blog));
    }
    
    // Add JobPosting schema for job listings
    if (params.job) {
        schemas.push(generateJobPostingSchema(params.job));
    }
    
    // Add FAQ schema for FAQ pages
    if (params.faqs && params.faqs.length > 0) {
        const faqSchema = generateFAQSchema(params.faqs);
        if (faqSchema) {
            schemas.push(faqSchema);
        }
    }
    
    return schemas;
};

export default {
    generateOrganizationSchema,
    generateWebSiteSchema,
    generateWebPageSchema,
    generateBreadcrumbSchema,
    generateServiceSchema,
    generateBlogPostingSchema,
    generateJobPostingSchema,
    generateFAQSchema,
    injectStructuredData,
    generateBreadcrumbsFromPath,
    generateAllStructuredData
};

