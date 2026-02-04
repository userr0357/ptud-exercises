const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const multer = require('multer');
const ExcelJS = require('exceljs');
const jwt = require('jsonwebtoken');
const sql = require('mssql');

const JWT_SECRET = process.env.JWT_SECRET || 'change-me-to-secure-secret';

// ==================================================
//  FILE PATHS + AUTO CREATE IF NOT EXIST
// ==================================================
const DB_PATH = path.join(__dirname, 'db.json');
const LECTURERS_PATH = path.join(__dirname, 'lecturers.json');
const UPLOAD_DIR = path.join(__dirname, 'uploads');
const BACKUP_DIR = path.join(__dirname, 'backups');

// create needed files/folders
if (!fs.existsSync(DB_PATH)) fs.writeFileSync(DB_PATH, '[]', 'utf8');
if (!fs.existsSync(LECTURERS_PATH)) fs.writeFileSync(LECTURERS_PATH, '[]', 'utf8');

if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);
if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR);

const upload = multer({ dest: UPLOAD_DIR });

const app = express();

// ==================================================
//  CORS CONFIG
// ==================================================
const FRONTEND_URL = process.env.FRONTEND_URL || '';

if (FRONTEND_URL) {
  app.use(cors({ origin: FRONTEND_URL, credentials: true }));
} else {
  app.use(cors());
}

app.use(express.json());

// ==================================================
//  PROTECT LECTURER STATIC FILES
// ==================================================
app.use((req, res, next) => {
  const protectedPaths = ['/lecturer.html', '/lecturer-new.html', '/lecturer-app.js', '/lecturer-new.js', '/lecturer-app.bundle.js'];

  try {
    const p = req.path;

    if (protectedPaths.includes(p) || p.startsWith('/lecturer/')) {
      let token = null;

      const authHeader = req.headers.authorization || '';
      if (authHeader.startsWith('Bearer ')) token = authHeader.split(' ')[1];

      if (!token) {
        const cookieHeader = req.headers.cookie || '';
        const m = cookieHeader.match(/(?:^|; )token=([^;]+)/);
        if (m) token = decodeURIComponent(m[1]);
      }

      if (!token) {
        if ((req.headers.accept || '').includes('text/html')) return res.redirect('/login');
        return res.status(401).json({ error: 'Authentication required' });
      }

      try {
        jwt.verify(token, JWT_SECRET);
        return next();
      } catch (err) {
        if ((req.headers.accept || '').includes('text/html')) return res.redirect('/login');
        return res.status(401).json({ error: 'Invalid token' });
      }
    }
  } catch (err) {}

  next();
});

// serve static files
app.use(express.static(path.join(__dirname, 'public')));

// ==================================================
//  DB HELPERS
// ==================================================
function readDB() {
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
}

function writeDB(data) {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(BACKUP_DIR, `db.${timestamp}.json`);
    if (fs.existsSync(DB_PATH)) fs.copyFileSync(DB_PATH, backupPath);
  } catch (err) {
    console.warn('Backup failed:', err.message);
  }

  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
}

function readLecturers() {
  return JSON.parse(fs.readFileSync(LECTURERS_PATH, 'utf8'));
}

// difficulty rules
const diffOrder = { 'Dễ': 0, 'Trung bình': 1, 'Khó': 2, 'De': 0, 'Trung binh': 1, 'KHo': 2 };

// =========================
// External MSSQL config
// =========================
const sqlConfig = {
  user: process.env.DB_USER || 'userPersonalizedSystem',
  password: process.env.DB_PASS || '123456789',
  server: process.env.DB_HOST || '118.69.126.49',
  database: process.env.DB_NAME || 'Data_PersonalizedSystem',
  options: {
    encrypt: false,
    enableArithAbort: true
  }
};

