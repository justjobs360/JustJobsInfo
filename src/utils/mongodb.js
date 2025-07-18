import { MongoClient } from 'mongodb';

let client = null;
let db = null;

// MongoDB connection configuration
const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = 'resumeCollection';
const COLLECTION_NAME = 'userResumes';

// Connect to MongoDB
async function connectToMongoDB() {
  if (client) {
    return client;
  }

  try {
    console.log('🔌 Connecting to MongoDB...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    db = client.db(DB_NAME);
    console.log('✅ Connected to MongoDB successfully');
    
    return client;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
}

// Get database instance
async function getDatabase() {
  if (!db) {
    await connectToMongoDB();
  }
  return db;
}

// Get collection instance
async function getCollection() {
  const database = await getDatabase();
  return database.collection(COLLECTION_NAME);
}

// Store CV data
async function storeCV(cvData) {
  try {
    const collection = await getCollection();
    
    // Create CV document
    const cvDocument = {
      ...cvData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    console.log('💾 Storing CV to MongoDB...');
    const result = await collection.insertOne(cvDocument);
    
    console.log(`✅ CV stored successfully with ID: ${result.insertedId}`);
    return result.insertedId;
    
  } catch (error) {
    console.error('❌ Error storing CV to MongoDB:', error);
    throw error;
  }
}

// Get CVs by user ID
async function getCVsByUserId(userId) {
  try {
    const collection = await getCollection();
    
    const cvs = await collection.find({ userId }).sort({ createdAt: -1 }).toArray();
    return cvs;
    
  } catch (error) {
    console.error('❌ Error fetching CVs from MongoDB:', error);
    throw error;
  }
}

// Get CV by ID
async function getCVById(cvId) {
  try {
    const collection = await getCollection();
    
    const cv = await collection.findOne({ _id: cvId });
    return cv;
    
  } catch (error) {
    console.error('❌ Error fetching CV from MongoDB:', error);
    throw error;
  }
}

// Extract text from stored CV file
async function extractTextFromStoredCV(cvId) {
  try {
    const cv = await getCVById(cvId);
    if (!cv || !cv.fileData) {
      throw new Error('CV not found or no file data available');
    }

    const fileBuffer = cv.fileData;
    let extractedText = '';

    if (cv.fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      // Extract text from DOCX
      const mammoth = await import('mammoth');
      const result = await mammoth.extractRawText({ buffer: fileBuffer });
      extractedText = result.value.trim();
    } else if (cv.fileType === 'application/msword') {
      // Extract text from DOC using the same logic as the API
      const textPatterns = [];
      
      for (let i = 0; i < fileBuffer.length - 4; i++) {
        if (fileBuffer[i] >= 32 && fileBuffer[i] <= 126) {
          let textStart = i;
          let textLength = 0;
          
          while (i < fileBuffer.length && fileBuffer[i] >= 32 && fileBuffer[i] <= 126 && textLength < 1000) {
            textLength++;
            i++;
          }
          
          if (textLength >= 10) {
            const textChunk = fileBuffer.toString('utf8', textStart, textStart + textLength);
            if (!textChunk.includes('\x00') && !textChunk.includes('\x01') && 
                textChunk.length > 10 && /[A-Za-z]{3,}/.test(textChunk)) {
              textPatterns.push(textChunk);
            }
          }
        }
      }
      
      if (textPatterns.length > 0) {
        extractedText = textPatterns.join(' ')
          .replace(/\s+/g, ' ')
          .replace(/[^\w\s\.\,\!\?\;\:\-\(\)]/g, '')
          .trim();
      }
    }

    return extractedText;
    
  } catch (error) {
    console.error('❌ Error extracting text from stored CV:', error);
    throw error;
  }
}

// Download stored CV file
async function downloadStoredCV(cvId) {
  try {
    const cv = await getCVById(cvId);
    if (!cv || !cv.fileData) {
      throw new Error('CV not found or no file data available');
    }

    return {
      fileName: cv.fileName,
      fileType: cv.fileType,
      fileData: cv.fileData,
      fileSize: cv.fileSize
    };
    
  } catch (error) {
    console.error('❌ Error downloading stored CV:', error);
    throw error;
  }
}

// Update CV
async function updateCV(cvId, updateData) {
  try {
    const collection = await getCollection();
    
    const result = await collection.updateOne(
      { _id: cvId },
      { 
        $set: {
          ...updateData,
          updatedAt: new Date()
        }
      }
    );
    
    return result.modifiedCount > 0;
    
  } catch (error) {
    console.error('❌ Error updating CV in MongoDB:', error);
    throw error;
  }
}

// Delete CV
async function deleteCV(cvId) {
  try {
    const collection = await getCollection();
    
    const result = await collection.deleteOne({ _id: cvId });
    return result.deletedCount > 0;
    
  } catch (error) {
    console.error('❌ Error deleting CV from MongoDB:', error);
    throw error;
  }
}

// Close MongoDB connection
async function closeConnection() {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log('🔌 MongoDB connection closed');
  }
}

export {
  connectToMongoDB,
  getDatabase,
  getCollection,
  storeCV,
  getCVsByUserId,
  getCVById,
  extractTextFromStoredCV,
  downloadStoredCV,
  updateCV,
  deleteCV,
  closeConnection
}; 