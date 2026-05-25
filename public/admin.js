// Global State
let dashboardCharts = {};
let lecturerData = []; // Lưu danh sách GV đã tải
let gvCurrentPage = 1;
const gvPerPage = 10;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const section = urlParams.get('section') || 'dashboard';
  
  const monthInput = document.getElementById('activity-month-filter');
  if (monthInput) {
    const now = new Date();
    const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    monthInput.value = monthStr;
  }

  switchSection(section);
  loadAdminInfo();
});

function switchSection(sectionId) {
  // 1. Sidebar active state
  document.querySelectorAll('.menu-item').forEach(item => {
    item.classList.remove('active');
    if (item.getAttribute('data-section') === sectionId) item.classList.add('active');
  });
  // 2. Ẩn tất cả sections
  document.querySelectorAll('.admin-section').forEach(s => {
    s.classList.remove('active');
    s.style.display = 'none';
  });
  // 3. Hiện section mục tiêu
  const target = document.getElementById(sectionId);
  if (target) { target.classList.add('active'); target.style.display = 'block'; }
  // 4. Nạp dữ liệu tương ứng
  if (sectionId === 'dashboard')        loadDashboardStats();
  if (sectionId === 'users')            loadLecturersStats();
  if (sectionId === 'exercises')        initExercisesAdminSection();
  if (sectionId === 'history')          initLoginHistorySection();
  if (sectionId === 'exercise-history') initExerciseActivitySection();
  if (sectionId === 'students')         initStudentsSection();
  if (sectionId === 'export')           initExportSection();
  if (sectionId === 'feedback-history') loadAllFeedbacks();
  if (sectionId === 'duplicates')       loadDuplicatesSection();
}

// ─── Card click: Dashboard → chuyển section ───────────
function navigateTo(sectionId) {
  // Map card → section alias
  const map = {
    'section-lecturers': 'users',
    'section-exercises': 'exercises',
    'section-students':  'students',
  };
  const id = map[sectionId] || sectionId;
  switchSection(id);
  // Scroll lên đầu nội dung
  setTimeout(() => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 150);
}

// ─── Card click: Student stats → lọc bảng sinh viên ───
function svCardClick(type) {
  const searchEl    = document.getElementById('sv-search');
  const classFilter = document.getElementById('sv-filter-class');

  if (type === 'all') {
    // Reset filter
    if (searchEl)    searchEl.value = '';
    if (classFilter) classFilter.value = '';
    loadStudents(1);
  } else if (type === 'classes') {
    // Focus vào dropdown lớp
    if (classFilter) {
      classFilter.focus();
      classFilter.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    return;
  } else if (type === 'faculty') {
    // Tìm kiếm trong ô search với khoa
    if (searchEl) {
      searchEl.value = '';
      searchEl.focus();
      searchEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      showToast('💡 Nhập tên khoa vào ô tìm kiếm để lọc sinh viên theo khoa', 'info');
    }
    return;
  } else if (type === 'submitted') {
    // Lọc chỉ SV đã nộp bài (submission_count > 0)
    if (searchEl)    searchEl.value = '';
    if (classFilter) classFilter.value = '';
    loadStudents(1, true); // flag: chỉ SV đã nộp
    return;
  }

  // Scroll tới bảng SV
  setTimeout(() => {
    const table = document.querySelector('#students table, #students .admin-table, #sv-table-wrapper');
    if (table) table.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 300);
}



async function loadLecturersStats() {
  const tbody = document.getElementById('lecturers-stats-tbody');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:30px;"><div class="spinner"></div> Đang tải danh sách giảng viên...</td></tr>';
  
  try {
    const res = await fetch('/api/admin/lecturers', { credentials: 'include' });
    lecturerData = await res.json();
    window._cachedLecturers = lecturerData; // Cache for history section dropdowns
    loadLecturerAnalytics();
    renderLecturersTable();
  } catch (err) { tbody.innerHTML = '<tr><td colspan="7" style="color:red; text-align:center;">Lỗi nạp dữ liệu: ' + err.message + '</td></tr>'; }
}

function filterLecturers() {
  const query = document.getElementById('gv-search-input').value.toLowerCase();
  gvCurrentPage = 1;
  renderLecturersTable(query);
}

function renderLecturersTable(searchQuery = '') {
  const tbody = document.getElementById('lecturers-stats-tbody');
  
  let filteredData = lecturerData;
  if (searchQuery) {
    filteredData = lecturerData.filter(gv => 
      gv.TenGiangVien.toLowerCase().includes(searchQuery) || 
      gv.MaGiangVien.toLowerCase().includes(searchQuery)
    );
  }

  const start = (gvCurrentPage - 1) * gvPerPage;
  const end = start + gvPerPage;
  const pageData = filteredData.slice(start, end);

  tbody.innerHTML = '';
  pageData.forEach(gv => {
    const subjects = gv.SubjectList ? gv.SubjectList.split(', ') : [];
    const subjectBadges = subjects.length > 0
      ? subjects.map(s => `<span style="background:#ede9fe; color:#5b21b6; padding:3px 9px; border-radius:20px; font-size:14px; font-weight:500; display:inline-block; margin:2px;">${s}</span>`).join('')
      : '<span style="color:var(--text-muted); font-size:15px; font-style:italic;">Chưa phân công</span>';

    const lastLogin = gv.LastLogin
      ? new Date(gv.LastLogin).toLocaleString('vi-VN', { hour:'2-digit', minute:'2-digit', day:'2-digit', month:'2-digit', year:'numeric' })
      : '—';

    // Avatar initials
    const initials = (gv.TenGiangVien || '??').split(' ').map(w => w[0]).slice(-2).join('').toUpperCase();
    const avatarColors = ['#6366f1','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899','#06b6d4','#84cc16'];
    const avatarColor = avatarColors[gv.MaGiangVien.charCodeAt(gv.MaGiangVien.length - 1) % avatarColors.length];

    // Role badge
    const roleBadge = (gv.Quyen || '').trim().toLowerCase() === 'admin'
      ? '<span style="background:#fef3c7; color:#92400e; padding:2px 8px; border-radius:20px; font-size:12px; font-weight:700;">🛡 Admin</span>'
      : '<span style="background:#eff6ff; color:#1d4ed8; padding:2px 8px; border-radius:20px; font-size:12px; font-weight:600;">👨‍🏫 GV</span>';

    // Status badge
    const statusBadge = gv.IsBlocked
      ? '<span style="background:#fef2f2; color:#dc2626; padding:4px 10px; border-radius:20px; font-size:14px; font-weight:600; display:inline-flex; align-items:center; gap:4px;">🔒 Đã khóa</span>'
      : '<span style="background:#f0fdf4; color:#16a34a; padding:4px 10px; border-radius:20px; font-size:14px; font-weight:600; display:inline-flex; align-items:center; gap:4px;">✅ Hoạt động</span>';

    // Prepare safe strings for inline onclick attrs
    const _safeName = (gv.TenGiangVien || gv.MaGiangVien).replace(/'/g, '\\u0027');
    const _safeSubjects = (gv.SubjectList || 'Chưa phân công').replace(/'/g, '\\u0027');
    const _exCount = gv.ExerciseCount || 0;

    const row = document.createElement('tr');
    row.style.cssText = 'transition:background 0.15s; cursor:default;';
    row.onmouseenter = () => row.style.background = '#f8fafc';
    row.onmouseleave = () => row.style.background = '';

    row.innerHTML = `
      <td style="padding:14px 10px 14px 16px;">
        <div style="width:40px; height:40px; border-radius:50%; background:${avatarColor}; display:flex; align-items:center; justify-content:center; font-size:16px; font-weight:700; color:white; flex-shrink:0;">${initials}</div>
      </td>
      <td style="padding:14px 12px;">
        <div style="font-weight:700; font-size:16px; color:var(--text-main); margin-bottom:2px;">${gv.TenGiangVien}</div>
        <div style="font-size:14px; color:var(--text-muted); font-family:monospace;">${gv.MaGiangVien}</div>
      </td>
      <td style="padding:14px 12px;">
        <div style="font-size:15px; color:var(--text-main); margin-bottom:3px;">📧 ${gv.Email || '<span style="color:var(--text-muted); font-style:italic;">Chưa có</span>'}</div>
        <div style="font-size:14px; color:#6366f1; font-family:monospace;">🔑 ${gv.TenDangNhap || gv.MaGiangVien}</div>
      </td>
      <td style="padding:14px 12px; max-width:240px; line-height:1.8;">${subjectBadges}</td>
      <td style="padding:14px 12px; text-align:center;">
        <a href="#" onclick="openLecturerExercisesModal('${gv.MaGiangVien}', '${gv.TenGiangVien}'); return false;"
          style="color:#2563eb; font-weight:700; font-size:17px; text-decoration:none; border-bottom:1.5px dashed #93c5fd;">${gv.ExerciseCount}<br>
          <span style="font-size:12px; font-weight:400; color:var(--text-muted);">bài tập</span>
        </a>
      </td>
      <td style="padding:14px 12px; text-align:center; font-size:15px; color:var(--text-muted); white-space:nowrap;">${lastLogin}</td>
      <td style="padding:14px 12px; text-align:center;">
        <div style="display:flex; flex-direction:column; align-items:center; gap:5px;">
          ${roleBadge}
          ${statusBadge}
        </div>
      </td>
      <td style="padding:14px 12px;">
        <div style="display:flex; flex-wrap:wrap; gap:5px; justify-content:center;">
          <button onclick="openEditLecturerModal('${gv.MaGiangVien}')"
            style="padding:6px 12px; background:#eff6ff; color:#2563eb; border:1px solid #bfdbfe; border-radius:7px; font-size:14px; font-weight:600; cursor:pointer; white-space:nowrap;"
            title="Chỉnh sửa thông tin">✏️ Sửa</button>
          <button onclick="toggleLecturerLock('${gv.MaGiangVien}', ${!gv.IsBlocked}, '${_safeName}', '${_safeSubjects}', ${_exCount})"
            style="padding:6px 12px; background:${gv.IsBlocked ? '#f0fdf4' : '#fff7ed'}; color:${gv.IsBlocked ? '#16a34a' : '#ea580c'}; border:1px solid ${gv.IsBlocked ? '#bbf7d0' : '#fed7aa'}; border-radius:7px; font-size:14px; font-weight:600; cursor:pointer; white-space:nowrap;"
            title="${gv.IsBlocked ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}">${gv.IsBlocked ? '🔓 Mở khóa' : '🔒 Khóa'}</button>
          ${gv.IsBlocked ? `<button onclick="viewLockDetails('${gv.MaGiangVien}')" style="padding:6px 12px; background:#fefce8; color:#a16207; border:1px solid #fef08a; border-radius:7px; font-size:14px; font-weight:600; cursor:pointer; white-space:nowrap;" title="Xem chi tiết khóa">👁 Xem</button>` : ''}
          <button onclick="viewLecturerHistory('${gv.MaGiangVien}')"
            style="padding:6px 12px; background:#f0fdf4; color:#16a34a; border:1px solid #bbf7d0; border-radius:7px; font-size:14px; font-weight:600; cursor:pointer; white-space:nowrap;"
            title="Xem hồ sơ tổng quan">👤 Hồ sơ</button>
          <button onclick="deleteLecturer('${gv.MaGiangVien}', '${_safeName}')"
            style="padding:6px 12px; background:#fef2f2; color:#dc2626; border:1px solid #fecaca; border-radius:7px; font-size:14px; font-weight:600; cursor:pointer; white-space:nowrap;"
            title="Xóa giảng viên">🗑 Xóa</button>
        </div>
      </td>
    `;
    tbody.appendChild(row);
  });

  renderPagination(filteredData.length);
}

function renderPagination(totalItems) {
  const totalPages = Math.ceil(totalItems / gvPerPage);
  const info = document.getElementById('gv-pagination-info');
  const btns = document.getElementById('gv-pagination-btns');
  if (!info || !btns) return;

  info.textContent = `Hiển thị ${Math.min(totalItems, (gvCurrentPage-1)*gvPerPage + 1)}-${Math.min(totalItems, gvCurrentPage*gvPerPage)} trong tổng số ${totalItems} giảng viên`;
  info.style.fontSize = '13px';
  
  btns.innerHTML = '';
  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement('button');
    btn.textContent = i;
    btn.className = `btn-pagination ${i === gvCurrentPage ? 'active' : ''}`;
    btn.onclick = () => { gvCurrentPage = i; renderLecturersTable(document.getElementById('gv-search-input').value.toLowerCase()); };
    btns.appendChild(btn);
  }
}

async function loadLecturerAnalytics() {
  try {
    const res = await fetch('/api/admin/stats/distribution', { credentials: 'include' });
    const data = await res.json();

    // Cập nhật Cards
    document.getElementById('stat-total-gv').textContent = lecturerData.length;
    document.getElementById('stat-total-mh').textContent = data.bySubject.length;
    document.getElementById('stat-total-bt').textContent = data.bySubject.reduce((a, b) => a + b.value, 0);
    document.getElementById('stat-active-gv').textContent = lecturerData.filter(g => !g.IsBlocked).length;

    // Vẽ 2 bàiểu đồ trên (Theo Môn + Theo Cấp Độ)
    renderPieChart('pie-subject-distribution', data.bySubject, 'subject');
    renderPieChart('pie-level-distribution', data.byLevel.map(l => ({ label: 'Cấp độ ' + l.label, value: l.value, rawLvl: l.label })), 'level');

    // Populate dropdown môn học cho bàiểu đồ dạng bài
    const select = document.getElementById('type-chart-subject-filter');
    if (select) {
      select.innerHTML = '<option value="">-- Tất cả Môn --</option>';
      data.bySubject.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s.mamon;       // dùng MaMon để filter chính xác
        opt.textContent = s.label; // hiện TenMon cho user
        select.appendChild(opt);
      });
    }

    // Tải bàiểu đồ Theo Dạng (mặc định: tất cả môn)
    await reloadTypeChart();
  } catch (e) { console.error('Analytics failed', e); }
}

async function reloadTypeChart() {
  const select = document.getElementById('type-chart-subject-filter');
  const selectedVal = select ? select.value : '';
  
  try {
    const url = selectedVal
      ? `/api/admin/stats/type-by-subject?mamon=${encodeURIComponent(selectedVal)}`
      : '/api/admin/stats/type-by-subject';
    const res = await fetch(url, { credentials: 'include' });
    const data = await res.json();

    // Hiển thị tên môn đang lọc trên tiêu đề
    const subtitle = document.querySelector('[data-type-chart-subtitle]');
    if (subtitle) subtitle.textContent = selectedVal ? `Đang xem: ${select.options[select.selectedIndex].text}` : 'Tất cả môn học';

    renderPieChart('pie-type-distribution', data, 'form');
  } catch (e) { console.error('Type chart reload failed', e); }
}

function renderPieChart(id, data, type, legendTbodyId = null) {
  const ctx = document.getElementById(id);
  if (!ctx) return;
  if (dashboardCharts[id]) dashboardCharts[id].destroy();

  const total = data.reduce((sum, d) => sum + d.value, 0);
  // Dùng bảng màu đủ lớn cho nhiều dạng bài
  const colors = [
    '#6366f1','#10b981','#f59e0b','#ef4444','#8b5cf6',
    '#ec4899','#06b6d4','#84cc16','#f97316','#14b8a6',
    '#e11d48','#7c3aed','#0ea5e9','#a855f7','#d97706',
    '#0891b2','#16a34a','#dc2626','#9333ea','#2563eb'
  ];
  const levelColors = { '1': '#10b981', '2': '#f59e0b', '3': '#f97316', '4': '#ef4444', '5': '#7c3aed' };
  const chartColors = type === 'level'
    ? data.map(d => levelColors[d.rawLvl] || '#cbd5e1')
    : colors.slice(0, data.length);

  // Ẩn legend của Chart.js — ta dùng bảng riêng bên phải cho cả 3 loại
  const showLegend = false;

  dashboardCharts[id] = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: data.map(d => d.label),
      datasets: [{
        data: data.map(d => d.value),
        backgroundColor: chartColors,
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      onClick: (evt, elements) => {
        if (elements.length > 0) {
          const index = elements[0].index;
          const label = data[index].label;
          const val = type === 'level' ? data[index].rawLvl : label;
          handleChartClick(type, val, label);
        }
      },
      plugins: {
        legend: {
          display: showLegend,
          position: 'bottom',
          labels: { boxWidth: 10, font: { size: 11 }, padding: 8 }
        },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const val = ctx.raw;
              const pct = total > 0 ? ((val / total) * 100).toFixed(1) : 0;
              return ` ${ctx.label}: ${val} bài (${pct}%)`;
            }
          }
        }
      },
      cutout: '70%'
    }
  });

// Render bảng legend bên phải tuỳ loại bàiểu đồ
  // legendTbodyId: override ID cho tbody (dùng khi cùng type nhưng render ở 2 section khác nhau)
  if (legendTbodyId) {
    renderLegendRows(legendTbodyId, data, chartColors, total);
  } else {
    if (type === 'form')    renderTypeLegendTable(data, chartColors, total);
    if (type === 'subject') renderSubjectLegendTable(data, chartColors, total);
    if (type === 'level')   renderLevelLegendTable(data, chartColors, total);
  }
}

function renderLegendRows(tbodyId, data, colors, total, labelKey) {
  const tbody = document.getElementById(tbodyId);
  if (!tbody) return;
  const sorted = data.map((d, i) => ({ ...d, color: colors[i] }))
                     .sort((a, b) => b.value - a.value);
  tbody.innerHTML = sorted.map(item => {
    const pct = total > 0 ? ((item.value / total) * 100).toFixed(1) : 0;
    return `
      <tr style="border-bottom:1px solid var(--border-color);cursor:pointer;transition:background 0.15s;"
          onmouseenter="this.style.background='var(--bg-color)'" onmouseleave="this.style.background=''">
        <td style="padding:9px 10px;display:flex;align-items:center;gap:8px;">
          <span style="width:11px;height:11px;border-radius:50%;background:${item.color};flex-shrink:0;display:inline-block;"></span>
          <span style="font-size:15px;color:var(--text-main);line-height:1.3;">${item.label}</span>
        </td>
        <td style="padding:9px 10px;text-align:center;font-weight:700;font-size:16px;color:var(--text-main);">${item.value}</td>
        <td style="padding:9px 6px;min-width:140px;">
          <div style="display:flex;align-items:center;gap:8px;">
            <div style="flex:1;height:7px;background:var(--border-color);border-radius:4px;overflow:hidden;">
              <div style="width:${pct}%;height:100%;background:${item.color};border-radius:4px;transition:width 0.6s;"></div>
            </div>
            <span style="font-size:14px;font-weight:600;color:var(--text-muted);min-width:38px;text-align:right;">${pct}%</span>
          </div>
        </td>
      </tr>`;
  }).join('');
}

function renderSubjectLegendTable(data, colors, total) {
  renderLegendRows('subject-chart-legend-tbody', data, colors, total);
}

function renderLevelLegendTable(data, colors, total) {
  renderLegendRows('level-chart-legend-tbody', data, colors, total);
}

