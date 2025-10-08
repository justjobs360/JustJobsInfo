"use client"
import { useState } from "react";
import { useParams } from "next/navigation";
import HeaderTwo from "@/components/header/HeaderTwo";


import BackToTop from "@/components/common/BackToTop";
import Posts from '@/data/Posts.json';

import FooterOneDynamic from "@/components/footer/FooterOneDynamic";

export default function BlogDetails() {
  const { slug } = useParams(); // Get the slug from URL parameters
  const blogPost = Posts.find((post) => post.slug === slug);

  // Declare hooks unconditionally at the top
  const [comments, setComments] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    topic: "",
    comment: "",
  });

  // If no blog post is found, display an error
  if (!blogPost) {
    return <div>Post not found Man!</div>;
  }

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target; // Correct destructuring
    setFormData({
      ...formData,
      [name]: value, // Update the form field dynamically
    });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setComments([{ ...formData }, ...comments]); // Add new comment to the top
    setFormData({ name: "", email: "", topic: "", comment: "" }); // Clear form
  };

  return (
    <div className="">

      <HeaderTwo />

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
                        “Placerat pretium tristique mattis tellus accuan metus
                        dictumst vivamus odio nulla fusce auctor into suscipit
                        habitasse class congue potenti iaculis”
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
                          <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
                            <button>
                              <i className="fab fa-facebook-f" />
                            </button>
                          </a>
                          <a href={`https://x.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(blogPost?.title || '')}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
                            <button>
                              <i className="fab fa-twitter" />
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
                        {/* Dynamic comments will appear here */}
                      </div>
                    </div>
                    <div className="replay-area-details">
                      <h4 className="title">Leave a Reply</h4>
                      <form id="comment-form">
                        <div className="row g-4">
                          <div className="col-lg-6">
                            <input
                              type="text"
                              id="name"
                              placeholder="Your Name"
                              required=""
                            />
                          </div>
                          <div className="col-lg-6">
                            <input
                              type="text"
                              id="email"
                              placeholder="Your Email"
                              required=""
                            />
                          </div>
                          <div className="col-12">
                            <input
                              type="text"
                              id="topic"
                              placeholder="Select Topic"
                            />
                            <textarea
                              id="message"
                              placeholder="Type your message"
                              required=""
                              defaultValue={""}
                            />
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




      <FooterOneDynamic />


      <BackToTop />
    </div>
  );
}
