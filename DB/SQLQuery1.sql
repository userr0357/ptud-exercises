-- 1. Bảng Môn học
CREATE TABLE MONHOC (
    SubjectID INT PRIMARY KEY IDENTITY(1,1),
    SubjectName NVARCHAR(100) NOT NULL
);

-- 2. Bảng Mức độ khó
CREATE TABLE DOKHO (
    LevelID INT PRIMARY KEY IDENTITY(1,1),
    LevelName NVARCHAR(50) NOT NULL
);

-- 3. Bảng Dạng bài tập (Liên kết với Môn học)
CREATE TABLE DANGBAI (
    TypeID INT PRIMARY KEY IDENTITY(1,1),
    TypeName NVARCHAR(200) NOT NULL,
    SubjectID INT FOREIGN KEY REFERENCES MONHOC(SubjectID)
);

-- 4. Bảng Bài tập chi tiết (Liên kết với Dạng bài và Mức độ)
CREATE TABLE BAITAP (
    ExerciseID INT PRIMARY KEY IDENTITY(1,1),
    Title NVARCHAR(255) NOT NULL,
    Description NVARCHAR(MAX),
    Requirements NVARCHAR(MAX),
    GradingCriteria NVARCHAR(MAX),
    TypeID INT FOREIGN KEY REFERENCES DANGBAI(TypeID),
    LevelID INT FOREIGN KEY REFERENCES DOKHO(LevelID),
    SubjectID INT FOREIGN KEY REFERENCES MONHOC(SubjectID)
);