function renderTypeLegendTable(data, colors, total) {
  const tbody = document.getElementById('type-chart-legend-tbody');
  if (!tbody) return;

  // Sắp xếp giảm dần theo số lượng
  const sorted = data.map((d, i) => ({ ...d, color: colors[i] }))
                     .sort((a, b) => b.value - a.value);

  tbody.innerHTML = sorted.map(item => {
    const pct = total > 0 ? ((item.value / total) * 100).toFixed(1) : 0;
    return `
      <tr style="border-bottom:1px solid #f8fafc; cursor:pointer; transition:background 0.15s;"
          onmouseenter="this.style.background='#f8fafc'" onmouseleave="this.style.background=''"
          onclick="handleChartClick('form', '${item.label.replace(/'/g,"\\'")}', '${item.label.replace(/'/g,"\\'")}')">
        <td style="padding:9px 10px; display:flex; align-items:center; gap:8px;">
          <span style="width:11px; height:11px; border-radius:50%; background:${item.color}; flex-shrink:0; display:inline-block;"></span>
          <span style="font-size:15px; color:var(--text-main); line-height:1.3;">${item.label}</span>
        </td>
        <td style="padding:9px 10px; text-align:center; font-weight:700; font-size:16px; color:var(--text-main);">${item.value}</td>
        <td style="padding:9px 6px; min-width:110px;">
          <div style="display:flex; align-items:center; gap:6px;">
            <div style="flex:1; height:7px; background:#f1f5f9; border-radius:4px; overflow:hidden;">
              <div style="width:${pct}%; height:100%; background:${item.color}; border-radius:4px; transition:width 0.6s;"></div>
            </div>
            <span style="font-size:15px; color:var(--text-muted); min-width:36px;">${pct}%</span>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

async function handleChartClick(type, value, displayLabel) {
  const modal = document.getElementById('lecturer-exercises-detail-modal');
  const tbody = document.getElementById('gv-detail-exercises-tbody');
  const title = document.getElementById('gv-detail-title');
  const statsEl = document.getElementById('gv-detail-stats');
  
  const typeLabels = { subject: '📚 Môn học', level: '⚡ Cấp độ', form: '📋 Dạng bài', difficulty: '🎯 Độ khó', lecturer: '👨‍🏫 Giảng viên' };
  title.textContent = (typeLabels[type]||'📊 Phân loại') + ': ' + displayLabel;
  modal.classList.add('show');
  tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:30px;"><div class="spinner"></div> Đang lọc dữ liệu...</td></tr>';
  if (statsEl) statsEl.innerHTML = '';

  try {
    const res = await fetch(`/api/admin/exercises/filter?type=${type}&value=${encodeURIComponent(value)}`, { credentials: 'include' });
    currentDetailExercises = await res.json();
    // Render stats header
    if (statsEl) {
      const total = currentDetailExercises.length;
      const subjects = [...new Set(currentDetailExercises.map(e=>e.TenMon).filter(Boolean))];
      const lecturers = [...new Set(currentDetailExercises.map(e=>e.TenGiangVien||e.MaGiangVien).filter(Boolean))];
      const levels = [...new Set(currentDetailExercises.map(e=>e.SkillLevel).filter(Boolean))];
      statsEl.innerHTML = `
        <div style="display:flex;gap:12px;margin-bottom:16px;flex-wrap:wrap">
          <div style="flex:1;min-width:120px;background:linear-gradient(135deg,#6366f1,#818cf8);border-radius:12px;padding:14px 16px;color:#fff">
            <div style="font-size:12px;font-weight:600;opacity:.8">Tổng bài tập</div>
            <div style="font-size:28px;font-weight:800">${total}</div>
          </div>
          <div style="flex:1;min-width:120px;background:linear-gradient(135deg,#10b981,#34d399);border-radius:12px;padding:14px 16px;color:#fff">
            <div style="font-size:12px;font-weight:600;opacity:.8">Môn học</div>
            <div style="font-size:28px;font-weight:800">${subjects.length}</div>
          </div>
          <div style="flex:1;min-width:120px;background:linear-gradient(135deg,#f59e0b,#fbbf24);border-radius:12px;padding:14px 16px;color:#fff">
            <div style="font-size:12px;font-weight:600;opacity:.8">Giảng viên</div>
            <div style="font-size:28px;font-weight:800">${lecturers.length}</div>
          </div>
          <div style="flex:1;min-width:120px;background:linear-gradient(135deg,#ef4444,#f87171);border-radius:12px;padding:14px 16px;color:#fff">
            <div style="font-size:12px;font-weight:600;opacity:.8">Skill Levels</div>
            <div style="font-size:28px;font-weight:800">${levels.length}</div>
          </div>
        </div>`;
    }
    renderDetailExercisesTable();
  } catch (err) { tbody.innerHTML = '<tr><td colspan="6">Lỗi: ' + err.message + '</td></tr>'; }
}
// =========================================================
// MODAL SỬA GIẢNG VIÊN - Đầy đủ (2 Tab)
// =========================================================
let editingGV = null; // Lưu data GV đang edit

async function openEditLecturerModal(magv) {
  const modal = document.getElementById('edit-lecturer-modal');
  modal.style.display = 'flex';
  switchEditTab('info');

  // Reset fields
  document.getElementById('edit-gv-id').value = magv;
  document.getElementById('edit-gv-code').value = magv;
  document.getElementById('edit-gv-name').value = '...';
  document.getElementById('edit-gv-username').value = '';
  document.getElementById('edit-gv-email').value = '';
  document.getElementById('edit-gv-pass').value = '';
  document.getElementById('edit-modal-title').textContent = 'Đang tải...';
  document.getElementById('edit-modal-subtitle').textContent = `Mã: ${magv}`;

  try {
    const res = await fetch(`/api/admin/lecturer/${magv}/detail`, { credentials: 'include' });
    const gv = await res.json();
    editingGV = gv;

    // Populate Tab 1
    const initials = (gv.TenGiangVien || '??').split(' ').map(w => w[0]).slice(-2).join('').toUpperCase();
    document.getElementById('edit-modal-avatar').textContent = initials;
    document.getElementById('edit-modal-title').textContent = gv.TenGiangVien;
    document.getElementById('edit-modal-subtitle').textContent = `Mã: ${gv.MaGiangVien} • ${(gv.Quyen||'').trim().toLowerCase() === 'admin' ? '🛡 Admin' : '👨‍🏫 Giảng Viên'}`;
    document.getElementById('edit-gv-name').value = gv.TenGiangVien || '';
    document.getElementById('edit-gv-username').value = gv.TenDangNhap || gv.MaGiangVien;
    document.getElementById('edit-gv-email').value = gv.Email || '';
    document.getElementById('edit-gv-quyen').value = gv.Quyen || 'lecturer';

    // Populate Tab 2
    renderEditSubjectList(gv.subjects || []);
  } catch (err) {
    showToast('Lỗi tải thông tin: ' + err.message, 'error');
    modal.style.display = 'none';
  }
}

function closeEditLecturerModal() {
  document.getElementById('edit-lecturer-modal').style.display = 'none';
  editingGV = null;
}

function switchEditTab(tab) {
  const infoContent = document.getElementById('edit-tab-info');
  const subContent  = document.getElementById('edit-tab-subjects');
  const infoBtn     = document.getElementById('edit-tab-info-btn');
  const subBtn      = document.getElementById('edit-tab-subjects-btn');

  const active   = 'color:#6366f1; border-bottom:2px solid #6366f1;';
  const inactive = 'color:var(--text-muted); border-bottom:2px solid transparent;';

  if (tab === 'info') {
    infoContent.style.display = 'block'; subContent.style.display = 'none';
    infoBtn.style.cssText += active; subBtn.style.cssText += inactive;
  } else {
    infoContent.style.display = 'none'; subContent.style.display = 'block';
    infoBtn.style.cssText += inactive; subBtn.style.cssText += active;
    document.getElementById('edit-add-subject-picker').style.display = 'none';
  }
}

async function saveEditLecturerInfo() {
  const id       = document.getElementById('edit-gv-id').value;
  const newId    = document.getElementById('edit-gv-code').value.trim();
  const name     = document.getElementById('edit-gv-name').value.trim();
  const username = document.getElementById('edit-gv-username').value.trim();
  const email    = document.getElementById('edit-gv-email').value.trim();
  const quyen    = document.getElementById('edit-gv-quyen').value;
  const newPass  = document.getElementById('edit-gv-pass').value;

  if (!name || !username || !newId) return showToast('Vui lòng nhập đầy đủ Mã, Họ tên và Tên đăng nhập', 'error');

  const btn = document.getElementById('save-edit-info-btn');
  btn.disabled = true; btn.textContent = '⏳ Đang lưu...';
  try {
    const res = await fetch(`/api/admin/lecturer/${id}/update`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newId, name, username, email, quyen, newPass }),
      credentials: 'include'
    });
    if (res.ok) {
      showToast(`✅ Đã cập nhật thông tin "${name}" th công`, 'success');
      closeEditLecturerModal();
      loadLecturersStats();
    } else {
      const err = await res.json();
      showToast('Lỗi: ' + (err.error || 'Không xác định'), 'error');
    }
  } catch (err) { showToast('Lỗi kết nối: ' + err.message, 'error'); }
  finally { btn.disabled = false; btn.innerHTML = '💾 Lưu Thay Đổi'; }
}

function renderEditSubjectList(subjects) {
  const container = document.getElementById('edit-subjects-list');
  if (!subjects.length) {
    container.innerHTML = '<div style="padding:20px; text-align:center; color:var(--text-muted); font-size:16px; border:1.5px dashed #e2e8f0; border-radius:8px;">Chưa có môn học nào được gán</div>';
    return;
  }
  container.innerHTML = subjects.map((s, i) => `
    <div style="display:flex; align-items:center; gap:10px; padding:10px 14px; border:1px solid #e2e8f0; border-radius:8px; margin-bottom:8px; background:white;">
      <div style="flex:1;">
        <div style="font-weight:600; font-size:16px; color:var(--text-main);">${s.TenMon}</div>
        <div style="font-size:14px; color:var(--text-muted); font-family:monospace;">${s.MaMon} • ${s.VaiTro || 'Giảng viên'}</div>
      </div>
      <div style="display:flex; gap:10px; align-items:center;">
        <label style="font-size:14px; color:var(--text-main); display:flex; align-items:center; gap:4px; cursor:pointer;">
          <input type="checkbox" data-si="${i}" data-field="xem" ${s.QuyenXem ? 'checked' : ''} style="accent-color:#6366f1;" onchange="updateEditSubjectPerm(${i},'xem',this.checked)"> Xem
        </label>
        <label style="font-size:14px; color:var(--text-main); display:flex; align-items:center; gap:4px; cursor:pointer;">
          <input type="checkbox" data-si="${i}" data-field="sua" ${s.QuyenSua ? 'checked' : ''} style="accent-color:#6366f1;" onchange="updateEditSubjectPerm(${i},'sua',this.checked)"> Sửa
        </label>
        <label style="font-size:14px; color:var(--text-main); display:flex; align-items:center; gap:4px; cursor:pointer;">
          <input type="checkbox" data-si="${i}" data-field="xoa" ${s.QuyenXoa ? 'checked' : ''} style="accent-color:#ef4444;" onchange="updateEditSubjectPerm(${i},'xoa',this.checked)"> Xóa
        </label>
        <button onclick="removeSubjectFromEdit('${s.MaMon}')"
          style="padding:4px 10px; background:#fef2f2; color:#dc2626; border:1px solid #fecaca; border-radius:5px; font-size:14px; cursor:pointer; font-weight:600;">✕</button>
      </div>
      <button onclick="saveEditSubjects()" style="padding:5px 10px; background:#6366f1; color:white; border:none; border-radius:5px; font-size:12px; cursor:pointer; font-weight:600; white-space:nowrap;">💾 Lưu</button>
    </div>
  `).join('');
}

function updateEditSubjectPerm(idx, field, val) {
  if (!editingGV || !editingGV.subjects[idx]) return;
  const map = { xem: 'QuyenXem', sua: 'QuyenSua', xoa: 'QuyenXoa' };
  editingGV.subjects[idx][map[field]] = val;
}

function removeSubjectFromEdit(mamon) {
  if (!editingGV) return;
  editingGV.subjects = editingGV.subjects.filter(s => s.MaMon !== mamon);
  renderEditSubjectList(editingGV.subjects);
}

async function showAddSubjectToGV() {
  const picker = document.getElementById('edit-add-subject-picker');
  const tagsEl = document.getElementById('edit-add-subject-tags');
  picker.style.display = 'block';
  if (typeof switchEditAddSubjectTab === 'function') switchEditAddSubjectTab('pick');
  tagsEl.innerHTML = '<span style="color:var(--text-muted); font-size:15px;">Đang tải...</span>';

  try {
    const res = await fetch('/api/admin/subjects', { credentials: 'include' });
    const allSubs = await res.json();
    const assigned = (editingGV?.subjects || []).map(s => s.MaMon);
    const available = allSubs.filter(s => !assigned.includes(s.MaMon));

    if (!available.length) {
      tagsEl.innerHTML = '<span style="color:var(--text-muted); font-size:15px;">Tất cả môn đã được gán</span>';
      return;
    }

    // Reset selection
    picker._selected = [];
    tagsEl.innerHTML = '';
    available.forEach(s => {
      const tag = document.createElement('span');
      tag.textContent = s.TenMon;
      tag.title = s.MaMon;
      tag.style.cssText = 'cursor:pointer; padding:5px 12px; border-radius:20px; font-size:15px; font-weight:500; border:1.5px solid #e2e8f0; background:var(--bg-color,#f8fafc); color:var(--text-muted); transition:all 0.15s;';
      tag.onclick = () => {
        const sel = picker._selected;
        if (sel.includes(s.MaMon)) {
          picker._selected = sel.filter(x => x !== s.MaMon);
          tag.style.cssText = 'cursor:pointer; padding:5px 12px; border-radius:20px; font-size:15px; font-weight:500; border:1.5px solid #e2e8f0; background:var(--bg-color,#f8fafc); color:var(--text-muted); transition:all 0.15s;';
        } else {
          picker._selected.push(s.MaMon);
          tag.style.cssText = 'cursor:pointer; padding:5px 12px; border-radius:20px; font-size:15px; font-weight:500; border:1.5px solid #6366f1; background:#6366f1; color:white; transition:all 0.15s;';
        }
      };
      tagsEl.appendChild(tag);
    });
    picker._allSubs = available;
  } catch (err) { tagsEl.innerHTML = '<span style="color:#ef4444;">Lỗi tải môn học</span>'; }
}

async function confirmAddSubjectsToGV() {
  const picker = document.getElementById('edit-add-subject-picker');
  const selected = picker._selected || [];
  if (!selected.length) return showToast('Vui lòng chọn ít nhất 1 môn', 'error');

  const allSubs = picker._allSubs || [];
  selected.forEach(mamon => {
    const sub = allSubs.find(s => s.MaMon === mamon);
    if (sub && editingGV) {
      editingGV.subjects.push({ MaMon: sub.MaMon, TenMon: sub.TenMon, VaiTro: 'Giảng viên', QuyenXem: 1, QuyenSua: 1, QuyenXoa: 0 });
    }
  });
  renderEditSubjectList(editingGV.subjects);
  picker.style.display = 'none';
}

function switchEditAddSubjectTab(tab) {
  const contentPick = document.getElementById('edit-tab-content-pick');
  const contentAdd  = document.getElementById('edit-tab-content-add');
  const btnPick     = document.getElementById('edit-tab-pick-btn');
  const btnAdd      = document.getElementById('edit-tab-add-btn');

  if (!contentPick || !contentAdd || !btnPick || !btnAdd) return;

  const baseStyle = 'padding:5px 14px; border:none; border-radius:6px; font-size:14px; font-weight:600; cursor:pointer; transition:all 0.15s;';

  if (tab === 'pick') {
    contentPick.style.display = 'block';
    contentAdd.style.display = 'none';
    btnPick.style.cssText = baseStyle + 'background:#fff; color:#2563eb; box-shadow:0 1px 3px rgba(0,0,0,0.1);';
    btnAdd.style.cssText  = baseStyle + 'background:transparent; color:var(--text-muted); box-shadow:none;';
  } else {
    contentPick.style.display = 'none';
    contentAdd.style.display = 'block';
    btnPick.style.cssText = baseStyle + 'background:transparent; color:var(--text-muted); box-shadow:none;';
    btnAdd.style.cssText  = baseStyle + 'background:#fff; color:#2563eb; box-shadow:0 1px 3px rgba(0,0,0,0.1);';
  }
}

async function createAndAssignSubjectInEdit() {
  const mamonEl  = document.getElementById('edit-new-sub-mamon');
  const tenmonEl = document.getElementById('edit-new-sub-tenmon');
  const statusEl = document.getElementById('edit-new-sub-status');
  const btn      = document.getElementById('btn-edit-create-subject');

  const mamon  = mamonEl.value.trim().toUpperCase();
  const tenmon = tenmonEl.value.trim();

  if (!mamon || !tenmon) {
    statusEl.textContent = '⚠ Vui lòng điền đầy đủ Mã Môn và Tên Môn';
    statusEl.style.color = '#f59e0b';
    return;
  }
  if (mamon.length > 10) {
    statusEl.textContent = '⚠ Mã môn tối đa 10 ký tự';
    statusEl.style.color = '#ef4444';
    return;
  }

  btn.disabled = true;
  btn.textContent = '⏳ Đang tạo...';
  statusEl.textContent = '';

  try {
    const res = await fetch('/api/admin/subjects/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mamon, tenmon }),
      credentials: 'include'
    });
    const result = await res.json();

    if (res.ok) {
      if (typeof allSubjects !== 'undefined') {
        allSubjects.push({ MaMon: mamon, TenMon: tenmon, TotalExercises: 0, TotalLecturers: 0 });
      }
      
      if (editingGV) {
        if (!editingGV.subjects.some(s => s.MaMon === mamon)) {
          editingGV.subjects.push({ MaMon: mamon, TenMon: tenmon, VaiTro: 'Giảng viên', QuyenXem: 1, QuyenSua: 1, QuyenXoa: 0 });
        }
        renderEditSubjectList(editingGV.subjects);
      }
      
      mamonEl.value = '';
      tenmonEl.value = '';
      
      showToast(`✅ Đã tạo môn "${tenmon}" và gán vào danh sách!`, 'success');
      document.getElementById('edit-add-subject-picker').style.display = 'none';
      switchEditAddSubjectTab('pick');
    } else {
      statusEl.textContent = '❌ ' + (result.error || 'Lỗi không xác định');
      statusEl.style.color = '#ef4444';
    }
  } catch (err) {
    statusEl.textContent = '❌ Lỗi kết nối: ' + err.message;
    statusEl.style.color = '#ef4444';
  } finally {
    btn.disabled = false;
    btn.textContent = '✨ Tạo & Gán Môn';
  }
}

async function saveEditSubjects() {
  if (!editingGV) return;
  const id = editingGV.MaGiangVien;
  const subjects = editingGV.subjects.map(s => ({
    mamon: s.MaMon, vaiTro: s.VaiTro || 'Giảng viên',
    quyenXem: s.QuyenXem ? 1 : 0, quyenSua: s.QuyenSua ? 1 : 0, quyenXoa: s.QuyenXoa ? 1 : 0
  }));
  try {
    const res = await fetch(`/api/admin/lecturer/${id}/subjects`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subjects }),
      credentials: 'include'
    });
    if (res.ok) { showToast('✅ Đã cập nhật môn học th công', 'success'); loadLecturersStats(); }
    else { const e = await res.json(); showToast('Lỗi: ' + e.error, 'error'); }
  } catch (err) { showToast('Lỗi kết nối', 'error'); }
}

// Backward compat alias
function openEditLecturerInfoModal(id, name, email) { openEditLecturerModal(id); }
function closeEditLecturerInfoModal() { closeEditLecturerModal(); }

let currentDetailExercises = [];

async function openLecturerExercisesModal(id, name) {
  const modal = document.getElementById('lecturer-exercises-detail-modal');
  const tbody = document.getElementById('gv-detail-exercises-tbody');
  const title = document.getElementById('gv-detail-title');
  const subtitle = document.getElementById('gv-detail-subtitle');
  if (title) title.textContent = `Bài tập của: ${name}`;
  if (subtitle) subtitle.textContent = 'Đang tải dữ liệu...';
  modal.classList.add('show');
  tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:30px;color:var(--text-muted);">⏳ Đang tải...</td></tr>';
  document.getElementById('gv-detail-search').value = '';

  try {
    const res = await fetch(`/api/admin/lecturer/${id}/exercises`, { credentials: 'include' });
    currentDetailExercises = await res.json();
    if (subtitle) subtitle.textContent = `${currentDetailExercises.length} bài tập — bấm tên bài để xem chi tiết`;
    renderDetailExercisesTable();
  } catch (err) { tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:24px;color:#ef4444;">Lỗi: ' + err.message + '</td></tr>'; }
}

function filterLecturerExercises() {
  renderDetailExercisesTable(document.getElementById('gv-detail-search').value.toLowerCase());
}

function renderDetailExercisesTable(query = '') {
  const tbody = document.getElementById('gv-detail-exercises-tbody');
  tbody.innerHTML = '';
  const searchStr = query ? query.normalize('NFC').toLowerCase() : '';
  const filtered = currentDetailExercises.filter(ex =>
    (ex.TenBaiTap||'').normalize('NFC').toLowerCase().includes(searchStr) ||
    (ex.MaBaiTap||'').normalize('NFC').toLowerCase().includes(searchStr) ||
    (ex.TenMon||'').normalize('NFC').toLowerCase().includes(searchStr)
  );
  const lvlColors = {1:'#10b981',2:'#06b6d4',3:'#f59e0b',4:'#f97316',5:'#8b5cf6'};
  const lvlNames = {1:'Lắp ghép cú pháp',2:'Luồng rẽ nhánh',3:'Vòng lặp & Mảng',4:'Hàm & Cấu trúc',5:'Tư duy giải thuật'};
  const diffColors = {'Dễ':['#dcfce7','#166534'],'Trung bình':['#fef9c3','#854d0e'],'Khó':['#fee2e2','#991b1b']};
  filtered.forEach(ex => {
    const row = document.createElement('tr');
    row.style.cssText = 'background:var(--card-bg, #fff); transition:background 0.15s;cursor:default;border-bottom:1px solid var(--border-color,#e2e8f0);';
    row.onmouseenter = () => row.style.background = '#f8fafc';
    row.onmouseleave = () => row.style.background = 'var(--card-bg, #fff)';
    const lvl = ex.SkillLevel || 1;
    const col = lvlColors[lvl] || '#94a3b8';
    const dc = diffColors[ex.TenDoKho] || ['#f1f5f9','#475569'];
    // Fix timezone: backend sends Vietnam time as UTC. Strip 'Z' to treat as local.
    const dateStr = ex.UpdatedAt ? ex.UpdatedAt.replace('Z', '') : null;
    const fmt = dateStr ? new Date(dateStr).toLocaleDateString('vi-VN') : '—';
    row.innerHTML = `
      <td style="padding:12px 14px;font-family:monospace;font-size:15px;color:#6366f1;font-weight:600;">${ex.MaBaiTap}</td>
      <td style="padding:12px 14px;">
        <div style="font-weight:600;color:var(--text-main);margin-bottom:2px;">${ex.TenBaiTap}</div>
        <div style="font-size:14px;color:var(--text-muted);">${ex.TenMon||'—'}</div>
      </td>
      <td style="padding:12px 14px;">
        <span style="background:${dc[0]};color:${dc[1]};padding:3px 10px;border-radius:20px;font-size:14px;font-weight:600;">${ex.TenDoKho||'—'}</span>
      </td>
      <td style="padding:12px 14px;text-align:center;">
        <span title="${lvlNames[lvl]||''}" style="display:inline-flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:8px;background:${col}20;color:${col};font-size:15px;font-weight:800;border:1px solid ${col}44;">L${lvl}</span>
      </td>
      <td style="padding:12px 14px;font-size:15px;color:var(--text-muted);">${ex.TenGiangVien||ex.MaGiangVien||'—'}</td>
      <td style="padding:12px 14px;font-size:14px;color:var(--text-muted);">${fmt}</td>
    `;
    tbody.appendChild(row);
  });
  if (filtered.length === 0) tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:30px;color:var(--text-muted);">Không tìm thấy bài tập nào</td></tr>';
}

function closeLecturerExercisesModal() {
  document.getElementById('lecturer-exercises-detail-modal').classList.remove('show');
}

// Lecturer Add/Edit Logic
let allSubjects = [];
let selectedSubjectsForNewGV = [];

async function openAddLecturerModal() {
  document.getElementById('lecturer-modal-title').textContent = 'Thêm Giảng Viên Mới';
  document.getElementById('lecturer-id').value = '';
  document.getElementById('lecturer-id').disabled = false;
  document.getElementById('lecturer-name').value = '';
  document.getElementById('lecturer-email').value = '';
  document.getElementById('lecturer-password').value = '';
  document.getElementById('lecturer-password').required = true;
  document.getElementById('login-info-preview').style.display = 'none';
  document.getElementById('pw-strength-fill').style.width = '0%';
  document.getElementById('pw-strength-text').textContent = '';
  document.getElementById('perm-xem').checked = true;
  document.getElementById('perm-sua').checked = true;
  document.getElementById('perm-xoa').checked = false;
  selectedSubjectsForNewGV = [];
  
  await loadAllSubjectsForPicker();
  document.getElementById('lecturer-modal').classList.add('show');
}

function closeLecturerModal() {
  document.getElementById('lecturer-modal').classList.remove('show');
}

function previewLoginInfo() {
  const id = document.getElementById('lecturer-id').value.trim();
  const preview = document.getElementById('login-info-preview');
  const usernameEl = document.getElementById('preview-username');
  if (id.length > 0) {
    preview.style.display = 'block';
    usernameEl.textContent = id;
  } else {
    preview.style.display = 'none';
  }
}

function checkPasswordStrength(pw) {
  const fill = document.getElementById('pw-strength-fill');
  const text = document.getElementById('pw-strength-text');
  if (!fill || !text) return;
  let strength = 0;
  if (pw.length >= 6) strength++;
  if (pw.length >= 10) strength++;
  if (/[A-Z]/.test(pw)) strength++;
  if (/[0-9]/.test(pw)) strength++;
  if (/[^A-Za-z0-9]/.test(pw)) strength++;
  
  const levels = [
    { pct: '0%', color: '#e2e8f0', label: '' },
    { pct: '25%', color: '#ef4444', label: 'Yếu' },
    { pct: '50%', color: '#f59e0b', label: 'Trung bình' },
    { pct: '75%', color: '#3b82f6', label: 'Khá' },
    { pct: '100%', color: '#10b981', label: 'Mạnh' },
    { pct: '100%', color: '#059669', label: 'Rất mạnh' }
  ];
  const lvl = levels[Math.min(strength, 5)];
  fill.style.width = lvl.pct;
  fill.style.background = lvl.color;
  text.textContent = lvl.label;
  text.style.color = lvl.color;
}

function togglePwdVisibàility(inputId, btn) {
  const input = document.getElementById(inputId);
  if (input.type === 'password') {
    input.type = 'text';
    btn.textContent = '🙈';
  } else {
    input.type = 'password';
    btn.textContent = '👁';
  }
}

async function loadAllSubjectsForPicker() {
  const picker = document.getElementById('subject-tags-picker');
  if (!picker) return;
  picker.innerHTML = '<span style="color:var(--text-muted); font-size:14px;">Đang tải...</span>';
  
  try {
    const res = await fetch('/api/admin/subjects', { credentials: 'include' });
    allSubjects = await res.json();
    renderSubjectPicker();
  } catch (err) { picker.innerHTML = '<span style="color:#ef4444; font-size:14px;">Lỗi tải môn học</span>'; }
}

function renderSubjectPicker() {
  const picker = document.getElementById('subject-tags-picker');
  const countEl = document.getElementById('selected-subjects-count');
  picker.innerHTML = '';

  if (allSubjects.length === 0) {
    picker.innerHTML = '<span style="color:var(--text-muted); font-size:14px;">Không có môn học nào</span>';
    return;
  }

  allSubjects.forEach(s => {
    const isSelected = selectedSubjectsForNewGV.includes(s.MaMon);
    const tag = document.createElement('span');
    tag.textContent = s.TenMon;
    tag.title = `Mã: ${s.MaMon}`;
    tag.style.cssText = `cursor:pointer; padding:5px 12px; border-radius:20px; font-size:14px; font-weight:500; transition:all 0.15s; user-select:none; ${
      isSelected
        ? 'background:#6366f1; color:#fff; border:1.5px solid #6366f1;'
        : 'background:#f1f5f9; color:var(--text-muted); border:1.5px solid #e2e8f0;'
    }`;
    tag.onmouseenter = () => { if (!isSelected) tag.style.borderColor = '#6366f1'; };
    tag.onmouseleave = () => { if (!isSelected) tag.style.borderColor = '#e2e8f0'; };
    tag.onclick = () => {
      if (isSelected) selectedSubjectsForNewGV = selectedSubjectsForNewGV.filter(id => id !== s.MaMon);
      else selectedSubjectsForNewGV.push(s.MaMon);
      renderSubjectPicker();
    };
    picker.appendChild(tag);
  });

  if (countEl) {
    countEl.textContent = selectedSubjectsForNewGV.length > 0
      ? `✅ Đã chọn ${selectedSubjectsForNewGV.length} môn học`
      : 'Chưa chọn môn nào';
  }
}

function switchSubjectTab(tab) {
  const pickContent = document.getElementById('tab-content-pick');
  const addContent  = document.getElementById('tab-content-add');
  const pickBtn     = document.getElementById('tab-pick-btn');
  const addBtn      = document.getElementById('tab-add-btn');

  if (tab === 'pick') {
    pickContent.style.display = 'block';
    addContent.style.display  = 'none';
    pickBtn.style.background  = '#6366f1';
    pickBtn.style.color       = 'white';
    addBtn.style.background   = 'transparent';
    addBtn.style.color        = '#64748b';
  } else {
    pickContent.style.display = 'none';
    addContent.style.display  = 'block';
    addBtn.style.background   = '#6366f1';
    addBtn.style.color        = 'white';
    pickBtn.style.background  = 'transparent';
    pickBtn.style.color       = '#64748b';
    // Reset form
    document.getElementById('new-subject-mamon').value  = '';
    document.getElementById('new-subject-tenmon').value = '';
    document.getElementById('new-subject-status').textContent = '';
  }
}

async function createAndSelectSubject() {
  const mamonEl  = document.getElementById('new-subject-mamon');
  const tenmonEl = document.getElementById('new-subject-tenmon');
  const statusEl = document.getElementById('new-subject-status');
  const btn      = document.getElementById('btn-create-subject');

  const mamon  = mamonEl.value.trim().toUpperCase();
  const tenmon = tenmonEl.value.trim();

  if (!mamon || !tenmon) {
    statusEl.textContent = '⚠ Vui lòng điền đầy đủ Mã Môn và Tên Môn';
    statusEl.style.color = '#f59e0b';
    return;
  }
  if (mamon.length > 10) {
    statusEl.textContent = '⚠ Mã môn tối đa 10 ký tự';
    statusEl.style.color = '#ef4444';
    return;
  }

  btn.disabled = true;
  btn.textContent = '⏳ Đang tạo...';
  statusEl.textContent = '';

  try {
    const res = await fetch('/api/admin/subjects/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mamon, tenmon }),
      credentials: 'include'
    });
    const result = await res.json();

    if (res.ok) {
      // Thêm môn mới vào danh sách local
      allSubjects.push({ MaMon: mamon, TenMon: tenmon, TotalExercises: 0, TotalLecturers: 0 });
      // Tự động chọn môn vừa tạo
      if (!selectedSubjectsForNewGV.includes(mamon)) {
        selectedSubjectsForNewGV.push(mamon);
      }
      // Render lại picker
      renderSubjectPicker();
      // Chuyển về tab chọn để thấy môn vừa được chọn
      switchSubjectTab('pick');
      showToast(`✅ Đã tạo môn "${tenmon}" và gán cho giảng viên`, 'success');
    } else {
      statusEl.textContent = '❌ ' + (result.error || 'Lỗi không xác định');
      statusEl.style.color = '#ef4444';
    }
  } catch (err) {
    statusEl.textContent = '❌ Lỗi kết nối: ' + err.message;
    statusEl.style.color = '#ef4444';
  } finally {
    btn.disabled = false;
    btn.textContent = '✅ Tạo & Gán Môn';
  }
}

async function saveLecturer(e) {
  e.preventDefault();
  const btn = document.getElementById('save-lecturer-btn');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner" style="width:14px;height:14px;"></span> Đang tạo...';

  const magv = document.getElementById('lecturer-id').value.trim();
  const ten  = document.getElementById('lecturer-name').value.trim();
  const email = document.getElementById('lecturer-email').value.trim() || `${magv}@school.edu.vn`;
  const pass = document.getElementById('lecturer-password').value;
  const permXem = document.getElementById('perm-xem').checked;
  const permSua = document.getElementById('perm-sua').checked;
  const permXoa = document.getElementById('perm-xoa').checked;

  try {
    const res = await fetch('/api/admin/lecturer/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ magv, ten, pass, email, subjects: selectedSubjectsForNewGV, permXem, permSua, permXoa }),
      credentials: 'include'
    });
    const result = await res.json();
    if (res.ok) {
      closeLecturerModal();
      // Success toast
      showToast(`✅ Đã tạo tài khoản "${ten}" th công! Tên đăng nhập: ${magv}`, 'success');
      loadLecturersStats();
    } else {
      showToast('Lỗi: ' + (result.error || 'Không xác định'), 'error');
    }
  } catch (err) { showToast('Lỗi kết nối: ' + err.message, 'error'); }
  finally {
    btn.disabled = false;
    btn.innerHTML = '<span>✅</span> Tạo Tài Khoản';
  }
}

function showToast(msg, type = 'success') {
  let toast = document.getElementById('admin-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'admin-toast';
    toast.style.cssText = 'position:fixed; bottom:24px; right:24px; z-index:9999; padding:14px 20px; border-radius:10px; font-size:15px; font-weight:600; max-width:360px; box-shadow:0 8px 24px rgba(0,0,0,0.15); transition:all 0.3s; opacity:0;';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.background = type === 'success' ? '#10b981' : '#ef4444';
  toast.style.color = '#fff';
  toast.style.opacity = '1';
  setTimeout(() => { toast.style.opacity = '0'; }, 3500);
}

async function deleteLecturer(magv, name) {
  showCustomConfirm(`CẢNH BÁO: Bạn có chắc chắn muốn XÓA giảng viên <b>${name} (${magv})</b> không?<br><br><span style="font-size:14px;color:var(--text-muted)">Lưu ý: Nếu giảng viên này đã tạo bài tập, chức năng này sẽ báo lỗi vì liên quan đến dữ liệu hệ thống. Hãy sử dụng chức năng <b>Khóa</b> thay thế nếu không thể xóa.</span>`, async () => {
    try {
      const res = await fetch(`/api/admin/lecturer/${magv}/delete`, { method: 'DELETE', credentials: 'include' });
      const data = await res.json();
      if (res.ok) {
        showToast(`Đã xóa giảng viên ${name}`, 'success');
        loadLecturersStats();
      } else {
        alert(`Không thể xóa:\n${data.error || 'Có lỗi xảy ra'}`);
      }
    } catch (err) {
      alert('Lỗi kết nối tới máy chủ');
    }
  });
}

// ─────────────────────────────────────────────────
// KHÓA / MỞ KHÓA GIẢNG VIÊN — Full Modal System
// ─────────────────────────────────────────────────
function openLockModal(magv, tenGV, subjectList, exerciseCount) {
  // Reset form
  document.getElementById('lock-gv-id').value = magv;
  document.getElementById('lock-reason-preset').value = '';
  document.getElementById('lock-reason-text').style.display = 'none';
  document.getElementById('lock-reason-text').value = '';
  document.getElementById('lock-duration-val').value = '';
  document.getElementById('lock-until-val').value = '';
  document.getElementById('lock-custom-date').style.display = 'none';
  document.getElementById('lock-until-preview').style.display = 'none';
  document.querySelectorAll('.lock-dur-btn').forEach(b => {
    b.style.background = 'var(--card-bg)';
    b.style.color = 'var(--text-main)';
    b.style.borderColor = 'var(--border-color)';
  });

  // Fill GV info
  const initials = (tenGV || magv).split(' ').map(w => w[0]).join('').substring(0,2).toUpperCase();
  document.getElementById('lock-gv-avatar').textContent = initials;
  document.getElementById('lock-gv-name').textContent = tenGV || magv;
  document.getElementById('lock-gv-meta').textContent =
    `Mã: ${magv}  ·  ${subjectList || 'Chưa phân công'}  ·  ${exerciseCount || 0} bài tập`;

  // Reset history
  document.getElementById('lock-history-panel').style.display = 'none';
  document.getElementById('lock-history-arrow').textContent = '▼ Xem';
  document.getElementById('lock-history-tbody').innerHTML = '<span style="color:var(--text-muted)">Đang tải...</span>';

  document.getElementById('lock-gv-modal').style.display = 'block';
  document.body.style.overflow = 'hidden';
}

function closeLockModal() {
  document.getElementById('lock-gv-modal').style.display = 'none';
  document.body.style.overflow = '';
}

function openUnlockModal(magv, tenGV) {
  document.getElementById('unlock-gv-id').value = magv;
  document.getElementById('unlock-gv-text').innerHTML =
    `Bạn có chắc chắn muốn <strong>mở khóa</strong> tài khoản của <strong>${tenGV || magv}</strong>?<br>
     <span style="font-size:14px;color:var(--text-muted);margin-top:6px;display:block;">GV sẽ có thể đăng nhập lại ngay sau khi mở khóa.</span>`;
  document.getElementById('unlock-gv-modal').style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeUnlockModal() {
  document.getElementById('unlock-gv-modal').style.display = 'none';
  document.body.style.overflow = '';
}

function applyLockReasonPreset() {
  const sel = document.getElementById('lock-reason-preset').value;
  const txt = document.getElementById('lock-reason-text');
  if (sel === 'other') {
    txt.style.display = 'block';
    txt.value = '';
    txt.focus();
  } else {
    txt.style.display = 'none';
    txt.value = sel;
  }
}

function selectDuration(btn, label, days) {
  document.querySelectorAll('.lock-dur-btn').forEach(b => {
    b.style.background = 'var(--card-bg)';
    b.style.color = 'var(--text-main)';
    b.style.borderColor = 'var(--border-color)';
  });
  btn.style.background = '#ef4444';
  btn.style.color = 'white';
  btn.style.borderColor = '#ef4444';

  const customDateEl = document.getElementById('lock-custom-date');
  const preview = document.getElementById('lock-until-preview');

  if (label === 'custom') {
    customDateEl.style.display = 'block';
    customDateEl.min = new Date().toISOString().split('T')[0];
    document.getElementById('lock-duration-val').value = 'custom';
    document.getElementById('lock-until-val').value = '';
    preview.style.display = 'none';
  } else {
    customDateEl.style.display = 'none';
    document.getElementById('lock-duration-val').value = label;
    if (days === 0) {
      document.getElementById('lock-until-val').value = '';
      preview.textContent = '⚠️ Tài khoản bị khóa vĩnh viễn cho đến khi admin mở khóa thủ công.';
      preview.style.display = 'block';
      preview.style.color = '#ef4444';
    } else {
      const until = new Date();
      until.setDate(until.getDate() + days);
      document.getElementById('lock-until-val').value = until.toISOString();
      preview.textContent = `🔒 Tài khoản sẽ bị khóa đến: ${until.toLocaleDateString('vi-VN', {day:'2-digit',month:'2-digit',year:'numeric'})}`;
      preview.style.display = 'block';
      preview.style.color = 'var(--text-muted)';
    }
  }
}

function updateLockUntilFromDate() {
  const d = document.getElementById('lock-custom-date').value;
  if (!d) return;
  document.getElementById('lock-until-val').value = new Date(d).toISOString();
  document.getElementById('lock-duration-val').value = 'Tùy chọn';
  const preview = document.getElementById('lock-until-preview');
  preview.textContent = `🔒 Tài khoản sẽ bị khóa đến: ${new Date(d).toLocaleDateString('vi-VN')}`;
  preview.style.display = 'block';
}

async function confirmLockGV() {
  const magv    = document.getElementById('lock-gv-id').value;
  const preset  = document.getElementById('lock-reason-preset').value;
  const reason  = preset === 'other'
    ? document.getElementById('lock-reason-text').value.trim()
    : document.getElementById('lock-reason-text').value || preset;
  const duration  = document.getElementById('lock-duration-val').value;
  const blockUntil = document.getElementById('lock-until-val').value;

  if (!reason) { showToast('⚠️ Vui lòng chọn hoặc nhập lý do khóa', 'error'); return; }
  if (!duration) { showToast('⚠️ Vui lòng chọn thời hạn khóa', 'error'); return; }

  try {
    const res = await fetch('/api/admin/lecturer/lock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lecturer_id: magv, reason, duration, blockUntil: blockUntil || null }),
      credentials: 'include'
    });
    const data = await res.json();
    if (res.ok && data.success) {
      showToast(`🔒 Đã khóa tài khoản ${magv} th công`, 'error');
      closeLockModal();
      loadLecturersStats();
    } else {
      showToast('Lỗi: ' + (data.error || 'Không xác định'), 'error');
    }
  } catch (err) { showToast('Lỗi kết nối: ' + err.message, 'error'); }
}

async function confirmUnlockGV() {
  const magv = document.getElementById('unlock-gv-id').value;
  try {
    const res = await fetch('/api/admin/lecturer/unlock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ magv }),
      credentials: 'include'
    });
    const data = await res.json();
    if (res.ok && data.success) {
      showToast(`🔓 Đã mở khóa tài khoản ${magv}`, 'success');
      closeUnlockModal();
      loadLecturersStats();
    } else {
      showToast('Lỗi: ' + (data.error || 'Không xác định'), 'error');
    }
  } catch (err) { showToast('Lỗi kết nối: ' + err.message, 'error'); }
}

async function toggleLockHistory() {
  const panel = document.getElementById('lock-history-panel');
  const arrow = document.getElementById('lock-history-arrow');
  const magv  = document.getElementById('lock-gv-id').value;
  const isOpen = panel.style.display !== 'none';
  panel.style.display = isOpen ? 'none' : 'block';
  arrow.textContent = isOpen ? '▼ Xem' : '▲ Ẩn';
  if (!isOpen && magv) {
    try {
      const r = await fetch(`/api/admin/lecturer/${magv}/lock-history`, { credentials: 'include' });
      const logs = await r.json();
      const tbody = document.getElementById('lock-history-tbody');
      if (!logs.length) {
        tbody.innerHTML = '<div style="text-align:center;padding:16px;color:var(--text-muted);">Chưa có lịch sử khóa</div>';
        return;
      }
      tbody.innerHTML = logs.map(l => {
        const isLock = l.Action === 'LOCK';
        const dt = l.ActionTime ? new Date(l.ActionTime).toLocaleString('vi-VN') : '—';
        const until = l.BlockUntil ? new Date(l.BlockUntil).toLocaleDateString('vi-VN') : (isLock ? 'Vĩnh viễn' : '—');
        return `<div style="border-bottom:1px solid var(--border-color);padding:10px 0;display:flex;gap:10px;align-items:flex-start;">
          <span style="font-size:19px;">${isLock ? '🔒' : '🔓'}</span>
          <div style="flex:1;min-width:0;">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <span style="font-weight:700;font-size:15px;color:${isLock?'#ef4444':'#10b981'};">${isLock?'Khóa':'Mở khóa'}</span>
              <span style="font-size:12px;color:var(--text-muted);">${dt}</span>
            </div>
            ${l.Reason ? `<div style="font-size:14px;color:var(--text-main);margin-top:2px;">${l.Reason}</div>` : ''}
            <div style="font-size:12px;color:var(--text-muted);margin-top:2px;">
              ${l.Duration ? `Thời hạn: ${l.Duration}` : ''} ${until !== '—' && isLock ? ` · đến ${until}` : ''} · Bởi: ${l.BlockedBy||'admin'}
            </div>
          </div>
        </div>`;
      }).join('');
    } catch(e) {
      document.getElementById('lock-history-tbody').innerHTML = '<div style="color:var(--text-muted);padding:10px;">Không thể tải lịch sử</div>';
    }
  }
}

// Legacy (gọi từ nút Khóa cũ trong table — tự động dispatch đúng modal)
async function toggleLecturerLock(magv, lock, tenGV, subjectList, exerciseCount) {
  if (lock) {
    openLockModal(magv, tenGV, subjectList, exerciseCount);
  } else {
    openUnlockModal(magv, tenGV);
  }
}

async function viewLockDetails(magv) {
  try {
    const r = await fetch(`/api/admin/lecturer/${magv}/lock-history`, { credentials: 'include' });
    const logs = await r.json();
    if (!logs || logs.length === 0) {
      showToast('Không tìm thấy chi tiết khóa', 'error');
      return;
    }
    const latestLock = logs.find(l => l.Action === 'LOCK');
    if (!latestLock) {
      showToast('Không tìm thấy chi tiết khóa', 'error');
      return;
    }
    const dt = latestLock.ActionTime ? new Date(latestLock.ActionTime).toLocaleString('vi-VN') : '—';
    const until = latestLock.BlockUntil ? new Date(latestLock.BlockUntil).toLocaleDateString('vi-VN') : 'Vĩnh viễn';
    
    let html = `
      <div style="font-size:15px; line-height:1.6; text-align:left;">
        <div style="margin-bottom:8px;"><b>🔒 Khóa bởi:</b> ${latestLock.BlockedBy || 'admin'}</div>
        <div style="margin-bottom:8px;"><b>⏱ Thời gian khóa:</b> ${dt}</div>
        <div style="margin-bottom:8px;"><b>⏳ Hết hạn:</b> <span style="color:#ef4444; font-weight:600;">${until}</span> ${latestLock.Duration ? `(${latestLock.Duration})` : ''}</div>
        <div style="margin-bottom:8px; padding:10px; background:var(--bg-color); border-radius:8px; border:1px solid var(--border-color);">
          <b style="color:var(--text-muted); font-size:13px; display:block; margin-bottom:4px;">LÝ DO KHÓA:</b>
          ${latestLock.Reason || 'Không có lý do cụ thể'}
        </div>
      </div>
    `;
    
    showCustomConfirm(html, () => {});
    
    // Change the title of the custom confirm to 'Chi tiết khóa' instead of the warning sign
    const header = document.querySelector('#custom-confirm-modal > div > div:first-child');
    if (header) {
      header.innerHTML = '🔒 Chi tiết khóa tài khoản';
      header.style.background = '#fefce8';
      header.style.color = '#a16207';
      
      const footer = document.querySelector('#custom-confirm-modal > div > div:last-child');
      if (footer) {
        footer.innerHTML = '';
        const btnOk = document.createElement('button');
        btnOk.innerHTML = 'Đóng';
        btnOk.style.cssText = 'padding:8px 16px;border:none;border-radius:8px;background:#eab308;color:white;cursor:pointer;font-weight:700;font-family:inherit;';
        btnOk.onclick = () => document.getElementById('custom-confirm-modal').remove();
        footer.appendChild(btnOk);
      }
    }
  } catch (err) {
    showToast('Lỗi tải thông tin khóa', 'error');
  }
}



// ─────────────────────────────────────────────────
// HỒ SƠ GIẢNG VIÊN (Profile Modal)
// ─────────────────────────────────────────────────
async function viewLecturerHistory(magv) {
  openProfileModal(magv);
}

async function openProfileModal(magv) {
  const modal = document.getElementById('gv-profile-modal');
  modal.style.display = 'flex';
  document.getElementById('profile-modal-gv-id').value = magv;
  document.getElementById('profile-name').textContent = 'Đang tải...';
  document.getElementById('profile-sub').textContent = '';
  document.getElementById('profile-avatar').textContent = '⏳';
  document.getElementById('profile-stats').innerHTML = '';
  document.getElementById('profile-tab-login-count').textContent = '0';
  document.getElementById('profile-tab-exercise-count').textContent = '0';
  document.getElementById('profile-logins').innerHTML = '<div style="color:var(--text-muted); font-size:15px; padding:10px 0;">Đang tải...</div>';
  document.getElementById('profile-exercises').innerHTML = '<div style="color:var(--text-muted); font-size:15px; padding:10px 0;">Đang tải...</div>';
  
  // Reset tab to login
  switchProfileTab('login');

  try {
    const res = await fetch(`/api/admin/lecturer/${magv}/profile`, { credentials: 'include' });
    const d = await res.json();
    const { info, stats, recentLogins, recentExercises } = d;

    const initials = (info.TenGiangVien || '??').split(' ').map(w => w[0]).slice(-2).join('').toUpperCase();
    document.getElementById('profile-avatar').textContent = initials;
    document.getElementById('profile-name').textContent = info.TenGiangVien;
    document.getElementById('profile-sub').textContent =
      `${info.MaGiangVien} • ${(info.Quyen||'').trim().toLowerCase() === 'admin' ? '🛡 Admin' : '👨‍🏫 Giảng viên'} • ${info.IsBlocked ? '🔒 Đã khóa' : '✅ Hoạt động'}`;

    // Stats cards
    const statCards = [
      { label: 'Tổng bài tập', value: stats.TotalEx, color: '#a5b4fc', icon: '📝' },
      { label: '30 ngày qua', value: stats.ExLast30, color: '#6ee7b7', icon: '🆕' },
      { label: 'Số môn phụ trách', value: stats.SubjectCount, color: '#fcd34d', icon: '📚' },
      { label: 'Tổng lần đăng nhập', value: stats.TotalLogins, color: '#67e8f9', icon: '🔑' },
    ];
    document.getElementById('profile-stats').innerHTML = statCards.map(c => `
      <div style="padding:20px 16px; text-align:center; border-right:1px solid rgba(255,255,255,0.15);">
        <div style="font-size:24px; margin-bottom:6px;">${c.icon}</div>
        <div style="font-size:28px; font-weight:800; color:${c.color};">${c.value ?? 0}</div>
        <div style="font-size:14px; color:rgba(255,255,255,0.8); margin-top:4px;">${c.label}</div>
      </div>
    `).join('');

    // Update tab counts
    document.getElementById('profile-tab-login-count').textContent = recentLogins.length;
    document.getElementById('profile-tab-exercise-count').textContent = recentExercises.length;

    // Recent logins
    document.getElementById('profile-logins').innerHTML = recentLogins.length
      ? recentLogins.map((l, i) => {
          const fmtStr = s => {
            if (!s) return '—';
            try {
              const dObj = new Date(s);
              if (isNaN(dObj.getTime())) return s;
              return dObj.toLocaleDateString('vi-VN') + ' ' + dObj.toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'});
            } catch(e) { return s; }
          };
          const t = fmtStr(l.LoginTime);
          const isOnline = l.IsOnline;
          return `<div style="padding:10px 14px; background:${i%2===0 ? 'var(--bg-color,#f8fafc)' : 'var(--card-bg)'}; border-radius:8px; font-size:14px; display:flex; justify-content:space-between; align-items:center; border:1px solid var(--border-color);">
            <div style="display:flex; align-items:center; gap:10px;">
              <span style="font-size:20px;">${isOnline ? '🟢' : '⚫'}</span>
              <span style="color:var(--text-main); font-weight:500;">${t}</span>
            </div>
            <span style="padding:3px 10px; border-radius:20px; font-size:12px; font-weight:700; background:${isOnline ? '#dcfce7' : '#f1f5f9'}; color:${isOnline ? '#15803d' : '#64748b'};">${isOnline ? 'Online' : 'Offline'}</span>
          </div>`;
        }).join('')
      : '<div style="color:var(--text-muted); font-size:15px; font-style:italic; padding:16px; text-align:center;">Chưa có lịch sử đăng nhập</div>';

    // Recent exercises — dùng TenBaiTap và UpdatedAt
    document.getElementById('profile-exercises').innerHTML = recentExercises.length
      ? recentExercises.map((e, i) => {
          const tenBai = e.TenBaiTap || e.TieuDe || '(Không có tên)';
          const dStr = e.UpdatedAt ? e.UpdatedAt.replace('Z', '') : null;
          const t = dStr ? new Date(dStr).toLocaleDateString('vi-VN') : '—';
          const monHoc = e.TenMon ? `${e.MaMon || '—'} · ${e.TenMon}` : (e.MaMon || '—');
          return `<div style="padding:10px 14px; background:${i%2===0 ? 'var(--bg-color,#f8fafc)' : 'var(--card-bg)'}; border-radius:8px; font-size:14px; border:1px solid var(--border-color);">
            <div style="font-weight:600; color:var(--text-main); overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${tenBai}">${tenBai}</div>
            <div style="display:flex; gap:14px; margin-top:5px; color:var(--text-muted); font-size:13px;">
              <span>📚 ${monHoc}</span>
              <span>📅 ${t}</span>
            </div>
          </div>`;
        }).join('')
      : '<div style="color:var(--text-muted); font-size:15px; font-style:italic; padding:16px; text-align:center;">Chưa có bài tập nào</div>';

  } catch (err) {
    showToast('Lỗi tải hồ sơ: ' + err.message, 'error');
    modal.style.display = 'none';
  }
}

function closeProfileModal() {
  document.getElementById('gv-profile-modal').style.display = 'none';
}

function switchProfileTab(tab) {
  const btnLogin = document.getElementById('profile-tab-login-btn');
  const btnEx = document.getElementById('profile-tab-exercise-btn');
  const panelLogin = document.getElementById('profile-tab-login');
  const panelEx = document.getElementById('profile-tab-exercise');

  if (!btnLogin || !btnEx || !panelLogin || !panelEx) return;

  if (tab === 'login') {
    btnLogin.style.background = 'rgba(255,255,255,0.15)';
    btnLogin.style.color = 'white';
    btnLogin.style.borderBottom = '3px solid white';
    btnEx.style.background = 'transparent';
    btnEx.style.color = 'rgba(255,255,255,0.6)';
    btnEx.style.borderBottom = '3px solid transparent';
    
    panelLogin.style.display = 'block';
    panelEx.style.display = 'none';
  } else {
    btnEx.style.background = 'rgba(255,255,255,0.15)';
    btnEx.style.color = 'white';
    btnEx.style.borderBottom = '3px solid white';
    btnLogin.style.background = 'transparent';
    btnLogin.style.color = 'rgba(255,255,255,0.6)';
    btnLogin.style.borderBottom = '3px solid transparent';
    
    panelLogin.style.display = 'none';
    panelEx.style.display = 'block';
  }
}

// ─────────────────────────────────────────────────
// LỊCH SỬ ĐĂNG NHẬP
// ─────────────────────────────────────────────────
async function initLoginHistorySection() {
  // Điền dropdown GV — fetch nếu cache rỗng
  const sel = document.getElementById('lh-filter-gv');
  if (sel && sel.options.length <= 1) {
    if (!window._cachedLecturers?.length) {
      try {
        const res = await fetch('/api/admin/lecturers', { credentials: 'include' });
        window._cachedLecturers = await res.json();
      } catch (_) { window._cachedLecturers = []; }
    }
    (window._cachedLecturers || []).forEach(gv => {
      const opt = document.createElement('option');
      opt.value = gv.MaGiangVien;
      opt.textContent = `${gv.TenGiangVien} (${gv.MaGiangVien})`;
      sel.appendChild(opt);
    });
  }
  // Set mặc định ngày hôm nay
  const dateInput = document.getElementById('lh-filter-date');
  if (dateInput && !dateInput.value) {
    dateInput.value = new Date().toISOString().split('T')[0];
  }
  await loadLoginHistory();
}

async function loadLoginHistory() {
  const tbody = document.getElementById('login-history-tbody');
  const statsBar = document.getElementById('lh-stats-bar');
  tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:30px;"><div class="spinner"></div> Đang tải...</td></tr>';

  const date   = document.getElementById('lh-filter-date')?.value || '';
  const magv   = document.getElementById('lh-filter-gv')?.value || '';
  const status = document.getElementById('lh-filter-status')?.value || '';

  const params = new URLSearchParams();
  if (date)   params.set('date', date);
  if (magv)   params.set('magv', magv);
  if (status) params.set('status', status);

  try {
    const res = await fetch(`/api/admin/login-history?${params}`, { credentials: 'include' });
    const data = await res.json();
    renderLoginHistoryStats(data, statsBar);
    renderLoginHistoryTable(data, tbody);
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:20px; color:#ef4444;">Lỗi: ${err.message}</td></tr>`;
  }
}

function renderLoginHistoryStats(data, container) {
  const total   = data.length;
  const online  = data.filter(r => r.IsOnline).length;
  const offline = total - online;
  const avgMin  = data.filter(r => r.DurationMin).reduce((s, r) => s + r.DurationMin, 0) / (data.filter(r => r.DurationMin).length || 1);

  container.innerHTML = [
    { label: 'Tổng phiên', value: total, color: '#6366f1', icon: '📊' },
    { label: 'Đang online', value: online, color: '#10b981', icon: '🟢' },
    { label: 'Đã offline', value: offline, color: '#94a3b8', icon: '⚫' },
    { label: 'Thời lượng TB', value: isNaN(avgMin) ? '—' : Math.round(avgMin) + ' phút', color: '#f59e0b', icon: '⏱' },
  ].map(c => `
    <div style="background:white; border-radius:10px; border:1px solid #e2e8f0; padding:14px 16px; display:flex; align-items:center; gap:12px;">
      <span style="font-size:23px;">${c.icon}</span>
      <div>
        <div style="font-size:21px; font-weight:800; color:${c.color};">${c.value}</div>
        <div style="font-size:14px; color:var(--text-muted);">${c.label}</div>
      </div>
    </div>
  `).join('');
}

function renderLoginHistoryTable(data, tbody) {
  if (!data.length) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:40px; color:var(--text-muted);">Không có dữ liệu trong khoảng thời gian này</td></tr>';
    return;
  }
  // fmt: handles both string "YYYY-MM-DD HH:mm:ss" (from server) and Date objects
  const fmt = dt => {
    if (!dt) return '—';
    if (typeof dt === 'string') {
      const [date, time] = dt.split(' ');
      const [y, mo, d] = date.split('-');
      return `${d}/${mo}/${y}, ${time ? time.slice(0,5) : ''}`;
    }
    return new Date(dt).toLocaleString('vi-VN', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' });
  };
  tbody.innerHTML = data.map(r => {
    const dur = r.DurationMin != null ? `${r.DurationMin} phút` : '—';
    const statusBadge = r.IsOnline
      ? '<span style="background:#f0fdf4; color:#16a34a; padding:3px 10px; border-radius:20px; font-size:14px; font-weight:600;">🟢 Online</span>'
      : '<span style="background:#f1f5f9; color:var(--text-muted); padding:3px 10px; border-radius:20px; font-size:14px; font-weight:600;">⚫ Offline</span>';
    return `<tr>
      <td style="padding:12px 14px; font-weight:600; color:var(--text-main);">${r.TenGiangVien || r.MaGiangVien}</td>
      <td style="padding:12px 14px; font-size:14px; color:var(--text-muted); font-family:monospace;">${r.MaGiangVien}</td>
      <td style="padding:12px 14px; text-align:center; font-size:15px; color:var(--text-main);">${fmt(r.LoginTime)}</td>
      <td style="padding:12px 14px; text-align:center; font-size:15px; color:var(--text-main);">${fmt(r.LogoutTime)}</td>
      <td style="padding:12px 14px; text-align:center; font-size:15px; color:var(--text-muted);">${dur}</td>
      <td style="padding:12px 14px; text-align:center;">${statusBadge}</td>
    </tr>`;
  }).join('');
}

function resetLoginHistoryFilter() {
  const d = document.getElementById('lh-filter-date');
  if (d) d.value = new Date().toISOString().split('T')[0];
  const g = document.getElementById('lh-filter-gv');      if (g) g.value = '';
  const s = document.getElementById('lh-filter-status');  if (s) s.value = '';
  loadLoginHistory();
}

// ─────────────────────────────────────────────────
// LỊCH SỬ HOẠT ĐỘNG BÀI TẬP
// ─────────────────────────────────────────────────
async function initExerciseActivitySection() {
  // Điền dropdown GV — fetch nếu cache rỗng
  const selGV = document.getElementById('ea-filter-gv');
  if (selGV && selGV.options.length <= 1) {
    if (!window._cachedLecturers?.length) {
      try {
        const res = await fetch('/api/admin/lecturers', { credentials: 'include' });
        window._cachedLecturers = await res.json();
      } catch (_) { window._cachedLecturers = []; }
    }
    (window._cachedLecturers || []).forEach(gv => {
      const opt = document.createElement('option');
      opt.value = gv.MaGiangVien;
      opt.textContent = `${gv.TenGiangVien} (${gv.MaGiangVien})`;
      selGV.appendChild(opt);
    });
  }
  // Điền dropdown Môn học
  const selMon = document.getElementById('ea-filter-mon');
  if (selMon && selMon.options.length <= 1) {
    try {
      const res = await fetch('/api/admin/subjects', { credentials: 'include' });
      const subs = await res.json();
      subs.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s.MaMon;
        opt.textContent = s.TenMon;
        selMon.appendChild(opt);
      });
    } catch (_) {}
  }
  await loadExerciseActivity();
}

