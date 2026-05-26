# HƯỚNG DẪN SỬ DỤNG HỆ THỐNG NGÂN HÀNG BÀI TẬP
**Phiên bản 2.0 | Cập nhật tháng 05/2026**

Tài liệu này là hướng dẫn đầy đủ cho ba nhóm người dùng của hệ thống: **Sinh viên**, **Giảng viên** và **Quản trị viên (Admin)**. Mỗi nhóm có quyền hạn và bộ tính năng riêng biệt, được mô tả chi tiết theo từng phần bên dưới.

---

## PHẦN 1 — GIỚI THIỆU HỆ THỐNG

### 1.1 Mục tiêu

Hệ thống Ngân Hàng Bài Tập Lập Trình là nền tảng web tập trung, được thiết kế nhằm hai mục tiêu chính:

- **Với Giảng viên:** Cung cấp một môi trường thống nhất để soạn thảo, quản lý và kiểm soát chất lượng toàn bộ kho bài tập lập trình — thay thế hoàn toàn cho việc lưu trữ phân tán trên các file Word, Google Drive hay email.
- **Với Sinh viên:** Cung cấp một điểm truy cập duy nhất để tìm kiếm, nghiên cứu bài tập thực hành theo môn học, dạng bài và cấp độ kỹ năng — không cần đăng nhập, không giới hạn thời gian.

### 1.2 Kiến trúc kỹ thuật

Hệ thống được xây dựng trên nền tảng **Node.js** kết hợp **Microsoft SQL Server**, đảm bảo khả năng phục vụ đồng thời nhiều người dùng với dữ liệu nhất quán và phân quyền chặt chẽ theo vai trò.

### 1.3 Tổng quan tính năng

| Tính năng | Mô tả |
|---|---|
| Tìm kiếm thời gian thực | Lọc bài tập theo từ khóa, môn học, dạng bài và độ khó — kết quả cập nhật ngay tức thì, không cần tải lại trang. |
| Tích hợp Trí tuệ Nhân tạo | Hỗ trợ giảng viên tự động soạn thảo nội dung bài tập, phản biện đề bài và gợi ý cải thiện chất lượng thông qua AI. |
| Kiểm tra trùng lặp | Phát hiện tự động các cặp bài tập có nội dung tương đồng trong toàn hệ thống, giúp đảm bảo tính đa dạng của kho bài. |
| Nhập/Xuất dữ liệu hàng loạt | Hỗ trợ nhập và xuất dữ liệu qua file Excel (.xlsx) với bước xem trước kết quả trước khi ghi vào cơ sở dữ liệu. |
| Nhập từ PDF (AI) | Tự động phân tích và trích xuất bài tập từ file PDF bằng AI, sau đó chuyển đổi thành dữ liệu có cấu trúc trong hệ thống. |
| Đính kèm tài liệu | Cho phép giảng viên đính kèm file hỗ trợ (PDF, ZIP, hình ảnh…) và sinh viên tải về với tên file gốc được bảo toàn. |
| Giao diện thích ứng | Hỗ trợ Dark Mode và hiển thị chuẩn trên mọi thiết bị: máy tính, tablet và điện thoại di động. |

### 1.4 Địa chỉ truy cập

- **Trang sinh viên (công khai):** `http://localhost:3000`
- **Trang đăng nhập:** `http://localhost:3000/login`
- **Trang đăng ký:** `http://localhost:3000/register`
- **Trang giảng viên:** `http://localhost:3000/lecturer` *(yêu cầu đăng nhập)*
- **Trang quản trị:** `http://localhost:3000/admin` *(yêu cầu đăng nhập với quyền Admin)*

> **Lưu ý:** Trong môi trường triển khai thực tế, địa chỉ `localhost:3000` sẽ được thay bằng domain hoặc địa chỉ IP do Admin hệ thống cung cấp.

---

## PHẦN 2 — PHÂN QUYỀN NGƯỜI DÙNG

Hệ thống áp dụng mô hình phân quyền ba cấp độ. Mỗi cấp độ kế thừa toàn bộ quyền của cấp dưới và có thêm các quyền riêng biệt.

### Cấp 1 — Sinh viên (Không cần đăng nhập)

Sinh viên truy cập hệ thống trực tiếp mà không cần tài khoản. Có toàn quyền xem, tìm kiếm và tải tài liệu, nhưng không thể thực hiện bất kỳ thao tác tạo, sửa hay xóa nào.

### Cấp 2 — Giảng viên (Đăng nhập tại /login)

Sau khi đăng nhập và được Admin phê duyệt, giảng viên có thể quản lý toàn bộ bài tập thuộc **các môn học được Admin phân công**. Giảng viên không thể xem hoặc chỉnh sửa bài tập của người khác.

### Cấp 3 — Quản trị viên / Admin (Đăng nhập tại /login)

Admin có đầy đủ quyền của Giảng viên, cộng thêm khả năng quản lý tài khoản người dùng, xem và chỉnh sửa bài tập của **mọi giảng viên** trong hệ thống, và xuất dữ liệu toàn bộ không giới hạn.

---

## PHẦN 3 — ĐĂNG KÝ, ĐĂNG NHẬP VÀ QUẢN LÝ TÀI KHOẢN

### 3.1 Đăng nhập

