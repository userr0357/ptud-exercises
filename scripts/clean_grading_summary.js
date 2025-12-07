const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'db.json');

function readDB(){ return JSON.parse(fs.readFileSync(DB_PATH,'utf8')); }
function backupDB(db){ const p = DB_PATH + '.backup.' + Date.now() + '.json'; fs.writeFileSync(p, JSON.stringify(db,null,2),'utf8'); return p; }

function cleanSummary(s){
  if (!s) return s;
  // remove occurrences like "10p" or "3p" (number followed by optional whitespace and 'p')
  let out = s.replace(/\b\d+\s*p\b/gi, '');
  // remove multiple separators '|' left with extra spaces
  out = out.replace(/\s*\|\s*/g, ' | ');
  // collapse multiple spaces
  out = out.replace(/\s{2,}/g, ' ');
  // trim separators at ends
  out = out.replace(/^\s*\|\s*/,'').replace(/\s*\|\s*$/,'');
  return out.trim();
}

function main(){
  const db = readDB();
  const backup = backupDB(db);
  console.log('Backup created:', backup);
  let changed = 0;
  for (const subject of db){
    for (const form of (subject.forms||[])){
      for (const ex of (form.exercises||[])){
        if (ex.grading_summary && typeof ex.grading_summary === 'string'){
          const cleaned = cleanSummary(ex.grading_summary);
          if (cleaned !== ex.grading_summary){ ex.grading_summary = cleaned; changed++; }
        }
      }
    }
  }
  fs.writeFileSync(DB_PATH, JSON.stringify(db,null,2),'utf8');
  console.log('Clean complete. grading_summary updated for', changed, 'exercises');
}

if (require.main === module) main();
