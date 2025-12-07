const fs = require('fs');
const path = require('path');
const DB_PATH = path.join(__dirname,'..','db.json');
const db = JSON.parse(fs.readFileSync(DB_PATH,'utf8'));
for (const subject of db){
  console.log(`Subject ${subject.subject_id} - ${subject.subject_name}`);
  for (const form of (subject.forms||[])){
    const counts = {};
    for (const ex of (form.exercises||[])){
      const d = ex.difficulty || '(empty)';
      counts[d] = (counts[d]||0) + 1;
    }
    console.log(`  Form ${form.form_id} ${form.name} (${form.difficulty}) -> ${JSON.stringify(counts)}`);
  }
}
