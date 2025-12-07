const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'db.json');

function readDB(){ return JSON.parse(fs.readFileSync(DB_PATH,'utf8')); }
function backupDB(db){ const p = DB_PATH + '.backup.' + Date.now() + '.json'; fs.writeFileSync(p, JSON.stringify(db,null,2),'utf8'); return p; }

function inferFromTitle(title){
  if (!title) return null;
  const m = title.match(/\[(.*?)\]/);
  if (!m) return null;
  const s = m[1].toLowerCase();
  if (s.includes('dễ') || s.includes('de')) return 'Dễ';
  if (s.includes('khó') || s.includes('kho')) return 'Khó';
  if (s.includes('trung')) return 'Trung bình';
  return null;
}

function normalizeLabel(raw){
  if (!raw) return null;
  const s = String(raw).toLowerCase();
  if (s.includes('dễ') || s.includes('de')) return 'Dễ';
  if (s.includes('khó') || s.includes('kho')) return 'Khó';
  if (s.includes('trung')) return 'Trung bình';
  return null;
}

function main(){
  const db = readDB();
  const backupPath = backupDB(db);
  console.log('Backup created:', backupPath);
  let changed = 0;
  for (const subject of db){
    for (const form of (subject.forms||[])){
      // normalize form.difficulty if possible
      const normalizedForm = normalizeLabel(form.difficulty) || form.difficulty;
      form.difficulty = normalizedForm || form.difficulty;
      for (const ex of (form.exercises||[])){
        const fromTitle = inferFromTitle(ex.title);
        const fromEx = normalizeLabel(ex.difficulty);
        const target = fromTitle || fromEx || form.difficulty || '';
        if (target && ex.difficulty !== target){
          ex.difficulty = target;
          changed++;
        }
      }
      // recalc exercise_count
      form.exercise_count = (form.exercises || []).length;
    }
    subject.total_exercises = subject.forms.reduce((s,f)=> s + (f.exercise_count|| (f.exercises||[]).length), 0);
  }
  fs.writeFileSync(DB_PATH, JSON.stringify(db,null,2),'utf8');
  console.log('Normalization complete. Exercises updated:', changed);
}

if (require.main === module) main();
