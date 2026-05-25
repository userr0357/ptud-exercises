// db-sql.js — MSSQL data access layer (replaces db.json)
require('dotenv').config();
const mssql = require('mssql');

const sqlConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  server: process.env.DB_HOST,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT || 1433),
  options: { encrypt: false, trustServerCertificate: true },
  pool: { max: 10, min: 0, idleTimeoutMillis: 30000 },
  connectionTimeout: 15000,
  requestTimeout: 15000
};

let _pool = null;
async function getPool() {
  if (_pool) return _pool;
  _pool = await mssql.connect(sqlConfig);
  _pool.on('error', err => { console.error('SQL pool error', err); _pool = null; });
  return _pool;
}

// ── Helpers ──
const DIFF_MAP = { 'Dễ': 1, 'De': 1, 'Trung bình': 2, 'Trung binh': 2, 'Khó': 3, 'Kho': 3, 'KHo': 3 };
const FORMAT_MAP = { 'zip': 1, 'pdf': 2, 'docx': 3, 'link': 4, 'text': 5, 'image': 6 };

function parseRequirements(raw) {
  if (!raw) return [];
  try { const p = JSON.parse(raw); if (Array.isArray(p)) return p; return [raw]; }
  catch { return raw.split(/\r?\n/).map(s => s.trim()).filter(Boolean); }
}

function parseGradingCriteria(raw) {
  if (!raw) return [];
  try {
    const p = JSON.parse(raw);
    if (Array.isArray(p)) return p.map(item => typeof item === 'string' ? { name: item, points: 0 } : { name: item.name || item.tieu_chi || '', points: item.points || item.TrongSo || 0 });
    if (p.tieu_chi && Array.isArray(p.tieu_chi)) return p.tieu_chi.map(s => ({ name: s, points: 0 }));
    if (p.name) return [{ name: p.name, points: p.points || 0 }];
    return [];
  } catch { return [{ name: raw, points: 0 }]; }
}

function serializeRequirements(arr) {
  if (!arr) return null;
  if (typeof arr === 'string') return arr;
  return JSON.stringify(arr);
}

function serializeGradingCriteria(arr) {
  if (!arr) return '[]';
  if (typeof arr === 'string') return arr;
  // Save full objects with name + points + note to preserve all fields
  return JSON.stringify(arr.map(g =>
    typeof g === 'string'
      ? { name: g, points: 0, note: '' }
      : { name: g.name || '', points: Number(g.points) || 0, note: g.note || '' }
  ));
}

