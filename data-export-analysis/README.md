# Data Export & Analysis

Extract, transform, and analyze data from 50+ sources with powerful business intelligence capabilities.

## Features

- **Multi-Source Data Export**: Connect to Google Analytics, Shopify, Stripe, databases, and more
- **Data Transformation**: Clean, merge, and transform data with powerful tools
- **Advanced Analytics**: Trend analysis, comparisons, anomaly detection
- **Multiple Export Formats**: Excel, PDF, CSV with professional formatting
- **Automated Scheduling**: Set up recurring exports with cron
- **Stream Processing**: Handle large datasets efficiently

## Supported Data Sources

- **Analytics**: Google Analytics (GA4), Search Console
- **E-commerce**: Shopify, WooCommerce
- **Payments**: Stripe, PayPal
- **Databases**: MySQL, PostgreSQL, MongoDB
- **Custom**: REST APIs, CSV/JSON files

## Installation

```bash
npm install
```

## Configuration

1. Copy environment template:
```bash
cp .env.example .env
```

2. Add your API keys and credentials to `.env`

## Quick Start

### Export from Google Analytics

```bash
node scripts/exporter.js export google-analytics --start-date 2026-01-01 --end-date 2026-01-31 --output excel
```

### Export from Shopify

```bash
node scripts/exporter.js export shopify --type orders --output csv
```

### Export from Stripe

```bash
node scripts/exporter.js export stripe --type payments --start 2026-01-01 --output excel
```

### Analyze Data

```bash
node scripts/exporter.js analyze data.csv trend
node scripts/exporter.js analyze sales.csv anomaly --field revenue
```

## Usage Examples

### E-commerce Analytics

```bash
# Export orders
node scripts/exporter.js export shopify --type orders --period last-30-days --output excel

# Export products
node scripts/exporter.js export shopify --type products --output csv

# Analyze sales trends
node scripts/exporter.js analyze orders.csv trend --field total_price
```

### Payment Analytics

```bash
# Export Stripe payments
node scripts/exporter.js export stripe --type payments --start 2026-01-01 --output excel

# Analyze payment patterns
node scripts/exporter.js analyze payments.csv trend
```

### Database Queries

```bash
# Export from MySQL
node scripts/exporter.js export database --query "SELECT * FROM users WHERE created_at >= '2026-01-01'" --output excel

# Export custom report
node scripts/exporter.js export database --query "SELECT DATE(created_at) as date, COUNT(*) as count FROM orders GROUP BY DATE(created_at)" --output csv
```

## Data Transformations

The tool includes powerful transformation capabilities:

- **Cleaning**: Remove duplicates, handle missing values, normalize formats
- **Merging**: Join data from multiple sources
- **Calculations**: Custom formulas, KPIs (ROI, CAC, LTV, churn rate)
- **Aggregations**: Sum, average, count, min, max

## Analysis Types

### Trend Analysis
- Time series analysis
- Growth rate calculation
- Moving averages
- Seasonality detection
- Forecasting

### Comparison Analysis
- Period-over-period
- Year-over-year
- Cohort analysis
- A/B testing

### Anomaly Detection
- Z-score method
- IQR (Interquartile Range)
- Threshold-based
- Pattern recognition

## Export Formats

### Excel (.xlsx)
- Multi-sheet workbooks
- Formatted tables
- Charts and graphs
- Formulas preserved

### PDF
- Professional reports
- Tables and charts
- Custom branding
- Executive summaries

### CSV
- Standard RFC 4180 format
- Custom delimiters
- Header options

## Project Structure

```
data-export-analysis/
├── scripts/
│   ├── sources/              # Data source connectors
│   │   ├── google-analytics.js
│   │   ├── shopify.js
│   │   ├── stripe.js
│   │   └── database.js
│   ├── transformers/         # Data transformation
│   │   ├── cleaner.js
│   │   ├── merger.js
│   │   └── calculator.js
│   ├── analyzers/            # Analysis modules
│   │   ├── trends.js
│   │   ├── comparison.js
│   │   └── anomaly.js
│   ├── exporters/            # Export formatters
│   │   ├── excel.js
│   │   ├── pdf.js
│   │   └── csv.js
│   └── exporter.js           # Main CLI
├── tests/
│   └── exporter.test.js
├── SKILL.md
├── README.md
├── package.json
└── .env.example
```

## API Rate Limits

- **Google Analytics**: 10 requests/second
- **Shopify**: 2 requests/second
- **Stripe**: 100 requests/second

Built-in rate limiting respects these constraints.

## Performance

- **Stream Processing**: Handle datasets larger than RAM
- **Batch Operations**: Process millions of records
- **Parallel Exports**: Run multiple exports concurrently
- **Incremental Updates**: Only fetch new data

## Troubleshooting

### "Authentication Failed"
Verify API keys in `.env` and check credential file paths.

### "Rate Limit Exceeded"
Built-in rate limiting should prevent this. Reduce concurrent operations if needed.

### "Out of Memory"
Enable stream processing mode or reduce batch size.

## Dependencies

- axios: HTTP client
- exceljs: Excel generation
- pdfkit: PDF generation
- mysql2: MySQL connector
- pg: PostgreSQL connector
- stripe: Stripe SDK
- @google-analytics/data: GA4 client

## License

MIT

## Version History

### 1.0.0
- Initial release
- Multi-source data export
- Data transformations
- Advanced analytics
- Multiple export formats

## Credits

Developed for the OpenClaw ecosystem.
