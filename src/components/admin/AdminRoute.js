"use client";
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { USER_ROLES } from '@/utils/userRoleService';

const AdminRoute = ({ children, requiredPermission = null, requiredRole = USER_ROLES.ADMIN }) => {
    const { user, userRole, isAuthenticated, isAdmin, hasPermission, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!isAuthenticated) {
                router.push('/login?redirect=/admin');
                return;
            }
            if (!isAdmin) {
                router.push('/');
                return;
            }
            if (requiredRole === USER_ROLES.SUPER_ADMIN && userRole?.role !== USER_ROLES.SUPER_ADMIN) {
                router.push('/admin');
                return;
            }
            if (requiredPermission && !hasPermission(requiredPermission)) {
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
        return null;
    }

    if (requiredRole === USER_ROLES.SUPER_ADMIN && userRole?.role !== USER_ROLES.SUPER_ADMIN) {
        return null;
    }

    if (requiredPermission && !hasPermission(requiredPermission)) {
        return null;
    }
    return <>{children}</>;
};

export default AdminRoute; 
