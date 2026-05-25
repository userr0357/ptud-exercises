const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const multer = require('multer');
const ExcelJS = require('exceljs');
const jwt = require('jsonwebtoken');
const db = require('./db-sql');
const sql = require('mssql');

const JWT_SECRET = process.env.JWT_SECRET || 'change-me-to-secure-secret';
const UPLOAD_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);
const upload = multer({ dest: UPLOAD_DIR });
const app = express();

// ==================================================
//  CORS
// ==================================================
const FRONTEND_URL = process.env.FRONTEND_URL || '';
if (FRONTEND_URL) { app.use(cors({ origin: FRONTEND_URL, credentials: true })); } else { app.use(cors()); }
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
      if (!token) { const m = (req.headers.cookie || '').match(/(?:^|; )token=([^;]+)/); if (m) token = decodeURIComponent(m[1]); }
      if (!token) { if ((req.headers.accept || '').includes('text/html')) return res.redirect('/login'); return res.status(401).json({ error: 'Authentication required' }); }
      try { jwt.verify(token, JWT_SECRET); return next(); } catch { if ((req.headers.accept || '').includes('text/html')) return res.redirect('/login'); return res.status(401).json({ error: 'Invalid token' }); }
    }
  } catch {}
  next();
});

app.use(express.static(path.join(__dirname, 'public')));

