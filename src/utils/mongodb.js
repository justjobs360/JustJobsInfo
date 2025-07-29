import { MongoClient } from 'mongodb';

// MongoDB connection configuration
const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = 'resumeCollection';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

let client;
let clientPromise;

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  if (!global._mongoClientPromise) {
    client = new MongoClient(MONGODB_URI);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(MONGODB_URI);
  clientPromise = client.connect();
}

// Get database instance
async function getDatabase() {
  try {
    const client = await clientPromise;
    return client.db(DB_NAME);
  } catch (error) {
    console.error('❌ Error getting database instance:', error);
    throw error;
  }
}

// Get collection instance
async function getCollection(collectionName) {
  try {
    const database = await getDatabase();
    return database.collection(collectionName);
  } catch (error) {
    console.error(`❌ Error getting ${collectionName} collection:`, error);
    throw error;
  }
}

// Close MongoDB connection
async function closeConnection() {
  try {
    if (client) {
      await client.close();
      client = null;
      clientPromise = null;
      
      // Clear the global promise in development mode
      if (process.env.NODE_ENV === 'development' && global._mongoClientPromise) {
        global._mongoClientPromise = null;
      }
      
      console.log('🔌 MongoDB connection closed');
    }
  } catch (error) {
    console.error('❌ Error closing MongoDB connection:', error);
  }
}

export {
  getDatabase,
  getCollection,
  closeConnection
}; 