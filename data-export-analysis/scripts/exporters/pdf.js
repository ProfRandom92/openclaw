import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

/**
 * PDF Exporter
 * Creates professional PDF reports
 */
export class PDFExporter {
  constructor(options = {}) {
    this.outputDir = options.outputDir || process.env.EXPORT_DIR || './exports';
  }

  /**
   * Export data to PDF
   */
  async export(data, options = {}) {
    return new Promise((resolve, reject) => {
      try {
        const { filename = 'report.pdf', title = 'Data Report' } = options;

        // Ensure output directory exists
        if (!fs.existsSync(this.outputDir)) {
          fs.mkdirSync(this.outputDir, { recursive: true });
        }

        const filepath = path.join(this.outputDir, filename);
        const doc = new PDFDocument({ margin: 50 });
        const stream = fs.createWriteStream(filepath);

        doc.pipe(stream);

        // Title
        doc.fontSize(24).font('Helvetica-Bold').text(title, { align: 'center' });
        doc.moveDown();
        doc.fontSize(10).font('Helvetica').text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
        doc.moveDown(2);

        // Table
        if (data && data.length > 0) {
          this.addTable(doc, data);
        }

        // Finalize
        doc.end();

        stream.on('finish', () => {
          resolve({
            success: true,
            filepath,
            size: fs.statSync(filepath).size
          });
        });

        stream.on('error', reject);
      } catch (error) {
        reject(new Error(`PDF export failed: ${error.message}`));
      }
    });
  }

  /**
   * Add table to PDF
   */
  addTable(doc, data) {
    const headers = Object.keys(data[0]);
    const startY = doc.y;

    // Draw headers
    doc.fontSize(10).font('Helvetica-Bold');
    headers.forEach((header, i) => {
      doc.text(header, 50 + i * 100, startY, { width: 95 });
    });

    doc.moveDown();

    // Draw rows (limit to first 50)
    doc.font('Helvetica').fontSize(9);
    data.slice(0, 50).forEach((row, rowIndex) => {
      headers.forEach((header, colIndex) => {
        const value = String(row[header] || '');
        doc.text(value.substring(0, 20), 50 + colIndex * 100, doc.y, { width: 95 });
      });
      doc.moveDown(0.5);
    });

    if (data.length > 50) {
      doc.text(`... and ${data.length - 50} more rows`, { align: 'center' });
    }
  }
}
