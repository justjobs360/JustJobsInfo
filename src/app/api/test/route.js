import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: 'Test API Working' });
}

export async function POST() {
  return NextResponse.json({ 
    success: true, 
    message: 'Test POST endpoint is working!',
    timestamp: new Date().toISOString()
  });
} 