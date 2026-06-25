import {
  Document, Paragraph, Table, TableRow, TableCell,
  TextRun, AlignmentType, WidthType, BorderStyle, VerticalAlign,
} from 'docx';
import PDFDocument from 'pdfkit';

// ── Helpers ────────────────────────────────────────────────────────────────
const fmtDate = (d) => {
  if (!d) return 'mm/dd/yy';
  if (typeof d === 'string') d = new Date(d);
  return d.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' });
};

const T = { style: BorderStyle.SINGLE, size: 4, color: '000000' };
const N = { style: BorderStyle.NONE,   size: 0, color: 'FFFFFF' };

const mkCell = (children, opts = {}) =>
  new TableCell({
    children: Array.isArray(children) ? children : [new Paragraph({ children: [new TextRun(typeof children === 'string' ? { text: children } : children)] })],
    verticalAlign: VerticalAlign.CENTER,
    borders: { top: T, bottom: T, left: T, right: T },
    ...opts,
  });

const boldPara  = (text, align = AlignmentType.LEFT) => new Paragraph({ children: [new TextRun({ text, bold: true  })], alignment: align });
const plainPara = (text, align = AlignmentType.LEFT) => new Paragraph({ children: [new TextRun({ text             })], alignment: align });
const gap       = ()                                  => new Paragraph({ text: '' });

// ── DOCX ──────────────────────────────────────────────────────────────────
export const generateDOCX = async (data) => {
  const { profile, logs, previousAccumulated, remarks, photoUrls = [], user, periodStart, periodEnd } = data;
  const totalHours = logs.reduce((s, l) => s + l.hoursLogged, 0);
  const target     = profile.targetHours || 240;
  const maxDays    = Math.max(logs.length, 5);

  // Day rows
  const dayRows = Array.from({ length: maxDays }, (_, i) => {
    const log = logs[i];
    return new TableRow({
      children: [
        mkCell([boldPara(`Day ${i + 1} (${log ? log.date : 'Date Here'})`)],
               { width: { size: 20, type: WidthType.PERCENTAGE } }),
        mkCell([new Paragraph({ children: [new TextRun({ text: log?.note || '' })], bullet: { level: 0 } })],
               { width: { size: 30, type: WidthType.PERCENTAGE } }),
        mkCell([plainPara(i === 0 ? 'State your reflection here in paragraph/s.' : '')],
               { columnSpan: 2, width: { size: 50, type: WidthType.PERCENTAGE } }),
      ],
    });
  });

  return new Document({
    sections: [{
      properties: { page: { margin: { top: 720, right: 720, bottom: 720, left: 720 } } },
      children: [

        // ── Logo row (borderless) ──
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: { top: N, bottom: N, left: N, right: N, insideHorizontal: N, insideVertical: N },
          rows: [new TableRow({ children: [
            new TableCell({ children: [plainPara('UNIVERSITY of\nSAINT LOUIS\nTUGUEGARAO')], borders: { top: N, bottom: N, left: N, right: N }, width: { size: 40, type: WidthType.PERCENTAGE } }),
            new TableCell({ children: [gap()], borders: { top: N, bottom: N, left: N, right: N }, width: { size: 20, type: WidthType.PERCENTAGE } }),
            new TableCell({ children: [plainPara('Logo of your chosen company', AlignmentType.RIGHT)], borders: { top: N, bottom: N, left: N, right: N }, width: { size: 40, type: WidthType.PERCENTAGE } }),
          ]})],
        }),

        gap(), gap(),

        // ── University heading ──
        boldPara('UNIVERSITY OF SAINT LOUIS TUGUEGARAO',                AlignmentType.CENTER),
        boldPara('SCHOOL OF ARCHITECTURE, COMPUTING, AND ENGINEERING',  AlignmentType.CENTER),
        gap(),
        plainPara('On-The-Job Training Weekly Report', AlignmentType.CENTER),
        gap(),

        // ── Main table ──
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: { top: T, bottom: T, left: T, right: T, insideHorizontal: T, insideVertical: T },
          rows: [

            // NAME / COURSE-YEAR
            new TableRow({ children: [
              mkCell([boldPara('NAME:')],         { width: { size: 15, type: WidthType.PERCENTAGE } }),
              mkCell([plainPara(user.fullName)],  { width: { size: 35, type: WidthType.PERCENTAGE } }),
              mkCell([boldPara('COURSE/YEAR:')],  { width: { size: 15, type: WidthType.PERCENTAGE } }),
              mkCell([plainPara(profile.courseYear || 'BSCS-3')], { width: { size: 35, type: WidthType.PERCENTAGE } }),
            ]}),

            // AGENCY / POSITION:INTERN
            new TableRow({ children: [
              mkCell([boldPara('AGENCY:')]),
              mkCell([plainPara(profile.company  || '')]),
              mkCell([boldPara('POSITION:INTERN')]),
              mkCell([plainPara(profile.position || '')]),
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
              mkCell([boldPara(`PREVIOUS: ${previousAccumulated} Hours`)], { columnSpan: 2 }),
              mkCell([boldPara(`PRESENT: ${totalHours} Hours`)]),
              mkCell([boldPara(`TOTAL: __/${target} Hours`)]),
            ]}),

            // DETAILS OF WORK header
            new TableRow({ children: [
              mkCell([boldPara('DETAILS OF WORK UNDERTAKEN')], { columnSpan: 4 }),
            ]}),

            // Column headers
            new TableRow({ children: [
              mkCell([gap()],                                                         { width: { size: 20, type: WidthType.PERCENTAGE } }),
              mkCell([boldPara('WORKS/JOBS ATTENDED', AlignmentType.CENTER)],        { width: { size: 30, type: WidthType.PERCENTAGE } }),
              mkCell([boldPara('Learning/Reflection', AlignmentType.CENTER)],        { columnSpan: 2, width: { size: 50, type: WidthType.PERCENTAGE } }),
            ]}),

            // Day rows
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
                  gap(), gap(),
                ],
                columnSpan: 4,
                verticalAlign: VerticalAlign.TOP,
                borders: { top: T, bottom: T, left: T, right: T },
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
              children: [boldPara('REMARKS:'), gap(), plainPara(remarks || ''), gap(), gap(), gap()],
              verticalAlign: VerticalAlign.TOP,
              borders: { top: T, bottom: T, left: T, right: T },
            }),
          ]})],
        }),

        gap(), gap(), gap(), gap(),

        // ── Signature ──
        plainPara('Attested by:'),
        gap(), gap(), gap(),
        new Paragraph({ children: [new TextRun({ text: profile.supervisorName || "SUPERVISOR'S NAME", bold: true, underline: {} })] }),
        plainPara('Supervising Officer'),
      ],
    }],
  });
};

