# Structured Data Implementation Guide

## Overview
This document explains the implementation of Schema.org structured data (JSON-LD) across the JustJobsInfo website to enable rich results in Google Search and other search engines.

## What Was Done

### 1. Created StructuredData Component
**File:** `src/components/common/StructuredData.js`

A reusable React component that:
- Automatically injects JSON-LD structured data into the page head
- Supports multiple schema types (Organization, WebSite, WebPage, BreadcrumbList, Service, BlogPosting, FAQPage)
- Generates breadcrumbs from URL paths automatically
- Can be customized with page-specific data

### 2. Implemented Structured Data on Key Pages

#### Homepage (`src/app/page.js`)
- **Organization Schema**: Company information, logo, contact details
- **WebSite Schema**: Website info with search action
- **WebPage Schema**: Page-specific metadata

#### FAQ Page (`src/app/(inner)/faq/page.js`)
- **FAQPage Schema**: All Q&A pairs structured for rich results
- Enables FAQ rich snippets in Google Search
- Improves visibility with expandable Q&A display

#### Blog Posts (`src/app/(inner)/blogs/[slug]/page.js`)
- **BlogPosting Schema**: Article metadata
- **Article Schema**: Author, publish date, images
- Enables article rich snippets with author info and dates

#### About Page (`src/app/(inner)/about/page.js`)
- **WebPage Schema**: Company information page
- **Breadcrumb Schema**: Navigation hierarchy

#### Resume Audit Page (`src/app/(inner)/resume-audit/page.js`)
- **Service Schema**: Service offering details
- **WebPage Schema**: Page metadata
- Highlights the resume audit service for search engines

## Schema Types Implemented

### 1. Organization Schema
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "JustJobsInfo",
  "url": "https://justjobs.info",
  "logo": "https://justjobs.info/assets/images/logo/logo-dark.png",
  "sameAs": [
    "https://www.facebook.com/justjobsinfo",
    "https://twitter.com/justjobsinfo",
    "https://www.linkedin.com/company/justjobsinfo"
  ]
}
```

### 2. WebSite Schema (with Search Action)
```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "JustJobsInfo",
  "url": "https://justjobs.info",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://justjobs.info/job-listing?q={search_term_string}"
  }
}
```

### 3. FAQPage Schema
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is an AI resume auditor?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "An AI resume auditor is..."
      }
    }
  ]
}
```

### 4. BlogPosting Schema
```json
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "Blog Title",
  "author": {
    "@type": "Person",
    "name": "Author Name"
  },
  "datePublished": "2024-01-01",
  "publisher": {
    "@type": "Organization",
    "name": "JustJobsInfo"
  }
}
```

### 5. Service Schema
```json
{
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Resume Audit Service",
  "description": "AI-powered resume analysis...",
  "provider": {
    "@type": "Organization",
    "name": "JustJobsInfo"
  }
}
```

### 6. BreadcrumbList Schema
```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://justjobs.info/"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "About",
      "item": "https://justjobs.info/about"
    }
  ]
}
```

## How to Add Structured Data to More Pages

### Basic Implementation
```jsx
import StructuredData from "@/components/common/StructuredData";

export default function MyPage() {
    return (
        <>
            <StructuredData 
                type="page"
                pageData={{
                    title: 'Page Title',
                    description: 'Page description',
                    image: 'https://justjobs.info/assets/images/og-images/og-page.webp'
                }}
            />
            {/* Rest of your page */}
        </>
    );
}
```

### With Custom Schema
```jsx
import StructuredData from "@/components/common/StructuredData";
import { generateServiceSchema } from "@/utils/structuredDataService";

export default function ServicePage() {
    return (
        <>
            <StructuredData 
                type="service"
                pageData={{
                    title: 'Service Name',
                    description: 'Service description'
                }}
                customSchema={generateServiceSchema({
                    name: 'My Service',
                    description: 'Service details',
                    url: 'https://justjobs.info/my-service',
                    serviceType: 'Professional Service'
                })}
            />
            {/* Rest of your page */}
        </>
    );
}
```

