import { Document, Paragraph, Table, TableRow, TableCell, TextRun, AlignmentType, WidthType } from 'docx';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

const formatDate = (d) => {
  if (typeof d === 'string') d = new Date(d);
  return d.toISOString().split('T')[0];
};

export const generateDOCX = async (data) => {
  const { profile, logs, previousAccumulated, remarks, photoUrls, user } = data;

  const totalHours = logs.reduce((sum, log) => sum + log.hoursLogged, 0);
  const grandTotal = totalHours + previousAccumulated;

  // Build table rows
  const tableRows = [
    // Header
    new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph({ text: 'Date', bold: true })],
          width: { size: 3000, type: WidthType.DXA },
        }),
        new TableCell({
          children: [new Paragraph({ text: 'Hours', bold: true })],
          width: { size: 2000, type: WidthType.DXA },
        }),
        new TableCell({
          children: [new Paragraph({ text: 'Note', bold: true })],
          width: { size: 5000, type: WidthType.DXA },
        }),
      ],
    }),
    // Data rows
    ...logs.map(
      (log) =>
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph(formatDate(log.date))] }),
            new TableCell({ children: [new Paragraph(log.hoursLogged.toString())] }),
            new TableCell({ children: [new Paragraph(log.note || '')] }),
          ],
        })
    ),
  ];

  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            text: 'Weekly Work Report',
            heading: 'Heading1',
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({ text: '' }),
          new Paragraph({ text: `Intern: ${user.fullName}` }),
          new Paragraph({ text: `Company: ${profile.company || 'N/A'}` }),
          new Paragraph({ text: `Supervisor: ${profile.supervisorName || 'N/A'}` }),
          new Paragraph({ text: '' }),
          new Table({ rows: tableRows }),
          new Paragraph({ text: '' }),
          new Paragraph({ text: `Total Hours (This Period): ${totalHours}` }),
          new Paragraph({ text: `Previous Accumulated: ${previousAccumulated}` }),
          new Paragraph({ text: `Grand Total: ${grandTotal}`, bold: true }),
          new Paragraph({ text: '' }),
          new Paragraph({ text: 'Remarks:' }),
          new Paragraph({ text: remarks || 'N/A' }),
          new Paragraph({ text: '' }),
          new Paragraph({ text: `Photos attached: ${photoUrls.length}` }),
        ],
      },
    ],
  });

  return doc;
};

export const generatePDF = (data, stream) => {
  const { profile, logs, previousAccumulated, remarks, photoUrls, user } = data;

  const totalHours = logs.reduce((sum, log) => sum + log.hoursLogged, 0);
  const grandTotal = totalHours + previousAccumulated;

  const doc = new PDFDocument({ margin: 50 });
  doc.pipe(stream);

  // Header
  doc.fontSize(18).text('Weekly Work Report', { align: 'center' });
  doc.moveDown();

  doc.fontSize(12);
  doc.text(`Intern: ${user.fullName}`);
  doc.text(`Company: ${profile.company || 'N/A'}`);
  doc.text(`Supervisor: ${profile.supervisorName || 'N/A'}`);
  doc.moveDown();

  // Table
  doc.fontSize(10);
  const startX = 50;
  let y = doc.y;

  // Table header
  doc.text('Date', startX, y, { width: 100 });
  doc.text('Hours', startX + 110, y, { width: 60 });
  doc.text('Note', startX + 180, y, { width: 300 });
  y += 20;

  // Table rows
  logs.forEach((log) => {
    if (y > 700) {
      doc.addPage();
      y = 50;
    }
    doc.text(formatDate(log.date), startX, y, { width: 100 });
    doc.text(log.hoursLogged.toString(), startX + 110, y, { width: 60 });
    doc.text(log.note || '', startX + 180, y, { width: 300 });
    y += 20;
  });

  doc.moveDown(2);
  doc.fontSize(12);
  doc.text(`Total Hours (This Period): ${totalHours}`);
  doc.text(`Previous Accumulated: ${previousAccumulated}`);
  doc.text(`Grand Total: ${grandTotal}`, { underline: true });

  doc.moveDown();
  doc.text('Remarks:');
  doc.fontSize(10).text(remarks || 'N/A');

  doc.moveDown();
  doc.fontSize(10).text(`Photos attached: ${photoUrls.length}`);

  // Embed photos if provided
  if (photoUrls.length > 0) {
    doc.addPage();
    doc.fontSize(14).text('Attached Photos', { underline: true });
    doc.moveDown();

    photoUrls.forEach((photoPath, i) => {
      const fullPath = path.join(process.cwd(), process.env.UPLOAD_DIR || './uploads', photoPath.replace('/uploads/', ''));
      if (fs.existsSync(fullPath)) {
        try {
          doc.image(fullPath, { fit: [250, 250], align: 'center' });
          doc.moveDown(0.5);
          doc.fontSize(9).text(`Photo ${i + 1}`, { align: 'center' });
          doc.moveDown();
        } catch (err) {
          console.error('Error embedding photo:', err);
        }
      }
    });
  }

  doc.end();
};
