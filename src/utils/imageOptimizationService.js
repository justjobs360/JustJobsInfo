/**
 * Image Optimization Service
 * Utility functions for optimizing images for SEO and performance
 */

/**
 * Generate optimized image props
 * @param {Object} params - Image parameters
 * @param {string} params.src - Image source URL
 * @param {string} params.alt - Alt text for the image
 * @param {number} params.width - Image width
 * @param {number} params.height - Image height
 * @param {boolean} params.priority - Whether image is above-the-fold (no lazy loading)
 * @param {string} params.sizes - Responsive sizes attribute
 * @returns {Object} Optimized image props
 */
export const getOptimizedImageProps = ({
    src,
    alt,
    width,
    height,
    priority = false,
    sizes = null
}) => {
    // Validate required fields
    if (!src) {
        console.warn('Image source is required');
        return {};
    }
    
    if (!alt) {
        console.warn(`Missing alt text for image: ${src}`);
    }
    
    const props = {
        src,
        alt: alt || 'Image', // Fallback alt text (not ideal but prevents errors)
        loading: priority ? 'eager' : 'lazy',
        decoding: 'async',
    };
    
    // Add dimensions if provided
    if (width) {
        props.width = width;
    }
    
    if (height) {
        props.height = height;
    }
    
    // Add sizes attribute for responsive images
    if (sizes) {
        props.sizes = sizes;
    }
    
    // Generate srcset for responsive images if using WebP
    if (src.endsWith('.webp') || src.endsWith('.jpg') || src.endsWith('.jpeg') || src.endsWith('.png')) {
        props.srcSet = generateSrcSet(src, width);
    }
    
    return props;
};

/**
 * Generate srcset for responsive images
 * @param {string} src - Original image source
 * @param {number} baseWidth - Base width of the image
 * @returns {string} srcset attribute value
 */
export const generateSrcSet = (src, baseWidth) => {
    if (!baseWidth) return '';
    
    const srcBase = src.substring(0, src.lastIndexOf('.'));
    const extension = src.substring(src.lastIndexOf('.'));
    
    // Generate srcset for common breakpoints
    const breakpoints = [320, 640, 768, 1024, 1280, 1536];
    const validBreakpoints = breakpoints.filter(bp => bp <= baseWidth);
    
    if (validBreakpoints.length === 0) {
        return '';
    }
    
    // Create srcset entries
    const srcSetEntries = validBreakpoints.map(width => {
        // In a real implementation, you'd have different image files
        // For now, we'll just reference the original image
        return `${src} ${width}w`;
    });
    
    // Add the original image at full width
    srcSetEntries.push(`${src} ${baseWidth}w`);
    
    return srcSetEntries.join(', ');
};

/**
 * Generate responsive sizes attribute
 * @param {Object} breakpoints - Object with breakpoint sizes
 * @returns {string} sizes attribute value
 */
export const generateSizesAttribute = (breakpoints = {}) => {
    const defaultBreakpoints = {
        sm: '100vw',    // Mobile
        md: '768px',    // Tablet
        lg: '1024px',   // Desktop
        xl: '1280px'    // Large desktop
    };
    
    const sizes = { ...defaultBreakpoints, ...breakpoints };
    
    return `(max-width: 640px) ${sizes.sm}, (max-width: 1024px) ${sizes.md}, (max-width: 1280px) ${sizes.lg}, ${sizes.xl}`;
};

/**
 * Validate image alt text quality
 * @param {string} alt - Alt text to validate
 * @param {string} src - Image source for context
 * @returns {Object} Validation result with suggestions
 */
export const validateAltText = (alt, src) => {
    const issues = [];
    const suggestions = [];
    
    if (!alt || alt.trim() === '') {
        issues.push('Missing alt text');
        suggestions.push('Add descriptive alt text for accessibility');
        return { isValid: false, issues, suggestions };
    }
    
    // Check for common bad practices
    if (alt.toLowerCase().startsWith('image of') || 
        alt.toLowerCase().startsWith('picture of') ||
        alt.toLowerCase().startsWith('photo of')) {
        issues.push('Alt text starts with redundant phrase');
        suggestions.push('Remove "image of", "picture of", or "photo of" from the beginning');
    }
    
    if (alt.length < 10) {
        issues.push('Alt text is too short');
        suggestions.push('Provide more descriptive alt text (at least 10 characters)');
    }
    
    if (alt.length > 125) {
        issues.push('Alt text is too long');
        suggestions.push('Keep alt text under 125 characters for screen readers');
    }
    
    // Check if alt text contains file name
    const fileName = src.split('/').pop().split('.')[0];
    if (alt.toLowerCase().includes(fileName.toLowerCase())) {
        issues.push('Alt text contains file name');
        suggestions.push('Use descriptive text instead of file names');
    }
    
    return {
        isValid: issues.length === 0,
        issues,
        suggestions
    };
};

/**
 * Generate optimized image component props for Next.js Image
 * @param {Object} params - Image parameters
 * @returns {Object} Next.js Image component props
 */
