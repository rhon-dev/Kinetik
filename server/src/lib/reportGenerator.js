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
  VerticalAlign,
} from 'docx';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

const formatDateDisplay = (d) => {
  if (!d) return 'mm/dd/yy';
  if (typeof d === 'string') d = new Date(d);
  return d.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' });
};

const THIN = { style: BorderStyle.SINGLE, size: 4, color: '000000' };
const THICK = { style: BorderStyle.SINGLE, size: 8, color: '000000' };
const NONE = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };

const cell = (children, opts = {}) =>
  new TableCell({
    children: Array.isArray(children) ? children : [new Paragraph(children)],
    verticalAlign: VerticalAlign.CENTER,
    borders: { top: THIN, bottom: THIN, left: THIN, right: THIN },
    ...opts,
  });

const boldPara = (text, align = AlignmentType.LEFT) =>
  new Paragraph({ children: [new TextRun({ text, bold: true })], alignment: align });

const plainPara = (text, align = AlignmentType.LEFT) =>
  new Paragraph({ children: [new TextRun({ text })], alignment: align });

const emptyPara = () => new Paragraph({ text: '' });

export const generateDOCX = async (data) => {
  const { profile, logs, previousAccumulated, remarks, photoUrls, user, periodStart, periodEnd } =
    data;

  const totalHours = logs.reduce((sum, l) => sum + l.hoursLogged, 0);

  // Days 1–5 rows — fill up to 5 even if fewer logs
  const maxDays = Math.max(logs.length, 5);
  const workRows = Array.from({ length: maxDays }, (_, i) => {
    const log = logs[i];
    return new TableRow({
      children: [
        // Day label
        cell([boldPara(`Day ${i + 1} ${log ? `(${log.date})` : '(Date Here)'}`)]),
        // Bullet point job
        cell([new Paragraph({ children: [new TextRun({ text: log ? log.note || '—' : '' })], bullet: { level: 0 } })]),
        // Reflection — spans cols 3+4
        new TableCell({
          children: [plainPara(i === 0 ? 'State your reflection here in paragraph/s.' : '')],
          columnSpan: 2,
          verticalAlign: VerticalAlign.TOP,
          rowSpan: i === 0 ? maxDays : undefined,
          borders: { top: THIN, bottom: THIN, left: THIN, right: THIN },
        }),
      ].filter(Boolean),
    });
  });

  // Because rowSpan is tricky with docx, we do it per-row instead
  const workRowsSimple = Array.from({ length: maxDays }, (_, i) => {
    const log = logs[i];
    return new TableRow({
      children: [
        cell([boldPara(`Day ${i + 1} ${log ? `(${log.date})` : '(Date Here)'}`)], { width: { size: 20, type: WidthType.PERCENTAGE } }),
        cell([new Paragraph({ children: [new TextRun({ text: log ? log.note || '' : '' })], bullet: { level: 0 } })], { width: { size: 30, type: WidthType.PERCENTAGE } }),
        cell([plainPara(i === 0 ? 'State your reflection here in paragraph/s.' : '')], { columnSpan: 2, width: { size: 50, type: WidthType.PERCENTAGE } }),
      ],
    });
  });

  const doc = new Document({
    sections: [{
      properties: {
        page: { margin: { top: 720, right: 720, bottom: 720, left: 720 } },
      },
      children: [

        // ── Logo header (borderless 3-column) ──────────────────
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: { top: NONE, bottom: NONE, left: NONE, right: NONE, insideHorizontal: NONE, insideVertical: NONE },
          rows: [
            new TableRow({
              children: [
                new TableCell({ children: [plainPara('UNIVERSITY of\nSAINT LOUIS\nTUGUEGARAO')], borders: { top: NONE, bottom: NONE, left: NONE, right: NONE }, width: { size: 33, type: WidthType.PERCENTAGE } }),
                new TableCell({ children: [emptyPara()], borders: { top: NONE, bottom: NONE, left: NONE, right: NONE }, width: { size: 34, type: WidthType.PERCENTAGE } }),
                new TableCell({ children: [plainPara('Logo of your chosen company', AlignmentType.RIGHT)], borders: { top: NONE, bottom: NONE, left: NONE, right: NONE }, width: { size: 33, type: WidthType.PERCENTAGE } }),
              ],
            }),
          ],
        }),

        emptyPara(),

        // ── University heading ─────────────────────────────────
        boldPara('UNIVERSITY OF SAINT LOUIS TUGUEGARAO', AlignmentType.CENTER),
        boldPara('SCHOOL OF ARCHITECTURE, COMPUTING, AND ENGINEERING', AlignmentType.CENTER),
        emptyPara(),
        plainPara('On-The-Job Training Weekly Report', AlignmentType.CENTER),
        emptyPara(),

        // ── Main table ─────────────────────────────────────────
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: { top: THIN, bottom: THIN, left: THIN, right: THIN, insideHorizontal: THIN, insideVertical: THIN },
          rows: [

            // Row 1: NAME | value | COURSE/YEAR | value
            new TableRow({ children: [
              cell([boldPara('NAME:')], { width: { size: 15, type: WidthType.PERCENTAGE } }),
              cell([plainPara(user.fullName)], { width: { size: 35, type: WidthType.PERCENTAGE } }),
              cell([boldPara('COURSE/YEAR:')], { width: { size: 15, type: WidthType.PERCENTAGE } }),
              cell([plainPara(profile.courseYear || 'BSCS-3')], { width: { size: 35, type: WidthType.PERCENTAGE } }),
            ]}),

            // Row 2: AGENCY | value | POSITION:INTERN | value
            new TableRow({ children: [
              cell([boldPara('AGENCY:')]),
              cell([plainPara(profile.company || '')]),
              cell([boldPara('POSITION:INTERN')]),
              cell([plainPara(profile.position || '')]),
            ]}),

            // Row 3: ASSIGNED OFFICE | value (spans 1 col) | PERIOD COVERED | date range
            new TableRow({ children: [
              cell([boldPara('ASSIGNED OFFICE:')]),
              cell([plainPara(profile.assignedOffice || '')]),
              cell([boldPara('PERIOD COVERED:')]),
              cell([plainPara(`${formatDateDisplay(periodStart)} –\n${formatDateDisplay(periodEnd)}`)]),
            ]}),

            // Row 4: HOURS RENDERED (full width)
            new TableRow({ children: [
              cell([boldPara('HOURS RENDERED DURING THE WEEK')], { columnSpan: 4 }),
            ]}),

            // Row 5: PREVIOUS | PRESENT | TOTAL
            new TableRow({ children: [
              cell([boldPara(`PREVIOUS: ${previousAccumulated} Hours`)], { columnSpan: 2 }),
              cell([boldPara(`PRESENT: ${totalHours} Hours`)]),
              cell([boldPara(`TOTAL: __/${profile.targetHours || 240} Hours`)]),
            ]}),

            // Row 6: DETAILS OF WORK (full width)
            new TableRow({ children: [
              cell([boldPara('DETAILS OF WORK UNDERTAKEN')], { columnSpan: 4 }),
            ]}),

            // Row 7: Column headers (empty | WORKS/JOBS ATTENDED | Learning/Reflection)
            new TableRow({ children: [
              cell([emptyPara()], { width: { size: 20, type: WidthType.PERCENTAGE } }),
              cell([boldPara('WORKS/JOBS ATTENDED', AlignmentType.CENTER)], { width: { size: 30, type: WidthType.PERCENTAGE } }),
              cell([boldPara('Learning/Reflection', AlignmentType.CENTER)], { columnSpan: 2, width: { size: 50, type: WidthType.PERCENTAGE } }),
            ]}),

            // Day rows
            ...workRowsSimple,

            // DOCUMENTATION header
            new TableRow({ children: [
              cell([boldPara('DOCUMENTATION', AlignmentType.CENTER)], { columnSpan: 4 }),
            ]}),

            // Documentation note
            new TableRow({ children: [
              new TableCell({
                children: [
                  plainPara("* Include documentation for each day. Please consider as well the size of the images you'll attach."),
                  emptyPara(),
                  emptyPara(),
                ],
                columnSpan: 4,
                borders: { top: THIN, bottom: THIN, left: THIN, right: THIN },
              }),
            ]}),

          ],
        }),

        emptyPara(),

        // ── REMARKS box ────────────────────────────────────────
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: { top: THIN, bottom: THIN, left: THIN, right: THIN },
          rows: [
            new TableRow({ children: [
              new TableCell({
                children: [
                  boldPara('REMARKS:'),
                  emptyPara(),
                  plainPara(remarks || ''),
                  emptyPara(),
                  emptyPara(),
                  emptyPara(),
                ],
                verticalAlign: VerticalAlign.TOP,
                borders: { top: THIN, bottom: THIN, left: THIN, right: THIN },
              }),
            ]}),
          ],
        }),

        emptyPara(),
        emptyPara(),
        emptyPara(),

        // ── Signature ──────────────────────────────────────────
        plainPara('Attested by:'),
        emptyPara(),
        emptyPara(),
        emptyPara(),
        new Paragraph({
          children: [new TextRun({ text: profile.supervisorName || "SUPERVISOR'S NAME", bold: true, underline: {} })],
        }),
        plainPara('Supervising Officer'),
      ],
    }],
  });

  return doc;
};

