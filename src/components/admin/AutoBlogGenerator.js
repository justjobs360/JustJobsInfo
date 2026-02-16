"use client";
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function AutoBlogGenerator({ onBlogsGenerated }) {
  const [titles, setTitles] = useState(['']);
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState(null);
  const [variant, setVariant] = useState('template-one');

  const handleTitleChange = (index, value) => {
    const newTitles = [...titles];
    newTitles[index] = value;
    setTitles(newTitles);
  };

  const addTitleField = () => {
    setTitles([...titles, '']);
  };

  const removeTitleField = (index) => {
    if (titles.length > 1) {
      const newTitles = titles.filter((_, i) => i !== index);
      setTitles(newTitles);
    }
  };

  const handleGenerate = async () => {
    // Filter out empty titles
    const validTitles = titles.filter(title => title.trim() !== '');
    
    if (validTitles.length === 0) {
      toast.error('Please add at least one blog title');
      return;
    }

    setIsGenerating(true);
    setResults(null);

    try {
      const response = await fetch('/api/blogs/auto-generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ titles: validTitles, variant }),
      });

      const data = await response.json();

      if (data.success) {
        setResults(data.data);
        toast.success(`Successfully generated ${data.data.generated} blog${data.data.generated !== 1 ? 's' : ''} in draft status!`);
        
        // Clear titles after successful generation
        setTitles(['']);
        
        // Refresh blogs list if callback provided
        if (onBlogsGenerated) {
          onBlogsGenerated();
        }
      } else {
        toast.error(data.error || 'Failed to generate blogs');
      }
    } catch (error) {
      console.error('Error generating blogs:', error);
      toast.error('Failed to generate blogs. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div style={{
      background: '#fff',
      borderRadius: '12px',
      padding: '32px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      marginBottom: '24px',
      border: '1px solid #f0f0f0'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px'
          }}>
            🤖
          </div>
          <h2 style={{ 
            fontSize: '28px', 
            fontWeight: '700', 
            color: 'var(--color-heading-1)',
            margin: 0
          }}>
            Auto Blog Generator
          </h2>
        </div>
        <p style={{ 
          fontSize: '15px', 
          color: '#6b7280',
          margin: 0,
          lineHeight: '1.6',
          paddingLeft: '60px'
        }}>
          Add multiple blog titles below. Each title will be sent to OpenAI to generate a complete blog post based on your existing blog style. All generated blogs will be saved in draft status for review.
        </p>
      </div>

      {/* Blog Titles Section */}
      <div style={{ marginBottom: '32px' }}>
        {/* Variant selector */}
        <div style={{ 
          marginBottom: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <label style={{ 
            fontSize: '15px', 
            fontWeight: '600', 
            color: 'var(--color-heading-1)'
          }}>
            Blog Structure
          </label>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#374151' }}>
              <input
                type="radio"
                name="blog-variant"
                value="template-one"
                checked={variant === 'template-one'}
                onChange={() => setVariant('template-one')}
              />
              <span>
                <strong>Prompt 1 – Template layout</strong> (intro, quote, checklist sections)
              </span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#374151' }}>
              <input
                type="radio"
                name="blog-variant"
                value="standard"
                checked={variant === 'standard'}
                onChange={() => setVariant('standard')}
              />
              <span>
                <strong>Prompt 2 – Standard blog</strong> (intro, subheadings, paragraphs)
              </span>
            </label>
          </div>
          <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>
            Use Prompt 1 for your existing visual template style, or Prompt 2 for a more traditional long-form blog layout so posts don&apos;t all look the same.
          </p>
        </div>
        <label style={{ 
          display: 'block', 
          fontSize: '16px', 
          fontWeight: '600', 
          color: 'var(--color-heading-1)',
          marginBottom: '16px'
        }}>
          Blog Titles
        </label>
        
        <div style={{ 
          background: '#f9fafb',
          borderRadius: '8px',
          padding: '20px',
          border: '1px solid #e5e7eb'
        }}>
          {titles.map((title, index) => (
            <div key={index} style={{ 
              display: 'flex', 
              gap: '12px', 
              marginBottom: index < titles.length - 1 ? '12px' : '0',
              alignItems: 'flex-start',
              position: 'relative'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                background: 'var(--color-primary)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: '600',
                flexShrink: 0,
                marginTop: '8px'
              }}>
                {index + 1}
              </div>
              <div style={{ flex: 1, position: 'relative' }}>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => handleTitleChange(index, e.target.value)}
                  placeholder={`Enter blog title ${index + 1}...`}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    paddingRight: titles.length > 1 ? '48px' : '16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '15px',
                    outline: 'none',
                    transition: 'all 0.2s',
                    background: '#fff',
                    color: 'var(--color-heading-1)'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--color-primary)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                {titles.length > 1 && (
                  <button
                    onClick={() => removeTitleField(index)}
                    style={{
                      position: 'absolute',
                      right: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '32px',
                      height: '32px',
                      borderRadius: '6px',
                      background: '#fee2e2',
                      color: '#dc2626',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '18px',
                      fontWeight: '600',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = '#fecaca';
                      e.target.style.transform = 'translateY(-50%) scale(1.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = '#fee2e2';
                      e.target.style.transform = 'translateY(-50%) scale(1)';
                    }}
                    title="Remove this title"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={addTitleField}
          type="button"
          style={{
            marginTop: '16px',
            padding: '10px 20px',
            background: 'transparent',
            color: 'var(--color-primary)',
            border: '2px dashed var(--color-primary)',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = '#f0f9ff';
            e.target.style.borderStyle = 'solid';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'transparent';
            e.target.style.borderStyle = 'dashed';
          }}
        >
          <span style={{ fontSize: '18px' }}>+</span>
          Add Another Title
        </button>
      </div>

      {/* Generate Button */}
      <div style={{ 
        display: 'flex', 
        gap: '12px', 
        alignItems: 'center',
        paddingTop: '24px',
        borderTop: '2px solid #f3f4f6'
      }}>
        <button
          onClick={handleGenerate}
          disabled={isGenerating || titles.filter(t => t.trim() !== '').length === 0}
          style={{
            padding: '14px 32px',
            background: isGenerating || titles.filter(t => t.trim() !== '').length === 0 
              ? '#d1d5db' 
              : 'linear-gradient(135deg, var(--color-primary) 0%, #764ba2 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: isGenerating || titles.filter(t => t.trim() !== '').length === 0 
              ? 'not-allowed' 
              : 'pointer',
            fontSize: '16px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: isGenerating || titles.filter(t => t.trim() !== '').length === 0 
              ? 'none'
              : '0 4px 12px rgba(99, 102, 241, 0.3)',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            if (!isGenerating && titles.filter(t => t.trim() !== '').length > 0) {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 16px rgba(99, 102, 241, 0.4)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isGenerating && titles.filter(t => t.trim() !== '').length > 0) {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.3)';
            }
          }}
        >
          {isGenerating ? (
            <>
              <span className="spinner-border spinner-border-sm" style={{
                width: '18px',
                height: '18px',
                border: '2px solid rgba(255,255,255,0.3)',
                borderTopColor: '#fff',
                borderRadius: '50%',
                animation: 'spin 0.6s linear infinite',
                display: 'inline-block'
              }}></span>
              Generating Blogs...
            </>
          ) : (
            <>
              <span style={{ fontSize: '20px' }}>✨</span>
              Generate Blogs
            </>
          )}
        </button>
        {titles.filter(t => t.trim() !== '').length > 0 && (
          <span style={{
            fontSize: '14px',
            color: '#6b7280',
            fontStyle: 'italic'
          }}>
            {titles.filter(t => t.trim() !== '').length} title{titles.filter(t => t.trim() !== '').length !== 1 ? 's' : ''} ready
          </span>
        )}
      </div>

      {results && (
        <div style={{
          marginTop: '32px',
          padding: '24px',
          background: 'linear-gradient(135deg, #f0f9ff 0%, #f9fafb 100%)',
          borderRadius: '12px',
          border: '2px solid #e0f2fe',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px'
            }}>
              ✅
            </div>
            <h3 style={{ 
              fontSize: '20px', 
              fontWeight: '700', 
              color: 'var(--color-heading-1)',
              margin: 0
            }}>
              Generation Results
            </h3>
          </div>
          
          <div style={{ 
            display: 'flex', 
            gap: '16px', 
            marginBottom: '20px',
            flexWrap: 'wrap'
          }}>
            <div style={{
              padding: '12px 20px',
              background: '#d1fae5',
              borderRadius: '8px',
              border: '1px solid #a7f3d0'
            }}>
              <p style={{ margin: 0, fontSize: '14px', color: '#065f46', fontWeight: '600' }}>
                ✅ Successfully generated: <strong style={{ fontSize: '16px' }}>{results.generated}</strong> blog{results.generated !== 1 ? 's' : ''}
              </p>
            </div>
            {results.failed > 0 && (
              <div style={{
                padding: '12px 20px',
                background: '#fee2e2',
                borderRadius: '8px',
                border: '1px solid #fecaca'
              }}>
                <p style={{ margin: 0, fontSize: '14px', color: '#991b1b', fontWeight: '600' }}>
                  ❌ Failed: <strong style={{ fontSize: '16px' }}>{results.failed}</strong> blog{results.failed !== 1 ? 's' : ''}
                </p>
              </div>
            )}
          </div>

          {results.results && results.results.length > 0 && (
            <div style={{ 
              marginTop: '20px',
              padding: '16px',
              background: '#fff',
              borderRadius: '8px',
              border: '1px solid #e5e7eb'
            }}>
              <p style={{ 
                fontSize: '15px', 
                fontWeight: '600', 
                color: 'var(--color-heading-1)',
                marginBottom: '12px'
              }}>
                Generated Blogs (in draft status):
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {results.results.map((result, index) => (
                  <div key={index} style={{
                    padding: '12px 16px',
                    background: '#f9fafb',
                    borderRadius: '6px',
                    border: '1px solid #e5e7eb',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '6px',
                      background: 'var(--color-primary)',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: '600',
                      flexShrink: 0
                    }}>
                      {index + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                      <strong style={{ color: 'var(--color-heading-1)', fontSize: '15px' }}>{result.title}</strong>
                      <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#6b7280' }}>
                        Slug: <code style={{ background: '#f3f4f6', padding: '2px 6px', borderRadius: '4px', fontSize: '11px' }}>{result.slug}</code>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {results.errors && results.errors.length > 0 && (
            <div style={{ 
              marginTop: '20px',
              padding: '16px',
              background: '#fef2f2',
              borderRadius: '8px',
              border: '1px solid #fecaca'
            }}>
              <p style={{ 
                fontSize: '15px', 
                fontWeight: '600', 
                color: '#991b1b',
                marginBottom: '12px'
              }}>
                Errors:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {results.errors.map((error, index) => (
                  <div key={index} style={{
                    padding: '10px 12px',
                    background: '#fff',
                    borderRadius: '6px',
                    border: '1px solid #fecaca'
                  }}>
                    <strong style={{ color: '#991b1b', fontSize: '14px' }}>{error.title}</strong>
                    <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#dc2626' }}>{error.error}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ 
            marginTop: '20px', 
            padding: '16px', 
            background: '#fffbeb',
            borderRadius: '8px',
            border: '1px solid #fde68a'
          }}>
            <p style={{ 
              fontSize: '14px', 
              color: '#92400e',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{ fontSize: '18px' }}>💡</span>
              <span><strong>Tip:</strong> All generated blogs are saved in draft status. You can review and edit them in the &quot;Manage Blogs&quot; tab before publishing.</span>
            </p>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