// ── READ: Build nested subjects structure ──
async function getAllSubjects(filterMaMon) {
  const pool = await getPool();
  let sql = `
    SELECT m.MaMon, m.TenMon,
      d.MaDangBai, d.TenDangBai,
      b.Id AS BaiTapPK, b.MaBaiTap, b.TenBaiTap, b.MaDoKho,
      dk.TenDoKho, b.MoTa, b.YeuCau, b.TieuChiChamDiem,
      b.MaGiangVien, gv.TenGiangVien,
      b.SkillLevel, b.SkillSub, b.UpdatedAt,
      b.FileDinhKem, ef.AI_Keywords
    FROM MONHOC m
    LEFT JOIN DANGBAI d ON d.MaMon = m.MaMon
    LEFT JOIN BAITAP b ON b.MaDangBai = d.MaDangBai AND (b.IsDeleted = 0 OR b.IsDeleted IS NULL)
    LEFT JOIN EXERCISE_FEATURES ef ON ef.BaiTapId = b.Id
    LEFT JOIN DOKHO dk ON dk.MaDoKho = b.MaDoKho
    LEFT JOIN GIANGVIEN gv ON gv.MaGiangVien = b.MaGiangVien`;
  const req = pool.request();
  if (filterMaMon) { sql += ` WHERE m.MaMon = @MaMon`; req.input('MaMon', mssql.VarChar, filterMaMon); }
  sql += ` ORDER BY m.MaMon, d.MaDangBai, b.Id`;
  const result = await req.query(sql);

  const fmtResult = await pool.request().query(
    `SELECT bd.BaiTapId, dn.TenDinhDang FROM BAITAP_DINHDANG bd JOIN DINHDANG_NOPBAI dn ON dn.MaDinhDang = bd.MaDinhDang`
  );
  const fmtMap = {};
  for (const r of fmtResult.recordset) {
    if (!fmtMap[r.BaiTapId]) fmtMap[r.BaiTapId] = [];
    fmtMap[r.BaiTapId].push(r.TenDinhDang);
  }

  // Fetch form-level default criteria
  const tcResult = await pool.request().query(
    `SELECT MaDangBai, TenTieuChi, TrongSo FROM TIEUCHI_DANGBAI ORDER BY ThuTu ASC`
  );
  const formCriteriaMap = {};
  for (const r of tcResult.recordset) {
    if (!formCriteriaMap[r.MaDangBai]) formCriteriaMap[r.MaDangBai] = [];
    formCriteriaMap[r.MaDangBai].push({ name: r.TenTieuChi, points: r.TrongSo || 0 });
  }

  const subjectsMap = {};
  for (const row of result.recordset) {
    if (!subjectsMap[row.MaMon]) {
      subjectsMap[row.MaMon] = { subject_id: row.MaMon, subject_name: row.TenMon, total_exercises: 0, forms: [] };
    }
    const subj = subjectsMap[row.MaMon];
    if (row.MaDangBai != null) {
      let form = subj.forms.find(f => String(f.form_id) === String(row.MaDangBai));
      if (!form) { form = { form_id: String(row.MaDangBai), name: row.TenDangBai, default_criteria: formCriteriaMap[row.MaDangBai] || [], exercises: [], exercise_count: 0 }; subj.forms.push(form); }
      if (row.MaBaiTap != null) {
        const formats = fmtMap[row.BaiTapPK] || [];
        let crit = parseGradingCriteria(row.TieuChiChamDiem);
        // Only fall back to form defaults if this exercise has NO custom criteria saved
        if (crit.length === 0 && formCriteriaMap[row.MaDangBai]) {
          crit = formCriteriaMap[row.MaDangBai];
        }
        form.exercises.push({
          id: row.MaBaiTap, numeric_id: row.BaiTapPK, pk: row.BaiTapPK, title: row.TenBaiTap,
          difficulty: row.TenDoKho || '', description: row.MoTa || '',
          requirements: parseRequirements(row.YeuCau),
          grading_criteria: crit,
          ai_keywords: row.AI_Keywords || '',
          owner: row.MaGiangVien || '', lecturer_name: row.TenGiangVien || row.MaGiangVien || '',
          level: row.SkillLevel || 1, skill_sub: row.SkillSub || 0,
          submission_format: formats.length ? formats.join(', ') : '',
          updated_at: row.UpdatedAt, attached_files: row.FileDinhKem ? (() => { try { return JSON.parse(row.FileDinhKem); } catch { return []; } })() : []
        });
        form.exercise_count = form.exercises.length;
        subj.total_exercises++;
      }
    }
  }
  return Object.values(subjectsMap);
}

// ── AUTH ──
async function authenticateLecturer(lecturerId, password) {
  const pool = await getPool();
  const r = await pool.request()
    .input('id', mssql.VarChar, lecturerId)
    .input('pw', mssql.VarChar, password)
    .query('SELECT MaGiangVien, TenGiangVien, Quyen FROM GIANGVIEN WHERE MaGiangVien = @id AND MatKhau = @pw');
  if (!r.recordset.length) return null;
  const gv = r.recordset[0];
  return { lecturer_id: gv.MaGiangVien, name: gv.TenGiangVien, is_admin: gv.Quyen === 'Admin' };
}

async function getLecturerAllowedSubjects(lecturerId) {
  const pool = await getPool();
  const r = await pool.request().input('id', mssql.VarChar, lecturerId)
    .query('SELECT MaMon FROM GIANGVIEN_MONHOC WHERE MaGiangVien = @id');
  return r.recordset.map(row => row.MaMon);
}

