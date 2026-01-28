const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'db.json');

function readDB() {
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
}

function backupDB(db) {
  const backupPath = DB_PATH + '.backup.' + Date.now() + '.json';
  fs.writeFileSync(backupPath, JSON.stringify(db, null, 2), 'utf8');
  return backupPath;
}

function getDifficultyTag(d) {
  if (!d) return 'medium';
  const s = String(d).toLowerCase();
  if (s.includes('dễ') || s.includes('de')) return 'easy';
  if (s.includes('khó') || s.includes('kho')) return 'hard';
  if (s.includes('trung')) return 'medium';
  return 'medium';
}

function isAdvancedSubject(subject) {
  const id = (subject.subject_id || '').toLowerCase();
  const name = (subject.subject_name || '').toLowerCase();
  // Treat CS201 / CS202 as DSA / OOP (advanced) for weighting
  return id.includes('201') || id.includes('202') || name.includes('dsa') || name.includes('oop') || name.includes('dữ liệu') || name.includes('cấu trúc');
}

function buildTemplate(subject, diffTag) {
  const advanced = isAdvancedSubject(subject);

  // We'll return an array of { criteria, points, note }
  if (diffTag === 'easy') {
    if (advanced) {
      return {
        total: 10,
        items: [
          { criteria: 'Core correctness (logic)', points: 5, note: 'Chạy đúng các trường hợp chính' },
          { criteria: 'Input validation', points: 1, note: 'Xử lý nhập sai / giới hạn đơn giản' },
          { criteria: 'Edge cases & robustness', points: 1, note: 'Các trường hợp biên cơ bản' },
          { criteria: 'Algorithmic efficiency', points: 2, note: 'Không quá kém về độ phức tạp cho dữ liệu nhỏ/ trung bình' },
          { criteria: 'Code clarity & comments', points: 1, note: 'Mã đọc được, có chú thích cơ bản' }
        ]
      };
    }
    return {
      total: 10,
      items: [
        { criteria: 'Core correctness (logic)', points: 6, note: 'Đầu ra và hành vi đúng theo yêu cầu' },
        { criteria: 'Input validation', points: 2, note: 'Kiểm tra dữ liệu đầu vào hợp lệ' },
        { criteria: 'Edge cases', points: 1, note: 'Các trường hợp biên đơn giản' },
        { criteria: 'Code clarity & comments', points: 1, note: 'Mã sạch, có chú thích' }
      ]
    };
  }

  if (diffTag === 'medium') {
    if (advanced) {
      return {
        total: 15,
        items: [
          { criteria: 'Core correctness (logic)', points: 7, note: 'Đúng với đa số test, bao gồm các trường hợp phức hơn' },
          { criteria: 'Input validation', points: 2, note: 'Xử lý nhập sai/biên độ' },
          { criteria: 'Edge cases & robustness', points: 2, note: 'Các trường hợp biên và dữ liệu đặc biệt' },
          { criteria: 'Algorithmic efficiency', points: 3, note: 'Giải pháp có độ phức tạp phù hợp với đề' },
          { criteria: 'Design & modularity', points: 1, note: 'Hàm/mô-đun tách bạch, tái sử dụng được' }
        ]
      };
    }
    return {
      total: 15,
      items: [
        { criteria: 'Core correctness (logic)', points: 8, note: 'Đúng và đầy đủ yêu cầu đề bài' },
        { criteria: 'Input validation', points: 2, note: 'Xử lý trường hợp nhập sai' },
        { criteria: 'Edge cases', points: 2, note: 'Kiểm thử với các biên' },
        { criteria: 'Design & modularity', points: 2, note: 'Tách chức năng hợp lý' },
        { criteria: 'Code clarity & comments', points: 1, note: 'Đặt tên rõ ràng, có chú thích' }
      ]
    };
  }

  // hard
  if (advanced) {
    return {
      total: 20,
      items: [
        { criteria: 'Core correctness (logic)', points: 10, note: 'Hoàn toàn đúng cho tập test mở rộng' },
        { criteria: 'Input validation & error handling', points: 2, note: 'Xử lý mọi trường hợp đầu vào không hợp lệ' },
        { criteria: 'Edge cases & robustness', points: 2, note: 'Các trường hợp biên phức tạp' },
        { criteria: 'Algorithmic efficiency & scalability', points: 4, note: 'Độ phức tạp phù hợp và tối ưu cho dữ liệu lớn' },
        { criteria: 'Design & architecture (modularity)', points: 1, note: 'Thiết kế rõ ràng, dễ mở rộng' },
        { criteria: 'Code quality & documentation', points: 1, note: 'Mã sạch, có tài liệu/nhận xét hợp lý' }
      ]
    };
  }

  return {
    total: 20,
    items: [
      { criteria: 'Core correctness (logic)', points: 10, note: 'Đúng và đầy đủ yêu cầu đề bài' },
      { criteria: 'Input validation & error handling', points: 3, note: 'Xử lý các trường hợp vào ra phức tạp' },
      { criteria: 'Edge cases & robustness', points: 2, note: 'Các trường hợp biên phức tạp' },
      { criteria: 'Design & architecture (modularity)', points: 3, note: 'Thiết kế mô-đun, nguyên lý tốt' },
      { criteria: 'Code quality & documentation', points: 2, note: 'Đặt tên, cấu trúc, tài liệu tốt' }
    ]
  };
}

function applyTemplates(db) {
  let updatedCount = 0;
  for (const subject of db) {
    for (const form of (subject.forms || [])) {
      for (const ex of (form.exercises || [])) {
        const diffTag = getDifficultyTag(ex.difficulty || form.difficulty);
        const tpl = buildTemplate(subject, diffTag);
        // Write structured grading criteria and a short summary string
        ex.grading_criteria = tpl.items.map(i => ({ name: i.criteria, points: i.points, note: i.note }));
        ex.grading_total = tpl.total;
        ex.grading_summary = tpl.items.map(i => `${i.criteria}: ${i.points}p`).join(' | ');
        updatedCount++;
      }
    }
  }
  return updatedCount;
}

function main() {
  console.log('Reading', DB_PATH);
  const db = readDB();
  const backupPath = backupDB(db);
  console.log('Backup created at', backupPath);
  const updated = applyTemplates(db);
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf8');
  console.log(`Updated ${updated} exercises with quantitative grading criteria.`);
  console.log('Done.');
}

if (require.main === module) {
  try {
    main();
  } catch (err) {
    console.error('Error:', err && err.stack ? err.stack : err);
    process.exit(1);
  }
}
