const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'db.json');

function readDB() {
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
}

function validate() {
  const db = readDB();
  let subjects = 0;
  let forms = 0;
  let exercises = 0;
  const issues = [];

  for (const subject of db) {
    subjects++;
    if (!subject.subject_id) issues.push(`Subject missing subject_id: ${JSON.stringify(subject.subject_name).slice(0,80)}`);
    for (const form of (subject.forms||[])) {
      forms++;
      for (const ex of (form.exercises||[])) {
        exercises++;
        if (typeof ex.grading_total !== 'number') {
          issues.push(`Exercise ${ex.id} missing numeric grading_total`);
        }
        if (!Array.isArray(ex.grading_criteria)) {
          issues.push(`Exercise ${ex.id} grading_criteria is not array`);
        } else {
          // each item should have name and points
          let sum = 0;
          for (const item of ex.grading_criteria) {
            if (typeof item !== 'object' || !item.name || typeof item.points !== 'number') {
              issues.push(`Exercise ${ex.id} grading_criteria item malformed: ${JSON.stringify(item)}`);
            } else {
              sum += item.points;
            }
          }
          if (typeof ex.grading_total === 'number' && sum !== ex.grading_total) {
            issues.push(`Exercise ${ex.id} grading_total mismatch: sum=${sum} total=${ex.grading_total}`);
          }
        }
        // example fields
        if (!('example_input' in ex)) issues.push(`Exercise ${ex.id} missing example_input`);
        if (!('example_output' in ex)) issues.push(`Exercise ${ex.id} missing example_output`);
      }
    }
  }

  console.log('DB Validation Summary');
  console.log('Subjects:', subjects);
  console.log('Forms:', forms);
  console.log('Exercises:', exercises);
  console.log('Issues found:', issues.length);
  if (issues.length > 0) {
    console.log('\nSample issues (first 50):');
    console.log(issues.slice(0,50).join('\n'));
  } else {
    console.log('No issues detected.');
  }
  // print a few sample exercise grading entries
  console.log('\nSample exercise grading (first 5):');
  let shown = 0;
  outer: for (const subject of db) {
    for (const form of (subject.forms||[])) {
      for (const ex of (form.exercises||[])) {
        console.log(`${ex.id} — total: ${ex.grading_total} — criteria: ${ex.grading_criteria.map(c=>`${c.name}(${c.points})`).join(', ')}`);
        shown++;
        if (shown>=5) break outer;
      }
    }
  }

  if (issues.length>0) process.exitCode = 2;
}

if (require.main === module) validate();