// ==================================================
//  FILE DOWNLOAD ROUTE
// ==================================================
app.get('/uploads/:filename', (req, res) => {
  const filename = req.params.filename;
  // Security: only alphanumeric + dash/underscore (no path traversal)
  if (!/^[a-zA-Z0-9_\-\.]+$/.test(filename)) return res.status(400).send('Invalid filename');
  const filePath = path.join(UPLOAD_DIR, filename);
  if (!fs.existsSync(filePath)) return res.status(404).send('File not found');
  // Try to get originalname from query param (set by frontend link)
  const originalname = req.query.name ? decodeURIComponent(req.query.name) : filename;
  res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(originalname)}`);
  res.sendFile(filePath);
});

// ==================================================
//  AUTH MIDDLEWARE
// ==================================================
function auth(req, res, next) {
  let token = null;
  const authHeader = req.headers.authorization || '';
  if (authHeader.startsWith('Bearer ')) token = authHeader.split(' ')[1];
  if (!token) { const m = (req.headers.cookie || '').match(/(?:^|; )token=([^;]+)/); if (m) token = decodeURIComponent(m[1]); }
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try { req.user = jwt.verify(token, JWT_SECRET); next(); } catch { res.status(401).json({ error: 'Invalid token' }); }
}

// ==================================================
//  DUPLICATE CHECKING
// ==================================================
app.use('/api/duplicate', auth, require('./duplicate-routes'));

// ==================================================
//  SUBJECTS (READ FROM MSSQL)
// ==================================================
app.get('/api/subjects', async (req, res) => {
  try { res.json(await db.getAllSubjects()); }
  catch (err) { console.error('GET /api/subjects error', err.message); res.status(500).json({ error: 'Server error' }); }
});

app.get('/api/subject/:id', async (req, res) => {
  try {
    const arr = await db.getAllSubjects(req.params.id);
    if (!arr.length) return res.status(404).json({ error: 'Not found' });
    res.json(arr[0]);
  } catch (err) { console.error('GET /api/subject error', err.message); res.status(500).json({ error: 'Server error' }); }
});

// ==================================================
//  LOGIN (MSSQL GIANGVIEN)
// ==================================================
app.post('/api/lecturer/login', async (req, res) => {
  try {
    const { lecturer_id, password } = req.body;
    const found = await db.authenticateLecturer(lecturer_id, password);
    if (!found) return res.status(401).json({ error: 'Sai mã giảng viên hoặc mật khẩu' });

    // Ghi log đăng nhập
    const pool = await db.getPool();
    const lhRes = await pool.request()
      .input('id', sql.VarChar, found.lecturer_id)
      .query(`INSERT INTO LOGIN_HISTORY (LecturerId, LoginTime, IsOnline) OUTPUT INSERTED.Id VALUES (@id, GETDATE(), 1)`);
    const historyId = lhRes.recordset[0].Id;

    const token = jwt.sign(
      { lecturer_id: found.lecturer_id, name: found.name, is_admin: found.is_admin, login_history_id: historyId },
      JWT_SECRET, { expiresIn: '8h' }
    );
    const cookieOpts = { httpOnly: true, sameSite: 'lax', maxAge: 8 * 3600 * 1000 };
    if (process.env.NODE_ENV === 'production') cookieOpts.secure = true;
    res.cookie('token', token, cookieOpts);
    res.json({ success: true, lecturer: found });
  } catch (err) { console.error('Login error', err.message); res.status(500).json({ error: 'Server error' }); }
});

app.post('/api/lecturer/logout', async (req, res) => {
  try {
    // Read cookie manually (cookie-parser not used)
    let token = null;
    const m = (req.headers.cookie || '').match(/(?:^|; )token=([^;]+)/);
    if (m) token = decodeURIComponent(m[1]);
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded && decoded.login_history_id) {
          const pool = await db.getPool();
          await pool.request()
            .input('id', sql.Int, decoded.login_history_id)
            .query(`UPDATE LOGIN_HISTORY SET LogoutTime = GETDATE(), IsOnline = 0, DurationMinutes = DATEDIFF(minute, LoginTime, GETDATE()) WHERE Id = @id`);
        }
      } catch(verifyErr) {
        // Token expired or invalid – still clear cookie, skip history update
        console.warn('Logout: token verify failed', verifyErr.message);
      }
    }
  } catch(e) { console.error('Logout log error', e); }
  res.clearCookie('token');
  res.json({ success: true });
});

app.get('/api/lecturer/logout', async (req, res) => {
  try {
    // Read cookie manually (cookie-parser not used)
    let token = null;
    const m = (req.headers.cookie || '').match(/(?:^|; )token=([^;]+)/);
    if (m) token = decodeURIComponent(m[1]);
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded && decoded.login_history_id) {
          const pool = await db.getPool();
          await pool.request()
            .input('id', sql.Int, decoded.login_history_id)
            .query(`UPDATE LOGIN_HISTORY SET LogoutTime = GETDATE(), IsOnline = 0, DurationMinutes = DATEDIFF(minute, LoginTime, GETDATE()) WHERE Id = @id`);
        }
      } catch(verifyErr) {
        console.warn('Logout GET: token verify failed', verifyErr.message);
      }
    }
  } catch(e) {}
  res.clearCookie('token');
  res.redirect('/login');
});

app.get('/api/lecturer/me', auth, async (req, res) => {
  try {
    const subjects = await db.getLecturerAllowedSubjects(req.user.lecturer_id);
    res.json({ lecturer_id: req.user.lecturer_id, name: req.user.name, is_admin: !!req.user.is_admin, allowed_subjects: subjects });
  } catch { res.json({ lecturer_id: req.user.lecturer_id, name: req.user.name, is_admin: !!req.user.is_admin }); }
});

// ==================================================
//  FORGOT PASSWORD & OTP
// ==================================================
app.post('/api/lecturer/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Vui lòng cung cấp email' });

    const pool = await db.getPool();
    const gvRes = await pool.request().input('email', sql.VarChar, email)
      .query('SELECT MaGiangVien, TenGiangVien FROM GIANGVIEN WHERE Email=@email');
    if (!gvRes.recordset.length) return res.status(404).json({ error: 'Email không tồn tại trong hệ thống' });
    const gv = gvRes.recordset[0];

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Lưu OTP vào DB (hết hạn sau 5 phút)
    await pool.request()
      .input('email', sql.NVarChar, email)
      .input('otp', sql.NVarChar, otp)
      .query(`INSERT INTO PasswordResetOTP (Email, OTP, AttemptCount, CreatedAt, ExpireAt, IsUsed) 
              VALUES (@email, @otp, 0, GETDATE(), DATEADD(minute, 5, GETDATE()), 0)`);

    // Gửi email
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.ethereal.email',
      port: process.env.SMTP_PORT || 587,
      auth: {
        user: process.env.SMTP_USER || 'ihlfsqqc23eyrkwp@ethereal.email',
        pass: process.env.SMTP_PASS || 'JEc3SMbj512Qpn2zHh'
      }
    });

    try {
      const info = await transporter.sendMail({
        from: '"Hệ Thống Quản Lý" <noreply@school.edu.vn>',
        to: email,
        subject: 'Mã xác thực khôi phục mật khẩu (OTP)',
        html: `<p>Xin chào <b>${gv.TenGiangVien}</b>,</p>
               <p>Mã OTP để khôi phục mật khẩu của bạn là: <b style="color:blue;font-size:20px;">${otp}</b></p>
               <p>Mã này sẽ hết hạn sau 5 phút. Vui lòng không chia sẻ mã này cho bất kỳ ai.</p>`
      });
      console.log(`\n======================================================`);
      console.log(`[OTP SENT] Đã gửi OTP tới ${email}: ${otp}`);
      if (!process.env.SMTP_USER) {
        console.log(`[TEST MODE] Xem email tại: ${nodemailer.getTestMessageUrl(info)}`);
      }
      console.log(`======================================================\n`);
    } catch(err) {
      console.log(`\n======================================================`);
      console.log(`[LỖI GỬI EMAIL] Không thể gửi tới ${email}. Mã OTP: ${otp}`);
      console.log(`Lỗi chi tiết:`, err.message);
      console.log(`======================================================\n`);
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Forgot password error:', err.message);
    res.status(500).json({ error: 'Lỗi máy chủ khi gửi OTP' });
  }
});

app.post('/api/lecturer/reset-password', async (req, res) => {
  try {
    const { email, otp, new_password } = req.body;
    if (!email || !otp || !new_password) return res.status(400).json({ error: 'Thiếu thông tin' });

    const pool = await db.getPool();
    // Lấy mã OTP mới nhất chưa sử dụng và chưa hết hạn
    const otpRes = await pool.request()
      .input('email', sql.NVarChar, email)
      .input('otp', sql.NVarChar, otp)
      .query(`SELECT TOP 1 * FROM PasswordResetOTP 
              WHERE Email=@email AND OTP=@otp AND IsUsed=0 AND ExpireAt > GETDATE()
              ORDER BY CreatedAt DESC`);
              
    if (!otpRes.recordset.length) return res.status(400).json({ error: 'Mã OTP không hợp lệ hoặc đã hết hạn' });

    const otpRecord = otpRes.recordset[0];

    // Đánh dấu OTP đã sử dụng
    await pool.request().input('id', sql.Int, otpRecord.Id)
      .query('UPDATE PasswordResetOTP SET IsUsed=1, UsedAt=GETDATE() WHERE Id=@id');

    // Cập nhật mật khẩu mới (Giả sử mật khẩu được lưu dạng plain text hoặc hash tuỳ hệ thống, ở đây dùng plain text theo code cũ)
    await pool.request()
      .input('email', sql.VarChar, email)
      .input('pass', sql.VarChar, new_password)
      .query('UPDATE GIANGVIEN SET MatKhau=@pass WHERE Email=@email');

    res.json({ success: true });
  } catch (err) {
    console.error('Reset password error:', err.message);
    res.status(500).json({ error: 'Lỗi máy chủ' });
  }
});

// ==================================================
//  EXERCISE CRUD (MSSQL)
// ==================================================

app.get('/api/next-id', auth, async (req, res) => {
  try {
    const { subject_id, form_id } = req.query;
    if (!subject_id || !form_id) return res.status(400).json({ error: 'Missing params' });
    const data = await db.getNextExerciseId(subject_id, form_id);
    res.json(data);
  } catch (err) {
    console.error('API /next-id error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});
app.post('/api/exercise', auth, upload.array('files'), async (req, res) => {
  try {
    const payload = req.body;
    console.log('[POST /api/exercise] body keys:', Object.keys(payload || {}), '| exercise present:', !!payload.exercise);
    if (!payload.exercise) {
      return res.status(400).json({ error: 'Thiếu dữ liệu bài tập (exercise field missing). Vui lòng thử lại.' });
    }
    const exercise = JSON.parse(payload.exercise);
    if (req.files && req.files.length) {
      exercise.attached_files = req.files.map(f => ({ originalname: f.originalname, filename: path.basename(f.path) }));
    }
    const result = await db.createExercise(payload.subject_id, payload.form_id, exercise, req.user.lecturer_id);
    if (result.error) return res.status(result.status || 500).json({ error: result.error });
    
    // Background sync
    const { syncExerciseFeature } = require('./duplicate-service');
    if (result.newId) {
        syncExerciseFeature(result.newId, exercise.title, exercise.description, Array.isArray(exercise.requirements) ? exercise.requirements.join('\\n') : exercise.requirements)
          .catch(e => console.error('Sync error:', e));
    }
    
    res.json({ ...result, subject_id: payload.subject_id, form_id: payload.form_id });
  } catch (err) {
    console.error('POST /api/exercise error', err.message);
    // Return meaningful error to frontend
    if (err.message && err.message.includes('UNIQUE KEY')) {
      return res.status(409).json({ error: 'Mã bài tập này đã tồn tại. Vui lòng tải lại trang và thử lại.' });
    }
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

app.put('/api/exercise/:id', auth, upload.array('files'), async (req, res) => {
  try {
    const updated = req.body.exercise ? JSON.parse(req.body.exercise) : req.body;
    if (req.files && req.files.length) {
      updated.attached_files = (updated.attached_files || []).concat(req.files.map(f => ({ originalname: f.originalname, filename: path.basename(f.path) })));
    }
    const result = await db.updateExercise(req.params.id, updated, req.user.lecturer_id);
    if (result.error) return res.status(result.status || 500).json({ error: result.error });

    // Background sync
    try {
        const pool = await db.getPool();
        const r = await pool.request().input('id', sql.VarChar, req.params.id).query('SELECT Id FROM BAITAP WHERE MaBaiTap = @id');
        if (r.recordset.length > 0) {
            const { syncExerciseFeature } = require('./duplicate-service');
            syncExerciseFeature(r.recordset[0].Id, updated.title, updated.description, Array.isArray(updated.requirements) ? updated.requirements.join('\\n') : updated.requirements)
              .catch(e => console.error('Sync update error:', e));
        }
    } catch (e) { console.error('Failed to trigger background sync for update', e); }

    res.json(result);
  } catch (err) { console.error('PUT /api/exercise error', err.message); res.status(500).json({ error: 'Server error' }); }
});

app.delete('/api/exercise/:id', auth, async (req, res) => {
  try {
    const result = await db.deleteExercise(req.params.id, req.user.lecturer_id);
    if (result.error) return res.status(result.status || 500).json({ error: result.error });
    res.json(result);
  } catch (err) { console.error('DELETE /api/exercise error', err.message); res.status(500).json({ error: 'Server error' }); }
});

// ==================================================
//  AUTO-GENERATE EXERCISE ID
// ==================================================
app.get('/api/next-exercise-id', auth, async (req, res) => {
  try {
    const { subject_id, form_id } = req.query;
    if (!subject_id || !form_id) return res.status(400).json({ error: 'Missing subject_id or form_id' });
    res.json(await db.getNextExerciseId(subject_id, form_id));
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// ==================================================
//  EXPORT EXCEL
// ==================================================
app.post('/api/export/excel/selected', auth, async (req, res) => {
  try {
    const { exercise_ids } = req.body;
    const pool = await db.getPool();
    const gvId = req.user.lecturer_id;
    let queryStr = `
      SELECT b.MaBaiTap, b.TenBaiTap, b.MaDoKho, dk.TenDoKho, b.MaDangBai, d.TenDangBai,
      b.MoTa, b.YeuCau, b.TieuChiChamDiem, b.FileDinhKem, b.SkillLevel, b.UpdatedAt, b.MaMon, m.TenMon
      FROM BAITAP b
      LEFT JOIN MONHOC m ON m.MaMon = b.MaMon
      LEFT JOIN DOKHO dk ON dk.MaDoKho = b.MaDoKho
      LEFT JOIN DANGBAI d ON d.MaDangBai = b.MaDangBai
      WHERE b.MaGiangVien = @gv AND (b.IsDeleted=0 OR b.IsDeleted IS NULL)
    `;
    
    if (Array.isArray(exercise_ids) && exercise_ids.length > 0) {
      queryStr += ` AND b.MaBaiTap IN (${exercise_ids.map(id => `'${id.replace(/'/g, "''")}'`).join(',')})`;
    }

    const r = await pool.request().input('gv', sql.VarChar, gvId).query(queryStr);
    
    // Log Export
    try {
      const detailStr = r.recordset.map(row => `📤 ${row.MaBaiTap} - ${row.TenBaiTap}`).join('; ').substring(0, 2000);
      await pool.request()
        .input('uid', sql.VarChar, gvId)
        .input('role', sql.VarChar, 'Lecturer')
        .input('type', sql.VarChar, 'exercises')
        .input('fmt', sql.VarChar, 'xlsx')
        .input('num', sql.Int, r.recordset.length)
        .input('details', sql.NVarChar, detailStr)
        .query(`INSERT INTO EXPORT_LOG (exported_by, role, export_type, format, row_count, exported_at, details)
                VALUES (@uid, @role, @type, @fmt, @num, GETDATE(), @details)`);
    } catch (e) { console.error('EXPORT LOG ERROR:', e); }

    const ExcelJS = require('exceljs');
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('BaiTap_Cua_Toi');

    sheet.columns = [
      { header: 'Mã Bài Tập (*)', key: 'id', width: 15 },
      { header: 'Tên Bài Tập', key: 'title', width: 40 },
      { header: 'Mã Môn Học', key: 'subject_id', width: 15 },
      { header: 'Mã Dạng Bài', key: 'form_id', width: 15 },
      { header: 'Mã Độ Khó', key: 'diff_id', width: 15 },
      { header: 'Level Kỹ Năng', key: 'skill', width: 15 },
      { header: 'Mô Tả (Đề bài)', key: 'desc', width: 50 },
      { header: 'Yêu Cầu (JSON)', key: 'req', width: 50 },
      { header: 'Tiêu Chí (JSON)', key: 'crit', width: 50 },
      { header: 'File Đính Kèm', key: 'files', width: 25 },
      { header: 'Cập Nhật Lần Cuối', key: 'date', width: 20 }
    ];

    r.recordset.forEach(row => {
      sheet.addRow({
        id: row.MaBaiTap,
        title: row.TenBaiTap,
        subject_id: row.MaMon,
        form_id: row.MaDangBai,
        diff_id: row.MaDoKho,
        skill: row.SkillLevel || '',
        desc: row.MoTa || '',
        req: row.YeuCau || '',
        crit: row.TieuChiChamDiem || '',
        files: row.FileDinhKem || '',
        date: row.UpdatedAt ? new Date(row.UpdatedAt).toLocaleDateString('vi-VN') : ''
      });
    });

    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD3D3D3' } };
    sheet.getColumn('id').font = { color: { argb: 'FF888888' }, italic: true };
    const exportBuf = await workbook.xlsx.writeBuffer();
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="BaiTap.xlsx"');
    res.setHeader('Content-Length', exportBuf.byteLength);
    res.send(Buffer.from(exportBuf));
  } catch (err) { console.error('Export error', err.message); res.status(500).json({ error: 'Server error' }); }
});

app.post('/api/export/pdf/selected', auth, async (req, res) => {
  try {
    const { exercise_ids } = req.body;
    const pool = await db.getPool();
    const gvId = req.user.lecturer_id;
    const sql = require('mssql');
    let queryStr = `
      SELECT b.MaBaiTap, b.TenBaiTap, b.MaDoKho, dk.TenDoKho, b.MaDangBai, d.TenDangBai,
      b.MoTa, b.YeuCau, b.TieuChiChamDiem, b.FileDinhKem, b.SkillLevel, b.UpdatedAt, b.MaMon, m.TenMon
      FROM BAITAP b
      LEFT JOIN MONHOC m ON m.MaMon = b.MaMon
      LEFT JOIN DOKHO dk ON dk.MaDoKho = b.MaDoKho
      LEFT JOIN DANGBAI d ON d.MaDangBai = b.MaDangBai
      WHERE b.MaGiangVien = @gv AND (b.IsDeleted=0 OR b.IsDeleted IS NULL)
    `;
    
    if (Array.isArray(exercise_ids) && exercise_ids.length > 0) {
      queryStr += ` AND b.MaBaiTap IN (${exercise_ids.map(id => `'${id.replace(/'/g, "''")}'`).join(',')})`;
    }

    const r = await pool.request().input('gv', sql.VarChar, gvId).query(queryStr);
    
    // Log Export
    try {
      const detailStr = r.recordset.map(row => `📄 ${row.MaBaiTap} - ${row.TenBaiTap}`).join('; ').substring(0, 2000);
      await pool.request()
        .input('uid', sql.VarChar, gvId)
        .input('role', sql.VarChar, 'Lecturer')
        .input('type', sql.VarChar, 'exercises')
        .input('fmt', sql.VarChar, 'pdf')
        .input('num', sql.Int, r.recordset.length)
        .input('details', sql.NVarChar, detailStr)
        .query(`INSERT INTO EXPORT_LOG (exported_by, role, export_type, format, row_count, exported_at, details)
                VALUES (@uid, @role, @type, @fmt, @num, GETDATE(), @details)`);
    } catch (e) { console.error('EXPORT LOG ERROR:', e); }

    const pdfService = require('./pdf-service');
    await pdfService.exportExercisesAsPDF(res, r.recordset, 'DANH SÁCH BÀI TẬP');
  } catch (err) { console.error('Export PDF error', err.message); res.status(500).json({ error: 'Server error' }); }
});

app.post('/api/export-inline', auth, async (req, res) => {
// Keep export-inline for backward compatibility for now if needed, or I can just let it be.
  try {
    const { exercises, subject_id } = req.body;
// ... (I'll just preserve what was here)
    if (!Array.isArray(exercises) || !exercises.length) return res.status(400).json({ error: 'No exercises' });
    const ExcelJS = require('exceljs');
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet(subject_id || 'export');
    sheet.columns = [
      { header: 'Exercise ID', key: 'id', width: 20 }, { header: 'Title', key: 'title', width: 40 },
      { header: 'Difficulty', key: 'difficulty', width: 12 }, { header: 'Description', key: 'description', width: 40 }
    ];
    for (const ex of exercises) sheet.addRow(ex);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${subject_id || 'export'}-exercises.xlsx"`);
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// ==================================================
//  IMPORT EXCEL (LECTURER)
// ==================================================

