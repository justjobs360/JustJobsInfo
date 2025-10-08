"use client";
import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAuth } from '@/contexts/AuthContext';
import { ADMIN_PERMISSIONS } from '@/utils/userRoleService';
import toast from 'react-hot-toast';

export default function FooterManagementPage() {
  const { hasPermission, isSuperAdmin, user } = useAuth();
  const [footerData, setFooterData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [editingSection, setEditingSection] = useState(null);
  const [editingSocialLink, setEditingSocialLink] = useState(null);
  const [showAddLinkForm, setShowAddLinkForm] = useState(null);
  const [showAddSocialForm, setShowAddSocialForm] = useState(false);

  // Form states
  const [generalForm, setGeneralForm] = useState({
    description: '',
    copyright: '',
    developer_credit: ''
  });

  const [linkForm, setLinkForm] = useState({
    text: '',
    href: '',
    id: ''
  });

  const [socialForm, setSocialForm] = useState({
    name: '',
    icon: '',
    href: '',
    aria_label: ''
  });

  // Helper function to get authenticated headers
  const getAuthHeaders = async () => {
    if (!user) {
      throw new Error('User not authenticated');
    }
    const idToken = await user.getIdToken();
    return {
      'Authorization': `Bearer ${idToken}`,
      'Content-Type': 'application/json'
    };
  };

  useEffect(() => {
    if (!hasPermission(ADMIN_PERMISSIONS.MANAGE_FOOTER) && !isSuperAdmin()) {
      toast.error('You do not have permission to access this page');
      return;
    }
    loadFooterData();
  }, [hasPermission, isSuperAdmin]);

  const loadFooterData = async () => {
    try {
      setLoading(true);
      
      const headers = await getAuthHeaders();
      
      const response = await fetch('/api/admin/footer', {
        headers
      });
      const data = await response.json();
      
      if (data.success) {
        setFooterData(data.data);
        setGeneralForm({
          description: data.data.description || '',
          copyright: data.data.copyright || '',
          developer_credit: data.data.developer_credit || ''
        });
      } else {
        toast.error('Failed to load footer data');
      }
    } catch (error) {
      console.error('Error loading footer data:', error);
      toast.error('Failed to load footer data');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGeneral = async () => {
    try {
      setSaving(true);
      
      const headers = await getAuthHeaders();
      
      const response = await fetch('/api/admin/footer', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          action: 'update_general',
          ...generalForm
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setFooterData(data.data);
        toast.success('Footer general settings updated successfully');
      } else {
        toast.error(data.error || 'Failed to update footer settings');
      }
    } catch (error) {
      console.error('Error updating footer:', error);
      toast.error('Failed to update footer settings');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateSection = async (sectionId, title) => {
    try {
      setSaving(true);
      
      const headers = await getAuthHeaders();
      
      const response = await fetch('/api/admin/footer', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          action: 'update_section',
          sectionId,
          title
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setFooterData(data.data);
        setEditingSection(null);
        toast.success('Section updated successfully');
      } else {
        toast.error(data.error || 'Failed to update section');
      }
    } catch (error) {
      console.error('Error updating section:', error);
      toast.error('Failed to update section');
    } finally {
      setSaving(false);
    }
  };

  const handleAddLink = async (sectionId) => {
    try {
      setSaving(true);
      
      const headers = await getAuthHeaders();
      
      const response = await fetch('/api/admin/footer', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          action: 'add_link',
          sectionId,
          ...linkForm
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setFooterData(data.data);
        setShowAddLinkForm(null);
        setLinkForm({ text: '', href: '', id: '' });
        toast.success('Link added successfully');
      } else {
        toast.error(data.error || 'Failed to add link');
      }
    } catch (error) {
      console.error('Error adding link:', error);
      toast.error('Failed to add link');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveLink = async (sectionId, linkId) => {
    if (!confirm('Are you sure you want to remove this link?')) {
      return;
    }

    try {
      setSaving(true);
      const headers = await getAuthHeaders();
      
      const response = await fetch('/api/admin/footer', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          action: 'remove_link',
          sectionId,
          linkId
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setFooterData(data.data);
        toast.success('Link removed successfully');
      } else {
        toast.error(data.error || 'Failed to remove link');
      }
    } catch (error) {
      console.error('Error removing link:', error);
      toast.error('Failed to remove link');
    } finally {
      setSaving(false);
    }
  };

  const handleAddSocialLink = async () => {
    try {
      setSaving(true);
      const headers = await getAuthHeaders();
      
      const response = await fetch('/api/admin/footer', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          action: 'add_social_link',
          ...socialForm
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setFooterData(data.data);
        setShowAddSocialForm(false);
        setSocialForm({ name: '', icon: '', href: '', aria_label: '' });
        toast.success('Social link added successfully');
      } else {
        toast.error(data.error || 'Failed to add social link');
      }
    } catch (error) {
      console.error('Error adding social link:', error);
      toast.error('Failed to add social link');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveSocialLink = async (socialLinkId) => {
    if (!confirm('Are you sure you want to remove this social link?')) {
      return;
    }

    try {
      setSaving(true);
      const headers = await getAuthHeaders();
      
      const response = await fetch('/api/admin/footer', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          action: 'remove_social_link',
          socialLinkId
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setFooterData(data.data);
        toast.success('Social link removed successfully');
      } else {
        toast.error(data.error || 'Failed to remove social link');
      }
    } catch (error) {
      console.error('Error removing social link:', error);
      toast.error('Failed to remove social link');
    } finally {
      setSaving(false);
    }
  };

  const handleResetToDefaults = async () => {
    if (!confirm('Are you sure you want to reset the footer to default settings? This will overwrite all current settings.')) {
      return;
    }

    try {
      setSaving(true);
      const headers = await getAuthHeaders();
      
      const response = await fetch('/api/admin/footer', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          action: 'reset_to_defaults'
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setFooterData(data.data);
        setGeneralForm({
          description: data.data.description || '',
          copyright: data.data.copyright || '',
          developer_credit: data.data.developer_credit || ''
        });
        toast.success('Footer reset to defaults successfully');
      } else {
        toast.error(data.error || 'Failed to reset footer');
      }
    } catch (error) {
      console.error('Error resetting footer:', error);
      toast.error('Failed to reset footer');
    } finally {
      setSaving(false);
    }
  };

  if (!hasPermission(ADMIN_PERMISSIONS.MANAGE_FOOTER) && !isSuperAdmin()) {
    return (
      <AdminLayout>
        <div className="admin-container">
          <div className="access-denied">
            <h1>Access Denied</h1>
            <p>You do not have permission to access this page.</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="admin-container">
          <div className="loading">Loading footer data...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-container">
        <div className="admin-header">
          <h1>Footer Management</h1>
          <div className="header-actions">
            <button 
              onClick={handleResetToDefaults}
              className="btn btn-secondary"
              disabled={saving}
            >
              Reset to Defaults
            </button>
          </div>
        </div>

        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'general' ? 'active' : ''}`}
            onClick={() => setActiveTab('general')}
          >
            General Settings
          </button>
          <button 
            className={`tab ${activeTab === 'sections' ? 'active' : ''}`}
            onClick={() => setActiveTab('sections')}
          >
            Footer Sections
          </button>
          <button 
            className={`tab ${activeTab === 'social' ? 'active' : ''}`}
            onClick={() => setActiveTab('social')}
          >
            Social Links
          </button>
        </div>

        {/* General Settings Tab */}
        {activeTab === 'general' && (
          <div className="tab-content">
            <div className="form-group">
              <label htmlFor="description">Footer Description</label>
              <textarea
                id="description"
                value={generalForm.description}
                onChange={(e) => setGeneralForm(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                placeholder="Enter footer description..."
              />
            </div>

            <div className="form-group">
              <label htmlFor="copyright">Copyright Text</label>
              <input
                type="text"
                id="copyright"
                value={generalForm.copyright}
                onChange={(e) => setGeneralForm(prev => ({ ...prev, copyright: e.target.value }))}
                placeholder="© 2025 JustJobs. All rights reserved."
              />
            </div>

            <div className="form-group">
              <label htmlFor="developer_credit">Developer Credit HTML</label>
              <textarea
                id="developer_credit"
                value={generalForm.developer_credit}
                onChange={(e) => setGeneralForm(prev => ({ ...prev, developer_credit: e.target.value }))}
                rows={2}
                placeholder="HTML for developer credit..."
              />
            </div>

            <div className="form-actions">
              <button 
                onClick={handleSaveGeneral}
                className="btn btn-primary"
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save General Settings'}
              </button>
            </div>
          </div>
        )}

        {/* Footer Sections Tab */}
        {activeTab === 'sections' && (
          <div className="tab-content">
            {footerData?.sections?.map((section) => (
              <div key={section.id} className="section-card">
                <div className="section-header">
                  {editingSection === section.id ? (
                    <div className="inline-edit">
                      <input
                        type="text"
                        value={section.title}
                        onChange={(e) => {
                          setFooterData(prev => ({
                            ...prev,
                            sections: prev.sections.map(s => 
                              s.id === section.id ? { ...s, title: e.target.value } : s
                            )
                          }));
                        }}
                        onBlur={() => handleUpdateSection(section.id, section.title)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleUpdateSection(section.id, section.title);
                          }
                        }}
                        autoFocus
                      />
                    </div>
                  ) : (
                    <h3 
                      onClick={() => setEditingSection(section.id)}
                      className="editable-title"
                    >
                      {section.title}
                    </h3>
                  )}
                  <button 
                    onClick={() => setShowAddLinkForm(showAddLinkForm === section.id ? null : section.id)}
                    className="btn btn-sm btn-primary"
                  >
                    Add Link
                  </button>
                </div>

                <div className="links-list">
                  {section.links?.map((link) => (
                    <div key={link.id} className="link-item">
                      <div className="link-info">
                        <span className="link-text">{link.text}</span>
                        <span className="link-url">{link.href}</span>
                      </div>
                      <button 
                        onClick={() => handleRemoveLink(section.id, link.id)}
                        className="btn btn-sm btn-danger"
                        disabled={saving}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>

                {showAddLinkForm === section.id && (
                  <div className="add-link-form">
                    <div className="form-row">
                      <input
                        type="text"
                        placeholder="Link Text"
                        value={linkForm.text}
                        onChange={(e) => setLinkForm(prev => ({ ...prev, text: e.target.value }))}
                      />
                      <input
                        type="text"
                        placeholder="Link URL"
                        value={linkForm.href}
                        onChange={(e) => setLinkForm(prev => ({ ...prev, href: e.target.value }))}
                      />
                      <button 
                        onClick={() => handleAddLink(section.id)}
                        className="btn btn-primary"
                        disabled={saving || !linkForm.text || !linkForm.href}
                      >
                        Add Link
                      </button>
                      <button 
                        onClick={() => setShowAddLinkForm(null)}
                        className="btn btn-secondary"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Social Links Tab */}
        {activeTab === 'social' && (
          <div className="tab-content">
            <div className="section-header">
              <h3>Social Media Links</h3>
              <button 
                onClick={() => setShowAddSocialForm(!showAddSocialForm)}
                className="btn btn-primary"
              >
                Add Social Link
              </button>
            </div>

            {showAddSocialForm && (
              <div className="add-social-form">
                <div className="form-row">
                  <input
                    type="text"
                    placeholder="Platform Name (e.g., Facebook)"
                    value={socialForm.name}
                    onChange={(e) => setSocialForm(prev => ({ ...prev, name: e.target.value }))}
                  />
                  <input
                    type="text"
                    placeholder="Icon Class (e.g., fa-brands fa-facebook-f)"
                    value={socialForm.icon}
                    onChange={(e) => setSocialForm(prev => ({ ...prev, icon: e.target.value }))}
                  />
                  <input
                    type="text"
                    placeholder="URL"
                    value={socialForm.href}
                    onChange={(e) => setSocialForm(prev => ({ ...prev, href: e.target.value }))}
                  />
                  <input
                    type="text"
                    placeholder="Aria Label"
                    value={socialForm.aria_label}
                    onChange={(e) => setSocialForm(prev => ({ ...prev, aria_label: e.target.value }))}
                  />
                </div>
                <div className="form-actions">
                  <button 
                    onClick={handleAddSocialLink}
                    className="btn btn-primary"
                    disabled={saving || !socialForm.name || !socialForm.href}
                  >
                    Add Social Link
                  </button>
                  <button 
                    onClick={() => setShowAddSocialForm(false)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="social-links-list">
              {footerData?.social_links?.map((socialLink) => (
                <div key={socialLink.id} className="social-link-item">
                  <div className="social-info">
                    <span className="social-name">{socialLink.name}</span>
                    <span className="social-icon">{socialLink.icon}</span>
                    <span className="social-url">{socialLink.href}</span>
                  </div>
                  <button 
                    onClick={() => handleRemoveSocialLink(socialLink.id)}
                    className="btn btn-sm btn-danger"
                    disabled={saving}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <style jsx>{`
          .admin-container {
            padding: 20px;
            max-width: 1200px;
            margin: 0 auto;
          }

          .admin-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 1px solid #e0e0e0;
          }

          .admin-header h1 {
            margin: 0;
            color: #333;
          }

          .header-actions {
            display: flex;
            gap: 10px;
          }

          .header-actions .btn {
            width: auto;
            min-width: 120px;
          }

          .tabs {
            display: flex;
            border-bottom: 1px solid #e0e0e0;
            margin-bottom: 30px;
          }

          .tab {
            padding: 12px 24px;
            border: none;
            background: none;
            cursor: pointer;
            border-bottom: 2px solid transparent;
            font-size: 16px;
            color: #666;
          }

          .tab.active {
            color: #007bff;
            border-bottom-color: #007bff;
          }

          .tab:hover {
            color: #007bff;
          }

          .tab-content {
            min-height: 400px;
          }

          .form-group {
            margin-bottom: 20px;
          }

          .form-group label {
            display: block;
            margin-bottom: 8px;
            font-weight: 500;
            color: #333;
          }

          .form-group input,
          .form-group textarea {
            width: 100%;
            padding: 12px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 14px;
          }

          .form-group textarea {
            resize: vertical;
          }

          .form-actions {
            margin-top: 30px;
            display: flex;
            justify-content: flex-end;
            gap: 10px;
          }

          .form-actions .btn {
            width: auto;
            min-width: 80px;
          }

          .section-card {
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
            background: #fff;
          }

          .section-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
          }

          .section-header .btn {
            margin-left: auto;
          }

          .section-header h3 {
            margin: 0;
            color: #333;
          }

          .editable-title {
            cursor: pointer;
            padding: 4px 8px;
            border-radius: 4px;
            transition: background-color 0.2s;
          }

          .editable-title:hover {
            background-color: #f5f5f5;
          }

          .inline-edit input {
            font-size: 18px;
            font-weight: 500;
            border: 2px solid #007bff;
            border-radius: 4px;
            padding: 4px 8px;
          }

          .links-list {
            display: flex;
            flex-direction: column;
            gap: 10px;
          }

          .link-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px;
            background: #f8f9fa;
            border-radius: 4px;
          }

          .link-item .btn {
            margin-left: auto;
          }

          .link-info {
            display: flex;
            flex-direction: column;
            gap: 4px;
          }

          .link-text {
            font-weight: 500;
            color: #333;
          }

          .link-url {
            font-size: 12px;
            color: #666;
          }

          .add-link-form,
          .add-social-form {
            margin-top: 15px;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 4px;
          }

          .form-row {
            display: flex;
            gap: 10px;
            margin-bottom: 10px;
          }

          .form-row .btn {
            width: auto;
            min-width: 80px;
          }

          .form-row input {
            flex: 1;
            padding: 8px 12px;
            border: 1px solid #ddd;
            border-radius: 4px;
          }

          .social-links-list {
            margin-top: 20px;
          }

          .social-link-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px;
            background: #f8f9fa;
            border-radius: 4px;
            margin-bottom: 10px;
          }

          .social-link-item .btn {
            margin-left: auto;
          }

          .social-info {
            display: flex;
            gap: 15px;
            align-items: center;
          }

          .social-name {
            font-weight: 500;
            color: #333;
            min-width: 100px;
          }

          .social-icon {
            font-family: monospace;
            background: #e9ecef;
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 12px;
            min-width: 150px;
          }

          .social-url {
            color: #666;
            font-size: 12px;
            max-width: 300px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .btn {
            padding: 6px 12px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
            transition: all 0.2s;
            width: 80px;
            text-align: center;
          }

          .btn-primary {
            background: #007bff;
            color: white;
          }

          .btn-primary:hover:not(:disabled) {
            background: #0056b3;
          }

          .btn-secondary {
            background: #6c757d;
            color: white;
          }

          .btn-secondary:hover:not(:disabled) {
            background: #545b62;
          }

          .btn-danger {
            background: #dc3545;
            color: white;
          }

          .btn-danger:hover:not(:disabled) {
            background: #c82333;
          }

          .btn-sm {
            padding: 4px 8px;
            font-size: 11px;
            width: 70px;
          }

          .btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          .loading {
            text-align: center;
            padding: 40px;
            color: #666;
          }

          .access-denied {
            text-align: center;
            padding: 40px;
            color: #dc3545;
          }

          @media (max-width: 768px) {
            .form-row {
              flex-direction: column;
            }
            
            .section-header {
              flex-direction: column;
              align-items: flex-start;
              gap: 10px;
            }
            
            .social-info {
              flex-direction: column;
              align-items: flex-start;
              gap: 5px;
            }
          }
        `}</style>
      </div>
    </AdminLayout>
  );
}
