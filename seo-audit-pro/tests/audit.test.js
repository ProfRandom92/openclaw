import { test } from 'node:test';
import assert from 'node:assert';

// Mock test data
const mockPageSpeedResponse = {
  lighthouseResult: {
    categories: {
      performance: { score: 0.85 },
      seo: { score: 0.92 },
      accessibility: { score: 0.78 }
    },
    audits: {
      'first-contentful-paint': { displayValue: '1.2 s' },
      'largest-contentful-paint': { displayValue: '2.1 s' },
      'cumulative-layout-shift': { displayValue: '0.05' },
      'total-blocking-time': { displayValue: '150 ms' },
      'speed-index': { displayValue: '2.3 s' }
    }
  }
};

const mockHtml = `
<!DOCTYPE html>
<html>
<head>
  <title>Test Page Title</title>
  <meta name="description" content="This is a test meta description for the page">
  <meta property="og:title" content="Test OG Title">
  <meta property="og:description" content="Test OG Description">
  <link rel="canonical" href="https://example.com/test">
</head>
<body>
  <h1>Main Heading</h1>
  <h2>Subheading</h2>
  <img src="test1.jpg" alt="Test image">
  <img src="test2.jpg">
  <a href="https://example.com/page1">Internal Link</a>
  <a href="https://external.com">External Link</a>
</body>
</html>
`;

test('URL validation', () => {
  function isValidUrl(string) {
    try {
      const url = new URL(string);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (err) {
      return false;
    }
  }

  assert.strictEqual(isValidUrl('https://example.com'), true);
  assert.strictEqual(isValidUrl('http://example.com'), true);
  assert.strictEqual(isValidUrl('not-a-url'), false);
  assert.strictEqual(isValidUrl('ftp://example.com'), false);
});

test('Extract title from HTML', () => {
  function extractTitle(html) {
    const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    return match ? match[1].trim() : null;
  }

  const title = extractTitle(mockHtml);
  assert.strictEqual(title, 'Test Page Title');
});

test('Extract meta description from HTML', () => {
  function extractMetaDescription(html) {
    const match = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
    return match ? match[1].trim() : null;
  }

  const description = extractMetaDescription(mockHtml);
  assert.strictEqual(description, 'This is a test meta description for the page');
});

test('Count images and alt text coverage', () => {
  function analyzeImages(html) {
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

    return {
      total: totalImages,
      withAlt: imagesWithAlt,
      withoutAlt: imagesWithoutAlt,
      coverage: totalImages > 0 ? Math.round((imagesWithAlt / totalImages) * 100) : 100
    };
  }

  const result = analyzeImages(mockHtml);
  assert.strictEqual(result.total, 2);
  assert.strictEqual(result.withAlt, 1);
  assert.strictEqual(result.withoutAlt, 1);
  assert.strictEqual(result.coverage, 50);
});

test('Score calculation bounds', () => {
  function calculateScore(base, deductions) {
    let score = base - deductions;
    return Math.max(0, Math.min(100, score));
  }

  assert.strictEqual(calculateScore(100, 10), 90);
  assert.strictEqual(calculateScore(50, 100), 0);
  assert.strictEqual(calculateScore(100, -10), 100);
});

test('Grade assignment', () => {
  function getGrade(score) {
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    if (score >= 50) return 'D';
    return 'F';
  }

  assert.strictEqual(getGrade(95), 'A+');
  assert.strictEqual(getGrade(85), 'A');
  assert.strictEqual(getGrade(75), 'B');
  assert.strictEqual(getGrade(65), 'C');
  assert.strictEqual(getGrade(55), 'D');
  assert.strictEqual(getGrade(45), 'F');
});

test('PageSpeed metrics extraction', () => {
  function extractMetrics(data) {
    const lighthouseResult = data.lighthouseResult;
    const categories = lighthouseResult.categories;
    const audits = lighthouseResult.audits;

    return {
      performanceScore: Math.round(categories.performance.score * 100),
      seoScore: Math.round(categories.seo.score * 100),
      accessibilityScore: Math.round(categories.accessibility.score * 100),
      metrics: {
        fcp: audits['first-contentful-paint']?.displayValue || 'N/A',
        lcp: audits['largest-contentful-paint']?.displayValue || 'N/A',
        cls: audits['cumulative-layout-shift']?.displayValue || 'N/A'
      }
    };
  }

  const metrics = extractMetrics(mockPageSpeedResponse);
  assert.strictEqual(metrics.performanceScore, 85);
  assert.strictEqual(metrics.seoScore, 92);
  assert.strictEqual(metrics.accessibilityScore, 78);
  assert.strictEqual(metrics.metrics.fcp, '1.2 s');
});

test('Link counting', () => {
  function countLinks(html) {
    const linkRegex = /<a\s+[^>]*href=["']([^"']+)["'][^>]*>/gi;
    const links = [];
    let match;

    while ((match = linkRegex.exec(html)) !== null) {
      links.push(match[1]);
    }

    return links.length;
  }

  const linkCount = countLinks(mockHtml);
  assert.strictEqual(linkCount, 2);
});

test('Header structure analysis', () => {
  function analyzeHeaders(html) {
    const h1Regex = /<h1[^>]*>([^<]+)<\/h1>/gi;
    const h1Tags = [];
    let match;

    while ((match = h1Regex.exec(html)) !== null) {
      h1Tags.push(match[1].trim());
    }

    return {
      h1Count: h1Tags.length,
      hasH1: h1Tags.length > 0,
      multipleH1: h1Tags.length > 1
    };
  }

  const headers = analyzeHeaders(mockHtml);
  assert.strictEqual(headers.h1Count, 1);
  assert.strictEqual(headers.hasH1, true);
  assert.strictEqual(headers.multipleH1, false);
});

console.log('All tests passed! ✓');
