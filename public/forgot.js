const forgotForm = document.getElementById('forgot-form');
const verifyForm = document.getElementById('verify-form');
const resetForm = document.getElementById('reset-form');
const err = document.getElementById('forgot-error');
const succ = document.getElementById('forgot-success');
const forgotBtn = document.getElementById('forgot-btn');
const verifyBtn = document.getElementById('verify-btn');
const resetBtn = document.getElementById('reset-btn');
const desc = document.getElementById('step-desc');

let currentEmail = '';
let currentOtp = '';

if (forgotForm) forgotForm.onsubmit = async (e) => {
  e.preventDefault();
  err.style.display = 'none';
  succ.style.display = 'none';
  forgotBtn.disabled = true;
  forgotBtn.textContent = 'Đang gửi...';
  
  const fd = new FormData(forgotForm);
  currentEmail = fd.get('email');
  
  try {
    const res = await fetch('/api/lecturer/forgot-password', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ email: currentEmail })
    });
    
    const json = await res.json();
    
    if (!res.ok) {
      err.textContent = json.error || 'Thao tác thất bại'; 
      err.style.display = 'block';
    } else {
      succ.textContent = 'Đã gửi mã OTP vào email (Hoặc xem trong Console Log máy chủ nếu chưa cấu hình Email).'; 
      succ.style.display = 'block';
      // Switch UI to Step 2
      forgotForm.style.display = 'none';
      verifyForm.style.display = 'block';
      desc.textContent = 'Vui lòng kiểm tra email của bạn để lấy mã OTP';
    }
  } catch (e) {
    err.textContent = 'Lỗi kết nối tới máy chủ'; 
    err.style.display = 'block';
  } finally {
    forgotBtn.disabled = false;
    forgotBtn.textContent = 'Gửi mã OTP';
  }
};

if (verifyForm) verifyForm.onsubmit = async (e) => {
  e.preventDefault();
  err.style.display = 'none';
  succ.style.display = 'none';
  verifyBtn.disabled = true;
  verifyBtn.textContent = 'Đang kiểm tra...';
  
  const fd = new FormData(verifyForm);
  currentOtp = fd.get('otp');
  
  try {
    const res = await fetch('/api/lecturer/verify-otp', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ email: currentEmail, otp: currentOtp })
    });
    
    const json = await res.json();
    
    if (!res.ok) {
      err.textContent = json.error || 'Mã OTP không hợp lệ'; 
      err.style.display = 'block';
    } else {
      succ.textContent = 'Mã OTP chính xác. Vui lòng nhập mật khẩu mới.'; 
      succ.style.display = 'block';
      verifyForm.style.display = 'none';
      resetForm.style.display = 'block';
      desc.textContent = 'Nhập mật khẩu mới cho tài khoản của bạn';
    }
  } catch (e) {
    err.textContent = 'Lỗi kết nối tới máy chủ'; 
    err.style.display = 'block';
  } finally {
    verifyBtn.disabled = false;
    verifyBtn.textContent = '✅ Xác nhận OTP';
  }
};

if (resetForm) resetForm.onsubmit = async (e) => {
  e.preventDefault();
  err.style.display = 'none';
  succ.style.display = 'none';
  resetBtn.disabled = true;
  resetBtn.textContent = 'Đang xử lý...';
  
  const fd = new FormData(resetForm);
  const payload = {
    email: currentEmail,
    otp: currentOtp,
    new_password: fd.get('new_password')
  };
  
  try {
    const res = await fetch('/api/lecturer/reset-password', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify(payload)
    });
    
    const json = await res.json();
    
    if (!res.ok) {
      err.textContent = json.error || 'Khôi phục thất bại'; 
      err.style.display = 'block';
    } else {
      succ.textContent = 'Khôi phục mật khẩu th công! Bạn có thể đăng nhập bằng mật khẩu mới.'; 
      succ.style.display = 'block';
      resetForm.reset();
      resetForm.style.display = 'none';
      desc.textContent = 'Mật khẩu đã được khôi phục th công.';
    }
  } catch (e) {
    err.textContent = 'Lỗi kết nối tới máy chủ'; 
    err.style.display = 'block';
  } finally {
    resetBtn.disabled = false;
    resetBtn.textContent = 'Đổi mật khẩu';
  }
};