// ── EXERCISE CRUD ──
async function createExercise(subjectId, formId, exercise, ownerGvId) {
  const pool = await getPool();
  const doKho = DIFF_MAP[exercise.difficulty] || 2;
  const r = await pool.request()
    .input('MaBaiTap', mssql.VarChar, exercise.id)
    .input('TenBaiTap', mssql.NVarChar, exercise.title)
    .input('MaDoKho', mssql.Int, doKho)
    .input('MaDangBai', mssql.Int, parseInt(formId))
    .input('MoTa', mssql.NVarChar, exercise.description || '')
    .input('YeuCau', mssql.NVarChar, serializeRequirements(exercise.requirements))
    .input('TieuChi', mssql.NVarChar, serializeGradingCriteria(exercise.grading_criteria))
    .input('MaMon', mssql.VarChar, subjectId)
    .input('MaGV', mssql.VarChar, ownerGvId || '')
    .input('Skill', mssql.Int, parseInt(exercise.level) || 1)
    .input('SkillSub', mssql.Int, parseInt(exercise.skill_sub) || 0)
    .input('File', mssql.NVarChar, exercise.attached_files ? JSON.stringify(exercise.attached_files) : null)
    .query(`INSERT INTO BAITAP (MaBaiTap, TenBaiTap, MaDoKho, MaDangBai, MoTa, YeuCau, TieuChiChamDiem, MaMon, MaGiangVien, SkillLevel, SkillSub, UpdatedAt, FileDinhKem)
            VALUES (@MaBaiTap, @TenBaiTap, @MaDoKho, @MaDangBai, @MoTa, @YeuCau, @TieuChi, @MaMon, @MaGV, @Skill, @SkillSub, GETDATE(), @File);
            SELECT SCOPE_IDENTITY() AS newId`);
  
  const newId = r.recordset[0]?.newId;
  
  if (newId && exercise.submission_format) {
    const formats = exercise.submission_format.split(',').map(s => s.trim().toLowerCase());
    for (const f of formats) {
      const fId = FORMAT_MAP[f];
      if (fId) {
        await pool.request()
          .input('bid', mssql.Int, newId)
          .input('fid', mssql.Int, fId)
          .query('INSERT INTO BAITAP_DINHDANG (BaiTapId, MaDinhDang) VALUES (@bid, @fid)');
      }
    }
  }

  return { success: true, newId };
}

async function updateExercise(maBaiTap, exercise, currentUserId) {
  const pool = await getPool();
  // Check ownership
  const check = await pool.request().input('id', mssql.VarChar, maBaiTap)
    .query('SELECT Id, MaGiangVien FROM BAITAP WHERE MaBaiTap = @id AND (IsDeleted = 0 OR IsDeleted IS NULL)');
  if (!check.recordset.length) return { error: 'Not found', status: 404 };
  const owner = check.recordset[0].MaGiangVien;
  const numericId = check.recordset[0].Id;
  if (owner && currentUserId && owner !== currentUserId) return { error: 'Forbidden', status: 403 };

  const sets = [];
  const req = pool.request().input('id', mssql.VarChar, maBaiTap);
  if (exercise.title !== undefined) { sets.push('TenBaiTap = @title'); req.input('title', mssql.NVarChar, exercise.title); }
  if (exercise.difficulty !== undefined) { sets.push('MaDoKho = @dk'); req.input('dk', mssql.Int, DIFF_MAP[exercise.difficulty] || 2); }
  if (exercise.description !== undefined) { sets.push('MoTa = @desc'); req.input('desc', mssql.NVarChar, exercise.description); }
  if (exercise.requirements !== undefined) { sets.push('YeuCau = @yc'); req.input('yc', mssql.NVarChar, serializeRequirements(exercise.requirements)); }
  if (exercise.grading_criteria !== undefined) { sets.push('TieuChiChamDiem = @tc'); req.input('tc', mssql.NVarChar, serializeGradingCriteria(exercise.grading_criteria)); }
  if (exercise.level !== undefined) { sets.push('SkillLevel = @lv'); req.input('lv', mssql.Int, parseInt(exercise.level) || 1); }
  if (exercise.attached_files !== undefined) { sets.push('FileDinhKem = @f'); req.input('f', mssql.NVarChar, JSON.stringify(exercise.attached_files)); }
  sets.push('UpdatedAt = GETDATE()');

  if (sets.length > 1) await req.query(`UPDATE BAITAP SET ${sets.join(', ')} WHERE MaBaiTap = @id`);
  
  if (exercise.submission_format !== undefined) {
    // Delete old formats
    await pool.request().input('bid', mssql.Int, numericId).query('DELETE FROM BAITAP_DINHDANG WHERE BaiTapId = @bid');
    
    // Insert new formats
    if (exercise.submission_format) {
      const formats = exercise.submission_format.split(',').map(s => s.trim().toLowerCase());
      for (const f of formats) {
        const fId = FORMAT_MAP[f];
        if (fId) {
          await pool.request()
            .input('bid', mssql.Int, numericId)
            .input('fid', mssql.Int, fId)
            .query('INSERT INTO BAITAP_DINHDANG (BaiTapId, MaDinhDang) VALUES (@bid, @fid)');
        }
      }
    }
  }
  
  return { success: true };
}

