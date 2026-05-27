/**
 * AI Content Generation Module
 * 
 * Module này cung cấp tính năng AI sinh nội dung bài tập
 * Tương thích hoàn toàn với hệ thống hiện tại - không sửa code cũ
 * 
 * Chức năng:
 * 1. Sinh mô tả bài tập từ yêu cầu
 * 2. Sinh yêu cầu từ mô tả
 * 3. Sinh tiêu chí chấm
 * 4. Kiểm tra trùng lặp bài tập
 */

// =========================================================
//  1. AI GENERATE EXERCISE CONTENT
// =========================================================

/**
 * Gọi API để sinh nội dung bài tập dựa trên prompt
 * @param {string} prompt - Mô tả yêu cầu từ giảng viên
 * @param {string} type - Loại sinh nội dung: 'description', 'requirements', 'grading'
 * @returns {Promise<{description, requirements, grading_criteria}>}
 */
async function generateExerciseContent(prompt, type = 'description') {
  try {
    const response = await fetch('/api/ai/generate-exercise', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        prompt,
        type,
        subject_id: document.getElementById('form-subject')?.value || '',
        subject_name: document.getElementById('form-subject')?.options[document.getElementById('form-subject')?.selectedIndex]?.text || '',
        exercise_title: document.getElementById('field-title')?.value || '',
        exercise_type: document.getElementById('form-form')?.options[document.getElementById('form-form')?.selectedIndex]?.text || '',
        difficulty: document.getElementById('field-difficulty')?.value || 'Trung bình'
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error generating exercise content:', error);
    throw error;
  }
}

/**
 * Gọi API để kiểm tra trùng lặp bài tập
 * @param {string} exerciseContent - Nội dung bài tập
 * @returns {Promise<{similarity_score, matched_exercise, details}>}
 */
async function checkExerciseDuplicates(exerciseContent) {
  try {
    const response = await fetch('/api/ai/check-duplicates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        exercise_content: exerciseContent,
        subject_id: (document.getElementById('admin-form-subject') || document.getElementById('form-subject'))?.value || ''
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error checking duplicates:', error);
    throw error;
  }
}

// =========================================================
//  2. UI HANDLERS
// =========================================================

/**
 * Mở modal sinh nội dung bằng AI
 */
function openAIGenerationModal() {
  const modal = document.getElementById('ai-generation-modal');
  if (!modal) {
    console.error('AI generation modal not found');
    return;
  }
  
  // Reset form & Auto-fill prompt from main form
  const title = document.getElementById('field-title')?.value || '';
  const subject = document.getElementById('form-subject')?.options[document.getElementById('form-subject')?.selectedIndex]?.text || '';
  const type = document.getElementById('form-form')?.options[document.getElementById('form-form')?.selectedIndex]?.text || '';
  
  let autoPrompt = "";
  if (title) autoPrompt += `Tên bài tập: ${title}. `;
  if (subject) autoPrompt += `Môn: ${subject}. `;
  if (type) autoPrompt += `Dạng bài: ${type}. `;
  
  document.getElementById('ai-prompt-input').value = autoPrompt;
  document.getElementById('ai-generation-result').innerHTML = '';
  document.getElementById('ai-generation-spinner').style.display = 'none';
  
  modal.classList.add('show');
}

/**
 * Đóng modal sinh nội dung
 */
function closeAIGenerationModal() {
  const modal = document.getElementById('ai-generation-modal');
  if (modal) modal.classList.remove('show');
}

/**
 * Xử lý sinh nội dung
 */
async function handleAIGeneration(event) {
  const prompt = document.getElementById('ai-prompt-input').value.trim();
  const type = document.getElementById('ai-generation-type').value || 'description';
  const spinner = document.getElementById('ai-generation-spinner');
  const resultDiv = document.getElementById('ai-generation-result');
  const button = event.target;

  if (!prompt) {
    alert('Vui lòng nhập mô tả yêu cầu');
    return;
  }

  try {
    button.disabled = true;
    spinner.style.display = 'flex';
    resultDiv.innerHTML = '';

    const result = await generateExerciseContent(prompt, type);

    // Hiển thị kết quả
    let resultHTML = `<div style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:8px; padding:16px;">`;

    // Store globally for handlers
    window.lastAIResult = result;

    if (type === 'description' && result.description) {
      const preview = (typeof marked !== 'undefined' && typeof DOMPurify !== 'undefined') 
        ? DOMPurify.sanitize(marked.parse(result.description)) 
        : result.description;
        
      resultHTML += `
        <div style="margin-bottom:16px;">
          <h4 style="margin:0 0 8px 0; color:#166534;">📝 Mô Tả Bài Tập:</h4>
          <div style="background:white; border:1px solid #e2e8f0; border-radius:6px; padding:12px; font-size:14px; line-height:1.6; max-height:200px; overflow-y:auto;">
            ${preview}
          </div>
          <button type="button" class="btn btn-sm btn-primary" style="margin-top:8px;" onclick="useAIDescription()">
            ✓ Sử dụng mô tả này
          </button>
        </div>
      `;
    }

    if (type === 'requirements' && Array.isArray(result.requirements)) {
      resultHTML += `
        <div style="margin-bottom:16px;">
          <h4 style="margin:0 0 8px 0; color:#166534;">📋 Yêu Cầu:</h4>
          <ul style="margin:0; padding-left:20px;">
            ${result.requirements.map(req => `<li style="margin:6px 0; font-size:14px;">${req}</li>`).join('')}
          </ul>
          <button type="button" class="btn btn-sm btn-primary" style="margin-top:8px;" onclick="useAIRequirements()">
            ✓ Sử dụng yêu cầu này
          </button>
        </div>
      `;
    }

    if (type === 'full' || (result.description && result.requirements && result.grading_criteria)) {
      resultHTML += `
        <div style="margin-top:8px;">
          <h4 style="color:#166534;">✨ Đã sinh đầy đủ thông tin:</h4>
          <p style="font-size:13px; color:#666;">Bấm nút dưới đây để điền toàn bộ vào form chính.</p>
          <button type="button" class="btn btn-primary" style="width:100%; background:#10b981; border:none;" onclick="useAIFullResult()">
            🚀 Điền tất cả vào Form
          </button>
        </div>
      `;
    }

    resultHTML += `</div>`;
    resultDiv.innerHTML = resultHTML;

    // Tự động điền luôn nếu chọn "Sinh toàn bộ"
    if (type === 'full') {
      setTimeout(() => useAIFullResult(), 500);
    }

  } catch (error) {
    resultDiv.innerHTML = `<div style="background:#fee2e2; border:1px solid #fecaca; border-radius:8px; padding:12px; color:#b91c1c;">
      ❌ Lỗi: ${error.message || 'Không thể sinh nội dung'}
    </div>`;
  } finally {
    button.disabled = false;
    spinner.style.display = 'none';
  }
}

/**
 * Sử dụng mô tả sinh được
 */
function useAIDescription() {
  const description = window.lastAIResult?.description;
  if (!description) return;
  const field = document.getElementById('admin-field-description') || document.getElementById('field-description');
  if (field) {
    field.value = description;
  }
  closeAIGenerationModal();
}

/**
 * Sử dụng yêu cầu sinh được
 */
function useAIRequirements() {
  const requirements = window.lastAIResult?.requirements;
  if (!requirements || !Array.isArray(requirements)) return;
  
  try {
    if (typeof currentRequirements !== 'undefined' && typeof renderRequirements === 'function') {
      if (!Array.isArray(currentRequirements)) currentRequirements = [];
      else currentRequirements.length = 0;
      currentRequirements.push(...requirements);
      renderRequirements();
      closeAIGenerationModal();
      return;
    }
  } catch(e) {}

  const list = document.getElementById('admin-requirements-list') || document.getElementById('requirements-list');
  if (list) {
    list.innerHTML = '';
    requirements.forEach(req => {
      const div = document.createElement('div');
      div.style.margin = '6px 0';
      div.innerHTML = `<input type="text" class="admin-req-input" value="${req}" style="width:100%;padding:6px;border:1px solid #ddd;border-radius:4px" /><button type="button" class="admin-req-delete" style="margin-left:6px;padding:4px 8px;background:#c00;color:white;border:none;border-radius:3px;cursor:pointer">Xoá</button>`;
      div.querySelector('.admin-req-delete').addEventListener('click', () => div.remove());
      list.appendChild(div);
    });
  }
  closeAIGenerationModal();
}

/**
 * Sử dụng tiêu chí chấm sinh được
 */
/**
 * Điền toàn bộ kết quả AI vào form
 */
function useAIFullResult() {
  const result = window.lastAIResult;
  if (!result) return;
  
  // 0. Fill Skill Level
  if (result.skill_level) {
    const skillField = document.getElementById('field-skill-level');
    if (skillField) skillField.value = result.skill_level;
  }
  
  // 1. Fill Description
  if (result.description) {
    const descField = document.getElementById('field-description');
    if (descField) descField.value = result.description;
  }
  
  // 2. Fill Requirements
  if (Array.isArray(result.requirements)) {
    try {
      if (typeof currentRequirements !== 'undefined' && typeof renderRequirements === 'function') {
        if (!Array.isArray(currentRequirements)) currentRequirements = [];
        else currentRequirements.length = 0;
        currentRequirements.push(...result.requirements);
        renderRequirements();
      } else {
        const list = document.getElementById('requirements-list');
        if (list) {
          list.innerHTML = '';
          result.requirements.forEach(req => {
            const div = document.createElement('div');
            div.style.margin = '6px 0';
            div.innerHTML = `<input type="text" class="admin-req-input" value="${req}" style="width:100%;padding:6px;border:1px solid #ddd;border-radius:4px" /><button type="button" class="admin-req-delete" style="margin-left:6px;padding:4px 8px;background:#c00;color:white;border:none;border-radius:3px;cursor:pointer">Xoá</button>`;
            div.querySelector('.admin-req-delete').addEventListener('click', () => div.remove());
            list.appendChild(div);
          });
        }
      }
    } catch(e) { console.error(e); }
  }
  
  // 3. Fill Grading Criteria
  if (Array.isArray(result.grading_criteria)) {
    try {
      if (typeof currentGrades !== 'undefined' && typeof renderGradingList === 'function') {
        if (!Array.isArray(currentGrades)) currentGrades = [];
        else currentGrades.length = 0;
        const newGrades = result.grading_criteria.map(crit => ({
          name: typeof crit === 'string' ? crit : (crit.text || crit.name || ''),
          points: typeof crit === 'object' ? (crit.weight || crit.points || 10) : 10,
          note: ''
        }));
        currentGrades.push(...newGrades);
        renderGradingList();
      } else {
        const list = document.getElementById('grading-list');
        if (list) {
          list.innerHTML = '';
          result.grading_criteria.forEach(crit => {
            const name = typeof crit === 'string' ? crit : (crit.text || crit.name || '');
            const points = typeof crit === 'object' ? (crit.weight || crit.points || 10) : 10;
            const div = document.createElement('div');
            div.style.display = 'flex'; div.style.gap = '6px'; div.style.margin = '6px 0'; div.style.alignItems = 'center';
            div.innerHTML = `<input type="text" class="admin-grade-name" value="${name}" style="flex:1;padding:6px;border:1px solid #ddd;border-radius:4px" /><input type="number" class="admin-grade-points" value="${points}" style="width:80px;padding:6px;border:1px solid #ddd;border-radius:4px" /><button type="button" class="admin-grade-delete" style="padding:4px 8px;background:#c00;color:white;border:none;border-radius:3px;cursor:pointer;white-space:nowrap">Xoá</button>`;
            div.querySelector('.admin-grade-delete').addEventListener('click', () => div.remove());
            list.appendChild(div);
          });
        }
      }
    } catch(e) { console.error(e); }
  }
  
  closeAIGenerationModal();
  // Thông báo
  if (typeof showToast === 'function') showToast('🚀 Đã tự động điền toàn bộ thông tin bài tập!');
}

/**
 * Kiểm tra trùng lặp bài tập
 */
async function checkExerciseDuplicateContent(event) {
  const title = (document.getElementById('admin-field-title') || document.getElementById('field-title'))?.value || '';
  const description = (document.getElementById('admin-field-description') || document.getElementById('field-description'))?.value || '';
  const content = `${title}\n${description}`;

  if (!title || !description) {
    alert('Vui lòng điền đầy đủ tiêu đề và mô tả trước');
    return;
  }

  try {
    const button = event.target;
    button.disabled = true;
    
    const resultDiv = document.getElementById('ai-duplicate-result');
    resultDiv.style.display = 'block';
    resultDiv.innerHTML = '<div style="padding:10px; background:#fff7ed; border:1px solid #ffedd5; border-radius:6px; font-size:13px;">🔍 Đang so sánh dữ liệu...</div>';

    const result = await checkExerciseDuplicates(content);

    let bgColor = '#f0fdf4'; let borderColor = '#bbf7d0'; let icon = '✅';
    if (result.similarity_score > 80) { bgColor = '#fef2f2'; borderColor = '#fecaca'; icon = '⚠️'; }
    else if (result.similarity_score > 50) { bgColor = '#fffbeb'; borderColor = '#fef3c7'; icon = '⚡'; }

    let cardClass = 'ai-result-success';
    if (result.similarity_score > 80) cardClass = 'ai-result-danger';
    else if (result.similarity_score > 50) cardClass = 'ai-result-warning';

    resultDiv.innerHTML = `
      <div class="ai-result-card ${cardClass}">
        <div style="font-weight:bold; margin-bottom:8px; display:flex; align-items:center; gap:8px; font-size:16px;">
          <span>${icon}</span> 
          <span>Độ tương đồng: ${result.similarity_score}%</span>
        </div>
        <div style="margin-bottom:12px; font-size:15px; border-bottom:1px solid rgba(0,0,0,0.1); padding-bottom:8px;">${result.message}</div>
        
        ${result.matched_exercise ? `
          <div style="margin-bottom:8px;">
            <strong>📍 Bài trùng nhất:</strong> 
            <span style="display:block; padding:4px 8px; background:rgba(0,0,0,0.05); border-radius:4px; margin-top:4px;">${result.matched_exercise}</span>
          </div>` : ''}
          
        ${result.duplicate_reason ? `
          <div style="margin-bottom:8px;">
            <strong>🔍 Điểm tương đồng:</strong> 
            <p style="margin:4px 0 0 0; padding:8px; background:rgba(0,0,0,0.05); border-radius:4px;">${result.duplicate_reason}</p>
          </div>` : ''}
      </div>
    `;

    button.disabled = false;
  } catch (error) {
    document.getElementById('ai-duplicate-result').innerHTML = `<div style="color:red">Lỗi: ${error.message}</div>`;
    event.target.disabled = false;
  }
}

/**
 * Gọi API để kiểm định chất lượng bài tập
 */
async function validateExerciseContent(event) {
  const title = (document.getElementById('admin-field-title') || document.getElementById('field-title'))?.value || '';
  const description = (document.getElementById('admin-field-description') || document.getElementById('field-description'))?.value || '';
  
  // Lấy danh sách yêu cầu
  const reqList = document.getElementById('admin-requirements-list') || document.getElementById('requirements-list');
  const requirements = Array.from(reqList.querySelectorAll('input')).map(i => i.value).filter(Boolean);
  
  // Lấy danh sách tiêu chí
  const gradeList = document.getElementById('admin-grading-list') || document.getElementById('grading-list');
  const criteria = Array.from(gradeList.querySelectorAll('.admin-grade-name')).map(i => i.value).filter(Boolean);

  if (!title || !description) {
    alert('Vui lòng điền tiêu đề và mô tả để AI kiểm định');
    return;
  }

  try {
    const button = event.target;
    const originalText = button.textContent;
    button.disabled = true;
    button.textContent = '⏳ Đang kiểm định...';
    
    const resultDiv = document.getElementById('ai-validation-result');
    resultDiv.style.display = 'block';
    resultDiv.innerHTML = '<div style="padding:10px; background:#f0fdf4; border:1px solid #bbf7d0; border-radius:6px; font-size:13px;">⏳ Đang phân tích...</div>';

    const skillLevel = (document.getElementById('admin-field-skill-level') || document.getElementById('field-skill-level'))?.value || 1;

    const response = await fetch('/api/ai/validate-exercise', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ 
        title, 
        description, 
        requirements, 
        grading_criteria: criteria,
        skill_level: skillLevel
      })
    });

    const result = await response.json();
    
    let bgColor = '#f0fdf4'; let borderColor = '#bbf7d0'; let icon = '✅';
    if (result.status === 'invalid') { bgColor = '#fef2f2'; borderColor = '#fecaca'; icon = '❌'; }
    else if (result.status === 'warning') { bgColor = '#fffbeb'; borderColor = '#fef3c7'; icon = '⚠️'; }
    
    let cardClass = 'ai-result-success';
    if (result.status === 'invalid') cardClass = 'ai-result-danger';
    else if (result.status === 'warning') cardClass = 'ai-result-warning';

    resultDiv.innerHTML = `
      <div class="ai-result-card ${cardClass}">
        <div style="font-weight:bold; margin-bottom:8px; display:flex; align-items:center; gap:8px; font-size:16px;">
          <span>${icon}</span> 
          <span>${result.status === 'valid' ? 'Hợp lệ' : (result.status === 'warning' ? 'Cần chú ý' : 'Không đạt')}</span>
        </div>
        <div style="margin-bottom:12px; border-bottom:1px solid rgba(0,0,0,0.1); padding-bottom:8px;">${result.feedback}</div>
        ${result.suggestions ? `
          <div>
            <strong>💡 Gợi ý cải thiện:</strong>
            <ul style="margin:8px 0 0 0; padding-left:20px;">
              ${result.suggestions.map(s => `<li style="margin-bottom:4px;">${s}</li>`).join('')}
            </ul>
          </div>` : ''}
        ${result.improved_grading_criteria && result.improved_grading_criteria.length ? `
          <div style="margin-top:12px; padding-top:12px; border-top:1px dashed rgba(0,0,0,0.1);">
            <strong style="color:#047857;">🎯 Đề xuất Bộ Tiêu Chí Nâng Cao (Do AI gợi ý):</strong>
            <ul style="margin:8px 0 12px 0; padding-left:20px; font-size:14px; color:#1e293b;">
              ${result.improved_grading_criteria.map(c => `<li style="margin-bottom:4px;">${c.name} <strong>(${c.points}%)</strong></li>`).join('')}
            </ul>
            <button type="button" class="btn btn-sm" style="background:#10b981; color:white; font-weight:bold; padding:6px 12px; border:none; border-radius:6px; cursor:pointer;" onclick='applyImprovedCriteria(${JSON.stringify(result.improved_grading_criteria).replace(/'/g, "\\'")})'>
              ✨ Thay thế Tiêu chí cũ bằng bộ này
            </button>
          </div>
        ` : ''}
        ${result.suggested_storyline ? `
          <div style="margin-top:12px; padding-top:12px; border-top:1px dashed rgba(0,0,0,0.1);">
            <strong style="color:#4338ca;">🎭 Đề xuất Cốt truyện / Ngữ cảnh mới (Chống Đạo Đề):</strong>
            <p style="margin:8px 0; font-size:14px; color:#334155; font-style:italic; background:#e0e7ff; padding:10px; border-radius:6px; border-left:4px solid #4f46e5;">
              "${result.suggested_storyline}"
            </p>
            <button type="button" class="btn btn-sm" style="background:#4f46e5; color:white; font-weight:bold; padding:6px 12px; border:none; border-radius:6px; cursor:pointer;" onclick='applyStoryline(${JSON.stringify(result.suggested_storyline).replace(/'/g, "\\'")})'>
              📝 Chèn Cốt truyện này vào Mô tả
            </button>
          </div>
        ` : ''}
      </div>
    `;

    button.disabled = false;
    button.textContent = originalText;
  } catch (error) {
    document.getElementById('ai-validation-result').innerHTML = `<div style="color:red">Lỗi: ${error.message}</div>`;
    event.target.disabled = false;
    event.target.textContent = '✅ AI Kiểm Định Chất Lượng';
  }
}

