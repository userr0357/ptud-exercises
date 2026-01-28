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

def normalize_diff_id(s):
    if not s: return None
    s = s.strip().lower()
    if 'dễ' in s or 'de' in s:
        return 1
    if 'khó' in s or 'kho' in s:
        return 3
    if 'trung' in s:
        return 2
    return None

out_sql = base / 'updates_difficulty_byid.sql'
lines = []
for fname in files:
    p = base / fname
    if not p.exists():
        continue
    text = p.read_text(encoding='utf-8')
    text = text.replace('\r\n','\n').replace('\r','\n')
    parts = re.split(r'(?m)^(Bài\s*\d+[:]?.*)', text)
    items = []
    for i in range(1, len(parts), 2):
        header = parts[i].strip()
        body = parts[i+1] if i+1 < len(parts) else ''
        m = re.match(r'Bài\s*(\d+)', header)
        num = int(m.group(1)) if m else None
        dm = re.search(r'-\s*Độ khó\s*[:\-]?\s*(.*)', body, flags=re.IGNORECASE)
        diff = dm.group(1).strip() if dm else ''
        did = normalize_diff_id(diff)
        items.append((num, did))
    subj = subject_map.get(fname, Path(fname).stem)
    seq = 1
    for num, did in items:
        code = f"{subj}-{seq:03d}"
        if did:
            lines.append(f"UPDATE dbo.ptud_Exercises SET LevelID = {did} WHERE ExerciseCode = N'{code}';")
        seq += 1

if lines:
    content = '-- Updates LevelID by numeric id (1=Dễ,2=Trung bình,3=Khó)\n' + '\n'.join(lines) + '\n'
    out_sql.write_text(content, encoding='utf-16')
    print('Wrote', out_sql)
else:
    print('No difficulty lines found to update')