// ── PDF ───────────────────────────────────────────────────────────────────
export const generatePDF = (data, stream) => {
  const { profile, logs, previousAccumulated, remarks, photoUrls = [], user, periodStart, periodEnd } = data;
  const totalHours = logs.reduce((s, l) => s + l.hoursLogged, 0);
  const target     = profile.targetHours || 240;
  const L = 50;

  const doc = new PDFDocument({ margin: 50, size: 'A4' });
  doc.pipe(stream);

  // Logos
  doc.fontSize(8).font('Helvetica-Bold').text('UNIVERSITY of\nSAINT LOUIS\nTUGUEGARAO', L, 50);
  doc.font('Helvetica').text('Logo of your chosen company', 390, 50);

  // University heading
  doc.moveDown(2);
  doc.fontSize(11).font('Helvetica-Bold').text('UNIVERSITY OF SAINT LOUIS TUGUEGARAO', { align: 'center' });
  doc.fontSize(10).text('SCHOOL OF ARCHITECTURE, COMPUTING, AND ENGINEERING', { align: 'center' });
  doc.font('Helvetica').fontSize(10).text('On-The-Job Training Weekly Report', { align: 'center' });
  doc.moveDown();

  // Info
  const iy = doc.y;
  const half = 250;
  doc.fontSize(9).font('Helvetica-Bold').text('NAME:',           L,        iy);
  doc.font('Helvetica').text(user.fullName,                       L + 50,   iy);
  doc.font('Helvetica-Bold').text('COURSE/YEAR:',                 L + half, iy);
  doc.font('Helvetica').text(profile.courseYear || 'BSCS-3',      L + half + 70, iy);

  doc.font('Helvetica-Bold').text('AGENCY:',                      L,        iy + 18);
  doc.font('Helvetica').text(profile.company  || '',               L + 50,   iy + 18);
  doc.font('Helvetica-Bold').text('POSITION:INTERN',              L + half, iy + 18);
  doc.font('Helvetica').text(profile.position || '',               L + half + 90, iy + 18);

  doc.font('Helvetica-Bold').text('ASSIGNED OFFICE:',             L,        iy + 36);
  doc.font('Helvetica').text(profile.assignedOffice || '',         L + 95,   iy + 36);
  doc.font('Helvetica-Bold').text('PERIOD COVERED:',              L + half, iy + 36);
  doc.font('Helvetica').text(`${fmtDate(periodStart)} – ${fmtDate(periodEnd)}`, L + half + 90, iy + 36);

  doc.moveDown(4);

  // Hours
  doc.font('Helvetica-Bold').fontSize(9).text('HOURS RENDERED DURING THE WEEK');
  doc.font('Helvetica').text(
    `PREVIOUS: ${previousAccumulated} Hours     PRESENT: ${totalHours} Hours     TOTAL: __/${target} Hours`
  );
  doc.moveDown();

  // Work details
  doc.font('Helvetica-Bold').text('DETAILS OF WORK UNDERTAKEN');
  doc.text('                               WORKS/JOBS ATTENDED             Learning/Reflection');
  doc.moveDown(0.3);
  const maxDays = Math.max(logs.length, 5);
  for (let i = 0; i < maxDays; i++) {
    const log = logs[i];
    doc.font('Helvetica-Bold').text(`Day ${i + 1} (${log ? log.date : 'Date Here'})`, { continued: true });
    doc.font('Helvetica').text(`   • ${log?.note || ''}`, { continued: false });
  }
  doc.moveDown();

  // Documentation
  doc.font('Helvetica-Bold').text('DOCUMENTATION', { align: 'center' });
  doc.font('Helvetica').fontSize(8).text("* Include documentation for each day. Please consider as well the size of the images you'll attach.", { italics: true });
  doc.moveDown();

  // Remarks
  doc.fontSize(9).font('Helvetica-Bold').text('REMARKS:');
  doc.font('Helvetica').text(remarks || '');
  doc.moveDown(4);

  // Signature
  doc.font('Helvetica').text('Attested by:');
  doc.moveDown(2);
  doc.font('Helvetica-Bold').text(profile.supervisorName || "SUPERVISOR'S NAME");
  doc.font('Helvetica').text('Supervising Officer');

  doc.end();
};
