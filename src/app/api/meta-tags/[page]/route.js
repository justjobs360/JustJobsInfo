import { NextResponse } from 'next/server';
import { getCollection } from '@/utils/mongodb';

export async function GET(request, { params }) {
    try {
        const { page } = params;
        console.log('🔍 Fetching meta tags for page:', page);
        
        if (!page) {
            return NextResponse.json({
                success: false,
                error: 'Page parameter is required'
            }, { status: 400 });
        }
        
        const collection = await getCollection('meta_tags');
        
        // Decode the page parameter (in case it's URL encoded)
        const decodedPage = decodeURIComponent(page);
        
        // Try multiple matching strategies for flexible page matching
        const matchStrategies = [
            // Exact match
            { page: decodedPage },
            // Case-insensitive exact match
            { page: { $regex: new RegExp(`^${decodedPage}$`, 'i') } },
            // Try with common variations
            { page: { $regex: new RegExp(`^${decodedPage.replace('/', '')}$`, 'i') } },
            { page: { $regex: new RegExp(`^/${decodedPage}$`, 'i') } },
            // For home page variations
            ...(decodedPage === 'home' || decodedPage === '' || decodedPage === '/' ? [
                { page: { $regex: new RegExp('^(home|index|\\/)$', 'i') } }
            ] : [])
        ];
        
        let metaTag = null;
        
        // Try each matching strategy until we find a match
        for (const strategy of matchStrategies) {
            metaTag = await collection.findOne({
                ...strategy,
                status: 'active'
            });
            
            if (metaTag) {
                console.log('✅ Found meta tag with strategy:', strategy);
                break;
            }
        }
        
        if (!metaTag) {
            console.log('⚠️ No meta tag found for page:', decodedPage);
            
            // Return default meta tags
            return NextResponse.json({
                success: true,
                data: {
                    page: decodedPage,
                    title: 'JustJobsInfo - Professional Resume and Career Services',
                    description: 'Professional resume writing services, career guidance, and job search resources to help you land your dream job.',
                    keywords: 'resume writing, career services, job search, professional development',
                    ogImage: '/assets/images/logo/logo-dark.png',
                    isDefault: true
                }
            });
        }
        
        // Format the result
        const formattedMetaTag = {
            id: metaTag._id.toString(),
            page: metaTag.page,
            title: metaTag.title,
            description: metaTag.description,
            keywords: metaTag.keywords || '',
            ogImage: metaTag.ogImage || '/assets/images/logo/logo-dark.png',
            status: metaTag.status,
            isDefault: false,
            lastUpdated: metaTag.updatedAt
        };
        
        console.log('✅ Meta tag found for page:', decodedPage);
        
        return NextResponse.json({
            success: true,
            data: formattedMetaTag
        });
        
    } catch (error) {
        console.error('❌ Error fetching meta tag for page:', error);
        
        // Return default meta tags on error
        return NextResponse.json({
            success: true,
            data: {
                page: params.page || 'unknown',
                title: 'JustJobsInfo - Professional Resume and Career Services',
                description: 'Professional resume writing services, career guidance, and job search resources.',
                keywords: 'resume writing, career services, job search',
                ogImage: '/assets/images/logo/logo-dark.png',
                isDefault: true,
                error: 'Failed to fetch custom meta tags'
            }
        });
    }
}