// Download template Excel with dropdowns
app.get('/api/import/template', auth, async (req, res) => {
  try {
    const pool = await db.getPool();
    const monRes  = await pool.request().query('SELECT MaMon, TenMon FROM MONHOC ORDER BY MaMon');
    const formRes = await pool.request().query('SELECT MaDangBai, TenDangBai FROM DANGBAI ORDER BY MaDangBai');
    const khoRes  = await pool.request().query('SELECT MaDoKho, TenDoKho FROM DOKHO ORDER BY MaDoKho');
    const subjects = monRes.recordset;
    const forms    = formRes.recordset;
    const doKhos   = khoRes.recordset;

    const ExcelJS = require('exceljs');
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('BaiTap_Mau');

    sheet.columns = [
      { header: 'Ma Bai Tap (*)', key: 'id',    width: 20 },
      { header: 'Ten Bai Tap (*)',key: 'title',  width: 42 },
      { header: 'Ma Mon Hoc (*)', key: 'mon',    width: 15 },
      { header: 'Ma Dang Bai',   key: 'dang',   width: 14 },
      { header: 'Ma Do Kho',     key: 'kho',    width: 13 },
      { header: 'Level KN (1-5)',key: 'skill',  width: 15 },
      { header: 'Mo Ta',         key: 'desc',   width: 50 },
      { header: 'Yeu Cau (JSON)',key: 'req',    width: 45 },
      { header: 'Tieu Chi (JSON)',key:'crit',   width: 45 },
      { header: 'File Dinh Kem', key: 'files',  width: 25 },
    ];

    // Style header
    const hdr = sheet.getRow(1);
    hdr.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 };
    hdr.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F46E5' } };
    hdr.height = 24;
    hdr.alignment = { vertical: 'middle' };

    // Example row
    sheet.addRow({
      id:    '(De trong = them moi)',
      title: 'Vi du: Tinh giai thua',
      mon:   subjects[0]?.MaMon   || 'KTLT',
      dang:  forms[0]?.MaDangBai  || 1,
      kho:   doKhos[0]?.MaDoKho   || 1,
      skill: 2,
      desc:  'Viet ham tinh n! voi dieu kien n >= 0',
      req:   '["Khong dung de quy","n=0 tra ve 1"]',
      crit:  '[{"name":"Tinh dung","points":60},{"name":"Edge cases","points":40}]',
      files: ''
    });
    const exRow = sheet.getRow(2);
    exRow.font = { italic: true, color: { argb: 'FF94A3B8' } };
    exRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };

    // Data validation: subjects (col C) — apply to rows 3-200
    const subList = subjects.map(s => s.MaMon).join(',');
    if (subList) {
      for (let r = 3; r <= 200; r++) {
        sheet.getCell(r, 3).dataValidation = {
          type: 'list', allowBlank: true,
          formulae: [`"${subList}"`],
          showErrorMessage: true,
          errorTitle: 'Ma Mon Hoc khong hop le',
          error: `Chon mot trong: ${subList}`
        };
      }
    }

    // Data validation: difficulty (col E)
    const khoList = doKhos.map(d => String(d.MaDoKho)).join(',');
    if (khoList) {
      for (let r = 3; r <= 200; r++) {
        sheet.getCell(r, 5).dataValidation = {
          type: 'list', allowBlank: true,
          formulae: [`"${khoList}"`],
          showErrorMessage: true,
          errorTitle: 'Ma Do Kho khong hop le',
          error: `Chon mot trong: ${khoList}`
        };
      }
    }

    // Data validation: skill level (col F)
    for (let r = 3; r <= 200; r++) {
      sheet.getCell(r, 6).dataValidation = {
        type: 'list', allowBlank: true,
        formulae: ['"1,2,3,4,5"'],
        showErrorMessage: true,
        errorTitle: 'Level khong hop le',
        error: 'Level phai la so tu 1 den 5'
      };
    }

    // Hidden reference sheet
    const ref = workbook.addWorksheet('Danh_Muc');
    ref.state = 'hidden';
    ['Ma Mon','Ten Mon','Ma Dang Bai','Ten Dang Bai','Ma Do Kho','Ten Do Kho'].forEach((h,i)=>{
      ref.getCell(1, i+1).value = h;
      ref.getCell(1, i+1).font = { bold: true };
    });
    subjects.forEach((s,i)=>{ ref.getCell(i+2,1).value=s.MaMon; ref.getCell(i+2,2).value=s.TenMon; });
    forms.forEach((f,i)=>{ ref.getCell(i+2,3).value=f.MaDangBai; ref.getCell(i+2,4).value=f.TenDangBai; });
    doKhos.forEach((d,i)=>{ ref.getCell(i+2,5).value=d.MaDoKho; ref.getCell(i+2,6).value=d.TenDoKho; });

    // Generate file in memory FIRST, then send — avoids partial corrupt response
    const xlsxBuffer = await workbook.xlsx.writeBuffer();
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="BaiTap_Template.xlsx"');
    res.setHeader('Content-Length', xlsxBuffer.byteLength);
    res.send(Buffer.from(xlsxBuffer));
  } catch(e) { console.error('Template error:', e.message); res.status(500).json({ error: e.message }); }
});

