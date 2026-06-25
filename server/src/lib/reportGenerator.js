import {
  Document, Paragraph, Table, TableRow, TableCell,
  TextRun, AlignmentType, WidthType, BorderStyle, VerticalAlign,
  ImageRun, HeightRule,
} from 'docx';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const USLT_LOGO = path.join(__dirname, '../assets/uslt.png');
const DOST_LOGO = path.join(__dirname, '../assets/dost.png');

// ── Helpers ────────────────────────────────────────────────────────────────
const fmtDate = (d) => {
  if (!d) return 'mm/dd/yy';
  if (typeof d === 'string') d = new Date(d);
  return d.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' });
};

const T  = { style: BorderStyle.SINGLE, size: 4,  color: '000000' };
const N  = { style: BorderStyle.NONE,   size: 0,  color: 'FFFFFF' };
const TB = { top: T, bottom: T, left: T, right: T };
const NB = { top: N, bottom: N, left: N, right: N };

const mkCell = (children, opts = {}) =>
  new TableCell({
    children: Array.isArray(children) ? children : [
      new Paragraph({ children: [new TextRun(typeof children === 'string' ? { text: children } : children)] }),
    ],
    verticalAlign: VerticalAlign.CENTER,
    borders: TB,
    ...opts,
  });

const boldPara  = (text, align = AlignmentType.LEFT) =>
  new Paragraph({ children: [new TextRun({ text, bold: true, size: 18 })], alignment: align });
const plainPara = (text, align = AlignmentType.LEFT) =>
  new Paragraph({ children: [new TextRun({ text, size: 18 })], alignment: align });
const smallBold = (text, align = AlignmentType.LEFT) =>
  new Paragraph({ children: [new TextRun({ text, bold: true, size: 16 })], alignment: align });
const gap       = () => new Paragraph({ text: '' });

