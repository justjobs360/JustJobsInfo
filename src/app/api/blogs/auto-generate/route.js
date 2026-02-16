/**
 * Auto Blog Generation API Route
 * 
 * NOTE: This route is configured with an 800-second (13.3-minute) timeout in vercel.json
 * to accommodate OpenAI API calls and image fetching for multiple blog posts.
 * Each blog generation can take 30-60 seconds, so processing multiple blogs
 * sequentially may approach the timeout limit.
 * 
 * Configuration: vercel.json -> functions -> "src/app/api/blogs/auto-generate/route.js"
 * - maxDuration: 300 seconds (Vercel Pro plan limit)
 * - memory: 2048 MB
 */

import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getBlogs } from '@/utils/blogService';
import { createBlog } from '@/utils/blogService';

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});



async function fetchImageFromPixabay(keywords, width = 800, height = 600) {
    try {
        // Pixabay API (free tier, requires API key)
        const apiKey = process.env.PIXABAY_API_KEY;
        
        if (apiKey) {
            const searchUrl = `https://pixabay.com/api/?key=${apiKey}&q=${encodeURIComponent(keywords)}&image_type=photo&orientation=horizontal&per_page=3&safesearch=true`;
            const response = await fetch(searchUrl);
            
            if (response.ok) {
                const data = await response.json();
                if (data.hits && data.hits.length > 0) {
                    // Return first image URL
                    return data.hits[0].webformatURL || data.hits[0].largeImageURL;
                }
            }
        }
    } catch (error) {
        console.warn('⚠️ Pixabay API failed:', error.message);
    }
    
    return null;
}

// Main function to fetch appropriate images for a blog
async function fetchBlogImages(title, imageCount = 3) {
    // Extract keywords from title for image search
    const keywords = title.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 3)
        .slice(0, 3)
        .join(' ') || 'career professional job';
    
    console.log(`🖼️ Fetching ${imageCount} images for keywords: "${keywords}"`);
    
    const images = [];
    
    // Try to fetch images from different sources
    for (let i = 0; i < imageCount; i++) {
        let imageUrl = null;
        
        // Try Pexels first (if API key available)
        if (process.env.PEXELS_API_KEY) {
            imageUrl = await fetchImageFromPexels(keywords, 800, 600);
        }
        
        // Try Pixabay (if API key available)
        if (!imageUrl && process.env.PIXABAY_API_KEY) {
            imageUrl = await fetchImageFromPixabay(keywords, 800, 600);
        }
        
        // Fallback to Picsum Photos (free, no API key needed)
        if (!imageUrl) {
            // Add variation to keywords for different images using seed
            const variationKeywords = i === 0 ? keywords : 
                                    i === 1 ? `${keywords} office` : 
                                    `${keywords} business`;
            // Generate unique seed for each image variation
            const seed = variationKeywords.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) + i;
            imageUrl = await fetchImageFromPicsum(variationKeywords, 800, 600, seed);
        }
        
        images.push(imageUrl);
        
        // Small delay to avoid rate limiting
        if (i < imageCount - 1) {
            await new Promise(resolve => setTimeout(resolve, 200));
        }
    }
    
    console.log(`✅ Fetched ${images.length} images`);
    return images;
}

// Fetch free images from Picsum Photos (completely free, no API key required)
// Picsum provides random high-quality images from Unsplash
async function fetchImageFromPicsum(keywords, width = 800, height = 600, seed = null) {
    try {
        // Picsum Photos API (free, no API key needed, reliable)
        // Format: https://picsum.photos/{width}/{height} or with seed for consistent images
        // We can use a seed based on keywords to get consistent images
        let url;
        if (seed) {
            // Use seed for consistent images based on keywords
            url = `https://picsum.photos/seed/${seed}/${width}/${height}`;
        } else {
            // Generate seed from keywords
            const keywordString = Array.isArray(keywords) ? keywords.join(' ') : keywords;
            const seedValue = keywordString.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
            url = `https://picsum.photos/seed/${seedValue}/${width}/${height}`;
        }
        
        return url;
    } catch (error) {
        console.error('Error fetching Picsum image:', error);
        return null;
    }
}

// Alternative: Fetch from Placeholder.com (backup)
async function fetchImageFromPlaceholder(keywords, width = 800, height = 600) {
    try {
        // Placeholder.com - simple placeholder images
        const keywordString = Array.isArray(keywords) ? keywords.join(' ') : keywords;
        const text = keywordString.split(' ').slice(0, 2).join(' ').substring(0, 20);
        const url = `https://via.placeholder.com/${width}x${height}?text=${encodeURIComponent(text)}`;
        return url;
    } catch (error) {
        console.error('Error fetching placeholder image:', error);
        return null;
    }
}

