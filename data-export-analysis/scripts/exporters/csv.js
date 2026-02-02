import { createObjectCsvWriter } from 'csv-writer';
import path from 'path';
import fs from 'fs';

/**
 * CSV Exporter
 */
export class CSVExporter {
  constructor(options = {}) {
    this.outputDir = options.outputDir || process.env.EXPORT_DIR || './exports';
  }

  /**
   * Export data to CSV
   */
  async export(data, options = {}) {
    const {
      filename = 'export.csv',
      delimiter = ',',
      includeHeaders = true
    } = options;

    try {
      // Ensure output directory exists
      if (!fs.existsSync(this.outputDir)) {
        fs.mkdirSync(this.outputDir, { recursive: true });
      }

      if (!data || data.length === 0) {
        throw new Error('No data to export');
      }

      const filepath = path.join(this.outputDir, filename);
      const headers = Object.keys(data[0]).map(key => ({
        id: key,
        title: key
      }));

      const csvWriter = createObjectCsvWriter({
        path: filepath,
        header: headers
      });

      await csvWriter.writeRecords(data);

      return {
        success: true,
        filepath,
        rowCount: data.length,
        size: fs.statSync(filepath).size
      };
    } catch (error) {
      throw new Error(`CSV export failed: ${error.message}`);
    }
  }
}
