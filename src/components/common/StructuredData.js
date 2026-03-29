"use client";
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import {
    generateOrganizationSchema,
    generateWebSiteSchema,
    generateWebPageSchema,
    generateBreadcrumbSchema,
    generateBreadcrumbsFromPath,
    injectStructuredData
} from '@/utils/structuredDataService';

/**
 * StructuredData Component
 * Automatically generates and injects JSON-LD structured data for SEO
 * @param {Object} props
 * @param {string} props.type - Type of page ('home', 'blog', 'service', 'faq', etc.)
 * @param {Object} props.pageData - Page-specific data
 * @param {Array} props.customBreadcrumbs - Custom breadcrumbs (optional)
 * @param {Object} props.customSchema - Additional custom schema (optional)
 */
export default function StructuredData({ type = 'page', pageData = {}, customBreadcrumbs, customSchema }) {
    const pathname = usePathname();

    useEffect(() => {
        const schemas = [];

        // Always include Organization schema
        schemas.push(generateOrganizationSchema());

        // Add WebSite schema for homepage
        if (type === 'home' || pathname === '/') {
            schemas.push(generateWebSiteSchema());
        }

        // Generate breadcrumbs
        let breadcrumbs = customBreadcrumbs;
        if (!breadcrumbs && pathname && pathname !== '/') {
            breadcrumbs = generateBreadcrumbsFromPath(pathname, {
                'resume-audit': 'Resume Audit',
                'resume-builder': 'Resume Builder',
                'job-fit': 'Job Fit Analysis',
                'job-listing': 'Job Listings',
                'job-alerts': 'Job Alerts',
                'about': 'About Us',
                'contact': 'Contact',
                'blogs': 'Blog',
                'privacy-policy': 'Privacy Policy',
                'terms-of-use': 'Terms of Use'
            });
        }

        // Add breadcrumb schema for inner pages
        if (breadcrumbs && breadcrumbs.length > 0) {
            const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbs);
            if (breadcrumbSchema) {
                schemas.push(breadcrumbSchema);
            }
        }

        // WebPage URL: match HTTP Link canonical (middleware) — listing filter queries are not unique URLs for SEO.
        const currentUrl = (() => {
            const base = 'https://www.justjobs.info';
            if (typeof window === 'undefined') {
                return `${base}${pathname}`;
            }
            const p = window.location.pathname || pathname || '';
            if (p === '/blogs' || p === '/job-listing') {
                return `${base}${p}`;
            }
            return window.location.href;
        })();

        const webPageSchema = generateWebPageSchema({
            title: pageData.title || document.title,
            description: pageData.description || 'Professional resume and career services',
            url: currentUrl,
            image: pageData.image || 'https://www.justjobs.info/assets/images/og-images/og-home.webp',
            datePublished: pageData.datePublished,
            dateModified: pageData.dateModified
        });
        schemas.push(webPageSchema);

        // Add any custom schemas
        if (customSchema) {
            if (Array.isArray(customSchema)) {
                schemas.push(...customSchema);
            } else {
                schemas.push(customSchema);
            }
        }

        // Inject all schemas
        injectStructuredData(schemas);

        console.log('📊 Structured data injected for:', type, '- Total schemas:', schemas.length);

    }, [type, pathname, pageData, customBreadcrumbs, customSchema]);

    // This component doesn't render anything
    return null;
}

/**
 * Higher-Order Component to wrap pages with structured data
 */
export function withStructuredData(WrappedComponent, structuredDataProps = {}) {
    const WithStructuredDataComponent = (props) => {
        return (
            <>
                <StructuredData {...structuredDataProps} />
                <WrappedComponent {...props} />
            </>
        );
    };

    WithStructuredDataComponent.displayName = `withStructuredData(${WrappedComponent.displayName || WrappedComponent.name})`;

    return WithStructuredDataComponent;
}

