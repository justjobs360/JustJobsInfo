# JustJobs Info - Career Platform

A comprehensive career platform built with Next.js that provides job search, resume building, CV auditing, and career resources for professionals.

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

## 🚀 Deployment

### Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on git push

### Environment Variables for Production
Ensure all required environment variables are set in your production environment:
- Database connection strings
- API keys for external services
- Firebase configuration
- Email service configuration

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

### Current Version: 1.0.0
- Initial release with core features
- Job search and listing functionality
- Resume builder with multiple templates
- AI-powered CV audit system
- Admin panel with comprehensive management
- Email notification system
- SEO optimization tools

---

**Note**: This is a comprehensive career platform designed to help professionals advance their careers through job search, resume building, and career resources. The system includes both user-facing features and administrative tools for content and user management.