async function loadExerciseActivity() {
  const tbody = document.getElementById('exercise-activity-tbody');
  tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:30px;"><div class="spinner"></div> Đang tải...</td></tr>';

  const magv  = document.getElementById('ea-filter-gv')?.value  || '';
  const mamon = document.getElementById('ea-filter-mon')?.value || '';
  const days  = document.getElementById('ea-filter-days')?.value || '30';

  const params = new URLSearchParams();
  if (magv)  params.set('magv', magv);
  if (mamon) params.set('mamon', mamon);
  params.set('days', days);

  try {
    const res = await fetch(`/api/admin/exercise-activity?${params}`, { credentials: 'include' });
    const data = await res.json();
    renderExerciseActivityTable(data, tbody);
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:20px; color:#ef4444;">Lỗi: ${err.message}</td></tr>`;
  }
}

function renderExerciseActivityTable(data, tbody) {
  if (!data.length) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:40px; color:var(--text-muted);">Không có dữ liệu trong khoảng thời gian này</td></tr>';
    return;
  }
  const fmt = dt => dt ? new Date(dt).toLocaleString('vi-VN', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' }) : '—';
  
  // Store data globally for the eye icon to access
  window._exerciseActivityData = data;

  tbody.innerHTML = data.map((r, index) => {
    const tenBai = r.exercise_title || r.exercise_id || '(Không có tên)';
    
    // Action Badge
    let actionBadge = '';
    const actionLower = (r.action || '').toLowerCase();
    if (actionLower.includes('tạo') || actionLower.includes('thêm') || actionLower === 'create' || actionLower === 'add') {
      actionBadge = '<span style="background:#f0fdf4; color:#16a34a; padding:3px 10px; border-radius:20px; font-size:13px; font-weight:700;"><i class="fas fa-plus"></i> Thêm mới</span>';
    } else if (actionLower.includes('sửa') || actionLower.includes('cập nhật') || actionLower === 'update' || actionLower === 'edit') {
      actionBadge = '<span style="background:#eff6ff; color:#2563eb; padding:3px 10px; border-radius:20px; font-size:13px; font-weight:700;"><i class="fas fa-edit"></i> Cập nhật</span>';
    } else if (actionLower.includes('xóa') || actionLower === 'delete') {
      actionBadge = '<span style="background:#fef2f2; color:#dc2626; padding:3px 10px; border-radius:20px; font-size:13px; font-weight:700;"><i class="fas fa-trash"></i> Xóa</span>';
    } else {
      actionBadge = `<span style="background:#f1f5f9; color:#475569; padding:3px 10px; border-radius:20px; font-size:13px; font-weight:700;">${r.action || 'Khác'}</span>`;
    }

    // Eye icon for details (only if there are details, usually for updates)
    let eyeBtn = '—';
    if (r.details) {
      eyeBtn = `<button onclick="showActivityDetails(${index})" style="background:#f8fafc; color:#6366f1; border:1px solid #e2e8f0; padding:6px 12px; border-radius:8px; cursor:pointer; font-size:14px; font-weight:600; display:flex; align-items:center; gap:6px; transition:all 0.2s;" onmouseover="this.style.background='#eff6ff'; this.style.borderColor='#bfdbfe';" onmouseout="this.style.background='#f8fafc'; this.style.borderColor='#e2e8f0';">👁️ Chi tiết</button>`;
    }

    return `<tr style="border-bottom:1px solid #f1f5f9; transition:background 0.2s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background=''">
      <td style="padding:14px 14px; text-align:center;">${actionBadge}</td>
      <td style="padding:14px 14px;">
        <div style="font-weight:700; color:var(--text-main); max-width:250px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${tenBai}">${tenBai}</div>
        <div style="font-size:13px; color:var(--text-muted); font-family:monospace; margin-top:3px;">ID: ${r.exercise_id || '—'}</div>
      </td>
      <td style="padding:14px 14px;">
        <div style="font-weight:600; color:var(--text-main);">${r.lecturer_name || '—'}</div>
        <div style="font-size:13px; color:var(--text-muted); margin-top:3px;">${r.lecturer_id || '—'}</div>
      </td>
      <td style="padding:14px 14px; font-size:14px; color:var(--text-main); font-weight:500;">
        <span style="background:#ede9fe; color:#5b21b6; padding:3px 10px; border-radius:20px; font-size:13px; font-weight:600;">📚 ${r.subject_id || '—'}</span>
      </td>
      <td style="padding:14px 14px; font-size:14px; color:var(--text-muted);">${r.form_id || '—'}</td>
      <td style="padding:14px 14px; text-align:center; font-size:14px; color:var(--text-main); font-weight:500;">${fmt(r.timestamp)}</td>
      <td style="padding:14px 14px; text-align:center;">${eyeBtn}</td>
    </tr>`;
  }).join('');
}

