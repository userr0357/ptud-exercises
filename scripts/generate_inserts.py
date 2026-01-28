import re
from pathlib import Path

base = Path(r"d:/3/PTUD/DB")
files = ["CTDL & GT.txt","KTLT.txt","LTHDT.txt","NMTL.txt","SQLQuery1.sql"]
output = base / 'exercises_inserts.sql'

def normalize(s):
    return s.replace("'", "''").replace('\r\n','\n').replace('\r','\n')

def parse_content(text, subject_code):
    # split on lines starting with 'Bài ' (Vietnamese)
    parts = re.split(r'(?m)^(Bài\s+\d+[:]?.*)', text)
    # re.split keeps separators; combine pairs
    items = []
    for i in range(1, len(parts), 2):
        header = parts[i].strip()
        body = parts[i+1] if i+1 < len(parts) else ''
        title = header
        # extract difficulty
        m = re.search(r'-\s*Độ khó\s*:\s*(.*)', body)
        difficulty = m.group(1).strip() if m else ''
        # requirements
        m = re.search(r'-\s*Yêu cầu\s*:\s*(.*?)(?:\n-|\n-\s*Mô tả:|\n-\s*Tiêu chí chấm điểm:|$)', body, re.S)
        requirements = m.group(1).strip() if m else ''
        # description
        m = re.search(r'-\s*Mô tả\s*:\s*(.*?)(?:\n-\s*Tiêu chí chấm điểm:|$)', body, re.S)
        description = m.group(1).strip() if m else ''
        # grading
        m = re.search(r'-\s*Tiêu chí chấm điểm\s*:\s*(.*)', body, re.S)
        grading = m.group(1).strip() if m else ''
        items.append({
            'title': title,
            'difficulty': difficulty,
            'requirements': requirements,
            'description': description,
            'grading': grading,
            'subject_code': subject_code
        })
    return items

all_items = []
for f in files:
    p = base / f
    if not p.exists():
        continue
    text = p.read_text(encoding='utf-8')
    # guess subject code from filename
    code = 'SQLQuery1' if f.lower().endswith('.sql') else ('CTDL_GT' if 'CTDL' in f else ('KTLT' if 'KTLT' in f else ('LTHDT' if 'LTHDT' in f else ('NMTL' if 'NMTL' in f else 'GEN'))))
    items = parse_content(text, code)
    # if no items found, try to create one lump
    if not items:
        items = [{'title': p.stem, 'difficulty':'','requirements':'','description':text,'grading':'','subject_code':code}]
    all_items.extend(items)

# write SQL
with output.open('w', encoding='utf-8') as out:
    out.write('-- Generated INSERTs for Exercises\n')
    out.write('SET NOCOUNT ON;\n\n')
    out.write('-- Ensure target table exists: dbo.ptud_Exercises\n')
    out.write("IF OBJECT_ID('dbo.ptud_Exercises','U') IS NULL\n")
    out.write("RAISERROR('Target table dbo.ptud_Exercises not found. Run insert_exercises_safe.sql first.',16,1);\n\n")
    seq = 1
    for it in all_items:
        code = f"{it['subject_code']}-{seq:03d}"
        title = normalize(it['title'])
        req = normalize(it['requirements'])
        desc = normalize(it['description'])
        grading = normalize(it['grading'])
        subj = it['subject_code']
        out.write("-- %s\n" % title[:120])
        out.write("INSERT INTO dbo.ptud_Exercises(ExerciseCode, SubjectID, TypeID, LevelID, Title, Requirements, Description, GradingCriteria, SourceFile)\n")
        out.write("VALUES (N'%s', (SELECT SubjectID FROM dbo.ptud_Subjects WHERE SubjectCode=N'%s'), NULL, NULL, N'%s', N'%s', N'%s', N'%s', N'%s');\n\n" % (code, subj, title, req, desc, grading, subj))
        seq += 1

print('Wrote', output)
