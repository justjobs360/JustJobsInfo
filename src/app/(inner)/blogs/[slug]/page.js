"use client"
import { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import HeaderOne from "@/components/header/HeaderOne";
import BackToTop from "@/components/common/BackToTop";
import FooterOne from "@/components/footer/FooterOne";
import ReCaptcha from "@/components/security/ReCaptcha";
import toast from 'react-hot-toast';

export default function BlogDetails() {
  const params = useParams();
  const router = useRouter();
  const [blogPost, setBlogPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const recaptchaRef = useRef();
  
  // Sidebar data states
  const [categories, setCategories] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [debouncedSearchKeyword, setDebouncedSearchKeyword] = useState('');
  const [galleryPosts, setGalleryPosts] = useState([]);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    topic: "",
    comment: "",
    agree: false
  });

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
    if (!authorImagePath) return '/assets/images/blog/details/author.jpg';
    
    // If it's already a full URL (starts with /uploads/ or http), use it as is
    if (authorImagePath.startsWith('/uploads/') || authorImagePath.startsWith('http')) {
      return authorImagePath;
    }
    
    // Otherwise, assume it's a static image in the assets directory
    return `/assets/images/blog/details/${authorImagePath}`;
  };

  // Debounce search keyword
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchKeyword(searchKeyword);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchKeyword]);

  // Fetch blog post from API
  const fetchBlogPost = async (slugParam) => {
    try {
      setLoading(true);
      console.log('📡 Fetching blog post for slug:', slugParam);
      
      const response = await fetch(`/api/blogs/${slugParam}`);
      const result = await response.json();

      if (result.success) {
        console.log('✅ Successfully fetched blog post');
        setBlogPost(result.data);
        // Load existing comments
        if (result.data.comments) {
          setComments(result.data.comments);
        }
      } else {
        console.error('❌ Blog post not found:', result.message);
        toast.error('Blog post not found');
      }
    } catch (error) {
      console.error('❌ Error fetching blog post:', error);
      toast.error('Failed to fetch blog post');
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/blogs/categories');
      const result = await response.json();
      
      if (result.success) {
        setCategories(result.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  // Fetch recent posts
  const fetchRecentPosts = async () => {
    try {
      const response = await fetch('/api/blogs?limit=5');
      const result = await response.json();
      
      if (result.success) {
        setRecentPosts(result.data);
      }
    } catch (error) {
      console.error('Error fetching recent posts:', error);
    }
  };

  // Fetch gallery posts
  const fetchGalleryPosts = async () => {
    try {
      const response = await fetch('/api/blogs?limit=6');
      const result = await response.json();
      
      if (result.success) {
        setGalleryPosts(result.data);
      }
    } catch (error) {
      console.error('Error fetching gallery posts:', error);
    }
  };

  // Handle sidebar search
  const handleSidebarSearch = (e) => {
    e.preventDefault();
    if (searchKeyword.trim()) {
      router.push(`/blogs?search=${encodeURIComponent(searchKeyword.trim())}`);
    }
  };

  // Handle category click
  const handleCategoryClick = (category) => {
    router.push(`/blogs?category=${encodeURIComponent(category)}`);
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Validate form
  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('Please enter your name');
      return false;
    }
    if (!formData.email.trim()) {
      toast.error('Please enter your email');
      return false;
    }
    if (!formData.email.includes('@')) {
      toast.error('Please enter a valid email address');
      return false;
    }
    if (!formData.topic.trim()) {
      toast.error('Please enter a topic');
      return false;
    }
    if (!formData.comment.trim()) {
      toast.error('Please enter a comment');
      return false;
    }
    if (!formData.agree) {
      toast.error('Please agree to the terms and conditions');
      return false;
    }
    if (!recaptchaToken) {
      toast.error('Please complete the reCAPTCHA');
      return false;
    }
    return true;
  };

  // Handle comment submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/blogs/${params.slug}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          topic: formData.topic,
          comment: formData.comment,
          recaptchaToken: recaptchaToken
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Comment submitted successfully!');
        
        // Reset form
        setFormData({
          name: "",
          email: "",
          topic: "",
          comment: "",
          agree: false
        });
        
        // Reset reCAPTCHA
        if (recaptchaRef.current) {
          recaptchaRef.current.reset();
        }
        setRecaptchaToken(null);
        
        // Refresh comments
        if (blogPost && blogPost.comments) {
          setComments([...blogPost.comments, {
            _id: Date.now().toString(),
            name: formData.name,
            topic: formData.topic,
            comment: formData.comment,
            createdAt: new Date().toISOString()
          }]);
        }
      } else {
        toast.error(result.message || 'Failed to submit comment');
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
      toast.error('Failed to submit comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle reCAPTCHA verification
  const handleRecaptchaVerify = (token) => {
    setRecaptchaToken(token);
  };

  // Handle reCAPTCHA error
  const handleRecaptchaError = (error) => {
    console.error('reCAPTCHA error:', error);
    toast.error('reCAPTCHA verification failed');
  };

  // Handle reCAPTCHA expire
  const handleRecaptchaExpire = () => {
    setRecaptchaToken(null);
    toast.error('reCAPTCHA expired, please try again');
  };

  // Initialize data with proper slug handling
  useEffect(() => {
    const initializeData = async () => {
      // Wait for params to be available
      if (!params || !params.slug) {
        console.log('⏳ Waiting for slug parameter...');
        return;
      }

      const slug = params.slug;
      console.log('✅ Slug parameter available:', slug);
      
      // Fetch all data
      await Promise.all([
        fetchBlogPost(slug),
        fetchCategories(),
        fetchRecentPosts(),
        fetchGalleryPosts()
      ]);
    };

    initializeData();
  }, [params]);

  // If loading, show loading state
  if (loading) {
    return (
      <div className="">
        <HeaderOne />
        <div className="career-single-banner-area ptb--70 blog-page">
          <div className="container">
            <div className="row">
              <div className="col-lg-12">
                <div className="career-page-single-banner blog-page">
                  <div className="placeholder-glow">
                    <div className="placeholder col-6"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="rts-blog-list-area rts-section-gapTop">
          <div className="container">
            <div className="row g-5">
              <div className="col-xl-8 col-md-12 col-sm-12 col-12">
                <div className="placeholder-glow">
                  <div className="placeholder col-12" style={{ height: '300px' }}></div>
                  <div className="placeholder col-8 mt-3"></div>
                  <div className="placeholder col-6 mt-2"></div>
                  <div className="placeholder col-12 mt-3"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <FooterOne />
        <BackToTop />
      </div>
    );
  }

  // If no blog post is found, display an error
  if (!blogPost) {
    return (
      <div className="">
        <HeaderOne />
        <div className="career-single-banner-area ptb--70 blog-page">
          <div className="container">
            <div className="row">
              <div className="col-lg-12">
                <div className="career-page-single-banner blog-page">
                  <h1 className="title">Blog Post Not Found</h1>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="rts-blog-list-area rts-section-gapTop">
          <div className="container">
            <div className="row">
              <div className="col-12 text-center">
                <p>The blog post you're looking for doesn't exist.</p>
                <a href="/blogs" className="btn btn-primary">Back to Blogs</a>
              </div>
            </div>
          </div>
        </div>
        <FooterOne />
        <BackToTop />
      </div>
    );
  }

  return (
    <div className="">
      <HeaderOne />

      <>
        <div className="career-single-banner-area ptb--70 blog-page">
          <div className="container">
            <div className="row">
              <div className="col-lg-12">
                <div className="career-page-single-banner blog-page">
                  <h1 className="title">{blogPost.title}</h1>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="rts-blog-list-area rts-section-gapTop">
          <div className="container">
            <div className="row g-5">
              <div className="col-xl-8 col-md-12 col-sm-12 col-12">
                <div className="blog-single-content">
                  <div className="thumbnail">
                    <img 
                      src={getImageUrl(blogPost.bannerImg)}
                      alt={blogPost.title} 
                      onError={(e) => {
                        console.log('❌ Banner image failed to load:', e.target.src);
                        e.target.src = '/assets/images/blog/01.webp';
                      }}
                    />
                  </div>
                  
                  <div className="blog-meta">
                    <div className="author">
                      <img
                        src={getAuthorImageUrl(blogPost.authorImg)}
                        alt="finbiz_buseness"
                        onError={(e) => {
                          console.log('❌ Author image failed to load:', e.target.src);
                          e.target.src = '/assets/images/blog/details/author.jpg';
                        }}
                      />
                      <span>{blogPost.author}</span>
                    </div>
                    <div className="date">
                      <span>{new Date(blogPost.publishedDate).toLocaleDateString()}</span>
                    </div>
                    <div className="category">
                      <span>{blogPost.category}</span>
                    </div>
                  </div>
                  
                  <div className="blog-content">
                    <div dangerouslySetInnerHTML={{ __html: blogPost.content }} />
                  </div>
                  
                  {blogPost.tags && blogPost.tags.length > 0 && (
                    <div className="blog-tags">
                      <h5>Tags:</h5>
                      <div className="tags">
                        {blogPost.tags.map((tag, index) => (
                          <span key={index} className="tag">{tag}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Comments Section */}
                <div className="comments-section">
                  <h3>Comments ({comments.length})</h3>
                  
                  {comments.length > 0 ? (
                    <div className="comments-list">
                      {comments.map((comment, index) => (
                        <div key={comment._id || index} className="comment">
                          <div className="comment-header">
                            <strong>{comment.name}</strong>
                            <span className="comment-date">
                              {new Date(comment.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="comment-topic">
                            <strong>Topic:</strong> {comment.topic}
                          </div>
                          <div className="comment-content">
                            {comment.comment}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>No comments yet. Be the first to comment!</p>
                  )}
                  
                  {/* Comment Form */}
                  <div className="comment-form">
                    <h4>Leave a Comment</h4>
                    <form onSubmit={handleSubmit}>
                      <div className="row">
                        <div className="col-md-6">
                          <div className="form-group">
                            <label>Name *</label>
                            <input
                              type="text"
                              name="name"
                              value={formData.name}
                              onChange={handleChange}
                              required
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-group">
                            <label>Email *</label>
                            <input
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleChange}
                              required
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="form-group">
                        <label>Topic *</label>
                        <input
                          type="text"
                          name="topic"
                          value={formData.topic}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      
                      <div className="form-group">
                        <label>Comment *</label>
                        <textarea
                          name="comment"
                          value={formData.comment}
                          onChange={handleChange}
                          rows="5"
                          required
                        ></textarea>
                      </div>
                      
                      <div className="form-group">
                        <label className="checkbox-label">
                          <input
                            type="checkbox"
                            name="agree"
                            checked={formData.agree}
                            onChange={handleChange}
                            required
                          />
                          I agree to the terms and conditions
                        </label>
                      </div>
                      
                      <ReCaptcha
                        ref={recaptchaRef}
                        onVerify={handleRecaptchaVerify}
                        onError={handleRecaptchaError}
                        onExpire={handleRecaptchaExpire}
                      />
                      
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="btn btn-primary"
                      >
                        {isSubmitting ? 'Submitting...' : 'Submit Comment'}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
              
              <div className="col-xl-4 col-md-12 col-sm-12 col-12">
                <div className="blog-sidebar">
                  {/* Search */}
                  <div className="sidebar-widget">
                    <h4>Search</h4>
                    <form onSubmit={handleSidebarSearch}>
                      <div className="search-box">
                        <input
                          type="text"
                          placeholder="Search blogs..."
                          value={searchKeyword}
                          onChange={(e) => setSearchKeyword(e.target.value)}
                        />
                        <button type="submit">
                          <i className="fas fa-search"></i>
                        </button>
                      </div>
                    </form>
                  </div>
                  
                  {/* Categories */}
                  <div className="sidebar-widget">
                    <h4>Categories</h4>
                    <ul className="categories-list">
                      {categories.map((category, index) => (
                        <li key={index}>
                          <button
                            onClick={() => handleCategoryClick(category)}
                            className="category-link"
                          >
                            {category}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* Recent Posts */}
                  <div className="sidebar-widget">
                    <h4>Recent Posts</h4>
                    <div className="recent-posts">
                      {recentPosts.map((post, index) => (
                        <div key={post._id || index} className="recent-post">
                          <div className="post-image">
                            <img
                              src={getImageUrl(post.image)}
                              alt={post.title}
                              onError={(e) => {
                                console.log('❌ Recent post image failed to load:', e.target.src);
                                e.target.src = '/assets/images/blog/01.webp';
                              }}
                            />
                          </div>
                          <div className="post-content">
                            <h6>
                              <a href={`/blogs/${post.slug}`}>{post.title}</a>
                            </h6>
                            <span>{new Date(post.publishedDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Gallery Posts */}
                  <div className="sidebar-widget">
                    <h4>Gallery</h4>
                    <div className="gallery-posts">
                      {galleryPosts.map((post, index) => (
                        <div key={post._id || index} className="gallery-post">
                          <a href={`/blogs/${post.slug}`}>
                            <img
                              src={getImageUrl(post.image)}
                              alt={post.title}
                              onError={(e) => {
                                console.log('❌ Gallery post image failed to load:', e.target.src);
                                e.target.src = '/assets/images/blog/01.webp';
                              }}
                            />
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Social Links */}
                  <div className="sidebar-widget">
                    <h4>Follow Us</h4>
                    <div className="social-links">
                      <a href="#" className="social-link">
                        <i className="fab fa-facebook-f"></i>
                      </a>
                      <a href="#" className="social-link">
                        <i className="fab fa-twitter"></i>
                      </a>
                      <a href="#" className="social-link">
                        <img src="/xlogo.png" alt="X" style={{ width: '16px', height: '16px' }} />
                      </a>
                      <a href="#" className="social-link">
                        <i className="fab fa-linkedin-in"></i>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>

      <FooterOne />
      <BackToTop />
    </div>
  );
} 