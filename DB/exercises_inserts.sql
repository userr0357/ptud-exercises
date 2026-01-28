-- Generated INSERTs for Exercises
SET NOCOUNT ON;

-- Ensure target table exists: dbo.ptud_Exercises
IF OBJECT_ID('dbo.ptud_Exercises','U') IS NULL
RAISERROR('Target table dbo.ptud_Exercises not found. Run insert_exercises_safe.sql first.',16,1);

-- Bài 1: Xác định độ phức tạp của câu lệnh gán và điều kiện
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'CTDL_GT-001', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'CTDL_GT'), NULL, NULL, N'Bài 1: Xác định độ phức tạp của câu lệnh gán và điều kiện', N'Phân tích đoạn mã đơn lẻ.', N'Cho đoạn mã gồm các phép gán số học và một cấu trúc if-else đơn giản (không chứa vòng lặp).', N'1. Xác định đúng độ phức tạp là O(1).
  2. Giải thích được tại sao các phép toán cơ bản được coi là thời gian hằng số.
  3. Bổ sung 1: Chứng minh được tổng thời gian là Max(thời gian nhánh If, thời gian nhánh Else).
  4. Bổ sung 2: Xác định đúng độ phức tạp không gian (Space Complexity) là O(1).', N'CTDL_GT');

-- Bài 2: Vòng lặp đơn tính tổng
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'CTDL_GT-002', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'CTDL_GT'), NULL, NULL, N'Bài 2: Vòng lặp đơn tính tổng', N'Phân tích vòng lặp for/while cơ bản.', N'Cho đoạn mã duyệt từ 1 đến n để tính tổng S.', N'1. Xác định đúng O(n).
  2. Chỉ ra câu lệnh nào là câu lệnh chủ chốt (dominant operation) được lặp lại n lần.
  3. Bổ sung 1: Giải thích sự phụ thuộc tuyến tính giữa kích thước đầu vào n và số bước thực thi.
  4. Bổ sung 2: Đánh giá bộ nhớ sử dụng không thay đổi theo n (O(1)).', N'CTDL_GT');

-- Bài 3: Vòng lặp với bước nhảy hằng số
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'CTDL_GT-003', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'CTDL_GT'), NULL, NULL, N'Bài 3: Vòng lặp với bước nhảy hằng số', N'Phân tích vòng lặp có bước nhảy i += 5.', N'Cho vòng lặp for (int i = 0; i < n; i += 5).', N'1. Xác định đúng O(n).
  2. Giải thích được quy tắc bỏ qua hằng số nhân (1/5 * n vẫn là O(n)).
  3. Bổ sung 1: Thiết lập được biểu thức toán học tính số lần lặp chính xác (n/5).
  4. Bổ sung 2: Phân biệt được sự khác biệt giữa số lần lặp thực tế và bậc tăng trưởng (Rate of growth).', N'CTDL_GT');

-- Bài 4: Tìm kiếm tuyến tính (Linear Search)
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'CTDL_GT-004', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'CTDL_GT'), NULL, NULL, N'Bài 4: Tìm kiếm tuyến tính (Linear Search)', N'Phân tích trường hợp tốt nhất và xấu nhất.', N'Phân tích thuật toán tìm x trong mảng n phần tử.', N'1. Chỉ ra Best case là O(1) và Worst case là O(n).
  2. Giải thích được điều kiện xảy ra của từng trường hợp.
  3. Bổ sung 1: Tính toán độ phức tạp trung bình (Average case) nếu giả định x nằm ngẫu nhiên.
  4. Bổ sung 2: Đánh giá ảnh hưởng của việc mảng đã sắp xếp hay chưa đối với thuật toán này.

------------------------------------------------------------

PHẦN 2: MỨC ĐỘ TRUNG BÌNH (MEDIUM)', N'CTDL_GT');

-- Bài 5: Vòng lặp lồng nhau cơ bản
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'CTDL_GT-005', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'CTDL_GT'), NULL, NULL, N'Bài 5: Vòng lặp lồng nhau cơ bản', N'Phân tích cấu trúc hai vòng lặp lồng nhau độc lập.', N'Vòng lặp i chạy từ 1 đến n, vòng lặp j chạy từ 1 đến n.', N'1. Xác định đúng O(n^2).
  2. Sử dụng quy tắc nhân để giải thích (n lần của n bước).
  3. Bổ sung 1: Vẽ được mô hình lưới (grid) thể hiện số lần thực thi các câu lệnh bên trong.
  4. Bổ sung 2: Đánh giá sự bùng nổ thời gian khi n tăng lên gấp đôi (thời gian tăng gấp 4).', N'CTDL_GT');

-- Bài 6: Vòng lặp lồng nhau dạng tam giác
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'CTDL_GT-006', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'CTDL_GT'), NULL, NULL, N'Bài 6: Vòng lặp lồng nhau dạng tam giác', N'Tính toán tổng cấp số cộng.', N'Vòng lặp i chạy từ 1 đến n, vòng lặp j chạy từ 1 đến i.', N'1. Chứng minh tổng số lần lặp là n*(n+1)/2.
  2. Kết luận đúng bậc cao nhất là O(n^2).
  3. Bổ sung 1: Giải thích quy tắc bỏ qua các thành phần bậc thấp (n/2) và hệ số (1/2).
  4. Bổ sung 2: So sánh hiệu năng thực tế với Bài 5 (nhanh hơn khoảng 2 lần nhưng cùng bậc Big O).', N'CTDL_GT');

-- Bài 7: Thuật toán chia để trị đơn giản (Chia đôi)
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'CTDL_GT-007', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'CTDL_GT'), NULL, NULL, N'Bài 7: Thuật toán chia để trị đơn giản (Chia đôi)', N'Phân tích biến chạy theo phép nhân/chia.', N'Cho vòng lặp for (int i = 1; i < n; i *= 2).', N'1. Giải thích tại sao số lần lặp là log2(n).
  2. Kết luận O(log n).
  3. Bổ sung 1: Chỉ ra được tốc độ tăng trưởng cực chậm của hàm Logarit khi n rất lớn.
  4. Bổ sung 2: Xác định điều kiện dừng của vòng lặp dưới dạng bất phương trình toán học.', N'CTDL_GT');

-- Bài 8: Độ phức tạp của thuật toán sắp xếp cơ bản
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'CTDL_GT-008', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'CTDL_GT'), NULL, NULL, N'Bài 8: Độ phức tạp của thuật toán sắp xếp cơ bản', N'Phân tích Selection Sort hoặc Bubble Sort.', N'Phân tích đoạn mã của thuật toán sắp xếp có 2 vòng lặp lồng nhau.', N'1. Xác định đúng O(n^2).
  2. Phân tích được số phép so sánh và số phép hoán vị.
  3. Bổ sung 1: Đánh giá độ phức tạp không gian (In-place sorting) là O(1).
  4. Bổ sung 2: Phân tích trường hợp tốt nhất của Bubble Sort khi có biến cờ hiệu (flag).

------------------------------------------------------------

PHẦN 3: MỨC ĐỘ KHÓ (HARD)', N'CTDL_GT');

-- Bài 9: Đệ quy tuyến tính (Tính Giai thừa)
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'CTDL_GT-009', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'CTDL_GT'), NULL, NULL, N'Bài 9: Đệ quy tuyến tính (Tính Giai thừa)', N'Thiết lập phương trình truy hồi.', N'Phân tích hàm đệ quy T(n) = T(n-1) + O(1).', N'1. Xác định đúng độ phức tạp thời gian O(n).
  2. Xác định đúng độ phức tạp không gian O(n).
  3. Bổ sung 1: Giải thích cơ chế Stack Frame dẫn đến tiêu tốn bộ nhớ trong đệ quy.
  4. Bổ sung 2: So sánh với phương pháp dùng vòng lặp (O(1) không gian).', N'CTDL_GT');

-- Bài 10: Đệ quy nhị phân (Fibonacci đệ quy)
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'CTDL_GT-010', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'CTDL_GT'), NULL, NULL, N'Bài 10: Đệ quy nhị phân (Fibonacci đệ quy)', N'Vẽ cây đệ quy để phân tích.', N'Phân tích hàm đệ quy T(n) = T(n-1) + T(n-2) + O(1).', N'1. Chứng minh số lượng lời gọi hàm tăng theo hàm mũ O(2^n).
  2. Giải thích sự lặp lại lãng phí trong các nhánh cây đệ quy.
  3. Bổ sung 1: Xác định chiều cao tối đa của cây đệ quy để suy ra Space Complexity O(n).
  4. Bổ sung 2: Đề xuất phương pháp tối ưu (Quy hoạch động) để giảm về O(n).', N'CTDL_GT');

-- Bài 11: Thuật toán Tìm kiếm nhị phân (Binary Search)
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'CTDL_GT-011', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'CTDL_GT'), NULL, NULL, N'Bài 11: Thuật toán Tìm kiếm nhị phân (Binary Search)', N'Phân tích đệ quy chia đôi dữ liệu.', N'Phân tích T(n) = T(n/2) + O(1).', N'1. Kết luận O(log n).
  2. Giải thích cơ chế loại bỏ một nửa dữ liệu sau mỗi bước.
  3. Bổ sung 1: Chứng minh bằng phương pháp thế (Substitution method) trong toán học.
  4. Bổ sung 2: Đánh giá Space Complexity cho cả hai phiên bản: Đệ quy (O(log n)) và Vòng lặp (O(1)).', N'CTDL_GT');

-- Bài 12: Phân tích thuật toán Quick Sort (Trường hợp xấu nhất)
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'CTDL_GT-012', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'CTDL_GT'), NULL, NULL, N'Bài 12: Phân tích thuật toán Quick Sort (Trường hợp xấu nhất)', N'Phân tích sâu về sự mất cân bằng.', N'Phân tích Quick Sort khi Pivot luôn là phần tử cực đại/cực tiểu.', N'1. Chỉ ra tại sao đệ quy biến thành T(n) = T(n-1) + O(n).
  2. Kết luận Worst case là O(n^2).
  3. Bổ sung 1: Phân tích độ phức tạp không gian trong trường hợp xấu nhất (O(n)).
  4. Bổ sung 2: Đề xuất giải pháp chọn Pivot ngẫu nhiên (Randomized Quick Sort) để đạt O(n log n).




DANH SÁCH BÀI TẬP CẤU TRÚC DỮ LIỆU VÀ GIẢI THUẬT
DẠNG 2: CÁC THUẬT TOÁN SẮP XẾP VÀ TÌM KIẾM
------------------------------------------------------------

PHẦN 1: MỨC ĐỘ DỄ (EASY)', N'CTDL_GT');

-- Bài 1: Thuật toán Tìm kiếm tuyến tính (Linear Search)
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'CTDL_GT-013', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'CTDL_GT'), NULL, NULL, N'Bài 1: Thuật toán Tìm kiếm tuyến tính (Linear Search)', N'Viết hàm tìm kiếm một giá trị số nguyên x trong mảng n phần tử. Hàm trả về vị trí (chỉ số) đầu tiên tìm thấy x, nếu không thấy thì trả về -1.', N'Đây là phương pháp tìm kiếm cơ bản nhất, thực hiện kiểm tra lần lượt từng phần tử từ đầu đến cuối danh sách. Thuật toán này thường được dùng khi dữ liệu chưa được sắp xếp hoặc kích thước dữ liệu nhỏ, không yêu cầu cấu trúc phức tạp.
- Yêu cầu: Viết hàm tìm kiếm một giá trị số nguyên x trong mảng n phần tử. Hàm trả về vị trí (chỉ số) đầu tiên tìm thấy x, nếu không thấy thì trả về -1.', N'1. Cài đặt đúng vòng lặp duyệt toàn bộ mảng từ chỉ số 0 đến n-1.
  2. Thực hiện so sánh chính xác và thoát vòng lặp ngay khi tìm thấy kết quả.
  3. Xử lý đúng trường hợp mảng rỗng hoặc giá trị x không tồn tại.
  4. Đạt độ phức tạp thời gian O(n) cho trường hợp xấu nhất.', N'CTDL_GT');

-- Bài 2: Thuật toán Sắp xếp đổi chỗ trực tiếp (Interchange Sort)
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'CTDL_GT-014', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'CTDL_GT'), NULL, NULL, N'Bài 2: Thuật toán Sắp xếp đổi chỗ trực tiếp (Interchange Sort)', N'Cài đặt hàm sắp xếp một dãy số nguyên theo thứ tự tăng dần. Sử dụng hai vòng lặp lồng nhau để thực hiện việc so sánh và hoán vị trực tiếp.', N'Thuật toán này hoạt động bằng cách so sánh phần tử đang xét với tất cả các phần tử đứng sau nó. Nếu chúng không đúng thứ tự (tăng dần hoặc giảm dần), ta thực hiện hoán đổi ngay lập tức để dần đưa phần tử đúng về vị trí hiện tại.
- Yêu cầu: Cài đặt hàm sắp xếp một dãy số nguyên theo thứ tự tăng dần. Sử dụng hai vòng lặp lồng nhau để thực hiện việc so sánh và hoán vị trực tiếp.', N'1. Cấu trúc hai vòng lặp for lồng nhau với chỉ số i chạy từ 0 và j chạy từ i+1 chính xác.
  2. Thực hiện hàm hoán vị (swap) đúng kỹ thuật để không làm mất dữ liệu.
  3. Đảm bảo mảng kết quả được sắp xếp đúng thứ tự yêu cầu.
  4. Xác định đúng độ phức tạp thời gian là O(n^2).', N'CTDL_GT');

-- Bài 3: Thuật toán Sắp xếp nổi bọt (Bubble Sort)
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'CTDL_GT-015', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'CTDL_GT'), NULL, NULL, N'Bài 3: Thuật toán Sắp xếp nổi bọt (Bubble Sort)', N'Viết chương trình sắp xếp mảng tăng dần. Sau mỗi lượt lặp lớn, hãy in trạng thái của mảng ra màn hình để quan sát quá trình phần tử lớn nhất di chuyển về cuối.', N'Tên gọi của thuật toán bắt nguồn từ việc các phần tử lớn nhất sẽ "nổi" dần về phía cuối mảng giống như các bọt khí. Quá trình này thực hiện thông qua việc so sánh và hoán đổi liên tục các cặp phần tử kề nhau nếu chúng sai thứ tự.
- Yêu cầu: Viết chương trình sắp xếp mảng tăng dần. Sau mỗi lượt lặp lớn, hãy in trạng thái của mảng ra màn hình để quan sát quá trình phần tử lớn nhất di chuyển về cuối.', N'1. Cài đặt đúng vòng lặp so sánh cặp phần tử a[j] và a[j+1].
  2. Giảm dần phạm vi xét của vòng lặp bên trong sau mỗi lần lặp bên ngoài để tối ưu.
  3. Thực hiện hoán vị đúng điều kiện khi phần tử đứng trước lớn hơn phần tử đứng sau.
  4. Mô phỏng được các bước trung gian của mảng một cách logic.', N'CTDL_GT');

-- Bài 4: Thuật toán Sắp xếp chọn (Selection Sort)
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'CTDL_GT-016', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'CTDL_GT'), NULL, NULL, N'Bài 4: Thuật toán Sắp xếp chọn (Selection Sort)', N'Cài đặt hàm sắp xếp tăng dần. Sử dụng một biến tạm để lưu chỉ số của phần tử nhỏ nhất (minIndex) trong mỗi lượt duyệt.', N'Thay vì hoán đổi liên tục, thuật toán này chỉ tìm phần tử nhỏ nhất trong đoạn chưa sắp xếp, sau đó mới thực hiện một phép hoán đổi duy nhất để đưa nó về đúng vị trí đầu đoạn đó. Cách này giúp giảm thiểu tối đa số lần ghi vào bộ nhớ.
- Yêu cầu: Cài đặt hàm sắp xếp tăng dần. Sử dụng một biến tạm để lưu chỉ số của phần tử nhỏ nhất (minIndex) trong mỗi lượt duyệt.', N'1. Tìm chính xác vị trí của phần tử nhỏ nhất trong mỗi lượt lặp.
  2. Chỉ thực hiện hoán vị bên ngoài vòng lặp tìm kiếm (tối đa n-1 lần hoán vị).
  3. Đảm bảo tính ổn định của thuật toán trên các bộ dữ liệu mẫu.
  4. Chứng minh được số lần hoán đổi ít hơn so với Interchange Sort.

------------------------------------------------------------

PHẦN 2: MỨC ĐỘ TRUNG BÌNH (MEDIUM)', N'CTDL_GT');

-- Bài 5: Thuật toán Tìm kiếm nhị phân (Binary Search)
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'CTDL_GT-017', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'CTDL_GT'), NULL, NULL, N'Bài 5: Thuật toán Tìm kiếm nhị phân (Binary Search)', N'Viết hàm tìm kiếm x trên một mảng đã được sắp xếp tăng dần. Sử dụng vòng lặp while để cập nhật hai đầu mảng (left, right) và vị trí giữa (mid).', N'Đây là giải thuật tìm kiếm cực nhanh dựa trên chiến lược "chia để trị". Bằng cách luôn so sánh giá trị x với phần tử ở giữa mảng đã sắp xếp, phạm vi tìm kiếm sẽ bị thu hẹp đi một nửa sau mỗi bước thực hiện.
- Yêu cầu: Viết hàm tìm kiếm x trên một mảng đã được sắp xếp tăng dần. Sử dụng vòng lặp while để cập nhật hai đầu mảng (left, right) và vị trí giữa (mid).', N'1. Xác định đúng điều kiện dừng của vòng lặp là khi left vượt quá right.
  2. Cập nhật chỉ số left và right chính xác sau mỗi lần so sánh giá trị tại mid.
  3. Xử lý được trường hợp giá trị tìm thấy nằm ở ngay các đầu mảng hoặc chính giữa.
  4. Đạt độ phức tạp thời gian O(log n).', N'CTDL_GT');

-- Bài 6: Thuật toán Sắp xếp chèn (Insertion Sort)
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'CTDL_GT-018', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'CTDL_GT'), NULL, NULL, N'Bài 6: Thuật toán Sắp xếp chèn (Insertion Sort)', N'Cài đặt hàm sắp xếp tăng dần. Sử dụng vòng lặp để tìm vị trí thích hợp cho phần tử đang xét và thực hiện dời chỗ các phần tử khác để tạo khoảng trống.', N'Thuật toán này mô phỏng cách một người sắp xếp các quân bài trên tay. Ta lấy từng phần tử mới và chèn nó vào đúng vị trí trong dãy các phần tử đã được sắp xếp trước đó bằng cách dời các phần tử lớn hơn sang phải.
- Yêu cầu: Cài đặt hàm sắp xếp tăng dần. Sử dụng vòng lặp để tìm vị trí thích hợp cho phần tử đang xét và thực hiện dời chỗ các phần tử khác để tạo khoảng trống.', N'1. Sử dụng biến tạm để lưu giá trị phần tử đang được "chèn".
  2. Thực hiện dời chỗ (shift) các phần tử phía trước một cách chính xác mà không ghi đè mất dữ liệu.
  3. Xử lý đúng điều kiện dừng của vòng lặp tìm vị trí chèn (khi gặp phần tử nhỏ hơn hoặc chạm đầu mảng).
  4. Phân tích được ưu điểm O(n) khi mảng đầu vào đã gần như được sắp xếp.', N'CTDL_GT');

-- Bài 7: Tìm kiếm nhị phân bằng kỹ thuật Đệ quy
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'CTDL_GT-019', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'CTDL_GT'), NULL, NULL, N'Bài 7: Tìm kiếm nhị phân bằng kỹ thuật Đệ quy', N'Viết hàm đệ quy BinarySearch nhận vào mảng, giá trị x, chỉ số left và right. Thực hiện gọi lại chính hàm đó với phạm vi đã thu hẹp.', N'Thay vì dùng vòng lặp, việc sử dụng đệ quy giúp mã nguồn của tìm kiếm nhị phân trở nên gọn gàng và thể hiện rõ tư duy chia để trị. Mỗi lời gọi hàm sẽ giải quyết một bài toán con trên một nửa phạm vi của mảng ban đầu.
- Yêu cầu: Viết hàm đệ quy BinarySearch nhận vào mảng, giá trị x, chỉ số left và right. Thực hiện gọi lại chính hàm đó với phạm vi đã thu hẹp.', N'1. Thiết lập đúng điều kiện cơ sở (điểm dừng) để tránh đệ quy vô tận.
  2. Truyền tham số chỉ số mảng chính xác trong các lời gọi đệ quy nhánh trái/phải.
  3. Hàm trả về đúng kết quả từ các tầng đệ quy sâu nhất lên gốc.
  4. Đánh giá được độ phức tạp không gian O(log n) do sử dụng Stack đệ quy.', N'CTDL_GT');

-- Bài 8: Sắp xếp nổi bọt cải tiến (Bubble Sort with Flag)
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'CTDL_GT-020', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'CTDL_GT'), NULL, NULL, N'Bài 8: Sắp xếp nổi bọt cải tiến (Bubble Sort with Flag)', N'Viết hàm sắp xếp tăng dần tích hợp biến kiểm tra (bool swapped). Thực hiện kiểm chứng tốc độ với một mảng đã sắp xếp sẵn.', N'Nhược điểm của Bubble Sort là vẫn chạy đủ số vòng lặp ngay cả khi mảng đã sắp xếp xong. Cải tiến này sử dụng một biến "cờ hiệu" để nhận biết nếu trong một lượt lặp không có bất kỳ phép hoán vị nào xảy ra, nghĩa là mảng đã có thứ tự và có thể dừng ngay lập tức.
- Yêu cầu: Viết hàm sắp xếp tăng dần tích hợp biến kiểm tra (bool swapped). Thực hiện kiểm chứng tốc độ với một mảng đã sắp xếp sẵn.', N'1. Đặt biến cờ hiệu ở đầu mỗi lượt lặp lớn một cách chính xác.
  2. Cập nhật trạng thái cờ hiệu ngay khi có phép hoán vị xảy ra.
  3. Thoát khỏi chương trình sắp xếp ngay sau lượt lặp không có hoán vị.
  4. Chứng minh được thời gian chạy thực tế giảm đáng kể trên dữ liệu gần như đã sắp xếp.

------------------------------------------------------------

PHẦN 3: MỨC ĐỘ KHÓ (HARD)', N'CTDL_GT');

-- Bài 9: Thuật toán Sắp xếp nhanh (Quick Sort)
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'CTDL_GT-021', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'CTDL_GT'), NULL, NULL, N'Bài 9: Thuật toán Sắp xếp nhanh (Quick Sort)', N'Cài đặt hàm phân hoạch (Partition) theo phương pháp Lomuto hoặc Hoare và hàm đệ quy QuickSort để sắp xếp mảng số nguyên.', N'Quick Sort là thuật toán sắp xếp nhanh nhất trên thực tế trong nhiều trường hợp. Nó chọn một phần tử làm "chốt" (pivot) và phân chia mảng thành hai phần: một phần nhỏ hơn chốt và một phần lớn hơn chốt, sau đó tiếp tục đệ quy trên hai phần đó.
- Yêu cầu: Cài đặt hàm phân hoạch (Partition) theo phương pháp Lomuto hoặc Hoare và hàm đệ quy QuickSort để sắp xếp mảng số nguyên.', N'1. Thực hiện đúng logic phân hoạch để đưa chốt về đúng vị trí cuối cùng của nó.
  2. Gọi đệ quy chính xác cho các mảng con trái và phải của chốt.
  3. Đảm bảo tính chất: mọi phần tử bên trái chốt nhỏ hơn chốt, bên phải chốt lớn hơn chốt.
  4. Phân tích được trường hợp xấu nhất O(n^2) và cách khắc phục bằng việc chọn chốt ngẫu nhiên.', N'CTDL_GT');

-- Bài 10: Thuật toán Sắp xếp trộn (Merge Sort)
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'CTDL_GT-022', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'CTDL_GT'), NULL, NULL, N'Bài 10: Thuật toán Sắp xếp trộn (Merge Sort)', N'Viết hàm Merge để trộn hai mảng con đã sắp xếp và hàm đệ quy MergeSort để phân tách mảng ban đầu.', N'Dựa trên nguyên lý chia để trị, Merge Sort chia mảng thành các mảng con cho đến khi mỗi mảng chỉ còn một phần tử, sau đó "trộn" chúng lại theo thứ tự. Đây là thuật toán ổn định và luôn đảm bảo hiệu suất tốt nhất trong mọi tình huống.
- Yêu cầu: Viết hàm Merge để trộn hai mảng con đã sắp xếp và hàm đệ quy MergeSort để phân tách mảng ban đầu.', N'1. Cài đặt hàm trộn (Merge) chính xác, xử lý tốt các phần tử còn dư của hai mảng con.
  2. Quản lý bộ nhớ mảng tạm hợp lý, đảm bảo giải phóng sau khi sử dụng.
  3. Thực hiện chia đôi mảng chính xác tại vị trí mid để gọi đệ quy.
  4. Xác định đúng độ phức tạp thời gian luôn là O(n log n).', N'CTDL_GT');

-- Bài 11: Thuật toán Sắp xếp vun đống (Heap Sort)
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'CTDL_GT-023', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'CTDL_GT'), NULL, NULL, N'Bài 11: Thuật toán Sắp xếp vun đống (Heap Sort)', N'Viết hàm Heapify để duy trì tính chất của đống và hàm HeapSort để thực hiện việc sắp xếp mảng thông qua cây nhị phân.', N'Thuật toán này sử dụng cấu trúc dữ liệu "đống" (Heap) - một cây nhị phân gần hoàn chỉnh. Ta xây dựng một Max-Heap để phần tử lớn nhất luôn nằm ở gốc, sau đó đổi chỗ nó về cuối mảng và tái cấu trúc lại đống.
- Yêu cầu: Viết hàm Heapify để duy trì tính chất của đống và hàm HeapSort để thực hiện việc sắp xếp mảng thông qua cây nhị phân.', N'1. Xây dựng đúng cấu trúc Max-Heap từ mảng ban đầu.
  2. Thực hiện chính xác quy trình: hoán đổi gốc với phần tử cuối và gọi lại Heapify.
  3. Quản lý các chỉ số nút cha, nút con trên mảng một cách chính xác.
  4. Đánh giá được ưu điểm không tốn thêm bộ nhớ O(n) như Merge Sort nhưng vẫn đạt O(n log n).', N'CTDL_GT');

-- Bài 12: Tìm phần tử lớn thứ k (Sử dụng Partition của Quick Sort)
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'CTDL_GT-024', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'CTDL_GT'), NULL, NULL, N'Bài 12: Tìm phần tử lớn thứ k (Sử dụng Partition của Quick Sort)', N'Cài đặt thuật toán Quick Select để tìm giá trị lớn thứ k trong một mảng số nguyên chưa sắp xếp.', N'Thay vì sắp xếp toàn bộ mảng (mất O(n log n)), ta có thể tìm phần tử lớn thứ k chỉ với thời gian O(n) bằng cách sử dụng logic phân hoạch của Quick Sort. Ta chỉ quan tâm đến phân đoạn chứa chỉ số k sau mỗi lần chia.
- Yêu cầu: Cài đặt thuật toán Quick Select để tìm giá trị lớn thứ k trong một mảng số nguyên chưa sắp xếp.', N'1. Tái sử dụng thành công hàm phân hoạch (Partition).
  2. Chỉ thực hiện lời gọi đệ quy vào một bên của mảng dựa trên so sánh giữa vị trí chốt và k.
  3. Kết quả trả về phải chính xác so với việc sắp xếp mảng rồi lấy phần tử ở vị trí k.
  4. Giải thích được tại sao độ phức tạp trung bình của phương pháp này là O(n).


