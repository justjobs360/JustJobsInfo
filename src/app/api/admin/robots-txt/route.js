import { NextResponse } from 'next/server';
import { getCollection } from '@/utils/mongodb';

export async function GET(request) {
    try {
        console.log('📋 Fetching robots.txt content...');
        
        const collection = await getCollection('robots_txt');
        
        // Fetch the single robots.txt document
        const robotsTxt = await collection.findOne({});
        
        if (!robotsTxt) {
            // Return default robots.txt content
            const defaultContent = `User-agent: *
Allow: /

# Disallow admin areas
Disallow: /admin/
Disallow: /api/

# Allow specific paths
Allow: /api/blogs/
Allow: /api/jobs/

# Sitemap
Sitemap: https://justjobs.info/sitemap.xml

# Crawl delay (optional)
Crawl-delay: 1`;
            
            console.log('✅ Returning default robots.txt content');
            
            return NextResponse.json({
                success: true,
                data: {
                    content: defaultContent,
                    updatedAt: new Date()
                },
                isDefault: true
            });
        }
        
        console.log('✅ Robots.txt content fetched successfully');
        
        return NextResponse.json({
            success: true,
            data: {
                id: robotsTxt._id.toString(),
                content: robotsTxt.content,
                createdAt: robotsTxt.createdAt,
                updatedAt: robotsTxt.updatedAt
            }
        });
        
    } catch (error) {
        console.error('❌ Error fetching robots.txt content:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch robots.txt content',
            details: error.message
        }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        console.log('🔄 Updating robots.txt content...');
        
        const body = await request.json();
        const { content } = body;
        
        // Validate content
        if (!content || !content.trim()) {
            return NextResponse.json({
                success: false,
                error: 'Robots.txt content is required'
            }, { status: 400 });
        }
        
        const collection = await getCollection('robots_txt');
        
        // Check if robots.txt already exists
        const existingRobotsTxt = await collection.findOne({});
        
        const robotsData = {
            content: content.trim(),
            updatedAt: new Date()
        };
        
        if (existingRobotsTxt) {
            // Update existing robots.txt
            console.log('💾 Updating existing robots.txt');
            
            const result = await collection.updateOne(
                {},
                { $set: robotsData }
            );
            
            if (result.modifiedCount > 0 || result.matchedCount > 0) {
                const updatedRobotsTxt = await collection.findOne({});
                
                console.log('✅ Robots.txt updated successfully');
                
                return NextResponse.json({
                    success: true,
                    data: {
                        id: updatedRobotsTxt._id.toString(),
                        ...robotsData
                    },
                    message: 'Robots.txt updated successfully'
                });
            }
        } else {
            // Create new robots.txt document
            console.log('💾 Creating new robots.txt');
            
            robotsData.createdAt = new Date();
            
            const result = await collection.insertOne(robotsData);
            
            if (result.acknowledged) {
                console.log('✅ Robots.txt created successfully');
                
                return NextResponse.json({
                    success: true,
                    data: {
                        id: result.insertedId.toString(),
                        ...robotsData
                    },
                    message: 'Robots.txt created successfully'
                });
            }
        }
        
        throw new Error('Failed to save robots.txt');
        
    } catch (error) {
        console.error('❌ Error updating robots.txt:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to update robots.txt',
            details: error.message
        }, { status: 500 });
    }
}

