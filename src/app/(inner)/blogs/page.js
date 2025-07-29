"use client";
import BackToTop from "@/components/common/BackToTop";
import React, { useState, useEffect } from "react";
import HeaderOne from "@/components/header/HeaderOne";
import FooterOne from "@/components/footer/FooterOne";
import BlogMain from './BlogMain';
import toast from 'react-hot-toast';

// Skeleton component for blog cards
const BlogSkeleton = () => (
  <div className="single-blog-area-start border-none">
    <div className="thumbnail">
      <div className="skeleton-image"></div>
    </div>
    <div className="inner-content-area">
      <div className="top-area">
        <div className="skeleton-category"></div>
        <div className="skeleton-title"></div>
        <div className="skeleton-description"></div>
        <div className="bottom-author-area">
          <div className="skeleton-author-img"></div>
          <div className="author-area-info">
            <div className="skeleton-author-name"></div>
            <div className="skeleton-date"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

function BlogsPage() {
    const [blogs, setBlogs] = useState([]);
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

    // Fetch blogs from API
    const fetchBlogs = async (page = 1, search = '') => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '6',
                search: search
            });

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

    // Handle search input change
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    // Handle search form submission (optional)
    const handleSearch = (e) => {
        e.preventDefault();
        fetchBlogs(1, searchTerm);
    };

    // Handle pagination
    const handlePageChange = (page) => {
        fetchBlogs(page, debouncedSearchTerm);
    };

    // Initialize data and watch for search term changes
    useEffect(() => {
        fetchBlogs(1, debouncedSearchTerm);
    }, [debouncedSearchTerm]);

    // Initial load
    useEffect(() => {
        fetchBlogs();
    }, []);

    return (
        <>
            <HeaderOne />
            <>
                <div className="career-single-banner-area ptb--70 blog-page">
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-12">
                                <div className="career-page-single-banner blog-page">
                                    <h1 className="title">Our Latest News</h1>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="rts-blog-area position-relative">
                    <div className="container">
                        {/* Search Section */}
                        <div className="row mb-4">
                            <div className="col-lg-8 mx-auto">
                                <form onSubmit={handleSearch} className="search-form">
                                    <div className="search-input-group">
                                        <input
                                            type="text"
                                            className="search-input"
                                            placeholder="Search blogs..."
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

                        {/* Blogs Grid */}
                        <div className="row g-5">
                            {loading ? (
                                // Loading skeleton
                                Array.from({ length: 6 }).map((_, index) => (
                                    <div key={index} className="col-lg-4 col-md-6 col-sm-12">
                                        <BlogSkeleton />
                                    </div>
                                ))
                            ) : blogs.length > 0 ? (
                                blogs.map((blog, index) => (
                                    <div key={blog._id || index} className="col-lg-4 col-md-6 col-sm-12">
                                        <div className="single-blog-area-start border-none">
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
                                    <p>No blogs found.</p>
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
            </>

            <BackToTop />
            <FooterOne />

            <style jsx>{`
                .search-form {
                    margin-bottom: 2rem;
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
                    height: 20px;
                    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                    background-size: 200% 100%;
                    animation: loading 1.5s infinite;
                    border-radius: 4px;
                    margin-bottom: 10px;
                }

                .skeleton-title {
                    width: 100%;
                    height: 24px;
                    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                    background-size: 200% 100%;
                    animation: loading 1.5s infinite;
                    border-radius: 4px;
                    margin-bottom: 10px;
                }

                .skeleton-description {
                    width: 100%;
                    height: 16px;
                    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                    background-size: 200% 100%;
                    animation: loading 1.5s infinite;
                    border-radius: 4px;
                    margin-bottom: 15px;
                }

                .skeleton-author-img {
                    width: 40px;
                    height: 40px;
                    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                    background-size: 200% 100%;
                    animation: loading 1.5s infinite;
                    border-radius: 50%;
                    margin-right: 10px;
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
            `}</style>
        </>
    );
}

export default BlogsPage; 