// =========================================================
//  3. INITIALIZATION
// =========================================================

/**
 * Áp dụng Cốt truyện mới vào Mô tả
 */
window.applyStoryline = function(storyline) {
  const descField = document.getElementById('admin-field-description') || document.getElementById('field-description');
  if (descField) {
    const currentVal = descField.value.trim();
    if (currentVal) {
      descField.value = `**Ngữ cảnh:** ${storyline}\n\n---\n\n**Yêu cầu kỹ thuật:**\n${currentVal}`;
    } else {
      descField.value = storyline;
    }
    if (typeof showToast === 'function') showToast('✅ Đã chèn cốt truyện vào mô tả!');
    else alert('Đã chèn cốt truyện vào mô tả!');
  } else {
    alert('Không tìm thấy ô nhập mô tả.');
  }
};

/**
 * Áp dụng tiêu chí chấm điểm nâng cao do AI kiểm định đề xuất
 */
window.applyImprovedCriteria = function(newCriteria) {
  try {
    if (typeof currentGrades !== 'undefined' && typeof renderGradingList === 'function') {
      if (!Array.isArray(currentGrades)) currentGrades = [];
      else currentGrades.length = 0;
      const parsedGrades = newCriteria.map(crit => ({
        name: typeof crit === 'string' ? crit : (crit.text || crit.name || ''),
        points: typeof crit === 'object' ? (crit.weight || crit.points || 10) : 10,
        note: ''
      }));
      currentGrades.push(...parsedGrades);
      renderGradingList();
      if (typeof showToast === 'function') showToast('✅ Đã cập nhật thành công bộ tiêu chí chấm điểm nâng cao!');
      else alert('Đã cập nhật thành công bộ tiêu chí chấm điểm nâng cao!');
    } else {
      alert('Không tìm thấy form để áp dụng. Hãy thử lại.');
    }
  } catch (e) {
    console.error('Lỗi khi áp dụng tiêu chí:', e);
    alert('Không thể áp dụng tiêu chí, vui lòng thử lại.');
  }
};

