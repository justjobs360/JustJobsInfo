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
        <div>
            <a href={`/blogs/${Slug}`} className="thumbnail" style={{
                display: 'block',
                width: '100%',
                height: '250px',
                overflow: 'hidden',
                borderRadius: '8px'
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
            <div className="inner-content-area">
                <div className="top-area">
                    <span>{blogCategory || 'Uncategorized'}</span>
                    <a href={`/blogs/${Slug}`}>
                        <h3 className="title animated fadeIn">
                            {blogTitle ? blogTitle : 'How to growing your business'}
                        </h3>
                    </a>
                    <p className="disc">
                        {blogDescription ? blogDescription : 'How do you create compelling presentations that wow your colleagues and impress your managers?'}
                    </p>
                    <div className="bottom-author-area" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '15px',
                        marginTop: '15px'
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
                            }}>{blogAuthor || "Unknown Author"}</h6>
                            <span style={{
                                fontSize: '12px',
                                color: '#666',
                                marginTop: '1px',
                                display: 'block'
                            }}>{blogPublishedDate ? new Date(blogPublishedDate).toLocaleDateString() : "No date"}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default BlogMain 