function showActivityDetails(index) {
  const data = window._exerciseActivityData[index];
  if (!data || !data.details) return;
  
  let detailsObj;
  try {
    detailsObj = typeof data.details === 'string' ? JSON.parse(data.details) : data.details;
  } catch(e) {
    detailsObj = { raw: data.details };
  }

  const fmtDate = dt => dt ? new Date(dt).toLocaleString('vi-VN', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' }) : '—';

  let infoHtml = `
    <div style="background:#f1f5f9; padding:16px; border-radius:12px; margin-bottom:20px; display:grid; grid-template-columns:1fr 1fr; gap:12px; font-size:14px;">
      <div><strong style="color:#475569">Bài tập:</strong> <span style="color:#0f172a; font-weight:600">${data.exercise_title || '—'}</span> <span style="color:#64748b; font-size:13px">(ID: ${data.exercise_id || '—'})</span></div>
      <div><strong style="color:#475569">Giảng viên:</strong> <span style="color:#0f172a; font-weight:600">${data.lecturer_name || '—'}</span> <span style="color:#64748b; font-size:13px">(ID: ${data.lecturer_id || '—'})</span></div>
      <div><strong style="color:#475569">Môn học:</strong> <span style="color:#0f172a">${data.subject_id || '—'}</span></div>
      <div><strong style="color:#475569">Dạng bài:</strong> <span style="color:#0f172a">${data.form_id || '—'}</span></div>
      <div><strong style="color:#475569">Thời gian:</strong> <span style="color:#0f172a">${fmtDate(data.timestamp)}</span></div>
      <div><strong style="color:#475569">Hành động:</strong> <span style="color:#0f172a; font-weight:600; text-transform:uppercase;">${data.action || '—'}</span></div>
    </div>
  `;

  let htmlContent = '<div style="font-size:14px; background:#fff; color:#334155; text-align:left;">';
  
  let changesObj = null;
  let createdObj = null;
  let deletedObj = null;
  try { if (data.changes) changesObj = typeof data.changes === 'string' ? JSON.parse(data.changes) : data.changes; } catch(e) {}
  try { if (data.created_data) createdObj = typeof data.created_data === 'string' ? JSON.parse(data.created_data) : data.created_data; } catch(e) {}
  try { if (data.deleted_data) deletedObj = typeof data.deleted_data === 'string' ? JSON.parse(data.deleted_data) : data.deleted_data; } catch(e) {}

  if (changesObj) {
    htmlContent += '<h4 style="margin:0 0 12px 0; color:#2563eb; font-size:16px; border-bottom:2px solid #bfdbfe; padding-bottom:6px;">Sự thay đổi (Trước và Sau):</h4>';
    for (const key in changesObj) {
      const change = changesObj[key];
      if (change && typeof change === 'object' && ('old' in change || 'new' in change)) {
        htmlContent += `<div style="margin-bottom:12px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; overflow:hidden;">
          <div style="background:#e2e8f0; padding:6px 12px; font-weight:700; color:#334155;">Thuộc tính: <span style="color:#2563eb;">${key}</span></div>
          <div style="padding:10px; display:flex; flex-direction:column; gap:6px;">
            <div style="color:#b91c1c; background:#fef2f2; padding:8px 12px; border-radius:6px; border-left:4px solid #ef4444; font-family:monospace; font-size:13px; white-space:pre-wrap;">- ${JSON.stringify(change.old) || 'null'}</div>
            <div style="color:#047857; background:#f0fdf4; padding:8px 12px; border-radius:6px; border-left:4px solid #10b981; font-family:monospace; font-size:13px; white-space:pre-wrap;">+ ${JSON.stringify(change.new) || 'null'}</div>
          </div>
        </div>`;
      } else {
         htmlContent += `<div style="margin-bottom:12px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; overflow:hidden;">
          <div style="background:#e2e8f0; padding:6px 12px; font-weight:700; color:#334155;">Thuộc tính: <span style="color:#2563eb;">${key}</span></div>
          <div style="padding:10px; color:#047857; background:#f0fdf4; font-family:monospace; font-size:13px; white-space:pre-wrap;">${JSON.stringify(change) || 'null'}</div>
        </div>`;
      }
    }
  } else if (createdObj) {
    htmlContent += '<h4 style="margin:0 0 12px 0; color:#16a34a; font-size:16px; border-bottom:2px solid #bbf7d0; padding-bottom:6px;">Dữ liệu bài tập đã tạo:</h4>';
    htmlContent += `<div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:12px; font-family:monospace; font-size:13px; white-space:pre-wrap; color:#334155;">${JSON.stringify(createdObj, null, 2)}</div>`;
  } else if (deletedObj) {
    htmlContent += '<h4 style="margin:0 0 12px 0; color:#dc2626; font-size:16px; border-bottom:2px solid #fecaca; padding-bottom:6px;">Dữ liệu bài tập đã xóa:</h4>';
    htmlContent += `<div style="background:#fef2f2; border:1px solid #fecaca; border-radius:8px; padding:12px; font-family:monospace; font-size:13px; white-space:pre-wrap; color:#991b1b;">${JSON.stringify(deletedObj, null, 2)}</div>`;
  } else if (detailsObj.before && detailsObj.after) {
    htmlContent += '<h4 style="margin:0 0 12px 0; color:#2563eb; font-size:16px; border-bottom:2px solid #bfdbfe; padding-bottom:6px;">Sự thay đổi (Trước và Sau):</h4>';
    for (const key in detailsObj.after) {
      const beforeVal = detailsObj.before[key];
      const afterVal = detailsObj.after[key];
      if (JSON.stringify(beforeVal) !== JSON.stringify(afterVal)) {
        htmlContent += `<div style="margin-bottom:12px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; overflow:hidden;">
          <div style="background:#e2e8f0; padding:6px 12px; font-weight:700; color:#334155;">Thuộc tính: <span style="color:#2563eb;">${key}</span></div>
          <div style="padding:10px; display:flex; flex-direction:column; gap:6px;">
            <div style="color:#b91c1c; background:#fef2f2; padding:8px 12px; border-radius:6px; border-left:4px solid #ef4444; font-family:monospace; font-size:13px; white-space:pre-wrap;">- ${JSON.stringify(beforeVal) || 'null'}</div>
            <div style="color:#047857; background:#f0fdf4; padding:8px 12px; border-radius:6px; border-left:4px solid #10b981; font-family:monospace; font-size:13px; white-space:pre-wrap;">+ ${JSON.stringify(afterVal) || 'null'}</div>
          </div>
        </div>`;
      }
    }
  } else {
    htmlContent += '<h4 style="margin:0 0 12px 0; color:#475569; font-size:16px; border-bottom:2px solid #e2e8f0; padding-bottom:6px;">Ghi chú / Chi tiết:</h4>';
    const displayStr = typeof data.details === 'string' ? data.details : JSON.stringify(detailsObj, null, 2);
    htmlContent += `<div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:12px; font-family:monospace; font-size:13px; white-space:pre-wrap; color:#334155;">${displayStr}</div>`;
  }
  htmlContent += '</div>';

  // Inject modal into DOM if not exists
  let modal = document.getElementById('activity-details-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'activity-details-modal';
    modal.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(15,23,42,0.6); display:flex; align-items:center; justify-content:center; z-index:9999; backdrop-filter:blur(3px);';
    modal.innerHTML = `
      <div style="background:white; width:90%; max-width:650px; border-radius:16px; box-shadow:0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04); overflow:hidden; display:flex; flex-direction:column; max-height:90vh;">
        <div style="padding:20px 24px; border-bottom:1px solid #f1f5f9; display:flex; justify-content:space-between; align-items:center; background:#f8fafc;">
          <h3 id="adm-title" style="margin:0; font-size:18px; font-weight:700; color:#0f172a; display:flex; align-items:center; gap:8px;">👁️ Chi tiết thay đổi</h3>
          <button onclick="document.getElementById('activity-details-modal').style.display='none'" style="background:none; border:none; font-size:24px; color:#94a3b8; cursor:pointer; line-height:1; transition:color 0.2s;" onmouseover="this.style.color='#ef4444'" onmouseout="this.style.color='#94a3b8'">&times;</button>
        </div>
        <div id="adm-body" style="padding:24px; overflow-y:auto; flex:1;">
        </div>
        <div style="padding:16px 24px; border-top:1px solid #f1f5f9; text-align:right; background:#f8fafc;">
          <button onclick="document.getElementById('activity-details-modal').style.display='none'" style="background:#6366f1; color:white; border:none; padding:10px 20px; border-radius:8px; font-weight:600; cursor:pointer; box-shadow:0 4px 6px -1px rgba(99,102,241,0.2);">Đóng</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  document.getElementById('adm-title').innerHTML = `👁️ Chi tiết hoạt động: <span style="color:#6366f1;">${data.exercise_id || data.action || 'Log'}</span>`;
  document.getElementById('adm-body').innerHTML = infoHtml + htmlContent;
  modal.style.display = 'flex';
}

function resetExerciseActivityFilter() {
  const g = document.getElementById('ea-filter-gv');  if (g) g.value = '';
  const m = document.getElementById('ea-filter-mon'); if (m) m.value = '';
  const d = document.getElementById('ea-filter-days'); if (d) d.value = '30';
  loadExerciseActivity();
}

// ═════════════════════════════════════════════════════
// DANH SÁCH BÀI TẬP ADMIN
// ═════════════════════════════════════════════════════
let exAdminPage = 1;
let exAdminData = [];
let exAdminDaysFilter = 0; // 0=all, 7=last 7 days

async function initExercisesAdminSection() {
  // Populate môn học dropdown
  const selMon = document.getElementById('ex-filter-mon');
  if (selMon && selMon.options.length <= 1) {
    try {
      const res = await fetch('/api/admin/subjects', { credentials: 'include' });
      const subs = await res.json();
      subs.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s.MaMon;
        opt.textContent = s.TenMon;
        selMon.appendChild(opt);
      });
    } catch (_) {}
  }
  // Populate GV dropdown — fetch nếu cache rỗng
  const selGV = document.getElementById('ex-filter-gv');
  if (selGV && selGV.options.length <= 1) {
    if (!window._cachedLecturers?.length) {
      try {
        const res = await fetch('/api/admin/lecturers', { credentials: 'include' });
        window._cachedLecturers = await res.json();
      } catch (_) { window._cachedLecturers = []; }
    }
    (window._cachedLecturers || []).forEach(gv => {
      const opt = document.createElement('option');
      opt.value = gv.MaGiangVien;
      opt.textContent = `${gv.TenGiangVien} (${gv.MaGiangVien})`;
      selGV.appendChild(opt);
    });
  }
  exAdminPage = 1;
  await loadExercisesAdmin();
}

async function loadExercisesAdmin() {
  const tbody = document.getElementById('exercises-admin-tbody');
  const info  = document.getElementById('ex-pagination-info');
  const btns  = document.getElementById('ex-pagination-btns');
  tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:40px;"><div class="spinner"></div> Đang tải...</td></tr>';

  const search = document.getElementById('ex-filter-search')?.value.trim() || '';
  const mamon  = document.getElementById('ex-filter-mon')?.value  || '';
  const magv   = document.getElementById('ex-filter-gv')?.value   || '';
  const level  = document.getElementById('ex-filter-level')?.value || '';

  const params = new URLSearchParams({ page: exAdminPage, limit: 20 });
  if (search) params.set('search', search);
  if (mamon)  params.set('mamon',  mamon);
  if (magv)   params.set('magv',   magv);
  if (level)  params.set('level',  level);
  if (exAdminDaysFilter > 0) params.set('days', exAdminDaysFilter);

  try {
    const res  = await fetch(`/api/admin/exercises?${params}`, { credentials: 'include' });
    const json = await res.json();

    // Handle both HTTP errors and API-level errors
    if (!res.ok || json.error) throw new Error(json.error || `HTTP ${res.status}`);

    // Stats cards — null-safe fallback
    const s = json.stats || {};
    document.getElementById('ex-stat-total').textContent    = s.Total        ?? '—';
    document.getElementById('ex-stat-new').textContent      = s.New7Days     ?? '—';
    document.getElementById('ex-stat-subjects').textContent = s.SubjectCount ?? '—';
    document.getElementById('ex-stat-gv').textContent       = s.GVCount      ?? '—';

    exAdminData = json.data || [];
    renderExercisesAdminTable(exAdminData, tbody);

    // Pagination — null-safe fallback
    const pg = json.pagination || { page: 1, pages: 1, total: exAdminData.length };
    if (info) info.textContent = `Trang ${pg.page}/${pg.pages || 1} — ${pg.total} bài tập`;
    renderExercisesPagination(pg, btns);

  } catch (err) {
    console.error('[exercises admin] API error:', err);
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:30px; color:#ef4444;">❌ Lỗi: ${err.message}</td></tr>`;
  }
}

function renderExercisesAdminTable(data, tbody) {
  if (!data.length) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:40px; color:var(--text-muted);">Không tìm thấy bài tập nào phù hợp</td></tr>';
    return;
  }
  const levelCfg = {
    1: { label: 'Dễ',        bg: '#f0fdf4', color: '#16a34a' },
    2: { label: 'TB',        bg: '#fefce8', color: '#ca8a04' },
    3: { label: 'Khó',       bg: '#fff7ed', color: '#ea580c' },
    4: { label: 'Rất khó',   bg: '#fef2f2', color: '#dc2626' },
    5: { label: 'Chuyên gia',bg: '#f5f3ff', color: '#7c3aed' },
  };
  const fmt = dt => dt ? new Date(dt.replace('Z', '')).toLocaleDateString('vi-VN', { day:'2-digit', month:'2-digit', year:'numeric' }) : '—';

  tbody.innerHTML = data.map(r => {
    const lv    = levelCfg[r.MaDoKho] || { label: r.TenDoKho || '—', bg:'#f1f5f9', color:'#64748b' };
    const tenBai = r.TenBaiTap || '(Không tên)';
    const monBadge  = r.TenMon  ? `<span style="background:#eff6ff; color:#2563eb; padding:2px 8px; border-radius:20px; font-size:12px; font-weight:600; white-space:nowrap;">${r.MaMon}</span>` : '—';
    const dangBai   = r.TenDangBai ? `<span style="background:var(--bg-color,#f8fafc); color:var(--text-muted); padding:2px 8px; border-radius:4px; font-size:12px; border:1px solid #e2e8f0;">${r.TenDangBai.length > 22 ? r.TenDangBai.slice(0,22)+'…' : r.TenDangBai}</span>` : '—';
    const gvName    = r.TenGiangVien || r.MaGiangVien || '—';
    const initials  = gvName !== '—' ? gvName.split(' ').map(w=>w[0]).slice(-2).join('').toUpperCase() : '?';
    const exId      = r.MaBaiTap || r.Id;

    return `<tr style="transition:background 0.1s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background=''">
      <td style="padding:13px 14px; cursor:pointer;" onclick="openAdminExModal('${exId}')">
        <div style="font-weight:600; color:#2563eb; max-width:280px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; font-size:16px;" title="${tenBai}">${tenBai}</div>
        <div style="font-size:14px; color:var(--text-muted); margin-top:2px; font-family:monospace;">${r.MaBaiTap || r.Id || ''}</div>
      </td>
      <td style="padding:13px 14px;">${monBadge}<div style="font-size:14px; color:var(--text-muted); margin-top:3px;">${r.TenMon || ''}</div></td>
      <td style="padding:13px 14px;">
        <div style="display:flex; align-items:center; gap:8px;">
          <div style="width:28px; height:28px; border-radius:50%; background:linear-gradient(135deg,#6366f1,#818cf8); display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:700; color:white; flex-shrink:0;">${initials}</div>
          <span style="font-size:16px; color:var(--text-main);">${gvName}</span>
        </div>
      </td>
      <td style="padding:13px 14px; text-align:center;">
        <span style="background:${lv.bg}; color:${lv.color}; padding:4px 10px; border-radius:20px; font-size:15px; font-weight:700; white-space:nowrap;">${lv.label}</span>
      </td>
      <td style="padding:13px 14px;">${dangBai}</td>
      <td style="padding:13px 14px; text-align:center; font-size:15px; color:var(--text-muted); white-space:nowrap;">${fmt(r.UpdatedAt)}</td>
      <td style="padding:13px 14px; text-align:center;">
        <div style="display:flex; gap:6px; justify-content:center;">
          <button onclick="openAdminExModal('${exId}')"
            style="padding:5px 10px; background:#eff6ff; color:#2563eb; border:1px solid #bfdbfe; border-radius:7px; font-size:14px; font-weight:600; cursor:pointer;" title="Xem chi tiết">👁</button>
          <button onclick="event.stopPropagation(); deleteExerciseAdmin('${exId}', this)"
            style="padding:5px 10px; background:#f1f5f9; color:#475569; border:1px solid #cbd5e1; border-radius:7px; font-size:14px; font-weight:600; cursor:pointer;" title="Lưu trữ/Ẩn bài tập">📦</button>
        </div>
      </td>
    </tr>`;
  }).join('');
}

