import { ObjectId } from 'mongodb';
import { getCollection } from './mongodb';

const DOWNLOADABLE_RESOURCES_COLLECTION = 'downloadableResources';

// Get downloadable resources collection instance
async function getDownloadableResourcesCollection() {
  return getCollection(DOWNLOADABLE_RESOURCES_COLLECTION);
}

// Get all downloadable resources with categories
export async function getDownloadableResources() {
    try {
        const collection = await getDownloadableResourcesCollection();
        const resources = await collection.find({}).toArray();
        console.log('✅ Fetched downloadable resources:', resources.length);
        return resources;
    } catch (error) {
        console.error('❌ Error fetching downloadable resources:', error);
        throw error;
    }
}

// Get downloadable resources by category
export async function getDownloadableResourcesByCategory(category) {
    try {
        const collection = await getDownloadableResourcesCollection();
        const resources = await collection.find({ category: category }).toArray();
        console.log(`✅ Fetched downloadable resources for category ${category}:`, resources.length);
        return resources;
    } catch (error) {
        console.error('❌ Error fetching downloadable resources by category:', error);
        throw error;
    }
}

// Create a new downloadable resource
export async function createDownloadableResource(resourceData) {
    try {
        const collection = await getDownloadableResourcesCollection();
        const result = await collection.insertOne({
            ...resourceData,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        console.log('✅ Created downloadable resource:', result.insertedId);
        return result.insertedId;
    } catch (error) {
        console.error('❌ Error creating downloadable resource:', error);
        throw error;
    }
}

// Update a downloadable resource
export async function updateDownloadableResource(id, updateData) {
    try {
        const collection = await getDownloadableResourcesCollection();
        const objectId = typeof id === 'string' ? new ObjectId(id) : id;
        const result = await collection.updateOne(
            { _id: objectId },
            { 
                $set: { 
                    ...updateData, 
                    updatedAt: new Date() 
                } 
            }
        );
        console.log('✅ Updated downloadable resource:', id);
        return result.modifiedCount > 0;
    } catch (error) {
        console.error('❌ Error updating downloadable resource:', error);
        throw error;
    }
}

// Delete a downloadable resource
export async function deleteDownloadableResource(id) {
    try {
        const collection = await getDownloadableResourcesCollection();
        const objectId = typeof id === 'string' ? new ObjectId(id) : id;
        const result = await collection.deleteOne({ _id: objectId });
        console.log('✅ Deleted downloadable resource:', id);
        return result.deletedCount > 0;
    } catch (error) {
        console.error('❌ Error deleting downloadable resource:', error);
        throw error;
    }
}

// Get downloadable resource by ID
export async function getDownloadableResourceById(id) {
    try {
        const collection = await getDownloadableResourcesCollection();
        const objectId = typeof id === 'string' ? new ObjectId(id) : id;
        const resource = await collection.findOne({ _id: objectId });
        console.log('✅ Fetched downloadable resource by ID:', id);
        return resource;
    } catch (error) {
        console.error('❌ Error fetching downloadable resource by ID:', error);
        throw error;
    }
}

// Get all categories
export async function getDownloadableResourceCategories() {
    try {
        const collection = await getDownloadableResourcesCollection();
        const categories = await collection.distinct('category');
        console.log('✅ Fetched downloadable resource categories:', categories);
        return categories;
    } catch (error) {
        console.error('❌ Error fetching downloadable resource categories:', error);
        throw error;
    }
}

// Initialize downloadable resources with default data
export async function initializeDownloadableResources() {
    try {
        const collection = await getDownloadableResourcesCollection();
        
        // Check if collection already has data
        const count = await collection.countDocuments();
        if (count > 0) {
            console.log('✅ Downloadable resources collection already has data');
            return;
        }

        const defaultResources = [
            {
                title: "Job Search Planners",
                subtitle: "Track your job search progress and stay organized with these helpful planners",
                category: "Job Search Planners",
                resources: [
                    {
                        name: "Job Application Tracker (Google Sheets)",
                        description: "Google Sheets template to track applications, interviews, and follow-ups",
                        format: "Sheet",
                        icon: "https://unpkg.com/@fortawesome/fontawesome-free/svgs/brands/google-drive.svg",
                        downloadUrl: "https://docs.google.com/spreadsheets/d/1dhjMd52a52YyL3tMDrmRDczTaTqg2Nfb8AFLKYBWiUo/copy",
                        downloads: 2340,
                        fileSize: "2.5 MB"
                    },
                    {
                        name: "Job Search Planning Sheet",
                        description: "Comprehensive planning sheet for tracking job search activities and goals",
                        format: "PDF",
                        icon: "https://unpkg.com/@fortawesome/fontawesome-free/svgs/solid/file-pdf.svg",
                        downloadUrl: "https://www.wcu.edu/WebFiles/CCPD-Career-Planning-Sheet.pdf",
                        downloads: 1567,
                        fileSize: "1.8 MB"
                    },
                    {
                        name: "Productivity Checklist",
                        description: "Daily and weekly checklists to maximize your job search efficiency",
                        format: "PDF",
                        icon: "https://unpkg.com/@fortawesome/fontawesome-free/svgs/solid/file-pdf.svg",
                        downloadUrl: "https://thinkproductivena.com/wp-content/uploads/2012/11/43-PDF-2-Ninja-Weekly-Daily-Checklists-Think-Productive.pdf",
                        downloads: 890,
                        fileSize: "3.2 MB"
                    }
                ],
                status: "active",
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                title: "Interview Preparation Kits",
                subtitle: "Comprehensive guides and worksheets to help you prepare for interviews",
                category: "Interview Preparation Kits",
                resources: [
                    {
                        name: "Common Interview Questions Guide",
                        description: "List of frequently asked questions with sample answers and preparation tips",
                        format: "PDF",
                        icon: "https://unpkg.com/@fortawesome/fontawesome-free/svgs/solid/file-pdf.svg",
                        downloadUrl: "https://www.regiscollege.edu/sites/default/files/academics/career/interview-faq.pdf",
                        downloads: 1234,
                        fileSize: "1.5 MB"
                    },
                    {
                        name: "STAR Method Worksheet",
                        description: "Template for crafting compelling STAR method responses",
                        format: "Word",
                        icon: "https://unpkg.com/@fortawesome/fontawesome-free/svgs/brands/microsoft.svg",
                        downloadUrl: "https://assets-eu-01.kc-usercontent.com/73ea709e-f9f8-0168-3842-ebd7ad1e23ac/a8099768-585c-4b6c-bb1b-ba00e00c037d/STAR%20Technique%20worksheet.docx",
                        downloads: 678,
                        fileSize: "2.1 MB"
                    },
                    {
                        name: "Interview Preparation Checklist",
                        description: "Comprehensive checklist for interview preparation",
                        format: "PDF",
                        icon: "https://unpkg.com/@fortawesome/fontawesome-free/svgs/solid/file-pdf.svg",
                        downloadUrl: "https://www.albright.edu/wp-content/uploads/2020/08/Interview-Preparation-Checklist.pdf",
                        downloads: 890,
                        fileSize: "1.8 MB"
                    }
                ],
                status: "active",
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                title: "Career Planning Resources",
                subtitle: "Set goals, evaluate progress, and plan your career path with these tools",
                category: "Career Planning Resources",
                resources: [
                    {
                        name: "Career Planning Workbook",
                        description: "Guided workbook for setting short and long-term career goals",
                        format: "PDF",
                        icon: "https://unpkg.com/@fortawesome/fontawesome-free/svgs/solid/file-pdf.svg",
                        downloadUrl: "https://www.cumbria.gov.uk/elibrary/Content/Internet/537/6942/6943/6948/42153103939.pdf",
                        downloads: 567,
                        fileSize: "2.5 MB"
                    },
                    {
                        name: "Skills Self-Assessment",
                        description: "Identify your strongest skills and areas for improvement",
                        format: "PDF",
                        icon: "https://unpkg.com/@fortawesome/fontawesome-free/svgs/solid/file-pdf.svg",
                        downloadUrl: "https://volunteer.ca/wp-content/uploads/2024/06/SkillSelfAssessment-EN.pdf",
                        downloads: 432,
                        fileSize: "1.2 MB"
                    }
                ],
                status: "active",
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ];

        const result = await collection.insertMany(defaultResources);
        console.log('✅ Initialized downloadable resources with default data:', result.insertedIds);
        return result.insertedIds;
    } catch (error) {
        console.error('❌ Error initializing downloadable resources:', error);
        throw error;
    }
}

 
