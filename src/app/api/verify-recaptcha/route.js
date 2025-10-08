import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const body = await request.json();
        const { token } = body;

        if (!token) {
            return NextResponse.json(
                { success: false, message: 'reCAPTCHA token is required' },
                { status: 400 }
            );
        }

        const secretKey = process.env.RECAPTCHA_SECRET_KEY;
        if (!secretKey) {
            return NextResponse.json(
                { success: false, message: 'reCAPTCHA not configured on server' },
                { status: 500 }
            );
        }

        // Verify the token with Google
        const verificationResponse = await fetch('https://www.google.com/recaptcha/api/siteverify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                secret: secretKey,
                response: token,
            }),
        });

        const verificationResult = await verificationResponse.json();

        if (verificationResult.success) {
            return NextResponse.json({ 
                success: true, 
                message: 'reCAPTCHA verified successfully' 
            });
        } else {
            return NextResponse.json({
                success: false,
                message: 'reCAPTCHA verification failed',
                errors: verificationResult['error-codes']
            }, { status: 400 });
        }

    } catch (error) {
        return NextResponse.json(
            { success: false, message: 'reCAPTCHA verification error' },
            { status: 500 }
        );
    }
} 
