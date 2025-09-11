"use client";
import { useEffect } from 'react';
import { useMetaTags } from '@/hooks/useMetaTags';

/**
 * Dynamic Meta Tags Component
 * Automatically loads and applies meta tags for a given page
 */
export default function DynamicMetaTags({ pageName, children }) {
    const { metaTags, loading, error } = useMetaTags(pageName);

    // This component doesn't render anything visible - it just handles meta tags
    // The actual meta tag updates are handled by the useMetaTags hook
    
    if (error) {
        // Silently ignore to avoid console noise in production
    }

    return children || null;
}

/**
 * Higher-Order Component for wrapping pages with dynamic meta tags
 */
export function withDynamicMetaTags(WrappedComponent, pageName) {
    const WithMetaTagsComponent = (props) => {
        return (
            <DynamicMetaTags pageName={pageName}>
                <WrappedComponent {...props} />
            </DynamicMetaTags>
        );
    };

    WithMetaTagsComponent.displayName = `withDynamicMetaTags(${WrappedComponent.displayName || WrappedComponent.name})`;
    
    return WithMetaTagsComponent;
}

/**
 * Meta Tags Context Provider (Optional - for more complex scenarios)
 */
import { createContext, useContext } from 'react';

const MetaTagsContext = createContext();

export function MetaTagsProvider({ children, pageName }) {
    const metaTagsData = useMetaTags(pageName);

    return (
        <MetaTagsContext.Provider value={metaTagsData}>
            {children}
        </MetaTagsContext.Provider>
    );
}

export function useMetaTagsContext() {
    const context = useContext(MetaTagsContext);
    if (!context) {
        throw new Error('useMetaTagsContext must be used within a MetaTagsProvider');
    }
    return context;
}
