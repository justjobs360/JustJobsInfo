import { MongoClient, ObjectId } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = 'justjobsdata';
const COLLECTION_NAME = 'admin_jobs';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

let client;
let clientPromise;

if (process.env.NODE_ENV === 'development') {
  if (!global._adminJobsMongoClientPromise) {
    client = new MongoClient(MONGODB_URI);
    global._adminJobsMongoClientPromise = client.connect();
  }
  clientPromise = global._adminJobsMongoClientPromise;
} else {
  client = new MongoClient(MONGODB_URI);
  clientPromise = client.connect();
}

async function getCollection() {
  const c = await clientPromise;
  const db = c.db(DB_NAME);
  const col = db.collection(COLLECTION_NAME);
  await col.createIndex({ featured: 1, status: 1, posted_at: -1 });
  await col.createIndex({ title: 'text', company: 'text', location: 'text' });
  return col;
}

export async function createAdminJob(job) {
  const col = await getCollection();
  const now = new Date();
  const doc = {
    title: job.title,
    company: job.company,
    location: job.location || '',
    type: job.type || 'Full-time',
    salary_min: job.salary_min || null,
    salary_max: job.salary_max || null,
    description: job.description || '',
    apply_link: job.apply_link || '#',
    featured: !!job.featured,
    status: job.status || 'active',
    logo: job.logo || '',
    posted_at: job.posted_at ? new Date(job.posted_at) : now,
    createdAt: now,
    updatedAt: now
  };
  const res = await col.insertOne(doc);
  return { id: res.insertedId.toString(), ...doc };
}

export async function listAdminJobs({ status = 'active', featured, limit = 50, skip = 0 } = {}) {
  const col = await getCollection();
  const query = {};
  if (status) query.status = status;
  if (typeof featured === 'boolean') query.featured = featured;
  const cursor = col.find(query).sort({ featured: -1, posted_at: -1 }).skip(skip).limit(limit);
  const items = await cursor.toArray();
  return items.map(d => ({ id: d._id.toString(), ...d }));
}

export async function searchAdminJobs({ query, location, limit = 20 } = {}) {
  const col = await getCollection();
  const filter = { status: 'active' };
  if (location) filter.location = { $regex: new RegExp(location, 'i') };
  if (query) {
    filter.$text = { $search: query };
  }
  const cursor = col.find(filter).sort({ featured: -1, posted_at: -1 }).limit(limit);
  const items = await cursor.toArray();
  return items.map(d => ({ id: d._id.toString(), ...d }));
}

export async function getAdminJob(id) {
  const col = await getCollection();
  const doc = await col.findOne({ _id: new ObjectId(id) });
  if (!doc) return null;
  return { id: doc._id.toString(), ...doc };
}

export async function updateAdminJob(id, updates) {
  const col = await getCollection();
  const payload = { ...updates, updatedAt: new Date() };
  if (payload.posted_at) payload.posted_at = new Date(payload.posted_at);
  const res = await col.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: payload },
    { returnDocument: 'after' }
  );
  if (!res.value) return null;
  const doc = res.value;
  return { id: doc._id.toString(), ...doc };
}

export async function deleteAdminJob(id) {
  const col = await getCollection();
  await col.deleteOne({ _id: new ObjectId(id) });
  return true;
}
