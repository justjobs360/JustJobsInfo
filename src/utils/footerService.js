import { MongoClient, ObjectId } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = 'justjobsdata';
const COLLECTION_NAME = 'footer_settings';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

let client;
let clientPromise;

if (process.env.NODE_ENV === 'development') {
  if (!global._footerMongoClientPromise) {
    client = new MongoClient(MONGODB_URI);
    global._footerMongoClientPromise = client.connect();
  }
  clientPromise = global._footerMongoClientPromise;
} else {
  client = new MongoClient(MONGODB_URI);
  clientPromise = client.connect();
}

async function getCollection() {
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const collection = db.collection(COLLECTION_NAME);
  
  // Ensure indexes
  await collection.createIndex({ type: 1 }, { unique: true });
  await collection.createIndex({ createdAt: -1 });
  
  return collection;
}

// Default footer structure
const defaultFooterData = {
  type: 'footer_main',
  description: 'Justjobs Info is a platform for resume building, job search, and career resources, helping professionals advance and stand out.',
  copyright: '© 2025 JustJobs. All rights reserved.',
  developer_credit: 'Developed by <a href="https://sillylittletools.com" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: none;">SillyLittleTools</a>',
  sections: [
    {
      id: 'services',
      title: 'Services',
      links: [
        { id: 'resume-audit', text: 'Resume Audit', href: '/resume-audit' },
        { id: 'resume-builder', text: 'Resume Builder', href: '/resume-builder' },
        { id: 'job-listing', text: 'Job Listings', href: '/job-listing' },
        { id: 'resources', text: 'Resources', href: '/service' },
        { id: 'askgenie', text: 'Ask Genie', href: '/askgenie' },
        { id: 'lms', text: 'LMS (Coming Soon)', href: '/LearningManagementSystem' }
      ]
    },
    {
      id: 'company',
      title: 'Company',
      links: [
        { id: 'about', text: 'About us', href: '/about' },
        { id: 'career', text: 'Careers', href: '/career' },
        { id: 'team', text: 'Our Team', href: '/team' },
        { id: 'blogs', text: 'Our Blogs', href: '/blogs' },
        { id: 'testimonials', text: 'Success Stories', href: '/#testimonials' },
        { id: 'contact', text: 'Contact', href: '/contact' }
      ]
    },
    {
      id: 'industries',
      title: 'Industries',
      links: [
        { id: 'fintech', text: 'Fintech', href: '/job-listing?industry=fintech' },
        { id: 'healthcare', text: 'Healthcare', href: '/job-listing?industry=healthcare' },
        { id: 'finance', text: 'Finance', href: '/job-listing?industry=finance' },
        { id: 'engineering', text: 'Engineering', href: '/job-listing?industry=engineering' },
        { id: 'education', text: 'Education', href: '/job-listing?industry=education' },
        { id: 'construction', text: 'Construction', href: '/job-listing?industry=construction' }
      ]
    },
    {
      id: 'legal',
      title: 'Legal',
      links: [
        { id: 'terms', text: 'Terms of Use', href: '/terms-of-use' },
        { id: 'privacy', text: 'Privacy Policy', href: '/privacy-policy' },
        { id: 'cookies', text: 'Cookie Policy', href: '/cookies-policy' },
        { id: 'faq', text: 'FAQ', href: '/faq' },
        { id: 'support', text: 'Help & Support', href: '/contact' },
        { id: 'contact-us', text: 'Contact Us', href: '/contact' }
      ]
    }
  ],
  social_links: [
    { id: 'facebook', name: 'Facebook', icon: 'fa-brands fa-facebook-f', href: 'https://www.facebook.com/justjobsinfos/', aria_label: 'Visit our Facebook page' },
    { id: 'x', name: 'X (Twitter)', icon: 'custom-x', href: 'https://x.com/justjobs_info', aria_label: 'Follow us on X' },
    { id: 'youtube', name: 'YouTube', icon: 'fa-brands fa-youtube', href: '/#', aria_label: 'Subscribe to our YouTube channel' },
    { id: 'linkedin', name: 'LinkedIn', icon: 'fa-brands fa-linkedin', href: 'https://www.linkedin.com/company/justjobsng-com/', aria_label: 'Connect with us on LinkedIn' },
    { id: 'instagram', name: 'Instagram', icon: 'fa-brands fa-instagram', href: '/#', aria_label: 'Follow us on Instagram' }
  ],
  createdAt: new Date(),
  updatedAt: new Date()
};

