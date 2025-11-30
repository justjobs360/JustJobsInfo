import { NextResponse } from 'next/server';
import { generateStaticSitemap } from '@/utils/generateSitemap';

// POST /api/admin/generate-sitemap - Generate sitemap XML
export async function POST(request) {
    try {
        console.log('🗺️ Generating sitemap XML...');
        
        // Generate sitemap without writing to disk (just get XML)
        const result = await generateStaticSitemap({ writeToDisk: false });
        
        if (result.success && result.xml) {
            console.log('✅ Sitemap generated successfully');
            return NextResponse.json({
                success: true,
                count: result.count,
                xml: result.xml,
                message: `Sitemap generated successfully with ${result.count} URLs`
            });
        } else {
            console.error('❌ Sitemap generation failed:', result.error);
            return NextResponse.json({
                success: false,
                error: result.error || 'Failed to generate sitemap',
                message: result.message || 'Sitemap generation failed'
            }, { status: 500 });
        }
        
    } catch (error) {
        console.error('❌ Error in generate-sitemap API:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to generate sitemap',
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 500 });
    }
}

// GET /api/admin/generate-sitemap - Get sitemap status/info
export async function GET(request) {
    try {
        // Just return info about sitemap generation
        return NextResponse.json({
            success: true,
            message: 'Use POST to generate sitemap'
        });
    } catch (error) {
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}

