// client-side logic for duplicates

async function loadDuplicatesSection() {
    try {
        const btn = document.getElementById('btn-start-scan');
        if (btn && window.location.pathname.includes('admin')) {
            btn.style.display = 'flex';
        }

        const res = await fetch('/api/duplicate/reports', { credentials: 'include' });
        if (!res.ok) throw new Error('Failed to load reports');
        const data = await res.json();
        const tbody = document.getElementById('duplicates-tbody');
        if (!tbody) return;
        
        if (data.reports.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="padding:20px;text-align:center;color:var(--text-muted);">🎉 Tuyệt vời! Không có bài tập nào nghi ngờ sao chép.</td></tr>';
        } else {
            // Cần lưu reports vào biến toàn cục để modal dùng
            window.currentDuplicateReports = data.reports;
            
            tbody.innerHTML = data.reports.map(r => {
                let scoreColor = r.SimilarityScore >= 90 ? '#ef4444' : '#f59e0b';
                let scoreBadge = `<span style="background:${scoreColor}20;color:${scoreColor};padding:4px 8px;border-radius:6px;font-weight:700;font-size:14px;">${r.SimilarityScore}%</span>`;
                
                return `
                <tr style="border-bottom:1px solid var(--border-color);">
                    <td style="padding:14px;">${scoreBadge}<br><span style="font-size:12px;color:var(--text-muted);">${r.DetectedBy}</span></td>
                    <td style="padding:14px;">
                        <div style="font-weight:600;color:var(--text-main);margin-bottom:4px;">${r.TenA}</div>
                        <div style="font-size:12px;color:var(--text-muted);">GV: ${r.GVA}</div>
                    </td>
                    <td style="padding:14px;">
                        <div style="font-weight:600;color:var(--text-main);margin-bottom:4px;">${r.TenB}</div>
                        <div style="font-size:12px;color:var(--text-muted);">GV: ${r.GVB}</div>
                    </td>
                    <td style="padding:14px;">
                        <button onclick="openDuplicateModal(${r.ReportId})" style="background:var(--bg-color);border:1px solid var(--border-color);padding:6px 12px;border-radius:6px;cursor:pointer;color:var(--text-main);font-weight:600;font-size:13px;">👁 Đối soát</button>
                    </td>
                </tr>
                `;
            }).join('');
        }
        
    } catch (e) {
        console.error(e);
        const tbody = document.getElementById('duplicates-tbody');
        if (tbody) tbody.innerHTML = '<tr><td colspan="4" style="padding:20px;text-align:center;color:red;">Lỗi tải dữ liệu.</td></tr>';
    }
    
    // Tải lịch sử ngay sau khi tải xong phần PENDING
    loadDuplicateHistory();
}

async function syncAllMissingAI() {
    showCustomConfirm("Bắt đầu đồng bộ vân tay AI cho các bài tập cũ?<br><br><span style='font-size:14px;color:var(--text-muted)'>Quá trình này sẽ chạy ngầm và gọi API Groq cho từng bài tập cũ (mỗi bài cách nhau 2 giây). Bạn có thể đóng thông báo này và làm việc khác.</span>", async () => {
        const btn = document.getElementById('btn-sync-ai');
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = '⏳ Đang đồng bộ chạy ngầm...';
            btn.style.opacity = '0.7';
        }
        try {
            const res = await fetch('/api/duplicate/sync-all', { method: 'POST', credentials: 'include' });
            const data = await res.json();
            if (res.ok) {
                showCustomAlert(`✅ ${data.message}<br><br>Có <b>${data.count}</b> bài tập cũ đang được đồng bộ. Vui lòng chờ khoảng ${Math.ceil(data.count * 2 / 60)} phút trước khi bấm Quét Toàn Hệ Thống!`);
            } else {
                showCustomAlert('Lỗi đồng bộ: ' + data.error, true);
                if (btn) { btn.disabled = false; btn.innerHTML = 'Đồng bộ vân tay AI (Bài cũ)'; btn.style.opacity = '1'; }
            }
        } catch (e) {
            showCustomAlert('Lỗi kết nối.', true);
            if (btn) { btn.disabled = false; btn.innerHTML = 'Đồng bộ vân tay AI (Bài cũ)'; btn.style.opacity = '1'; }
        }
    });
}

