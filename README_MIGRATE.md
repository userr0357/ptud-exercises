# Hướng dẫn nạp dữ liệu từ file text vào SQL Server

Tệp này mô tả cách dùng script tự động để đọc các file `.txt` trong thư mục `DB/` và nạp vào các bảng `Subjects`, `ExerciseTypes`, `DifficultyLevels`, `Exercises`.

Chuẩn bị
- Cài Node 14+ và npm.
- Trong workspace, cài dependencies:

```bash
npm install mssql dotenv
```

- Tạo file `.env` dựa trên `.env.example` và điền thông tin kết nối SQL Server.

Chạy script

```bash
node scripts/migrate_texts_to_mssql.js
```

Kết quả
- Script cố gắng "upsert" (tạo nếu chưa có) các `Subjects`, `ExerciseTypes`, `DifficultyLevels` và chèn các bản ghi vào `Exercises`.
- Nếu bảng `Exercises` không tồn tại hoặc tên cột không thể map tự động, script sẽ ghi các INSERT fallback vào `sql/generated_inserts.sql` để bạn chạy thủ công trong SSMS.

Ghi chú
- Script dùng heuristics để map tên cột; nếu cấu trúc DB khác, bạn có thể chỉnh sửa `scripts/migrate_texts_to_mssql.js` để cập nhật tên cột chính xác.
- Luôn backup DB trước khi chạy.
