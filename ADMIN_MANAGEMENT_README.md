# Admin Management System

This document describes the comprehensive admin management system implemented for the JustJobsInfo application.

## Features

### ✅ Implemented Features

1. **Admin User Promotion**
   - Promote existing users to admin by email or UID
   - Assign roles: `admin` or `super_admin`
   - Automatic permission assignment based on role
   - Updates existing Firebase Auth users
   - Creates or updates Firestore user documents with metadata

2. **Admin User Editing**
   - Edit existing admin users
   - Change roles and permissions
   - Update user metadata
   - Email address cannot be changed (security)

3. **Role Management**
   - **Regular Admin**: Limited permissions, customizable
   - **Super Admin**: Full system access, all permissions
   - Role-based permission assignment

4. **Permission System**
   - Granular permissions for different admin functions
   - Automatic permission assignment based on role
   - Customizable permissions for regular admins

5. **User Management**
   - List all admin users
   - Remove admin privileges (convert to regular user)
   - View creation and update timestamps
   - Track who created/updated users

6. **Security Features**
   - Super admin only access to admin management
   - Password requirements (minimum 6 characters)
   - Email verification for new accounts
   - Audit trail (created by, updated by)

## API Endpoints

### Promote User to Admin
```
POST /api/admin/users/create
```
**Body:**
```json
{
  "email": "user@example.com", // OR "uid": "user-uid"
  "role": "admin", // or "super_admin"
  "permissions": ["view_dashboard", "manage_content"],
  "createdBy": "super_admin"
}
```

### Update Admin User
```
PUT /api/admin/users/update
```
**Body:**
```json
{
  "uid": "user-id",
  "role": "admin",
  "permissions": ["view_dashboard", "manage_content"],
  "updatedBy": "super_admin"
}
```

### List Users
```
GET /api/admin/users/list?role=admin&limit=100&offset=0
```

## Database Schema

### Users Collection
```javascript
{
  uid: "user-id",
  email: "admin@example.com",
  role: "admin", // "user", "admin", "super_admin"
  permissions: ["view_dashboard", "manage_content"],
  createdAt: "2024-01-01T00:00:00.000Z",
  createdBy: "super_admin",
  updatedAt: "2024-01-01T00:00:00.000Z",
  updatedBy: "super_admin",
  isActive: true
}
```

## Permission System

### Available Permissions
- `view_dashboard` - Access admin dashboard
- `manage_seo` - Manage SEO settings
- `view_seo_analytics` - View SEO analytics
- `manage_meta_tags` - Manage meta tags
- `manage_sitemap` - Manage sitemap
- `manage_robots_txt` - Manage robots.txt
- `manage_content` - Manage content
- `manage_blog_posts` - Manage blog posts
- `manage_pages` - Manage pages
- `view_analytics` - View analytics
- `manage_admins` - Manage other admins (super admin only)

### Role-Based Permissions
- **Regular Admin**: Customizable permissions from the list above
- **Super Admin**: All permissions automatically assigned

## Frontend Components

### Admin Management Page
- **Location**: `/src/app/admin/admins/page.js`
- **Features**:
  - Create new admin users
  - Edit existing admin users
  - View all admin users
  - Remove admin privileges
  - Role and permission management

### Admin Service
- **Location**: `/src/utils/adminService.js`
- **Features**:
  - API calls for admin management
  - User creation, updates, and listing
  - Error handling and response processing

## Security Considerations

1. **Access Control**
   - Only super admins can access admin management
   - Role-based permission checking
   - Firebase Auth integration

2. **Data Validation**
   - Email format validation
   - Password strength requirements
   - Role validation
   - Permission validation

3. **Audit Trail**
   - Track who created each user
   - Track who updated each user
   - Timestamp tracking for all operations

4. **Error Handling**
   - Comprehensive error messages
   - Graceful failure handling
   - User-friendly error display

## Environment Variables Required

```env
# Firebase Admin SDK
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account-email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Firebase Client SDK
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

## Usage Instructions

### For Super Admins

1. **Access Admin Management**
   - Navigate to `/admin/admins`
   - Only super admins can access this page

2. **Promote User to Admin**
   - Click "Promote User to Admin"
   - Enter email address OR user UID
   - Select role (admin or super admin)
   - Choose permissions (for regular admins)
   - Submit form

3. **Edit Existing Admin**
   - Click "Edit" button next to admin
   - Modify role and permissions
   - Update admin details
   - Submit changes

4. **Remove Admin Privileges**
   - Click "Remove" button
   - Confirm action
   - User becomes regular user

### For Regular Admins

- Regular admins cannot access admin management
- They can only access features they have permissions for
- Permissions are checked on each page/action

## Error Handling

The system includes comprehensive error handling:

1. **API Errors**
   - Network errors
   - Firebase Auth errors
   - Firestore errors
   - Validation errors

2. **User Feedback**
   - Toast notifications for success/error
   - Clear error messages
   - Loading states

3. **Validation**
   - Form validation
   - Server-side validation
   - Permission validation

## Future Enhancements

1. **Password Reset**
   - Admin-initiated password resets
   - Email notifications

2. **Bulk Operations**
   - Bulk user creation
   - Bulk permission updates

3. **Advanced Permissions**
   - Time-based permissions
   - IP-based restrictions
   - Session management

4. **Audit Logging**
   - Detailed activity logs
   - Export functionality
   - Compliance reporting

## Troubleshooting

### Common Issues

1. **Firebase Admin SDK Not Initialized**
   - Check environment variables
   - Verify service account credentials
   - Check console for initialization errors

2. **Permission Denied**
   - Verify user is super admin
   - Check Firebase Auth rules
   - Check Firestore security rules

3. **User Creation Fails**
   - Check email format
   - Verify password strength
   - Check if email already exists

4. **API Errors**
   - Check network connectivity
   - Verify API endpoint URLs
   - Check server logs

### Debug Steps

1. Check browser console for errors
2. Verify Firebase configuration
3. Test API endpoints directly
4. Check Firestore security rules
5. Verify environment variables

## Support

For issues or questions about the admin management system:

1. Check this documentation
2. Review error logs
3. Test with different user accounts
4. Verify Firebase configuration
5. Contact development team 