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

out_sql = base / 'updates_difficulty_byid2.sql'
lines = []
for fname in files:
    p = base / fname
    if not p.exists():
        continue
    text = p.read_text(encoding='utf-8')
    text = text.replace('\r\n','\n').replace('\r','\n')
    lines_all = text.split('\n')
    subj = subject_map.get(fname, Path(fname).stem)
    seq = 0
    current_section_level = None
    buffer = []
    in_ex = False
    for line in lines_all:
        # detect section headings
        msec = re.search(r'MỨC ĐỘ\s*(DỄ|TRUNG BÌNH|KHÓ)', line, flags=re.IGNORECASE)
        if msec:
            lbl = msec.group(1).lower()
            if 'dễ' in lbl or 'de' in lbl:
                current_section_level = 1
            elif 'trung' in lbl:
                current_section_level = 2
            elif 'khó' in lbl or 'kho' in lbl:
                current_section_level = 3
            continue
        # detect bài header
        m = re.match(r'Bài\s*(\d+)', line, flags=re.IGNORECASE)
        if m:
            # finish previous exercise
            if in_ex:
                # parse buffer for explicit difficulty
                body = '\n'.join(buffer)
                dm = re.search(r'-\s*Độ khó\s*[:\-]?\s*(.*)', body, flags=re.IGNORECASE)
                diff = dm.group(1).strip() if dm else ''
                did = normalize_diff_id(diff) if diff else None
                if not did:
                    did = current_section_level
                if did:
                    code = f"{subj}-{seq:03d}"
                    lines.append(f"UPDATE dbo.ptud_Exercises SET LevelID = {did} WHERE ExerciseCode = N'{code}';")
                buffer = []
            # start new exercise
            seq += 1
            in_ex = True
            continue
        if in_ex:
            buffer.append(line)
    # finalize last buffered exercise
    if in_ex and buffer:
        body = '\n'.join(buffer)
        dm = re.search(r'-\s*Độ khó\s*[:\-]?\s*(.*)', body, flags=re.IGNORECASE)
        diff = dm.group(1).strip() if dm else ''
        did = normalize_diff_id(diff) if diff else None
        if not did:
            did = current_section_level
        if did:
            code = f"{subj}-{seq:03d}"
            lines.append(f"UPDATE dbo.ptud_Exercises SET LevelID = {did} WHERE ExerciseCode = N'{code}';")

if lines:
    content = '-- Updates LevelID by numeric id using section headings as fallback (1=Dễ,2=Trung bình,3=Khó)\n' + '\n'.join(lines) + '\n'
    out_sql.write_text(content, encoding='utf-16')
    print('Wrote', out_sql)
else:
    print('No difficulty lines found to update')