async function deleteExercise(maBaiTap, currentUserId) {
  const pool = await getPool();
  const check = await pool.request().input('id', mssql.VarChar, maBaiTap)
    .query('SELECT MaGiangVien FROM BAITAP WHERE MaBaiTap = @id AND (IsDeleted = 0 OR IsDeleted IS NULL)');
  if (!check.recordset.length) return { error: 'Not found', status: 404 };
  const owner = check.recordset[0].MaGiangVien;
  if (owner && currentUserId && owner !== currentUserId) return { error: 'Forbidden', status: 403 };
  await pool.request().input('id', mssql.VarChar, maBaiTap)
    .query('UPDATE BAITAP SET IsDeleted = 1 WHERE MaBaiTap = @id');
  return { success: true };
}

async function getNextExerciseId(subjectId, formId) {
  const pool = await getPool();

  // Get all existing IDs for this subject+form
  const r = await pool.request()
    .input('mon', mssql.VarChar, subjectId)
    .input('dang', mssql.Int, parseInt(formId))
    .query('SELECT MaBaiTap FROM BAITAP WHERE MaMon = @mon AND MaDangBai = @dang AND (IsDeleted = 0 OR IsDeleted IS NULL) AND MaBaiTap IS NOT NULL AND MaBaiTap != \'\'');

  const ids = r.recordset.map(row => row.MaBaiTap).filter(Boolean);

  // Detect prefix from existing IDs (e.g. 'KTLT_D1_' from 'KTLT_D1_05')
  // Pattern: PREFIX_DIGITS where PREFIX contains letters/underscores
  let prefix = null;
  let maxNum = 0;

  if (ids.length > 0) {
    // Try to detect pattern: everything up to and including the last underscore
    const sample = ids[0];
    const lastUnderscore = sample.lastIndexOf('_');
    if (lastUnderscore > 0) {
      prefix = sample.substring(0, lastUnderscore + 1); // e.g. 'KTLT_D1_'
    }

    // Find max sequential number among IDs that share this prefix
    for (const id of ids) {
      if (prefix && id.startsWith(prefix)) {
        const numPart = id.substring(prefix.length);
        const n = parseInt(numPart, 10);
        if (!isNaN(n) && n > maxNum) maxNum = n;
      }
    }
  }

  // If no prefix detected from existing data, build one from formId order
  if (!prefix) {
    // Figure out which order (D1, D2...) this formId is for this subject
    const allForms = await pool.request()
      .input('mon', mssql.VarChar, subjectId)
      .query('SELECT MaDangBai FROM DANGBAI WHERE MaMon = @mon ORDER BY MaDangBai ASC');
    const formIds = allForms.recordset.map(row => row.MaDangBai);
    const formOrder = formIds.indexOf(parseInt(formId)) + 1; // 1-based
    prefix = `${subjectId}_D${formOrder > 0 ? formOrder : 1}_`;
  }

  const nextNum = maxNum + 1;
  const paddedNum = String(nextNum).padStart(2, '0'); // e.g. 01, 02, 11, 12
  const next_id = `${prefix}${paddedNum}`;

  return { next_id, prefix, count: ids.length };
}

