const express = require('express');
const router = express.Router();
const mssql = require('mssql');
const { getPool } = require('./db-sql');
const { scanSystemDuplicates, quickCheckRAM, syncExerciseFeature } = require('./duplicate-service');

// API Quick Check trước khi lưu bài tập (Giảng viên)
router.post('/quick-check', async (req, res) => {
    try {
        const { title, description, requirements } = req.body;
        const result = await quickCheckRAM(title, description, requirements);
        res.json({ success: true, ...result });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// API đồng bộ nền (Sync) chạy ẩn sau khi lưu bài tập xong
router.post('/sync', async (req, res) => {
    try {
        const { baiTapId, title, description, requirements } = req.body;
        // Chạy bất đồng bộ, không cần await để không block request
        syncExerciseFeature(baiTapId, title, description, requirements)
            .then(() => console.log('Synced feature for', baiTapId))
            .catch(e => console.error('Sync feature error', e));
        res.json({ success: true, message: 'Sync started in background' });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// API Động bộ hàng loạt (Background)
router.post('/sync-all', async (req, res) => {
    try {
        const pool = await getPool();
        // Lấy tất cả bài tập hợp lệ chưa có vân tay AI
        const result = await pool.request().query(`
            SELECT b.Id, b.TenBaiTap, b.MoTa, b.YeuCau 
            FROM BAITAP b 
            LEFT JOIN EXERCISE_FEATURES f ON b.Id = f.BaiTapId 
            WHERE (b.IsDeleted = 0 OR b.IsDeleted IS NULL) AND f.BaiTapId IS NULL
        `);
        const missingExercises = result.recordset;

        // Trả về ngay lập tức để admin không phải đợi
        res.json({ success: true, message: 'Đã bắt đầu đồng bộ ngầm', count: missingExercises.length });

        // Chạy ngầm
        if (missingExercises.length > 0) {
            console.log(`Bắt đầu đồng bộ AI cho ${missingExercises.length} bài tập cũ...`);
            (async () => {
                for (let i = 0; i < missingExercises.length; i++) {
                    const ex = missingExercises[i];
                    try {
                        await syncExerciseFeature(ex.Id, ex.TenBaiTap, ex.MoTa, ex.YeuCau);
                        console.log(`[Sync AI] Đã đồng bộ bài tập ID: ${ex.Id} (${i + 1}/${missingExercises.length})`);
                    } catch (err) {
                        console.error(`[Sync AI] Lỗi đồng bộ bài tập ID: ${ex.Id}`, err);
                    }
                    // Nghỉ 2 giây để tránh bị Groq chặn vì Rate Limit
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }
                console.log('Đã hoàn thành đồng bộ AI cho tất cả bài tập cũ.');
            })();
        }
    } catch (e) {
        console.error('Error starting sync-all', e);
        if (!res.headersSent) res.status(500).json({ error: e.message });
    }
});

// Lấy lịch sử quét (Admin)
router.get('/logs', async (req, res) => {
    try {
        const pool = await getPool();
        const r = await pool.request().query('SELECT * FROM DUPLICATE_LOG ORDER BY ScanDate DESC');
        res.json({ success: true, logs: r.recordset });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Admin chạy quét hệ thống
router.post('/scan', async (req, res) => {
    const userId = req.user ? req.user.lecturer_id : 'Admin';
    const result = await scanSystemDuplicates(userId);
    if (result.success) {
        res.json(result);
    } else {
        res.status(500).json(result);
    }
});

// Lấy danh sách báo cáo
router.get('/reports', async (req, res) => {
    try {
        const userId = req.user ? req.user.lecturer_id : '';
        const isAdmin = req.user && req.user.is_admin;
        
        const pool = await getPool();
        let sql = `
            SELECT r.*, 
                   b1.MaBaiTap as MaA, b1.TenBaiTap as TenA, b1.MaGiangVien as GVA, b1.YeuCau as YeuCauA, b1.MoTa as MoTaA, b1.MaMon as MonA, b1.MaDoKho as DoKhoA, b1.UpdatedAt as UpdatedA, f1.AI_Summary as SumA, f1.AI_Keywords as KwA,
                   b2.MaBaiTap as MaB, b2.TenBaiTap as TenB, b2.MaGiangVien as GVB, b2.YeuCau as YeuCauB, b2.MoTa as MoTaB, b2.MaMon as MonB, b2.MaDoKho as DoKhoB, b2.UpdatedAt as UpdatedB, f2.AI_Summary as SumB, f2.AI_Keywords as KwB
            FROM DUPLICATE_REPORTS r
            JOIN BAITAP b1 ON r.BaiTap_A_Id = b1.Id
            JOIN BAITAP b2 ON r.BaiTap_B_Id = b2.Id
            LEFT JOIN EXERCISE_FEATURES f1 ON f1.BaiTapId = b1.Id
            LEFT JOIN EXERCISE_FEATURES f2 ON f2.BaiTapId = b2.Id
            WHERE r.Status = 'PENDING'
        `;
        
        // Nếu là Giảng viên (không phải admin), chỉ xem báo cáo liên quan đến bài của mình
        if (!isAdmin && userId) {
            sql += ` AND (b1.MaGiangVien = @uid OR b2.MaGiangVien = @uid)`;
        }
        
        sql += ` ORDER BY r.SimilarityScore DESC`;
        
        const reqDb = pool.request();
        if (!isAdmin && userId) reqDb.input('uid', mssql.VarChar, userId);
        
        const r = await reqDb.query(sql);
        res.json({ success: true, reports: r.recordset });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Xử lý báo cáo (Gộp / Bỏ qua)
router.post('/reports/:id/action', async (req, res) => {
    const reportId = req.params.id;
    const { action } = req.body; // 'MERGE' or 'IGNORE'
    
    try {
        const pool = await getPool();
        if (action === 'IGNORE') {
            await pool.request()
                .input('id', mssql.Int, reportId)
                .query("UPDATE DUPLICATE_REPORTS SET Status = 'IGNORED' WHERE ReportId = @id");
            return res.json({ success: true });
        }
        
        if (action === 'MERGE') {
            const transaction = new mssql.Transaction(pool);
            await transaction.begin();
            try {
                // Lấy thông tin bài B
                const r = await transaction.request()
                    .input('id', mssql.Int, reportId)
                    .query("SELECT BaiTap_A_Id, BaiTap_B_Id FROM DUPLICATE_REPORTS WHERE ReportId = @id");
                
                if (r.recordset.length > 0) {
                    const baiBId = r.recordset[0].BaiTap_B_Id;
                    // Xóa bài B (Cập nhật IsDeleted)
                    await transaction.request()
                        .input('bId', mssql.Int, baiBId)
                        .query("UPDATE BAITAP SET IsDeleted = 1 WHERE Id = @bId");
                        
                    // Đánh dấu báo cáo là MERGED
                    await transaction.request()
                        .input('id', mssql.Int, reportId)
                        .query("UPDATE DUPLICATE_REPORTS SET Status = 'MERGED' WHERE ReportId = @id");
                }
                await transaction.commit();
                return res.json({ success: true });
            } catch (err) {
                await transaction.rollback();
                throw err;
            }
        }
        
        res.status(400).json({ error: 'Hành động không hợp lệ' });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});
// API Lịch sử báo cáo đã xử lý
router.get('/reports/history', async (req, res) => {
    try {
        const pool = await getPool();
        const userId = req.user ? req.user.lecturer_id : '';
        const isAdmin = req.user && req.user.is_admin;

        let sql = `
            SELECT r.*, 
                   b1.MaBaiTap as MaA, b1.TenBaiTap as TenA, b1.MaGiangVien as GVA, b1.YeuCau as YeuCauA, b1.MoTa as MoTaA, b1.MaMon as MonA, b1.MaDoKho as DoKhoA, b1.UpdatedAt as UpdatedA, f1.AI_Summary as SumA, f1.AI_Keywords as KwA,
                   b2.MaBaiTap as MaB, b2.TenBaiTap as TenB, b2.MaGiangVien as GVB, b2.YeuCau as YeuCauB, b2.MoTa as MoTaB, b2.MaMon as MonB, b2.MaDoKho as DoKhoB, b2.UpdatedAt as UpdatedB, f2.AI_Summary as SumB, f2.AI_Keywords as KwB
            FROM DUPLICATE_REPORTS r
            JOIN BAITAP b1 ON r.BaiTap_A_Id = b1.Id
            JOIN BAITAP b2 ON r.BaiTap_B_Id = b2.Id
            LEFT JOIN EXERCISE_FEATURES f1 ON f1.BaiTapId = b1.Id
            LEFT JOIN EXERCISE_FEATURES f2 ON f2.BaiTapId = b2.Id
            WHERE r.Status IN ('MERGED', 'IGNORED')
        `;

        if (!isAdmin && userId) {
            sql += ` AND (b1.MaGiangVien = @uid OR b2.MaGiangVien = @uid)`;
        }
        
        sql += ` ORDER BY r.ReportId DESC`;
        
        const reqDb = pool.request();
        if (!isAdmin && userId) reqDb.input('uid', mssql.VarChar, userId);
        
        const r = await reqDb.query(sql);
        res.json({ success: true, history: r.recordset });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// API Khôi phục (Undo)
router.post('/reports/:id/restore', async (req, res) => {
    const reportId = req.params.id;
    try {
        const pool = await getPool();
        const transaction = new mssql.Transaction(pool);
        await transaction.begin();
        try {
            const r = await transaction.request()
                .input('id', mssql.Int, reportId)
                .query("SELECT BaiTap_B_Id, Status FROM DUPLICATE_REPORTS WHERE ReportId = @id");
            
            if (r.recordset.length > 0) {
                const report = r.recordset[0];
                if (report.Status === 'MERGED') {
                    // Restore soft delete
                    await transaction.request()
                        .input('bId', mssql.Int, report.BaiTap_B_Id)
                        .query("UPDATE BAITAP SET IsDeleted = 0 WHERE Id = @bId");
                }
                
                // Return status to PENDING
                await transaction.request()
                    .input('id', mssql.Int, reportId)
                    .query("UPDATE DUPLICATE_REPORTS SET Status = 'PENDING' WHERE ReportId = @id");
            }
            await transaction.commit();
            return res.json({ success: true });
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

module.exports = router;
