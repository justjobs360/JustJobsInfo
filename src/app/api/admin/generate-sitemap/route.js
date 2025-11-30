import { NextResponse } from 'next/server';
import { generateStaticSitemap } from '@/utils/generateSitemap';

// POST /api/admin/generate-sitemap - Generate and write static sitemap
export async function POST(request) {
    try {
        console.log('🗺️ Generating static sitemap via API...');
        
        const result = await generateStaticSitemap({ writeToDisk: true });
        
        if (result.success) {
            if (result.warning) {
                console.log('⚠️ Sitemap generated with warning:', result.warning);
                return NextResponse.json({
                    success: true,
                    count: result.count,
                    path: result.path || null,
                    warning: result.warning,
                    message: 'Sitemap generated successfully (with warning)',
                    // In serverless, return XML for admin to see
                    xml: result.xml ? result.xml.substring(0, 500) + '...' : null
                });
            }
            
            console.log('✅ Static sitemap generated successfully');
            return NextResponse.json({
                success: true,
                count: result.count,
                path: result.path || null,
                message: `Sitemap generated successfully with ${result.count} URLs`
            });
        } else {
            console.error('❌ Sitemap generation failed:', result.error);
            return NextResponse.json({
                success: false,
                error: result.error || 'Failed to generate sitemap',
                message: result.message || 'Sitemap generation failed',
                // Return XML if available even on failure
                xml: result.xml ? result.xml.substring(0, 500) + '...' : null
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
            message: 'Use POST to generate sitemap',
            note: 'In serverless environments, sitemap must be generated at build time'
        });
    } catch (error) {
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}

