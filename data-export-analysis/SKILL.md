# Data Export & Analysis

## Overview
Extract, transform, and analyze data from 50+ sources with powerful business intelligence capabilities.

## Metadata
- **Name**: data-export-analysis
- **Version**: 1.0.0
- **Tags**: data, analytics, business-intelligence, export
- **Pricing**: €39 (Basic), €79 (Pro)
- **Author**: OpenClaw Community

## Description
Data Export & Analysis is a comprehensive business intelligence tool that connects to multiple data sources, transforms and cleans data, performs advanced analytics, and exports results in multiple formats including Excel, PDF, and CSV.

## Supported Data Sources

### Analytics & Marketing
- Google Analytics (GA4)
- Google Search Console
- Facebook/Meta Ads
- Google Ads

### E-commerce
- Shopify
- WooCommerce
- Magento

### Payments & Finance
- Stripe
- PayPal
- Square

### Databases
- MySQL
- PostgreSQL
- MongoDB
- SQLite

### APIs & Custom
- RESTful APIs
- GraphQL endpoints
- CSV/JSON files
- Custom connectors

## Features

### Data Extraction
- Connect to 50+ data sources
- Scheduled exports with cron
- Incremental updates
- Batch processing
- Stream processing for large datasets

### Data Transformation
- Data cleaning and normalization
- Duplicate removal
- Missing value handling
- Multi-source data merging
- Custom formulas and calculations
- KPI computation

### Data Analysis
- Trend analysis
- Growth rate calculation
- Period-over-period comparison
- Year-over-year analysis
- Anomaly detection
- Threshold alerts
- Seasonality detection

### Export Formats
- **Excel**: Multi-sheet workbooks with charts
- **PDF**: Professional reports with branding
- **CSV**: Standard delimited files
- **JSON**: Structured data export

## Installation

```bash
cd data-export-analysis
npm install
```

## Configuration

Create a `.env` file with your API keys and database credentials:

```bash
cp .env.example .env
```

Edit `.env` and add your credentials:

```env
# Google Analytics
GA_PROPERTY_ID=your_property_id
GA_CREDENTIALS_PATH=./ga-credentials.json

# Shopify
SHOPIFY_SHOP_URL=your-shop.myshopify.com
SHOPIFY_ACCESS_TOKEN=your_access_token

# Stripe
STRIPE_API_KEY=sk_live_...

# Database
DB_HOST=localhost
DB_USER=username
DB_PASS=password
DB_NAME=database
```

## Usage

### Export Data

```bash
# Export from Google Analytics
node scripts/exporter.js export google-analytics --start-date 2026-01-01 --end-date 2026-01-31 --metrics sessions,users --output excel

# Export from Shopify
node scripts/exporter.js export shopify --period last-30-days --format excel

# Export from Stripe
node scripts/exporter.js export stripe --type payments --start 2026-01-01 --format csv

# Export from database
node scripts/exporter.js export database --query "SELECT * FROM orders WHERE date >= '2026-01-01'" --output excel
```

### Analyze Data

```bash
# Trend analysis
node scripts/exporter.js analyze revenue-data.csv --type trend

# Comparison analysis
node scripts/exporter.js analyze sales.csv --type comparison --period month-over-month

# Anomaly detection
node scripts/exporter.js analyze traffic.csv --type anomaly --threshold 20
```

### Generate Reports

```bash
# Automated report from source
node scripts/exporter.js report google-analytics --period last-30-days --format pdf

# Multi-source report
node scripts/exporter.js report combined --sources shopify,stripe --period last-month --format excel

# Custom report
node scripts/exporter.js report custom --config report-config.json
```

### Schedule Exports

```bash
# Daily export at 9 AM
node scripts/exporter.js schedule google-analytics "0 9 * * *" --format excel

# Weekly report every Monday
node scripts/exporter.js schedule shopify "0 0 * * 1" --format pdf

# List scheduled jobs
node scripts/exporter.js schedule list

# Remove schedule
node scripts/exporter.js schedule remove <job-id>
```

## Example Workflows

### E-commerce Analytics

```bash
# 1. Export Shopify orders
node scripts/exporter.js export shopify --type orders --period last-month

# 2. Export Stripe payments
node scripts/exporter.js export stripe --type payments --period last-month

# 3. Merge and analyze
node scripts/exporter.js analyze merged-data.csv --type revenue-trend

# 4. Generate report
node scripts/exporter.js report combined --sources shopify,stripe --format pdf
```

### Website Performance Tracking

```bash
# 1. Export Google Analytics
node scripts/exporter.js export google-analytics --metrics sessions,pageviews,bounce-rate

# 2. Analyze trends
node scripts/exporter.js analyze ga-data.csv --type trend

# 3. Detect anomalies
node scripts/exporter.js analyze ga-data.csv --type anomaly

# 4. Export to Excel with charts
node scripts/exporter.js export google-analytics --format excel --charts
```

## Data Transformations

### Cleaning
- Remove duplicate records
- Handle missing values (drop, fill, interpolate)
- Normalize formats (dates, currencies, numbers)
- Data type conversions
- Trim whitespace
- Fix encoding issues

### Merging
- Join data from multiple sources
- Auto-detect common keys
- Handle conflicts
- Merge strategies: inner, outer, left, right

### Calculations
- Custom formulas
- KPI calculations (ROI, CAC, LTV, churn rate)
- Aggregations (sum, average, count, min, max)
- Rolling averages
- Growth rates

## Analysis Types

### Trend Analysis
- Time series analysis
- Growth rate calculation
- Moving averages
- Trend line fitting
- Seasonality detection
- Forecast prediction

### Comparison
- Period-over-period (day/week/month/year)
- Cohort analysis
- Benchmark comparison
- A/B test analysis

### Anomaly Detection
- Outlier detection
- Threshold-based alerts
- Statistical anomalies
- Pattern recognition
- Change point detection

## Export Options

### Excel
- Multiple sheets
- Formatted tables
- Charts and graphs
- Formulas
- Conditional formatting
- Custom styling

### PDF
- Professional layout
- Charts and tables
- Custom branding
- Headers and footers
- Table of contents
- Executive summary

### CSV
- Standard RFC 4180 format
- Custom delimiters
- Header options
- Encoding options

## API Rate Limits

Different sources have different limits:

- **Google Analytics**: 10 requests per second
- **Shopify**: 2 requests per second (API rate limit)
- **Stripe**: 100 requests per second

Built-in rate limiting respects these constraints.

## Performance

- **Stream processing**: Handle datasets larger than RAM
- **Batch operations**: Process millions of records efficiently
- **Parallel exports**: Run multiple exports concurrently
- **Incremental updates**: Only fetch new data
- **Caching**: Reduce API calls

## Troubleshooting

### "Authentication Failed"
- Verify API keys in `.env`
- Check credential file paths
- Ensure proper permissions

### "Rate Limit Exceeded"
- Built-in rate limiting should prevent this
- Reduce concurrent exports
- Schedule exports during off-peak hours

### "Out of Memory"
- Use stream processing mode
- Reduce batch size
- Process data in chunks

### "Data Mismatch"
- Check date ranges
- Verify timezone settings
- Review merge key configuration

## Development

Run tests:
```bash
npm test
```

## Dependencies
- axios: HTTP client
- exceljs: Excel generation
- pdfkit: PDF generation
- mysql2: MySQL connector
- pg: PostgreSQL connector
- stripe: Stripe SDK
- @google-analytics/data: GA4 client
- csv-writer: CSV export
- node-cron: Job scheduling

## License
MIT

## Support
For issues and feature requests, visit the OpenClaw community forums.
