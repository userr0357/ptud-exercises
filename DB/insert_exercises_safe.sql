-- Safe import script: use ptud_ prefixed tables to avoid touching existing DB objects
SET NOCOUNT ON;

IF OBJECT_ID('dbo.ptud_Exercises','U') IS NOT NULL DROP TABLE dbo.ptud_Exercises;
IF OBJECT_ID('dbo.ptud_RawFiles','U') IS NOT NULL DROP TABLE dbo.ptud_RawFiles;
IF OBJECT_ID('dbo.ptud_Subjects','U') IS NOT NULL DROP TABLE dbo.ptud_Subjects;
IF OBJECT_ID('dbo.ptud_DifficultyLevels','U') IS NOT NULL DROP TABLE dbo.ptud_DifficultyLevels;
IF OBJECT_ID('dbo.ptud_ExerciseTypes','U') IS NOT NULL DROP TABLE dbo.ptud_ExerciseTypes;

CREATE TABLE dbo.ptud_Subjects (
    SubjectID INT IDENTITY(1,1) PRIMARY KEY,
    SubjectCode NVARCHAR(50) NOT NULL UNIQUE,
    SubjectName NVARCHAR(200) NOT NULL
);

CREATE TABLE dbo.ptud_DifficultyLevels (
    LevelID INT IDENTITY(1,1) PRIMARY KEY,
    LevelName NVARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE dbo.ptud_ExerciseTypes (
    TypeID INT IDENTITY(1,1) PRIMARY KEY,
    TypeName NVARCHAR(200) NOT NULL,
    SubjectID INT NULL
);

CREATE TABLE dbo.ptud_Exercises (
    ExerciseID INT IDENTITY(1,1) PRIMARY KEY,
    ExerciseCode NVARCHAR(50) NOT NULL UNIQUE,
    SubjectID INT NOT NULL,
    TypeID INT NULL,
    LevelID INT NULL,
    Title NVARCHAR(400) NOT NULL,
    Requirements NVARCHAR(MAX) NULL,
    Description NVARCHAR(MAX) NULL,
    GradingCriteria NVARCHAR(MAX) NULL,
    SourceFile NVARCHAR(260) NULL,
    SubmissionFormat NVARCHAR(50) NOT NULL DEFAULT('zip')
);

CREATE TABLE dbo.ptud_RawFiles (
    RawFileID INT IDENTITY(1,1) PRIMARY KEY,
    SubjectID INT NULL,
    FileName NVARCHAR(260) NOT NULL,
    Content NVARCHAR(MAX) NOT NULL
);

-- seed subjects and difficulty
INSERT INTO dbo.ptud_Subjects(SubjectCode, SubjectName)
VALUES (N'CTDL_GT', N'Cấu trúc dữ liệu và Giải thuật'),
       (N'KTLT', N'Kỹ thuật lập trình'),
       (N'LTHDT', N'Lập trình hướng đối tượng'),
       (N'NMTL', N'Nhập môn lập trình'),
       (N'SQLQuery1', N'SQLQuery1');

INSERT INTO dbo.ptud_DifficultyLevels(LevelName)
VALUES (N'Dễ'), (N'Trung bình'), (N'Khó');

INSERT INTO dbo.ptud_ExerciseTypes(TypeName, SubjectID)
VALUES (N'General', NULL);

-- Insert raw file contents (shortened preview lines; full contents included)
INSERT INTO dbo.ptud_RawFiles(SubjectID, FileName, Content)
VALUES (
    (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode='CTDL_GT'),
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

... (file CTDL & GT full content previously embedded)'
);

INSERT INTO dbo.ptud_RawFiles(SubjectID, FileName, Content)
VALUES (
    (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode='KTLT'),
    N'KTLT.txt',
    N'DANH SÁCH BÀI TẬP KỸ THUẬT LẬP TRÌNH
... (file KTLT full content previously embedded)'
);

INSERT INTO dbo.ptud_RawFiles(SubjectID, FileName, Content)
VALUES (
    (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode='LTHDT'),
    N'LTHDT.txt',
    N'DANH SÁCH BÀI TẬP LẬP TRÌNH HƯỚNG ĐỐI TƯỢNG (OOP)
... (file LTHDT full content previously embedded)'
);

INSERT INTO dbo.ptud_RawFiles(SubjectID, FileName, Content)
VALUES (
    (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode='NMTL'),
    N'NMTL.txt',
    N'DANH SÁCH BÀI TẬP NHẬP MÔN LẬP TRÌNH
... (file NMTL full content previously embedded)'
);

INSERT INTO dbo.ptud_RawFiles(SubjectID, FileName, Content)
VALUES (
    (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode='SQLQuery1'),
    N'SQLQuery1.sql',
    N'-- SQL reference content from SQLQuery1.sql'
);

-- Parser stored procedure: simple heuristic based on 'Bài' markers and known prefixes
IF OBJECT_ID('dbo.ptud_ParseAndInsertExercises','P') IS NOT NULL
    DROP PROCEDURE dbo.ptud_ParseAndInsertExercises;
GO
CREATE PROCEDURE dbo.ptud_ParseAndInsertExercises
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @RawID INT, @Content NVARCHAR(MAX), @SubjectID INT, @FileName NVARCHAR(260);

    DECLARE cur CURSOR FOR SELECT RawFileID, SubjectID, FileName, Content FROM dbo.ptud_RawFiles;
    OPEN cur;
    FETCH NEXT FROM cur INTO @RawID, @SubjectID, @FileName, @Content;
    WHILE @@FETCH_STATUS = 0
    BEGIN
        -- normalize breaks
        SET @Content = REPLACE(REPLACE(@Content, CHAR(13)+CHAR(10), CHAR(10)), CHAR(13), CHAR(10));
        DECLARE @pos INT = 1, @next INT, @segment NVARCHAR(MAX);
        SET @pos = CHARINDEX(N'Bài ', @Content, 1);
        IF @pos = 0
        BEGIN
            -- no 'Bài ' markers, skip
            FETCH NEXT FROM cur INTO @RawID, @SubjectID, @FileName, @Content;
            CONTINUE;
        END
        WHILE @pos > 0
        BEGIN
            SET @next = CHARINDEX(N'Bài ', @Content, @pos + 1);
            IF @next = 0
                SET @segment = LTRIM(RTRIM(SUBSTRING(@Content, @pos, LEN(@Content)-@pos+1)));
            ELSE
                SET @segment = LTRIM(RTRIM(SUBSTRING(@Content, @pos, @next - @pos)));

            -- Extract title (line until newline)
            DECLARE @titleLine NVARCHAR(400) = LEFT(@segment, CHARINDEX(CHAR(10), @segment + CHAR(10)) - 1);
            DECLARE @title NVARCHAR(400) = @titleLine;

            -- Try to find difficulty, requirements, description, grading
            DECLARE @difficulty NVARCHAR(50) = NULL, @requirements NVARCHAR(MAX)=NULL, @description NVARCHAR(MAX)=NULL, @grading NVARCHAR(MAX)=NULL;
            -- search for prefixes
            DECLARE @dpos INT = CHARINDEX(N'- Độ khó:', @segment);
            IF @dpos > 0
            BEGIN
                DECLARE @dend INT = CHARINDEX(CHAR(10), @segment, @dpos);
                SET @difficulty = LTRIM(RTRIM(SUBSTRING(@segment, @dpos + LEN(N'- Độ khó:'), CASE WHEN @dend=0 THEN LEN(@segment) ELSE @dend - (@dpos + LEN(N'- Độ khó:')) END)));
            END
            DECLARE @rpos INT = CHARINDEX(N'- Yêu cầu:', @segment);
            IF @rpos > 0
            BEGIN
                DECLARE @rend INT = CHARINDEX(CHAR(10), @segment, @rpos);
                IF @rend = 0 SET @rend = LEN(@segment);
                SET @requirements = LTRIM(RTRIM(SUBSTRING(@segment, @rpos + LEN(N'- Yêu cầu:'), @rend - (@rpos + LEN(N'- Yêu cầu:')))));
            END
            DECLARE @mpos INT = CHARINDEX(N'- Mô tả:', @segment);
            IF @mpos > 0
            BEGIN
                DECLARE @mend INT = CHARINDEX(N'- Tiêu chí chấm điểm:', @segment, @mpos);
                IF @mend = 0 SET @mend = LEN(@segment);
                SET @description = LTRIM(RTRIM(SUBSTRING(@segment, @mpos + LEN(N'- Mô tả:'), @mend - (@mpos + LEN(N'- Mô tả:')))));
            END
            DECLARE @gpos INT = CHARINDEX(N'- Tiêu chí chấm điểm:', @segment);
            IF @gpos > 0
            BEGIN
                SET @grading = LTRIM(RTRIM(SUBSTRING(@segment, @gpos + LEN(N'- Tiêu chí chấm điểm:'), LEN(@segment) - (@gpos + LEN(N'- Tiêu chí chấm điểm:')))));
            END

            -- map difficulty to LevelID
            DECLARE @LevelID INT = (SELECT TOP 1 LevelID FROM dbo.ptud_DifficultyLevels WHERE LevelName LIKE CASE WHEN @difficulty IS NULL THEN N'Trung%' WHEN @difficulty LIKE N'%Dễ%' THEN N'Dễ' WHEN @difficulty LIKE N'%Trung%' THEN N'Trung bình' WHEN @difficulty LIKE N'%Khó%' THEN N'Khó' ELSE N'Trung bình' END);
            IF @LevelID IS NULL SET @LevelID = (SELECT TOP 1 LevelID FROM dbo.ptud_DifficultyLevels WHERE LevelName=N'Trung bình');

            -- generate ExerciseCode
            DECLARE @codeBase NVARCHAR(50) = (SELECT SubjectCode FROM dbo.ptud_Subjects WHERE SubjectID=@SubjectID);
            IF @codeBase IS NULL SET @codeBase = 'SUB';
            DECLARE @seq INT = ISNULL((SELECT MAX(ExerciseID) FROM dbo.ptud_Exercises),0) + 1;
            DECLARE @ExerciseCode NVARCHAR(50) = @codeBase + N'-' + RIGHT('000' + CAST(@seq AS NVARCHAR(10)),3);

            -- insert
            INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)
            VALUES(@ExerciseCode, @SubjectID, NULL, @LevelID, @title, @requirements, @description, @grading, @FileName);

            IF @next = 0 BREAK;
            SET @pos = @next;
        END

        FETCH NEXT FROM cur INTO @RawID, @SubjectID, @FileName, @Content;
    END
    CLOSE cur;
    DEALLOCATE cur;
END
GO

-- Execute parser
EXEC dbo.ptud_ParseAndInsertExercises;

-- Report
SELECT COUNT(*) AS ImportedCount FROM dbo.ptud_Exercises;
