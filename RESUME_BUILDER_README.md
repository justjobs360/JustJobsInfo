# Resume Builder Feature

## Overview

The Resume Builder is a comprehensive feature that allows users to create professional CVs using editable templates. It includes both pre-built templates and an AI-powered template generator.

## Features

### 1. Template Categories
- **Free Templates**: Available to all users (guests and registered)
- **Premium Templates**: Available only to registered/authenticated users

### 2. Template Types
- **Modern Professional**: Clean, corporate design with structured sections
- **Creative Designer**: Colorful sidebar layout with skill bars and visual elements
- **Executive Professional**: Elegant design for senior-level positions
- **Clean Minimal**: Simple, typography-focused design

### 3. Live Editing
- **Contenteditable Sections**: All resume sections are editable in real-time
- **Semantic Labeling**: Sections are labeled with `data-section` attributes
- **Dynamic Section Management**: Add/remove sections like experience, education, skills, etc.
- **Auto-save**: Changes are automatically saved as users type

### 4. Template Generator
- **AI-Powered Generation**: Create custom templates using natural language prompts
- **Field-Specific Content**: Templates adapt based on career field (marketing, engineering, design, etc.)
- **Style Variations**: Generate modern, creative, executive, or minimal styles
- **Category Selection**: Choose between free and premium categories

### 5. Export Options
- **HTML Export**: Download complete HTML file with embedded styles
- **PDF Export**: Generate PDF version (simulated in current implementation)
- **Access Control**: Export restrictions for premium templates

## Technical Implementation

### Components Structure
```
src/
├── app/(inner)/resume-builder/
│   ├── page.js                 # Main resume builder page
│   └── resume-builder.css      # Styles for the entire feature
├── components/resume/
│   ├── ResumeTemplateGrid.js   # Template selection grid
│   ├── ResumeEditor.js         # Live editing interface
│   └── TemplateGenerator.js    # AI template generator
├── contexts/
│   └── AuthContext.js          # Authentication state management
└── utils/
    └── templateGenerator.js    # Template generation logic
```

### Template Structure
Each template follows this structure:
```javascript
{
    id: unique_identifier,
    title: "Template Name",
    category: "free" | "premium",
    tags: ["tag1", "tag2", "tag3"],
    thumbnail: "path/to/image" | null,
    editableHtml: "HTML_CONTENT_WITH_CONTENTEDITABLE"
}
```

### Semantic HTML Structure
Templates use semantic labeling for sections:
```html
<div class="resume-template template-style">
    <header data-section="header" contenteditable="true">
        <!-- Contact information -->
    </header>
    <section data-section="summary" contenteditable="true">
        <!-- Professional summary -->
    </section>
    <section data-section="experience" contenteditable="true">
        <!-- Work experience -->
    </section>
    <!-- More sections... -->
</div>
```

## Usage Examples

### Template Generation Prompts
- `"free modern CV for marketing manager"`
- `"creative designer resume with colorful elements"`
- `"executive level resume for finance director"`
- `"minimal clean CV for software engineer"`

### Access Control
```javascript
// Check if user can access premium features
if (template.category === 'premium' && !isAuthenticated) {
    // Show login prompt or restrict access
}
```

## Styling

### CSS Variables Used
- `--color-primary`: Main brand color
- `--color-primary-dark`: Darker shade of primary color
- `--color-light`: Light background color
- `--color-text`: Default text color
- `--color-dark`: Dark text color

### Responsive Design
- Mobile-first approach
- Breakpoints: 575px, 767px, 991px
- Grid layouts adapt to screen size
- Touch-friendly interface on mobile

## Future Enhancements

### Planned Features
1. **Real PDF Generation**: Integrate with libraries like Puppeteer or jsPDF
2. **Template Thumbnails**: Generate preview images for templates
3. **Cloud Storage**: Save resumes to user accounts
4. **Collaboration**: Share and collaborate on resumes
5. **ATS Optimization**: Built-in ATS-friendly formatting
6. **Multiple Languages**: Multi-language support
7. **Advanced Styling**: Color themes and font customization

### Integration Points
1. **Database Integration**: Store templates and user resumes
2. **File Storage**: Cloud storage for generated files
3. **Email Integration**: Send resumes via email
4. **Job Board Integration**: Apply directly with generated resumes

## Installation & Setup

1. Ensure Firebase is configured for authentication
2. Install dependencies: `npm install react-hot-toast`
3. Import AuthProvider in layout.js
4. Navigate to `/resume-builder` to access the feature

## API Integration (Future)

### Template Generation API
```javascript
POST /api/templates/generate
{
    "prompt": "modern professional CV for marketing",
    "category": "free",
    "userId": "user_id" // for premium features
}
```

### Template Storage API
```javascript
POST /api/templates/save
{
    "templateId": "template_id",
    "content": "modified_html_content",
    "userId": "user_id"
}
```

## Security Considerations

1. **Access Control**: Premium templates restricted to authenticated users
2. **Content Sanitization**: User input sanitized before saving
3. **Rate Limiting**: Template generation rate limited
4. **File Size Limits**: Export file size restrictions
5. **XSS Prevention**: Proper HTML sanitization for contenteditable content

## Performance Optimizations

1. **Lazy Loading**: Templates loaded on demand
2. **Debounced Saving**: Reduce save frequency during editing
3. **Optimized CSS**: Minimal CSS for better performance
4. **Code Splitting**: Components loaded as needed
5. **Caching**: Template caching for faster loading

## Browser Compatibility

- **Modern Browsers**: Chrome, Firefox, Safari, Edge (latest versions)
- **Mobile Browsers**: iOS Safari, Chrome Mobile
- **Features Used**: ContentEditable API, CSS Grid, Flexbox
- **Fallbacks**: Graceful degradation for older browsers 