function renderExercisesPagination(pg, container) {
  if (!container || pg.pages <= 1) { if(container) container.innerHTML=''; return; }
  const btnStyle = (active) =>
    `padding:6px 12px; border-radius:7px; font-size:15px; font-weight:600; cursor:pointer; border:1.5px solid ${active ? '#6366f1' : '#e2e8f0'}; background:${active ? '#6366f1' : 'white'}; color:${active ? 'white' : '#374151'};`;

  let html = '';
  // Prev
  html += `<button onclick="gotoExPage(${pg.page-1})" ${pg.page<=1?'disabled':''} style="${btnStyle(false)} opacity:${pg.page<=1?0.4:1}">‹</button>`;
  // Page numbers (show max 7 around current)
  const start = Math.max(1, pg.page - 3);
  const end   = Math.min(pg.pages, pg.page + 3);
  if (start > 1) html += `<button onclick="gotoExPage(1)" style="${btnStyle(false)}">1</button><span style="padding:0 4px;color:var(--text-muted);">…</span>`;
  for (let i = start; i <= end; i++) {
    html += `<button onclick="gotoExPage(${i})" style="${btnStyle(i === pg.page)}">${i}</button>`;
  }
  if (end < pg.pages) html += `<span style="padding:0 4px;color:var(--text-muted);">…</span><button onclick="gotoExPage(${pg.pages})" style="${btnStyle(false)}">${pg.pages}</button>`;
  // Next
  html += `<button onclick="gotoExPage(${pg.page+1})" ${pg.page>=pg.pages?'disabled':''} style="${btnStyle(false)} opacity:${pg.page>=pg.pages?0.4:1}">›</button>`;
  container.innerHTML = html;
}

function gotoExPage(p) {
  exAdminPage = p;
  loadExercisesAdmin();
}

function filterExercisesAdmin() {
  exAdminPage = 1;
  clearTimeout(window._exFilterTimer);
  window._exFilterTimer = setTimeout(loadExercisesAdmin, 300);
}

