import re
from pathlib import Path

base = Path(r"d:/3/PTUD/DB")
files = ["CTDL & GT.txt","KTLT.txt","LTHDT.txt","NMTL.txt","SQLQuery1.sql"]
subject_map = {
    'CTDL & GT.txt': 'CTDL_GT',
    'KTLT.txt': 'KTLT',
    'LTHDT.txt': 'LTHDT',
    'NMTL.txt': 'NMTL',
    'SQLQuery1.sql': 'SQLQuery1'
}

def normalize_diff(s):
    if not s: return None
    s = s.strip().lower()
    if 'dễ' in s or 'de' in s:
        return 'Dễ'
    if 'khó' in s or 'kho' in s:
        return 'Khó'
    if 'trung' in s:
        return 'Trung bình'
    return None

out_sql = base / 'updates_difficulty.sql'
lines = []
for fname in files:
    p = base / fname
    if not p.exists():
        continue
    text = p.read_text(encoding='utf-8')
    # normalize line endings
    text = text.replace('\r\n', '\n').replace('\r','\n')
    # split segments by 'Bài N' keeping matches
    parts = re.split(r'(?m)^(Bài\s*\d+[:]?.*)', text)
    # parts: ['', 'Bài 1: ...', 'body', 'Bài 2: ...', 'body', ...]
    items = []
    for i in range(1, len(parts), 2):
        header = parts[i].strip()
        body = parts[i+1] if i+1 < len(parts) else ''
        # extract bài number
        m = re.match(r'Bài\s*(\d+)', header)
        num = int(m.group(1)) if m else None
        # find difficulty
        dm = re.search(r'-\s*Độ khó\s*:\s*(.*)', body)
        diff = dm.group(1).strip() if dm else ''
        norm = normalize_diff(diff)
        items.append((num, norm))
    # generate UPDATE statements sequentially as previously generated (subject-001,002...)
    subj = subject_map.get(fname, Path(fname).stem)
    seq = 1
    for num, norm in items:
        code = f"{subj}-{seq:03d}"
        if norm:
            # produce update
            lines.append(f"UPDATE dbo.ptud_Exercises SET LevelID = (SELECT LevelID FROM dbo.ptud_DifficultyLevels WHERE LevelName=N'{norm}') WHERE ExerciseCode = N'{code}';")
        seq += 1

# write file with Unicode (UTF-16 LE) so sqlcmd reads N'...'
if lines:
    content = '-- Updates LevelID from parsed difficulty\n' + '\n'.join(lines) + '\n'
    out_sql.write_text(content, encoding='utf-16')
    print('Wrote', out_sql)
else:
    print('No difficulty lines found to update')
