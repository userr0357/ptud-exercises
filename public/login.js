// login page script
const form = document.getElementById('login-page-form');
const back = document.getElementById('login-back');
const err = document.getElementById('login-error');
if (back) back.onclick = () => { location.href = '/'; };
if (form) form.onsubmit = async (e) => {
  e.preventDefault();
  err.style.display = 'none';
  const fd = new FormData(form);
  const payload = { name: fd.get('name'), password: fd.get('password'), lecturer_id: fd.get('lecturer_id') };
  try {
    const res = await fetch('/api/lecturer/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), credentials: 'include' });
    if (!res.ok) {
      const text = await res.text().catch(()=>null);
      err.textContent = text || 'Đăng nhập thất bại'; err.style.display='block'; return;
    }
    // on success, server sets HttpOnly cookie — redirect to protected lecturer page
    location.href = '/lecturer';
  } catch (e) {
    err.textContent = 'Lỗi kết nối'; err.style.display='block';
  }
};
