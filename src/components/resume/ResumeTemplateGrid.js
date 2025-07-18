import React, { useState } from 'react';

const ResumeTemplateGrid = ({ templates, onTemplateSelect, isAuthenticated }) => {
    return (
        <div className="resume-template-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
            gap: '48px',
            marginBottom: '40px',
            justifyItems: 'center',
        }}>
            {templates.map((template) => {
                const isLocked = template.category === 'premium' && !isAuthenticated;
                // Use local state for hover effect
                const [isHovered, setIsHovered] = useState(false);
                return (
                    <div
                        key={template.id}
                        className={`resume-template-card${isLocked ? ' locked' : ''}`}
                        style={{
                            background: '#F5F7FA',
                            borderRadius: '18px',
                            boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
                            padding: '40px 32px 32px 32px',
                            position: 'relative',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            minHeight: '700px',
                            maxWidth: '480px',
                            width: '100%',
                            transition: 'box-shadow 0.2s',
                            textAlign:'left'
                        }}
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                    >
                        {/* Resume Preview with floating button on hover */}
                        <div style={{
                            width: '100%',
                            maxWidth: '370px',
                            aspectRatio: '8.5/11',
                            background: 'white',
                            borderRadius: '12px',
                            marginBottom: '28px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden',
                            border: '1.5px solid #E3E8F0',
                            boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
                            position: 'relative',
                        }}>
                            {template.thumbnail ? (
                                <img src={template.thumbnail} alt={template.title} style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block', background: 'white' }} />
                            ) : (
                                <span style={{ color: '#B0B0B0', fontSize: '48px', fontWeight: 700, opacity: 0.3 }}>
                                    PDF
                                </span>
                            )}
                            {/* Use Template Button - only on hover, floating over preview */}
                            <button
                                className="rts-btn btn-primary"
                                style={{
                                    position: 'absolute',
                                    left: '50%',
                                    top: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    width: '80%',
                                    fontSize: '17px',
                                    padding: '16px 10px',
                                    borderRadius: '8px',
                                    fontWeight: 600,
                                    opacity: isHovered ? 1 : 0,
                                    pointerEvents: isHovered ? 'auto' : 'none',
                                    transition: 'opacity 0.2s',
                                    zIndex: 2,
                                    boxShadow: '0 2px 8px rgba(9,99,211,0.10)',
                                }}
                                onClick={() => onTemplateSelect(template)}
                                disabled={isLocked}
                            >
                                {isLocked ? 'Login to Use' : 'Use this template'}
                            </button>
                        </div>
                        {/* Row: Monochrome + PDF/DOCX badges */}
                        <div style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: '24px',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '50%', background: '#fff', border: '1.5px solid #E3E8F0' }}>
                                    <svg width="16" height="16" fill="none" viewBox="0 0 16 16"><circle cx="8" cy="8" r="7" stroke="#222" strokeWidth="1.5" fill="none"/><circle cx="8" cy="8" r="3" fill="#222"/></svg>
                                </span>
                                <span style={{ color: '#222', fontSize: '16px', fontWeight: 500, opacity: 0.7 }}>Monochrome</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ background: '#E3E8F0', color: '#222', fontWeight: 700, fontSize: '15px', borderRadius: '6px', padding: '4px 16px', letterSpacing: '1px' }}>PDF</span>
                                <span style={{ background: '#E3E8F0', color: '#222', fontWeight: 700, fontSize: '15px', borderRadius: '6px', padding: '4px 16px', letterSpacing: '1px' }}>DOCX</span>
                            </div>
                        </div>
                        {/* Title */}
                        <h3 style={{
                            fontSize: '26px',
                            fontWeight: 700,
                            color: '#222',
                            marginBottom: '10px',
                            textAlign: 'center',
                        }}>Classic</h3>
                        {/* Description */}
                        <div style={{
                            fontSize: '18px',
                            color: '#6B7280',
                            textAlign: 'center',
                            fontWeight: 400,
                            marginBottom: 0,
                        }}>
                            Classically structured resume template, for a robust career history.
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default ResumeTemplateGrid; 