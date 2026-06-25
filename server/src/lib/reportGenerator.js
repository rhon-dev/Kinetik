import {
  Document,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  TextRun,
  AlignmentType,
  WidthType,
  BorderStyle,
  HeadingLevel,
  VerticalAlign,
  ImageRun,
} from 'docx';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

const formatDate = (d) => {
  if (typeof d === 'string') d = new Date(d);
  return d.toISOString().split('T')[0];
};

const formatDateDisplay = (d) => {
  if (typeof d === 'string') d = new Date(d);
  return d.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' });
};

export const generateDOCX = async (data) => {
  const { profile, logs, previousAccumulated, remarks, photoUrls, user, periodStart, periodEnd } =
    data;

  const totalHours = logs.reduce((sum, log) => sum + log.hoursLogged, 0);
  const grandTotal = totalHours + previousAccumulated;

  // Build work details rows
  const workDetailsRows = logs.map((log, index) => {
    return new TableRow({
      children: [
        new TableCell({
          children: [
            new Paragraph({
              children: [new TextRun({ text: `Day ${index + 1} (${log.date})`, bold: true })],
            }),
          ],
          verticalAlign: VerticalAlign.TOP,
        }),
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: log.note || 'Work performed',
                }),
              ],
              bullet: { level: 0 },
            }),
          ],
          verticalAlign: VerticalAlign.TOP,
        }),
        new TableCell({
          children: [
            new Paragraph({
              text: `${log.hoursLogged} hours rendered on this day.`,
            }),
          ],
          verticalAlign: VerticalAlign.TOP,
        }),
      ],
    });
  });

  const doc = new Document({
    sections: [
      {
        children: [
          // Header with company logo placeholder
          new Paragraph({
            text: '[Company Logo]',
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),

          // University header
          new Paragraph({
            text: 'UNIVERSITY OF SAINT LOUIS TUGUEGARAO',
            alignment: AlignmentType.CENTER,
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({
            text: 'SCHOOL OF ARCHITECTURE, COMPUTING, AND ENGINEERING',
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 },
          }),

          // Title
          new Paragraph({
            text: 'On-The-Job Training Weekly Report',
            alignment: AlignmentType.CENTER,
            heading: HeadingLevel.HEADING_2,
            spacing: { after: 400 },
          }),

          // Info table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1 },
              bottom: { style: BorderStyle.SINGLE, size: 1 },
              left: { style: BorderStyle.SINGLE, size: 1 },
              right: { style: BorderStyle.SINGLE, size: 1 },
              insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
              insideVertical: { style: BorderStyle.SINGLE, size: 1 },
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ text: 'NAME:', bold: true })],
                    width: { size: 25, type: WidthType.PERCENTAGE },
                  }),
                  new TableCell({
                    children: [new Paragraph(user.fullName)],
                    width: { size: 75, type: WidthType.PERCENTAGE },
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: 'COURSE/YEAR:', bold: true })] }),
                  new TableCell({
                    children: [new Paragraph(profile.courseYear || 'BSCS-3')],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: 'AGENCY:', bold: true })] }),
                  new TableCell({
                    children: [new Paragraph(profile.company || 'N/A')],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: 'POSITION:', bold: true })] }),
                  new TableCell({
                    children: [new Paragraph(profile.position || 'N/A')],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ text: 'ASSIGNED OFFICE:', bold: true })],
                  }),
                  new TableCell({
                    children: [new Paragraph(profile.assignedOffice || 'N/A')],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ text: 'PERIOD COVERED:', bold: true })],
                  }),
                  new TableCell({
                    children: [
                      new Paragraph(
                        `${formatDateDisplay(periodStart)} – ${formatDateDisplay(periodEnd)}`
                      ),
                    ],
                  }),
                ],
              }),
            ],
          }),

          new Paragraph({ text: '', spacing: { after: 200 } }),

          // Hours table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1 },
              bottom: { style: BorderStyle.SINGLE, size: 1 },
              left: { style: BorderStyle.SINGLE, size: 1 },
              right: { style: BorderStyle.SINGLE, size: 1 },
              insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
              insideVertical: { style: BorderStyle.SINGLE, size: 1 },
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        text: 'HOURS RENDERED DURING THE WEEK',
                        bold: true,
                        alignment: AlignmentType.CENTER,
                      }),
                    ],
                    columnSpan: 3,
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({ text: `PREVIOUS: ${previousAccumulated} Hours`, bold: true }),
                    ],
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: `PRESENT: ${totalHours} Hours`, bold: true })],
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        text: `TOTAL: ${grandTotal}/${profile.targetHours || 240} Hours`,
                        bold: true,
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),

          new Paragraph({ text: '', spacing: { after: 200 } }),

          // Work details header
          new Paragraph({
            text: 'DETAILS OF WORK UNDERTAKEN',
            bold: true,
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
          }),

          // Work details table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1 },
              bottom: { style: BorderStyle.SINGLE, size: 1 },
              left: { style: BorderStyle.SINGLE, size: 1 },
              right: { style: BorderStyle.SINGLE, size: 1 },
              insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
              insideVertical: { style: BorderStyle.SINGLE, size: 1 },
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ text: '', bold: true })],
                    width: { size: 20, type: WidthType.PERCENTAGE },
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({ text: 'WORKS/JOBS ATTENDED', bold: true, alignment: AlignmentType.CENTER }),
                    ],
                    width: { size: 40, type: WidthType.PERCENTAGE },
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({ text: 'Learning/Reflection', bold: true, alignment: AlignmentType.CENTER }),
                    ],
                    width: { size: 40, type: WidthType.PERCENTAGE },
                  }),
                ],
              }),
              ...workDetailsRows,
            ],
          }),

          new Paragraph({ text: '', spacing: { after: 200 } }),

          // Documentation section
          new Paragraph({
            text: 'DOCUMENTATION',
            bold: true,
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
          }),

          new Paragraph({
            text: `${photoUrls.length} photo(s) attached. Please consider the size of the images.`,
            italics: true,
          }),

          new Paragraph({ text: '', spacing: { after: 300 } }),

          // Remarks
          new Paragraph({
            text: 'REMARKS:',
            bold: true,
            spacing: { after: 100 },
          }),
          new Paragraph({
            text: remarks || 'No remarks.',
            spacing: { after: 400 },
          }),

          // Signature
          new Paragraph({ text: '', spacing: { after: 200 } }),
          new Paragraph({ text: 'Attested by:', spacing: { after: 400 } }),
          new Paragraph({ text: '', spacing: { after: 400 } }),
          new Paragraph({
            text: profile.supervisorName || "SUPERVISOR'S NAME",
            bold: true,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            text: 'Supervising Officer',
            alignment: AlignmentType.CENTER,
          }),
        ],
      },
    ],
  });

  return doc;
};