DANH SÁCH BÀI TẬP CẤU TRÚC DỮ LIỆU VÀ GIẢI THUẬT
DẠNG 3: NGĂN XẾP (STACK) VÀ HÀNG ĐỢI (QUEUE)
------------------------------------------------------------

PHẦN 1: MỨC ĐỘ DỄ (EASY)', N'CTDL_GT');

-- Bài 1: Cài đặt Stack lưu trữ số nguyên bằng mảng tĩnh
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'CTDL_GT-025', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'CTDL_GT'), NULL, NULL, N'Bài 1: Cài đặt Stack lưu trữ số nguyên bằng mảng tĩnh', N'Định nghĩa một cấu trúc Stack gồm mảng tĩnh có kích thước MAX và một biến chỉ số để quản lý đỉnh. Viết đầy đủ các hàm cơ bản: push (thêm), pop (lấy ra), peek (xem phần tử đỉnh) và isEmpty (kiểm tra rỗng). Viết chương trình chính để thử nghiệm việc đẩy một dãy số vào và lấy ra.', N'Ngăn xếp là một cấu trúc dữ liệu hoạt động theo nguyên lý "Vào sau - Ra trước" (LIFO). Trong các hệ thống máy tính, Stack được dùng để quản lý các lệnh thực thi hoặc lưu trữ tạm thời các biến cục bộ. Việc cài đặt bằng mảng giúp quản lý bộ nhớ tập trung và truy cập nhanh chóng.
- Yêu cầu: Định nghĩa một cấu trúc Stack gồm mảng tĩnh có kích thước MAX và một biến chỉ số để quản lý đỉnh. Viết đầy đủ các hàm cơ bản: push (thêm), pop (lấy ra), peek (xem phần tử đỉnh) và isEmpty (kiểm tra rỗng). Viết chương trình chính để thử nghiệm việc đẩy một dãy số vào và lấy ra.', N'1. Khai báo cấu trúc và khởi tạo chỉ số đỉnh (Top) ở giá trị -1 chính xác.
  2. Xử lý ngăn chặn lỗi tràn ngăn xếp (Stack Overflow) khi thực hiện push.
  3. Xử lý ngăn chặn lỗi lấy dữ liệu từ ngăn xếp rỗng (Stack Underflow) khi thực hiện pop.
  4. Đảm bảo các thao tác push/pop hoạt động với độ phức tạp thời gian O(1).', N'CTDL_GT');

-- Bài 2: Quản lý hàng đợi (Queue) bằng mảng tĩnh
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'CTDL_GT-026', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'CTDL_GT'), NULL, NULL, N'Bài 2: Quản lý hàng đợi (Queue) bằng mảng tĩnh', N'Cài đặt cấu trúc Queue sử dụng mảng tĩnh. Viết các hàm chức năng: enqueue (thêm vào cuối), dequeue (lấy ra từ đầu), front (xem phần tử đầu) và kiểm tra đầy/rỗng. Thực hiện mô phỏng việc nhận 5 mã số lệnh và xử lý 2 mã số để chứng minh thứ tự.', N'Hàng đợi hoạt động theo nguyên lý "Vào trước - Ra trước" (FIFO), giống như việc xếp hàng chờ thanh toán. Trong kỹ thuật lập trình, Queue thường được dùng để quản lý luồng dữ liệu truyền tin hoặc lịch trình in ấn của máy in, nơi lệnh nào đến trước phải được phục vụ trước.
- Yêu cầu: Cài đặt cấu trúc Queue sử dụng mảng tĩnh. Viết các hàm chức năng: enqueue (thêm vào cuối), dequeue (lấy ra từ đầu), front (xem phần tử đầu) và kiểm tra đầy/rỗng. Thực hiện mô phỏng việc nhận 5 mã số lệnh và xử lý 2 mã số để chứng minh thứ tự.', N'1. Quản lý đúng hai chỉ số Front (đầu) và Rear (cuối) trên mảng.
  2. Thực hiện chính xác việc dịch chuyển các chỉ số khi thêm hoặc lấy phần tử.
  3. Đảm bảo nguyên tắc FIFO được thực thi nghiêm ngặt trong mọi tình huống.
  4. Kiểm soát tốt các điều kiện biên khi hàng đợi rỗng hoặc đầy.', N'CTDL_GT');

-- Bài 3: Đảo ngược chuỗi ký tự bằng Stack
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'CTDL_GT-027', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'CTDL_GT'), NULL, NULL, N'Bài 3: Đảo ngược chuỗi ký tự bằng Stack', N'Nhập một chuỗi ký tự bất kỳ từ bàn phím. Sử dụng một Stack kiểu ký tự (char) để đẩy lần lượt từng ký tự của chuỗi vào. Sau đó, thực hiện lấy toàn bộ các ký tự ra khỏi Stack và nối chúng lại để tạo thành chuỗi đã được đảo ngược.', N'Việc đảo ngược một chuỗi văn bản là bài toán cơ bản trong xử lý dữ liệu. Nhờ đặc tính vào sau ra trước của Stack, ta có thể dễ dàng đảo ngược thứ tự các ký tự mà không cần sử dụng các thuật toán hoán vị phức tạp trên mảng.
- Yêu cầu: Nhập một chuỗi ký tự bất kỳ từ bàn phím. Sử dụng một Stack kiểu ký tự (char) để đẩy lần lượt từng ký tự của chuỗi vào. Sau đó, thực hiện lấy toàn bộ các ký tự ra khỏi Stack và nối chúng lại để tạo thành chuỗi đã được đảo ngược.', N'1. Xử lý nhập liệu tốt, bao gồm cả các chuỗi có khoảng trắng.
  2. Đẩy và lấy đúng, đủ toàn bộ ký tự vào/ra khỏi Stack.
  3. Chuỗi kết quả phải đảo ngược hoàn toàn so với chuỗi ban đầu và có ký tự kết thúc chuỗi hợp lệ.
  4. Đạt hiệu suất thời gian O(n) với n là chiều dài chuỗi.', N'CTDL_GT');

-- Bài 4: Kiểm tra chuỗi đối xứng (Palindrome)
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'CTDL_GT-028', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'CTDL_GT'), NULL, NULL, N'Bài 4: Kiểm tra chuỗi đối xứng (Palindrome)', N'Cho một chuỗi ký tự đầu vào. Đẩy đồng thời các ký tự vào một Stack và một Queue. Sau đó, thực hiện vòng lặp lấy từng ký tự từ cả hai cấu trúc ra để so sánh cặp một. Nếu tất cả các cặp đều giống nhau, chuỗi đó là đối xứng.', N'Một chuỗi được gọi là đối xứng khi đọc từ trái sang phải hay từ phải sang trái đều giống hệt nhau. Bằng cách kết hợp Stack (LIFO) và Queue (FIFO), ta có thể dễ dàng so sánh hai chiều của chuỗi để đưa ra kết luận về tính đối xứng.
- Yêu cầu: Cho một chuỗi ký tự đầu vào. Đẩy đồng thời các ký tự vào một Stack và một Queue. Sau đó, thực hiện vòng lặp lấy từng ký tự từ cả hai cấu trúc ra để so sánh cặp một. Nếu tất cả các cặp đều giống nhau, chuỗi đó là đối xứng.', N'1. Cài đặt thành công cả hai cấu trúc dữ liệu trong cùng một bài toán.
  2. Thực hiện việc đẩy và lấy dữ liệu đồng bộ giữa Stack và Queue.
  3. Đưa ra kết luận chính xác cho nhiều loại chuỗi khác nhau (độ dài chẵn, lẻ).
  4. Đánh giá được độ phức tạp không gian O(n) do sử dụng thêm bộ nhớ phụ.

------------------------------------------------------------

PHẦN 2: MỨC ĐỘ TRUNG BÌNH (MEDIUM)', N'CTDL_GT');

-- Bài 5: Kiểm tra tính hợp lệ của các dấu ngoặc
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'CTDL_GT-029', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'CTDL_GT'), NULL, NULL, N'Bài 5: Kiểm tra tính hợp lệ của các dấu ngoặc', N'Nhập một biểu thức chứa nhiều loại dấu ngoặc. Duyệt biểu thức: nếu gặp dấu mở thì đẩy vào Stack; nếu gặp dấu đóng thì kiểm tra xem nó có khớp với dấu mở ở đỉnh Stack hay không. Nếu khớp thì lấy dấu mở ra, nếu không khớp hoặc Stack rỗng thì biểu thức không hợp lệ.', N'Trình biên dịch mã nguồn cần một cơ chế để kiểm tra xem các cặp dấu ngoặc lồng nhau như (), [], {} có đóng mở đúng thứ tự hay không. Stack là công cụ lý tưởng vì dấu ngoặc mở gần nhất phải được đóng trước tiên.
- Yêu cầu: Nhập một biểu thức chứa nhiều loại dấu ngoặc. Duyệt biểu thức: nếu gặp dấu mở thì đẩy vào Stack; nếu gặp dấu đóng thì kiểm tra xem nó có khớp với dấu mở ở đỉnh Stack hay không. Nếu khớp thì lấy dấu mở ra, nếu không khớp hoặc Stack rỗng thì biểu thức không hợp lệ.', N'1. Phân loại đúng các loại dấu ngoặc và chỉ đẩy dấu ngoặc mở vào Stack.
  2. So khớp chính xác cặp dấu ngoặc tương ứng (ví dụ: ''['' phải đi với '']'').
  3. Xử lý được trường hợp Stack còn dư phần tử sau khi đã duyệt hết biểu thức.
  4. Giải thuật xử lý được biểu thức có độ dài lớn với thời gian O(n).', N'CTDL_GT');

-- Bài 6: Cài đặt Hàng đợi vòng (Circular Queue)
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'CTDL_GT-030', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'CTDL_GT'), NULL, NULL, N'Bài 6: Cài đặt Hàng đợi vòng (Circular Queue)', N'Cài đặt Queue bằng mảng với cơ chế quay vòng các chỉ số Front và Rear bằng toán tử chia lấy dư. Viết các hàm thêm và xóa sao cho khi các chỉ số chạm ngưỡng MAX, chúng sẽ quay về vị trí 0 nếu ô đó đã được giải phóng.', N'Hàng đợi cài đặt bằng mảng tĩnh thông thường sẽ bị lãng phí không gian ở phía trước sau nhiều lần lấy phần tử ra. Hàng đợi vòng cho phép chỉ số cuối quay trở lại đầu mảng khi mảng chưa đầy, giúp tối ưu hóa việc sử dụng bộ nhớ.
- Yêu cầu: Cài đặt Queue bằng mảng với cơ chế quay vòng các chỉ số Front và Rear bằng toán tử chia lấy dư. Viết các hàm thêm và xóa sao cho khi các chỉ số chạm ngưỡng MAX, chúng sẽ quay về vị trí 0 nếu ô đó đã được giải phóng.', N'1. Sử dụng công thức toán học (index + 1) % MAX để dịch chuyển các chỉ số.
  2. Xử lý chính xác logic để phân biệt giữa trạng thái "Hàng đợi đầy" và "Hàng đợi rỗng".
  3. Đảm bảo dữ liệu cũ không bị ghi đè khi hàng đợi thực sự đã đầy.
  4. Chứng minh được việc tiết kiệm không gian bộ nhớ so với Queue thông thường.', N'CTDL_GT');

-- Bài 7: Chuyển đổi hệ thập phân sang hệ nhị phân
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'CTDL_GT-031', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'CTDL_GT'), NULL, NULL, N'Bài 7: Chuyển đổi hệ thập phân sang hệ nhị phân', N'Viết chương trình nhận vào một số nguyên dương n. Thực hiện phép chia cho 2 lấy dư và đẩy phần dư vào Stack. Tiếp tục cho đến khi thương bằng 0. Cuối cùng, lấy toàn bộ các phần tử trong Stack ra để hiển thị dãy nhị phân hoàn chỉnh.', N'Trong toán học, để chuyển một số sang hệ nhị phân, ta chia liên tiếp cho 2 và lấy số dư theo thứ tự ngược lại. Stack với tính chất vào sau ra trước giúp ta lưu trữ các số dư này và in chúng ra theo đúng thứ tự cần thiết.
- Yêu cầu: Viết chương trình nhận vào một số nguyên dương n. Thực hiện phép chia cho 2 lấy dư và đẩy phần dư vào Stack. Tiếp tục cho đến khi thương bằng 0. Cuối cùng, lấy toàn bộ các phần tử trong Stack ra để hiển thị dãy nhị phân hoàn chỉnh.', N'1. Thực hiện đúng thuật toán chia lấy dư và cập nhật giá trị n.
  2. Lưu trữ đầy đủ các bit nhị phân vào Stack.
  3. Kết quả in ra màn hình phải đúng định dạng số nhị phân.
  4. Xử lý thành công trường hợp đầu vào là số 0.', N'CTDL_GT');

-- Bài 8: Cài đặt Stack động bằng Danh sách liên kết
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'CTDL_GT-032', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'CTDL_GT'), NULL, NULL, N'Bài 8: Cài đặt Stack động bằng Danh sách liên kết', N'Xây dựng Stack dựa trên cấu trúc Node. Thực hiện các thao tác push và pop tại vị trí đầu danh sách (Head) để đảm bảo tốc độ xử lý nhanh nhất. Viết hàm giải phóng toàn bộ danh sách khi không còn sử dụng.', N'Mảng tĩnh có nhược điểm là kích thước cố định, dễ gây tràn bộ nhớ. Việc cài đặt Stack dựa trên danh sách liên kết đơn giúp cấu trúc này có thể mở rộng hoặc thu nhỏ linh hoạt theo nhu cầu thực tế của dữ liệu trên bộ nhớ Heap.
- Yêu cầu: Xây dựng Stack dựa trên cấu trúc Node. Thực hiện các thao tác push và pop tại vị trí đầu danh sách (Head) để đảm bảo tốc độ xử lý nhanh nhất. Viết hàm giải phóng toàn bộ danh sách khi không còn sử dụng.', N'1. Thao tác thêm và lấy phần tử đạt độ phức tạp O(1).
  2. Quản lý con trỏ pTop chính xác, không làm mất dấu địa chỉ đỉnh Stack.
  3. Cấp phát và giải phóng bộ nhớ động đúng cách, không để xảy ra rò rỉ bộ nhớ.
  4. Xử lý an toàn khi người dùng cố gắng lấy phần tử từ Stack rỗng.

------------------------------------------------------------

PHẦN 3: MỨC ĐỘ KHÓ (HARD)', N'CTDL_GT');

-- Bài 9: Chuyển đổi biểu thức Trung tố sang Hậu tố (Infix to Postfix)
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'CTDL_GT-033', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'CTDL_GT'), NULL, NULL, N'Bài 9: Chuyển đổi biểu thức Trung tố sang Hậu tố (Infix to Postfix)', N'Sử dụng Stack để lưu trữ các toán tử trong quá trình duyệt biểu thức trung tố. Dựa vào bảng độ ưu tiên (nhân chia > cộng trừ), thực hiện đẩy toán tử vào Stack hoặc lấy ra đưa vào chuỗi kết quả theo đúng thuật toán Shunting-yard.', N'Biểu thức toán học dạng trung tố (ví dụ: A+B) dễ đọc với con người nhưng khó xử lý với máy tính do quy tắc ưu tiên. Chuyển sang dạng hậu tố (AB+) giúp máy tính tính toán tuần tự từ trái sang phải mà không cần quan tâm đến độ ưu tiên toán tử hay dấu ngoặc.
- Yêu cầu: Sử dụng Stack để lưu trữ các toán tử trong quá trình duyệt biểu thức trung tố. Dựa vào bảng độ ưu tiên (nhân chia > cộng trừ), thực hiện đẩy toán tử vào Stack hoặc lấy ra đưa vào chuỗi kết quả theo đúng thuật toán Shunting-yard.', N'1. Xây dựng đúng hàm xác định độ ưu tiên cho các toán tử phổ biến.
  2. Xử lý chính xác sự xuất hiện của các dấu ngoặc đơn lồng nhau.
  3. Kết quả chuỗi hậu tố phải đúng quy tắc toán học.
  4. Giải thích được luồng dữ liệu của Stack trong quá trình chuyển đổi.', N'CTDL_GT');

-- Bài 10: Tính giá trị biểu thức Hậu tố
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'CTDL_GT-034', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'CTDL_GT'), NULL, NULL, N'Bài 10: Tính giá trị biểu thức Hậu tố', N'Nhận đầu vào là một chuỗi biểu thức hậu tố hợp lệ. Duyệt chuỗi và thực hiện các thao tác push toán hạng vào Stack. Khi gặp toán tử, thực hiện phép tính tương ứng và đẩy kết quả trở lại cho đến khi chỉ còn một phần tử duy nhất trong Stack.', N'Sau khi biểu thức đã ở dạng hậu tố, việc tính toán giá trị trở nên đơn giản nhờ Stack. Khi gặp một số, ta đưa vào Stack; khi gặp một toán tử, ta lấy hai số gần nhất ra để tính và đẩy kết quả trở lại.
- Yêu cầu: Nhận đầu vào là một chuỗi biểu thức hậu tố hợp lệ. Duyệt chuỗi và thực hiện các thao tác push toán hạng vào Stack. Khi gặp toán tử, thực hiện phép tính tương ứng và đẩy kết quả trở lại cho đến khi chỉ còn một phần tử duy nhất trong Stack.', N'1. Xác định đúng thứ tự các toán hạng khi lấy ra từ Stack (phần tử lấy ra trước là toán hạng thứ hai).
  2. Thực hiện chính xác các phép toán cơ bản (+, -, *, /).
  3. Xử lý được các biểu thức có giá trị số lớn hoặc số có nhiều chữ số.
  4. Chứng minh thuật toán hoạt động với độ phức tạp O(n).', N'CTDL_GT');

-- Bài 11: Cài đặt Hàng đợi ưu tiên (Priority Queue)
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'CTDL_GT-035', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'CTDL_GT'), NULL, NULL, N'Bài 11: Cài đặt Hàng đợi ưu tiên (Priority Queue)', N'Cài đặt Queue lưu trữ các đối tượng bao gồm giá trị và một con số đại diện cho độ ưu tiên. Viết hàm enqueue sao cho danh sách luôn được sắp xếp theo độ ưu tiên, hoặc hàm dequeue thực hiện tìm kiếm phần tử có ưu tiên lớn nhất để lấy ra.', N'Trong thực tế, không phải mọi phần tử trong hàng đợi đều bình đẳng. Một số phần tử có mức độ ưu tiên cao hơn cần được xử lý trước (ví dụ: cấp cứu trong bệnh viện). Hàng đợi ưu tiên cho phép thêm phần tử bất kỳ nhưng luôn lấy ra phần tử có ưu tiên cao nhất.
- Yêu cầu: Cài đặt Queue lưu trữ các đối tượng bao gồm giá trị và một con số đại diện cho độ ưu tiên. Viết hàm enqueue sao cho danh sách luôn được sắp xếp theo độ ưu tiên, hoặc hàm dequeue thực hiện tìm kiếm phần tử có ưu tiên lớn nhất để lấy ra.', N'1. Thiết kế cấu trúc dữ liệu lưu trữ được cả giá trị và độ ưu tiên.
  2. Đảm bảo phần tử có độ ưu tiên cao nhất luôn được lấy ra đầu tiên.
  3. Duy trì tính ổn định (FIFO) cho các phần tử có cùng độ ưu tiên.
  4. Đánh giá được hiệu suất thời gian của thao tác thêm/xóa.', N'CTDL_GT');

-- Bài 12: Mô phỏng Hàng đợi bằng hai Ngăn xếp
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'CTDL_GT-036', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'CTDL_GT'), NULL, NULL, N'Bài 12: Mô phỏng Hàng đợi bằng hai Ngăn xếp', N'Cài đặt Queue thông qua việc sử dụng hai đối tượng Stack. Thao tác thêm phần tử sẽ đẩy vào Stack 1. Thao tác lấy phần tử sẽ lấy từ Stack 2; nếu Stack 2 rỗng, thực hiện chuyển toàn bộ dữ liệu từ Stack 1 sang Stack 2 trước khi lấy ra.', N'Đây là một bài toán tư duy kinh điển: Làm thế nào để tạo ra cơ chế "Vào trước - Ra trước" chỉ bằng cách sử dụng các cấu trúc "Vào sau - Ra trước". Giải pháp là sử dụng một Stack để nhận dữ liệu và một Stack khác để đảo ngược lại thứ tự dữ liệu đó.
- Yêu cầu: Cài đặt Queue thông qua việc sử dụng hai đối tượng Stack. Thao tác thêm phần tử sẽ đẩy vào Stack 1. Thao tác lấy phần tử sẽ lấy từ Stack 2; nếu Stack 2 rỗng, thực hiện chuyển toàn bộ dữ liệu từ Stack 1 sang Stack 2 trước khi lấy ra.', N'1. Thực hiện đúng cơ chế đảo ngược dữ liệu giữa hai Stack để đạt được tính chất FIFO.
  2. Đảm bảo tính nhất quán của dữ liệu trong suốt quá trình chuyển đổi qua lại.
  3. Xử lý tốt các tình huống hàng đợi rỗng.
  4. Phân tích được tại sao chi phí cho mỗi phần tử khi tính trung bình (Amortized) vẫn là O(1).



DANH SÁCH BÀI TẬP CẤU TRÚC DỮ LIỆU VÀ GIẢI THUẬT
DẠNG 4: CÂY NHỊ PHÂN TÌM KIẾM (BST)
------------------------------------------------------------

PHẦN 1: MỨC ĐỘ DỄ (EASY)', N'CTDL_GT');

-- Bài 1: Khởi tạo và Thêm Node vào cây BST
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'CTDL_GT-037', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'CTDL_GT'), NULL, NULL, N'Bài 1: Khởi tạo và Thêm Node vào cây BST', N'Định nghĩa cấu trúc một Node gồm dữ liệu và hai con trỏ trái, phải. Viết hàm khởi tạo cây rỗng và hàm chèn một giá trị x vào cây sao cho vẫn giữ đúng tính chất của BST.', N'Cây nhị phân tìm kiếm là cấu trúc dữ liệu mà mọi Node bên trái đều nhỏ hơn Node cha và mọi Node bên phải đều lớn hơn Node cha. Nhiệm vụ của bạn là xây dựng nền móng cho cấu trúc này.
- Yêu cầu: Định nghĩa cấu trúc một Node gồm dữ liệu và hai con trỏ trái, phải. Viết hàm khởi tạo cây rỗng và hàm chèn một giá trị x vào cây sao cho vẫn giữ đúng tính chất của BST.', N'1. Khai báo đúng cấu trúc Node và con trỏ gốc (Root).
  2. Thực hiện chính xác việc so sánh giá trị để quyết định chèn vào bên trái hay bên phải.
  3. Xử lý đúng trường hợp cây đang rỗng.
  4. Đảm bảo các Node mới luôn được thêm vào vị trí lá (leaf).', N'CTDL_GT');

-- Bài 2: Duyệt cây theo thứ tự giữa (In-order Traversal)
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'CTDL_GT-038', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'CTDL_GT'), NULL, NULL, N'Bài 2: Duyệt cây theo thứ tự giữa (In-order Traversal)', N'Viết hàm đệ quy thực hiện duyệt cây theo thứ tự In-order. In kết quả ra màn hình sau khi đã chèn một dãy số vào cây.', N'Duyệt cây theo thứ tự LNR (Trái - Gốc - Phải) là cách để xuất ra các giá trị trong cây theo thứ tự tăng dần. Đây là cách kiểm tra tính chính xác của cây BST hiệu quả nhất.
- Yêu cầu: Viết hàm đệ quy thực hiện duyệt cây theo thứ tự In-order. In kết quả ra màn hình sau khi đã chèn một dãy số vào cây.', N'1. Xác định đúng điểm dừng đệ quy khi gặp Node NULL.
  2. Thực hiện đúng thứ tự gọi hàm đệ quy cho nhánh trái, xử lý gốc, rồi đến nhánh phải.
  3. Kết quả in ra phải là một dãy số tăng dần.
  4. Đạt độ phức tạp thời gian O(n) với n là số Node.', N'CTDL_GT');

-- Bài 3: Duyệt cây theo thứ tự trước và sau (Pre-order & Post-order)
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'CTDL_GT-039', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'CTDL_GT'), NULL, NULL, N'Bài 3: Duyệt cây theo thứ tự trước và sau (Pre-order & Post-order)', N'Viết hai hàm đệ quy để thực hiện duyệt cây theo thứ tự Pre-order và Post-order. Giải thích ứng dụng của từng cách duyệt.', N'Ngoài cách duyệt In-order, việc duyệt NLR (Trước) và LRN (Sau) giúp ta hiểu được cấu trúc phân cấp và thứ tự giải phóng bộ nhớ của cây.
- Yêu cầu: Viết hai hàm đệ quy để thực hiện duyệt cây theo thứ tự Pre-order và Post-order. Giải thích ứng dụng của từng cách duyệt.', N'1. Thực hiện đúng thứ tự các bước duyệt cho cả hai hàm.
  2. Phân biệt được sự khác nhau về vị trí của Node gốc trong kết quả xuất ra.
  3. Xử lý tốt các cây có cấu trúc lệch về một phía.
  4. Đánh giá được độ phức tạp không gian dựa trên chiều cao của cây.', N'CTDL_GT');

-- Bài 4: Tìm kiếm một giá trị trên cây BST
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'CTDL_GT-040', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'CTDL_GT'), NULL, NULL, N'Bài 4: Tìm kiếm một giá trị trên cây BST', N'Viết hàm tìm kiếm trả về địa chỉ của Node chứa giá trị x. Nếu không tìm thấy, hàm trả về NULL.', N'Ưu điểm lớn nhất của BST là tốc độ tìm kiếm. Bạn cần xây dựng một hàm để xác định xem một giá trị x có tồn tại trong hệ thống dữ liệu cây hay không.
- Yêu cầu: Viết hàm tìm kiếm trả về địa chỉ của Node chứa giá trị x. Nếu không tìm thấy, hàm trả về NULL.', N'1. Tận dụng tính chất của BST để loại bỏ một nửa số Node cần xét sau mỗi bước so sánh.
  2. Cài đặt đúng bằng phương pháp đệ quy hoặc vòng lặp.
  3. Trả về kết quả chính xác trong mọi trường hợp (có hoặc không tìm thấy).
  4. Phân tích độ phức tạp thời gian đạt mức O(log n) trong trường hợp cây cân bằng.

------------------------------------------------------------

PHẦN 2: MỨC ĐỘ TRUNG BÌNH (MEDIUM)', N'CTDL_GT');

