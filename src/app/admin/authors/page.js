"use client";
import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

export default function AuthorManagementPage() {
  const { hasPermission, user } = useAuth();
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNextPage: false,
    hasPrevPage: false
  });

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    image: '',
    title: '',
    socialLinks: {
      twitter: '',
      linkedin: '',
      website: '',
      github: ''
    },
    isActive: true
  });

  // Image upload states
  const [imageUploadType, setImageUploadType] = useState('url');
  const [uploadingImage, setUploadingImage] = useState(false);

  // Fetch authors
  const fetchAuthors = async (page = 1, search = '') => {
    try {
      setLoading(true);
      
      // Get the current user's ID token for authentication
      if (!user) {
        toast.error('User not authenticated');
        return;
      }
      
      const idToken = await user.getIdToken();
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        search: search
      });

      const response = await fetch(`/api/admin/authors?${params}`, {
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        }
      });
      const result = await response.json();

      if (result.success) {
        setAuthors(result.data.authors);
        setPagination(result.data.pagination);
      } else {
        toast.error('Failed to fetch authors');
      }
    } catch (error) {
      console.error('Error fetching authors:', error);
      toast.error('Failed to fetch authors');
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('socialLinks.')) {
      const socialKey = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        socialLinks: {
          ...prev.socialLinks,
          [socialKey]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  // Handle image upload
  const handleImageUpload = async (file) => {
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);
    formData.append('type', 'author');

    try {
      setUploadingImage(true);
      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setFormData(prev => ({ ...prev, image: result.data.url }));
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
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  // Submit form (create or update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (!user) {
        toast.error('User not authenticated');
        return;
      }
      
      const idToken = await user.getIdToken();
      
      const url = editingAuthor 
        ? `/api/admin/authors/${editingAuthor._id}` 
        : '/api/admin/authors';
      
      const method = editingAuthor ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(editingAuthor ? 'Author updated successfully!' : 'Author created successfully!');
        setShowAddForm(false);
        setEditingAuthor(null);
        resetForm();
        fetchAuthors(pagination.currentPage, searchTerm);
      } else {
        toast.error(result.error || 'Failed to save author');
      }
    } catch (error) {
      console.error('Error saving author:', error);
      toast.error('Failed to save author');
    }
  };

  // Delete author
  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this author?')) return;
    
    try {
      if (!user) {
        toast.error('User not authenticated');
        return;
      }
      
      const idToken = await user.getIdToken();
      
      const response = await fetch(`/api/admin/authors/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Author deleted successfully!');
        fetchAuthors(pagination.currentPage, searchTerm);
      } else {
        toast.error(result.error || 'Failed to delete author');
      }
    } catch (error) {
      console.error('Error deleting author:', error);
      toast.error('Failed to delete author');
    }
  };

  // Edit author
  const handleEdit = (author) => {
    setEditingAuthor(author);
    setFormData({
      name: author.name,
      email: author.email,
      bio: author.bio,
      image: author.image,
      title: author.title,
      socialLinks: author.socialLinks || {
        twitter: '',
        linkedin: '',
        website: '',
        github: ''
      },
      isActive: author.isActive
    });
    setImageUploadType(author.image ? 'url' : 'upload');
    setShowAddForm(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      bio: '',
      image: '',
      title: '',
      socialLinks: {
        twitter: '',
        linkedin: '',
        website: '',
        github: ''
      },
      isActive: true
    });
    setImageUploadType('url');
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    fetchAuthors(1, searchTerm);
  };

  // Handle pagination
  const handlePageChange = (page) => {
    fetchAuthors(page, searchTerm);
  };

  // Initialize data
  useEffect(() => {
    fetchAuthors();
  }, []);

  if (!hasPermission('manage_blog_posts')) {
    return (
      <AdminLayout>
        <div className="admin-content">
          <div className="alert alert-danger">
            You don't have permission to manage authors.
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-content">
        <div className="admin-header">
          <h1>Author Management</h1>
          <button 
            className="btn btn-primary add-author-btn"
            onClick={() => {
              setShowAddForm(true);
              setEditingAuthor(null);
              resetForm();
            }}
          >
            <i className="fas fa-plus"></i> Add New Author
          </button>
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="admin-form-section">
            <div className="form-header">
              <h3>{editingAuthor ? 'Edit Author' : 'Add New Author'}</h3>
              <button 
                className="btn btn-secondary"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingAuthor(null);
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
                    <label>Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="form-control"
                      placeholder="Author's full name"
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
                      onChange={handleInputChange}
                      required
                      className="form-control"
                      placeholder="author@example.com"
                    />
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <div className="form-group">
                    <label>Title</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="form-control"
                      placeholder="e.g., Senior Writer, Content Manager"
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group">
                    <label>Status</label>
                    <select
                      name="isActive"
                      value={formData.isActive}
                      onChange={handleInputChange}
                      className="form-control"
                    >
                      <option value={true}>Active</option>
                      <option value={false}>Inactive</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  className="form-control"
                  rows="4"
                  placeholder="Tell us about this author..."
                />
              </div>

              <div className="form-group">
                <label>Author Image</label>
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
                      placeholder="https://example.com/author-image.jpg"
                    />
                  ) : (
                    <div className="file-upload-area">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="file-input"
                        id="authorImageUpload"
                      />
                      <label htmlFor="authorImageUpload" className="file-upload-label">
                        {uploadingImage ? 'Uploading...' : 'Choose Author Image'}
                      </label>
                    </div>
                  )}
                  
                  {/* Image Preview */}
                  {formData.image && (
                    <div className="image-preview" style={{ marginTop: '10px' }}>
                      <img 
                        src={formData.image} 
                        alt="Preview" 
                        style={{ 
                          width: '100px', 
                          height: '100px', 
                          objectFit: 'cover', 
                          borderRadius: '50%',
                          border: '2px solid #ddd'
                        }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                      <div style={{ marginTop: '5px', fontSize: '12px', color: '#666' }}>
                        Preview
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>Social Links</label>
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>Twitter</label>
                      <input
                        type="url"
                        name="socialLinks.twitter"
                        value={formData.socialLinks.twitter}
                        onChange={handleInputChange}
                        className="form-control"
                        placeholder="https://twitter.com/username"
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>LinkedIn</label>
                      <input
                        type="url"
                        name="socialLinks.linkedin"
                        value={formData.socialLinks.linkedin}
                        onChange={handleInputChange}
                        className="form-control"
                        placeholder="https://linkedin.com/in/username"
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>Website</label>
                      <input
                        type="url"
                        name="socialLinks.website"
                        value={formData.socialLinks.website}
                        onChange={handleInputChange}
                        className="form-control"
                        placeholder="https://author-website.com"
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>GitHub</label>
                      <input
                        type="url"
                        name="socialLinks.github"
                        value={formData.socialLinks.github}
                        onChange={handleInputChange}
                        className="form-control"
                        placeholder="https://github.com/username"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  {editingAuthor ? 'Update Author' : 'Create Author'}
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingAuthor(null);
                    resetForm();
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Authors Table */}
        <div className="admin-table-section">
          <div className="table-header">
            <h3>All Authors ({pagination.totalCount} total)</h3>
            
            {/* Search */}
            <form onSubmit={handleSearch} className="search-form">
              <div className="search-input-group">
                <input
                  type="text"
                  placeholder="Search authors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-control"
                />
                <button type="submit" className="btn btn-primary">
                  <i className="fas fa-search"></i>
                </button>
              </div>
            </form>
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
                    <th>Image</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Title</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {authors.length > 0 ? (
                    authors.map((author) => (
                      <tr key={author._id}>
                        <td>
                          <div className="author-image">
                            {author.image ? (
                              <img 
                                src={author.image} 
                                alt={author.name}
                                onError={(e) => {
                                  e.target.src = '/assets/images/testimonials/01.png';
                                }}
                              />
                            ) : (
                              <div className="no-image">
                                <i className="fas fa-user"></i>
                              </div>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="author-name">
                            <strong>{author.name}</strong>
                            {author.bio && (
                              <small>{author.bio.substring(0, 50)}...</small>
                            )}
                          </div>
                        </td>
                        <td>{author.email}</td>
                        <td>{author.title || 'No title'}</td>
                        <td>
                          <span className={`badge badge-${author.isActive ? 'success' : 'danger'}`}>
                            {author.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>{new Date(author.createdAt).toLocaleDateString()}</td>
                        <td>
                          <div className="action-buttons">
                            <button 
                              className="btn btn-sm btn-primary"
                              onClick={() => handleEdit(author)}
                              title="Edit"
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button 
                              className="btn btn-sm btn-danger"
                              onClick={() => handleDelete(author._id)}
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
                      <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                        <div style={{ fontSize: '16px', marginBottom: '8px' }}>👤</div>
                        <div style={{ fontSize: '14px', fontWeight: '500' }}>No authors found</div>
                        <div style={{ fontSize: '12px', marginTop: '4px' }}>
                          {searchTerm ? 'Try adjusting your search terms.' : 'Create your first author to get started.'}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="pagination-container">
              <div className="pagination-info">
                Showing {((pagination.currentPage - 1) * 20) + 1} to {Math.min(pagination.currentPage * 20, pagination.totalCount)} of {pagination.totalCount} authors
              </div>
              <div className="pagination-buttons">
                <button 
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={!pagination.hasPrevPage}
                  className="btn btn-sm btn-secondary"
                >
                  Previous
                </button>
                <span className="page-info">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
                <button 
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                  className="btn btn-sm btn-secondary"
                >
                  Next
                </button>
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
        
        .add-author-btn {
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
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        
        .search-form {
          display: flex;
          gap: 10px;
        }
        
        .search-input-group {
          display: flex;
          gap: 10px;
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
        
        .author-image {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f8f9fa;
        }
        
        .author-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .no-image {
          color: #999;
          font-size: 20px;
        }
        
        .author-name {
          display: flex;
          flex-direction: column;
        }
        
        .author-name small {
          color: #666;
          font-size: 12px;
          margin-top: 2px;
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
        
        .badge-danger {
          background: #f8d7da;
          color: #721c24;
        }
        
        .action-buttons {
          display: flex;
          gap: 5px;
        }
        
        .btn-sm {
          padding: 5px 10px;
          font-size: 12px;
        }
        
        .pagination-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #eee;
        }
        
        .pagination-buttons {
          display: flex;
          gap: 10px;
          align-items: center;
        }
        
        .page-info {
          font-size: 14px;
          color: #666;
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
          
          .table-header {
            flex-direction: column;
            gap: 15px;
            align-items: stretch;
          }
          
          .search-form {
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
          
          .pagination-container {
            flex-direction: column;
            gap: 15px;
            align-items: stretch;
          }
        }
      `}</style>
    </AdminLayout>
  );
}
