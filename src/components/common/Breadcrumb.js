"use client";
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useEffect } from 'react';
import { generateBreadcrumbSchema, injectStructuredData } from '@/utils/structuredDataService';

/**
 * Breadcrumb Component
 * Displays navigation breadcrumbs and injects BreadcrumbList structured data
 */
export default function Breadcrumb({ customNames = {}, className = '' }) {
    const pathname = usePathname();
    
    // Generate breadcrumb items from pathname
    const generateBreadcrumbs = () => {
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
            
            // Format path name
            let name = customNames[path] || path
                .split('-')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
            
            // Handle special cases
            if (path === 'resume-audit') name = 'Resume Audit';
            if (path === 'resume-builder') name = 'Resume Builder';
            if (path === 'job-listing') name = 'Job Listings';
            if (path === 'job-alerts') name = 'Job Alerts';
            if (path === 'job-fit') name = 'Job Fit Analysis';
            if (path === 'askgenie') name = 'Ask Genie';
            if (path === 'downloadable-resources') name = 'Resources';
            if (path === 'important-links') name = 'Important Links';
            if (path === 'case-studies') name = 'Case Studies';
            if (path === 'privacy-policy') name = 'Privacy Policy';
            if (path === 'terms-of-use') name = 'Terms of Use';
            if (path === 'cookies-policy') name = 'Cookies Policy';
            if (path === 'why-choose-us') name = 'Why Choose Us';
            
            breadcrumbs.push({
                name: name,
                url: `https://justjobs.info${currentPath}`,
                isLast: index === paths.length - 1
            });
        });
        
        return breadcrumbs;
    };
    
    const breadcrumbs = generateBreadcrumbs();
    
    // Inject BreadcrumbList structured data
    useEffect(() => {
        if (breadcrumbs.length === 0) return;
        const breadcrumbSchema = generateBreadcrumbSchema(
            breadcrumbs.map(({ name, url }) => ({ name, url }))
        );
        
        if (breadcrumbSchema) {
            injectStructuredData(breadcrumbSchema);
        }
    }, [pathname, breadcrumbs]);
    
    // Don't render if no breadcrumbs
    if (breadcrumbs.length === 0) {
        return null;
    }
    
    return (
        <nav aria-label="Breadcrumb" className={`breadcrumb-nav ${className}`}>
            <ol className="breadcrumb-list" itemScope itemType="https://schema.org/BreadcrumbList">
                {breadcrumbs.map((crumb, index) => (
                    <li 
                        key={crumb.url}
                        className={`breadcrumb-item ${crumb.isLast ? 'active' : ''}`}
                        itemProp="itemListElement"
                        itemScope
                        itemType="https://schema.org/ListItem"
                    >
                        {!crumb.isLast ? (
                            <>
                                <Link 
                                    href={crumb.url.replace('https://justjobs.info', '')} 
                                    itemProp="item"
                                    className="breadcrumb-link"
                                >
                                    <span itemProp="name">{crumb.name}</span>
                                </Link>
                                <meta itemProp="position" content={String(index + 1)} />
                                <span className="breadcrumb-separator" aria-hidden="true"> / </span>
                            </>
                        ) : (
                            <>
                                <span 
                                    itemProp="name" 
                                    aria-current="page"
                                    className="breadcrumb-current"
                                >
                                    {crumb.name}
                                </span>
                                <meta itemProp="position" content={String(index + 1)} />
                            </>
                        )}
                    </li>
                ))}
            </ol>
            
            <style jsx>{`
                .breadcrumb-nav {
                    margin: 20px 0;
                    padding: 15px 0;
                    border-bottom: 1px solid #e5e7eb;
                }
                
                .breadcrumb-list {
                    display: flex;
                    flex-wrap: wrap;
                    align-items: center;
                    list-style: none;
                    margin: 0;
                    padding: 0;
                    font-size: 14px;
                }
                
                .breadcrumb-item {
                    display: flex;
                    align-items: center;
                }
                
                .breadcrumb-link {
                    color: #2563eb;
                    text-decoration: none;
                    transition: color 0.2s;
                }
                
                .breadcrumb-link:hover {
                    color: #1e40af;
                    text-decoration: underline;
                }
                
                .breadcrumb-current {
                    color: #6b7280;
                    font-weight: 500;
                }
                
                .breadcrumb-separator {
                    margin: 0 8px;
                    color: #9ca3af;
                }
                
                @media (max-width: 640px) {
                    .breadcrumb-nav {
                        padding: 10px 0;
                    }
                    
                    .breadcrumb-list {
                        font-size: 12px;
                    }
                    
                    .breadcrumb-separator {
                        margin: 0 4px;
                    }
                }
            `}</style>
        </nav>
    );
}

/**
 * Breadcrumb with custom styles
 */
export function BreadcrumbCustom({ 
    customNames = {}, 
    className = '',
    separator = '/',
    showHome = true 
}) {
    const pathname = usePathname();
    
    if (!pathname || pathname === '/') {
        return null;
    }
    
    const paths = pathname.split('/').filter(Boolean);
    
    const breadcrumbs = showHome ? [
        { name: 'Home', url: '/' }
    ] : [];
    
    let currentPath = '';
    
    paths.forEach((path) => {
        currentPath += `/${path}`;
        
        let name = customNames[path] || path
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
        
        breadcrumbs.push({
            name: name,
            url: currentPath,
            isLast: currentPath === pathname
        });
    });
    
    return (
        <nav aria-label="Breadcrumb" className={className}>
            <ol style={{ display: 'flex', gap: '8px', listStyle: 'none', padding: 0, margin: 0 }}>
                {breadcrumbs.map((crumb, index) => (
                    <li key={crumb.url} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {!crumb.isLast ? (
                            <>
                                <Link href={crumb.url} style={{ color: '#2563eb', textDecoration: 'none' }}>
                                    {crumb.name}
                                </Link>
                                <span style={{ color: '#9ca3af' }}>{separator}</span>
                            </>
                        ) : (
                            <span style={{ color: '#6b7280', fontWeight: '500' }} aria-current="page">
                                {crumb.name}
                            </span>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
}

