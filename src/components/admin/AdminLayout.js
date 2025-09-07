"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { logout } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import AdminRoute from './AdminRoute';
import { ADMIN_PERMISSIONS } from '@/utils/userRoleService';
import '../../app/admin/admin.css';

const AdminLayout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user, userRole, logout, hasPermission } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    const handleLogout = async () => {
        try {
            await logout();
            toast.success('Logged out successfully');
            router.push('/');
        } catch (error) {
            toast.error('Error logging out');
        }
    };

    const navigation = [
        // Dashboard
        {
            name: 'Dashboard',
            href: '/admin',
            icon: '📊',
            permission: ADMIN_PERMISSIONS.VIEW_DASHBOARD
        },
        
        // Blog Management (for both super admin and admin)
        {
            name: 'Blog Posts',
            href: '/admin/blog',
            icon: '📰',
            permission: ADMIN_PERMISSIONS.MANAGE_BLOG_POSTS
        },
        
        // SEO Management (for both super admin and admin)
        {
            name: 'SEO Settings',
            href: '/admin/seo/settings',
            icon: '⚙️',
            permission: ADMIN_PERMISSIONS.MANAGE_SEO
        },
        {
            name: 'Meta Tags',
            href: '/admin/seo/meta-tags',
            icon: '🏷️',
            permission: ADMIN_PERMISSIONS.MANAGE_META_TAGS
        },
        {
            name: 'Sitemap',
            href: '/admin/seo/sitemap',
            icon: '🗺️',
            permission: ADMIN_PERMISSIONS.MANAGE_SITEMAP
        },
        {
            name: 'Robots.txt',
            href: '/admin/seo/robots',
            icon: '🤖',
            permission: ADMIN_PERMISSIONS.MANAGE_ROBOTS_TXT
        },
        

        {
            name: 'Resume Audit Stats',
            href: '/admin/resume/stats',
            icon: '📈',
            permission: ADMIN_PERMISSIONS.VIEW_ANALYTICS
        },
        {
            name: 'Resume Templates',
            href: '/admin/resume/templates',
            icon: '📄',
            permission: ADMIN_PERMISSIONS.MANAGE_CONTENT
        },

        // Important Links Management (for both super admin and admin)
        {
            name: 'Important Links',
            href: '/admin/important-links',
            icon: '🔗',
            permission: ADMIN_PERMISSIONS.MANAGE_CONTENT
        },
        
        // Downloadable Resources Management (for both super admin and admin)
        {
            name: 'Downloadable Resources',
            href: '/admin/downloadable-resources',
            icon: '📥',
            permission: ADMIN_PERMISSIONS.MANAGE_CONTENT
        },
        
        // Contact Forms (super admin only)
        {
            name: 'Contact Forms',
            href: '/admin/contact-forms',
            icon: '📧',
            permission: null, // Super admin only
            superAdminOnly: true
        },
        
        // Job Listings (super admin only)
        {
            name: 'Job Listings',
            href: '/admin/jobs',
            icon: '💼',
            permission: null, // Super admin only
            superAdminOnly: true
        },
        
        // Admin Management (super admin only)
        {
            name: 'Admin Management',
            href: '/admin/admins',
            icon: '👑',
            permission: null, // Super admin only
            superAdminOnly: true
        }
    ];

    const isActive = (href) => {
        return pathname === href;
    };

    const isSuperAdmin = () => {
        return userRole?.role === 'super_admin';
    };

    return (
        <AdminRoute>
            <div className="admin-layout">
                {/* Sidebar */}
                <div className={`admin-sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
                    <div className="sidebar-header">
                        <h1 className="sidebar-title">Admin Panel</h1>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="sidebar-close-btn"
                        >
                            ✕
                        </button>
                    </div>
                    
                    <nav className="sidebar-nav">
                        <div className="nav-list">
                            {navigation.map((item) => {
                                // Check if user has permission for this item
                                const hasAccess = !item.permission || hasPermission(item.permission);
                                
                                // Check if item is super admin only
                                const isSuperAdminOnly = item.superAdminOnly && !isSuperAdmin();
                                
                                if (!hasAccess || isSuperAdminOnly) return null;
                                
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={`nav-item ${isActive(item.href) ? 'nav-item-active' : ''}`}
                                    >
                                        <span style={{ marginRight: '12px', fontSize: '18px' }}>{item.icon}</span>
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </div>
                    </nav>
                </div>

                {/* Main content */}
                <div className="admin-main">
                    {/* Header */}
                    <header className="admin-header">
                        <div className="header-content">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="sidebar-toggle"
                            >
                                ☰
                            </button>
                            
                            <div className="header-user">
                                <div className="user-info">
                                    <span>Welcome, {user?.email}</span>
                                    {userRole?.role && (
                                        <span className="user-role">
                                            {userRole.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                                        </span>
                                    )}
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="logout-btn"
                                >
                                    Logout
                                </button>
                            </div>
                        </div>
                    </header>

                    {/* Page content */}
                    <main className="admin-content">
                        {children}
                    </main>
                </div>

                {/* Mobile overlay */}
                {sidebarOpen && (
                    <div
                        className="sidebar-overlay"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}
            </div>
        </AdminRoute>
    );
};

export default AdminLayout; 