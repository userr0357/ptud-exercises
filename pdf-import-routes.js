const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const { Groq } = require('groq-sdk');
const db = require('./db-sql');

// Khởi tạo multer lưu file trên memory
const upload = multer({ storage: multer.memoryStorage() });

module.exports = function(app, auth) {
  app.post('/api/lecturer/import/pdf', auth, upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: 'Không tìm thấy file PDF tải lên.' });
      }

      // Đọc file PDF
      const pdfData = await pdfParse(req.file.buffer);
      const textContent = pdfData.text;

      if (!textContent || textContent.trim().length === 0) {
        return res.status(400).json({ success: false, error: 'File PDF rỗng hoặc không thể trích xuất văn bản.' });
      }

      // Khởi tạo Groq
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

      const systemPrompt = `Bạn là trợ lý AI chuyên trích xuất dữ liệu bài tập từ văn bản thô của đề thi/bài tập.
Nhiệm vụ của bạn là đọc đoạn văn bản và trích xuất danh sách các câu hỏi/bài tập, sau đó trả về DUY NHẤT một mảng JSON (JSON array), không có markdown \`\`\`json hay bất kỳ chữ nào khác.
Mỗi object trong mảng đại diện cho 1 bài tập và phải chứa ĐÚNG các key sau (nếu không tìm thấy thông tin thì để chuỗi rỗng ""):
- "TenBaiTap": (chuỗi) Tên hoặc tiêu đề bài tập (ví dụ: "Câu 1: Viết hàm tính tổng")
- "MoTa": (chuỗi) Nội dung đề bài chi tiết
- "YeuCau": (chuỗi) Các yêu cầu kỹ thuật hoặc đầu ra
- "MaDoKho": (chuỗi) Phân loại độ khó: "D" (Dễ), "TB" (Trung bình), hoặc "K" (Khó). Tự phán đoán dựa vào nội dung.
- "SkillLevel": (số nguyên) Từ 1 đến 5. Tự phán đoán.
- "MaDangBai": (chuỗi) Để trống ""
- "TieuChiChamDiem": (chuỗi) Mảng JSON chuỗi hoá nếu có điểm (VD: "[{\\"name\\":\\"Chính xác\\",\\"points\\":10}]"), hoặc để trống.

Bắt buộc trả về format: [{"TenBaiTap": "...", "MoTa": "...", ...}, ...]`;

      // Gọi AI
      const completion = await groq.chat.completions.create({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: textContent.substring(0, 15000) } // Giới hạn 15k ký tự tránh quá tải
        ],
        model: "llama-3.3-70b-versatile", // Mô hình rất mạnh của Groq
        temperature: 0.1,
      });

      const aiResponse = completion.choices[0].message.content.trim();
      let parsedData;
      
      try {
        // Có thể AI vẫn kẹp markdown ```json, ta xử lý xoá đi
        const jsonStr = aiResponse.replace(/^```(json)?|```$/gi, '').trim();
        parsedData = JSON.parse(jsonStr);
      } catch (err) {
        console.error("Lỗi parse JSON từ Groq:", aiResponse);
        return res.status(500).json({ success: false, error: 'AI không thể nhận diện được cấu trúc bài tập từ file này.' });
      }

      if (!Array.isArray(parsedData)) {
        return res.status(500).json({ success: false, error: 'AI trả về dữ liệu không phải dạng danh sách.' });
      }

      // Định dạng lại theo cấu trúc chuẩn của frontend Preview
      const previewData = [];
      let rowNum = 2; // Giả lập số dòng như Excel để frontend vẽ bảng cho đẹp
      
      const pool = await db.getPool();

      // Mặc định lấy môn học đầu tiên mà GV quản lý làm mặc định nếu file PDF không nói
      const gvId = req.user.lecturer_id || req.user.name;
      const subReq = await pool.request().input('gv', require('mssql').VarChar, gvId)
          .query('SELECT TOP 1 MaMon FROM GIANGVIEN_MONHOC WHERE MaGiangVien=@gv');
      const defaultMaMon = subReq.recordset.length > 0 ? subReq.recordset[0].MaMon : '';

      for (const item of parsedData) {
        const row = {
          row: rowNum++,
          MaBaiTap: '', // AI sinh ra sẽ là bài tập tạo mới, không có mã
          TenBaiTap: item.TenBaiTap || 'Bài tập mới',
          MaMon: defaultMaMon, 
          MaDangBai: item.MaDangBai || 'TH',
          MaDoKho: item.MaDoKho || 'D',
          SkillLevel: item.SkillLevel || 1,
          MoTa: item.MoTa || '',
          YeuCau: item.YeuCau || '',
          TieuChiChamDiem: item.TieuChiChamDiem || '',
          FileDinhKem: '',
          status: 'VALID',
          action: 'ADD'
        };

        // Ràng buộc cơ bản
        if (!row.TenBaiTap || !row.MoTa) {
          row.status = 'INVALID_MISSING_FIELDS';
          row.statusNote = 'Thiếu tên bài tập hoặc mô tả';
        }

        previewData.push(row);
      }

      res.json({ success: true, preview: previewData });

    } catch (error) {
      console.error('Lỗi API Import PDF:', error);
      res.status(500).json({ success: false, error: 'Lỗi máy chủ khi đọc file PDF: ' + error.message });
    }
  });
};
