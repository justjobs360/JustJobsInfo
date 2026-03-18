const SITE_URL = 'https://justjobs.info';

/** Default URLs when DB is empty or unavailable (sitemap must not be empty) */
function getDefaultEntries() {
  const today = new Date();
  return [
    { url: `${SITE_URL}/`, lastModified: today, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${SITE_URL}/job-listing`, lastModified: today, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/about`, lastModified: today, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/contact`, lastModified: today, changeFrequency: 'monthly', priority: 0.8 },
  ];
}

export const dynamic = 'force-dynamic';

export default async function sitemap() {
  const today = new Date();
  let entries = [];

  try {
    // Import lazily so missing/invalid env vars can't crash the whole route at module-load time.
    const { getCollection } = await import('@/utils/mongodb');

    const sitemapCollection = await getCollection('sitemap_config');
    const staticPages = await sitemapCollection.find({}).sort({ priority: -1 }).toArray();

    if (staticPages.length > 0) {
      entries = staticPages.map((page) => ({
        url: `${SITE_URL}${page.url}`,
        lastModified: page.lastmod ? new Date(page.lastmod) : today,
        changeFrequency: page.changefreq || 'monthly',
        priority: parseFloat(page.priority) || 0.5,
      }));
    } else {
      entries = getDefaultEntries();
    }

    const blogsCollection = await getCollection('blogs');
    const blogs = await blogsCollection
      .find({ status: 'published' })
      .sort({ publishedDate: -1 })
      .limit(1000)
      .toArray();

    if (blogs && blogs.length > 0) {
      const blogEntries = blogs.map((blog) => ({
        url: `${SITE_URL}/blogs/${blog.slug}`,
        lastModified: blog.publishedDate ? new Date(blog.publishedDate) : today,
        changeFrequency: 'monthly',
        priority: 0.6,
      }));
      entries = [...entries, ...blogEntries];
    }
  } catch (err) {
    console.warn('sitemap: DB error, using defaults', err?.message);
    entries = getDefaultEntries();
  }

  return entries;
}