-- Bài 5: Tìm giá trị nhỏ nhất và lớn nhất trên cây
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'CTDL_GT-041', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'CTDL_GT'), NULL, NULL, N'Bài 5: Tìm giá trị nhỏ nhất và lớn nhất trên cây', N'Viết hàm tìm Node có giá trị nhỏ nhất (cực trái) và hàm tìm Node có giá trị lớn nhất (cực phải) của cây.', N'Do đặc thù sắp xếp của BST, các giá trị cực trị luôn nằm ở các vị trí biên của cây. Việc tìm kiếm chúng rất đơn giản nhưng cực kỳ hữu ích.
- Yêu cầu: Viết hàm tìm Node có giá trị nhỏ nhất (cực trái) và hàm tìm Node có giá trị lớn nhất (cực phải) của cây.', N'1. Duyệt liên tục về phía bên trái để tìm giá trị Min.
  2. Duyệt liên tục về phía bên phải để tìm giá trị Max.
  3. Xử lý trường hợp cây chỉ có một Node hoặc cây rỗng.
  4. Thực hiện thuật toán với độ phức tạp thời gian phụ thuộc vào chiều cao cây h.', N'CTDL_GT');

-- Bài 6: Đếm số lượng Node và số lượng lá (Leaf Nodes)
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'CTDL_GT-042', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'CTDL_GT'), NULL, NULL, N'Bài 6: Đếm số lượng Node và số lượng lá (Leaf Nodes)', N'Viết hàm đếm tổng số Node trên cây và hàm đếm số lượng Node lá (Node không có con).', N'Việc thống kê quy mô của cây giúp đánh giá dung lượng bộ nhớ và cấu trúc hiện tại của cây dữ liệu.
- Yêu cầu: Viết hàm đếm tổng số Node trên cây và hàm đếm số lượng Node lá (Node không có con).', N'1. Sử dụng đệ quy để tổng hợp kết quả từ các cây con.
  2. Xác định đúng điều kiện của Node lá (left == NULL và right == NULL).
  3. Kết quả đếm phải chính xác cho mọi hình dạng cây.
  4. Đảm bảo duyệt qua mỗi Node đúng một lần (O(n)).', N'CTDL_GT');

-- Bài 7: Tính chiều cao của cây nhị phân
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'CTDL_GT-043', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'CTDL_GT'), NULL, NULL, N'Bài 7: Tính chiều cao của cây nhị phân', N'Viết hàm trả về chiều cao (chiều sâu lớn nhất) của cây tính từ gốc đến lá xa nhất.', N'Chiều cao của cây quyết định hiệu năng của các thao tác tìm kiếm và thêm xóa. Cây càng cao (lệch), hiệu năng càng giảm.
- Yêu cầu: Viết hàm trả về chiều cao (chiều sâu lớn nhất) của cây tính từ gốc đến lá xa nhất.', N'1. Sử dụng hàm trả về giá trị lớn nhất (Max) giữa chiều cao nhánh trái và nhánh phải.
  2. Công thức tính chiều cao tại một Node phải bằng 1 + Max(H_trái, H_phải).
  3. Xác định đúng chiều cao của cây rỗng là 0 (hoặc -1 tùy quy ước).
  4. Phân tích được tầm quan trọng của chiều cao đối với độ phức tạp thuật toán.', N'CTDL_GT');

-- Bài 8: Kiểm tra một cây nhị phân có phải là BST không
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'CTDL_GT-044', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'CTDL_GT'), NULL, NULL, N'Bài 8: Kiểm tra một cây nhị phân có phải là BST không', N'Viết hàm kiểm tra xem một cây nhị phân cho trước có thỏa mãn mọi điều kiện của BST tại mọi Node hay không.', N'Không phải cây nhị phân nào cũng là cây nhị phân tìm kiếm. Bạn cần viết một công cụ kiểm định lại tính chất của cây sau khi có sự can thiệp từ bên ngoài.
- Yêu cầu: Viết hàm kiểm tra xem một cây nhị phân cho trước có thỏa mãn mọi điều kiện của BST tại mọi Node hay không.', N'1. Kiểm tra điều kiện ràng buộc về khoảng giá trị (min, max) cho từng Node.
  2. Đảm bảo kiểm tra đệ quy xuống tận các Node lá.
  3. Không mắc lỗi chỉ kiểm tra quan hệ cha-con trực tiếp mà quên mất các tổ tiên phía trên.
  4. Trả về kết quả Boolean chính xác.

------------------------------------------------------------

PHẦN 3: MỨC ĐỘ KHÓ (HARD)', N'CTDL_GT');

-- Bài 9: Xóa một Node trên cây BST
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'CTDL_GT-045', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'CTDL_GT'), NULL, NULL, N'Bài 9: Xóa một Node trên cây BST', N'Viết hàm xóa một Node có giá trị x. Xử lý đầy đủ 3 trường hợp: Node lá, Node có một con, và Node có hai con.', N'Xóa Node là thao tác phức tạp nhất trên BST vì phải đảm bảo sau khi xóa, các liên kết vẫn duy trì đúng tính chất của cây.
- Yêu cầu: Viết hàm xóa một Node có giá trị x. Xử lý đầy đủ 3 trường hợp: Node lá, Node có một con, và Node có hai con.', N'1. Giải phóng bộ nhớ đúng cách sau khi xóa.
  2. Với trường hợp Node có hai con, phải tìm được Node thay thế (thường là Node cực trái của cây con phải).
  3. Duy trì được tính chất BST của cây sau khi thực hiện thao tác xóa.
  4. Xử lý chính xác việc cập nhật con trỏ của Node cha.', N'CTDL_GT');

-- Bài 10: Tìm Node kế tiếp (In-order Successor)
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'CTDL_GT-046', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'CTDL_GT'), NULL, NULL, N'Bài 10: Tìm Node kế tiếp (In-order Successor)', N'Cho một Node trên cây, hãy tìm Node có giá trị lớn nhất tiếp theo (phần tử xuất hiện ngay sau nó nếu duyệt In-order).', N'Trong một dãy đã sắp xếp, việc tìm phần tử đứng ngay sau một phần tử cho trước là rất quan trọng cho các giải thuật duyệt và xử lý kế tiếp.
- Yêu cầu: Cho một Node trên cây, hãy tìm Node có giá trị lớn nhất tiếp theo (phần tử xuất hiện ngay sau nó nếu duyệt In-order).', N'1. Xử lý trường hợp Node có cây con phải (tìm Min của cây con phải).
  2. Xử lý trường hợp Node không có cây con phải (truy ngược về các tổ tiên).
  3. Thuật toán không được duyệt lại từ gốc để đảm bảo hiệu suất.
  4. Trả về NULL nếu Node đó là giá trị lớn nhất trong cây.', N'CTDL_GT');

-- Bài 11: Chuyển mảng đã sắp xếp thành cây BST cân bằng
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'CTDL_GT-047', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'CTDL_GT'), NULL, NULL, N'Bài 11: Chuyển mảng đã sắp xếp thành cây BST cân bằng', N'Cho một mảng tăng dần, hãy xây dựng một cây BST có độ cao nhỏ nhất có thể.', N'Nếu chèn mảng đã sắp xếp vào cây theo cách thông thường, cây sẽ bị lệch thành một danh sách liên kết. Bạn cần một giải thuật để tạo ra cây có chiều cao tối ưu log(n).
- Yêu cầu: Cho một mảng tăng dần, hãy xây dựng một cây BST có độ cao nhỏ nhất có thể.', N'1. Sử dụng kỹ thuật chia để trị, chọn phần tử giữa mảng làm gốc.
  2. Gọi đệ quy cho hai nửa mảng còn lại để làm cây con trái và phải.
  3. Cây kết quả phải có sự cân bằng về chiều cao giữa các nhánh.
  4. Đạt độ phức tạp O(n) cho quá trình xây dựng.', N'CTDL_GT');

-- Bài 12: Tìm tổ tiên chung gần nhất (Lowest Common Ancestor - LCA)
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'CTDL_GT-048', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'CTDL_GT'), NULL, NULL, N'Bài 12: Tìm tổ tiên chung gần nhất (Lowest Common Ancestor - LCA)', N'Viết hàm tìm Node là tổ tiên chung gần nhất của hai Node p và q trên cây BST.', N'Tìm điểm hội tụ đầu tiên của hai Node khi đi ngược lên gốc. Đây là bài toán ứng dụng nhiều trong hệ thống phân cấp và mạng xã hội.
- Yêu cầu: Viết hàm tìm Node là tổ tiên chung gần nhất của hai Node p và q trên cây BST.', N'1. Tận dụng tính chất BST để hướng con trỏ duyệt về phía chứa cả hai Node p và q.
  2. Xác định điểm dừng khi p và q nằm ở hai phía của Node hiện tại (hoặc Node hiện tại trùng với p hoặc q).
  3. Thuật toán hoạt động hiệu quả mà không cần dùng thêm bộ nhớ phụ.
  4. Giải thích được logic tìm kiếm dựa trên so sánh giá trị.


DANH SÁCH BÀI TẬP CẤU TRÚC DỮ LIỆU VÀ GIẢI THUẬT
DẠNG 5: ĐỒ THỊ (GRAPH)
------------------------------------------------------------

PHẦN 1: MỨC ĐỘ DỄ (EASY)', N'CTDL_GT');

-- Bài 1: Biểu diễn đồ thị bằng Ma trận kề (Adjacency Matrix)
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'CTDL_GT-049', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'CTDL_GT'), NULL, NULL, N'Bài 1: Biểu diễn đồ thị bằng Ma trận kề (Adjacency Matrix)', N'Định nghĩa cấu trúc đồ thị sử dụng ma trận vuông n x n. Viết các hàm: khởi tạo đồ thị rỗng, thêm một cạnh (edge) giữa hai đỉnh và in ma trận kề ra màn hình.', N'Ma trận kề là cách đơn giản nhất để lưu trữ thông tin về các mối quan hệ giữa các đỉnh trong một mạng lưới. Cách biểu diễn này cho phép kiểm tra nhanh chóng xem hai đỉnh bất kỳ có kết nối trực tiếp với nhau hay không.
- Yêu cầu: Định nghĩa cấu trúc đồ thị sử dụng ma trận vuông n x n. Viết các hàm: khởi tạo đồ thị rỗng, thêm một cạnh (edge) giữa hai đỉnh và in ma trận kề ra màn hình.', N'1. Khai báo đúng mảng hai chiều và quản lý số lượng đỉnh chính xác.
  2. Xử lý đúng tính chất đối xứng nếu là đồ thị vô hướng (gán cả A[i][j] và A[j][i]).
  3. Kiểm tra điều kiện chỉ số đỉnh hợp lệ trước khi thao tác trên ma trận.
  4. Đạt độ phức tạp không gian O(n^2).', N'CTDL_GT');

-- Bài 2: Chuyển đổi từ Ma trận kề sang Danh sách cạnh (Edge List)
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'CTDL_GT-050', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'CTDL_GT'), NULL, NULL, N'Bài 2: Chuyển đổi từ Ma trận kề sang Danh sách cạnh (Edge List)', N'Đọc dữ liệu từ một ma trận kề cho trước và trích xuất tất cả các cặp đỉnh có kết nối để lưu vào một danh sách các cấu trúc Edge.', N'Trong nhiều thuật toán, việc quản lý danh sách các cạnh (gồm đỉnh đầu, đỉnh cuối và trọng số) sẽ hiệu quả hơn việc duyệt qua toàn bộ ma trận. Đây là bước đệm để hiểu cách tối ưu bộ nhớ khi đồ thị có ít cạnh.
- Yêu cầu: Đọc dữ liệu từ một ma trận kề cho trước và trích xuất tất cả các cặp đỉnh có kết nối để lưu vào một danh sách các cấu trúc Edge.', N'1. Duyệt qua ma trận kề mà không bỏ sót hoặc lặp lại cạnh (đối với đồ thị vô hướng).
  2. Lưu trữ thông tin cạnh vào mảng hoặc danh sách liên kết một cách khoa học.
  3. Xuất kết quả danh sách cạnh theo đúng định dạng (u, v).
  4. Phân tích được khi nào nên dùng danh sách cạnh thay vì ma trận kề.', N'CTDL_GT');

-- Bài 3: Tính bậc của các đỉnh trong đồ thị
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'CTDL_GT-051', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'CTDL_GT'), NULL, NULL, N'Bài 3: Tính bậc của các đỉnh trong đồ thị', N'Viết hàm tính bậc của một đỉnh bất kỳ trong đồ thị vô hướng và hàm tính bán bậc vào/ra trong đồ thị có hướng.', N'Bậc của một đỉnh phản ánh mức độ kết nối của nó trong mạng lưới (ví dụ: số lượng bạn bè của một tài khoản trên mạng xã hội). Việc tính toán này giúp xác định các điểm quan trọng trong đồ thị.
- Yêu cầu: Viết hàm tính bậc của một đỉnh bất kỳ trong đồ thị vô hướng và hàm tính bán bậc vào/ra trong đồ thị có hướng.', N'1. Duyệt đúng hàng hoặc cột tương ứng trên ma trận kề để đếm số cạnh.
  2. Phân biệt chính xác giữa bậc vào (in-degree) và bậc ra (out-degree) đối với đồ thị có hướng.
  3. Xử lý đúng trường hợp đỉnh cô lập (bậc bằng 0).
  4. Đạt độ phức tạp thời gian O(n) cho mỗi đỉnh cần tính.', N'CTDL_GT');

-- Bài 4: Biểu diễn đồ thị bằng Danh sách kề (Adjacency List)
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'CTDL_GT-052', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'CTDL_GT'), NULL, NULL, N'Bài 4: Biểu diễn đồ thị bằng Danh sách kề (Adjacency List)', N'Cài đặt đồ thị bằng danh sách kề. Viết hàm thêm cạnh và hàm in danh sách các đỉnh kề của từng đỉnh trong đồ thị.', N'Với các đồ thị lớn nhưng có ít cạnh (đồ thị thưa), ma trận kề gây lãng phí bộ nhớ. Danh sách kề sử dụng một mảng các danh sách liên kết để chỉ lưu trữ các đỉnh thực sự có kết nối, giúp tối ưu tài nguyên hệ thống.
- Yêu cầu: Cài đặt đồ thị bằng danh sách kề. Viết hàm thêm cạnh và hàm in danh sách các đỉnh kề của từng đỉnh trong đồ thị.', N'1. Sử dụng mảng các con trỏ (Head) để quản lý danh sách liên kết cho từng đỉnh.
  2. Thêm Node mới vào danh sách liên kết một cách chính xác (thường thêm vào đầu để đạt O(1)).
  3. Đảm bảo giải phóng bộ nhớ động của các danh sách liên kết khi kết thúc.
  4. Đánh giá được ưu điểm về bộ nhớ O(n + e) so với ma trận kề.

------------------------------------------------------------

PHẦN 2: MỨC ĐỘ TRUNG BÌNH (MEDIUM)', N'CTDL_GT');

-- Bài 5: Duyệt đồ thị theo chiều rộng (BFS - Breadth First Search)
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'CTDL_GT-053', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'CTDL_GT'), NULL, NULL, N'Bài 5: Duyệt đồ thị theo chiều rộng (BFS - Breadth First Search)', N'Sử dụng Queue để cài đặt thuật toán BFS. In ra thứ tự các đỉnh được thăm bắt đầu từ một đỉnh s cho trước.', N'Thuật toán BFS mô phỏng việc lan tỏa như sóng nước, thăm tất cả các đỉnh gần gốc trước khi đi xa hơn. Đây là nền tảng để tìm đường đi ngắn nhất trong đồ thị không có trọng số.
- Yêu cầu: Sử dụng Queue để cài đặt thuật toán BFS. In ra thứ tự các đỉnh được thăm bắt đầu từ một đỉnh s cho trước.', N'1. Sử dụng mảng đánh dấu (Visited) để không thăm lại các đỉnh đã xử lý.
  2. Quản lý đúng thứ tự đưa vào và lấy ra khỏi Queue theo nguyên tắc FIFO.
  3. Đảm bảo thăm hết các đỉnh trong cùng một thành phần liên thông.
  4. Đạt độ phức tạp thời gian O(n + e).', N'CTDL_GT');

-- Bài 6: Duyệt đồ thị theo chiều sâu (DFS - Depth First Search)
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'CTDL_GT-054', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'CTDL_GT'), NULL, NULL, N'Bài 6: Duyệt đồ thị theo chiều sâu (DFS - Depth First Search)', N'Cài đặt thuật toán DFS bằng phương pháp đệ quy hoặc sử dụng Stack. In ra thứ tự thăm các đỉnh của đồ thị.', N'DFS ưu tiên đi sâu nhất có thể theo một nhánh trước khi quay lui (backtrack). Thuật toán này thường được dùng để kiểm tra tính liên thông hoặc tìm các chu trình trong đồ thị.
- Yêu cầu: Cài đặt thuật toán DFS bằng phương pháp đệ quy hoặc sử dụng Stack. In ra thứ tự thăm các đỉnh của đồ thị.', N'1. Thực hiện đúng cơ chế đệ quy hoặc quản lý Stack để quay lui chính xác.
  2. Sử dụng mảng Visited để tránh lặp vô hạn trong đồ thị có chu trình.
  3. Xử lý thăm được toàn bộ các đỉnh ngay cả khi đồ thị không liên thông.
  4. Giải thích được sự khác biệt về thứ tự thăm đỉnh so với BFS.', N'CTDL_GT');

-- Bài 7: Kiểm tra tính liên thông của đồ thị vô hướng
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'CTDL_GT-055', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'CTDL_GT'), NULL, NULL, N'Bài 7: Kiểm tra tính liên thông của đồ thị vô hướng', N'Sử dụng BFS hoặc DFS để đếm số thành phần liên thông của đồ thị. Nếu số thành phần bằng 1, kết luận đồ thị liên thông.', N'Một đồ thị được gọi là liên thông nếu luôn có đường đi giữa hai đỉnh bất kỳ. Việc kiểm tra này giúp xác định xem một mạng lưới giao thông hay viễn thông có bị đứt gãy ở đâu không.
- Yêu cầu: Sử dụng BFS hoặc DFS để đếm số thành phần liên thông của đồ thị. Nếu số thành phần bằng 1, kết luận đồ thị liên thông.', N'1. Chạy thuật toán duyệt nhiều lần cho đến khi tất cả các đỉnh đều được đánh dấu thăm.
  2. Đếm chính xác số lần gọi hàm duyệt (mỗi lần gọi tương ứng một thành phần liên thông).
  3. Đưa ra kết luận đúng về tính liên thông của đồ thị đầu vào.
  4. Đạt hiệu suất O(n + e) cho toàn bộ quá trình kiểm tra.', N'CTDL_GT');

-- Bài 8: Tìm đường đi giữa hai đỉnh bằng BFS
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'CTDL_GT-056', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'CTDL_GT'), NULL, NULL, N'Bài 8: Tìm đường đi giữa hai đỉnh bằng BFS', N'Sử dụng BFS để tìm đường đi từ đỉnh u đến đỉnh v. In ra dãy các đỉnh trên đường đi nếu tồn tại, ngược lại thông báo không có đường đi.', N'Trong bản đồ số, việc tìm đường đi qua ít trạm trung chuyển nhất tương đương với bài toán tìm đường ngắn nhất trên đồ thị không trọng số bằng BFS.
- Yêu cầu: Sử dụng BFS để tìm đường đi từ đỉnh u đến đỉnh v. In ra dãy các đỉnh trên đường đi nếu tồn tại, ngược lại thông báo không có đường đi.', N'1. Sử dụng mảng lưu vết (Parent) để ghi nhớ đỉnh trước đó của mỗi đỉnh khi duyệt.
  2. Truy ngược từ v về u dựa trên mảng Parent để tìm đường đi.
  3. Đảm bảo đường đi tìm được là ngắn nhất (về số cạnh).
  4. Xử lý tốt trường hợp u và v nằm ở hai thành phần liên thông khác nhau.

------------------------------------------------------------

PHẦN 3: MỨC ĐỘ KHÓ (HARD)', N'CTDL_GT');

-- Bài 9: Thuật toán Dijkstra tìm đường đi ngắn nhất
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'CTDL_GT-057', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'CTDL_GT'), NULL, NULL, N'Bài 9: Thuật toán Dijkstra tìm đường đi ngắn nhất', N'Cài đặt thuật toán Dijkstra trên đồ thị có trọng số dương. In ra khoảng cách ngắn nhất và lộ trình từ đỉnh nguồn đến một đỉnh đích.', N'Đây là thuật toán quan trọng nhất trong các ứng dụng bản đồ (như Google Maps). Dijkstra tìm đường đi có tổng trọng số các cạnh là nhỏ nhất giữa một đỉnh nguồn và tất cả các đỉnh còn lại.
- Yêu cầu: Cài đặt thuật toán Dijkstra trên đồ thị có trọng số dương. In ra khoảng cách ngắn nhất và lộ trình từ đỉnh nguồn đến một đỉnh đích.', N'1. Quản lý đúng mảng khoảng cách (Distance) và mảng đánh dấu các đỉnh đã tối ưu.
  2. Thực hiện chính xác bước "Thư giãn cạnh" (Relaxation) để cập nhật khoảng cách nhỏ hơn.
  3. Tìm được đỉnh có khoảng cách nhỏ nhất trong số các đỉnh chưa xét ở mỗi bước (sử dụng mảng hoặc Priority Queue).
  4. Đạt độ phức tạp O(n^2) hoặc O(e log n).', N'CTDL_GT');

-- Bài 10: Tìm cây khung nhỏ nhất bằng thuật toán Prim
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'CTDL_GT-058', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'CTDL_GT'), NULL, NULL, N'Bài 10: Tìm cây khung nhỏ nhất bằng thuật toán Prim', N'Cài đặt thuật toán Prim để tìm cây khung nhỏ nhất (Minimum Spanning Tree - MST). In ra danh sách các cạnh của cây khung và tổng trọng số của chúng.', N'Bài toán đặt ra là kết nối tất cả các đỉnh của đồ thị sao cho tổng trọng số các cạnh là nhỏ nhất và không tạo thành chu trình (ví dụ: thiết kế mạng lưới cáp quang nối các thành phố với chi phí thấp nhất).
- Yêu cầu: Cài đặt thuật toán Prim để tìm cây khung nhỏ nhất (Minimum Spanning Tree - MST). In ra danh sách các cạnh của cây khung và tổng trọng số của chúng.', N'1. Bắt đầu từ một đỉnh bất kỳ và luôn chọn cạnh nhỏ nhất nối từ tập đỉnh đã xét ra tập đỉnh chưa xét.
  2. Đảm bảo cây khung tìm được có đúng (n-1) cạnh và liên thông.
  3. Cập nhật đúng mảng trọng số nhỏ nhất kết nối tới từng đỉnh.
  4. Giải thích được sự khác biệt giữa MST và bài toán đường đi ngắn nhất.', N'CTDL_GT');

-- Bài 11: Phát hiện chu trình trong đồ thị (Cycle Detection)
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'CTDL_GT-059', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'CTDL_GT'), NULL, NULL, N'Bài 11: Phát hiện chu trình trong đồ thị (Cycle Detection)', N'Viết hàm kiểm tra xem đồ thị (vô hướng hoặc có hướng) có chứa chu trình hay không bằng cách sử dụng DFS.', N'Chu trình trong đồ thị có thể gây ra các lỗi lặp vô hạn trong hệ thống hoặc xung đột trong quản lý tài nguyên. Việc phát hiện chu trình là yêu cầu bắt buộc trong nhiều bài toán logic.
- Yêu cầu: Viết hàm kiểm tra xem đồ thị (vô hướng hoặc có hướng) có chứa chu trình hay không bằng cách sử dụng DFS.', N'1. Đối với đồ thị có hướng: Sử dụng mảng đánh dấu trạng thái (trắng, xám, đen) để phát hiện cạnh ngược (back edge).
  2. Đối với đồ thị vô hướng: Kiểm tra nếu thăm lại một đỉnh đã đánh dấu mà đỉnh đó không phải là cha trực tiếp.
  3. Kết luận chính xác sự tồn tại của chu trình.
  4. Đạt độ phức tạp thời gian O(n + e).', N'CTDL_GT');

-- Bài 12: Sắp xếp cấu trúc (Topological Sort)
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'CTDL_GT-060', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'CTDL_GT'), NULL, NULL, N'Bài 12: Sắp xếp cấu trúc (Topological Sort)', N'Thực hiện sắp xếp tô-pô cho một đồ thị có hướng không chu trình (DAG). In ra thứ tự các đỉnh sau khi sắp xếp.', N'Trong quản lý dự án, một số công việc chỉ được thực hiện sau khi công việc khác hoàn thành. Sắp xếp tô-pô giúp đưa ra một thứ tự thực hiện các công việc sao cho mọi ràng buộc về trình tự đều được thỏa mãn.
- Yêu cầu: Thực hiện sắp xếp tô-pô cho một đồ thị có hướng không chu trình (DAG). In ra thứ tự các đỉnh sau khi sắp xếp.', N'1. Sử dụng thuật toán xóa dần các đỉnh có bán bậc vào bằng 0 (Thuật toán Kahn) hoặc dựa trên DFS.
  2. Đảm bảo thứ tự xuất ra thỏa mãn: nếu có cạnh từ u đến v thì u luôn đứng trước v.
  3. Phát hiện và thông báo nếu đồ thị có chu trình (không thể sắp xếp tô-pô).
  4. Đánh giá ứng dụng của thuật toán trong việc lập lịch trình.', N'CTDL_GT');

-- Bài 1: Truy xuất giá trị và địa chỉ qua con trỏ
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'KTLT-061', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'KTLT'), NULL, NULL, N'Bài 1: Truy xuất giá trị và địa chỉ qua con trỏ', N'Hiểu các toán tử & (lấy địa chỉ) và * (lấy giá trị).', N'Khai báo một biến nguyên x và một con trỏ p. Gán địa chỉ của x cho p. Thay đổi giá trị của x thông qua p. In ra địa chỉ của x, giá trị của p và giá trị mà p đang trỏ tới.', N'1. Sử dụng đúng toán tử &x và *p.
  2. Hiển thị đúng địa chỉ ô nhớ (thường là hệ thập lục phân).', N'KTLT');

-- Bài 2: Hàm hoán vị sử dụng con trỏ
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'KTLT-062', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'KTLT'), NULL, NULL, N'Bài 2: Hàm hoán vị sử dụng con trỏ', N'Truyền tham số bằng con trỏ.', N'Viết hàm swap(int *a, int *b) để hoán đổi giá trị của hai biến số thực sự trong bộ nhớ.', N'1. Sử dụng biến tạm bên trong hàm.
  2. Khi gọi hàm trong main(), phải truyền vào địa chỉ của biến (&x, &y).', N'KTLT');

-- Bài 3: Nhập xuất mảng qua con trỏ
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'KTLT-063', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'KTLT'), NULL, NULL, N'Bài 3: Nhập xuất mảng qua con trỏ', N'Sử dụng ký hiệu con trỏ để duyệt mảng.', N'Viết chương trình nhập mảng n phần tử. Sử dụng con trỏ để duyệt và in ra các phần tử trong mảng thay vì dùng chỉ số a[i].', N'1. Sử dụng phép toán cộng con trỏ (p + i) hoặc *(p + i).
  2. Không dùng toán tử [ ] trong quá trình xuất mảng.

------------------------------------------------------------

PHẦN 2: MỨC ĐỘ TRUNG BÌNH (MEDIUM)', N'KTLT');

-- Bài 4: Cấp phát động mảng 1 chiều
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'KTLT-064', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'KTLT'), NULL, NULL, N'Bài 4: Cấp phát động mảng 1 chiều', N'Sử dụng hàm malloc/calloc (C) hoặc toán tử new (C++).', N'Nhập số lượng n từ bàn phím. Cấp phát bộ nhớ động cho mảng n số nguyên. Sau khi tính tổng các phần tử, phải giải phóng bộ nhớ.', N'1. Ép kiểu đúng cho hàm cấp phát.
  2. Có bước kiểm tra cấp phát thành công (p != NULL).
  3. Sử dụng free() hoặc delete[] đúng quy định.', N'KTLT');

