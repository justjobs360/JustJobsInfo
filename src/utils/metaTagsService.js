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
    const baseUrl = 'https://justjobs.info';
    const currentDate = new Date().toISOString();
    
    const defaults = {
        // Main Pages
        'home': {
            title: 'JustJobsInfo - Professional Resume and Career Services',
            description: 'Transform your career with expert resume writing, AI-powered CV analysis, job search tools, and personalized career guidance. Land your dream job faster with JustJobsInfo.',
            keywords: 'resume writing, career services, job search, professional development, CV builder',
            ogImage: `${baseUrl}/assets/images/og-images/og-home.webp`,
            author: 'JustJobsInfo Team',
            publishDate: currentDate,
            ogType: 'website'
        },
        'about': {
            title: 'About JustJobsInfo - Our Story and Mission',
            description: 'Learn how JustJobsInfo helps professionals succeed through AI-powered resume analysis, expert career guidance, and innovative job search tools trusted by thousands.',
            keywords: 'about us, company, mission, career services, professional development',
            ogImage: `${baseUrl}/assets/images/og-images/og-about.webp`,
            author: 'JustJobsInfo Team',
            publishDate: currentDate,
            ogType: 'website'
        },
        'about-us': {
            title: 'About JustJobsInfo - Our Story and Mission',
            description: 'Learn how JustJobsInfo helps professionals succeed through AI-powered resume analysis, expert career guidance, and innovative job search tools trusted by thousands.',
            keywords: 'about us, company, mission, career services, professional development',
            ogImage: `${baseUrl}/assets/images/og-images/og-about.webp`,
            author: 'JustJobsInfo Team',
            publishDate: currentDate,
            ogType: 'website'
        },
        'contact': {
            title: 'Contact JustJobsInfo - Get Expert Career Help',
            description: 'Get in touch with our career experts for personalized resume help, career guidance, and job search support. We respond within 24 hours to help you succeed.',
            keywords: 'contact, get in touch, resume services, career help, support',
            ogImage: `${baseUrl}/assets/images/og-images/og-contact.webp`,
            author: 'JustJobsInfo Team',
            publishDate: currentDate,
            ogType: 'website'
        },
        
        // Resume Services
        'resume-audit': {
            title: 'Free Resume Audit - Professional Resume Review | JustJobsInfo',
            description: 'Get a free AI-powered resume audit with instant feedback on formatting, keywords, ATS compatibility, and content quality. Improve your chances of landing interviews today.',
            keywords: 'resume audit, resume review, free resume check, CV analysis, ATS scan',
            ogImage: `${baseUrl}/assets/images/og-images/og-resume-audit.webp`,
            author: 'JustJobsInfo Team',
            publishDate: currentDate,
            ogType: 'website'
        },
        'resume-builder': {
            title: 'Resume Builder - Create Professional ATS-Friendly Resumes',
            description: 'Build professional, ATS-optimized resumes in minutes with our easy-to-use resume builder. Choose from 7 proven templates designed to get you hired faster.',
            keywords: 'resume builder, CV builder, resume templates, professional resume, ATS friendly',
            ogImage: `${baseUrl}/assets/images/og-images/og-resume-builder.webp`,
            author: 'JustJobsInfo Team',
            publishDate: currentDate,
            ogType: 'website'
        },
        
        // Job Services
        'job-listing': {
            title: 'Job Listings - Find Your Perfect Job | JustJobsInfo',
            description: 'Browse thousands of curated job listings across industries. Filter by location, salary, experience level, and more to find opportunities that match your career goals.',
            keywords: 'job listings, job search, career opportunities, job openings, employment',
            ogImage: `${baseUrl}/assets/images/og-images/og-job-listing.webp`,
            author: 'JustJobsInfo Team',
            publishDate: currentDate,
            ogType: 'website'
        },
        'job-fit': {
            title: 'Job Fit Analysis - Assess Your Career Compatibility',
            description: 'Discover if a job is right for you with our comprehensive job fit analysis tool. Evaluate skills match, culture fit, and growth potential before you apply.',
            keywords: 'job fit, career match, job analysis, career assessment, compatibility',
            ogImage: `${baseUrl}/assets/images/og-images/og-job-fit.webp`,
            author: 'JustJobsInfo Team',
            publishDate: currentDate,
            ogType: 'website'
        },
        'job-alerts': {
            title: 'Job Alerts - Never Miss Your Dream Job Opportunity',
            description: 'Set up personalized job alerts and get notified instantly when positions matching your skills and preferences are posted. Stay ahead of the competition.',
            keywords: 'job alerts, job notifications, career alerts, email alerts, job updates',
            ogImage: `${baseUrl}/assets/images/og-images/og-job-alerts.webp`,
            author: 'JustJobsInfo Team',
            publishDate: currentDate,
            ogType: 'website'
        },
        
        // Services & Resources
        'service': {
            title: 'Our Services - Professional Career and Resume Solutions',
            description: 'Explore our comprehensive career services including resume writing, CV optimization, interview coaching, job search strategies, and personalized career counseling.',
            keywords: 'career services, resume services, professional services, job search help',
            ogImage: `${baseUrl}/assets/images/og-images/og-services.webp`,
            author: 'JustJobsInfo Team',
            publishDate: currentDate,
            ogType: 'website'
        },
        'faq': {
            title: 'Frequently Asked Questions - Resume & Career Help',
            description: 'Find answers to common questions about our AI resume auditor, resume builder, job search tools, pricing, and career services. Get the help you need quickly.',
            keywords: 'faq, frequently asked questions, help, support, career questions',
            ogImage: `${baseUrl}/assets/images/og-images/og-faq.webp`,
            author: 'JustJobsInfo Team',
            publishDate: currentDate,
            ogType: 'website'
        },
        'free-consultation': {
            title: 'Free Career Consultation - Expert Resume & Job Search Advice',
            description: 'Schedule a free 30-minute consultation with our career experts. Get personalized advice on your resume, job search strategy, and career development goals.',
            keywords: 'free consultation, career advice, resume consultation, job search help',
            ogImage: `${baseUrl}/assets/images/og-images/og-free-consultation.webp`,
            author: 'JustJobsInfo Team',
            publishDate: currentDate,
            ogType: 'website'
        },
        'downloadable-resources': {
            title: 'Free Career Resources - Templates, Guides & Tools',
            description: 'Download free career resources including resume templates, cover letter samples, interview guides, salary negotiation scripts, and job search checklists.',
            keywords: 'free resources, resume templates, career guides, downloadable tools',
            ogImage: `${baseUrl}/assets/images/og-images/og-resources.webp`,
            author: 'JustJobsInfo Team',
            publishDate: currentDate,
            ogType: 'website'
        },
        'important-links': {
            title: 'Important Links - Quick Access to Career Resources',
            description: 'Access important career resources, job boards, professional networking sites, industry tools, and helpful links to accelerate your job search and career growth.',
            keywords: 'important links, career resources, job boards, professional links',
            ogImage: `${baseUrl}/assets/images/og-images/og-resources.webp`,
            author: 'JustJobsInfo Team',
            publishDate: currentDate,
            ogType: 'website'
        },
        
        // Blog Pages
        'blogs': {
            title: 'Career Blog - Expert Job Search Tips & Resume Advice',
            description: 'Read expert career advice, resume writing tips, job search strategies, interview techniques, and industry insights to advance your professional journey successfully.',
            keywords: 'career blog, job search tips, resume advice, career guidance, professional tips',
            ogImage: `${baseUrl}/assets/images/og-images/og-blog.webp`,
            author: 'JustJobsInfo Team',
            publishDate: currentDate,
            ogType: 'website'
        },
        
        // Industry Pages
        'industry': {
            title: 'Industry-Specific Career Resources | JustJobsInfo',
            description: 'Explore tailored career guidance, resume tips, and job search strategies for your specific industry including tech, healthcare, finance, construction, and more.',
            keywords: 'industry careers, sector jobs, industry-specific resources',
            ogImage: `${baseUrl}/assets/images/og-images/og-industry.webp`,
            author: 'JustJobsInfo Team',
            publishDate: currentDate,
            ogType: 'website'
        },
        'healthcare-industry': {
            title: 'Healthcare Careers - Medical & Nursing Job Resources',
            description: 'Find healthcare career opportunities, medical resume templates, nursing CV tips, and specialized resources for doctors, nurses, and allied health professionals.',
            keywords: 'healthcare careers, medical jobs, nursing careers, healthcare industry',
            ogImage: `${baseUrl}/assets/images/og-images/og-healthcare.webp`,
            author: 'JustJobsInfo Team',
            publishDate: currentDate,
            ogType: 'website'
        },
        'fintech-industry': {
            title: 'FinTech Careers - Finance & Technology Job Opportunities',
            description: 'Explore fintech career paths, financial technology jobs, banking positions, and specialized resources for finance and tech professionals in the evolving financial sector.',
            keywords: 'fintech careers, finance jobs, technology finance, banking careers',
            ogImage: `${baseUrl}/assets/images/og-images/og-fintech.webp`,
            author: 'JustJobsInfo Team',
            publishDate: currentDate,
            ogType: 'website'
        },
        'ecommerce-industry': {
            title: 'E-Commerce Careers - Online Retail & Digital Commerce Jobs',
            description: 'Discover e-commerce career opportunities, online retail positions, digital marketing roles, and resources tailored for the fast-growing online commerce industry.',
            keywords: 'ecommerce careers, online retail jobs, digital commerce, ecommerce industry',
            ogImage: `${baseUrl}/assets/images/og-images/og-ecommerce.webp`,
            author: 'JustJobsInfo Team',
            publishDate: currentDate,
            ogType: 'website'
        },
        'construction-industry': {
            title: 'Construction Careers - Building & Trade Job Opportunities',
            description: 'Find construction career paths, building trade jobs, project management positions, and specialized resources for contractors, engineers, and construction professionals.',
            keywords: 'construction careers, building jobs, trade careers, construction industry',
            ogImage: `${baseUrl}/assets/images/og-images/og-construction.webp`,
            author: 'JustJobsInfo Team',
            publishDate: currentDate,
            ogType: 'website'
        },
        'logistic-industry': {
            title: 'Logistics Careers - Supply Chain & Transportation Jobs',
            description: 'Explore logistics and supply chain career opportunities, transportation management roles, warehouse positions, and resources for logistics professionals worldwide.',
            keywords: 'logistics careers, supply chain jobs, transportation careers, logistics industry',
            ogImage: `${baseUrl}/assets/images/og-images/og-logistic.webp`,
            author: 'JustJobsInfo Team',
            publishDate: currentDate,
            ogType: 'website'
        },
        'travel-industry': {
            title: 'Travel & Tourism Careers - Hospitality Job Opportunities',
            description: 'Discover travel industry careers, tourism jobs, hospitality positions, and career resources for travel agents, tour operators, and hospitality professionals.',
            keywords: 'travel careers, tourism jobs, hospitality careers, travel industry',
            ogImage: `${baseUrl}/assets/images/og-images/og-travel.webp`,
            author: 'JustJobsInfo Team',
            publishDate: currentDate,
            ogType: 'website'
        },
        
        // Tech Service Pages
        'it-consulting-service': {
            title: 'IT Consulting Services - Technology Career Solutions',
            description: 'Professional IT consulting services for technology professionals seeking career growth, resume optimization, and strategic guidance in the competitive tech industry.',
            keywords: 'IT consulting, technology careers, tech consulting, IT career services',
            ogImage: `${baseUrl}/assets/images/og-images/og-it-consulting.webp`,
            author: 'JustJobsInfo Team',
            publishDate: currentDate,
            ogType: 'website'
        },
        'development-service': {
            title: 'Software Development Career Services & Resources',
            description: 'Specialized career services for software developers including resume optimization, portfolio reviews, coding interview prep, and job search strategies for developers.',
            keywords: 'software development, developer careers, programming jobs, coding careers',
            ogImage: `${baseUrl}/assets/images/og-images/og-development.webp`,
            author: 'JustJobsInfo Team',
            publishDate: currentDate,
            ogType: 'website'
        },
        'cyber-security-service': {
            title: 'Cybersecurity Career Services - InfoSec Job Resources',
            description: 'Expert career services for cybersecurity professionals including resume writing, certification guidance, and job search strategies in the growing security field.',
            keywords: 'cybersecurity careers, infosec jobs, security careers, cyber security',
            ogImage: `${baseUrl}/assets/images/og-images/og-cyber-security.webp`,
            author: 'JustJobsInfo Team',
            publishDate: currentDate,
            ogType: 'website'
        },
        'ai-learning-service': {
            title: 'AI & Machine Learning Career Services',
            description: 'Specialized career support for AI and machine learning professionals including resume optimization, project portfolio guidance, and job search strategies in AI.',
            keywords: 'AI careers, machine learning jobs, artificial intelligence, ML careers',
            ogImage: `${baseUrl}/assets/images/og-images/og-career.webp`,
            author: 'JustJobsInfo Team',
            publishDate: currentDate,
            ogType: 'website'
        },
        'management-service': {
            title: 'Management & Leadership Career Services',
            description: 'Executive career services for managers and leaders including C-suite resume writing, leadership coaching, and strategic career planning for management professionals.',
            keywords: 'management careers, leadership jobs, executive careers, management services',
            ogImage: `${baseUrl}/assets/images/og-images/og-services.webp`,
            author: 'JustJobsInfo Team',
            publishDate: currentDate,
            ogType: 'website'
        },
        'technologies-service': {
            title: 'Technology Careers - Tech Industry Job Resources',
            description: 'Comprehensive career resources for technology professionals across all tech sectors including resume tips, skill assessments, and job search tools for tech careers.',
            keywords: 'technology careers, tech jobs, IT careers, technology industry',
            ogImage: `${baseUrl}/assets/images/og-images/og-services.webp`,
            author: 'JustJobsInfo Team',
            publishDate: currentDate,
            ogType: 'website'
        },
        'it-strategies': {
            title: 'IT Strategy Career Guidance - Tech Leadership Resources',
            description: 'Career resources for IT strategists and technology leaders focusing on strategic planning roles, enterprise architecture positions, and tech leadership development.',
            keywords: 'IT strategy, tech leadership, enterprise architecture, IT careers',
            ogImage: `${baseUrl}/assets/images/og-images/og-services.webp`,
            author: 'JustJobsInfo Team',
            publishDate: currentDate,
            ogType: 'website'
        },
        'it-innovations': {
            title: 'Innovation & Tech Careers - Emerging Technology Jobs',
            description: 'Career guidance for professionals in emerging technologies, innovation roles, research positions, and cutting-edge tech fields shaping the future of technology.',
            keywords: 'tech innovation, emerging technology, innovation careers, future tech',
            ogImage: `${baseUrl}/assets/images/og-images/og-services.webp`,
            author: 'JustJobsInfo Team',
            publishDate: currentDate,
            ogType: 'website'
        },
        
        // User Account Pages
        'login': {
            title: 'Login to Your JustJobsInfo Account',
            description: 'Sign in to access your personalized resume dashboard, saved job searches, application tracking, and career tools. Secure login for registered members.',
            keywords: 'login, sign in, user login, account access, member login',
            ogImage: `${baseUrl}/assets/images/og-images/og-login.webp`,
            author: 'JustJobsInfo Team',
            publishDate: currentDate,
            ogType: 'website'
        },
        'register': {
            title: 'Create Your Free JustJobsInfo Account',
            description: 'Register for free to access premium resume tools, save job searches, track applications, and receive personalized career guidance. Join thousands of successful job seekers.',
            keywords: 'register, sign up, create account, free registration, join',
            ogImage: `${baseUrl}/assets/images/og-images/og-register.webp`,
            author: 'JustJobsInfo Team',
            publishDate: currentDate,
            ogType: 'website'
        },
        'account': {
            title: 'My Account - Manage Your Career Profile | JustJobsInfo',
            description: 'Manage your account settings, update your resume, track job applications, review saved searches, and access your personalized career dashboard and tools.',
            keywords: 'my account, user profile, account settings, dashboard, career profile',
            ogImage: `${baseUrl}/assets/images/og-images/og-account.webp`,
            author: 'JustJobsInfo Team',
            publishDate: currentDate,
            ogType: 'website'
        },
        'forgot-password': {
            title: 'Reset Your Password - Account Recovery | JustJobsInfo',
            description: 'Forgot your password? Reset it securely and regain access to your JustJobsInfo account, saved resumes, and career tools. Quick and secure password recovery.',
            keywords: 'forgot password, reset password, account recovery, password help',
            ogImage: `${baseUrl}/assets/images/og-images/og-login.webp`,
            author: 'JustJobsInfo Team',
            publishDate: currentDate,
            ogType: 'website'
        },
        'verify-email': {
            title: 'Verify Your Email Address | JustJobsInfo',
            description: 'Verify your email address to activate your account and unlock full access to our career tools, resume builder, job alerts, and personalized career guidance.',
            keywords: 'verify email, email verification, account activation, confirm email',
            ogImage: `${baseUrl}/assets/images/og-images/og-login.webp`,
            author: 'JustJobsInfo Team',
            publishDate: currentDate,
            ogType: 'website'
        },
        
        // Legal & Info Pages
        'privacy-policy': {
            title: 'Privacy Policy - How We Protect Your Data | JustJobsInfo',
            description: 'Read our comprehensive privacy policy to understand how we collect, use, and protect your personal information. We are committed to your privacy and data security.',
            keywords: 'privacy policy, data protection, privacy statement, data security',
            ogImage: `${baseUrl}/assets/images/og-images/og-privacy.webp`,
            author: 'JustJobsInfo Team',
            publishDate: currentDate,
            ogType: 'website'
        },
        'terms-of-use': {
            title: 'Terms of Use - Service Agreement | JustJobsInfo',
            description: 'Review our terms of service and user agreement. Understand your rights and responsibilities when using JustJobsInfo career services, tools, and resources.',
            keywords: 'terms of use, terms of service, user agreement, service terms',
            ogImage: `${baseUrl}/assets/images/og-images/og-terms.webp`,
            author: 'JustJobsInfo Team',
            publishDate: currentDate,
            ogType: 'website'
        },
        'cookies-policy': {
            title: 'Cookie Policy - How We Use Cookies | JustJobsInfo',
            description: 'Learn about our cookie policy and how we use cookies to improve your experience, analyze site usage, and provide personalized content on JustJobsInfo.',
            keywords: 'cookie policy, cookies, tracking, site analytics, privacy',
            ogImage: `${baseUrl}/assets/images/og-images/og-privacy.webp`,
            author: 'JustJobsInfo Team',
            publishDate: currentDate,
            ogType: 'website'
        },
        
        // Additional Pages
        'career': {
            title: 'Career Opportunities at JustJobsInfo - Join Our Team',
            description: 'Explore exciting career opportunities at JustJobsInfo. Join our mission to help professionals succeed and grow your career in a dynamic, supportive environment.',
            keywords: 'careers, job openings, work with us, employment opportunities',
            ogImage: `${baseUrl}/assets/images/og-images/og-career.webp`,
            author: 'JustJobsInfo Team',
            publishDate: currentDate,
            ogType: 'website'
        },
        'team': {
            title: 'Meet Our Team - Career Experts & Resume Professionals',
            description: 'Meet the expert team behind JustJobsInfo. Our career counselors, resume writers, and tech specialists are dedicated to helping you achieve your career goals.',
            keywords: 'our team, about our team, career experts, professional team',
            ogImage: `${baseUrl}/assets/images/og-images/og-team.webp`,
            author: 'JustJobsInfo Team',
            publishDate: currentDate,
            ogType: 'website'
        },
        'partner': {
            title: 'Partner With Us - Business & Recruitment Partnerships',
            description: 'Partner with JustJobsInfo to access top talent, integrate our career tools, or collaborate on recruitment solutions. Let us help your business grow.',
            keywords: 'partnerships, business partners, recruitment partners, collaboration',
            ogImage: `${baseUrl}/assets/images/og-images/og-partner.webp`,
            author: 'JustJobsInfo Team',
            publishDate: currentDate,
            ogType: 'website'
        },
        'case-studies': {
            title: 'Success Stories - Real Career Transformation Results',
            description: 'Read inspiring success stories from professionals who transformed their careers with JustJobsInfo. See real results from our resume services and career guidance.',
            keywords: 'case studies, success stories, client results, testimonials',
            ogImage: `${baseUrl}/assets/images/og-images/og-case-studies.webp`,
            author: 'JustJobsInfo Team',
            publishDate: currentDate,
            ogType: 'website'
        },
        'award': {
            title: 'Awards & Recognition - Industry-Leading Career Services',
            description: 'Discover the awards and recognition JustJobsInfo has received for excellence in career services, resume writing, and innovative job search technology solutions.',
            keywords: 'awards, recognition, achievements, industry awards',
            ogImage: `${baseUrl}/assets/images/og-images/og-about.webp`,
            author: 'JustJobsInfo Team',
            publishDate: currentDate,
            ogType: 'website'
        },
        'why-choose-us': {
            title: 'Why Choose JustJobsInfo - Your Career Success Partner',
            description: 'Discover why thousands choose JustJobsInfo for career success: AI-powered tools, expert guidance, proven results, and personalized support throughout your job search journey.',
            keywords: 'why choose us, benefits, advantages, career success, our difference',
            ogImage: `${baseUrl}/assets/images/og-images/og-about.webp`,
            author: 'JustJobsInfo Team',
            publishDate: currentDate,
            ogType: 'website'
        },
        'apply': {
            title: 'Apply for Jobs - Submit Your Application | JustJobsInfo',
            description: 'Apply for your dream job with confidence. Submit your application with our optimized resume templates and application tracking system. Get hired faster.',
            keywords: 'apply for jobs, job application, submit application, apply now',
            ogImage: `${baseUrl}/assets/images/og-images/og-job-listing.webp`,
            author: 'JustJobsInfo Team',
            publishDate: currentDate,
            ogType: 'website'
        },
        'askgenie': {
            title: 'Ask Genie - AI Career Assistant & Job Search Helper',
            description: 'Get instant career advice from our AI-powered Genie assistant. Ask questions about resumes, job search strategies, interview tips, and receive personalized guidance 24/7.',
            keywords: 'AI assistant, career help, ask questions, job search help, chatbot',
            ogImage: `${baseUrl}/assets/images/og-images/og-askgenie.webp`,
            author: 'JustJobsInfo Team',
            publishDate: currentDate,
            ogType: 'website'
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
            { name: 'author', content: metaTags.author || 'JustJobsInfo Team' },
            
            // Open Graph tags
            { property: 'og:title', content: metaTags.title },
            { property: 'og:description', content: metaTags.description },
            { property: 'og:image', content: fullImageUrl },
            { property: 'og:image:secure_url', content: fullImageUrl },
            { property: 'og:image:width', content: '1200' },
            { property: 'og:image:height', content: '630' },
            { property: 'og:image:alt', content: metaTags.title },
            { property: 'og:image:type', content: 'image/webp' },
            { property: 'og:url', content: currentUrl },
            { property: 'og:type', content: metaTags.ogType || 'website' },
            { property: 'og:site_name', content: 'JustJobsInfo' },
            { property: 'og:locale', content: 'en_US' },
            { property: 'article:author', content: metaTags.author || 'JustJobsInfo Team' },
            { property: 'article:published_time', content: metaTags.publishDate || new Date().toISOString() },
            { property: 'article:modified_time', content: metaTags.modifiedDate || new Date().toISOString() },
            { property: 'og:updated_time', content: metaTags.modifiedDate || new Date().toISOString() },
            
            // Additional date meta tags
            { name: 'publish_date', content: metaTags.publishDate || new Date().toISOString() },
            { name: 'date', content: metaTags.publishDate || new Date().toISOString() },
            
            // Twitter Card tags
            { name: 'twitter:card', content: 'summary_large_image' },
            { name: 'twitter:title', content: metaTags.title },
            { name: 'twitter:description', content: metaTags.description },
            { name: 'twitter:image', content: fullImageUrl },
            { name: 'twitter:image:alt', content: metaTags.title },
            { name: 'twitter:site', content: '@justjobsinfo' },
            { name: 'twitter:creator', content: '@justjobsinfo' },
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
