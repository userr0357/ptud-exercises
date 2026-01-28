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

def q(s):
    if s is None:
        return ''
    return s.replace("'", "''")

out_sql = base / 'apply_clean_content.sql'
lines = []
for fname in files:
    p = base / fname
    if not p.exists():
        continue
    text = p.read_text(encoding='utf-8')
    text = text.replace('\r\n','\n').replace('\r','\n')
    parts = re.split(r'(?m)^(Bài\s*\d+[:]?.*)', text)
    seq = 1
    for i in range(1, len(parts), 2):
        header = parts[i].strip()
        body = parts[i+1] if i+1 < len(parts) else ''
        # title: header (e.g., 'Bài 1: ...')
        title = header
        # extract fields
        req_m = re.search(r'-\s*Yêu cầu\s*[:\-]?\s*(.*?)\n(?=-|$)', body, flags=re.S)
        desc_m = re.search(r'-\s*Mô tả\s*[:\-]?\s*(.*?)\n(?=-|$)', body, flags=re.S)
        crit_m = re.search(r'-\s*Tiêu chí chấm điểm\s*[:\-]?\s*(.*)', body, flags=re.S)
        req = req_m.group(1).strip() if req_m else ''
        desc = desc_m.group(1).strip() if desc_m else ''
        crit = crit_m.group(1).strip() if crit_m else ''
        code = f"{subject_map.get(fname, Path(fname).stem)}-{seq:03d}"
        if title or req or desc or crit:
            parts_to_set = []
            if title:
                parts_to_set.append(f"Title = N'{q(title)}'")
            if req:
                parts_to_set.append(f"Requirements = N'{q(req)}'")
            if desc:
                parts_to_set.append(f"Description = N'{q(desc)}'")
            if crit:
                parts_to_set.append(f"GradingCriteria = N'{q(crit)}'")
            if parts_to_set:
                stmt = f"UPDATE dbo.ptud_Exercises SET {', '.join(parts_to_set)} WHERE ExerciseCode = N'{code}';"
                lines.append(stmt)
        seq += 1

if lines:
    content = '-- Overwrite corrupted text columns with clean parsed content from source files\n' + '\n'.join(lines) + '\n'
    out_sql.write_text(content, encoding='utf-16')
    print('Wrote', out_sql)
else:
    print('No updates generated')
