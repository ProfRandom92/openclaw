#!/usr/bin/env node

import { config } from 'dotenv';
import { GoogleAnalyticsSource } from './sources/google-analytics.js';
import { ShopifySource } from './sources/shopify.js';
import { StripeSource } from './sources/stripe.js';
import { DatabaseSource } from './sources/database.js';
import { cleanData } from './transformers/cleaner.js';
import { mergeData } from './transformers/merger.js';
import { applyCalculations } from './transformers/calculator.js';
import { analyzeTrend } from './analyzers/trends.js';
import { periodOverPeriod } from './analyzers/comparison.js';
import { detectAnomalies } from './analyzers/anomaly.js';
import { ExcelExporter } from './exporters/excel.js';
import { CSVExporter } from './exporters/csv.js';
import { PDFExporter } from './exporters/pdf.js';

config();

/**
 * Main Exporter CLI
 */
class DataExporter {
  constructor() {
    this.sources = {};
    this.data = null;
  }

  /**
   * Export data from source
   */
  async export(source, options) {
    console.log(`\n📊 Data Export & Analysis\n`);
    console.log(`Exporting from ${source}...`);

    try {
      let sourceInstance;

      switch (source) {
        case 'google-analytics':
          sourceInstance = new GoogleAnalyticsSource({});
          break;
        case 'shopify':
          sourceInstance = new ShopifySource({});
          break;
        case 'stripe':
          sourceInstance = new StripeSource({});
          break;
        case 'database':
          sourceInstance = new DatabaseSource({ type: options.dbType || 'mysql' });
          break;
        default:
          throw new Error(`Unknown source: ${source}`);
      }

      const result = await sourceInstance.export(options);
      this.data = result.data;

      console.log(`✓ Exported ${result.data.length} records\n`);

      // Export to file
      const format = options.output || options.format || 'csv';
      await this.exportToFile(format, result.data, { filename: `${source}-export` });

      return result;
    } catch (error) {
      console.error(`❌ Export failed: ${error.message}\n`);
      process.exit(1);
    }
  }

  /**
   * Analyze data
   */
  async analyze(dataOrFile, analysisType, options = {}) {
    console.log(`\n📊 Data Export & Analysis\n`);
    console.log(`Running ${analysisType} analysis...`);

    try {
      // Load data if file path provided
      let data = Array.isArray(dataOrFile) ? dataOrFile : await this.loadData(dataOrFile);

      let results;

      switch (analysisType) {
        case 'trend':
          const valueField = options.valueField || Object.keys(data[0]).find(k => typeof data[0][k] === 'number');
          const dateField = options.dateField || Object.keys(data[0]).find(k => k.includes('date') || k.includes('time'));
          results = analyzeTrend(data, valueField, dateField);
          break;

        case 'comparison':
          // Split data into periods
          const midpoint = Math.floor(data.length / 2);
          const previous = data.slice(0, midpoint);
          const current = data.slice(midpoint);
          const metrics = options.metrics || Object.keys(data[0]).filter(k => typeof data[0][k] === 'number');
          results = periodOverPeriod(current, previous, metrics);
          break;

        case 'anomaly':
          const field = options.field || Object.keys(data[0]).find(k => typeof data[0][k] === 'number');
          results = detectAnomalies(data, field, options);
          break;

        default:
          throw new Error(`Unknown analysis type: ${analysisType}`);
      }

      console.log('\nAnalysis Results:');
      console.log(JSON.stringify(results, null, 2));
      console.log('');

      return results;
    } catch (error) {
      console.error(`❌ Analysis failed: ${error.message}\n`);
      process.exit(1);
    }
  }

  /**
   * Export to file format
   */
  async exportToFile(format, data, options = {}) {
    try {
      let exporter;
      let result;

      switch (format) {
        case 'excel':
        case 'xlsx':
          exporter = new ExcelExporter();
          result = await exporter.export(data, {
            ...options,
            filename: `${options.filename || 'export'}.xlsx`
          });
          break;

        case 'csv':
          exporter = new CSVExporter();
          result = await exporter.export(data, {
            ...options,
            filename: `${options.filename || 'export'}.csv`
          });
          break;

        case 'pdf':
          exporter = new PDFExporter();
          result = await exporter.export(data, {
            ...options,
            filename: `${options.filename || 'report'}.pdf`
          });
          break;

        default:
          throw new Error(`Unknown format: ${format}`);
      }

      console.log(`✓ Exported to: ${result.filepath}\n`);
      return result;
    } catch (error) {
      throw new Error(`Export to file failed: ${error.message}`);
    }
  }

  /**
   * Load data from file (simplified)
   */
  async loadData(filepath) {
    // In production, implement CSV/JSON parsing
    throw new Error('File loading not yet implemented');
  }
}

/**
 * Display help
 */
function showHelp() {
  console.log(`
📊 Data Export & Analysis

Usage:
  node scripts/exporter.js <command> [options]

Commands:
  export <source>          Export data from source
  analyze <file> <type>    Analyze data
  help                     Show this help

Export Sources:
  google-analytics         Google Analytics 4
  shopify                  Shopify store
  stripe                   Stripe payments
  database                 MySQL/PostgreSQL

Analysis Types:
  trend                    Trend analysis
  comparison               Period comparison
  anomaly                  Anomaly detection

Export Options:
  --output <format>        Output format (excel, csv, pdf)
  --start-date <date>      Start date (YYYY-MM-DD)
  --end-date <date>        End date (YYYY-MM-DD)

Examples:
  node scripts/exporter.js export google-analytics --output excel
  node scripts/exporter.js export shopify --type orders --output csv
  node scripts/exporter.js analyze data.csv trend
`);
}

/**
 * Parse CLI arguments
 */
function parseArgs(args) {
  const options = {};
  const positional = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const nextArg = args[i + 1];

      if (nextArg && !nextArg.startsWith('--')) {
        options[key] = nextArg;
        i++;
      } else {
        options[key] = true;
      }
    } else {
      positional.push(arg);
    }
  }

  return { positional, options };
}

/**
 * Main CLI entry point
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('help') || args.includes('--help')) {
    showHelp();
    process.exit(0);
  }

  const { positional, options } = parseArgs(args);
  const command = positional[0];

  const exporter = new DataExporter();

  try {
    switch (command) {
      case 'export':
        const source = positional[1];
        if (!source) {
          console.error('❌ Source is required\n');
          process.exit(1);
        }
        await exporter.export(source, options);
        break;

      case 'analyze':
        const file = positional[1];
        const analysisType = positional[2] || 'trend';
        if (!file) {
          console.error('❌ File path is required\n');
          process.exit(1);
        }
        await exporter.analyze(file, analysisType, options);
        break;

      default:
        console.error(`❌ Unknown command: ${command}\n`);
        process.exit(1);
    }
  } catch (error) {
    console.error(`\n❌ Fatal error: ${error.message}\n`);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run if executed directly
import { fileURLToPath } from 'url';
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}

export { DataExporter };