export const getNextImageProps = ({
    src,
    alt,
    width,
    height,
    priority = false,
    quality = 85,
    fill = false,
    objectFit = 'cover',
    sizes = null
}) => {
    const props = {
        src,
        alt: alt || 'Image',
        quality,
        priority,
    };
    
    if (fill) {
        props.fill = true;
        props.style = { objectFit };
        if (sizes) {
            props.sizes = sizes;
        }
    } else {
        if (width) props.width = width;
        if (height) props.height = height;
    }
    
    return props;
};

/**
 * Convert image path to WebP equivalent
 * @param {string} src - Original image source
 * @returns {string} WebP image path
 */
export const getWebPPath = (src) => {
    if (!src) return '';
    
    // Already WebP
    if (src.endsWith('.webp')) return src;
    
    // Replace extension with .webp
    return src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
};

/**
 * Check if browser supports WebP
 * @returns {boolean} True if WebP is supported
 */
export const supportsWebP = () => {
    if (typeof window === 'undefined') return false;
    
    const elem = document.createElement('canvas');
    
    if (elem.getContext && elem.getContext('2d')) {
        return elem.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    }
    
    return false;
};

/**
 * Generate picture element props for WebP with fallback
 * @param {Object} params - Image parameters
 * @returns {Object} Picture element structure
 */
export const getPictureElementProps = ({
    src,
    alt,
    width,
    height,
    loading = 'lazy',
    className = ''
}) => {
    const webpSrc = getWebPPath(src);
    
    return {
        sources: [
            {
                srcSet: webpSrc,
                type: 'image/webp'
            }
        ],
        img: {
            src,
            alt: alt || 'Image',
            width,
            height,
            loading,
            className
        }
    };
};

/**
 * Calculate aspect ratio from dimensions
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @returns {string} Aspect ratio (e.g., "16/9")
 */
export const calculateAspectRatio = (width, height) => {
    if (!width || !height) return '';
    
    const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
    const divisor = gcd(width, height);
    
    return `${width / divisor}/${height / divisor}`;
};

/**
 * Get image dimensions from file (client-side only)
 * @param {string} src - Image source URL
 * @returns {Promise<Object>} Object with width and height
 */
export const getImageDimensions = (src) => {
    return new Promise((resolve, reject) => {
        if (typeof window === 'undefined') {
            reject(new Error('Only available in browser environment'));
            return;
        }
        
        const img = new Image();
        
        img.onload = () => {
            resolve({
                width: img.naturalWidth,
                height: img.naturalHeight,
                aspectRatio: calculateAspectRatio(img.naturalWidth, img.naturalHeight)
            });
        };
        
        img.onerror = () => {
            reject(new Error(`Failed to load image: ${src}`));
        };
        
        img.src = src;
    });
};

/**
 * Optimize image loading based on viewport
 * @param {HTMLImageElement} img - Image element
 * @param {Object} options - Loading options
 */
export const optimizeImageLoading = (img, options = {}) => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
        return;
    }
    
    const {
        rootMargin = '50px',
        threshold = 0.01,
        onLoad = () => {}
    } = options;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const lazyImage = entry.target;
                
                if (lazyImage.dataset.src) {
                    lazyImage.src = lazyImage.dataset.src;
                }
                
                if (lazyImage.dataset.srcset) {
                    lazyImage.srcset = lazyImage.dataset.srcset;
                }
                
                lazyImage.classList.remove('lazy');
                lazyImage.classList.add('loaded');
                
                observer.unobserve(lazyImage);
                onLoad(lazyImage);
            }
        });
    }, {
        rootMargin,
        threshold
    });
    
    observer.observe(img);
};

/**
 * Common image sizes for different use cases
 */
export const IMAGE_SIZES = {
    THUMBNAIL: { width: 150, height: 150 },
    SMALL: { width: 300, height: 200 },
    MEDIUM: { width: 600, height: 400 },
    LARGE: { width: 1200, height: 800 },
    HERO: { width: 1920, height: 1080 },
    OG_IMAGE: { width: 1200, height: 630 },
    LOGO: { width: 200, height: 60 }
};

/**
 * Common responsive sizes strings
 */
export const RESPONSIVE_SIZES = {
    FULL_WIDTH: '100vw',
    HALF_WIDTH: '(min-width: 768px) 50vw, 100vw',
    THIRD_WIDTH: '(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw',
    CONTAINER: '(min-width: 1280px) 1280px, (min-width: 1024px) 1024px, (min-width: 768px) 768px, 100vw'
};

export default {
    getOptimizedImageProps,
    generateSrcSet,
    generateSizesAttribute,
    validateAltText,
    getNextImageProps,
    getWebPPath,
    supportsWebP,
    getPictureElementProps,
    calculateAspectRatio,
    getImageDimensions,
    optimizeImageLoading,
    IMAGE_SIZES,
    RESPONSIVE_SIZES
};

