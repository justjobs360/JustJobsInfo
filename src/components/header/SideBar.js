"use client"
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { auth } from '@/config/firebase';
import { signOut } from 'firebase/auth';
import { useRouter, usePathname } from 'next/navigation';
import toast from 'react-hot-toast';

function SideBar({ isSidebarOpen, toggleSidebar }) {
  const pathname = usePathname();
  const router = useRouter();
  const [openMenu, setOpenMenu] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!auth) {
      return;
    }
    
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  const toggleMenu = (index) => {
    setOpenMenu(openMenu === index ? null : index);
  };

  const handleLogout = async () => {
    if (!auth) {
      toast.error('Authentication service is not available');
      return;
    }
    
    try {
      await signOut(auth);
      toast.success('Successfully logged out!');
      toggleSidebar(); // Close sidebar after logout
      router.push('/');
    } catch (error) {
      toast.error('Error logging out. Please try again.');
    }
  };

  const getInitials = (email) => {
    return email ? email[0].toUpperCase() : '';
  };

  // Helper function to check if a link is active
  const isActive = (href) => {
    // Exact match for home page
    if (href === '/') {
      return pathname === '/';
    }
    
    // For other pages, check if pathname starts with href and is followed by '/' or end of string
    // This prevents false positives like '/about' matching '/about-us'
    const normalizedHref = href.endsWith('/') ? href.slice(0, -1) : href;
    const normalizedPathname = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
    
    return normalizedPathname === normalizedHref || normalizedPathname.startsWith(normalizedHref + '/');
  };

  // Special handling for Resources dropdown - active if any sub-resource is active
  const isResourcesActive = () => {
    return isActive('/important-links') || 
           isActive('/downloadable-resources') || 
           isActive('/service');
  };

  return (
    <div>
      <div id="side-bar" className={`side-bar header-two ${isSidebarOpen ? 'show' : ''}`} style={{ overflow: 'hidden' }}>
        <button className="close-icon-menu" aria-label="Close Menu" onClick={toggleSidebar}>
          <i className="far fa-times"></i>
        </button>
        <div className="mobile-menu-main" style={{ overflow: 'hidden', height: '100vh' }}>
          {/* Override any CSS that might be adding "justjobs" text */}
          <style dangerouslySetInnerHTML={{
            __html: `
              .side-bar::before,
              .mobile-menu-main::before,
              .side-bar .mobile-menu-main::before {
                content: none !important;
              }
            `
          }} />
          {/* User Profile Section */}
          {user && (
            <div className="user-profile-mobile" style={{
              padding: '20px 0',
              background: '#ffffff',
              borderRadius: '8px',
              margin: '15px 0',
              border: '1px solid #e9ecef'
            }}>
              {/* Row 1: Profile Icon and Email */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                marginBottom: '18px',
                padding: '0 15px'
              }}>
                <div className="profile-icon-mobile" style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  background: 'var(--color-primary)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  fontWeight: '600',
                  flexShrink: 0,
                  margin: 0
                }}>
                  {getInitials(user.email)}
                </div>
                <div className="user-email" style={{
                  fontSize: '14px',
                  color: '#333',
                  fontWeight: '500',
                  lineHeight: '1.5',
                  wordBreak: 'break-all',
                  flex: 1,
                  margin: 0,
                  paddingTop: '2px'
                }}>
                  {user.email}
                </div>
              </div>
              
              {/* Row 2: Account and Logout Buttons */}
              <div style={{
                display: 'flex',
                gap: '8px',
                justifyContent: 'flex-start',
                paddingLeft: '81px'
              }}>
                <Link
                  href="/account"
                  onClick={toggleSidebar}
                  style={{
                    background: '#f8f9fa',
                    color: 'var(--color-heading-1)',
                    border: '1px solid #e9ecef',
                    padding: '12px 20px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    textDecoration: 'none',
                    display: 'inline-block',
                    transition: 'all 0.3s ease'
                  }}
                >
                  My Account
                </Link>
                <button 
                  onClick={handleLogout}
                  className="logout-btn-mobile"
                  style={{
                    background: 'var(--color-primary)',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    minWidth: '90px',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#0056b3';
                    e.target.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'var(--color-primary)';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  Logout
                </button>
              </div>
            </div>
          )}

          <nav className="nav-main mainmenu-nav mt--30">
            <ul className="mainmenu metismenu" id="mobile-menu-active">
              <li>
                <Link 
                  href="/" 
                  className={`main ${isActive('/') ? 'active' : ''}`} 
                  onClick={toggleSidebar}
                  style={isActive('/') ? { color: 'var(--color-primary)' } : {}}
                >
                  Home
                </Link>
              </li>
              <li>
                <Link 
                  href="/resume-audit" 
                  className={`main ${isActive('/resume-audit') ? 'active' : ''}`} 
                  onClick={toggleSidebar}
                  style={isActive('/resume-audit') ? { color: 'var(--color-primary)' } : {}}
                >
                  Resume Audit
                </Link>
              </li>
              <li>
                <Link 
                  href="/resume-builder" 
                  className={`main ${isActive('/resume-builder') ? 'active' : ''}`} 
                  onClick={toggleSidebar}
                  style={isActive('/resume-builder') ? { color: 'var(--color-primary)' } : {}}
                >
                  Resume Builder
                </Link>
              </li>
              <li>
                <Link 
                  href="/job-fit" 
                  className={`main ${isActive('/job-fit') ? 'active' : ''}`} 
                  onClick={toggleSidebar}
                  style={isActive('/job-fit') ? { color: 'var(--color-primary)' } : {}}
                >
                  Job Fit
                </Link>
              </li>
              <li>
                <Link 
                  href="/job-listing" 
                  className={`main ${isActive('/job-listing') ? 'active' : ''}`} 
                  onClick={toggleSidebar}
                  style={isActive('/job-listing') ? { color: 'var(--color-primary)' } : {}}
                >
                  Job Listings
                </Link>
              </li>
              <li className="has-droupdown">
                <Link 
                  href="#" 
                  className={`main ${isResourcesActive() ? 'active' : ''}`} 
                  onClick={() => toggleMenu(1)}
                  style={isResourcesActive() ? { color: 'var(--color-primary)' } : {}}
                >
                  Resources
                </Link>
                <ul className={`submenu ${openMenu === 1 ? 'mm-collapse mm-show' : 'mm-collapse'}`}>
                  <li>
                    <Link 
                      href="/important-links" 
                      onClick={toggleSidebar}
                      style={isActive('/important-links') ? { color: 'var(--color-primary)' } : {}}
                    >
                      Important Links
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href="/downloadable-resources" 
                      onClick={toggleSidebar}
                      style={isActive('/downloadable-resources') ? { color: 'var(--color-primary)' } : {}}
                    >
                      Downloadable Resources
                    </Link>
                  </li>
                </ul>
              </li>
              <li>
                <Link 
                  href="/blogs" 
                  className={`main ${isActive('/blogs') ? 'active' : ''}`} 
                  onClick={toggleSidebar}
                  style={isActive('/blogs') ? { color: 'var(--color-primary)' } : {}}
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link 
                  href="/contact" 
                  className={`main ${isActive('/contact') ? 'active' : ''}`} 
                  onClick={toggleSidebar}
                  style={isActive('/contact') ? { color: 'var(--color-primary)' } : {}}
                >
                  Contact
                </Link>
              </li>
              
              {/* Authentication Links for Non-logged in Users */}
              {!user && (
                <>
                  <li className="auth-separator">
                    <hr style={{margin: '20px 0', borderColor: '#ddd'}} />
                  </li>
                  <li>
                    <Link href="/login" className="main auth-link" onClick={toggleSidebar}>
                      Login
                    </Link>
                  </li>
                  <li>
                    <Link href="/register" className="main auth-link" onClick={toggleSidebar}>
                      Register
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </nav>
          <div className="rts-social-border-area right-sidebar mt--80">
            <ul>
              <li>
                <Link href="https://www.facebook.com/justjobsinfos/" target="_blank" rel="noopener noreferrer" aria-label="social link" data-description="social">
                  <i className="fa-brands fa-facebook-f" />
                </Link>
              </li>
              <li>
                <Link href="https://x.com/justjobs_info" target="_blank" rel="noopener noreferrer" aria-label="Follow us on X" data-description="social">
                  <span style={{ fontWeight: 'bold', fontSize: '16px', color: 'white' }}>𝕏</span>
                </Link>
              </li>
              <li>
                <Link href="https://www.linkedin.com/company/justjobsng-com/" target="_blank" rel="noopener noreferrer" aria-label="social link" data-description="social">
                  <i className="fa-brands fa-linkedin-in" />
                </Link>
              </li>
              <li>
                <Link href="#" aria-label="social link" data-description="social">
                  <i className="fa-brands fa-pinterest" />
                </Link>
              </li>
              <li>
                <Link href="#" aria-label="social link" data-description="social">
                  <i className="fa-brands fa-youtube" />
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Developed by SillyLittleTools - Below Social Icons */}
          <div className="developed-by-mobile" style={{
            marginTop: '30px',
            textAlign: 'center',
            padding: '0 15px'
          }}>
            <p style={{
              fontSize: '14px',
              color: 'var(--color-primary)',
              fontWeight: '600',
              margin: 0
            }}>
              <span style={{color:"#000000"}}>Developed by</span> <Link href="https://sillylittletools.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>SillyLittleTools</Link>
            </p>
          </div>
        </div>
        {/* mobile menu area end */}
      </div>

    </div>
  )
}

export default SideBar