/**
 * Khởi tạo AI features (gọi khi admin.js load)
 */
function initAIFeatures() {
  // Thêm event listeners cho AI buttons
  const aiGenerateBtn = document.getElementById('ai-generate-content-btn');
  if (aiGenerateBtn) {
    aiGenerateBtn.addEventListener('click', openAIGenerationModal);
  }

  const aiCheckDuplicateBtn = document.getElementById('ai-check-duplicate-btn');
  if (aiCheckDuplicateBtn) {
    aiCheckDuplicateBtn.addEventListener('click', checkExerciseDuplicateContent);
  }
  
  const aiValidateBtn = document.getElementById('ai-validate-content-btn');
  if (aiValidateBtn) {
    aiValidateBtn.addEventListener('click', validateExerciseContent);
  }

  // AI modal close button
  const aiCloseBtn = document.getElementById('ai-modal-close');
  if (aiCloseBtn) {
    aiCloseBtn.addEventListener('click', closeAIGenerationModal);
  }

  const aiCancelBtn = document.getElementById('ai-modal-cancel');
  if (aiCancelBtn) {
    aiCancelBtn.addEventListener('click', closeAIGenerationModal);
  }

  const aiSubmitBtn = document.getElementById('ai-generate-submit');
  if (aiSubmitBtn) {
    aiSubmitBtn.addEventListener('click', handleAIGeneration);
  }

  console.log('✓ AI Features initialized');
}