app.post('/api/import/preview', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Không tìm thấy file Excel' });
    const ExcelJS = require('exceljs');
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(req.file.path);
    const sheet = workbook.worksheets[0];
    if (!sheet) return res.status(400).json({ error: 'File Excel không có dữ liệu' });

    // Fetch lecturer's allowed subjects for permission check
    const allowedSubjects = await db.getLecturerAllowedSubjects(req.user.lecturer_id);

    const parsedData = [];
    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; 
      const id = row.getCell(1).text || '';
      const title = row.getCell(2).text || '';
      if (!title && !id) return; 

      const maMon = row.getCell(3).text || '';
      let status = 'VALID';
      let statusNote = '';
      if (!title) {
        status = 'INVALID_NO_TITLE';
        statusNote = 'Thiếu tên bài tập';
      } else if (!maMon) {
        status = 'INVALID_NO_SUBJECT';
        statusNote = 'Thiếu mã môn học';
      } else if (allowedSubjects.length > 0 && !allowedSubjects.includes(maMon)) {
        status = 'INVALID_NO_PERMISSION';
        statusNote = `Không có quyền quản lý môn ${maMon}`;
      }

      parsedData.push({
        row: rowNumber,
        MaBaiTap: id,
        TenBaiTap: title,
        MaMon: maMon,
        MaDangBai: row.getCell(4).text || '',
        MaDoKho: row.getCell(5).text || '',
        SkillLevel: row.getCell(6).text || '',
        MoTa: row.getCell(7).text || '',
        YeuCau: row.getCell(8).text || '',
        TieuChiChamDiem: row.getCell(9).text || '',
        FileDinhKem: row.getCell(10).text || '',
        action: id ? 'UPDATE' : 'INSERT',
        status,
        statusNote
      });
    });

    const fs = require('fs');
    fs.unlinkSync(req.file.path);
    res.json({ success: true, preview: parsedData });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/import/confirm', auth, async (req, res) => {
  try {
    const { data, strategy = 'update' } = req.body;
    // strategy: 'skip' | 'update' | 'clone'
    if (!Array.isArray(data) || !data.length) return res.status(400).json({ error: 'Du lieu trong' });
    
    const pool = await db.getPool();
    const gvId = req.user.lecturer_id;
    let updated = 0, inserted = 0, skipped = 0;
    const errors = [];
    const importedDetails = []; // Track details for log

    // Fetch allowed subjects for server-side enforcement
    const allowedSubjects = await db.getLecturerAllowedSubjects(gvId);

    for (const item of data) {
      if (item.status && item.status !== 'VALID') {
        errors.push({ row: item.row, MaBaiTap: item.MaBaiTap, reason: item.statusNote || 'Dữ liệu không hợp lệ' });
        continue;
      }

      // Server-side permission check
      if (allowedSubjects.length > 0 && item.MaMon && !allowedSubjects.includes(item.MaMon)) {
        errors.push({ row: item.row, MaBaiTap: item.MaBaiTap, reason: `Không có quyền quản lý môn ${item.MaMon}` });
        continue;
      }

      try {
        const isExisting = item.action === 'UPDATE' && item.MaBaiTap;
        if (isExisting) {
          const chk = await pool.request().input('id', sql.VarChar, item.MaBaiTap)
            .query('SELECT MaGiangVien FROM BAITAP WHERE MaBaiTap=@id AND (IsDeleted=0 OR IsDeleted IS NULL)');
          const exists = chk.recordset.length > 0;

          if (exists && strategy === 'skip') {
            skipped++; continue;
          }
          if (exists && strategy === 'update' && chk.recordset[0].MaGiangVien === gvId) {
            await pool.request()
              .input('id', sql.VarChar, item.MaBaiTap)
              .input('title', sql.NVarChar, item.TenBaiTap)
              .input('mon', sql.VarChar, item.MaMon)
              .input('dang', sql.Int, parseInt(item.MaDangBai) || null)
              .input('kho', sql.VarChar, item.MaDoKho)
              .input('skill', sql.Int, parseInt(item.SkillLevel) || null)
              .input('desc', sql.NVarChar, item.MoTa || '')
              .input('req', sql.NVarChar, item.YeuCau || '')
              .input('crit', sql.NVarChar, item.TieuChiChamDiem || '[]')
              .input('files', sql.NVarChar, item.FileDinhKem || '')
              .query(`UPDATE BAITAP SET TenBaiTap=@title, MaMon=@mon, MaDangBai=@dang, MaDoKho=@kho, SkillLevel=@skill,
                MoTa=@desc, YeuCau=@req, TieuChiChamDiem=@crit, FileDinhKem=@files, UpdatedAt=GETDATE()
                WHERE MaBaiTap=@id`);
            updated++;
            importedDetails.push({ id: item.MaBaiTap, title: item.TenBaiTap, mon: item.MaMon, action: 'updated' });
            continue;
          }
          if (!exists || strategy === 'clone') {
            // fall through to INSERT with new ID
          } else {
            errors.push({ row: item.row, MaBaiTap: item.MaBaiTap, reason: 'Khong co quyen sua bai nay' });
            continue;
          }
        }

        // INSERT (new or clone)
        let nextId = `NEW_${Date.now()}_${Math.floor(Math.random()*1000)}`;
        try {
          const idObj = await db.getNextExerciseId(item.MaMon, item.MaDangBai);
          if (idObj && idObj.nextId) nextId = idObj.nextId;
        } catch(_) {}

        await pool.request()
          .input('id', sql.VarChar, nextId)
          .input('title', sql.NVarChar, strategy === 'clone' ? `${item.TenBaiTap} (Copy)` : item.TenBaiTap)
          .input('mon', sql.VarChar, item.MaMon)
          .input('dang', sql.Int, parseInt(item.MaDangBai) || null)
          .input('kho', sql.VarChar, item.MaDoKho)
          .input('skill', sql.Int, parseInt(item.SkillLevel) || null)
          .input('desc', sql.NVarChar, item.MoTa || '')
          .input('req', sql.NVarChar, item.YeuCau || '')
          .input('crit', sql.NVarChar, item.TieuChiChamDiem || '[]')
          .input('files', sql.NVarChar, item.FileDinhKem || '')
          .input('gv', sql.VarChar, gvId)
          .query(`INSERT INTO BAITAP (MaBaiTap,TenBaiTap,MaMon,MaDangBai,MaDoKho,SkillLevel,MoTa,YeuCau,TieuChiChamDiem,FileDinhKem,MaGiangVien,IsDeleted,UpdatedAt)
            VALUES (@id,@title,@mon,@dang,@kho,@skill,@desc,@req,@crit,@files,@gv,0,GETDATE())`);
        inserted++;
        importedDetails.push({ id: nextId, title: item.TenBaiTap, mon: item.MaMon, action: 'inserted' });
      } catch(itemErr) {
        errors.push({ row: item.row, MaBaiTap: item.MaBaiTap, reason: itemErr.message });
      }
    }

    // Log import with details
    try {
      const detailStr = importedDetails.map(d => `${d.action === 'updated' ? '📝' : '➕'} ${d.id} - ${d.title} (${d.mon})`).join('; ');
      await pool.request()
        .input('uid', sql.VarChar, gvId).input('role', sql.VarChar, 'Lecturer')
        .input('type', sql.VarChar, 'import_exercises').input('fmt', sql.VarChar, 'xlsx')
        .input('num', sql.Int, updated + inserted)
        .input('details', sql.NVarChar, detailStr.substring(0, 2000))
        .query(`INSERT INTO EXPORT_LOG (exported_by,role,export_type,format,row_count,exported_at,details) VALUES (@uid,@role,@type,@fmt,@num,GETDATE(),@details)`);
    } catch(_) {}

    res.json({ success: true, updated, inserted, skipped, errors });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/export-inline_OLD_UNUSED', auth, async (req, res) => {
  try {
    const { exercises, subject_id } = req.body;
    if (!Array.isArray(exercises) || !exercises.length) return res.status(400).json({ error: 'No exercises' });
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet(subject_id || 'export');
    sheet.columns = [
      { header: 'Exercise ID', key: 'id', width: 20 }, { header: 'Title', key: 'title', width: 40 },
      { header: 'Difficulty', key: 'difficulty', width: 12 }, { header: 'Description', key: 'description', width: 40 }
    ];
    for (const ex of exercises) sheet.addRow(ex);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${subject_id || 'export'}-exercises.xlsx"`);
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// ==================================================
//  AI ROUTES
// ==================================================
app.post('/api/ai/generate-exercise', auth, async (req, res) => {
  const { prompt, type, subject_id, subject_name, exercise_title, exercise_type, difficulty } = req.body;
  if (!process.env.GROQ_API_KEY) {
    return res.json({ success: true,
      description: `Mô tả mẫu cho "${exercise_title || 'bài tập'}" (${subject_name || subject_id}).\n\n**Yêu cầu:** ${prompt}\n\n*(Chưa cấu hình GROQ_API_KEY)*`,
      requirements: ['Đọc hiểu đề bài', 'Viết thuật toán', 'Phân tích độ phức tạp'],
      grading_criteria: [{ name: 'Tính đúng đắn', points: 50 }, { name: 'Hiệu năng', points: 30 }, { name: 'Trình bày', points: 20 }]
    });
  }
  try {
    const aiPrompt = `Bạn là Giảng viên Đại học IT vô cùng khắt khe. Soạn bài tập cho môn "${subject_name||subject_id}", độ khó "${difficulty||'Trung bình'}", tên: "${exercise_title}", dạng: "${exercise_type}", yêu cầu: "${prompt}". Phần sinh: ${type||'toàn bộ'}.
QUY TẮC BẮT BUỘC:
1. Phần "requirements" phải có ít nhất 1-2 yêu cầu xử lý ngoại lệ (edge cases) cực kỳ cụ thể.
2. Phần "grading_criteria" NGHIÊM CẤM dùng các từ chung chung như "Chất lượng code", "Kết quả đúng". Bạn phải bẻ nhỏ thành các tiêu chí testcase cực kỳ cụ thể (Ví dụ: "Xử lý đúng mảng rỗng (10%)", "Thuật toán tối ưu (20%)", "Comment code (10%)").
3. Trả về ĐÚNG JSON thuần túy (không giải thích thêm, không bọc bằng markdown, chỉ JSON): {"description":"...","requirements":["..."],"grading_criteria":[{"name":"...","points":N}]} // N là trọng số phần trăm, tổng các points phải bằng 100`;
    const aiRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: aiPrompt }],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.2
      })
    });
    const data = await aiRes.json();
    if (!data.choices?.[0]?.message?.content) throw new Error('AI failed');
    let aiText = data.choices[0].message.content.trim();
    const firstBrace = aiText.indexOf('{');
    const lastBrace = aiText.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
      aiText = aiText.substring(firstBrace, lastBrace + 1);
    }
    const parsed = JSON.parse(aiText);
    res.json({ success: true, ...parsed });
  } catch (e) { console.error('AI generate:', e.message); res.status(500).json({ error: 'Lỗi AI' }); }
});

