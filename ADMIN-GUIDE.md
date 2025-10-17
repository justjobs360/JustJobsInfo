# Admin Panel Management Guide - JustJobsInfo

**Last Updated**: October 17, 2025  
**Project**: https://justjobs.info

---

## 📑 Table of Contents

1. [Overview](#overview)
2. [Admin User Management](#admin-user-management)
3. [Footer Management](#footer-management)
4. [Resume Template Management](#resume-template-management)
5. [SEO Management](#seo-management)
6. [Permissions System](#permissions-system)
7. [Security Features](#security-features)
8. [Troubleshooting](#troubleshooting)

---

## Overview

The JustJobsInfo admin panel provides comprehensive tools for managing all aspects of your website, from user roles to content management and SEO settings.

### Admin Panel Access

**URL**: `https://justjobs.info/admin`

**Requirements**:
- Valid admin account
- Appropriate permissions for each section
- Firebase authentication enabled

### Admin Roles

1. **Super Admin**
   - Full access to all features
   - Can create/edit/delete other admins
   - Manage system-wide settings
   - Access to all admin panels

2. **Regular Admin**
   - Limited access based on assigned permissions
   - Can manage content within their permissions
   - Cannot create other admin users
   - Customizable permission set

---

## Admin User Management

### Overview

The admin user management system allows super admins to promote existing users to admin roles, manage permissions, and control access to various admin features.

### Accessing Admin Management

1. Navigate to: `/admin/admins`
2. **Requires**: Super Admin role
3. **Permission**: `MANAGE_ADMINS`

### Creating Admin Users

**Method 1: Promote Existing User**

1. Click "Promote User to Admin"
2. Enter user's email address OR Firebase UID
3. Select role:
   - **Admin**: Regular admin with custom permissions
   - **Super Admin**: Full system access
4. Choose permissions (for regular admins)
5. Click "Promote"

**Method 2: API Integration**

```javascript
POST /api/admin/users/create
{
  "email": "user@example.com",
  "role": "admin",
  "permissions": ["view_dashboard", "manage_content"],
  "createdBy": "super_admin"
}
```

### Editing Admin Users

1. Find user in admin list
2. Click "Edit" button
3. Modify:
   - Role (admin/super_admin)
   - Permissions (check/uncheck)
   - Active status
4. Click "Update"

**Note**: Email addresses cannot be changed for security reasons.

### Removing Admin Privileges

1. Find user in admin list
2. Click "Remove Admin"
3. Confirm action
4. User becomes regular user (role: "user")

### User Database Schema

```javascript
{
  uid: "user-firebase-uid",
  email: "admin@example.com",
  role: "admin" | "super_admin" | "user",
  permissions: ["view_dashboard", "manage_content", ...],
  createdAt: "2024-01-01T00:00:00.000Z",
  createdBy: "super_admin_uid",
  updatedAt: "2024-01-01T00:00:00.000Z",
  updatedBy: "super_admin_uid",
  isActive: true
}
```

### API Endpoints

**Create/Promote Admin**
```
POST /api/admin/users/create
Body: { email, role, permissions, createdBy }
```

**Update Admin**
```
PUT /api/admin/users/update
Body: { uid, role, permissions, updatedBy }
```

**List Admins**
```
GET /api/admin/users/list?role=admin&limit=100&offset=0
```

**Remove Admin**
```
DELETE /api/admin/users/remove
Body: { uid, removedBy }
```

---

## Footer Management

### Overview

The footer management system allows administrators to dynamically manage footer content including links, sections, and social media links without touching code.

### Accessing Footer Management

1. Navigate to: `/admin/footer`
2. **Requires**: Admin role with `MANAGE_FOOTER` permission
3. **Permission**: `MANAGE_FOOTER`

### Features

✅ Dynamic footer content stored in database  
✅ Link management for all footer sections  
✅ Social media link management  
✅ Real-time preview  
✅ Reset to default functionality  

### Managing Footer Content

#### General Settings Tab

Configure main footer information:

1. **Footer Description**
   - Main description text
   - Appears at top of footer
   - Supports plain text

2. **Copyright Text**
   - Copyright notice
   - Automatically includes current year
   - Example: `© 2025 JustJobsInfo. All rights reserved.`

3. **Developer Credit**
   - HTML content for developer attribution
   - Supports HTML tags
   - Example: `Developed by <a href="#">Your Company</a>`

#### Footer Sections Tab

Manage link sections (Services, Company, Industries, Legal):

**Adding a New Section:**
1. Click "Add New Section"
2. Enter section title
3. Add links:
   - Link text
   - Link URL (href)
   - Click "Add Link"
4. Save section

**Editing Existing Section:**
1. Click on section title to edit name
2. Modify links:
   - Edit text/URL
   - Remove unwanted links
   - Add new links
3. Save changes

**Default Sections:**
- **Services**: Resume Builder, CV Audit, Job Search, etc.
- **Company**: About Us, Team, Careers, Contact
- **Industries**: Fintech, Healthcare, Engineering, etc.
- **Legal**: Privacy Policy, Terms, GDPR, Cookies

#### Social Media Links Tab

Manage social media platform links:

**Adding Social Link:**
1. Click "Add Social Link"
2. Fill in:
   - **Platform**: Name (e.g., "Facebook")
   - **Icon Class**: Font Awesome class (e.g., `fab fa-facebook-f`)
   - **URL**: Full URL to social profile
   - **Aria Label**: Accessibility label
3. Click "Add"

**Editing Social Link:**
1. Click "Edit" next to link
2. Modify any field
3. Save changes

**Removing Social Link:**
1. Click "Remove" button
2. Confirm deletion

**Popular Icon Classes:**
- Facebook: `fab fa-facebook-f`
- Twitter: `fab fa-twitter`
- LinkedIn: `fab fa-linkedin-in`
- Instagram: `fab fa-instagram`
- YouTube: `fab fa-youtube`

### Reset to Defaults

If you want to restore original footer content:

1. Go to any tab in Footer Management
2. Click "Reset to Defaults" button
3. Confirm action
4. All customizations will be lost
5. Original footer content restored

### Database Schema

```javascript
{
  type: 'footer_main',
  description: 'Footer description text',
  copyright: 'Copyright text',
  developer_credit: 'HTML for developer credit',
  sections: [
    {
      id: 'services',
      title: 'Services',
      links: [
        { id: 'resume-audit', text: 'Resume Audit', href: '/resume-audit' }
      ]
    }
  ],
  socialLinks: [
    {
      id: 'facebook',
      platform: 'Facebook',
      icon: 'fab fa-facebook-f',
      url: 'https://facebook.com/justjobsinfo',
      ariaLabel: 'Visit our Facebook page'
    }
  ],
  updatedAt: Date
}
```

### API Endpoints

**Get Footer Data (Public)**
```
GET /api/footer
Response: { success: true, data: {...} }
```

**Get Footer Data (Admin)**
```
GET /api/admin/footer
Response: { success: true, data: {...} }
```

**Update Footer Data**
```
PUT /api/admin/footer
Body: { description, copyright, developer_credit, sections, socialLinks }
Response: { success: true, data: {...} }
```

**Reset to Defaults**
```
POST /api/admin/footer/reset
Response: { success: true, data: {...} }
```

### Frontend Integration

The footer component `FooterOneDynamic` automatically fetches data from the database:

```javascript
import FooterOneDynamic from "@/components/footer/FooterOneDynamic";

// In your page component
<FooterOneDynamic />
```

**Features:**
- Automatic data fetching from API
- Falls back to default data if API fails
- Maintains visual consistency
- Real-time updates when content changes

---

## Resume Template Management

### Overview

Manage which resume templates are available to users, track downloads, and control template visibility.

### Accessing Template Management

1. Navigate to: `/admin/resume-templates`
2. **Requires**: Admin role with `MANAGE_CONTENT` permission
3. **Permission**: `MANAGE_CONTENT`

### Features

✅ Template status management (Active/Inactive/Draft)  
✅ Download statistics tracking  
✅ Template details and ratings  
✅ Real-time statistics dashboard  
✅ Preview functionality  

### Dashboard Overview

The template management dashboard displays:

**Summary Statistics:**
- **Total Templates**: Number of available templates
- **Active Templates**: Currently visible to users
- **Total Downloads**: Combined downloads across all templates
- **Draft Templates**: Templates in development

**Template Grid:**
- Template thumbnail preview
- Template name and description
- Category (Professional, Creative, Modern, Academic)
- Download count
- User rating (stars)
- Current status
- Action buttons

### Managing Templates

#### Activating Templates

1. Find template in list
2. Click "Activate" button
3. Template immediately becomes visible to users
4. Statistics update in real-time

#### Deactivating Templates

1. Find template in list
2. Click "Deactivate" button
3. Template becomes hidden from users
4. Existing template data preserved

#### Setting as Draft

1. Find template in list
2. Change status to "Draft"
3. Template hidden from all users
4. Available only to admins for testing

### Download Statistics

**Tracking:**
- Automatic download counting
- Per-template statistics
- Total download metrics
- Download history (if implemented)

**Viewing Stats:**
- Dashboard shows real-time counts
- Individual template download numbers
- Sortable by popularity

**API for Download Tracking:**
```javascript
POST /api/admin/resume-templates/download
Body: { templateId: 1 }
Response: { success: true, downloads: 42 }
```

### Template Categories

**Professional**: 
- Corporate designs
- Business-focused layouts
- Formal color schemes

**Creative**:
- Colorful designs
- Unique layouts
- Design industry focus

**Modern**:
- Contemporary styles
- Clean typography
- Minimal color palettes

**Academic**:
- Research-focused
- Publication-ready
- Academic standards

### Template Data Structure

```javascript
{
  id: 1,
  title: "Modern Professional",
  description: "Clean, corporate design with structured sections",
  category: "professional",
  tags: ["modern", "corporate", "ats-friendly"],
  thumbnail: "/assets/resumes/template-1.jpg",
  rating: 4.5,
  downloads: 1250,
  status: "active" | "inactive" | "draft",
  createdAt: Date,
  updatedAt: Date
}
```

### API Endpoints

**Get All Templates (Admin)**
```
GET /api/admin/resume-templates
Response: { success: true, templates: [...] }
```

**Update Template Status**
```
POST /api/admin/resume-templates
Body: { id: 1, status: "active" }
Response: { success: true, template: {...} }
```

**Track Download**
```
POST /api/admin/resume-templates/download
Body: { templateId: 1 }
Response: { success: true, downloads: 43 }
```

**Get Statistics**
```
GET /api/admin/resume-templates/stats
Response: { 
  totalTemplates: 12,
  activeTemplates: 10,
  draftTemplates: 2,
  totalDownloads: 5432
}
```

---

## SEO Management

For complete SEO management documentation, see **[SEO-GUIDE.md](./SEO-GUIDE.md)**.

### Quick Access

**SEO Admin Panels:**
- Dashboard: `/admin/seo/dashboard`
- Meta Tags: `/admin/seo/meta-tags`
- Sitemap: `/admin/seo/sitemap`
- Robots.txt: `/admin/seo/robots`
- Settings: `/admin/seo/settings`

**Key Features:**
- Manage meta tags for all 62 pages
- Real-time validation with character counts
- Generate dynamic sitemap
- Edit robots.txt
- Configure Google Analytics & Search Console

**Required Permissions:**
- `view_seo_analytics` - View SEO data
- `manage_seo` - General SEO access
- `manage_meta_tags` - Edit meta tags
- `manage_sitemap` - Manage sitemap
- `manage_robots_txt` - Edit robots.txt

---

## Permissions System

### Available Permissions

**Dashboard & Analytics:**
- `view_dashboard` - Access admin dashboard
- `view_analytics` - View analytics data
- `view_seo_analytics` - View SEO analytics

**Content Management:**
- `manage_content` - General content management
- `manage_blog_posts` - Create/edit blog posts
- `manage_pages` - Create/edit pages
- `manage_footer` - Edit footer content

**SEO Management:**
- `manage_seo` - General SEO access
- `manage_meta_tags` - Edit meta tags
- `manage_sitemap` - Generate/edit sitemap
- `manage_robots_txt` - Edit robots.txt

**User Management:**
- `manage_admins` - Create/edit admin users (super admin only)
- `manage_users` - View/edit regular users

**Template Management:**
- `manage_templates` - Manage resume templates

### Role-Based Permissions

**Super Admin (Automatic):**
- ✅ All permissions automatically assigned
- ✅ Cannot be restricted
- ✅ Can create other admins

**Regular Admin (Custom):**
- Select specific permissions
- Cannot access admin management
- Cannot promote users to admin
- Limited to assigned permissions

### Permission Checking

**Frontend (React):**
```javascript
import { useAuth } from '@/contexts/AuthContext';

const { currentUser, userRole, hasPermission } = useAuth();

// Check permission
if (hasPermission('manage_content')) {
  // Show content management UI
}

// Check role
if (userRole === 'super_admin') {
  // Show super admin features
}
```

**Backend (API):**
```javascript
import { verifyAdmin, checkPermission } from '@/utils/authUtils';

// Verify admin status
const user = await verifyAdmin(req);
if (!user) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

// Check specific permission
if (!checkPermission(user, 'manage_content')) {
  return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
}
```

### Adding New Permissions

1. Define permission in `src/utils/permissions.js`
2. Add to permission list in admin user creation
3. Update backend API checks
4. Update frontend permission checks
5. Document in this guide

---

## Security Features

### Authentication

**Firebase Integration:**
- Secure user authentication
- Email verification required
- Password strength requirements
- Session management
- Token-based authentication

**Admin Access Control:**
- Role-based access control (RBAC)
- Permission-based feature access
- Automatic session timeout
- Secure admin routes

### Data Validation

**Input Validation:**
- Email format validation
- Password strength requirements
- Role validation (admin/super_admin only)
- Permission validation (valid permission names)

**API Security:**
- Request authentication
- Permission verification
- Input sanitization
- Rate limiting (recommended)

### Audit Trail

**Tracking:**
- Who created each user (createdBy field)
- Who last updated each user (updatedBy field)
- Timestamps for all operations
- Action logging (recommended for future)

**Database Records:**
```javascript
{
  createdAt: "2024-01-01T00:00:00.000Z",
  createdBy: "super_admin_uid",
  updatedAt: "2024-01-01T00:00:00.000Z",
  updatedBy: "super_admin_uid"
}
```

### Environment Variables

**Required for Security:**
```env
# Firebase Admin SDK (Server-side)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account-email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Firebase Client SDK (Client-side)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
```

**Security Best Practices:**
- Never commit `.env.local` to version control
- Use different Firebase projects for dev/prod
- Rotate API keys regularly
- Monitor Firebase usage

---

## Troubleshooting

### Common Issues

#### 1. Cannot Access Admin Panel

**Symptoms:**
- Redirected to login
- "Unauthorized" message
- Access denied errors

**Solutions:**
```bash
# Check user role
1. Login to Firebase Console
2. Go to Firestore
3. Find user document in 'users' collection
4. Verify role field is "admin" or "super_admin"

# Check authentication
1. Clear browser cookies/cache
2. Logout and login again
3. Check browser console for errors
4. Verify Firebase authentication is working

# Check permissions
1. Go to /admin/admins (as super admin)
2. Find user in list
3. Verify permissions are assigned
4. Update if needed
```

#### 2. Permission Denied Errors

**Symptoms:**
- "Insufficient permissions" message
- Features not visible
- Cannot perform certain actions

**Solutions:**
```bash
# Verify permissions
1. Check user's assigned permissions in database
2. Ensure permission name matches code exactly
3. Verify permission is checked in admin panel

# Update permissions
1. Have super admin update your permissions
2. Logout and login again
3. Check if permissions are now correct

# Code check
1. Verify permission name in code matches database
2. Check permission checking logic
3. Ensure permission is in allowed list
```

#### 3. Footer Changes Not Appearing

**Symptoms:**
- Footer shows old content
- Changes saved but not visible
- Default footer showing instead

**Solutions:**
```bash
# Clear cache
1. Clear browser cache
2. Hard refresh (Ctrl+Shift+R)
3. Test in incognito mode

# Verify database
1. Check MongoDB for footer_settings collection
2. Verify data is saved correctly
3. Check updatedAt timestamp

# Check API
1. Test /api/footer endpoint
2. Verify response contains updated data
3. Check browser console for errors

# Restart server
npm run dev
```

#### 4. Template Status Not Updating

**Symptoms:**
- Template status doesn't change
- Template still visible/hidden after status change
- Statistics not updating

**Solutions:**
```bash
# Check database connection
1. Verify MongoDB connection in server logs
2. Check Firestore rules and permissions
3. Test API endpoint directly

# Verify API response
1. Open browser DevTools → Network tab
2. Update template status
3. Check API response
4. Look for error messages

# Clear cache
1. Clear browser cache
2. Reload page
3. Try again
```

#### 5. Cannot Create Admin User

**Symptoms:**
- Error creating admin
- User creation fails
- Firebase errors

**Solutions:**
```bash
# Check Firebase configuration
1. Verify Firebase Admin SDK is initialized
2. Check environment variables
3. Verify service account permissions

# Check user data
1. Verify email format is correct
2. Check if email already exists
3. Ensure valid role selected

# Check permissions
1. Verify you are super admin
2. Check MANAGE_ADMINS permission
3. Review Firebase Auth errors in console
```

### Debug Commands

```bash
# Check MongoDB connection
mongosh "your_mongodb_uri"
use justjobsdata
db.users.find({ role: "admin" })
db.footer_settings.find()
db.resumeTemplates.find()

# Check Firebase users
# (Use Firebase Console → Authentication)

# Test API endpoints
curl https://justjobs.info/api/admin/users/list
curl https://justjobs.info/api/footer
curl https://justjobs.info/api/admin/resume-templates

# Check server logs
npm run dev
# Watch for errors in console
```

### Getting Help

1. **Check documentation** - Review this guide thoroughly
2. **Check logs** - Browser console and server logs
3. **Test in isolation** - Try features in incognito mode
4. **Verify environment** - Check all environment variables
5. **Contact support** - Reach out to development team with specific error details

---

## Best Practices

### For Super Admins

1. **User Management**
   - Create admins with minimal required permissions
   - Regularly review admin user list
   - Remove inactive admins promptly
   - Document permission assignments

2. **Content Management**
   - Keep footer links up-to-date
   - Regularly review template availability
   - Monitor download statistics
   - Update content based on user feedback

3. **Security**
   - Use strong passwords
   - Enable 2FA if available
   - Regularly review access logs
   - Keep environment variables secure

### For Regular Admins

1. **Stay Within Permissions**
   - Only modify content you have permission for
   - Request additional permissions if needed
   - Don't attempt to bypass restrictions

2. **Content Updates**
   - Test changes before saving
   - Keep backups of important content
   - Document significant changes
   - Follow content guidelines

3. **Communication**
   - Report issues to super admins
   - Suggest improvements
   - Follow established workflows

---

## Maintenance Schedule

### Daily
- Monitor admin activity logs
- Check for errors in admin panels

### Weekly
- Review new admin requests
- Update footer content if needed
- Check template download statistics

### Monthly
- Audit admin user list
- Review permissions assignments
- Update documentation if needed

### Quarterly
- Full security audit
- Performance review of admin panels
- Update admin user training materials

---

## Related Documentation

- **SEO Management**: See [SEO-GUIDE.md](./SEO-GUIDE.md)
- **Features**: See [FEATURES-GUIDE.md](./FEATURES-GUIDE.md)
- **Email System**: See [EMAIL-GUIDE.md](./EMAIL-GUIDE.md)
- **Security**: See [SECURITY-GUIDE.md](./SECURITY-GUIDE.md)

---

**Last Updated**: October 17, 2025  
**Version**: 1.0  
**Status**: ✅ PRODUCTION READY

