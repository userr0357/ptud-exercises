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

# candidate decodings to try
encodings = ['utf-8', 'utf-8-sig', 'utf-16', 'cp1258', 'cp1252', 'latin-1']

viet_re = re.compile(r'[ăâđêôơưáàạảãắằặẳẵấầậẩẫéèẹẻẽíìịỉĩóòọỏõốồộổỗắặẳẵúùụủũýỳỹỷỵ]', re.IGNORECASE)

out_sql = base / 'apply_clean_content_v2.sql'
lines = []

for fname in files:
    p = base / fname
    if not p.exists():
        continue
    data = p.read_bytes()
    best = None
    best_score = -1
    best_text = None
    for enc in encodings:
        try:
            text = data.decode(enc)
        except Exception:
            continue
        # score by count of Vietnamese letters and presence of 'Bài' markers
        score = len(viet_re.findall(text)) + (5 if 'Bài' in text or 'Bài' in text.encode(enc, errors='ignore').decode(enc, errors='ignore') else 0)
        if score > best_score:
            best_score = score
            best = enc
            best_text = text
    if best_text is None:
        # fallback to latin-1
        best_text = data.decode('latin-1', errors='ignore')
        best = 'latin-1'
    # normalize newlines
    text = best_text.replace('\r\n','\n').replace('\r','\n')
    parts = re.split(r'(?m)^(Bài\s*\d+[:]?.*)', text)
    seq = 1
    for i in range(1, len(parts), 2):
        header = parts[i].strip()
        body = parts[i+1] if i+1 < len(parts) else ''
        title = header
        req_m = re.search(r'-\s*Yêu cầu\s*[:\-]?\s*(.*?)\n(?=-|$)', body, flags=re.S)
        desc_m = re.search(r'-\s*Mô tả\s*[:\-]?\s*(.*?)\n(?=-|$)', body, flags=re.S)
        crit_m = re.search(r'-\s*Tiêu chí chấm điểm\s*[:\-]?\s*(.*)', body, flags=re.S)
        req = req_m.group(1).strip() if req_m else ''
        desc = desc_m.group(1).strip() if desc_m else ''
        crit = crit_m.group(1).strip() if crit_m else ''
        code = f"{subject_map.get(fname, Path(fname).stem)}-{seq:03d}"
        def q(s):
            return s.replace("'", "''")
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
            lines.append(f"UPDATE dbo.ptud_Exercises SET {', '.join(parts_to_set)} WHERE ExerciseCode = N'{code}'; -- src_enc={best}")
        seq += 1

if lines:
    content = '-- Overwrite text columns from source files using best-guess decodings\n' + '\n'.join(lines) + '\n'
    out_sql.write_text(content, encoding='utf-16')
    print('Wrote', out_sql)
else:
    print('No updates generated')
