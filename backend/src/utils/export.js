const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');

const exportToExcel = async (columns, rows, sheetName = 'Report') => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(sheetName);

  sheet.columns = columns.map((col) => ({
    header: col.header,
    key: col.key,
    width: col.width || 20,
  }));

  sheet.getRow(1).font = { bold: true };
  rows.forEach((row) => sheet.addRow(row));

  return workbook.xlsx.writeBuffer();
};

const exportToPDF = (title, columns, rows) =>
  new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40, size: 'A4', layout: 'landscape' });
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(18).text(title, { align: 'center' });
    doc.moveDown();

    const colWidth = (doc.page.width - 80) / columns.length;
    let y = doc.y;

    doc.fontSize(10).font('Helvetica-Bold');
    columns.forEach((col, i) => {
      doc.text(col.header, 40 + i * colWidth, y, { width: colWidth - 5 });
    });

    y += 20;
    doc.font('Helvetica');

    rows.forEach((row) => {
      if (y > doc.page.height - 60) {
        doc.addPage();
        y = 40;
      }
      columns.forEach((col, i) => {
        doc.text(String(row[col.key] ?? ''), 40 + i * colWidth, y, { width: colWidth - 5 });
      });
      y += 18;
    });

    doc.end();
  });

module.exports = { exportToExcel, exportToPDF };
