"use client";
import BackToTop from "@/components/common/BackToTop";
import Breadcrumb from "@/components/common/Breadcrumb";
import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from 'next/navigation';
import HeaderOne from "@/components/header/HeaderOne";
import FooterOneDynamic from "@/components/footer/FooterOneDynamic";
import BlogMain from './BlogMain';
import toast from 'react-hot-toast';
import Link from 'next/link';

// Skeleton component for blog cards
const BlogSkeleton = () => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    background: '#fff',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    border: '1px solid #f0f0f0'
  }}>
    <div className="thumbnail" style={{
      display: 'block',
      width: '100%',
      height: '250px',
      overflow: 'hidden',
      borderRadius: '0'
    }}>
      <div className="skeleton-image"></div>
    </div>
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
        <div className="skeleton-category"></div>
        <div className="skeleton-title"></div>
        <div className="skeleton-description"></div>
        <div className="skeleton-description" style={{ width: '85%' }}></div>
        <div className="skeleton-description" style={{ width: '90%' }}></div>
        <div className="bottom-author-area" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '15px',
          marginTop: 'auto',
          paddingTop: '20px',
          borderTop: '1px solid #f0f0f0'
        }}>
          <div className="skeleton-author-img"></div>
          <div className="author-area-info" style={{ flex: 1 }}>
            <div className="skeleton-author-name"></div>
            <div className="skeleton-date"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