export const generatePDF = (data, stream) => {
  const { profile, logs, previousAccumulated, remarks, photoUrls, user, periodStart, periodEnd } =
    data;

  const totalHours = logs.reduce((sum, log) => sum + log.hoursLogged, 0);
  const grandTotal = totalHours + previousAccumulated;

  const doc = new PDFDocument({ margin: 50 });
  doc.pipe(stream);

  // Header
  doc.fontSize(10).text('[Company Logo]', { align: 'center' });
  doc.moveDown();

  doc.fontSize(14).text('UNIVERSITY OF SAINT LOUIS TUGUEGARAO', { align: 'center', bold: true });
  doc
    .fontSize(12)
    .text('SCHOOL OF ARCHITECTURE, COMPUTING, AND ENGINEERING', { align: 'center' });
  doc.moveDown();

  doc.fontSize(14).text('On-The-Job Training Weekly Report', { align: 'center', bold: true });
  doc.moveDown(1.5);

  // Info section
  doc.fontSize(10);
  doc.text(`NAME: ${user.fullName}`);
  doc.text(`COURSE/YEAR: ${profile.courseYear || 'BSCS-3'}`);
  doc.text(`AGENCY: ${profile.company || 'N/A'}`);
  doc.text(`POSITION: ${profile.position || 'N/A'}`);
  doc.text(`ASSIGNED OFFICE: ${profile.assignedOffice || 'N/A'}`);
  doc.text(
    `PERIOD COVERED: ${formatDateDisplay(periodStart)} – ${formatDateDisplay(periodEnd)}`
  );
  doc.moveDown();

  // Hours
  doc.fontSize(11).text('HOURS RENDERED DURING THE WEEK', { underline: true });
  doc.fontSize(10);
  doc.text(`PREVIOUS: ${previousAccumulated} Hours`);
  doc.text(`PRESENT: ${totalHours} Hours`);
  doc.text(`TOTAL: ${grandTotal}/${profile.targetHours || 240} Hours`);
  doc.moveDown();

  // Work details
  doc.fontSize(11).text('DETAILS OF WORK UNDERTAKEN', { underline: true });
  doc.moveDown(0.5);
  logs.forEach((log, i) => {
    doc.fontSize(10);
    doc.text(`Day ${i + 1} (${log.date})`, { bold: true });
    doc.text(`  • ${log.note || 'Work performed'}`);
    doc.text(`  ${log.hoursLogged} hours rendered on this day.`);
    doc.moveDown(0.5);
  });

  doc.moveDown();

  // Documentation
  doc.fontSize(11).text('DOCUMENTATION', { underline: true });
  doc
    .fontSize(9)
    .text(`${photoUrls.length} photo(s) attached.`, { italics: true });
  doc.moveDown();

  // Remarks
  doc.fontSize(10).text('REMARKS:');
  doc.fontSize(9).text(remarks || 'No remarks.');
  doc.moveDown(2);

  // Signature
  doc.fontSize(10).text('Attested by:');
  doc.moveDown(2);
  doc.text(profile.supervisorName || "SUPERVISOR'S NAME", { align: 'center' });
  doc.text('Supervising Officer', { align: 'center' });

  doc.end();
};

