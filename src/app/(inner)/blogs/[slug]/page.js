"use client"
import { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import HeaderOne from "@/components/header/HeaderOne";
import Link from "next/link";

import BackToTop from "@/components/common/BackToTop";

import FooterOneDynamic from "@/components/footer/FooterOneDynamic";
import ReCaptcha from "@/components/security/ReCaptcha";
import toast from 'react-hot-toast';
import StructuredData from "@/components/common/StructuredData";
import { generateBlogPostingSchema } from "@/utils/structuredDataService";

// Skeleton components for blog detail page
const BlogDetailSkeleton = () => (
  <div className="rts-blog-list-area rts-section-gapTop">
    <div className="container">
      <div className="row g-5">
        {/* Main content skeleton */}
        <div className="col-xl-8 col-md-12 col-sm-12 col-12">
          <div className="blog-single-post-listing details mb--0">
            {/* Banner image skeleton */}
            <div className="thumbnail">
              <div className="skeleton-banner-image"></div>
            </div>
            <div className="blog-listing-content">
              {/* User info skeleton */}
              <div className="user-info">
                <div className="single">
                  <div className="skeleton-user-info"></div>
                </div>
                <div className="single">
                  <div className="skeleton-user-info"></div>
                </div>
                <div className="single">
                  <div className="skeleton-user-info"></div>
                </div>
              </div>
              {/* Title skeleton */}
              <div className="skeleton-title-large"></div>
              {/* Content skeleton */}
              <div className="skeleton-content">
                <div className="skeleton-paragraph"></div>
                <div className="skeleton-paragraph"></div>
                <div className="skeleton-paragraph"></div>
                <div className="skeleton-paragraph short"></div>
              </div>
              {/* Tags and share skeleton */}
              <div className="row align-items-center">
                <div className="col-lg-6 col-md-12">
                  <div className="skeleton-tags"></div>
                </div>
                <div className="col-lg-6 col-md-12">
                  <div className="skeleton-share"></div>
                </div>
              </div>
              {/* Author area skeleton */}
              <div className="author-area">
                <div className="thumbnail details mb_sm--15">
                  <div className="skeleton-author-image"></div>
                </div>
                <div className="author-details team">
                  <div className="skeleton-author-role"></div>
                  <div className="skeleton-author-name"></div>
                  <div className="skeleton-author-bio"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Sidebar skeleton */}
        <div className="col-xl-4 col-md-12 col-sm-12 col-12 pd-control-bg--40">
          {/* Search skeleton */}
          <div className="rts-single-wized search">
            <div className="wized-header">
              <div className="skeleton-sidebar-title"></div>
            </div>
            <div className="wized-body">
              <div className="skeleton-search-input"></div>
            </div>
          </div>
          
          {/* Categories skeleton */}
          <div className="rts-single-wized Categories">
            <div className="wized-header">
              <div className="skeleton-sidebar-title"></div>
            </div>
            <div className="wized-body">
              <div className="skeleton-category-item"></div>
              <div className="skeleton-category-item"></div>
              <div className="skeleton-category-item"></div>
            </div>
          </div>
          
          {/* Recent posts skeleton */}
          <div className="rts-single-wized Recent-post">
            <div className="wized-header">
              <div className="skeleton-sidebar-title"></div>
            </div>
            <div className="wized-body">
              <div className="recent-post-single">
                <div className="thumbnail">
                  <div className="skeleton-recent-image"></div>
                </div>
                <div className="content-area">
                  <div className="skeleton-recent-date"></div>
                  <div className="skeleton-recent-title"></div>
                </div>
              </div>
              <div className="recent-post-single">
                <div className="thumbnail">
                  <div className="skeleton-recent-image"></div>
                </div>
                <div className="content-area">
                  <div className="skeleton-recent-date"></div>
                  <div className="skeleton-recent-title"></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Gallery skeleton */}
          <div className="rts-single-wized Recent-post">
            <div className="wized-header">
              <div className="skeleton-sidebar-title"></div>
            </div>
            <div className="wized-body">
              <div className="gallery-inner">
                <div className="row-1 single-row">
                  <div className="skeleton-gallery-image"></div>
                  <div className="skeleton-gallery-image"></div>
                  <div className="skeleton-gallery-image"></div>
                </div>
                <div className="row-2 single-row">
                  <div className="skeleton-gallery-image"></div>
                  <div className="skeleton-gallery-image"></div>
                  <div className="skeleton-gallery-image"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default function BlogDetails() {
  const { slug } = useParams(); // Get the slug from URL parameters
  
  // State for blog data
  const [blogPost, setBlogPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentPosts, setRecentPosts] = useState([]);
  const [galleryPosts, setGalleryPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');

  // Declare hooks unconditionally at the top
  const [comments, setComments] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const recaptchaRef = useRef();
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
      return '/assets/images/blog/01.webp';
    }
    if (imagePath.startsWith('/') || imagePath.startsWith('http')) {
      return imagePath;
    }
    return `/assets/images/blog/${imagePath}`;
  };

  // Helper function to get the correct author image URL
  const getAuthorImageUrl = (authorImagePath) => {
    if (!authorImagePath) return '/assets/images/testimonials/01.png';
    if (authorImagePath.startsWith('/') || authorImagePath.startsWith('http')) {
      return authorImagePath;
    }
    return `/assets/images/testimonials/${authorImagePath}`;
  };

  // Fetch blog post by slug
  const fetchBlogPost = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/blogs/${slug}`);
      const result = await response.json();

      if (result.success) {
        setBlogPost(result.data);
      } else {
        toast.error('Failed to fetch blog post');
      }
    } catch (error) {
      console.error('Error fetching blog post:', error);
      toast.error('Failed to fetch blog post');
    } finally {
      setLoading(false);
    }
  };

  // Fetch recent posts
  const fetchRecentPosts = async () => {
    try {
      const response = await fetch('/api/blogs?limit=3');
      const result = await response.json();

      if (result.success) {
        setRecentPosts(result.data.blogs);
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
        setGalleryPosts(result.data.blogs);
      }
    } catch (error) {
      console.error('Error fetching gallery posts:', error);
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

  // Fetch existing comments for the blog
  const fetchComments = async () => {
    try {
      if (blogPost && blogPost._id) {
        const response = await fetch(`/api/blogs/${slug}/comments`);
        const result = await response.json();
        
        if (result.success) {
          setComments(result.data || []);
        }
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle sidebar search
  const handleSidebarSearch = (e) => {
    e.preventDefault();
    if (searchKeyword.trim()) {
      window.location.href = `/blogs?search=${encodeURIComponent(searchKeyword.trim())}`;
    } else {
      toast.error('Please enter a search keyword');
    }
  };

  // Handle search key press
  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSidebarSearch(e);
    }
  };

  // Handle category click
  const handleCategoryClick = (category) => {
    window.location.href = `/blogs?category=${encodeURIComponent(category)}`;
  };

  // useEffect to fetch data when component mounts
  useEffect(() => {
    fetchBlogPost();
    fetchRecentPosts();
    fetchGalleryPosts();
    fetchCategories();
  }, [slug]);

  // Fetch comments when blog post is loaded
  useEffect(() => {
    if (blogPost && blogPost._id) {
      fetchComments();
    }
  }, [blogPost]);



  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('Name is required');
      return false;
    }
    if (!formData.email.trim()) {
      toast.error('Email is required');
      return false;
    }
    if (!formData.comment.trim()) {
      toast.error('Comment is required');
      return false;
    }
    if (!formData.agree) {
      toast.error('You must agree to our terms of service');
      return false;
    }
    if (!recaptchaToken) {
      toast.error('Please complete the reCAPTCHA verification');
      return false;
    }
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Verify reCAPTCHA on server side
      const recaptchaResponse = await fetch('/api/verify-recaptcha', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: recaptchaToken }),
      });

      if (!recaptchaResponse.ok) {
        throw new Error('reCAPTCHA verification failed');
      }

      // Send comment to API to save to database
      const commentResponse = await fetch(`/api/blogs/${slug}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          topic: formData.topic,
          comment: formData.comment
        }),
      });

      if (!commentResponse.ok) {
        throw new Error('Failed to save comment');
      }

      const commentResult = await commentResponse.json();
      
      if (commentResult.success) {
        // Add comment to the local state
        const newComment = {
          ...formData,
          date: new Date().toLocaleDateString(),
          id: Date.now(),
          createdAt: new Date()
        };
        
        setComments([newComment, ...comments]);
        toast.success("Comment posted successfully!");
        
        // Clear form
        setFormData({ 
          name: "", 
          email: "", 
          topic: "", 
          comment: "",
          agree: false 
        });
        setRecaptchaToken(null);
        if (recaptchaRef.current?.reset) {
          recaptchaRef.current.reset();
        }
      } else {
        throw new Error(commentResult.error || 'Failed to save comment');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error("Failed to post comment. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRecaptchaVerify = (token) => {
    setRecaptchaToken(token);
  };

  const handleRecaptchaError = (error) => {
    console.error('reCAPTCHA error:', error);
    toast.error('reCAPTCHA verification failed. Please try again.');
    setRecaptchaToken(null);
  };

  const handleRecaptchaExpire = () => {
    setRecaptchaToken(null);
    toast.warning('reCAPTCHA expired. Please verify again.');
  };

  // Show loading state
  if (loading) {
    return (
      <div className="">
        <HeaderOne />
        <div className="career-single-banner-area ptb--70 blog-page">
          <div className="container">
            <div className="row">
              <div className="col-lg-12">
                <div className="career-page-single-banner blog-page">
                  <h1 className="title">Loading...</h1>
                </div>
              </div>
            </div>
          </div>
        </div>
        <BlogDetailSkeleton />
        <FooterOneDynamic />
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
                <p>The blog post you&apos;re looking for doesn&apos;t exist.</p>
                <Link href="/blogs" className="rts-btn btn-primary">
                  Back to Blogs
                </Link>
              </div>
            </div>
          </div>
        </div>
        <FooterOneDynamic />
        <BackToTop />
      </div>
    );
  }

  return (
    <div className="">
      {blogPost && (
        <StructuredData 
          type="blog"
          pageData={{
            title: blogPost.title,
            description: blogPost.metaDescription || blogPost.description || blogPost.title,
            image: blogPost.bannerImg ? (blogPost.bannerImg.startsWith('http') ? blogPost.bannerImg : `https://justjobs.info${getImageUrl(blogPost.bannerImg)}`) : 'https://justjobs.info/assets/images/og-images/og-blog.webp',
            datePublished: blogPost.publishedDate,
            dateModified: blogPost.updatedAt || blogPost.publishedDate
          }}
          customSchema={generateBlogPostingSchema({
            title: blogPost.title,
            description: blogPost.metaDescription || blogPost.description || blogPost.title,
            url: `https://justjobs.info/blogs/${slug}`,
            image: blogPost.bannerImg ? (blogPost.bannerImg.startsWith('http') ? blogPost.bannerImg : `https://justjobs.info${getImageUrl(blogPost.bannerImg)}`) : 'https://justjobs.info/assets/images/og-images/og-blog.webp',
            datePublished: blogPost.publishedDate,
            dateModified: blogPost.updatedAt || blogPost.publishedDate,
            author: {
              name: blogPost.author || 'JustJobsInfo Team',
              url: blogPost.authorUrl || 'https://justjobs.info/about'
            }
          })}
        />
      )}
      <HeaderOne />

      <>
        <div className="career-single-banner-area ptb--70 blog-page">
          <div className="container">
            <div className="row">
              <div className="col-lg-12">
                <div className="career-page-single-banner blog-page">
                  <h1 className="title">{blogPost.title || 'Blog Post'}</h1>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="rts-blog-list-area rts-section-gapTop">
          <div className="container">
            <div className="row g-5">
              {/* rts blo post area */}
              <div className="col-xl-8 col-md-12 col-sm-12 col-12">
                {/* single post */}
                <div className="blog-single-post-listing details mb--0">
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
                  <div className="blog-listing-content">
                    <div className="user-info">
                      {/* single info */}
                      <div className="single">
                        <i className="far fa-user-circle" />
                        <span>by {blogPost.author || 'Unknown Author'}</span>
                      </div>
                      {/* single info end */}
                      {/* single info */}
                      <div className="single">
                        <i className="far fa-clock" />
                        <span>{new Date(blogPost.publishedDate).toLocaleDateString()}</span>
                      </div>
                      {/* single info end */}
                      {/* single info */}
                      <div className="single">
                        <i className="far fa-tags" />
                        <span>{blogPost.category || 'Uncategorized'}</span>
                      </div>
                      {/* single info end */}
                    </div>
                    <h3 className="title animated fadeIn">
                      {blogPost.title}
                    </h3>
                    <div className="disc para-1">
                      <div dangerouslySetInnerHTML={{ __html: blogPost.content }} />
                    </div>
                    <div className="row  align-items-center">
                      <div className="col-lg-6 col-md-12">
                        {/* tags details */}
                        {blogPost.tags && blogPost.tags.length > 0 && (
                          <div className="details-tag">
                            <h6>Tags:</h6>
                            {blogPost.tags.map((tag, index) => (
                              <button key={index}>{tag}</button>
                            ))}
                          </div>
                        )}
                        {/* tags details End */}
                      </div>
                      <div className="col-lg-6 col-md-12">
                        <div className="details-share">
                          <h6>Share:</h6>
                          <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
                            <button>
                              <i className="fab fa-facebook-f" />
                            </button>
                          </a>
                          <a href={`https://x.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(blogPost?.title || '')}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
                            <button>
                              <span style={{ fontWeight: 'bold', fontSize: '16px' }}>𝕏</span>
                            </button>
                          </a>
                          <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
                            <button>
                              <i className="fab fa-linkedin-in" />
                            </button>
                          </a>
                        </div>
                      </div>
                    </div>
                    <div className="author-area" style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '20px',
                      marginTop: '30px',
                      padding: '20px',
                      background: '#f8f9fa',
                      borderRadius: '8px'
                    }}>
                      <div style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: '#f8f9fa',
                        border: '3px solid #e9ecef'
                      }}>
                        <img
                          src={getAuthorImageUrl(blogPost.authorImg)}
                          alt={blogPost.author}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            borderRadius: '50%'
                          }}
                          onError={(e) => {
                            console.log('❌ Author image failed to load:', e.target.src);
                            e.target.src = '/assets/images/blog/details/author.jpg';
                          }}
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <span style={{
                          fontSize: '14px',
                          color: '#666',
                          fontWeight: '500',
                          marginBottom: '5px',
                          display: 'block'
                        }}>{blogPost.authorRole || 'Author'}</span>
                        <h5 style={{
                          fontSize: '18px',
                          fontWeight: '600',
                          color: 'var(--color-heading-1)',
                          margin: '0 0 10px 0'
                        }}>{blogPost.author}</h5>
                        <p style={{
                          fontSize: '14px',
                          lineHeight: '1.5',
                          color: '#666',
                          margin: 0
                        }}>
                          {blogPost.authorBio || 'No author bio available.'}
                        </p>
                      </div>
                    </div>
                    <div className="comments-area" style={{ marginTop: '40px' }}>
                      <div id="comments-container">
                        {/* Display existing comments */}
                        {comments.length > 0 && (
                          <div className="comments-list">
                            <h4 style={{ 
                              marginBottom: '20px', 
                              color: '#333',
                              fontSize: '24px',
                              fontWeight: '600'
                            }}>
                              Comments ({comments.length})
                            </h4>
                            {comments.map((comment) => (
                              <div key={comment.id} className="single-comment" style={{
                                border: '1px solid #eee',
                                padding: '20px',
                                marginBottom: '20px',
                                borderRadius: '8px',
                                backgroundColor: '#fafafa',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                              }}>
                                <div className="comment-header" style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  marginBottom: '15px',
                                  paddingBottom: '10px',
                                  borderBottom: '1px solid #eee'
                                }}>
                                  <strong style={{ 
                                    color: '#333', 
                                    fontSize: '16px',
                                    fontWeight: '600'
                                  }}>
                                    {comment.name}
                                  </strong>
                                  <span style={{ 
                                    color: '#666', 
                                    fontSize: '14px',
                                    backgroundColor: '#fff',
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    border: '1px solid #eee'
                                  }}>
                                    {comment.date}
                                  </span>
                                </div>
                                {comment.topic && (
                                  <div style={{ 
                                    marginBottom: '15px', 
                                    fontStyle: 'italic', 
                                    color: '#666',
                                    backgroundColor: '#fff',
                                    padding: '8px 12px',
                                    borderRadius: '4px',
                                    border: '1px solid #eee',
                                    fontSize: '14px'
                                  }}>
                                    <strong>Topic:</strong> {comment.topic}
                                  </div>
                                )}
                                <p style={{ 
                                  margin: '0',
                                  lineHeight: '1.6',
                                  color: '#333',
                                  fontSize: '15px'
                                }}>
                                  {comment.comment}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                        {comments.length === 0 && (
                          <div style={{ 
                            textAlign: 'center', 
                            padding: '40px 20px',
                            color: '#666',
                            fontStyle: 'italic'
                          }}>
                            No comments yet. Be the first to leave a comment!
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="replay-area-details" style={{ marginTop: '40px' }}>
                      <h4 className="title" style={{ 
                        marginBottom: '25px', 
                        color: '#333',
                        fontSize: '24px',
                        fontWeight: '600'
                      }}>
                        Leave a Reply
                      </h4>
                      <form id="comment-form" onSubmit={handleSubmit}>
                        <div className="row g-4">
                          <div className="col-lg-6">
                            <input
                              type="text"
                              id="name"
                              name="name"
                              placeholder="Your Name *"
                              value={formData.name}
                              onChange={handleChange}
                              required
                              className="form-control"
                              style={{
                                width: '100%',
                                padding: '12px 15px',
                                border: '1px solid #ddd',
                                borderRadius: '5px',
                                fontSize: '14px'
                              }}
                            />
                          </div>
                          <div className="col-lg-6">
                            <input
                              type="email"
                              id="email"
                              name="email"
                              placeholder="Your Email *"
                              value={formData.email}
                              onChange={handleChange}
                              required
                              className="form-control"
                              style={{
                                width: '100%',
                                padding: '12px 15px',
                                border: '1px solid #ddd',
                                borderRadius: '5px',
                                fontSize: '14px'
                              }}
                            />
                          </div>
                          <div className="col-12">
                            <input
                              type="text"
                              id="topic"
                              name="topic"
                              placeholder="Select Topic (Optional)"
                              value={formData.topic}
                              onChange={handleChange}
                              className="form-control"
                              style={{
                                width: '100%',
                                padding: '12px 15px',
                                border: '1px solid #ddd',
                                borderRadius: '5px',
                                fontSize: '14px'
                              }}
                            />
                            <textarea
                              id="comment"
                              name="comment"
                              placeholder="Type your message *"
                              value={formData.comment}
                              onChange={handleChange}
                              required
                              className="form-control"
                              style={{
                                width: '100%',
                                minHeight: '120px',
                                padding: '12px 15px',
                                border: '1px solid #ddd',
                                borderRadius: '5px',
                                fontSize: '14px',
                                resize: 'vertical'
                              }}
                            />
                          </div>
                          
                          {/* reCAPTCHA */}
                          <div className="col-12" style={{ marginTop: '10px' }}>
                            <div style={{ 
                              marginBottom: '10px',
                              fontSize: '14px',
                              color: '#666'
                            }}>
                              Please complete the reCAPTCHA verification:
                            </div>
                            <ReCaptcha
                              ref={recaptchaRef}
                              onVerify={handleRecaptchaVerify}
                              onError={handleRecaptchaError}
                              onExpire={handleRecaptchaExpire}
                            />
                          </div>

                          {/* Terms agreement */}
                          <div className="col-12">
                            <div className="form-check" style={{ marginTop: '10px' }}>
                              <label className="form-check-label" htmlFor="agree" style={{
                                display: 'flex', 
                                alignItems: 'center', 
                                cursor: 'pointer',
                                fontSize: '14px',
                                color: '#333'
                              }}>
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  id="agree"
                                  name="agree"
                                  checked={formData.agree}
                                  onChange={handleChange}
                                  required
                                  style={{
                                    marginRight: '12px',
                                    width: '18px',
                                    height: '18px',
                                    cursor: 'pointer'
                                  }}
                                />
                                <span>
                                  I agree to the <a href="/terms-of-use" target="_blank" style={{ color: '#007bff', textDecoration: 'none' }}>Terms of Service</a> and <a href="/privacy-policy" target="_blank" style={{ color: '#007bff', textDecoration: 'none' }}>Privacy Policy</a> *
                                </span>
                              </label>
                            </div>
                          </div>

                          <div className="col-12">
                            <button 
                              className="rts-btn btn-primary" 
                              type="submit"
                              disabled={isSubmitting}
                              style={{
                                padding: '12px 30px',
                                fontSize: '16px',
                                fontWeight: '600',
                                borderRadius: '5px',
                                border: 'none',
                                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                opacity: isSubmitting ? 0.7 : 1,
                                transition: 'all 0.3s ease'
                              }}
                            >
                              {isSubmitting ? 'Posting...' : 'Submit Comment'}
                            </button>
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
                {/* single post End*/}
              </div>
              {/* rts-blog post end area */}
              {/*rts blog wizered area */}
              <div className="col-xl-4 col-md-12 col-sm-12 col-12  pd-control-bg--40">
                {/* single wizered start */}
                <div className="rts-single-wized search">
                  <div className="wized-header">
                    <h5 className="title">Search here</h5>
                  </div>
                  <div className="wized-body">
                    <form onSubmit={handleSidebarSearch}>
                      <div className="rts-search-wrapper">
                        <input
                          className="Search"
                          type="text"
                          placeholder="Enter Keyword"
                          value={searchKeyword}
                          onChange={(e) => setSearchKeyword(e.target.value)}
                          onKeyPress={handleSearchKeyPress}
                        />
                        <button type="submit">
                          <i className="fal fa-search" />
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
                {/* single wizered End */}
                {/* single wizered start */}
                <div className="rts-single-wized Categories">
                  <div className="wized-header">
                    <h5 className="title">Categories</h5>
                  </div>
                  <div className="wized-body">
                    {categories && categories.length > 0 ? categories.map((category, index) => (
                      /* single categoris */
                      <ul key={index} className="single-categories">
                        <li>
                          <a href="#" onClick={() => handleCategoryClick(category)}>
                            {category} <i className="far fa-long-arrow-right" />
                          </a>
                        </li>
                      </ul>
                    )) : (
                      <ul className="single-categories">
                        <li>
                          <a href="#">
                            No categories available <i className="far fa-long-arrow-right" />
                          </a>
                        </li>
                      </ul>
                    )}
                  </div>
                </div>
                {/* single wizered End */}
                {/* single wizered start */}
                <div className="rts-single-wized Recent-post">
                  <div className="wized-header">
                    <h5 className="title">Recent Posts</h5>
                  </div>
                  <div className="wized-body">
                    {recentPosts && recentPosts.length > 0 ? recentPosts.map((post, index) => (
                      /* recent-post */
                      <div key={post._id || index} className="recent-post-single">
                        <div className="thumbnail">
                          <Link href={`/blogs/${post.slug}`}>
                            <img 
                              src={getImageUrl(post.image)} 
                              alt="Blog_post" 
                              onError={(e) => {
                                console.log('❌ Recent post image failed to load:', e.target.src);
                                e.target.src = '/assets/images/blog/01.webp';
                              }}
                            />
                          </Link>
                        </div>
                        <div className="content-area">
                          <div className="user">
                            <i className="fal fa-clock" />
                            <span>{new Date(post.publishedDate).toLocaleDateString()}</span>
                          </div>
                          <Link className="post-title" href={`/blogs/${post.slug}`}>
                            <h6 className="title">
                              {post.title}
                            </h6>
                          </Link>
                        </div>
                      </div>
                    )) : (
                      <div className="recent-post-single">
                        <div className="content-area">
                          <h6 className="title">No recent posts available</h6>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                {/* single wizered End */}
                {/* single wizered start */}
                <div className="rts-single-wized Recent-post">
                  <div className="wized-header">
                    <h5 className="title">Gallery Posts</h5>
                  </div>
                  <div className="wized-body">
                    <div className="gallery-inner">
                      {galleryPosts && galleryPosts.length > 0 ? (
                        <>
                          <div className="row-1 single-row">
                            {galleryPosts.slice(0, 3).map((post, index) => (
                              <Link key={post._id || index} href={`/blogs/${post.slug}`}>
                                <img 
                                  src={getImageUrl(post.image)} 
                                  alt="Gallery" 
                                  onError={(e) => {
                                    console.log('❌ Gallery post image failed to load:', e.target.src);
                                    e.target.src = '/assets/images/blog/01.webp';
                                  }}
                                />
                              </Link>
                            ))}
                          </div>
                          <div className="row-2 single-row">
                            {galleryPosts.slice(3, 6).map((post, index) => (
                              <Link key={post._id || index} href={`/blogs/${post.slug}`}>
                                <img 
                                  src={getImageUrl(post.image)} 
                                  alt="Gallery" 
                                  onError={(e) => {
                                    console.log('❌ Gallery post image failed to load:', e.target.src);
                                    e.target.src = '/assets/images/blog/01.webp';
                                  }}
                                />
                              </Link>
                            ))}
                          </div>
                        </>
                      ) : (
                        <div className="row-1 single-row">
                          <div>No gallery posts available</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {/* single wizered End */}
                {/* single wizered start */}
                <div className="rts-single-wized">
                  <div className="wized-header">
                    <h5 className="title">Popular Tags</h5>
                  </div>
                  <div className="wized-body">
                    <div className="tags-wrapper">
                      <a href="#">Services</a>
                      <a href="#">Business</a>
                      <a href="#">Growth</a>
                      <a href="#">Finance</a>
                      <a href="#">UI/UX Design</a>
                      <a href="#">Solution</a>
                      <a href="#">Speed</a>
                      <a href="#">Strategy</a>
                      <a href="#">Technology</a>
                    </div>
                  </div>
                </div>
                {/* single wizered End */}
              </div>
              {/* rts- blog wizered end area */}
            </div>
          </div>
        </div>
      </>

      <FooterOneDynamic />
      <BackToTop />

      <style jsx>{`
        /* Skeleton Loading Styles for Blog Detail Page */
        .skeleton-banner-image {
          width: 100%;
          height: 400px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
          border-radius: 8px;
        }

        .skeleton-user-info {
          width: 120px;
          height: 16px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
          border-radius: 4px;
        }

        .skeleton-title-large {
          width: 100%;
          height: 32px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
          border-radius: 4px;
          margin: 20px 0;
        }

        .skeleton-content {
          margin: 20px 0;
        }

        .skeleton-paragraph {
          width: 100%;
          height: 16px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
          border-radius: 4px;
          margin-bottom: 12px;
        }

        .skeleton-paragraph.short {
          width: 60%;
        }

        .skeleton-tags {
          width: 200px;
          height: 40px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
          border-radius: 4px;
        }

        .skeleton-share {
          width: 150px;
          height: 40px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
          border-radius: 4px;
        }

        .skeleton-author-image {
          width: 80px;
          height: 80px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
          border-radius: 50%;
        }

        .skeleton-author-role {
          width: 60px;
          height: 16px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
          border-radius: 4px;
          margin-bottom: 8px;
        }

        .skeleton-author-name {
          width: 120px;
          height: 20px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
          border-radius: 4px;
          margin-bottom: 8px;
        }

        .skeleton-author-bio {
          width: 100%;
          height: 16px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
          border-radius: 4px;
        }

        .skeleton-sidebar-title {
          width: 120px;
          height: 20px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
          border-radius: 4px;
          margin-bottom: 15px;
        }

        .skeleton-search-input {
          width: 100%;
          height: 50px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
          border-radius: 25px;
        }

        .skeleton-category-item {
          width: 100%;
          height: 20px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
          border-radius: 4px;
          margin-bottom: 10px;
        }

        .skeleton-recent-image {
          width: 60px;
          height: 60px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
          border-radius: 4px;
        }

        .skeleton-recent-date {
          width: 80px;
          height: 14px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
          border-radius: 4px;
          margin-bottom: 5px;
        }

        .skeleton-recent-title {
          width: 100%;
          height: 16px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
          border-radius: 4px;
        }

        .skeleton-gallery-image {
          width: 80px;
          height: 80px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
          border-radius: 4px;
          margin: 2px;
        }

        @keyframes loading {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
      `}</style>
    </div>
  );
} 