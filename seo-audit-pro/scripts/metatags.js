import axios from 'axios';

/**
 * Fetches and analyzes meta tags from a URL
 * @param {string} url - The URL to analyze
 * @returns {Promise<Object>} Meta tag analysis results
 */
export async function analyzeMetaTags(url) {
  try {
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SEO-Audit-Pro/1.0)'
      }
    });

    const html = response.data;
    const issues = [];
    const warnings = [];
    const opportunities = [];

    // Extract meta tags
    const title = extractTitle(html);
    const description = extractMetaDescription(html);
    const keywords = extractMetaKeywords(html);
    const ogTags = extractOpenGraphTags(html);
    const canonicalUrl = extractCanonical(html);
    const robotsMeta = extractRobotsMeta(html);

    // Analyze title
    if (!title) {
      issues.push({ type: 'critical', message: 'Missing page title' });
    } else if (title.length < 30) {
      warnings.push({ type: 'warning', message: `Title too short (${title.length} chars, recommended: 30-60)` });
    } else if (title.length > 60) {
      warnings.push({ type: 'warning', message: `Title too long (${title.length} chars, may be truncated in search results)` });
    }

    // Analyze description
    if (!description) {
      issues.push({ type: 'critical', message: 'Missing meta description' });
    } else if (description.length < 120) {
      warnings.push({ type: 'warning', message: `Meta description too short (${description.length} chars, recommended: 120-160)` });
    } else if (description.length > 160) {
      warnings.push({ type: 'warning', message: `Meta description too long (${description.length} chars)` });
    }

    // Check Open Graph tags
    if (!ogTags.title || !ogTags.description || !ogTags.image) {
      opportunities.push({ type: 'opportunity', message: 'Add Open Graph tags for better social media sharing' });
    }

    // Check canonical URL
    if (!canonicalUrl) {
      opportunities.push({ type: 'opportunity', message: 'Consider adding a canonical URL tag' });
    }

    // Analyze headers
    const headers = analyzeHeaders(html);

    return {
      title,
      description,
      keywords,
      ogTags,
      canonicalUrl,
      robotsMeta,
      headers,
      issues,
      warnings,
      opportunities
    };
  } catch (error) {
    throw new Error(`Failed to fetch page: ${error.message}`);
  }
}

/**
 * Extracts page title
 */
function extractTitle(html) {
  const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return match ? match[1].trim() : null;
}

/**
 * Extracts meta description
 */
function extractMetaDescription(html) {
  const match = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
  return match ? match[1].trim() : null;
}

/**
 * Extracts meta keywords
 */
function extractMetaKeywords(html) {
  const match = html.match(/<meta\s+name=["']keywords["']\s+content=["']([^"']+)["']/i);
  return match ? match[1].trim() : null;
}

/**
 * Extracts Open Graph tags
 */
function extractOpenGraphTags(html) {
  const ogTags = {};
  const patterns = {
    title: /<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i,
    description: /<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i,
    image: /<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i,
    url: /<meta\s+property=["']og:url["']\s+content=["']([^"']+)["']/i,
    type: /<meta\s+property=["']og:type["']\s+content=["']([^"']+)["']/i
  };

  for (const [key, pattern] of Object.entries(patterns)) {
    const match = html.match(pattern);
    ogTags[key] = match ? match[1].trim() : null;
  }

  return ogTags;
}

/**
 * Extracts canonical URL
 */
function extractCanonical(html) {
  const match = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i);
  return match ? match[1].trim() : null;
}

/**
 * Extracts robots meta tag
 */
function extractRobotsMeta(html) {
  const match = html.match(/<meta\s+name=["']robots["']\s+content=["']([^"']+)["']/i);
  return match ? match[1].trim() : null;
}

/**
 * Analyzes header structure (H1-H6)
 */
export function analyzeHeaders(html) {
  const headers = {
    h1: [],
    h2: [],
    h3: [],
    h4: [],
    h5: [],
    h6: []
  };

  const issues = [];
  const warnings = [];

  // Extract all headers
  for (let level = 1; level <= 6; level++) {
    const regex = new RegExp(`<h${level}[^>]*>([^<]+)</h${level}>`, 'gi');
    let match;
    while ((match = regex.exec(html)) !== null) {
      headers[`h${level}`].push(match[1].trim());
    }
  }

  // Check H1
  if (headers.h1.length === 0) {
    issues.push({ type: 'critical', message: 'No H1 tag found' });
  } else if (headers.h1.length > 1) {
    warnings.push({ type: 'warning', message: `Multiple H1 tags found (${headers.h1.length}), should have only one` });
  }

  return {
    structure: headers,
    issues,
    warnings
  };
}

/**
 * Analyzes images for alt text
 */
export function analyzeImages(html) {
  const imgRegex = /<img[^>]*>/gi;
  const images = html.match(imgRegex) || [];

  let totalImages = images.length;
  let imagesWithAlt = 0;
  let imagesWithoutAlt = 0;

  images.forEach(img => {
    const hasAlt = /alt=["'][^"']*["']/i.test(img);
    if (hasAlt) {
      imagesWithAlt++;
    } else {
      imagesWithoutAlt++;
    }
  });

  const issues = [];
  if (imagesWithoutAlt > 0) {
    issues.push({
      type: 'warning',
      message: `${imagesWithoutAlt} image(s) without alt text (accessibility and SEO issue)`
    });
  }

  return {
    total: totalImages,
    withAlt: imagesWithAlt,
    withoutAlt: imagesWithoutAlt,
    coverage: totalImages > 0 ? Math.round((imagesWithAlt / totalImages) * 100) : 100,
    issues
  };
}

/**
 * Analyzes links (internal and external)
 */
export function analyzeLinks(html, baseUrl) {
  const linkRegex = /<a\s+[^>]*href=["']([^"']+)["'][^>]*>/gi;
  const links = [];
  let match;

  while ((match = linkRegex.exec(html)) !== null) {
    links.push(match[1]);
  }

  const internal = [];
  const external = [];
  const nofollow = [];

  const baseDomain = new URL(baseUrl).hostname;

  links.forEach(link => {
    try {
      if (link.startsWith('http://') || link.startsWith('https://')) {
        const linkDomain = new URL(link).hostname;
        if (linkDomain === baseDomain) {
          internal.push(link);
        } else {
          external.push(link);
        }
      } else if (!link.startsWith('#') && !link.startsWith('mailto:') && !link.startsWith('tel:')) {
        internal.push(link);
      }
    } catch (e) {
      // Invalid URL, skip
    }
  });

  return {
    total: links.length,
    internal: internal.length,
    external: external.length,
    ratio: links.length > 0 ? (internal.length / links.length * 100).toFixed(1) : 0
  };
}
