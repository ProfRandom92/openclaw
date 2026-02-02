import axios from 'axios';

/**
 * Fetches PageSpeed Insights data for a given URL
 * @param {string} url - The URL to analyze
 * @param {string} apiKey - Google PageSpeed Insights API key
 * @param {string} strategy - 'mobile' or 'desktop'
 * @returns {Promise<Object>} PageSpeed data
 */
export async function getPageSpeedData(url, apiKey, strategy = 'mobile') {
  const apiUrl = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';

  try {
    const response = await axios.get(apiUrl, {
      params: {
        url: url,
        key: apiKey,
        strategy: strategy,
        category: ['performance', 'seo', 'accessibility']
      },
      timeout: 30000
    });

    return response.data;
  } catch (error) {
    if (error.response?.status === 403) {
      throw new Error('Invalid API key. Please check your PAGESPEED_API_KEY in .env file');
    }
    if (error.response?.status === 429) {
      throw new Error('API rate limit exceeded. Please try again later');
    }
    throw new Error(`PageSpeed API error: ${error.message}`);
  }
}

/**
 * Extracts and formats PageSpeed metrics
 * @param {Object} data - Raw PageSpeed API response
 * @returns {Object} Formatted metrics
 */
export function extractMetrics(data) {
  const lighthouseResult = data.lighthouseResult;
  const categories = lighthouseResult.categories;
  const audits = lighthouseResult.audits;

  return {
    performanceScore: Math.round(categories.performance.score * 100),
    seoScore: Math.round(categories.seo.score * 100),
    accessibilityScore: Math.round(categories.accessibility.score * 100),
    metrics: {
      // First Contentful Paint
      fcp: audits['first-contentful-paint']?.displayValue || 'N/A',
      // Largest Contentful Paint
      lcp: audits['largest-contentful-paint']?.displayValue || 'N/A',
      // Cumulative Layout Shift
      cls: audits['cumulative-layout-shift']?.displayValue || 'N/A',
      // Total Blocking Time
      tbt: audits['total-blocking-time']?.displayValue || 'N/A',
      // Speed Index
      speedIndex: audits['speed-index']?.displayValue || 'N/A'
    },
    opportunities: extractOpportunities(audits),
    diagnostics: extractDiagnostics(audits)
  };
}

/**
 * Extracts performance opportunities from audits
 * @param {Object} audits - PageSpeed audits object
 * @returns {Array} List of opportunities
 */
function extractOpportunities(audits) {
  const opportunities = [];
  const opportunityAudits = [
    'render-blocking-resources',
    'unused-css-rules',
    'unused-javascript',
    'modern-image-formats',
    'offscreen-images',
    'unminified-css',
    'unminified-javascript'
  ];

  for (const auditId of opportunityAudits) {
    const audit = audits[auditId];
    if (audit && audit.score !== null && audit.score < 1) {
      opportunities.push({
        title: audit.title,
        description: audit.description,
        savings: audit.displayValue || 'N/A'
      });
    }
  }

  return opportunities;
}

/**
 * Extracts diagnostic information from audits
 * @param {Object} audits - PageSpeed audits object
 * @returns {Array} List of diagnostics
 */
function extractDiagnostics(audits) {
  const diagnostics = [];
  const diagnosticAudits = [
    'dom-size',
    'critical-request-chains',
    'user-timings',
    'bootup-time'
  ];

  for (const auditId of diagnosticAudits) {
    const audit = audits[auditId];
    if (audit && audit.score !== null && audit.score < 1) {
      diagnostics.push({
        title: audit.title,
        description: audit.description,
        value: audit.displayValue || 'N/A'
      });
    }
  }

  return diagnostics;
}

/**
 * Gets PageSpeed data for both mobile and desktop
 * @param {string} url - The URL to analyze
 * @param {string} apiKey - API key
 * @returns {Promise<Object>} Combined mobile and desktop data
 */
export async function getFullPageSpeedAnalysis(url, apiKey) {
  console.log('  Fetching mobile metrics...');
  const mobileData = await getPageSpeedData(url, apiKey, 'mobile');
  const mobileMetrics = extractMetrics(mobileData);

  // Add delay to respect rate limits
  await new Promise(resolve => setTimeout(resolve, 1000));

  console.log('  Fetching desktop metrics...');
  const desktopData = await getPageSpeedData(url, apiKey, 'desktop');
  const desktopMetrics = extractMetrics(desktopData);

  return {
    mobile: mobileMetrics,
    desktop: desktopMetrics
  };
}
