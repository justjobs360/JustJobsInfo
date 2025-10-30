import 'dotenv/config';
import { generateStaticSitemap } from '../src/utils/generateSitemap.js';

async function run() {
  console.log('Generating static sitemap...');
  try {
    const result = await generateStaticSitemap({ writeToDisk: true });
    if (result.success) {
      console.log('✅ Sitemap written to:', result.path, 'entries:', result.count);
      process.exit(0);
    }
    console.warn('⚠️ Sitemap generation returned non-success:', result);
    if (result.xml) {
      console.log('--- Sitemap XML Preview ---\n', result.xml.slice(0, 2000));
    }
    process.exit(result.success ? 0 : 2);
  } catch (err) {
    console.error('❌ Error generating sitemap:', err);
    process.exit(3);
  }
}

run();
