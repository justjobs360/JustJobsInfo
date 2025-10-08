"use client"

const BlogMain = (props) => {
    const { Slug, blogImage, blogTitle, blogDescription, blogAuthor, blogPublishedDate, authorImg, blogCategory } = props;
    
    // Helper function to get the correct image URL
    const getImageUrl = (imagePath) => {
        if (!imagePath) {
            console.log('📸 No image path provided, using default');
            return '/assets/images/blog/01.webp';
        }
        
        // If it's already a full URL (starts with /uploads/ or http), use it as is
        if (imagePath.startsWith('/uploads/') || imagePath.startsWith('http')) {
            console.log('📸 Using uploaded image:', imagePath);
            return imagePath;
        }
        
        // Otherwise, assume it's a static image in the assets directory
        const staticUrl = `/assets/images/blog/${imagePath}`;
        console.log('📸 Using static image:', staticUrl);
        return staticUrl;
    };

    // Helper function to get the correct author image URL
    const getAuthorImageUrl = (authorImagePath) => {
        if (!authorImagePath) return '/assets/images/testimonials/01.png';
        
        // If it's already a full URL (starts with /uploads/ or http), use it as is
        if (authorImagePath.startsWith('/uploads/') || authorImagePath.startsWith('http')) {
            return authorImagePath;
        }
        
        // Otherwise, assume it's a static image in the assets directory
        return `/assets/images/testimonials/${authorImagePath}`;
    };
    
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            background: '#fff',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            transition: 'all 0.3s ease',
            border: '1px solid #f0f0f0'
        }}
        onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.12)';
        }}
        onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)';
        }}>
            <a href={`/blogs/${Slug}`} className="thumbnail" style={{
                display: 'block',
                width: '100%',
                height: '250px',
                overflow: 'hidden',
                borderRadius: '0'
            }}>
                <img 
                    src={getImageUrl(blogImage)} 
                    alt="blog_image" 
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        objectPosition: 'center',
                        transition: 'transform 0.3s ease'
                    }}
                    onError={(e) => {
                        console.log('❌ Image failed to load:', e.target.src);
                        e.target.src = '/assets/images/blog/01.webp';
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.transform = 'scale(1)';
                    }}
                />
            </a>
            <div className="inner-content-area" style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                padding: '20px 0 28px 0',
                minHeight: '300px'
            }}>
                <div className="top-area" style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <span style={{
                        display: 'inline-block',
                        background: 'transparent',
                        color: 'var(--color-primary)',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '10px',
                        fontWeight: '500',
                        marginBottom: '20px',
                        width: 'fit-content',
                        textTransform: 'uppercase',
                        letterSpacing: '0.3px',
                        border: 'none'
                    }}>
                        {blogCategory || 'Uncategorized'}
                    </span>
                    <a href={`/blogs/${Slug}`} style={{ textDecoration: 'none' }}>
                        <h3 className="title animated fadeIn" style={{
                            fontSize: '20px',
                            fontWeight: '700',
                            color: 'var(--color-heading-1)',
                            lineHeight: '1.4',
                            marginBottom: '24px',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            minHeight: '56px',
                            maxHeight: '56px'
                        }}>
                            {blogTitle ? blogTitle : 'How to growing your business'}
                        </h3>
                    </a>
                    <p className="disc" style={{
                        fontSize: '14px',
                        color: '#666',
                        lineHeight: '1.6',
                        marginBottom: '28px',
                        flex: 1,
                        display: '-webkit-box',
                        WebkitLineClamp: 4,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        minHeight: '90px',
                        maxHeight: '90px'
                    }}>
                        {blogDescription ? blogDescription : 'How do you create compelling presentations that wow your colleagues and impress your managers? This comprehensive guide will help you master the art of professional presentations.'}
                    </p>
                    {blogAuthor && blogAuthor.trim() !== '' ? (
                        <div className="bottom-author-area" style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '15px',
                            marginTop: 'auto',
                            paddingTop: '20px',
                            borderTop: '1px solid #f0f0f0'
                        }}>
                            <div style={{
                                width: '50px',
                                height: '50px',
                                borderRadius: '50%',
                                overflow: 'hidden',
                                flexShrink: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: '#f8f9fa',
                                border: '2px solid #e9ecef'
                            }}>
                                <img 
                                    src={getAuthorImageUrl(authorImg)} 
                                    alt="author" 
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                        borderRadius: '50%'
                                    }}
                                    onError={(e) => {
                                        console.log('❌ Author image failed to load:', e.target.src);
                                        e.target.src = '/assets/images/testimonials/01.png';
                                    }}
                                />
                            </div>
                            <div style={{ 
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center'
                            }}>
                                <h6 style={{
                                    margin: 0,
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: 'var(--color-heading-1)',
                                    lineHeight: '1.3'
                                }}>{blogAuthor}</h6>
                                <span style={{
                                    fontSize: '12px',
                                    color: '#666',
                                    marginTop: '1px',
                                    display: 'block'
                                }}>{blogPublishedDate ? new Date(blogPublishedDate).toLocaleDateString() : "No date"}</span>
                            </div>
                        </div>
                    ) : (
                        blogPublishedDate && (
                            <div className="bottom-date-area" style={{
                                marginTop: 'auto',
                                paddingTop: '20px',
                                borderTop: '1px solid #f0f0f0',
                                textAlign: 'center'
                            }}>
                                <span style={{
                                    fontSize: '12px',
                                    color: '#666',
                                    display: 'block'
                                }}>{new Date(blogPublishedDate).toLocaleDateString()}</span>
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    )
}

export default BlogMain 
