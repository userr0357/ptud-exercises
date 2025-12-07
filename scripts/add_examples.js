const fs = require('fs');
const path = require('path');
const dbPath = path.join(__dirname, '..', 'db.json');
let raw = fs.readFileSync(dbPath, 'utf8');
let data = JSON.parse(raw);
let count = 0;
for (const subj of data) {
  for (const form of subj.forms || []) {
    for (const ex of form.exercises || []) {
      if (!('example_input' in ex)) { ex.example_input = ''; }
      if (!('example_output' in ex)) { ex.example_output = ''; }
      count++;
    }
  }
}
fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
console.log(`Updated ${count} exercises with example_input/example_output fields.`);