function BlogsPage() {
    const searchParams = useSearchParams();
    const isInitialMount = useRef(true);
    const isFromUrlChange = useRef(false);
    const [blogs, setBlogs] = useState([]);
    const [featuredBlogs, setFeaturedBlogs] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalCount: 0,
        hasNextPage: false,
        hasPrevPage: false
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

    // Debounce search term to avoid too many API calls
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 300); // 300ms delay

        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Fetch categories
    useEffect(() => {
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
        fetchCategories();
    }, []);

    // Fetch blogs from API
    const fetchBlogs = async (page = 1, search = '', category = '') => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '15',
                search: search
            });
            if (category) {
                params.append('category', category);
            }

            const response = await fetch(`/api/blogs?${params}`);
            const result = await response.json();

            if (result.success) {
                setBlogs(result.data.blogs);
                setPagination(result.data.pagination);
            } else {
                toast.error('Failed to fetch blogs');
            }
        } catch (error) {
            console.error('Error fetching blogs:', error);
            toast.error('Failed to fetch blogs');
        } finally {
            setLoading(false);
        }
    };

    // Fetch featured blogs
    const fetchFeaturedBlogs = async () => {
        try {
            const response = await fetch('/api/blogs?limit=2&featured=true&status=published');
            const result = await response.json();
            if (result.success && result.data.blogs.length > 0) {
                setFeaturedBlogs(result.data.blogs.slice(0, 2));
            }
        } catch (error) {
            console.error('Error fetching featured blogs:', error);
        }
    };

    // Handle search input change
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    // Handle search form submission
    const handleSearch = (e) => {
        e.preventDefault();
        setSelectedCategory(''); // Clear category when searching
        fetchBlogs(1, searchTerm, '');
    };

    // Handle category selection
    const handleCategoryClick = (category) => {
        setSelectedCategory(category);
        setSearchTerm(''); // Clear search when selecting category
        fetchBlogs(1, '', category);
    };

    // Handle all categories (clear filter)
    const handleAllCategories = () => {
        setSelectedCategory('');
        setSearchTerm('');
        fetchBlogs(1, '', '');
    };

    // Handle pagination
    const handlePageChange = (page) => {
        fetchBlogs(page, debouncedSearchTerm, selectedCategory);
    };

    // Initialize from URL params on mount and load data
    useEffect(() => {
        const urlSearch = searchParams.get('search') || '';
        const urlCategory = searchParams.get('category') || '';
        
        // Mark that this is from a URL change to prevent duplicate fetches
        isFromUrlChange.current = true;
        
        if (urlSearch) {
            setSearchTerm(urlSearch);
        }
        if (urlCategory) {
            setSelectedCategory(urlCategory);
        }
        
        // Fetch featured blogs (only on initial mount)
        if (isInitialMount.current) {
            fetchFeaturedBlogs();
            isInitialMount.current = false;
        }
        
        // Fetch blogs with URL params
        fetchBlogs(1, urlSearch, urlCategory);
        
        // Reset flag after a delay to allow debounce to finish
        setTimeout(() => {
            isFromUrlChange.current = false;
        }, 500);
    }, [searchParams]);

    // Watch for debounced search term changes (debounce only, not category)
    useEffect(() => {
        // Skip if this change was triggered by a URL change
        if (isFromUrlChange.current) return;
        fetchBlogs(1, debouncedSearchTerm, selectedCategory);
    }, [debouncedSearchTerm, selectedCategory]);

    return (
        <>
            <HeaderOne />
            <Breadcrumb />
            {/* Enhanced Hero Section */}
            <div className="blog-hero-section">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="blog-hero-content">
                                <span className="blog-hero-badge">
                                    <i className="fas fa-newspaper"></i> Career Advice & Resources
                                </span>
                                <h1 className="blog-hero-title">
                                    Expert Career Insights & Professional Growth Tips
                                </h1>
                                <p className="blog-hero-description">
                                    Discover proven strategies for job searching, career development, and professional success. 
                                    From resume writing to interview tips, we&apos;ve got you covered.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Featured Articles Section */}
            {featuredBlogs.length > 0 && (
                <div className="featured-blogs-section">
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-12">
                                <div className="section-header">
                                    <span className="section-badge">
                                        <i className="fas fa-star"></i> Featured Articles
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="row g-4" style={{ alignItems: 'stretch' }}>
                            {featuredBlogs.map((blog, index) => (
                                <div key={blog._id || index} className="col-lg-6 col-md-6 col-sm-12" style={{ display: 'flex' }}>
                                    <div style={{ flex: 1 }}>
                                        <BlogMain
                                            blogCategory={blog.category}
                                            Slug={blog.slug}
                                            blogImage={blog.image}
                                            authorImg={blog.authorImg}
                                            blogTitle={blog.title}
                                            blogAuthor={blog.author}
                                            blogPublishedDate={blog.publishedDate}
                                            blogDescription={blog.description}
                                            isFeatured={true}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <div className="rts-blog-area position-relative">
                <div className="container">
                    {/* Search and Filter Section */}
                    <div className="blog-toolbar">
                        {/* Search Section */}
                        <div className="row mb-4 mt-4 pt-4">
                            <div className="col-lg-8 mx-auto">
                                <form onSubmit={handleSearch} className="search-form">
                                    <div className="search-input-group">
                                        <input
                                            type="text"
                                            className="search-input"
                                            placeholder="Search articles, tips, and guides..."
                                            value={searchTerm}
                                            onChange={handleSearchChange}
                                        />
                                        <button type="submit" className="search-btn">
                                            <i className="fas fa-search"></i>
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* Category Filter Section */}
                        {categories.length > 0 && (
                            <div className="category-filter-section">
                                <div className="category-filter-label">
                                    <i className="fas fa-filter"></i> Browse by Category
                                </div>
                                <div className="category-chips">
                                    <button
                                        className={`category-chip ${selectedCategory === '' ? 'active' : ''}`}
                                        onClick={handleAllCategories}
                                    >
                                        All Articles
                                    </button>
                                    {categories.map((category, index) => (
                                        <button
                                            key={index}
                                            className={`category-chip ${selectedCategory === category ? 'active' : ''}`}
                                            onClick={() => handleCategoryClick(category)}
                                        >
                                            {category}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* All Articles Section */}
                    <div className="all-articles-section">
                        <div className="row mb-4">
                            <div className="col-lg-12">
                                <h2 className="section-title">
                                    {selectedCategory ? `${selectedCategory} Articles` : 'All Articles'}
                                    {pagination.totalCount > 0 && (
                                        <span className="article-count">({pagination.totalCount})</span>
                                    )}
                                </h2>
                            </div>
                        </div>

                        {/* Blogs Grid */}
                        <div className="row g-5" style={{ alignItems: 'stretch' }}>
                            {loading ? (
                                // Loading skeleton
                                Array.from({ length: 15 }).map((_, index) => (
                                    <div key={index} className="col-lg-4 col-md-6 col-sm-12" style={{ display: 'flex' }}>
                                        <div style={{ flex: 1, height: '610px' }}>
                                            <BlogSkeleton />
                                        </div>
                                    </div>
                                ))
                            ) : blogs.length > 0 ? (
                                blogs.map((blog, index) => (
                                    <div key={blog._id || index} className="col-lg-4 col-md-6 col-sm-12" style={{ display: 'flex' }}>
                                        <div style={{ flex: 1, height: '610px' }}>
                                            <BlogMain
                                                blogCategory={blog.category}
                                                Slug={blog.slug}
                                                blogImage={blog.image}
                                                authorImg={blog.authorImg}
                                                blogTitle={blog.title}
                                                blogAuthor={blog.author}
                                                blogPublishedDate={blog.publishedDate}
                                                blogDescription={blog.description}
                                            />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-12 text-center">
                                    <div style={{
                                        padding: '60px 20px',
                                        background: '#fff',
                                        borderRadius: '12px',
                                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
                                    }}>
                                        <h3 style={{ color: '#666', marginBottom: '16px' }}>No blogs found</h3>
                                        <p style={{ color: '#999', margin: 0 }}>
                                            {searchTerm ? `No results found for "${searchTerm}"` : 'Check back later for new blog posts.'}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Pagination */}
                        {pagination.totalPages > 1 && (
                        <div className="row mt--50">
                            <div className="col-lg-12">
                                <div className="pagination-one">
                                    <ul className="justify-content-center">
                                        {/* Previous Page */}
                                        {pagination.hasPrevPage && (
                                            <li>
                                                <button 
                                                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                                                    className="prev-page"
                                                >
                                                    <i className="fa-solid fa-chevron-left" />
                                                </button>
                                            </li>
                                        )}

                                        {/* Page Numbers */}
                                        {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
                                            <li key={page}>
                                                <button 
                                                    onClick={() => handlePageChange(page)}
                                                    className={page === pagination.currentPage ? 'active' : ''}
                                                >
                                                    {page.toString().padStart(2, '0')}
                                                </button>
                                            </li>
                                        ))}

                                        {/* Next Page */}
                                        {pagination.hasNextPage && (
                                            <li>
                                                <button 
                                                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                                                    className="next-page"
                                                >
                                                    <i className="fa-solid fa-chevron-right" />
                                                </button>
                                            </li>
                                        )}
                                    </ul>
                                </div>
                            </div>
                        </div>
                        )}
                    </div>
                </div>
            </div>

            <BackToTop />
            <FooterOneDynamic />

            <style jsx>{`
                /* Hero Section Styles */
                .blog-hero-section {
                    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                    padding: 80px 0 60px;
                    border-bottom: 1px solid #dee2e6;
                }

                .blog-hero-content {
                    text-align: center;
                    max-width: 800px;
                    margin: 0 auto;
                }

                .blog-hero-badge {
                    display: inline-block;
                    background: linear-gradient(135deg, var(--color-primary) 0%, #0056b3 100%);
                    color: white;
                    padding: 10px 24px;
                    border-radius: 50px;
                    font-size: 14px;
                    font-weight: 600;
                    letter-spacing: 0.5px;
                    text-transform: uppercase;
                    margin-bottom: 24px;
                    box-shadow: 0 4px 15px rgba(9, 99, 211, 0.3);
                }

                .blog-hero-badge i {
                    margin-right: 8px;
                }

                .blog-hero-title {
                    font-size: 48px;
                    font-weight: 800;
                    color: var(--color-heading-1);
                    margin-bottom: 20px;
                    line-height: 1.2;
                }

                .blog-hero-description {
                    font-size: 18px;
                    color: #666;
                    line-height: 1.6;
                    margin-bottom: 0;
                }

                /* Featured Blogs Section */
                .featured-blogs-section {
                    padding: 60px 0;
                    background: linear-gradient(135deg, #2c3e50 0%, #1a1a1a 100%);
                    position: relative;
                    overflow: hidden;
                }

                .featured-blogs-section .container {
                    position: relative;
                    z-index: 1;
                }

                .featured-blogs-section .section-header {
                    position: relative;
                    z-index: 1;
                }

                .featured-blogs-section .section-badge {
                    color: white;
                    background: rgba(255, 255, 255, 0.15);
                    padding: 8px 20px;
                    border-radius: 50px;
                    backdrop-filter: blur(10px);
                }

                .featured-blogs-section .section-badge i {
                    color: white;
                }

                .section-header {
                    margin-bottom: 25px;
                }

                .section-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    color: var(--color-primary);
                    font-size: 16px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }

                .section-badge i {
                    font-size: 18px;
                }

                /* Blog Toolbar */
                .blog-toolbar {
                    margin-bottom: 50px;
                    display: flex;
                    flex-direction: column;
                }

                .search-form {
                    margin-bottom: 2rem;
                }

                /* Category Filter Styles */
                .category-filter-section {
                    margin-top: 20px;
                    padding: 20px 24px;
                    background: linear-gradient(135deg, #f8f9fb 0%, #ffffff 100%);
                    border-radius: 12px;
                    border: 1px solid #e3eaf2;
                    width: 100%;
                    box-sizing: border-box;
                    box-shadow: 0 2px 8px rgba(9, 99, 211, 0.05);
                }

                .category-filter-label {
                    font-size: 12px;
                    font-weight: 700;
                    color: var(--color-primary);
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    margin-bottom: 15px;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .category-filter-label i {
                    color: var(--color-primary);
                    font-size: 14px;
                }

                .category-chips {
                    display: flex !important;
                    flex-wrap: wrap !important;
                    gap: 8px !important;
                    align-items: center !important;
                    flex-direction: row !important;
                }

                .category-chip {
                    padding: 6px 20px !important;
                    background: #fff !important;
                    border: 2px solid #d0d8e5 !important;
                    border-radius: 20px !important;
                    font-size: 13px !important;
                    font-weight: 600 !important;
                    color: #495057 !important;
                    cursor: pointer !important;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
                    white-space: nowrap !important;
                    position: relative !important;
                    display: inline-flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    width: auto !important;
                    flex: none !important;
                }

                .category-chip:hover {
                    background: rgba(9, 99, 211, 0.08) !important;
                    border-color: var(--color-primary) !important;
                    color: var(--color-primary) !important;
                    transform: translateY(-2px) !important;
                    box-shadow: 0 4px 12px rgba(9, 99, 211, 0.15) !important;
                }

                .category-chip.active {
                    background: linear-gradient(135deg, var(--color-primary) 0%, #0056b3 100%) !important;
                    border-color: var(--color-primary) !important;
                    color: white !important;
                    box-shadow: 0 4px 15px rgba(9, 99, 211, 0.3) !important;
                    font-weight: 700 !important;
                }

                /* All Articles Section */
                .all-articles-section {
                    margin-top: 40px;
                }

                .section-title {
                    font-size: 32px;
                    font-weight: 800;
                    color: var(--color-heading-1);
                    margin-bottom: 0;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .article-count {
                    font-size: 18px;
                    font-weight: 500;
                    color: #999;
                }
                
                .search-input-group {
                    position: relative;
                    display: flex;
                    align-items: center;
                    background: #fff;
                    border-radius: 50px;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
                    overflow: hidden;
                    transition: all 0.3s ease;
                }
                
                .search-input-group:hover {
                    box-shadow: 0 6px 25px rgba(0, 0, 0, 0.12);
                }
                
                .search-input-group:focus-within {
                    box-shadow: 0 6px 25px rgba(9, 99, 211, 0.15);
                    border: 2px solid var(--color-primary);
                }
                
                .search-input {
                    flex: 1;
                    border: none;
                    padding: 16px 24px;
                    font-size: 16px;
                    background: transparent;
                    outline: none;
                    color: var(--color-heading-1);
                }
                
                .search-input::placeholder {
                    color: #999;
                    font-weight: 400;
                }
                
                .search-btn {
                    width: 60px;
                    height: 60px;
                    border: none;
                    background: linear-gradient(135deg, var(--color-primary) 0%, #0056b3 100%);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    border-radius: 50%;
                    margin: 8px;
                    font-size: 18px;
                }
                
                .search-btn:hover {
                    background: linear-gradient(135deg, #0056b3 0%, #004494 100%);
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(9, 99, 211, 0.3);
                }
                
                .search-btn:active {
                    transform: translateY(0);
                }

                /* Skeleton Loading Styles */
                .skeleton-image {
                    width: 100%;
                    height: 200px;
                    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                    background-size: 200% 100%;
                    animation: loading 1.5s infinite;
                    border-radius: 8px;
                }

                .skeleton-category {
                    width: 80px;
                    height: 24px;
                    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                    background-size: 200% 100%;
                    animation: loading 1.5s infinite;
                    border-radius: 12px;
                    margin-bottom: 20px;
                }

                .skeleton-title {
                    width: 100%;
                    height: 56px;
                    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                    background-size: 200% 100%;
                    animation: loading 1.5s infinite;
                    border-radius: 4px;
                    margin-bottom: 24px;
                }

                .skeleton-description {
                    width: 100%;
                    height: 16px;
                    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                    background-size: 200% 100%;
                    animation: loading 1.5s infinite;
                    border-radius: 4px;
                    margin-bottom: 12px;
                }

                .skeleton-author-img {
                    width: 50px;
                    height: 50px;
                    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                    background-size: 200% 100%;
                    animation: loading 1.5s infinite;
                    border-radius: 50%;
                    flex-shrink: 0;
                }

                .skeleton-author-name {
                    width: 80px;
                    height: 16px;
                    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                    background-size: 200% 100%;
                    animation: loading 1.5s infinite;
                    border-radius: 4px;
                    margin-bottom: 5px;
                }

                .skeleton-date {
                    width: 60px;
                    height: 14px;
                    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                    background-size: 200% 100%;
                    animation: loading 1.5s infinite;
                    border-radius: 4px;
                }

                @keyframes loading {
                    0% {
                        background-position: 200% 0;
                    }
                    100% {
                        background-position: -200% 0;
                    }
                }
                
                @media (max-width: 768px) {
                    .blog-hero-section {
                        padding: 50px 0 40px;
                    }

                    .blog-hero-title {
                        font-size: 32px;
                    }

                    .blog-hero-description {
                        font-size: 16px;
                    }

                    .featured-blogs-section {
                        padding: 40px 0;
                    }

                    .section-badge {
                        font-size: 14px;
                    }

                    .category-filter-section {
                        padding: 16px 18px;
                    }

                    .category-chip {
                        padding: 6px 20px;
                        font-size: 12px;
                    }

                    .category-chips {
                        gap: 6px;
                    }

                    .section-title {
                        font-size: 24px;
                    }

                    .article-count {
                        font-size: 14px;
                    }
                    
                    .search-input-group {
                        border-radius: 25px;
                    }
                    
                    .search-input {
                        padding: 14px 20px;
                        font-size: 14px;
                    }
                    
                    .search-btn {
                        width: 50px;
                        height: 50px;
                        font-size: 16px;
                        margin: 5px;
                    }
                }

                @media (max-width: 576px) {
                    .blog-hero-title {
                        font-size: 28px;
                    }

                    .blog-hero-badge {
                        padding: 8px 18px;
                        font-size: 12px;
                    }

                    .featured-blogs-section {
                        padding: 30px 0;
                    }

                    .category-filter-section {
                        padding: 12px 16px;
                    }

                    .category-chips {
                        gap: 6px;
                    }

                    .category-chip {
                        padding: 6px 20px;
                        font-size: 11px;
                    }

                    .category-filter-label {
                        font-size: 11px;
                    }

                    .section-title {
                        font-size: 20px;
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 8px;
                    }
                }
            `}</style>
        </>
    );
}

export default BlogsPage; 
