// frontend script to fetch /api/baitap and render into table tbody#baitap-body
// Uses only vanilla JS; handles errors and basic escaping.

function escapeHtml(s) {
  if (s == null) return '';
  return String(s).replace(/[&<>"'`]/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '`': '&#96;'
  }[c]));
}

function formatCell(s) {
  if (s == null) return '';
  return escapeHtml(String(s)).replace(/\n/g, '<br>');
}

document.addEventListener('DOMContentLoaded', async () => {
  const tbody = document.getElementById('baitap-body');
  if (!tbody) return;

  tbody.innerHTML = '<tr><td colspan="9">Đang tải...</td></tr>';

  try {
    const resp = await fetch('/api/baitap');
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();

    if (!Array.isArray(data) || data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="9">Không có bài tập.</td></tr>';
      return;
    }

    const rows = data.map((item, idx) => {
      const MaBaiTap = item.MaBaiTap ?? item.ExerciseID ?? '';
      const TenBaiTap = item.TenBaiTap ?? item.Title ?? '';
      const TenMon = item.TenMon ?? item.SubjectName ?? '';
      const TenDangBai = item.TenDangBai ?? item.TypeName ?? '';
      const TenDoKho = item.TenDoKho ?? item.LevelName ?? '';
      const MoTa = item.MoTa ?? item.Description ?? '';
      const YeuCau = item.YeuCau ?? item.Requirements ?? '';
      const TieuChi = item.TieuChiChamDiem ?? item.GradingCriteria ?? '';

      return `
        <tr>
          <td>${idx + 1}</td>
          <td>${escapeHtml(MaBaiTap)}</td>
          <td>${escapeHtml(TenBaiTap)}</td>
          <td>${escapeHtml(TenMon)}</td>
          <td>${escapeHtml(TenDangBai)}</td>
          <td>${escapeHtml(TenDoKho)}</td>
          <td>${formatCell(MoTa)}</td>
          <td>${formatCell(YeuCau)}</td>
          <td>${formatCell(TieuChi)}</td>
        </tr>`;
    }).join('');

    tbody.innerHTML = rows;
  } catch (err) {
    console.error('Error loading baitap:', err);
    tbody.innerHTML = `<tr><td colspan="9">Lỗi khi tải dữ liệu: ${escapeHtml(err.message || String(err))}</td></tr>`;
  }
});