-- Bài 5: Tìm phần tử lớn nhất bằng con trỏ
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'KTLT-065', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'KTLT'), NULL, NULL, N'Bài 5: Tìm phần tử lớn nhất bằng con trỏ', N'Kết hợp hàm và con trỏ.', N'Viết hàm int* timMax(int *a, int n) trả về "địa chỉ" của phần tử lớn nhất trong mảng.', N'1. Kiểu trả về của hàm là một con trỏ (int*).
  2. Trong hàm main(), in ra cả giá trị lớn nhất và vị trí của nó dựa trên địa chỉ trả về.', N'KTLT');

-- Bài 6: Đảo ngược mảng dùng hai con trỏ
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'KTLT-066', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'KTLT'), NULL, NULL, N'Bài 6: Đảo ngược mảng dùng hai con trỏ', N'Kỹ thuật con trỏ đầu và con trỏ cuối (Two Pointers).', N'Sử dụng một con trỏ trỏ vào đầu mảng và một con trỏ trỏ vào cuối mảng. Hoán đổi giá trị của chúng rồi dịch chuyển hai con trỏ lại gần nhau cho đến khi gặp nhau để đảo ngược mảng.', N'1. Không sử dụng mảng phụ.
  2. Điều kiện dừng vòng lặp (pLeft < pRight) chính xác.', N'KTLT');

-- Bài 7: Quản lý chuỗi ký tự (String) bằng con trỏ
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'KTLT-067', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'KTLT'), NULL, NULL, N'Bài 7: Quản lý chuỗi ký tự (String) bằng con trỏ', N'Thao tác với con trỏ kiểu char*.', N'Viết hàm tự định nghĩa strlen(char *s) để đếm độ dài chuỗi mà không dùng thư viện string.h.', N'1. Duyệt chuỗi cho đến khi gặp ký tự kết thúc ''\0''.
  2. Không dùng biến đếm i, chỉ dùng phép toán trên con trỏ.

------------------------------------------------------------

PHẦN 3: MỨC ĐỘ KHÓ (HARD)', N'KTLT');

-- Bài 8: Cấp phát động mảng 2 chiều (Ma trận)
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'KTLT-068', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'KTLT'), NULL, NULL, N'Bài 8: Cấp phát động mảng 2 chiều (Ma trận)', N'Hiểu khái niệm con trỏ cấp 2 (Pointer to Pointer).', N'Nhập số hàng r và số cột c. Cấp phát động cho một ma trận r x c. Nhập dữ liệu và tính tổng các phần tử trên đường chéo chính.', N'1. Cấp phát đúng mảng các con trỏ trước, sau đó cấp phát từng dòng.
  2. Quy trình giải phóng bộ nhớ phải ngược lại (giải phóng từng dòng trước, sau đó mới giải phóng mảng con trỏ).', N'KTLT');

-- Bài 9: Mảng con trỏ quản lý danh sách chuỗi
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'KTLT-069', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'KTLT'), NULL, NULL, N'Bài 9: Mảng con trỏ quản lý danh sách chuỗi', N'Quản lý bộ nhớ không đồng nhất.', N'Nhập vào n cái tên sinh viên. Mỗi tên có độ dài khác nhau. Hãy cấp phát bộ nhớ vừa đủ cho mỗi cái tên và lưu chúng vào một mảng con trỏ char *ds[100].', N'1. Sử dụng mảng tạm để nhập dữ liệu trước khi cấp phát bộ nhớ chính thức.
  2. Tiết kiệm bộ nhớ (mỗi tên chỉ chiếm đúng số byte cần thiết).', N'KTLT');

-- Bài 10: Con trỏ hàm (Function Pointer)
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'KTLT-070', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'KTLT'), NULL, NULL, N'Bài 10: Con trỏ hàm (Function Pointer)', N'Sử dụng con trỏ trỏ đến địa chỉ của hàm.', N'Viết 2 hàm Tăng(int a, int b) và Giảm(int a, int b). Viết một hàm trung gian ThucThi(int a, int b, int (*p)(int, int)) để gọi một trong hai hàm trên thông qua con trỏ.', N'1. Khai báo đúng cú pháp con trỏ hàm.
  2. Giải thích được ứng dụng của con trỏ hàm trong việc tối ưu hóa code (Callback function).


DANH SÁCH BÀI TẬP KỸ THUẬT LẬP TRÌNH
DẠNG 2: ĐỆ QUY (RECURSION)
------------------------------------------------------------

PHẦN 1: MỨC ĐỘ DỄ (EASY)', N'KTLT');

-- Bài 1: Tính giai thừa của n (n!)
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'KTLT-071', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'KTLT'), NULL, NULL, N'Bài 1: Tính giai thừa của n (n!)', N'Xây dựng hàm đệ quy tuyến tính cơ bản.', N'Viết hàm đệ quy tinhGiaiThua(int n). Biết rằng 0! = 1 và n! = n * (n-1)!.', N'1. Xác định đúng điều kiện dừng (n == 0 hoặc n == 1).
  2. Công thức gọi đệ quy chính xác.', N'KTLT');

-- Bài 2: Tính tổng dãy số S = 1 + 2 + ... + n
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'KTLT-072', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'KTLT'), NULL, NULL, N'Bài 2: Tính tổng dãy số S = 1 + 2 + ... + n', N'Chuyển đổi từ vòng lặp sang đệ quy.', N'Viết hàm đệ quy tinhTong(int n) trả về tổng các số từ 1 đến n.', N'1. Điều kiện dừng đúng (n == 1).
  2. Hàm trả về kết quả chính xác cho n > 0.', N'KTLT');

-- Bài 3: Tìm số Fibonacci thứ n
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'KTLT-073', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'KTLT'), NULL, NULL, N'Bài 3: Tìm số Fibonacci thứ n', N'Sử dụng đệ quy nhị phân (Binary Recursion).', N'Dãy Fibonacci có F(0)=0, F(1)=1, F(n) = F(n-1) + F(n-2). Viết hàm tìm số Fibonacci thứ n.', N'1. Xử lý đúng 2 trường hợp cơ sở (n=0 và n=1).
  2. Hiểu được cơ chế gọi hàm lồng nhau của đệ quy nhị phân.

------------------------------------------------------------

PHẦN 2: MỨC ĐỘ TRUNG BÌNH (MEDIUM)', N'KTLT');

-- Bài 4: Chuyển đổi hệ cơ số (Thập phân sang Nhị phân)
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'KTLT-074', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'KTLT'), NULL, NULL, N'Bài 4: Chuyển đổi hệ cơ số (Thập phân sang Nhị phân)', N'Đệ quy xử lý luồng ra (Output).', N'Viết hàm đệ quy decToBin(int n) để in ra mã nhị phân của số nguyên dương n.', N'1. Gọi đệ quy (n/2) trước khi in (n%2) để các chữ số xuất hiện đúng thứ tự.
  2. Không sử dụng mảng phụ hay chuỗi để lưu trữ.', N'KTLT');

-- Bài 5: Tìm Ước chung lớn nhất (UCLN)
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'KTLT-075', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'KTLT'), NULL, NULL, N'Bài 5: Tìm Ước chung lớn nhất (UCLN)', N'Áp dụng thuật toán Euclid bằng đệ quy.', N'Viết hàm đệ quy tìm UCLN của hai số a và b. Gợi ý: UCLN(a, b) = UCLN(b, a % b).', N'1. Xác định đúng điều kiện dừng (khi số dư bằng 0).
  2. Code ngắn gọn, tối ưu.', N'KTLT');

-- Bài 6: Đếm số chữ số của số nguyên dương n
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'KTLT-076', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'KTLT'), NULL, NULL, N'Bài 6: Đếm số chữ số của số nguyên dương n', N'Đệ quy xử lý trên chữ số.', N'Viết hàm đệ quy countDigits(int n) trả về số lượng chữ số của n. Ví dụ: n=1234 trả về 4.', N'1. Điều kiện dừng: n < 10 trả về 1.
  2. Bước đệ quy: 1 + countDigits(n / 10).', N'KTLT');

-- Bài 7: Tìm giá trị lớn nhất (Max) trong mảng bằng đệ quy
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'KTLT-077', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'KTLT'), NULL, NULL, N'Bài 7: Tìm giá trị lớn nhất (Max) trong mảng bằng đệ quy', N'Đệ quy trên cấu trúc dữ liệu mảng.', N'Viết hàm findMax(int a[], int n) sử dụng đệ quy để tìm phần tử lớn nhất.', N'1. Chia nhỏ mảng hoặc so sánh phần tử cuối với Max của mảng (n-1) phần tử đầu.
  2. Không sử dụng vòng lặp for/while bên trong hàm.

------------------------------------------------------------

PHẦN 3: MỨC ĐỘ KHÓ (HARD)', N'KTLT');

-- Bài 8: Bài toán Tháp Hà Nội (Tower of Hanoi)
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'KTLT-078', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'KTLT'), NULL, NULL, N'Bài 8: Bài toán Tháp Hà Nội (Tower of Hanoi)', N'Tư duy đệ quy phức tạp.', N'Có n tầng đĩa và 3 cọc A, B, C. Viết hàm đệ quy moTaDiChuyen(int n, char nguon, char dich, char trung_gian) để in ra các bước di chuyển đĩa từ cọc A sang cọc C.', N'1. Hiểu và mô tả đúng 3 bước cốt lõi của bài toán Tháp Hà Nội.
  2. Kết quả in ra các bước di chuyển phải logic và khả thi.', N'KTLT');

-- Bài 9: Bài toán n-Hậu (n-Queens Puzzle)
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'KTLT-079', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'KTLT'), NULL, NULL, N'Bài 9: Bài toán n-Hậu (n-Queens Puzzle)', N'Đệ quy quay lui (Backtracking).', N'Tìm cách đặt n quân hậu trên bàn cờ n x n sao cho không quân nào ăn được quân nào. In ra một phương án bất kỳ.', N'1. Hàm kiểm tra điều kiện an toàn (hàng, cột, đường chéo).
  2. Cơ chế quay lui phải hoàn trả trạng thái của bàn cờ khi không tìm được nghiệm.', N'KTLT');

-- Bài 10: Tính giá trị đa thức (Công thức Horner) bằng đệ quy
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'KTLT-080', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'KTLT'), NULL, NULL, N'Bài 10: Tính giá trị đa thức (Công thức Horner) bằng đệ quy', N'Tối ưu hóa biểu thức toán học.', N'Cho mảng a chứa các hệ số của đa thức bậc n. Viết hàm đệ quy tính giá trị đa thức P(x) tại điểm x0.', N'1. Áp dụng đúng công thức truy hồi Horner để giảm số phép nhân.
  2. Hàm chạy hiệu quả với bộ dữ liệu lớn.

DANH SÁCH BÀI TẬP KỸ THUẬT LẬP TRÌNH
DẠNG 3: KIỂU DỮ LIỆU CÓ CẤU TRÚC (STRUCT)
------------------------------------------------------------

PHẦN 1: MỨC ĐỘ DỄ (EASY)', N'KTLT');

-- Bài 1: Định nghĩa Struct Phân số
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'KTLT-081', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'KTLT'), NULL, NULL, N'Bài 1: Định nghĩa Struct Phân số', N'Khai báo và truy xuất thành phần của Struct.', N'Định nghĩa cấu trúc PHANSO gồm Tử số và Mẫu số (số nguyên). Viết hàm Nhập và Xuất một phân số.', N'1. Khai báo đúng kiểu dữ liệu cho các thành phần.
  2. Truy xuất thành phần thông qua toán tử dấu chấm (.).', N'KTLT');

-- Bài 2: Tính khoảng cách giữa hai điểm (2D)
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'KTLT-082', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'KTLT'), NULL, NULL, N'Bài 2: Tính khoảng cách giữa hai điểm (2D)', N'Sử dụng Struct làm tham số cho hàm.', N'Định nghĩa cấu trúc DIEM gồm hoành độ x và tung độ y. Viết hàm tính khoảng cách giữa hai điểm A và B theo công thức Euclide.', N'1. Sử dụng hàm sqrt() và pow() từ thư viện math.h.
  2. Truyền tham số kiểu Struct vào hàm một cách hợp lý.', N'KTLT');

-- Bài 3: Quản lý một quyển sách
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'KTLT-083', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'KTLT'), NULL, NULL, N'Bài 3: Quản lý một quyển sách', N'Thao tác với kiểu chuỗi trong Struct.', N'Định nghĩa cấu trúc SACH gồm: Mã sách, Tên sách, Tác giả, Năm xuất bản. Viết chương trình nhập thông tin cho 1 quyển sách và in ra màn hình.', N'1. Sử dụng đúng kiểu char[] hoặc string cho các thuộc tính văn bản.
  2. Xử lý được vấn đề trôi lệnh (nuốt dòng) khi nhập chuỗi sau khi nhập số.

------------------------------------------------------------

PHẦN 2: MỨC ĐỘ TRUNG BÌNH (MEDIUM)', N'KTLT');

-- Bài 4: Mảng các Phân số
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'KTLT-084', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'KTLT'), NULL, NULL, N'Bài 4: Mảng các Phân số', N'Kết hợp mảng và Struct.', N'Nhập vào một danh sách n phân số. Tìm phân số có giá trị lớn nhất trong danh sách đó.', N'1. Kỹ thuật duyệt mảng các Struct.
  2. Quy đồng hoặc chuyển sang số thực để so sánh giá trị các phân số.', N'KTLT');

-- Bài 5: Quản lý danh sách Sinh viên (Cơ bản)
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'KTLT-085', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'KTLT'), NULL, NULL, N'Bài 5: Quản lý danh sách Sinh viên (Cơ bản)', N'Xử lý dữ liệu hỗn hợp.', N'Định nghĩa Struct SINHVIEN gồm: MSSV, Họ tên, Điểm Toán, Điểm Lý, Điểm Hóa. Tính điểm trung bình và xếp loại cho n sinh viên.', N'1. Công thức tính điểm trung bình chính xác.
  2. In danh sách sinh viên dưới dạng bảng rõ ràng.', N'KTLT');

-- Bài 6: Sắp xếp danh sách sản phẩm
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'KTLT-086', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'KTLT'), NULL, NULL, N'Bài 6: Sắp xếp danh sách sản phẩm', N'Thuật toán sắp xếp trên Struct.', N'Định nghĩa Struct SANPHAM (Mã, Tên, Đơn giá, Số lượng). Nhập danh sách n sản phẩm và sắp xếp danh sách giảm dần theo Đơn giá.', N'1. Hoán vị toàn bộ cấu trúc Struct khi thực hiện sắp xếp (không chỉ hoán vị đơn giá).
  2. Kết quả danh sách sau khi sắp xếp phải chính xác.', N'KTLT');

-- Bài 7: Tìm kiếm thông tin nhân viên
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'KTLT-087', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'KTLT'), NULL, NULL, N'Bài 7: Tìm kiếm thông tin nhân viên', N'Tìm kiếm theo thuộc tính chuỗi.', N'Cho danh sách n nhân viên. Nhập vào một Mã nhân viên từ bàn phím, hãy tìm và in ra toàn bộ thông tin của nhân viên đó. Nếu không thấy, thông báo "Không tìm thấy".', N'1. Sử dụng hàm strcmp() (trong C) hoặc toán tử == (trong C++) để so sánh chuỗi.
  2. Xử lý tốt trường hợp không có dữ liệu trùng khớp.

------------------------------------------------------------

PHẦN 3: MỨC ĐỘ KHÓ (HARD)', N'KTLT');

-- Bài 8: Quản lý Hình chữ nhật (Struct lồng Struct)
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'KTLT-088', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'KTLT'), NULL, NULL, N'Bài 8: Quản lý Hình chữ nhật (Struct lồng Struct)', N'Cấu trúc lồng nhau (Nested Struct).', N'Định nghĩa Struct DIEM (x, y). Định nghĩa Struct HINHCHUNHAT gồm hai điểm: diemTrenTrai và diemDuoiPhai. Viết hàm tính chu vi và diện tích của hình chữ nhật đó.', N'1. Khai báo Struct lồng nhau đúng cú pháp.
  2. Tính độ dài các cạnh từ tọa độ các điểm trước khi tính chu vi/diện tích.', N'KTLT');

-- Bài 9: Quản lý Đơn thức và Đa thức
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'KTLT-089', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'KTLT'), NULL, NULL, N'Bài 9: Quản lý Đơn thức và Đa thức', N'Mảng động của các Struct.', N'Định nghĩa Struct DONTHUC (hệ số, số mũ). Định nghĩa Struct DATHUC gồm mảng các đơn thức. Viết hàm tính đạo hàm của đa thức và tính giá trị đa thức tại x0.', N'1. Quản lý tốt số lượng đơn thức trong đa thức.
  2. Thực hiện đúng quy tắc toán học về đạo hàm.', N'KTLT');

-- Bài 10: Tổng hợp: Quản lý danh sách Học sinh (Nâng cao)
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'KTLT-090', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'KTLT'), NULL, NULL, N'Bài 10: Tổng hợp: Quản lý danh sách Học sinh (Nâng cao)', N'Thêm, Xóa, Sửa trên mảng Struct.', N'Viết chương trình có Menu điều khiển để:
  a. Thêm học sinh mới vào vị trí bất kỳ.
  b. Xóa học sinh theo Mã số.
  c. Tìm học sinh có điểm trung bình cao nhất.', N'1. Cấu trúc Menu (Switch-case) chuyên nghiệp.
  2. Logic dời chỗ phần tử trong mảng Struct khi thêm/xóa phải chính xác tuyệt đối.


DANH SÁCH BÀI TẬP KỸ THUẬT LẬP TRÌNH
DẠNG 4: THAO TÁC VỚI TẬP TIN (FILE I/O)
------------------------------------------------------------

PHẦN 1: MỨC ĐỘ DỄ (EASY)', N'KTLT');

-- Bài 1: Ghi văn bản đơn giản vào File
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'KTLT-091', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'KTLT'), NULL, NULL, N'Bài 1: Ghi văn bản đơn giản vào File', N'Mở và ghi file văn bản cơ bản.', N'Viết chương trình nhập vào một chuỗi ký tự từ bàn phím và ghi chuỗi đó vào file có tên "output.txt".', N'1. Sử dụng đúng hàm fopen/fclose (C) hoặc ofstream (C++).
  2. Kiểm tra file có mở thành công hay không trước khi ghi.', N'KTLT');

-- Bài 2: Đọc dữ liệu từ File và in ra màn hình
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'KTLT-092', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'KTLT'), NULL, NULL, N'Bài 2: Đọc dữ liệu từ File và in ra màn hình', N'Đọc file văn bản.', N'Tạo một file "input.txt" chứa một số nguyên n. Viết chương trình đọc số n từ file đó, tính n*n và in kết quả ra màn hình.', N'1. Sử dụng đúng hàm fscanf (C) hoặc ifstream (C++).
  2. Xử lý đúng trường hợp file không tồn tại.', N'KTLT');

-- Bài 3: Sao chép nội dung File
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'KTLT-093', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'KTLT'), NULL, NULL, N'Bài 3: Sao chép nội dung File', N'Đọc và ghi đồng thời.', N'Viết chương trình đọc nội dung từ file "source.txt" và sao chép toàn bộ nội dung đó sang file "dest.txt".', N'1. Đọc từng ký tự (fgetc) hoặc từng dòng (fgets) cho đến khi kết thúc file (EOF).
  2. File đích phải có nội dung y hệt file nguồn.

------------------------------------------------------------

PHẦN 2: MỨC ĐỘ TRUNG BÌNH (MEDIUM)', N'KTLT');

-- Bài 4: Đọc mảng số nguyên từ File
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'KTLT-094', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'KTLT'), NULL, NULL, N'Bài 4: Đọc mảng số nguyên từ File', N'Xử lý mảng kết hợp File.', N'File "data.txt" có cấu trúc: dòng đầu là số phần tử n, dòng sau là n số nguyên. Đọc mảng này vào chương trình và tính tổng của chúng.', N'1. Đọc đúng số lượng n trước khi dùng vòng lặp để đọc các phần tử.
  2. Cấp phát mảng (tĩnh hoặc động) đủ sức chứa dữ liệu.', N'KTLT');

-- Bài 5: Ghi bảng cửu chương vào File
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'KTLT-095', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'KTLT'), NULL, NULL, N'Bài 5: Ghi bảng cửu chương vào File', N'Định dạng dữ liệu ghi vào file.', N'Viết chương trình ghi bảng cửu chương từ 2 đến 9 vào file "cuuchuong.txt" sao cho trình bày đẹp mắt, dễ đọc.', N'1. Sử dụng các hàm định dạng (fprintf hoặc setw) để căn chỉnh cột.
  2. Nội dung file phải đầy đủ và chính xác.', N'KTLT');

-- Bài 6: Thống kê ký tự trong File
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'KTLT-096', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'KTLT'), NULL, NULL, N'Bài 6: Thống kê ký tự trong File', N'Duyệt file và xử lý logic.', N'Đọc một file văn bản bất kỳ và đếm xem trong file có bao nhiêu chữ cái, bao nhiêu chữ số và bao nhiêu khoảng trắng.', N'1. Duyệt hết file mà không làm tràn bộ nhớ.
  2. Phân loại đúng các loại ký tự.', N'KTLT');

-- Bài 7: Ghi và đọc Struct vào File văn bản
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'KTLT-097', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'KTLT'), NULL, NULL, N'Bài 7: Ghi và đọc Struct vào File văn bản', N'Lưu trữ cấu trúc dữ liệu.', N'Định nghĩa Struct SINHVIEN. Nhập danh sách 3 sinh viên và ghi thông tin (MSSV, Họ tên, Điểm) vào file "sinhvien.txt". Sau đó viết hàm đọc ngược lại từ file này để in ra màn hình.', N'1. Thông tin ghi vào file phải theo quy tắc nhất định (ví dụ mỗi thuộc tính cách nhau dấu phẩy hoặc xuống dòng).
  2. Đọc lại đúng dữ liệu ban đầu.

------------------------------------------------------------

PHẦN 3: MỨC ĐỘ KHÓ (HARD)', N'KTLT');

-- Bài 8: Thao tác với File nhị phân (Binary File)
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'KTLT-098', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'KTLT'), NULL, NULL, N'Bài 8: Thao tác với File nhị phân (Binary File)', N'Đọc/Ghi dữ liệu ở dạng nhị phân.', N'Ghi một mảng 100 số thực vào file "data.bin" ở dạng nhị phân. Sau đó, đọc phần tử thứ 50 của mảng từ file mà không cần đọc toàn bộ file (dùng định vị con trỏ file).', N'1. Sử dụng hàm fwrite/fread và fseek.
  2. Truy cập đúng vị trí byte của phần tử thứ 50.', N'KTLT');

-- Bài 9: Sắp xếp dữ liệu trong File
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'KTLT-099', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'KTLT'), NULL, NULL, N'Bài 9: Sắp xếp dữ liệu trong File', N'Kết hợp File, Struct và Sắp xếp.', N'File "input.txt" chứa danh sách các số nguyên chưa sắp xếp. Viết chương trình đọc các số này, sắp xếp tăng dần và ghi kết quả vào file "output.txt".', N'1. Xử lý được trường hợp số lượng phần tử trong file không biết trước (dùng mảng động hoặc đọc đến EOF).
  2. Thuật toán sắp xếp hoạt động chính xác.', N'KTLT');

-- Bài 10: Quản lý cơ sở dữ liệu nhân viên (File tổng hợp)
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'KTLT-100', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'KTLT'), NULL, NULL, N'Bài 10: Quản lý cơ sở dữ liệu nhân viên (File tổng hợp)', N'Xây dựng hệ thống quản lý nhỏ dựa trên File.', N'Viết chương trình có Menu: 
  a. Thêm nhân viên mới (ghi nối tiếp vào cuối file).
  b. Tìm kiếm nhân viên theo mã (đọc file để tìm).
  c. Xuất báo cáo danh sách nhân viên ra file văn bản định dạng bảng.', N'1. Sử dụng chế độ "a" (append) để thêm dữ liệu và "r" (read) để tìm kiếm.
  2. Quản lý con trỏ file và đóng file đúng lúc để tránh mất dữ liệu.


DANH SÁCH BÀI TẬP KỸ THUẬT LẬP TRÌNH
DẠNG 5: DANH SÁCH LIÊN KẾT ĐƠN (SINGLY LINKED LIST)
------------------------------------------------------------

PHẦN 1: MỨC ĐỘ DỄ (EASY)', N'KTLT');

-- Bài 1: Khởi tạo và Duyệt danh sách liên kết
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'KTLT-101', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'KTLT'), NULL, NULL, N'Bài 1: Khởi tạo và Duyệt danh sách liên kết', N'Định nghĩa cấu trúc Node và thao tác duyệt cơ bản.', N'Định nghĩa một Node chứa số nguyên. Viết hàm khởi tạo danh sách rỗng, hàm tạo một Node mới và hàm in toàn bộ các giá trị trong danh sách ra màn hình.', N'1. Khai báo đúng cấu trúc Node (gồm data và con trỏ next).
  2. Hàm duyệt sử dụng con trỏ tạm để không làm mất địa chỉ đầu danh sách (Head).', N'KTLT');

-- Bài 2: Thêm Node vào đầu danh sách (AddHead)
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'KTLT-102', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'KTLT'), NULL, NULL, N'Bài 2: Thêm Node vào đầu danh sách (AddHead)', N'Thao tác thay đổi con trỏ Head.', N'Viết hàm thêm một Node chứa giá trị x vào đầu danh sách liên kết đơn.', N'1. Xử lý đúng việc cập nhật con trỏ Head.
  2. Đảm bảo Node mới trỏ đúng vào Head cũ.', N'KTLT');

-- Bài 3: Đếm số lượng phần tử
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'KTLT-103', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'KTLT'), NULL, NULL, N'Bài 3: Đếm số lượng phần tử', N'Kỹ thuật duyệt và đếm.', N'Viết hàm đếm xem trong danh sách liên kết đơn hiện đang có bao nhiêu phần tử (Node).', N'1. Duyệt từ đầu đến cuối danh sách (cho đến khi gặp NULL).
  2. Biến đếm hoạt động chính xác.

------------------------------------------------------------

PHẦN 2: MỨC ĐỘ TRUNG BÌNH (MEDIUM)', N'KTLT');

-- Bài 4: Thêm Node vào cuối danh sách (AddTail)
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'KTLT-104', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'KTLT'), NULL, NULL, N'Bài 4: Thêm Node vào cuối danh sách (AddTail)', N'Kỹ thuật tìm Node cuối cùng.', N'Viết hàm thêm một Node vào cuối danh sách liên kết đơn.', N'1. Xử lý được trường hợp danh sách đang rỗng (Head == NULL).
  2. Nếu không rỗng, phải duyệt tìm đến Node cuối rồi mới thực hiện liên kết.', N'KTLT');

