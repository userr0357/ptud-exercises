// admin-routes.js — All /api/admin/* routes using MSSQL
// Returns data with SQL column names (admin.js expects them)
const mssql = require('mssql');
const db = require('./db-sql');

module.exports = function(app, auth) {

  // ── Subjects (SQL column names for admin.js) ──
  app.get('/api/admin/subjects', auth, async (req, res) => {
    try {
      const pool = await db.getPool();
      const r = await pool.request().query('SELECT MaMon, TenMon FROM MONHOC ORDER BY MaMon');
      res.json(r.recordset);
    } catch(e) { res.status(500).json({ error: e.message }); }
  });

  // ── Exercises with stats+pagination ──
  app.get('/api/admin/exercises', auth, async (req, res) => {
    try {
      const pool = await db.getPool();
      const { search, mamon, magv, level, days, page, limit } = req.query;
      const pg = parseInt(page) || 1;
      const lim = parseInt(limit) || 20;

      let where = '(b.IsDeleted = 0 OR b.IsDeleted IS NULL)';
      const r = pool.request();
      if (search) { 
        const qNFC = search.normalize('NFC');
        const qNFD = search.normalize('NFD');
        where += ` AND (b.TenBaiTap LIKE @qNFC OR b.MaBaiTap LIKE @qNFC OR b.MoTa LIKE @qNFC OR ef.AI_Keywords LIKE @qNFC 
                     OR b.TenBaiTap LIKE @qNFD OR b.MoTa LIKE @qNFD OR ef.AI_Keywords LIKE @qNFD)`;
        r.input('qNFC', mssql.NVarChar, '%'+qNFC+'%'); 
        r.input('qNFD', mssql.NVarChar, '%'+qNFD+'%'); 
      }
      if (mamon) { where += ' AND b.MaMon = @mon'; r.input('mon', mssql.VarChar, mamon); }
      if (magv) { where += ' AND b.MaGiangVien = @gv'; r.input('gv', mssql.VarChar, magv); }
      if (level) { where += ' AND b.SkillLevel = @lv'; r.input('lv', mssql.Int, parseInt(level)); }
      if (days && parseInt(days) > 0) { where += ' AND b.UpdatedAt >= DATEADD(day, -@days, GETDATE())'; r.input('days', mssql.Int, parseInt(days)); }

      // Simpler: just get all then paginate in JS
      const allSql = `SELECT b.Id, b.MaBaiTap, b.TenBaiTap, b.MaDoKho, dk.TenDoKho,
        d.MaDangBai, d.TenDangBai, m.MaMon, m.TenMon,
        b.MaGiangVien, gv.TenGiangVien, b.SkillLevel, b.UpdatedAt, b.MoTa
        FROM BAITAP b
        LEFT JOIN DOKHO dk ON dk.MaDoKho = b.MaDoKho
        LEFT JOIN DANGBAI d ON d.MaDangBai = b.MaDangBai
        LEFT JOIN MONHOC m ON m.MaMon = b.MaMon
        LEFT JOIN GIANGVIEN gv ON gv.MaGiangVien = b.MaGiangVien
        LEFT JOIN EXERCISE_FEATURES ef ON ef.BaiTapId = b.Id
        WHERE ${where} ORDER BY b.UpdatedAt DESC`;
      const result = await r.query(allSql);
      const all = result.recordset;

      // Stats
      const total = all.length;
      const now = Date.now();
      const new7 = all.filter(r => r.UpdatedAt && (now - new Date(r.UpdatedAt).getTime()) < 7*86400000).length;
      const subjectSet = new Set(all.map(r => r.MaMon).filter(Boolean));
      const gvSet = new Set(all.map(r => r.MaGiangVien).filter(Boolean));

      // Paginate
      const pages = Math.ceil(total / lim) || 1;
      const data = all.slice((pg - 1) * lim, pg * lim);

      res.json({
        stats: { Total: total, New7Days: new7, SubjectCount: subjectSet.size, GVCount: gvSet.size },
        data,
        pagination: { page: pg, pages, total, limit: lim }
      });
    } catch(e) { console.error('admin exercises:', e.message); res.status(500).json({ error: e.message }); }
  });

  // ── Xóa bài tập (Quyền Admin) ──
  app.delete('/api/admin/exercise/:id', auth, async (req, res) => {
    try {
      if (!req.user || !req.user.is_admin) return res.status(403).json({ error: 'Không có quyền truy cập' });
      const pool = await db.getPool();
      const check = await pool.request().input('id', mssql.VarChar, req.params.id)
        .query('SELECT Id FROM BAITAP WHERE (MaBaiTap=@id OR CAST(Id AS VARCHAR)=@id) AND (IsDeleted = 0 OR IsDeleted IS NULL)');
      if (!check.recordset.length) return res.status(404).json({ error: 'Không tìm thấy bài tập' });
      
      await pool.request().input('id', mssql.VarChar, req.params.id)
        .query('UPDATE BAITAP SET IsDeleted = 1, UpdatedAt = GETUTCDATE() WHERE MaBaiTap=@id OR CAST(Id AS VARCHAR)=@id');
      res.json({ success: true });
    } catch(e) {
      console.error('Admin delete exercise:', e.message);
      res.status(500).json({ error: 'Lỗi server' });
    }
  });

  // ── Single exercise detail ──
  app.get('/api/admin/exercise/:id', auth, async (req, res) => {
    try {
      const pool = await db.getPool();
      const r = await pool.request().input('id', mssql.VarChar, req.params.id)
        .query(`SELECT b.*, dk.TenDoKho, d.TenDangBai, m.TenMon, gv.TenGiangVien
          FROM BAITAP b LEFT JOIN DOKHO dk ON dk.MaDoKho=b.MaDoKho LEFT JOIN DANGBAI d ON d.MaDangBai=b.MaDangBai
          LEFT JOIN MONHOC m ON m.MaMon=b.MaMon LEFT JOIN GIANGVIEN gv ON gv.MaGiangVien=b.MaGiangVien
          WHERE b.MaBaiTap=@id OR CAST(b.Id AS VARCHAR)=@id`);
      if (!r.recordset.length) return res.status(404).json({ error: 'Not found' });
      
      const ex = r.recordset[0];
      
      // Fallback logic cho TieuChiChamDiem (Giống lecturer & student)
      try {
        let crit = [];
        const raw = ex.TieuChiChamDiem;
        if (raw) {
          const parsed = JSON.parse(raw);
          const toItem = c => {
            if (typeof c === 'string') return { name: c, points: 0 };
            return { name: c.name || c.tieu_chi || c.criterion || '', points: c.points || c.diem || 0 };
          };
          let parsedArr = [];
          if (parsed.tieu_chi && Array.isArray(parsed.tieu_chi)) parsedArr = parsed.tieu_chi;
          else if (parsed.criteria && Array.isArray(parsed.criteria)) parsedArr = parsed.criteria;
          else if (parsed.grading_criteria && Array.isArray(parsed.grading_criteria)) parsedArr = parsed.grading_criteria;
          else if (Array.isArray(parsed)) parsedArr = parsed;
          crit = parsedArr.map(toItem);
        }
        
        const totalPts = crit.reduce((sum, c) => sum + (c.points || 0), 0);
        if (totalPts === 0 && ex.MaDangBai) {
          const tcReq = await pool.request()
            .input('md', mssql.Int, ex.MaDangBai)
            .query('SELECT TenTieuChi, TrongSo FROM TIEUCHI_DANGBAI WHERE MaDangBai=@md ORDER BY ThuTu ASC');
          if (tcReq.recordset.length > 0) {
            const fallback = tcReq.recordset.map(tc => ({ name: tc.TenTieuChi, points: tc.TrongSo || 0 }));
            ex.TieuChiChamDiem = JSON.stringify(fallback);
          }
        }
      } catch(e) {}

      res.json(ex);
    } catch(e) { res.status(500).json({ error: e.message }); }
  });

  // ── Exercises by level ──
  app.get('/api/admin/exercises-by-level/:level', auth, async (req, res) => {
    try {
      const pool = await db.getPool();
      const r = await pool.request().input('lv', mssql.Int, parseInt(req.params.level))
        .query(`SELECT b.MaBaiTap, b.TenBaiTap, dk.TenDoKho, b.MaDoKho, m.MaMon, m.TenMon, b.MaGiangVien, b.SkillLevel
          FROM BAITAP b LEFT JOIN DOKHO dk ON dk.MaDoKho=b.MaDoKho LEFT JOIN MONHOC m ON m.MaMon=b.MaMon
          WHERE b.SkillLevel=@lv AND (b.IsDeleted=0 OR b.IsDeleted IS NULL)`);
      res.json(r.recordset);
    } catch(e) { res.status(500).json({ error: e.message }); }
  });

  // ── Exercise activity / audit log ──
  app.get('/api/admin/exercise-activity', auth, async (req, res) => {
    try {
      const pool = await db.getPool();
      const r = pool.request();
      let sql = `SELECT TOP 200 Id, ExerciseId, LecturerId, LecturerName, ExerciseTitle,
        Action, ActionTime, SubjectId, FormId, Details, CreatedAt, action_type,
        CreatedData, UpdatedData, DeletedData, Changes
        FROM EXERCISE_AUDIT_LOG WHERE 1=1`;
      const { lecturer, subject, from, to } = req.query;
      
      if (!req.user.is_admin) {
        sql += ' AND (LecturerId = @myUid OR ExerciseId IN (SELECT MaBaiTap FROM BAITAP WHERE MaGiangVien = @myUid))';
        r.input('myUid', mssql.VarChar, req.user.lecturer_id);
      } else if (lecturer) { 
        sql += ' AND LecturerId = @gv'; 
        r.input('gv', mssql.VarChar, lecturer); 
      }
      
      if (subject) { sql += ' AND SubjectId = @mon'; r.input('mon', mssql.VarChar, subject); }
      if (from) { sql += ' AND ActionTime >= @from'; r.input('from', mssql.DateTime, new Date(from)); }
      if (to) { sql += ' AND ActionTime <= @to'; r.input('to', mssql.DateTime, new Date(to)); }
      sql += ' ORDER BY ActionTime DESC';
      const result = await r.query(sql);
      // Map to frontend-friendly names
      res.json(result.recordset.map(r => ({
        id: r.Id, exercise_id: r.ExerciseId, exercise_title: r.ExerciseTitle || r.ExerciseId,
        lecturer_id: r.LecturerId, lecturer_name: r.LecturerName,
        action: r.Action, timestamp: r.ActionTime || r.CreatedAt,
        subject_id: r.SubjectId, form_id: r.FormId, details: r.Details,
        action_type: r.action_type,
        created_data: r.CreatedData, updated_data: r.UpdatedData, deleted_data: r.DeletedData, changes: r.Changes
      })));
    } catch(e) { console.error('exercise-activity:', e.message); res.json([]); }
  });

  // Alias for frontend compatibility
  app.get('/api/admin/exercise-audit', auth, async (req, res) => {
    try {
      const pool = await db.getPool();
      const r = await pool.request();
      let sql = `SELECT TOP 200 Id, ExerciseId, LecturerId, LecturerName, ExerciseTitle,
        Action, ActionTime, SubjectId, FormId, Details, CreatedAt, action_type,
        CreatedData, UpdatedData, DeletedData, Changes
        FROM EXERCISE_AUDIT_LOG WHERE 1=1`;
        
      if (!req.user.is_admin) {
        sql += ' AND (LecturerId = @myUid OR ExerciseId IN (SELECT MaBaiTap FROM BAITAP WHERE MaGiangVien = @myUid))';
        r.input('myUid', mssql.VarChar, req.user.lecturer_id);
      }
      
      sql += ' ORDER BY COALESCE(ActionTime, CreatedAt) DESC';
        
      const result = await r.query(sql);
      res.json(result.recordset.map(r => ({
        id: r.Id, exercise_id: r.ExerciseId, exercise_title: r.ExerciseTitle || r.ExerciseId,
        lecturer_id: r.LecturerId, lecturer_name: r.LecturerName,
        action: r.Action, timestamp: r.ActionTime || r.CreatedAt,
        subject_id: r.SubjectId, form_id: r.FormId, details: r.Details,
        action_type: r.action_type,
        created_data: r.CreatedData, updated_data: r.UpdatedData, deleted_data: r.DeletedData, changes: r.Changes
      })));
    } catch(e) { console.error('exercise-audit:', e.message); res.json([]); }
  });

  // ── Lecturers list (SQL column names) ──
  app.get('/api/admin/lecturers', auth, async (req, res) => {
    try {
      const pool = await db.getPool();
      const r = await pool.request().query(`
        SELECT 
          g.MaGiangVien, g.TenGiangVien, g.Quyen, g.TenDangNhap, g.Email, g.IsBlocked,
          (SELECT COUNT(*) FROM BAITAP WHERE MaGiangVien=g.MaGiangVien AND (IsDeleted=0 OR IsDeleted IS NULL)) AS ExerciseCount,
          (SELECT TOP 1 LoginTime FROM LOGIN_HISTORY WHERE LecturerId=g.MaGiangVien ORDER BY LoginTime DESC) AS LastLogin,
          (SELECT STRING_AGG(m.TenMon, ', ') FROM GIANGVIEN_MONHOC gm JOIN MONHOC m ON gm.MaMon = m.MaMon WHERE gm.MaGiangVien=g.MaGiangVien) AS SubjectList
        FROM GIANGVIEN g 
        ORDER BY g.MaGiangVien
      `);
      res.json(r.recordset);
    } catch(e) { res.status(500).json({ error: e.message }); }
  });

  // ── Lecturers stats (SQL column names) ──
  app.get('/api/admin/lecturers-stats', auth, async (req, res) => {
    try {
      const pool = await db.getPool();
      const r = await pool.request().query(`SELECT g.MaGiangVien, g.TenGiangVien,
        (SELECT COUNT(*) FROM BAITAP WHERE MaGiangVien=g.MaGiangVien AND (IsDeleted=0 OR IsDeleted IS NULL)) AS TongBaiTap,
        (SELECT COUNT(DISTINCT MaMon) FROM BAITAP WHERE MaGiangVien=g.MaGiangVien) AS SoMonHoc
        FROM GIANGVIEN g ORDER BY g.MaGiangVien`);
      res.json(r.recordset);
    } catch(e) { res.status(500).json({ error: e.message }); }
  });

  // ── Lecturer detail / profile / subjects / exercises ──
  app.get('/api/admin/lecturer/:id/detail', auth, async (req, res) => {
    try {
      const pool = await db.getPool();
      const id = req.params.id;

      // Basic info
      const infoR = await pool.request().input('id', mssql.VarChar, id)
        .query('SELECT MaGiangVien, TenGiangVien, TenDangNhap, Quyen, Email FROM GIANGVIEN WHERE MaGiangVien=@id');
      
      if (!infoR.recordset.length) return res.status(404).json({ error: 'Not found' });
      
      const gv = infoR.recordset[0];

      // Subjects assigned to this lecturer
      const subR = await pool.request().input('id', mssql.VarChar, id)
        .query(`SELECT gm.MaMon, m.TenMon, gm.VaiTro, gm.QuyenXem, gm.QuyenSua, gm.QuyenXoa
                FROM GIANGVIEN_MONHOC gm
                LEFT JOIN MONHOC m ON m.MaMon = gm.MaMon
                WHERE gm.MaGiangVien=@id`);
      
      gv.subjects = subR.recordset;

      res.json(gv);
    } catch(e) { res.status(500).json({ error: e.message }); }
  });

  app.get('/api/admin/lecturer/:id/profile', auth, async (req, res) => {
    try {
      const pool = await db.getPool();
      const id = req.params.id;

      // Info
      const infoR = await pool.request().input('id', mssql.VarChar, id)
        .query('SELECT MaGiangVien, TenGiangVien, TenDangNhap, Quyen FROM GIANGVIEN WHERE MaGiangVien=@id');
      if (!infoR.recordset.length) return res.status(404).json({ error: 'Not found' });
      const info = infoR.recordset[0];

      // Check if blocked
      const blockR = await pool.request().input('id', mssql.VarChar, id)
        .query("SELECT TOP 1 Action FROM LECTURER_BLOCK_LOG WHERE LecturerId=@id ORDER BY ActionTime DESC");
      info.IsBlocked = blockR.recordset.length > 0 && blockR.recordset[0].Action === 'LOCK';

      // Stats
      const statsR = await pool.request().input('id', mssql.VarChar, id)
        .query(`SELECT 
          (SELECT COUNT(*) FROM BAITAP WHERE MaGiangVien=@id AND (IsDeleted=0 OR IsDeleted IS NULL)) AS TotalEx,
          (SELECT COUNT(*) FROM BAITAP WHERE MaGiangVien=@id AND (IsDeleted=0 OR IsDeleted IS NULL) AND UpdatedAt >= DATEADD(day,-30,GETDATE())) AS ExLast30,
          (SELECT COUNT(DISTINCT MaMon) FROM BAITAP WHERE MaGiangVien=@id AND (IsDeleted=0 OR IsDeleted IS NULL)) AS SubjectCount,
          (SELECT COUNT(*) FROM LOGIN_HISTORY WHERE LecturerId=@id) AS TotalLogins`);
      const stats = statsR.recordset[0] || { TotalEx: 0, ExLast30: 0, SubjectCount: 0, TotalLogins: 0 };

      // Recent Logins
      const loginsR = await pool.request().input('id', mssql.VarChar, id)
        .query('SELECT TOP 5 LoginTime, LogoutTime, IsOnline, DurationMinutes FROM LOGIN_HISTORY WHERE LecturerId=@id ORDER BY LoginTime DESC');
      const recentLogins = loginsR.recordset;

      // Recent Exercises
      const exR = await pool.request().input('id', mssql.VarChar, id)
        .query(`SELECT TOP 5 b.MaBaiTap, b.TenBaiTap, m.TenMon, b.UpdatedAt
          FROM BAITAP b LEFT JOIN MONHOC m ON m.MaMon=b.MaMon
          WHERE b.MaGiangVien=@id AND (b.IsDeleted=0 OR b.IsDeleted IS NULL)
          ORDER BY b.UpdatedAt DESC`);
      const recentExercises = exR.recordset;

      res.json({ info, stats, recentLogins, recentExercises });
    } catch(e) { console.error('profile:', e.message); res.status(500).json({ error: e.message }); }
  });

  app.get('/api/admin/lecturer/:id/subjects', auth, async (req, res) => {
    try {
      const pool = await db.getPool();
      const r = await pool.request().input('id', mssql.VarChar, req.params.id)
        .query('SELECT gm.MaMon, m.TenMon, gm.VaiTro, gm.QuyenXem, gm.QuyenSua, gm.QuyenXoa FROM GIANGVIEN_MONHOC gm LEFT JOIN MONHOC m ON m.MaMon=gm.MaMon WHERE gm.MaGiangVien=@id');
      res.json(r.recordset);
    } catch(e) { res.status(500).json({ error: e.message }); }
  });

  app.post('/api/admin/lecturer/:id/subjects', auth, async (req, res) => {
    try {
      const pool = await db.getPool();
      const id = req.params.id;
      const subjects = req.body.subjects || []; // Array of { MaMon, VaiTro, QuyenXem, QuyenSua, QuyenXoa }
      
      const transaction = new mssql.Transaction(pool);
      await transaction.begin();
      try {
        const reqDel = new mssql.Request(transaction);
        await reqDel.input('id', mssql.VarChar, id).query('DELETE FROM GIANGVIEN_MONHOC WHERE MaGiangVien=@id');
        
        for (const sub of subjects) {
          const reqIns = new mssql.Request(transaction);
          await reqIns
            .input('id', mssql.VarChar, id)
            .input('mon', mssql.VarChar, sub.MaMon)
            .input('vt', mssql.NVarChar, sub.VaiTro || 'Giảng viên')
            .input('qx', mssql.Bit, sub.QuyenXem ? 1 : 0)
            .input('qs', mssql.Bit, sub.QuyenSua ? 1 : 0)
            .input('qxoa', mssql.Bit, sub.QuyenXoa ? 1 : 0)
            .query('INSERT INTO GIANGVIEN_MONHOC (MaGiangVien, MaMon, VaiTro, QuyenXem, QuyenSua, QuyenXoa) VALUES (@id, @mon, @vt, @qx, @qs, @qxoa)');
        }
        await transaction.commit();
        res.json({ success: true });
      } catch (err) {
        await transaction.rollback();
        throw err;
      }
    } catch(e) { res.status(500).json({ error: e.message }); }
  });

  app.get('/api/admin/lecturer/:id/exercises', auth, async (req, res) => {
    try {
      const pool = await db.getPool();
      const r = await pool.request().input('id', mssql.VarChar, req.params.id)
        .query(`SELECT b.MaBaiTap, b.TenBaiTap, b.MaDoKho, dk.TenDoKho, m.MaMon, m.TenMon, b.SkillLevel, b.UpdatedAt
          FROM BAITAP b LEFT JOIN DOKHO dk ON dk.MaDoKho=b.MaDoKho LEFT JOIN MONHOC m ON m.MaMon=b.MaMon
          WHERE b.MaGiangVien=@id AND (b.IsDeleted=0 OR b.IsDeleted IS NULL) ORDER BY b.UpdatedAt DESC`);
      res.json(r.recordset);
    } catch(e) { res.status(500).json({ error: e.message }); }
  });

  app.get('/api/admin/lecturer/:id/lock-history', auth, async (req, res) => {
    try {
      const pool = await db.getPool();
      const r = await pool.request().input('id', mssql.VarChar, req.params.id)
        .query('SELECT TOP 50 * FROM LECTURER_BLOCK_LOG WHERE LecturerId=@id ORDER BY ActionTime DESC');
      res.json(r.recordset);
    } catch(e) { res.json([]); }
  });

  // ── Lecturer CRUD ──
  app.post('/api/admin/lecturer/create', auth, async (req, res) => {
    try {
      const id = req.body.magv || req.body.lecturer_id;
      const name = req.body.ten || req.body.name;
      const password = req.body.pass || req.body.password || '123456';
      const role = req.body.role || 'Lecturer';
      const email = req.body.email || '';
      
      if (!id || !name) return res.status(400).json({ error: 'Thiếu Mã Giảng Viên hoặc Tên' });

      const pool = await db.getPool();
      const transaction = new mssql.Transaction(pool);
      await transaction.begin();

      try {
        const reqGV = new mssql.Request(transaction);
        await reqGV
          .input('id', mssql.VarChar, id)
          .input('name', mssql.NVarChar, name)
          .input('pw', mssql.VarChar, password)
          .input('role', mssql.VarChar, role)
          .input('login', mssql.VarChar, id)
          .input('email', mssql.VarChar, email)
          .query('INSERT INTO GIANGVIEN (MaGiangVien,TenGiangVien,TenDangNhap,MatKhau,Quyen,Email) VALUES (@id,@name,@login,@pw,@role,@email)');

        // Assign subjects if any
        if (req.body.subjects && Array.isArray(req.body.subjects) && req.body.subjects.length > 0) {
          const px = req.body.permXem ? 1 : 0;
          const ps = req.body.permSua ? 1 : 0;
          const pdel = req.body.permXoa ? 1 : 0;
          for (const sub of req.body.subjects) {
            const reqSub = new mssql.Request(transaction);
            await reqSub
              .input('id', mssql.VarChar, id)
              .input('mon', mssql.VarChar, sub)
              .input('px', mssql.Bit, px)
              .input('ps', mssql.Bit, ps)
              .input('pdel', mssql.Bit, pdel)
              .query('INSERT INTO GIANGVIEN_MONHOC (MaGiangVien, MaMon, VaiTro, QuyenXem, QuyenSua, QuyenXoa) VALUES (@id, @mon, N\'Giảng viên\', @px, @ps, @pdel)');
          }
        }
        await transaction.commit();
        res.json({ success: true });
      } catch (err) {
        await transaction.rollback();
        throw err;
      }
    } catch(e) { res.status(500).json({ error: e.message }); }
  });

  app.put('/api/admin/lecturer/:id/update', auth, async (req, res) => {
    try {
      const { newId, name, username, email, quyen, newPass } = req.body;

      // Self-protection: không cho admin hạ quyền của chính mình
      const selfId = req.user.lecturer_id || req.user.name;
      if (req.params.id === selfId && quyen && quyen.toLowerCase() !== 'admin') {
        return res.status(403).json({ error: 'Bạn không thể tự bỏ quyền Admin của chính mình.' });
      }

      const pool = await db.getPool();
      
      let query = 'UPDATE GIANGVIEN SET MaGiangVien=@newId, TenGiangVien=@name, TenDangNhap=@username, Email=@email, Quyen=@role';
      
      const reqPool = pool.request()
        .input('id', mssql.VarChar, req.params.id)
        .input('newId', mssql.VarChar, newId || req.params.id)
        .input('name', mssql.NVarChar, name)
        .input('username', mssql.NVarChar, username)
        .input('email', mssql.VarChar, email)
        .input('role', mssql.VarChar, quyen || 'lecturer');

      if (newPass) {
        query += ', MatKhau=@newPass';
        reqPool.input('newPass', mssql.VarChar, newPass);
      }

      query += ' WHERE MaGiangVien=@id';
      await reqPool.query(query);
      
      res.json({ success: true });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });

  app.post('/api/admin/lecturer/lock', auth, async (req, res) => {
    try {
      const { lecturer_id, reason, duration, blockUntil } = req.body;
      const pool = await db.getPool();
      const mssql = require('mssql');
      const transaction = new mssql.Transaction(pool);
      await transaction.begin();

      try {
        const r1 = new mssql.Request(transaction);
        await r1.input('id', mssql.VarChar, lecturer_id)
          .input('reason', mssql.NVarChar, reason || '')
          .input('by', mssql.VarChar, req.user.lecturer_id)
          .query(`INSERT INTO LECTURER_BLOCK_LOG (LecturerId, Action, Reason, BlockedBy, ActionTime, CreatedAt) VALUES (@id, N'LOCK', @reason, @by, GETDATE(), GETDATE())`);

        const r2 = new mssql.Request(transaction);
        await r2.input('id', mssql.VarChar, lecturer_id)
          .query(`UPDATE GIANGVIEN SET IsBlocked = 1 WHERE MaGiangVien = @id`);

        await transaction.commit();
        res.json({ success: true });
      } catch (err) {
        await transaction.rollback();
        throw err;
      }
    } catch(e) { res.status(500).json({ error: e.message }); }
  });

  app.post('/api/admin/lecturer/unlock', auth, async (req, res) => {
    try {
      const { lecturer_id } = req.body;
      const pool = await db.getPool();
      const mssql = require('mssql');
      const transaction = new mssql.Transaction(pool);
      await transaction.begin();

      try {
        const r1 = new mssql.Request(transaction);
        await r1.input('id', mssql.VarChar, lecturer_id)
          .input('by', mssql.VarChar, req.user.lecturer_id)
          .query(`INSERT INTO LECTURER_BLOCK_LOG (LecturerId, Action, Reason, BlockedBy, ActionTime, CreatedAt) VALUES (@id, N'UNLOCK', N'', @by, GETDATE(), GETDATE())`);

        const r2 = new mssql.Request(transaction);
        await r2.input('id', mssql.VarChar, lecturer_id)
          .query(`UPDATE GIANGVIEN SET IsBlocked = 0 WHERE MaGiangVien = @id`);

        await transaction.commit();
        res.json({ success: true });
      } catch (err) {
        await transaction.rollback();
        throw err;
      }
    } catch(e) { res.status(500).json({ error: e.message }); }
  });

  app.delete('/api/admin/lecturer/:id/delete', auth, async (req, res) => {
    try {
      // Self-protection: không cho admin tự xóa chính mình
      const selfId = req.user.lecturer_id || req.user.name;
      if (req.params.id === selfId) {
        return res.status(403).json({ error: 'Bạn không thể tự xóa tài khoản của chính mình.' });
      }

      const pool = await db.getPool();
      const mssql = require('mssql');
      const tx = new mssql.Transaction(pool);
      await tx.begin();
      try {
        const r = new mssql.Request(tx);
        r.input('id', mssql.VarChar, req.params.id);
        
        // Xoá các dữ liệu liên quan
        await r.query('DELETE FROM GIANGVIEN_MONHOC WHERE MaGiangVien=@id');
        await r.query('DELETE FROM LOGIN_HISTORY WHERE LecturerId=@id');
        await r.query('DELETE FROM LECTURER_BLOCK_LOG WHERE LecturerId=@id OR BlockedBy=@id');
        try { await r.query('DELETE FROM EXERCISE_AUDIT_LOG WHERE LecturerId=@id'); } catch(e){}
        try { await r.query('DELETE FROM FEEDBACK WHERE SenderId=@id OR ReceiverId=@id'); } catch(e){}
        
        // Thử cập nhật bài tập (có thể lỗi nếu database không cho phép NULL)
        try { await r.query('UPDATE BAITAP SET MaGiangVien = NULL WHERE MaGiangVien=@id'); } catch(e){}
        
        // Xoá giảng viên
        await r.query('DELETE FROM GIANGVIEN WHERE MaGiangVien=@id');
        
        await tx.commit();
        res.json({ success: true });
      } catch (err) {
        await tx.rollback();
        res.status(400).json({ error: 'Ràng buộc dữ liệu: Không thể xóa giảng viên này vì họ đang sở hữu bài tập. Xin hãy chuyển bài tập sang người khác hoặc dùng chức năng Khóa tài khoản.' });
      }
    } catch(e) { res.status(500).json({ error: e.message }); }
  });

  // ── Stats ──
  app.get('/api/admin/stats/distribution', auth, async (req, res) => {
    try {
      const pool = await db.getPool();
      // By Subject
      const subR = await pool.request().query(`SELECT m.MaMon AS mamon, m.TenMon AS label, COUNT(b.Id) AS value
        FROM MONHOC m INNER JOIN BAITAP b ON b.MaMon=m.MaMon AND (b.IsDeleted=0 OR b.IsDeleted IS NULL)
        GROUP BY m.MaMon, m.TenMon`);
      // By Level
      const lvlR = await pool.request().query(`SELECT SkillLevel AS label, COUNT(*) AS value
        FROM BAITAP WHERE (IsDeleted=0 OR IsDeleted IS NULL) GROUP BY SkillLevel ORDER BY SkillLevel`);
      // By Form (for type chart)
      const formR = await pool.request().query(`SELECT d.TenDangBai AS label, COUNT(b.Id) AS value
        FROM DANGBAI d INNER JOIN BAITAP b ON b.MaDangBai=d.MaDangBai AND (b.IsDeleted=0 OR b.IsDeleted IS NULL)
        GROUP BY d.TenDangBai`);
      res.json({
        bySubject: subR.recordset,
        byLevel: lvlR.recordset,
        byForm: formR.recordset
      });
    } catch(e) { console.error('dashboard stats:', e.message); res.json({}); }
  });

  // ── Stats: Type by Subject ──
  app.get('/api/admin/stats/type-by-subject', auth, async (req, res) => {
    try {
      const pool = await db.getPool();
      const mamon = req.query.mamon;
      let queryStr = `
        SELECT d.TenDangBai AS label, COUNT(b.Id) AS value
        FROM DANGBAI d 
        INNER JOIN BAITAP b ON b.MaDangBai = d.MaDangBai AND (b.IsDeleted = 0 OR b.IsDeleted IS NULL)
      `;
      const request = pool.request();
      if (mamon) {
        queryStr += ` WHERE b.MaMon = @mamon `;
        request.input('mamon', require('mssql').NVarChar, mamon);
      }
      queryStr += ` GROUP BY d.TenDangBai`;
      const r = await request.query(queryStr);
      res.json(r.recordset);
    } catch (e) {
      console.error('type-by-subject error:', e.message);
      res.json([]);
    }
  });

  // ── Skill Levels detail ──
  app.get('/api/admin/stats/skill-levels', auth, async (req, res) => {
    try {
      const pool = await db.getPool();
      const r = await pool.request().query(`SELECT SkillLevel AS Level, COUNT(*) AS Count FROM BAITAP WHERE (IsDeleted=0 OR IsDeleted IS NULL) GROUP BY SkillLevel ORDER BY SkillLevel`);
      res.json(r.recordset);
    } catch(e) { res.status(500).json({ error: e.message }); }
  });

  app.get('/api/admin/stats/total-students-active', auth, async (req, res) => {
    try {
      const pool = await db.getPool();
      const r = await pool.request().query('SELECT COUNT(DISTINCT student_id) AS count FROM grading_history');
      res.json({ count: r.recordset[0]?.count || 0 });
    } catch(e) { res.json({ count: 0 }); }
  });

  // ── Charts ──
  app.get('/api/admin/chart/exercises-per-subject', auth, async (req, res) => {
    try {
      const pool = await db.getPool();
      const r = await pool.request().query(`SELECT m.TenMon AS label, COUNT(b.Id) AS value
        FROM MONHOC m INNER JOIN BAITAP b ON b.MaMon=m.MaMon AND (b.IsDeleted=0 OR b.IsDeleted IS NULL)
        GROUP BY m.TenMon`);
      res.json(r.recordset);
    } catch(e) { res.json([]); }
  });

  app.get('/api/admin/chart/login-activity', auth, async (req, res) => {
    try {
      const pool = await db.getPool();
      let { month } = req.query;
      let y, m;
      if (month) {
        [y, m] = month.split('-');
      } else {
        const d = new Date();
        y = d.getFullYear();
        m = d.getMonth() + 1;
      }
      y = parseInt(y);
      m = parseInt(m);

      const request = pool.request();
      request.input('y', mssql.Int, y);
      request.input('m', mssql.Int, m);
      
      const r = await request.query(`
        SELECT 
          CONVERT(varchar(10), submitted_at, 120) AS day,
          COUNT(*) AS count,
          COUNT(DISTINCT student_id) AS uniqueCount
        FROM grading_history 
        WHERE YEAR(submitted_at) = @y AND MONTH(submitted_at) = @m
        GROUP BY CONVERT(varchar(10), submitted_at, 120) 
      `);
      
      const rowMap = {};
      r.recordset.forEach(row => { rowMap[row.day] = row; });

      const numDays = new Date(y, m, 0).getDate();
      const monthStr = String(m).padStart(2, '0');
      const resultData = [];
      for (let i = 1; i <= numDays; i++) {
        const dayStr = `${y}-${monthStr}-${String(i).padStart(2, '0')}`;
        const row = rowMap[dayStr];
        resultData.push({
          day: dayStr,
          date: dayStr,
          count: row ? row.count : 0,
          uniqueCount: row ? row.uniqueCount : 0
        });
      }

      res.json(resultData);
    } catch(e) { console.error('chart login-activity:', e.message); res.json([]); }
  });

  // ── Login history ──
  app.get('/api/admin/login-history', auth, async (req, res) => {
    try {
      const { date, magv, status } = req.query;
      const pool = await db.getPool();
      // Use CONVERT to format dates as plain strings → avoids JS double UTC offset
      let sql = `SELECT TOP 100 h.Id, h.LecturerId AS MaGiangVien, g.TenGiangVien,
                 CONVERT(varchar(19), h.LoginTime, 120) AS LoginTime,
                 CONVERT(varchar(19), h.LogoutTime, 120) AS LogoutTime,
                 h.DurationMinutes AS DurationMin, h.IsOnline
                 FROM LOGIN_HISTORY h
                 LEFT JOIN GIANGVIEN g ON h.LecturerId = g.MaGiangVien
                 WHERE 1=1`;
      const request = pool.request();
      if (date) {
        sql += ` AND CAST(h.LoginTime AS DATE) = @date`;
        request.input('date', mssql.Date, date);
      }
      if (magv) {
        sql += ` AND h.LecturerId = @magv`;
        request.input('magv', mssql.VarChar, magv);
      }
      if (status === 'online') {
        sql += ` AND h.IsOnline = 1`;
      } else if (status === 'offline') {
        sql += ` AND h.IsOnline = 0`;
      }
      sql += ` ORDER BY h.LoginTime DESC`;
      
      const r = await request.query(sql);
      res.json(r.recordset);
    } catch(e) { console.error('login history error:', e.message); res.json([]); }
  });

  // ── Students list with pagination ──
  app.get('/api/admin/students', auth, async (req, res) => {
    try {
      const pool = await db.getPool();
      const { search, lop, page, limit } = req.query;
      const pg = parseInt(page) || 1;
      const lim = parseInt(limit) || 20;

      let where = '1=1';
      const r = pool.request();
      if (search) { where += ' AND (CAST(s.student_id AS VARCHAR) LIKE @q OR s.name LIKE @q)'; r.input('q', mssql.NVarChar, '%'+search+'%'); }
      if (lop) { where += ' AND s.class = @lop'; r.input('lop', mssql.NVarChar, lop); }

      const allSql = `SELECT s.student_id, s.name, s.class, s.khoa, s.total_score,
        s.midterm_score, s.final_score, s.assignment_completion, s.attendance_rate,
        (SELECT COUNT(*) FROM grading_history h WHERE h.student_id = CAST(s.student_id AS VARCHAR)) AS LanNop,
        (SELECT AVG(h.total_score) FROM grading_history h WHERE h.student_id = CAST(s.student_id AS VARCHAR)) AS DiemTB
        FROM students s WHERE ${where} ORDER BY s.student_id`;
      const result = await r.query(allSql);
      const all = result.recordset;

      // Stats
      const classSet = new Set(all.map(s => s.class).filter(Boolean));
      const khoaSet = new Set(all.map(s => s.khoa).filter(Boolean));
      const completed = all.filter(s => s.assignment_completion > 0.8).length;

      // Paginate
      const total = all.length;
      const pages = Math.ceil(total / lim) || 1;
      const data = all.slice((pg - 1) * lim, pg * lim);

      res.json({
        stats: { total, classes: classSet.size, faculties: khoaSet.size, completed },
        data: data.map(s => ({
          student_id: s.student_id, 
          name: s.name, 
          class: s.class, 
          khoa: s.khoa,
          submission_count: s.LanNop || 0, 
          avg_score: s.DiemTB ? Math.round(s.DiemTB * 10) / 10 : 0,
          assignment_completion: s.assignment_completion ? Math.round(s.assignment_completion * 100) : 0
        })),
        pagination: { page: pg, pages, total, limit: lim }
      });
    } catch(e) { console.error('students:', e.message); res.status(500).json({ error: e.message }); }
  });

  // ── Students ──
  app.get('/api/admin/students/classes', auth, async (req, res) => {
    try {
      const pool = await db.getPool();
      const r = await pool.request().query('SELECT DISTINCT class FROM students WHERE class IS NOT NULL ORDER BY class');
      res.json(r.recordset.map(row => row.class));
    } catch(e) { res.json([]); }
  });

  app.get('/api/admin/student/:id/history', auth, async (req, res) => {
    try {
      const pool = await db.getPool();
      const sid = req.params.id;
      // Get student info
      const sR = await pool.request().input('id', mssql.Int, parseInt(sid))
        .query('SELECT student_id, name, class, khoa, sex, total_score, midterm_score, final_score, assignment_completion FROM students WHERE student_id=@id');
      const student = sR.recordset[0] || { student_id: sid, name: 'SV #' + sid };
      // Get history with exercise info
      const hR = await pool.request().input('id_str', mssql.VarChar, String(sid))
        .query(`SELECT h.id, h.assignment_code, b.TenBaiTap, m.TenMon, h.total_score, h.submitted_at, h.plagiarism_detected
          FROM grading_history h
          LEFT JOIN BAITAP b ON b.MaBaiTap = h.assignment_code
          LEFT JOIN MONHOC m ON m.MaMon = b.MaMon
          WHERE h.student_id = @id_str ORDER BY h.id DESC`);
      res.json({ student, history: hR.recordset });
    } catch(e) { console.error('student history:', e.message); res.json({ student: {}, history: [] }); }
  });

  // ── Subject create ──
  app.post('/api/admin/subjects/create', auth, async (req, res) => {
    try {
      // Support both naming conventions: mamon/tenmon (frontend) and subject_id/subject_name (legacy)
      const mamon   = req.body.mamon   || req.body.subject_id;
      const tenmon  = req.body.tenmon  || req.body.subject_name;
      if (!mamon || !tenmon) return res.status(400).json({ error: 'Thiếu Mã Môn hoặc Tên Môn' });
      const pool = await db.getPool();
      await pool.request().input('id', mssql.VarChar, mamon).input('name', mssql.NVarChar, tenmon)
        .query('INSERT INTO MONHOC (MaMon,TenMon) VALUES (@id,@name)');
      res.json({ success: true, MaMon: mamon, TenMon: tenmon });
    } catch(e) {
      if (e.message && e.message.includes('PRIMARY KEY')) {
        return res.status(409).json({ error: `Mã môn "${req.body.mamon || req.body.subject_id}" đã tồn tại` });
      }
      res.status(500).json({ error: e.message });
    }
  });

  // ── Export ──
  app.post('/api/admin/export/exercises', auth, async (req, res) => {
    try {
      const { format, mamon, exercise_ids } = req.body;
      const pool = await db.getPool();
      let sql = `SELECT b.MaBaiTap, b.TenBaiTap, b.MaDoKho, dk.TenDoKho, b.MaDangBai, d.TenDangBai,
        b.MoTa, b.YeuCau, b.TieuChiChamDiem, b.FileDinhKem, b.SkillLevel, b.UpdatedAt, b.MaMon, m.TenMon
        FROM BAITAP b 
        LEFT JOIN DOKHO dk ON dk.MaDoKho = b.MaDoKho 
        LEFT JOIN DANGBAI d ON d.MaDangBai = b.MaDangBai
        LEFT JOIN MONHOC m ON m.MaMon = b.MaMon
        WHERE (b.IsDeleted=0 OR b.IsDeleted IS NULL)`;
        
      if (Array.isArray(exercise_ids) && exercise_ids.length > 0) {
        sql += ` AND b.MaBaiTap IN (${exercise_ids.map(id => `'${id.replace(/'/g, "''")}'`).join(',')})`;
      } else if (mamon) {
        sql += ` AND b.MaMon = '${mamon.replace(/'/g, "''")}'`;
      }
      const r = await pool.request().query(sql);
      const rows = r.recordset;

      try {
        await pool.request()
          .input('uid', mssql.VarChar, req.user.lecturer_id || req.user.name || 'Admin')
          .input('role', mssql.VarChar, 'Admin')
          .input('type', mssql.VarChar, 'exercises')
          .input('fmt', mssql.VarChar, format || 'xlsx')
          .input('num', mssql.Int, rows.length)
          .query(`INSERT INTO EXPORT_LOG (exported_by, role, export_type, format, row_count, exported_at)
                  VALUES (@uid, @role, @type, @fmt, @num, GETDATE())`);
      } catch (e) { console.error('EXPORT LOG ERROR:', e); }

      const ExcelJS = require('exceljs');
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('Danh_Sach_Bai_Tap');
      
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

      rows.forEach(row => {
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
      
      // Styling
      sheet.getRow(1).font = { bold: true };
      sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD3D3D3' } };
      
      // Lock the MaBaiTap column visually
      sheet.getColumn('id').font = { color: { argb: 'FF888888' }, italic: true };

      if (format === 'pdf') {
        const pdfService = require('./pdf-service');
        await pdfService.exportExercisesAsPDF(res, rows, 'DANH SÁCH BÀI TẬP');
      } else if (format === 'csv') {
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename="BaiTap.csv"');
        await workbook.csv.write(res);
        res.end();
      } else {
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="BaiTap.xlsx"');
        await workbook.xlsx.write(res);
        res.end();
      }
    } catch(e) { res.status(500).json({ error: e.message }); }
  });

  app.post('/api/admin/export/students', auth, async (req, res) => {
    try {
      const { format, lop, student_ids } = req.body;
      const pool = await db.getPool();
      let sql = `SELECT student_id, name, class, khoa, sex, total_score, assignment_completion FROM students`;
      
      if (Array.isArray(student_ids) && student_ids.length > 0) {
        sql += ` WHERE student_id IN (${student_ids.map(id => `'${id.replace(/'/g, "''")}'`).join(',')})`;
      } else if (lop) {
        sql += ` WHERE class = '${lop.replace(/'/g, "''")}'`;
      }
      const r = await pool.request().query(sql);
      const rows = r.recordset;

      try {
        await pool.request()
          .input('uid', mssql.VarChar, req.user.lecturer_id || req.user.name || 'Admin')
          .input('role', mssql.VarChar, 'Admin')
          .input('type', mssql.VarChar, 'students')
          .input('fmt', mssql.VarChar, format || 'xlsx')
          .input('num', mssql.Int, rows.length)
          .query(`INSERT INTO EXPORT_LOG (exported_by, role, export_type, format, row_count, exported_at)
                  VALUES (@uid, @role, @type, @fmt, @num, GETDATE())`);
      } catch (e) { console.error('EXPORT LOG ERROR:', e); }

      const ExcelJS = require('exceljs');
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('Danh_Sach_Sinh_Vien');
      
      sheet.columns = [
        { header: 'Mã Sinh Viên', key: 'student_id', width: 15 },
        { header: 'Họ Tên', key: 'name', width: 30 },
        { header: 'Lớp', key: 'class', width: 15 },
        { header: 'Khoa', key: 'khoa', width: 30 },
        { header: 'Giới tính', key: 'sex', width: 10 },
        { header: 'Tổng điểm', key: 'total_score', width: 15 },
        { header: 'Tỷ lệ hoàn thành (%)', key: 'assignment_completion', width: 20 },
      ];
      
      sheet.addRows(rows);
      sheet.getRow(1).font = { bold: true };
      sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD3D3D3' } };

      if (format === 'pdf') {
        const pdfService = require('./pdf-service');
        const pdfHeaders = [
          { label: 'MSSV', property: 'student_id', width: 70 },
          { label: 'Họ Tên', property: 'name', width: 140 },
          { label: 'Lớp', property: 'class', width: 70 },
          { label: 'Khoa', property: 'khoa', width: 120 },
          { label: 'Giới tính', property: 'sex', width: 50 },
          { label: 'Điểm', property: 'total_score', width: 40 },
          { label: 'Hoàn thành (%)', property: 'assignment_completion', width: 70 }
        ];
        const pdfRows = rows.map(r => ({
          student_id: r.student_id || '—',
          name: r.name || '—',
          class: r.class || '—',
          khoa: r.khoa || '—',
          sex: r.sex || '—',
          total_score: (r.total_score || 0).toString(),
          assignment_completion: (r.assignment_completion || 0).toString()
        }));
        await pdfService.exportTableAsPDF(res, pdfHeaders, pdfRows, 'DANH SÁCH SINH VIÊN');
      } else if (format === 'csv') {
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename="students.csv"');
        res.write('\ufeff'); // BOM for UTF-8 Excel support
        await workbook.csv.write(res);
        res.end();
      } else {
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="students.xlsx"');
        await workbook.xlsx.write(res);
        res.end();
      }
    } catch(e) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/admin/export/grades', auth, async (req, res) => {
    try {
      const { format, mamon, history_ids } = req.body;
      const pool = await db.getPool();
      let sql = `SELECT h.id, h.student_id, h.student_name, h.assignment_code, b.TenBaiTap, h.total_score, h.status, h.plagiarism_detected, h.submitted_at
                 FROM grading_history h
                 LEFT JOIN BAITAP b ON h.assignment_code = b.MaBaiTap`;
                 
      if (Array.isArray(history_ids) && history_ids.length > 0) {
        sql += ` WHERE h.id IN (${history_ids.join(',')})`;
      } else if (mamon) {
        sql += ` WHERE b.MaMon = '${mamon.replace(/'/g, "''")}'`;
      }
      sql += ` ORDER BY h.submitted_at DESC`;
      const r = await pool.request().query(sql);
      const rows = r.recordset;

      try {
        await pool.request()
          .input('uid', mssql.VarChar, req.user.lecturer_id || req.user.name || 'Admin')
          .input('role', mssql.VarChar, 'Admin')
          .input('type', mssql.VarChar, 'grades')
          .input('fmt', mssql.VarChar, format || 'xlsx')
          .input('num', mssql.Int, rows.length)
          .query(`INSERT INTO EXPORT_LOG (exported_by, role, export_type, format, row_count, exported_at)
                  VALUES (@uid, @role, @type, @fmt, @num, GETDATE())`);
      } catch (e) { console.error('EXPORT LOG ERROR:', e); }

      const ExcelJS = require('exceljs');
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('Diem_Nop_Bai');
      
      sheet.columns = [
        { header: 'Mã Sinh Viên', key: 'student_id', width: 15 },
        { header: 'Họ Tên', key: 'student_name', width: 30 },
        { header: 'Mã Bài Tập', key: 'assignment_code', width: 15 },
        { header: 'Tên Bài Tập', key: 'TenBaiTap', width: 30 },
        { header: 'Điểm Số', key: 'total_score', width: 15 },
        { header: 'Đạo văn', key: 'plagiarism_detected', width: 15 },
        { header: 'Trạng thái', key: 'status', width: 15 },
        { header: 'Ngày nộp', key: 'submitted_at', width: 25 },
      ];
      
      const formattedRows = rows.map(r => ({
        ...r,
        submitted_at: r.submitted_at ? new Date(r.submitted_at).toLocaleString('vi-VN') : ''
      }));
      sheet.addRows(formattedRows);
      sheet.getRow(1).font = { bold: true };
      sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD3D3D3' } };

      if (format === 'pdf') {
        const pdfService = require('./pdf-service');
        const pdfHeaders = [
          { label: 'MSSV', property: 'student_id', width: 60 },
          { label: 'Họ Tên', property: 'student_name', width: 120 },
          { label: 'Mã BT', property: 'assignment_code', width: 60 },
          { label: 'Tên BT', property: 'TenBaiTap', width: 120 },
          { label: 'Điểm', property: 'total_score', width: 40 },
          { label: 'Đạo văn', property: 'plagiarism_detected', width: 50 },
          { label: 'Trạng thái', property: 'status', width: 60 },
          { label: 'Ngày nộp', property: 'submitted_at', width: 80 }
        ];
        const pdfRows = formattedRows.map(r => ({
          student_id: r.student_id || '—',
          student_name: r.student_name || '—',
          assignment_code: r.assignment_code || '—',
          TenBaiTap: r.TenBaiTap || '—',
          total_score: (r.total_score || 0).toString(),
          plagiarism_detected: r.plagiarism_detected ? 'Có' : 'Không',
          status: r.status || '—',
          submitted_at: r.submitted_at || '—'
        }));
        await pdfService.exportTableAsPDF(res, pdfHeaders, pdfRows, 'ĐIỂM NỘP BÀI');
      } else if (format === 'csv') {
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename="grades.csv"');
        res.write('\ufeff');
        await workbook.csv.write(res);
        res.end();
      } else {
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="grades.xlsx"');
        await workbook.xlsx.write(res);
        res.end();
      }
    } catch(e) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get('/api/admin/students/list', auth, async (req, res) => {
    try {
      const pool = await db.getPool();
      const r = await pool.request().query('SELECT * FROM students ORDER BY class, name');
      res.json(r.recordset);
    } catch(e) { res.status(500).json({ error: e.message }); }
  });

  app.get('/api/admin/grades/list', auth, async (req, res) => {
    try {
      const pool = await db.getPool();
      const r = await pool.request().query(`
        SELECT h.*, b.MaMon, b.TenBaiTap 
        FROM grading_history h 
        LEFT JOIN BAITAP b ON h.assignment_code = b.MaBaiTap
        ORDER BY h.submitted_at DESC
      `);
      res.json(r.recordset);
    } catch(e) { res.status(500).json({ error: e.message }); }
  });

  // ── Import Excel ──
  const multer = require('multer');
  const upload = multer({ dest: 'uploads/' });
  const fs = require('fs');

  app.post('/api/admin/import/preview', auth, upload.single('file'), async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ error: 'Không tìm thấy file Excel' });
      const ExcelJS = require('exceljs');
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(req.file.path);
      const sheet = workbook.worksheets[0];
      if (!sheet) return res.status(400).json({ error: 'File Excel không có dữ liệu' });

      const parsedData = [];
      sheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // Bỏ qua dòng tiêu đề
        const id = row.getCell(1).text || '';
        const title = row.getCell(2).text || '';
        if (!title && !id) return; // Bỏ qua dòng trống hoàn toàn
        
        parsedData.push({
          row: rowNumber,
          MaBaiTap: id,
          TenBaiTap: title,
          MaMon: row.getCell(3).text || '',
          MaDangBai: row.getCell(4).text || '',
          MaDoKho: row.getCell(5).text || '',
          SkillLevel: row.getCell(6).text || '',
          MoTa: row.getCell(7).text || '',
          YeuCau: row.getCell(8).text || '',
          TieuChiChamDiem: row.getCell(9).text || '',
          FileDinhKem: row.getCell(10).text || '',
          action: id ? 'UPDATE' : 'INSERT',
          status: title ? 'VALID' : 'INVALID_NO_TITLE'
        });
      });

      fs.unlinkSync(req.file.path); // Xóa file tạm
      res.json({ success: true, preview: parsedData });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });

  app.post('/api/admin/import/confirm', auth, async (req, res) => {
    try {
      const { data } = req.body;
      if (!Array.isArray(data) || !data.length) return res.status(400).json({ error: 'Dữ liệu trống' });
      
      const pool = await db.getPool();
      let updated = 0; let inserted = 0;

      for (const item of data) {
        // Đảm bảo TieuChiChamDiem luôn là chuỗi JSON hợp lệ (ví dụ: "[]")
        let safeCrit = '[]';
        try {
          if (item.TieuChiChamDiem && typeof item.TieuChiChamDiem === 'string' && item.TieuChiChamDiem.trim() !== '') {
            JSON.parse(item.TieuChiChamDiem);
            safeCrit = item.TieuChiChamDiem;
          }
        } catch (e) { safeCrit = '[]'; }

        if (item.action === 'UPDATE' && item.MaBaiTap) {
          await pool.request()
            .input('id', mssql.VarChar, item.MaBaiTap)
            .input('title', mssql.NVarChar, item.TenBaiTap)
            .input('mon', mssql.VarChar, item.MaMon)
            .input('dang', mssql.Int, parseInt(item.MaDangBai) || null)
            .input('kho', mssql.VarChar, item.MaDoKho)
            .input('skill', mssql.Int, parseInt(item.SkillLevel) || null)
            .input('desc', mssql.NVarChar, item.MoTa)
            .input('req', mssql.NVarChar, item.YeuCau)
            .input('crit', mssql.NVarChar, safeCrit)
            .input('files', mssql.NVarChar, item.FileDinhKem)
            .query(`UPDATE BAITAP SET 
              TenBaiTap=@title, MaMon=@mon, MaDangBai=@dang, MaDoKho=@kho, SkillLevel=@skill,
              MoTa=@desc, YeuCau=@req, TieuChiChamDiem=@crit, FileDinhKem=@files, UpdatedAt=GETDATE()
              WHERE MaBaiTap=@id`);
          updated++;
        } else if (item.action === 'INSERT') {
          let nextId = `NEW_${Date.now()}_${Math.floor(Math.random()*1000)}`;
          try {
            const idObj = await db.getNextExerciseId(item.MaMon, item.MaDangBai);
            if (idObj && idObj.nextId) nextId = idObj.nextId;
          } catch(err) {}

          await pool.request()
            .input('id', mssql.VarChar, nextId)
            .input('title', mssql.NVarChar, item.TenBaiTap)
            .input('mon', mssql.VarChar, item.MaMon)
            .input('dang', mssql.Int, parseInt(item.MaDangBai) || null)
            .input('kho', mssql.VarChar, item.MaDoKho)
            .input('skill', mssql.Int, parseInt(item.SkillLevel) || null)
            .input('desc', mssql.NVarChar, item.MoTa)
            .input('req', mssql.NVarChar, item.YeuCau)
            .input('crit', mssql.NVarChar, safeCrit)
            .input('files', mssql.NVarChar, item.FileDinhKem)
            .input('gv', mssql.VarChar, req.user.lecturer_id || 'ADMIN')
            .query(`INSERT INTO BAITAP (MaBaiTap, TenBaiTap, MaMon, MaDangBai, MaDoKho, SkillLevel, MoTa, YeuCau, TieuChiChamDiem, FileDinhKem, MaGiangVien, IsDeleted, UpdatedAt, CreatedAt)
              VALUES (@id, @title, @mon, @dang, @kho, @skill, @desc, @req, @crit, @files, @gv, 0, GETDATE(), GETDATE())`);
          inserted++;
        }
      }
      
      try {
        await pool.request()
          .input('uid', mssql.VarChar, req.user.lecturer_id || req.user.name || 'Admin')
          .input('role', mssql.VarChar, 'Admin')
          .input('type', mssql.VarChar, 'import_exercises')
          .input('fmt', mssql.VarChar, 'xlsx')
          .input('num', mssql.Int, updated + inserted)
          .query(`INSERT INTO EXPORT_LOG (exported_by, role, export_type, format, row_count, exported_at)
                  VALUES (@uid, @role, @type, @fmt, @num, GETDATE())`);
      } catch (e) { console.error('log import error', e); }

      res.json({ success: true, updated, inserted });
    } catch(e) { res.status(500).json({ error: e.message }); }
  });

  app.get('/api/admin/export/log', auth, async (req, res) => {
    try {
      const pool = await db.getPool();
      const r = await pool.request().query('SELECT TOP 100 * FROM EXPORT_LOG ORDER BY exported_at DESC');
      res.json(r.recordset);
    } catch(e) { console.error('export log error', e); res.json([]); }
  });

  // Lecturer-scoped export log — only records belonging to the current lecturer
  app.get('/api/lecturer/export/log', auth, async (req, res) => {
    try {
      const pool = await db.getPool();
      const gvId = req.user.lecturer_id || req.user.name;
      const r = await pool.request()
        .input('gv', mssql.VarChar, gvId)
        .query('SELECT TOP 100 * FROM EXPORT_LOG WHERE exported_by=@gv ORDER BY exported_at DESC');
      res.json(r.recordset);
    } catch(e) { console.error('lecturer export log error', e); res.json([]); }
  });

  app.get('/api/admin/export/:type', auth, async (req, res) => {
    try { res.json(await db.getAllSubjects()); } catch(e) { res.status(500).json({ error: e.message }); }
  });

  // ── Submissions by date ──
  app.get('/api/admin/submissions-by-date/:date', auth, async (req, res) => {
    try {
      const pool = await db.getPool();
      const r = await pool.request().input('d', mssql.Date, req.params.date)
        .query(`
          SELECT 
            h.student_id AS student_id,
            h.student_name AS student_name,
            h.assignment_code AS assignment_code,
            b.TenBaiTap AS TenBaiTap,
            h.total_score AS total_score,
            h.submitted_at AS submitted_at
          FROM grading_history h
          LEFT JOIN BAITAP b ON h.assignment_code = b.MaBaiTap
          WHERE CAST(h.submitted_at AS DATE) = @d
          ORDER BY h.submitted_at DESC
        `);
      res.json(r.recordset);
    } catch(e) { console.error('submissions-by-date:', e.message); res.json([]); }
  });

  // ── Exercises filter ──
  app.get('/api/admin/exercises/filter', auth, async (req, res) => {
    try {
      const { type, value } = req.query;
      const pool = await db.getPool();
      const r = pool.request();
      let where = '(b.IsDeleted=0 OR b.IsDeleted IS NULL)';
      if (type === 'subject') { where += ' AND (b.MaMon=@v OR m.TenMon=@v)'; r.input('v', mssql.NVarChar, value); }
      else if (type === 'difficulty') { where += ' AND dk.TenDoKho=@v'; r.input('v', mssql.NVarChar, value); }
      else if (type === 'lecturer') { where += ' AND (b.MaGiangVien=@v OR gv.TenGiangVien=@v)'; r.input('v', mssql.NVarChar, value); }
      else if (type === 'level') { where += ' AND b.SkillLevel=@v'; r.input('v', mssql.Int, parseInt(value)); }
      else if (type === 'form') { where += ' AND d.TenDangBai=@v'; r.input('v', mssql.NVarChar, value); }
      const result = await r.query(`SELECT b.Id, b.MaBaiTap, b.TenBaiTap, b.MaDoKho, dk.TenDoKho,
        m.MaMon, m.TenMon, b.MaGiangVien, gv.TenGiangVien, b.SkillLevel,
        d.TenDangBai, b.UpdatedAt
        FROM BAITAP b LEFT JOIN DOKHO dk ON dk.MaDoKho=b.MaDoKho
        LEFT JOIN MONHOC m ON m.MaMon=b.MaMon
        LEFT JOIN GIANGVIEN gv ON gv.MaGiangVien=b.MaGiangVien
        LEFT JOIN DANGBAI d ON d.MaDangBai=b.MaDangBai
        WHERE ${where} ORDER BY b.UpdatedAt DESC`);
      res.json(result.recordset);
    } catch(e) { res.json([]); }
  });

  // ==================================================
  // SUBJECT REQUESTS
  // ==================================================
  app.get('/api/admin/subject-requests', auth, async (req, res) => {
    try {
      const pool = await db.getPool();
      const r = await pool.request()
        .query(`SELECT r.*, gv.TenGiangVien 
                FROM YEUCAU_MONHOC r 
                LEFT JOIN GIANGVIEN gv ON r.LecturerId = gv.MaGiangVien 
                ORDER BY r.CreatedAt DESC`);
      res.json(r.recordset);
    } catch(e) { res.status(500).json({error: e.message}); }
  });

  app.post('/api/admin/subject-requests/:id/approve', auth, async (req, res) => {
    try {
      const pool = await db.getPool();
      const reqId = req.params.id;
      // Get request details
      const reqInfoR = await pool.request().input('id', mssql.Int, reqId).query("SELECT * FROM YEUCAU_MONHOC WHERE Id=@id");
      if (reqInfoR.recordset.length === 0) return res.status(404).json({error: 'Không tìm thấy yêu cầu'});
      const requestData = reqInfoR.recordset[0];
      
      if (requestData.Status !== 'PENDING') return res.status(400).json({error: 'Yêu cầu này đã được xử lý'});

      const { permissions } = req.body; // e.g. { CanView: 1, CanAdd: 1, CanEdit: 1, CanDelete: 0 }

      const transaction = new mssql.Transaction(pool);
      await transaction.begin();
      try {
        if (requestData.ActionType === 'ADD') {
          // 1. Ensure subject exists in MONHOC
          const checkMonR = await transaction.request()
            .input('code', mssql.VarChar, requestData.SubjectCode)
            .query("SELECT * FROM MONHOC WHERE MaMon=@code");
          if (checkMonR.recordset.length === 0) {
            await transaction.request()
              .input('code', mssql.VarChar, requestData.SubjectCode)
              .input('name', mssql.NVarChar, requestData.SubjectName)
              .query("INSERT INTO MONHOC (MaMon, TenMon) VALUES (@code, @name)");
          }

          // 2. Grant permissions
          // Check if already assigned
          const checkAssignedR = await transaction.request()
            .input('gv', mssql.VarChar, requestData.LecturerId)
            .input('code', mssql.VarChar, requestData.SubjectCode)
            .query("SELECT * FROM GIANGVIEN_MONHOC WHERE MaGiangVien=@gv AND MaMon=@code");
            
          const quyenXem = 1; // Mặc định luôn có quyền xem
          const quyenSua = permissions?.CanEdit ? 1 : 0;
          const quyenXoa = permissions?.CanDelete ? 1 : 0;

          if (checkAssignedR.recordset.length === 0) {
            await transaction.request()
              .input('gv', mssql.VarChar, requestData.LecturerId)
              .input('code', mssql.VarChar, requestData.SubjectCode)
              .input('v', mssql.Bit, quyenXem)
              .input('e', mssql.Bit, quyenSua)
              .input('d', mssql.Bit, quyenXoa)
              .query(`INSERT INTO GIANGVIEN_MONHOC (MaGiangVien, MaMon, QuyenXem, QuyenSua, QuyenXoa) 
                      VALUES (@gv, @code, @v, @e, @d)`);
          } else {
            await transaction.request()
              .input('gv', mssql.VarChar, requestData.LecturerId)
              .input('code', mssql.VarChar, requestData.SubjectCode)
              .input('v', mssql.Bit, quyenXem)
              .input('e', mssql.Bit, quyenSua)
              .input('d', mssql.Bit, quyenXoa)
              .query(`UPDATE GIANGVIEN_MONHOC SET QuyenXem=@v, QuyenSua=@e, QuyenXoa=@d 
                      WHERE MaGiangVien=@gv AND MaMon=@code`);
          }
        } else if (requestData.ActionType === 'REMOVE') {
          // Check < 10 exercises
          const countR = await transaction.request()
            .input('gv', mssql.VarChar, requestData.LecturerId)
            .input('code', mssql.VarChar, requestData.SubjectCode)
            .query("SELECT COUNT(*) as count FROM BAITAP WHERE MaGiangVien=@gv AND MaMon=@code AND (IsDeleted=0 OR IsDeleted IS NULL)");
          
          if (countR.recordset[0].count >= 10) {
             throw new Error('Môn học này đang có 10 bài tập trở lên, không thể xóa quyền phụ trách.');
          }
          
          // Remove from GIANGVIEN_MONHOC
          await transaction.request()
            .input('gv', mssql.VarChar, requestData.LecturerId)
            .input('code', mssql.VarChar, requestData.SubjectCode)
            .query("DELETE FROM GIANGVIEN_MONHOC WHERE MaGiangVien=@gv AND MaMon=@code");
        }

        // Update Request Status
        await transaction.request()
          .input('id', mssql.Int, reqId)
          .query("UPDATE YEUCAU_MONHOC SET Status='APPROVED', UpdatedAt=GETDATE() WHERE Id=@id");

        await transaction.commit();
        res.json({success: true});
      } catch (err) {
        await transaction.rollback();
        res.status(400).json({error: err.message});
      }
    } catch(e) { res.status(500).json({error: e.message}); }
  });

  app.post('/api/admin/subject-requests/:id/reject', auth, async (req, res) => {
    try {
      const pool = await db.getPool();
      const reqId = req.params.id;
      const { feedback } = req.body;
      await pool.request()
        .input('id', mssql.Int, reqId)
        .input('feedback', mssql.NVarChar, feedback || '')
        .query("UPDATE YEUCAU_MONHOC SET Status='REJECTED', AdminFeedback=@feedback, UpdatedAt=GETDATE() WHERE Id=@id");
      res.json({success: true});
    } catch(e) { res.status(500).json({error: e.message}); }
  });
};
