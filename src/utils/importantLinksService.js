import { ObjectId } from 'mongodb';
import { getCollection } from './mongodb';

const IMPORTANT_LINKS_COLLECTION = 'importantLinks';

// Get important links collection instance
async function getImportantLinksCollection() {
  return getCollection(IMPORTANT_LINKS_COLLECTION);
}

// Get all important links with categories
export async function getImportantLinks() {
    try {
        const collection = await getImportantLinksCollection();
        const links = await collection.find({}).toArray();
        console.log('✅ Fetched important links:', links.length);
        return links;
    } catch (error) {
        console.error('❌ Error fetching important links:', error);
        throw error;
    }
}

// Get important links by category
export async function getImportantLinksByCategory(category) {
    try {
        const collection = await getImportantLinksCollection();
        const links = await collection.find({ category: category }).toArray();
        console.log(`✅ Fetched important links for category ${category}:`, links.length);
        return links;
    } catch (error) {
        console.error('❌ Error fetching important links by category:', error);
        throw error;
    }
}

// Create a new important link
export async function createImportantLink(linkData) {
    try {
        const collection = await getImportantLinksCollection();
        const result = await collection.insertOne({
            ...linkData,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        console.log('✅ Created important link:', result.insertedId);
        return result.insertedId;
    } catch (error) {
        console.error('❌ Error creating important link:', error);
        throw error;
    }
}

// Update an important link
export async function updateImportantLink(id, updateData) {
    try {
        const collection = await getImportantLinksCollection();
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
        console.log('✅ Updated important link:', id);
        return result.modifiedCount > 0;
    } catch (error) {
        console.error('❌ Error updating important link:', error);
        throw error;
    }
}

// Delete an important link
export async function deleteImportantLink(id) {
    try {
        const collection = await getImportantLinksCollection();
        const objectId = typeof id === 'string' ? new ObjectId(id) : id;
        const result = await collection.deleteOne({ _id: objectId });
        console.log('✅ Deleted important link:', id);
        return result.deletedCount > 0;
    } catch (error) {
        console.error('❌ Error deleting important link:', error);
        throw error;
    }
}

// Get important link by ID
export async function getImportantLinkById(id) {
    try {
        const collection = await getImportantLinksCollection();
        const objectId = typeof id === 'string' ? new ObjectId(id) : id;
        const link = await collection.findOne({ _id: objectId });
        console.log('✅ Fetched important link by ID:', id);
        return link;
    } catch (error) {
        console.error('❌ Error fetching important link by ID:', error);
        throw error;
    }
}

// Get all categories
export async function getImportantLinkCategories() {
    try {
        const collection = await getImportantLinksCollection();
        const categories = await collection.distinct('category');
        console.log('✅ Fetched important link categories:', categories);
        return categories;
    } catch (error) {
        console.error('❌ Error fetching important link categories:', error);
        throw error;
    }
}

// Initialize important links with default data
export async function initializeImportantLinks() {
    try {
        const collection = await getImportantLinksCollection();
        
        // Check if collection already has data
        const count = await collection.countDocuments();
        if (count > 0) {
            console.log('✅ Important links collection already has data');
            return;
        }

        const defaultLinks = [
            {
                title: "Resume & Cover Letter Resources",
                subtitle: "Essential tools and guides for creating professional resumes and cover letters",
                category: "Resume & Cover Letter Resources",
                links: [
                    {
                        name: "Resume Writing Guide",
                        url: "https://enhancv.com/resume-examples/ats/",
                        description: "Comprehensive guide to writing an effective resume"
                    },
                    {
                        name: "Cover Letter Examples",
                        url: "https://hbr.org/2022/05/how-to-write-a-cover-letter-that-sounds-like-you-and-gets-noticed",
                        description: "Practical guidance on how to make your cover letter authentic, targeted, and effective"
                    },
                    {
                        name: "Resume Format Guide",
                        url: "https://resumegenius.com/blog/resume-help/resume-format",
                        description: "Guide to choosing the right resume format"
                    }
                ],
                status: "active",
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                title: "Interview Preparation",
                subtitle: "Resources to help you prepare for and excel in job interviews",
                category: "Interview Preparation",
                links: [
                    {
                        name: "Common Interview Questions",
                        url: "https://www.themuse.com/advice/interview-questions-and-answers",
                        description: "List of common interview questions with sample answers"
                    },
                    {
                        name: "Behavioral Interview Guide",
                        url: "https://blog.theinterviewguys.com/top-10-behavioral-interview-questions/",
                        description: "Guide to handling behavioral interview questions"
                    },
                    {
                        name: "Video Interview Tips",
                        url: "https://www.prospects.ac.uk/careers-advice/interview-tips/video-interview-tips",
                        description: "Best practices for video interviews"
                    }
                ],
                status: "active",
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                title: "Job Boards & Search Engines",
                subtitle: "Popular platforms for finding job opportunities",
                category: "Job Boards & Search Engines",
                links: [
                    {
                        name: "LinkedIn Jobs",
                        url: "https://www.linkedin.com/jobs/",
                        description: "Professional networking and job search platform"
                    },
                    {
                        name: "Indeed",
                        url: "https://www.indeed.com/",
                        description: "World's largest job search engine"
                    },
                    {
                        name: "JustJobs.info",
                        url: "https://www.justjobs.info/job-listing",
                        description: "Curated job listings and career resources"
                    },
                    {
                        name: "Remote OK",
                        url: "https://remoteok.com/",
                        description: "Remote job opportunities"
                    },
                    {
                        name: "Glassdoor",
                        url: "https://www.glassdoor.com/",
                        description: "Job search with company reviews and salary information"
                    },
                    {
                        name: "Monster",
                        url: "https://www.monster.com/",
                        description: "Global job board connecting candidates with employers"
                    }
                ],
                status: "active",
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                title: "Career Development",
                subtitle: "Resources for continuous learning and skill development",
                category: "Career Development",
                links: [
                    {
                        name: "Coursera",
                        url: "https://www.coursera.org/",
                        description: "Online courses from top universities"
                    },
                    {
                        name: "edX",
                        url: "https://www.edx.org/",
                        description: "Free online courses from leading institutions"
                    },
                    {
                        name: "LinkedIn Learning",
                        url: "https://www.linkedin.com/learning/",
                        description: "Professional development courses"
                    }
                ],
                status: "active",
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                title: "Freelancing & Gig Work",
                subtitle: "Platforms and resources for freelance opportunities",
                category: "Freelancing & Gig Work",
                links: [
                    {
                        name: "Upwork",
                        url: "https://www.upwork.com/",
                        description: "Global freelancing platform"
                    },
                    {
                        name: "Fiverr",
                        url: "https://www.fiverr.com/",
                        description: "Freelance services marketplace"
                    },
                    {
                        name: "Freelancer",
                        url: "https://www.freelancer.com/",
                        description: "Freelance and crowdsourcing marketplace"
                    }
                ],
                status: "active",
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                title: "Government & Local Employment Services",
                subtitle: "Official resources for job seekers",
                category: "Government & Local Employment Services",
                links: [
                    {
                        name: "USAJOBS",
                        url: "https://www.usajobs.gov/",
                        description: "Official job site of the US government"
                    },
                    {
                        name: "CareerOneStop",
                        url: "https://www.careeronestop.org/",
                        description: "Sponsored by the U.S. Department of Labor"
                    },
                    {
                        name: "UK.GOV FIND A JOB",
                        url: "https://www.gov.uk/find-a-job",
                        description: "Official job site of the UK government"
                    }
                ],
                status: "active",
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ];

        const result = await collection.insertMany(defaultLinks);
        console.log('✅ Initialized important links with default data:', result.insertedIds);
        return result.insertedIds;
    } catch (error) {
        console.error('❌ Error initializing important links:', error);
        throw error;
    }
}

 