-- Bài 5: Tìm kiếm giá trị x trong danh sách
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'KTLT-105', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'KTLT'), NULL, NULL, N'Bài 5: Tìm kiếm giá trị x trong danh sách', N'Tìm kiếm trên cấu trúc dữ liệu động.', N'Viết hàm tìm kiếm một số nguyên x trong danh sách. Nếu thấy, trả về địa chỉ của Node đó, ngược lại trả về NULL.', N'1. Hàm trả về kiểu con trỏ Node*.
  2. Xử lý đúng logic tìm kiếm tuyến tính trên danh sách.', N'KTLT');

-- Bài 6: Tính tổng các số nguyên tố trong danh sách
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'KTLT-106', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'KTLT'), NULL, NULL, N'Bài 6: Tính tổng các số nguyên tố trong danh sách', N'Kết hợp kiểm tra điều kiện khi duyệt danh sách.', N'Viết hàm duyệt qua danh sách liên kết các số nguyên và tính tổng các số nào là số nguyên tố.', N'1. Tái sử dụng hàm kiểm tra số nguyên tố đã học.
  2. Logic cộng dồn chính xác.', N'KTLT');

-- Bài 7: Xóa Node đầu tiên trong danh sách (RemoveHead)
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'KTLT-107', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'KTLT'), NULL, NULL, N'Bài 7: Xóa Node đầu tiên trong danh sách (RemoveHead)', N'Quản lý bộ nhớ khi xóa.', N'Viết hàm xóa phần tử đầu tiên của danh sách. Lưu ý phải giải phóng bộ nhớ của Node bị xóa.', N'1. Sử dụng biến tạm để giữ địa chỉ Node đầu trước khi cập nhật Head.
  2. Sử dụng lệnh free() hoặc delete để tránh rò rỉ bộ nhớ.

------------------------------------------------------------

PHẦN 3: MỨC ĐỘ KHÓ (HARD)', N'KTLT');

-- Bài 8: Sắp xếp danh sách liên kết đơn
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'KTLT-108', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'KTLT'), NULL, NULL, N'Bài 8: Sắp xếp danh sách liên kết đơn', N'Thuật toán sắp xếp trên con trỏ.', N'Viết hàm sắp xếp các phần tử trong danh sách liên kết đơn theo thứ tự tăng dần (Sử dụng thuật toán Selection Sort hoặc Interchange Sort).', N'1. Hoán vị dữ liệu (data) giữa các Node mà không làm đứt gãy liên kết.
  2. Sử dụng 2 vòng lặp lồng nhau trên con trỏ chính xác.', N'KTLT');

-- Bài 9: Xóa một Node có giá trị x bất kỳ
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'KTLT-109', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'KTLT'), NULL, NULL, N'Bài 9: Xóa một Node có giá trị x bất kỳ', N'Kỹ thuật liên kết lại các Node (Re-linking).', N'Tìm số nguyên x trong danh sách và xóa Node đó. Lưu ý: phải nối Node đứng trước x với Node đứng sau x.', N'1. Xử lý được 3 trường hợp: x ở đầu, x ở cuối, x ở giữa danh sách.
  2. Đảm bảo danh sách không bị ngắt quãng sau khi xóa.', N'KTLT');

-- Bài 10: Đảo ngược danh sách liên kết đơn (Reverse List)
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'KTLT-110', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'KTLT'), NULL, NULL, N'Bài 10: Đảo ngược danh sách liên kết đơn (Reverse List)', N'Tư duy logic con trỏ nâng cao.', N'Viết hàm đảo ngược thứ tự các Node trong danh sách liên kết đơn (không được tạo danh sách mới, chỉ được thay đổi các liên kết next).', N'1. Sử dụng kỹ thuật 3 con trỏ (previous, current, next) để đảo chiều liên kết.
  2. Cập nhật lại con trỏ Head vào Node cuối cùng (nay đã thành đầu).', N'KTLT');

-- Bài 1: Xây dựng lớp Phân số cơ bản
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'LTHDT-111', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'LTHDT'), NULL, NULL, N'Bài 1: Xây dựng lớp Phân số cơ bản', N'Định nghĩa lớp PhanSo với các thuộc tính tử số và mẫu số ở phạm vi private. Viết các hàm: khởi tạo (constructor), nhập phân số, xuất phân số và hàm rút gọn phân số về dạng tối giản.', N'Trong toán học, phân số gồm tử số và mẫu số. Việc đóng gói chúng vào một lớp giúp quản lý dữ liệu tập trung và đảm bảo mẫu số luôn khác 0 trước khi thực hiện các phép tính.
- Yêu cầu: Định nghĩa lớp PhanSo với các thuộc tính tử số và mẫu số ở phạm vi private. Viết các hàm: khởi tạo (constructor), nhập phân số, xuất phân số và hàm rút gọn phân số về dạng tối giản.', N'1. Khai báo thuộc tính với phạm vi truy cập private chính xác.
  2. Xử lý logic mẫu số khác 0 trong hàm khởi tạo và hàm nhập.
  3. Cài đặt thuật toán tìm ước chung lớn nhất (UCLN) để rút gọn phân số.
  4. Đảm bảo tính đóng gói bằng cách không cho phép sửa đổi tử/mẫu trực tiếp từ bên ngoài.', N'LTHDT');

-- Bài 2: Quản lý tọa độ Điểm trong không gian 2D
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'LTHDT-112', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'LTHDT'), NULL, NULL, N'Bài 2: Quản lý tọa độ Điểm trong không gian 2D', N'Xây dựng lớp Diem với các phương thức thiết lập (set), lấy giá trị (get) và phương thức tính khoảng cách giữa hai điểm dựa trên công thức toán học.', N'Một điểm trên mặt phẳng được xác định bởi hoành độ x và tung độ y. Lớp này là nền tảng để xây dựng các hình học phức tạp hơn như hình tròn hay tam giác.
- Yêu cầu: Xây dựng lớp Diem với các phương thức thiết lập (set), lấy giá trị (get) và phương thức tính khoảng cách giữa hai điểm dựa trên công thức toán học.', N'1. Cài đặt đầy đủ các hàm getter và setter cho hai thuộc tính x và y.
  2. Sử dụng đúng từ khóa ''this'' để phân biệt thuộc tính lớp và tham số truyền vào.
  3. Áp dụng đúng công thức tính khoảng cách Euclide.
  4. Viết chương trình chính khởi tạo 2 đối tượng và in ra khoảng cách giữa chúng.', N'LTHDT');

-- Bài 3: Lớp Hình chữ nhật và tính toán diện tích
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'LTHDT-113', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'LTHDT'), NULL, NULL, N'Bài 3: Lớp Hình chữ nhật và tính toán diện tích', N'Tạo lớp HinhChuNhat có các phương thức kiểm tra tính hợp lệ của dữ liệu đầu vào. Viết hàm tính chu vi và diện tích để trả về kết quả cho người dùng.', N'Hình chữ nhật cần quản lý chiều dài và chiều rộng. Việc đóng gói giúp ngăn chặn người dùng nhập vào các kích thước âm, đảm bảo tính đúng đắn cho các phép toán diện tích và chu vi.
- Yêu cầu: Tạo lớp HinhChuNhat có các phương thức kiểm tra tính hợp lệ của dữ liệu đầu vào. Viết hàm tính chu vi và diện tích để trả về kết quả cho người dùng.', N'1. Kiểm tra điều kiện chiều dài, chiều rộng phải lớn hơn 0 khi khởi tạo.
  2. Các hàm tính toán phải trả về giá trị (return) thay vì chỉ in ra màn hình.
  3. Cài đặt hàm hiển thị thông tin hình chữ nhật một cách trực quan.
  4. Thực hiện đóng gói hoàn toàn các thuộc tính kích thước.', N'LTHDT');

-- Bài 4: Mô phỏng tài khoản ngân hàng đơn giản
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'LTHDT-114', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'LTHDT'), NULL, NULL, N'Bài 4: Mô phỏng tài khoản ngân hàng đơn giản', N'Định nghĩa lớp TaiKhoan với số dư là private. Viết hàm napTien(amount) và rutTien(amount) có kiểm tra điều kiện số dư hiện có.', N'Một tài khoản ngân hàng cần bảo mật số dư. Người dùng chỉ có thể thay đổi số dư thông qua các hành động hợp lệ như nạp tiền hoặc rút tiền thay vì sửa trực tiếp con số đó.
- Yêu cầu: Định nghĩa lớp TaiKhoan với số dư là private. Viết hàm napTien(amount) và rutTien(amount) có kiểm tra điều kiện số dư hiện có.', N'1. Bảo vệ thuộc tính số dư không bị truy cập trái phép từ bên ngoài.
  2. Xử lý lỗi khi số tiền rút lớn hơn số dư hiện tại trong tài khoản.
  3. Cập nhật số dư chính xác sau mỗi giao dịch thành công.
  4. Viết hàm truy vấn số dư để hiển thị thông tin khi cần thiết.

------------------------------------------------------------

PHẦN 2: MỨC ĐỘ TRUNG BÌNH (MEDIUM)', N'LTHDT');

-- Bài 5: Quản lý thông tin Sinh viên và xếp loại
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'LTHDT-115', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'LTHDT'), NULL, NULL, N'Bài 5: Quản lý thông tin Sinh viên và xếp loại', N'Xây dựng lớp SinhVien với phương thức xepLoai() tự động trả về "Giỏi", "Khá", "Trung bình" dựa trên thang điểm chuẩn.', N'Hệ thống quản lý giáo dục cần lưu trữ MSSV, họ tên và điểm trung bình. Việc đóng gói giúp tự động cập nhật xếp loại học lực mỗi khi điểm số của sinh viên thay đổi.
- Yêu cầu: Xây dựng lớp SinhVien với phương thức xepLoai() tự động trả về "Giỏi", "Khá", "Trung bình" dựa trên thang điểm chuẩn.', N'1. Quản lý bộ nhớ cho thuộc tính họ tên (dùng string hoặc mảng ký tự).
  2. Đảm bảo điểm trung bình nằm trong khoảng từ 0 đến 10.
  3. Logic xếp loại phải phủ hết các trường hợp điểm số.
  4. Sử dụng Constructor để khởi tạo thông tin sinh viên ngay khi tạo đối tượng.', N'LTHDT');

-- Bài 6: Lớp quản lý Sản phẩm và thuế VAT
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'LTHDT-116', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'LTHDT'), NULL, NULL, N'Bài 6: Lớp quản lý Sản phẩm và thuế VAT', N'Thiết kế lớp SanPham có phương thức tính thuế VAT (10% đơn giá) và phương thức tính tổng tiền cuối cùng.', N'Trong kinh doanh, mỗi sản phẩm có tên, đơn giá và số lượng. Lớp này cần tính toán tổng tiền hàng và tự động cộng thêm thuế giá trị gia tăng (VAT) trước khi xuất hóa đơn.
- Yêu cầu: Thiết kế lớp SanPham có phương thức tính thuế VAT (10% đơn giá) và phương thức tính tổng tiền cuối cùng.', N'1. Đóng gói các thuộc tính đơn giá và số lượng để tránh giá trị âm.
  2. Tính toán chính xác số tiền thuế và tổng tiền phải trả.
  3. Hiển thị thông tin sản phẩm dưới dạng bảng hoặc danh sách đẹp mắt.
  4. Sử dụng hàm khởi tạo để gán giá trị mặc định cho các thuộc tính.', N'LTHDT');

-- Bài 7: Lớp Thời gian (Giờ - Phút - Giây)
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'LTHDT-117', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'LTHDT'), NULL, NULL, N'Bài 7: Lớp Thời gian (Giờ - Phút - Giây)', N'Tạo lớp ThoiGian với phương thức chuanHoa() để tự động tăng giờ khi phút vượt quá 60 và tăng phút khi giây vượt quá 60.', N'Dữ liệu thời gian cần có tính logic (phút và giây không vượt quá 60). Lớp này giúp tự động chuẩn hóa dữ liệu khi người dùng nhập vào các con số không hợp lệ.
- Yêu cầu: Tạo lớp ThoiGian với phương thức chuanHoa() để tự động tăng giờ khi phút vượt quá 60 và tăng phút khi giây vượt quá 60.', N'1. Kiểm tra và ràng buộc dữ liệu đầu vào của giờ, phút, giây.
  2. Thực hiện logic toán học chính xác trong hàm chuẩn hóa.
  3. Viết hàm in thời gian theo định dạng chuẩn hh:mm:ss.
  4. Cài đặt phương thức cộng thêm một khoảng giây vào thời gian hiện tại.', N'LTHDT');

-- Bài 8: Quản lý Ngày tháng năm và năm nhuận
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'LTHDT-118', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'LTHDT'), NULL, NULL, N'Bài 8: Quản lý Ngày tháng năm và năm nhuận', N'Viết lớp NgayThang có phương thức kiemTraNamNhuan() và phương thức tìm ngày kế tiếp của một ngày cho trước.', N'Việc quản lý ngày tháng rất phức tạp do số ngày trong tháng không giống nhau. Lớp này sẽ bao bọc logic kiểm tra năm nhuận để xác định tính hợp lệ của ngày trong tháng 2.
- Yêu cầu: Viết lớp NgayThang có phương thức kiemTraNamNhuan() và phương thức tìm ngày kế tiếp của một ngày cho trước.', N'1. Kiểm tra tính hợp lệ của ngày dựa trên tháng và năm tương ứng.
  2. Xử lý đúng trường hợp ngày cuối cùng của tháng và ngày cuối cùng của năm.
  3. Cài đặt thuật toán kiểm tra năm nhuận chính xác.
  4. Đóng gói các thuộc tính để ngày tháng không bị gán sai logic (ví dụ ngày 31/04).

------------------------------------------------------------

PHẦN 3: MỨC ĐỘ KHÓ (HARD)', N'LTHDT');

-- Bài 9: Lớp Đa thức và quản lý mảng động
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'LTHDT-119', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'LTHDT'), NULL, NULL, N'Bài 9: Lớp Đa thức và quản lý mảng động', N'Định nghĩa lớp DaThuc với con trỏ quản lý mảng hệ số. Viết hàm khởi tạo, hàm hủy (Destructor) và phương thức tính giá trị đa thức tại điểm x.', N'Đa thức có bậc n cần lưu trữ một dãy các hệ số. Vì bậc của đa thức có thể thay đổi, việc sử dụng mảng động bên trong lớp đòi hỏi sự quản lý bộ nhớ nghiêm ngặt.
- Yêu cầu: Định nghĩa lớp DaThuc với con trỏ quản lý mảng hệ số. Viết hàm khởi tạo, hàm hủy (Destructor) và phương thức tính giá trị đa thức tại điểm x.', N'1. Cấp phát bộ nhớ động trong Constructor dựa trên bậc của đa thức.
  2. Sử dụng Destructor để giải phóng bộ nhớ, tránh rò rỉ (Memory Leak).
  3. Cài đặt thuật toán Horner để tính giá trị đa thức một cách hiệu quả.
  4. Xử lý việc sao chép đối tượng (Copy Constructor) để tránh lỗi bộ nhớ dùng chung.', N'LTHDT');

-- Bài 10: Quản lý Danh sách đối tượng (Lớp bao)
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'LTHDT-120', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'LTHDT'), NULL, NULL, N'Bài 10: Quản lý Danh sách đối tượng (Lớp bao)', N'Tạo lớp DanhSachSinhVien chứa mảng các đối tượng SinhVien. Viết các phương thức thêm sinh viên, tìm sinh viên theo MSSV và sắp xếp danh sách theo điểm.', N'Để quản lý nhiều đối tượng (ví dụ một lớp học gồm nhiều sinh viên), ta cần một lớp "quản lý" để bao bọc mảng các đối tượng đó, cung cấp các tính năng tìm kiếm và sắp xếp.
- Yêu cầu: Tạo lớp DanhSachSinhVien chứa mảng các đối tượng SinhVien. Viết các phương thức thêm sinh viên, tìm sinh viên theo MSSV và sắp xếp danh sách theo điểm.', N'1. Quản lý tốt mối quan hệ giữa lớp bao (Container Class) và lớp thành phần.
  2. Cài đặt thuật toán sắp xếp (như Quick Sort hoặc Selection Sort) ngay bên trong phương thức của lớp.
  3. Xử lý trường hợp danh sách đầy hoặc không tìm thấy sinh viên.
  4. Đảm bảo tính đóng gói của từng sinh viên vẫn được tôn trọng thông qua getter/setter.', N'LTHDT');

-- Bài 11: Lớp Chuỗi ký tự tự định nghĩa (MyString)
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'LTHDT-121', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'LTHDT'), NULL, NULL, N'Bài 11: Lớp Chuỗi ký tự tự định nghĩa (MyString)', N'Xây dựng lớp MyString quản lý mảng char động. Thực hiện kỹ thuật sao chép sâu (Deep Copy) để đảm bảo các đối tượng độc lập về vùng nhớ.', N'Tái hiện lại lớp string của hệ thống giúp hiểu sâu về cách quản lý vùng nhớ. Lớp này phải xử lý được việc gán chuỗi và nối chuỗi mà không làm hỏng bộ nhớ.
- Yêu cầu: Xây dựng lớp MyString quản lý mảng char động. Thực hiện kỹ thuật sao chép sâu (Deep Copy) để đảm bảo các đối tượng độc lập về vùng nhớ.', N'1. Cài đặt Copy Constructor để sao chép nội dung thay vì sao chép địa chỉ.
  2. Sử dụng hàm hủy để dọn dẹp bộ nhớ khi đối tượng ra khỏi phạm vi.
  3. Viết phương thức nối hai đối tượng MyString lại với nhau.
  4. Xử lý an toàn các chuỗi rỗng hoặc chuỗi có độ dài cực lớn.', N'LTHDT');

-- Bài 12: Hệ thống quản lý nhân sự với mã hóa bảo mật
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'LTHDT-122', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'LTHDT'), NULL, NULL, N'Bài 12: Hệ thống quản lý nhân sự với mã hóa bảo mật', N'Thiết kế lớp NhanVien có các thuộc tính nhạy cảm. Viết phương thức đổi mật khẩu yêu cầu mật khẩu cũ và phương thức tính lương dựa trên các tham số bảo mật.', N'Trong quản lý nhân sự, thông tin lương và mật khẩu cá nhân cần được bảo vệ cực kỳ nghiêm ngặt. Chỉ những phương thức có quyền hạn mới được phép truy xuất hoặc thay đổi các thông tin này.
- Yêu cầu: Thiết kế lớp NhanVien có các thuộc tính nhạy cảm. Viết phương thức đổi mật khẩu yêu cầu mật khẩu cũ và phương thức tính lương dựa trên các tham số bảo mật.', N'1. Sử dụng triệt để tính đóng gói để giấu các thông tin quan trọng.
  2. Kiểm tra tính xác thực trước khi cho phép thay đổi dữ liệu nhạy cảm.
  3. Tính toán lương dựa trên công thức phức tạp (lương cơ bản, hệ số, phụ cấp).
  4. Viết hàm xuất thông tin nhưng chỉ hiển thị các dữ liệu không nhạy cảm (như tên, bộ phận).



DANH SÁCH BÀI TẬP LẬP TRÌNH HƯỚNG ĐỐI TƯỢNG (OOP)
DẠNG 2: NẠP CHỒNG TOÁN TỬ (OPERATOR OVERLOADING)
------------------------------------------------------------

PHẦN 1: MỨC ĐỘ DỄ (EASY)', N'LTHDT');

-- Bài 1: Nạp chồng toán tử Nhập/Xuất cho lớp Phân số
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'LTHDT-123', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'LTHDT'), NULL, NULL, N'Bài 1: Nạp chồng toán tử Nhập/Xuất cho lớp Phân số', N'Định nghĩa toán tử >> để nhập tử số, mẫu số và toán tử << để in phân số dưới dạng "tử/mẫu". Cần đảm bảo mẫu số được xử lý khác 0 ngay khi nhập.', N'Việc sử dụng các hàm nhập() và xuất() truyền thống thường làm mã nguồn trở nên rời rạc. Bằng cách nạp chồng các toán tử dòng lệnh, bạn có thể thực hiện việc đọc/ghi đối tượng Phân số trực tiếp thông qua cin và cout.
- Yêu cầu: Định nghĩa toán tử >> để nhập tử số, mẫu số và toán tử << để in phân số dưới dạng "tử/mẫu". Cần đảm bảo mẫu số được xử lý khác 0 ngay khi nhập.', N'1. Cài đặt các toán tử dưới dạng hàm bạn (friend function) để truy cập thuộc tính private.
  2. Sử dụng đúng đối tượng istream và ostream làm tham số truyền vào.
  3. Trả về tham chiếu (reference) của luồng để có thể thực hiện nhập/xuất liên tiếp.
  4. Định dạng đầu ra sạch sẽ, dễ đọc.', N'LTHDT');

-- Bài 2: So sánh hai tọa độ Điểm 2D
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'LTHDT-124', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'LTHDT'), NULL, NULL, N'Bài 2: So sánh hai tọa độ Điểm 2D', N'Nạp chồng toán tử == và != cho lớp Diem. Hai điểm được coi là bằng nhau nếu x1 == x2 và y1 == y2.', N'Để kiểm tra hai điểm trong mặt phẳng có trùng nhau hay không, ta cần so sánh cả hoành độ và tung độ. Việc nạp chồng toán tử so sánh giúp mã nguồn ngắn gọn hơn nhiều so với việc gọi hàm so sánh thủ công.
- Yêu cầu: Nạp chồng toán tử == và != cho lớp Diem. Hai điểm được coi là bằng nhau nếu x1 == x2 và y1 == y2.', N'1. Trả về kiểu dữ liệu bool cho các toán tử so sánh.
  2. Sử dụng từ khóa const cho tham số truyền vào để đảm bảo tính an toàn dữ liệu.
  3. Xử lý logic so sánh đầy đủ cả hai thuộc tính x và y.
  4. Đảm bảo toán tử != hoạt động dựa trên phủ định của toán tử ==.', N'LTHDT');

-- Bài 3: Phép cộng hai Phân số
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'LTHDT-125', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'LTHDT'), NULL, NULL, N'Bài 3: Phép cộng hai Phân số', N'Nạp chồng toán tử + cho lớp PhanSo. Kết quả trả về phải là một đối tượng Phân số mới đã được rút gọn tối giản.', N'Toán tử cộng là phép toán cơ bản nhất. Trong OOP, ta muốn viết "ps3 = ps1 + ps2" thay vì phải gọi hàm tính toán phức tạp. Điều này giúp các biểu thức toán học trong chương trình trở nên tự nhiên.
- Yêu cầu: Nạp chồng toán tử + cho lớp PhanSo. Kết quả trả về phải là một đối tượng Phân số mới đã được rút gọn tối giản.', N'1. Áp dụng đúng công thức quy đồng mẫu số để tính tổng.
  2. Tự động gọi hàm rút gọn (UCLN) trước khi trả về kết quả.
  3. Không làm thay đổi giá trị của hai đối tượng tham gia phép cộng (ps1 và ps2).
  4. Trả về đối tượng theo giá trị (value) để hỗ trợ các biểu thức phức hợp.', N'LTHDT');

-- Bài 4: Cộng một số nguyên vào Phân số
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'LTHDT-126', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'LTHDT'), NULL, NULL, N'Bài 4: Cộng một số nguyên vào Phân số', N'Nạp chồng toán tử + để thực hiện phép tính: PhanSo + int. Ví dụ: 1/2 + 1 = 3/2.', N'Trong toán học, ta có thể lấy một phân số cộng với một số nguyên. Việc nạp chồng toán tử cho trường hợp này giúp chương trình linh hoạt hơn khi xử lý các kiểu dữ liệu hỗn hợp.
- Yêu cầu: Nạp chồng toán tử + để thực hiện phép tính: PhanSo + int. Ví dụ: 1/2 + 1 = 3/2.', N'1. Xử lý logic chuyển đổi số nguyên thành phân số có mẫu bằng 1 trước khi cộng.
  2. Cài đặt toán tử dưới dạng hàm thành viên (member function) của lớp PhanSo.
  3. Trả về kết quả là một đối tượng PhanSo mới.
  4. Đảm bảo tính đúng đắn của tử số và mẫu số sau phép tính.

------------------------------------------------------------

PHẦN 2: MỨC ĐỘ TRUNG BÌNH (MEDIUM)', N'LTHDT');

-- Bài 5: Tăng/Giảm thời gian (Toán tử ++ và --)
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'LTHDT-127', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'LTHDT'), NULL, NULL, N'Bài 5: Tăng/Giảm thời gian (Toán tử ++ và --)', N'Nạp chồng toán tử ++ và -- cho lớp ThoiGian (giờ, phút, giây). Khi tăng thêm 1 giây, nếu đạt 60 phải tự động tăng phút và giờ tương ứng.', N'Các toán tử tăng giảm rất hữu ích cho các lớp quản lý thời gian hoặc ngày tháng. Bạn cần xử lý cả hai dạng tiền tố (++t) và hậu tố (t++) để đồng bộ với cách hoạt động của kiểu int.
- Yêu cầu: Nạp chồng toán tử ++ và -- cho lớp ThoiGian (giờ, phút, giây). Khi tăng thêm 1 giây, nếu đạt 60 phải tự động tăng phút và giờ tương ứng.', N'1. Phân biệt đúng chữ ký (signature) của toán tử tiền tố và hậu tố (sử dụng tham số int giả cho hậu tố).
  2. Xử lý logic chuẩn hóa thời gian (vòng quay 24h) chính xác.
  3. Trả về đúng kiểu tham chiếu cho tiền tố và giá trị cũ cho hậu tố.
  4. Đảm bảo tính nhất quán của dữ liệu sau khi thực hiện thao tác.', N'LTHDT');

-- Bài 6: Truy cập phần tử mảng bằng toán tử chỉ số [ ]
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'LTHDT-128', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'LTHDT'), NULL, NULL, N'Bài 6: Truy cập phần tử mảng bằng toán tử chỉ số [ ]', N'Định nghĩa toán tử [] cho lớp MyVector để truy xuất và sửa đổi giá trị phần tử tại vị trí i.', N'Khi xây dựng một lớp quản lý mảng động, việc sử dụng toán tử [] cho phép người dùng truy cập các phần tử giống như mảng thông thường thay vì phải gọi hàm getElement(i).
- Yêu cầu: Định nghĩa toán tử [] cho lớp MyVector để truy xuất và sửa đổi giá trị phần tử tại vị trí i.', N'1. Kiểm tra điều kiện chỉ số i nằm trong phạm vi hợp lệ của mảng.
  2. Trả về tham chiếu của phần tử để có thể sử dụng ở cả hai vế của phép gán (L-value).
  3. Cài đặt thêm phiên bản const của toán tử [] để dùng cho các đối tượng hằng.
  4. Xử lý lỗi (Exception) hoặc thông báo khi chỉ số vượt quá phạm vi.', N'LTHDT');

-- Bài 7: Phép toán trên Số phức (Complex Number)
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'LTHDT-129', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'LTHDT'), NULL, NULL, N'Bài 7: Phép toán trên Số phức (Complex Number)', N'Cài đặt đầy đủ các toán tử toán học cho lớp SoPhuc. Ngoài ra, nạp chồng toán tử << để in số phức dưới dạng "a + bi".', N'Số phức gồm phần thực và phần ảo. Việc nạp chồng các toán tử +, -, *, / giúp lớp số phức hoạt động hoàn hảo trong các bài toán kỹ thuật điện và điều khiển.
- Yêu cầu: Cài đặt đầy đủ các toán tử toán học cho lớp SoPhuc. Ngoài ra, nạp chồng toán tử << để in số phức dưới dạng "a + bi".', N'1. Áp dụng đúng công thức nhân/chia số phức (ví dụ nhân liên hợp).
  2. Xử lý hiển thị đẹp mắt các trường hợp phần ảo âm hoặc bằng 0.
  3. Đảm bảo các toán tử không làm thay đổi đối tượng gốc.
  4. Cài đặt logic toán học đạt độ chính xác cao.', N'LTHDT');