1. Truy cập `http://localhost:3000/login`.
2. Nhập **Mã giảng viên** (ví dụ: `GV001`) và **Mật khẩu** vào các ô tương ứng.
3. Nhấn nút **Đăng nhập**.

Sau khi xác thực thành công, hệ thống tự động chuyển hướng đến trang phù hợp với vai trò của tài khoản (Giảng viên hoặc Admin). Nếu tài khoản chưa được duyệt hoặc đã bị khóa, hệ thống hiển thị thông báo cụ thể thay vì cho phép truy cập.

### 3.2 Đăng ký tài khoản Giảng viên

1. Truy cập `http://localhost:3000/register`.
2. Điền đầy đủ các thông tin: **Mã giảng viên**, **Họ và tên** và **Mật khẩu**.
3. Nhấn **Đăng ký**.

Sau khi đăng ký, tài khoản sẽ ở trạng thái **Chờ duyệt**. Trong thời gian này, tài khoản chưa thể đăng nhập vào hệ thống. Nên liên hệ Admin ngay sau khi hoàn tất đăng ký để được phê duyệt trong thời gian sớm nhất.

### 3.3 Đặt lại mật khẩu

1. Truy cập `http://localhost:3000/forgot`.
2. Nhập **Mã giảng viên** đã đăng ký và làm theo hướng dẫn hiển thị trên màn hình.

Nếu không nhớ cả mã giảng viên, cần liên hệ trực tiếp với Admin để được xác minh danh tính và hỗ trợ đặt lại mật khẩu thủ công.

### 3.4 Đăng xuất

Nhấn nút **Đăng xuất** ở góc trên bên phải của trang Giảng viên hoặc Admin. Hệ thống xóa phiên làm việc hiện tại và chuyển về trang đăng nhập. Nên thực hiện thao tác này sau mỗi lần sử dụng trên thiết bị dùng chung.

---

## PHẦN 4 — HƯỚNG DẪN DÀNH CHO SINH VIÊN

### 4.1 Truy cập hệ thống

Mở trình duyệt và điều hướng đến `http://localhost:3000`. Sinh viên **không cần tạo tài khoản hay đăng nhập** để sử dụng bất kỳ tính năng nào trên trang này.

Giao diện được chia thành ba vùng chính:
- **Sidebar bên trái:** Danh sách các môn học hiện có trong hệ thống.
- **Thanh công cụ phía trên:** Ô tìm kiếm, bộ lọc độ khó và các tùy chọn sắp xếp.
- **Vùng nội dung trung tâm:** Danh sách thẻ bài tập được nhóm theo dạng bài.

### 4.2 Chọn môn học

Nhấn vào tên môn học trong sidebar bên trái (ví dụ: *Kỹ thuật lập trình*, *Cấu trúc dữ liệu và giải thuật*). Hệ thống tải và hiển thị tất cả bài tập thuộc môn đó, được phân nhóm tự động theo từng dạng bài.

Mỗi thẻ bài tập hiển thị sơ lược các thông tin quan trọng: tên bài, độ khó, cấp độ kỹ năng và tóm tắt nội dung đề bài. Nhấn vào thẻ để xem toàn bộ chi tiết.

### 4.3 Tìm kiếm và lọc bài tập

**Tìm kiếm theo từ khóa:**
Nhấn vào ô tìm kiếm phía trên và gõ từ khóa bất kỳ — có thể là tên bài, thuật ngữ trong mô tả, hay tên một yêu cầu cụ thể. Hệ thống lọc và cập nhật kết quả **ngay tức thì theo thời gian thực**, không cần nhấn Enter hay bất kỳ nút nào khác.

**Lọc theo độ khó:**
Sử dụng bộ lọc **Độ khó** trên thanh công cụ để chỉ hiển thị bài tập ở mức *Dễ*, *Trung bình* hoặc *Khó*. Bộ lọc này có thể kết hợp đồng thời với tìm kiếm từ khóa để thu hẹp kết quả một cách chính xác hơn.

### 4.4 Xem chi tiết bài tập

Nhấn vào thẻ bài tập bất kỳ. Một panel chi tiết sẽ trượt ra từ phía phải màn hình, hiển thị đầy đủ các thông tin sau:

| Thông tin | Ý nghĩa |
|---|---|
| **Mã bài tập** | Định danh duy nhất của bài tập trong toàn hệ thống (ví dụ: `KTLT_D1_12`). |
| **Dạng bài & Độ khó** | Cho biết loại bài tập và mức độ yêu cầu kỹ năng tương ứng. |
| **Cấp độ kỹ năng (1–5)** | Giúp sinh viên tự đánh giá xem bài có phù hợp với trình độ hiện tại không. |
| **Mô tả đề bài** | Trình bày đầy đủ bối cảnh, mục tiêu và gợi ý phương án giải quyết. |
| **Yêu cầu kỹ thuật** | Danh sách cụ thể các điều kiện kỹ thuật bài làm cần đáp ứng. |
| **Tiêu chí chấm điểm** | Bảng tiêu chí kèm trọng số phần trăm — giúp sinh viên hiểu rõ cách giảng viên tính điểm. |
| **Hình thức nộp bài** | Quy định của giảng viên về định dạng nộp (ZIP, PDF, link…). |
| **File đính kèm** | Danh sách tài liệu hỗ trợ, có thể tải về trực tiếp. |

