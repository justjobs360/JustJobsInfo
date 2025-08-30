"use client"
import { useState, useEffect, useRef } from 'react';
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
  const [statusFilter, setStatusFilter] = useState('all'); // Add status filter state
  
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
    bannerImg: '',
    publishedDate: ''
  });

  // Image upload states
  const [imageUploadType, setImageUploadType] = useState('url'); // 'url' or 'upload'
  const [bannerUploadType, setBannerUploadType] = useState('url');
  const [authorUploadType, setAuthorUploadType] = useState('url');
  const [uploadingImage, setUploadingImage] = useState(false);

  // Editor states
  const [editorMode, setEditorMode] = useState('visual'); // 'visual' or 'html'
  const [editorContent, setEditorContent] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const editorRef = useRef(null);

     // Handle rich text editor content changes
   const handleEditorChange = (e) => {
     if (editorRef.current) {
       const content = e ? e.target.value : editorRef.current.value;
       setEditorContent(content);
       setFormData(prev => ({ ...prev, content }));
     }
   };
   


  // Handle HTML editor content changes
  const handleHtmlChange = (e) => {
    const htmlContent = e.target.value;
    setFormData(prev => ({ ...prev, content: htmlContent }));
    setEditorContent(htmlContent);
  };

     // Toggle editor mode
   const toggleEditorMode = () => {
     setEditorMode(prev => prev === 'visual' ? 'html' : 'visual');
   };
   
   

  // Rich text editor commands for textarea
  const execCommand = (command, value = null) => {
    if (!editorRef.current) return;
    
    const textarea = editorRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    
    let replacement = '';
    
    switch (command) {
      case 'formatBlock':
        if (value === '<h1>') {
          replacement = `\n# ${selectedText}`;
        } else if (value === '<h2>') {
          replacement = `\n## ${selectedText}`;
        } else if (value === '<h3>') {
          replacement = `\n### ${selectedText}`;
        } else if (value === '<p>') {
          replacement = `\n${selectedText}`;
        }
        break;
      case 'bold':
        replacement = `**${selectedText}**`;
        break;
      case 'italic':
        replacement = `*${selectedText}*`;
        break;
      case 'underline':
        replacement = `__${selectedText}__`;
        break;
      case 'strikeThrough':
        replacement = `~~${selectedText}~~`;
        break;
      case 'insertUnorderedList':
        replacement = `\n• ${selectedText}`;
        break;
      case 'insertOrderedList':
        replacement = `\n1. ${selectedText}`;
        break;
      case 'createLink':
        const url = prompt('Enter URL:');
        if (url) {
          replacement = `[${selectedText}](${url})`;
        } else {
          return;
        }
        break;
      case 'justifyLeft':
        replacement = `\n${selectedText}`;
        break;
      case 'justifyCenter':
        replacement = `\n<div style="text-align: center;">${selectedText}</div>`;
        break;
      case 'justifyRight':
        replacement = `\n<div style="text-align: right;">${selectedText}`;
        break;
      case 'indent':
        replacement = `\n  ${selectedText}`;
        break;
      case 'outdent':
        replacement = selectedText.replace(/^\n  /, '\n');
        break;
      case 'backColor':
        replacement = `<span style="background-color: ${value};">${selectedText}</span>`;
        break;
      case 'foreColor':
        replacement = `<span style="color: ${value};">${selectedText}</span>`;
        break;
      default:
        return;
    }
    
    // Replace the selected text
    const newValue = textarea.value.substring(0, start) + replacement + textarea.value.substring(end);
    textarea.value = newValue;
    
    // Update state
    setEditorContent(newValue);
    setFormData(prev => ({ ...prev, content: newValue }));
    
    // Set cursor position after the inserted content
    const newCursorPos = start + replacement.length;
    textarea.setSelectionRange(newCursorPos, newCursorPos);
    
    textarea.focus();
  };

     // Insert HTML at cursor position
   const insertHTML = (html) => {
     if (!editorRef.current) return;
     
     const textarea = editorRef.current;
     const start = textarea.selectionStart;
     const end = textarea.selectionEnd;
     
     // Insert HTML at cursor position
     const newValue = textarea.value.substring(0, start) + html + textarea.value.substring(end);
     textarea.value = newValue;
     
     // Update state
     setEditorContent(newValue);
     setFormData(prev => ({ ...prev, content: newValue }));
     
     // Set cursor position after the inserted HTML
     const newCursorPos = start + html.length;
     textarea.setSelectionRange(newCursorPos, newCursorPos);
     
     textarea.focus();
   };
   
   // Insert image at cursor position
   const insertImage = () => {
     const imageUrl = prompt('Enter image URL:');
     if (imageUrl) {
       const imageHTML = `<img src="${imageUrl}" alt="Blog image" style="max-width: 100%; height: auto; margin: 15px 0;" />`;
       insertHTML(imageHTML);
     }
   };

  // Fetch all blogs
  const fetchBlogs = async () => {
    try {
      setLoading(true);
      // Fetch all blogs regardless of status by passing 'all' status parameter
      const response = await fetch('/api/blogs?limit=1000&status=all');
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
    
    // Format publishedDate for datetime-local input
    let formattedDate = '';
    if (blog.publishedDate) {
      const date = new Date(blog.publishedDate);
      // Format as YYYY-MM-DDTHH:mm for datetime-local input
      formattedDate = date.toISOString().slice(0, 16);
    }
    
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
      bannerImg: blog.bannerImg,
      publishedDate: formattedDate
    });
    setEditorContent(blog.content); // Set editor content for editing
    setEditorMode('visual'); // Set editor to visual mode for editing
    setShowPreview(false); // Reset preview mode when editing
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
      bannerImg: '',
      publishedDate: ''
    });
    setEditorContent(''); // Reset editor content
    setEditorMode('visual'); // Reset editor mode
    setShowPreview(false); // Reset preview mode
    setImageUploadType('url');
    setBannerUploadType('url');
    setAuthorUploadType('url');
  };

  // Filter blogs based on status
  const getFilteredBlogs = () => {
    if (statusFilter === 'all') {
      return blogs;
    }
    return blogs.filter(blog => blog.status === statusFilter);
  };

  // Get status counts
  const getStatusCounts = () => {
    const counts = {
      all: blogs.length,
      published: blogs.filter(blog => blog.status === 'published').length,
      draft: blogs.filter(blog => blog.status === 'draft').length,
      archived: blogs.filter(blog => blog.status === 'archived').length
    };
    return counts;
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
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
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
            
            {/* Quick Links */}
            <a 
              href="/admin/seo/meta-tags"
              style={{
                padding: '8px 16px',
                backgroundColor: 'var(--color-primary)',
                color: '#fff',
                textDecoration: 'none',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: '500',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              🏷️ Manage Meta Tags
            </a>
          </div>
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
                <div className="col-md-4">
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
                <div className="col-md-4">
                  <div className="form-group">
                    <label>Published Date</label>
                    <input
                      type="datetime-local"
                      name="publishedDate"
                      value={formData.publishedDate}
                      onChange={handleInputChange}
                      className="form-control"
                    />
                  </div>
                </div>
                <div className="col-md-4">
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
                <div className="editor-toggle-container">
                  <button 
                    className="rts-btn btn-primary"
                    onClick={toggleEditorMode}
                    style={{ marginBottom: '15px' }}
                  >
                    {editorMode === 'visual' ? '🖊️ Visual Editor' : '📝 HTML Editor'}
                  </button>
                  
                  {editorMode === 'visual' ? (
                    <div className="rich-text-editor">
                      {/* Toolbar */}
                      <div className="editor-toolbar">
                        <div className="toolbar-group">
                          <button
                            type="button"
                            onClick={() => execCommand('formatBlock', '<h1>')}
                            className="rts-btn btn-border"
                            title="Heading 1"
                          >
                            H1
                          </button>
                          <button
                            type="button"
                            onClick={() => execCommand('formatBlock', '<h2>')}
                            className="rts-btn btn-border"
                            title="Heading 2"
                          >
                            H2
                          </button>
                          <button
                            type="button"
                            onClick={() => execCommand('formatBlock', '<h3>')}
                            className="rts-btn btn-border"
                            title="Heading 3"
                          >
                            H3
                          </button>
                          <button
                            type="button"
                            onClick={() => execCommand('formatBlock', '<p>')}
                            className="rts-btn btn-border"
                            title="Paragraph"
                          >
                            P
                          </button>
                        </div>
                        
                        <div className="toolbar-group">
                          <button
                            type="button"
                            onClick={() => execCommand('bold')}
                            className="rts-btn btn-border"
                            title="Bold"
                          >
                            <strong>B</strong>
                          </button>
                          <button
                            type="button"
                            onClick={() => execCommand('italic')}
                            className="rts-btn btn-border"
                            title="Italic"
                          >
                            <em>I</em>
                          </button>
                          <button
                            type="button"
                            onClick={() => execCommand('underline')}
                            className="rts-btn btn-border"
                            title="Underline"
                          >
                            <u>U</u>
                          </button>
                          <button
                            type="button"
                            onClick={() => execCommand('strikeThrough')}
                            className="rts-btn btn-border"
                            title="Strikethrough"
                          >
                            <s>S</s>
                          </button>
                        </div>
                        
                                                 <div className="toolbar-group">
                           <button
                             type="button"
                             onClick={() => execCommand('insertUnorderedList')}
                             className="rts-btn btn-border"
                             title="Bullet List"
                           >
                             • List
                           </button>
                           <button
                             type="button"
                             onClick={() => execCommand('insertOrderedList')}
                             className="rts-btn btn-border"
                             title="Numbered List"
                           >
                             1. List
                           </button>
                           <button
                             type="button"
                             onClick={() => execCommand('createLink')}
                             className="rts-btn btn-border"
                             title="Create Link"
                           >
                             🔗 Link
                           </button>
                           <button
                             type="button"
                             onClick={() => insertHTML('<blockquote>Quote text here</blockquote>')}
                             className="rts-btn btn-border"
                             title="Blockquote"
                           >
                             Quote
                           </button>
                           <button
                             type="button"
                             onClick={insertImage}
                             className="rts-btn btn-border"
                             title="Insert Image"
                           >
                             🖼️ Image
                           </button>
                           <button
                             type="button"
                             onClick={() => insertHTML('<hr>')}
                             className="rts-btn btn-border"
                             title="Horizontal Rule"
                           >
                             ➖ HR
                           </button>
                           <button
                             type="button"
                             onClick={() => {
                               const textarea = editorRef.current;
                               if (textarea) {
                                 const start = textarea.selectionStart;
                                 const end = textarea.selectionEnd;
                                 const selectedText = textarea.value.substring(start, end);
                                 // Remove common markdown formatting
                                 const cleanText = selectedText
                                   .replace(/\*\*(.*?)\*\*/g, '$1') // Bold
                                   .replace(/\*(.*?)\*/g, '$1') // Italic
                                   .replace(/__(.*?)__/g, '$1') // Underline
                                   .replace(/~~(.*?)~~/g, '$1') // Strikethrough
                                   .replace(/^#+\s*/gm, '') // Headings
                                   .replace(/^[•\-\d\.]\s*/gm, '') // Lists
                                   .replace(/^>\s*/gm, ''); // Blockquotes
                                 
                                 const newValue = textarea.value.substring(0, start) + cleanText + textarea.value.substring(end);
                                 textarea.value = newValue;
                                 setEditorContent(newValue);
                                 setFormData(prev => ({ ...prev, content: newValue }));
                                 
                                 // Set cursor position
                                 const newCursorPos = start + cleanText.length;
                                 textarea.setSelectionRange(newCursorPos, newCursorPos);
                                 textarea.focus();
                               }
                             }}
                             className="rts-btn btn-border"
                             title="Clear Formatting"
                           >
                             🧹 Clear
                           </button>
                           <button
                             type="button"
                             onClick={() => {
                               // Toggle preview mode
                               setShowPreview(prev => !prev);
                             }}
                             className="rts-btn btn-primary"
                             title="Toggle Preview"
                           >
                             👁️ {showPreview ? 'Hide' : 'Show'} Preview
                           </button>
                         </div>
                        
                                                 <div className="toolbar-group">
                           <button
                             type="button"
                             onClick={() => insertHTML('<hr>')}
                             className="rts-btn btn-border"
                             title="Horizontal Line"
                           >
                             ──
                           </button>
                           <button
                             type="button"
                             onClick={() => insertHTML('<br>')}
                             className="rts-btn btn-border"
                             title="Line Break"
                           >
                             ↵
                           </button>
                           <button
                             type="button"
                             onClick={() => execCommand('removeFormat')}
                             className="rts-btn btn-border"
                             title="Clear Formatting"
                           >
                             Clear
                           </button>
                         </div>
                         
                         <div className="toolbar-group">
                           <button
                             type="button"
                             onClick={() => insertImage()}
                             className="rts-btn btn-border"
                             title="Insert Image"
                           >
                             🖼️ Image
                           </button>
                           <button
                             type="button"
                             onClick={() => insertHTML('<div class="two-column-layout"><div class="column">Column 1 content here</div><div class="column">Column 2 content here</div></div>')}
                             className="rts-btn btn-border"
                             title="2 Column Layout"
                           >
                             2️⃣ Col
                           </button>
                           <button
                             type="button"
                             onClick={() => insertHTML('<div class="three-column-layout"><div class="column">Column 1 content here</div><div class="column">Column 2 content here</div><div class="column">Column 3 content here</div></div>')}
                             className="rts-btn btn-border"
                             title="3 Column Layout"
                           >
                             3️⃣ Col
                           </button>
                         </div>
                         
                         <div className="toolbar-group">
                           <button
                             type="button"
                             onClick={() => execCommand('justifyLeft')}
                             className="rts-btn btn-border"
                             title="Align Left"
                           >
                             ⬅️ Left
                           </button>
                           <button
                             type="button"
                             onClick={() => execCommand('justifyCenter')}
                             className="rts-btn btn-border"
                             title="Align Center"
                           >
                             ↔️ Center
                           </button>
                           <button
                             type="button"
                             onClick={() => execCommand('justifyRight')}
                             className="rts-btn btn-border"
                             title="Align Right"
                           >
                             ➡️ Right
                           </button>
                         </div>
                         
                         <div className="toolbar-group">
                           <button
                             type="button"
                             onClick={() => execCommand('indent')}
                             className="rts-btn btn-border"
                             title="Indent"
                           >
                             ➡️ Indent
                           </button>
                           <button
                             type="button"
                             onClick={() => execCommand('outdent')}
                             className="rts-btn btn-border"
                             title="Outdent"
                           >
                             ⬅️ Outdent
                           </button>
                           <button
                             type="button"
                             onClick={() => insertHTML('<div style="background: #f0f0f0; padding: 15px; border-radius: 8px; border-left: 4px solid var(--color-primary);">Highlighted content here</div>')}
                             className="rts-btn btn-border"
                             title="Highlight Box"
                           >
                             💡 Highlight
                           </button>
                         </div>
                         
                         <div className="toolbar-group">
                           <input
                             type="color"
                             onChange={(e) => execCommand('foreColor', e.target.value)}
                             className="color-picker"
                             title="Text Color"
                           />
                           <button
                             type="button"
                             onClick={() => execCommand('foreColor', '#000000')}
                             className="rts-btn btn-border"
                             title="Default Color"
                           >
                             🎨 Default
                           </button>
                           <button
                             type="button"
                             onClick={() => execCommand('backColor', '#ffff00')}
                             className="rts-btn btn-border"
                             title="Highlight Text"
                           >
                             🟡 Highlight
                           </button>
                         </div>
                      </div>
                      
                                             {/* Visual Editor - Using textarea to avoid mirroring issues */}
                      <textarea
                        ref={editorRef}
                        value={editorContent}
                        onChange={handleEditorChange}
                        className="form-control editor-content"
                        rows="15"
                        placeholder="Type your content here... Use the toolbar buttons above to format your text."
                        style={{
                          direction: 'ltr',
                          textAlign: 'left',
                          unicodeBidi: 'normal',
                          writingMode: 'horizontal-tb',
                          fontFamily: 'var(--font-primary)',
                          fontSize: 'var(--font-size-b1)',
                          lineHeight: 'var(--line-height-b1)',
                          color: 'var(--color-body)',
                          backgroundColor: 'var(--color-white)',
                          border: '1px solid var(--color-border)',
                          borderRadius: 'var(--radius)',
                          padding: '20px',
                          resize: 'vertical',
                          minHeight: '400px'
                        }}
                      />
                      
                      {/* Preview Mode */}
                      {showPreview && (
                        <div style={{ 
                          marginTop: '20px', 
                          padding: '20px', 
                          border: '1px solid var(--color-border)', 
                          borderRadius: 'var(--radius)',
                          backgroundColor: '#f8f9fa'
                        }}>
                          <h5 style={{ marginBottom: '15px', color: '#333' }}>Preview:</h5>
                          <div 
                            dangerouslySetInnerHTML={{ 
                              __html: editorContent
                                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
                                .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic
                                .replace(/__(.*?)__/g, '<u>$1</u>') // Underline
                                .replace(/~~(.*?)~~/g, '<s>$1</s>') // Strikethrough
                                .replace(/^# (.*$)/gm, '<h1>$1</h1>') // H1
                                .replace(/^## (.*$)/gm, '<h2>$1</h2>') // H2
                                .replace(/^### (.*$)/gm, '<h3>$1</h3>') // H3
                                .replace(/^• (.*$)/gm, '<li>$1</li>') // Bullet list
                                .replace(/^1\. (.*$)/gm, '<li>$1</li>') // Numbered list
                                .replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>') // Blockquote
                                .replace(/\n/g, '<br>') // Line breaks
                            }}
                            style={{
                              fontFamily: 'var(--font-primary)',
                              fontSize: 'var(--font-size-b1)',
                              lineHeight: 'var(--line-height-b1)',
                              color: 'var(--color-body)'
                            }}
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <textarea
                      name="content"
                      value={editorContent}
                      onChange={handleHtmlChange}
                      className="form-control"
                      rows="10"
                      placeholder="<p>Your HTML content here...</p>"
                    />
                  )}
                </div>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3>All Blogs ({getFilteredBlogs().length} of {blogs.length} total)</h3>
              
              {/* Status Filter */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', fontWeight: '500' }}>Filter by Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{
                    padding: '6px 12px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  <option value="all">All ({getStatusCounts().all})</option>
                  <option value="published">Published ({getStatusCounts().published})</option>
                  <option value="draft">Draft ({getStatusCounts().draft})</option>
                  <option value="archived">Archived ({getStatusCounts().archived})</option>
                </select>
              </div>
            </div>
            
                         {/* Status Summary */}
             <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', alignItems: 'center' }}>
               <span style={{ 
                 fontSize: '12px', 
                 padding: '4px 8px', 
                 borderRadius: '12px',
                 backgroundColor: '#d4edda',
                 color: '#155724'
               }}>
                 📰 Published: {getStatusCounts().published}
               </span>
               <span style={{ 
                 fontSize: '12px', 
                 padding: '4px 8px', 
                 borderRadius: '12px',
                 backgroundColor: '#fff3cd',
                 color: '#856404'
               }}>
                 📝 Draft: {getStatusCounts().draft}
               </span>
               <span style={{ 
                 fontSize: '12px', 
                 padding: '4px 8px', 
                 borderRadius: '12px',
                 backgroundColor: '#f8d7da',
                 color: '#721c24'
               }}>
                 📁 Archived: {getStatusCounts().archived}
               </span>
               
               {/* Show All Button when filter is active */}
               {statusFilter !== 'all' && (
                 <button
                   onClick={() => setStatusFilter('all')}
                   style={{
                     padding: '4px 8px',
                     backgroundColor: 'var(--color-primary)',
                     color: '#fff',
                     border: 'none',
                     borderRadius: '12px',
                     fontSize: '12px',
                     cursor: 'pointer',
                     marginLeft: '8px'
                   }}
                 >
                   👁️ Show All
                 </button>
               )}
             </div>
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
                    <th>Published</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                                                  <tbody>
                   {getFilteredBlogs().length > 0 ? (
                     getFilteredBlogs().map((blog) => (
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
                         <td>{blog.publishedDate ? new Date(blog.publishedDate).toLocaleDateString() : 'No date set'}</td>
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
                     ))
                   ) : (
                     <tr>
                       <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                         <div style={{ fontSize: '16px', marginBottom: '8px' }}>
                           {statusFilter === 'all' ? '📝' : statusFilter === 'published' ? '📰' : statusFilter === 'draft' ? '📝' : '📁'}
                         </div>
                         <div style={{ fontSize: '14px', fontWeight: '500' }}>
                           {statusFilter === 'all' 
                             ? 'No blogs found' 
                             : `No ${statusFilter} blogs found`
                           }
                         </div>
                         <div style={{ fontSize: '12px', marginTop: '4px' }}>
                           {statusFilter !== 'all' && 'Try changing the status filter or create a new blog.'}
                         </div>
                       </td>
                     </tr>
                   )}
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
        
        .editor-toggle-container {
          position: relative;
          border: 1px solid var(--color-border);
          border-radius: var(--radius);
          margin-top: 10px;
          padding: 20px;
          background: var(--color-white);
        }

        /* Rich Text Editor Styles */
        .rich-text-editor {
          border: 1px solid var(--color-border);
          border-radius: var(--radius);
          overflow: hidden;
        }

        .editor-toolbar {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          padding: 20px;
          background: var(--color-white);
          border-bottom: 1px solid var(--color-border);
        }

        .toolbar-group {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        /* Use your existing button styles */
        .editor-toolbar .rts-btn {
          height: 40px;
          padding: 8px 16px;
          font-size: 14px;
          font-weight: var(--p-medium);
          min-width: 50px;
          text-align: center;
        }

                 .editor-content {
           min-height: 300px;
           padding: 20px;
           font-size: var(--font-size-b1);
           line-height: var(--line-height-b1);
           color: var(--color-body);
           background: var(--color-white);
           cursor: text;
           overflow-y: auto;
           outline: none;
           font-family: var(--font-primary);
           direction: ltr;
           text-align: left;
           unicode-bidi: normal;
         }

                 .editor-content:focus {
           background: #fafafa;
         }
         
         /* Ensure proper text direction and prevent mirroring */
         .editor-content * {
           direction: ltr !important;
           text-align: left !important;
           unicode-bidi: normal !important;
           writing-mode: horizontal-tb !important;
         }
         
         .editor-content p {
           direction: ltr !important;
           text-align: left !important;
           writing-mode: horizontal-tb !important;
         }
         
         .editor-content div {
           direction: ltr !important;
           text-align: left !important;
           writing-mode: horizontal-tb !important;
         }
         
         /* Force left-to-right for all text content */
         .editor-content span,
         .editor-content strong,
         .editor-content em,
         .editor-content u,
         .editor-content s,
         .editor-content h1,
         .editor-content h2,
         .editor-content h3,
         .editor-content h4,
         .editor-content h5,
         .editor-content h6,
         .editor-content li,
         .editor-content blockquote {
           direction: ltr !important;
           text-align: left !important;
           unicode-bidi: normal !important;
           writing-mode: horizontal-tb !important;
         }
         
         /* Override any inherited RTL styles */
         .editor-content {
           direction: ltr !important;
           text-align: left !important;
           unicode-bidi: normal !important;
           writing-mode: horizontal-tb !important;
           text-orientation: mixed !important;
         }
         
         /* Force all content within the editor to be left-to-right */
         .editor-content[contenteditable="true"] {
           direction: ltr !important;
           text-align: left !important;
           unicode-bidi: normal !important;
           writing-mode: horizontal-tb !important;
           text-orientation: mixed !important;
         }
         
         /* Ensure the editor container itself has proper direction */
         .rich-text-editor {
           direction: ltr !important;
           text-align: left !important;
         }
         
         /* Force all child elements to inherit left-to-right direction */
         .rich-text-editor * {
           direction: ltr !important;
           text-align: left !important;
           unicode-bidi: normal !important;
           writing-mode: horizontal-tb !important;
         }
         
         /* Target the actual editable content more specifically */
         .editor-content[contenteditable="true"] * {
           direction: ltr !important;
           text-align: left !important;
           unicode-bidi: normal !important;
           writing-mode: horizontal-tb !important;
           text-orientation: mixed !important;
         }
         
         /* Override any browser default contentEditable styles */
         [contenteditable="true"] {
           direction: ltr !important;
           text-align: left !important;
           unicode-bidi: normal !important;
           writing-mode: horizontal-tb !important;
         }
         
         /* Force text input direction */
         .editor-content[contenteditable="true"]:focus {
           direction: ltr !important;
           text-align: left !important;
           unicode-bidi: normal !important;
           writing-mode: horizontal-tb !important;
         }
         
         /* Additional aggressive RTL prevention */
         .editor-content[contenteditable="true"]::before,
         .editor-content[contenteditable="true"]::after {
           direction: ltr !important;
           unicode-bidi: normal !important;
         }
         
         /* Force input direction for all text nodes */
         .editor-content[contenteditable="true"] {
           text-align: left !important;
           text-align-last: left !important;
           text-justify: auto !important;
         }

        /* Use your existing typography classes */
        .editor-content h1 {
          font-size: var(--h1);
          font-weight: var(--p-bold);
          margin: 30px 0 15px 0;
          color: var(--color-heading-1);
          line-height: 1.3;
        }

        .editor-content h2 {
          font-size: var(--h2);
          font-weight: var(--p-bold);
          margin: 25px 0 12px 0;
          color: var(--color-heading-1);
          line-height: 1.1;
        }

        .editor-content h3 {
          font-size: var(--h3);
          font-weight: var(--p-bold);
          margin: 20px 0 10px 0;
          color: var(--color-heading-1);
          line-height: 1.2;
        }

        .editor-content p {
          font-size: var(--font-size-b1);
          line-height: var(--line-height-b1);
          margin: 15px 0;
          color: var(--color-body);
          font-weight: var(--p-regular);
        }

        .editor-content ul, .editor-content ol {
          margin: 15px 0;
          padding-left: 30px;
        }

        .editor-content li {
          font-size: var(--font-size-b1);
          line-height: var(--line-height-b1);
          margin: 8px 0;
          color: var(--color-body);
        }

        .editor-content blockquote {
          margin: 20px 0;
          padding: 15px 25px;
          border-left: 4px solid var(--color-primary);
          background: #f8f9fa;
          font-style: italic;
          color: var(--color-body);
          font-size: var(--font-size-b1);
          line-height: var(--line-height-b1);
        }

                 .editor-content hr {
           margin: 25px 0;
           border: none;
           border-top: 2px solid var(--color-border);
         }
         
         /* Layout Options */
         .editor-content .two-column-layout {
           display: grid;
           grid-template-columns: 1fr 1fr;
           gap: 20px;
           margin: 20px 0;
         }
         
         .editor-content .three-column-layout {
           display: grid;
           grid-template-columns: 1fr 1fr 1fr;
           gap: 20px;
           margin: 20px 0;
         }
         
         .editor-content .column {
           padding: 15px;
           border: 1px solid var(--color-border);
           border-radius: var(--radius);
           background: #f8f9fa;
         }
         
         /* Image Styles */
         .editor-content img {
           max-width: 100%;
           height: auto;
           border-radius: var(--radius);
           box-shadow: 0 2px 8px rgba(0,0,0,0.1);
         }
         
         /* Color Picker */
         .color-picker {
           width: 40px;
           height: 40px;
           border: 2px solid var(--color-border);
           border-radius: var(--radius);
           cursor: pointer;
           background: none;
           padding: 0;
         }
         
         .color-picker::-webkit-color-swatch-wrapper {
           padding: 0;
         }
         
         .color-picker::-webkit-color-swatch {
           border: none;
           border-radius: var(--radius);
         }
         
         /* New Design Options */
         .editor-content .highlight-box {
           background: #f0f0f0;
           padding: 15px;
           border-radius: 8px;
           border-left: 4px solid var(--color-primary);
           margin: 15px 0;
         }
         
         .editor-content .text-highlight {
           background: #ffff00;
           padding: 2px 4px;
           border-radius: 3px;
         }
         
         .editor-content .indented {
           margin-left: 20px;
           padding-left: 15px;
           border-left: 2px solid var(--color-border);
         }
         
         .editor-content .centered {
           text-align: center;
         }
         
         .editor-content .right-aligned {
           text-align: right;
         }
        
         @media (max-width: 768px) {
           .editor-toolbar {
             flex-direction: column;
             gap: 8px;
             padding: 15px;
           }
           
           .toolbar-group {
             justify-content: center;
           }
           
           .editor-toolbar .rts-btn {
             padding: 10px 18px;
             font-size: 14px;
             min-width: 60px;
           }
           
           .editor-content {
             min-height: 250px;
             padding: 15px;
             font-size: var(--font-size-b1);
           }
           
           .editor-content h1 {
             font-size: 34px;
           }
           
           .editor-content h2 {
             font-size: 28px;
           }
           
                       .editor-content h3 {
              font-size: 24px;
            }
            
            /* Mobile Layout Adjustments */
            .editor-content .two-column-layout,
            .editor-content .three-column-layout {
              grid-template-columns: 1fr;
              gap: 15px;
            }
            
            .editor-content .column {
              padding: 12px;
            }
            
            .color-picker {
              width: 35px;
              height: 35px;
            }
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