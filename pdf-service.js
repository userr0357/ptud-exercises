const PDFDocument = require('pdfkit-table');
const path = require('path');
const fs = require('fs');

const FONTS_DIR = path.join(__dirname, 'public', 'fonts');
const ROBOTO_REGULAR = path.join(FONTS_DIR, 'Roboto-Regular.ttf');
const ROBOTO_BOLD = path.join(FONTS_DIR, 'Roboto-Bold.ttf');

function setupDoc() {
  const doc = new PDFDocument({ margin: 40, size: 'A4' });
  
  if (fs.existsSync(ROBOTO_REGULAR)) {
    doc.registerFont('Roboto', ROBOTO_REGULAR);
  }
  if (fs.existsSync(ROBOTO_BOLD)) {
    doc.registerFont('Roboto-Bold', ROBOTO_BOLD);
  }

  // Fallback if fonts don't exist
  if (fs.existsSync(ROBOTO_REGULAR)) {
    doc.font('Roboto');
  }
  
  return doc;
}

function calcPoints(critStr) {
  if (!critStr) return 0;
  try {
    const crit = JSON.parse(critStr);
    if (!Array.isArray(crit)) return 0;
    return crit.reduce((sum, c) => sum + (Number(c.points) || 0), 0);
  } catch(e) {
    return 0;
  }
}

function parseJSONSafely(str, defaultVal) {
  if (!str) return defaultVal;
  try {
    return JSON.parse(str);
  } catch(e) {
    return defaultVal;
  }
}

// 1. LECTURER: Export Exercises (Table + Detail Profiles)
async function exportExercisesAsPDF(res, exercises, docTitle = "DANH SÁCH BÀI TẬP") {
  const doc = setupDoc();

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="BaiTap.pdf"');
  doc.pipe(res);

  // --- PAGE 1: OVERVIEW TABLE ---
  doc.fontSize(18).font('Roboto-Bold').text(docTitle, { align: 'center' });
  doc.moveDown(0.5);
  doc.fontSize(10).font('Roboto').text(`Ngày xuất: ${new Date().toLocaleDateString('vi-VN')} ${new Date().toLocaleTimeString('vi-VN')}`, { align: 'center' });
  doc.moveDown(1.5);

  const tableData = {
    headers: [
      { label: "STT", property: "stt", width: 40, renderer: null },
      { label: "Mã Bài", property: "id", width: 70, renderer: null },
      { label: "Tên Bài Tập", property: "title", width: 200, renderer: null },
      { label: "Điểm", property: "points", width: 60, renderer: null },
      { label: "Cấp/Khó", property: "level", width: 80, renderer: null }
    ],
    datas: exercises.map((ex, i) => ({
      stt: (i + 1).toString(),
      id: ex.MaBaiTap || '—',
      title: ex.TenBaiTap || '—',
      points: calcPoints(ex.TieuChiChamDiem).toString(),
      level: `L${ex.SkillLevel || 1} - ${ex.TenDoKho || ex.MaDoKho || '—'}`
    }))
  };

  await doc.table(tableData, { 
    prepareHeader: () => doc.font("Roboto-Bold").fontSize(10),
    prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => doc.font("Roboto").fontSize(10)
  });

  // --- PAGE 2+: DETAILED PROFILES ---
  for (let i = 0; i < exercises.length; i++) {
    const ex = exercises[i];
    doc.addPage();
    
    // Header
    doc.rect(40, doc.y, doc.page.width - 80, 40).fillAndStroke('#f1f5f9', '#cbd5e1');
    doc.fillColor('#0f172a').font('Roboto-Bold').fontSize(14).text(`Bài ${i + 1}: ${ex.TenBaiTap}`, 50, doc.y + 12);
    
    // Metadata
    doc.moveDown(1);
    doc.font('Roboto-Bold').fontSize(11).fillColor('#334155').text('Thông tin chung');
    doc.moveDown(0.2);
    doc.font('Roboto').fontSize(10).text(`• Mã bài tập: ${ex.MaBaiTap || '—'}    • Môn học: ${ex.TenMon || ex.MaMon || '—'}`);
    doc.text(`• Dạng bài: ${ex.TenDangBai || ex.MaDangBai || '—'}    • Độ khó: ${ex.TenDoKho || ex.MaDoKho || '—'}`);
    doc.text(`• Điểm tổng: ${calcPoints(ex.TieuChiChamDiem)}    • Kỹ năng: L${ex.SkillLevel || 1}`);

    // Description
    doc.moveDown(0.8);
    doc.font('Roboto-Bold').fontSize(11).text('Mô tả');
    doc.moveDown(0.2);
    doc.font('Roboto').fontSize(10).text(ex.MoTa || '(Không có mô tả)', { align: 'justify' });

    // Requirements
    doc.moveDown(0.8);
    doc.font('Roboto-Bold').fontSize(11).text('Yêu cầu');
    doc.moveDown(0.2);
    const reqs = parseJSONSafely(ex.YeuCau, [ex.YeuCau]);
    if (Array.isArray(reqs)) {
      reqs.forEach(req => {
        if(req) doc.font('Roboto').fontSize(10).text(`- ${req}`);
      });
    } else {
      doc.font('Roboto').fontSize(10).text(ex.YeuCau || '(Không có yêu cầu)');
    }

    // Grading Criteria Table
    const crit = parseJSONSafely(ex.TieuChiChamDiem, []);
    if (Array.isArray(crit) && crit.length > 0) {
      doc.moveDown(1);
      const critTable = {
        headers: [
          { label: "STT", property: "stt", width: 40 },
          { label: "Tiêu chí chấm điểm", property: "name", width: 320 },
          { label: "Điểm", property: "points", width: 90 }
        ],
        datas: crit.map((c, idx) => ({
          stt: (idx + 1).toString(),
          name: c.name || '—',
          points: (c.points || 0).toString()
        }))
      };
      await doc.table(critTable, { 
        prepareHeader: () => doc.font("Roboto-Bold").fontSize(10),
        prepareRow: () => doc.font("Roboto").fontSize(10),
        x: 40
      });
    }

    // Attached file note
    if (ex.FileDinhKem) {
      doc.moveDown(0.5);
      doc.font('Roboto').fontSize(10).fillColor('#64748b').text(`* Bài tập có file đính kèm: ${ex.FileDinhKem}`);
    }
  }

  doc.end();
}

// 2. ADMIN: Export Generic Table (Students, Grades)
async function exportTableAsPDF(res, headers, rows, docTitle) {
  const doc = setupDoc();

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="Report.pdf"`);
  doc.pipe(res);

  doc.fontSize(16).font('Roboto-Bold').text(docTitle, { align: 'center' });
  doc.moveDown(0.5);
  doc.fontSize(10).font('Roboto').text(`Ngày xuất: ${new Date().toLocaleDateString('vi-VN')} ${new Date().toLocaleTimeString('vi-VN')}`, { align: 'center' });
  doc.moveDown(1.5);

  const tableData = {
    headers: headers,
    datas: rows
  };

  await doc.table(tableData, {
    prepareHeader: () => doc.font("Roboto-Bold").fontSize(10),
    prepareRow: () => doc.font("Roboto").fontSize(10)
  });

  doc.end();
}

module.exports = {
  exportExercisesAsPDF,
  exportTableAsPDF
};
