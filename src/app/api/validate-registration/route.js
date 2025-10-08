import { NextResponse } from 'next/server';
import { validateRegistrationData, getClientIP } from '@/utils/spamProtection';

export async function POST(request) {
    try {
        const data = await request.json();
        const clientIP = getClientIP(request);

        // Comprehensive validation
        const validation = validateRegistrationData(data, clientIP);

        if (!validation.isValid) {
            return NextResponse.json(
                { 
                    success: false, 
                    message: validation.errors[0], // Return first error
                    errors: validation.errors 
                },
                { status: 400 }
            );
        }

        // If validation passes, return success with rate limit info
        return NextResponse.json({
            success: true,
            message: 'Validation passed',
            rateLimitInfo: validation.rateLimitInfo
        });

    } catch (error) {
        return NextResponse.json(
            { 
                success: false, 
                message: 'Server validation error. Please try again.' 
            },
            { status: 500 }
        );
    }
} 
