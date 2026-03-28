import { MongoClient } from 'mongodb';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = 'resumeCollection';

async function generateSitemap() {
  console.log('🗺️  Starting sitemap generation (Mongo cache)...');

  const { buildAndCacheSitemap } = await import(
    pathToFileURL(path.join(__dirname, '..', 'src', 'utils', 'sitemapGenerator.js')).href
  );

  if (!MONGODB_URI) {
    console.warn(
      '⚠️  MONGODB_URI not set — skipping sitemap cache (use admin or first /sitemap.xml hit to populate).'
    );
    return;
  }

  let client;

  try {
    console.log('📡 Connecting to MongoDB...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db(DB_NAME);

    const { xml, urlCount, updatedAt } = await buildAndCacheSitemap(db);
    console.log(`✅ Sitemap cache updated: ${urlCount} URLs at ${updatedAt.toISOString()}`);
    console.log(`📍 XML length: ${xml.length} bytes`);
  } catch (error) {
    console.error('❌ Error generating sitemap cache:', error);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log('🔌 MongoDB connection closed');
    }
  }
}

generateSitemap();
