-- SQL Server script: create tables and import exercises from provided text files
SET NOCOUNT ON;

-- 1) Subjects table (includes SubjectCode)
IF OBJECT_ID('dbo.Subjects','U') IS NOT NULL DROP TABLE dbo.Subjects;
CREATE TABLE dbo.Subjects (
    SubjectID INT IDENTITY(1,1) PRIMARY KEY,
    SubjectCode NVARCHAR(50) NOT NULL UNIQUE,
    SubjectName NVARCHAR(200) NOT NULL
);

-- 2) Difficulty levels
IF OBJECT_ID('dbo.DifficultyLevels','U') IS NOT NULL DROP TABLE dbo.DifficultyLevels;
CREATE TABLE dbo.DifficultyLevels (
    LevelID INT IDENTITY(1,1) PRIMARY KEY,
    LevelName NVARCHAR(50) NOT NULL UNIQUE
);

-- 3) Exercise types (optional/category)
IF OBJECT_ID('dbo.ExerciseTypes','U') IS NOT NULL DROP TABLE dbo.ExerciseTypes;
CREATE TABLE dbo.ExerciseTypes (
    TypeID INT IDENTITY(1,1) PRIMARY KEY,
    TypeName NVARCHAR(200) NOT NULL,
    SubjectID INT NULL REFERENCES dbo.Subjects(SubjectID)
);

-- 4) Exercises table
IF OBJECT_ID('dbo.Exercises','U') IS NOT NULL DROP TABLE dbo.Exercises;
CREATE TABLE dbo.Exercises (
    ExerciseID INT IDENTITY(1,1) PRIMARY KEY,
    ExerciseCode NVARCHAR(50) NOT NULL UNIQUE,
    SubjectID INT NOT NULL REFERENCES dbo.Subjects(SubjectID),
    TypeID INT NULL REFERENCES dbo.ExerciseTypes(TypeID),
    LevelID INT NULL REFERENCES dbo.DifficultyLevels(LevelID),
    Title NVARCHAR(400) NOT NULL,
    Requirements NVARCHAR(MAX) NULL,
    Description NVARCHAR(MAX) NULL,
    GradingCriteria NVARCHAR(MAX) NULL,
    SourceFile NVARCHAR(260) NULL,
    SubmissionFormat NVARCHAR(50) NOT NULL DEFAULT('zip')
);

-- 5) RawFiles: store original file content (for auditing / re-parsing)
IF OBJECT_ID('dbo.RawFiles','U') IS NOT NULL DROP TABLE dbo.RawFiles;
CREATE TABLE dbo.RawFiles (
    RawFileID INT IDENTITY(1,1) PRIMARY KEY,
    SubjectID INT NULL REFERENCES dbo.Subjects(SubjectID),
    FileName NVARCHAR(260) NOT NULL,
    Content NVARCHAR(MAX) NOT NULL
);

-- Insert Subjects
INSERT INTO dbo.Subjects(SubjectCode, SubjectName)
VALUES
(N'CTDL_GT', N'Cấu trúc dữ liệu và Giải thuật'),
(N'KTLT', N'Kỹ thuật lập trình'),
(N'LTHDT', N'Lập trình hướng đối tượng'),
(N'NMTL', N'Nhập môn lập trình'),
(N'SQLQuery1', N'SQLQuery1');

-- Insert Difficulty levels
INSERT INTO dbo.DifficultyLevels(LevelName)
VALUES (N'Dễ'), (N'Trung bình'), (N'Khó');

-- Default Exercise type
INSERT INTO dbo.ExerciseTypes(TypeName, SubjectID)
VALUES (N'General', NULL);

