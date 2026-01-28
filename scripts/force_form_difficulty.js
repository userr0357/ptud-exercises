const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'db.json');

function readDB(){ return JSON.parse(fs.readFileSync(DB_PATH,'utf8')); }
function backupDB(db){ const p = DB_PATH + '.backup.' + Date.now() + '.json'; fs.writeFileSync(p, JSON.stringify(db,null,2),'utf8'); return p; }

function main(){
  const db = readDB();
  const backup = backupDB(db);
  console.log('Backup created:', backup);
  let changed = 0;
  for (const subject of db){
    for (const form of (subject.forms||[])){
      const formDiff = form.difficulty || '';
      for (const ex of (form.exercises||[])){
        if (ex.difficulty !== formDiff){
          ex.difficulty = formDiff;
          changed++;
        }
      }
      form.exercise_count = (form.exercises||[]).length;
    }
    subject.total_exercises = subject.forms.reduce((s,f)=> s + (f.exercise_count||0), 0);
  }
  fs.writeFileSync(DB_PATH, JSON.stringify(db,null,2),'utf8');
  console.log('Done. Exercises updated:', changed);
}

if (require.main === module) main();
