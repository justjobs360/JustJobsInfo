import React from 'react';

const ResumeTemplateGrid = ({ templates, onTemplateSelect, isAuthenticated }) => {
    return (
        <div className="template-grid">
            {templates.map((template) => {
                const isLocked = template.category === 'premium' && !isAuthenticated;
                
                return (
                    <div 
                        key={template.id} 
                        className={`template-card ${isLocked ? 'locked' : ''}`}
                    >
                        <div className="template-thumbnail">
                            {template.thumbnail ? (
                                <img src={template.thumbnail} alt={template.title} />
                            ) : (
                                <div className="template-preview">
                                    <i className="fas fa-file-alt" style={{ fontSize: '3rem', color: '#ccc' }}></i>
                                </div>
                            )}
                        </div>
                        
                        {isLocked && (
                            <div className="lock-overlay">
                                <i className="fas fa-lock"></i>
                                <p><strong>Premium Template</strong></p>
                                <p>Register to unlock</p>
                            </div>
                        )}
                        
                        <div className="template-info">
                            <h3 className="template-title">{template.title}</h3>
                            
                            <span className={`template-category ${template.category}`}>
                                {template.category}
                            </span>
                            
                            <div className="template-tags">
                                {template.tags.map((tag, index) => (
                                    <span key={index} className="template-tag">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                            
                            <button 
                                className="template-select-btn"
                                onClick={() => onTemplateSelect(template)}
                                disabled={isLocked}
                            >
                                {isLocked ? 'Login to Use' : 'Use This Template'}
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default ResumeTemplateGrid; 