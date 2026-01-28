const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const multer = require('multer');
const ExcelJS = require('exceljs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'change-me-to-secure-secret';

// MSSQL helper (returns getPool())
// `mssql-config.js` uses environment variables; defaults are provided for quick testing.
const { getPool, getSql } = require('./mssql-config');
const sql = getSql();

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

// ==================================================
//  ROUTES
// ==================================================
app.get('/api/subjects', (req, res) => {
  res.json(readDB());
});

app.get('/api/subject/:id', (req, res) => {
  const db = readDB();
  const sub = db.find(s => s.subject_id === req.params.id);
  if (!sub) return res.status(404).json({ error: 'Not found' });
  res.json(sub);
});

// --------------------------------------------------
// API: GET /api/baitap
// Trả về danh sách bài tập từ SQL Server, join các bảng BAITAP, MONHOC, DANGBAI, DOKHO
// Sử dụng async/await và try/catch; lỗi trả về JSON với message hợp lệ.
// --------------------------------------------------
app.get('/api/baitap', async (req, res) => {
  try {
    const pool = await getPool();

    const sqlQuery = `
          SELECT
            b.MaBaiTap AS MaBaiTap,
            b.TenBaiTap AS TenBaiTap,
            m.TenMon AS TenMon,
            d.TenDangBai AS TenDangBai,
            k.TenDoKho AS TenDoKho,
            b.MoTa AS MoTa,
            b.YeuCau AS YeuCau,
            b.TieuChiChamDiem AS TieuChiChamDiem
          FROM BAITAP b
          LEFT JOIN MONHOC m ON b.MaMon = m.MaMon
          LEFT JOIN DANGBAI d ON b.MaDangBai = d.MaDangBai
          LEFT JOIN DOKHO k ON b.MaDoKho = k.MaDoKho
          ORDER BY b.Id ASC
    `;

    const result = await pool.request().query(sqlQuery);
    return res.json(result.recordset || []);
  } catch (err) {
    console.error('Error in /api/baitap:', err);
    return res.status(500).json({ error: 'Lỗi máy chủ khi truy vấn cơ sở dữ liệu' });
  }
});

// ==================================================
//  GET SINGLE EXERCISE BY MaBaiTap
// ==================================================
app.get('/api/baitap/:maBaiTap', async (req, res) => {
  try {
    const pool = await getPool();
    const { maBaiTap } = req.params;

    const sqlQuery = `
      SELECT
        b.Id,
        b.MaBaiTap,
        b.TenBaiTap,
        m.MaMon,
        m.TenMon,
        d.MaDangBai,
        d.TenDangBai,
        k.MaDoKho,
        k.TenDoKho,
        b.MoTa,
        b.YeuCau,
        b.TieuChiChamDiem
      FROM BAITAP b
      LEFT JOIN MONHOC m ON b.MaMon = m.MaMon
      LEFT JOIN DANGBAI d ON b.MaDangBai = d.MaDangBai
      LEFT JOIN DOKHO k ON b.MaDoKho = k.MaDoKho
      WHERE b.MaBaiTap = @MaBaiTap
    `;

    const result = await pool.request()
      .input('MaBaiTap', sql.NVarChar, maBaiTap)
      .query(sqlQuery);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Bài tập không tìm thấy' });
    }

    return res.json(result.recordset[0]);
  } catch (err) {
    console.error('Error in /api/baitap/:maBaiTap GET:', err);
    return res.status(500).json({ error: 'Lỗi máy chủ' });
  }
});

// ==================================================
//  UPDATE EXERCISE (PUT)
// ==================================================
app.put('/api/baitap/:maBaiTap', async (req, res) => {
  try {
    const pool = await getPool();
    const { maBaiTap } = req.params;
    const { TenBaiTap, MaMon, MaDangBai, MaDoKho, MoTa, YeuCau, TieuChiChamDiem } = req.body;

    const sqlQuery = `
      UPDATE BAITAP
      SET
        TenBaiTap = @TenBaiTap,
        MaMon = @MaMon,
        MaDangBai = @MaDangBai,
        MaDoKho = @MaDoKho,
        MoTa = @MoTa,
        YeuCau = @YeuCau,
        TieuChiChamDiem = @TieuChiChamDiem
      WHERE MaBaiTap = @MaBaiTap
    `;

    const result = await pool.request()
      .input('MaBaiTap', sql.NVarChar, maBaiTap)
      .input('TenBaiTap', sql.NVarChar, TenBaiTap || null)
      .input('MaMon', sql.Int, MaMon || null)
      .input('MaDangBai', sql.Int, MaDangBai || null)
      .input('MaDoKho', sql.Int, MaDoKho || null)
      .input('MoTa', sql.NVarChar, MoTa || null)
      .input('YeuCau', sql.NVarChar, YeuCau || null)
      .input('TieuChiChamDiem', sql.NVarChar, TieuChiChamDiem || null)
      .query(sqlQuery);

    return res.json({ success: true, message: 'Cập nhật thành công' });
  } catch (err) {
    console.error('Error in /api/baitap/:maBaiTap PUT:', err);
    return res.status(500).json({ error: 'Lỗi máy chủ khi cập nhật' });
  }
});

// ==================================================
//  LOGIN (SET COOKIE TOKEN)
// ==================================================
app.post('/api/lecturer/login', (req, res) => {
  const { name, password, lecturer_id } = req.body;
  const lecturers = readLecturers();

  const found = lecturers.find(
    l => l.lecturer_id === lecturer_id && l.name === name && l.password === password
  );

  if (!found) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign(
    { lecturer_id: found.lecturer_id, name: found.name },
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
  res.json({ success: true, lecturer: { lecturer_id: found.lecturer_id, name: found.name } });
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

// ==================================================
//  EXERCISE CRUD
// ==================================================
app.post('/api/exercise', auth, upload.array('files'), (req, res) => {
  try {
    const payload = req.body;
    const db = readDB();

    const subject = db.find(s => s.subject_id === payload.subject_id);
    if (!subject) return res.status(404).json({ error: 'Subject not found' });

    const form = subject.forms.find(f => f.form_id === payload.form_id);
    if (!form) return res.status(404).json({ error: 'Form not found' });

    const exercise = JSON.parse(payload.exercise);

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
    res.json({ success: true, subject });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// update
app.put('/api/exercise/:id', auth, upload.array('files'), (req, res) => {
  try {
    const id = req.params.id;
    const updated = req.body.exercise ? JSON.parse(req.body.exercise) : req.body;

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

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// delete
app.delete('/api/exercise/:id', auth, (req, res) => {
  const id = req.params.id;
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
});

// ==================================================
//  EXPORT EXCEL
// ==================================================
app.get('/api/export', auth, async (req, res) => {
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
  res.json({ lecturer_id: req.user.lecturer_id, name: req.user.name });
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
  app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
}
