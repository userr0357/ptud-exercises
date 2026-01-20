const fs = require('fs');
const path = require('path');

const DB_DIR = path.join(__dirname, '..', 'DB');
const OUT_SQL = path.join(__dirname, '..', 'sql', 'generated_inserts.sql');

function listFiles() {
  return fs.readdirSync(DB_DIR).filter(f => f.endsWith('.txt'));
}

function parseExercisesFromText(content, subjectFromFile) {
  const lines = content.split(/\r?\n/);
  const exercises = [];

  let currentType = null;
  let currentPart = null;
  let current = null;

  const pushCurrent = () => {
    if (current) {
      Object.keys(current).forEach(k => { if (typeof current[k] === 'string') current[k] = current[k].trim(); });
      current.subject = subjectFromFile;
      exercises.push(current);
    }
    current = null;
  };

  for (let i = 0; i < lines.length; i++) {
    const l = lines[i].trim();
    const mDang = l.match(/^DẠNG\s*\d+\s*:\s*(.*)$/i);
    const mPhan = l.match(/^PHẦN\s*\d+\s*:\s*(.*)$/i);
    const mBai = l.match(/^Bài\s*(\d+)\s*:\s*(.*)$/i);
    const mDoKho = l.match(/^-\s*Độ khó\s*:\s*(.*)$/i);
    const mYeuCau = l.match(/^-\s*Yêu cầu\s*:\s*(.*)$/i);
    const mMoTa = l.match(/^-\s*Mô tả\s*:\s*(.*)$/i);
    const mTieuChi = l.match(/^-\s*Tiêu chí chấm điểm\s*:/i);

    if (mDang) { currentType = mDang[1].trim(); continue; }
    if (mPhan) { currentPart = mPhan[1].trim(); continue; }
    if (mBai) { pushCurrent(); current = { title: mBai[2].trim(), type: currentType, part: currentPart, difficulty: null, requirements: '', description: '', grading: '' }; continue; }
    if (!current) continue;
    if (mDoKho) { current.difficulty = mDoKho[1].trim(); continue; }
    if (mYeuCau) { current.requirements = mYeuCau[1].trim(); continue; }
    if (mMoTa) { current.description = mMoTa[1].trim(); continue; }
    if (mTieuChi) {
      let j = i + 1; let criteriaLines = [];
      while (j < lines.length) {
        const ln = lines[j].trim();
        if (!ln) { j++; continue; }
        if (/^(Bài\s*\d+\s*:)|(^DẠNG\s*\d+\s*:)|(^PHẦN\s*\d+\s*:)/i.test(ln)) break;
        criteriaLines.push(ln.replace(/^\d+\.?\s*/, ''));
        j++;
      }
      current.grading = criteriaLines.join(' | ');
      i = j - 1;
      continue;
    }
    if (l.startsWith('-') || l) {
      if (!current.description) current.description = l.replace(/^-\s*/,'');
      else current.description += ' ' + l.replace(/^-\s*/,'');
    }
  }
  pushCurrent();
  return exercises;
}

function escape(s) {
  if (s == null) return 'NULL';
  return "N'" + s.replace(/'/g, "''") + "'";
}

function buildSQL(exercises) {
  const subjects = new Set();
  const types = new Set();
  const diffs = new Set();

  for (const ex of exercises) {
    subjects.add(ex.subject || 'Unknown');
    types.add(ex.type || 'Unknown');
    diffs.add(ex.difficulty || 'Unknown');
  }

  let sql = "-- Generated SQL inserts. Review before running in SSMS.\nSET NOCOUNT ON;\n\n";

  // lookup inserts
  sql += "-- Subjects\n";
  for (const s of subjects) {
    sql += `IF NOT EXISTS (SELECT 1 FROM dbo.Subjects WHERE Name = ${escape(s)})\n    INSERT INTO dbo.Subjects (Name) VALUES (${escape(s)});\n`;
  }
  sql += '\n-- ExerciseTypes\n';
  for (const t of types) {
    sql += `IF NOT EXISTS (SELECT 1 FROM dbo.ExerciseTypes WHERE Name = ${escape(t)})\n    INSERT INTO dbo.ExerciseTypes (Name) VALUES (${escape(t)});\n`;
  }
  sql += '\n-- DifficultyLevels\n';
  for (const d of diffs) {
    sql += `IF NOT EXISTS (SELECT 1 FROM dbo.DifficultyLevels WHERE Name = ${escape(d)})\n    INSERT INTO dbo.DifficultyLevels (Name) VALUES (${escape(d)});\n`;
  }

  sql += '\n-- Exercises\n';
  for (const ex of exercises) {
    const subj = ex.subject || 'Unknown';
    const type = ex.type || 'Unknown';
    const diff = ex.difficulty || 'Unknown';
    const title = ex.title || '';
    const desc = ex.description || '';
    const req = ex.requirements || '';
    const grade = ex.grading || '';

    sql += `INSERT INTO dbo.Exercises (SubjectId, ExerciseTypeId, DifficultyLevelId, Title, Description, Requirements, GradingCriteria)\nVALUES (\n  (SELECT TOP 1 Id FROM dbo.Subjects WHERE Name = ${escape(subj)}),\n  (SELECT TOP 1 Id FROM dbo.ExerciseTypes WHERE Name = ${escape(type)}),\n  (SELECT TOP 1 Id FROM dbo.DifficultyLevels WHERE Name = ${escape(diff)}),\n  ${escape(title)}, ${escape(desc)}, ${escape(req)}, ${escape(grade)}\n);\n\n`;
  }

  return sql;
}

function main() {
  const files = listFiles();
  const all = [];
  for (const f of files) {
    const content = fs.readFileSync(path.join(DB_DIR, f), 'utf8');
    const subject = path.basename(f, path.extname(f));
    const exs = parseExercisesFromText(content, subject);
    all.push(...exs);
  }

  const sql = buildSQL(all);
  fs.mkdirSync(path.dirname(OUT_SQL), { recursive: true });
  fs.writeFileSync(OUT_SQL, sql, 'utf8');
  console.log('Wrote', OUT_SQL, 'with', all.length, 'exercises');
}

main();
