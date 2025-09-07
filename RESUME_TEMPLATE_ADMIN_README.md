# Resume Template Management - Admin Guide

## Overview
The Resume Template Management system allows administrators to control which resume templates are available to users, track download statistics, and manage template visibility.

## Features

### ✅ Template Status Management
- **Active**: Template is visible and available to users
- **Inactive**: Template is hidden from users but still exists in the system
- **Draft**: Template is in development and not available to users

### ✅ Download Statistics
- View download count for each template
- Real-time statistics dashboard
- Track total downloads across all templates

### ✅ Template Details
- Template names, descriptions, and categories
- Template tags and features
- High-quality preview images
- Rating information

## Admin Interface

### Accessing Template Management
1. Login to admin panel
2. Navigate to "Resume Templates" (📄) in the sidebar
3. Requires `MANAGE_CONTENT` permission

### Dashboard Overview
The main dashboard shows:
- **Total Templates**: Number of available templates
- **Active Templates**: Currently visible to users
- **Total Downloads**: Combined downloads across all templates
- **Draft Templates**: Templates in development

### Template Management Table
Each row shows:
- **Template Image**: Preview thumbnail
- **Template Details**: Name, description, and tags
- **Category**: Template category (Professional, Creative, etc.)
- **Downloads**: Number of times downloaded
- **Rating**: User rating (stars)
- **Status**: Current status (Active/Inactive/Draft)
- **Actions**: Toggle status and preview options

## API Endpoints

### Template Management
- `GET /api/admin/resume-templates` - Get all templates with stats
- `POST /api/admin/resume-templates` - Update template status
  ```json
  {
    "id": 1,
    "status": "active"
  }
  ```

### Download Tracking
- `POST /api/admin/resume-templates/download` - Track template downloads
- `GET /api/admin/resume-templates/download` - Get download statistics

## Usage Instructions

### Activating/Deactivating Templates
1. Go to Resume Templates page
2. Find the template you want to modify
3. Click "Activate" or "Deactivate" button
4. Status changes immediately and updates statistics

### Viewing Statistics
- Dashboard shows real-time statistics
- Individual template download counts
- Template ratings and usage metrics

### Template Categories
Templates are organized by categories:
- **Professional**: Corporate and business-focused
- **Creative**: Design and creative industry
- **Modern**: Contemporary designs
- **Academic**: Research and education focus

## Mobile Responsiveness
- Fully responsive design for all devices
- Touch-friendly buttons and controls
- Optimized table layout for small screens
- Horizontal scrolling for template data

## Integration with Frontend
The templates are automatically synced with the resume builder frontend. When you:
- **Activate** a template → It becomes available in the resume builder
- **Deactivate** a template → It becomes hidden from users
- **Track downloads** → Statistics update in real-time

## Technical Notes
- Templates are stored in Firestore under `resumeTemplates` collection
- Download statistics are tracked in `resumeTemplateStats` collection
- Template images are served from `/assets/resumes/` directory
- Status changes are reflected immediately in both admin and frontend

## Permissions Required
- `MANAGE_CONTENT` permission to access template management
- Super admin or admin role required

## Troubleshooting
- If templates don't appear, check Firestore connection
- If status changes don't work, verify API endpoints
- If images don't load, check `/assets/resumes/` directory
- For download tracking issues, check network connectivity

## Future Enhancements
- Template upload functionality
- Advanced analytics and reporting
- Template usage analytics
- A/B testing for template performance
- Template customization options

