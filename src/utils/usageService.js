import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = 'justjobsdata';
const USAGE_COLLECTION = 'api_usage';
const POPULARITY_COLLECTION = 'query_popularity';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

let client;
let clientPromise;

if (process.env.NODE_ENV === 'development') {
  if (!global._usageMongoClientPromise) {
    client = new MongoClient(MONGODB_URI);
    global._usageMongoClientPromise = client.connect();
  }
  clientPromise = global._usageMongoClientPromise;
} else {
  client = new MongoClient(MONGODB_URI);
  clientPromise = client.connect();
}

function getMonthKey(date = new Date()) {
  const y = date.getUTCFullYear();
  const m = (date.getUTCMonth() + 1).toString().padStart(2, '0');
  return `${y}-${m}`;
}

async function getCollection(name) {
  const c = await clientPromise;
  const db = c.db(DB_NAME);
  const col = db.collection(name);
  return col;
}

export async function recordUpstreamCall(cacheKey) {
  const monthKey = getMonthKey();
  const usageCol = await getCollection(USAGE_COLLECTION);
  await usageCol.updateOne(
    { monthKey },
    { $inc: { count: 1 }, $setOnInsert: { monthKey, createdAt: new Date() } },
    { upsert: true }
  );
  if (cacheKey) {
    const popCol = await getCollection(POPULARITY_COLLECTION);
    await popCol.updateOne(
      { key: cacheKey },
      { $inc: { count: 1 }, $setOnInsert: { key: cacheKey, createdAt: new Date() }, $set: { updatedAt: new Date() } },
      { upsert: true }
    );
  }
}

export async function getMonthlyCount(monthKey = getMonthKey()) {
  const usageCol = await getCollection(USAGE_COLLECTION);
  const doc = await usageCol.findOne({ monthKey });
  return doc?.count || 0;
}

export async function isNearMonthlyLimit(thresholdPct = 0.9) {
  const limit = parseInt(process.env.JSEARCH_MONTHLY_LIMIT || '200', 10);
  const count = await getMonthlyCount();
  return { near: count >= Math.floor(limit * thresholdPct), count, limit };
}

export async function getPopularQueries(limit = 5, minCount = 1) {
  const popCol = await getCollection(POPULARITY_COLLECTION);
  const cursor = popCol.find({ count: { $gte: minCount } }).sort({ count: -1 }).limit(limit);
  const results = await cursor.toArray();
  return results.map(r => r.key);
}

export async function getQueryCount(cacheKey) {
  const popCol = await getCollection(POPULARITY_COLLECTION);
  const doc = await popCol.findOne({ key: cacheKey });
  return doc?.count || 0;
}
