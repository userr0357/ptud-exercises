# Hướng dẫn triển khai `ptud-grading-api` lên Render

Các bước nhanh để deploy từ repository lên Render (Web Service):

1. Push toàn bộ repository này lên GitHub (hoặc kết nối GitHub repo có sẵn).
2. Đăng nhập vào https://dashboard.render.com và chọn "New" → "Web Service" → "Deploy from a repository".
3. Chọn repository và branch bạn muốn deploy; Render sẽ đọc `render.yaml` ở repo gốc và tạo service `ptud-grading-api`.
4. Trên trang service, vào Settings → Environment → Add Environment Variable và cấu hình các biến sau (bắt buộc):

   - `DB_USER` = userPersonalizedSystem (hoặc username DB thực tế)
   - `DB_PASS` = 123456789 (hoặc mật khẩu DB thực tế)
   - `DB_HOST` = 118.69.126.49 (hoặc host DB thực tế)
   - `DB_NAME` = Data_PersonalizedSystem
   - `PORT` = 3002

   Lưu ý: KHÔNG để lộ thông tin credentials công khai — dùng Render environment variables.

7. (Khuyến nghị) Thiết lập `API_KEY` để bảo vệ API. Ở Render, thêm biến môi trường:

   - `API_KEY` = <một-chuỗi-bí-mật>

   Khi `API_KEY` được cấu hình, mọi request tới API phải gửi header `x-api-key: <một-chuỗi-bí-mật>` hoặc query `?api_key=<một-chuỗi-bí-mật>`.

5. Deploy sẽ chạy `buildCommand` và `startCommand` theo `render.yaml` (ta cài dependencies trong thư mục `api` và start bằng `npm start`).

6. Sau khi deploy thành công, Render cung cấp URL công khai. Gửi URL đó cho người khác kèm endpoint, ví dụ:

   - `https://your-service.onrender.com/grading/ctdl`
   - `https://your-service.onrender.com/grading/ctdl/criteria`

Tùy chọn bổ sung

- Nếu muốn bảo mật, bật Basic Auth hoặc thêm API key middleware trong `grading-api.js` trước khi deploy.
- Nếu muốn dùng Docker, hãy tạo `api/Dockerfile` và cập nhật `render.yaml` để dùng Docker build.
