"use client"

const BlogMain = (props) => {
    const { Slug, blogImage, blogTitle, blogDescription, blogAuthor, blogPublishedDate, authorImg, blogCategory, isFeatured = false } = props;
    
    // Helper function to get the correct image URL
    const getImageUrl = (imagePath) => {
        if (!imagePath) {
            console.log('📸 No image path provided, using default');
            return '/assets/images/blog/01.webp';
        }
        
        // If it's already a full URL (starts with /uploads/, /api/image/, or http), use it as is
        if (imagePath.startsWith('/uploads/') || imagePath.startsWith('/api/image/') || imagePath.startsWith('http')) {
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
        
        // If it's already a full URL (starts with /uploads/, /api/image/, or http), use it as is
        if (authorImagePath.startsWith('/uploads/') || authorImagePath.startsWith('/api/image/') || authorImagePath.startsWith('http')) {
            return authorImagePath;
        }
        
        // Otherwise, assume it's a static image in the assets directory
        return `/assets/images/testimonials/${authorImagePath}`;
    };
    
    // Featured article with overlay style
    if (isFeatured) {
        return (
            <a href={`/blogs/${Slug}`} style={{ textDecoration: 'none' }}>
                <div style={{
                    position: 'relative',
                    width: '100%',
                    aspectRatio: '16/10',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.4)';
                    const img = e.currentTarget.querySelector('.featured-img');
                    if (img) img.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
                    const img = e.currentTarget.querySelector('.featured-img');
                    if (img) img.style.transform = 'scale(1)';
                }}>
                    {/* Image */}
                    <img 
                        src={getImageUrl(blogImage)} 
                        alt="blog_image" 
                        className="featured-img"
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
                    />
                    
                    {/* Dark Overlay */}
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.7) 100%)'
                    }}></div>
                    
                    {/* Content Overlay */}
                    <div style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        padding: '24px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px'
                    }}>
                        {/* Category Tag */}
                        <span style={{
                            display: 'inline-block',
                            background: 'rgba(255, 255, 255, 0.25)',
                            backdropFilter: 'blur(10px)',
                            color: 'white',
                            padding: '5px 12px',
                            borderRadius: '20px',
                            fontSize: '10px',
                            fontWeight: '700',
                            width: 'fit-content',
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                            border: '1px solid rgba(255, 255, 255, 0.3)'
                        }}>
                            {blogCategory || 'Uncategorized'}
                        </span>
                        
                        {/* Title */}
                        <h3 style={{
                            fontSize: '22px',
                            fontWeight: '800',
                            color: 'white',
                            lineHeight: '1.3',
                            margin: 0,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)'
                        }}>
                            {blogTitle ? blogTitle : 'How to growing your business'}
                        </h3>
                    </div>
                </div>
            </a>
        );
    }

    // Regular article style
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
                padding: '24px 0 28px 0',
                minHeight: '300px'
            }}>
                <div className="top-area" style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <span style={{
                        display: 'inline-block',
                        background: 'linear-gradient(135deg, rgba(9, 99, 211, 0.1) 0%, rgba(0, 86, 179, 0.1) 100%)',
                        color: 'var(--color-primary)',
                        padding: '6px 20px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: '600',
                        marginBottom: '20px',
                        width: 'fit-content',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
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
                            padding: '0px 20px',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            minHeight: '56px',
                            maxHeight: '56px',
                            transition: 'color 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.color = 'var(--color-primary)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.color = 'var(--color-heading-1)';
                        }}>
                            {blogTitle ? blogTitle : 'How to growing your business'}
                        </h3>
                    </a>
                    <p className="disc blog-card-description" style={{
                        fontSize: '14px',
                        color: '#666',
                        lineHeight: '1.7',
                        padding: '0px 20px',
                        flex: 1,
                        display: '-webkit-box',
                        WebkitLineClamp: 4,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        minHeight: '95px',
                        maxHeight: '95px'
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
                            paddingLeft: '20px',
                            paddingRight: '20px',
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
                                background: 'linear-gradient(135deg, rgba(9, 99, 211, 0.1) 0%, rgba(0, 86, 179, 0.1) 100%)',
                                border: '2px solid rgba(9, 99, 211, 0.2)'
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
                                    color: '#888',
                                    marginTop: '2px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}>
                                    <i className="far fa-clock" style={{ fontSize: '11px' }}></i>
                                    {blogPublishedDate ? new Date(blogPublishedDate).toLocaleDateString() : "No date"}
                                </span>
                            </div>
                        </div>
                    ) : (
                        blogPublishedDate && (
                            <div className="bottom-date-area" style={{
                                marginTop: 'auto',
                                paddingTop: '20px',
                                paddingLeft: '20px',
                                paddingRight: '20px',
                                borderTop: '1px solid #f0f0f0',
                                textAlign: 'center'
                            }}>
                                <span style={{
                                    fontSize: '12px',
                                    color: '#888',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '6px'
                                }}>
                                    <i className="far fa-clock" style={{ fontSize: '11px' }}></i>
                                    {new Date(blogPublishedDate).toLocaleDateString()}
                                </span>
                            </div>
                        )
                    )}
                </div>
            </div>
            <style jsx>{`
                :global(.blog-card-description) {
                    margin-bottom: 0px !important;
                }
            `}</style>
        </div>
    )
}

export default BlogMain 
