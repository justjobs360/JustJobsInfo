import { NextResponse } from 'next/server';
import { getCollection } from '@/utils/mongodb';

export async function GET(request) {
    try {
        console.log('📋 Fetching sitemap configuration...');
        
        const collection = await getCollection('sitemap_config');
        
        // Fetch all sitemap URLs
        const sitemapUrls = await collection.find({}).sort({ priority: -1, url: 1 }).toArray();
        
        if (sitemapUrls.length === 0) {
            console.log('✅ No sitemap configuration found, returning empty');
            
            return NextResponse.json({
                success: true,
                data: {
                    urls: [],
                    totalPages: 0,
                    lastGenerated: null
                },
                isDefault: true
            });
        }
        
        const formattedUrls = sitemapUrls.map(url => ({
            id: url._id.toString(),
            url: url.url,
            priority: url.priority,
            changefreq: url.changefreq,
            lastmod: url.lastmod,
            createdAt: url.createdAt,
            updatedAt: url.updatedAt
        }));
        
        console.log('✅ Sitemap configuration fetched successfully:', formattedUrls.length, 'URLs');
        
        return NextResponse.json({
            success: true,
            data: {
                urls: formattedUrls,
                totalPages: formattedUrls.length,
                lastGenerated: formattedUrls[0]?.updatedAt || null
            }
        });
        
    } catch (error) {
        console.error('❌ Error fetching sitemap configuration:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch sitemap configuration',
            details: error.message
        }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        console.log('📝 Creating/updating sitemap configuration...');
        
        const body = await request.json();
        const { urls } = body;
        
        // Validate URLs array
        if (!urls || !Array.isArray(urls) || urls.length === 0) {
            return NextResponse.json({
                success: false,
                error: 'URLs array is required and must not be empty'
            }, { status: 400 });
        }
        
        const collection = await getCollection('sitemap_config');
        
        // Clear existing sitemap configuration
        await collection.deleteMany({});
        
        // Prepare URLs for insertion
        const urlDocuments = urls.map(url => ({
            url: url.url,
            priority: url.priority || '0.5',
            changefreq: url.changefreq || 'monthly',
            lastmod: url.lastmod || new Date().toISOString().split('T')[0],
            createdAt: new Date(),
            updatedAt: new Date()
        }));
        
        console.log('💾 Inserting', urlDocuments.length, 'URLs into sitemap configuration');
        
        // Insert all URLs
        const result = await collection.insertMany(urlDocuments);
        
        if (result.acknowledged) {
            console.log('✅ Sitemap configuration updated successfully');
            
            return NextResponse.json({
                success: true,
                data: {
                    totalInserted: result.insertedCount,
                    urls: urlDocuments
                },
                message: `Sitemap configuration updated with ${result.insertedCount} URLs`
            });
        }
        
        throw new Error('Failed to save sitemap configuration');
        
    } catch (error) {
        console.error('❌ Error updating sitemap configuration:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to update sitemap configuration',
            details: error.message
        }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        console.log('🔄 Updating single sitemap URL...');
        
        const body = await request.json();
        const { id, url, priority, changefreq, lastmod } = body;
        
        // Validate required fields
        if (!id || !url) {
            return NextResponse.json({
                success: false,
                error: 'ID and URL are required'
            }, { status: 400 });
        }
        
        const collection = await getCollection('sitemap_config');
        const { ObjectId } = require('mongodb');
        
        // Validate ObjectId
        if (!ObjectId.isValid(id)) {
            return NextResponse.json({
                success: false,
                error: 'Invalid sitemap URL ID'
            }, { status: 400 });
        }
        
        // Update sitemap URL
        const updateData = {
            url: url,
            priority: priority || '0.5',
            changefreq: changefreq || 'monthly',
            lastmod: lastmod || new Date().toISOString().split('T')[0],
            updatedAt: new Date()
        };
        
        const result = await collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );
        
        if (result.modifiedCount > 0 || result.matchedCount > 0) {
            const updatedUrl = await collection.findOne({ _id: new ObjectId(id) });
            
            console.log('✅ Sitemap URL updated successfully');
            
            return NextResponse.json({
                success: true,
                data: {
                    id: updatedUrl._id.toString(),
                    url: updatedUrl.url,
                    priority: updatedUrl.priority,
                    changefreq: updatedUrl.changefreq,
                    lastmod: updatedUrl.lastmod,
                    updatedAt: updatedUrl.updatedAt
                },
                message: 'Sitemap URL updated successfully'
            });
        } else {
            return NextResponse.json({
                success: false,
                error: 'Sitemap URL not found'
            }, { status: 404 });
        }
        
    } catch (error) {
        console.error('❌ Error updating sitemap URL:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to update sitemap URL',
            details: error.message
        }, { status: 500 });
    }
}