Nhấn nút **✕** ở góc trên bên phải panel để đóng và quay lại danh sách bài tập.

### 4.5 Tải file đính kèm

Trong panel chi tiết, kéo xuống đến mục **File đính kèm**. Danh sách hiển thị các file kèm icon phân loại theo định dạng (PDF, ZIP, hình ảnh, Word…) và tên file gốc do giảng viên đặt.

Nhấn vào tên file — trình duyệt sẽ tự động bắt đầu tải về. File được lưu vào thư mục mặc định của trình duyệt với **đúng tên gốc**, không bị đổi thành mã số ngẫu nhiên.

### 4.6 Gửi góp ý về bài tập

Trong panel chi tiết bài tập, nhấn nút **Gửi góp ý**. Điền nội dung phản hồi vào ô văn bản (ví dụ: đề bài không rõ ràng, yêu cầu mâu thuẫn…) và nhấn **Gửi**. Góp ý sẽ được ghi nhận và hiển thị cho giảng viên phụ trách bài tập đó xem xét.

### 4.7 Bật/Tắt Dark Mode

Nhấn vào biểu tượng **🌙** ở góc trên bên phải để chuyển sang giao diện tối. Toàn bộ màu sắc giao diện tự động điều chỉnh sang tông tối, giúp giảm mỏi mắt khi học tập vào buổi tối. Nhấn lại để quay về giao diện sáng. Hệ thống **tự động ghi nhớ** lựa chọn — lần sau mở lại trình duyệt vẫn giữ nguyên trạng thái đã chọn.

---

## PHẦN 5 — HƯỚNG DẪN DÀNH CHO GIẢNG VIÊN

### 5.1 Đăng nhập và giao diện tổng quan

Truy cập `http://localhost:3000/login`, nhập Mã giảng viên và Mật khẩu, nhấn **Đăng nhập**. Sau khi xác thực thành công, hệ thống chuyển đến trang `http://localhost:3000/lecturer`.

Giao diện Giảng viên gồm ba khu vực chính:
- **Sidebar menu bên trái:** Danh sách các chức năng chính, có thể thu gọn để mở rộng vùng làm việc.
- **Header phía trên:** Hiển thị tên tài khoản đang đăng nhập, nút Góp ý, Dark Mode và Đăng xuất.
- **Vùng nội dung chính:** Hiển thị nội dung của chức năng đang được chọn.

### 5.2 Dashboard Tổng quan

Nhấn menu **Tổng quan** để xem bộ thống kê tổng hợp gồm bốn thẻ chỉ số: Tổng bài tập, Số môn học, Số dạng bài và Số cấp độ kỹ năng. Nhấn vào từng thẻ để cuộn nhanh đến biểu đồ phân tích tương ứng bên dưới.

Các biểu đồ phân tích phân bố bài tập theo môn, dạng bài và cấp độ giúp giảng viên nắm bắt toàn cảnh kho bài hiện có và xác định những phần còn thiếu cần bổ sung trong các kỳ học tiếp theo.

Ngoài ra, phần **Bài tập cập nhật gần đây** liệt kê các bài tập vừa được thêm hoặc chỉnh sửa, giúp theo dõi hoạt động trong kho bài một cách nhanh chóng.

### 5.3 Xem và quản lý danh sách bài tập

Nhấn menu **Ngân hàng bài tập**. Hệ thống hiển thị bảng danh sách tất cả bài tập thuộc các môn học được phân công, với các cột thông tin: STT, Mã bài tập, Tên bài tập, Độ khó, Tổng trọng số tiêu chí và các nút hành động.

**Lọc và tìm kiếm:**
- Dùng ô **Môn học** ở trên cùng để chỉ hiển thị bài tập thuộc một môn cụ thể.
- Dùng ô **Tìm kiếm** để lọc theo tên bài hoặc mã bài tập.
- Nhấn vào tên bài để xem nhanh nội dung chi tiết mà không cần mở form chỉnh sửa.

### 5.4 Tạo bài tập mới

Nhấn nút **Tạo bài tập mới** ở góc trên bên phải. Form soạn thảo mở ra với các nhóm trường sau:

**Nhóm 1 — Thông tin cơ bản:**
- **Môn học:** Chọn từ danh sách các môn đã được Admin phân công. Giảng viên chỉ thấy môn của mình.
- **Dạng bài:** Chọn dạng bài tương ứng trong môn vừa chọn.
- **Mã bài tập:** Được tự động sinh theo quy tắc `MaMon_Dang_SoThuTu` (ví dụ: `KTLT_D1_12`). Có thể sửa tay, nhưng phải đảm bảo không trùng với bất kỳ mã nào đã tồn tại.
- **Tên bài tập:** Đặt tên ngắn gọn, rõ ràng và đặc trưng cho nội dung bài.
- **Độ khó:** Chọn một trong ba mức: *Dễ*, *Trung bình* hoặc *Khó*.
- **Cấp độ kỹ năng:** Chọn từ 1 đến 5, tương ứng với mức độ thành thạo kỹ năng yêu cầu.