// ── DOCX ──────────────────────────────────────────────────────────────────
export const generateDOCX = async (data) => {
  const { profile, logs, previousAccumulated, remarks, user, periodStart, periodEnd } = data;
  const totalHours = logs.reduce((s, l) => s + l.hoursLogged, 0);
  const target     = profile.targetHours || 240;
  const maxDays    = Math.max(logs.length, 5);

  const dostImg  = fs.readFileSync(DOST_LOGO);
  const usltImg  = fs.readFileSync(USLT_LOGO);

  const dayRows = Array.from({ length: maxDays }, (_, i) => {
    const log = logs[i];
    return new TableRow({
      height: { value: 400, rule: HeightRule.ATLEAST },
      children: [
        mkCell(
          [boldPara(`Day ${i + 1} (${log ? fmtDate(log.date) : 'Date Here'})`)],
          { width: { size: 22, type: WidthType.PERCENTAGE } }
        ),
        mkCell(
          [new Paragraph({ children: [new TextRun({ text: log?.note || '', size: 18 })], bullet: { level: 0 } })],
          { width: { size: 33, type: WidthType.PERCENTAGE }, verticalAlign: VerticalAlign.TOP }
        ),
        mkCell(
          [plainPara(i === 0 ? 'State your reflection here in paragraph/s.' : '')],
          { columnSpan: 2, width: { size: 45, type: WidthType.PERCENTAGE }, verticalAlign: VerticalAlign.TOP }
        ),
      ],
    });
  });

  return new Document({
    sections: [{
      properties: { page: { margin: { top: 720, right: 720, bottom: 720, left: 720 } } },
      children: [

        // ── Logo row ──
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: { top: N, bottom: N, left: N, right: N, insideHorizontal: N, insideVertical: N },
          rows: [new TableRow({
            height: { value: 900, rule: HeightRule.EXACT },
            children: [
              new TableCell({
                children: [new Paragraph({
                  children: [new ImageRun({ data: dostImg, transformation: { width: 80, height: 80 }, type: 'png' })],
                  alignment: AlignmentType.LEFT,
                })],
                borders: NB,
                width: { size: 20, type: WidthType.PERCENTAGE },
                verticalAlign: VerticalAlign.CENTER,
              }),
              new TableCell({ children: [gap()], borders: NB, width: { size: 60, type: WidthType.PERCENTAGE } }),
              new TableCell({
                children: [new Paragraph({
                  children: [new ImageRun({ data: usltImg, transformation: { width: 200, height: 70 }, type: 'png' })],
                  alignment: AlignmentType.RIGHT,
                })],
                borders: NB,
                width: { size: 20, type: WidthType.PERCENTAGE },
                verticalAlign: VerticalAlign.CENTER,
              }),
            ],
          })],
        }),

        gap(),

        // ── University heading ──
        new Paragraph({
          children: [new TextRun({ text: 'UNIVERSITY OF SAINT LOUIS TUGUEGARAO', bold: true, size: 22 })],
          alignment: AlignmentType.CENTER,
        }),
        new Paragraph({
          children: [new TextRun({ text: 'SCHOOL OF ARCHITECTURE, COMPUTING, AND ENGINEERING', bold: true, size: 20 })],
          alignment: AlignmentType.CENTER,
        }),
        gap(),
        new Paragraph({
          children: [new TextRun({ text: 'On-The-Job Training Weekly Report', size: 20 })],
          alignment: AlignmentType.CENTER,
        }),
        gap(),

        // ── Main table ──
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: { top: T, bottom: T, left: T, right: T, insideHorizontal: T, insideVertical: T },
          rows: [

            // NAME / COURSE-YEAR
            new TableRow({ children: [
              mkCell([boldPara('NAME:')],                              { width: { size: 12, type: WidthType.PERCENTAGE } }),
              mkCell([plainPara(user.fullName)],                       { width: { size: 38, type: WidthType.PERCENTAGE } }),
              mkCell([boldPara('COURSE/YEAR:')],                      { width: { size: 15, type: WidthType.PERCENTAGE } }),
              mkCell([plainPara(profile.courseYear || '')],            { width: { size: 35, type: WidthType.PERCENTAGE } }),
            ]}),

            // AGENCY / POSITION
            new TableRow({ children: [
              mkCell([boldPara('AGENCY:')]),
              mkCell([plainPara(profile.company || '')]),
              mkCell([boldPara('POSITION:')]),
              mkCell([plainPara('INTERN')]),
            ]}),

            // ASSIGNED OFFICE / PERIOD COVERED
            new TableRow({ children: [
              mkCell([boldPara('ASSIGNED OFFICE:')]),
              mkCell([plainPara(profile.assignedOffice || '')]),
              mkCell([boldPara('PERIOD COVERED:')]),
              mkCell([plainPara(`${fmtDate(periodStart)} – ${fmtDate(periodEnd)}`)]),
            ]}),

            // HOURS RENDERED header
            new TableRow({ children: [
              mkCell([boldPara('HOURS RENDERED DURING THE WEEK')], { columnSpan: 4 }),
            ]}),

            // PREVIOUS / PRESENT / TOTAL
            new TableRow({ children: [
              mkCell([plainPara(`PREVIOUS: ${previousAccumulated} Hours`)], { columnSpan: 2 }),
              mkCell([plainPara(`PRESENT: ${totalHours} Hours`)]),
              mkCell([plainPara(`TOTAL: __/${target} Hours`)]),
            ]}),

            // DETAILS OF WORK header
            new TableRow({ children: [
              mkCell([boldPara('DETAILS OF WORK UNDERTAKEN')], { columnSpan: 4 }),
            ]}),

            // Column headers
            new TableRow({ children: [
              mkCell([gap()],                                                          { width: { size: 22, type: WidthType.PERCENTAGE } }),
              mkCell([boldPara('WORKS/JOBS ATTENDED', AlignmentType.CENTER)],         { width: { size: 33, type: WidthType.PERCENTAGE } }),
              mkCell([boldPara('Learning/Reflection', AlignmentType.CENTER)],         { columnSpan: 2, width: { size: 45, type: WidthType.PERCENTAGE } }),
            ]}),

            ...dayRows,

            // DOCUMENTATION header
            new TableRow({ children: [
              mkCell([boldPara('DOCUMENTATION', AlignmentType.CENTER)], { columnSpan: 4 }),
            ]}),

            // Documentation note
            new TableRow({ children: [
              new TableCell({
                children: [
                  plainPara("* Include documentation for each day. Please consider as well the size of the images you'll attach."),
                  gap(), gap(), gap(),
                ],
                columnSpan: 4,
                verticalAlign: VerticalAlign.TOP,
                borders: TB,
              }),
            ]}),
          ],
        }),

        gap(),

        // ── REMARKS box ──
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: { top: T, bottom: T, left: T, right: T, insideHorizontal: T, insideVertical: T },
          rows: [new TableRow({ children: [
            new TableCell({
              children: [boldPara('REMARKS:'), gap(), plainPara(remarks || ''), gap(), gap(), gap(), gap()],
              verticalAlign: VerticalAlign.TOP,
              borders: TB,
            }),
          ]})],
        }),

        gap(), gap(), gap(), gap(),

        // ── Signature ──
        plainPara('Attested by:'),
        gap(), gap(), gap(),
        new Paragraph({
          children: [new TextRun({ text: profile.supervisorName || "SUPERVISOR'S NAME", bold: true, underline: {}, size: 18 })],
        }),
        plainPara('Supervising Officer'),
      ],
    }],
  });
};