function resetExercisesAdminFilter() {
  ['ex-filter-search','ex-filter-mon','ex-filter-gv','ex-filter-level'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  exAdminDaysFilter = 0;
  // Remove active state from all stat cards
  document.querySelectorAll('#ex-stats-bar > div').forEach(c => c.style.outline = '');
  exAdminPage = 1;
  loadExercisesAdmin();
}

// Stat card click handler
function statCardFilter(type) {
  // Reset active outline on all cards
  document.querySelectorAll('#ex-stats-bar > div').forEach(c => {
    c.style.outline = ''; c.style.outlineOffset = '';
  });

  if (type === 'all') {
    // Reset everything
    resetExercisesAdminFilter();
    // Highlight card 1
    const card = document.querySelector('#ex-stats-bar > div:nth-child(1)');
    if (card) { card.style.outline = '3px solid white'; card.style.outlineOffset = '2px'; }
    return;
  }

  if (type === 'new7') {
    // Toggle 7-day filter
    exAdminDaysFilter = exAdminDaysFilter === 7 ? 0 : 7;
    const card = document.querySelector('#ex-stats-bar > div:nth-child(2)');
    if (card && exAdminDaysFilter === 7) {
      card.style.outline = '3px solid white'; card.style.outlineOffset = '2px';
      showToast('🆕 Đang lọc bài tập trong 7 ngày qua', 'success');
    } else {
      showToast('Đã bỏ lọc ngày', 'info');
    }
    exAdminPage = 1;
    loadExercisesAdmin();
    return;
  }

  if (type === 'subjects') {
    // Focus subject dropdown
    const sel = document.getElementById('ex-filter-mon');
    if (sel) {
      sel.focus();
      sel.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Highlight card 3
      const card = document.querySelector('#ex-stats-bar > div:nth-child(3)');
      if (card) { card.style.outline = '3px solid white'; card.style.outlineOffset = '2px'; }
      showToast('📚 Chọn môn học trong dropdown bên dưới', 'info');
    }
    return;
  }

  if (type === 'gv') {
    // Focus GV dropdown
    const sel = document.getElementById('ex-filter-gv');
    if (sel) {
      sel.focus();
      sel.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Highlight card 4
      const card = document.querySelector('#ex-stats-bar > div:nth-child(4)');
      if (card) { card.style.outline = '3px solid white'; card.style.outlineOffset = '2px'; }
      showToast('👨‍🏫 Chọn giảng viên trong dropdown bên dưới', 'info');
    }
    return;
  }
}
function showCustomConfirm(message, onConfirm) {
  const oldModal = document.getElementById('custom-confirm-modal');
  if (oldModal) oldModal.remove();

  const overlay = document.createElement('div');
  overlay.id = 'custom-confirm-modal';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(4px);';
  
  const box = document.createElement('div');
  box.style.cssText = 'background:var(--card-bg,#fff);width:90%;max-width:400px;border-radius:14px;box-shadow:0 10px 30px rgba(0,0,0,0.2);overflow:hidden;animation:popIn 0.2s ease-out;';
  
  const header = document.createElement('div');
  header.style.cssText = 'padding:16px 20px;border-bottom:1px solid var(--border-color,#e2e8f0);background:#fef2f2;color:#dc2626;font-weight:700;font-size:18px;display:flex;align-items:center;gap:8px;';
  header.innerHTML = '⚠️ Xác nhận thao tác';

  const body = document.createElement('div');
  body.style.cssText = 'padding:20px;font-size:15px;color:var(--text-main,#1e293b);line-height:1.5;';
  body.innerHTML = message;

  const footer = document.createElement('div');
  footer.style.cssText = 'padding:12px 20px;border-top:1px solid var(--border-color,#e2e8f0);display:flex;justify-content:flex-end;gap:10px;background:var(--bg-color,#f8fafc);';

  const btnCancel = document.createElement('button');
  btnCancel.innerHTML = 'Hủy bỏ';
  btnCancel.style.cssText = 'padding:8px 16px;border:1.5px solid var(--border-color,#e2e8f0);border-radius:8px;background:none;cursor:pointer;font-weight:600;color:var(--text-muted,#64748b);font-family:inherit;';
  btnCancel.onclick = () => overlay.remove();

  const btnOk = document.createElement('button');
  btnOk.innerHTML = 'Xác nhận';
  btnOk.style.cssText = 'padding:8px 16px;border:none;border-radius:8px;background:#ef4444;color:white;cursor:pointer;font-weight:700;font-family:inherit;';
  btnOk.onclick = () => { overlay.remove(); onConfirm(); };

  footer.appendChild(btnCancel);
  footer.appendChild(btnOk);
  box.appendChild(header);
  box.appendChild(body);
  box.appendChild(footer);
  overlay.appendChild(box);
  document.body.appendChild(overlay);

  if (!document.getElementById('custom-confirm-style')) {
      const style = document.createElement('style');
      style.id = 'custom-confirm-style';
      style.innerHTML = '@keyframes popIn { from { opacity:0; transform:scale(0.9); } to { opacity:1; transform:scale(1); } }';
      document.head.appendChild(style);
  }
}

async function deleteExerciseAdmin(maBaiTap, btn) {
  showCustomConfirm(`Lưu trữ bài tập <b>[${maBaiTap}]</b> ?<br><br><span style='font-size:14px;color:var(--text-muted)'>Bài tập sẽ được ẩn khỏi danh sách hiển thị nhưng không bị mất dữ liệu.</span>`, async () => {
    btn.disabled = true; btn.textContent = '⏳';
    try {
      const res = await fetch(`/api/admin/exercise/${encodeURIComponent(maBaiTap)}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) {
        showToast(`📦 Đã lưu trữ bài tập ${maBaiTap}`, 'success');
        loadExercisesAdmin();
      } else {
        const e = await res.json();
        showToast('Lỗi: ' + (e.error || ''), 'error');
        btn.disabled = false; btn.textContent = '📦';
      }
    } catch (err) { showToast('Lỗi kết nối', 'error'); btn.disabled = false; btn.textContent = '📦'; }
  });
}

// ═══════════════════════════════════════
// MODAL CHI TIẾT BÀI TẬP (ADMIN)
// ═══════════════════════════════════════
async function openAdminExModal(maBaiTap) {
  const modal = document.getElementById('admin-exercise-modal');
  const body  = document.getElementById('admin-ex-modal-body');
  const title = document.getElementById('admin-ex-modal-title');
  const idEl  = document.getElementById('admin-ex-modal-id');

  modal.style.display = 'block';
  document.body.style.overflow = 'hidden';
  title.textContent = 'Đang tải...';
  idEl.textContent = maBaiTap;
  body.innerHTML = '<div style="text-align:center; padding:40px; color:var(--text-muted);">⏳ Đang tải dữ liệu...</div>';

  try {
    const res = await fetch(`/api/admin/exercise/${encodeURIComponent(maBaiTap)}?t=${Date.now()}`, { credentials: 'include' });
    const ex = await res.json();
    if (!res.ok) throw new Error(ex.error || 'Lỗi');

    title.textContent = ex.TenBaiTap || '(Không tên)';
    idEl.textContent = ex.MaBaiTap;

    // Parse YeuCau — support plain string, JSON array, or JSON object
    let requirements = [];
    try {
      if (ex.YeuCau) {
        const raw = ex.YeuCau.trim();
        if (raw.startsWith('[') || raw.startsWith('{')) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            requirements = parsed.map(r => typeof r === 'string' ? r : (r.name || r.yeu_cau || JSON.stringify(r)));
          } else if (parsed.yeu_cau && Array.isArray(parsed.yeu_cau)) {
            requirements = parsed.yeu_cau;
          } else {
            requirements = [raw]; // fallback to raw text
          }
        } else {
          // Plain text — split by newline or semicolon
          requirements = raw.split(/\n|;/).map(s => s.trim()).filter(Boolean);
        }
      }
    } catch (_) { if (ex.YeuCau) requirements = [ex.YeuCau]; }

    // Parse TieuChiChamDiem — support {tieu_chi:[...]}, [{name,points}...], or plain arrays
    let criteria = [];
    try {
      if (ex.TieuChiChamDiem) {
        const raw = ex.TieuChiChamDiem.trim();
        const parsed = JSON.parse(raw);
        const toItem = c => {
          if (typeof c === 'string') return { name: c, points: 0 };
          return { name: c.name || c.tieu_chi || c.criterion || '', points: c.points || c.diem || 0, note: c.note || '' };
        };
        if (parsed.tieu_chi && Array.isArray(parsed.tieu_chi)) {
          criteria = parsed.tieu_chi.map(toItem);
        } else if (parsed.criteria && Array.isArray(parsed.criteria)) {
          criteria = parsed.criteria.map(toItem);
        } else if (parsed.grading_criteria && Array.isArray(parsed.grading_criteria)) {
          criteria = parsed.grading_criteria.map(toItem);
        } else if (Array.isArray(parsed)) {
          criteria = parsed.map(toItem);
        }
      }
    } catch (_) {}

    const fmt = dt => dt ? new Date(dt.replace('Z', '')).toLocaleDateString('vi-VN', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' }) : '—';

    const levelCfg = {
      1: { label: 'Dễ', bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
      2: { label: 'Trung bình', bg: '#fefce8', color: '#ca8a04', border: '#fef08a' },
      3: { label: 'Khó', bg: '#fff7ed', color: '#ea580c', border: '#fed7aa' },
      4: { label: 'Rất khó',   bg: '#fef2f2', color: '#dc2626', border: '#fecaca' },
      5: { label: 'Chuyên gia',bg: '#f5f3ff', color: '#7c3aed', border: '#ddd6fe' },
    };
    const lv = levelCfg[ex.MaDoKho] || { label: ex.TenDoKho || '—', bg: '#f1f5f9', color: '#64748b', border: '#e2e8f0' };

    body.innerHTML = `
      <!-- Row 1: Mã, Môn, GV -->
      <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:12px; margin-bottom:14px;">
        <div style="background:#f0f9ff; border:1px solid #bae6fd; border-radius:10px; padding:14px; display:flex; align-items:center; gap:10px;">
          <div style="width:36px; height:36px; background:#0ea5e9; color:white; border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:18px; flex-shrink:0;">🏷️</div>
          <div><div style="font-size:12px; font-weight:700; color:#0369a1; text-transform:uppercase; letter-spacing:0.5px;">Mã bài tập</div><div style="font-size:15px; font-weight:700; color:#0c4a6e; font-family:monospace;">${ex.MaBaiTap}</div></div>
        </div>
        <div style="background:#faf5ff; border:1px solid #d8b4fe; border-radius:10px; padding:14px; display:flex; align-items:center; gap:10px;">
          <div style="width:36px; height:36px; background:#9333ea; color:white; border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:18px; flex-shrink:0;">📚</div>
          <div><div style="font-size:12px; font-weight:700; color:#7e22ce; text-transform:uppercase; letter-spacing:0.5px;">Môn học</div><div style="font-size:15px; font-weight:700; color:#581c87;">${ex.TenMon || ex.MaMon || '—'}</div></div>
        </div>
        <div style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:10px; padding:14px; display:flex; align-items:center; gap:10px;">
          <div style="width:36px; height:36px; background:#16a34a; color:white; border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:18px; flex-shrink:0;">👤</div>
          <div><div style="font-size:12px; font-weight:700; color:#15803d; text-transform:uppercase; letter-spacing:0.5px;">Giảng viên</div><div style="font-size:15px; font-weight:700; color:#14532d;">${ex.TenGiangVien || ex.MaGiangVien || '—'}</div></div>
        </div>
      </div>
      <!-- Row 2: Cấp độ, Dạng bài, Cập nhật -->
      <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:12px; margin-bottom:20px;">
        <div style="background:${lv.bg}; border:1px solid ${lv.border}; border-radius:10px; padding:14px; display:flex; align-items:center; gap:10px;">
          <div style="width:36px; height:36px; background:${lv.color}; color:white; border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:18px; flex-shrink:0;">📊</div>
          <div><div style="font-size:12px; font-weight:700; color:${lv.color}; text-transform:uppercase; letter-spacing:0.5px;">Cấp độ</div><div style="font-size:15px; font-weight:700; color:var(--text-main);">${lv.label}</div></div>
        </div>
        <div style="background:var(--card-bg,#fff)7ed; border:1px solid #fed7aa; border-radius:10px; padding:14px; display:flex; align-items:center; gap:10px;">
          <div style="width:36px; height:36px; background:#ea580c; color:white; border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:18px; flex-shrink:0;">🎯</div>
          <div><div style="font-size:12px; font-weight:700; color:#c2410c; text-transform:uppercase; letter-spacing:0.5px;">Dạng bài</div><div style="font-size:15px; font-weight:700; color:#7c2d12;">${ex.TenDangBai || '—'}</div></div>
        </div>
        <div style="background:var(--bg-color,#f8fafc); border:1px solid #e2e8f0; border-radius:10px; padding:14px; display:flex; align-items:center; gap:10px;">
          <div style="width:36px; height:36px; background:#64748b; color:white; border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:18px; flex-shrink:0;">🕐</div>
          <div><div style="font-size:12px; font-weight:700; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.5px;">Cập nhật</div><div style="font-size:15px; font-weight:600; color:var(--text-main);">${fmt(ex.UpdatedAt)}</div></div>
        </div>
      </div>

      <!-- Mô tả -->
      <div style="font-size:17px; font-weight:700; color:var(--text-main); margin-bottom:10px; display:flex; align-items:center; gap:8px;">📖 Mô tả bài tập</div>
      <div style="background:#fdfdfd; padding:16px; border:1px dashed #cbd5e1; border-radius:12px; line-height:1.8; color:var(--text-main); white-space:pre-line; font-size:16px; margin-bottom:20px; min-height:60px;">
        ${ex.MoTa || '<span style="color:var(--text-muted); font-style:italic;">Chưa có nội dung mô tả.</span>'}
      </div>

      <!-- Yêu cầu -->
      <div style="font-size:17px; font-weight:700; color:var(--text-main); margin-bottom:10px; display:flex; align-items:center; gap:8px;">📋 Yêu cầu kỹ thuật <span style="font-size:15px; background:#e0e7ff; color:#4338ca; padding:2px 8px; border-radius:20px;">${requirements.length}</span></div>
      <div style="margin-bottom:20px;">
        ${requirements.length
          ? requirements.map((r, i) => `<div style="padding:12px 14px; background:white; border-left:4px solid #6366f1; border-radius:4px 8px 8px 4px; margin-bottom:8px; box-shadow:0 1px 3px rgba(0,0,0,0.05); font-size:16px; line-height:1.6;"><strong style="color:#6366f1;">Yêu cầu ${i+1}:</strong> ${r}</div>`).join('')
          : '<div style="padding:14px; color:var(--text-muted); font-style:italic; font-size:16px;">Chưa có yêu cầu cụ thể.</div>'
        }
      </div>

      <!-- Tiêu chí chấm điểm -->
      <div style="font-size:17px; font-weight:700; color:var(--text-main); margin-bottom:10px; display:flex; align-items:center; gap:8px;">⚖️ Tiêu chí chấm điểm <span style="font-size:15px; background:#e0e7ff; color:#4338ca; padding:2px 8px; border-radius:20px;">${criteria.length}</span></div>
      <div style="background:var(--bg-color,#f8fafc); border-radius:12px; padding:4px 16px; margin-bottom:20px;">
        <table style="width:100%; border-collapse:collapse;">
          ${criteria.length
            ? criteria.map((c, i) => `<tr style="border-bottom:1px solid #f1f5f9;">
                <td style="padding:11px 8px; font-size:16px; color:var(--text-main);"><span style="font-size:14px; color:#6366f1; font-weight:700; margin-right:6px;">${i+1}.</span>${c.name}</td>
                <td style="padding:11px 8px; font-size:16px; text-align:right; white-space:nowrap;">
                  ${(c.points != null) ? `<span style="padding:3px 10px; background:#e0e7ff; color:#4338ca; border-radius:6px; font-weight:700; font-size:15px;">${c.points}%</span>` : ''}
                  ${c.note ? `<span style="font-size:14px; color:var(--text-muted); margin-left:6px;">${c.note}</span>` : ''}
                </td></tr>`).join('')
            : '<tr><td colspan="2" style="color:var(--text-muted); text-align:center; padding:16px; font-style:italic;">Chưa có tiêu chí chấm điểm.</td></tr>'
          }
        </table>
      </div>

      <!-- File đính kèm -->
      <div style="font-size:17px; font-weight:700; color:var(--text-main); margin-bottom:10px; display:flex; align-items:center; gap:8px;">📎 File đính kèm</div>
      ${ex.FileDinhKem
        ? `<div style="display:flex; flex-wrap:wrap; gap:10px;">
            ${ex.FileDinhKem.split(',').map(file => {
              const fileName = file.trim().split('/').pop();
              return `<a href="${file.trim()}" target="_blank" style="padding:10px 16px; background:white; border:1.5px solid #e2e8f0; color:var(--text-main); border-radius:10px; font-weight:600; font-size:16px; text-decoration:none; display:flex; align-items:center; gap:10px; transition:all 0.15s;" onmouseover="this.style.borderColor='#6366f1'" onmouseout="this.style.borderColor='#e2e8f0'">
                <span style="font-size:21px;">📄</span>
                <div><div style="font-size:12px; color:var(--text-muted);">Tài liệu</div>${fileName.length > 30 ? fileName.substring(0,27)+'...' : fileName}</div>
              </a>`;
            }).join('')}
          </div>`
        : `<div style="padding:18px; border:2px dashed #e2e8f0; border-radius:12px; text-align:center; color:var(--text-muted); font-size:16px; font-style:italic;">Không có file đính kèm.</div>`
      }
    `;
    // Reset scroll về đầu để luôn hiển thị từ hàng đầu tiên
    body.scrollTop = 0;
  } catch (err) {
    console.error('[admin modal]', err);
    body.innerHTML = `<div style="text-align:center; padding:30px; color:#ef4444;">❌ Lỗi: ${err.message}</div>`;
  }
}

function closeAdminExModal() {
  const modal = document.getElementById('admin-exercise-modal');
  if (modal) { modal.style.display = 'none'; document.body.style.overflow = 'auto'; }
}

// ESC đóng modal
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeAdminExModal();
});

// Click nền đóng modal
document.addEventListener('click', e => {
  if (e.target.id === 'admin-exercise-modal') closeAdminExModal();
});



async function loadAdminInfo() {
  try {
    const res = await fetch('/api/lecturer/me', { credentials: 'include' });
    if (res.ok) {
      const admin = await res.json();
      const userName = document.querySelector('.admin-user-name');
      if (userName) userName.textContent = admin.name;
    }
  } catch (err) { console.error('Admin info load failed'); }
}

async function loadDashboardStats() {
  try {
    const monthFilter = document.getElementById('activity-month-filter')?.value || '';
    const query = monthFilter ? `?month=${monthFilter}` : '';

    const [lecRes, exRes, loginRes, subjRes, studentRes] = await Promise.all([
      fetch('/api/admin/lecturers', { credentials: 'include' }),
      fetch('/api/admin/exercises', { credentials: 'include' }),
      fetch(`/api/admin/chart/login-activity${query}`, { credentials: 'include' }),
      fetch('/api/subjects', { credentials: 'include' }),
      fetch('/api/admin/stats/total-students-active', { credentials: 'include' })
    ]);

    if (lecRes.ok) {
      const lecturers = await lecRes.json();
      document.getElementById('total-lecturers').textContent = lecturers.length;
    }
    if (exRes.ok) {
      const exercises = await exRes.json();
      // API trả về { stats, data, pagination } — lấy tổng từ stats.Total
      const totalEx = exercises?.stats?.Total ?? exercises?.pagination?.total ?? (Array.isArray(exercises) ? exercises.length : 0);
      document.getElementById('total-exercises').textContent = totalEx;
    }
    if (loginRes.ok) {
      const data = await loginRes.json();
      renderActivityChart(data);
    }
    if (subjRes.ok) {
      const subjects = await subjRes.json();
      document.getElementById('total-subjects').textContent = subjects.length;
    }
    if (studentRes.ok) {
      const studentData = await studentRes.json();
      document.getElementById('today-logins').textContent = studentData.count || 0;
    }

    loadSkillLevels();
    loadExercisesPerSubjectChart();
    loadDashboardPieCharts();
  } catch (err) { console.error('Dashboard stats load failed', err); }
}

async function loadDashboardPieCharts() {
  try {
    const res = await fetch('/api/admin/stats/distribution', { credentials: 'include' });
    if (!res.ok) return;
    const data = await res.json();

    // Xóa "Đang tải..." khỏi cả 2 legend tables
    const subLeg = document.getElementById('dash-subject-legend-tbody');
    const lvlLeg = document.getElementById('dash-level-legend-tbody');
    if (subLeg) subLeg.innerHTML = '';
    if (lvlLeg) lvlLeg.innerHTML = '';

    if (data.bySubject && data.bySubject.length) {
      renderPieChart('dash-pie-subject', data.bySubject, 'subject', 'dash-subject-legend-tbody');
    } else if (subLeg) {
      subLeg.innerHTML = '<tr><td colspan="3" style="text-align:center;padding:16px;color:var(--text-muted);">Không có dữ liệu</td></tr>';
    }

    if (data.byLevel && data.byLevel.length) {
      const lvlData = data.byLevel.map(l => ({ label: 'Cấp độ ' + l.label, value: l.value, rawLvl: l.label }));
      renderPieChart('dash-pie-level', lvlData, 'level', 'dash-level-legend-tbody');
    } else if (lvlLeg) {
      lvlLeg.innerHTML = '<tr><td colspan="3" style="text-align:center;padding:16px;color:var(--text-muted);">Không có dữ liệu</td></tr>';
    }
  } catch (e) { console.error('Dashboard pie charts failed', e); }
}

function renderActivityChart(data) {
  const ctx = document.getElementById('chart-login-activity');
  if (!ctx) return;
  if (dashboardCharts.lineChart) dashboardCharts.lineChart.destroy();
  dashboardCharts.lineChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.map(d => d.day.substring(5).split('-').reverse().join('/')),
      datasets: [
        {
          label: 'Tổng lượt làm bài',
          data: data.map(d => d.count),
          borderColor: '#2563eb',
          backgroundColor: 'rgba(37,99,235,0.1)',
          fill: true, tension: 0.3, pointRadius: 6, pointHitRadius: 20
        },
        {
          label: 'Sinh viên độc lập',
          data: data.map(d => d.uniqueCount),
          borderColor: '#10b981',
          backgroundColor: 'transparent',
          borderDash: [5,5],
          fill: false, tension: 0.3, pointRadius: 6, pointHitRadius: 20
        }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: { legend: { display: true, position: 'top' } },
      scales: { 
        y: { beginAtZero: true, ticks: { stepSize: 5 } },
        x: { ticks: { maxRotation: 0, minRotation: 0 } }
      },
      onClick: (e, elements) => {
        if (elements.length > 0) {
          const date = data[elements[0].index].date;
          openActivityModal(date);
        }
      }
    }
  });
}

async function loadSkillLevels() {
  const container = document.getElementById('skill-level-cards');
  const totalEl   = document.getElementById('skill-total-count');
  if (!container) return;

  const LEVELS = [
    { lvl: 1, name: 'Lắp ghép cú pháp',       icon: '🔧', color: '#10b981', bg: '#f0fdf4', border: '#bbf7d0' },
    { lvl: 2, name: 'Luồng rẽ nhánh',          icon: '🔀', color: '#06b6d4', bg: '#f0f9ff', border: '#bae6fd' },
    { lvl: 3, name: 'Vòng lặp & Mảng',         icon: '🔁', color: '#f59e0b', bg: '#fefce8', border: '#fef08a' },
    { lvl: 4, name: 'Hàm & Cấu trúc dữ liệu',  icon: '⚙️', color: '#f97316', bg: '#fff7ed', border: '#fed7aa' },
    { lvl: 5, name: 'Tư duy giải thuật',        icon: '🧠', color: '#8b5cf6', bg: '#f5f3ff', border: '#ddd6fe' },
  ];

  container.innerHTML = '<div style="text-align:center; padding:20px; color:var(--text-muted);">⏳ Đang tải...</div>';

  try {
    const res = await fetch('/api/admin/stats/skill-levels', { credentials: 'include' });
    const data = await res.json();

    let total = 0;
    data.forEach(d => total += (d.Count || 0));
    if (totalEl) totalEl.textContent = total;

    container.innerHTML = '';

    LEVELS.forEach(({ lvl, name, icon, color, bg, border }) => {
      const entry = data.find(d => String(d.Level) === String(lvl)) || { Count: 0 };
      const count = entry.Count || 0;
      const pct   = total > 0 ? ((count / total) * 100).toFixed(1) : '0.0';

      const card = document.createElement('div');
      card.style.cssText = `background:${bg}; border:1px solid ${border}; border-radius:10px; padding:12px 14px; display:flex; align-items:center; gap:12px; transition:box-shadow 0.15s;`;
      card.onmouseover = () => card.style.boxShadow = `0 4px 12px ${color}33`;
      card.onmouseout  = () => card.style.boxShadow = '';

      card.innerHTML = `
        <!-- Icon -->
        <div style="width:38px; height:38px; background:${color}; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:19px; flex-shrink:0;">${icon}</div>
        <!-- Content -->
        <div style="flex:1; min-width:0;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">
            <div>
              <span style="font-size:12px; font-weight:700; color:${color}; text-transform:uppercase; letter-spacing:0.5px;">Level ${lvl}</span>
              <div style="font-size:15px; font-weight:600; color:var(--text-main); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:180px;">${name}</div>
            </div>
            <div style="text-align:right; flex-shrink:0; margin-left:8px;">
              <div style="font-size:19px; font-weight:800; color:${color};">${count}</div>
              <div style="font-size:12px; color:var(--text-muted);">bài tập</div>
            </div>
          </div>
          <!-- Progress bar -->
          <div style="background:#e2e8f0; border-radius:20px; height:7px; overflow:hidden; margin-bottom:5px;">
            <div style="width:${pct}%; height:100%; background:${color}; border-radius:20px; transition:width 0.6s ease;"></div>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:14px; color:var(--text-muted);">${pct}% tổng số</span>
            <button onclick="viewSkillLevelDetails(${lvl})"
              style="padding:4px 12px; background:${color}; color:white; border:none; border-radius:6px; font-size:14px; font-weight:600; cursor:pointer; opacity:${count > 0 ? 1 : 0.4};"
              ${count === 0 ? 'disabled' : ''}>
              Xem chi tiết →
            </button>
          </div>
        </div>
      `;
      container.appendChild(card);
    });
  } catch (e) {
    console.error('Skill levels failed', e);
    container.innerHTML = '<div style="padding:20px; color:#ef4444; text-align:center;">❌ Lỗi tải dữ liệu</div>';
  }
}

async function loadExercisesPerSubjectChart() {
  const res = await fetch('/api/admin/chart/exercises-per-subject', { credentials: 'include' });
  if (res.ok) {
    const data = await res.json();
    const ctx = document.getElementById('chart-exercises-per-subject');
    if (!ctx) return;
    if (dashboardCharts.barChart) dashboardCharts.barChart.destroy();
    dashboardCharts.barChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.map(d => d.label || d.subject),
        datasets: [{ label: 'Số bài tập', data: data.map(d => d.count), backgroundColor: '#6366f1', borderRadius: 6 }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, ticks: { stepSize: 5 } } }
      }
    });
  }
}

async function openActivityModal(date) {
  const modal   = document.getElementById('activity-detail-modal');
  const tbody   = document.getElementById('activity-modal-tbody');
  const title   = document.getElementById('activity-modal-title');
  const sub     = document.getElementById('activity-modal-subtitle');
  const statBar = document.getElementById('activity-modal-stats');

  const fmtDate = new Date(date + 'T00:00:00').toLocaleDateString('vi-VN',{weekday:'long',day:'2-digit',month:'2-digit',year:'numeric'});
  if (title) title.textContent = `Hoạt Động Ngày ${date}`;
  if (sub)   sub.textContent   = fmtDate;
  if (statBar) statBar.innerHTML = '';
  if (tbody) tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:30px;color:var(--text-muted);">⏳ Đang tải danh sách sinh viên...</td></tr>';
  if (modal) modal.classList.add('show');

  try {
    const res = await fetch(`/api/admin/submissions-by-date/${date}`, { credentials: 'include' });
    if (res.ok) {
      const submissions = await res.json();

      // Stats bar
      if (statBar && submissions.length > 0) {
        const uniqueSV = new Set(submissions.map(s => s.student_id)).size;
        const avgScore = (submissions.reduce((a,s) => a + (s.total_score||0), 0) / submissions.length).toFixed(1);
        statBar.innerHTML = [
          {icon:'📋', val: submissions.length, label:'Lượt Nộp'},
          {icon:'👥', val: uniqueSV,           label:'Sinh Viên'},
          {icon:'⭐', val: avgScore,            label:'Điểm TB'},
        ].map(s => `
          <div style="padding:14px;text-align:center;border-right:1px solid var(--border-color);">
            <div style="font-size:21px;">${s.icon}</div>
            <div style="font-size:23px;font-weight:800;color:var(--text-main);">${s.val}</div>
            <div style="font-size:12px;color:var(--text-muted);font-weight:600;text-transform:uppercase;">${s.label}</div>
          </div>`
        ).join('');
      }

      if (tbody) {
        tbody.innerHTML = '';
        if (submissions.length === 0) {
          tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:30px;color:var(--text-muted);">Không có lượt làm bài nào trong ngày này</td></tr>';
          return;
        }
        submissions.forEach(s => {
          const time = new Date(s.submitted_at).toLocaleTimeString('vi-VN', { hour:'2-digit', minute:'2-digit' });
          const score = s.total_score || 0;
          const scoreColor = score >= 80 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444';
          const row = document.createElement('tr');
          row.style.cssText = 'transition:background 0.15s;';
          row.onmouseenter = () => row.style.background = '#f8fafc';
          row.onmouseleave = () => row.style.background = '';
          row.innerHTML = `
            <td style="padding:11px 14px;font-family:monospace;font-size:15px;color:#6366f1;font-weight:600;">${time}</td>
            <td style="padding:11px 14px;">
              <div style="font-weight:700;font-size:15px;color:var(--text-main);">${s.student_name}</div>
              <div style="font-size:12px;color:var(--text-muted);">MSSV: ${s.student_id}</div>
            </td>
            <td style="padding:11px 14px;font-size:15px;color:var(--text-main);">${s.TenBaiTap || s.assignment_code}</td>
            <td style="padding:11px 14px;text-align:center;">
              <span style="background:${scoreColor}22;color:${scoreColor};padding:4px 14px;border-radius:20px;font-weight:800;font-size:15px;border:1px solid ${scoreColor}44;">${score}</span>
            </td>
          `;
          tbody.appendChild(row);
        });
      }
    }
  } catch (e) { if (tbody) tbody.innerHTML = '<tr><td colspan="4" style="color:#ef4444;text-align:center;padding:20px;">Lỗi tải dữ liệu</td></tr>'; }
}

function closeActivityModal() { 
  const modal = document.getElementById('activity-detail-modal');
  if (modal) modal.classList.remove('show'); 
}

// ─── Skill Level Detail Modal ───────────────────────────
const SKILL_LEVEL_CFG = [
  null, // index 0 unused
  { name: 'Lắp ghép cú pháp',      icon: '🔧', color: '#10b981', gradient: 'linear-gradient(135deg,#10b981,#059669)' },
  { name: 'Luồng rẽ nhánh',        icon: '🔀', color: '#06b6d4', gradient: 'linear-gradient(135deg,#06b6d4,#0891b2)' },
  { name: 'Vòng lặp & Mảng',       icon: '🔁', color: '#f59e0b', gradient: 'linear-gradient(135deg,#f59e0b,#d97706)' },
  { name: 'Hàm & Cấu trúc DL',     icon: '⚙️', color: '#f97316', gradient: 'linear-gradient(135deg,#f97316,#ea580c)' },
  { name: 'Tư duy giải thuật',      icon: '🧠', color: '#8b5cf6', gradient: 'linear-gradient(135deg,#8b5cf6,#7c3aed)' },
];

async function viewSkillLevelDetails(level) {
  const modal    = document.getElementById('skill-detail-modal');
  const tbody    = document.getElementById('skill-modal-tbody');
  const titleEl  = document.getElementById('skill-modal-title');
  const subtitle = document.getElementById('skill-modal-subtitle');
  const header   = document.getElementById('skill-modal-header');

  const cfg = SKILL_LEVEL_CFG[level] || { name: `Level ${level}`, icon: '📊', gradient: 'linear-gradient(135deg,#6366f1,#818cf8)', color: '#6366f1' };

  if (titleEl)  titleEl.textContent = `${cfg.icon} Level ${level}: ${cfg.name}`;
  if (subtitle) subtitle.textContent = 'Danh sách bài tập được gán ở mức kỹ năng này';
  if (header)   header.style.background = cfg.gradient;
  if (tbody)    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:30px; color:var(--text-muted);"><span style="font-size:21px;">⏳</span><br>Đang tải...</td></tr>';

  modal.style.display = 'block';
  document.body.style.overflow = 'hidden';

  try {
    const res  = await fetch(`/api/admin/exercises-by-level/${level}`, { credentials: 'include' });
    const data = await res.json();

    if (!data.length) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:30px; color:var(--text-muted); font-style:italic;">Chưa có bài tập nào được gán level này.</td></tr>';
      return;
    }

    const levelCfg = { 1:'#10b981',2:'#f59e0b',3:'#f97316',4:'#ef4444',5:'#7c3aed' };
    const diffCfg  = { 1:{bg:'#f0fdf4',color:'#16a34a',label:'Dễ'}, 2:{bg:'#fefce8',color:'#ca8a04',label:'TB'}, 3:{bg:'#fef2f2',color:'#dc2626',label:'Khó'} };

    tbody.innerHTML = data.map((ex, i) => {
      const diff = diffCfg[ex.MaDoKho] || { bg:'#f1f5f9', color:'#64748b', label: ex.TenDoKho || '—' };
      const gv   = ex.TenGiangVien || ex.MaGiangVien || '—';
      const initials = gv !== '—' ? gv.split(' ').map(w => w[0]).slice(-2).join('').toUpperCase() : '?';
      return `<tr style="background:var(--card-bg, #fff); border-bottom:1px solid #f1f5f9; transition:background 0.1s;"
                  onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='var(--card-bg, #fff)'">
        <td style="padding:11px 12px; font-family:monospace; font-size:14px; color:#6366f1; font-weight:600;">${ex.MaBaiTap}</td>
        <td style="padding:11px 12px; font-size:16px; font-weight:600; color:var(--text-main); max-width:220px;">
          <div style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${ex.TenBaiTap || '—'}</div>
        </td>
        <td style="padding:11px 12px;">
          <span style="background:#eff6ff; color:#2563eb; padding:2px 8px; border-radius:20px; font-size:14px; font-weight:600;">${ex.MaMon || '—'}</span>
          <div style="font-size:12px; color:var(--text-muted); margin-top:2px;">${ex.TenMon || ''}</div>
        </td>
        <td style="padding:11px 12px;">
          <div style="display:flex; align-items:center; gap:7px;">
            <div style="width:26px; height:26px; border-radius:50%; background:${cfg.gradient}; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:700; color:white; flex-shrink:0;">${initials}</div>
            <span style="font-size:15px; color:var(--text-main);">${gv}</span>
          </div>
        </td>
        <td style="padding:11px 12px; text-align:center;">
          <span style="background:${diff.bg}; color:${diff.color}; padding:3px 10px; border-radius:20px; font-size:14px; font-weight:700;">${diff.label}</span>
        </td>
        <td style="padding:11px 12px; text-align:center;">
          <button onclick="openAdminExModal('${ex.MaBaiTap}')"
            style="padding:4px 10px; background:#eff6ff; color:#2563eb; border:1px solid #bfdbfe; border-radius:6px; font-size:14px; font-weight:600; cursor:pointer;">👁 Xem</button>
        </td>
      </tr>`;
    }).join('');

  } catch (e) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:20px; color:#ef4444;">❌ Lỗi: ${e.message}</td></tr>`;
  }
}

function closeSkillModal() {
  const modal = document.getElementById('skill-detail-modal');
  if (modal) { modal.style.display = 'none'; document.body.style.overflow = 'auto'; }
}

// Close modals on backdrop click
document.addEventListener('click', e => {
  if (e.target.id === 'skill-detail-modal') closeSkillModal();
  if (e.target.id === 'sv-detail-modal') closeSvModal();
});

function logout() {
  fetch('/api/lecturer/logout', { method: 'POST' }).finally(() => {
    location.href = '/login';
  });
}

// ═══════════════════════════════════════════════════
//  STUDENT MANAGEMENT
// ═══════════════════════════════════════════════════
let svCurrentPage = 1;
let svSearchTimer = null;

async function initStudentsSection() {
  // Load classes dropdown
  try {
    const res = await fetch('/api/admin/students/classes', { credentials: 'include' });
    const classes = await res.json();
    const sel = document.getElementById('sv-filter-class');
    if (sel) {
      sel.innerHTML = '<option value="">— Tất cả lớp —</option>';
      classes.forEach(c => { const o = document.createElement('option'); o.value = c; o.textContent = c; sel.appendChild(o); });
    }
    // Also populate export dropdown
    const expSel = document.getElementById('exp-sv-lop');
    if (expSel) {
      expSel.innerHTML = '<option value="">— Tất cả lớp —</option>';
      classes.forEach(c => { const o = document.createElement('option'); o.value = c; o.textContent = c; expSel.appendChild(o); });
    }
  } catch (_) {}
  loadStudents(1);
}

function svSearchDebounce() {
  clearTimeout(svSearchTimer);
  svSearchTimer = setTimeout(() => loadStudents(1), 400);
}

async function loadStudents(page = 1) {
  svCurrentPage = page;
  const tbody  = document.getElementById('sv-tbody');
  const search = document.getElementById('sv-search')?.value || '';
  const lop    = document.getElementById('sv-filter-class')?.value || '';
  if (tbody) tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:40px; color:var(--text-muted);">⏳ Đang tải...</td></tr>';

  try {
    const url = `/api/admin/students?page=${page}&limit=20&search=${encodeURIComponent(search)}&lop=${encodeURIComponent(lop)}`;
    const res  = await fetch(url, { credentials: 'include' });
    const json = await res.json();

    // Update stats
    if (json.stats) {
      const el = (id) => document.getElementById(id);
      if (el('sv-stat-total'))    el('sv-stat-total').textContent    = json.stats.total || 0;
      if (el('sv-stat-classes'))  el('sv-stat-classes').textContent  = json.stats.classes || 0;
      if (el('sv-stat-faculties'))el('sv-stat-faculties').textContent= json.stats.faculties || 0;
    }

    renderStudents(json.data || []);

    // Pagination
    const { page: p, total, pages } = json.pagination || {};
    const info = document.getElementById('sv-pagination-info');
    const btns = document.getElementById('sv-pagination-btns');
    if (info) info.textContent = `Hiển thị ${(p-1)*20+1}–${Math.min(p*20, total)} / ${total} sinh viên`;
    if (btns) {
      btns.innerHTML = '';
      for (let i = 1; i <= pages; i++) {
        if (pages > 7 && Math.abs(i - p) > 2 && i !== 1 && i !== pages) continue;
        const btn = document.createElement('button');
        btn.textContent = i;
        btn.style.cssText = `padding:5px 10px; border-radius:6px; border:1px solid ${i===p?'#6366f1':'#e2e8f0'}; background:${i===p?'#6366f1':'white'}; color:${i===p?'white':'#374151'}; cursor:pointer; font-size:15px; font-weight:600;`;
        btn.onclick = () => loadStudents(i);
        btns.appendChild(btn);
      }
    }

    // Count submitted
    const submitted = (json.data || []).filter(s => s.submission_count > 0).length;
    const svSub = document.getElementById('sv-stat-submitted');
    if (svSub) svSub.textContent = submitted;

  } catch (e) {
    if (tbody) tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:30px; color:#ef4444;">❌ Lỗi: ${e.message}</td></tr>`;
  }
}

function renderStudents(data) {
  const tbody = document.getElementById('sv-tbody');
  if (!tbody) return;
  if (!data.length) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:40px; color:var(--text-muted); font-style:italic;">Không tìm thấy sinh viên nào</td></tr>';
    return;
  }
  const sexColor = { 'Nam': '#3b82f6', 'Nữ': '#ec4899' };
  tbody.innerHTML = data.map(s => {
    const pct    = Math.min(100, Math.round(s.assignment_completion || 0));
    const avgFmt = s.avg_score > 0 ? s.avg_score.toFixed(1) : '—';
    const lastSub = s.last_submitted ? new Date(s.last_submitted).toLocaleDateString('vi-VN') : '—';
    const sexBadge = s.sex ? `<span style="background:${(sexColor[s.sex]||'#64748b')}22; color:${sexColor[s.sex]||'#64748b'}; padding:2px 7px; border-radius:20px; font-size:12px; font-weight:700;">${s.sex}</span>` : '';
    return `
      <tr style="border-bottom:1px solid #f8fafc; transition:background 0.1s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background=''">
        <td style="padding:12px 16px; font-family:monospace; font-size:15px; color:#6366f1; font-weight:600;">${s.student_id}</td>
        <td style="padding:12px 16px;">
          <div style="font-weight:600; color:var(--text-main); font-size:16px;">${s.name}</div>
          <div style="margin-top:2px;">${sexBadge}</div>
        </td>
        <td style="padding:12px 16px; text-align:center;">
          <span style="background:#eff6ff; color:#2563eb; padding:3px 10px; border-radius:20px; font-size:14px; font-weight:600;">${s.class || '—'}</span>
        </td>
        <td style="padding:12px 16px; text-align:center; font-size:15px; color:var(--text-muted); font-weight:600;">${s.khoa || '—'}</td>
        <td style="padding:12px 16px; text-align:center;">
          <span style="background:${s.submission_count>0?'#f0fdf4':'#f8fafc'}; color:${s.submission_count>0?'#16a34a':'#94a3b8'}; padding:3px 10px; border-radius:20px; font-size:15px; font-weight:700;">${s.submission_count}</span>
        </td>
        <td style="padding:12px 16px; text-align:center; font-size:16px; font-weight:700; color:${s.avg_score>=7?'#16a34a':s.avg_score>=5?'#d97706':'#dc2626'};">${avgFmt}</td>
        <td style="padding:12px 16px; text-align:center; min-width:100px;">
          <div style="background:#e2e8f0; border-radius:20px; height:6px; overflow:hidden; margin-bottom:3px;">
            <div style="width:${pct}%; height:100%; background:${pct>=70?'#10b981':pct>=40?'#f59e0b':'#f87171'}; border-radius:20px;"></div>
          </div>
          <span style="font-size:12px; color:var(--text-muted);">${pct}%</span>
        </td>
        <td style="padding:12px 16px; text-align:center;">
          <button onclick="openSvDetail(${s.student_id})"
            style="padding:5px 12px; background:#eff6ff; color:#2563eb; border:1px solid #bfdbfe; border-radius:6px; font-size:14px; font-weight:600; cursor:pointer;">
            👁 Xem
          </button>
        </td>
      </tr>`;
  }).join('');
}

async function openSvDetail(studentId) {
  const modal   = document.getElementById('sv-detail-modal');
  const nameEl  = document.getElementById('sv-modal-name');
  const infoEl  = document.getElementById('sv-modal-info');
  const scores  = document.getElementById('sv-modal-scores');
  const tbody   = document.getElementById('sv-history-tbody');

  if (nameEl)  nameEl.textContent  = 'Đang tải...';
  if (infoEl)  infoEl.textContent  = '';
  if (scores)  scores.innerHTML    = '';
  if (tbody)   tbody.innerHTML     = '<tr><td colspan="6" style="text-align:center; padding:30px; color:var(--text-muted);">⏳ Đang tải...</td></tr>';
  modal.style.display = 'block';
  document.body.style.overflow = 'hidden';

  try {
    const res  = await fetch(`/api/admin/student/${studentId}/history`, { credentials: 'include' });
    const data = await res.json();
    const s    = data.student || {};

    if (nameEl) nameEl.textContent = s.name || `SV #${studentId}`;
    if (infoEl) infoEl.textContent = `MSSV: ${studentId} · Lớp: ${s.class || '—'} · Khoa: ${s.khoa || '—'} · ${s.sex || ''}`;

    // Score summary boxes
    if (scores) {
      scores.innerHTML = [
        { label: 'Điểm Tổng',    val: (s.total_score||0).toFixed(1),    color: '#6366f1' },
        { label: 'Giữa Kỳ',      val: (s.midterm_score||0).toFixed(1),  color: '#10b981' },
        { label: 'Cuối Kỳ',      val: (s.final_score||0).toFixed(1),    color: '#f59e0b' },
        { label: 'Tổng Nộp Bài', val: data.history.length,               color: '#8b5cf6' },
      ].map(b => `
        <div style="padding:16px; text-align:center; border-right:1px solid #f1f5f9;">
          <div style="font-size:23px; font-weight:800; color:${b.color};">${b.val}</div>
          <div style="font-size:14px; color:var(--text-muted); margin-top:2px;">${b.label}</div>
        </div>
      `).join('');
    }

    // History
    if (!data.history.length) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:30px; color:var(--text-muted); font-style:italic;">Chưa có lần nộp bài nào</td></tr>';
    } else {
      tbody.innerHTML = data.history.map(h => {
        const score = h.final_score || h.total_score || 0;
        const scoreColor = score >= 7 ? '#16a34a' : score >= 5 ? '#d97706' : '#dc2626';
        const dt = h.submitted_at ? new Date(h.submitted_at).toLocaleString('vi-VN') : '—';
        return `<tr style="border-bottom:1px solid #f8fafc;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background=''">
          <td style="padding:9px 10px; font-family:monospace; font-size:14px; color:#6366f1;">${h.assignment_code}</td>
          <td style="padding:9px 10px; font-size:15px; font-weight:600; color:var(--text-main);">${h.TenBaiTap || '—'}</td>
          <td style="padding:9px 10px; font-size:15px; color:var(--text-muted);">${h.TenMon || h.MaMon || '—'}</td>
          <td style="padding:9px 10px; text-align:center;"><span style="background:${scoreColor}22; color:${scoreColor}; padding:2px 8px; border-radius:20px; font-weight:700; font-size:15px;">${score.toFixed(1)}</span></td>
          <td style="padding:9px 10px; text-align:center;">${h.plagiarism_detected ? '<span style="color:#dc2626; font-weight:700;">⚠ Có</span>' : '<span style="color:#10b981;">✓ Không</span>'}</td>
          <td style="padding:9px 10px; font-size:14px; color:var(--text-muted);">${dt}</td>
        </tr>`;
      }).join('');
    }
  } catch (e) {
    if (tbody) tbody.innerHTML = `<tr><td colspan="6" style="color:#ef4444; text-align:center;">❌ ${e.message}</td></tr>`;
  }
}

function closeSvModal() {
  const m = document.getElementById('sv-detail-modal');
  if (m) { m.style.display = 'none'; document.body.style.overflow = 'auto'; }
}

// ═══════════════════════════════════════════════════
//  EXPORT SECTION
// ═══════════════════════════════════════════════════
// Store admin subjects globally for export picker
window._adminExportSubjects = [];
window._adminExportAllExercises = []; // flat list of all exercises in selected subject

async function initExportSection() {
  try {
    const res  = await fetch('/api/subjects', { credentials: 'include' });
    const subs = await res.json();
    window._adminExportSubjects = subs;
    ['exp-ex-mamon', 'exp-gr-mamon'].forEach(id => {
      const sel = document.getElementById(id);
      if (!sel) return;
      sel.innerHTML = '<option value="">— Chọn môn —</option>';
      subs.forEach(s => {
        const o = document.createElement('option');
        // Support both field naming conventions
        const code = s.subject_id || s.MaMon || '';
        const name = s.subject_name || s.TenMon || '';
        o.value = code;
        o.textContent = name ? `${code} – ${name}` : code;
        sel.appendChild(o);
      });
    });
  } catch (_) {}
  loadExportLog();
  loadAdminExportListSV();
  loadAdminExportListGR();
}

async function loadAdminExportList() {
  const mamon = document.getElementById('exp-ex-mamon')?.value || '';
  const container = document.getElementById('exp-ex-list-container');
  if (!container) return;

  if (!mamon) {
    container.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-muted);font-size:16px;">← Chọn môn học để xem danh sách bài tập</div>';
    window._adminExportAllExercises = [];
    updateAdminExportCount();
    return;
  }

  container.innerHTML = '<div style="text-align:center;padding:30px;color:var(--text-muted);">⏳ Đang tải...</div>';
  try {
    const res = await fetch(`/api/subject/${mamon}`, { credentials: 'include' });
    if (!res.ok) throw new Error('Not found');
    const subj = await res.json();
    const forms = subj.forms || [];

    // Flatten exercises with form info
    const all = [];
    forms.forEach(f => (f.exercises || []).forEach(ex => {
      all.push({ ...ex, _formName: f.name || f.form_id, _formId: f.form_id });
    }));
    window._adminExportAllExercises = all;

    // Populate form filter
    const formSel = document.getElementById('exp-ex-form');
    if (formSel) {
      formSel.innerHTML = '<option value="">Tất cả dạng</option>';
      forms.forEach(f => {
        const o = document.createElement('option');
        o.value = f.form_id; o.textContent = f.name || f.form_id;
        formSel.appendChild(o);
      });
    }

    applyAdminExportFilters();
  } catch(e) {
    container.innerHTML = `<div style="text-align:center;padding:30px;color:var(--danger);">❌ Lỗi: ${e.message}</div>`;
  }
}

function applyAdminExportFilters() {
  const formId = document.getElementById('exp-ex-form')?.value || '';
  const diff   = document.getElementById('exp-ex-diff')?.value  || '';
  const level  = document.getElementById('exp-ex-level')?.value || '';

  const all = window._adminExportAllExercises || [];
  const filtered = all.filter(ex => {
    if (formId && String(ex._formId) !== formId) return false;
    if (diff && (ex.difficulty || '') !== diff) return false;
    if (level && String(ex.skill_level) !== level) return false;
    return true;
  });

  renderAdminExportList(filtered);
}

function renderAdminExportList(exercises) {
  const container = document.getElementById('exp-ex-list-container');
  if (!container) return;

  if (!exercises.length) {
    container.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-muted);">Không có bài tập phù hợp với bộ lọc</div>';
    updateAdminExportCount();
    return;
  }

  // Group by form
  const byForm = {};
  exercises.forEach(ex => {
    const key = ex._formId;
    if (!byForm[key]) byForm[key] = { name: ex._formName, items: [] };
    byForm[key].items.push(ex);
  });

  const diffBadge = d => {
    const cls = d === 'Khó' ? '#ef4444' : (d === 'Trung bình' ? '#f59e0b' : '#10b981');
    return `<span style="font-size:12px;font-weight:700;padding:2px 8px;border-radius:20px;background:${cls}22;color:${cls};">${d||'—'}</span>`;
  };

  let html = '';
  Object.entries(byForm).forEach(([fid, grp]) => {
    html += `
      <div style="margin-bottom:16px;">
        <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 12px;background:var(--primary-light);border-radius:8px 8px 0 0;border:1px solid var(--border-color);border-bottom:none;">
          <div style="font-size:15px;font-weight:700;color:var(--primary);">📁 ${grp.name}</div>
          <label style="font-size:14px;font-weight:600;color:var(--text-muted);cursor:pointer;display:flex;align-items:center;gap:5px;">
            <input type="checkbox" class="grp-chk" data-form="${fid}" onchange="selectGroupExport(this)" style="width:14px;height:14px;accent-color:var(--primary);"> Chọn cả nhóm
          </label>
        </div>
        <div style="border:1px solid var(--border-color);border-radius:0 0 8px 8px;overflow:hidden;">`;

    grp.items.forEach((ex, i) => {
      const sl = ex.skill_level;
      const lvlColors = {1:'#10b981',2:'#3b82f6',3:'#f59e0b',4:'#8b5cf6',5:'#ef4444'};
      const lvlColor = lvlColors[sl] || '#94a3b8';
      html += `
          <div class="exp-ex-row" style="display:flex;align-items:center;gap:12px;padding:10px 14px;${i%2===0?'background:var(--card-bg)':'background:var(--bg-color)'};border-bottom:1px solid var(--border-color);" onmouseover="this.style.background='var(--primary-light)'" onmouseout="this.style.background='${i%2===0?'var(--card-bg)':'var(--bg-color)'}'">
            <input type="checkbox" class="exp-ex-chk" data-id="${ex.id}" onchange="updateAdminExportCount()" style="width:15px;height:15px;accent-color:var(--primary);flex-shrink:0;">
            <div style="flex:1;min-width:0;">
              <div style="font-size:15px;font-weight:600;color:var(--text-main);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${ex.title||'—'}</div>
              <div style="font-size:12px;color:var(--text-muted);margin-top:2px;font-family:monospace;">${ex.name||''}</div>
            </div>
            ${diffBadge(ex.difficulty)}
            ${sl ? `<span style="font-size:12px;font-weight:700;padding:2px 8px;border-radius:20px;background:${lvlColor}22;color:${lvlColor};">L${sl}</span>` : ''}
          </div>`;
    });
    html += `</div></div>`;
  });

  container.innerHTML = html;
  updateAdminExportCount();
}