**Nhóm 2 — Mô tả đề bài:**
Nhập nội dung mô tả đầy đủ, bao gồm bối cảnh bài toán, mục tiêu cần đạt và các gợi ý về hướng giải quyết. Trường này **hỗ trợ định dạng Markdown** để tạo cấu trúc rõ ràng (tiêu đề, danh sách, in đậm…). Có thể để trống và sử dụng tính năng AI để tự động sinh nội dung.

**Nhóm 3 — Yêu cầu kỹ thuật:**
Nhấn **+ Thêm yêu cầu** để thêm từng điều kiện kỹ thuật mà bài làm cần đáp ứng. Nhấn dấu **–** cuối dòng để xóa yêu cầu không cần thiết. Nên đặt mỗi dòng là một điều kiện cụ thể, rõ ràng và có thể kiểm chứng.

**Nhóm 4 — Tiêu chí chấm điểm:**
Nhấn **+ Thêm tiêu chí** để thêm dòng mới. Mỗi dòng gồm ba ô: *Tên tiêu chí*, *Trọng số (%)* và *Ghi chú bổ sung*. Tổng trọng số hiển thị tự động bên dưới và **nên đặt bằng 100%** để đảm bảo tính chính xác khi tính điểm.

**Nhóm 5 — Hình thức nộp bài:**
Nhập quy định cụ thể về cách thức nộp bài, ví dụ: *File ZIP chứa code nguồn và báo cáo PDF, dung lượng không quá 5MB.*

**Nhóm 6 — File đính kèm:**
Kéo thả file vào vùng upload hoặc nhấn vào để chọn từ máy tính. Hỗ trợ các định dạng: **JPG, PNG, PDF, ZIP, DOCX**, tối đa **10MB** mỗi file. Tên file đã chọn hiển thị bên dưới để xác nhận. Sinh viên sẽ thấy và tải được các file này trong trang xem bài tập.

**Lưu bài tập:**
Sau khi điền đầy đủ thông tin, nhấn **Lưu bài tập**. Ngay lúc này, hệ thống tự động thực hiện **kiểm tra trùng lặp nhanh**. Nếu phát hiện bài tập mới có độ tương đồng cao với một bài đã tồn tại, hộp thoại cảnh báo sẽ hiển thị tên bài trùng và phần trăm tương đồng. Tại đây có hai lựa chọn:

- Nhấn **✅ Vẫn lưu** để tiếp tục lưu bài tập dù có cảnh báo.
- Nhấn **✕ Hủy** để quay lại form chỉnh sửa nội dung trước khi lưu.

### 5.5 Sửa và xóa bài tập

**Sửa bài tập:**
Trong bảng danh sách, nhấn nút **Sửa** bên cạnh bài tập cần chỉnh sửa. Form tự động điền sẵn toàn bộ thông tin hiện tại của bài. Thực hiện các thay đổi cần thiết rồi nhấn **Lưu bài tập** để cập nhật.

> **Lưu ý quan trọng:** Giảng viên chỉ có thể sửa các bài tập **do chính mình tạo ra**. Bài tập của giảng viên khác sẽ không có nút Sửa.

**Xóa bài tập:**
Trong bảng danh sách, nhấn nút **Xóa** bên cạnh bài tập muốn gỡ bỏ. Hệ thống hiển thị hộp thoại xác nhận để tránh xóa nhầm. Sau khi xác nhận, bài tập bị ẩn khỏi giao diện người dùng nhưng không bị xóa hoàn toàn khỏi cơ sở dữ liệu (cơ chế xóa mềm). Admin có thể khôi phục nếu cần.

### 5.6 Sử dụng tính năng Trí tuệ Nhân tạo (AI)

Hệ thống tích hợp AI để hỗ trợ ba nghiệp vụ riêng biệt trong quá trình soạn thảo bài tập:

#### a. Sinh nội dung bài tập tự động

Trong form tạo hoặc sửa bài tập, nhấn nút **🤖 AI Sinh Nội Dung**. Cửa sổ AI mở ra. Nhập mô tả yêu cầu ngắn gọn vào ô prompt, ví dụ:

> *"Bài tập về con trỏ trong C++, yêu cầu sinh viên cấp phát động mảng hai chiều và tính tổng từng hàng. Độ khó: Trung bình."*

Chọn loại nội dung muốn sinh: *Mô tả*, *Yêu cầu kỹ thuật*, *Tiêu chí chấm điểm* hoặc *Sinh toàn bộ*. Nhấn **Sinh nội dung** và chờ AI xử lý (thường mất 5–10 giây). Xem kết quả trong cửa sổ xem trước. Nếu hài lòng, nhấn **Điền vào form** để AI tự động điền vào các ô tương ứng. Luôn kiểm tra lại nội dung được sinh trước khi lưu.

#### b. AI Phản biện và Đề xuất cải thiện

Sau khi đã điền Tên bài và Mô tả vào form, nhấn nút **💡 AI Phản Biện**. AI phân tích nội dung và trả về:

- **Trạng thái đánh giá:** *Hợp lệ*, *Cần chú ý* hoặc *Không đạt* — kèm nhận xét cụ thể về từng vấn đề.
- **Bộ tiêu chí chấm điểm nâng cao:** Đề xuất thay thế cho bộ tiêu chí hiện tại nếu còn sơ sài.
- **Gợi ý ngữ cảnh/cốt truyện mới:** Giúp tạo ra phiên bản bài tập mới về nội dung nhưng tương tự về kỹ năng, tránh trùng lặp.

