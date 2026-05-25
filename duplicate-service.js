require('dotenv').config();
const crypto = require('crypto');
const { getPool } = require('./db-sql');
const mssql = require('mssql');

const GROQ_API_KEY = process.env.GROQ_API_KEY;

// 1. Sinh HardHash
function generateHardHash(title, description, requirements) {
    const raw = `${title || ''} ${description || ''} ${requirements || ''}`;
    const clean = raw.replace(/<[^>]*>?/gm, '').replace(/[\\s\\p{P}]/gu, '').toLowerCase();
    return crypto.createHash('md5').update(clean).digest('hex');
}

// 2. Lấy AI Keywords bằng Groq
async function generateAIKeywords(title, description) {
    if (!GROQ_API_KEY) {
        console.warn('Missing GROQ_API_KEY');
        return { keywords: [], summary: "Tính năng AI chưa được cấu hình." };
    }
    const content = `Đề bài: ${title}\\nMô tả: ${description}\\nTrích xuất tối đa 5 từ khóa cốt lõi nhất (chỉ tên thuật toán/cấu trúc dữ liệu) và 1 câu tóm tắt mục tiêu bài học ngắn gọn. Trả về đúng định dạng JSON: {"keywords": ["k1", "k2"], "summary": "câu tóm tắt"}`;
    
    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama-3.1-8b-instant',
                messages: [{ role: 'user', content }],
                temperature: 0.1,
                response_format: { type: 'json_object' }
            })
        });
        
        if (!response.ok) throw new Error(await response.text());
        const data = await response.json();
        const result = JSON.parse(data.choices[0].message.content);
        return {
            keywords: Array.isArray(result.keywords) ? result.keywords : [],
            summary: result.summary || ""
        };
    } catch (err) {
        console.error('Groq AI Error:', err.message);
        return { keywords: [], summary: "Không thể trích xuất AI." };
    }
}

// 3. Tính Jaccard Index
function calculateJaccardIndex(arr1, arr2) {
    if (!arr1 || !arr2 || arr1.length === 0 || arr2.length === 0) return 0;
    const set1 = new Set(arr1.map(k => k.toLowerCase().trim()));
    const set2 = new Set(arr2.map(k => k.toLowerCase().trim()));
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    return Math.round((intersection.size / union.size) * 100);
}

// 4. Update / Insert Dấu vân tay khi thêm sửa bài tập
async function syncExerciseFeature(baiTapId, title, description, requirements) {
    try {
        const hardHash = generateHardHash(title, description, requirements);
        const aiResult = await generateAIKeywords(title, description);
        const keywordsStr = JSON.stringify(aiResult.keywords);
        
        const pool = await getPool();
        const check = await pool.request()
            .input('id', mssql.Int, parseInt(baiTapId))
            .query('SELECT BaiTapId FROM EXERCISE_FEATURES WHERE BaiTapId = @id');
            
        if (check.recordset.length > 0) {
            await pool.request()
                .input('id', mssql.Int, parseInt(baiTapId))
                .input('hash', mssql.VarChar, hardHash)
                .input('kw', mssql.NVarChar, keywordsStr)
                .input('sum', mssql.NVarChar, aiResult.summary)
                .query(`UPDATE EXERCISE_FEATURES 
                         SET HardHash=@hash, AI_Keywords=@kw, AI_Summary=@sum, LastUpdated=GETDATE() 
                         WHERE BaiTapId=@id`);
        } else {
            await pool.request()
                .input('id', mssql.Int, parseInt(baiTapId))
                .input('hash', mssql.VarChar, hardHash)
                .input('kw', mssql.NVarChar, keywordsStr)
                .input('sum', mssql.NVarChar, aiResult.summary)
                .query(`INSERT INTO EXERCISE_FEATURES (BaiTapId, HardHash, AI_Keywords, AI_Summary) 
                         VALUES (@id, @hash, @kw, @sum)`);
        }
        return true;
    } catch (e) {
        console.error('syncExerciseFeature Error', e);
        return false;
    }
}

