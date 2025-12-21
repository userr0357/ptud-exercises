// Simple lecturer management script
async function apiFetch(path, opts){ opts = opts||{}; opts.credentials='include'; const res = await fetch(path, opts); if (!res.ok) { const txt = await res.text().catch(()=>res.statusText); throw new Error(txt || res.status); } return res.json ? res.json() : res; }

const state = { subjects: [] };

async function loadSubjects(){
  state.subjects = await fetch('/api/subjects', { credentials: 'include' }).then(r=>{ if (!r.ok) throw new Error('fail'); return r.json() });
  populateSelects(); renderManageList();
}

function populateSelects(){
  const selSub = document.getElementById('form-subject'); const selForm = document.getElementById('form-form');
  selSub.innerHTML=''; selForm.innerHTML='';
  state.subjects.forEach(s=>{ const o=document.createElement('option'); o.value=s.subject_id; o.textContent=s.subject_name; selSub.appendChild(o); });
  selSub.onchange = ()=>{
    const s = state.subjects.find(x=>x.subject_id===selSub.value);
    selForm.innerHTML=''; if(!s) return; s.forms.forEach(f=>{ const o=document.createElement('option'); o.value=f.form_id; o.textContent=f.name; selForm.appendChild(o); });
  };
  if (selSub.options.length) selSub.value = selSub.options[0].value, selSub.onchange();
}

function renderManageList(){
  const container = document.getElementById('manage-list'); container.innerHTML='';
  state.subjects.forEach(s=>{
    const h = document.createElement('h4'); h.textContent = s.subject_name; container.appendChild(h);
    s.forms.forEach(f=>{
      const title = document.createElement('div'); title.innerHTML = `<strong>${f.name} (${f.difficulty})</strong>`; container.appendChild(title);
      (f.exercises||[]).forEach(ex=>{
        const row = document.createElement('div'); row.style.display='flex'; row.style.justifyContent='space-between'; row.style.padding='6px 0';
        const left = document.createElement('div'); left.innerHTML = `${ex.title} <small class="small-muted">[${ex.difficulty}]</small>`;
        const controls = document.createElement('div'); controls.className='item-controls';
        const btnEdit = document.createElement('button'); btnEdit.textContent='Sửa'; btnEdit.onclick=()=>fillFormForEdit(s, f, ex);
        const btnDel = document.createElement('button'); btnDel.textContent='Xóa'; btnDel.onclick=async ()=>{ if(!confirm('Xóa bài tập?')) return; await fetch(`/api/exercise/${ex.id}`, { method:'DELETE', credentials:'include' }); await loadSubjects(); };
        controls.appendChild(btnEdit); controls.appendChild(btnDel);
        row.appendChild(left); row.appendChild(controls); container.appendChild(row);
      });
    });
  });
}

function fillFormForEdit(subject, form, ex){
  document.getElementById('original_id').value = ex.id;
  document.getElementById('form-subject').value = subject.subject_id; document.getElementById('form-subject').onchange && document.getElementById('form-subject').onchange();
  document.getElementById('form-form').value = form.form_id;
  document.getElementById('field-title').value = ex.title || '';
  document.getElementById('field-id').value = ex.id || '';
  document.getElementById('field-difficulty').value = ex.difficulty || '';
  document.getElementById('field-description').value = ex.description || '';
  document.getElementById('field-requirements').value = (ex.requirements||[]).join('\n');
  document.getElementById('field-grading').value = (ex.grading_criteria||[]).join('\n');
  document.getElementById('field-submission').value = ex.submission_format || '';
  window.scrollTo({top:0,behavior:'smooth'});
}

document.getElementById && document.addEventListener('DOMContentLoaded', ()=>{
  loadSubjects().catch(e=>console.error('loadSubjects',e));
  // form submit
  const form = document.getElementById('exercise-form');
  form.addEventListener('submit', async (ev)=>{
    ev.preventDefault();
    const orig = document.getElementById('original_id').value || '';
    const fd = new FormData();
    const exercise = {
      id: document.getElementById('field-id').value,
      title: document.getElementById('field-title').value,
      difficulty: document.getElementById('field-difficulty').value,
      description: document.getElementById('field-description').value,
      requirements: document.getElementById('field-requirements').value.split('\n').map(s=>s.trim()).filter(Boolean),
      grading_criteria: document.getElementById('field-grading').value.split('\n').map(s=>s.trim()).filter(Boolean),
      submission_format: document.getElementById('field-submission').value
    };
    fd.append('exercise', JSON.stringify(exercise));
    const files = document.getElementById('field-files').files; for(const f of files) fd.append('files', f);
    fd.append('subject_id', document.getElementById('form-subject').value);
    fd.append('form_id', document.getElementById('form-form').value);
    try{
      let res;
      if (orig) res = await fetch(`/api/exercise/${encodeURIComponent(orig)}`, { method:'PUT', body: fd, credentials:'include' });
      else res = await fetch('/api/exercise', { method:'POST', body: fd, credentials:'include' });
      if (!res.ok) throw new Error('save failed');
      await loadSubjects(); form.reset(); document.getElementById('original_id').value='';
      alert('Lưu thành công');
    }catch(e){ console.error(e); alert('Lỗi lưu'); }
  });

  document.getElementById('exercise-cancel').addEventListener('click', ()=>{ document.getElementById('exercise-form').reset(); document.getElementById('original_id').value=''; });

  document.getElementById('btn-export').addEventListener('click', async ()=>{
    const subj = document.getElementById('form-subject').value; if (!subj) return alert('Chọn môn');
    try{
      const res = await fetch(`/api/export?subject_id=${encodeURIComponent(subj)}`, { credentials:'include' });
      if (!res.ok) throw new Error('export failed');
      const blob = await res.blob(); const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `${subj}-exercises.xlsx`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    }catch(e){ console.error(e); alert('Xuất thất bại'); }
  });

  document.getElementById('btn-logout').addEventListener('click', async ()=>{ try{ await fetch('/api/lecturer/logout',{ method:'POST', credentials:'include' }); }catch(e){}; location.href='/'; });
});
