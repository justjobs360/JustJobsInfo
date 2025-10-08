import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🔍 Checking environment variables...');
    
    const requiredVars = [
      'FIREBASE_PROJECT_ID',
      'FIREBASE_CLIENT_EMAIL',
      'FIREBASE_PRIVATE_KEY'
    ];

    const envStatus = {};
    let allPresent = true;

    requiredVars.forEach(varName => {
      const value = process.env[varName];
      const isPresent = !!value;
      const isPartial = value && value.length > 10; // Basic check for meaningful value
      
      envStatus[varName] = {
        present: isPresent,
        partial: isPartial,
        length: value ? value.length : 0
      };

      if (!isPresent) {
        allPresent = false;
      }
    });

    console.log('📋 Environment status:', envStatus);

    return NextResponse.json({
      success: allPresent,
      message: allPresent ? 'All required environment variables are present' : 'Some environment variables are missing',
      environment: envStatus,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Environment check error:', error);
    return NextResponse.json({
      success: false,
      error: `Environment check failed: ${error.message}`
    }, { status: 500 });
  }
} 