app.post('/api/ai/validate-exercise', auth, async (req, res) => {
  const { title, description, requirements, grading_criteria, skill_level } = req.body;
  if (!process.env.GROQ_API_KEY) {
    return res.json({ status: 'warning', feedback: 'Chưa cấu hình GROQ_API_KEY.', suggestions: ['Vui lòng cấu hình API Key.'] });
  }
  try {
    const aiPrompt = `Bạn là một Giảng viên phản biện (Reviewer) siêu cấp. Đọc đề bài sau:
Tên: "${title}"
Mô tả: "${description}"
Yêu cầu: ${JSON.stringify(requirements)}
Tiêu chí: ${JSON.stringify(grading_criteria)}
Level kỹ năng: ${skill_level}

Nhiệm vụ:
1. Phân tích logic của đề bài. Có bị thiếu trường hợp ngoại lệ (edge cases) như mảng rỗng, chuỗi rỗng, số âm, overflow không?
2. Tiêu chí chấm điểm hiện tại có quá chung chung không? Nếu có, hãy ĐỀ XUẤT bộ tiêu chí cực kỳ chi tiết thay thế.
3. CHỐNG ĐẠO ĐỀ / LÀM MỚI BÀI TẬP: Đề bài này có đang là một bài kinh điển quá đỗi quen thuộc (như tìm số nguyên tố, tính tổng...) không? Hãy sáng tạo ra một "Cốt truyện/Ngữ cảnh thực tế" (Storyline) hoàn toàn mới mẻ (Ví dụ: áp dụng vào xử lý dữ liệu ngân hàng, game, an ninh mạng, AI...) để "bình cũ rượu mới" bài tập này, giúp bài tập trở nên hấp dẫn và tránh bị trùng lặp 100% với đề cũ.
4. Trả về ĐÚNG 1 JSON thuần túy (không markdown, không giải thích ngoài JSON):
{
  "status": "valid", // Hoặc "warning", "invalid"
  "feedback": "Nhận xét tổng quan của bạn về đề bài...",
  "suggestions": ["Gợi ý 1...", "Gợi ý 2..."],
  "improved_grading_criteria": [{"name": "Tiêu chí chi tiết 1", "points": 20}, {"name": "Tiêu chí 2", "points": 30}], // Đảm bảo tổng points = 100
  "suggested_storyline": "Một đoạn văn mô tả cốt truyện mới..."
}`;
    const aiRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [{ role: 'user', content: aiPrompt }], model: 'llama-3.1-8b-instant', temperature: 0.3 })
    });
    const data = await aiRes.json();
    if (!data.choices?.[0]?.message?.content) throw new Error('AI failed');
    let aiText = data.choices[0].message.content.trim();
    const firstBrace = aiText.indexOf('{');
    const lastBrace = aiText.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) aiText = aiText.substring(firstBrace, lastBrace + 1);
    res.json(JSON.parse(aiText));
  } catch (e) { console.error('AI validate:', e.message); res.status(500).json({ error: 'Lỗi AI Validator' }); }
});

