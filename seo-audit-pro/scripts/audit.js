#!/usr/bin/env node

import { config } from 'dotenv';
import { getFullPageSpeedAnalysis } from './pagespeed.js';
import { analyzeMetaTags, analyzeImages, analyzeLinks } from './metatags.js';
import { generateReport, formatConsoleReport } from './report-generator.js';
import { generatePDFReport } from './pdf-generator.js';
import axios from 'axios';

// Load environment variables
config();

/**
 * Main audit function
 */
async function runAudit(url, options = {}) {
  console.log('\n🔍 Starting SEO Audit...\n');

  // Validate URL
  if (!isValidUrl(url)) {
    console.error('❌ Invalid URL. Please provide a valid URL including protocol (http:// or https://)');
    process.exit(1);
  }

  // Check API key
  const apiKey = process.env.PAGESPEED_API_KEY;
  if (!apiKey || apiKey === 'your_api_key_here') {
    console.error('❌ Missing PageSpeed API key. Please configure PAGESPEED_API_KEY in .env file');
    console.error('   Get your key at: https://developers.google.com/speed/docs/insights/v5/get-started');
    process.exit(1);
  }

  const auditResults = {};

  try {
    // 1. PageSpeed Analysis
    console.log('📊 Analyzing page speed...');
    try {
      auditResults.pageSpeed = await getFullPageSpeedAnalysis(url, apiKey);
      console.log('   ✓ Page speed analysis complete\n');
    } catch (error) {
      console.warn(`   ⚠ Page speed analysis failed: ${error.message}\n`);
      auditResults.pageSpeed = null;
    }

    // Delay to respect rate limits
    await delay(1000);

    // 2. Meta Tags Analysis
    console.log('🏷️  Analyzing meta tags and content...');
    try {
      auditResults.metaTags = await analyzeMetaTags(url);
      console.log('   ✓ Meta tags analysis complete\n');
    } catch (error) {
      console.warn(`   ⚠ Meta tags analysis failed: ${error.message}\n`);
      auditResults.metaTags = { issues: [], warnings: [], opportunities: [] };
    }

    // 3. Fetch HTML for additional analysis
    let html = '';
    try {
      const response = await axios.get(url, {
        timeout: 10000,
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SEO-Audit-Pro/1.0)' }
      });
      html = response.data;
    } catch (error) {
      console.warn(`   ⚠ Could not fetch page content: ${error.message}\n`);
    }

    // 4. Image Analysis
    console.log('🖼️  Analyzing images...');
    if (html) {
      auditResults.images = analyzeImages(html);
      console.log('   ✓ Image analysis complete\n');
    }

    // 5. Link Analysis
    console.log('🔗 Analyzing links...');
    if (html) {
      auditResults.links = analyzeLinks(html, url);
      console.log('   ✓ Link analysis complete\n');
    }

    // 6. Technical SEO
    console.log('⚙️  Checking technical SEO...');
    auditResults.technical = await analyzeTechnicalSEO(url);
    console.log('   ✓ Technical SEO check complete\n');

    // Generate Report
    console.log('📝 Generating report...\n');
    const report = generateReport(auditResults);

    // Display Console Report
    console.log(formatConsoleReport(report, url));

    // Generate PDF if requested
    if (options.pdf) {
      console.log('📄 Generating PDF report...');
      try {
        const pdfPath = await generatePDFReport(report, auditResults, url);
        console.log(`   ✓ PDF report saved: ${pdfPath}\n`);
      } catch (error) {
        console.error(`   ❌ PDF generation failed: ${error.message}\n`);
      }
    }

    // Exit with appropriate code
    process.exit(report.score < 50 ? 1 : 0);

  } catch (error) {
    console.error(`\n❌ Audit failed: ${error.message}\n`);
    console.error(error.stack);
    process.exit(1);
  }
}

/**
 * Analyzes technical SEO aspects
 */
async function analyzeTechnicalSEO(url) {
  const technical = {
    hasSSL: url.startsWith('https://'),
    hasRobotsTxt: false,
    hasSitemap: false,
    http2: false
  };

  const baseUrl = new URL(url).origin;

  // Check robots.txt
  try {
    const robotsResponse = await axios.get(`${baseUrl}/robots.txt`, { timeout: 5000 });
    technical.hasRobotsTxt = robotsResponse.status === 200;
  } catch (error) {
    technical.hasRobotsTxt = false;
  }

  await delay(500);

  // Check sitemap.xml
  try {
    const sitemapResponse = await axios.get(`${baseUrl}/sitemap.xml`, { timeout: 5000 });
    technical.hasSitemap = sitemapResponse.status === 200;
  } catch (error) {
    technical.hasSitemap = false;
  }

  return technical;
}

/**
 * Validates URL format
 */
function isValidUrl(string) {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (err) {
    return false;
  }
}

/**
 * Delay helper
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Displays help information
 */
function showHelp() {
  console.log(`
SEO Audit Pro - Comprehensive SEO Analysis Tool

Usage:
  node scripts/audit.js <url> [options]
  npm run audit <url> [options]

Options:
  --pdf         Generate PDF report in addition to console output
  --help        Show this help message

Examples:
  node scripts/audit.js https://example.com
  node scripts/audit.js https://example.com --pdf
  npm run audit https://example.com

Environment Variables:
  PAGESPEED_API_KEY    Required. Get from Google Cloud Console
                       https://developers.google.com/speed/docs/insights/v5/get-started

Report Location:
  PDF reports are saved to: ./reports/

Exit Codes:
  0    Success (score >= 50)
  1    Failure (score < 50 or error occurred)
`);
}

// CLI Entry Point
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    showHelp();
    process.exit(0);
  }

  const url = args[0];
  const options = {
    pdf: args.includes('--pdf')
  };

  runAudit(url, options);
}

// For ES modules
import { fileURLToPath } from 'url';

export { runAudit };
