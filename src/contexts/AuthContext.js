"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import UserRoleService, { USER_ROLES } from '@/utils/userRoleService';

const AuthContext = createContext({});

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const [auth, setAuth] = useState(null);

    useEffect(() => {
        // Only initialize Firebase on the client side - defer for better mobile performance
        if (typeof window !== 'undefined') {
            // Use requestIdleCallback to defer Firebase initialization on mobile
            const initFirebase = () => {
                import('@/config/firebase').then(({ auth: firebaseAuth }) => {
                    setAuth(firebaseAuth);
                    
                    const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
                        console.log('AuthStateChanged:', user?.email);
                        setUser(user);
                        
                        // Get user role if authenticated
                        if (user) {
                            try {
                                console.log('Fetching user role for:', user.uid);
                                const roleData = await UserRoleService.getUserRole(user.uid);
                                console.log('User role data:', roleData);
                                setUserRole(roleData);
                            } catch (error) {
                                console.error('Error getting user role:', error);
                                setUserRole({ role: USER_ROLES.USER, permissions: [] });
                            }
                        } else {
                            console.log('No user, setting userRole to null');
                            setUserRole(null);
                        }
                        
                        setLoading(false);
                    });

                    return () => unsubscribe();
                }).catch((error) => {
                    console.error('Firebase initialization error:', error);
                    setLoading(false);
                });
            };

            // Defer Firebase initialization to improve initial page load
            if (typeof requestIdleCallback !== 'undefined') {
                requestIdleCallback(initFirebase, { timeout: 3000 });
            } else {
                // Fallback: delay by 500ms to let critical resources load first
                setTimeout(initFirebase, 500);
            }
        } else {
            setLoading(false);
        }
    }, []);

    const logout = async () => {
        if (!auth) {
            console.error('Firebase auth not initialized');
            return;
        }
        
        try {
            await signOut(auth);
            setUser(null);
            setUserRole(null);
        } catch (error) {
            console.error('Error signing out:', error);
            throw error;
        }
    };

    // Helper functions for role checking
    const isAdmin = () => {
        const result = userRole?.role === USER_ROLES.ADMIN || userRole?.role === USER_ROLES.SUPER_ADMIN;
        console.log('isAdmin check:', { userRole: userRole?.role, result });
        return result;
    };

    const isSuperAdmin = () => {
        const result = userRole?.role === USER_ROLES.SUPER_ADMIN;
        console.log('isSuperAdmin check:', { userRole: userRole?.role, result });
        return result;
    };

    const hasPermission = (permission) => {
        const result = userRole?.permissions?.includes(permission) || false;
        console.log('hasPermission check:', { permission, permissions: userRole?.permissions, result });
        return result;
    };

    const value = {
        user,
        userRole,
        isAuthenticated: !!user,
        isAdmin: isAdmin(),
        isSuperAdmin, // Pass the function reference, not the result
        hasPermission,
        loading,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}; 
