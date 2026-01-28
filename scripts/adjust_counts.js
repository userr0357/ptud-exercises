const fs = require('fs');
const path = require('path');
const dbPath = path.join(__dirname, '..', 'db.json');
const backupsDir = path.join(__dirname, '..', 'backups');
if (!fs.existsSync(dbPath)) { console.error('db.json not found'); process.exit(1); }
if (!fs.existsSync(backupsDir)) fs.mkdirSync(backupsDir);
const timestamp = Date.now();
const backupPath = path.join(backupsDir, `db.backup.${timestamp}.json`);
const db = JSON.parse(fs.readFileSync(dbPath,'utf8'));
fs.writeFileSync(backupPath, JSON.stringify(db, null, 2));
console.log('Backup created:', backupPath);

// Remove 2 "Dễ" exercises from CS101
let removed = [];
for (const subj of db) {
  if (subj.subject_id === 'CS101') {
    for (const form of subj.forms) {
      if (form.difficulty === 'Dễ') {
        // remove up to 2 from end (or start)
        for (let i=0;i<2 && form.exercises.length>0;i++) {
          const ex = form.exercises.pop();
          removed.push({subject:subj.subject_id, id: ex.id, title: ex.title});
        }
        break;
      }
    }
  }
}

// Add 2 "Khó" exercises into CS201 (DSA)
let added = [];
const now = Date.now();
for (const subj of db) {
  if (subj.subject_id === 'CS201') {
    // find Khó form or create
    let target = subj.forms.find(f=>f.difficulty==='Khó');
    if (!target) {
      target = { form_id: 'f' + now, name: 'Nâng cao', difficulty: 'Khó', exercise_count:0, grading_criteria:[], exercises: [] };
      subj.forms.push(target);
    }
    const nextIndex = (target.exercises?target.exercises.length:0) + 1;
    const newEx1 = {
      id: `CS201-k-${now}-1`,
      title: `Bài mới Khó 1: Tối ưu hóa thuật toán tìm kiếm trên đồ thị`,
      difficulty: 'Khó',
      description: 'Các bài tập liên quan đến tối ưu hóa BFS/DFS, Dijkstra, A* trong đồ thị lớn.',
      requirements: ['Triển khai thuật toán', 'Phân tích độ phức tạp', 'Đưa ví dụ test'],
      attached_files: [],
      submission_format: '*.cpp hoặc *.py',
      example_input: '',
      example_output: '',
      grading_total: 20
    };
    const newEx2 = {
      id: `CS201-k-${now}-2`,
      title: `Bài mới Khó 2: Thiết kế và phân tích thuật toán chia để trị nâng cao`,
      difficulty: 'Khó',
      description: 'Bài tập về thiết kế thuật toán chia để trị, phân tích độ phức tạp và tối ưu bộ nhớ.',
      requirements: ['Triển khai thuật toán', 'Minh họa bằng test case', 'Phân tích phức tạp toán học'],
      attached_files: [],
      submission_format: '*.cpp hoặc *.py',
      example_input: '',
      example_output: '',
      grading_total: 20
    };
    target.exercises.push(newEx1, newEx2);
    added.push({subject:subj.subject_id, ids:[newEx1.id,newEx2.id]});
    break;
  }
}

// Recalculate counts
for (const subj of db) {
  let total = 0;
  for (const form of subj.forms) {
    form.exercise_count = Array.isArray(form.exercises)?form.exercises.length:0;
    total += form.exercise_count;
  }
  subj.total_exercises = total;
}

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2),'utf8');
console.log('Removed items:', removed);
console.log('Added items:', added);
console.log('Updated db.json written.');
