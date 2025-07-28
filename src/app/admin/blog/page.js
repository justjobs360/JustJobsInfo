"use client"
import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAuth } from '@/contexts/AuthContext';
import { ADMIN_PERMISSIONS } from '@/utils/userRoleService';
import toast from 'react-hot-toast';

export default function BlogManagementPage() {
  const { hasPermission } = useAuth();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [showComments, setShowComments] = useState(null);
  
  // Form states
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    content: '',
    category: '',
    tags: [],
    status: 'published',
    author: '',
    authorImg: '',
    image: '',
    bannerImg: ''
  });

  // Image upload states
  const [imageUploadType, setImageUploadType] = useState('url'); // 'url' or 'upload'
  const [bannerUploadType, setBannerUploadType] = useState('url');
  const [authorUploadType, setAuthorUploadType] = useState('url');
  const [uploadingImage, setUploadingImage] = useState(false);

  // Fetch all blogs
  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/blogs?limit=100&status=');
      const result = await response.json();
      
      if (result.success) {
        setBlogs(result.data.blogs);
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

  // Fetch all tags
  const fetchTags = async () => {
    try {
      const response = await fetch('/api/blogs?limit=1000');
      const result = await response.json();
      if (result.success) {
        const allTags = result.data.blogs.reduce((acc, blog) => {
          if (blog.tags && Array.isArray(blog.tags)) {
            acc.push(...blog.tags);
          }
          return acc;
        }, []);
        setTags([...new Set(allTags)]); // Remove duplicates
      }
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle tags input
  const handleTagsChange = (e) => {
    const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag);
    setFormData(prev => ({
      ...prev,
      tags
    }));
  };

  // Generate slug from title
  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  // Handle title change and auto-generate slug
  const handleTitleChange = (e) => {
    const title = e.target.value;
    setFormData(prev => ({
      ...prev,
      title,
      slug: generateSlug(title)
    }));
  };

  // Handle image upload
  const handleImageUpload = async (file, type) => {
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);
    formData.append('type', type); // 'blog', 'banner', or 'author'

    try {
      setUploadingImage(true);
      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        // Update the corresponding image field
        if (type === 'blog') {
          setFormData(prev => ({ ...prev, image: result.data.url }));
        } else if (type === 'banner') {
          setFormData(prev => ({ ...prev, bannerImg: result.data.url }));
        } else if (type === 'author') {
          setFormData(prev => ({ ...prev, authorImg: result.data.url }));
        }
        toast.success('Image uploaded successfully!');
      } else {
        toast.error(result.error || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  // Handle file input change
  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      handleImageUpload(file, type);
    }
  };

  // Submit form (create or update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const url = editingBlog 
        ? `/api/blogs/${editingBlog.slug}` 
        : '/api/blogs';
      
      const method = editingBlog ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(editingBlog ? 'Blog updated successfully!' : 'Blog created successfully!');
        setShowAddForm(false);
        setEditingBlog(null);
        resetForm();
        fetchBlogs();
      } else {
        toast.error(result.error || 'Failed to save blog');
      }
    } catch (error) {
      console.error('Error saving blog:', error);
      toast.error('Failed to save blog');
    }
  };

  // Delete blog
  const handleDelete = async (slug) => {
    if (!confirm('Are you sure you want to delete this blog?')) return;
    
    try {
      const response = await fetch(`/api/blogs/${slug}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Blog deleted successfully!');
        fetchBlogs();
      } else {
        toast.error(result.error || 'Failed to delete blog');
      }
    } catch (error) {
      console.error('Error deleting blog:', error);
      toast.error('Failed to delete blog');
    }
  };

  // Edit blog
  const handleEdit = (blog) => {
    setEditingBlog(blog);
    setFormData({
      title: blog.title,
      slug: blog.slug,
      description: blog.description,
      content: blog.content,
      category: blog.category,
      tags: blog.tags || [],
      status: blog.status,
      author: blog.author,
      authorImg: blog.authorImg,
      image: blog.image,
      bannerImg: blog.bannerImg
    });
    setShowAddForm(true);
  };

  // View comments
  const handleViewComments = async (blog) => {
    if (showComments === blog._id) {
      setShowComments(null);
    } else {
      setShowComments(blog._id);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      description: '',
      content: '',
      category: '',
      tags: [],
      status: 'published',
      author: '',
      authorImg: '',
      image: '',
      bannerImg: ''
    });
    setImageUploadType('url');
    setBannerUploadType('url');
    setAuthorUploadType('url');
  };

  // Initialize data
  useEffect(() => {
    fetchBlogs();
    fetchCategories();
    fetchTags();
  }, []);

  if (!hasPermission('manage_blog_posts')) {
    return (
      <AdminLayout>
        <div className="admin-content">
          <div className="alert alert-danger">
            You don&apos;t have permission to manage blog posts.
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-content">
        <div className="admin-header">
          <h1>Blog Management</h1>
          <button 
            className="btn btn-primary add-blog-btn"
            onClick={() => {
              setShowAddForm(true);
              setEditingBlog(null);
              resetForm();
            }}
          >
            <i className="fas fa-plus"></i> Add New Blog
          </button>
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="admin-form-section">
            <div className="form-header">
              <h3>{editingBlog ? 'Edit Blog' : 'Add New Blog'}</h3>
              <button 
                className="btn btn-secondary"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingBlog(null);
                  resetForm();
                }}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="admin-form">
              <div className="row">
                <div className="col-md-6">
                  <div className="form-group">
                    <label>Title *</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleTitleChange}
                      required
                      className="form-control"
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group">
                    <label>Slug *</label>
                    <input
                      type="text"
                      name="slug"
                      value={formData.slug}
                      onChange={handleInputChange}
                      required
                      className="form-control"
                    />
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <div className="form-group">
                    <label>Category</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="form-control"
                    >
                      <option value="">Select Category</option>
                      {categories.map((category, index) => (
                        <option key={index} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group">
                    <label>Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="form-control"
                    >
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <div className="form-group">
                    <label>Author</label>
                    <input
                      type="text"
                      name="author"
                      value={formData.author}
                      onChange={handleInputChange}
                      className="form-control"
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group">
                    <label>Author Image</label>
                    <div className="image-input-group">
                      <div className="upload-type-selector">
                        <label>
                          <input
                            type="radio"
                            name="authorUploadType"
                            value="url"
                            checked={authorUploadType === 'url'}
                            onChange={() => setAuthorUploadType('url')}
                          />
                          URL
                        </label>
                        <label>
                          <input
                            type="radio"
                            name="authorUploadType"
                            value="upload"
                            checked={authorUploadType === 'upload'}
                            onChange={() => setAuthorUploadType('upload')}
                          />
                          Upload
                        </label>
                      </div>
                      {authorUploadType === 'url' ? (
                        <input
                          type="text"
                          name="authorImg"
                          value={formData.authorImg}
                          onChange={handleInputChange}
                          className="form-control"
                          placeholder="https://example.com/author.jpg"
                        />
                      ) : (
                        <div className="file-upload-area">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileChange(e, 'author')}
                            className="file-input"
                            id="authorImageUpload"
                          />
                          <label htmlFor="authorImageUpload" className="file-upload-label">
                            {uploadingImage ? 'Uploading...' : 'Choose Author Image'}
                          </label>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <div className="form-group">
                    <label>Blog Image</label>
                    <div className="image-input-group">
                      <div className="upload-type-selector">
                        <label>
                          <input
                            type="radio"
                            name="imageUploadType"
                            value="url"
                            checked={imageUploadType === 'url'}
                            onChange={() => setImageUploadType('url')}
                          />
                          URL
                        </label>
                        <label>
                          <input
                            type="radio"
                            name="imageUploadType"
                            value="upload"
                            checked={imageUploadType === 'upload'}
                            onChange={() => setImageUploadType('upload')}
                          />
                          Upload
                        </label>
                      </div>
                      {imageUploadType === 'url' ? (
                        <input
                          type="text"
                          name="image"
                          value={formData.image}
                          onChange={handleInputChange}
                          className="form-control"
                          placeholder="https://example.com/blog-image.jpg"
                        />
                      ) : (
                        <div className="file-upload-area">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileChange(e, 'blog')}
                            className="file-input"
                            id="blogImageUpload"
                          />
                          <label htmlFor="blogImageUpload" className="file-upload-label">
                            {uploadingImage ? 'Uploading...' : 'Choose Blog Image'}
                          </label>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group">
                    <label>Banner Image</label>
                    <div className="image-input-group">
                      <div className="upload-type-selector">
                        <label>
                          <input
                            type="radio"
                            name="bannerUploadType"
                            value="url"
                            checked={bannerUploadType === 'url'}
                            onChange={() => setBannerUploadType('url')}
                          />
                          URL
                        </label>
                        <label>
                          <input
                            type="radio"
                            name="bannerUploadType"
                            value="upload"
                            checked={bannerUploadType === 'upload'}
                            onChange={() => setBannerUploadType('upload')}
                          />
                          Upload
                        </label>
                      </div>
                      {bannerUploadType === 'url' ? (
                        <input
                          type="text"
                          name="bannerImg"
                          value={formData.bannerImg}
                          onChange={handleInputChange}
                          className="form-control"
                          placeholder="https://example.com/banner-image.jpg"
                        />
                      ) : (
                        <div className="file-upload-area">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileChange(e, 'banner')}
                            className="file-input"
                            id="bannerImageUpload"
                          />
                          <label htmlFor="bannerImageUpload" className="file-upload-label">
                            {uploadingImage ? 'Uploading...' : 'Choose Banner Image'}
                          </label>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>Tags (comma-separated)</label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags.join(', ')}
                  onChange={handleTagsChange}
                  className="form-control"
                  placeholder="Technology, Business, Innovation"
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="form-control"
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>Content (HTML)</label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  className="form-control"
                  rows="10"
                  placeholder="<p>Your HTML content here...</p>"
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  {editingBlog ? 'Update Blog' : 'Create Blog'}
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingBlog(null);
                    resetForm();
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Blogs Table */}
        <div className="admin-table-section">
          <div className="table-header">
            <h3>All Blogs ({blogs.length})</h3>
          </div>
          
          {loading ? (
            <div className="loading-skeleton">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="skeleton-row">
                  <div className="skeleton-cell"></div>
                  <div className="skeleton-cell"></div>
                  <div className="skeleton-cell"></div>
                  <div className="skeleton-cell"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Author</th>
                    <th>Views</th>
                    <th>Comments</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {blogs.map((blog) => (
                    <tr key={blog._id}>
                      <td>
                        <div className="blog-title">
                          <strong>{blog.title}</strong>
                          <small>{blog.slug}</small>
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-secondary">{blog.category}</span>
                      </td>
                      <td>
                        <span className={`badge badge-${blog.status === 'published' ? 'success' : blog.status === 'draft' ? 'warning' : 'danger'}`}>
                          {blog.status}
                        </span>
                      </td>
                      <td>{blog.author}</td>
                      <td>{blog.views || 0}</td>
                      <td>
                        <button 
                          className="btn btn-sm btn-info"
                          onClick={() => handleViewComments(blog)}
                        >
                          {blog.comments?.length || 0} Comments
                        </button>
                      </td>
                      <td>{new Date(blog.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="btn btn-sm btn-primary"
                            onClick={() => handleEdit(blog)}
                            title="Edit"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button 
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(blog.slug)}
                            title="Delete"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Comments Modal */}
          {showComments && (
            <div className="comments-modal">
              <div className="modal-header">
                <h4>Comments for &quot;{blogs.find(b => b._id === showComments)?.title}&quot;</h4>
                <button 
                  className="btn btn-secondary"
                  onClick={() => setShowComments(null)}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="modal-body">
                {blogs.find(b => b._id === showComments)?.comments?.length > 0 ? (
                  blogs.find(b => b._id === showComments)?.comments.map((comment, index) => (
                    <div key={comment.id || index} className="comment-item">
                      <div className="comment-header">
                        <strong>{comment.name}</strong>
                        <span>{comment.email}</span>
                        <small>{new Date(comment.createdAt).toLocaleDateString()}</small>
                      </div>
                      {comment.topic && (
                        <div className="comment-topic">
                          <strong>Topic:</strong> {comment.topic}
                        </div>
                      )}
                      <div className="comment-content">
                        {comment.comment}
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No comments yet.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .admin-content {
          padding: 20px;
        }
        
        .admin-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }
        
        .add-blog-btn {
          width: 250px;
          padding: 10px 15px;
          font-size: 14px;
        }
        
        .admin-form-section {
          background: white;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 30px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .form-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        
        .admin-form .form-group {
          margin-bottom: 15px;
        }
        
        .admin-form label {
          font-weight: 600;
          margin-bottom: 5px;
          display: block;
        }
        
        .form-control {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }
        
        .image-input-group {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        
        .upload-type-selector {
          display: flex;
          gap: 15px;
          align-items: center;
        }
        
        .upload-type-selector label {
          display: flex;
          align-items: center;
          gap: 5px;
          font-weight: normal;
          cursor: pointer;
        }
        
        .upload-type-selector input[type="radio"] {
          margin: 0;
        }
        
        .file-upload-area {
          position: relative;
        }
        
        .file-input {
          position: absolute;
          opacity: 0;
          width: 100%;
          height: 100%;
          cursor: pointer;
        }
        
        .file-upload-label {
          display: block;
          padding: 10px 15px;
          background: #f8f9fa;
          border: 2px dashed #ddd;
          border-radius: 4px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .file-upload-label:hover {
          border-color: var(--color-primary);
          background: #f0f8ff;
        }
        
        .form-actions {
          display: flex;
          gap: 10px;
          margin-top: 20px;
        }
        
        .admin-table-section {
          background: white;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .table-header {
          margin-bottom: 20px;
        }
        
        .admin-table {
          width: 100%;
          border-collapse: collapse;
        }
        
        .admin-table th,
        .admin-table td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #eee;
        }
        
        .admin-table th {
          background: #f8f9fa;
          font-weight: 600;
        }
        
        .blog-title {
          display: flex;
          flex-direction: column;
        }
        
        .blog-title small {
          color: #666;
          font-size: 12px;
        }
        
        .badge {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
        }
        
        .badge-success {
          background: #d4edda;
          color: #155724;
        }
        
        .badge-warning {
          background: #fff3cd;
          color: #856404;
        }
        
        .badge-danger {
          background: #f8d7da;
          color: #721c24;
        }
        
        .badge-secondary {
          background: #e2e3e5;
          color: #383d41;
        }
        
        .action-buttons {
          display: flex;
          gap: 5px;
        }
        
        .btn-sm {
          padding: 5px 10px;
          font-size: 12px;
        }
        
        .comments-modal {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.3);
          width: 90%;
          max-width: 600px;
          max-height: 80vh;
          overflow-y: auto;
          z-index: 1000;
        }
        
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid #eee;
        }
        
        .modal-body {
          padding: 20px;
        }
        
        .comment-item {
          border: 1px solid #eee;
          border-radius: 4px;
          padding: 15px;
          margin-bottom: 15px;
        }
        
        .comment-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }
        
        .comment-topic {
          margin-bottom: 10px;
          font-style: italic;
          color: #666;
        }
        
        .comment-content {
          line-height: 1.5;
        }
        
        .loading-skeleton {
          padding: 20px;
        }
        
        .skeleton-row {
          display: flex;
          gap: 10px;
          margin-bottom: 15px;
        }
        
        .skeleton-cell {
          height: 20px;
          background: #f0f0f0;
          border-radius: 4px;
          flex: 1;
        }
        
        @media (max-width: 768px) {
          .admin-header {
            flex-direction: column;
            gap: 15px;
            align-items: stretch;
          }
          
          .add-blog-btn {
            width: 100%;
          }
          
          .admin-table {
            font-size: 12px;
          }
          
          .admin-table th,
          .admin-table td {
            padding: 8px;
          }
          
          .action-buttons {
            flex-direction: column;
          }
          
          .upload-type-selector {
            flex-direction: column;
            gap: 10px;
          }
        }
      `}</style>
    </AdminLayout>
  );
} 