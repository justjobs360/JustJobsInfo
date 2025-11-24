"use client"
import React, { useState, useEffect } from 'react';
import Nav from './Nav';
import Link from 'next/link';
import { ReactSVG } from 'react-svg';
import SideBar from './SideBar';
import './HeaderOne.css';
import { auth } from '@/config/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Image from 'next/image';

function HeaderOne() {
    const [isSticky, setIsSticky] = useState(false);
    const [user, setUser] = useState(null);
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 150) {
                setIsSticky(true);
            } else {
                setIsSticky(false);
            }
        };

        window.addEventListener('scroll', handleScroll);

        // Clean up the event listener on component unmount
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    useEffect(() => {
        if (!auth) {
            return;
        }
        
        const unsubscribe = auth.onAuthStateChanged((user) => {
            setUser(user);
        });

        return () => unsubscribe();
    }, []);

    // side bar open
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const handleLogout = async () => {
        if (!auth) {
            toast.error('Authentication service is not available');
            return;
        }
        
        try {
            await signOut(auth);
            toast.success('Successfully logged out!');
            router.push('/');
            setShowProfileDropdown(false);
        } catch (error) {
            toast.error('Error logging out. Please try again.');
        }
    };

    const getInitials = (email) => {
        return email ? email[0].toUpperCase() : '';
    };

    const toggleProfileDropdown = () => {
        setShowProfileDropdown(!showProfileDropdown);
    };

    const handleProfileClick = (e) => {
        e.stopPropagation();
        toggleProfileDropdown();
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = () => {
            setShowProfileDropdown(false);
        };

        if (showProfileDropdown) {
            document.addEventListener('click', handleClickOutside);
        }

        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [showProfileDropdown]);

    const [isSearchVisible, setSearchVisible] = useState(false);
    const handleCloseClick = () => {
        setSearchVisible(false);
    };

    const handleBackgroundClick = () => {
        setSearchVisible(false);
    };

    return (
        <div>
            <header className="header-style-one">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="header-wrapper-1">
                                <Link href="/#" className="logo-area">
                                    <Image
                                        className='header-logo'
                                        src="/assets/images/logo/justjobslogo.png"
                                        alt="JustJobs logo"
                                        width={599}
                                        height={188}
                                        priority
                                        sizes="(max-width: 640px) 150px, (max-width: 768px) 180px, 210px"
                                        quality={85}
                                    />
                                </Link>
                                <Nav />
                                <div className="button-area-right-header">
                                    {user ? (
                                        <div className="user-profile-area">
                                            <div className="profile-icon" onClick={handleProfileClick}>
                                                {getInitials(user.email)}
                                            </div>
                                            {showProfileDropdown && (
                                                <div className="profile-dropdown">
                                                    <Link href="/account" className="dropdown-item">
                                                        <i className="fas fa-user me-2"></i>
                                                        My Account
                                                    </Link>
                                                    <Link href="/job-alerts" className="dropdown-item">
                                                        <i className="fas fa-bell me-2"></i>
                                                        Job Alerts
                                                    </Link>
                                                    <button onClick={handleLogout} className="dropdown-item">
                                                        <i className="fas fa-sign-out-alt me-2"></i>
                                                Logout
                                            </button>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                    <a href="/login" className="rts-btn btn-border">
                                        Login
                                        <ReactSVG
                                            src="/assets/images/service/icons/13.svg"
                                            alt="arrow"
                                        />
                                    </a>
                                    )}
                                    <div className="menu-btn-toggle" onClick={toggleSidebar}>
                                        <svg
                                            width={20}
                                            height={16}
                                            viewBox="0 0 20 16"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <rect y={14} width={20} height={2} fill="#1F1F25" />
                                            <rect y={7} width={20} height={2} fill="#1F1F25" />
                                            <rect width={20} height={2} fill="#1F1F25" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <header className={`header-style-one header--sticky  ${isSticky ? 'sticky' : ''}`}>
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="header-wrapper-1">
                                <Link href="/#" className="logo-area">
                                    <Image
                                        className='header-logo'
                                        src="/assets/images/logo/justjobslogo.png"
                                        alt="JustJobs logo"
                                        width={599}
                                        height={188}
                                        sizes="(max-width: 640px) 150px, (max-width: 768px) 180px, 210px"
                                        quality={85}
                                    />
                                </Link>
                                <Nav />
                                <div className="button-area-right-header">
                                    {user ? (
                                        <div className="user-profile-area">
                                            <div className="profile-icon" onClick={handleProfileClick}>
                                                {getInitials(user.email)}
                                            </div>
                                            {showProfileDropdown && (
                                                <div className="profile-dropdown">
                                                    <Link href="/account" className="dropdown-item">
                                                        <i className="fas fa-user me-2"></i>
                                                        My Account
                                                    </Link>
                                                    <Link href="/job-alerts" className="dropdown-item">
                                                        <i className="fas fa-bell me-2"></i>
                                                        Job Alerts
                                                    </Link>
                                                    <button onClick={handleLogout} className="dropdown-item">
                                                        <i className="fas fa-sign-out-alt me-2"></i>
                                                Logout
                                            </button>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <a href="/login" className="rts-btn btn-border">
                                        Login
                                            <ReactSVG
                                            src="/assets/images/service/icons/13.svg"
                                            alt="arrow"
                                        />
                                    </a>
                                    )}
                                    <div id="menu-btn" className="menu-btn-toggle" onClick={toggleSidebar}>
                                        <svg
                                            width={20}
                                            height={16}
                                            viewBox="0 0 20 16"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <rect y={14} width={20} height={2} fill="#1F1F25" />
                                            <rect y={7} width={20} height={2} fill="#1F1F25" />
                                            <rect width={20} height={2} fill="#1F1F25" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>
            <div id="anywhere-home" className={isSearchVisible ? 'bgshow' : ''} onClick={handleBackgroundClick}></div>
            <SideBar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        </div>
    )
}

export default HeaderOne
