# Ngân Hàng Bài Tập (PTUD)

Ứng dụng mẫu quản lý ngân hàng bài tập cho nhiều môn học. Dữ liệu hiện lưu trong `db.json`.

Mục đích của các file vừa tạo:
- `db.json`: dữ liệu bài tập (đã chuẩn hoá `total_exercises` = 30 cho tất cả môn).
- `.gitignore`: loại trừ `node_modules`, `backups`, file log và config cá nhân.
- `scripts/deploy_to_github.ps1`: PowerShell script giúp khởi repo, commit và push lên GitHub (chạy trên máy có Git).

## Hướng dẫn nhanh

1. Kiểm tra Git đã cài:

```powershell
git --version
```

2. Chạy script deploy (thay `REMOTE_URL` và `PAT`):

```powershell
cd D:\3\PTUD
.\scripts\deploy_to_github.ps1 -RemoteUrl "https://github.com/<your-username>/<repo>.git" -Token "<YOUR_PERSONAL_ACCESS_TOKEN>"
```

Ghi chú:
- Nếu không muốn truyền token trong lệnh, bạn có thể cấu hình Git Credential Manager hoặc dùng `gh auth login`.
- Khuyến nghị tạo Personal Access Token (PAT) trên GitHub với quyền `repo`.

Nếu cần hướng dẫn từng bước tạo PAT hoặc tạo repo, báo tôi — tôi sẽ hướng dẫn chi tiết.

-----------------
Migration to SQL Server
-----------------

We've included a helper script to generate a T-SQL migration file from `db.json`.

Generate migration SQL:

```powershell
cd D:\3\PTUD
node scripts\generate_sql_migration.js migrate_to_sqlserver.sql PTUD
```

This writes `scripts\migrate_to_sqlserver.sql` (or the path you pass) which contains CREATE TABLE and INSERT statements.

Run the generated SQL with `sqlcmd`:

- Windows Authentication:
```powershell
sqlcmd -S "<SERVER_NAME>\<INSTANCE>" -E -i scripts\migrate_to_sqlserver.sql
```

- SQL Authentication:
```powershell
sqlcmd -S "<SERVER_NAME>\<INSTANCE>" -U <user> -P <password> -i scripts\migrate_to_sqlserver.sql
```

Replace `<SERVER_NAME>\<INSTANCE>` (e.g. `DESKTOP-8UPGPO6\SQLEXPRESS`) and credentials accordingly.

If you prefer I can also generate CSVs or run the migration for you (you must provide DB connection details and allow me to run commands on your machine). Otherwise run the two commands above on your machine.
# Ngân hàng Bài tập

Local prototype web app (Student & Lecturer views) built with Node.js + Express and a JSON file `db.json` as the data store.

Quick start (Windows PowerShell):

```powershell
cd d:\3\PTUD
npm install
npm run start
# Open http://localhost:3000 in your browser
```

Lecturer sample credentials are in `lecturers.json`:
- Mã giảng viên: `GV001`
- Tên: `Nguyen Van A`
- Mật khẩu: `password123`

Notes:
- The backend persists changes directly into `db.json`.
- Excel export available per subject via the UI (button in Lecturer panel) or GET `/api/export?subject_id=CS101`.
- File uploads are stored in `uploads/` and file metadata saved in `attached_files` on the exercise.