// Gọi khởi tạo khi DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAIFeatures);
} else {
  initAIFeatures();
}

// Hàm gợi ý độ khó và level bằng AI
async function suggestDifficultyAndLevel() {
  const title = document.getElementById('field-title').value.trim();
  if (!title) {
    showToast('Vui lòng nhập tên bài tập trước khi dùng AI gợi ý!', 'error');
    return;
  }
  
  const formSelect = document.getElementById('form-form');
  const formName = formSelect.options[formSelect.selectedIndex]?.text || '';
  const btn = document.getElementById('btn-suggest-level');
  
  const oldText = btn.innerHTML;
  btn.innerHTML = '⏳ Đang phân tích...';
  btn.disabled = true;

  try {
    const res = await fetch('/api/ai/suggest-difficulty', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ title, form_name: formName })
    });
    
    if (!res.ok) throw new Error('Lỗi phản hồi từ máy chủ');
    const data = await res.json();
    
    if (data.difficulty) {
      document.getElementById('field-difficulty').value = data.difficulty;
    }
    if (data.skill_level) {
      document.getElementById('field-level').value = data.skill_level.toString();
    }
    showToast('✨ AI đã gợi ý Độ Khó và Level phù hợp!');
  } catch (err) {
    console.error(err);
    showToast('Không thể lấy gợi ý từ AI', 'error');
  } finally {
    btn.innerHTML = oldText;
    btn.disabled = false;
  }
}
