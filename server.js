const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const multer = require('multer');
const ExcelJS = require('exceljs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'change-me-to-secure-secret';

const DB_PATH = path.join(__dirname, 'db.json');
const LECTURERS_PATH = path.join(__dirname, 'lecturers.json');
const UPLOAD_DIR = path.join(__dirname, 'uploads');
const BACKUP_DIR = path.join(__dirname, 'backups');

if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);
if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR);

const upload = multer({ dest: UPLOAD_DIR });

const app = express();
app.use(cors());
app.use(express.json());

// Protect lecturer-only static assets from being served directly without auth.
// This prevents unauthenticated users from requesting `/lecturer.html` or related lecturer JS.
app.use((req, res, next) => {
  const protectedPaths = ['/lecturer.html', '/lecturer-app.js', '/lecturer-app.bundle.js'];
  try {
    const p = req.path;
    if (protectedPaths.includes(p) || p.startsWith('/lecturer/')) {
      // check token from Authorization header or cookie
      let token = null;
      const authHeader = req.headers.authorization || '';
      if (authHeader && authHeader.startsWith('Bearer ')) token = authHeader.split(' ')[1];
      if (!token) {
        const cookieHeader = req.headers.cookie || '';
        const m = cookieHeader.match(/(?:^|; )token=([^;]+)/);
        if (m) token = decodeURIComponent(m[1]);
      }
      if (!token) {
        // redirect to login for browser requests, or deny for XHR
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
  } catch (err) {
    // if anything goes wrong, fall through to static handler
  }
  next();
});

app.use(express.static(path.join(__dirname, 'public')));

function readDB() {
  const raw = fs.readFileSync(DB_PATH, 'utf8');
  return JSON.parse(raw);
}

function writeDB(data) {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(BACKUP_DIR, `db.${timestamp}.json`);
    if (fs.existsSync(DB_PATH)) fs.copyFileSync(DB_PATH, backupPath);
  } catch (err) {
    console.warn('Backup failed', err && err.message);
  }
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
}

function readLecturers() {
  if (!fs.existsSync(LECTURERS_PATH)) return [];
  const raw = fs.readFileSync(LECTURERS_PATH, 'utf8');
  return JSON.parse(raw);
}

// helper: difficulty order
const diffOrder = { 'Dễ': 0, 'Trung bình': 1, 'Khó': 2, 'De': 0, 'Trung binh': 1, 'KHo': 2 };

app.get('/api/subjects', (req, res) => {
  const db = readDB();
  res.json(db);
});

app.get('/api/subject/:id', (req, res) => {
  const db = readDB();
  const sub = db.find(s => s.subject_id === req.params.id);
  if (!sub) return res.status(404).json({ error: 'Not found' });
  res.json(sub);
});

app.post('/api/lecturer/login', (req, res) => {
  const { name, password, lecturer_id } = req.body;
  const lecturers = readLecturers();
  const found = lecturers.find(l => l.lecturer_id === lecturer_id && l.name === name && l.password === password);
  if (!found) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ lecturer_id: found.lecturer_id, name: found.name }, JWT_SECRET, { expiresIn: '8h' });
  // set HttpOnly cookie so browser will send it on subsequent requests
  res.cookie('token', token, { httpOnly: true, sameSite: 'lax', maxAge: 8 * 3600 * 1000 });
  res.json({ success: true, lecturer: { lecturer_id: found.lecturer_id, name: found.name } });
});

function auth(req, res, next) {
  // accept token either from Authorization header or cookie named 'token'
  const authHeader = req.headers.authorization || '';
  let token = null;
  if (authHeader && authHeader.startsWith('Bearer ')) token = authHeader.split(' ')[1];
  if (!token) {
    const cookieHeader = req.headers.cookie || '';
    const m = cookieHeader.match(/(?:^|; )token=([^;]+)/);
    if (m) token = decodeURIComponent(m[1]);
  }
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Add exercise (with optional file upload)
app.post('/api/exercise', auth, upload.array('files'), (req, res) => {
  try {
    const payload = req.body;
    const db = readDB();
    const subject = db.find(s => s.subject_id === payload.subject_id);
    if (!subject) return res.status(404).json({ error: 'Subject not found' });
    const form = subject.forms.find(f => f.form_id === payload.form_id);
    if (!form) return res.status(404).json({ error: 'Form not found' });

    const exercise = JSON.parse(payload.exercise);
    if (req.files && req.files.length) {
      exercise.attached_files = req.files.map(f => ({ originalname: f.originalname, filename: path.basename(f.path) }));
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
    subject.total_exercises = subject.forms.reduce((s, f) => s + (f.exercise_count || f.exercises.length || 0), 0);

    writeDB(db);
    res.json({ success: true, subject });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update exercise by id
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
          const merged = Object.assign({}, ex, updated);
          if (req.files && req.files.length) {
            merged.attached_files = (merged.attached_files || []).concat(req.files.map(f => ({ originalname: f.originalname, filename: path.basename(f.path) })));
          }
          form.exercises[idx] = merged;
          form.exercises.sort((a, b) => (diffOrder[a.difficulty] ?? 1) - (diffOrder[b.difficulty] ?? 1));
          form.exercise_count = form.exercises.length;
          subject.total_exercises = subject.forms.reduce((s, f) => s + (f.exercise_count || f.exercises.length || 0), 0);
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

// Delete exercise by id
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
        subject.total_exercises = subject.forms.reduce((s, f) => s + (f.exercise_count || f.exercises.length || 0), 0);
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

// Export subject exercises to Excel (protected)
app.get('/api/export', auth, async (req, res) => {
  const subject_id = req.query.subject_id;
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
    { header: 'Submission Format', key: 'submission_format', width: 20 }
  ];

  for (const form of subject.forms) {
    for (const ex of form.exercises) {
      sheet.addRow({ form_id: form.form_id, form_name: form.name, id: ex.id, title: ex.title, difficulty: ex.difficulty, submission_format: ex.submission_format });
    }
  }

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="${subject_id}-exercises.xlsx"`);
  await workbook.xlsx.write(res);
  res.end();
});

// logout endpoint: clear cookie
app.post('/api/lecturer/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ success: true });
});

// provide a small me endpoint so lecturer page can show name
app.get('/api/lecturer/me', auth, (req, res) => {
  res.json({ lecturer_id: req.user.lecturer_id, name: req.user.name });
});

// serve lecturer page only to authenticated users (token via cookie or Authorization)
app.get('/lecturer', auth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'lecturer.html'));
});

// Fallback to index
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));