async function getExerciseTitles(subjectId) {
  const pool = await getPool();
  const req = pool.request();
  let sql = 'SELECT TenBaiTap FROM BAITAP WHERE (IsDeleted = 0 OR IsDeleted IS NULL)';
  if (subjectId) { sql += ' AND MaMon = @mon'; req.input('mon', mssql.VarChar, subjectId); }
  const r = await req.query(sql);
  return r.recordset.map(row => row.TenBaiTap);
}

async function getExercisesForExport(subjectId, formIds, since, exIds) {
  const pool = await getPool();
  const req = pool.request().input('mon', mssql.VarChar, subjectId);
  let sql = `SELECT b.MaBaiTap, b.TenBaiTap, dk.TenDoKho, d.MaDangBai, d.TenDangBai,
    b.MoTa, b.YeuCau, b.TieuChiChamDiem, b.FileDinhKem, b.UpdatedAt
    FROM BAITAP b LEFT JOIN DOKHO dk ON dk.MaDoKho = b.MaDoKho LEFT JOIN DANGBAI d ON d.MaDangBai = b.MaDangBai
    WHERE b.MaMon = @mon AND (b.IsDeleted = 0 OR b.IsDeleted IS NULL)`;
  if (since) { sql += ' AND b.UpdatedAt >= @since'; req.input('since', mssql.DateTime, new Date(since)); }
  sql += ' ORDER BY d.MaDangBai, b.Id';
  const r = await req.query(sql);
  let rows = r.recordset;
  if (formIds && formIds.length) rows = rows.filter(r => formIds.includes(String(r.MaDangBai)));
  if (exIds && exIds.length) rows = rows.filter(r => exIds.includes(r.MaBaiTap));

  const tcResult = await pool.request().query(`SELECT MaDangBai, TenTieuChi, TrongSo FROM TIEUCHI_DANGBAI ORDER BY ThuTu ASC`);
  const formCriteriaMap = {};
  for (const tc of tcResult.recordset) {
    if (!formCriteriaMap[tc.MaDangBai]) formCriteriaMap[tc.MaDangBai] = [];
    formCriteriaMap[tc.MaDangBai].push({ name: tc.TenTieuChi, points: tc.TrongSo || 0 });
  }

  return rows.map(row => {
    let crit = parseGradingCriteria(row.TieuChiChamDiem);
    const totalPts = crit.reduce((sum, c) => sum + (c.points || 0), 0);
    if (totalPts === 0 && formCriteriaMap[row.MaDangBai]) {
      crit = formCriteriaMap[row.MaDangBai];
    }
    return {
      form_id: String(row.MaDangBai), form_name: row.TenDangBai, id: row.MaBaiTap,
      title: row.TenBaiTap, difficulty: row.TenDoKho || '',
      description: row.MoTa || '',
      requirements: parseRequirements(row.YeuCau).join(' | '),
      grading_criteria: crit.map(g => g.name + (g.points ? ` (${g.points}%)` : '')).join(' | '),
      attached_files: row.FileDinhKem || '', created_at: row.UpdatedAt || ''
    };
  });
}

module.exports = {
  getPool, getAllSubjects, authenticateLecturer, getLecturerAllowedSubjects,
  createExercise, updateExercise, deleteExercise, getNextExerciseId,
  getExerciseTitles, getExercisesForExport, DIFF_MAP
};