app.post('/api/ai/check-duplicates', auth, async (req, res) => {
  const { exercise_content, subject_id } = req.body;
  if (!exercise_content) return res.status(400).json({ error: 'Missing content' });
  const titles = await db.getExerciseTitles(subject_id).catch(() => []);
  if (!process.env.GROQ_API_KEY) {
    const score = Math.floor(Math.random() * 15);
    return res.json({ success: true, similarity_score: score, message: score < 30 ? '✅ Không trùng lặp đáng kể.' : '⚠️ Có thể trùng.' });
  }
  try {
    const aiPrompt = `Kiểm tra trùng lặp. Nội dung mới: "${exercise_content.substring(0,500)}". Tiêu đề có: ${titles.slice(0,20).join(', ')}. Trả ĐÚNG JSON (không giải thích thêm, không markdown): {"similarity_score":0-100,"matched_exercise":"...","message":"..."}`;
    const aiRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: aiPrompt }],
        model: 'llama-3.1-8b-instant',
        temperature: 0.1
      })
    });
    const data = await aiRes.json();
    let aiText = data.choices[0].message.content.trim();
    const firstBrace = aiText.indexOf('{');
    const lastBrace = aiText.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
      aiText = aiText.substring(firstBrace, lastBrace + 1);
    }
    const parsed = JSON.parse(aiText);
    res.json({ success: true, ...parsed });
  } catch { res.json({ success: true, similarity_score: 0, message: 'Không thể kiểm tra lúc này.' }); }
});

