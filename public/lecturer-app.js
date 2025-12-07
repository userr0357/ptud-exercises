// Lecturer page script — uses cookie-based auth (server sets HttpOnly cookie on login)
async function fetchJSONWithCreds(url, opts) {
  opts = opts || {};
  opts.credentials = 'include';
  const res = await fetch(url, opts);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

const lecturerState = { subjects: [], currentSubject: null };

async function loadSubjects() {
  lecturerState.subjects = await fetchJSONWithCreds('/api/subjects');
  populateLecturerSelects();
  renderManageList();
}

function populateLecturerSelects() {
  const selSub = document.getElementById('form-subject');
  const selForm = document.getElementById('form-form');
  if (!selSub) return;
  selSub.innerHTML = '';
  lecturerState.subjects.forEach(s => {
    const o = document.createElement('option'); o.value = s.subject_id; o.textContent = s.subject_name; selSub.appendChild(o);
  });
  selSub.onchange = () => {
    const sub = lecturerState.subjects.find(x => x.subject_id === selSub.value);
    selForm.innerHTML = '';
    sub.forms.forEach(f => { const o = document.createElement('option'); o.value = f.form_id; o.textContent = `${f.name} (${f.difficulty})`; selForm.appendChild(o); });
  };
  if (lecturerState.subjects.length) selSub.onchange();
}

function renderManageList() {
  const container = document.getElementById('manage-list');
  container.innerHTML = '';
  lecturerState.subjects.forEach(s => {
    const h = document.createElement('h4'); h.textContent = s.subject_name; container.appendChild(h);
    s.forms.forEach(f => {
      const formDiv = document.createElement('div'); formDiv.innerHTML = `<strong>${f.name} (${f.difficulty})</strong>`;
      const list = document.createElement('div');
      f.exercises.forEach(ex => {
        const item = document.createElement('div');
        item.style.display='flex'; item.style.justifyContent='space-between'; item.style.padding='6px 0';
        item.innerHTML = `<div>${ex.title} <small>[${ex.difficulty}]</small></div>`;
        const controls = document.createElement('div');
        const edit = document.createElement('button'); edit.textContent='Sửa'; edit.style.marginLeft='8px'; edit.onclick = () => {
          const formEl = document.getElementById('exercise-form');
          document.getElementById('original_id').value = ex.id;
          formEl.querySelector('[name=id]').value = ex.id;
          formEl.querySelector('[name=title]').value = ex.title;
          formEl.querySelector('[name=difficulty]').value = ex.difficulty;
          formEl.querySelector('[name=description]').value = ex.description || '';
          formEl.querySelector('[name=requirements]').value = (ex.requirements||[]).join('\n');
          formEl.querySelector('[name=grading_criteria]').value = (ex.grading_criteria||[]).join('\n');
          formEl.querySelector('[name=submission_format]').value = ex.submission_format || '';
          const selSub = document.getElementById('form-subject');
          selSub.value = s.subject_id; selSub.onchange && selSub.onchange();
          document.getElementById('form-form').value = f.form_id;
          // focus title
          setTimeout(()=>{ formEl.querySelector('[name=title]').focus(); },50);
        };
        const del = document.createElement('button'); del.textContent='Xóa'; del.style.marginLeft='8px'; del.onclick = async () => {
          if (!confirm('Xóa bài tập?')) return;
          await fetch(`/api/exercise/${ex.id}`, { method: 'DELETE', credentials: 'include' });
          await refreshSubjects();
        };
        controls.appendChild(edit);
        controls.appendChild(del);
        item.appendChild(controls);
        list.appendChild(item);
      });
      formDiv.appendChild(list);
      container.appendChild(formDiv);
    });
  });
}

async function refreshSubjects(){
  lecturerState.subjects = await fetchJSONWithCreds('/api/subjects');
  renderManageList();
}

document.getElementById('exercise-form').onsubmit = async (e) => {
  e.preventDefault();
  const formEl = e.target;
  const fd = new FormData(formEl);
  const orig = fd.get('original_id');
  const exercise = {
    id: fd.get('id'),
    title: fd.get('title'),
    difficulty: fd.get('difficulty'),
    description: fd.get('description'),
    requirements: (fd.get('requirements')||'').split('\n').map(s=>s.trim()).filter(Boolean),
    grading_criteria: (fd.get('grading_criteria')||'').split('\n').map(s=>s.trim()).filter(Boolean),
    submission_format: fd.get('submission_format')
  };
  const multipart = new FormData();
  multipart.append('exercise', JSON.stringify(exercise));
  const fileInput = formEl.querySelector('input[type=file]');
  if (fileInput && fileInput.files.length) for (const f of fileInput.files) multipart.append('files', f);
  multipart.append('subject_id', fd.get('subject_id'));
  multipart.append('form_id', fd.get('form_id'));
  try {
    let res;
    if (orig) {
      res = await fetch(`/api/exercise/${encodeURIComponent(orig)}`, { method: 'PUT', credentials: 'include', body: multipart });
    } else {
      res = await fetch('/api/exercise', { method: 'POST', credentials: 'include', body: multipart });
    }
    if (!res.ok) throw new Error('Failed');
    alert('Lưu thành công');
    formEl.reset(); document.getElementById('original_id').value='';
    await refreshSubjects();
  } catch (err) { console.error(err); alert('Lỗi lưu bài tập'); }
};

document.getElementById('btn-export').onclick = async () => {
  const sel = document.getElementById('form-subject');
  if (!sel || !sel.value) return alert('Chọn môn trước khi xuất');
  try {
    const res = await fetch(`/api/export?subject_id=${sel.value}`, { credentials: 'include' });
    if (!res.ok) throw new Error('Export failed');
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${sel.value}-exercises.xlsx`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  } catch (err) { alert('Xuất Excel thất bại'); }
};

document.getElementById('btn-logout').onclick = async () => {
  // clear cookie on server by calling a logout endpoint
  try { await fetch('/api/lecturer/logout', { method: 'POST', credentials: 'include' }); } catch (e) {}
  location.href = '/';
};

// initial load + basic auth check
(async function(){
  try {
    await loadSubjects();
    // get lecturer info via a lightweight endpoint
    const me = await fetch('/api/lecturer/me', { credentials: 'include' }).then(r=>{ if (!r.ok) throw new Error('not auth'); return r.json(); });
    document.getElementById('lecturer-info').textContent = `Giảng viên: ${me.name} (${me.lecturer_id || ''})`;
    // if an edit target was set from student page, prefill the form
    try {
      const et = localStorage.getItem('editTarget');
      if (et) {
        const obj = JSON.parse(et);
        localStorage.removeItem('editTarget');
        // find exercise and prefill
        const sub = lecturerState.subjects.find(s => s.subject_id === obj.subject_id);
        if (sub) {
          const form = sub.forms.find(f => f.form_id === obj.form_id);
          if (form) {
            const ex = form.exercises.find(x => x.id === obj.id);
            if (ex) {
              const formEl = document.getElementById('exercise-form');
              if (formEl) {
                document.getElementById('original_id').value = ex.id;
                formEl.querySelector('[name=id]').value = ex.id;
                formEl.querySelector('[name=title]').value = ex.title;
                formEl.querySelector('[name=difficulty]').value = ex.difficulty;
                formEl.querySelector('[name=description]').value = ex.description || '';
                formEl.querySelector('[name=requirements]').value = (ex.requirements||[]).join('\n');
                formEl.querySelector('[name=grading_criteria]').value = (ex.grading_criteria||[]).join('\n');
                formEl.querySelector('[name=submission_format]').value = ex.submission_format || '';
                const selSub = document.getElementById('form-subject');
                if (selSub) { selSub.value = sub.subject_id; selSub.onchange && selSub.onchange(); }
                const selForm = document.getElementById('form-form'); if (selForm) selForm.value = form.form_id;
                setTimeout(()=>{ formEl.querySelector('[name=title]').focus(); },50);
              }
            }
          }
        }
      }
    } catch (e) { /* ignore */ }
  } catch (err) {
    // not authorized — redirect to student page
    location.href = '/';
  }
})();
