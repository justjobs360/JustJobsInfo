import 'dotenv/config';
import { getCollection } from '../src/utils/mongodb.js';

async function run() {
  try {
    const collection = await getCollection('sitemap_config');

  // Regex to find urls that are full URLs (http/https), contain www., or use legacy paths /posts/ or /job/
  const regex = new RegExp('http:\\/\\/|https:\\/\\/|www\\.|(^\\/posts\\/)|\\/posts\\/|(^\\/job\\/)|\\/job\\/', 'i');

    const cursor = collection.find({ url: { $regex: regex } }).project({ url: 1, priority: 1, changefreq: 1, lastmod: 1 });
    const results = await cursor.toArray();

    console.log(`Found ${results.length} potentially stale sitemap_config entries:`);
    for (const r of results) {
      console.log(`- id=${r._id.toString()} url=${r.url} priority=${r.priority || ''} changefreq=${r.changefreq || ''} lastmod=${r.lastmod || ''}`);
    }

    if (results.length === 0) {
      console.log('No stale entries found.');
    }

    process.exit(0);
  } catch (err) {
    console.error('Error scanning sitemap_config for stale entries:', err);
    process.exit(2);
  }
}

run();