// Fetch images from Unsplash API (requires free API key in env - better quality)
async function fetchImageFromUnsplashAPI(keywords, width = 800, height = 600) {
    try {
        const accessKey = process.env.UNSPLASH_ACCESS_KEY;
        if (!accessKey) {
            return null; // No API key, skip
        }

        const searchQuery = keywords.join(' ');
        const response = await fetch(
            `https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchQuery)}&per_page=1&orientation=landscape&w=${width}&h=${height}`,
            {
                headers: {
                    'Authorization': `Client-ID ${accessKey}`
                }
            }
        );

        if (!response.ok) {
            return null;
        }

        const data = await response.json();
        if (data.results && data.results.length > 0) {
            const photo = data.results[0];
            return photo.urls.regular || photo.urls.small;
        }

        return null;
    } catch (error) {
        console.error('Error fetching Unsplash API image:', error);
        return null;
    }
}

// Fetch images from Pexels (requires free API key in env)
async function fetchImageFromPexels(keywords, width = 800, height = 600) {
    try {
        const apiKey = process.env.PEXELS_API_KEY;
        if (!apiKey) {
            return null; // No API key, skip
        }

        const keywordString = Array.isArray(keywords) ? keywords.join(' ') : keywords;
        const searchQuery = keywordString;
        const response = await fetch(
            `https://api.pexels.com/v1/search?query=${encodeURIComponent(searchQuery)}&per_page=1&orientation=landscape`,
            {
                headers: {
                    'Authorization': apiKey
                }
            }
        );

        if (!response.ok) {
            return null;
        }

        const data = await response.json();
        if (data.photos && data.photos.length > 0) {
            // Get image URL with desired dimensions
            const photo = data.photos[0];
            return photo.src.original || photo.src.large || photo.src.medium;
        }

        return null;
    } catch (error) {
        console.error('Error fetching Pexels image:', error);
        return null;
    }
}

// Generate image keywords from blog title and content
function generateImageKeywords(title, content = '') {
    // Extract keywords from title
    const titleWords = title.toLowerCase()
        .split(/\s+/)
        .filter(word => word.length > 3)
        .slice(0, 3);
    
    // Common career/job related keywords
    const careerKeywords = ['career', 'job', 'professional', 'business', 'office', 'work', 'success', 'teamwork', 'meeting'];
    
    // Combine title words with career keywords
    const keywords = [...titleWords, ...careerKeywords].slice(0, 3);
    
    return keywords;
}

// Fetch appropriate image URL for blog content
async function fetchBlogImage(keywords, imageType = 'general') {
    // Convert keywords array to string if needed
    const keywordString = Array.isArray(keywords) ? keywords.join(' ') : keywords;
    
    // Try Pexels first if API key is available (better quality)
    if (process.env.PEXELS_API_KEY) {
        const pexelsImage = await fetchImageFromPexels(keywords, 800, 600);
        if (pexelsImage) {
            console.log(`✅ Got Pexels image for: ${keywordString}`);
            return pexelsImage;
        }
    }

    // Try Pixabay if API key is available
    if (process.env.PIXABAY_API_KEY) {
        const pixabayImage = await fetchImageFromPixabay(keywordString, 800, 600);
        if (pixabayImage) {
            console.log(`✅ Got Pixabay image for: ${keywordString}`);
            return pixabayImage;
        }
    }

    // Fallback to Picsum Photos (free, no API key needed) - this always works!
    const picsumImage = await fetchImageFromPicsum(keywords, 800, 600);
    if (picsumImage) {
        console.log(`✅ Got Picsum Photos image for: ${keywordString}`);
        return picsumImage;
    }
    
    // Final fallback: Placeholder.com
    const placeholderImage = await fetchImageFromPlaceholder(keywords, 800, 600);
    if (placeholderImage) {
        console.log(`✅ Got Placeholder image for: ${keywordString}`);
        return placeholderImage;
    }

    // Final fallback: use placeholder or default
    console.warn(`⚠️ No image found for: ${keywordString}, using default`);
    return `/assets/images/blog/d-lg-01.jpg`;
}

// Fetch blog content from the website to understand style
async function fetchBlogStyle() {
    try {
        // Get published blogs to understand the writing style
        const blogs = await getBlogs(1, 5, '', '', 'published');
        
        if (!blogs || !blogs.blogs || blogs.blogs.length === 0) {
            return null;
        }

        // Extract style information from existing blogs
        const styleExamples = blogs.blogs.slice(0, 3).map(blog => ({
            title: blog.title,
            description: blog.description,
            content: blog.content ? blog.content.substring(0, 2000) : '' // Limit content length
        }));

        return styleExamples;
    } catch (error) {
        console.error('Error fetching blog style:', error);
        return null;
    }
}