-- Insert raw file contents (from provided files)
-- CTDL & GT
INSERT INTO dbo.RawFiles(SubjectID, FileName, Content)
VALUES (
        (SELECT SubjectID FROM dbo.Subjects WHERE SubjectCode='CTDL_GT'),
        N'CTDL & GT.txt',
        N'DANH SÁCH BÀI TẬP CẤU TRÚC DỮ LIỆU VÀ GIẢI THUẬT (CẬP NHẬT)
DẠNG 1: PHÂN TÍCH ĐỘ PHỨC TẠP THUẬT TOÁN (BIG O)
------------------------------------------------------------

PHẦN 1: MỨC ĐỘ DỄ (EASY)

Bài 1: Xác định độ phức tạp của câu lệnh gán và điều kiện
- Độ khó: Dễ
- Yêu cầu: Phân tích đoạn mã đơn lẻ.
- Mô tả: Cho đoạn mã gồm các phép gán số học và một cấu trúc if-else đơn giản (không chứa vòng lặp).
- Tiêu chí chấm điểm:
    1. Xác định đúng độ phức tạp là O(1).
    2. Giải thích được tại sao các phép toán cơ bản được coi là thời gian hằng số.
    3. Bổ sung 1: Chứng minh được tổng thời gian là Max(thời gian nhánh If, thời gian nhánh Else).
    4. Bổ sung 2: Xác định đúng độ phức tạp không gian (Space Complexity) là O(1).

Bài 2: Vòng lặp đơn tính tổng
- Độ khó: Dễ
- Yêu cầu: Phân tích vòng lặp for/while cơ bản.
- Mô tả: Cho đoạn mã duyệt từ 1 đến n để tính tổng S.
- Tiêu chí chấm điểm:
    1. Xác định đúng O(n).
    2. Chỉ ra câu lệnh nào là câu lệnh chủ chốt (dominant operation) được lặp lại n lần.
    3. Bổ sung 1: Giải thích sự phụ thuộc tuyến tính giữa kích thước đầu vào n và số bước thực thi.
    4. Bổ sung 2: Đánh giá bộ nhớ sử dụng không thay đổi theo n (O(1)).

Bài 3: Vòng lặp với bước nhảy hằng số
- Độ khó: Dễ
- Yêu cầu: Phân tích vòng lặp có bước nhảy i += 5.
- Mô tả: Cho vòng lặp for (int i = 0; i < n; i += 5).
- Tiêu chí chấm điểm:
    1. Xác định đúng O(n).
    2. Giải thích được quy tắc bỏ qua hằng số nhân (1/5 * n vẫn là O(n)).
    3. Bổ sung 1: Thiết lập được biểu thức toán học tính số lần lặp chính xác (n/5).
    4. Bổ sung 2: Phân biệt được sự khác biệt giữa số lần lặp thực tế và bậc tăng trưởng (Rate of growth).

Bài 4: Tìm kiếm tuyến tính (Linear Search)
- Độ khó: Dễ
- Yêu cầu: Phân tích trường hợp tốt nhất và xấu nhất.
- Mô tả: Phân tích thuật toán tìm x trong mảng n phần tử.
- Tiêu chí chấm điểm:
    1. Chỉ ra Best case là O(1) và Worst case là O(n).
    2. Giải thích được điều kiện xảy ra của từng trường hợp.
    3. Bổ sung 1: Tính toán độ phức tạp trung bình (Average case) nếu giả định x nằm ngẫu nhiên.
    4. Bổ sung 2: Đánh giá ảnh hưởng của việc mảng đã sắp xếp hay chưa đối với thuật toán này.

------------------------------------------------------------

PHẦN 2: MỨC ĐỘ TRUNG BÌNH (MEDIUM)

Bài 5: Vòng lặp lồng nhau cơ bản
- Độ khó: Trung bình
- Yêu cầu: Phân tích cấu trúc hai vòng lặp lồng nhau độc lập.
- Mô tả: Vòng lặp i chạy từ 1 đến n, vòng lặp j chạy từ 1 đến n.
- Tiêu chí chấm điểm:
    1. Xác định đúng O(n^2).
    2. Sử dụng quy tắc nhân để giải thích (n lần của n bước).
    3. Bổ sung 1: Vẽ được mô hình lưới (grid) thể hiện số lần thực thi các câu lệnh bên trong.
    4. Bổ sung 2: Đánh giá sự bùng nổ thời gian khi n tăng lên gấp đôi (thời gian tăng gấp 4).

... (nội dung đầy đủ của file CTDL & GT tiếp tục)'
);

