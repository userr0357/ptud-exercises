# SYSTEM TESTING - NGÂN HÀNG BÀI TẬP

Phiên bản: 1.0
Ngày: 2025-12-12
Tác giả: Nhóm PTUD

Mục đích: Tài liệu test hệ thống (System Testing) gồm các test case cho trang Sinh viên, Trang đăng nhập và Trang Giảng viên, cùng các kiểm thử API, file I/O, bảo mật và migration.

---

## 1. Môi trường kiểm thử
- Hệ điều hành: Windows 10/11
- Node.js: phiên bản tương thích (đã chạy `node server.js` thành công)
- Trình duyệt: Chrome/Edge (mới nhất)
- Database: file `db.json` (local) / SQL Server (tùy kịch bản migration)
- Các thư mục quan trọng: `public/`, `uploads/`, `backups/`, `scripts/`

## 2. Quy ước trong test case
- ID: mã test (ST-xx)
- Tiêu đề: mô tả ngắn
- Mức độ: High / Medium / Low
- Preconditions: điều kiện cần có trước khi chạy test
- Steps: các bước thực hiện
- Test data: (nếu có)
- Expected result: kết quả mong đợi
- Post-condition: trạng thái sau test (restore nếu cần)

---

## 3. Test cases - Student Page

- ST-01 | Page load - Student | High
  - Preconditions: server đang chạy `http://localhost:3000/`
  - Steps: mở `http://localhost:3000/` trong trình duyệt
  - Expected: `index.html` tải, CSS/JS load (no console errors), sidebar và header hiển thị

- ST-02 | List subjects render | High
  - Preconditions: `db.json` có ít nhất 1 subject
  - Steps: truy cập trang, quan sát danh sách môn ở sidebar
  - Expected: subject items hiển thị chính xác theo `db.json`

- ST-03 | Search/filter subjects | Medium
  - Preconditions: nhiều subject có tên khác nhau
  - Steps: nhập từ khoá vào ô tìm kiếm
  - Expected: danh sách lọc theo từ khoá, kết quả chính xác

- ST-04 | Open form list for subject | High
  - Preconditions: subject có forms
  - Steps: click một subject
  - Expected: title thay đổi, list forms hiển thị; mỗi form hiện nút/chi tiết

- ST-05 | View exercise detail (Markdown rendering) | Medium
  - Preconditions: selected form có exercises với `description` Markdown
  - Steps: chọn exercise
  - Expected: nội dung hiển thị rendered HTML, không có XSS (DOMPurify lọc)

- ST-06 | Download attachment | Medium
  - Preconditions: exercise có `attached_files`
  - Steps: nhấn link file
  - Expected: file tải xuống thành công; server trả đúng `Content-Type`

- ST-07 | Behavior when db.json empty | Low
  - Preconditions: thay `db.json` thành `[]`
  - Steps: mở trang
  - Expected: hiển thị message/empty state; không crash

---

## 4. Test cases - Login Page

- LN-01 | Login page load | High
  - Preconditions: server chạy
  - Steps: mở `http://localhost:3000/login.html`
  - Expected: form login hiển thị, các trường required

- LN-02 | Client validation required fields | High
  - Preconditions: trang login mở
  - Steps: submit form để trống
  - Expected: browser/JS block hoặc hiển thị lỗi client

- LN-03 | Successful login (credentials in `lecturers.json`) | High
  - Preconditions: `lecturers.json` chứa `GV001`/`Nguyen Van A`/`password123`
  - Steps: nhập valid creds, submit
  - Test data: name=Nguyen Van A, lecturer_id=GV001, password=password123
  - Expected: HTTP 200, server set HttpOnly cookie `token`, redirect to `/lecturer`

- LN-04 | Failed login (wrong password) | High
  - Preconditions: login page
  - Steps: nhập đúng name/lecturer_id nhưng sai password
  - Expected: HTTP 401, hiển thị error message trên page

- LN-05 | Back button behavior | Low
  - Steps: click `Quay lại Trang Sinh viên`
  - Expected: redirect về `/`

---

## 5. Test cases - Lecturer Page (protected)

- LV-01 | Access without token | High
  - Preconditions: clear cookies
  - Steps: truy cập `/lecturer`
  - Expected: redirect to `/login` or 401 (middleware behavior); page không hiển thị nội dung quản lý

- LV-02 | Access with valid token | High
  - Preconditions: đăng nhập thành công
  - Steps: truy cập `/lecturer`
  - Expected: page load, hiển thị lecturer info (từ `/api/lecturer/me`)

- LV-03 | Create exercise (POST /api/exercise) | High
  - Preconditions: lecturer logged in; subject & form exist
  - Steps:
    1. Điền form thêm exercise (title, id, difficulty, submission_format, description)
    2. Gửi cùng file upload (choose files)
  - Test data: sample exercise JSON; include 1 small file
  - Expected: HTTP 200; `db.json` updated: new exercise trong form; file xuất hiện trong `uploads/` với metadata trong `attached_files`; backup trong `backups/` sinh ra
  - Post-condition: xóa file test & restore `db.json` nếu cần

- LV-04 | Update exercise (PUT /api/exercise/:id) | High
  - Preconditions: exercise tồn tại
  - Steps: gửi PUT với update fields và optional files
  - Expected: HTTP 200; exercise cập nhật; nếu file mới upload, merged vào `attached_files`

- LV-05 | Delete exercise (DELETE /api/exercise/:id) | High
  - Preconditions: exercise tồn tại
  - Steps: thực hiện delete
  - Expected: HTTP 200; exercise bị xoá khỏi `db.json`; counts cập nhật

