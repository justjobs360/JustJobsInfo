# Footer Management System

This document describes the footer management system that allows administrators to dynamically manage footer content including links and social media links.

## Features

- **Dynamic Footer Content**: Footer content is now stored in the database and can be updated through the admin interface
- **Link Management**: Add, edit, and remove footer links in different sections
- **Social Media Links**: Manage social media links with custom icons and URLs
- **Admin Interface**: User-friendly admin interface for managing footer content
- **Permission-Based Access**: Only users with `MANAGE_FOOTER` permission can access the footer management

## Components

### 1. Footer Service (`src/utils/footerService.js`)
- Handles all database operations for footer data
- Provides functions for CRUD operations on footer content
- Includes default footer data structure

### 2. API Endpoints
- **Admin API** (`src/app/api/admin/footer/route.js`): Protected endpoint for admin operations
- **Public API** (`src/app/api/footer/route.js`): Public endpoint for frontend to fetch footer data

### 3. Admin Interface (`src/app/admin/footer/page.js`)
- Complete admin interface for managing footer content
- Three main tabs:
  - **General Settings**: Description, copyright, developer credit
  - **Footer Sections**: Manage link sections (Services, Company, Industries, Legal)
  - **Social Links**: Manage social media links

### 4. Dynamic Footer Component (`src/components/footer/FooterOneDynamic.js`)
- Updated footer component that fetches data from the database
- Falls back to default data if API fails
- Maintains the same visual appearance as the original footer

## Usage

### For Administrators

1. **Access Footer Management**:
   - Navigate to `/admin/footer`
   - Ensure you have `MANAGE_FOOTER` permission

2. **General Settings**:
   - Update footer description
   - Modify copyright text
   - Edit developer credit HTML

3. **Manage Footer Sections**:
   - Click on section titles to edit them
   - Add new links to any section
   - Remove existing links
   - Links are organized in sections: Services, Company, Industries, Legal

4. **Social Media Links**:
   - Add new social media platforms
   - Specify icon classes (Font Awesome or custom)
   - Set URLs and accessibility labels
   - Remove unwanted social links

### For Developers

1. **Adding Footer to New Pages**:
   ```jsx
   import FooterOneDynamic from "@/components/footer/FooterOneDynamic";
   
   // In your component
   <FooterOneDynamic />
   ```

2. **API Usage**:
   ```javascript
   // Fetch footer data
   const response = await fetch('/api/footer');
   const { data } = await response.json();
   ```

## Database Structure

The footer data is stored in MongoDB collection `footer_settings` with the following structure:

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
        {
          id: 'resume-audit',
          text: 'Resume Audit',
          href: '/resume-audit'
        }
        // ... more links
      ]
    }
    // ... more sections
  ],
  social_links: [
    {
      id: 'facebook',
      name: 'Facebook',
      icon: 'fa-brands fa-facebook-f',
      href: 'https://www.facebook.com/justjobsinfos/',
      aria_label: 'Visit our Facebook page'
    }
    // ... more social links
  ],
  createdAt: Date,
  updatedAt: Date
}
```

## Permissions

- `MANAGE_FOOTER`: Required permission to access footer management
- Added to `DEFAULT_ADMIN_PERMISSIONS` for regular admins
- Super admins have access by default

## Migration

To migrate from static footer to dynamic footer:

1. The system automatically creates default footer data on first access
2. Existing pages need to be updated to use `FooterOneDynamic` instead of `FooterOne`
3. The dynamic footer falls back to default data if the API fails

## Reset Functionality

Administrators can reset the footer to default settings using the "Reset to Defaults" button in the admin interface.

## Error Handling

- API failures gracefully fall back to default footer data
- Loading states are handled in the frontend
- Error messages are displayed to users when operations fail

## Security

- Admin endpoints are protected with authentication
- Permission checks ensure only authorized users can modify footer content
- Input validation prevents malicious content injection

## Future Enhancements

- Image upload for social media icons
- Bulk link import/export
- Footer preview functionality
- Version history for footer changes
- Multi-language footer support