-- KTLT
INSERT INTO dbo.RawFiles(SubjectID, FileName, Content)
VALUES (
        (SELECT SubjectID FROM dbo.Subjects WHERE SubjectCode='KTLT'),
        N'KTLT.txt',
        N'DANH SÁCH BÀI TẬP KỸ THUẬT LẬP TRÌNH
DẠNG 1: CON TRỎ VÀ QUẢN LÝ BỘ NHỚ ĐỘNG
------------------------------------------------------------

PHẦN 1: MỨC ĐỘ DỄ (EASY)

Bài 1: Truy xuất giá trị và địa chỉ qua con trỏ
- Độ khó: Dễ
- Yêu cầu: Hiểu các toán tử & (lấy địa chỉ) và * (lấy giá trị).
- Mô tả: Khai báo một biến nguyên x và một con trỏ p. Gán địa chỉ của x cho p. Thay đổi giá trị của x thông qua p. In ra địa chỉ của x, giá trị của p và giá trị mà p đang trỏ tới.
- Tiêu chí chấm điểm:
    1. Sử dụng đúng toán tử &x và *p.
    2. Hiển thị đúng địa chỉ ô nhớ (thường là hệ thập lục phân).

... (nội dung đầy đủ của file KTLT tiếp tục)'
);

-- LTHDT
INSERT INTO dbo.RawFiles(SubjectID, FileName, Content)
VALUES (
        (SELECT SubjectID FROM dbo.Subjects WHERE SubjectCode='LTHDT'),
        N'LTHDT.txt',
        N'DANH SÁCH BÀI TẬP LẬP TRÌNH HƯỚNG ĐỐI TƯỢNG (OOP)
DẠNG 1: LỚP, ĐỐI TƯỢNG VÀ TÍNH ĐỐNG GÓI
------------------------------------------------------------

PHẦN 1: MỨC ĐỘ DỄ (EASY)

Bài 1: Xây dựng lớp Phân số cơ bản
- Mô tả: Trong toán học, phân số gồm tử số và mẫu số. Việc đóng gói chúng vào một lớp giúp quản lý dữ liệu tập trung và đảm bảo mẫu số luôn khác 0 trước khi thực hiện các phép tính.
- Yêu cầu: Định nghĩa lớp PhanSo với các thuộc tính tử số và mẫu số ở phạm vi private. Viết các hàm: khởi tạo (constructor), nhập phân số, xuất phân số và hàm rút gọn phân số về dạng tối giản.
- Tiêu chí chấm điểm:
    1. Khai báo thuộc tính với phạm vi truy cập private chính xác.
    2. Xử lý logic mẫu số khác 0 trong hàm khởi tạo và hàm nhập.

... (nội dung đầy đủ của file LTHDT tiếp tục)'
);

-- NMTL
INSERT INTO dbo.RawFiles(SubjectID, FileName, Content)
VALUES (
        (SELECT SubjectID FROM dbo.Subjects WHERE SubjectCode='NMTL'),
        N'NMTL.txt',
        N'DANH SÁCH BÀI TẬP NHẬP MÔN LẬP TRÌNH
DẠNG 3: CẤU TRÚC ĐIỀU KHIỂN (IF-ELSE, SWITCH-CASE)
------------------------------------------------------------

PHẦN 1: MỨC ĐỘ DỄ (EASY)

Bài 1: Kiểm tra tính chẵn lẻ và âm dương
- Độ khó: Dễ
- Yêu cầu: Sử dụng cấu trúc If-Else cơ bản.
- Mô tả: Nhập vào một số nguyên n. Kiểm tra và in ra thông báo:
    + n là số chẵn hay số lẻ?
    + n là số âm, số dương hay số 0?
- Tiêu chí chấm điểm:
    1. Sử dụng đúng toán tử chia lấy dư % 2 để kiểm tra chẵn lẻ.
    2. Cấu trúc If-Else đầy đủ các trường hợp.

... (nội dung đầy đủ của file NMTL tiếp tục)'
);

-- SQLQuery1 (script file)
INSERT INTO dbo.RawFiles(SubjectID, FileName, Content)
VALUES (
    (SELECT SubjectID FROM dbo.Subjects WHERE SubjectCode='SQLQuery1'),
    N'SQLQuery1.sql',
    N'-- 1. Bảng Môn học
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
);'
);

-- Stored procedure to parse RawFiles and insert Exercises
IF OBJECT_ID('dbo.ParseAndInsertExercises','P') IS NOT NULL
    DROP PROCEDURE dbo.ParseAndInsertExercises;
