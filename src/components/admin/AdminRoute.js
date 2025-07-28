"use client";
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { USER_ROLES } from '@/utils/userRoleService';

const AdminRoute = ({ children, requiredPermission = null, requiredRole = USER_ROLES.ADMIN }) => {
    const { user, userRole, isAuthenticated, isAdmin, hasPermission, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        console.log('AdminRoute Debug:', {
            loading,
            isAuthenticated,
            isAdmin,
            userRole,
            user: user?.email,
            requiredPermission,
            requiredRole
        });

        if (!loading) {
            if (!isAuthenticated) {
                console.log('Redirecting to login - not authenticated');
                router.push('/login?redirect=/admin');
                return;
            }
            if (!isAdmin) {
                console.log('Redirecting to home - not admin');
                router.push('/');
                return;
            }
            if (requiredRole === USER_ROLES.SUPER_ADMIN && userRole?.role !== USER_ROLES.SUPER_ADMIN) {
                console.log('Redirecting to admin - not super admin');
                router.push('/admin');
                return;
            }
            if (requiredPermission && !hasPermission(requiredPermission)) {
                console.log('Redirecting to admin - no permission:', requiredPermission);
                router.push('/admin');
                return;
            }
        }
    }, [loading, isAuthenticated, isAdmin, userRole, hasPermission, requiredPermission, requiredRole, router]);

    if (loading) {
        return (
            <div className="rts-section-gap" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="loading-spinner" style={{ width: '50px', height: '50px', border: '3px solid #f3f3f3', borderTop: '3px solid var(--color-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                <style jsx>{`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        );
    }

    if (!isAuthenticated || !isAdmin) {
        console.log('AdminRoute: Not rendering - not authenticated or not admin');
        return null;
    }

    if (requiredRole === USER_ROLES.SUPER_ADMIN && userRole?.role !== USER_ROLES.SUPER_ADMIN) {
        console.log('AdminRoute: Not rendering - not super admin');
        return null;
    }

    if (requiredPermission && !hasPermission(requiredPermission)) {
        console.log('AdminRoute: Not rendering - no permission:', requiredPermission);
        return null;
    }

    console.log('AdminRoute: Rendering children');
    return <>{children}</>;
};

export default AdminRoute; 