Mỗi đề xuất đều có nút áp dụng riêng lẻ — giảng viên có thể chọn chấp nhận hoặc bỏ qua từng mục theo ý muốn.

#### c. Kiểm tra trùng lặp thủ công (trước khi lưu)

Sau khi điền Tên bài và Mô tả vào form, nhấn nút **🔍 Kiểm tra trùng lặp**. Hệ thống so sánh nội dung đang nhập với toàn bộ ngân hàng bài tập hiện có và trả về:

- Mức độ tương đồng (theo phần trăm).
- Tên bài tập tương đồng nhất.
- Tóm tắt điểm chung giữa hai bài.

Tính năng này chạy độc lập và không yêu cầu thực hiện bước nào trước đó.

### 5.7 Xuất và Nhập dữ liệu hàng loạt

Nhấn menu **Xuất Nhập dữ liệu** để sử dụng các tính năng trao đổi dữ liệu với file Excel.

#### Xuất dữ liệu ra Excel

1. Chọn môn học muốn xuất, hoặc để trống để xuất tất cả bài tập được phân công.
2. Tùy chọn lọc thêm theo dạng bài hoặc khoảng thời gian cập nhật.
3. Nhấn **Xuất Excel**. File `.xlsx` được tải về máy, chứa đầy đủ thông tin bài tập theo cấu trúc cột chuẩn của hệ thống.

#### Nhập dữ liệu từ Excel

Quy trình nhập dữ liệu được thiết kế theo ba bước tuần tự để đảm bảo an toàn:

**Bước 1 — Chuẩn bị file:** Nên sử dụng file Excel mẫu được hệ thống cung cấp (nhấn **Tải file mẫu**) làm nền tảng. Thêm dữ liệu vào file này theo đúng cấu trúc cột để tránh lỗi định dạng khi nhập lại.

**Bước 2 — Xem trước kết quả:** Nhấn **Chọn file Excel** và chọn file từ máy tính. Hệ thống đọc file và hiển thị bảng xem trước toàn bộ dữ liệu. Các dòng hợp lệ được đánh dấu màu xanh; các dòng có lỗi (sai định dạng, thiếu trường bắt buộc, không có quyền…) được tô màu đỏ kèm mô tả lý do lỗi cụ thể. Kiểm tra kỹ bảng xem trước trước khi tiến hành bước tiếp theo.

**Bước 3 — Xác nhận ghi vào hệ thống:** Nhấn **✅ Xác nhận Import** để ghi toàn bộ dữ liệu hợp lệ vào cơ sở dữ liệu. Hệ thống báo cáo kết quả chi tiết: số bài thêm mới, số bài cập nhật, số dòng bị bỏ qua và danh sách lỗi nếu có.

#### Nhập từ file PDF (AI)

Nhấn **Chọn file PDF** để tải lên tài liệu đề cương hoặc bộ đề bài ở định dạng PDF. AI sẽ tự động phân tích, nhận diện cấu trúc bài tập trong tài liệu và chuyển đổi thành dữ liệu có cấu trúc tương tự quy trình nhập Excel (có bước xem trước và xác nhận).

> **Lưu ý:** Tính năng nhập PDF phụ thuộc vào chất lượng và cấu trúc của tài liệu gốc. Kết quả nên được kiểm tra kỹ trước khi xác nhận lưu.

### 5.8 Kiểm tra trùng lặp toàn hệ thống

Đây là tính năng giúp phát hiện các cặp bài tập trong kho có nội dung tương đồng nhau, phục vụ công tác đảm bảo chất lượng và tính đa dạng của ngân hàng bài tập.

#### Cơ chế hoạt động — Tại sao có hai nút riêng biệt?

Để tối ưu hiệu suất và đảm bảo sự ổn định tuyệt đối, quy trình kiểm tra trùng lặp được thiết kế tách biệt thành hai giai đoạn độc lập:

**Giai đoạn 1 — Đồng bộ dữ liệu (nút "Đồng bộ Vân tay"):**

Việc so sánh trực tiếp toàn bộ nội dung văn bản của hàng trăm bài tập cùng lúc sẽ tiêu tốn rất nhiều tài nguyên máy chủ. Do đó, hệ thống sử dụng **Trí tuệ Nhân tạo (AI)** để đọc hiểu và rút gọn mỗi bài tập thành 5 từ khóa cốt lõi — được gọi là "Vân tay" của bài tập đó.

- **Yêu cầu:** Cần kết nối internet để giao tiếp với máy chủ AI bên ngoài (Groq).
- **Tốc độ:** Mỗi bài tập xử lý mất khoảng 2 giây; tổng thời gian phụ thuộc vào số lượng bài chưa được đồng bộ.
- **Tần suất thực hiện:** Chỉ cần chạy **một lần duy nhất cho mỗi bài tập mới**. Bài tập đã được đồng bộ sẽ không cần xử lý lại ở lần sau, trừ khi nội dung có thay đổi đáng kể.

**Giai đoạn 2 — Quét toàn hệ thống (nút "Quét toàn hệ thống"):**