// Get footer data
export async function getFooterData() {
  try {
    const collection = await getCollection();
    let footerData = await collection.findOne({ type: 'footer_main' });
    
    if (!footerData) {
      // Create default footer data if it doesn't exist
      footerData = await createFooterData(defaultFooterData);
    }
    
    return {
      success: true,
      data: footerData
    };
  } catch (error) {
    console.error('Error getting footer data:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Create footer data
export async function createFooterData(footerData) {
  try {
    const collection = await getCollection();
    const result = await collection.insertOne({
      ...footerData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    return {
      success: true,
      data: { ...footerData, _id: result.insertedId }
    };
  } catch (error) {
    console.error('Error creating footer data:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Update footer data
export async function updateFooterData(updates) {
  try {
    const collection = await getCollection();
    const result = await collection.findOneAndUpdate(
      { type: 'footer_main' },
      { 
        $set: { 
          ...updates, 
          updatedAt: new Date() 
        } 
      },
      { 
        upsert: true, 
        returnDocument: 'after' 
      }
    );
    
    return {
      success: true,
      data: result
    };
  } catch (error) {
    console.error('Error updating footer data:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Update a specific section
export async function updateFooterSection(sectionId, sectionData) {
  try {
    const collection = await getCollection();
    
    // First get the current footer data
    const currentData = await collection.findOne({ type: 'footer_main' });
    if (!currentData) {
      return {
        success: false,
        error: 'Footer data not found'
      };
    }
    
    // Update the specific section
    const updatedSections = currentData.sections.map(section => 
      section.id === sectionId ? { ...section, ...sectionData } : section
    );
    
    const result = await collection.findOneAndUpdate(
      { type: 'footer_main' },
      { 
        $set: { 
          sections: updatedSections,
          updatedAt: new Date() 
        } 
      },
      { returnDocument: 'after' }
    );
    
    return {
      success: true,
      data: result
    };
  } catch (error) {
    console.error('Error updating footer section:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Add link to a section
export async function addFooterLink(sectionId, linkData) {
  try {
    const collection = await getCollection();
    
    const currentData = await collection.findOne({ type: 'footer_main' });
    if (!currentData) {
      return {
        success: false,
        error: 'Footer data not found'
      };
    }
    
    const updatedSections = currentData.sections.map(section => {
      if (section.id === sectionId) {
        const newLink = {
          id: linkData.id || `link_${Date.now()}`,
          text: linkData.text,
          href: linkData.href
        };
        return {
          ...section,
          links: [...section.links, newLink]
        };
      }
      return section;
    });
    
    const result = await collection.findOneAndUpdate(
      { type: 'footer_main' },
      { 
        $set: { 
          sections: updatedSections,
          updatedAt: new Date() 
        } 
      },
      { returnDocument: 'after' }
    );
    
    return {
      success: true,
      data: result
    };
  } catch (error) {
    console.error('Error adding footer link:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Remove link from a section
export async function removeFooterLink(sectionId, linkId) {
  try {
    const collection = await getCollection();
    
    const currentData = await collection.findOne({ type: 'footer_main' });
    if (!currentData) {
      return {
        success: false,
        error: 'Footer data not found'
      };
    }
    
    const updatedSections = currentData.sections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          links: section.links.filter(link => link.id !== linkId)
        };
      }
      return section;
    });
    
    const result = await collection.findOneAndUpdate(
      { type: 'footer_main' },
      { 
        $set: { 
          sections: updatedSections,
          updatedAt: new Date() 
        } 
      },
      { returnDocument: 'after' }
    );
    
    return {
      success: true,
      data: result
    };
  } catch (error) {
    console.error('Error removing footer link:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Update social links
export async function updateSocialLinks(socialLinks) {
  try {
    const collection = await getCollection();
    
    const result = await collection.findOneAndUpdate(
      { type: 'footer_main' },
      { 
        $set: { 
          social_links: socialLinks,
          updatedAt: new Date() 
        } 
      },
      { 
        upsert: true, 
        returnDocument: 'after' 
      }
    );
    
    return {
      success: true,
      data: result
    };
  } catch (error) {
    console.error('Error updating social links:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Add social link
export async function addSocialLink(socialLinkData) {
  try {
    const collection = await getCollection();
    
    const currentData = await collection.findOne({ type: 'footer_main' });
    if (!currentData) {
      // Create default data first
      await createFooterData(defaultFooterData);
      const newData = await collection.findOne({ type: 'footer_main' });
      currentData = newData;
    }
    
    const newSocialLink = {
      id: socialLinkData.id || `social_${Date.now()}`,
      name: socialLinkData.name,
      icon: socialLinkData.icon,
      href: socialLinkData.href,
      aria_label: socialLinkData.aria_label || `Visit our ${socialLinkData.name} page`
    };
    
    const updatedSocialLinks = [...currentData.social_links, newSocialLink];
    
    const result = await collection.findOneAndUpdate(
      { type: 'footer_main' },
      { 
        $set: { 
          social_links: updatedSocialLinks,
          updatedAt: new Date() 
        } 
      },
      { returnDocument: 'after' }
    );
    
    return {
      success: true,
      data: result
    };
  } catch (error) {
    console.error('Error adding social link:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Remove social link
export async function removeSocialLink(socialLinkId) {
  try {
    const collection = await getCollection();
    
    const currentData = await collection.findOne({ type: 'footer_main' });
    if (!currentData) {
      return {
        success: false,
        error: 'Footer data not found'
      };
    }
    
    const updatedSocialLinks = currentData.social_links.filter(link => link.id !== socialLinkId);
    
    const result = await collection.findOneAndUpdate(
      { type: 'footer_main' },
      { 
        $set: { 
          social_links: updatedSocialLinks,
          updatedAt: new Date() 
        } 
      },
      { returnDocument: 'after' }
    );
    
    return {
      success: true,
      data: result
    };
  } catch (error) {
    console.error('Error removing social link:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Reset footer to defaults
export async function resetFooterToDefaults() {
  try {
    const collection = await getCollection();
    
    const result = await collection.findOneAndReplace(
      { type: 'footer_main' },
      {
        ...defaultFooterData,
        updatedAt: new Date()
      },
      { 
        upsert: true, 
        returnDocument: 'after' 
      }
    );
    
    return {
      success: true,
      data: result
    };
  } catch (error) {
    console.error('Error resetting footer:', error);
    return {
      success: false,
      error: error.message
    };
  }
}
