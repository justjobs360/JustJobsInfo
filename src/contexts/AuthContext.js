"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';

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
    const [loading, setLoading] = useState(true);
    const [auth, setAuth] = useState(null);

    useEffect(() => {
        // Only initialize Firebase on the client side
        if (typeof window !== 'undefined') {
            import('@/config/firebase').then(({ auth: firebaseAuth }) => {
                setAuth(firebaseAuth);
                
                const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
                    setUser(user);
                    setLoading(false);
                });

                return () => unsubscribe();
            }).catch((error) => {
                console.error('Firebase initialization error:', error);
                setLoading(false);
            });
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
        } catch (error) {
            console.error('Error signing out:', error);
            throw error;
        }
    };

    const value = {
        user,
        isAuthenticated: !!user,
        loading,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}; 