import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = 'justjobsdata';
const COLLECTION_NAME = 'api_cache';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

let client;
let clientPromise;

if (process.env.NODE_ENV === 'development') {
  if (!global._cacheMongoClientPromise) {
    client = new MongoClient(MONGODB_URI);
    global._cacheMongoClientPromise = client.connect();
  }
  clientPromise = global._cacheMongoClientPromise;
} else {
  client = new MongoClient(MONGODB_URI);
  clientPromise = client.connect();
}

async function getCollection() {
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const collection = db.collection(COLLECTION_NAME);
  // Ensure indexes (idempotent)
  await collection.createIndex({ key: 1 }, { unique: true });
  await collection.createIndex({ updatedAt: 1 });
  return collection;
}

export async function getCachedValue(key, maxAgeSeconds) {
  try {
    const collection = await getCollection();
    const doc = await collection.findOne({ key });
    if (!doc) return { hit: false };

    const ageMs = Date.now() - new Date(doc.updatedAt).getTime();
    const isFresh = ageMs <= maxAgeSeconds * 1000;
    if (isFresh) {
      return { hit: true, fresh: true, value: doc.value };
    }
    return { hit: true, fresh: false, value: doc.value };
  } catch (error) {
    console.error('Cache get error:', error);
    return { hit: false };
  }
}

export async function setCachedValue(key, value) {
  try {
    const collection = await getCollection();
    const now = new Date();
    await collection.updateOne(
      { key },
      {
        $set: {
          key,
          value,
          updatedAt: now
        },
        $setOnInsert: { createdAt: now }
      },
      { upsert: true }
    );
    return true;
  } catch (error) {
    console.error('Cache set error:', error);
    return false;
  }
}

export async function deleteCacheByPrefix(prefix) {
  try {
    const collection = await getCollection();
    const regex = new RegExp(`^${prefix}`);
    await collection.deleteMany({ key: { $regex: regex } });
    return true;
  } catch (error) {
    console.error('Cache delete by prefix error:', error);
    return false;
  }
}

export async function deleteAllCache() {
  try {
    const collection = await getCollection();
    await collection.deleteMany({});
    return true;
  } catch (error) {
    console.error('Cache delete all error:', error);
    return false;
  }
}
