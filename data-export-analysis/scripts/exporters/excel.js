import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';

/**
 * Excel Exporter
 * Exports data to Excel format with formatting and charts
 */
export class ExcelExporter {
  constructor(options = {}) {
    this.outputDir = options.outputDir || process.env.EXPORT_DIR || './exports';
  }

  /**
   * Export data to Excel
   */
  async export(data, options = {}) {
    const {
      filename = 'export.xlsx',
      sheets = [{ name: 'Data', data }],
      includeCharts = false
    } = options;

    try {
      // Ensure output directory exists
      if (!fs.existsSync(this.outputDir)) {
        fs.mkdirSync(this.outputDir, { recursive: true });
      }

      const workbook = new ExcelJS.Workbook();

      // Add sheets
      for (const sheet of sheets) {
        this.addWorksheet(workbook, sheet.name, sheet.data, sheet.options);
      }

      // Save file
      const filepath = path.join(this.outputDir, filename);
      await workbook.xlsx.writeFile(filepath);

      return {
        success: true,
        filepath,
        size: fs.statSync(filepath).size
      };
    } catch (error) {
      throw new Error(`Excel export failed: ${error.message}`);
    }
  }

  /**
   * Add worksheet with data
   */
  addWorksheet(workbook, name, data, options = {}) {
    if (!data || data.length === 0) return;

    const worksheet = workbook.addWorksheet(name);
    const columns = Object.keys(data[0]);

    // Set columns
    worksheet.columns = columns.map(col => ({
      header: col.replace(/_/g, ' ').toUpperCase(),
      key: col,
      width: 15
    }));

    // Add rows
    data.forEach(record => {
      worksheet.addRow(record);
    });

    // Format header
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' }
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

    // Auto-filter
    worksheet.autoFilter = {
      from: 'A1',
      to: `${String.fromCharCode(64 + columns.length)}1`
    };

    // Format number columns
    columns.forEach((col, index) => {
      const colLetter = String.fromCharCode(65 + index);
      const firstValue = data[0][col];

      if (typeof firstValue === 'number') {
        worksheet.getColumn(colLetter).numFmt = '#,##0.00';
      }
    });

    return worksheet;
  }
}
