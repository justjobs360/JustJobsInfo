import { NextResponse } from 'next/server';
import { getCollection } from '@/utils/mongodb';

export async function POST(request) {
    try {
        console.log('📦 Processing bulk meta tags import...');
        
        const body = await request.json();
        const { metaTags, mode } = body;
        
        // Validate input
        if (!metaTags || !Array.isArray(metaTags) || metaTags.length === 0) {
            return NextResponse.json({
                success: false,
                error: 'MetaTags array is required and must not be empty'
            }, { status: 400 });
        }
        
        const collection = await getCollection('meta_tags');
        const results = {
            success: [],
            failed: [],
            skipped: []
        };
        
        // If mode is 'replace', clear existing meta tags
        if (mode === 'replace') {
            console.log('🗑️ Clearing existing meta tags...');
            await collection.deleteMany({});
        }
        
        // Process each meta tag
        for (const tag of metaTags) {
            try {
                // Validate required fields
                if (!tag.page || !tag.title || !tag.description) {
                    results.failed.push({
                        page: tag.page || 'unknown',
                        error: 'Missing required fields (page, title, description)'
                    });
                    continue;
                }
                
                // Check if meta tag already exists
                if (mode !== 'replace') {
                    const existingTag = await collection.findOne({ 
                        page: { $regex: new RegExp(`^${tag.page}$`, 'i') } 
                    });
                    
                    if (existingTag) {
                        if (mode === 'skip') {
                            results.skipped.push({
                                page: tag.page,
                                reason: 'Already exists'
                            });
                            continue;
                        } else if (mode === 'update') {
                            // Update existing tag
                            await collection.updateOne(
                                { _id: existingTag._id },
                                {
                                    $set: {
                                        title: tag.title,
                                        description: tag.description,
                                        keywords: tag.keywords || '',
                                        ogImage: tag.ogImage || '',
                                        canonicalUrl: tag.canonicalUrl || `https://justjobs.info${tag.page}`,
                                        status: tag.status || 'active',
                                        updatedAt: new Date()
                                    }
                                }
                            );
                            
                            results.success.push({
                                page: tag.page,
                                action: 'updated'
                            });
                            continue;
                        }
                    }
                }
                
                // Insert new meta tag
                const newMetaTag = {
                    page: tag.page.trim(),
                    title: tag.title.trim(),
                    description: tag.description.trim(),
                    keywords: tag.keywords?.trim() || '',
                    ogImage: tag.ogImage?.trim() || '/assets/images/logo/logo-dark.png',
                    canonicalUrl: tag.canonicalUrl || `https://justjobs.info${tag.page}`,
                    status: tag.status || 'active',
                    createdAt: new Date(),
                    updatedAt: new Date()
                };
                
                const result = await collection.insertOne(newMetaTag);
                
                if (result.acknowledged) {
                    results.success.push({
                        page: tag.page,
                        action: 'created',
                        id: result.insertedId.toString()
                    });
                } else {
                    results.failed.push({
                        page: tag.page,
                        error: 'Failed to insert'
                    });
                }
                
            } catch (error) {
                results.failed.push({
                    page: tag.page,
                    error: error.message
                });
            }
        }
        
        console.log('✅ Bulk import completed');
        console.log(`   Success: ${results.success.length}`);
        console.log(`   Failed: ${results.failed.length}`);
        console.log(`   Skipped: ${results.skipped.length}`);
        
        return NextResponse.json({
            success: true,
            message: `Bulk import completed: ${results.success.length} successful, ${results.failed.length} failed, ${results.skipped.length} skipped`,
            results: results
        });
        
    } catch (error) {
        console.error('❌ Error in bulk import:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to import meta tags',
            details: error.message
        }, { status: 500 });
    }
}