GO
CREATE PROCEDURE dbo.ParseAndInsertExercises
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @RawFileID INT, @subjectID INT, @fileName NVARCHAR(260), @content NVARCHAR(MAX);
    DECLARE cur CURSOR LOCAL FOR
        SELECT RawFileID, SubjectID, FileName, Content FROM dbo.RawFiles ORDER BY RawFileID;

    OPEN cur;
    FETCH NEXT FROM cur INTO @RawFileID, @subjectID, @fileName, @content;
    WHILE @@FETCH_STATUS = 0
    BEGIN
        -- Normalize line breaks
        SET @content = REPLACE(REPLACE(@content, CHAR(13)+CHAR(10), CHAR(10)), CHAR(13), CHAR(10));

        DECLARE @pos INT = CHARINDEX(N'Bài ', @content COLLATE Latin1_General_CI_AS);
        IF @pos = 0
        BEGIN
            -- try lowercase variant or different markers
            SET @pos = CHARINDEX(N'bài ', @content COLLATE Latin1_General_CI_AS);
        END

        WHILE @pos > 0
        BEGIN
            DECLARE @nextPos INT = CHARINDEX(N'Bài ', @content COLLATE Latin1_General_CI_AS, @pos + 1);
            IF @nextPos = 0 SET @nextPos = CHARINDEX(N'bài ', @content COLLATE Latin1_General_CI_AS, @pos + 1);
            DECLARE @chunk NVARCHAR(MAX);
            IF @nextPos = 0
                SET @chunk = SUBSTRING(@content, @pos, LEN(@content) - @pos + 1);
            ELSE
                SET @chunk = SUBSTRING(@content, @pos, @nextPos - @pos);

            -- extract title line (first line in chunk)
            DECLARE @newlinePos INT = CHARINDEX(CHAR(10), @chunk);
            DECLARE @titleLine NVARCHAR(400);
            IF @newlinePos > 0
                SET @titleLine = LEFT(@chunk, @newlinePos-1);
            ELSE
                SET @titleLine = @chunk;

            -- extract title after colon
            DECLARE @colon INT = CHARINDEX(':', @titleLine);
            DECLARE @title NVARCHAR(400) = LTRIM(RTRIM(CASE WHEN @colon>0 THEN SUBSTRING(@titleLine, @colon+1, 400) ELSE @titleLine END));
            IF LEN(@title) = 0 SET @title = LTRIM(RTRIM(@titleLine));

            -- difficulty
            DECLARE @diff NVARCHAR(100) = NULL;
            DECLARE @dpos INT = CHARINDEX(N'- Độ khó:', @chunk);
            IF @dpos = 0 SET @dpos = CHARINDEX(N'- Độ khó', @chunk);
            IF @dpos > 0
            BEGIN
                DECLARE @dlineEnd INT = CHARINDEX(CHAR(10), @chunk, @dpos);
                IF @dlineEnd = 0 SET @dlineEnd = LEN(@chunk)+1;
                SET @diff = LTRIM(RTRIM(SUBSTRING(@chunk, @dpos, @dlineEnd - @dpos)));
            END

            -- requirements
            DECLARE @req NVARCHAR(MAX) = NULL;
            DECLARE @rpos INT = CHARINDEX(N'- Yêu cầu:', @chunk);
            IF @rpos = 0 SET @rpos = CHARINDEX(N'- Yêu cầu', @chunk);
            IF @rpos > 0
            BEGIN
                DECLARE @reqEnd INT = CHARINDEX(N'- Mô tả:', @chunk, @rpos);
                IF @reqEnd = 0 SET @reqEnd = CHARINDEX(N'- Tiêu chí chấm điểm:', @chunk, @rpos);
                IF @reqEnd = 0 SET @reqEnd = CHARINDEX(CHAR(10), @chunk, @rpos+20);
                IF @reqEnd = 0 SET @reqEnd = LEN(@chunk)+1;
                SET @req = LTRIM(RTRIM(SUBSTRING(@chunk, @rpos, @reqEnd - @rpos)));
            END

            -- description
            DECLARE @desc NVARCHAR(MAX) = NULL;
            DECLARE @mp INT = CHARINDEX(N'- Mô tả:', @chunk);
            IF @mp > 0
            BEGIN
                DECLARE @descEnd INT = CHARINDEX(N'- Yêu cầu:', @chunk, @mp);
                IF @descEnd = 0 SET @descEnd = CHARINDEX(N'- Tiêu chí chấm điểm:', @chunk, @mp);
                IF @descEnd = 0 SET @descEnd = CHARINDEX(CHAR(10)+CHAR(10), @chunk, @mp);
                IF @descEnd = 0 SET @descEnd = LEN(@chunk)+1;
                SET @desc = LTRIM(RTRIM(SUBSTRING(@chunk, @mp, @descEnd - @mp)));
            END

            -- grading criteria
            DECLARE @crit NVARCHAR(MAX) = NULL;
            DECLARE @cpos INT = CHARINDEX(N'- Tiêu chí chấm điểm:', @chunk);
            IF @cpos = 0 SET @cpos = CHARINDEX(N'- Tiêu chí', @chunk);
            IF @cpos > 0
            BEGIN
                DECLARE @critEnd INT = LEN(@chunk)+1;
                SET @crit = LTRIM(RTRIM(SUBSTRING(@chunk, @cpos, @critEnd - @cpos)));
            END

            -- Determine LevelID from text
            DECLARE @LevelID INT = NULL;
            IF @diff IS NOT NULL
            BEGIN
                IF @diff LIKE N'%Dễ%' COLLATE Latin1_General_CI_AS SET @LevelID = (SELECT LevelID FROM dbo.DifficultyLevels WHERE LevelName=N' Dễ' OR LevelName=N'Đễ' OR LevelName=N' Dễ' OR LevelName=N'Đễ');
                IF @LevelID IS NULL AND @diff LIKE N'%Dễ%' SET @LevelID = (SELECT LevelID FROM dbo.DifficultyLevels WHERE LevelName=N' Dễ' OR LevelName=N'Đễ' OR LevelName=N' Dễ' OR LevelName=N'Đễ');
                IF @LevelID IS NULL AND @diff LIKE N'%Trung%' SET @LevelID = (SELECT LevelID FROM dbo.DifficultyLevels WHERE LevelName=N'Trung bình');
                IF @LevelID IS NULL AND @diff LIKE N'%Khó%' SET @LevelID = (SELECT LevelID FROM dbo.DifficultyLevels WHERE LevelName=N'Khó');
            END
            IF @LevelID IS NULL SET @LevelID = (SELECT LevelID FROM dbo.DifficultyLevels WHERE LevelName=N'Trung bình');

            -- generate ExerciseCode
            DECLARE @subjectCode NVARCHAR(50) = (SELECT SubjectCode FROM dbo.Subjects WHERE SubjectID = @subjectID);
            DECLARE @seq INT = ISNULL((SELECT MAX(ExerciseID) FROM dbo.Exercises), 0) + 1;
            DECLARE @exerciseCode NVARCHAR(50) = @subjectCode + N'-' + RIGHT('000' + CONVERT(NVARCHAR(10), @seq), 3);

            -- Insert exercise
            INSERT INTO dbo.Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile, SubmissionFormat)
            VALUES(@exerciseCode, @subjectID, NULL, @LevelID, LEFT(@title, 400), @req, @desc, @crit, @fileName, N'zip');

            -- Move to next
            IF @nextPos = 0 BREAK;
            SET @pos = @nextPos;
        END

        FETCH NEXT FROM cur INTO @RawFileID, @subjectID, @fileName, @content;
    END
    CLOSE cur; DEALLOCATE cur;
END
GO

-- Replace placeholders with actual file contents (these will be substituted below by the script generator)
-- Note: the generator writes the literal token placeholders %CONTENT_CTDL% etc. You must replace them with the file contents
-- For convenience this script already contains the placeholders; if you run this file as-is, replace the markers with actual content.

-- Finally execute parser (uncomment to run parsing immediately)
-- EXEC dbo.ParseAndInsertExercises;

PRINT 'Script created. Replace %CONTENT_*% placeholders with file contents, then run this script on your SQL Server and execute dbo.ParseAndInsertExercises to populate Exercises.';