## Testing Structured Data

### 1. Google Rich Results Test
1. Go to https://search.google.com/test/rich-results
2. Enter your page URL: `https://justjobs.info/`
3. Click "Test URL"
4. Verify all schemas are detected and valid

### 2. Schema Markup Validator
1. Go to https://validator.schema.org/
2. Enter your page URL
3. Check for any errors or warnings

### 3. Google Search Console
1. Go to https://search.google.com/search-console
2. Navigate to "Enhancements" section
3. Check for:
   - FAQ pages
   - Articles (Blog posts)
   - Breadcrumbs
   - Organization info

### 4. Browser DevTools
1. Open any page on your site
2. Open Developer Tools (F12)
3. Look in Console for: "📊 Structured data injected..."
4. View Page Source and search for `application/ld+json`
5. Verify JSON-LD scripts are present in `<head>`

## Expected Rich Results

### Homepage
- **Sitelinks Search Box**: Search directly from Google results
- **Organization Info**: Logo, name, social profiles

### FAQ Page
- **FAQ Rich Snippets**: Expandable Q&A in search results
- Increases click-through rate significantly

### Blog Posts
- **Article Rich Snippets**: 
  - Author name and photo
  - Publish date
  - Featured image
  - Reading time estimate (if available)

### Service Pages
- **Service Rich Snippets**:
  - Service name
  - Description
  - Provider information

## Available Schema Generator Functions

Located in `src/utils/structuredDataService.js`:

1. `generateOrganizationSchema()` - Company/organization info
2. `generateWebSiteSchema()` - Website with search action
3. `generateWebPageSchema()` - Basic page metadata
4. `generateBreadcrumbSchema()` - Navigation breadcrumbs
5. `generateServiceSchema()` - Service offerings
6. `generateBlogPostingSchema()` - Blog post articles
7. `generateJobPostingSchema()` - Job listings
8. `generateFAQSchema()` - FAQ pages
9. `generateBreadcrumbsFromPath()` - Auto-generate breadcrumbs
10. `injectStructuredData()` - Inject schemas into DOM

## Troubleshooting

### Structured Data Not Showing
1. Check browser console for errors
2. Verify the page has `"use client"` directive (for client components)
3. Ensure StructuredData component is imported correctly
4. Check that JSON-LD scripts are in the page source

### Rich Results Not Appearing in Google
1. Wait 1-2 weeks for Google to re-crawl your pages
2. Request indexing in Google Search Console
3. Verify schemas pass Google Rich Results Test
4. Ensure there are no validation errors

### Debugging
```javascript
// Check injected schemas in browser console
document.querySelectorAll('script[type="application/ld+json"]')
  .forEach(script => console.log(JSON.parse(script.textContent)));
```

## Best Practices

1. **Always Include**:
   - Organization schema on every page
   - WebPage schema with proper metadata
   - Breadcrumbs on inner pages

2. **Image Requirements**:
   - Use high-resolution images (1200x630px)
   - Provide absolute URLs
   - Use WebP format when possible

3. **Dates**:
   - Use ISO 8601 format (YYYY-MM-DD)
   - Include both published and modified dates for articles

4. **Author Information**:
   - Provide real names for blog posts
   - Include author URLs when available

5. **Testing**:
   - Test every schema type before deployment
   - Use multiple validation tools
   - Monitor Google Search Console for issues

## Next Steps

To add structured data to remaining pages:

1. **Contact Page**: Add LocalBusiness or ContactPage schema
2. **Services Pages**: Add Service schema for each service
3. **Job Listings**: Add JobPosting schema
4. **Pricing Page**: Add Offer schema
5. **Testimonials**: Add Review schema

## Resources

- [Google Structured Data Guidelines](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data)
- [Schema.org Documentation](https://schema.org/)
- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Schema Markup Validator](https://validator.schema.org/)

## Support

For questions or issues with structured data implementation, refer to:
- `src/utils/structuredDataService.js` - All schema generators
- `src/components/common/StructuredData.js` - React component
- This guide for implementation examples

