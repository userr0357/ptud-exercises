const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'db.json');
const OUT_PATH = path.join(__dirname, 'migrate_inserts.sql');

function esc(s){
  if (s === null || s === undefined) return '';
  return (''+s).replace(/'/g, "''");
}

function toJsonLiteral(o){
  return "N'" + esc(JSON.stringify(o)) + "'";
}

const db = JSON.parse(fs.readFileSync(DB_PATH,'utf8'));

const lines = [];
lines.push("-- INSERT-only migration generated from db.json");
lines.push("-- This file WILL NOT drop or create tables; ensure schema exists before importing.");
lines.push(`USE [PTUD];`);
lines.push('GO\n');

for(const subject of db){
  const sid = esc(subject.subject_id || '');
  const sname = esc(subject.subject_name || '');
  const sdesc = esc(subject.description || '');
  const stotal = Number(subject.total_exercises || 0);
  lines.push(`INSERT INTO dbo.Subjects (subject_id, subject_name, description, total_exercises) VALUES (N'${sid}', N'${sname}', N'${sdesc}', ${stotal});`);

  for(const form of (subject.forms||[])){
    const fid = esc(form.form_id || '');
    const fname = esc(form.name || '');
    const fdiff = esc(form.difficulty || '');
    const fcount = Number(form.exercise_count || (form.exercises ? form.exercises.length : 0));
    lines.push(`INSERT INTO dbo.Forms (form_id, subject_id, name, difficulty, exercise_count) VALUES (N'${fid}', N'${sid}', N'${fname}', N'${fdiff}', ${fcount});`);

    for(const ex of (form.exercises||[])){
      const id = esc(ex.id || `${sid}-${fid}-${Math.random().toString(36).slice(2,8)}`);
      const title = esc(ex.title || '');
      const difficulty = esc(ex.difficulty || '');
      const description = esc(ex.description || '');
      const requirements = toJsonLiteral(Array.isArray(ex.requirements) ? ex.requirements : (ex.requirements || ''));
      const grading_criteria = toJsonLiteral(ex.grading_criteria || []);
      const attached_files = toJsonLiteral(ex.attached_files || []);
      const submission_format = esc(ex.submission_format || '');
      const example_input = esc(ex.example_input || '');
      const example_output = esc(ex.example_output || '');
      const grading_total = Number(ex.grading_total || 0);
      const grading_summary = esc(ex.grading_summary || '');

      lines.push(`INSERT INTO dbo.Exercises (id, subject_id, form_id, title, difficulty, description, requirements, grading_criteria, attached_files, submission_format, example_input, example_output, grading_total, grading_summary) VALUES (N'${id}', N'${sid}', N'${fid}', N'${title}', N'${difficulty}', N'${description}', ${requirements}, ${grading_criteria}, ${attached_files}, N'${submission_format}', N'${example_input}', N'${example_output}', ${grading_total}, N'${grading_summary}');`);
    }
  }
}

lines.push('\nPRINT N"Insert-only migration generated.";');

fs.writeFileSync(OUT_PATH, lines.join('\n'), 'utf8');
console.log('Wrote', OUT_PATH);
