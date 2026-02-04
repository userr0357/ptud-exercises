const fs = require('fs');
const path = require('path');
const dbPath = path.join(__dirname, '..', 'db.json');
const backupPath = path.join(__dirname, '..', 'backups', `db.backup.${Date.now()}.json`);

if (!fs.existsSync(dbPath)) {
  console.error('db.json not found');
  process.exit(1);
}

const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

// ensure backups dir
const backupsDir = path.join(__dirname, '..', 'backups');
if (!fs.existsSync(backupsDir)) fs.mkdirSync(backupsDir);
fs.writeFileSync(backupPath, JSON.stringify(db, null, 2), 'utf8');
console.log('Backup created at', backupPath);

function normalizeLabel(lbl) {
  if (!lbl) return null;
  lbl = lbl.trim();
  if (lbl === 'Khó' || lbl.toLowerCase() === 'kho') return 'Khó';
  if (lbl === 'Dễ' || lbl.toLowerCase() === 'de') return 'Dễ';
  if (lbl === 'Trung bình' || lbl.toLowerCase() === 'trung bình') return 'Trung bình';
  return lbl;
}

let movedCount = 0;
let fixedTitleCount = 0;

for (const subject of db) {
  // build map difficulty -> form
  const formMap = {};
  for (const form of subject.forms) {
    formMap[form.difficulty] = form;
  }

  // collect exercises to relocate
  const toAdd = {};
  for (const form of subject.forms) {
    const newExercises = [];
    for (const ex of form.exercises) {
      const m = ex.title && ex.title.match(/^\s*\[([^\]]+)\]\s*(.*)$/);
      if (m) {
        const rawLabel = m[1];
        const restTitle = m[2];
        const label = normalizeLabel(rawLabel);
        if (label) {
          // update difficulty
          if (ex.difficulty !== label) {
            ex.difficulty = label;
          }
          // fix title
          if (ex.title !== restTitle) {
            ex.title = restTitle;
            fixedTitleCount++;
          }
          // move to matching form
          if (formMap[label] && formMap[label] !== form) {
            if (!toAdd[label]) toAdd[label] = [];
            toAdd[label].push(ex);
            movedCount++;
            continue; // skip adding to newExercises (so it will be removed from current form)
          }
        }
      }
      newExercises.push(ex);
    }
    form.exercises = newExercises;
  }

  // add relocated exercises
  for (const label of Object.keys(toAdd)) {
    const targetForm = formMap[label];
    if (targetForm) {
      targetForm.exercises = targetForm.exercises.concat(toAdd[label]);
    } else {
      // create new form for this difficulty
      const newForm = {
        form_id: String(Date.now()) + Math.random().toString(36).slice(2,6),
        name: label,
        difficulty: label,
        exercise_count: toAdd[label].length,
        grading_criteria: [],
        exercises: toAdd[label]
      };
      subject.forms.push(newForm);
      formMap[label] = newForm;
    }
  }

  // update counts
  let total = 0;
  for (const form of subject.forms) {
    form.exercise_count = Array.isArray(form.exercises) ? form.exercises.length : 0;
    total += form.exercise_count;
  }
  subject.total_exercises = total;
}

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
console.log('Fix complete. Titles fixed:', fixedTitleCount, 'Moved:', movedCount);
console.log('Wrote updated db.json');