async function startDuplicateScan() {
    showCustomConfirm("Bắt đầu quét chéo toàn hệ thống?<br><br><span style='font-size:14px;color:var(--text-muted)'>Quá trình quét bằng AI Groq có thể mất vài giây đến vài phút tùy vào số lượng bài tập.</span>", async () => {
        const btn = document.getElementById('btn-start-scan');
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = '⏳ Đang quét...';
        }
        
        try {
            const res = await fetch('/api/duplicate/scan', { method: 'POST', credentials: 'include' });
            const data = await res.json();
            if (res.ok) {
                showCustomAlert(`Đã kiểm tra xong ${data.totalChecked} bài tập bằng AI.<br><br><b style="color:#ef4444;">Phát hiện thêm ${data.duplicatesFound} trường hợp nghi ngờ sao chép!</b>`);
                loadDuplicatesSection();
            } else {
                showCustomAlert('Lỗi quét: ' + data.error, true);
            }
        } catch (e) {
            showCustomAlert('Lỗi kết nối.', true);
        } finally {
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = '<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg> Quét Toàn Hệ Thống';
            }
        }
    });
}


function openDuplicateModal(reportId, isHistory = false) {
    let report = null;
    if (window.currentDuplicateReports) report = window.currentDuplicateReports.find(r => r.ReportId === reportId);
    if (!report && window.duplicateHistoryReports) report = window.duplicateHistoryReports.find(r => r.ReportId === reportId);
    if (!report) return;
    
    document.getElementById('current-dup-report-id').value = reportId;
    document.getElementById('dup-score').innerText = report.SimilarityScore + '%';
    
    // Method text
    const methodEl = document.getElementById('dup-method');
    if (methodEl) {
        if (report.DetectedBy === 'ALGORITHM') {
            methodEl.innerHTML = '⚙️ HardHash<br><span style="font-size:9px;color:#9ca3af;font-weight:400;">Trùng lặp 100%</span>';
        } else {
            methodEl.innerHTML = '🧠 GROQ AI<br><span style="font-size:9px;color:#9ca3af;font-weight:400;">Phân tích ngữ nghĩa</span>';
        }
    }
    
    // Format Date helper
    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toLocaleDateString('vi-VN') + ' ' + d.toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'});
    };
    
    // Check Original vs Copy
    const timeA = new Date(report.UpdatedA || 0).getTime();
    const timeB = new Date(report.UpdatedB || 0).getTime();
    const isAOriginal = timeA <= timeB;
    
    const badgeA = document.getElementById('dup-a-badge');
    const badgeB = document.getElementById('dup-b-badge');
    if (badgeA) {
        badgeA.innerText = isAOriginal ? 'Bản Gốc (Bài A)' : 'Bản Sao (Bài A)';
        badgeA.style.color = isAOriginal ? '#16a34a' : '#dc2626';
    }
    if (badgeB) {
        badgeB.innerText = (!isAOriginal) ? 'Bản Gốc (Bài B)' : 'Bản Sao (Bài B)';
        badgeB.style.color = (!isAOriginal) ? '#16a34a' : '#dc2626';
    }

    // Fill A
    document.getElementById('dup-a-title').innerText = report.TenA;
    document.getElementById('dup-a-gv').innerText = 'GV: ' + report.GVA;
    document.getElementById('dup-a-summary').innerText = report.SumA || '(Chưa phân tích tóm tắt)';
    const ctxA = document.getElementById('dup-a-context');
    if (ctxA) {
        ctxA.innerHTML = `<span style="background:#e0e7ff;padding:2px 6px;border-radius:4px;">Môn: ${report.MonA || '?'}</span>
                          <span style="background:#e0e7ff;padding:2px 6px;border-radius:4px;">Độ khó: ${report.DoKhoA || '?'}</span>
                          <span style="background:#e0e7ff;padding:2px 6px;border-radius:4px;">Cập nhật: ${formatDate(report.UpdatedA)}</span>`;
    }
    const rawA = document.getElementById('dup-a-raw');
    
    // Fill B
    document.getElementById('dup-b-title').innerText = report.TenB;
    document.getElementById('dup-b-gv').innerText = 'GV: ' + report.GVB;
    document.getElementById('dup-b-summary').innerText = report.SumB || '(Chưa phân tích tóm tắt)';
    const ctxB = document.getElementById('dup-b-context');
    if (ctxB) {
        ctxB.innerHTML = `<span style="background:#fee2e2;padding:2px 6px;border-radius:4px;">Môn: ${report.MonB || '?'}</span>
                          <span style="background:#fee2e2;padding:2px 6px;border-radius:4px;">Độ khó: ${report.DoKhoB || '?'}</span>
                          <span style="background:#fee2e2;padding:2px 6px;border-radius:4px;">Cập nhật: ${formatDate(report.UpdatedB)}</span>`;
    }
    const rawB = document.getElementById('dup-b-raw');
    
    // Keywords
    function renderKw(kwStr) {
        try {
            let arr = JSON.parse(kwStr);
            if (!Array.isArray(arr)) arr = [];
            return arr.map(k => `<span style="background:#e2e8f0;color:#334155;padding:2px 8px;border-radius:12px;font-size:12px;font-weight:600;">${k}</span>`).join('');
        } catch(e) { return ''; }
    }
    
    document.getElementById('dup-a-kw').innerHTML = renderKw(report.KwA);
    document.getElementById('dup-b-kw').innerHTML = renderKw(report.KwB);
    
    // Highlight logic (Phrase matching)
    if (rawA && rawB) {
        const textA = (report.MoTaA || '') + '\n\nYêu cầu:\n' + (report.YeuCauA || '');
        const textB = (report.MoTaB || '') + '\n\nYêu cầu:\n' + (report.YeuCauB || '');
        
        const escapeHtml = (unsafe) => (unsafe||'').replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        let aSafe = escapeHtml(textA);
        let bSafe = escapeHtml(textB);
        
        const splitRegex = /([.,!?;:\n]+)/;
        const sentencesA = aSafe.split(splitRegex);
        const sentencesB = bSafe.split(splitRegex);
        
        const clean = s => s.toLowerCase().replace(/[^a-z0-9áàảãạăắằẳẵặâấầẩẫậéèẻẽẹêếềểễệíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữựýỳỷỹỵđ]/g, '');
        const setB = new Set(sentencesB.map(clean).filter(s => s.length > 15));
        const setA = new Set(sentencesA.map(clean).filter(s => s.length > 15));
        
        rawA.innerHTML = sentencesA.map(s => {
            if (clean(s).length > 15 && setB.has(clean(s))) return `<span style="background-color: #fef08a; color: #854d0e; font-weight: 600; border-radius: 3px; padding: 0 2px;">${s}</span>`;
            return s;
        }).join('');
        
        rawB.innerHTML = sentencesB.map(s => {
            if (clean(s).length > 15 && setA.has(clean(s))) return `<span style="background-color: #fef08a; color: #854d0e; font-weight: 600; border-radius: 3px; padding: 0 2px;">${s}</span>`;
            return s;
        }).join('');
    }
    
    // Ẩn nút xử lý nếu là chế độ xem lịch sử
    const ignoreBtn = document.querySelector('#duplicate-modal button[onclick*="IGNORE"]');
    const mergeBtn = document.querySelector('#duplicate-modal button[onclick*="MERGE"]');
    if (ignoreBtn) ignoreBtn.style.display = isHistory ? 'none' : 'inline-block';
    if (mergeBtn) mergeBtn.style.display = isHistory ? 'none' : 'inline-block';
    
    document.getElementById('duplicate-modal').style.display = 'flex';
}

