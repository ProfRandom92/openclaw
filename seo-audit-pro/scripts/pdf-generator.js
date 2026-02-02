import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generates a PDF report from audit results
 * @param {Object} report - Formatted report data
 * @param {Object} auditResults - Raw audit results
 * @param {string} url - Audited URL
 * @returns {Promise<string>} Path to generated PDF file
 */
export async function generatePDFReport(report, auditResults, url) {
  return new Promise((resolve, reject) => {
    try {
      // Create reports directory if it doesn't exist
      const reportsDir = path.join(process.cwd(), 'reports');
      if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
      }

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
      const filename = `seo-audit-${sanitizeFilename(url)}-${timestamp}.pdf`;
      const filepath = path.join(reportsDir, filename);

      // Create PDF document
      const doc = new PDFDocument({ margin: 50 });
      const stream = fs.createWriteStream(filepath);

      doc.pipe(stream);

      // Header
      doc.fontSize(24).font('Helvetica-Bold').text('SEO Audit Report', { align: 'center' });
      doc.moveDown();
      doc.fontSize(10).font('Helvetica').text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
      doc.moveDown();

      // URL and Score
      doc.fontSize(12).font('Helvetica-Bold').text('Analyzed URL:', { continued: true });
      doc.font('Helvetica').text(` ${url}`);
      doc.moveDown();

      // Overall Score Box
      doc.rect(50, doc.y, 500, 80).stroke();
      const scoreY = doc.y;
      doc.fontSize(16).font('Helvetica-Bold').text('Overall Score', 70, scoreY + 10);
      doc.fontSize(36).fillColor(getScoreColor(report.score)).text(
        `${report.score}/100`,
        70,
        scoreY + 35
      );
      doc.fontSize(18).fillColor('black').text(`Grade: ${report.grade}`, 300, scoreY + 40);
      doc.moveDown(5);

      // Summary
      doc.fontSize(12).font('Helvetica-Bold').text('Summary');
      doc.moveDown(0.5);
      doc.fontSize(10).font('Helvetica').text(report.summary, { align: 'justify' });
      doc.moveDown(1.5);

      // Page Speed Section
      if (auditResults.pageSpeed) {
        addPageSpeedSection(doc, auditResults.pageSpeed);
        doc.moveDown(1.5);
      }

      // Critical Issues
      if (report.criticalIssues.length > 0) {
        doc.fontSize(14).font('Helvetica-Bold').fillColor('#DC2626').text('🔴 Critical Issues');
        doc.moveDown(0.5);
        report.criticalIssues.forEach((issue, i) => {
          doc.fontSize(10).fillColor('black').font('Helvetica').text(`${i + 1}. ${issue}`);
          doc.moveDown(0.3);
        });
        doc.moveDown(1);
      }

      // Warnings
      if (report.warnings.length > 0) {
        doc.fontSize(14).font('Helvetica-Bold').fillColor('#F59E0B').text('🟡 Warnings');
        doc.moveDown(0.5);
        report.warnings.forEach((warning, i) => {
          doc.fontSize(10).fillColor('black').font('Helvetica').text(`${i + 1}. ${warning}`);
          doc.moveDown(0.3);
        });
        doc.moveDown(1);
      }

      // Check if we need a new page
      if (doc.y > 650) {
        doc.addPage();
      }

      // Opportunities
      if (report.opportunities.length > 0) {
        doc.fontSize(14).font('Helvetica-Bold').fillColor('#10B981').text('🟢 Opportunities');
        doc.moveDown(0.5);
        report.opportunities.forEach((opp, i) => {
          doc.fontSize(10).fillColor('black').font('Helvetica').text(`${i + 1}. ${opp}`);
          doc.moveDown(0.3);
        });
        doc.moveDown(1);
      }

      // Recommendations
      if (report.recommendations.length > 0) {
        if (doc.y > 600) {
          doc.addPage();
        }
        doc.fontSize(14).font('Helvetica-Bold').fillColor('black').text('💡 Recommendations');
        doc.moveDown(1);

        report.recommendations.forEach((rec, i) => {
          const priority = rec.priority === 'critical' ? '🔴' :
                          rec.priority === 'high' ? '🟠' :
                          rec.priority === 'medium' ? '🟡' : '🟢';

          doc.fontSize(11).font('Helvetica-Bold').text(`${i + 1}. ${priority} ${rec.title}`);
          doc.fontSize(9).font('Helvetica').text(rec.description, { indent: 20 });
          doc.moveDown(0.7);
        });
      }

      // Footer
      const pageCount = doc.bufferedPageRange().count;
      for (let i = 0; i < pageCount; i++) {
        doc.switchToPage(i);
        doc.fontSize(8).font('Helvetica').text(
          `Page ${i + 1} of ${pageCount} | SEO Audit Pro | openclaw.ai`,
          50,
          doc.page.height - 50,
          { align: 'center' }
        );
      }

      // Finalize PDF
      doc.end();

      stream.on('finish', () => {
        resolve(filepath);
      });

      stream.on('error', (err) => {
        reject(err);
      });
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Adds PageSpeed section to PDF
 */
function addPageSpeedSection(doc, pageSpeed) {
  doc.fontSize(14).font('Helvetica-Bold').text('📊 Page Speed Analysis');
  doc.moveDown(0.5);

  // Mobile metrics
  if (pageSpeed.mobile) {
    doc.fontSize(11).font('Helvetica-Bold').text('Mobile:');
    doc.fontSize(9).font('Helvetica')
      .text(`Performance: ${pageSpeed.mobile.performanceScore}/100`, { indent: 20 })
      .text(`SEO Score: ${pageSpeed.mobile.seoScore}/100`, { indent: 20 })
      .text(`Accessibility: ${pageSpeed.mobile.accessibilityScore}/100`, { indent: 20 });

    if (pageSpeed.mobile.metrics) {
      doc.text('', { indent: 20 });
      doc.text(`Core Web Vitals:`, { indent: 20 });
      doc.text(`  FCP: ${pageSpeed.mobile.metrics.fcp}`, { indent: 30 });
      doc.text(`  LCP: ${pageSpeed.mobile.metrics.lcp}`, { indent: 30 });
      doc.text(`  CLS: ${pageSpeed.mobile.metrics.cls}`, { indent: 30 });
    }
    doc.moveDown(0.5);
  }

  // Desktop metrics
  if (pageSpeed.desktop) {
    doc.fontSize(11).font('Helvetica-Bold').text('Desktop:');
    doc.fontSize(9).font('Helvetica')
      .text(`Performance: ${pageSpeed.desktop.performanceScore}/100`, { indent: 20 })
      .text(`SEO Score: ${pageSpeed.desktop.seoScore}/100`, { indent: 20 })
      .text(`Accessibility: ${pageSpeed.desktop.accessibilityScore}/100`, { indent: 20 });
  }
}

/**
 * Returns color based on score
 */
function getScoreColor(score) {
  if (score >= 80) return '#10B981'; // Green
  if (score >= 60) return '#F59E0B'; // Orange
  return '#DC2626'; // Red
}

/**
 * Sanitizes filename
 */
function sanitizeFilename(str) {
  return str.replace(/[^a-z0-9]/gi, '-').toLowerCase().substring(0, 30);
}