export const generatePDF = (data, stream) => {
  const { profile, logs, previousAccumulated, remarks, photoUrls, user, periodStart, periodEnd } =
    data;

  const totalHours = logs.reduce((sum, l) => sum + l.hoursLogged, 0);

  const doc = new PDFDocument({ margin: 50, size: 'A4' });
  doc.pipe(stream);

  const W = 595 - 100; // usable width (A4 - margins)
  const L = 50;        // left margin

  // ── Logo row ────────────────────────────────────────────────
  doc.fontSize(9).font('Helvetica-Bold').text('UNIVERSITY of\nSAINT LOUIS\nTUGUEGARAO', L, 50);
  doc.font('Helvetica').text('Logo of your chosen company', 400, 50);
  doc.moveDown(2);

  // ── University heading ───────────────────────────────────────
  doc.fontSize(11).font('Helvetica-Bold').text('UNIVERSITY OF SAINT LOUIS TUGUEGARAO', { align: 'center' });
  doc.text('SCHOOL OF ARCHITECTURE, COMPUTING, AND ENGINEERING', { align: 'center' });
  doc.font('Helvetica').fontSize(10).text('On-The-Job Training Weekly Report', { align: 'center' });
  doc.moveDown();

  // ── Info box ─────────────────────────────────────────────────
  const startY = doc.y;
  const col2 = L + W / 2;

  doc.fontSize(9).font('Helvetica-Bold').text('NAME:', L, startY);
  doc.font('Helvetica').text(user.fullName, L + 55, startY);
  doc.font('Helvetica-Bold').text('COURSE/YEAR:', col2, startY);
  doc.font('Helvetica').text(profile.courseYear || 'BSCS-3', col2 + 75, startY);

  doc.font('Helvetica-Bold').text('AGENCY:', L, startY + 16);
  doc.font('Helvetica').text(profile.company || '', L + 55, startY + 16);
  doc.font('Helvetica-Bold').text('POSITION:INTERN', col2, startY + 16);
  doc.font('Helvetica').text(profile.position || '', col2 + 95, startY + 16);

  doc.font('Helvetica-Bold').text('ASSIGNED OFFICE:', L, startY + 32);
  doc.font('Helvetica').text(profile.assignedOffice || '', L + 100, startY + 32);
  doc.font('Helvetica-Bold').text('PERIOD COVERED:', col2, startY + 32);
  doc
    .font('Helvetica')
    .text(
      `${formatDateDisplay(periodStart)} – ${formatDateDisplay(periodEnd)}`,
      col2 + 95,
      startY + 32
    );

  doc.moveDown(4);

  // ── Hours ─────────────────────────────────────────────────────
  doc.font('Helvetica-Bold').fontSize(9).text('HOURS RENDERED DURING THE WEEK');
  doc.font('Helvetica').text(
    `PREVIOUS: ${previousAccumulated} Hours      PRESENT: ${totalHours} Hours      TOTAL: __/${profile.targetHours || 240} Hours`
  );
  doc.moveDown();

  // ── Work details ──────────────────────────────────────────────
  doc.font('Helvetica-Bold').text('DETAILS OF WORK UNDERTAKEN');
  doc.moveDown(0.3);
  doc.font('Helvetica-Bold').text('                        WORKS/JOBS ATTENDED            Learning/Reflection');
  doc.moveDown(0.2);

  const maxDays = Math.max(logs.length, 5);
  for (let i = 0; i < maxDays; i++) {
    const log = logs[i];
    doc.font('Helvetica-Bold').text(`Day ${i + 1} (${log ? log.date : 'Date Here'})`, { continued: true });
    doc.font('Helvetica').text(`   • ${log ? log.note || '' : ''}`, { continued: false });
  }
  doc.moveDown();

  // ── Documentation ─────────────────────────────────────────────
  doc.font('Helvetica-Bold').text('DOCUMENTATION');
  doc
    .font('Helvetica')
    .fontSize(8)
    .text("* Include documentation for each day. Please consider as well the size of the images you'll attach.");
  doc.moveDown();

  // ── Remarks ───────────────────────────────────────────────────
  doc.fontSize(9).font('Helvetica-Bold').text('REMARKS:');
  doc.font('Helvetica').text(remarks || '');
  doc.moveDown(4);

  // ── Signature ─────────────────────────────────────────────────
  doc.font('Helvetica').text('Attested by:');
  doc.moveDown(2);
  doc.font('Helvetica-Bold').text(profile.supervisorName || "SUPERVISOR'S NAME");
  doc.font('Helvetica').text('Supervising Officer');

  doc.end();
};