- LV-06 | Export Excel (GET /api/export?subject_id=) | Medium
  - Preconditions: subject có forms & exercises
  - Steps: click `Xuất Excel` trên UI
  - Expected: server trả file `.xlsx` với headers `Content-Disposition` và nội dung đúng; mở file kiểm tra sheet/columns

- LV-07 | Logout behavior | Medium
  - Steps: click logout
  - Expected: cookie `token` bị clear; truy cập `/lecturer` sau đó dẫn đến login

---

## 6. Test cases - API / Integration (direct)

- API-01 | GET /api/subjects - format
  - Steps: curl GET /api/subjects
  - Expected: JSON array; keys: subject_id, subject_name, forms

- API-02 | GET /api/subject/:id - not found
  - Steps: request non-existing id
  - Expected: 404

- API-03 | Auth-required endpoints enforce token
  - Steps: call POST /api/exercise without token
  - Expected: 401

- API-04 | Multipart upload handling
  - Steps: POST with multipart form containing exercise JSON and files
  - Expected: files present, exercise stored

- API-05 | Error response format
  - Steps: trigger a validation error and an internal server error (e.g., malformed JSON, missing required fields)
  - Expected: API returns consistent JSON error objects with appropriate HTTP status codes (4xx for client, 5xx for server) and `message` field

---

## 7. File I/O, Backup & Uploads

- FI-01 | Backup on write
  - Steps: trigger write (add exercise)
  - Expected: a new file `backups/db.<timestamp>.json` created; content equals previous `db.json` before change

- FI-02 | Upload file storage
  - Steps: upload file via form
  - Expected: file saved under `uploads/` with `originalname` and `filename` recorded

- FI-03 | File validation (type, size, filename)
  - Steps: attempt uploads of disallowed file types, oversized files and files with dangerous names (e.g., `..\evil.exe`, `name with spaces`)
  - Expected: server rejects disallowed types/oversize with clear 4xx response; filenames are sanitized/stored safely

- FI-04 | Concurrent writes / data integrity
  - Steps: trigger multiple concurrent create/update requests that modify `db.json` (tooling: a small script or `wrk`/Postman runner)
  - Expected: `db.json` remains valid JSON, no lost updates; backups created for each write; no corrupted backup files

---

## 8. Security & Edge Cases

- SEC-01 | Cookie flags
  - Steps: login; inspect Set-Cookie header
  - Expected: `HttpOnly`, `SameSite=Lax`; `Secure` present when `NODE_ENV=production`

- SEC-02 | XSS protection in Markdown
  - Steps: create exercise with malicious script in description
  - Expected: rendered HTML sanitized (no script execution)

- SEC-03 | Input validation
  - Steps: submit invalid data (missing required fields, extremely long strings)
  - Expected: server returns appropriate 4xx (400/422) or handles safely

- SEC-04 | Token invalid/expired handling
  - Steps: use an expired token, a malformed token, and a token signed with wrong secret to call protected endpoints
  - Expected: server returns 401 and does not expose protected data

- SEC-05 | Rate limiting / brute-force protection (optional)
  - Steps: send repeated login attempts from same IP
  - Expected: application or reverse proxy should throttle/deny requests (if implemented); otherwise note as improvement

---

## 9. Migration-related tests (optional)

- MIG-01 | Generate INSERT SQL (script)
  - Steps: run `node scripts/generate_insert_only_sql.js` (or generator available)
  - Expected: generate `migrate_inserts.sql` containing valid INSERT statements; strings escaped (single quotes doubled), Unicode prefixed with N'

- MIG-02 | Run DDL then DML via `sqlcmd`
  - Steps: run DDL then DML using `run_full_migration.ps1` or manual `sqlcmd`
  - Expected: no syntax errors; counts in SQL match `db.json`

- MIG-03 | Schema vs generated INSERTs validation
  - Steps: compare generated `migrate_inserts.sql` column names against target SQL schema (automated grep/compare or run an INSERT in a transaction)
  - Expected: no "Invalid column name" errors; generator must escape/align column names and include missing columns or default values

---

## 10. Performance & Load (smoke)

- PERF-01 | Basic load: 100 concurrent read requests
  - Steps: run simple load test hitting `/api/subjects` and `/`
  - Expected: acceptable response times (config dependent); no server crash

- PERF-02 | Large upload handling
  - Steps: upload many files / large payloads
  - Expected: process files into `uploads/` without OOM; server remains responsive

- CONC-01 | Concurrent read/write stress (smoke)
  - Steps: run mixed concurrent workload (reads + writes) for a short period
  - Expected: server remains responsive; no data corruption; errors logged and rate of 5xx is low

---

## 11. Regression checklist (after fixes)
- Verify CRUD flows again (create → read → update → delete) for exercises.
- Verify login/logout and protected page access.
- Verify backups are still created on writes.

- Verify added cases: token invalid/expired, file validation, concurrent writes, migration schema check, consistent error format

---

## 12. Test data samples
- Lecturer sample: { lecturer_id: "GV001", name: "Nguyen Van A", password: "password123" }
- Subject sample entry: see `db.json` file

---

## 13. Post-test cleanup
- Remove test uploads from `uploads/`.
- Restore `db.json` from latest pre-test backup if needed.

---

## 14. Notes & tools
- Use Postman or curl for API tests; use Playwright/Selenium for UI flows.
- For migration tests ensure SQL Server instance and `sqlcmd` available.

---

End of SYSTEM_TESTING.md