Khi nhấn nút này, hệ thống **bỏ qua hoàn toàn văn bản gốc** và chỉ làm việc với các bộ "Vân tay" đã thu thập được ở Giai đoạn 1. Thuật toán tiến hành đối chiếu chéo tất cả các bộ vân tay với nhau (Bài A với Bài B, Bài B với Bài C…). Các cặp bài tập có mức độ tương đồng từ **70% trở lên** sẽ được tổng hợp vào danh sách báo cáo.

- **Không yêu cầu kết nối internet:** Toàn bộ quá trình diễn ra nội bộ trên máy chủ.
- **Tốc độ cực nhanh:** So sánh hàng ngàn bài tập chỉ mất chưa tới 1 giây.

**Lý do thiết kế tách biệt:**
Nếu gộp cả hai giai đoạn vào một nút "Quét", hệ thống sẽ phải gửi đồng thời hàng chục đến hàng trăm yêu cầu lên máy chủ AI ngay tại thời điểm nhấn nút, dẫn đến nguy cơ quá tải API và gián đoạn toàn bộ quá trình. Việc tách biệt cho phép **chạy Giai đoạn 1 chủ động từ trước** một cách an toàn và bền bỉ. Sau đó, bất cứ khi nào cần kiểm tra, Giai đoạn 2 luôn trả về kết quả **ngay lập tức** mà không có rủi ro gián đoạn.

#### Hướng dẫn sử dụng

1. Nhấn menu **Kiểm tra trùng lặp**.
2. Nhấn nút **Đồng bộ Vân tay** và chờ hệ thống xử lý tất cả bài tập chưa được đồng bộ. Quá trình này chỉ cần thực hiện định kỳ (ví dụ: sau khi thêm một loạt bài mới), không cần chạy trước mỗi lần quét.
3. Nhấn nút **Quét toàn hệ thống** để bắt đầu phân tích. Kết quả hiển thị ngay lập tức.
4. Xem bảng kết quả liệt kê các cặp bài tập tương đồng, bao gồm: Tên bài A, Tên bài B, Phần trăm tương đồng và Môn học.
5. Nhấn vào từng cặp để xem chi tiết điểm tương đồng và quyết định có cần chỉnh sửa hay gỡ bỏ bài nào không.

### 5.9 Tiếp nhận góp ý từ sinh viên

Nhấn menu **Tiếp nhận góp ý** để xem danh sách phản hồi do sinh viên gửi về các bài tập trong kho. Mỗi mục góp ý hiển thị: tên bài tập được góp ý, nội dung phản hồi cụ thể, cấp độ kỹ năng được đánh giá và thời gian gửi.

Đây là kênh thông tin quan trọng giúp giảng viên phát hiện các vấn đề tiềm ẩn trong đề bài (diễn đạt khó hiểu, yêu cầu mâu thuẫn, tiêu chí chấm điểm chưa rõ ràng…) để cải thiện chất lượng cho các kỳ giảng dạy tiếp theo.

### 5.10 Lịch sử bài tập

Nhấn menu **Lịch sử bài tập** để xem nhật ký toàn bộ các thao tác đã thực hiện trên kho bài: thêm mới, chỉnh sửa và xóa bài tập. Mỗi bản ghi bao gồm: tên bài tập liên quan, loại hành động thực hiện và thời gian chính xác. Tính năng này hữu ích để tra cứu lại lịch sử chỉnh sửa và xác minh ai đã thực hiện thay đổi nào khi cần thiết.

---

## PHẦN 6 — HƯỚNG DẪN DÀNH CHO QUẢN TRỊ VIÊN (ADMIN)

Admin đăng nhập tại `http://localhost:3000/login` theo quy trình tương tự Giảng viên. Sau khi đăng nhập thành công với tài khoản có quyền Admin, hệ thống chuyển đến trang `http://localhost:3000/admin` với toàn bộ tính năng mở rộng.

Admin có đầy đủ quyền của Giảng viên, cộng thêm khả năng quản lý người dùng và can thiệp vào bài tập của mọi giảng viên trong hệ thống.

### 6.1 Quản lý tài khoản người dùng

Nhấn menu **Quản lý người dùng**. Hệ thống hiển thị danh sách đầy đủ tất cả tài khoản, kèm trạng thái hiện tại và thông tin cơ bản.

**Phê duyệt tài khoản mới:**
Giảng viên vừa đăng ký sẽ ở trạng thái **Chờ duyệt**. Admin xem xét thông tin và nhấn **Phê duyệt** để kích hoạt tài khoản, cho phép họ đăng nhập và bắt đầu sử dụng hệ thống. Nhấn **Từ chối** nếu thông tin đăng ký không hợp lệ hoặc người đăng ký không thuộc đơn vị.

**Khóa và mở khóa tài khoản:**
Tìm tài khoản cần xử lý trong danh sách và nhấn **Khóa**. Tài khoản bị khóa vẫn còn trong hệ thống nhưng không thể đăng nhập. Nhấn **Kích hoạt lại** để mở khóa bất kỳ lúc nào.

**Phân công môn học:**
Nhấn vào tên tài khoản giảng viên để chỉnh sửa thông tin, bao gồm việc gán thêm hoặc gỡ bỏ môn học trong danh sách môn được phép quản lý.

### 6.2 Xem lịch sử đăng nhập

