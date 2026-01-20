const fs = require('fs');
const path = require('path');
const mssql = require('mssql');
require('dotenv').config();

const DB_DIR = path.join(__dirname, '..', 'DB');
const OUT_SQL = path.join(__dirname, '..', 'sql', 'generated_inserts.sql');

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER, // e.g. 'localhost\\SQLEXPRESS' or '127.0.0.1'
  database: process.env.DB_DATABASE,
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: process.env.DB_TRUST === 'true' // for local dev
  }
};

async function listFiles() {
  return fs.readdirSync(DB_DIR).filter(f => f.endsWith('.txt'));
}

function parseExercisesFromText(content, subjectFromFile) {
  const lines = content.split(/\r?\n/);
  const exercises = [];

  let currentType = null; // DẠNG X: ...
  let currentPart = null; // PHẦN x
  let current = null;

  const pushCurrent = () => {
    if (current) {
      // trim fields
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
    if (mBai) {
      // new exercise
      pushCurrent();
      current = { title: mBai[2].trim(), type: currentType, part: currentPart, difficulty: null, requirements: '', description: '', grading: '' };
      continue;
    }
    if (!current) continue;

    if (mDoKho) { current.difficulty = mDoKho[1].trim(); continue; }
    if (mYeuCau) { current.requirements = mYeuCau[1].trim(); continue; }
    if (mMoTa) { current.description = mMoTa[1].trim(); continue; }
    if (mTieuChi) {
      // read following numbered lines as criteria until blank or next section
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

    // fallback: append to description if lines start with '-' or text
    if (l.startsWith('-') || l) {
      if (!current.description) current.description = l.replace(/^-\s*/,'');
      else current.description += ' ' + l.replace(/^-\s*/,'');
    }
  }
  pushCurrent();
  return exercises;
}

async function getTableColumns(pool, table) {
  const res = await pool.request()
    .input('table', mssql.NVarChar, table)
    .query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = @table");
  return res.recordset.map(r => r.COLUMN_NAME);
}

function findColumn(columns, candidates) {
  const lower = columns.map(c => c.toLowerCase());
  for (const cand of candidates) {
    const idx = lower.indexOf(cand.toLowerCase());
    if (idx !== -1) return columns[idx];
  }
  return null;
}

async function upsertLookup(pool, table, displayValue) {
  // find a name-like column
  const cols = await getTableColumns(pool, table);
  const nameCol = findColumn(cols, ['name', 'title', 'display_name', 'subject_name', 'TypeName', 'typename', 'code']) || cols[1] || cols[0];
  const idCol = findColumn(cols, ['id', `${table.toLowerCase().replace(/s$/,'')}id`]) || cols[0];

  // try find existing
  const qFind = `SELECT ${idCol} as id FROM ${table} WHERE ${nameCol} = @val`;
  const found = await pool.request().input('val', mssql.NVarChar, displayValue).query(qFind);
  if (found.recordset.length) return found.recordset[0].id;

  // insert
  const qIns = `INSERT INTO ${table} (${nameCol}) OUTPUT inserted.${idCol} VALUES (@val)`;
  const ins = await pool.request().input('val', mssql.NVarChar, displayValue).query(qIns);
  return ins.recordset[0][idCol];
}

async function main() {
  console.log('Migrate: starting');
  if (!process.env.DB_USER) {
    console.error('Missing DB config in environment. See .env.example');
    process.exit(1);
  }

  const files = await listFiles();
  const allExercises = [];
  for (const f of files) {
    const content = fs.readFileSync(path.join(DB_DIR, f), 'utf8');
    const subject = path.basename(f, path.extname(f));
    const exs = parseExercisesFromText(content, subject);
    allExercises.push(...exs);
  }

  // ensure output dir
  fs.mkdirSync(path.dirname(OUT_SQL), { recursive: true });
  fs.writeFileSync(OUT_SQL, '-- Generated INSERTs fallback\n\n');

  const pool = await mssql.connect(dbConfig);
  console.log('Connected to SQL Server');

  // prepare table column detections
  const subjectsCols = await getTableColumns(pool, 'Subjects').catch(() => []);
  const typesCols = await getTableColumns(pool, 'ExerciseTypes').catch(() => []);
  const diffCols = await getTableColumns(pool, 'DifficultyLevels').catch(() => []);
  const exCols = await getTableColumns(pool, 'Exercises').catch(() => []);

  if (!exCols.length) {
    console.warn('Warning: table `Exercises` not found or has no columns. Will write SQL inserts to file instead.');
  }

  // find candidate columns
  const exTitle = findColumn(exCols, ['title', 'name', 'exercise_title']);
  const exDesc = findColumn(exCols, ['description', 'content', 'details', 'body']);
  const exReq = findColumn(exCols, ['requirements', 'requirement', 'instructions']);
  const exGrade = findColumn(exCols, ['grading_criteria', 'grading', 'criteria']);
  const exSubjectFK = findColumn(exCols, exCols.filter(c => /subject/i.test(c)));
  const exTypeFK = findColumn(exCols, exCols.filter(c => /type/i.test(c)));
  const exDiffFK = findColumn(exCols, exCols.filter(c => /difficulty/i.test(c)));

  const summary = { inserted: 0, failed: 0 };

  // caches for lookup ids
  const subjectCache = {};
  const typeCache = {};
  const diffCache = {};

  for (const ex of allExercises) {
    try {
      // upsert lookups
      if (!subjectCache[ex.subject]) subjectCache[ex.subject] = await upsertLookup(pool, 'Subjects', ex.subject);
      if (!typeCache[ex.type]) typeCache[ex.type] = await upsertLookup(pool, 'ExerciseTypes', ex.type || 'Unknown');
      if (!diffCache[ex.difficulty]) diffCache[ex.difficulty] = await upsertLookup(pool, 'DifficultyLevels', ex.difficulty || 'Unknown');

      // build insert for Exercises
      if (!exCols.length) {
        // write fallback SQL
        const sql = `-- ${ex.subject} | ${ex.type} | ${ex.title}\nINSERT INTO Exercises (Title, Description) VALUES (${escapeSql(ex.title)}, ${escapeSql(ex.description)});\n\n`;
        fs.appendFileSync(OUT_SQL, sql);
        summary.failed++;
        continue;
      }

      const fields = [];
      const params = [];
      const req = pool.request();
      let paramIndex = 0;

      if (exTitle) { fields.push(exTitle); req.input('p' + paramIndex, mssql.NVarChar, ex.title); params.push('@p' + paramIndex); paramIndex++; }
      if (exDesc) { fields.push(exDesc); req.input('p' + paramIndex, mssql.NVarChar, ex.description); params.push('@p' + paramIndex); paramIndex++; }
      if (exReq) { fields.push(exReq); req.input('p' + paramIndex, mssql.NVarChar, ex.requirements); params.push('@p' + paramIndex); paramIndex++; }
      if (exGrade) { fields.push(exGrade); req.input('p' + paramIndex, mssql.NVarChar, ex.grading); params.push('@p' + paramIndex); paramIndex++; }
      if (exSubjectFK) { fields.push(exSubjectFK); req.input('p' + paramIndex, mssql.Int, subjectCache[ex.subject]); params.push('@p' + paramIndex); paramIndex++; }
      if (exTypeFK) { fields.push(exTypeFK); req.input('p' + paramIndex, mssql.Int, typeCache[ex.type]); params.push('@p' + paramIndex); paramIndex++; }
      if (exDiffFK) { fields.push(exDiffFK); req.input('p' + paramIndex, mssql.Int, diffCache[ex.difficulty]); params.push('@p' + paramIndex); paramIndex++; }

      if (!fields.length) {
        // nothing to insert
        const sql = `-- Skip (no mappable columns): ${ex.title}\n`;
        fs.appendFileSync(OUT_SQL, sql);
        summary.failed++;
        continue;
      }

      const q = `INSERT INTO Exercises (${fields.join(',')}) VALUES (${params.join(',')})`;
      // attach params to request (we already attached above)
      await req.query(q);
      summary.inserted++;
    } catch (err) {
      console.error('Insert failed for', ex.title, err.message);
      const sql = `-- FAILED for ${ex.subject} | ${ex.type} | ${ex.title} -- ${err.message}\n`;
      fs.appendFileSync(OUT_SQL, sql);
      summary.failed++;
    }
  }

  console.log('Done. Summary:', summary);
  console.log('Fallback SQL written to', OUT_SQL);
  await pool.close();
}

function escapeSql(s) {
  if (s == null) return 'NULL';
  return "'" + s.replace(/'/g, "''") + "'";
}

main().catch(err => { console.error(err); process.exit(1); });