-- Bài 8: So sánh thứ hạng Sinh viên (Toán tử > và <)
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'LTHDT-130', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'LTHDT'), NULL, NULL, N'Bài 8: So sánh thứ hạng Sinh viên (Toán tử > và <)', N'Nạp chồng toán tử > và < cho lớp SinhVien. Nếu hai sinh viên có điểm bằng nhau, thực hiện so sánh tiếp theo mã số sinh viên.', N'Để sắp xếp danh sách sinh viên, ta cần một tiêu chí so sánh. Việc nạp chồng các toán tử so sánh dựa trên điểm trung bình giúp các thuật toán sắp xếp hoạt động tự động trên đối tượng Sinh viên.
- Yêu cầu: Nạp chồng toán tử > và < cho lớp SinhVien. Nếu hai sinh viên có điểm bằng nhau, thực hiện so sánh tiếp theo mã số sinh viên.', N'1. Thực hiện logic so sánh đa tầng (điểm rồi đến mã số).
  2. Đảm bảo tính bắc cầu và nhất quán của phép so sánh.
  3. Sử dụng tham chiếu hằng để tối ưu tốc độ so sánh.
  4. Viết chương trình mẫu sắp xếp một mảng sinh viên bằng toán tử đã nạp chồng.

------------------------------------------------------------

PHẦN 3: MỨC ĐỘ KHÓ (HARD)', N'LTHDT');

-- Bài 9: Quản lý bộ nhớ với toán tử gán (Operator =)
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'LTHDT-131', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'LTHDT'), NULL, NULL, N'Bài 9: Quản lý bộ nhớ với toán tử gán (Operator =)', N'Cài đặt toán tử = cho lớp DaThuc hoặc MyString. Phải giải phóng vùng nhớ cũ của đối tượng bên trái trước khi cấp phát vùng nhớ mới để sao chép dữ liệu từ đối tượng bên phải.', N'Đối với các lớp sử dụng mảng động, toán tử gán mặc định của hệ thống chỉ sao chép địa chỉ, dẫn đến lỗi dùng chung vùng nhớ. Bạn phải nạp chồng toán tử này để thực hiện sao chép sâu.
- Yêu cầu: Cài đặt toán tử = cho lớp DaThuc hoặc MyString. Phải giải phóng vùng nhớ cũ của đối tượng bên trái trước khi cấp phát vùng nhớ mới để sao chép dữ liệu từ đối tượng bên phải.', N'1. Kiểm tra trường hợp tự gán (ví dụ: a = a) để tránh xóa nhầm dữ liệu đang dùng.
  2. Thực hiện giải phóng bộ nhớ cũ và cấp phát mới chính xác.
  3. Trả về *this để hỗ trợ chuỗi phép gán (a = b = c).
  4. Đảm bảo không xảy ra hiện tượng rò rỉ bộ nhớ sau khi gán.', N'LTHDT');

-- Bài 10: Toán tử gọi hàm (Toán tử ( )) để tính giá trị Đa thức
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'LTHDT-132', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'LTHDT'), NULL, NULL, N'Bài 10: Toán tử gọi hàm (Toán tử ( )) để tính giá trị Đa thức', N'Nạp chồng toán tử () cho lớp DaThuc sao cho lệnh "double result = P(x);" sẽ trả về giá trị của đa thức P tại x.', N'Toán tử () (Function Call Operator) cho phép một đối tượng hoạt động như một hàm số. Điều này rất thú vị khi áp dụng cho lớp đa thức để tính giá trị của nó tại một điểm x cụ thể.
- Yêu cầu: Nạp chồng toán tử () cho lớp DaThuc sao cho lệnh "double result = P(x);" sẽ trả về giá trị của đa thức P tại x.', N'1. Sử dụng thuật toán tối ưu (như lược đồ Horner) để tính toán giá trị.
  2. Cho phép nhận tham số là kiểu số thực (double/float).
  3. Đảm bảo phương thức là hằng (const function) vì không làm thay đổi đa thức.
  4. Xử lý được các đa thức có bậc bằng 0 hoặc đa thức rỗng.', N'LTHDT');

-- Bài 11: Cộng và Nhân hai Ma trận
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'LTHDT-133', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'LTHDT'), NULL, NULL, N'Bài 11: Cộng và Nhân hai Ma trận', N'Nạp chồng toán tử + và * cho lớp MaTran. Cần kiểm tra điều kiện tương thích về kích thước giữa hai ma trận trước khi thực hiện phép tính.', N'Ma trận là cấu trúc dữ liệu hai chiều phức tạp. Việc nạp chồng các toán tử +, * giúp lớp Matrix thực hiện các phép toán đại số tuyến tính một cách chuyên nghiệp.
- Yêu cầu: Nạp chồng toán tử + và * cho lớp MaTran. Cần kiểm tra điều kiện tương thích về kích thước giữa hai ma trận trước khi thực hiện phép tính.', N'1. Kiểm tra điều kiện: cộng cùng kích thước, nhân (cột A = hàng B).
  2. Cấp phát mảng động cho ma trận kết quả một cách chính xác.
  3. Tối ưu hóa các vòng lặp để phép nhân ma trận đạt hiệu suất tốt nhất.
  4. Xử lý ngoại lệ nếu kích thước ma trận không phù hợp.', N'LTHDT');

-- Bài 12: Chuyển đổi kiểu dữ liệu (Conversion Operator)
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'LTHDT-134', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'LTHDT'), NULL, NULL, N'Bài 12: Chuyển đổi kiểu dữ liệu (Conversion Operator)', N'Nạp chồng toán tử chuyển đổi cho lớp PhanSo sang kiểu double và lớp ThoiGian sang kiểu int (tổng số giây).', N'Đôi khi ta muốn ép kiểu một đối tượng về một kiểu dữ liệu cơ bản (ví dụ: ép kiểu phân số về số thực double). Toán tử chuyển đổi kiểu sẽ thực hiện việc này một cách tự động.
- Yêu cầu: Nạp chồng toán tử chuyển đổi cho lớp PhanSo sang kiểu double và lớp ThoiGian sang kiểu int (tổng số giây).', N'1. Cài đặt đúng cú pháp toán tử chuyển đổi (không có kiểu trả về trong khai báo).
  2. Tính toán chính xác giá trị thực của phân số (lưu ý phép chia nguyên).
  3. Đảm bảo toán tử hoạt động tốt trong các biểu thức tính toán hỗn hợp.
  4. Sử dụng từ khóa explicit nếu cần để tránh chuyển đổi ngầm định gây lỗi logic.


DANH SÁCH BÀI TẬP LẬP TRÌNH HƯỚNG ĐỐI TƯỢNG (OOP)
DẠNG 3: TÍNH KẾ THỪA (INHERITANCE)
------------------------------------------------------------

PHẦN 1: MỨC ĐỘ DỄ (EASY)', N'LTHDT');

-- Bài 1: Kế thừa cơ bản từ lớp Người sang Sinh viên
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'LTHDT-135', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'LTHDT'), NULL, NULL, N'Bài 1: Kế thừa cơ bản từ lớp Người sang Sinh viên', N'Định nghĩa lớp Nguoi với các thuộc tính cơ bản. Xây dựng lớp SinhVien kế thừa từ lớp Nguoi và bổ sung thêm thuộc tính MSSV. Viết hàm nhập/xuất cho cả hai lớp.', N'Một sinh viên về bản chất vẫn là một con người nhưng có thêm các đặc tính riêng như mã số sinh viên và điểm số. Việc kế thừa giúp lớp Sinh viên không cần định nghĩa lại các thuộc tính chung như họ tên, ngày sinh hay giới tính.
- Yêu cầu: Định nghĩa lớp Nguoi với các thuộc tính cơ bản. Xây dựng lớp SinhVien kế thừa từ lớp Nguoi và bổ sung thêm thuộc tính MSSV. Viết hàm nhập/xuất cho cả hai lớp.', N'1. Sử dụng đúng cú pháp kế thừa (public) trong C++.
  2. Gọi được phương thức xuất của lớp cha bên trong phương thức xuất của lớp con.
  3. Khai báo đúng phạm vi truy cập (protected) để lớp con có thể sử dụng thuộc tính của lớp cha.
  4. Khởi tạo đối tượng lớp con và hiển thị đầy đủ thông tin từ cả hai lớp.', N'LTHDT');

-- Bài 2: Kế thừa lớp Hình học cho Hình chữ nhật
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'LTHDT-136', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'LTHDT'), NULL, NULL, N'Bài 2: Kế thừa lớp Hình học cho Hình chữ nhật', N'Tạo lớp cơ sở HinhHoc và lớp dẫn xuất HinhChuNhat. Lớp con kế thừa thuộc tính tên từ lớp cha và định nghĩa thêm các kích thước riêng.', N'Mọi hình học đều có thuộc tính tên hình. Hình chữ nhật là một trường hợp cụ thể có thêm chiều dài và chiều rộng. Kế thừa giúp quản lý danh mục các loại hình một cách hệ thống.
- Yêu cầu: Tạo lớp cơ sở HinhHoc và lớp dẫn xuất HinhChuNhat. Lớp con kế thừa thuộc tính tên từ lớp cha và định nghĩa thêm các kích thước riêng.', N'1. Thực hiện kế thừa thuộc tính tên từ lớp cha thành công.
  2. Hàm khởi tạo lớp con gán được giá trị cho cả thuộc tính của lớp cha.
  3. Phương thức in thông tin hiển thị được tên hình từ lớp cơ sở.
  4. Phân biệt rõ ràng giữa thuộc tính chung và thuộc tính riêng.', N'LTHDT');

-- Bài 3: Quản lý Nhân viên và Quản lý (Manager)
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'LTHDT-137', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'LTHDT'), NULL, NULL, N'Bài 3: Quản lý Nhân viên và Quản lý (Manager)', N'Xây dựng lớp NhanVien và lớp QuanLy kế thừa từ NhanVien. Lớp QuanLy bổ sung thêm thuộc tính phụ cấp và ghi đè hàm tính lương.', N'Trong một công ty, Quản lý là một loại nhân viên đặc biệt có thêm phụ cấp trách nhiệm. Kế thừa cho phép ta tận dụng logic tính lương cơ bản của nhân viên cho cấp quản lý.
- Yêu cầu: Xây dựng lớp NhanVien và lớp QuanLy kế thừa từ NhanVien. Lớp QuanLy bổ sung thêm thuộc tính phụ cấp và ghi đè hàm tính lương.', N'1. Cài đặt đúng mối quan hệ kế thừa giữa hai lớp nhân sự.
  2. Hàm tính lương của lớp QuanLy phải gọi được hàm tính lương của lớp NhanVien để cộng thêm phụ cấp.
  3. Sử dụng đúng phạm vi truy cập để bảo vệ dữ liệu lương.
  4. Minh họa được việc thay đổi lương ở lớp cha sẽ ảnh hưởng đến lớp con.', N'LTHDT');

-- Bài 4: Sử dụng từ khóa Protected trong kế thừa
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'LTHDT-138', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'LTHDT'), NULL, NULL, N'Bài 4: Sử dụng từ khóa Protected trong kế thừa', N'Tạo lớp cha có các thuộc tính protected. Tạo lớp con truy cập trực tiếp các thuộc tính này để thực hiện một phép tính toán cụ thể.', N'Từ khóa protected đóng vai trò quan trọng trong kế thừa, nó cho phép lớp con truy cập dữ liệu nhưng vẫn giữ bí mật với thế giới bên ngoài.
- Yêu cầu: Tạo lớp cha có các thuộc tính protected. Tạo lớp con truy cập trực tiếp các thuộc tính này để thực hiện một phép tính toán cụ thể.', N'1. Chứng minh được thuộc tính protected không thể truy cập từ hàm main.
  2. Lớp con truy cập và thay đổi được giá trị các thuộc tính này mà không cần getter/setter.
  3. Giải thích được sự khác biệt giữa private và protected qua mã nguồn.
  4. Đảm bảo tính đóng gói vẫn được duy trì đối với các đối tượng bên ngoài.

------------------------------------------------------------

PHẦN 2: MỨC ĐỘ TRUNG BÌNH (MEDIUM)', N'LTHDT');

-- Bài 5: Kế thừa đa mức (Multilevel Inheritance)
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'LTHDT-139', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'LTHDT'), NULL, NULL, N'Bài 5: Kế thừa đa mức (Multilevel Inheritance)', N'Xây dựng hệ thống 3 lớp kế thừa nối tiếp nhau. Lớp cuối cùng phải sử dụng được thuộc tính và phương thức của cả hai lớp tiền nhiệm.', N'Trong tự nhiên, phân cấp có thể kéo dài qua nhiều thế hệ. Động vật -> Động vật có vú -> Con người. Mỗi cấp độ sẽ kế thừa và làm giàu thêm các đặc tính của cấp độ trước.
- Yêu cầu: Xây dựng hệ thống 3 lớp kế thừa nối tiếp nhau. Lớp cuối cùng phải sử dụng được thuộc tính và phương thức của cả hai lớp tiền nhiệm.', N'1. Thiết lập đúng chuỗi kế thừa đa mức.
  2. Constructor của lớp cháu phải gọi được Constructor của lớp cha và ông thông qua danh sách khởi tạo.
  3. Không xảy ra lỗi xung đột tên phương thức giữa các cấp.
  4. Chứng minh được tính lan truyền của các thuộc tính protected qua các cấp.', N'LTHDT');

-- Bài 6: Hệ thống quản lý các loại Cán bộ
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'LTHDT-140', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'LTHDT'), NULL, NULL, N'Bài 6: Hệ thống quản lý các loại Cán bộ', N'Thiết kế lớp CanBo là lớp cha. Các lớp CongNhan, KySu, NhanVien kế thừa từ CanBo và bổ sung các đặc thù nghề nghiệp tương ứng.', N'Một đơn vị cần quản lý Công nhân, Kỹ sư và Nhân viên. Cả ba nhóm này đều có chung thông tin cán bộ nhưng khác nhau về chuyên môn (bậc thợ, ngành đào tạo, công việc).
- Yêu cầu: Thiết kế lớp CanBo là lớp cha. Các lớp CongNhan, KySu, NhanVien kế thừa từ CanBo và bổ sung các đặc thù nghề nghiệp tương ứng.', N'1. Thiết kế cấu trúc phân cấp cây kế thừa hợp lý.
  2. Các lớp con tái sử dụng tối đa mã nguồn của lớp cha cho các thông tin chung.
  3. Hàm nhập/xuất của mỗi lớp con chỉ tập trung vào phần dữ liệu riêng biệt của nó.
  4. Quản lý danh sách hỗn hợp các loại cán bộ bằng các đối tượng cụ thể.', N'LTHDT');

-- Bài 7: Quản lý Phương tiện giao thông
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'LTHDT-141', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'LTHDT'), NULL, NULL, N'Bài 7: Quản lý Phương tiện giao thông', N'Xây dựng lớp PhuongTien và các lớp con tương ứng. Mỗi lớp con có thêm thuộc tính riêng (số chỗ ngồi, dung tích bình xăng, tải trọng).', N'Ô tô, Xe máy và Xe tải đều có chung số khung, hãng sản xuất và năm xuất xưởng. Việc dùng kế thừa giúp hệ thống quản lý đăng kiểm hoạt động nhất quán trên mọi loại xe.
- Yêu cầu: Xây dựng lớp PhuongTien và các lớp con tương ứng. Mỗi lớp con có thêm thuộc tính riêng (số chỗ ngồi, dung tích bình xăng, tải trọng).', N'1. Định nghĩa các thuộc tính chung tại lớp cơ sở một cách khoa học.
  2. Lớp dẫn xuất bổ sung đúng và đủ các thuộc tính đặc trưng.
  3. Viết hàm hiển thị thông tin tổng hợp cho từng loại phương tiện.
  4. Kiểm soát tốt việc khởi tạo dữ liệu thông qua Constructor có tham số.', N'LTHDT');

-- Bài 8: Ghi đè phương thức (Method Overriding) trong kế thừa
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'LTHDT-142', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'LTHDT'), NULL, NULL, N'Bài 8: Ghi đè phương thức (Method Overriding) trong kế thừa', N'Tạo lớp cha có hàm hienThi(). Lớp con định nghĩa lại hàm hienThi() để bổ sung thông tin chi tiết hơn mà không làm mất đi thông tin cũ.', N'Lớp con có thể định nghĩa lại một phương thức đã có ở lớp cha để phù hợp hơn với đặc tính của nó (ví dụ: mọi loài chim đều bay, nhưng chim cánh cụt thì "bay" theo cách bơi).
- Yêu cầu: Tạo lớp cha có hàm hienThi(). Lớp con định nghĩa lại hàm hienThi() để bổ sung thông tin chi tiết hơn mà không làm mất đi thông tin cũ.', N'1. Cài đặt đúng hàm trùng tên và trùng tham số ở cả hai lớp.
  2. Sử dụng toán tử phân giải phạm vi (::) để gọi lại hàm của lớp cha bên trong hàm của lớp con.
  3. Minh họa được việc khi gọi hàm từ đối tượng lớp con, phiên bản mới sẽ được ưu tiên.
  4. Đảm bảo logic hiển thị không bị lặp lại nhàm chán.

------------------------------------------------------------

PHẦN 3: MỨC ĐỘ KHÓ (HARD)', N'LTHDT');

-- Bài 9: Đa kế thừa và Vấn đề kim cương (Diamond Problem)
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'LTHDT-143', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'LTHDT'), NULL, NULL, N'Bài 9: Đa kế thừa và Vấn đề kim cương (Diamond Problem)', N'Xây dựng hệ thống đa kế thừa và sử dụng từ khóa ''virtual'' trong kế thừa để giải quyết xung đột vùng nhớ.', N'Một lớp có thể kế thừa từ nhiều lớp cha cùng lúc. Tuy nhiên, nếu hai lớp cha cùng kế thừa từ một lớp "ông nội", lớp con sẽ bị xung đột dữ liệu (vấn đề kim cương).
- Yêu cầu: Xây dựng hệ thống đa kế thừa và sử dụng từ khóa ''virtual'' trong kế thừa để giải quyết xung đột vùng nhớ.', N'1. Cài đặt thành công một lớp kế thừa từ hai lớp khác nhau.
  2. Sử dụng Virtual Inheritance để đảm bảo chỉ có một bản sao duy nhất của lớp cơ sở chung.
  3. Truy cập thuộc tính của lớp "ông nội" từ lớp con mà không bị lỗi ambiguious (mơ hồ).
  4. Giải thích được cơ chế hoạt động của con trỏ ảo trong trường hợp này.', N'LTHDT');

-- Bài 10: Quản lý Tài khoản ngân hàng đa dạng
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'LTHDT-144', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'LTHDT'), NULL, NULL, N'Bài 10: Quản lý Tài khoản ngân hàng đa dạng', N'Xây dựng hệ thống kế thừa phức tạp cho ngân hàng. Lớp con phải kiểm tra các ràng buộc riêng (ví dụ: không được rút quá hạn mức nợ) trước khi gọi hàm rút tiền của lớp cha.', N'Tài khoản tiết kiệm có lãi suất, tài khoản tín dụng có hạn mức nợ. Cả hai đều kế thừa từ tài khoản thanh toán nhưng có logic rút tiền và tính phí khác hẳn nhau.
- Yêu cầu: Xây dựng hệ thống kế thừa phức tạp cho ngân hàng. Lớp con phải kiểm tra các ràng buộc riêng (ví dụ: không được rút quá hạn mức nợ) trước khi gọi hàm rút tiền của lớp cha.', N'1. Thiết kế logic ghi đè phương thức rút tiền với các điều kiện ràng buộc chặt chẽ.
  2. Quản lý chính xác số dư sau khi áp dụng các quy tắc lãi suất hoặc phí dịch vụ riêng.
  3. Sử dụng Constructor để truyền dữ liệu xuyên suốt các tầng kế thừa.
  4. Đảm bảo tính an toàn dữ liệu, không cho phép lớp con làm hỏng trạng thái của lớp cha.', N'LTHDT');

-- Bài 11: Kế thừa và Quản lý bộ nhớ động
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'LTHDT-145', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'LTHDT'), NULL, NULL, N'Bài 11: Kế thừa và Quản lý bộ nhớ động', N'Xây dựng hai lớp kế thừa nhau, cả hai đều có thuộc tính là con trỏ. Viết hàm hủy để giải phóng bộ nhớ theo đúng thứ tự.', N'Khi lớp cha và lớp con đều sử dụng mảng động hoặc con trỏ, việc quản lý hàm hủy và sao chép trở nên cực kỳ nguy hiểm nếu không nắm vững quy tắc kế thừa.
- Yêu cầu: Xây dựng hai lớp kế thừa nhau, cả hai đều có thuộc tính là con trỏ. Viết hàm hủy để giải phóng bộ nhớ theo đúng thứ tự.', N'1. Cài đặt Destructor cho cả lớp cha và lớp con.
  2. Đảm bảo bộ nhớ của lớp con được giải phóng trước, sau đó mới đến lớp cha.
  3. Xử lý Copy Constructor ở lớp con sao cho nó cũng sao chép được dữ liệu ở lớp cha.
  4. Ngăn chặn triệt để lỗi Memory Leak và lỗi truy cập vùng nhớ đã giải phóng.', N'LTHDT');

-- Bài 12: Hệ thống quản lý Sở thú (Zoo Management)
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'LTHDT-146', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'LTHDT'), NULL, NULL, N'Bài 12: Hệ thống quản lý Sở thú (Zoo Management)', N'Thiết kế cây kế thừa ít nhất 3 tầng (Động vật -> Nhóm loài -> Loài cụ thể). Lớp cuối cùng phải tổng hợp được đầy đủ hành vi từ các cấp trên.', N'Một sở thú quản lý nhiều loài Động vật. Mỗi nhóm (Thú, Chim, Bò sát) có đặc điểm chung, nhưng từng loài cụ thể lại có tiếng kêu và thức ăn riêng.
- Yêu cầu: Thiết kế cây kế thừa ít nhất 3 tầng (Động vật -> Nhóm loài -> Loài cụ thể). Lớp cuối cùng phải tổng hợp được đầy đủ hành vi từ các cấp trên.', N'1. Xây dựng cấu trúc kế thừa phân cấp sâu và rõ ràng.
  2. Sử dụng phương thức ghi đè để mô phỏng các hành vi đặc trưng của từng loài.
  3. Constructor các lớp con phải truyền được dữ liệu lên tận lớp cơ sở cao nhất.
  4. Viết chương trình mô phỏng các hoạt động của sở thú thông qua danh sách đối tượng kế thừa.


DANH SÁCH BÀI TẬP LẬP TRÌNH HƯỚNG ĐỐI TƯỢNG (OOP)
DẠNG 4: TÍNH ĐA HÌNH VÀ LỚP TRƯU TƯỢNG
------------------------------------------------------------

PHẦN 1: MỨC ĐỘ DỄ (EASY)', N'LTHDT');

-- Bài 1: Sử dụng hàm ảo (Virtual Function) cơ bản
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'LTHDT-147', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'LTHDT'), NULL, NULL, N'Bài 1: Sử dụng hàm ảo (Virtual Function) cơ bản', N'Tạo lớp cha DongVat có hàm keu(). Các lớp con như Cho, Meo ghi đè hàm này. Sử dụng con trỏ lớp DongVat để gọi hàm keu() và quan sát sự khác biệt khi có và không có từ khóa virtual.', N'Khi con trỏ lớp cha trỏ đến đối tượng lớp con, mặc định hệ thống sẽ gọi hàm của lớp cha. Việc sử dụng hàm ảo giúp chương trình nhận biết và gọi đúng hàm của lớp con tại thời điểm thực thi (Late Binding).
- Yêu cầu: Tạo lớp cha DongVat có hàm keu(). Các lớp con như Cho, Meo ghi đè hàm này. Sử dụng con trỏ lớp DongVat để gọi hàm keu() và quan sát sự khác biệt khi có và không có từ khóa virtual.', N'1. Khai báo đúng từ khóa virtual tại hàm của lớp cha.
  2. Thực hiện ghi đè (override) chính xác tại các lớp con.
  3. Sử dụng con trỏ lớp cơ sở để quản lý đối tượng lớp dẫn xuất.
  4. Giải thích được cơ chế liên kết động qua kết quả chạy chương trình.', N'LTHDT');

-- Bài 2: Tạo lớp trừu tượng Hình học đơn giản
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'LTHDT-148', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'LTHDT'), NULL, NULL, N'Bài 2: Tạo lớp trừu tượng Hình học đơn giản', N'Định nghĩa lớp trừu tượng HinhHoc với hàm thuần ảo tinhDienTich() = 0. Xây dựng lớp HinhTron và HinhChuNhat kế thừa và cài đặt hàm này.', N'Một "Hình học" nói chung không thể tính diện tích nếu không biết đó là hình gì. Do đó, lớp Hình học nên là một lớp trừu tượng để làm khuôn mẫu cho các hình cụ thể.
- Yêu cầu: Định nghĩa lớp trừu tượng HinhHoc với hàm thuần ảo tinhDienTich() = 0. Xây dựng lớp HinhTron và HinhChuNhat kế thừa và cài đặt hàm này.', N'1. Khai báo đúng cú pháp hàm thuần ảo để biến lớp thành lớp trừu tượng (Abstract Class).
  2. Lớp con phải cài đặt đầy đủ các hàm thuần ảo từ lớp cha.
  3. Không thể khởi tạo đối tượng trực tiếp từ lớp HinhHoc.
  4. Tính toán diện tích chính xác cho từng hình cụ thể.', N'LTHDT');

-- Bài 3: Quản lý danh sách đối tượng đa hình
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'LTHDT-149', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'LTHDT'), NULL, NULL, N'Bài 3: Quản lý danh sách đối tượng đa hình', N'Tạo một mảng con trỏ lớp cha trỏ đến nhiều đối tượng lớp con khác nhau. Sử dụng vòng lặp để gọi phương thức đa hình trên toàn bộ danh sách.', N'Sức mạnh của đa hình nằm ở việc quản lý một danh sách hỗn hợp các đối tượng khác nhau nhưng có chung lớp cha thông qua một mảng con trỏ duy nhất.
- Yêu cầu: Tạo một mảng con trỏ lớp cha trỏ đến nhiều đối tượng lớp con khác nhau. Sử dụng vòng lặp để gọi phương thức đa hình trên toàn bộ danh sách.', N'1. Khởi tạo mảng con trỏ và cấp phát bộ nhớ động cho các đối tượng con.
  2. Gọi phương thức thông qua con trỏ mà không cần ép kiểu thủ công.
  3. Hiển thị đúng hành vi đặc trưng của từng đối tượng trong danh sách.
  4. Đảm bảo tính nhất quán trong giao diện lập trình của các lớp con.', N'LTHDT');