Nhấn menu **Lịch sử đăng nhập** để xem log truy cập của từng tài khoản, bao gồm thời gian đăng nhập và trạng thái xác thực (thành công hay thất bại). Tính năng này hỗ trợ phát hiện các hoạt động truy cập bất thường hoặc tài khoản bị nhập sai mật khẩu nhiều lần.

### 6.3 Quản lý bài tập toàn hệ thống

Trong menu **Ngân hàng bài tập**, Admin có thể xem bài tập của **tất cả giảng viên** mà không bị giới hạn theo môn học. Sử dụng các bộ lọc theo tên giảng viên, môn học hoặc dạng bài để tìm kiếm nhanh chóng. Admin có toàn quyền sửa hoặc xóa bất kỳ bài tập nào khi phát hiện sai sót nghiêm trọng hoặc vi phạm quy định của đơn vị.

### 6.4 Xuất dữ liệu toàn hệ thống

Trong menu **Xuất Nhập dữ liệu**, Admin có thêm tùy chọn xuất dữ liệu không bị giới hạn theo môn hay theo giảng viên. Có thể xuất toàn bộ kho bài tập, hoặc lọc theo từng giảng viên cụ thể. Tính năng này phục vụ mục đích báo cáo định kỳ, chuẩn bị hồ sơ thanh kiểm tra học kỳ hoặc sao lưu dữ liệu toàn hệ thống.

---

## PHẦN 7 — CÂU HỎI THƯỜNG GẶP

**Tôi không thấy môn học nào khi tạo bài tập?**

Giảng viên chỉ thấy và làm việc được với các môn học đã được Admin phân công. Nếu ô chọn môn trống hoặc không hiển thị môn cần dùng, liên hệ Admin để được gán thêm môn học phù hợp. Sau khi được gán, tải lại trang (nhấn F5) và thử lại.

---

**Mã bài tập tự sinh có bị sai không?**

Mã được tính tự động theo quy tắc `MaMon_Dang_SoThuTu` (ví dụ: `KTLT_D1_12`). Có thể sửa tay, nhưng phải đảm bảo mã mới là duy nhất — không trùng với bất kỳ bài tập nào đã có trong hệ thống. Nếu hệ thống báo lỗi trùng mã khi lưu, nhấn **F5** để tải lại trang, hệ thống sẽ tính lại mã theo số thứ tự mới nhất, sau đó thử lưu lại.

---

**Lưu bài tập báo lỗi "Mã bài tập đã tồn tại"?**

Nguyên nhân thường do mã tự sinh bị xung đột với bài tập vừa được người khác tạo cùng lúc. Nhấn **F5** để tải lại trang — hệ thống tự động tính lại mã theo số thứ tự hiện tại, sau đó thử lưu lại. Nếu vẫn lỗi, thử chỉnh sửa mã thủ công (ví dụ: thêm hậu tố `_a` hoặc đổi số cuối).

---

**File đính kèm tải lên không thành công?**

Kiểm tra hai điều kiện: (1) dung lượng file không vượt quá **10MB**, và (2) định dạng file nằm trong danh sách được hỗ trợ: **JPG, PNG, PDF, ZIP, DOCX**. Các định dạng khác như `.rar`, `.exe`, `.psd` hiện chưa được hỗ trợ.

---

**AI sinh nội dung hoặc Đồng bộ Vân tay bị lỗi?**

Trước tiên, kiểm tra kết nối mạng của máy tính hoặc máy chủ. Nếu mạng hoạt động bình thường mà vẫn gặp lỗi, có thể API key AI đã hết hạn hoặc đã đạt giới hạn lượt gọi (quota). Liên hệ Admin để kiểm tra và cập nhật cấu hình API trên máy chủ.

---

**Sinh viên không thấy bài tập vừa tạo?**

Trang sinh viên tải danh sách bài tập một lần khi mở trình duyệt. Sinh viên cần nhấn **F5** hoặc tải lại tab để lấy dữ liệu mới nhất từ server. Bài tập đã lưu thành công sẽ xuất hiện ngay sau khi tải lại.

---

**Tôi muốn sửa bài tập của giảng viên khác?**

Tính năng này không khả dụng với tài khoản Giảng viên thông thường — mỗi giảng viên chỉ có thể sửa bài tập do chính mình tạo. Nếu phát hiện bài tập của người khác có vấn đề về nội dung, hãy liên hệ Admin hoặc sử dụng chức năng **Góp ý** trên trang sinh viên để thông báo.

---

**Quên mật khẩu phải làm gì?**

Truy cập `http://localhost:3000/forgot`, nhập Mã giảng viên và làm theo hướng dẫn trên màn hình để đặt lại mật khẩu mới. Nếu không nhớ cả mã giảng viên, liên hệ trực tiếp Admin để được xác minh danh tính và hỗ trợ đặt lại thủ công.

---

## HỖ TRỢ KỸ THUẬT

Nếu gặp sự cố kỹ thuật không thể tự giải quyết, sử dụng chức năng **Góp ý** trên trang Giảng viên để gửi mô tả vấn đề đến Admin. Admin sẽ xem xét và phản hồi trong thời gian sớm nhất. Đối với các sự cố khẩn cấp ảnh hưởng đến nhiều người dùng, liên hệ trực tiếp qua kênh liên lạc nội bộ của đơn vị.

