"use client"
import Nav from './Nav';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import SideBar from './SideBar';
function HeaderThree() {
    // sticky start
    const [isSticky, setIsSticky] = useState(false);
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
    // sticky end

    // side bar open
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };
    const [isSearchVisible, setSearchVisible] = useState(false);
    const handleCloseClick = () => {
        setSearchVisible(false);
    };

    const handleBackgroundClick = () => {
        setSearchVisible(false);
    };

    return (
        <div>

            {/* header four area start */}
            <header className={`header-area-four style-five header--sticky  ${isSticky ? 'sticky' : ''}`}>
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="header-four-wrapper">
                                <Link href="/#" className="logo">
                                    <img src="assets/images/logo/logo-1.svg" alt="logo" />
                                </Link>
                                <Nav />
                                <div className="button-area-right-header">
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
            <div id="anywhere-home" className={isSearchVisible ? 'bgshow' : ''} onClick={handleBackgroundClick}></div>
            <SideBar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        </div>
    )
}

export default HeaderThree