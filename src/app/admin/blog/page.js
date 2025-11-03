"use client"
import { useState, useEffect, useRef } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAuth } from '@/contexts/AuthContext';
import { ADMIN_PERMISSIONS } from '@/utils/userRoleService';
import toast from 'react-hot-toast';

export default function BlogManagementPage() {
  const { hasPermission, user } = useAuth();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tags, setTags] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [showComments, setShowComments] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all'); // Add status filter state
  const [categoryFilter, setCategoryFilter] = useState('all'); // Add category filter state
  
  // Form states
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    content: '',
    category: '',
    tags: [],
    status: 'published',
    featured: false,
    author: '',
    authorId: '',
    authorBio: '',
    authorRole: '',
    image: '',
    bannerImg: '',
    publishedDate: ''
  });

  // Image upload states
  const [imageUploadType, setImageUploadType] = useState('url'); // 'url' or 'upload'
  const [bannerUploadType, setBannerUploadType] = useState('url');
  const [uploadingImage, setUploadingImage] = useState(false);
  
  // Tags input state (raw string for input field)
  const [tagsInput, setTagsInput] = useState('');

  // Editor states
  const [editorMode, setEditorMode] = useState('visual'); // 'visual', 'html', or 'template'
  const [editorContent, setEditorContent] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const editorRef = useRef(null);

  // Image insertion states
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageInsertionType, setImageInsertionType] = useState('url'); // 'url' or 'upload'
  const [imageUrl, setImageUrl] = useState('');
  const [uploadingContentImage, setUploadingContentImage] = useState(false);
  const contentImageFileRef = useRef(null);

  // Template form states
  const [templateData, setTemplateData] = useState({
    mainTitle: '',
    paragraph1: '',
    paragraph2: '',
    quoteText: '',
    quoteAuthor: '',
    quoteAuthorTitle: '',
    paragraph3: '',
    image1: '',
    image2: '',
    sectionTitle: '',
    paragraph4: '',
    image3: '',
    bulletPoints: ['', '', '', '', ''],
    paragraph5: '',
    tags: ['', '', ''],
    authorName: '',
    authorTitle: '',
    authorDescription: '',
    authorImage: ''
  });

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

     // Set editor mode
   const setEditorModeDirect = (mode) => {
     setEditorMode(mode);
   };

  // Handle template data changes
  const handleTemplateChange = (field, value) => {
    setTemplateData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle bullet points changes
  const handleBulletPointChange = (index, value) => {
    setTemplateData(prev => ({
      ...prev,
      bulletPoints: prev.bulletPoints.map((point, i) => i === index ? value : point)
    }));
  };

  // Handle tags changes
  const handleTagChange = (index, value) => {
    setTemplateData(prev => ({
      ...prev,
      tags: prev.tags.map((tag, i) => i === index ? value : tag)
    }));
  };

  // Generate HTML from template data
  const generateTemplateHTML = () => {
    const { 
      mainTitle, paragraph1, paragraph2, quoteText, quoteAuthor, quoteAuthorTitle,
      paragraph3, image1, image2, sectionTitle, paragraph4, image3, 
      bulletPoints, paragraph5, tags, authorName, authorTitle, authorDescription, authorImage
    } = templateData;

    return `
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
        <div className="blog-single-post-listing details mb--0">
          <div className="thumbnail">
            <img src={blogPost.bannerImg} alt={blogPost.title} />
          </div>
          <div className="blog-listing-content">
            <div className="user-info">
              <div className="single">
                <i className="far fa-user-circle" />
                <span>by David Smith</span>
              </div>
              <div className="single">
                <i className="far fa-clock" />
                <span>by David Smith</span>
              </div>
              <div className="single">
                <i className="far fa-tags" />
                <span>by David Smith</span>
              </div>
            </div>
            <h3 className="title animated fadeIn">
              ${mainTitle || 'Building smart business solution for you'}
            </h3>
            <p className="disc para-1">
              ${paragraph1 || 'Collaboratively pontificate bleeding edge resources with inexpensive methodologies globally initiate multidisciplinary compatible architectures pidiously repurpose leading edge growth strategies with just in time web readiness communicate timely meta services'}
            </p>
            <p className="disc">
              ${paragraph2 || 'Onubia semper vel donec torquent fusce mauris felis aptent lacinia nisl, lectus himenaeos euismod molestie iaculis interdum in laoreet condimentum dictum, quisque quam risus sollicitudin gravida ut odio per a et. Gravida maecenas lobortis suscipit mus sociosqu convallis, mollis vestibulum donec aliquam risus sapien ridiculus, nulla sollicitudin eget in venenatis. Tortor montes platea iaculis posuere per mauris, eros porta blandit curabitur ullamcorper varius'}
            </p>
            <div className="rts-quote-area text-center">
              <h5 className="title">
                "${quoteText || 'Placerat pretium tristique mattis tellus accuan metus dictumst vivamus odio nulla fusce auctor into suscipit habitasse class congue potenti iaculis'}"
              </h5>
              <a href="#" className="name">
                ${quoteAuthor || 'Daniel X. Horrar'}
              </a>
              <span>${quoteAuthorTitle || 'Author'}</span>
            </div>
            <p className="disc">
              ${paragraph3 || 'Ultrices iaculis commodo parturient euismod pulvinar donec cum eget a, accumsan viverra cras praesent cubilia dignissim ad rhoncus. Gravida maecenas lobortis suscipit mus sociosqu convallis, mollis vestibulum donec aliquam risus sapien ridiculus, nulla sollicitudin eget in venenatis. Tortor montes platea iaculis posuere per mauris, eros porta blandit curabitur ullamcorper varius, nostra ante risus egestas suscipit. Quisque interdum nec parturient facilisis nunc ac quam, ad est cubilia mauris himenaeos nascetur vestibulum.'}
            </p>
            <div className="row g-5">
              <div className="col-lg-6 col-md-6">
                <div className="thumbnail details">
                  <img src="${image1 || '/assets/images/blog/d-lg-01.jpg'}" alt="elevae construction" />
                </div>
              </div>
              <div className="col-lg-6 col-md-6">
                <div className="thumbnail details">
                  <img src="${image2 || '/assets/images/blog/d-lg-02.jpg'}" alt="elevae construction" />
                </div>
              </div>
            </div>
            <h4 className="title mt--40 mt_sm--20">
              ${sectionTitle || 'Ultimate Business Strategy Solution'}
            </h4>
            <p className="disc mb--25">
              ${paragraph4 || 'Gravida maecenas lobortis suscipit mus sociosqu convallis, mollis vestibulum donec aliquam risus sapien ridiculus, nulla sollicitudin eget in venenatis. Tortor montes platea iaculis posuere per mauris, eros porta blandit curabitur ullamcorper varius nostra ante risus egestas.'}
            </p>
            <div className="row align-items-center">
              <div className="col-lg-5">
                <div className="thumbnail details mb_sm--15">
                  <img src="${image3 || '/assets/images/blog/details/03.jpg'}" alt="elevate" />
                </div>
              </div>
              <div className="col-lg-7">
                <div className="check-area-details">
                  ${bulletPoints.filter(point => point.trim()).map(point => `
                    <div className="single-check">
                      <i className="far fa-check-circle" />
                      <span>${point}</span>
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>
            <p className="disc mt--30">
              ${paragraph5 || 'Cubilia hendrerit luctus sem aptent curae gravida maecenas eleifend nunc nec vitae morbi sodales fusce tristique aenean habitasse mattis sociis feugiat conubia mus auctor praesent urna tincidunt taciti dui lobortis nullam. Mattis placerat feugiat ridiculus sed a per curae fermentum aenean facilisi, vitae urna imperdiet ac mauris non inceptos luctus hac odio.'}
            </p>
            <div className="row align-items-center">
              <div className="col-lg-6 col-md-12">
                <div className="details-tag">
                  <h6>Tags:</h6>
                  ${tags.filter(tag => tag.trim()).map(tag => `<button>${tag}</button>`).join('')}
                </div>
              </div>
              <div className="col-lg-6 col-md-12">
                <div className="details-share">
                  <h6>Share:</h6>
                  <button><i className="fab fa-facebook-f" /></button>
                  <button><i className="fab fa-twitter" /></button>
                  <button><i className="fab fa-instagram" /></button>
                  <button><i className="fab fa-linkedin-in" /></button>
                </div>
              </div>
            </div>
            <div className="author-area">
              <div className="thumbnail details mb_sm--15">
                <img src="${authorImage || '/assets/images/blog/details/author.jpg'}" alt="finbiz_buseness" />
              </div>
              <div className="author-details team">
                <span className="desig">${authorTitle || 'Brand Designer'}</span>
                <h5>${authorName || 'Angelina H. Dekato'}</h5>
                <p className="disc">
                  ${authorDescription || 'Nullam varius luctus pharetra ultrices volpat facilisis donec tortor, nibhkisys habitant curabitur at nunc nisl magna ac rhoncus vehicula sociis tortor nist hendrerit molestie integer.'}
                </p>
              </div>
            </div>
            <div className="comments-area">
              <div id="comments-container">
                {/* Dynamic comments will appear here */}
              </div>
            </div>
            <div className="replay-area-details">
              <h4 className="title">Leave a Reply</h4>
              <form id="comment-form">
                <div className="row g-4">
                  <div className="col-lg-6">
                    <input type="text" id="name" placeholder="Your Name" required="" />
                  </div>
                  <div className="col-lg-6">
                    <input type="text" id="email" placeholder="Your Email" required="" />
                  </div>
                  <div className="col-12">
                    <input type="text" id="topic" placeholder="Select Topic" />
                    <textarea id="message" placeholder="Type your message" required="" defaultValue={""} />
                  </div>
                  <div className="col-12">
                    <button className="rts-btn btn-primary" type="submit">
                      Submit Message
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>`;
  };

  // Update form data when template changes
  useEffect(() => {
    if (editorMode === 'template') {
      const generatedHTML = generateTemplateHTML();
      setFormData(prev => ({ ...prev, content: generatedHTML }));
      setEditorContent(generatedHTML);
    }
  }, [templateData, editorMode]);

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
        } else if (value === '<h4>') {
          replacement = `\n#### ${selectedText}`;
        } else if (value === '<h5>') {
          replacement = `\n##### ${selectedText}`;
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
          const openInNewTab = confirm('Open link in new tab?');
          if (openInNewTab) {
            replacement = `[${selectedText}](${url}){target="_blank"}`;
          } else {
            replacement = `[${selectedText}](${url})`;
          }
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
     setShowImageModal(true);
     setImageUrl('');
     setImageInsertionType('url');
   };

   // Handle content image upload
   const handleContentImageUpload = async (file) => {
     if (!file) return;

     const formData = new FormData();
     formData.append('image', file);
     formData.append('type', 'blog');

     try {
       setUploadingContentImage(true);
       const response = await fetch('/api/upload-image', {
         method: 'POST',
         body: formData,
       });

       const result = await response.json();

       if (result.success) {
         const imageHTML = `<img src="${result.data.url}" alt="Blog image" style="max-width: 100%; height: auto; margin: 15px 0;" />`;
         insertHTML(imageHTML);
         setShowImageModal(false);
         toast.success('Image uploaded and inserted successfully!');
       } else {
         toast.error(result.error || 'Failed to upload image');
       }
     } catch (error) {
       console.error('Error uploading content image:', error);
       toast.error('Failed to upload image');
     } finally {
       setUploadingContentImage(false);
     }
   };

   // Handle content image file selection
   const handleContentImageFileChange = (e) => {
     const file = e.target.files[0];
     if (file) {
       // Validate file type
       const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
       if (!allowedTypes.includes(file.type)) {
         toast.error('Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.');
         return;
       }

       // Validate file size (max 5MB)
       const maxSize = 5 * 1024 * 1024; // 5MB
       if (file.size > maxSize) {
         toast.error('File size too large. Maximum size is 5MB.');
         return;
       }

       handleContentImageUpload(file);
     }
   };

   // Insert image from URL
   const insertImageFromUrl = () => {
     if (imageUrl.trim()) {
       const imageHTML = `<img src="${imageUrl.trim()}" alt="Blog image" style="max-width: 100%; height: auto; margin: 15px 0;" />`;
       insertHTML(imageHTML);
       setShowImageModal(false);
       setImageUrl('');
     } else {
       toast.error('Please enter a valid image URL');
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

  // Fetch authors
  const fetchAuthors = async () => {
    try {
      if (!user) {
        console.log('User not authenticated for author fetch');
        return;
      }
      
      const idToken = await user.getIdToken();
      
      const response = await fetch('/api/admin/authors?limit=100', {
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        }
      });
      const result = await response.json();
      if (result.success) {
        setAuthors(result.data.authors);
      }
    } catch (error) {
      console.error('Error fetching authors:', error);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle author selection
  const handleAuthorChange = (e) => {
    const authorId = e.target.value;
    const selectedAuthor = authors.find(author => author._id === authorId);
    
    setFormData(prev => ({
      ...prev,
      authorId: authorId,
      author: selectedAuthor ? selectedAuthor.name : '',
      authorBio: selectedAuthor ? selectedAuthor.bio : '',
      authorRole: selectedAuthor ? selectedAuthor.title : ''
    }));
  };

  // Handle tags input (keep raw input for editing)
  const handleTagsChange = (e) => {
    const value = e.target.value;
    setTagsInput(value);
    // Also update formData immediately for real-time sync
    const tags = value.split(',').map(tag => tag.trim()).filter(tag => tag);
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
    formData.append('type', type); // 'blog' or 'banner'

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
      featured: blog.featured || false,
      author: blog.author,
      authorId: blog.authorId || '',
      authorBio: blog.authorBio || '',
      authorRole: blog.authorRole || '',
      image: blog.image,
      bannerImg: blog.bannerImg,
      publishedDate: formattedDate
    });
    setTagsInput((blog.tags || []).join(', ')); // Set tags input for editing
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
      featured: false,
      author: '',
      authorId: '',
      authorBio: '',
      authorRole: '',
      image: '',
      bannerImg: '',
      publishedDate: ''
    });
    setEditorContent(''); // Reset editor content
    setEditorMode('visual'); // Reset editor mode
    setShowPreview(false); // Reset preview mode
    setImageUploadType('url');
    setBannerUploadType('url');
    setTagsInput(''); // Reset tags input
    // Reset template data
    setTemplateData({
      mainTitle: '',
      paragraph1: '',
      paragraph2: '',
      quoteText: '',
      quoteAuthor: '',
      quoteAuthorTitle: '',
      paragraph3: '',
      image1: '',
      image2: '',
      sectionTitle: '',
      paragraph4: '',
      image3: '',
      bulletPoints: ['', '', '', '', ''],
      paragraph5: '',
      tags: ['', '', ''],
      authorName: '',
      authorTitle: '',
      authorDescription: '',
      authorImage: ''
    });
  };

  // Filter blogs based on status
  const getFilteredBlogs = () => {
    return blogs.filter(blog => {
      // Filter by status
      const matchesStatus = statusFilter === 'all' || blog.status === statusFilter;
      // Filter by category
      const matchesCategory = categoryFilter === 'all' || blog.category === categoryFilter;
      return matchesStatus && matchesCategory;
    });
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

  // Get unique categories from blogs
  const getUniqueCategories = () => {
    const categories = blogs
      .map(blog => blog.category)
      .filter(category => category && category.trim() !== '');
    return [...new Set(categories)].sort();
  };

     // Initialize data
   useEffect(() => {
     fetchBlogs();
     fetchTags();
     fetchAuthors();
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
            <div style={{ display: 'flex', gap: '8px' }}>
              <a 
                href="/admin/authors"
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#28a745',
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
                👤 Manage Authors
              </a>
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
                    <input
                      type="text"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="form-control"
                      placeholder="e.g., Technology, Business, Innovation"
                    />
                    <small className="text-muted">
                      Enter any category name for this blog post
                    </small>
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
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        name="featured"
                        checked={formData.featured}
                        onChange={handleInputChange}
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                      <span>⭐ Featured Article</span>
                    </label>
                    <small className="text-muted">
                      Featured articles will be prominently displayed on the blog page
                    </small>
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-md-4">
                  <div className="form-group">
                    <label>Select Author</label>
                    <select
                      name="authorId"
                      value={formData.authorId}
                      onChange={handleAuthorChange}
                      className="form-control"
                    >
                      <option value="">Choose an author...</option>
                      {authors.filter(author => author.isActive).map((author) => (
                        <option key={author._id} value={author._id}>
                          {author.name} {author.title ? `(${author.title})` : ''}
                        </option>
                      ))}
                    </select>
                    <small className="text-muted">
                      Or <a href="/admin/authors" target="_blank" style={{color: 'var(--color-primary)'}}>manage authors</a>
                    </small>
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
              </div>

              {/* Author Details Section */}
              {formData.authorId && (
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>Author Bio</label>
                      <textarea
                        name="authorBio"
                        value={formData.authorBio}
                        onChange={handleInputChange}
                        className="form-control"
                        rows="3"
                        placeholder="Author's bio will be auto-filled from selected author"
                        readOnly
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>Author Role/Title</label>
                      <input
                        type="text"
                        name="authorRole"
                        value={formData.authorRole}
                        onChange={handleInputChange}
                        className="form-control"
                        placeholder="Author's role will be auto-filled from selected author"
                        readOnly
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="row">
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
                  value={tagsInput}
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
                  <div className="editor-tabs" style={{ 
                    display: 'flex', 
                    gap: '5px', 
                    marginBottom: '15px',
                    borderBottom: '1px solid #e0e0e0'
                  }}>
                    <button 
                      className={`editor-tab ${editorMode === 'visual' ? 'active' : ''}`}
                      onClick={() => setEditorModeDirect('visual')}
                      style={{
                        padding: '8px 16px',
                        border: 'none',
                        backgroundColor: editorMode === 'visual' ? '#007bff' : 'transparent',
                        color: editorMode === 'visual' ? 'white' : '#666',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500',
                        borderRadius: '4px 4px 0 0',
                        borderBottom: editorMode === 'visual' ? '2px solid #007bff' : '2px solid transparent'
                      }}
                    >
                      🖊️ Visual
                    </button>
                    <button 
                      className={`editor-tab ${editorMode === 'html' ? 'active' : ''}`}
                      onClick={() => setEditorModeDirect('html')}
                      style={{
                        padding: '8px 16px',
                        border: 'none',
                        backgroundColor: editorMode === 'html' ? '#007bff' : 'transparent',
                        color: editorMode === 'html' ? 'white' : '#666',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500',
                        borderRadius: '4px 4px 0 0',
                        borderBottom: editorMode === 'html' ? '2px solid #007bff' : '2px solid transparent'
                      }}
                    >
                      📝 HTML
                    </button>
                    <button 
                      className={`editor-tab ${editorMode === 'template' ? 'active' : ''}`}
                      onClick={() => setEditorModeDirect('template')}
                      style={{
                        padding: '8px 16px',
                        border: 'none',
                        backgroundColor: editorMode === 'template' ? '#007bff' : 'transparent',
                        color: editorMode === 'template' ? 'white' : '#666',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500',
                        borderRadius: '4px 4px 0 0',
                        borderBottom: editorMode === 'template' ? '2px solid #007bff' : '2px solid transparent'
                      }}
                    >
                      📋 Template One
                    </button>
                  </div>
                  
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
                            onClick={() => execCommand('formatBlock', '<h4>')}
                            className="rts-btn btn-border"
                            title="Heading 4"
                          >
                            H4
                          </button>
                          <button
                            type="button"
                            onClick={() => execCommand('formatBlock', '<h5>')}
                            className="rts-btn btn-border"
                            title="Heading 5"
                          >
                            H5
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
                            className="editor-preview"
                            dangerouslySetInnerHTML={{ 
                              __html: editorContent
                                .replace(/\[([^\]]+)\]\(([^)]+)\)\{target="_blank"\}/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>') // Links with target="_blank"
                                .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>') // Regular links
                                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
                                .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic
                                .replace(/__(.*?)__/g, '<u>$1</u>') // Underline
                                .replace(/~~(.*?)~~/g, '<s>$1</s>') // Strikethrough
                                .replace(/^# (.*$)/gm, '<h1>$1</h1>') // H1
                                .replace(/^## (.*$)/gm, '<h2>$1</h2>') // H2
                                .replace(/^### (.*$)/gm, '<h3>$1</h3>') // H3
                                .replace(/^#### (.*$)/gm, '<h4>$1</h4>') // H4
                                .replace(/^##### (.*$)/gm, '<h5>$1</h5>') // H5
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
                  ) : editorMode === 'html' ? (
                    <textarea
                      name="content"
                      value={editorContent}
                      onChange={handleHtmlChange}
                      className="form-control"
                      rows="10"
                      placeholder="<p>Your HTML content here...</p>"
                    />
                  ) : (
                    <div className="template-editor">
                      <div className="template-form">
                        <h4 style={{ marginBottom: '20px', color: '#333' }}>Template One - Content Fields</h4>
                        
                        {/* Main Title */}
                        <div className="form-group">
                          <label>Main Title</label>
                          <input
                            type="text"
                            value={templateData.mainTitle}
                            onChange={(e) => handleTemplateChange('mainTitle', e.target.value)}
                            className="form-control"
                            placeholder="Enter main title"
                          />
                        </div>

                        {/* Paragraphs */}
                        <div className="form-group">
                          <label>First Paragraph</label>
                          <textarea
                            value={templateData.paragraph1}
                            onChange={(e) => handleTemplateChange('paragraph1', e.target.value)}
                            className="form-control"
                            rows="3"
                            placeholder="Enter first paragraph content"
                          />
                        </div>

                        <div className="form-group">
                          <label>Second Paragraph</label>
                          <textarea
                            value={templateData.paragraph2}
                            onChange={(e) => handleTemplateChange('paragraph2', e.target.value)}
                            className="form-control"
                            rows="3"
                            placeholder="Enter second paragraph content"
                          />
                        </div>

                        {/* Quote Section */}
                        <div className="form-group">
                          <label>Quote Text</label>
                          <textarea
                            value={templateData.quoteText}
                            onChange={(e) => handleTemplateChange('quoteText', e.target.value)}
                            className="form-control"
                            rows="2"
                            placeholder="Enter quote text"
                          />
                        </div>

                        <div className="row">
                          <div className="col-md-6">
                            <div className="form-group">
                              <label>Quote Author</label>
                              <input
                                type="text"
                                value={templateData.quoteAuthor}
                                onChange={(e) => handleTemplateChange('quoteAuthor', e.target.value)}
                                className="form-control"
                                placeholder="Quote author name"
                              />
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="form-group">
                              <label>Quote Author Title</label>
                              <input
                                type="text"
                                value={templateData.quoteAuthorTitle}
                                onChange={(e) => handleTemplateChange('quoteAuthorTitle', e.target.value)}
                                className="form-control"
                                placeholder="Author title/position"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="form-group">
                          <label>Third Paragraph</label>
                          <textarea
                            value={templateData.paragraph3}
                            onChange={(e) => handleTemplateChange('paragraph3', e.target.value)}
                            className="form-control"
                            rows="3"
                            placeholder="Enter third paragraph content"
                          />
                        </div>

                        {/* Images */}
                        <div className="row">
                          <div className="col-md-6">
                            <div className="form-group">
                              <label>First Image URL</label>
                              <input
                                type="text"
                                value={templateData.image1}
                                onChange={(e) => handleTemplateChange('image1', e.target.value)}
                                className="form-control"
                                placeholder="Enter first image URL"
                              />
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="form-group">
                              <label>Second Image URL</label>
                              <input
                                type="text"
                                value={templateData.image2}
                                onChange={(e) => handleTemplateChange('image2', e.target.value)}
                                className="form-control"
                                placeholder="Enter second image URL"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Section Title */}
                        <div className="form-group">
                          <label>Section Title</label>
                          <input
                            type="text"
                            value={templateData.sectionTitle}
                            onChange={(e) => handleTemplateChange('sectionTitle', e.target.value)}
                            className="form-control"
                            placeholder="Enter section title"
                          />
                        </div>

                        <div className="form-group">
                          <label>Fourth Paragraph</label>
                          <textarea
                            value={templateData.paragraph4}
                            onChange={(e) => handleTemplateChange('paragraph4', e.target.value)}
                            className="form-control"
                            rows="3"
                            placeholder="Enter fourth paragraph content"
                          />
                        </div>

                        <div className="form-group">
                          <label>Third Image URL</label>
                          <input
                            type="text"
                            value={templateData.image3}
                            onChange={(e) => handleTemplateChange('image3', e.target.value)}
                            className="form-control"
                            placeholder="Enter third image URL"
                          />
                        </div>

                        {/* Bullet Points */}
                        <div className="form-group">
                          <label>Bullet Points</label>
                          {templateData.bulletPoints.map((point, index) => (
                            <input
                              key={index}
                              type="text"
                              value={point}
                              onChange={(e) => handleBulletPointChange(index, e.target.value)}
                              className="form-control"
                              style={{ marginBottom: '10px' }}
                              placeholder={`Bullet point ${index + 1}`}
                            />
                          ))}
                        </div>

                        <div className="form-group">
                          <label>Fifth Paragraph</label>
                          <textarea
                            value={templateData.paragraph5}
                            onChange={(e) => handleTemplateChange('paragraph5', e.target.value)}
                            className="form-control"
                            rows="3"
                            placeholder="Enter fifth paragraph content"
                          />
                        </div>

                        {/* Tags */}
                        <div className="form-group">
                          <label>Tags</label>
                          {templateData.tags.map((tag, index) => (
                            <input
                              key={index}
                              type="text"
                              value={tag}
                              onChange={(e) => handleTagChange(index, e.target.value)}
                              className="form-control"
                              style={{ marginBottom: '10px' }}
                              placeholder={`Tag ${index + 1}`}
                            />
                          ))}
                        </div>

                        {/* Author Section */}
                        <h5 style={{ marginTop: '30px', marginBottom: '15px', color: '#333' }}>Author Information</h5>
                        <div className="row">
                          <div className="col-md-6">
                            <div className="form-group">
                              <label>Author Name</label>
                              <input
                                type="text"
                                value={templateData.authorName}
                                onChange={(e) => handleTemplateChange('authorName', e.target.value)}
                                className="form-control"
                                placeholder="Author name"
                              />
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="form-group">
                              <label>Author Title</label>
                              <input
                                type="text"
                                value={templateData.authorTitle}
                                onChange={(e) => handleTemplateChange('authorTitle', e.target.value)}
                                className="form-control"
                                placeholder="Author title/position"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="form-group">
                          <label>Author Description</label>
                          <textarea
                            value={templateData.authorDescription}
                            onChange={(e) => handleTemplateChange('authorDescription', e.target.value)}
                            className="form-control"
                            rows="3"
                            placeholder="Enter author description"
                          />
                        </div>

                        <div className="form-group">
                          <label>Author Image URL</label>
                          <input
                            type="text"
                            value={templateData.authorImage}
                            onChange={(e) => handleTemplateChange('authorImage', e.target.value)}
                            className="form-control"
                            placeholder="Enter author image URL"
                          />
                        </div>

                        {/* Preview Button */}
                        <div style={{ marginTop: '20px' }}>
                          <button
                            type="button"
                            className="rts-btn btn-border"
                            onClick={() => setShowPreview(!showPreview)}
                          >
                            {showPreview ? 'Hide Preview' : 'Show Preview'}
                          </button>
                        </div>

                        {/* Preview */}
                        {showPreview && (
                          <div style={{ 
                            marginTop: '20px', 
                            padding: '20px', 
                            border: '1px solid var(--color-border)', 
                            borderRadius: 'var(--radius)',
                            backgroundColor: '#f8f9fa'
                          }}>
                            <h5 style={{ marginBottom: '15px', color: '#333' }}>Template Preview:</h5>
                            <div 
                              className="editor-preview"
                              dangerouslySetInnerHTML={{ 
                                __html: generateTemplateHTML()
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
                    </div>
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
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', fontWeight: '500' }}>Status:</span>
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
                
                {/* Category Filter */}
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', fontWeight: '500' }}>Category:</span>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    style={{
                      padding: '6px 12px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px',
                      cursor: 'pointer',
                      minWidth: '150px'
                    }}
                  >
                    <option value="all">All Categories</option>
                    {getUniqueCategories().map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
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
                    <th>Featured</th>
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
                         <td>
                           {blog.featured ? (
                             <span className="badge" style={{ background: '#ffc107', color: '#000', fontWeight: '700' }}>
                               ⭐ Featured
                             </span>
                           ) : (
                             <span style={{ color: '#999' }}>—</span>
                           )}
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
                       <td colSpan="9" style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
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
          padding: 6px 20px;
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

        /* Typography classes matching public blog styles */
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
          line-height: 1.2;
        }

        .editor-content h3 {
          font-size: var(--h3);
          font-weight: var(--p-bold);
          margin: 20px 0 10px 0;
          color: var(--color-heading-1);
          line-height: 1.2;
        }

        .editor-content h4 {
          font-size: var(--h4);
          font-weight: var(--p-bold);
          margin: 18px 0 8px 0;
          color: var(--color-heading-1);
          line-height: 1.2;
        }

        .editor-content h5 {
          font-size: var(--h5);
          font-weight: var(--p-bold);
          margin: 16px 0 8px 0;
          color: var(--color-heading-1);
          line-height: 1.2;
        }

        .editor-content h6 {
          font-size: var(--h6);
          font-weight: var(--p-bold);
          margin: 14px 0 8px 0;
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

        /* Editor Preview Styles (for template preview) */
        .editor-preview h1 {
          font-size: var(--h1);
          font-weight: var(--p-bold);
          margin: 30px 0 15px 0;
          color: var(--color-heading-1);
          line-height: 1.3;
        }

        .editor-preview h2 {
          font-size: var(--h2);
          font-weight: var(--p-bold);
          margin: 25px 0 12px 0;
          color: var(--color-heading-1);
          line-height: 1.2;
        }

        .editor-preview h3 {
          font-size: var(--h3);
          font-weight: var(--p-bold);
          margin: 20px 0 10px 0;
          color: var(--color-heading-1);
          line-height: 1.2;
        }

        .editor-preview h4 {
          font-size: var(--h4);
          font-weight: var(--p-bold);
          margin: 18px 0 8px 0;
          color: var(--color-heading-1);
          line-height: 1.2;
        }

        .editor-preview h5 {
          font-size: var(--h5);
          font-weight: var(--p-bold);
          margin: 16px 0 8px 0;
          color: var(--color-heading-1);
          line-height: 1.2;
        }

        .editor-preview h6 {
          font-size: var(--h6);
          font-weight: var(--p-bold);
          margin: 14px 0 8px 0;
          color: var(--color-heading-1);
          line-height: 1.2;
        }

        .editor-preview p {
          font-size: var(--font-size-b1);
          line-height: var(--line-height-b1);
          margin: 15px 0;
          color: var(--color-body);
        }

        .editor-preview ul, .editor-preview ol {
          margin: 15px 0;
          padding-left: 30px;
        }

        .editor-preview li {
          font-size: var(--font-size-b1);
          line-height: var(--line-height-b1);
          margin: 8px 0;
          color: var(--color-body);
        }

        .editor-preview blockquote {
          margin: 20px 0;
          padding: 15px 25px;
          border-left: 4px solid var(--color-primary);
          background: #f8f9fa;
          font-style: italic;
          color: var(--color-body);
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
           
           .editor-content h4 {
             font-size: 20px;
           }
           
           .editor-content h5 {
             font-size: 20px;
           }
           
           .editor-content h6 {
             font-size: 18px;
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

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      {/* Image Insertion Modal */}
      {showImageModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '8px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h3 style={{ marginBottom: '20px', color: 'var(--color-heading-1)' }}>Insert Image</h3>
            
            {/* Upload Type Selector */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600' }}>Choose Method:</label>
              <div style={{ display: 'flex', gap: '15px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    value="url"
                    checked={imageInsertionType === 'url'}
                    onChange={(e) => setImageInsertionType(e.target.value)}
                  />
                  From URL
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    value="upload"
                    checked={imageInsertionType === 'upload'}
                    onChange={(e) => setImageInsertionType(e.target.value)}
                  />
                  Upload File
                </label>
              </div>
            </div>

            {/* URL Input */}
            {imageInsertionType === 'url' && (
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Image URL:</label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>
            )}

            {/* File Upload */}
            {imageInsertionType === 'upload' && (
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Choose Image:</label>
                <input
                  ref={contentImageFileRef}
                  type="file"
                  accept="image/*"
                  onChange={handleContentImageFileChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
                <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                  Supported formats: JPEG, PNG, WebP, GIF (Max: 5MB)
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowImageModal(false);
                  setImageUrl('');
                }}
                style={{
                  padding: '10px 20px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  backgroundColor: 'white',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              {imageInsertionType === 'url' && (
                <button
                  onClick={insertImageFromUrl}
                  disabled={uploadingContentImage}
                  style={{
                    padding: '10px 20px',
                    border: 'none',
                    borderRadius: '4px',
                    backgroundColor: 'var(--color-primary)',
                    color: 'white',
                    cursor: 'pointer'
                  }}
                >
                  Insert Image
                </button>
              )}
              {imageInsertionType === 'upload' && uploadingContentImage && (
                <div style={{
                  padding: '10px 20px',
                  backgroundColor: '#f0f0f0',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid #ddd',
                    borderTop: '2px solid var(--color-primary)',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  Uploading...
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
} 