// ── PDF helpers ─────────────────────────────────────────────────────────────
const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MARGIN = 45;
const COL_W  = PAGE_W - MARGIN * 2;

// Draw a bordered row and return next Y
const drawRow = (doc, x, y, cols, rowH, opts = {}) => {
  cols.forEach(({ w, lines = [], bold = false, align = 'left', size = 8, span = 1 }) => {
    doc.rect(x, y, w, rowH).stroke();
    const pad = 4;
    lines.forEach((line, li) => {
      if (!line) return;
      doc.font(bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(size);
      doc.text(line, x + pad, y + pad + li * (size + 2), { width: w - pad * 2, align });
    });
    x += w;
  });
  return y + rowH;
};

// ── PDF ───────────────────────────────────────────────────────────────────
export const generatePDF = (data, stream) => {
  const { profile, logs, previousAccumulated, remarks, user, periodStart, periodEnd } = data;
  const totalHours = logs.reduce((s, l) => s + l.hoursLogged, 0);
  const target     = profile.targetHours || 240;
  const maxDays    = Math.max(logs.length, 5);

  const doc = new PDFDocument({ margin: MARGIN, size: 'A4', autoFirstPage: true });
  doc.pipe(stream);

  let y = MARGIN;
  const x = MARGIN;

  // ── Logos ──
  const logoH = 60;
  if (fs.existsSync(DOST_LOGO)) {
    doc.image(DOST_LOGO, x, y, { height: logoH, fit: [90, logoH] });
  }
  if (fs.existsSync(USLT_LOGO)) {
    doc.image(USLT_LOGO, PAGE_W - MARGIN - 160, y, { height: logoH, fit: [160, logoH] });
  }
  y += logoH + 10;

  // ── Heading ──
  doc.font('Helvetica-Bold').fontSize(11)
    .text('UNIVERSITY OF SAINT LOUIS TUGUEGARAO', x, y, { width: COL_W, align: 'center' });
  y += 15;
  doc.fontSize(9)
    .text('SCHOOL OF ARCHITECTURE, COMPUTING, AND ENGINEERING', x, y, { width: COL_W, align: 'center' });
  y += 13;
  doc.font('Helvetica').fontSize(9)
    .text('On-The-Job Training Weekly Report', x, y, { width: COL_W, align: 'center' });
  y += 16;

  // Column widths (4-col layout matching template)
  const c1 = COL_W * 0.14;  // label
  const c2 = COL_W * 0.36;  // value
  const c3 = COL_W * 0.16;  // label
  const c4 = COL_W * 0.34;  // value
  const rowH = 18;

  // ── Info rows ──
  y = drawRow(doc, x, y, [
    { w: c1, lines: ['NAME:'], bold: true },
    { w: c2, lines: [user.fullName] },
    { w: c3, lines: ['COURSE/YEAR:'], bold: true },
    { w: c4, lines: [profile.courseYear || ''] },
  ], rowH);

  y = drawRow(doc, x, y, [
    { w: c1, lines: ['AGENCY:'], bold: true },
    { w: c2, lines: [profile.company || ''] },
    { w: c3, lines: ['POSITION:'], bold: true },
    { w: c4, lines: ['INTERN'] },
  ], rowH);

  y = drawRow(doc, x, y, [
    { w: c1, lines: ['ASSIGNED OFFICE:'], bold: true, size: 7 },
    { w: c2, lines: [profile.assignedOffice || ''] },
    { w: c3, lines: ['PERIOD COVERED:'], bold: true, size: 7 },
    { w: c4, lines: [`${fmtDate(periodStart)} – ${fmtDate(periodEnd)}`] },
  ], rowH);

  // Hours header
  y = drawRow(doc, x, y, [
    { w: COL_W, lines: ['HOURS RENDERED DURING THE WEEK'], bold: true },
  ], rowH);

  // Hours values
  const h1 = COL_W / 3;
  y = drawRow(doc, x, y, [
    { w: h1, lines: [`PREVIOUS: ${previousAccumulated} Hours`] },
    { w: h1, lines: [`PRESENT: ${totalHours} Hours`] },
    { w: h1, lines: [`TOTAL: __/${target} Hours`] },
  ], rowH);

  // Details header
  y = drawRow(doc, x, y, [
    { w: COL_W, lines: ['DETAILS OF WORK UNDERTAKEN'], bold: true },
  ], rowH);

  // Column labels
  const d1 = COL_W * 0.22;
  const d2 = COL_W * 0.33;
  const d3 = COL_W * 0.45;
  y = drawRow(doc, x, y, [
    { w: d1, lines: [''] },
    { w: d2, lines: ['WORKS/JOBS ATTENDED'], bold: true, align: 'center' },
    { w: d3, lines: ['Learning/Reflection'], bold: true, align: 'center' },
  ], rowH);

  // Day rows — reflection only on first row, spanning all day rows
  const dayRowH = 22;
  const totalDayH = dayRowH * maxDays;

  // Draw day + works cols first
  let dy = y;
  for (let i = 0; i < maxDays; i++) {
    const log = logs[i];
    const dateLabel = log ? fmtDate(log.date) : 'Date Here';
    doc.rect(x,        dy, d1, dayRowH).stroke();
    doc.rect(x + d1,   dy, d2, dayRowH).stroke();
    doc.font('Helvetica-Bold').fontSize(8)
      .text(`Day ${i + 1} (${dateLabel})`, x + 4, dy + 6, { width: d1 - 8 });
    if (log?.note) {
      doc.font('Helvetica').fontSize(8)
        .text(`• ${log.note}`, x + d1 + 4, dy + 6, { width: d2 - 8 });
    }
    dy += dayRowH;
  }

  // Draw reflection cell spanning all day rows
  doc.rect(x + d1 + d2, y, d3, totalDayH).stroke();
  doc.font('Helvetica').fontSize(8)
    .text('State your reflection here in paragraph/s.', x + d1 + d2 + 4, y + 6, { width: d3 - 8 });

  y += totalDayH;

  // Documentation
  y = drawRow(doc, x, y, [
    { w: COL_W, lines: ['DOCUMENTATION'], bold: true, align: 'center' },
  ], rowH);

  const docNoteH = 50;
  doc.rect(x, y, COL_W, docNoteH).stroke();
  doc.font('Helvetica').fontSize(8)
    .text("* Include documentation for each day. Please consider as well the size of the images you'll attach.",
      x + 4, y + 6, { width: COL_W - 8 });
  y += docNoteH;

  // Remarks
  const remarkH = 60;
  doc.rect(x, y, COL_W, remarkH).stroke();
  doc.font('Helvetica-Bold').fontSize(8).text('REMARKS:', x + 4, y + 6);
  if (remarks) {
    doc.font('Helvetica').fontSize(8).text(remarks, x + 4, y + 18, { width: COL_W - 8 });
  }
  y += remarkH + 20;

  // Signature
  doc.font('Helvetica').fontSize(9).text('Attested by:', x, y);
  y += 40;
  doc.font('Helvetica-Bold').fontSize(9).text(profile.supervisorName || "SUPERVISOR'S NAME", x, y);
  doc.moveTo(x, y - 2).lineTo(x + 150, y - 2).stroke();
  y += 13;
  doc.font('Helvetica').fontSize(9).text('Supervising Officer', x, y);

  doc.end();
};
