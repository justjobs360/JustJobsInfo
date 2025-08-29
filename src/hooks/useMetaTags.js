"use client";
import { useState, useEffect } from 'react';
import { getMetaTagsForPage, getDefaultMetaTags, updateDocumentMeta } from '@/utils/metaTagsService';

/**
 * Custom hook for managing dynamic meta tags
 * @param {string} pageName - The name of the page to load meta tags for
 * @returns {object} - Object containing metaTags, loading state, and error state
 */
export const useMetaTags = (pageName) => {
    const [metaTags, setMetaTags] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadMetaTags = async () => {
            try {
                setLoading(true);
                setError(null);
                
                console.log('🔍 useMetaTags: Loading meta tags for:', pageName);
                
                const tags = await getMetaTagsForPage(pageName);
                setMetaTags(tags);
                
                // Update document meta tags
                updateDocumentMeta(tags);
                
                console.log('✅ useMetaTags: Meta tags loaded and applied for:', pageName);
                
            } catch (err) {
                console.error('❌ useMetaTags: Error loading meta tags:', err);
                setError(err.message);
                
                // Use default meta tags as fallback
                const defaultTags = getDefaultMetaTags(pageName);
                setMetaTags(defaultTags);
                updateDocumentMeta(defaultTags);
                
            } finally {
                setLoading(false);
            }
        };
        
        if (pageName) {
            loadMetaTags();
        }
    }, [pageName]);
    
    return { metaTags, loading, error };
};

/**
 * Hook for server-side rendering compatible meta tags
 * This version doesn't update the document automatically
 */
export const useMetaTagsSSR = (pageName) => {
    const [metaTags, setMetaTags] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadMetaTags = async () => {
            try {
                setLoading(true);
                setError(null);
                
                const tags = await getMetaTagsForPage(pageName);
                setMetaTags(tags);
                
            } catch (err) {
                console.error('Error loading meta tags (SSR):', err);
                setError(err.message);
                
                const defaultTags = getDefaultMetaTags(pageName);
                setMetaTags(defaultTags);
                
            } finally {
                setLoading(false);
            }
        };
        
        if (pageName) {
            loadMetaTags();
        }
    }, [pageName]);
    
    return { metaTags, loading, error };
};

export default useMetaTags;