// 5. Quét hệ thống (Dành cho Admin)
async function scanSystemDuplicates(userId) {
    const pool = await getPool();
    
    // Tạo Log
    const logResult = await pool.request()
        .input('user', mssql.NVarChar, userId)
        .query(`INSERT INTO DUPLICATE_LOG (InitiatedBy, Status) VALUES (@user, 'RUNNING');
                 SELECT SCOPE_IDENTITY() AS logId`);
    const logId = logResult.recordset[0].logId;
    
    try {
        const featuresResult = await pool.request().query(`
            SELECT f.BaiTapId, f.HardHash, f.AI_Keywords 
            FROM EXERCISE_FEATURES f
            JOIN BAITAP b ON f.BaiTapId = b.Id
            WHERE b.IsDeleted = 0 OR b.IsDeleted IS NULL
        `);
        const features = featuresResult.recordset;
        
        // Fetch all existing reports into memory to avoid N^2 SQL queries
        const reportsResult = await pool.request().query('SELECT BaiTap_A_Id, BaiTap_B_Id, Status FROM DUPLICATE_REPORTS');
        const reportMap = new Map();
        for (const row of reportsResult.recordset) {
            const min = Math.min(row.BaiTap_A_Id, row.BaiTap_B_Id);
            const max = Math.max(row.BaiTap_A_Id, row.BaiTap_B_Id);
            reportMap.set(`${min}_${max}`, row.Status);
        }
        
        let dupCount = 0;
        
        // So sánh chéo
        for (let i = 0; i < features.length; i++) {
            for (let j = i + 1; j < features.length; j++) {
                const a = features[i];
                const b = features[j];
                
                const minId = Math.min(a.BaiTapId, b.BaiTapId);
                const maxId = Math.max(a.BaiTapId, b.BaiTapId);
                const key = `${minId}_${maxId}`;
                
                // Bỏ qua nếu đã tồn tại báo cáo cho cặp này
                if (reportMap.has(key)) continue;
                
                let score = 0;
                let method = '';
                
                if (a.HardHash === b.HardHash) {
                    score = 100;
                    method = 'ALGORITHM';
                } else {
                    let kA = [], kB = [];
                    try { kA = JSON.parse(a.AI_Keywords || '[]'); } catch(e){}
                    try { kB = JSON.parse(b.AI_Keywords || '[]'); } catch(e){}
                    score = calculateJaccardIndex(kA, kB);
                    method = 'GROQ_AI';
                }
                
                if (score > 70) {
                    await pool.request()
                        .input('logId', mssql.Int, logId)
                        .input('a', mssql.Int, a.BaiTapId)
                        .input('b', mssql.Int, b.BaiTapId)
                        .input('score', mssql.Decimal(5,2), score)
                        .input('method', mssql.VarChar, method)
                        .query(`INSERT INTO DUPLICATE_REPORTS (LogId, BaiTap_A_Id, BaiTap_B_Id, SimilarityScore, DetectedBy, Status)
                                 VALUES (@logId, @a, @b, @score, @method, 'PENDING')`);
                    dupCount++;
                }
            }
        }
        
        await pool.request()
            .input('logId', mssql.Int, logId)
            .input('total', mssql.Int, features.length)
            .input('dups', mssql.Int, dupCount)
            .query(`UPDATE DUPLICATE_LOG SET Status='COMPLETED', TotalChecked=@total, DuplicatesFound=@dups WHERE LogId=@logId`);
            
        return { success: true, duplicatesFound: dupCount, totalChecked: features.length };
    } catch(e) {
        await pool.request()
            .input('logId', mssql.Int, logId)
            .query(`UPDATE DUPLICATE_LOG SET Status='FAILED' WHERE LogId=@logId`);
        console.error('Scan Error:', e);
        return { success: false, error: e.message };
    }
}

// 6. Check nhanh trên RAM (Cho giảng viên)
async function quickCheckRAM(title, description, requirements) {
    const hardHash = generateHardHash(title, description, requirements);
    const aiResult = await generateAIKeywords(title, description);
    
    const pool = await getPool();
    const featuresResult = await pool.request().query('SELECT f.BaiTapId, f.HardHash, f.AI_Keywords, f.AI_Summary, b.TenBaiTap FROM EXERCISE_FEATURES f JOIN BAITAP b ON b.Id = f.BaiTapId');
    const features = featuresResult.recordset;
    
    for (const f of features) {
        if (f.HardHash === hardHash) {
            return { warning: true, score: 100, matchedTitle: f.TenBaiTap, summary: f.AI_Summary, method: 'ALGORITHM' };
        }
        let fK = [];
        try { fK = JSON.parse(f.AI_Keywords || '[]'); } catch(e){}
        const score = calculateJaccardIndex(aiResult.keywords, fK);
        if (score > 85) {
            return { warning: true, score, matchedTitle: f.TenBaiTap, summary: f.AI_Summary, method: 'GROQ_AI' };
        }
    }
    return { warning: false, aiData: aiResult };
}

module.exports = {
    syncExerciseFeature,
    scanSystemDuplicates,
    quickCheckRAM
};