function selectGroupExport(chk) {
  const fid = chk.dataset.form;
  const rows = document.querySelectorAll(`#exp-ex-list-container .exp-ex-chk`);
  // Find exercises in this form group
  const formExIds = (window._adminExportAllExercises || [])
    .filter(ex => String(ex._formId) === String(fid))
    .map(ex => String(ex.id));
  rows.forEach(c => {
    if (formExIds.includes(String(c.dataset.id))) c.checked = chk.checked;
  });
  updateAdminExportCount();
}

function selectAllAdminExport(val) {
  document.querySelectorAll('#exp-ex-list-container .exp-ex-chk').forEach(c => c.checked = val);
  document.querySelectorAll('#exp-ex-list-container .grp-chk').forEach(c => c.checked = val);
  updateAdminExportCount();
}

function updateAdminExportCount() {
  const n = document.querySelectorAll('#exp-ex-list-container .exp-ex-chk:checked').length;
  const el = document.getElementById('exp-ex-selected-count');
  if (el) el.textContent = n;
}

async function doExportSelected(type = 'exercises') {
  let ids = [];
  let format = 'xlsx';
  let body = {};

  if (type === 'exercises') {
    ids = [...document.querySelectorAll('#exp-ex-list-container .exp-ex-chk:checked')].map(c => c.dataset.id);
    if (!ids.length) { alert('Vui lòng chọn ít nhất 1 bài tập!'); return; }
    format = document.querySelector('input[name="exp-ex-fmt"]:checked')?.value || 'xlsx';
    body = { format, mamon: document.getElementById('exp-ex-mamon')?.value || '', exercise_ids: ids };
  } else if (type === 'students') {
    ids = [...document.querySelectorAll('#exp-sv-list-container .exp-sv-chk:checked')].map(c => c.dataset.id);
    if (!ids.length) { alert('Vui lòng chọn ít nhất 1 sinh viên!'); return; }
    format = document.querySelector('input[name="exp-sv-fmt"]:checked')?.value || 'xlsx';
    body = { format, lop: document.getElementById('exp-sv-lop')?.value || '', student_ids: ids };
  } else if (type === 'grades') {
    ids = [...document.querySelectorAll('#exp-gr-list-container .exp-gr-chk:checked')].map(c => c.dataset.id);
    if (!ids.length) { alert('Vui lòng chọn ít nhất 1 bài nộp!'); return; }
    format = document.querySelector('input[name="exp-gr-fmt"]:checked')?.value || 'xlsx';
    body = { format, mamon: document.getElementById('exp-gr-mamon')?.value || '', history_ids: ids };
  }

  const btn = event?.target;
  const orig = btn?.textContent;
  if (btn) { btn.textContent = '⏳ Đang xuất...'; btn.disabled = true; }

  try {
    const res = await fetch(`/api/admin/export/${type}`, {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Lỗi xuất file'); }
    const blob = await res.blob();
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; 
    const labelMap = { exercises: 'BaiTap_ChonLoc', students: 'SinhVien_ChonLoc', grades: 'DiemNopBai_ChonLoc' };
    const ext = format === 'csv' ? 'csv' : (format === 'pdf' ? 'pdf' : 'xlsx');
    a.download = `${labelMap[type]}.${ext}`;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
    loadExportLog();
  } catch(e) {
    alert('❌ ' + e.message);
  } finally {
    if (btn) { btn.textContent = orig; btn.disabled = false; }
  }
}

async function doExport(type) {
  const fmtMap   = { exercises: 'exp-ex-fmt', students: 'exp-sv-fmt', grades: 'exp-gr-fmt' };
  const format   = document.querySelector(`input[name="${fmtMap[type]}"]:checked`)?.value || 'xlsx';
  const body     = { format };

  if (type === 'exercises') body.mamon = document.getElementById('exp-ex-mamon')?.value || '';
  if (type === 'students')  body.lop   = document.getElementById('exp-sv-lop')?.value   || '';
  if (type === 'grades')    body.mamon = document.getElementById('exp-gr-mamon')?.value  || '';

  const labelMap = { exercises: 'Danh Sách Bài Tập', students: 'Danh Sách Sinh Viên', grades: 'Điểm Nộp Bài' };
  const btn = event.target;
  const origText = btn.textContent;
  btn.textContent = '⏳ Đang xuất...'; btn.disabled = true;

  try {
    const res = await fetch(`/api/admin/export/${type}`, {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!res.ok) { const err = await res.json(); throw new Error(err.error || 'Lỗi xuất file'); }

    const blob   = await res.blob();
    const ext    = format === 'csv' ? 'csv' : (format === 'pdf' ? 'pdf' : 'xlsx');
    const url    = URL.createObjectURL(blob);
    const link   = document.createElement('a');
    link.href    = url;
    link.download = `${labelMap[type].replace(/ /g,'_')}.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    loadExportLog();
  } catch (e) {
    alert('❌ Lỗi xuất file: ' + e.message);
  } finally {
    btn.textContent = origText; btn.disabled = false;
  }
}

async function loadExportLog() {
  const tbody = document.getElementById('export-log-tbody');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:20px; color:var(--text-muted);">⏳ Đang tải...</td></tr>';
  try {
    const res  = await fetch('/api/admin/export/log', { credentials: 'include' });
    const logs = await res.json();
    if (!logs.length) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:30px; color:var(--text-muted); font-style:italic;">Chưa có lịch sử xuất</td></tr>';
      return;
    }
    const typeLabel = { exercises:'📋 Bài Tập', students:'🎓 Sinh Viên', grades:'📊 Điểm', import_exercises:'📥 Nhập Bài Tập' };
    const fmtColor  = { xlsx:'#16a34a', csv:'#0891b2' };
    tbody.innerHTML = logs.map(l => {
      const dt = new Date(l.exported_at).toLocaleString('vi-VN');
      return `<tr style="border-bottom:1px solid #f8fafc;">
        <td style="padding:11px 16px; font-weight:600; color:var(--text-main);">${l.exported_by || '—'}</td>
        <td style="padding:11px 16px; text-align:center;">${typeLabel[l.export_type] || l.export_type}</td>
        <td style="padding:11px 16px; text-align:center;">
          <span style="background:${(fmtColor[l.format]||'#64748b')}22; color:${fmtColor[l.format]||'#64748b'}; padding:2px 9px; border-radius:20px; font-size:14px; font-weight:700; text-transform:uppercase;">${l.format}</span>
        </td>
        <td style="padding:11px 16px; text-align:center; font-weight:700; color:#6366f1;">${l.row_count || 0}</td>
        <td style="padding:11px 16px; font-size:15px; color:var(--text-muted);">${dt}</td>
      </tr>`;
    }).join('');
  } catch (e) { tbody.innerHTML = `<tr><td colspan="5" style="color:#ef4444; text-align:center;">❌ ${e.message}</td></tr>`; }
}


// ═══════════════════ ADMIN FEEDBACK HISTORY ═══════════════════
let allAdminFeedbacks = [];
let filteredAdminFeedbacks = [];

async function loadAllFeedbacks() {
  const list = document.getElementById('fb-admin-list');
  const stats = document.getElementById('fb-admin-stats');
  if (list) list.innerHTML = '<div style="text-align:center;padding:30px;color:var(--text-muted)">⏳ Đang tải...</div>';

  try {
    const res = await fetch('/api/admin/feedbacks', { credentials: 'include' });
    allAdminFeedbacks = await res.json();

    // Render stats
    if (stats) {
      const total = allAdminFeedbacks.length;
      const pending = allAdminFeedbacks.filter(f => f.Status === 0).length;
      const resolved = allAdminFeedbacks.filter(f => f.Status === 1).length;
      const rejected = allAdminFeedbacks.filter(f => f.Status === 2).length;
      const senders = [...new Set(allAdminFeedbacks.map(f => f.SenderId))].length;
      stats.innerHTML = `
        <div style="flex:1;min-width:130px;background:linear-gradient(135deg,#6366f1,#818cf8);border-radius:12px;padding:14px 16px;color:#fff">
          <div style="font-size:12px;font-weight:600;opacity:.8">Tổng góp ý</div>
          <div style="font-size:28px;font-weight:800">${total}</div>
        </div>
        <div style="flex:1;min-width:130px;background:linear-gradient(135deg,#f59e0b,#fbbf24);border-radius:12px;padding:14px 16px;color:#fff">
          <div style="font-size:12px;font-weight:600;opacity:.8">Chờ xử lý</div>
          <div style="font-size:28px;font-weight:800">${pending}</div>
        </div>
        <div style="flex:1;min-width:130px;background:linear-gradient(135deg,#10b981,#34d399);border-radius:12px;padding:14px 16px;color:#fff">
          <div style="font-size:12px;font-weight:600;opacity:.8">Đã xử lý</div>
          <div style="font-size:28px;font-weight:800">${resolved}</div>
        </div>
        <div style="flex:1;min-width:130px;background:linear-gradient(135deg,#ef4444,#f87171);border-radius:12px;padding:14px 16px;color:#fff">
          <div style="font-size:12px;font-weight:600;opacity:.8">Từ chối</div>
          <div style="font-size:28px;font-weight:800">${rejected}</div>
        </div>
        <div style="flex:1;min-width:130px;background:linear-gradient(135deg,#8b5cf6,#a78bfa);border-radius:12px;padding:14px 16px;color:#fff">
          <div style="font-size:12px;font-weight:600;opacity:.8">Giảng viên</div>
          <div style="font-size:28px;font-weight:800">${senders}</div>
        </div>`;
    }

    filterAdminFeedbacks();
  } catch(e) {
    if (list) list.innerHTML = '<div style="color:#ef4444;padding:20px">Lỗi: ' + e.message + '</div>';
  }
}

function filterAdminFeedbacks() {
  const search = (document.getElementById('fb-admin-search')?.value || '').toLowerCase();
  const status = document.getElementById('fb-admin-status')?.value || '';

  filteredAdminFeedbacks = allAdminFeedbacks.filter(fb => {
    if (status !== '' && String(fb.Status) !== status) return false;
    if (search) {
      const haystack = [fb.TenBaiTap, fb.MaBaiTap, fb.SenderName, fb.ReceiverName, fb.Category, fb.Content, fb.TenMon].join(' ').toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    return true;
  });

  renderAdminFeedbacks();
}

function renderAdminFeedbacks() {
  const list = document.getElementById('fb-admin-list');
  if (!list) return;

  if (filteredAdminFeedbacks.length === 0) {
    list.innerHTML = '<div style="background:var(--card-bg);border:1px solid var(--border-color);border-radius:12px;padding:40px;text-align:center;color:var(--text-muted)"><div style="font-size:40px;margin-bottom:12px">📭</div><div style="font-size:17px;font-weight:600">Không tìm thấy góp ý nào</div></div>';
    return;
  }

  const statusMap = {0:['⏳','Chờ xử lý','#f59e0b','#fef9c3'], 1:['✅','Đã xử lý','#16a34a','#dcfce7'], 2:['❌','Từ chối','#ef4444','#fee2e2']};
  const lvlColors = {1:'#10b981',2:'#06b6d4',3:'#f59e0b',4:'#f97316',5:'#8b5cf6'};
  const diffColors = {'Dễ':['#dcfce7','#166534'],'Trung bình':['#fef9c3','#854d0e'],'Khó':['#fee2e2','#991b1b']};

  list.innerHTML = filteredAdminFeedbacks.map((fb, idx) => {
    const st = statusMap[fb.Status] || statusMap[0];
    const date = fb.CreatedAt ? new Date(fb.CreatedAt).toLocaleString('vi-VN') : '—';
    const lc = lvlColors[fb.SkillLevel||1] || '#94a3b8';
    const dc = diffColors[fb.TenDoKho] || ['#f1f5f9','#475569'];

    return `<div style="background:var(--card-bg);border:1px solid var(--border-color);border-radius:14px;overflow:hidden;transition:box-shadow .15s" onmouseenter="this.style.boxShadow='0 4px 16px rgba(0,0,0,.08)'" onmouseleave="this.style.boxShadow=''">
      <!-- Card Header -->
      <div style="display:flex;justify-content:space-between;align-items:center;padding:14px 18px;background:var(--bg-color);border-bottom:1px solid var(--border-color)">
        <div style="display:flex;align-items:center;gap:10px;flex:1;min-width:0">
          <div style="width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,#f59e0b,#fbbf24);display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0">💬</div>
          <div style="min-width:0">
            <div style="font-size:16px;font-weight:700;color:var(--text-main);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${fb.TenBaiTap||'(Không xác định)'}</div>
            <div style="font-size:14px;color:var(--text-muted)">Mã: ${fb.MaBaiTap||'—'} · ${fb.TenMon||'—'}</div>
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:8px;flex-shrink:0">
          <span style="font-size:12px;font-weight:600;padding:3px 10px;border-radius:20px;background:${dc[0]};color:${dc[1]}">${fb.TenDoKho||'—'}</span>
          <span style="font-size:12px;font-weight:700;padding:3px 8px;border-radius:8px;background:${lc}20;color:${lc};border:1px solid ${lc}44">L${fb.SkillLevel||1}</span>
          <span style="font-size:12px;font-weight:600;padding:3px 10px;border-radius:20px;background:${st[3]};color:${st[2]}">${st[0]} ${st[1]}</span>
        </div>
      </div>
      <!-- Card Body -->
      <div style="padding:14px 18px">
        <div style="display:flex;justify-content:space-between;margin-bottom:10px;flex-wrap:wrap;gap:6px">
          <div style="display:flex;gap:16px;font-size:15px">
            <span style="color:var(--text-muted)">📤 Người gửi: <b style="color:var(--text-main)">${fb.SenderName||fb.SenderId||'—'}</b></span>
            <span style="color:var(--text-muted)">📥 Người nhận: <b style="color:var(--text-main)">${fb.ReceiverName||fb.ReceiverId||'—'}</b></span>
          </div>
          <span style="font-size:14px;color:var(--text-muted)">🕐 ${date}</span>
        </div>
        <div style="font-size:15px;font-weight:600;color:#6366f1;margin-bottom:6px">📌 ${fb.Category||'Góp ý chung'}</div>
        <div style="font-size:16px;color:var(--text-main);line-height:1.6;background:var(--bg-color);padding:10px 14px;border-radius:8px;border-left:3px solid #6366f1">${fb.Content||'(Không có nội dung)'}</div>
        ${fb.TenDangBai ? '<div style="margin-top:8px;font-size:14px;color:var(--text-muted)">📋 Dạng bài: <b>' + fb.TenDangBai + '</b></div>' : ''}
      </div>
    </div>`;
  }).join('');
}

// ==============================================================================
//  IMPORT EXCEL LOGIC
// ==============================================================================
let importDataCache = [];

async function handleAdminImport(event) {
  const file = event.target.files[0];
  if (!file) return;
  event.target.value = ''; // reset input
  
  const btn = document.getElementById('admin-import-btn');
  const origTxt = btn.innerHTML;
  btn.innerHTML = '⏳ Đang đọc...'; btn.disabled = true;

  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const res = await fetch('/api/admin/import/preview', {
      method: 'POST', credentials: 'include',
      body: formData
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Lỗi đọc file');
    
    importDataCache = result.preview;
    renderImportPreview();
    document.getElementById('import-preview-modal').style.display = 'flex';
  } catch(err) {
    alert('❌ ' + err.message);
  } finally {
    btn.innerHTML = origTxt; btn.disabled = false;
  }
}

function renderImportPreview() {
  const tbody = document.getElementById('import-preview-tbody');
  tbody.innerHTML = '';
  if (!importDataCache.length) {
    tbody.innerHTML = '<tr><td colspan="5" style="padding:15px;text-align:center;color:var(--text-muted);">Không tìm thấy dữ liệu hợp lệ trong file.</td></tr>';
    document.getElementById('import-confirm-btn').disabled = true;
    return;
  }
  document.getElementById('import-confirm-btn').disabled = false;

  importDataCache.forEach((row, idx) => {
    let actionHtml = row.action === 'UPDATE' 
      ? '<span style="color:#eab308;font-weight:700;padding:2px 8px;background:#fef08a;border-radius:6px;">UPDATE</span>' 
      : '<span style="color:#10b981;font-weight:700;padding:2px 8px;background:#d1fae5;border-radius:6px;">INSERT</span>';
      
    let statusHtml = row.status === 'VALID'
      ? '<span style="color:#10b981;">Hợp lệ</span>'
      : '<span style="color:#ef4444;">Lỗi: Thiếu tên bài</span>';

    tbody.innerHTML += `
      <tr style="border-bottom:1px solid var(--border-color);">
        <td style="padding:10px;">${idx + 1}</td>
        <td style="padding:10px; font-weight:600; color:var(--text-main);">${row.MaBaiTap || '<i style="color:var(--text-muted)">Sẽ tạo mới</i>'}</td>
        <td style="padding:10px; max-width:250px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${row.TenBaiTap}">${row.TenBaiTap || '—'}</td>
        <td style="padding:10px;">${actionHtml}</td>
        <td style="padding:10px; font-weight:600;">${statusHtml}</td>
      </tr>
    `;
  });
}

function closeImportPreview() {
  document.getElementById('import-preview-modal').style.display = 'none';
  importDataCache = [];
}

async function confirmImport() {
  const validData = importDataCache.filter(d => d.status === 'VALID');
  if (!validData.length) return alert('Không có dữ liệu hợp lệ để lưu!');
  
  const btn = document.getElementById('import-confirm-btn');
  const origTxt = btn.innerHTML;
  btn.innerHTML = '⏳ Đang lưu...'; btn.disabled = true;

  try {
    const res = await fetch('/api/admin/import/confirm', {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: validData })
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Lỗi lưu dữ liệu');
    
    alert(`✅ Import thành công!\n- Đã cập nhật (Update): ${result.updated} bài\n- Đã thêm mới (Insert): ${result.inserted} bài`);
    closeImportPreview();
    // Refresh exercise list if current section is exercises
    const exSec = document.getElementById('exercises');
    if (exSec && exSec.style.display !== 'none' && typeof loadExercises === 'function') {
      loadExercises();
    }
  } catch(err) {
    alert('❌ ' + err.message);
  } finally {
    btn.innerHTML = origTxt; btn.disabled = false;
  }
}


// ----- STUDENTS EXPORT LOGIC -----
window._adminExportAllStudents = [];
async function loadAdminExportListSV() {
  const container = document.getElementById('exp-sv-list-container');
  if (!container) return;
  container.innerHTML = '<div style="text-align:center;padding:30px;color:var(--text-muted);">⏳ Đang tải...</div>';
  try {
    const res = await fetch('/api/admin/students/list', { credentials: 'include' });
    if (!res.ok) throw new Error('Not found');
    const students = await res.json();
    window._adminExportAllStudents = students;

    const lopSel = document.getElementById('exp-sv-lop');
    if (lopSel) {
      const classes = [...new Set(students.map(s => s.class))].filter(Boolean).sort();
      lopSel.innerHTML = '<option value="">— Tất cả lớp —</option>';
      classes.forEach(c => {
        const o = document.createElement('option');
        o.value = c; o.textContent = c;
        lopSel.appendChild(o);
      });
    }
    applyAdminExportStudentFilters();
  } catch(e) {
    container.innerHTML = `<div style="text-align:center;padding:30px;color:var(--danger);">❌ Lỗi: ${e.message}</div>`;
  }
}

function applyAdminExportStudentFilters() {
  const lop = document.getElementById('exp-sv-lop')?.value || '';
  const all = window._adminExportAllStudents || [];
  const filtered = all.filter(s => {
    if (lop && s.class !== lop) return false;
    return true;
  });
  renderAdminExportListSV(filtered);
}

function renderAdminExportListSV(students) {
  const container = document.getElementById('exp-sv-list-container');
  if (!container) return;
  if (!students.length) {
    container.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-muted);">Không có sinh viên phù hợp với bộ lọc</div>';
    document.getElementById('exp-sv-selected-count').textContent = 0;
    return;
  }

  const byClass = {};
  students.forEach(s => {
    const key = s.class || 'Chưa phân lớp';
    if (!byClass[key]) byClass[key] = { name: key, items: [] };
    byClass[key].items.push(s);
  });

  let html = '';
  Object.entries(byClass).forEach(([cls, grp]) => {
    html += `
      <div style="margin-bottom:16px;">
        <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 12px;background:var(--primary-light);border-radius:8px 8px 0 0;border:1px solid var(--border-color);border-bottom:none;">
          <div style="font-size:15px;font-weight:700;color:var(--primary);">🏫 Lớp ${grp.name}</div>
          <label style="font-size:13px;font-weight:600;color:var(--primary);cursor:pointer;display:flex;align-items:center;gap:4px;">
            <input type="checkbox" class="grp-chk-sv" data-cls="${cls}" onchange="toggleExportGrpSV(this, '${cls}')"> Chọn nhóm
          </label>
        </div>
        <div style="border:1px solid var(--border-color);border-radius:0 0 8px 8px;background:var(--bg-color);">
    `;
    grp.items.forEach(s => {
      html += `
        <label style="display:flex;align-items:center;padding:10px 12px;border-bottom:1px solid var(--border-color);cursor:pointer;transition:background 0.15s;" onmouseover="this.style.background='var(--card-bg)'" onmouseout="this.style.background='transparent'">
          <input type="checkbox" class="exp-sv-chk" data-id="${s.student_id}" data-cls="${cls}" style="margin-right:12px;width:16px;height:16px;" onchange="updateAdminExportSVCount()">
          <div style="flex:1;">
            <div style="font-size:14px;font-weight:600;color:var(--text-main);margin-bottom:2px;">${s.student_id} - ${s.name}</div>
            <div style="font-size:12px;color:var(--text-muted);">Tổng điểm: ${s.total_score} | Hoàn thành: ${s.assignment_completion}%</div>
          </div>
        </label>
      `;
    });
    html += `</div></div>`;
  });
  container.innerHTML = html;
  updateAdminExportSVCount();
}

function toggleExportGrpSV(chk, cls) {
  document.querySelectorAll(`.exp-sv-chk[data-cls="${cls}"]`).forEach(c => c.checked = chk.checked);
  updateAdminExportSVCount();
}

function updateAdminExportSVCount() {
  const n = document.querySelectorAll('#exp-sv-list-container .exp-sv-chk:checked').length;
  const el = document.getElementById('exp-sv-selected-count');
  if (el) el.textContent = n;
}

function selectAllAdminExportSV(val) {
  document.querySelectorAll('#exp-sv-list-container .exp-sv-chk').forEach(c => c.checked = val);
  document.querySelectorAll('#exp-sv-list-container .grp-chk-sv').forEach(c => c.checked = val);
  updateAdminExportSVCount();
}

// ----- GRADES EXPORT LOGIC -----
window._adminExportAllGrades = [];
async function loadAdminExportListGR() {
  const container = document.getElementById('exp-gr-list-container');
  if (!container) return;
  container.innerHTML = '<div style="text-align:center;padding:30px;color:var(--text-muted);">⏳ Đang tải...</div>';
  try {
    const res = await fetch('/api/admin/grades/list', { credentials: 'include' });
    if (!res.ok) throw new Error('Not found');
    const grades = await res.json();
    window._adminExportAllGrades = grades;
    applyAdminExportGradeFilters();
  } catch(e) {
    container.innerHTML = `<div style="text-align:center;padding:30px;color:var(--danger);">❌ Lỗi: ${e.message}</div>`;
  }
}

function applyAdminExportGradeFilters() {
  const mamon = document.getElementById('exp-gr-mamon')?.value || '';
  const all = window._adminExportAllGrades || [];
  const filtered = all.filter(g => {
    let gMamon = g.MaMon;
    if (!gMamon && g.assignment_code) {
      if (g.assignment_code.startsWith('CTDL_')) gMamon = 'CTDLGT';
      else if (g.assignment_code.startsWith('LTW_')) gMamon = 'LTW';
    }
    if (mamon && gMamon !== mamon) return false;
    return true;
  });
  renderAdminExportListGR(filtered);
}

function renderAdminExportListGR(grades) {
  const container = document.getElementById('exp-gr-list-container');
  if (!container) return;
  if (!grades.length) {
    container.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-muted);">Không có bài nộp phù hợp với bộ lọc</div>';
    document.getElementById('exp-gr-selected-count').textContent = 0;
    return;
  }

  const byMon = {};
  grades.forEach(g => {
    let key = g.MaMon;
    if (!key && g.assignment_code) {
      if (g.assignment_code.startsWith('CTDL_')) key = 'CTDLGT';
      else if (g.assignment_code.startsWith('LTW_')) key = 'LTW';
      else key = 'Khác';
    } else if (!key) {
      key = 'Khác';
    }
    
    let subjName = key;
    if (window._adminExportSubjects) {
       const found = window._adminExportSubjects.find(s => s.subject_id === key || s.MaMon === key);
       if (found) subjName = `${key} - ${found.subject_name || found.TenMon}`;
    }
    if (key === 'Khác') subjName = 'Các môn khác (Không xác định)';

    if (!byMon[key]) byMon[key] = { name: subjName, items: [] };
    byMon[key].items.push(g);
  });

  let html = '';
  Object.entries(byMon).forEach(([mon, grp]) => {
    html += `
      <div style="margin-bottom:16px;">
        <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 12px;background:var(--primary-light);border-radius:8px 8px 0 0;border:1px solid var(--border-color);border-bottom:none;">
          <div style="font-size:15px;font-weight:700;color:var(--primary);">📚 Môn ${grp.name}</div>
          <label style="font-size:13px;font-weight:600;color:var(--primary);cursor:pointer;display:flex;align-items:center;gap:4px;">
            <input type="checkbox" class="grp-chk-gr" data-mon="${mon}" onchange="toggleExportGrpGR(this, '${mon}')"> Chọn nhóm
          </label>
        </div>
        <div style="border:1px solid var(--border-color);border-radius:0 0 8px 8px;background:var(--bg-color);">
    `;
    grp.items.forEach(g => {
      let plagColor = g.plagiarism_detected ? '#ef4444' : '#10b981';
      html += `
        <label style="display:flex;align-items:center;padding:10px 12px;border-bottom:1px solid var(--border-color);cursor:pointer;transition:background 0.15s;" onmouseover="this.style.background='var(--card-bg)'" onmouseout="this.style.background='transparent'">
          <input type="checkbox" class="exp-gr-chk" data-id="${g.id}" data-mon="${mon}" style="margin-right:12px;width:16px;height:16px;" onchange="updateAdminExportGRCount()">
          <div style="flex:1;">
            <div style="font-size:14px;font-weight:600;color:var(--text-main);margin-bottom:2px;">${g.student_name} - ${g.TenBaiTap}</div>
            <div style="font-size:12px;color:var(--text-muted);">Điểm: <b>${g.total_score}</b> | Trạng thái: ${g.status} | <span style="color:${plagColor}">Đạo văn: ${g.plagiarism_detected ? 'Có' : 'Không'}</span></div>
          </div>
        </label>
      `;
    });
    html += `</div></div>`;
  });
  container.innerHTML = html;
  updateAdminExportGRCount();
}

function toggleExportGrpGR(chk, mon) {
  document.querySelectorAll(`.exp-gr-chk[data-mon="${mon}"]`).forEach(c => c.checked = chk.checked);
  updateAdminExportGRCount();
}

function updateAdminExportGRCount() {
  const n = document.querySelectorAll('#exp-gr-list-container .exp-gr-chk:checked').length;
  const el = document.getElementById('exp-gr-selected-count');
  if (el) el.textContent = n;
}

function selectAllAdminExportGr(val) {
  document.querySelectorAll('#exp-gr-list-container .exp-gr-chk').forEach(c => c.checked = val);
  document.querySelectorAll('#exp-gr-list-container .grp-chk-gr').forEach(c => c.checked = val);
  updateAdminExportGRCount();
}

