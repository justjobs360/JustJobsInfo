"use client";

import React, { useState } from 'react';

const ShareJobModal = ({ isOpen, onClose, job }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !job) return null;

  const jobUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/job-listing?job=${job.id}&title=${encodeURIComponent((job.job_title||'').toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9\-]+/g,''))}`;
  const jobTitle = job.job_title || 'Job Opportunity';
  const companyName = job.company_name || '';
  const jobText = `Check out this ${jobTitle} position at ${companyName}`;

  const shareOptions = [
    {
      id: 'email',
      name: 'Email',
      icon: 'fas fa-envelope',
      color: '#ea4335',
      action: () => {
        const subject = `Job Opportunity: ${jobTitle} at ${companyName}`;
        const body = `Hi,\n\nI found this interesting job opportunity and thought you might be interested:\n\n${jobTitle} at ${companyName}\n\n${jobUrl}\n\nBest regards`;
        window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
      }
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      icon: 'fab fa-whatsapp',
      color: '#25d366',
      action: () => {
        const message = `${jobText}\n\n${jobUrl}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`);
      }
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      icon: 'fab fa-linkedin-in',
      color: '#0077b5',
      action: () => {
        const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(jobUrl)}&title=${encodeURIComponent(jobTitle)}&summary=${encodeURIComponent(jobText)}`;
        window.open(url);
      }
    },
    {
      id: 'twitter',
      name: 'Twitter',
      icon: 'fab fa-twitter',
      color: '#1da1f2',
      action: () => {
        const text = `${jobText} #jobs #careers`;
        const url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(jobUrl)}&text=${encodeURIComponent(text)}`;
        window.open(url);
      }
    },
    {
      id: 'facebook',
      name: 'Facebook',
      icon: 'fab fa-facebook-f',
      color: '#1877f2',
      action: () => {
        const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(jobUrl)}&quote=${encodeURIComponent(jobText)}`;
        window.open(url);
      }
    },
    {
      id: 'copy',
      name: 'Copy Link',
      icon: 'fas fa-copy',
      color: '#6c757d',
      action: async () => {
        try {
          await navigator.clipboard.writeText(jobUrl);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch (err) {
          // Fallback for older browsers
          const textArea = document.createElement('textarea');
          textArea.value = jobUrl;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }
      }
    }
  ];

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="share-modal-overlay" 
      onClick={handleBackdropClick}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0, 0, 0, 0.5)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
    >
      <div 
        className="share-modal-content"
        style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '2rem',
          maxWidth: '500px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          position: 'relative',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          margin: '1rem'
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'none',
            border: 'none',
            fontSize: '2rem',
            cursor: 'pointer',
            color: '#6c757d',
            padding: '0.5rem',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = '#f8f9fa';
            e.target.style.color = '#495057';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'none';
            e.target.style.color = '#6c757d';
          }}
          aria-label="Close share modal"
        >
          ×
        </button>

        {/* Header */}
        <div style={{ marginBottom: '1.5rem', paddingRight: '2rem' }}>
          <h3 style={{ 
            margin: 0, 
            fontSize: '2.25rem', 
            fontWeight: '600', 
            color: '#1f2937',
            marginBottom: '0.5rem'
          }}>
            Share Job
          </h3>
          <p style={{ 
            margin: 0, 
            color: '#6b7280', 
            fontSize: '1.25rem',
            lineHeight: '1.5'
          }}>
            Share this job opportunity with your network
          </p>
        </div>

        {/* Job Preview */}
        <div style={{
          background: '#f8f9fa',
          padding: '1.25rem',
          borderRadius: '8px',
          marginBottom: '1.5rem',
          border: '1px solid #e9ecef'
        }}>
          <h4 style={{ 
            margin: '0 0 0.5rem 0', 
            fontSize: '1.5rem', 
            color: '#1f2937',
            fontWeight: '600'
          }}>
            {jobTitle}
          </h4>
          <p style={{ 
            margin: '0 0 0.5rem 0', 
            color: '#6b7280', 
            fontSize: '1.25rem'
          }}>
            {companyName}
          </p>
          <p style={{ 
            margin: 0, 
            color: '#9ca3af', 
            fontSize: '1.125rem',
            wordBreak: 'break-all'
          }}>
            {jobUrl}
          </p>
        </div>

        {/* Share Options Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}>
          {shareOptions.map((option) => (
            <button
              key={option.id}
              onClick={option.action}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '1.25rem',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                background: '#fff',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textDecoration: 'none',
                color: 'inherit',
                minHeight: '120px'
              }}
              onMouseEnter={(e) => {
                e.target.style.borderColor = option.color;
                e.target.style.background = `${option.color}10`;
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = `0 4px 12px ${option.color}30`;
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.background = '#fff';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              <i 
                className={option.icon}
                style={{
                  fontSize: '2.25rem',
                  color: option.color,
                  marginBottom: '0.75rem'
                }}
              />
              <span style={{
                fontSize: '1.25rem',
                fontWeight: '500',
                color: '#374151'
              }}>
                {option.name}
              </span>
            </button>
          ))}
        </div>

        {/* Copy Success Message */}
        {copied && (
          <div style={{
            background: '#d1fae5',
            color: '#065f46',
            padding: '1rem',
            borderRadius: '6px',
            textAlign: 'center',
            fontSize: '1.25rem',
            fontWeight: '500',
            border: '1px solid #a7f3d0',
            marginBottom: '1rem'
          }}>
            <i className="fas fa-check-circle" style={{ marginRight: '0.5rem' }}></i>
            Link copied to clipboard!
          </div>
        )}

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          paddingTop: '1rem',
          borderTop: '1px solid #e5e7eb'
        }}>
          <p style={{
            margin: 0,
            fontSize: '1.125rem',
            color: '#9ca3af'
          }}>
            Choose a platform to share this job opportunity
          </p>
        </div>
      </div>
    </div>
  );
};

export default ShareJobModal;
