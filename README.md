# JustJobs Info - Career Platform

> **🚀 Production-Ready Career Platform** | Next.js 14 | AI-Powered | Enterprise-Grade SEO

A comprehensive career platform built with Next.js that provides job search, resume building, CV auditing, and career resources for professionals.

**Live Site**: [https://justjobs.info](https://justjobs.info)

---

## 📚 Documentation

**Quick Links to Comprehensive Guides:**

| Guide | Description | Link |
|-------|-------------|------|
| 📄 **SEO Guide** | Complete technical SEO implementation, meta tags, sitemap, analytics | [SEO-GUIDE.md](./SEO-GUIDE.md) |
| 👨‍💼 **Admin Guide** | Admin panel management, user roles, permissions, footer/template management | [ADMIN-GUIDE.md](./ADMIN-GUIDE.md) |
| ⚙️ **Features Guide** | Resume Builder, CV Audit, Job Listing system documentation | [FEATURES-GUIDE.md](./FEATURES-GUIDE.md) |
| 📧 **Email Guide** | Email verification, deliverability, Firebase & Brevo setup | [EMAIL-GUIDE.md](./EMAIL-GUIDE.md) |
| 🔒 **Security Guide** | Security setup, spam protection, authentication | [SECURITY_SETUP_GUIDE.md](./SECURITY_SETUP_GUIDE.md) |

---

## 📖 Table of Contents

- [Documentation](#-documentation)
- [Features](#-features)
- [Technical Stack](#️-technical-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Troubleshooting](#-troubleshooting)
- [Deployment Guide](#-deployment-guide)
- [API Documentation](#-api-documentation)
- [Configuration](#-configuration)
- [Monitoring & Analytics](#-monitoring--analytics)
- [Security Features](#-security-features)
- [Development Workflow](#-development-workflow)
- [Contributing](#-contributing)
- [Support](#-support)
- [Version History](#-version-history)

## 🚀 Features

### Core Features

#### 1. **Job Search & Listings**
- **Advanced Job Search**: Search jobs by keywords, location, industry, employment type
- **Industry-Specific Filtering**: Dedicated pages for Fintech, Healthcare, Finance, Engineering, Education, Construction
- **Real-time Job Data**: Integration with JSearch API for up-to-date job listings
- **Location-based Search**: Auto-detection and manual location input
- **Job Alerts**: Email notifications for matching job opportunities
- **Admin Job Management**: Add, edit, and manage featured job postings

#### 2. **Resume Builder**
- **Multiple Templates**: 7+ professional resume templates
- **Live Editing**: Real-time content editing with auto-save
- **Template Categories**: Free, Simple, Modern, and Premium templates
- **Export Options**: HTML and PDF export capabilities
- **AI Template Generator**: Create custom templates using natural language prompts
- **Section Management**: Add/remove custom sections (certifications, projects, languages)

#### 3. **CV Audit & Analysis**
- **AI-Powered Analysis**: OpenAI GPT-4 integration for comprehensive CV review
- **File Support**: PDF and DOCX file upload and processing
- **Detailed Feedback**: Overall score, strengths, weaknesses, and recommendations
- **Downloadable Reports**: Annotated and improved CV PDFs
- **Real-time Processing**: Live status updates during analysis

#### 4. **Blog & Content Management**
- **Dynamic Blog System**: Create, edit, and manage blog posts
- **Rich Text Editor**: Visual and HTML editing modes
- **Category Management**: Organize posts by categories
- **SEO Optimization**: Meta tags, descriptions, and keywords
- **Image Upload**: Support for blog images and banners
- **Comment System**: User engagement features

#### 5. **Admin Panel**
- **Comprehensive Dashboard**: Analytics, statistics, and activity monitoring
- **User Management**: Admin user creation, role assignment, and permissions
- **Content Management**: Blog posts, job listings, and resources
- **SEO Management**: Meta tags, sitemap, and robots.txt
- **Analytics**: Resume audit stats, download metrics, and user activity
- **Role-based Access**: Super admin and regular admin permissions

### Advanced Features

#### 6. **SEO & Meta Management**
- **Dynamic Meta Tags**: Page-specific SEO optimization
- **Sitemap Generation**: Automatic XML sitemap creation
- **Robots.txt Management**: Search engine crawling control
- **Open Graph Tags**: Social media sharing optimization
- **Structured Data**: Rich snippets for better search visibility

#### 7. **Email & Notifications**
- **Job Alerts**: Automated email notifications for job matches
- **Brevo Integration**: Professional email delivery service
- **Unsubscribe Management**: User preference controls
- **Email Templates**: Customizable HTML email templates
- **Delivery Tracking**: Email send status and analytics

#### 8. **Authentication & Security**
- **Firebase Authentication**: Secure user registration and login
- **Email Verification**: Account verification system
- **Role-based Access Control**: Admin and user permission systems
- **Rate Limiting**: API protection against abuse
- **Data Validation**: Comprehensive input validation

#### 9. **Resource Management**
- **Downloadable Resources**: Career guides, templates, and documents
- **Important Links**: Curated career resources and tools
- **File Management**: Upload, organize, and track resource usage
- **Access Control**: Public and premium resource categories

#### 10. **Analytics & Monitoring**
- **Usage Statistics**: Track feature usage and user engagement
- **Performance Metrics**: API response times and error rates
- **Admin Dashboard**: Real-time system monitoring
- **Cache Management**: Redis-based caching for performance

## 🛠️ Technical Stack

### Frontend
- **Next.js 14**: React framework with App Router
- **React 18**: Component-based UI development
- **Tailwind CSS**: Utility-first CSS framework
- **Swiper.js**: Touch slider functionality
- **React Hot Toast**: Notification system

### Backend
- **Next.js API Routes**: Serverless API endpoints
- **MongoDB**: NoSQL database for data storage
- **Firebase Admin SDK**: Authentication and user management
- **Redis**: Caching and session management

### External Services
- **JSearch API**: Job search data provider
- **OpenAI API**: AI-powered CV analysis
- **Brevo (Sendinblue)**: Email delivery service
- **Vercel**: Hosting and deployment platform

### Development Tools
- **ESLint**: Code linting and quality assurance
- **Prettier**: Code formatting
- **TypeScript**: Type safety (partial implementation)

## 📁 Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (inner)/                 # Public pages
│   │   ├── job-listing/         # Job search functionality
│   │   ├── resume-builder/      # Resume creation tools
│   │   ├── resume-audit/        # CV analysis feature
│   │   ├── job-alerts/          # Email subscription
│   │   └── blogs/               # Blog system
│   ├── admin/                   # Admin panel pages
│   │   ├── blog/                # Blog management
│   │   ├── seo/                 # SEO management
│   │   ├── resume/              # Resume template management
│   │   └── admins/              # User management
│   └── api/                     # API endpoints
│       ├── jobs/                # Job search APIs
│       ├── cv-audit/            # CV analysis APIs
│       ├── job-alerts/          # Email notification APIs
│       └── admin/               # Admin management APIs
├── components/                   # Reusable UI components
│   ├── admin/                   # Admin-specific components
│   ├── resume/                  # Resume builder components
│   ├── resume-audit/            # CV audit components
│   └── common/                  # Shared components
├── contexts/                    # React context providers
├── utils/                       # Utility functions and services
└── hooks/                       # Custom React hooks
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- MongoDB database
- Firebase project
- OpenAI API key
- Brevo API key
- JSearch API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd JustJobsInfo-master
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file with the following variables:
   ```env
   # Database
   MONGODB_URI=your_mongodb_connection_string
   
   # Firebase
   FIREBASE_PROJECT_ID=your_firebase_project_id
   FIREBASE_PRIVATE_KEY=your_firebase_private_key
   FIREBASE_CLIENT_EMAIL=your_firebase_client_email
   
   # External APIs
   OPENAI_API_KEY=your_openai_api_key
   BREVO_API_KEY=your_brevo_api_key
   JSEARCH_API_KEY=your_jsearch_api_key
   
   # App Configuration
   NEXTAUTH_SECRET=your_nextauth_secret
   NEXTAUTH_URL=http://localhost:3000
   ```

4. **Run the development server**
```bash
npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📚 API Documentation

### Job Search API
- `GET /api/jobs/search` - Search jobs with filters
- `GET /api/admin/jobs` - Admin job management
- `POST /api/admin/jobs` - Create new job posting

### Resume Builder API
- `GET /api/admin/resume-templates` - Get resume templates
- `POST /api/admin/resume-templates` - Update template status

### CV Audit API
- `POST /api/cv-audit` - Analyze uploaded CV
- `POST /api/cv-audit/download` - Download analysis reports

### Job Alerts API
- `POST /api/job-alerts/subscribe` - Subscribe to job alerts
- `POST /api/job-alerts/send` - Send job alert emails
- `GET /api/job-alerts/unsubscribe` - Unsubscribe from alerts

### Admin API
- `GET /api/admin/dashboard-stats` - Dashboard statistics
- `POST /api/admin/users/create` - Create admin user
- `PUT /api/admin/users/update` - Update admin user
- `GET /api/admin/meta-tags` - Manage SEO meta tags

## 🔧 Configuration

### Admin Setup
1. Access the admin panel at `/admin`
2. Create your first super admin account
3. Configure system settings and permissions
4. Set up email templates and notifications

### SEO Configuration
1. Navigate to Admin Panel > SEO Settings
2. Configure meta tags for each page
3. Set up sitemap and robots.txt
4. Monitor SEO performance

### Email Configuration
1. Set up Brevo account and API key
2. Configure email templates
3. Test email delivery
4. Set up job alert automation

## 🔧 Troubleshooting

### Common Issues & Solutions

#### 1. reCAPTCHA Verification Failed
**Symptoms:**
- Users see "reCAPTCHA verification failed" error
- Contact forms not submitting
- Login/registration blocked

**Solutions:**
```bash
# Check reCAPTCHA configuration
1. Verify RECAPTCHA_SITE_KEY and RECAPTCHA_SECRET_KEY in .env.local
2. Ensure domain is added to reCAPTCHA console
3. Check if keys match between frontend and backend

# For local development:
# Add localhost to allowed domains in Google reCAPTCHA console

# For production:
# Add your production domain to allowed domains
```

**Debug Steps:**
1. Check browser console for reCAPTCHA errors
2. Verify reCAPTCHA keys in environment variables
3. Test with different browsers/incognito mode
4. Check reCAPTCHA console for blocked requests

#### 2. Authentication Issues
**Symptoms:**
- Users cannot log in/register
- Firebase authentication errors
- "User not authenticated" messages

**Solutions:**
```bash
# Check Firebase configuration
1. Verify FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY
2. Ensure Firebase project is active and billing enabled
3. Check Firebase Auth settings in console

# Common fixes:
- Regenerate Firebase private key if expired
- Check Firebase project quota limits
- Verify email verification settings
```

#### 3. Database Connection Issues
**Symptoms:**
- MongoDB connection errors
- API endpoints returning 500 errors
- Data not saving/loading

**Solutions:**
```bash
# Check MongoDB connection
1. Verify MONGODB_URI format: mongodb+srv://username:password@cluster.mongodb.net/database
2. Ensure MongoDB Atlas IP whitelist includes 0.0.0.0/0 (or your server IP)
3. Check database user permissions
4. Verify network connectivity

# Test connection:
node -e "
const { MongoClient } = require('mongodb');
const client = new MongoClient(process.env.MONGODB_URI);
client.connect().then(() => console.log('Connected')).catch(console.error);
"
```

#### 4. API Rate Limiting
**Symptoms:**
- "Too many requests" errors
- Job search API failures
- Slow response times

**Solutions:**
```bash
# Check API quotas
1. Verify JSEARCH_API_KEY has sufficient quota
2. Check OpenAI API usage limits
3. Monitor Redis cache hit rates
4. Implement request batching for high-volume operations
```

#### 5. Email Delivery Issues
**Symptoms:**
- Job alerts not sending
- Contact form emails not delivered
- Brevo API errors

**Solutions:**
```bash
# Check Brevo configuration
1. Verify BREVO_API_KEY is valid and active
2. Check sender email domain verification
3. Monitor email delivery logs in Brevo dashboard
4. Test with different recipient domains

# Debug email sending:
- Check spam folders
- Verify email templates
- Test with simple text emails first
```

#### 6. File Upload Issues
**Symptoms:**
- CV uploads failing
- Image uploads not working
- File size errors

**Solutions:**
```bash
# Check file upload limits
1. Verify Vercel file size limits (10MB for serverless functions)
2. Check MongoDB GridFS configuration
3. Ensure proper file type validation
4. Test with different file formats

# Increase limits if needed:
- Use external storage (AWS S3, Cloudinary)
- Implement chunked uploads for large files
```

### Development Issues

#### 7. Build Errors
**Symptoms:**
- Next.js build failures
- TypeScript errors
- Dependency conflicts

**Solutions:**
```bash
# Clean and rebuild
rm -rf .next node_modules package-lock.json
npm install
npm run build

# Check for:
- Missing environment variables
- Import/export errors
- Circular dependencies
- Outdated packages
```

#### 8. Hot Reload Not Working
**Symptoms:**
- Changes not reflecting in browser
- Stale component state
- CSS not updating

**Solutions:**
```bash
# Restart development server
npm run dev

# Clear browser cache
# Check for syntax errors in console
# Verify file watching is working
```

## 🚀 Deployment Guide

### Pre-Deployment Checklist

#### 1. Environment Variables
Ensure all production environment variables are set:

```bash
# Required for production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/justjobsdata
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
OPENAI_API_KEY=sk-...
BREVO_API_KEY=xkeys-...
JSEARCH_API_KEY=...
RECAPTCHA_SITE_KEY=6Lc...
RECAPTCHA_SECRET_KEY=6Lc...
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=https://your-domain.com
```

#### 2. Database Setup
```bash
# Create production database
1. Set up MongoDB Atlas cluster
2. Create database: justjobsdata
3. Set up user with read/write permissions
4. Configure IP whitelist
5. Test connection from production server
```

#### 3. Firebase Configuration
```bash
# Production Firebase setup
1. Create production Firebase project
2. Enable Authentication with Email/Password
3. Configure authorized domains
4. Set up Firestore security rules
5. Generate service account key
```

### Vercel Deployment

#### 1. Repository Setup
```bash
# Connect to Vercel
1. Push code to GitHub repository
2. Connect repository to Vercel
3. Configure build settings:
   - Framework Preset: Next.js
   - Build Command: npm run build
   - Output Directory: .next
   - Install Command: npm install
```

#### 2. Environment Variables in Vercel
```bash
# Add all environment variables in Vercel dashboard
1. Go to Project Settings > Environment Variables
2. Add all required variables
3. Set for Production, Preview, and Development
4. Redeploy after adding variables
```

#### 3. Custom Domain Setup
```bash
# Configure custom domain
1. Add domain in Vercel dashboard
2. Update DNS records:
   - A record: 76.76.19.61
   - CNAME for www: cname.vercel-dns.com
3. Configure SSL certificate (automatic)
4. Update NEXTAUTH_URL with new domain
```

### Manual Deployment Process

#### 1. Local Changes to Production
```bash
# When making changes locally that need to go to production:

# 1. Test changes locally
npm run dev
# Test all functionality thoroughly

# 2. Build and test production build
npm run build
npm start
# Verify production build works

# 3. Commit and push changes
git add .
git commit -m "Description of changes"
git push origin main

# 4. Verify deployment
# Check Vercel deployment logs
# Test production site
# Monitor for any errors

# 5. Post-deployment verification
- Test all major features
- Check admin panel functionality
- Verify email sending
- Test file uploads
- Check API endpoints
```

#### 2. Database Migrations
```bash
# For database schema changes:
1. Create migration scripts in /migrations folder
2. Test migrations on staging environment
3. Backup production database
4. Run migrations during maintenance window
5. Verify data integrity
6. Update application code if needed
```

#### 3. Rollback Procedures
```bash
# If deployment fails:
1. Revert to previous commit
2. Force push to trigger new deployment
3. Check Vercel deployment history
4. Restore from backup if database affected
5. Monitor error logs
6. Communicate with users if needed
```

### Post-Deployment Verification

#### 1. Functionality Tests
- [ ] Homepage loads correctly
- [ ] Job search works
- [ ] Resume builder functions
- [ ] CV audit system works
- [ ] Admin panel accessible
- [ ] Email notifications send
- [ ] File uploads work
- [ ] Contact forms submit

#### 2. Performance Checks
- [ ] Page load times < 3 seconds
- [ ] API response times < 1 second
- [ ] No console errors
- [ ] Images load correctly
- [ ] Mobile responsiveness

#### 3. Security Verification
- [ ] HTTPS enabled
- [ ] Environment variables secured
- [ ] Admin access restricted
- [ ] API endpoints protected
- [ ] File uploads validated

### Monitoring Setup

#### 1. Error Tracking
```bash
# Set up error monitoring
1. Configure Vercel Analytics
2. Set up Sentry for error tracking
3. Monitor API response times
4. Set up alerts for critical errors
```

#### 2. Performance Monitoring
```bash
# Monitor application performance
1. Use Vercel Analytics for Core Web Vitals
2. Monitor database query performance
3. Track API usage and limits
4. Monitor email delivery rates
```

#### 3. Backup Procedures
```bash
# Regular backups
1. MongoDB Atlas automated backups
2. Firebase data exports
3. Code repository backups
4. Environment variable documentation
```

## 📝 Admin Panel Guide

### Getting Started with Admin Panel

#### 1. First-Time Setup
```bash
# Access admin panel
1. Navigate to /admin
2. Create your first super admin account
3. Configure system permissions
4. Set up initial content

# Super Admin Features:
- Create and manage other admin users
- Configure system-wide permissions
- Access all admin features
- Manage footer content and settings
```

#### 2. User Management
```bash
# Creating Admin Users
1. Go to Admin Panel > Admin Management
2. Click "Create New Admin"
3. Fill in user details:
   - Email address
   - Role (Admin or Super Admin)
   - Permissions (check required permissions)
4. User will receive email invitation

# Managing Permissions
- Super Admin: Full access to all features
- Regular Admin: Limited access based on permissions
- Can grant/revoke specific permissions
- Monitor user activity and actions
```

#### 3. Content Management

##### Blog Management
```bash
# Creating Blog Posts
1. Navigate to Admin Panel > Blog Management
2. Click "Create New Post"
3. Fill in post details:
   - Title and content
   - Featured image
   - Category and tags
   - SEO meta information
4. Preview before publishing
5. Schedule or publish immediately

# Managing Existing Posts
- Edit, delete, or unpublish posts
- Monitor post performance
- Manage comments and engagement
- Update SEO settings
```

##### Job Management
```bash
# Adding Featured Jobs
1. Go to Admin Panel > Job Management
2. Click "Add New Job"
3. Fill in job details:
   - Company name and description
   - Job title and requirements
   - Location and salary range
   - Employment type
4. Set as featured for homepage display
5. Publish or save as draft

# Job Analytics
- Track job view counts
- Monitor application rates
- Analyze popular job categories
- Export job data for reporting
```

##### SEO Management
```bash
# Meta Tags Configuration
1. Navigate to Admin Panel > SEO Settings
2. Configure global SEO settings:
   - Default meta titles and descriptions
   - Open Graph tags
   - Twitter Card settings
3. Set page-specific SEO:
   - Individual page titles
   - Custom meta descriptions
   - Focus keywords
4. Generate and update sitemap
5. Configure robots.txt

# SEO Monitoring
- Track search engine rankings
- Monitor organic traffic
- Analyze keyword performance
- Generate SEO reports
```

#### 4. Footer Management (New Feature)

##### Managing Footer Content
```bash
# General Settings
1. Go to Admin Panel > Footer Management
2. Configure general information:
   - Company description
   - Copyright text
   - Developer credits
3. Save changes

# Footer Sections
- Add/edit footer sections (About, Services, etc.)
- Manage section titles
- Add/remove links within sections
- Organize link hierarchy

# Social Media Links
- Add social media platforms
- Configure icons and links
- Set accessibility labels
- Manage link visibility

# Reset to Defaults
- Restore original footer content
- Useful for reverting changes
- Backup current settings first
```

#### 5. Analytics and Reporting

##### Dashboard Overview
```bash
# Key Metrics
- Total registered users
- Resume audits performed
- Job searches conducted
- Blog post views
- Email subscriptions

# Recent Activity
- Latest user registrations
- Recent resume audits
- New blog posts
- System notifications
- Error logs and alerts
```

##### Detailed Analytics
```bash
# User Analytics
- Registration trends
- User engagement metrics
- Feature usage statistics
- Geographic distribution

# Content Performance
- Most popular blog posts
- Job search statistics
- Resume template usage
- CV audit success rates

# System Performance
- API response times
- Error rates and logs
- Database performance
- Email delivery rates
```

#### 6. System Configuration

##### Email Settings
```bash
# Brevo Configuration
1. Set up Brevo API key
2. Configure email templates
3. Test email delivery
4. Monitor delivery rates

# Job Alert System
- Configure alert frequency
- Set up email templates
- Manage subscriber lists
- Handle unsubscribe requests
```

##### Security Settings
```bash
# Access Control
- Monitor admin login attempts
- Set up two-factor authentication
- Configure session timeouts
- Review user permissions regularly

# API Security
- Monitor API usage
- Set rate limits
- Review access logs
- Update security keys
```

#### 7. Troubleshooting Admin Issues

##### Common Admin Problems
```bash
# Permission Issues
- User cannot access certain features
- Check user role and permissions
- Verify permission assignments
- Update user permissions if needed

# Content Not Saving
- Check database connection
- Verify user permissions
- Review error logs
- Test with different browser

# Email Not Sending
- Verify Brevo configuration
- Check email templates
- Test with simple emails
- Monitor delivery logs
```

##### Admin Panel Maintenance
```bash
# Regular Maintenance Tasks
1. Review and update user permissions
2. Monitor system performance
3. Backup important data
4. Update content regularly
5. Check for security updates
6. Review error logs
7. Test all admin functions
```

## 🔄 Development Workflow

### Local Development Setup

#### 1. Development Environment
```bash
# Clone and setup
git clone <repository-url>
cd JustJobsInfo-master
npm install

# Environment configuration
cp .env.example .env.local
# Edit .env.local with your local settings

# Start development server
npm run dev
# Access at http://localhost:3000
```

#### 2. Code Organization
```bash
# File structure conventions
src/
├── app/                    # Next.js App Router pages
│   ├── (inner)/           # Public pages
│   ├── admin/             # Admin panel pages
│   └── api/               # API endpoints
├── components/            # Reusable components
│   ├── admin/             # Admin-specific components
│   ├── common/            # Shared components
│   └── [feature]/         # Feature-specific components
├── contexts/              # React contexts
├── utils/                 # Utility functions
└── hooks/                 # Custom React hooks
```

#### 3. Development Best Practices
```bash
# Code Standards
- Use functional components with hooks
- Follow Next.js App Router conventions
- Implement proper error handling
- Add loading states for async operations
- Use TypeScript where possible
- Follow ESLint and Prettier rules

# Component Guidelines
- Keep components focused and reusable
- Use proper prop validation
- Implement responsive design
- Add accessibility features
- Optimize for performance
```

#### 4. Testing Strategy
```bash
# Testing Approach
1. Manual testing for user flows
2. Test admin panel functionality
3. Verify API endpoints
4. Check responsive design
5. Test error scenarios
6. Validate form submissions
7. Test file uploads
8. Verify email functionality

# Testing Checklist
- [ ] All pages load correctly
- [ ] Forms validate and submit
- [ ] Admin features work
- [ ] Mobile responsiveness
- [ ] Cross-browser compatibility
- [ ] Performance optimization
- [ ] Security measures
```

#### 5. Git Workflow
```bash
# Branch Strategy
- main: Production-ready code
- develop: Development branch
- feature/*: Feature branches
- hotfix/*: Emergency fixes

# Commit Guidelines
- Use descriptive commit messages
- Include issue numbers when applicable
- Test changes before committing
- Keep commits focused and atomic
- Use conventional commit format

# Pull Request Process
1. Create feature branch
2. Make changes and test
3. Create pull request
4. Code review process
5. Merge to develop/main
6. Deploy to staging/production
```

### Code Quality and Standards

#### 1. Code Review Process
```bash
# Review Checklist
- [ ] Code follows project conventions
- [ ] No console.log statements in production
- [ ] Proper error handling implemented
- [ ] Performance optimizations applied
- [ ] Security best practices followed
- [ ] Documentation updated if needed
- [ ] Tests pass successfully
```

#### 2. Performance Optimization
```bash
# Frontend Optimization
- Use Next.js Image component
- Implement code splitting
- Optimize bundle size
- Use React.memo for expensive components
- Implement proper caching strategies

# Backend Optimization
- Optimize database queries
- Implement API caching
- Use connection pooling
- Monitor API response times
- Implement rate limiting
```

#### 3. Security Best Practices
```bash
# Security Measures
- Validate all user inputs
- Implement proper authentication
- Use HTTPS in production
- Secure environment variables
- Implement rate limiting
- Regular security audits
- Keep dependencies updated
```

## 📊 Monitoring & Analytics

### Admin Dashboard
- User registration and activity metrics
- Resume audit statistics
- Job search analytics
- Email delivery reports
- System performance monitoring

### Performance Optimization
- Redis caching for API responses
- Image optimization with Next.js
- Code splitting and lazy loading
- CDN integration for static assets

### Monitoring Tools
```bash
# Application Monitoring
- Vercel Analytics for Core Web Vitals
- Custom admin dashboard metrics
- API response time monitoring
- Error tracking and logging
- User behavior analytics

# Infrastructure Monitoring
- Database performance metrics
- Server resource usage
- CDN performance
- Email delivery tracking
- Third-party API monitoring
```

## 🔒 Security Features

### Authentication
- Firebase Authentication integration
- Email verification required
- Password strength requirements
- Session management

### Data Protection
- Input validation and sanitization
- Rate limiting on API endpoints
- CORS configuration
- Environment variable protection

### Admin Security
- Role-based access control
- Permission-based feature access
- Audit logging for admin actions
- Secure API endpoints

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is proprietary software. All rights reserved.

## 🆘 Support

For technical support or questions:
- Check the documentation in the `/docs` folder
- Review existing issues in the repository
- Contact the development team

## 🔄 Version History

### Version 2.0.0 (Current - October 2025)
**Major Update: Enterprise-Grade SEO & Documentation Overhaul**

- ✅ **Complete Technical SEO Implementation**:
  - 62 pages with optimized meta tags
  - 60 pages with breadcrumb navigation (98.4% coverage)
  - 33 Open Graph images (1200x630px)
  - Dynamic robots.txt and sitemap.xml (MongoDB-backed)
  - 8 structured data schemas (JSON-LD)
  - Real-time meta tags validation
  - Google Analytics 4 & Search Console integration

- ✅ **Documentation Consolidation**:
  - Merged 17 scattered .md files into 4 comprehensive guides
  - SEO-GUIDE.md - Complete SEO implementation
  - ADMIN-GUIDE.md - Admin panel management
  - FEATURES-GUIDE.md - Resume Builder, CV Audit, Jobs
  - EMAIL-GUIDE.md - Email system & deliverability

- ✅ **Performance Optimizations**:
  - Dynamic imports for heavy components
  - Code splitting implemented
  - Improved Core Web Vitals

- ✅ **New Features**:
  - SEO Dashboard (`/admin/seo/dashboard`)
  - Meta tags bulk import
  - Breadcrumb component with structured data
  - Image optimization utilities

### Version 1.1.0 (2024)
- ✅ **Footer Management System**: Complete admin control over footer content
- ✅ **Enhanced Admin Panel**: Improved user management and permissions
- ✅ **Authentication Fixes**: Resolved API authentication issues
- ✅ **Button Styling**: Consistent button styles across admin interface
- ✅ **Dynamic Footer**: Frontend fetches footer content from database
- ✅ **Permission System**: Granular admin permissions with MANAGE_FOOTER

### Version 1.0.0 (Initial Release - 2024)
- Job search and listing functionality
- Resume builder with multiple templates
- AI-powered CV audit system
- Admin panel with comprehensive management
- Email notification system
- SEO optimization tools

## 📋 Quick Reference Guide

### Essential Commands
```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Database
npm run db:seed      # Seed database with sample data
npm run db:reset     # Reset database

# Deployment
git push origin main # Deploy to Vercel (automatic)
```

### Key Environment Variables
```bash
# Required for all environments
MONGODB_URI=...
FIREBASE_PROJECT_ID=...
FIREBASE_PRIVATE_KEY=...
FIREBASE_CLIENT_EMAIL=...

# API Keys
OPENAI_API_KEY=...
BREVO_API_KEY=...
JSEARCH_API_KEY=...
RECAPTCHA_SITE_KEY=...
RECAPTCHA_SECRET_KEY=...

# App Configuration
NEXTAUTH_SECRET=...
NEXTAUTH_URL=...
```

### Important URLs
- **Local Development**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin
- **API Documentation**: http://localhost:3000/api
- **Production**: https://your-domain.com

### Emergency Contacts
- **Technical Issues**: Check troubleshooting guide above
- **Admin Access**: Contact super admin for permission issues
- **Database Issues**: Check MongoDB Atlas dashboard
- **Email Issues**: Verify Brevo configuration
- **Deployment Issues**: Check Vercel deployment logs

---

## 📞 Support & Maintenance

### Regular Maintenance Tasks
- [ ] **Weekly**: Review admin panel usage and errors
- [ ] **Monthly**: Update dependencies and security patches
- [ ] **Quarterly**: Review and update content
- [ ] **Annually**: Full security audit and performance review

### Getting Help
1. **Check Documentation**: Review this README and troubleshooting guide
2. **Check Logs**: Review Vercel deployment logs and browser console
3. **Test Locally**: Reproduce issues in development environment
4. **Contact Support**: Reach out to development team with specific error details

### Contributing Guidelines
1. Follow the established code conventions
2. Test all changes thoroughly
3. Update documentation for new features
4. Create descriptive commit messages
5. Submit pull requests with clear descriptions

---

**Note**: This is a comprehensive career platform designed to help professionals advance their careers through job search, resume building, and career resources. The system includes both user-facing features and administrative tools for content and user management.

**Last Updated**: December 2024  
**Version**: 1.1.0  
**Maintained By**: Development Team