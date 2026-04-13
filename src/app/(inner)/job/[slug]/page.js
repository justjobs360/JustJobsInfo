import JobDetailClient from './JobDetailClient';

function slugToTitle(slug) {
  if (!slug) return '';
  return slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const title = slugToTitle(slug);
  const description = `Apply for ${title} — view full job details, salary, benefits, and requirements on JustJobsInfo.`;
  const canonical = `https://www.justjobs.info/job/${slug}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title: `${title} | JustJobsInfo`,
      description,
      url: canonical,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | JustJobsInfo`,
      description,
    },
  };
}

export default async function JobDetailPage() {
  return <JobDetailClient />;
}
