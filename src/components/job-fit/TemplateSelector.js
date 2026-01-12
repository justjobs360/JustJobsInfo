import React, { useState } from 'react';

const TEMPLATES = [
    {
        id: 1,
        name: 'Harvard Professional',
        description: 'Clean and traditional format, perfect for corporate roles',
        preview: 'Classic layout with clear sections',
        thumbnail: '/assets/resumes/templateone.webp'
    },
    {
        id: 2,
        name: 'Modern Creative',
        description: 'Contemporary design with emphasis on creativity',
        preview: 'Modern styling with creative elements',
        thumbnail: '/assets/resumes/templatetwo.png'
    },
    {
        id: 3,
        name: 'Modern Two-Column',
        description: 'Minimalist template focusing on content and clarity',
        preview: 'Two-column layout with sidebar design',
        thumbnail: '/assets/resumes/templatethree.png'
    },
    {
        id: 4,
        name: 'Modern Blue Professional',
        description: 'Professional template with blue accents',
        preview: 'Blue accent colors with professional layout',
        thumbnail: '/assets/resumes/templatefour.png'
    },
    {
        id: 5,
        name: 'Professional Two-Column',
        description: 'Two-column layout with sidebar for skills',
        preview: 'Sidebar design with main content area',
        thumbnail: '/assets/resumes/templatefive.png'
    },
    {
        id: 6,
        name: 'Modern Green Professional',
        description: 'Professional template with green accents',
        preview: 'Green accent colors with clean design',
        thumbnail: '/assets/resumes/templatesix.png'
    },
    {
        id: 7,
        name: 'Modern Professional',
        description: 'Contemporary professional with photo support',
        preview: 'Modern layout with photo placeholder',
        thumbnail: '/assets/resumes/templateseven.png'
    },
    {
        id: 8,
        name: 'Executive Sidebar Modern',
        description: 'Executive format with modern sidebar design',
        preview: 'Executive layout with sidebar accents',
        thumbnail: '/assets/resumes/templateeight.png'
    },
    {
        id: 9,
        name: 'Clean ATS Minimal',
        description: 'ATS-friendly minimal design',
        preview: 'Clean, minimal, ATS-optimized layout',
        thumbnail: '/assets/resumes/templatenine.png'
    },
    {
        id: 10,
        name: 'Elegant Designer Two-Column',
        description: 'Elegant designer template with two columns',
        preview: 'Designer-focused with elegant styling',
        thumbnail: '/assets/resumes/templateten.png'
    },
    {
        id: 11,
        name: 'Bold Impact Yellow',
        description: 'Bold, high-contrast design with yellow accents',
        preview: 'Bold layout with yellow highlights',
        thumbnail: '/assets/resumes/templateeleven.png'
    },
    {
        id: 12,
        name: 'Classic Serif Executive',
        description: 'Classic serif font for executive positions',
        preview: 'Traditional serif with executive styling',
        thumbnail: '/assets/resumes/templatetwelve.png'
    },
    {
        id: 13,
        name: 'Luxury Dark Professional',
        description: 'Luxury dark header with premium feel',
        preview: 'Dark header with luxury design',
        thumbnail: '/assets/resumes/templatethirteen.png'
    },
    {
        id: 14,
        name: 'Cyber Modern Dark',
        description: 'Dark mode modern template with tech feel',
        preview: 'Dark theme with cyan accents',
        thumbnail: '/assets/resumes/templatefourteen.png'
    },
    {
        id: 15,
        name: 'Creative Forest Minimal',
        description: 'Minimal design with forest green accents',
        preview: 'Minimal layout with green sidebar',
        thumbnail: '/assets/resumes/templatefifteen.png'
    }
];

export default function TemplateSelector({ selectedTemplate, onTemplateSelect, disabled = false, compact = false }) {
    return (
        <div className="template-selector" style={{ marginTop: '20px' }}>
            <label className="form-label" style={{ fontSize: '18px', marginBottom: '12px', display: 'block', color: 'var(--color-heading-1)' }}>
                Choose CV Template <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: 'normal' }}>({TEMPLATES.length} templates available)</span>
            </label>
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: compact 
                    ? 'repeat(auto-fill, minmax(150px, 1fr))' 
                    : 'repeat(auto-fill, minmax(180px, 1fr))', 
                gap: '15px',
                marginTop: '10px',
                maxHeight: compact ? '400px' : '600px',
                overflowY: 'auto',
                padding: '5px',
                paddingRight: '10px'
            }}>
                {TEMPLATES.map(template => (
                    <div
                        key={template.id}
                        onClick={() => !disabled && onTemplateSelect(template.id)}
                        style={{
                            border: selectedTemplate === template.id 
                                ? '2px solid var(--color-primary)' 
                                : '2px solid #e5e7eb',
                            borderRadius: '12px',
                            padding: compact ? '12px' : '20px',
                            cursor: disabled ? 'not-allowed' : 'pointer',
                            backgroundColor: selectedTemplate === template.id 
                                ? 'rgba(9, 99, 211, 0.05)' 
                                : '#ffffff',
                            transition: 'all 0.3s ease',
                            opacity: disabled ? 0.6 : 1,
                            position: 'relative'
                        }}
                        onMouseEnter={(e) => {
                            if (!disabled) {
                                e.currentTarget.style.borderColor = 'var(--color-primary)';
                                e.currentTarget.style.backgroundColor = 'rgba(9, 99, 211, 0.02)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!disabled && selectedTemplate !== template.id) {
                                e.currentTarget.style.borderColor = '#e5e7eb';
                                e.currentTarget.style.backgroundColor = '#ffffff';
                            }
                        }}
                    >
                        {selectedTemplate === template.id && (
                            <div style={{
                                position: 'absolute',
                                top: '8px',
                                right: '8px',
                                width: '24px',
                                height: '24px',
                                borderRadius: '50%',
                                backgroundColor: 'var(--color-primary)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontSize: '14px',
                                fontWeight: 'bold',
                                zIndex: 10,
                                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                            }}>
                                ✓
                            </div>
                        )}
                        <div style={{
                            width: '100%',
                            height: compact ? '80px' : '120px',
                            backgroundColor: '#f3f4f6',
                            borderRadius: '8px',
                            marginBottom: compact ? '8px' : '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px solid #e5e7eb',
                            overflow: 'hidden',
                            position: 'relative'
                        }}>
                            {template.thumbnail ? (
                                <img 
                                    src={template.thumbnail} 
                                    alt={template.name}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover'
                                    }}
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'flex';
                                    }}
                                />
                            ) : null}
                            <div style={{
                                fontSize: '11px',
                                color: '#6b7280',
                                textAlign: 'center',
                                padding: '10px',
                                display: template.thumbnail ? 'none' : 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '100%',
                                height: '100%'
                            }}>
                                {template.preview}
                            </div>
                        </div>
                        <h4 style={{
                            fontSize: compact ? '14px' : '16px',
                            fontWeight: '600',
                            color: 'var(--color-heading-1)',
                            margin: '0 0 4px 0',
                            lineHeight: '1.3'
                        }}>
                            {template.name}
                        </h4>
                        {!compact && (
                            <p style={{
                                fontSize: '12px',
                                color: '#6b7280',
                                margin: 0,
                                lineHeight: '1.4'
                            }}>
                                {template.description}
                            </p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