// Generate slug from title
function generateSlug(title) {
    return title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
        .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

// Generate blog content using OpenAI following Template One structure (Prompt 1)
async function generateBlogContentTemplateOne(title, styleExamples) {
    try {
        const styleContext = styleExamples && styleExamples.length > 0
            ? `\n\nSTYLE EXAMPLES FROM EXISTING BLOGS:\n${JSON.stringify(styleExamples, null, 2)}\n\n`
            : '';

        const prompt = `You are an expert blog writer for JustJobsInfo, a career and job search platform. Write a comprehensive, engaging blog post following the EXACT Template One structure provided below.

${styleContext}

BLOG TITLE: ${title}

CRITICAL REQUIREMENTS - You MUST follow Template One structure exactly:

1. **Intro Section** (appears directly under blog title):
   - Optional Subheading: A brief, energetic headline (1-8 words, optional)
   - Lead Paragraph: Set the scene with a clear overview (3-5 sentences, 80-120 words)
   - Secondary Paragraph: Add supporting context or contrasting insight (3-5 sentences, 80-120 words)

2. **Quote Highlight** (full-width pull quote):
   - Quote Text: An inspiring, relevant quote in first person (1-2 sentences, 20-40 words)
   - Quote Author: A credible name (e.g., "Sarah Johnson")
   - Author Title: Their role (e.g., "Career Expert", "HR Director", "Industry Leader")

3. **Narrative + Image Pair**:
   - Supporting Paragraph: Describe challenge/opportunity in depth (4-6 sentences, 100-150 words)
   - Left Image URL: Use placeholder "/assets/images/blog/d-lg-01.jpg" (we'll replace later)
   - Right Image URL: Use placeholder "/assets/images/blog/d-lg-02.jpg" (we'll replace later)

4. **Strategy Checklist Section**:
   - Section Title: A compelling headline (5-10 words, e.g., "Ultimate Career Strategy Solution")
   - Section Paragraph: Explain how the strategy works and why it matters (4-6 sentences, 100-150 words)
   - Feature Image URL: Use placeholder "/assets/images/blog/details/03.jpg" (we'll replace later)
   - Checklist Bullet Points: Exactly 5 actionable, specific bullet points (each 8-15 words):
     * Bullet 1: First key strategy or tip
     * Bullet 2: Second key strategy or tip
     * Bullet 3: Third key strategy or tip
     * Bullet 4: Fourth key strategy or tip
     * Bullet 5: Fifth key strategy or tip

5. **Closing Section**:
   - Closing Paragraph: Summarize outcomes or next steps (3-5 sentences, 80-120 words)
   - Tags: Generate EXACTLY 3 relevant tags (single words or short phrases, comma-separated). Tags should be related to the blog topic and useful for categorization. Examples: "Career Advice", "Job Search", "Resume Tips", "Interview Skills", "Career Growth", "Professional Development"

WRITING STYLE:
- Professional yet conversational tone
- Practical, actionable advice for job seekers and career professionals
- Use specific examples and real-world scenarios
- Engaging and SEO-friendly
- Total word count: 600-900 words across all sections
${styleExamples && styleExamples.length > 0 
    ? '- Match the writing style and tone of the existing blog examples provided above'
    : ''
}

OUTPUT FORMAT - Return a JSON object with this EXACT structure:
{
  "mainTitle": "Optional subheading or empty string",
  "paragraph1": "Lead paragraph text...",
  "paragraph2": "Secondary paragraph text...",
  "quoteText": "Quote text in first person...",
  "quoteAuthor": "Author Name",
  "quoteAuthorTitle": "Author Title",
  "paragraph3": "Supporting paragraph for image pair...",
  "image1": "/assets/images/blog/d-lg-01.jpg",
  "image2": "/assets/images/blog/d-lg-02.jpg",
  "sectionTitle": "Section Title Here",
  "paragraph4": "Section paragraph explaining strategy...",
  "image3": "/assets/images/blog/details/03.jpg",
  "bulletPoints": [
    "First bullet point",
    "Second bullet point",
    "Third bullet point",
    "Fourth bullet point",
    "Fifth bullet point"
  ],
  "paragraph5": "Closing paragraph summarizing outcomes...",
  "tags": "tag1, tag2, tag3"
}

CRITICAL: The "tags" field MUST contain exactly 3 tags, comma-separated. Do not include fewer or more than 3 tags. Each tag should be relevant to the blog topic and useful for categorization.

Return ONLY valid JSON, no additional text or explanations.`;

        // Try with JSON mode first, fallback to regular mode if not supported
        let completion;
        try {
            completion = await openai.chat.completions.create({
                model: "gpt-4o", // Using gpt-4o which supports JSON mode
                messages: [
                    {
                        role: "system",
                        content: "You are an expert blog writer specializing in career advice, job search tips, and professional development content. You write engaging, informative, and SEO-friendly blog posts that help job seekers and career professionals. You always follow exact template structures and return ONLY valid JSON without any markdown formatting, code blocks, or additional text. Your response must be valid JSON only."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                max_tokens: 4000,
                temperature: 0.7,
                response_format: { type: "json_object" }
            });
        } catch (jsonModeError) {
            // Fallback: Try without JSON mode if the model doesn't support it
            if (jsonModeError.message && jsonModeError.message.includes('response_format')) {
                console.log('⚠️ JSON mode not supported, falling back to regular mode');
                completion = await openai.chat.completions.create({
                    model: "gpt-4",
                    messages: [
                        {
                            role: "system",
                            content: "You are an expert blog writer specializing in career advice, job search tips, and professional development content. You write engaging, informative, and SEO-friendly blog posts that help job seekers and career professionals. You always follow exact template structures and return ONLY valid JSON without any markdown formatting, code blocks, or additional text. Your response must be valid JSON only, starting with { and ending with }."
                        },
                        {
                            role: "user",
                            content: prompt
                        }
                    ],
                    max_tokens: 4000,
                    temperature: 0.7
                });
            } else {
                throw jsonModeError;
            }
        }

        let responseText = completion.choices[0].message.content.trim();
        
        // Clean up response text (remove markdown code blocks if present)
        responseText = responseText.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
        
        // Parse JSON response
        let templateData;
        try {
            templateData = JSON.parse(responseText);
        } catch (parseError) {
            // Try to extract JSON if wrapped in other text
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                try {
                    templateData = JSON.parse(jsonMatch[0]);
                } catch (e) {
                    console.error('Failed to parse JSON:', e);
                    throw new Error('Failed to parse template data from OpenAI response');
                }
            } else {
                throw new Error('Failed to parse template data from OpenAI response');
            }
        }
        
        // Validate required fields
        if (!templateData.paragraph1 || !templateData.paragraph2 || !templateData.paragraph3) {
            throw new Error('Generated content missing required paragraphs');
        }

        // Generate image keywords from title
        const imageKeywords = generateImageKeywords(title);
        console.log(`🖼️ Generating images for keywords:`, imageKeywords);

        // Fetch images for the blog
        const [image1, image2, image3] = await Promise.all([
            fetchBlogImage([...imageKeywords, 'business', 'professional'], 'side-image-1'),
            fetchBlogImage([...imageKeywords, 'career', 'success'], 'side-image-2'),
            fetchBlogImage([...imageKeywords, 'teamwork', 'office'], 'feature-image')
        ]);

        console.log(`✅ Fetched images:`, { image1, image2, image3 });

        // Generate HTML content following Template One structure
        const escapeHtml = (text = '') =>
            String(text)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');

        const formatText = (value, fallback = '') => escapeHtml(value && value.trim() ? value.trim() : fallback);
        const formatParagraph = (value, fallback = '') => escapeHtml(value && value.trim() ? value.trim() : fallback);
        const formatAttribute = (value, fallback = '') => formatText(value, fallback).replace(/"/g, '&quot;');
        const imageOrDefault = (value, fallback) => value && value.trim() ? value.trim() : fallback;

        // Process bullet points
        const bulletPoints = Array.isArray(templateData.bulletPoints) 
            ? templateData.bulletPoints.filter(bp => bp && bp.trim())
            : [];
        
        // Ensure we have exactly 5 bullet points
        while (bulletPoints.length < 5) {
            bulletPoints.push('');
        }
        const bulletPointsFinal = bulletPoints.slice(0, 5);

        const bulletMarkup = bulletPointsFinal
            .map(point => `
        <li class="template-one__check">
          <i class="far fa-check-circle"></i>
          <span>${formatParagraph(point, '')}</span>
        </li>
      `)
            .join('');

        // Parse and validate tags BEFORE generating HTML
        let tags = [];
        if (templateData.tags) {
            if (typeof templateData.tags === 'string') {
                tags = templateData.tags.split(',').map(t => t.trim()).filter(t => t);
            } else if (Array.isArray(templateData.tags)) {
                tags = templateData.tags.map(t => String(t).trim()).filter(t => t);
            }
        }
        
        // Ensure we have exactly 3 tags
        // If we have fewer than 3, generate default tags based on the title
        while (tags.length < 3) {
            // Generate default tags based on title keywords
            const titleWords = title.toLowerCase().split(/\s+/).filter(w => w.length > 3);
            const defaultTags = ['Career Advice', 'Job Search', 'Professional Development', 'Career Tips', 'Job Market', 'Career Growth'];
            const availableTags = defaultTags.filter(tag => !tags.some(existing => existing.toLowerCase().includes(tag.toLowerCase())));
            if (availableTags.length > 0) {
                tags.push(availableTags[0]);
            } else {
                // Fallback tags
                tags.push('Career', 'Jobs', 'Advice');
                break;
            }
        }
        
        // Ensure exactly 3 tags
        tags = tags.slice(0, 3);
        
        // Generate tag chips HTML
        const tagChipsHTML = tags.length > 0 ? `
  <div class="template-one__tags" style="margin-top:20px;display:flex;gap:8px;flex-wrap:wrap;">
    ${tags.map(tag => `<span style="background:#e0f7fa;color:#00796b;padding:5px 10px;border-radius:5px;font-size:12px;">${formatText(tag, '')}</span>`).join('')}
  </div>` : '';

        // Generate Template One HTML
        const content = `
<section class="template-one">
  ${templateData.mainTitle?.trim() ? `<h3 class="template-one__subheading">${formatText(templateData.mainTitle, '')}</h3>` : ''}
  <p>${formatParagraph(templateData.paragraph1, '')}</p>
  <p>${formatParagraph(templateData.paragraph2, '')}</p>
  <div class="template-one__quote">
    <p class="template-one__quote-text">${formatParagraph(templateData.quoteText, '')}</p>
    <span class="template-one__quote-author">${formatText(templateData.quoteAuthor, 'Daniel X. Horrar')}</span>
    <div class="template-one__quote-role">${formatText(templateData.quoteAuthorTitle, 'Author')}</div>
  </div>
  <p>${formatParagraph(templateData.paragraph3, '')}</p>
  <div class="template-one__image-row" style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin:24px 0;align-items:stretch;">
    <img src="${formatAttribute(image1 || imageOrDefault(templateData.image1, '/assets/images/blog/d-lg-01.jpg'))}" alt="template one visual one" loading="lazy" style="width:100%;border-radius:12px;object-fit:cover;display:block;aspect-ratio:16/9;min-height:240px;" />
    <img src="${formatAttribute(image2 || imageOrDefault(templateData.image2, '/assets/images/blog/d-lg-02.jpg'))}" alt="template one visual two" loading="lazy" style="width:100%;border-radius:12px;object-fit:cover;display:block;aspect-ratio:16/9;min-height:240px;" />
  </div>
  <h4 class="template-one__section-title">${formatParagraph(templateData.sectionTitle, 'Ultimate Business Strategy Solution')}</h4>
  <p>${formatParagraph(templateData.paragraph4, '')}</p>
  <div class="template-one__feature" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:20px;align-items:center;margin:24px 0 18px;">
    <div class="template-one__feature-image">
      <img src="${formatAttribute(image3 || imageOrDefault(templateData.image3, '/assets/images/blog/details/03.jpg'))}" alt="template one feature visual" loading="lazy" style="width:100%;border-radius:12px;object-fit:cover;display:block;aspect-ratio:16/9;min-height:240px;" />
    </div>
    <ul class="template-one__checklist">
      ${bulletMarkup}
    </ul>
  </div>
  <p>${formatParagraph(templateData.paragraph5, '')}</p>${tagChipsHTML}
</section>`.trim();

        // Generate description from first paragraph
        const description = formatParagraph(templateData.paragraph1, '').substring(0, 200).trim() + 
            (formatParagraph(templateData.paragraph1, '').length > 200 ? '...' : '');

        // Log tags for debugging
        console.log(`📋 Generated tags for "${title}":`, tags);

        return {
            content,
            description,
            tags
        };
    } catch (error) {
        console.error('Error generating Template One blog content:', error);
        throw error;
    }
}

// Generate blog content using a standard blog layout (Prompt 2)
async function generateBlogContentStandard(title, styleExamples) {
    try {
        const styleContext = styleExamples && styleExamples.length > 0
            ? `\n\nSTYLE EXAMPLES FROM EXISTING BLOGS:\n${JSON.stringify(styleExamples, null, 2)}\n\n`
            : '';

        const prompt = `You are an expert blog writer for JustJobsInfo, a career and job search platform. Write a comprehensive, engaging blog post using a STANDARD blog layout (intro, subheadings, paragraphs), not a visual template structure.

${styleContext}

BLOG TITLE: ${title}

STRUCTURE REQUIREMENTS (STANDARD BLOG):
1. INTRODUCTION:
   - 1–2 paragraphs. Each paragraph must be SUBSTANTIAL: at least 5–8 sentences (or 80–120 words). Clearly introduce the topic and why it matters to job seekers or career professionals. Do not write short, thin paragraphs.

2. MAIN SECTIONS:
   - Create between 3 and 5 main sections.
   - Each section must have a clear heading (5–10 words) and 1–3 supporting paragraphs. Every paragraph must be SUBSTANTIAL: at least 5–8 sentences (or 80–120 words). Develop one idea fully per paragraph; avoid one- or two-sentence paragraphs.
   - At least ONE of the sections should contain a short bullet list of 3–6 concise, practical tips.

3. CONCLUSION:
   - 1–2 paragraphs. Each paragraph should be substantial (at least 4–6 sentences). Summarise key takeaways and give a clear call to action (e.g., update your CV, prepare for interviews, explore roles, etc.).

4. TAGS:
   - Generate EXACTLY 3 relevant tags (single words or short phrases, comma-separated). Tags should be related to the blog topic and useful for categorisation. Examples: "Career Advice", "Job Search", "Resume Tips", "Interview Skills", "Career Growth", "Professional Development".

PARAGRAPH LENGTH (IMPORTANT):
- Every paragraph in intro, sections, and conclusion must contain enough text to feel like a real blog block: typically 5–8 sentences or 80–120 words.
- Do not output short 1–3 sentence paragraphs. If in doubt, write more rather than less.

WRITING STYLE:
- Professional yet conversational tone
- Practical, actionable advice for job seekers and career professionals
- Use specific examples and real-world scenarios
- Engaging and SEO-friendly
- Total word count: 1,200–1,800 words across all sections (aim for rich, detailed content)
${styleExamples && styleExamples.length > 0 
    ? '- Match the writing style and tone of the existing blog examples provided above.'
    : ''
}

OUTPUT FORMAT - Return a JSON object with this EXACT structure:
{
  "intro": [
    "First intro paragraph...",
    "Second intro paragraph (optional)..."
  ],
  "sections": [
    {
      "heading": "Section heading",
      "paragraphs": [
        "Paragraph 1 for this section...",
        "Paragraph 2 for this section..."
      ],
      "bullets": [
        "Optional bullet 1 (if relevant)",
        "Optional bullet 2"
      ]
    }
  ],
  "conclusion": [
    "First conclusion paragraph...",
    "Second conclusion paragraph (optional)..."
  ],
  "tags": "tag1, tag2, tag3"
}

CRITICAL:
- The "sections" array must contain between 3 and 5 entries.
- Each section must have a non-empty "heading" and at least one paragraph.
- Every paragraph (intro, sections, conclusion) must be LONG: 5–8 sentences or 80–120 words. No short 1–3 sentence paragraphs.
- Bullets are optional but recommended in at least one section.
- The "tags" field MUST contain exactly 3 tags, comma-separated.`;

        // Use JSON mode where possible
        let completion;
        try {
            completion = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    {
                        role: "system",
                        content: "You are an expert blog writer specialising in standard long-form articles for career advice, job search, and professional development. You always return ONLY valid JSON without markdown or extra text."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                max_tokens: 4000,
                temperature: 0.7,
                response_format: { type: "json_object" }
            });
        } catch (jsonModeError) {
            if (jsonModeError.message && jsonModeError.message.includes('response_format')) {
                console.log('⚠️ JSON mode not supported for standard layout, falling back to regular mode');
                completion = await openai.chat.completions.create({
                    model: "gpt-4",
                    messages: [
                        {
                            role: "system",
                            content: "You are an expert blog writer specialising in standard long-form articles for career advice, job search, and professional development. You always return ONLY valid JSON without markdown or extra text. Your response must start with { and end with }."
                        },
                        {
                            role: "user",
                            content: prompt
                        }
                    ],
                    max_tokens: 4000,
                    temperature: 0.7
                });
            } else {
                throw jsonModeError;
            }
        }

        let responseText = completion.choices[0].message.content.trim();
        responseText = responseText.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();

        let templateData;
        try {
            templateData = JSON.parse(responseText);
        } catch (parseError) {
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                templateData = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error('Failed to parse standard blog data from OpenAI response');
            }
        }

        // Basic validation
        if (!Array.isArray(templateData.intro) || !Array.isArray(templateData.sections) || templateData.sections.length === 0) {
            throw new Error('Generated standard blog content missing required sections');
        }

        // Fetch images (same as Prompt 1 – Pexels/Pixabay/Picsum)
        const imageKeywords = generateImageKeywords(title);
        console.log(`🖼️ [Prompt 2] Fetching images for:`, imageKeywords);
        const [image1, image2, image3] = await Promise.all([
            fetchBlogImage([...imageKeywords, 'business', 'professional'], 'standard-1'),
            fetchBlogImage([...imageKeywords, 'career', 'success'], 'standard-2'),
            fetchBlogImage([...imageKeywords, 'teamwork', 'office'], 'standard-3')
        ]);
        console.log(`✅ [Prompt 2] Fetched images:`, { image1, image2, image3 });

        // Helpers (duplicated here for isolation)
        const escapeHtml = (text = '') =>
            String(text)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');

        const formatParagraph = (value, fallback = '') => escapeHtml(value && value.trim() ? value.trim() : fallback);
        const formatText = (value, fallback = '') => escapeHtml(value && value.trim() ? value.trim() : fallback);
        const formatAttribute = (value, fallback = '') => (value && value.trim() ? value.trim() : fallback).replace(/"/g, '&quot;');
        const imgUrl = (url, fallback) => (url && url.trim() ? url.trim() : fallback || '/assets/images/blog/d-lg-01.jpg');

        // Parse and validate tags
        let tags = [];
        if (templateData.tags) {
            if (typeof templateData.tags === 'string') {
                tags = templateData.tags.split(',').map(t => t.trim()).filter(t => t);
            } else if (Array.isArray(templateData.tags)) {
                tags = templateData.tags.map(t => String(t).trim()).filter(t => t);
            }
        }

        while (tags.length < 3) {
            const defaultTags = ['Career Advice', 'Job Search', 'Professional Development', 'Career Tips', 'Job Market', 'Career Growth'];
            const availableTags = defaultTags.filter(tag => !tags.some(existing => existing.toLowerCase().includes(tag.toLowerCase())));
            if (availableTags.length > 0) {
                tags.push(availableTags[0]);
            } else {
                tags.push('Career', 'Jobs', 'Advice');
                break;
            }
        }
        tags = tags.slice(0, 3);

        const tagChipsHTML = tags.length > 0 ? `
  <div class="standard-blog__tags" style="margin-top:6px;display:flex;gap:8px;flex-wrap:wrap;">
    ${tags.map(tag => `<span style="background:#e0f7fa;color:#00796b;padding:5px 10px;border-radius:5px;font-size:12px;">${formatText(tag, '')}</span>`).join('')}
  </div>` : '';

        const pStyle = 'margin:0 0 2px;font-size:16px;line-height:1.55;color:#374151;';
        const introHtml = (templateData.intro || [])
            .filter(p => p && p.trim())
            .map((p, i) => `<p class="standard-blog__p" style="${pStyle}${i === 0 ? '' : ' margin-top:0;'}">${formatParagraph(p, '')}</p>`)
            .join('');

        const sectionBlocks = (templateData.sections || []).slice(0, 5).map(section => {
            const heading = formatText(section.heading || '', '');
            const paragraphs = (section.paragraphs || [])
                .filter(p => p && p.trim())
                .map(p => `<p class="standard-blog__p" style="${pStyle}">${formatParagraph(p, '')}</p>`)
                .join('');
            const bullets = Array.isArray(section.bullets) ? section.bullets.filter(b => b && b.trim()) : [];
            const bulletsHtml = bullets.length > 0
                ? `<ul class="standard-blog__list" style="margin:2px 0 2px;padding-left:20px;list-style:disc;"><li style="margin:0 0 2px;font-size:15px;line-height:1.5;color:#374151;">${bullets.map(b => formatParagraph(b, '')).join('</li><li style="margin:0 0 2px;font-size:15px;line-height:1.5;color:#374151;">')}</li></ul>`
                : '';
            return { heading, paragraphs, bulletsHtml };
        });

        const imgBlock = (src, alt = 'Blog image') =>
            `<div class="standard-blog__image-wrap" style="margin:4px 0;width:100%;overflow:hidden;"><img src="${formatAttribute(imgUrl(src), '')}" alt="${formatAttribute(alt, '')}" loading="lazy" style="width:100%;height:auto;display:block;aspect-ratio:16/9;object-fit:cover;" /></div>`;

        const singleSectionHtml = (block) => `
  <section class="standard-blog__section" style="margin-bottom:6px;">
    ${block.heading ? `<h2 class="standard-blog__h2" style="margin:0 0 2px;font-size:20px;font-weight:700;color:#111827;line-height:1.3;">${block.heading}</h2>` : ''}
    ${block.paragraphs}
    ${block.bulletsHtml}
  </section>`;

        let sectionsHtml = '';
        sectionBlocks.forEach((block, i) => {
            sectionsHtml += singleSectionHtml(block);
            if (i === 0) sectionsHtml += '\n  ' + imgBlock(image2, 'Career and professional development');
        });

        const conclusionHtml = (templateData.conclusion || [])
            .filter(p => p && p.trim())
            .map(p => `<p class="standard-blog__p" style="${pStyle}">${formatParagraph(p, '')}</p>`)
            .join('');

        const content = `
<section class="standard-blog" style="font-family:var(--font-primary,Inter,sans-serif);max-width:100%;">
  <div class="standard-blog__intro" style="margin-bottom:4px;">
    ${introHtml}
  </div>
  ${imgBlock(image1, 'Career and job search')}
  ${sectionsHtml}
  ${imgBlock(image3, 'Professional growth')}
  <div class="standard-blog__conclusion" style="margin-top:4px;">
    ${conclusionHtml}
  </div>${tagChipsHTML}
</section>`.trim();

        const allIntroText = (templateData.intro || []).join(' ');
        const description = formatParagraph(allIntroText || '', '').substring(0, 200).trim() +
            (formatParagraph(allIntroText || '', '').length > 200 ? '...' : '');

        console.log(`📋 Generated standard blog tags for "${title}":`, tags);

        return {
            content,
            description,
            tags
        };
    } catch (error) {
        console.error('Error generating standard blog content:', error);
        throw error;
    }
}

// POST /api/blogs/auto-generate - Generate blogs from titles
export async function POST(request) {
    try {
        const body = await request.json();
        const { titles, variant } = body;

        if (!titles || !Array.isArray(titles) || titles.length === 0) {
            return NextResponse.json({
                success: false,
                error: 'Please provide an array of blog titles'
            }, { status: 400 });
        }

        // Fetch blog style from existing blogs
        console.log('📚 Fetching blog style from existing blogs...');
        const styleExamples = await fetchBlogStyle();
        
        if (styleExamples && styleExamples.length > 0) {
            console.log(`✅ Found ${styleExamples.length} blog examples for style reference`);
        } else {
            console.log('⚠️ No existing blogs found for style reference, using default style');
        }

        const results = [];
        const errors = [];

        // Process each title
        for (let i = 0; i < titles.length; i++) {
            const title = titles[i].trim();
            
            if (!title) {
                errors.push({ title: title || `Title ${i + 1}`, error: 'Empty title' });
                continue;
            }

            try {
                console.log(`📝 Generating blog ${i + 1}/${titles.length}: "${title}" using variant "${variant || 'template-one'}"`);
                
                // Generate content (Prompt 1 = template-one, Prompt 2 = standard)
                const useVariant = variant || 'template-one';
                const { content, description, tags } = useVariant === 'standard'
                    ? await generateBlogContentStandard(title, styleExamples)
                    : await generateBlogContentTemplateOne(title, styleExamples);
                
                // Validate tags
                if (!tags || tags.length === 0) {
                    console.warn(`⚠️ No tags generated for "${title}", using defaults`);
                }
                const finalTags = tags && tags.length > 0 ? tags.slice(0, 3) : ['Career Advice', 'Job Search', 'Professional Development'];
                console.log(`✅ Final tags for "${title}":`, finalTags);

                // Generate slug
                let slug = generateSlug(title);
                
                // Check if slug exists and make it unique
                const existingBlogs = await getBlogs(1, 1, '', '', '');
                let uniqueSlug = slug;
                let counter = 1;
                while (existingBlogs.blogs.some(blog => blog.slug === uniqueSlug)) {
                    uniqueSlug = `${slug}-${counter}`;
                    counter++;
                }

                // Create blog in draft status
                const blogData = {
                    title: title,
                    slug: uniqueSlug,
                    description: description,
                    content: content,
                    category: 'Career Advice', // Default category
                    tags: finalTags, // Use validated tags (always 3 tags)
                    status: 'draft', // Create as draft
                    featured: false,
                    author: 'JustJobsInfo Team',
                    authorId: '',
                    authorBio: '',
                    authorRole: '',
                    image: '',
                    bannerImg: '',
                    publishedDate: new Date().toISOString().split('T')[0]
                };

                const blogId = await createBlog(blogData);
                
                results.push({
                    title,
                    slug: uniqueSlug,
                    id: blogId,
                    status: 'draft'
                });

                console.log(`✅ Blog "${title}" created successfully (ID: ${blogId})`);
                
                // Add a small delay between requests to avoid rate limiting
                if (i < titles.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            } catch (error) {
                console.error(`❌ Error generating blog for "${title}":`, error);
                errors.push({
                    title,
                    error: error.message || 'Failed to generate blog'
                });
            }
        }

        return NextResponse.json({
            success: true,
            data: {
                generated: results.length,
                failed: errors.length,
                results,
                errors: errors.length > 0 ? errors : undefined
            },
            message: `Successfully generated ${results.length} blog${results.length !== 1 ? 's' : ''} in draft status`
        });

    } catch (error) {
        console.error('❌ Error in auto-generate endpoint:', error);
        return NextResponse.json({
            success: false,
            error: error.message || 'Failed to generate blogs'
        }, { status: 500 });
    }
}
