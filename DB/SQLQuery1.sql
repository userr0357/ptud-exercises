-- 1. Bảng Môn học
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
);