function closeDuplicateModal() {
    document.getElementById('duplicate-modal').style.display = 'none';
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

function showCustomAlert(message, isError = false) {
    const oldModal = document.getElementById('custom-alert-modal');
    if (oldModal) oldModal.remove();

    const overlay = document.createElement('div');
    overlay.id = 'custom-alert-modal';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(4px);';
    
    const box = document.createElement('div');
    box.style.cssText = 'background:var(--card-bg,#fff);width:90%;max-width:400px;border-radius:14px;box-shadow:0 10px 30px rgba(0,0,0,0.2);overflow:hidden;animation:popIn 0.2s ease-out;';
    
    const header = document.createElement('div');
    const headerBg = isError ? '#fef2f2' : '#f0fdf4';
    const headerColor = isError ? '#dc2626' : '#16a34a';
    const headerIcon = isError ? '❌' : '✅';
    const headerTitle = isError ? 'Thông báo lỗi' : 'Thành công';
    
    header.style.cssText = `padding:16px 20px;border-bottom:1px solid var(--border-color,#e2e8f0);background:${headerBg};color:${headerColor};font-weight:700;font-size:18px;display:flex;align-items:center;gap:8px;`;
    header.innerHTML = `${headerIcon} ${headerTitle}`;

    const body = document.createElement('div');
    body.style.cssText = 'padding:20px;font-size:15px;color:var(--text-main,#1e293b);line-height:1.5;';
    body.innerHTML = message;

    const footer = document.createElement('div');
    footer.style.cssText = 'padding:12px 20px;border-top:1px solid var(--border-color,#e2e8f0);display:flex;justify-content:flex-end;gap:10px;background:var(--bg-color,#f8fafc);';

    const btnOk = document.createElement('button');
    btnOk.innerHTML = 'Đóng';
    btnOk.style.cssText = `padding:8px 16px;border:none;border-radius:8px;background:${isError ? '#ef4444' : '#16a34a'};color:white;cursor:pointer;font-weight:700;font-family:inherit;`;
    btnOk.onclick = () => overlay.remove();

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

async function handleDuplicateAction(action) {
    const reportId = document.getElementById('current-dup-report-id').value;
    if (!reportId) return;
    
    const actionName = action === 'MERGE' ? 'GỘP BÀI (Xóa Bài B)' : 'HỢP LỆ (Bỏ qua)';
    showCustomConfirm(`Bạn có chắc chắn muốn thực hiện hành động:<br><br><b style="color:#ef4444;font-size:16px;">${actionName}</b> ?`, async () => {
        try {
            const res = await fetch(`/api/duplicate/reports/${reportId}/action`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                credentials: 'include',
                body: JSON.stringify({ action })
            });
            
            if (res.ok) {
                closeDuplicateModal();
                loadDuplicatesSection(); // Refresh
            } else {
                const data = await res.json();
                showCustomAlert('Lỗi: ' + data.error, true);
            }
        } catch(e) {
            showCustomAlert('Lỗi kết nối', true);
        }
    });
}

async function loadDuplicateHistory() {
    try {
        const res = await fetch('/api/duplicate/reports/history', { credentials: 'include' });
        if (!res.ok) {
            const err = await res.text();
            document.getElementById('duplicate-history-tbody').innerHTML = `<tr><td colspan="5" style="color:red">Lỗi server: ${err}</td></tr>`;
            return;
        }
        const data = await res.json();
        const tbody = document.getElementById('duplicate-history-tbody');
        if (!tbody) return;
        
        if (!data.history || data.history.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="padding:20px;text-align:center;color:var(--text-muted);">Chưa có lịch sử đối soát nào.</td></tr>';
            return;
        }
        
        window.duplicateHistoryReports = data.history;
        
        tbody.innerHTML = data.history.map(r => {
            let statusBadge = r.Status === 'MERGED' 
                ? `<span style="background:#fee2e2;color:#dc2626;padding:4px 8px;border-radius:6px;font-weight:700;font-size:12px;">🗑 Đã Gộp (Xóa B)</span>`
                : `<span style="background:#dcfce7;color:#16a34a;padding:4px 8px;border-radius:6px;font-weight:700;font-size:12px;">✅ Hợp lệ (Bỏ qua)</span>`;
                
            let scoreColor = r.SimilarityScore >= 90 ? '#ef4444' : '#f59e0b';
            let scoreBadge = `<span style="background:${scoreColor}20;color:${scoreColor};padding:4px 8px;border-radius:6px;font-weight:700;font-size:13px;">${r.SimilarityScore}%</span>`;
            
            return `
            <tr style="border-bottom:1px solid var(--border-color);">
                <td style="padding:14px;">${statusBadge}</td>
                <td style="padding:14px;">${scoreBadge}<br><span style="font-size:11px;color:var(--text-muted);">${r.DetectedBy === 'ALGORITHM' ? 'HardHash' : 'GROQ AI'}</span></td>
                <td style="padding:14px;">
                    <div style="font-weight:600;color:var(--text-main);margin-bottom:4px;">${r.TenA}</div>
                    <div style="font-size:12px;color:var(--text-muted);">GV: ${r.GVA}</div>
                </td>
                <td style="padding:14px;">
                    <div style="font-weight:600;color:${r.Status === 'MERGED' ? '#9ca3af;text-decoration:line-through;' : 'var(--text-main);'};margin-bottom:4px;">${r.TenB}</div>
                    <div style="font-size:12px;color:var(--text-muted);">GV: ${r.GVB}</div>
                </td>
                <td style="padding:14px; display:flex; gap:6px;">
                    <button onclick="openDuplicateModal(${r.ReportId}, true)" style="background:var(--bg-color);border:1px solid var(--border-color);padding:6px 12px;border-radius:6px;cursor:pointer;color:var(--text-main);font-weight:600;font-size:12px;transition:0.2s;">
                        👁 Chi tiết
                    </button>
                    <button onclick="restoreDuplicateReport(${r.ReportId})" style="background:transparent;border:1px solid #10b981;padding:6px 12px;border-radius:6px;cursor:pointer;color:#10b981;font-weight:600;font-size:12px;transition:0.2s;">
                        ↺ Khôi phục
                    </button>
                </td>
            </tr>
            `;
        }).join('');
    } catch (e) {
        console.error(e);
        const tbody = document.getElementById('duplicate-history-tbody');
        if (tbody) tbody.innerHTML = `<tr><td colspan="5" style="color:red">Lỗi tải dữ liệu: ${e.message}</td></tr>`;
    }
}

async function restoreDuplicateReport(reportId) {
    showCustomConfirm("Khôi phục lại quyết định này?<br><br><span style='font-size:14px;color:var(--text-muted)'>Bài B sẽ được đưa trở lại danh sách quản lý nếu đã bị xóa gộp.</span>", async () => {
        try {
            const res = await fetch(`/api/duplicate/reports/${reportId}/restore`, { method: 'POST', credentials: 'include' });
            if (res.ok) {
                loadDuplicatesSection(); // Refresh both tables
            } else {
                const data = await res.json();
                showCustomAlert('Lỗi: ' + data.error, true);
            }
        } catch(e) {
            showCustomAlert('Lỗi kết nối', true);
        }
    });
}
