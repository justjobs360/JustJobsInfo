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
      <div id="side-bar" className={`side-bar header-two ${isSidebarOpen ? 'show' : ''}`}>
        <button className="close-icon-menu" aria-label="Close Menu" onClick={toggleSidebar}>
          <i className="far fa-times"></i>
        </button>
        <div className="mobile-menu-main">
          {/* User Profile Section */}
          {user && (
            <div className="user-profile-mobile mt--20 mb--30">
              <div className="profile-info">
                <div className="profile-icon-mobile">
                  {getInitials(user.email)}
                </div>
                <div className="user-details">
                  <span className="user-email">{user.email}</span>
                  <button 
                    onClick={handleLogout}
                    className="logout-btn-mobile"
                  >
                    Logout
                  </button>
                </div>
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
                <Link href="#" aria-label="social link" data-description="social">
                  <i className="fa-brands fa-facebook-f" />
                </Link>
              </li>
              <li>
                <Link href="#" aria-label="Follow us on X" data-description="social">
                  <i className="fa-brands fa-x-twitter" />
                </Link>
              </li>
              <li>
                <Link href="#" aria-label="social link" data-description="social">
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
        </div>
        {/* mobile menu area end */}
      </div>

    </div>
  )
}

export default SideBar