-- Bài 4: Lớp trừu tượng và Phương thức thuần ảo
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'LTHDT-150', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'LTHDT'), NULL, NULL, N'Bài 4: Lớp trừu tượng và Phương thức thuần ảo', N'Thiết kế lớp trừu tượng ThietBiDien với hàm thuần ảo tinhCongSuat(). Xây dựng các lớp Den, Quat kế thừa và thực thi hàm đó.', N'Phương thức thuần ảo đóng vai trò như một bản thiết kế bắt buộc. Mọi lớp con muốn trở thành một lớp cụ thể đều phải thực hiện lời hứa cài đặt các phương thức này.
- Yêu cầu: Thiết kế lớp trừu tượng ThietBiDien với hàm thuần ảo tinhCongSuat(). Xây dựng các lớp Den, Quat kế thừa và thực thi hàm đó.', N'1. Sử dụng đúng ý nghĩa của phương thức thuần ảo trong thiết kế hệ thống.
  2. Lớp dẫn xuất không cài đặt hàm thuần ảo sẽ tiếp tục là lớp trừu tượng.
  3. Cài đặt logic tính toán công suất riêng cho từng loại thiết bị.
  4. Hiểu rõ sự khác biệt giữa hàm ảo thông thường và hàm thuần ảo.

------------------------------------------------------------

PHẦN 2: MỨC ĐỘ TRUNG BÌNH (MEDIUM)', N'LTHDT');

-- Bài 5: Quản lý nhân viên bằng kỹ thuật đa hình
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'LTHDT-151', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'LTHDT'), NULL, NULL, N'Bài 5: Quản lý nhân viên bằng kỹ thuật đa hình', N'Xây dựng lớp cha NhanVien và các lớp con với hàm ảo tinhLuong(). Dùng danh sách con trỏ để quản lý và tính tổng lương cho toàn công ty.', N'Trong một công ty có nhân viên biên chế và nhân viên hợp đồng. Cách tính lương của họ khác nhau, nhưng hệ thống kế toán cần duyệt qua tất cả để xuất bảng lương hàng tháng.
- Yêu cầu: Xây dựng lớp cha NhanVien và các lớp con với hàm ảo tinhLuong(). Dùng danh sách con trỏ để quản lý và tính tổng lương cho toàn công ty.', N'1. Thiết kế hàm ảo tinhLuong() phù hợp với các công thức tính lương khác nhau.
  2. Duyệt danh sách và tính tổng tiền lương chính xác bằng một vòng lặp duy nhất.
  3. Quản lý dữ liệu nhân viên thông qua lớp cha mà không quan tâm đến chi tiết lớp con.
  4. Cài đặt các phương thức nhập/xuất đa hình để lấy thông tin nhân viên.', N'LTHDT');

-- Bài 6: Tính tổng diện tích các hình hỗn hợp
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'LTHDT-152', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'LTHDT'), NULL, NULL, N'Bài 6: Tính tổng diện tích các hình hỗn hợp', N'Tạo danh sách các đối tượng HinhTron, HinhVuong, TamGiac. Viết hàm nhận vào một mảng con trỏ lớp cha và trả về tổng diện tích của tất cả các hình.', N'Một kiến trúc sư cần tính tổng diện tích của một mặt sàn gồm nhiều loại hình khối khác nhau. Đa hình giúp việc cộng dồn diện tích trở nên cực kỳ đơn giản.
- Yêu cầu: Tạo danh sách các đối tượng HinhTron, HinhVuong, TamGiac. Viết hàm nhận vào một mảng con trỏ lớp cha và trả về tổng diện tích của tất cả các hình.', N'1. Áp dụng đa hình để lấy diện tích của từng đối tượng mà không cần kiểm tra kiểu (if-else).
  2. Xử lý chính xác các tham số toán học cho từng loại hình cụ thể.
  3. Kết quả tổng diện tích phải chính xác theo dữ liệu đầu vào.
  4. Mã nguồn có khả năng mở rộng thêm hình mới (như Hình Thang) mà không cần sửa hàm tính tổng.', N'LTHDT');

-- Bài 7: Sử dụng Hàm hủy ảo (Virtual Destructor)
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'LTHDT-153', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'LTHDT'), NULL, NULL, N'Bài 7: Sử dụng Hàm hủy ảo (Virtual Destructor)', N'Tạo lớp cha và lớp con đều có cấp phát bộ nhớ động. Thực hiện giải phóng đối tượng và chứng minh hàm hủy ảo giúp dọn dẹp bộ nhớ hoàn toàn.', N'Đây là một lỗi cực kỳ phổ biến và nguy hiểm. Nếu không có hàm hủy ảo, khi xóa một đối tượng lớp con thông qua con trỏ lớp cha, chỉ có phần của lớp cha được giải phóng, gây rò rỉ bộ nhớ.
- Yêu cầu: Tạo lớp cha và lớp con đều có cấp phát bộ nhớ động. Thực hiện giải phóng đối tượng và chứng minh hàm hủy ảo giúp dọn dẹp bộ nhớ hoàn toàn.', N'1. Khai báo virtual cho hàm hủy (Destructor) của lớp cơ sở.
  2. In thông báo trong các hàm hủy để quan sát thứ tự giải phóng bộ nhớ.
  3. Giải phóng bộ nhớ động ở cả hai cấp (cha và con) thành công.
  4. Khắc phục triệt để hiện tượng rò rỉ bộ nhớ (Memory Leak).', N'LTHDT');

-- Bài 8: Liên kết tĩnh và Liên kết động
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'LTHDT-154', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'LTHDT'), NULL, NULL, N'Bài 8: Liên kết tĩnh và Liên kết động', N'Viết chương trình minh họa cùng một tên hàm nhưng có sự khác biệt về kết quả gọi hàm khi sử dụng con trỏ lớp cha đối với hàm ảo và hàm không ảo.', N'Hiểu rõ sự khác biệt giữa cách trình biên dịch xử lý hàm thông thường (static binding) và hàm ảo (dynamic binding) giúp bạn làm chủ hiệu năng chương trình.
- Yêu cầu: Viết chương trình minh họa cùng một tên hàm nhưng có sự khác biệt về kết quả gọi hàm khi sử dụng con trỏ lớp cha đối với hàm ảo và hàm không ảo.', N'1. Phân biệt được thời điểm quyết định gọi hàm (Compile-time vs Runtime).
  2. Giải thích được cơ chế bảng ảo (V-Table) qua ví dụ thực tế.
  3. Sử dụng đúng cú pháp để ép buộc gọi hàm của lớp cha khi cần thiết.
  4. Đánh giá được chi phí hiệu năng nhỏ của việc sử dụng hàm ảo.

------------------------------------------------------------

PHẦN 3: MỨC ĐỘ KHÓ (HARD)', N'LTHDT');

-- Bài 9: Thiết kế giao diện (Interface) cho hệ thống thanh toán
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'LTHDT-155', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'LTHDT'), NULL, NULL, N'Bài 9: Thiết kế giao diện (Interface) cho hệ thống thanh toán', N'Thiết kế Interface IThanhToan với các phương thức như thucHienGiaoDich(). Cài đặt các lớp cụ thể như ThanhToanThe, ThanhToanViDienTu.', N'Interface là một dạng lớp trừu tượng đặc biệt chỉ chứa các phương thức thuần ảo, đóng vai trò như một bản cam kết dịch vụ giữa các thành phần phần mềm.
- Yêu cầu: Thiết kế Interface IThanhToan với các phương thức như thucHienGiaoDich(). Cài đặt các lớp cụ thể như ThanhToanThe, ThanhToanViDienTu.', N'1. Xây dựng lớp chỉ chứa các phương thức thuần ảo và không có thuộc tính dữ liệu.
  2. Các lớp dẫn xuất thực thi đầy đủ quy trình của giao dịch thanh toán.
  3. Đảm bảo tính tách biệt giữa giao diện và cài đặt thực tế.
  4. Mô phỏng được một hệ thống thanh toán đa kênh linh hoạt.', N'LTHDT');

-- Bài 10: Mô phỏng trò chơi chiến thuật với Đa hình
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'LTHDT-156', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'LTHDT'), NULL, NULL, N'Bài 10: Mô phỏng trò chơi chiến thuật với Đa hình', N'Thiết kế lớp trừu tượng NhanVat và các lớp con ghi đè hàm tanCong(). Sử dụng đa hình để thực hiện các đợt tấn công của một đội quân hỗn hợp.', N'Trong trò chơi, các nhân vật (Chiến binh, Phù thủy, Cung thủ) đều có hành động "tấn công", nhưng mỗi loại có cách thức và sát thương khác nhau.
- Yêu cầu: Thiết kế lớp trừu tượng NhanVat và các lớp con ghi đè hàm tanCong(). Sử dụng đa hình để thực hiện các đợt tấn công của một đội quân hỗn hợp.', N'1. Quản lý trạng thái và hành vi của nhân vật thông qua các hàm ảo.
  2. Xử lý logic tương tác phức tạp giữa các đối tượng (ví dụ: trừ máu đối phương).
  3. Sử dụng đa hình để tạo ra các hiệu ứng tấn công khác nhau cho từng loại quân.
  4. Mã nguồn thể hiện rõ tư duy thiết kế trò chơi hướng đối tượng.', N'LTHDT');

-- Bài 11: Hệ thống quản lý lương thưởng phức tạp
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'LTHDT-157', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'LTHDT'), NULL, NULL, N'Bài 11: Hệ thống quản lý lương thưởng phức tạp', N'Sử dụng lớp trừu tượng và đa hình để thiết kế hệ thống tính lương. Mỗi loại nhân viên có một phương thức tính thưởng riêng biệt được cài đặt đa hình.', N'Lương nhân viên không chỉ có lương cơ bản mà còn có thưởng theo doanh số, thưởng theo dự án hoặc phụ cấp độc hại tùy theo vị trí công việc.
- Yêu cầu: Sử dụng lớp trừu tượng và đa hình để thiết kế hệ thống tính lương. Mỗi loại nhân viên có một phương thức tính thưởng riêng biệt được cài đặt đa hình.', N'1. Kết hợp thành công tính kế thừa và tính đa hình trong bài toán thực tế.
  2. Đảm bảo các công thức tính toán phức tạp được đóng gói gọn gàng trong các lớp con.
  3. Tính toán tổng quỹ lương chính xác cho một tổ chức có cơ cấu phức tạp.
  4. Khả năng bảo trì cao khi chính sách thưởng của công ty thay đổi.', N'LTHDT');

-- Bài 12: Áp dụng Đa hình vào quản lý cửa hàng điện tử
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'LTHDT-158', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'LTHDT'), NULL, NULL, N'Bài 12: Áp dụng Đa hình vào quản lý cửa hàng điện tử', N'Thiết kế hệ thống quản lý sản phẩm với các hàm ảo tinhGiaBan() và hienThiBaoHanh(). Thực hiện in hóa đơn cho một giỏ hàng chứa nhiều loại thiết bị.', N'Một cửa hàng bán Điện thoại, Laptop và Tivi. Mỗi mặt hàng có chế độ bảo hành và khuyến mãi khác nhau. Đa hình giúp xử lý việc thanh toán và in hóa đơn một cách đồng nhất.
- Yêu cầu: Thiết kế hệ thống quản lý sản phẩm với các hàm ảo tinhGiaBan() và hienThiBaoHanh(). Thực hiện in hóa đơn cho một giỏ hàng chứa nhiều loại thiết bị.', N'1. Cài đặt các chiến lược giá và khuyến mãi đa hình cho từng loại sản phẩm.
  2. Xử lý logic in hóa đơn chuyên nghiệp bằng cách duyệt qua danh sách con trỏ lớp cha.
  3. Đảm bảo các đặc tính riêng của sản phẩm vẫn được hiển thị đúng trên hóa đơn.
  4. Hệ thống hoạt động ổn định và dễ dàng thêm mới các mặt hàng kinh doanh khác.


DANH SÁCH BÀI TẬP LẬP TRÌNH HƯỚNG ĐỐI TƯỢNG (OOP)
DẠNG 5: TEMPLATE VÀ XỬ LÝ NGOẠI LỆ
------------------------------------------------------------

PHẦN 1: MỨC ĐỘ DỄ (EASY)', N'LTHDT');

-- Bài 1: Template hàm tìm giá trị lớn nhất
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'LTHDT-159', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'LTHDT'), NULL, NULL, N'Bài 1: Template hàm tìm giá trị lớn nhất', N'Viết một function template tìm giá trị lớn nhất (Max) của hai tham số. Thử nghiệm hàm với các kiểu số nguyên, số thực và ký tự.', N'Việc viết nhiều hàm tìm số lớn nhất cho kiểu int, kiểu float, kiểu double là rất dư thừa. Template hàm cho phép bạn định nghĩa một logic chung duy nhất để so sánh hai đại lượng cùng kiểu.
- Yêu cầu: Viết một function template tìm giá trị lớn nhất (Max) của hai tham số. Thử nghiệm hàm với các kiểu số nguyên, số thực và ký tự.', N'1. Khai báo đúng cú pháp template <class T> hoặc <typename T>.
  2. Hàm hoạt động chính xác cho ít nhất 3 kiểu dữ liệu khác nhau.
  3. Sử dụng đúng toán tử so sánh bên trong hàm tổng quát.
  4. Trả về đúng kiểu dữ liệu của tham số đầu vào.', N'LTHDT');

-- Bài 2: Template hàm hoán vị (Swap) hai giá trị
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'LTHDT-160', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'LTHDT'), NULL, NULL, N'Bài 2: Template hàm hoán vị (Swap) hai giá trị', N'Xây dựng hàm swap tổng quát. Viết chương trình chính để hoán đổi giá trị của hai số thực và hai ký tự.', N'Hoán vị là thao tác bổ trợ quan trọng trong các thuật toán sắp xếp. Bằng cách dùng template, bạn có thể hoán vị từ hai số nguyên cho đến hai đối tượng Phân số phức tạp.
- Yêu cầu: Xây dựng hàm swap tổng quát. Viết chương trình chính để hoán đổi giá trị của hai số thực và hai ký tự.', N'1. Sử dụng biến trung gian có kiểu dữ liệu T một cách hợp lý.
  2. Truyền tham số dưới dạng tham chiếu (reference) để giá trị thực sự thay đổi sau khi thoát hàm.
  3. Đảm bảo không xảy ra lỗi khi hoán vị các kiểu dữ liệu có kích thước bộ nhớ khác nhau.
  4. Mã nguồn gọn gàng, thể hiện rõ tính tổng quát.', N'LTHDT');

-- Bài 3: Kiểm soát lỗi chia cho 0 (Exception Handling)
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'LTHDT-161', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'LTHDT'), NULL, NULL, N'Bài 3: Kiểm soát lỗi chia cho 0 (Exception Handling)', N'Viết hàm chia hai số thực. Nếu mẫu số bằng 0, thực hiện ném (throw) một ngoại lệ. Trong hàm main, sử dụng khối try-catch để xử lý.', N'Trong toán học, phép chia cho 0 là không xác định và sẽ làm chương trình bị "treo" (crash). Cơ chế xử lý ngoại lệ giúp bạn bắt lấy lỗi này và đưa ra thông báo thay vì để chương trình dừng đột ngột.
- Yêu cầu: Viết hàm chia hai số thực. Nếu mẫu số bằng 0, thực hiện ném (throw) một ngoại lệ. Trong hàm main, sử dụng khối try-catch để xử lý.', N'1. Sử dụng lệnh throw để ném đi một thông báo lỗi hoặc một mã lỗi.
  2. Cấu trúc khối try-catch được đặt đúng vị trí cần kiểm soát.
  3. Chương trình vẫn tiếp tục chạy sau khi xử lý xong ngoại lệ.
  4. Thông báo lỗi hiển thị rõ ràng cho người dùng.', N'LTHDT');

-- Bài 4: Bắt ngoại lệ nhập dữ liệu hình học
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'LTHDT-162', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'LTHDT'), NULL, NULL, N'Bài 4: Bắt ngoại lệ nhập dữ liệu hình học', N'Trong hàm nhập của lớp HinhTron, nếu người dùng nhập bán kính r <= 0, hãy ném ra một ngoại lệ thông báo dữ liệu không hợp lệ.', N'Các kích thước như bán kính hình tròn hay cạnh tam giác không bao giờ được âm. Việc kiểm soát ngay từ khâu nhập giúp đối tượng luôn ở trạng thái hợp lệ.
- Yêu cầu: Trong hàm nhập của lớp HinhTron, nếu người dùng nhập bán kính r <= 0, hãy ném ra một ngoại lệ thông báo dữ liệu không hợp lệ.', N'1. Kiểm tra điều kiện đầu vào ngay trước khi gán giá trị cho thuộc tính.
  2. Ném ra ngoại lệ kiểu chuỗi hoặc kiểu đối tượng exception.
  3. Bắt ngoại lệ trong hàm main và cho phép người dùng nhập lại.
  4. Đảm bảo tính đóng gói không bị phá vỡ bởi dữ liệu sai.

------------------------------------------------------------

PHẦN 2: MỨC ĐỘ TRUNG BÌNH (MEDIUM)', N'LTHDT');

-- Bài 5: Xây dựng lớp Ngăn xếp tổng quát (Template Stack)
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'LTHDT-163', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'LTHDT'), NULL, NULL, N'Bài 5: Xây dựng lớp Ngăn xếp tổng quát (Template Stack)', N'Định nghĩa lớp template Stack với các phương thức push(), pop(). Thử nghiệm lưu trữ một danh sách các số thực và một danh sách các chuỗi ký tự.', N'Một cấu trúc dữ liệu Stack nên dùng được cho mọi loại dữ liệu (lưu số nguyên, lưu sinh viên, lưu phân số). Template lớp cho phép bạn làm điều này một cách dễ dàng.
- Yêu cầu: Định nghĩa lớp template Stack với các phương thức push(), pop(). Thử nghiệm lưu trữ một danh sách các số thực và một danh sách các chuỗi ký tự.', N'1. Khai báo template cho toàn bộ lớp (Class Template).
  2. Quản lý mảng lưu trữ bên trong theo kiểu dữ liệu tổng quát T.
  3. Xử lý được các thao tác cơ bản của Stack với hiệu suất O(1).
  4. Không xảy ra lỗi khi khởi tạo đối tượng với các kiểu dữ liệu khác nhau.', N'LTHDT');

-- Bài 6: Lớp Mảng động tổng quát (Template Array)
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'LTHDT-164', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'LTHDT'), NULL, NULL, N'Bài 6: Lớp Mảng động tổng quát (Template Array)', N'Viết lớp template MyArray quản lý mảng động. Nạp chồng toán tử [] để truy cập phần tử và viết hàm thêm phần tử vào mảng.', N'Thay vì tạo các lớp mảng riêng biệt cho từng kiểu, bạn có thể tạo một lớp mảng duy nhất có khả năng tự co giãn và chứa được bất kỳ kiểu dữ liệu nào.
- Yêu cầu: Viết lớp template MyArray quản lý mảng động. Nạp chồng toán tử [] để truy cập phần tử và viết hàm thêm phần tử vào mảng.', N'1. Quản lý bộ nhớ động (cấp phát/giải phóng) cho kiểu T chính xác.
  2. Toán tử [] trả về đúng kiểu dữ liệu T&.
  3. Xử lý được việc thay đổi kích thước mảng khi vượt quá dung lượng.
  4. Đảm bảo giải phóng bộ nhớ trong hàm hủy của lớp template.', N'LTHDT');

-- Bài 7: Template hàm sắp xếp mảng (Generic Sort)
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'LTHDT-165', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'LTHDT'), NULL, NULL, N'Bài 7: Template hàm sắp xếp mảng (Generic Sort)', N'Viết một hàm template để sắp xếp mảng tăng dần. Thử nghiệm sắp xếp mảng số thực và mảng đối tượng PhanSo (đã nạp chồng toán tử so sánh).', N'Thuật toán sắp xếp (như Selection Sort) có logic giống nhau cho mọi kiểu dữ liệu, chỉ khác ở phép so sánh. Template hàm sẽ giúp bạn có một hàm sắp xếp "vạn năng".
- Yêu cầu: Viết một hàm template để sắp xếp mảng tăng dần. Thử nghiệm sắp xếp mảng số thực và mảng đối tượng PhanSo (đã nạp chồng toán tử so sánh).', N'1. Logic sắp xếp không phụ thuộc vào một kiểu dữ liệu cụ thể.
  2. Tận dụng được các toán tử đã nạp chồng của các đối tượng phức tạp.
  3. Đảm bảo thuật toán chạy đúng và hiệu quả trên các kiểu dữ liệu khác nhau.
  4. Mã nguồn thể hiện tính tái sử dụng cao.', N'LTHDT');

-- Bài 8: Bắt nhiều loại ngoại lệ (Multiple Catch Blocks)
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'LTHDT-166', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'LTHDT'), NULL, NULL, N'Bài 8: Bắt nhiều loại ngoại lệ (Multiple Catch Blocks)', N'Viết chương trình thực hiện tính toán trên mảng. Sử dụng các khối catch khác nhau để bắt lỗi chia cho 0 và lỗi truy cập ngoài phạm vi mảng.', N'Một đoạn code có thể phát sinh nhiều loại lỗi khác nhau (lỗi chia cho 0, lỗi chỉ số mảng, lỗi hết bộ nhớ). Bạn cần biết cách phân loại để xử lý từng lỗi một cách thích hợp.
- Yêu cầu: Viết chương trình thực hiện tính toán trên mảng. Sử dụng các khối catch khác nhau để bắt lỗi chia cho 0 và lỗi truy cập ngoài phạm vi mảng.', N'1. Thứ tự các khối catch được sắp xếp hợp lý (từ cụ thể đến tổng quát).
  2. Mỗi khối catch đưa ra phản hồi chính xác cho loại lỗi tương ứng.
  3. Sử dụng catch(...) để bắt các lỗi không xác định khác.
  4. Minh họa được luồng đi của chương trình khi gặp từng loại lỗi.

------------------------------------------------------------

PHẦN 3: MỨC ĐỘ KHÓ (HARD)', N'LTHDT');

-- Bài 9: Lớp Ma trận tổng quát (Template Matrix)
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'LTHDT-167', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'LTHDT'), NULL, NULL, N'Bài 9: Lớp Ma trận tổng quát (Template Matrix)', N'Xây dựng lớp template Matrix cho phép thực hiện các phép cộng, nhân ma trận giữa các kiểu dữ liệu số học khác nhau.', N'Ma trận có thể chứa số nguyên, số thực hoặc thậm chí là số phức. Việc dùng template lớp kết hợp với nạp chồng toán tử tạo ra một công cụ toán học cực mạnh.
- Yêu cầu: Xây dựng lớp template Matrix cho phép thực hiện các phép cộng, nhân ma trận giữa các kiểu dữ liệu số học khác nhau.', N'1. Cài đặt thành công các phép toán ma trận trên kiểu dữ liệu tổng quát T.
  2. Xử lý ngoại lệ khi kích thước hai ma trận không tương thích để cộng hoặc nhân.
  3. Quản lý mảng hai chiều động bên trong lớp template một cách an toàn.
  4. Đảm bảo hiệu suất tính toán không bị suy giảm do dùng template.', N'LTHDT');

-- Bài 10: Xây dựng lớp ngoại lệ tự định nghĩa (Custom Exception)
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'LTHDT-168', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'LTHDT'), NULL, NULL, N'Bài 10: Xây dựng lớp ngoại lệ tự định nghĩa (Custom Exception)', N'Tạo lớp MyException chứa mã lỗi và thông báo lỗi. Sử dụng nó để kiểm soát các tình huống lỗi trong hệ thống quản lý nhân sự (ví dụ: tuổi nhân viên < 18).', N'Trong các dự án lớn, các thông báo lỗi mặc định là không đủ. Bạn cần tự tạo ra các lớp ngoại lệ riêng kế thừa từ lớp std::exception để mang theo nhiều thông tin lỗi hơn.
- Yêu cầu: Tạo lớp MyException chứa mã lỗi và thông báo lỗi. Sử dụng nó để kiểm soát các tình huống lỗi trong hệ thống quản lý nhân sự (ví dụ: tuổi nhân viên < 18).', N'1. Kế thừa chính xác từ lớp cơ sở std::exception.
  2. Ghi đè (override) phương thức what() để trả về thông báo lỗi tùy chỉnh.
  3. Ném và bắt được đối tượng ngoại lệ tự tạo trong các tình huống thực tế.
  4. Cung cấp đầy đủ thông tin (mã lỗi, thời gian xảy ra lỗi) bên trong đối tượng ngoại lệ.', N'LTHDT');

-- Bài 11: Danh sách liên kết đơn tổng quát
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'LTHDT-169', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'LTHDT'), NULL, NULL, N'Bài 11: Danh sách liên kết đơn tổng quát', N'Cài đặt lớp template LinkedList. Viết các hàm thêm, xóa, tìm kiếm phần tử. Thử nghiệm lưu trữ danh sách các đối tượng SinhVien.', N'Đây là sự kết hợp giữa Cấu trúc dữ liệu và OOP nâng cao. Danh sách liên kết có thể lưu trữ bất kỳ loại Node nào nhờ vào sức mạnh của Template.
- Yêu cầu: Cài đặt lớp template LinkedList. Viết các hàm thêm, xóa, tìm kiếm phần tử. Thử nghiệm lưu trữ danh sách các đối tượng SinhVien.', N'1. Định nghĩa cấu trúc Node bên trong lớp template một cách hợp lý.
  2. Quản lý con trỏ và vùng nhớ động cực kỳ cẩn thận cho kiểu T.
  3. Các phương thức hoạt động ổn định trên cả kiểu dữ liệu cơ bản và kiểu đối tượng.
  4. Giải phóng hoàn toàn bộ nhớ của toàn bộ danh sách trong hàm hủy.', N'LTHDT');

-- Bài 12: Hệ thống quản lý giỏ hàng kết hợp Template và Exception
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'LTHDT-170', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'LTHDT'), NULL, NULL, N'Bài 12: Hệ thống quản lý giỏ hàng kết hợp Template và Exception', N'Thiết kế lớp template GioHang. Ném ngoại lệ khi số lượng hàng trong kho không đủ hoặc khi thanh toán vượt quá hạn mức. Sử dụng template để giỏ hàng có thể chứa Sản phẩm điện tử hoặc Thực phẩm.', N'Một hệ thống hoàn chỉnh cần cả sự linh hoạt của Template (để chứa nhiều loại hàng hóa) và sự chặt chẽ của Exception (để kiểm soát kho hàng và thanh toán).
- Yêu cầu: Thiết kế lớp template GioHang. Ném ngoại lệ khi số lượng hàng trong kho không đủ hoặc khi thanh toán vượt quá hạn mức. Sử dụng template để giỏ hàng có thể chứa Sản phẩm điện tử hoặc Thực phẩm.', N'1. Kết hợp nhuần nhuyễn tính đa hình, kế thừa với template trong cùng một hệ thống.
  2. Sử dụng xử lý ngoại lệ để đảm bảo các quy trình nghiệp vụ (business logic) luôn đúng.
  3. Quản lý danh sách hàng hóa trong giỏ hàng bằng lớp template tự xây dựng ở các bài trước.
  4. Mã nguồn chuyên nghiệp, có khả năng mở rộng và chịu lỗi tốt.', N'LTHDT');

