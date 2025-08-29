"use client"

const BlogMain = (props) => {
    const { Slug, blogImage, blogTitle, blogDescription, blogAuthor, blogPublishedDate, authorImg } = props;
    
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
            <a href={`/blogs/${Slug}`} className="thumbnail">
                <img 
                    src={getImageUrl(blogImage)} 
                    alt="blog_image" 
                    onError={(e) => {
                        console.log('❌ Image failed to load:', e.target.src);
                        e.target.src = '/assets/images/blog/01.webp';
                    }}
                />
            </a>
            <div className="inner-content-area">
                <div className="top-area">
                    <span>Cloud Migration</span>
                    <a href={`/blogs/${Slug}`}>
                        <h3 className="title animated fadeIn">
                            {blogTitle ? blogTitle : 'How to growing your business'}
                        </h3>
                    </a>
                    <p className="disc">
                        {blogDescription ? blogDescription : 'How do you create compelling presentations that wow your colleagues and impress your managers?'}
                    </p>
                    <div className="bottom-author-area">
                        <img 
                            src={getAuthorImageUrl(authorImg)} 
                            alt="author" 
                            onError={(e) => {
                                console.log('❌ Author image failed to load:', e.target.src);
                                e.target.src = '/assets/images/testimonials/01.png';
                            }}
                        />
                        <div className="author-area-info">
                            <h6 className="title">{blogAuthor || "Unknown Author"}</h6>
                            <span>{blogPublishedDate ? new Date(blogPublishedDate).toLocaleDateString() : "No date"}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default BlogMain 