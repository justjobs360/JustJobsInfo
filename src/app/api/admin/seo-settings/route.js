import { NextResponse } from 'next/server';
import { getCollection } from '@/utils/mongodb';

export async function GET(request) {
    try {
        console.log('📋 Fetching SEO settings...');
        
        const collection = await getCollection('seo_settings');
        
        // Fetch the single settings document (there should only be one)
        const settings = await collection.findOne({});
        
        if (!settings) {
            // Return default settings if none exist
            const defaultSettings = {
                siteTitle: 'JustJobsInfo - Professional Resume and Career Services',
                siteDescription: 'Professional resume writing services, career guidance, and job search resources',
                siteLogo: '/images/logo/justjobslogo.png',
                siteUrl: 'https://justjobs.info',
                googleAnalyticsId: '',
                googleSearchConsole: '',
                socialMedia: {
                    facebook: '',
                    twitter: '',
                    linkedin: ''
                },
                createdAt: new Date(),
                updatedAt: new Date()
            };
            
            console.log('✅ Returning default SEO settings');
            
            return NextResponse.json({
                success: true,
                data: defaultSettings,
                isDefault: true
            });
        }
        
        // Format the results
        const formattedSettings = {
            id: settings._id.toString(),
            siteTitle: settings.siteTitle,
            siteDescription: settings.siteDescription,
            siteLogo: settings.siteLogo,
            siteUrl: settings.siteUrl,
            googleAnalyticsId: settings.googleAnalyticsId,
            googleSearchConsole: settings.googleSearchConsole,
            socialMedia: settings.socialMedia,
            createdAt: settings.createdAt,
            updatedAt: settings.updatedAt
        };
        
        console.log('✅ SEO settings fetched successfully');
        
        return NextResponse.json({
            success: true,
            data: formattedSettings
        });
        
    } catch (error) {
        console.error('❌ Error fetching SEO settings:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch SEO settings',
            details: error.message
        }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        console.log('🔄 Updating SEO settings...');
        
        const body = await request.json();
        const { siteTitle, siteDescription, siteLogo, siteUrl, googleAnalyticsId, googleSearchConsole, socialMedia } = body;
        
        // Validate required fields
        if (!siteTitle || !siteDescription || !siteUrl) {
            return NextResponse.json({
                success: false,
                error: 'Site title, description, and URL are required'
            }, { status: 400 });
        }
        
        const collection = await getCollection('seo_settings');
        
        // Check if settings already exist
        const existingSettings = await collection.findOne({});
        
        const settingsData = {
            siteTitle: siteTitle.trim(),
            siteDescription: siteDescription.trim(),
            siteLogo: siteLogo?.trim() || '',
            siteUrl: siteUrl.trim(),
            googleAnalyticsId: googleAnalyticsId?.trim() || '',
            googleSearchConsole: googleSearchConsole?.trim() || '',
            socialMedia: {
                facebook: socialMedia?.facebook?.trim() || '',
                twitter: socialMedia?.twitter?.trim() || '',
                linkedin: socialMedia?.linkedin?.trim() || ''
            },
            updatedAt: new Date()
        };
        
        if (existingSettings) {
            // Update existing settings
            console.log('💾 Updating existing SEO settings');
            
            const result = await collection.updateOne(
                {},
                { $set: settingsData }
            );
            
            if (result.modifiedCount > 0 || result.matchedCount > 0) {
                const updatedSettings = await collection.findOne({});
                
                console.log('✅ SEO settings updated successfully');
                
                return NextResponse.json({
                    success: true,
                    data: {
                        id: updatedSettings._id.toString(),
                        ...settingsData
                    },
                    message: 'SEO settings updated successfully'
                });
            }
        } else {
            // Create new settings document
            console.log('💾 Creating new SEO settings');
            
            settingsData.createdAt = new Date();
            
            const result = await collection.insertOne(settingsData);
            
            if (result.acknowledged) {
                console.log('✅ SEO settings created successfully');
                
                return NextResponse.json({
                    success: true,
                    data: {
                        id: result.insertedId.toString(),
                        ...settingsData
                    },
                    message: 'SEO settings created successfully'
                });
            }
        }
        
        throw new Error('Failed to save SEO settings');
        
    } catch (error) {
        console.error('❌ Error updating SEO settings:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to update SEO settings',
            details: error.message
        }, { status: 500 });
    }
}