// ==================================================
//  LECTURER FORMS
// ==================================================
app.post('/api/lecturer/forms', auth, async (req, res) => {
    try {
        const pool = await db.getPool();
        const gvId = req.user.lecturer_id;
        const { subjectId, formName } = req.body;
        
        // 1. Check if lecturer is assigned to this subject
        const checkR = await pool.request()
            .input('gvId', sql.VarChar, gvId)
            .input('subjectId', sql.VarChar, subjectId)
            .query("SELECT 1 FROM GIANGVIEN_MONHOC WHERE MaGiangVien = @gvId AND MaMon = @subjectId");
        
        if (checkR.recordset.length === 0) {
            return res.status(403).json({ error: 'Bạn không quản lý môn học này.' });
        }
        
        // 2. Check if a form with similar name already exists
        const existR = await pool.request()
            .input('subjectId', sql.VarChar, subjectId)
            .input('formName', sql.NVarChar, formName.trim())
            .query("SELECT 1 FROM DANGBAI WHERE MaMon = @subjectId AND LOWER(TenDangBai) = LOWER(@formName)");
        
        if (existR.recordset.length > 0) {
            return res.status(400).json({ error: 'Dạng bài này đã tồn tại trong môn học này.' });
        }
        
        const transaction = new sql.Transaction(pool);
        await transaction.begin(sql.ISOLATION_LEVEL.SERIALIZABLE);
        try {
            const maxR = await transaction.request().query("SELECT ISNULL(MAX(MaDangBai), 0) + 1 AS NextId FROM DANGBAI WITH (UPDLOCK)");
            const nextId = maxR.recordset[0].NextId;
            await transaction.request()
                .input('id', sql.Int, nextId)
                .input('name', sql.NVarChar, formName.trim())
                .input('mon', sql.VarChar, subjectId)
                .query("INSERT INTO DANGBAI (MaDangBai, TenDangBai, MaMon) VALUES (@id, @name, @mon)");
            await transaction.commit();
            res.json({ success: true, MaDangBai: nextId, TenDangBai: formName.trim() });
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    } catch(e) {
        res.status(500).json({ error: e.message });
    }
});

// ==================================================
//  LECTURER DASHBOARD STATS
// ==================================================
app.get('/api/lecturer/dashboard', auth, async (req, res) => {
  try {
    const pool = await db.getPool();
    const gvId = req.user.lecturer_id;

    // Subjects this lecturer manages
    const subR = await pool.request().input('gv', sql.VarChar, gvId)
      .query(`SELECT DISTINCT m.MaMon, m.TenMon, COUNT(b.Id) AS SoBaiTap
        FROM GIANGVIEN_MONHOC gm
        JOIN MONHOC m ON gm.MaMon = m.MaMon
        LEFT JOIN BAITAP b ON b.MaMon = m.MaMon AND b.MaGiangVien = @gv AND (b.IsDeleted = 0 OR b.IsDeleted IS NULL)
        WHERE gm.MaGiangVien = @gv
        GROUP BY m.MaMon, m.TenMon`);

    // Exercises by difficulty
    const diffR = await pool.request().input('gv', sql.VarChar, gvId)
      .query(`SELECT dk.TenDoKho AS label, COUNT(*) AS value
        FROM BAITAP b LEFT JOIN DOKHO dk ON dk.MaDoKho=b.MaDoKho
        WHERE b.MaGiangVien=@gv AND (b.IsDeleted=0 OR b.IsDeleted IS NULL)
        GROUP BY dk.TenDoKho`);

    // Exercises by skill level
    const lvlR = await pool.request().input('gv', sql.VarChar, gvId)
      .query(`SELECT SkillLevel AS label, COUNT(*) AS value
        FROM BAITAP WHERE MaGiangVien=@gv AND (IsDeleted=0 OR IsDeleted IS NULL)
        GROUP BY SkillLevel ORDER BY SkillLevel`);

    // Exercises by form
    const formR = await pool.request().input('gv', sql.VarChar, gvId)
      .query(`SELECT d.TenDangBai AS label, COUNT(*) AS value
        FROM BAITAP b LEFT JOIN DANGBAI d ON d.MaDangBai=b.MaDangBai
        WHERE b.MaGiangVien=@gv AND (b.IsDeleted=0 OR b.IsDeleted IS NULL)
        GROUP BY d.TenDangBai`);

    // Total exercises
    const totalR = await pool.request().input('gv', sql.VarChar, gvId)
      .query(`SELECT COUNT(*) AS total FROM BAITAP WHERE MaGiangVien=@gv AND (IsDeleted=0 OR IsDeleted IS NULL)`);

    // Recent 5 exercises
    const recentR = await pool.request().input('gv', sql.VarChar, gvId)
      .query(`SELECT TOP 5 b.MaBaiTap, b.TenBaiTap, dk.TenDoKho, m.TenMon, b.SkillLevel, b.UpdatedAt
        FROM BAITAP b LEFT JOIN DOKHO dk ON dk.MaDoKho=b.MaDoKho LEFT JOIN MONHOC m ON m.MaMon=b.MaMon
        WHERE b.MaGiangVien=@gv AND (b.IsDeleted=0 OR b.IsDeleted IS NULL) ORDER BY b.UpdatedAt DESC`);

    res.json({
      totalExercises: totalR.recordset[0]?.total || 0,
      totalSubjects: subR.recordset.length,
      totalForms: formR.recordset.length,
      subjects: subR.recordset,
      byDifficulty: diffR.recordset,
      byLevel: lvlR.recordset,
      byForm: formR.recordset,
      recent: recentR.recordset
    });
  } catch(e) { console.error('lecturer dashboard:', e.message); res.status(500).json({ error: e.message }); }
});

// ==================================================
//  FEEDBACK ROUTES
// ==================================================
// Send feedback
app.post('/api/feedback', auth, async (req, res) => {
  try {
    const pool = await db.getPool();
    const { baiTapId, receiverId, category, content } = req.body;
    const senderId = req.user.lecturer_id;
    await pool.request()
      .input('bt', sql.Int, baiTapId)
      .input('s', sql.VarChar, senderId)
      .input('r', sql.VarChar, receiverId)
      .input('cat', sql.NVarChar, category || '')
      .input('title', sql.NVarChar, category || 'Góp ý')
      .input('c', sql.NVarChar, content)
      .query(`INSERT INTO FEEDBACKS (BaiTapId, SenderId, ReceiverId, Category, Title, Content, Status, CreatedAt, IsRead)
        VALUES (@bt, @s, @r, @cat, @title, @c, 0, GETDATE(), 0)`);
    res.json({ success: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// Get feedbacks received (other lecturers' feedback about MY exercises)
app.get('/api/feedback/received', auth, async (req, res) => {
  try {
    const pool = await db.getPool();
    const r = await pool.request().input('id', sql.VarChar, req.user.lecturer_id)
      .query(`SELECT f.*, b.MaBaiTap, b.TenBaiTap, b.SkillLevel,
        dk.TenDoKho, m.TenMon, d.TenDangBai,
        gs.TenGiangVien AS SenderName
        FROM FEEDBACKS f
        LEFT JOIN BAITAP b ON b.Id = f.BaiTapId
        LEFT JOIN DOKHO dk ON dk.MaDoKho = b.MaDoKho
        LEFT JOIN MONHOC m ON m.MaMon = b.MaMon
        LEFT JOIN DANGBAI d ON d.MaDangBai = b.MaDangBai
        LEFT JOIN GIANGVIEN gs ON gs.MaGiangVien = f.SenderId
        WHERE f.ReceiverId = @id ORDER BY f.CreatedAt DESC`);
    res.json(r.recordset);
  } catch(e) { res.json([]); }
});

// Get ALL feedbacks (admin view)
app.get('/api/admin/feedbacks', auth, async (req, res) => {
  try {
    const pool = await db.getPool();
    const r = await pool.request()
      .query(`SELECT f.Id, f.BaiTapId, f.SenderId, f.ReceiverId, f.Category, f.Title, f.Content,
        f.Status, f.CreatedAt, f.UpdatedAt, f.IsRead,
        b.MaBaiTap, b.TenBaiTap, b.SkillLevel, dk.TenDoKho, m.TenMon, d.TenDangBai,
        gs.TenGiangVien AS SenderName, gr.TenGiangVien AS ReceiverName
        FROM FEEDBACKS f
        LEFT JOIN BAITAP b ON b.Id = f.BaiTapId
        LEFT JOIN DOKHO dk ON dk.MaDoKho = b.MaDoKho
        LEFT JOIN MONHOC m ON m.MaMon = b.MaMon
        LEFT JOIN DANGBAI d ON d.MaDangBai = b.MaDangBai
        LEFT JOIN GIANGVIEN gs ON gs.MaGiangVien = f.SenderId
        LEFT JOIN GIANGVIEN gr ON gr.MaGiangVien = f.ReceiverId
        ORDER BY f.CreatedAt DESC`);
    res.json(r.recordset);
  } catch(e) { res.json([]); }
});

// Get feedbacks sent (MY feedback about other lecturers' exercises)
app.get('/api/feedback/sent', auth, async (req, res) => {
  try {
    const pool = await db.getPool();
    const r = await pool.request().input('id', sql.VarChar, req.user.lecturer_id)
      .query(`SELECT f.*, b.MaBaiTap, b.TenBaiTap, b.SkillLevel,
        dk.TenDoKho, m.TenMon, d.TenDangBai,
        gr.TenGiangVien AS ReceiverName
        FROM FEEDBACKS f
        LEFT JOIN BAITAP b ON b.Id = f.BaiTapId
        LEFT JOIN DOKHO dk ON dk.MaDoKho = b.MaDoKho
        LEFT JOIN MONHOC m ON m.MaMon = b.MaMon
        LEFT JOIN DANGBAI d ON d.MaDangBai = b.MaDangBai
        LEFT JOIN GIANGVIEN gr ON gr.MaGiangVien = f.ReceiverId
        WHERE f.SenderId = @id ORDER BY f.CreatedAt DESC`);
    res.json(r.recordset);
  } catch(e) { res.json([]); }
});

// ==================================================
//  ADMIN ROUTES (from admin-routes.js)
// ==================================================
require('./admin-routes')(app, auth);
require('./pdf-import-routes')(app, auth);

// ==================================================
//  STATIC PAGES
// ==================================================
app.get('/lecturer', auth, (req, res) => { res.sendFile(path.join(__dirname, 'public', 'lecturer.html')); });
app.get('/login', (req, res) => { res.sendFile(path.join(__dirname, 'public', 'login.html')); });
app.get('/register', (req, res) => { res.sendFile(path.join(__dirname, 'public', 'register.html')); });
app.get('/forgot', (req, res) => { res.sendFile(path.join(__dirname, 'public', 'forgot.html')); });
app.get('*', (req, res) => { res.sendFile(path.join(__dirname, 'public', 'index.html')); });

// ==================================================
//  START
// ==================================================
module.exports = app;
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Server started on port ${PORT} (100% MSSQL mode)`));
}
