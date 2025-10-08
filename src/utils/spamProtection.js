// Spam Protection Utilities

// Rate limiting storage (in production, use Redis or database)
const rateLimitMap = new Map();

// Email domain validation
export const validateEmailDomain = (email) => {
    const blockedDomains = process.env.BLOCKED_EMAIL_DOMAINS?.split(',') || [
        '1.com', 'temp-mail.org', '10minutemail.com', 'mailinator.com', 
        'guerrillamail.com', 'tempmail.email', 'throwaway.email',
        'getnada.com', 'maildrop.cc', 'yopmail.com'
    ];

    const domain = email.split('@')[1]?.toLowerCase();
    
    if (blockedDomains.includes(domain)) {
        return {
            isValid: false,
            reason: 'Temporary email addresses are not allowed'
        };
    }

    // Check for suspicious patterns
    const suspiciousPatterns = [
        /\d{4,}\.com$/,  // domains like 1234.com
        /^[a-z]\.com$/,  // single letter domains
        /test|fake|spam|temp/i,
        /^\d+\.[a-z]+$/  // numeric domains
    ];

    for (const pattern of suspiciousPatterns) {
        if (pattern.test(domain)) {
            return {
                isValid: false,
                reason: 'Email domain appears to be temporary or suspicious'
            };
        }
    }

    return { isValid: true };
};

// Enhanced email validation
export const validateEmail = (email) => {
    // Basic format check
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
        return {
            isValid: false,
            reason: 'Invalid email format'
        };
    }

    // Check for suspicious patterns in username
    const username = email.split('@')[0];
    
    // Relaxed: Allow more numbers in username (increased from 70% to 90%)
    if ((username.match(/\d/g) || []).length > username.length * 0.9) {
        return {
            isValid: false,
            reason: 'Email appears to be automatically generated'
        };
    }

    // Relaxed: Only check for obvious spam patterns, not university patterns
    const spamPatterns = [
        /test\d{4,}/i,
        /fake\d{4,}/i,
        /spam\d{4,}/i
    ];

    for (const pattern of spamPatterns) {
        if (pattern.test(username)) {
            return {
                isValid: false,
                reason: 'Email appears to be temporary or spam'
            };
        }
    }

    // Domain validation
    return validateEmailDomain(email);
};

// Simple name validation - just check if it exists
export const validateName = (name) => {
    const trimmedName = name.trim();
    
    if (trimmedName.length === 0) {
        return {
            isValid: false,
            reason: 'Name is required'
        };
    }

    return { isValid: true };
};

// Password strength validation
export const validatePasswordStrength = (password) => {
    if (password.length < 6) {
        return {
            isValid: false,
            reason: 'Password must be at least 6 characters long'
        };
    }

    const checks = {
        hasUpperCase: /[A-Z]/.test(password),
        hasLowerCase: /[a-z]/.test(password),
        hasNumbers: /\d/.test(password),
        hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        // Removed hasNoSequential check - no longer blocking common sequences
    };

    const passedChecks = Object.values(checks).filter(Boolean).length;

    if (passedChecks < 2) {
        return {
            isValid: false,
            reason: 'Password must contain at least 2 of: uppercase letters, lowercase letters, numbers, special characters'
        };
    }

    // Removed common sequence check
    // if (!checks.hasNoSequential) {
    //     return {
    //         isValid: false,
    //         reason: 'Password cannot contain common sequences or words'
    //     };
    // }

    return { isValid: true };
};

// Rate limiting check
export const checkRateLimit = (identifier) => {
    const now = Date.now();
    const windowMs = parseInt(process.env.REGISTRATION_RATE_LIMIT_WINDOW_MINUTES || '60') * 60 * 1000;
    const maxAttempts = parseInt(process.env.REGISTRATION_RATE_LIMIT_PER_IP || '5');

    if (!rateLimitMap.has(identifier)) {
        rateLimitMap.set(identifier, { attempts: 1, firstAttempt: now });
        return { allowed: true, remainingAttempts: maxAttempts - 1 };
    }

    const record = rateLimitMap.get(identifier);
    
    // Reset if window has passed
    if (now - record.firstAttempt > windowMs) {
        rateLimitMap.set(identifier, { attempts: 1, firstAttempt: now });
        return { allowed: true, remainingAttempts: maxAttempts - 1 };
    }

    // Check if limit exceeded
    if (record.attempts >= maxAttempts) {
        const timeRemaining = windowMs - (now - record.firstAttempt);
        return { 
            allowed: false, 
            timeRemaining: Math.ceil(timeRemaining / 60000), // minutes
            message: `Too many registration attempts. Please try again in ${Math.ceil(timeRemaining / 60000)} minutes.`
        };
    }

    // Increment attempts
    record.attempts++;
    return { allowed: true, remainingAttempts: maxAttempts - record.attempts };
};

// Honeypot validation
export const validateHoneypot = (honeypotValue) => {
    // Honeypot field should always be empty for legitimate users
    return honeypotValue === '' || honeypotValue === undefined;
};

// Get client IP (for rate limiting)
export const getClientIP = (request) => {
    const forwarded = request.headers.get('x-forwarded-for');
    const real = request.headers.get('x-real-ip');
    const remote = request.headers.get('x-remote-addr');
    
    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }
    if (real) {
        return real.trim();
    }
    if (remote) {
        return remote.trim();
    }
    
    return 'unknown';
};

// Comprehensive registration validation
export const validateRegistrationData = (data, clientIP) => {
    const errors = [];

    // Rate limiting
    const rateLimitCheck = checkRateLimit(clientIP);
    if (!rateLimitCheck.allowed) {
        errors.push(rateLimitCheck.message);
        return { isValid: false, errors };
    }

    // Honeypot check
    const honeypotField = process.env.HONEYPOT_FIELD_NAME || 'website_url';
    if (!validateHoneypot(data[honeypotField])) {
        errors.push('Spam detected');
        return { isValid: false, errors };
    }

    // Name validation (just check if it exists)
    const nameValidation = validateName(data.name);
    if (!nameValidation.isValid) {
        errors.push(nameValidation.reason);
    }

    // Email validation
    const emailValidation = validateEmail(data.email);
    if (!emailValidation.isValid) {
        errors.push(emailValidation.reason);
    }

    // Password validation
    const passwordValidation = validatePasswordStrength(data.password);
    if (!passwordValidation.isValid) {
        errors.push(passwordValidation.reason);
    }

    return {
        isValid: errors.length === 0,
        errors,
        rateLimitInfo: rateLimitCheck
    };
}; 