async function queryExternalExercises(prefix) {
  if (!process.env.USE_EXTERNAL_DB) {
    return [];
  }
  
  try {
    const pool = await sql.connect(sqlConfig);
    try {
      const req = pool.request();
      // Query BAITAP with optional joins to lookup labels
      // Map results to a normalized shape used by frontend
      let q = `SELECT b.Id, b.MaBaiTap, b.TenBaiTap, b.MaDoKho, d.TenDoKho AS DoKho, b.MaDangBai, b.MaDinhDang, dn.TenDinhDang AS DinhDang, b.MoTa, b.YeuCau, b.TieuChiChamDiem, b.MaMon
                 FROM dbo.BAITAP b
                 LEFT JOIN dbo.DOKHO d ON b.MaDoKho = d.MaDoKho
                 LEFT JOIN dbo.DINHDANG_NOPBAI dn ON b.MaDinhDang = dn.MaDinhDang`;

      if (prefix) {
        req.input('prefix', sql.NVarChar, prefix + '%');
        q += ' WHERE b.MaBaiTap LIKE @prefix';
      }
      q += ' ORDER BY b.Id';

      const r = await req.query(q);
      // normalize
      return r.recordset.map(row => {
        // parse tieu chi if it's JSON-like
        let grading = row.TieuChiChamDiem;
        try {
          if (grading && typeof grading === 'string') {
            grading = JSON.parse(grading);
          }
        } catch (e) {
          // leave as-is
        }

        // if MaMon is empty, extract from MaBaiTap prefix (e.g. NMLT_D1_01 -> NMLT)
        let subjectCode = row.MaMon;
        if (!subjectCode || subjectCode.trim() === '') {
          const match = (row.MaBaiTap || '').match(/^([A-Z]+)/);
          subjectCode = match ? match[1] : 'EXTERNAL';
      }

      // normalize requirements to array
      const reqs = Array.isArray(row.YeuCau) ? row.YeuCau : (row.YeuCau ? [row.YeuCau] : []);
      // grading may be stored as JSON object { tieu_chi: [...] } or as an array/string
      let gradingCriteria = [];
      if (grading) {
        if (Array.isArray(grading)) gradingCriteria = grading;
        else if (grading.tieu_chi && Array.isArray(grading.tieu_chi)) gradingCriteria = grading.tieu_chi;
        else if (grading.tieu_chi) gradingCriteria = [grading.tieu_chi];
        else if (typeof grading === 'string') {
          try {
            const parsed = JSON.parse(grading);
            if (Array.isArray(parsed)) gradingCriteria = parsed;
            else if (parsed && parsed.tieu_chi && Array.isArray(parsed.tieu_chi)) gradingCriteria = parsed.tieu_chi;
            else if (parsed && parsed.tieu_chi) gradingCriteria = [parsed.tieu_chi];
          } catch (e) {
            gradingCriteria = [grading];
          }
        }
      }

      return {
        id: row.MaBaiTap || String(row.Id),
        title: row.TenBaiTap,
        difficulty: row.DoKho || row.MaDoKho,
        description: row.MoTa,
        requirements: reqs,
        grading_criteria: gradingCriteria,
        submission_format: row.DinhDang || row.MaDinhDang,
        subject_code: subjectCode
      };
    });
  } finally {
    // pool is reused by mssql
  }
}

// SQL write helpers (INSERT/UPDATE/DELETE BAITAP)
async function insertExerciseToSQL(exercise, subjectCode) {
  try {
    const pool = await sql.connect(sqlConfig);
    try {
      const req = pool.request();
      req.input('MaBaiTap', sql.NVarChar, exercise.id);
      req.input('TenBaiTap', sql.NVarChar, exercise.title || '');
      req.input('MaMon', sql.NVarChar, subjectCode || '');
      req.input('MoTa', sql.NVarChar, exercise.description || '');
      req.input('YeuCau', sql.NVarChar, Array.isArray(exercise.requirements) ? exercise.requirements.join('\n') : '');
      req.input('TieuChiChamDiem', sql.NVarChar, JSON.stringify(exercise.grading_criteria || []));
      req.input('MaDinhDang', sql.NVarChar, exercise.submission_format || '');
      req.input('MaDoKho', sql.NVarChar, exercise.difficulty || 'Dễ');
      
      const q = `INSERT INTO dbo.BAITAP (MaBaiTap, TenBaiTap, MaMon, MoTa, YeuCau, TieuChiChamDiem, MaDinhDang, MaDoKho)
                 VALUES (@MaBaiTap, @TenBaiTap, @MaMon, @MoTa, @YeuCau, @TieuChiChamDiem, @MaDinhDang, @MaDoKho)`;
      await req.query(q);
      return true;
    } finally {
      await sql.close();
    }
  } catch (err) {
    console.error('SQL INSERT failed:', err.message);
    return false;
  }
}

async function updateExerciseInSQL(exercise, subjectCode) {
  const pool = await sql.connect(sqlConfig);
  try {
    const req = pool.request();
    req.input('MaBaiTap', sql.NVarChar, exercise.id);
    req.input('TenBaiTap', sql.NVarChar, exercise.title || '');
    req.input('MaMon', sql.NVarChar, subjectCode || '');
    req.input('MoTa', sql.NVarChar, exercise.description || '');
    req.input('YeuCau', sql.NVarChar, Array.isArray(exercise.requirements) ? exercise.requirements.join('\n') : '');
    req.input('TieuChiChamDiem', sql.NVarChar, JSON.stringify(exercise.grading_criteria || []));
    req.input('MaDinhDang', sql.NVarChar, exercise.submission_format || '');
    req.input('MaDoKho', sql.NVarChar, exercise.difficulty || 'Dễ');
    
    const q = `UPDATE dbo.BAITAP SET TenBaiTap=@TenBaiTap, MaMon=@MaMon, MoTa=@MoTa, YeuCau=@YeuCau, TieuChiChamDiem=@TieuChiChamDiem, MaDinhDang=@MaDinhDang, MaDoKho=@MaDoKho
               WHERE MaBaiTap=@MaBaiTap`;
    await req.query(q);
    return true;
  } catch (err) {
    console.error('SQL UPDATE failed:', err.message);
    return false;
  }
}

async function deleteExerciseFromSQL(exerciseId) {
  const pool = await sql.connect(sqlConfig);
  try {
    const req = pool.request();
    req.input('MaBaiTap', sql.NVarChar, exerciseId);
    const q = `DELETE FROM dbo.BAITAP WHERE MaBaiTap=@MaBaiTap`;
    await req.query(q);
    return true;
  } catch (err) {
    console.error('SQL DELETE failed:', err.message);
    return false;
  }
}

// ==================================================
//  ROUTES
// ==================================================
async function buildSubjectsFromExternal(prefix) {
  const rows = await queryExternalExercises(prefix);
  const subjects = {};

  for (const r of rows) {
    const subjId = r.subject_code || 'EXTERNAL';
    if (!subjects[subjId]) {
      subjects[subjId] = { subject_id: subjId, subject_name: subjId, description: '', total_exercises: 0, forms: [] };
    }

    const subject = subjects[subjId];

    const formId = r.submission_format || 'default';
    let form = subject.forms.find(f => f.form_id === formId);
    if (!form) {
      form = { form_id: formId, name: formId, difficulty: r.difficulty || '', exercise_count: 0, grading_criteria: [], exercises: [] };
      subject.forms.push(form);
    }

    const ex = {
      id: r.id,
      title: r.title || '',
      difficulty: r.difficulty || '',
      description: r.description || '',
      requirements: Array.isArray(r.requirements) ? r.requirements : (r.requirements ? [r.requirements] : []),
      grading_criteria: r.grading_criteria || { tieu_chi: [] },
      submission_format: r.submission_format || ''
    };

    form.exercises.push(ex);
  }

  // finalize counts and sort
  const out = Object.values(subjects);
  out.forEach(sub => {
    sub.forms.forEach(f => { f.exercise_count = f.exercises.length; });
    sub.total_exercises = sub.forms.reduce((s, f) => s + (f.exercise_count || 0), 0);
  });

  return out;
}

app.get('/api/subjects', async (req, res) => {
  // if USE_EXTERNAL_DB set, return subjects built from external DB
  const useExternal = (process.env.USE_EXTERNAL_DB || '').toLowerCase() === '1' || (process.env.USE_EXTERNAL_DB || '').toLowerCase() === 'true';
  if (useExternal) {
    try {
      const prefix = req.query.prefix; // optional
      const subjects = await buildSubjectsFromExternal(prefix);
      return res.json(subjects);
    } catch (err) {
      console.error('Error building subjects from external DB', err);
      return res.status(500).json({ error: 'Failed to load external subjects', detail: err.message });
    }
  }

  res.json(readDB());
});

app.get('/api/subject/:id', (req, res) => {
  const db = readDB();
  const sub = db.find(s => s.subject_id === req.params.id);
  if (!sub) return res.status(404).json({ error: 'Not found' });
  res.json(sub);
});

// ==================================================
//  LOGIN (SET COOKIE TOKEN)
// ==================================================
app.post('/api/lecturer/login', (req, res) => {
  let { name, password, lecturer_id } = req.body || {};
  name = typeof name === 'string' ? name.trim() : '';
  password = typeof password === 'string' ? password.trim() : '';
  lecturer_id = typeof lecturer_id === 'string' ? lecturer_id.trim() : '';

  const lecturers = readLecturers();

  // Match by lecturer_id + password primarily. Accept name mismatch to avoid whitespace/casing issues.
  let found = lecturers.find(l => l.lecturer_id === lecturer_id && l.password === password);
  // fallback: if no match by id+password, try exact match including name (legacy)
  if (!found) {
    found = lecturers.find(l => l.lecturer_id === lecturer_id && l.name === name && l.password === password);
  }

  if (!found) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign(
    { lecturer_id: found.lecturer_id, name: found.name, is_admin: found.is_admin || false, allowed_subjects: found.allowed_subjects || [] },
    JWT_SECRET,
    { expiresIn: '8h' }
  );

  const cookieOpts = {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 8 * 3600 * 1000
  };

  if (process.env.NODE_ENV === 'production') cookieOpts.secure = true;

  res.cookie('token', token, cookieOpts);
  res.json({ success: true, lecturer: { lecturer_id: found.lecturer_id, name: found.name, is_admin: found.is_admin || false, allowed_subjects: found.allowed_subjects || [] } });
});

// ==================================================
//  AUTH MIDDLEWARE
// ==================================================
function auth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  let token = null;

  if (authHeader.startsWith('Bearer ')) token = authHeader.split(' ')[1];

  if (!token) {
    const cookieHeader = req.headers.cookie || '';
    const m = cookieHeader.match(/(?:^|; )token=([^;]+)/);
    if (m) token = decodeURIComponent(m[1]);
  }

  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// Middleware to check if user has permission for subject
function checkSubjectPermission(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
  
  const subjectId = req.body.subject_id || req.query.subject_id || req.params.subject_id;
  if (!subjectId) return res.status(400).json({ error: 'No subject_id provided' });
  
  // admin can access all subjects
  if (req.user.is_admin) return next();
  
  // check if subject is in allowed_subjects
  if (!req.user.allowed_subjects || !req.user.allowed_subjects.includes(subjectId)) {
    return res.status(403).json({ error: 'No permission for this subject' });
  }
  
  next();
}

// ==================================================
//  EXERCISE CRUD
// ==================================================
app.post('/api/exercise', auth, checkSubjectPermission, upload.array('files'), async (req, res) => {
  try {
    const payload = req.body;
    const useExternal = (process.env.USE_EXTERNAL_DB || '').toLowerCase() === '1' || (process.env.USE_EXTERNAL_DB || '').toLowerCase() === 'true';

    const exercise = JSON.parse(payload.exercise);
    const subjectId = payload.subject_id;

    // add created_at timestamp for new exercises if not provided
    if (!exercise.created_at) exercise.created_at = new Date().toISOString();

    if (req.files && req.files.length) {
      exercise.attached_files = req.files.map(f => ({
        originalname: f.originalname,
        filename: path.basename(f.path)
      }));
    } else {
      exercise.attached_files = exercise.attached_files || [];
    }

    // If using external DB, also insert into SQL
    if (useExternal) {
      await insertExerciseToSQL(exercise, subjectId);
    } else {
      // Insert into local db.json
      const db = readDB();
      const subject = db.find(s => s.subject_id === subjectId);
      if (!subject) return res.status(404).json({ error: 'Subject not found' });

      const form = subject.forms.find(f => f.form_id === payload.form_id);
      if (!form) return res.status(404).json({ error: 'Form not found' });

      form.exercises.push(exercise);
      form.exercises.sort((a, b) => {
        const da = diffOrder[a.difficulty] ?? 1;
        const dbb = diffOrder[b.difficulty] ?? 1;
        if (da !== dbb) return da - dbb;
        return (a.id || '').localeCompare(b.id || '');
      });

      form.exercise_count = form.exercises.length;
      subject.total_exercises = subject.forms.reduce(
        (s, f) => s + (f.exercise_count || f.exercises.length || 0),
        0
      );

      writeDB(db);
    }

    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// update
app.put('/api/exercise/:id', auth, checkSubjectPermission, upload.array('files'), async (req, res) => {
  try {
    const id = req.params.id;
    const useExternal = (process.env.USE_EXTERNAL_DB || '').toLowerCase() === '1' || (process.env.USE_EXTERNAL_DB || '').toLowerCase() === 'true';
    const updated = req.body.exercise ? JSON.parse(req.body.exercise) : req.body;
    const subjectId = req.body.subject_id;

    if (useExternal) {
      // Update SQL for external DB
      await updateExerciseInSQL(updated, subjectId);
      res.json({ success: true });
    } else {
      // Update local db.json
      const db = readDB();
      let found = false;

      for (const subject of db) {
        for (const form of subject.forms) {
          const idx = form.exercises.findIndex(e => e.id === id);
          if (idx !== -1) {
            const ex = form.exercises[idx];
            const merged = { ...ex, ...updated };

            // preserve original created_at if present; if merged has no created_at, keep existing or set now
            if (!merged.created_at) merged.created_at = ex.created_at || new Date().toISOString();

            if (req.files?.length) {
              merged.attached_files = (merged.attached_files || []).concat(
                req.files.map(f => ({
                  originalname: f.originalname,
                  filename: path.basename(f.path)
                }))
              );
            }

            form.exercises[idx] = merged;
            form.exercises.sort(
              (a, b) => (diffOrder[a.difficulty] ?? 1) - (diffOrder[b.difficulty] ?? 1)
            );

            form.exercise_count = form.exercises.length;
            subject.total_exercises = subject.forms.reduce(
              (s, f) => s + (f.exercise_count || f.exercises.length || 0),
              0
            );

            found = true;
            break;
          }
        }
        if (found) break;
      }

      if (!found) return res.status(404).json({ error: 'Exercise not found' });

      writeDB(db);
      res.json({ success: true });
    }

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// delete
app.delete('/api/exercise/:id', auth, checkSubjectPermission, async (req, res) => {
  const id = req.params.id;
  const useExternal = (process.env.USE_EXTERNAL_DB || '').toLowerCase() === '1' || (process.env.USE_EXTERNAL_DB || '').toLowerCase() === 'true';

  if (useExternal) {
    // Delete from SQL
    await deleteExerciseFromSQL(id);
    res.json({ success: true });
  } else {
    // Delete from local db.json
    const db = readDB();
    let removed = false;

    for (const subject of db) {
      for (const form of subject.forms) {
        const idx = form.exercises.findIndex(e => e.id === id);

        if (idx !== -1) {
          form.exercises.splice(idx, 1);

          form.exercise_count = form.exercises.length;
          subject.total_exercises = subject.forms.reduce(
            (s, f) => s + (f.exercise_count || f.exercises.length || 0),
            0
          );

          removed = true;
          break;
        }
      }

      if (removed) break;
    }

    if (!removed) return res.status(404).json({ error: 'Not found' });

    writeDB(db);
    res.json({ success: true });
  }
});

// External data is read live from DB when USE_EXTERNAL_DB is set.
// Subject consolidation uses MaMon or falls back to MaBaiTap prefix.

// ==================================================
//  EXPORT EXCEL
// ==================================================
app.get('/api/export', auth, checkSubjectPermission, async (req, res) => {
  const subject_id = req.query.subject_id;

  // optional filters: since (ISO date) to export only exercises created after this time
  // and form_ids (comma-separated) to export only specific form types
  const since = req.query.since ? new Date(req.query.since) : null;
  const formIds = req.query.form_ids ? req.query.form_ids.split(',').map(s=>s.trim()).filter(Boolean) : null;
  // optional explicit exercise ids (comma-separated) to export specific exercises
  const exIds = req.query.exercise_ids ? req.query.exercise_ids.split(',').map(s=>s.trim()).filter(Boolean) : null;

  const db = readDB();
  const subject = db.find(s => s.subject_id === subject_id);

  if (!subject) return res.status(404).json({ error: 'Subject not found' });

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(subject.subject_name || subject_id);

  sheet.columns = [
    { header: 'Form ID', key: 'form_id', width: 10 },
    { header: 'Form Name', key: 'form_name', width: 20 },
    { header: 'Exercise ID', key: 'id', width: 20 },
    { header: 'Title', key: 'title', width: 40 },
    { header: 'Difficulty', key: 'difficulty', width: 12 },
    { header: 'Submission Format', key: 'submission_format', width: 20 },
    { header: 'Description', key: 'description', width: 40 },
    { header: 'Requirements', key: 'requirements', width: 30 },
    { header: 'Grading Criteria', key: 'grading_criteria', width: 30 },
    { header: 'Attached Files', key: 'attached_files', width: 30 },
    { header: 'Created At', key: 'created_at', width: 20 }
  ];

  for (const form of subject.forms) {
    if (formIds && formIds.length && !formIds.includes(form.form_id)) continue;
    for (const ex of form.exercises) {
      // if explicit exercise ids provided, only include those
      if (exIds && exIds.length && !exIds.includes(ex.id)) continue;
      if (since) {
        if (!ex.created_at) continue;
        const d = new Date(ex.created_at);
        if (isNaN(d.getTime()) || d < since) continue;
      }
      sheet.addRow({
        form_id: form.form_id,
        form_name: form.name,
        id: ex.id,
        title: ex.title,
        difficulty: ex.difficulty,
        submission_format: ex.submission_format
        ,
        description: ex.description || '',
        requirements: Array.isArray(ex.requirements) ? ex.requirements.join(' | ') : (ex.requirements || ''),
        grading_criteria: Array.isArray(ex.grading_criteria) ? ex.grading_criteria.join(' | ') : (ex.grading_criteria || ''),
        attached_files: Array.isArray(ex.attached_files) ? ex.attached_files.map(f=>f.originalname||f.filename||'').join(', ') : (ex.attached_files||'') ,
        created_at: ex.created_at || ''
      });
    }
  }

  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );

  res.setHeader(
    'Content-Disposition',
    `attachment; filename="${subject_id}-exercises.xlsx"`
  );

  await workbook.xlsx.write(res);
  res.end();
});

// ==================================================
//  LOGOUT
// ==================================================
app.post('/api/lecturer/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ success: true });
});

// ==================================================
//  EXPORT INLINE (export exercises provided in request body)
// ==================================================
app.post('/api/export-inline', auth, async (req, res) => {
  try {
    const { exercises, subject_id } = req.body;
    if (!Array.isArray(exercises) || !exercises.length) return res.status(400).json({ error: 'No exercises provided' });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet(subject_id || 'export');

    sheet.columns = [
      { header: 'Form ID', key: 'form_id', width: 10 },
      { header: 'Form Name', key: 'form_name', width: 20 },
      { header: 'Exercise ID', key: 'id', width: 20 },
      { header: 'Title', key: 'title', width: 40 },
      { header: 'Difficulty', key: 'difficulty', width: 12 },
      { header: 'Submission Format', key: 'submission_format', width: 20 },
      { header: 'Description', key: 'description', width: 40 },
      { header: 'Requirements', key: 'requirements', width: 30 },
      { header: 'Grading Criteria', key: 'grading_criteria', width: 30 },
      { header: 'Attached Files', key: 'attached_files', width: 30 },
      { header: 'Created At', key: 'created_at', width: 20 }
    ];

    for (const ex of exercises) {
      sheet.addRow({
        form_id: ex.form_id || '',
        form_name: ex.form_name || '',
        id: ex.id || '',
        title: ex.title || '',
        difficulty: ex.difficulty || '',
        submission_format: ex.submission_format || '',
        description: ex.description || '',
        requirements: Array.isArray(ex.requirements) ? ex.requirements.join(' | ') : (ex.requirements || ''),
        grading_criteria: Array.isArray(ex.grading_criteria) ? ex.grading_criteria.join(' | ') : (ex.grading_criteria || ''),
        attached_files: Array.isArray(ex.attached_files) ? ex.attached_files.map(f=>f.originalname||f.filename||'').join(', ') : (ex.attached_files||''),
        created_at: ex.created_at || ''
      });
    }

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${subject_id || 'export'}-exercises.xlsx"`);
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error('export-inline error', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==================================================
//  LECTURER ME
// ==================================================
app.get('/api/lecturer/me', auth, (req, res) => {
  res.json({ lecturer_id: req.user.lecturer_id, name: req.user.name, is_admin: req.user.is_admin || false, allowed_subjects: req.user.allowed_subjects || [] });
});

// ==================================================
//  SERVE LECTURER PAGE
// ==================================================
app.get('/lecturer', auth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'lecturer.html'));
});

// serve login page (friendly URL)
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// fallback for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// export app for Vercel (optional)
module.exports = app;

// ==================================================
//  START SERVER (for Render)
// ==================================================
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  const server = app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
    console.log(`Environment: USE_EXTERNAL_DB=${process.env.USE_EXTERNAL_DB || 'not set'}`);
  });
  
  // Handle errors
  server.on('error', (err) => {
    console.error('Server error:', err);
    process.exit(1);
  });
  
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  });
}