---

## PHẦN 8 — HỎI ĐÁP BẢO VỆ ĐỒ ÁN (DÀNH CHO HỘI ĐỒNG)

Đây là tài liệu tham khảo nhanh giúp trả lời các câu hỏi phản biện thường gặp từ Hội đồng đánh giá liên quan đến kiến trúc và nghiệp vụ của hệ thống.

**Câu 1: Nếu quản trị viên xóa hoặc khóa một Giảng viên khỏi hệ thống, dữ liệu bài tập của họ sẽ ra sao?**

- **Trả lời:** Hệ thống được thiết kế theo cơ chế **bảo toàn tri thức**. Khi một giảng viên bị xóa hoặc khóa, toàn bộ các bài tập do họ tạo ra vẫn được giữ nguyên trong cơ sở dữ liệu và tiếp tục phục vụ sinh viên (bởi đó là tài sản của bộ môn/khoa). Tuy nhiên, trên giao diện quản trị, tên tác giả của bài tập có thể hiển thị dưới dạng *"(Tài khoản đã bị xóa)"* hoặc chuyển quyền sở hữu sang tài khoản Admin, tùy thuộc vào nghiệp vụ cụ thể. Việc này đảm bảo không gây gián đoạn cho sinh viên đang ôn tập.

**Câu 2: Tại sao hệ thống lại cần dùng đến SQL Server mà không dùng MongoDB, trong khi Node.js thường đi kèm với MongoDB?**

- **Trả lời:** Mặc dù hệ sinh thái Node.js thường gắn liền với NoSQL (MongoDB), việc chọn SQL Server (Cơ sở dữ liệu quan hệ) là quyết định có chủ đích:
  - Dữ liệu của ứng dụng (Sinh viên, Giảng viên, Bài tập, Môn học, Tiêu chí chấm điểm) có **tính quan hệ chặt chẽ** (relational).
  - SQL Server đảm bảo **tính toàn vẹn dữ liệu** thông qua ràng buộc khóa ngoại (Foreign Key) và giao dịch (ACID) tốt hơn so với NoSQL, rất cần thiết cho một hệ thống mang tính học thuật.
  - Phù hợp với chuẩn công nghệ thường dùng tại các trường đại học hiện nay.

**Câu 3: Hệ thống làm sao xử lý được nếu nhiều giảng viên cùng lúc yêu cầu AI sinh đề bài? Liệu có bị chậm hay treo không?**

- **Trả lời:** Hệ thống xử lý vấn đề này qua kiến trúc bất đồng bộ (asynchronous) của Node.js:
  - Khi người dùng gửi request, server không chặn (block) các tiến trình khác mà đưa request gọi API AI vào hàng đợi (Event Loop).
  - Tuy nhiên, nếu có quá nhiều request đồng thời vượt quá giới hạn (Rate limit) của nhà cung cấp AI (Groq), hệ thống đã cài đặt cơ chế bắt lỗi (try-catch) và sẽ trả về thông báo lỗi thân thiện cho người dùng thay vì làm sập ứng dụng.
  - Về lâu dài, có thể tích hợp cơ chế Hàng đợi (Message Queue) như RabbitMQ hoặc Redis để lên lịch xử lý tuần tự.

**Câu 4: Chức năng kiểm tra trùng lặp dựa trên thuật toán gì? Có thật sự hiệu quả không?**

- **Trả lời:** Chức năng kiểm tra trùng lặp sử dụng phương pháp **hybrid (kết hợp AI và thuật toán truyền thống)**:
  - *Bước 1 (AI Extract):* Dùng AI để trích xuất 5 từ khóa cốt lõi (vân tay) của mỗi bài tập. Việc này loại bỏ các từ ngữ rườm rà và giúp nắm bắt ngữ nghĩa thực sự của bài.
  - *Bước 2 (Jaccard/Cosine Similarity):* Thuật toán chạy offline so sánh tập hợp các từ khóa này với nhau để tính toán mức độ tương đồng. 
  - Cách làm này hiệu quả và tốc độ cao hơn rất nhiều so với việc đọ từng chữ (string matching) của văn bản gốc, đồng thời cũng thông minh hơn vì nắm bắt được *ý tưởng* thay vì chỉ là *từ vựng*.

**Câu 5: Nếu sinh viên đăng nhập liên tục hoặc spam hệ thống tìm kiếm thì sao?**

- **Trả lời:** Hiện tại hệ thống không bắt buộc sinh viên đăng nhập để tối ưu sự tiện lợi, nhưng để chống spam:
  - Các ô tìm kiếm đều được trang bị kỹ thuật **Debounce**, nghĩa là chỉ gửi request lên server khi người dùng đã ngừng gõ một khoảng thời gian (VD: 300ms), giúp giảm đến 80% lượng request thừa.
  - Ngoài ra, hệ thống web tĩnh kết hợp API tối ưu giúp việc trả về kết quả truy vấn text trên DB SQL rất nhanh. (Trong tương lai có thể bổ sung Rate Limiting ở cấp độ middleware của Express để chặn các IP spam).

---

*Cảm ơn bạn đã sử dụng Hệ thống Ngân Hàng Bài Tập Lập Trình.*
