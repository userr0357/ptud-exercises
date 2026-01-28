const fs = require('fs');
const db = JSON.parse(fs.readFileSync('db.json','utf8'));
for (const s of db) {
  const formsTotal = (s.forms||[]).reduce((a,f)=>a+(f.exercises?f.exercises.length:0),0);
  console.log(s.subject_id + ' | ' + s.subject_name + ' | total_exercises: ' + s.total_exercises + ' | sum(forms.exercises): ' + formsTotal);
}