-- Bài 1: Kiểm tra tính chẵn lẻ và âm dương
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'NMTL-171', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'NMTL'), NULL, NULL, N'Bài 1: Kiểm tra tính chẵn lẻ và âm dương', N'Sử dụng cấu trúc If-Else cơ bản.', N'Nhập vào một số nguyên n. Kiểm tra và in ra thông báo:
  + n là số chẵn hay số lẻ?
  + n là số âm, số dương hay số 0?', N'1. Sử dụng đúng toán tử chia lấy dư % 2 để kiểm tra chẵn lẻ.
  2. Cấu trúc If-Else đầy đủ các trường hợp.', N'NMTL');

-- Bài 2: Tìm số lớn nhất (Max) trong 3 số
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'NMTL-172', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'NMTL'), NULL, NULL, N'Bài 2: Tìm số lớn nhất (Max) trong 3 số', N'Sử dụng kỹ thuật lính canh hoặc If-Else lồng nhau.', N'Nhập vào 3 số thực a, b, c. Tìm và in ra giá trị lớn nhất trong 3 số đó.', N'1. Thuật toán tối ưu (ít phép so sánh nhất).
  2. Xử lý đúng trường hợp các số bằng nhau.', N'NMTL');

-- Bài 3: Kiểm tra ký tự nguyên âm/phụ âm
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'NMTL-173', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'NMTL'), NULL, NULL, N'Bài 3: Kiểm tra ký tự nguyên âm/phụ âm', N'Sử dụng cấu trúc Switch-Case hoặc If-Else kết hợp toán tử logic.', N'Nhập vào một ký tự trong bảng chữ cái tiếng Anh. Kiểm tra ký tự đó là nguyên âm (a, e, i, o, u) hay phụ âm.', N'1. Xử lý được cả chữ hoa và chữ thường.
  2. Sử dụng Switch-Case gom nhóm các trường hợp nguyên âm để code ngắn gọn.

------------------------------------------------------------

PHẦN 2: MỨC ĐỘ TRUNG BÌNH (MEDIUM)', N'NMTL');

-- Bài 4: Tính tiền điện sinh hoạt
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'NMTL-174', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'NMTL'), NULL, NULL, N'Bài 4: Tính tiền điện sinh hoạt', N'Sử dụng If-Else bậc thang (Else-If).', N'Nhập vào số kWh điện tiêu thụ. Tính tổng tiền điện theo lũy tiến:
  + 50 kWh đầu: 1.678 đ/kWh
  + 51 - 100 kWh: 1.734 đ/kWh
  + Trên 100 kWh: 2.014 đ/kWh', N'1. Công thức tính tiền đúng (phải tính theo từng bậc, không nhân trực tiếp tổng số chữ với đơn giá cao nhất).
  2. Kiểm tra điều kiện số kWh nhập vào không được âm.', N'NMTL');

-- Bài 5: Giải phương trình bậc hai ax^2 + bx + c = 0
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'NMTL-175', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'NMTL'), NULL, NULL, N'Bài 5: Giải phương trình bậc hai ax^2 + bx + c = 0', N'Biện luận đầy đủ các trường hợp toán học.', N'Nhập 3 hệ số a, b, c. Giải và biện luận nghiệm của phương trình.', N'1. Xử lý trường hợp a = 0 (trở thành phương trình bậc nhất).
  2. Tính Delta và xét đúng 3 trường hợp: Delta < 0, Delta = 0, Delta > 0.', N'NMTL');

-- Bài 6: Tính ngày trong tháng
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'NMTL-176', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'NMTL'), NULL, NULL, N'Bài 6: Tính ngày trong tháng', N'Sử dụng Switch-Case và lồng If-Else kiểm tra năm nhuận.', N'Nhập vào tháng và năm. In ra số ngày của tháng đó.', N'1. Xử lý đúng các tháng 1, 3, 5, 7, 8, 10, 12 có 31 ngày.
  2. Tháng 2 phải dựa vào năm nhuận để xác định 28 hay 29 ngày.', N'NMTL');

-- Bài 7: Kiểm tra tính hợp lệ của ngày tháng năm
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'NMTL-177', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'NMTL'), NULL, NULL, N'Bài 7: Kiểm tra tính hợp lệ của ngày tháng năm', N'Kết hợp nhiều điều kiện logic phức tạp.', N'Nhập vào ngày, tháng, năm. Kiểm tra xem ngày tháng năm đó có hợp lệ hay không (Ví dụ: 30/02/2023 là không hợp lệ).', N'1. Kiểm tra miền giá trị: tháng (1-12), ngày (1-31 tùy tháng).
  2. Kiểm tra logic năm nhuận cho ngày 29/02.

------------------------------------------------------------

PHẦN 3: MỨC ĐỘ KHÓ (HARD)', N'NMTL');

-- Bài 8: Đọc số nguyên có 2 chữ số
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'NMTL-178', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'NMTL'), NULL, NULL, N'Bài 8: Đọc số nguyên có 2 chữ số', N'Sử dụng Switch-Case lồng nhau để xử lý chuỗi văn bản.', N'Nhập vào số nguyên n (10 <= n <= 99). In ra cách đọc của số đó bằng tiếng Việt (Ví dụ: 25 in ra "Hai muoi lam", 11 in ra "Muoi mot").', N'1. Tách đúng hàng chục và hàng đơn vị.
  2. Xử lý các trường hợp đặc biệt: số hàng đơn vị là 1 (mốt/một), 5 (lăm/năm), hàng chục là 1 (mười).', N'NMTL');

-- Bài 9: Tìm ngày kế tiếp (Next Day)
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'NMTL-179', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'NMTL'), NULL, NULL, N'Bài 9: Tìm ngày kế tiếp (Next Day)', N'Tư duy logic về sự chuyển giao đơn vị thời gian.', N'Nhập vào ngày, tháng, năm hợp lệ. Tìm và in ra ngày, tháng, năm của ngày tiếp theo.', N'1. Xử lý đúng khi ngày tiếp theo chuyển sang tháng mới.
  2. Xử lý đúng khi ngày tiếp theo chuyển sang năm mới (31/12).
  3. Xử lý đúng ngày cuối cùng của tháng 2 năm nhuận.', N'NMTL');

-- Bài 10: Xây dựng máy tính bỏ túi đơn giản (Calculator)
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'NMTL-180', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'NMTL'), NULL, NULL, N'Bài 10: Xây dựng máy tính bỏ túi đơn giản (Calculator)', N'Xử lý menu và điều kiện lỗi toán học.', N'Nhập vào hai số thực a, b và một ký tự toán tử (+, -, *, /). In ra kết quả phép tính. Nếu người dùng nhập sai ký tự hoặc chia cho 0, phải thông báo lỗi cụ thể.', N'1. Sử dụng Switch-Case cho các toán tử.
  2. Bắt lỗi chia cho số 0 (Zero Division Error) trước khi thực hiện phép tính.

DANH SÁCH BÀI TẬP NHẬP MÔN LẬP TRÌNH
DẠNG 4: VÒNG LẶP (FOR, WHILE, DO-WHILE)
------------------------------------------------------------

PHẦN 1: MỨC ĐỘ DỄ (EASY)', N'NMTL');

-- Bài 1: In dãy số và tính tổng cơ bản
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'NMTL-181', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'NMTL'), NULL, NULL, N'Bài 1: In dãy số và tính tổng cơ bản', N'Sử dụng vòng lặp for.', N'Nhập vào số nguyên dương n. 
  a. In các số từ 1 đến n ra màn hình, mỗi số cách nhau một khoảng trắng.
  b. Tính tổng S = 1 + 2 + ... + n.', N'1. Khởi tạo biến chạy i và biến tích lũy S đúng giá trị.
  2. Vòng lặp chạy đủ số lần (từ 1 đến n).', N'NMTL');

-- Bài 2: Bảng cửu chương
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'NMTL-182', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'NMTL'), NULL, NULL, N'Bài 2: Bảng cửu chương', N'Sử dụng vòng lặp for.', N'Nhập vào một số nguyên n (1 <= n <= 9). In ra bảng cửu chương của số đó.', N'1. Hiển thị đúng định dạng (Ví dụ: 2 x 1 = 2).
  2. Sử dụng vòng lặp chạy từ 1 đến 10.', N'NMTL');

-- Bài 3: Liệt kê số chẵn/lẻ
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'NMTL-183', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'NMTL'), NULL, NULL, N'Bài 3: Liệt kê số chẵn/lẻ', N'Sử dụng vòng lặp và câu lệnh điều kiện bên trong.', N'Nhập vào số nguyên dương n. In ra tất cả các số chẵn nhỏ hơn hoặc bằng n.', N'1. Sử dụng bước nhảy i++ kết hợp if(i%2==0) hoặc tối ưu bằng bước nhảy i+=2.

------------------------------------------------------------

PHẦN 2: MỨC ĐỘ TRUNG BÌNH (MEDIUM)', N'NMTL');

-- Bài 4: Tính tổng chuỗi phân số
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'NMTL-184', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'NMTL'), NULL, NULL, N'Bài 4: Tính tổng chuỗi phân số', N'Kiểm soát kiểu dữ liệu số thực trong vòng lặp.', N'Tính tổng S = 1 + 1/2 + 1/3 + ... + 1/n với n nhập từ bàn phím.', N'1. Biến S phải khai báo kiểu float/double.
  2. Ép kiểu trong phép chia (ví dụ: 1.0/i) để không bị mất phần thập phân.', N'NMTL');

-- Bài 5: Phân tích một số ra thừa số nguyên tố
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'NMTL-185', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'NMTL'), NULL, NULL, N'Bài 5: Phân tích một số ra thừa số nguyên tố', N'Kết hợp vòng lặp và phép chia lấy dư.', N'Nhập n = 12, in ra: 2 * 2 * 3.', N'1. Sử dụng vòng lặp while để chia triệt để cho từng số nguyên tố từ nhỏ đến lớn.', N'NMTL');

-- Bài 6: Tìm ước chung lớn nhất (UCLN) và Bội chung nhỏ nhất (BCNN)
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'NMTL-186', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'NMTL'), NULL, NULL, N'Bài 6: Tìm ước chung lớn nhất (UCLN) và Bội chung nhỏ nhất (BCNN)', N'Sử dụng vòng lặp while với điều kiện phức tạp.', N'Nhập 2 số a, b. Tìm UCLN và BCNN của chúng.', N'1. Áp dụng đúng thuật toán Euclid.
  2. Công thức BCNN = (a * b) / UCLN.', N'NMTL');

-- Bài 7: Kiểm tra số hoàn thiện (Perfect Number)
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'NMTL-187', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'NMTL'), NULL, NULL, N'Bài 7: Kiểm tra số hoàn thiện (Perfect Number)', N'Vòng lặp tìm ước số.', N'Số hoàn thiện là số có tổng các ước (không kể chính nó) bằng chính nó. Ví dụ: 6 = 1 + 2 + 3. Kiểm tra n có phải số hoàn thiện không?', N'1. Vòng lặp chạy từ 1 đến n/2 để tìm ước.
  2. So sánh tổng ước với số ban đầu.

------------------------------------------------------------

PHẦN 3: MỨC ĐỘ KHÓ (HARD)', N'NMTL');

-- Bài 8: Kiểm tra số nguyên tố (Tối ưu)
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'NMTL-188', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'NMTL'), NULL, NULL, N'Bài 8: Kiểm tra số nguyên tố (Tối ưu)', N'Tối ưu hiệu năng vòng lặp.', N'Nhập n, kiểm tra n có phải số nguyên tố không.', N'1. Xử lý các trường hợp đặc biệt (n < 2).
  2. Vòng lặp chỉ cần chạy từ 2 đến căn bậc hai của n (sqrt(n)) để tăng tốc độ.', N'NMTL');

-- Bài 9: Thao tác với chữ số của một số nguyên
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'NMTL-189', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'NMTL'), NULL, NULL, N'Bài 9: Thao tác với chữ số của một số nguyên', N'Sử dụng vòng lặp while(n > 0).', N'Nhập số nguyên dương n.
  a. Đếm số lượng chữ số của n.
  b. Tìm chữ số lớn nhất của n.
  c. Tính tổng các chữ số của n.', N'1. Sử dụng n % 10 để lấy chữ số cuối và n / 10 để bỏ chữ số cuối.
  2. Khởi tạo giá trị Max chính xác.', N'NMTL');

-- Bài 10: In hình sao (Vòng lặp lồng nhau - Nested Loops)
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'NMTL-190', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'NMTL'), NULL, NULL, N'Bài 10: In hình sao (Vòng lặp lồng nhau - Nested Loops)', N'Quản lý hai biến chạy i (dòng) và j (cột).', N'Nhập chiều cao h. In ra tam giác vuông cân nằm bên trái và bên phải.
  Ví dụ h=3 (trái):
  *
  **
  ***', N'1. Vòng lặp ngoài kiểm soát số dòng.
  2. Vòng lặp trong kiểm soát số lượng dấu sao dựa trên biến chạy của vòng lặp ngoài.



DANH SÁCH BÀI TẬP NHẬP MÔN LẬP TRÌNH
DẠNG 5: HÀM (FUNCTION)
------------------------------------------------------------

PHẦN 1: MỨC ĐỘ DỄ (EASY)', N'NMTL');

-- Bài 1: Hàm tính giá trị tuyệt đối và lũy thừa
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'NMTL-191', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'NMTL'), NULL, NULL, N'Bài 1: Hàm tính giá trị tuyệt đối và lũy thừa', N'Định nghĩa và gọi hàm cơ bản.', N'a. Viết hàm TinhTuyetDoi(float n) trả về giá trị tuyệt đối của n.
  b. Viết hàm TinhLuyThua(float cơ_số, int số_mũ) trả về giá trị lũy thừa tương ứng.', N'1. Khai báo đúng kiểu trả về (float).
  2. Truyền tham số đúng kiểu dữ liệu.', N'NMTL');

-- Bài 2: Hàm kiểm tra tính chất số (Boolean Function)
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'NMTL-192', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'NMTL'), NULL, NULL, N'Bài 2: Hàm kiểm tra tính chất số (Boolean Function)', N'Viết hàm trả về giá trị kiểu logic (bool hoặc int 0/1).', N'Viết hàm kiemTraChanLe(int n). Nếu n chẵn trả về 1, ngược lại trả về 0. Áp dụng hàm này trong chương trình chính để kiểm tra một số nhập từ bàn phím.', N'1. Hàm thực hiện đúng chức năng kiểm tra.
  2. Sử dụng kết quả của hàm trong câu lệnh if ở hàm main() một cách hợp lý.', N'NMTL');

-- Bài 3: Hàm tìm số lớn nhất (Max)
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'NMTL-193', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'NMTL'), NULL, NULL, N'Bài 3: Hàm tìm số lớn nhất (Max)', N'Xây dựng hàm có nhiều tham số.', N'Viết hàm timMax3So(float a, float b, float c) trả về giá trị lớn nhất trong 3 số.', N'1. Logic tìm Max đúng.
  2. Hàm trả về đúng giá trị lớn nhất thay vì chỉ in ra màn hình bên trong hàm.

------------------------------------------------------------

PHẦN 2: MỨC ĐỘ TRUNG BÌNH (MEDIUM)', N'NMTL');

-- Bài 4: Hoán vị hai số (Tham biến và Tham trị)
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'NMTL-194', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'NMTL'), NULL, NULL, N'Bài 4: Hoán vị hai số (Tham biến và Tham trị)', N'Sử dụng con trỏ (pointer) hoặc tham chiếu (reference) để thay đổi giá trị biến.', N'Viết hàm swap(int &a, int &b) để hoán đổi giá trị của hai biến sau khi hàm kết thúc.', N'1. Phân biệt được sự khác biệt khi dùng tham chiếu (&) và khi không dùng.
  2. Giá trị của biến trong hàm main() phải thực sự thay đổi sau khi gọi hàm.', N'NMTL');

-- Bài 5: Hàm kiểm tra số nguyên tố và số hoàn thiện
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'NMTL-195', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'NMTL'), NULL, NULL, N'Bài 5: Hàm kiểm tra số nguyên tố và số hoàn thiện', N'Tái sử dụng hàm.', N'a. Viết hàm kiemTraSNT(int n).
  b. Sử dụng hàm trên để viết chương trình liệt kê tất cả các số nguyên tố nhỏ hơn 1000.', N'1. Hàm kiemTraSNT có logic tối ưu.
  2. Gọi hàm đúng cách trong vòng lặp ở hàm main().', N'NMTL');

-- Bài 6: Tính tổng các chữ số bằng hàm
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'NMTL-196', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'NMTL'), NULL, NULL, N'Bài 6: Tính tổng các chữ số bằng hàm', N'Tách biệt xử lý logic và nhập xuất.', N'Viết hàm tinhTongChuSo(int n). Chương trình chính cho phép người dùng nhập n, gọi hàm và in kết quả.', N'1. Hàm không chứa lệnh nhập/xuất (cin/cout hoặc scanf/printf) để đảm bảo tính độc lập.
  2. Xử lý đúng cho cả số âm (nếu có).', N'NMTL');

-- Bài 7: Rút gọn phân số bằng hàm
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'NMTL-197', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'NMTL'), NULL, NULL, N'Bài 7: Rút gọn phân số bằng hàm', N'Kết hợp nhiều hàm với nhau.', N'Viết hàm timUCLN(int a, int b). Sau đó viết hàm rutGonPhanSo(int &tu, int &mau) bằng cách chia cả tử và mẫu cho UCLN.', N'1. Hàm timUCLN hoạt động chính xác.
  2. Hàm rutGonPhanSo sử dụng tham chiếu để cập nhật trực tiếp tử và mẫu.

------------------------------------------------------------

PHẦN 3: MỨC ĐỘ KHÓ (HARD)', N'NMTL');

-- Bài 8: Hàm đệ quy cơ bản (Recursion)
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'NMTL-198', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'NMTL'), NULL, NULL, N'Bài 8: Hàm đệ quy cơ bản (Recursion)', N'Hiểu về cơ chế gọi lại chính nó của hàm.', N'a. Viết hàm đệ quy tinhGiaiThua(int n) để tính n!.
  b. Viết hàm đệ quy tinhFibonacci(int n) để tìm số Fibonacci thứ n.', N'1. Xác định đúng "điểm dừng" (base case) để tránh lặp vô hạn.
  2. Công thức đệ quy đúng với định nghĩa toán học.', N'NMTL');

-- Bài 9: Giải hệ phương trình bậc nhất bằng hàm
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'NMTL-199', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'NMTL'), NULL, NULL, N'Bài 9: Giải hệ phương trình bậc nhất bằng hàm', N'Hàm trả về nhiều giá trị thông qua tham số.', N'Viết hàm giaiHePhuongTrinh(a1, b1, c1, a2, b2, c2, &x, &y). Hàm trả về trạng thái (0: Vô nghiệm, 1: Có nghiệm, 2: Vô số nghiệm). Nếu có nghiệm thì gán giá trị vào x và y.', N'1. Sử dụng đúng kỹ thuật truyền tham chiếu để lấy kết quả x, y.
  2. Biện luận đầy đủ các trường hợp của định thức (Cramer).', N'NMTL');

-- Bài 10: Xây dựng thư viện tính toán hình học
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'NMTL-200', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'NMTL'), NULL, NULL, N'Bài 10: Xây dựng thư viện tính toán hình học', N'Tổ chức code chuyên nghiệp.', N'Viết một bộ các hàm: tinhChuViTamGiac(), tinhDienTichTamGiac(), kiemTraTamGiacHopLe(). Chương trình chính cho phép nhập 3 cạnh, kiểm tra tính hợp lệ trước khi tính toán.', N'1. Các hàm có tính liên kết logic (hàm này sử dụng kết quả hàm kia).
  2. Kiểm soát lỗi chặt chẽ (ví dụ: không tính diện tích nếu tam giác không hợp lệ).



DANH SÁCH BÀI TẬP NHẬP MÔN LẬP TRÌNH
DẠNG 6: MẢNG MỘT CHIỀU (ARRAY)
------------------------------------------------------------

PHẦN 1: MỨC ĐỘ DỄ (EASY)', N'NMTL');

-- Bài 1: Nhập xuất mảng cơ bản
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'NMTL-201', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'NMTL'), NULL, NULL, N'Bài 1: Nhập xuất mảng cơ bản', N'Sử dụng vòng lặp để duyệt mảng.', N'Viết chương trình nhập vào một mảng n số nguyên. In ra mảng vừa nhập theo thứ tự xuôi và thứ tự ngược lại.', N'1. Khai báo mảng với kích thước tối đa phù hợp.
  2. Sử dụng đúng chỉ số mảng (từ 0 đến n-1).', N'NMTL');

-- Bài 2: Tính tổng và trung bình cộng
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'NMTL-202', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'NMTL'), NULL, NULL, N'Bài 2: Tính tổng và trung bình cộng', N'Kỹ thuật tích lũy giá trị trong mảng.', N'Nhập mảng n số thực. Tính tổng các phần tử trong mảng và trung bình cộng của các số dương trong mảng.', N'1. Duyệt mảng chính xác.
  2. Xử lý đúng biến đếm để chia trung bình cộng (tránh chia cho 0 nếu không có số dương).', N'NMTL');

-- Bài 3: Tìm Max/Min đơn giản
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'NMTL-203', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'NMTL'), NULL, NULL, N'Bài 3: Tìm Max/Min đơn giản', N'Kỹ thuật đặt "lính canh".', N'Nhập mảng n số nguyên. Tìm giá trị lớn nhất và giá trị nhỏ nhất trong mảng.', N'1. Khởi tạo giá trị Max/Min bằng phần tử đầu tiên của mảng (a[0]).
  2. So sánh lần lượt để cập nhật Max/Min.

------------------------------------------------------------

PHẦN 2: MỨC ĐỘ TRUNG BÌNH (MEDIUM)', N'NMTL');

-- Bài 4: Liệt kê phần tử thỏa điều kiện
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'NMTL-204', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'NMTL'), NULL, NULL, N'Bài 4: Liệt kê phần tử thỏa điều kiện', N'Kết hợp mảng và các bài toán số học.', N'Nhập mảng n số nguyên. Hãy liệt kê tất cả các số nguyên tố có trong mảng.', N'1. Viết hàm kiểm tra số nguyên tố riêng biệt.
  2. Duyệt mảng và gọi hàm để kiểm tra từng phần tử.', N'NMTL');

-- Bài 5: Tìm kiếm vị trí
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'NMTL-205', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'NMTL'), NULL, NULL, N'Bài 5: Tìm kiếm vị trí', N'Kỹ thuật tìm kiếm tuyến tính (Linear Search).', N'Nhập mảng n số nguyên và một số x. Tìm và in ra tất cả các vị trí (chỉ số) mà a[i] == x. Nếu không thấy, in ra -1.', N'1. Trả về đúng chỉ số (index) thay vì giá trị.
  2. Xử lý được trường hợp x xuất hiện nhiều lần hoặc không xuất hiện.', N'NMTL');

-- Bài 6: Sắp xếp mảng cơ bản
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'NMTL-206', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'NMTL'), NULL, NULL, N'Bài 6: Sắp xếp mảng cơ bản', N'Sử dụng thuật toán đổi chỗ trực tiếp (Interchange Sort).', N'Nhập mảng n số nguyên. Hãy sắp xếp mảng theo thứ tự tăng dần.', N'1. Sử dụng 2 vòng lặp lồng nhau.
  2. Thực hiện hoán vị (swap) đúng khi điều kiện sai thứ tự xảy ra.', N'NMTL');

-- Bài 7: Thêm phần tử vào mảng
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'NMTL-207', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'NMTL'), NULL, NULL, N'Bài 7: Thêm phần tử vào mảng', N'Kỹ thuật dời chỗ phần tử.', N'Nhập mảng n số nguyên. Nhập một giá trị x và vị trí k. Hãy chèn x vào vị trí k trong mảng (các phần tử từ k trở đi phải dời sang phải).', N'1. Vòng lặp dời chỗ phải chạy từ cuối mảng về vị trí k.
  2. Cập nhật lại số lượng phần tử n sau khi chèn.

------------------------------------------------------------

PHẦN 3: MỨC ĐỘ KHÓ (HARD)', N'NMTL');

-- Bài 8: Xóa phần tử thỏa điều kiện
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'NMTL-208', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'NMTL'), NULL, NULL, N'Bài 8: Xóa phần tử thỏa điều kiện', N'Kỹ thuật dời chỗ và xử lý chỉ số biến thiên.', N'Nhập mảng n số nguyên. Hãy xóa tất cả các số chẵn có trong mảng.', N'1. Khi xóa một phần tử, các phần tử sau phải dời sang trái.
  2. Lưu ý xử lý chỉ số i cẩn thận để không bỏ sót các số chẵn nằm liên tiếp nhau.', N'NMTL');

-- Bài 9: Đếm số lần xuất hiện (Tần suất)
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'NMTL-209', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'NMTL'), NULL, NULL, N'Bài 9: Đếm số lần xuất hiện (Tần suất)', N'Kỹ thuật mảng phụ hoặc đánh dấu.', N'Nhập mảng n số nguyên. In ra các giá trị khác nhau trong mảng và số lần xuất hiện tương ứng của chúng.', N'1. Mỗi giá trị chỉ được liệt kê một lần duy nhất kèm theo số lần xuất hiện.
  2. Thuật toán tối ưu, không in trùng lặp kết quả.', N'NMTL');

-- Bài 10: Kiểm tra mảng đối xứng/Mảng con
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'NMTL-210', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'NMTL'), NULL, NULL, N'Bài 10: Kiểm tra mảng đối xứng/Mảng con', N'Tư duy logic mảng cao cấp.', N'a. Kiểm tra mảng có đối xứng hay không (ví dụ: 1 2 3 2 1 là đối xứng).
  b. Tìm dãy con liên tiếp có tổng lớn nhất trong mảng.', N'1. Sử dụng vòng lặp chạy đến n/2 để kiểm tra đối xứng.
  2. Thuật toán tìm dãy con chính xác (có thể sử dụng thuật toán Kadane nếu muốn tối ưu).', N'NMTL');

-- SQLQuery1
INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
VALUES (N'SQLQuery1-211', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'SQLQuery1'), NULL, NULL, N'SQLQuery1', N'', N'﻿-- 1. Bảng Môn học
CREATE TABLE Subjects (
    SubjectID INT PRIMARY KEY IDENTITY(1,1),
    SubjectName NVARCHAR(100) NOT NULL
);

-- 2. Bảng Mức độ khó
CREATE TABLE DifficultyLevels (
    LevelID INT PRIMARY KEY IDENTITY(1,1),
    LevelName NVARCHAR(50) NOT NULL
);

-- 3. Bảng Dạng bài tập (Liên kết với Môn học)
CREATE TABLE ExerciseTypes (
    TypeID INT PRIMARY KEY IDENTITY(1,1),
    TypeName NVARCHAR(200) NOT NULL,
    SubjectID INT FOREIGN KEY REFERENCES Subjects(SubjectID)
);

-- 4. Bảng Bài tập chi tiết (Liên kết với Dạng bài và Mức độ)
CREATE TABLE Exercises (
    ExerciseID INT PRIMARY KEY IDENTITY(1,1),
    Title NVARCHAR(255) NOT NULL,
    Description NVARCHAR(MAX),
    Requirements NVARCHAR(MAX),
    GradingCriteria NVARCHAR(MAX),
    TypeID INT FOREIGN KEY REFERENCES ExerciseTypes(TypeID),
    LevelID INT FOREIGN KEY REFERENCES DifficultyLevels(LevelID),
    SubjectID INT FOREIGN KEY REFERENCES Subjects(SubjectID)
);', N'', N'SQLQuery1');

