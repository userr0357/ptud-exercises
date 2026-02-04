// Simple lecturer management script
async function apiFetch(path, opts){ opts = opts||{}; opts.credentials='include'; const res = await fetch(path, opts); if (!res.ok) { const txt = await res.text().catch(()=>res.statusText); throw new Error(txt || res.status); } return res.json ? res.json() : res; }

const state = { subjects: [], lecturer: null };

async function loadSubjects(){
  // get lecturer info to determine allowed subjects
  try {
    const me = await apiFetch('/api/lecturer/me');
    state.lecturer = me;
  } catch (e) {
    console.warn('Could not get lecturer info', e);
    state.lecturer = null;
  }

  state.subjects = await fetch('/api/subjects', { credentials: 'include' }).then(r=>{ if (!r.ok) throw new Error('fail'); return r.json() });

  // filter subjects if lecturer is not admin
  if (state.lecturer && !state.lecturer.is_admin && Array.isArray(state.lecturer.allowed_subjects)) {
    const allowed = new Set(state.lecturer.allowed_subjects);
    state.subjects = state.subjects.filter(s => allowed.has(s.subject_id));
  }

  populateSelects(); renderManageList();
  // display lecturer info
  const li = document.getElementById('lecturer-info');
  if (li) {
    if (state.lecturer) li.textContent = `${state.lecturer.name || state.lecturer.username || ''} ${state.lecturer.is_admin?'(Admin)':''}`;
    else li.textContent = '';
  }
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

// dynamic fields for requirements and grading criteria
function createFieldControls(containerId, values){
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  const list = document.createElement('div'); list.className = 'field-list';
  (values || []).forEach(v => addField(list, v));
  container.appendChild(list);
  const addBtn = document.createElement('button'); addBtn.type='button'; addBtn.textContent = '+ Thêm'; addBtn.onclick = () => addField(list, '');
  container.appendChild(addBtn);
}

function addField(list, value){
  const row = document.createElement('div'); row.style.display='flex'; row.style.marginBottom='6px';
  const input = document.createElement('input'); input.type='text'; input.value = value || ''; input.style.flex='1';
  const del = document.createElement('button'); del.type='button'; del.textContent='✕'; del.style.marginLeft='6px'; del.onclick = () => row.remove();
  row.appendChild(input); row.appendChild(del); list.appendChild(row);
}

function getFieldValues(containerId){
  const container = document.getElementById(containerId);
  const inputs = container.querySelectorAll('.field-list input');
  const out = [];
  inputs.forEach(i => { const v = i.value && i.value.trim(); if (v) out.push(v); });
  return out;
}

function renderManageList(){
  const container = document.getElementById('manage-list'); container.innerHTML='';
  const searchVal = (document.getElementById('search-box')?.value || '').toLowerCase();
  const difficultyFilter = document.getElementById('filter-difficulty')?.value || '';

  state.subjects.forEach(s=>{
    let hasVisible = false;
    const exercisesToRender = [];

    s.forms.forEach(f=>{
      (f.exercises||[]).forEach(ex=>{
        const matchSearch = !searchVal || ex.title.toLowerCase().includes(searchVal) || ex.id.toLowerCase().includes(searchVal);
        const matchDifficulty = !difficultyFilter || ex.difficulty === difficultyFilter;
        if (matchSearch && matchDifficulty) {
          exercisesToRender.push({ form: f, exercise: ex });
          hasVisible = true;
        }
      });
    });

    if (!hasVisible) return; // skip subject if no exercises match

    // Subject header with collapse
    const subjGroup = document.createElement('div'); subjGroup.className = 'subject-group';
    const subjHeader = document.createElement('div'); subjHeader.className = 'subject-header';
    subjHeader.onclick = ()=>{ const exList = subjGroup.querySelector('.subject-exercises'); if (exList) exList.style.display = exList.style.display === 'none' ? 'block' : 'none'; const toggle = subjHeader.querySelector('.subject-toggle'); if (toggle) toggle.classList.toggle('collapsed'); };
    
    const toggle = document.createElement('span'); toggle.className = 'subject-toggle';
    const title = document.createElement('span'); title.className = 'subject-title'; title.textContent = s.subject_name;
    const count = document.createElement('span'); count.className = 'subject-count'; count.textContent = `${exercisesToRender.length} bài`;
    
    subjHeader.appendChild(toggle); subjHeader.appendChild(title); subjHeader.appendChild(count); subjGroup.appendChild(subjHeader);

    // Exercises list
    const exList = document.createElement('div'); exList.className = 'subject-exercises';
    exercisesToRender.forEach(({form, exercise: ex})=>{
      const row = document.createElement('div'); row.className = 'exercise-item';
      
      const left = document.createElement('div'); left.className = 'exercise-left';
      const titleSpan = document.createElement('span'); titleSpan.className = 'exercise-title'; titleSpan.textContent = ex.title || '';
      const badge = document.createElement('span'); badge.className = 'exercise-badge';
      if (ex.difficulty === 'Dễ') badge.className += ' badge-easy';
      else if (ex.difficulty === 'Trung bình') badge.className += ' badge-medium';
      else if (ex.difficulty === 'Khó') badge.className += ' badge-hard';
      badge.textContent = ex.difficulty || '';
      const meta = document.createElement('div'); meta.style.fontSize = '12px'; meta.style.color = '#666'; meta.style.marginTop = '4px';
      meta.textContent = `ID: ${ex.id} | ${ex.requirements?.length || 0} yêu cầu | ${ex.grading_criteria?.length || 0} tiêu chí`;
      
      left.appendChild(titleSpan); left.appendChild(badge); left.appendChild(meta);

      const controls = document.createElement('div'); controls.className = 'exercise-controls';
      const btnEdit = document.createElement('button'); btnEdit.className = 'edit'; btnEdit.textContent='✎ Sửa'; btnEdit.onclick=()=>fillFormForEdit(s, form, ex);
      const btnDel = document.createElement('button'); btnDel.className = 'delete'; btnDel.textContent='🗑 Xóa'; btnDel.onclick=()=>confirmDelete(ex.id, ex.title);
      
      controls.appendChild(btnEdit); controls.appendChild(btnDel);
      row.appendChild(left); row.appendChild(controls); exList.appendChild(row);
    });
    
    subjGroup.appendChild(exList); container.appendChild(subjGroup);
  });
}

function confirmDelete(exerciseId, exerciseTitle){
  if (confirm(`Xóa bài tập "${exerciseTitle}"?\n\nHành động này không thể hoàn tác.`)) {
    deleteExercise(exerciseId);
  }
}

async function deleteExercise(exerciseId){
  try {
    const res = await fetch(`/api/exercise/${exerciseId}`, { method:'DELETE', credentials:'include' });
    if (!res.ok) throw new Error('delete failed');
    await loadSubjects();
    showToast('Xóa thành công');
  } catch(e) {
    console.error(e);
    showToast('Lỗi xóa bài tập', 'error');
  }
}

function showToast(message, type){
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.style.background = type === 'error' ? '#cc0000' : '#333';
  toast.classList.add('show');
  setTimeout(()=>{ toast.classList.remove('show'); }, 3000);
}

function fillFormForEdit(subject, form, ex){
  document.getElementById('original_id').value = ex.id;
  document.getElementById('form-subject').value = subject.subject_id; document.getElementById('form-subject').onchange && document.getElementById('form-subject').onchange();
  document.getElementById('form-form').value = form.form_id;
  document.getElementById('field-title').value = ex.title || '';
  document.getElementById('field-id').value = ex.id || '';
  document.getElementById('field-difficulty').value = ex.difficulty || '';
  document.getElementById('field-description').value = ex.description || '';
  createFieldControls('field-requirements-container', (ex.requirements||[]));
  createFieldControls('field-grading-container', (ex.grading_criteria||[]));
  document.getElementById('field-submission').value = ex.submission_format || '';
  // show modal
  document.getElementById('modal-title').textContent = 'Sửa bài tập';
  const modal = document.getElementById('exercise-modal');
  if (modal) modal.classList.add('show');
}

document.getElementById && document.addEventListener('DOMContentLoaded', ()=>{
  // replace plain textareas for requirements/grading with dynamic field containers
  ['requirements','grading'].forEach(key=>{
    const tid = 'field-' + key;
    const ta = document.getElementById(tid);
    if (!ta) return;
    const containerId = tid + '-container';
    const container = document.createElement('div'); container.id = containerId;
    ta.parentNode.insertBefore(container, ta);
    // read existing lines
    const lines = (ta.value||'').split('\n').map(s=>s.trim()).filter(Boolean);
    // hide original textarea but keep it for form-reset compatibility
    ta.style.display='none';
    createFieldControls(containerId, lines);
  });

  loadSubjects().catch(e=>console.error('loadSubjects',e));

  // Search and filter handlers
  const searchBox = document.getElementById('search-box');
  const filterDiff = document.getElementById('filter-difficulty');
  if (searchBox) searchBox.addEventListener('input', ()=>renderManageList());
  if (filterDiff) filterDiff.addEventListener('change', ()=>renderManageList());

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
      requirements: getFieldValues('field-requirements-container'),
      grading_criteria: getFieldValues('field-grading-container'),
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
      // clear dynamic fields
      createFieldControls('field-requirements-container', []);
      createFieldControls('field-grading-container', []);
      // hide modal after save
      const modal = document.getElementById('exercise-modal');
      if (modal) modal.classList.remove('show');
      showToast('Lưu thành công');
    }catch(e){ console.error(e); showToast('Lỗi lưu bài tập', 'error'); }
  });

  document.getElementById('exercise-cancel').addEventListener('click', ()=>{ document.getElementById('exercise-form').reset(); document.getElementById('original_id').value=''; const modal = document.getElementById('exercise-modal'); if (modal) modal.classList.remove('show'); });
  // create new button: clear form and show modal
  const btnCreate = document.getElementById('btn-create-new');
  if (btnCreate) btnCreate.addEventListener('click', ()=>{
    const form = document.getElementById('exercise-form'); form.reset(); document.getElementById('original_id').value='';
    // reset dynamic fields
    createFieldControls('field-requirements-container', []);
    createFieldControls('field-grading-container', []);
    // show modal
    document.getElementById('modal-title').textContent = 'Tạo bài tập mới';
    const modal = document.getElementById('exercise-modal');
    if (modal) modal.classList.add('show');
  });

  document.getElementById('btn-export').addEventListener('click', async ()=>{
    const subj = document.getElementById('form-subject').value; if (!subj) return alert('Chọn môn');
    try{
      const res = await fetch(`/api/export?subject_id=${encodeURIComponent(subj)}`, { credentials:'include' });
      if (!res.ok) throw new Error('export failed');
      const blob = await res.blob(); const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `${subj}-exercises.xlsx`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    }catch(e){ console.error(e); alert('Xuất thất bại'); }
  });

  document.getElementById('btn-logout').addEventListener('click', async ()=>{ try{ await fetch('/api/lecturer/logout',{ method:'POST', credentials:'include' }); }catch(e){}; location.href='/login'; });

  // Modal close handlers
  const modalCloseBtn = document.getElementById('modal-close');
  if (modalCloseBtn) modalCloseBtn.addEventListener('click', ()=>{ const modal = document.getElementById('exercise-modal'); if (modal) modal.classList.remove('show'); });
  
  const modal = document.getElementById('exercise-modal');
  if (modal) modal.addEventListener('click', (e)=>{ if (e.target.id === 'exercise-modal') { e.target.classList.remove('show'); } });
});
