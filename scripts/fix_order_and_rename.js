const fs = require('fs');
const path = require('path');
const dbPath = path.join(__dirname, '..', 'db.json');
const backupsDir = path.join(__dirname, '..', 'backups');
if (!fs.existsSync(dbPath)) { console.error('db.json not found'); process.exit(1); }
if (!fs.existsSync(backupsDir)) fs.mkdirSync(backupsDir);
const db = JSON.parse(fs.readFileSync(dbPath,'utf8'));
const backupPath = path.join(backupsDir, `db.backup.${Date.now()}.json`);
fs.writeFileSync(backupPath, JSON.stringify(db, null, 2));
console.log('Backup created:', backupPath);

function extractNumber(title) {
  if (!title) return Number.MAX_SAFE_INTEGER;
  const m = title.match(/Bài\s*(\d+)\s*:/i);
  if (m) return parseInt(m[1], 10);
  return Number.MAX_SAFE_INTEGER;
}

let changed = 0;
for (const subj of db) {
  // CS101 reorder
  if (subj.subject_id === 'CS101') {
    for (const form of subj.forms) {
      // target the Dễ form (by difficulty or name 'Cơ bản')
      if ((form.difficulty && form.difficulty === 'Dễ') || (form.name && form.name.toLowerCase().includes('cơ bản'))) {
        form.exercises.sort((a,b)=> extractNumber(a.title) - extractNumber(b.title));
        changed++;
      }
    }
  }
  // CS201 rename and reorder
  if (subj.subject_id === 'CS201') {
    for (const form of subj.forms) {
      if (form.difficulty === 'Khó' || (form.name && form.name.toLowerCase().includes('khó')) || (form.name && form.name.toLowerCase().includes('nâng cao'))) {
        for (const ex of form.exercises) {
          if (/^Bài\s*mới\s*Khó\s*1/i.test(ex.title) || /^Bài mới Khó 1/i.test(ex.title)) {
            ex.title = ex.title.replace(/^Bài\s*mới\s*Khó\s*1.*$/i, 'Bài 9: Tối ưu hóa thuật toán tìm kiếm trên đồ thị');
            changed++;
          }
          if (/^Bài\s*mới\s*Khó\s*2/i.test(ex.title) || /^Bài mới Khó 2/i.test(ex.title)) {
            ex.title = ex.title.replace(/^Bài\s*mới\s*Khó\s*2.*$/i, 'Bài 10: Thiết kế và phân tích thuật toán chia để trị nâng cao');
            changed++;
          }
        }
        // then reorder by number
        form.exercises.sort((a,b)=> extractNumber(a.title) - extractNumber(b.title));
      }
    }
  }
  // recalc counts
  let total = 0;
  for (const form of subj.forms) {
    form.exercise_count = Array.isArray(form.exercises)?form.exercises.length:0;
    total += form.exercise_count;
  }
  subj.total_exercises = total;
}

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2),'utf8');
console.log('Done. Changes made:', changed);
