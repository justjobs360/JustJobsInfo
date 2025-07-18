"use client"

const BlogMain = (props) => {
    const { Slug, blogImage, blogTitle } = props;
    return (
        <div>
            <a href={`/blogs/${Slug}`} className="thumbnail">
                <img src={`/assets/images/blog/${blogImage}`} alt="blog_iamge" />
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
                        How do you create compelling presentations that wow your
                        colleagues and impress your managers?
                    </p>
                    <div className="bottom-author-area">
                        <img src="assets/images/testimonials/01.png" alt="author" />
                        <div className="author-area-info">
                            <h6 className="title">Marcus Freeman</h6>
                            <span>24 Sept 2024</span>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    )
}

export default BlogMain 