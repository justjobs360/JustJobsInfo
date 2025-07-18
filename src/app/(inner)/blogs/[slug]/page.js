"use client"
import { useState, useRef } from "react";
import { useParams } from "next/navigation";
import HeaderOne from "@/components/header/HeaderOne";

import BackToTop from "@/components/common/BackToTop";
import Posts from '@/data/Posts.json';

import FooterOne from "@/components/footer/FooterOne";
import ReCaptcha from "@/components/security/ReCaptcha";
import toast from 'react-hot-toast';

export default function BlogDetails() {
  const { slug } = useParams(); // Get the slug from URL parameters
  const blogPost = Posts.find((post) => post.slug === slug);

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

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

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

      // Add comment to the list
      const newComment = {
        ...formData,
        date: new Date().toLocaleDateString(),
        id: Date.now()
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

  // If no blog post is found, display an error
  if (!blogPost) {
    return <div>Post not found!</div>;
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
              {/* rts blo post area */}
              <div className="col-xl-8 col-md-12 col-sm-12 col-12">
                {/* single post */}
                <div className="blog-single-post-listing details mb--0">
                  <div className="thumbnail">
                    <img src={`${blogPost.bannerImg}`}
                      alt={blogPost.title} />
                  </div>
                  <div className="blog-listing-content">
                    <div className="user-info">
                      {/* single info */}
                      <div className="single">
                        <i className="far fa-user-circle" />
                        <span>by David Smith</span>
                      </div>
                      {/* single infoe end */}
                      {/* single info */}
                      <div className="single">
                        <i className="far fa-clock" />
                        <span>by David Smith</span>
                      </div>
                      {/* single infoe end */}
                      {/* single info */}
                      <div className="single">
                        <i className="far fa-tags" />
                        <span>by David Smith</span>
                      </div>
                      {/* single infoe end */}
                    </div>
                    <h3 className="title animated fadeIn">
                      Building smart business solution for you
                    </h3>
                    <p className="disc para-1">
                      Collaboratively pontificate bleeding edge resources with
                      inexpensive methodologies globally initiate multidisciplinary
                      compatible architectures pidiously repurpose leading edge growth
                      strategies with just in time web readiness communicate timely
                      meta services
                    </p>
                    <p className="disc">
                      Onubia semper vel donec torquent fusce mauris felis aptent
                      lacinia nisl, lectus himenaeos euismod molestie iaculis interdum
                      in laoreet condimentum dictum, quisque quam risus sollicitudin
                      gravida ut odio per a et. Gravida maecenas lobortis suscipit mus
                      sociosqu convallis, mollis vestibulum donec aliquam risus sapien
                      ridiculus, nulla sollicitudin eget in venenatis. Tortor montes
                      platea iaculis posuere per mauris, eros porta blandit curabitur
                      ullamcorper varius
                    </p>
                    {/* quote area start */}
                    <div className="rts-quote-area text-center">
                      <h5 className="title">
                        &ldquo;Placerat pretium tristique mattis tellus accuan metus
                        dictumst vivamus odio nulla fusce auctor into suscipit
                        habitasse class congue potenti iaculis&rdquo;
                      </h5>
                      <a href="#" className="name">
                        Daniel X. Horrar
                      </a>
                      <span>Author</span>
                    </div>
                    {/* quote area end */}
                    <p className="disc">
                      Ultrices iaculis commodo parturient euismod pulvinar donec cum
                      eget a, accumsan viverra cras praesent cubilia dignissim ad
                      rhoncus. Gravida maecenas lobortis suscipit mus sociosqu
                      convallis, mollis vestibulum donec aliquam risus sapien
                      ridiculus, nulla sollicitudin eget in venenatis. Tortor montes
                      platea iaculis posuere per mauris, eros porta blandit curabitur
                      ullamcorper varius, nostra ante risus egestas suscipit. Quisque
                      interdum nec parturient facilisis nunc ac quam, ad est cubilia
                      mauris himenaeos nascetur vestibulum.
                    </p>
                    <div className="row g-5">
                      <div className="col-lg-6 col-md-6">
                        <div className="thumbnail details">
                          <img
                            src="/assets/images/blog/d-lg-01.jpg"
                            alt="elevae construction"
                          />
                        </div>
                      </div>
                      <div className="col-lg-6 col-md-6">
                        <div className="thumbnail details">
                          <img
                            src="/assets/images/blog/d-lg-02.jpg"
                            alt="elevae construction"
                          />
                        </div>
                      </div>
                    </div>
                    <h4 className="title mt--40 mt_sm--20">
                      Ultimate Business Strategy Solution
                    </h4>
                    <p className="disc mb--25">
                      Gravida maecenas lobortis suscipit mus sociosqu convallis,
                      mollis vestibulum donec aliquam risus sapien ridiculus, nulla
                      sollicitudin eget in venenatis. Tortor montes platea iaculis
                      posuere per mauris, eros porta blandit curabitur ullamcorper
                      varius nostra ante risus egestas.
                    </p>
                    <div className="row align-items-center">
                      <div className="col-lg-5">
                        <div className="thumbnail details mb_sm--15">
                          <img
                            src="/assets/images/blog/details/03.jpg"
                            alt="elevate"
                          />
                        </div>
                      </div>
                      <div className="col-lg-7">
                        <div className="check-area-details">
                          {/* single check */}
                          <div className="single-check">
                            <i className="far fa-check-circle" />
                            <span>How will activities traditional manufacturing</span>
                          </div>
                          {/* single check End */}
                          {/* single check */}
                          <div className="single-check">
                            <i className="far fa-check-circle" />
                            <span>All these digital and projects aim to enhance</span>
                          </div>
                          {/* single check End */}
                          {/* single check */}
                          <div className="single-check">
                            <i className="far fa-check-circle" />
                            <span>I monitor my software that takes screenshots</span>
                          </div>
                          {/* single check End */}
                          {/* single check */}
                          <div className="single-check">
                            <i className="far fa-check-circle" />
                            <span>Laoreet dolore niacin sodium glutimate</span>
                          </div>
                          {/* single check End */}
                          {/* single check */}
                          <div className="single-check">
                            <i className="far fa-check-circle" />
                            <span>Minim veniam sodium glutimate nostrud</span>
                          </div>
                          {/* single check End */}
                        </div>
                      </div>
                    </div>
                    <p className="disc mt--30">
                      Cubilia hendrerit luctus sem aptent curae gravida maecenas
                      eleifend nunc nec vitae morbi sodales fusce tristique aenean
                      habitasse mattis sociis feugiat conubia mus auctor praesent urna
                      tincidunt taciti dui lobortis nullam. Mattis placerat feugiat
                      ridiculus sed a per curae fermentum aenean facilisi, vitae urna
                      imperdiet ac mauris non inceptos luctus hac odio.
                    </p>
                    <div className="row  align-items-center">
                      <div className="col-lg-6 col-md-12">
                        {/* tags details */}
                        <div className="details-tag">
                          <h6>Tags:</h6>
                          <button>Services</button>
                          <button>Business</button>
                          <button>Growth</button>
                        </div>
                        {/* tags details End */}
                      </div>
                      <div className="col-lg-6 col-md-12">
                        <div className="details-share">
                          <h6>Share:</h6>
                          <button>
                            <i className="fab fa-facebook-f" />
                          </button>
                          <button>
                            <i className="fab fa-twitter" />
                          </button>
                          <button>
                            <i className="fab fa-instagram" />
                          </button>
                          <button>
                            <i className="fab fa-linkedin-in" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="author-area">
                      <div className="thumbnail details mb_sm--15">
                        <img
                          src="/assets/images/blog/details/author.jpg"
                          alt="finbiz_buseness"
                        />
                      </div>
                      <div className="author-details team">
                        <span className="desig">Brand Designer</span>
                        <h5>Angelina H. Dekato</h5>
                        <p className="disc">
                          Nullam varius luctus pharetra ultrices volpat facilisis
                          donec tortor, nibhkisys habitant curabitur at nunc nisl
                          magna ac rhoncus vehicula sociis tortor nist hendrerit
                          molestie integer.
                        </p>
                      </div>
                    </div>
                    <div className="comments-area">
                      <div id="comments-container">
                        {/* Display existing comments */}
                        {comments.length > 0 && (
                          <div className="comments-list">
                            <h4>Comments ({comments.length})</h4>
                            {comments.map((comment) => (
                              <div key={comment.id} className="single-comment" style={{
                                border: '1px solid #eee',
                                padding: '20px',
                                marginBottom: '20px',
                                borderRadius: '5px'
                              }}>
                                <div className="comment-header" style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  marginBottom: '10px'
                                }}>
                                  <strong>{comment.name}</strong>
                                  <span style={{ color: '#666', fontSize: '14px' }}>{comment.date}</span>
                                </div>
                                {comment.topic && (
                                  <div style={{ marginBottom: '10px', fontStyle: 'italic', color: '#666' }}>
                                    Topic: {comment.topic}
                                  </div>
                                )}
                                <p>{comment.comment}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="replay-area-details">
                      <h4 className="title">Leave a Reply</h4>
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
                            />
                            <textarea
                              id="comment"
                              name="comment"
                              placeholder="Type your message *"
                              value={formData.comment}
                              onChange={handleChange}
                              required
                            />
                          </div>
                          
                          {/* reCAPTCHA */}
                          <div className="col-12">
                            <ReCaptcha
                              ref={recaptchaRef}
                              onVerify={handleRecaptchaVerify}
                              onError={handleRecaptchaError}
                              onExpire={handleRecaptchaExpire}
                            />
                          </div>

                          {/* Terms agreement */}
                          <div className="col-12">
                            <div className="form-check">
                              <label className="form-check-label" htmlFor="agree" style={{display: 'flex', alignItems: 'center', cursor: 'pointer'}}>
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id="agree"
                                name="agree"
                                checked={formData.agree}
                                onChange={handleChange}
                                required
                                  style={{marginRight: '8px'}}
                              />
                                <span>I agree to the <a href="/terms-of-use" target="_blank">Terms of Service</a> and <a href="/privacy-policy" target="_blank">Privacy Policy</a> *</span>
                              </label>
                            </div>
                          </div>

                          <div className="col-12">
                            <button 
                              className="rts-btn btn-primary" 
                              type="submit"
                              disabled={isSubmitting}
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
                    <div className="rts-search-wrapper">
                      <input
                        className="Search"
                        type="text"
                        placeholder="Enter Keyword"
                      />
                      <button>
                        <i className="fal fa-search" />
                      </button>
                    </div>
                  </div>
                </div>
                {/* single wizered End */}
                {/* single wizered start */}
                <div className="rts-single-wized Categories">
                  <div className="wized-header">
                    <h5 className="title">Categories</h5>
                  </div>
                  <div className="wized-body">
                    {/* single categoris */}
                    <ul className="single-categories">
                      <li>
                        <a href="#">
                          Business Solution <i className="far fa-long-arrow-right" />
                        </a>
                      </li>
                    </ul>
                    {/* single categoris End */}
                    {/* single categoris */}
                    <ul className="single-categories">
                      <li>
                        <a href="#">
                          Strategy Growth
                          <i className="far fa-long-arrow-right" />
                        </a>
                      </li>
                    </ul>
                    {/* single categoris End */}
                    {/* single categoris */}
                    <ul className="single-categories">
                      <li>
                        <a href="#">
                          Finance Solution
                          <i className="far fa-long-arrow-right" />
                        </a>
                      </li>
                    </ul>
                    {/* single categoris End */}
                    {/* single categoris */}
                    <ul className="single-categories">
                      <li>
                        <a href="#">
                          Investment Policy
                          <i className="far fa-long-arrow-right" />
                        </a>
                      </li>
                    </ul>
                    {/* single categoris End */}
                    {/* single categoris */}
                    <ul className="single-categories">
                      <li>
                        <a href="#">
                          Tax Managment
                          <i className="far fa-long-arrow-right" />
                        </a>
                      </li>
                    </ul>
                    {/* single categoris End */}
                  </div>
                </div>
                {/* single wizered End */}
                {/* single wizered start */}
                <div className="rts-single-wized Recent-post">
                  <div className="wized-header">
                    <h5 className="title">Recent Posts</h5>
                  </div>
                  <div className="wized-body">
                    {/* recent-post */}
                    <div className="recent-post-single">
                      <div className="thumbnail">
                        <a href="#">
                          <img src="/assets/images/blog/sm/01.jpg" alt="Blog_post" />
                        </a>
                      </div>
                      <div className="content-area">
                        <div className="user">
                          <i className="fal fa-clock" />
                          <span>15 Jan, 2023</span>
                        </div>
                        <a className="post-title" href="#">
                          <h6 className="title">
                            We would love to share a similar experience
                          </h6>
                        </a>
                      </div>
                    </div>
                    {/* recent-post End */}
                    {/* recent-post */}
                    <div className="recent-post-single">
                      <div className="thumbnail">
                        <a href="#">
                          <img src="/assets/images/blog/sm/02.jpg" alt="Blog_post" />
                        </a>
                      </div>
                      <div className="content-area">
                        <div className="user">
                          <i className="fal fa-clock" />
                          <span>15 Jan, 2023</span>
                        </div>
                        <a className="post-title" href="#">
                          <h6 className="title">
                            We would love to share a similar experience
                          </h6>
                        </a>
                      </div>
                    </div>
                    {/* recent-post End */}
                    {/* recent-post */}
                    <div className="recent-post-single">
                      <div className="thumbnail">
                        <a href="#">
                          <img src="/assets/images/blog/sm/03.jpg" alt="Blog_post" />
                        </a>
                      </div>
                      <div className="content-area">
                        <div className="user">
                          <i className="fal fa-clock" />
                          <span>15 Jan, 2023</span>
                        </div>
                        <a className="post-title" href="#">
                          <h6 className="title">
                            We would love to share a similar experience
                          </h6>
                        </a>
                      </div>
                    </div>
                    {/* recent-post End */}
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
                      <div className="row-1 single-row">
                        <a href="#">
                          <img src="/assets/images/blog/sm/04.jpg" alt="Gallery" />
                        </a>
                        <a href="#">
                          <img src="/assets/images/blog/sm/05.jpg" alt="Gallery" />
                        </a>
                        <a href="#">
                          <img src="/assets/images/blog/sm/06.jpg" alt="Gallery" />
                        </a>
                      </div>
                      <div className="row-2 single-row">
                        <a href="#">
                          <img src="/assets/images/blog/sm/07.jpg" alt="Gallery" />
                        </a>
                        <a href="#">
                          <img src="/assets/images/blog/sm/08.jpg" alt="Gallery" />
                        </a>
                        <a href="#">
                          <img src="/assets/images/blog/sm/09.jpg" alt="Gallery" />
                        </a>
                      </div>
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




      <FooterOne />


      <BackToTop />
    </div>
  );
} 