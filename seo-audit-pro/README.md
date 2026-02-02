# SEO Audit Pro

A comprehensive SEO audit tool that analyzes websites and provides actionable insights for optimization.

## Features

- **Page Speed Analysis**: Get detailed performance metrics for mobile and desktop
- **Meta Tags Audit**: Check title, description, and Open Graph tags
- **Content Structure**: Analyze header hierarchy and content organization
- **Image Optimization**: Check alt text coverage and image SEO
- **Link Analysis**: Review internal and external links
- **Technical SEO**: Verify SSL, robots.txt, and sitemap.xml
- **Comprehensive Reports**: Get console output and professional PDF reports
- **Scoring System**: 0-100 point rating with actionable recommendations

## Installation

1. Clone or download this skill
2. Install dependencies:

```bash
npm install
```

3. Set up your environment:

```bash
cp .env.example .env
```

4. Get a Google PageSpeed Insights API key:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable the [PageSpeed Insights API](https://developers.google.com/speed/docs/insights/v5/get-started)
   - Create credentials (API Key)
   - Copy your API key

5. Add your API key to `.env`:

```env
PAGESPEED_API_KEY=your_actual_api_key_here
```

## Usage

### Basic Audit

```bash
npm run audit https://example.com
```

Or directly:

```bash
node scripts/audit.js https://example.com
```

### Generate PDF Report

```bash
node scripts/audit.js https://example.com --pdf
```

PDF reports are saved to the `./reports/` directory.

### Help

```bash
node scripts/audit.js --help
```

## What Gets Analyzed

### 1. Page Speed (via Google PageSpeed Insights)
- Mobile and Desktop performance scores
- Core Web Vitals:
  - First Contentful Paint (FCP)
  - Largest Contentful Paint (LCP)
  - Cumulative Layout Shift (CLS)
  - Total Blocking Time (TBT)
  - Speed Index
- Performance opportunities
- Diagnostic information

### 2. Meta Tags
- Page title (length and presence)
- Meta description (length and presence)
- Meta keywords
- Open Graph tags (title, description, image, URL, type)
- Canonical URL
- Robots meta tag

### 3. Content Structure
- Header hierarchy (H1-H6)
- Multiple H1 detection
- Content organization

### 4. Images
- Total image count
- Alt text coverage
- Images without alt text

### 5. Links
- Internal vs external link ratio
- Total link count
- Link analysis

### 6. Technical SEO
- HTTPS/SSL certificate
- robots.txt presence
- sitemap.xml presence
- HTTP/2 support

## Output Example

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          SEO AUDIT REPORT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

URL: https://example.com
Overall Score: 78/100 (B)

📋 Your site has good SEO basics but several issues need attention.
    Found 1 critical issue(s), 3 warning(s), and 5 optimization opportunity(ies).

🔴 Critical Issues (1):
   • Missing meta description

🟡 Warnings (3):
   • Multiple H1 tags found (2), should have only one
   • 12 image(s) without alt text (accessibility and SEO issue)
   • robots.txt not found

🟢 Opportunities (5):
   • Add Open Graph tags for better social media sharing
   • Consider adding a canonical URL tag
   • Consider enabling HTTP/2 for better performance
   • Eliminate render-blocking resources: 1.2s
   • Remove unused CSS: 0.8s

💡 Top Recommendations:
   1. Add Alt Text to Images
      Image alt text improves accessibility and helps search engines understand your content.

   2. Add Open Graph Tags
      Open Graph tags improve how your content appears when shared on social media.

   3. Fix Header Structure
      Ensure you have exactly one H1 tag per page for proper content hierarchy.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Scoring System

The overall score (0-100) is calculated based on:

- **Page Speed** (30 points): Mobile and desktop performance
- **Critical Issues** (-10 points each): Missing meta tags, missing H1, etc.
- **Warnings** (-5 points each): Suboptimal meta tag length, multiple H1s, etc.
- **Image Alt Text** (10 points): Coverage percentage
- **Technical SEO** (15 points): SSL, robots.txt, sitemap.xml

### Score Grades

- **90-100 (A+/A)**: Excellent SEO
- **80-89 (A)**: Strong SEO foundation
- **70-79 (B)**: Good basics, minor improvements needed
- **60-69 (C)**: Several issues need attention
- **50-59 (D)**: Significant issues
- **0-49 (F)**: Requires immediate attention

## API Rate Limits

Google PageSpeed Insights API:
- **Free tier**: 25,000 requests per day
- **Quotas**: Can be increased in Google Cloud Console

The tool includes built-in rate limiting (1-second delay between requests) to respect API limits.

## Troubleshooting

### "Invalid API Key" Error

1. Verify your API key in `.env` file
2. Check for trailing spaces or quotes
3. Ensure PageSpeed Insights API is enabled in Google Cloud Console
4. Verify the API key has the correct permissions

### "Network Error" or Timeout

1. Check your internet connection
2. Verify the target URL is accessible
3. Some websites may block automated tools
4. Try increasing the timeout in the code

### "Unable to analyze page"

1. Ensure the URL includes the protocol (`https://`)
2. Check if the site requires authentication
3. Verify the site doesn't block bots (check robots.txt)

### Missing Dependencies

If you get module errors:

```bash
rm -rf node_modules package-lock.json
npm install
```

## Development

### Run Tests

```bash
npm test
```

### Project Structure

```
seo-audit-pro/
├── scripts/
│   ├── audit.js              # Main audit script
│   ├── pagespeed.js          # PageSpeed Insights integration
│   ├── metatags.js           # Meta tags and content analysis
│   ├── report-generator.js   # Report formatting
│   └── pdf-generator.js      # PDF generation
├── tests/
│   └── audit.test.js         # Unit tests
├── reports/                   # Generated PDF reports (created automatically)
├── SKILL.md                  # Detailed skill documentation
├── README.md                 # This file
├── package.json              # Dependencies and scripts
├── .env.example              # Environment variable template
└── .gitignore               # Git ignore rules
```

## Dependencies

- **axios** (^1.6.5): HTTP client for API requests and page fetching
- **pdfkit** (^0.14.0): Professional PDF report generation
- **dotenv** (^16.3.1): Environment variable management

## License

MIT

## Support

For issues, questions, or feature requests, please visit the OpenClaw community forums or create an issue in the repository.

## Contributing

Contributions are welcome! Please ensure:

1. Code follows the existing style
2. Tests pass (`npm test`)
3. New features include tests
4. Documentation is updated

## Version History

### 1.0.0 (Initial Release)
- Complete SEO audit functionality
- PageSpeed Insights integration
- Meta tags analysis
- Image and link auditing
- PDF report generation
- Comprehensive scoring system

## Credits

Developed for the OpenClaw ecosystem.

## Related Tools

- [Google PageSpeed Insights](https://pagespeed.web.dev/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [SEO Analyzer](https://www.seoptimer.com/)
