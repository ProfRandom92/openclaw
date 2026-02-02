# SEO Audit Pro

## Overview
Comprehensive SEO audit tool with actionable insights for website optimization.

## Metadata
- **Name**: seo-audit-pro
- **Version**: 1.0.0
- **Tags**: seo, marketing, audit, analytics
- **Pricing**: €29
- **Author**: OpenClaw Community

## Description
SEO Audit Pro is a comprehensive SEO analysis tool that provides detailed insights into your website's search engine optimization. It analyzes multiple aspects of your site including page speed, meta tags, content structure, and technical SEO factors.

## Features
- **Page Speed Analysis**: Mobile and desktop performance metrics via Google PageSpeed Insights API
- **Meta Tags Audit**: Comprehensive check of title, description, and Open Graph tags
- **Content Structure**: Analysis of header hierarchy (H1-H6)
- **Image Optimization**: Alt text coverage and image analysis
- **Link Analysis**: Internal and external link auditing
- **Technical SEO**: SSL certificate, robots.txt, and sitemap.xml verification
- **Scoring System**: 0-100 point rating with issue classification (Critical, Warning, Opportunity)
- **Multiple Report Formats**: Console output and professional PDF reports

## Installation

```bash
cd seo-audit-pro
npm install
```

## Configuration

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Get a Google PageSpeed Insights API key:
   - Visit: https://developers.google.com/speed/docs/insights/v5/get-started
   - Enable the PageSpeed Insights API
   - Create credentials (API Key)
   - Copy your API key

3. Add your API key to `.env`:
```
PAGESPEED_API_KEY=your_actual_api_key_here
```

## Usage

### Basic Audit
```bash
npm run audit https://example.com
```

### With PDF Report
```bash
node scripts/audit.js https://example.com --pdf
```

### Help
```bash
node scripts/audit.js --help
```

## Output

The tool generates a comprehensive report including:

1. **Overall Score** (0-100)
2. **Page Speed Metrics**
   - Mobile and Desktop scores
   - Core Web Vitals (FCP, LCP, CLS)
3. **SEO Issues** classified by severity:
   - 🔴 Critical: Must fix immediately
   - 🟡 Warning: Should improve
   - 🟢 Opportunity: Nice to have
4. **Detailed Recommendations**

## Example Output

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          SEO AUDIT REPORT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

URL: https://example.com
Overall Score: 78/100

📊 Page Speed
  Mobile: 72/100
  Desktop: 89/100

  Core Web Vitals:
  ├─ FCP: 1.2s
  ├─ LCP: 2.1s
  └─ CLS: 0.05

🔍 SEO Analysis

Critical Issues (1):
  🔴 Missing meta description

Warnings (2):
  🟡 Multiple H1 tags found
  🟡 12 images without alt text

Opportunities (3):
  🟢 Consider adding Open Graph tags
  🟢 robots.txt could be optimized
  🟢 Enable HTTP/2

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## API Rate Limits

- Google PageSpeed Insights: 25,000 requests per day (free tier)
- Built-in rate limiting: 1 second delay between API calls

## Troubleshooting

### "Invalid API Key" Error
- Verify your API key in `.env`
- Ensure the PageSpeed Insights API is enabled in Google Cloud Console
- Check for trailing spaces in your `.env` file

### "Network Error"
- Check your internet connection
- Verify the target URL is accessible
- Try again with a longer timeout

### "Unable to analyze page"
- Some pages may block automated tools
- Check if the site requires authentication
- Verify the URL is correct and includes protocol (https://)

## Development

Run tests:
```bash
npm test
```

## Dependencies
- axios: HTTP client for API requests
- pdfkit: PDF report generation
- dotenv: Environment variable management

## License
MIT

## Support
For issues and feature requests, please visit the OpenClaw community forums.
