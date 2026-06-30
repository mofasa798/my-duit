/**
 * public/js/login.js
 *
 * Handle form login.
 * - Validasi input
 * - Kirim request ke API
 * - Simpan token & redirect ke dashboard
 */

document.addEventListener('DOMContentLoaded', () => {
  // Redirect ke dashboard jika sudah login
  if (apiClient.isAuthenticated()) {
    window.location.href = '/';
    return;
  }

  // Tampilkan pesan sukses setelah registrasi
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('registered') === '1') {
    const successDiv = document.getElementById('login-success');
    if (successDiv) {
      successDiv.textContent = 'Akun berhasil dibuat! Silakan masuk.';
      successDiv.classList.remove('hidden');
    }
  }

  const form = document.getElementById('login-form');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const errorDiv = document.getElementById('login-error');
  const submitBtn = document.getElementById('login-btn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    // Validasi sederhana
    if (!email || !password) {
      showError('Email dan password wajib diisi');
      return;
    }

    // Disable button
    submitBtn.disabled = true;
    submitBtn.textContent = 'Memproses...';
    errorDiv.classList.add('hidden');

    try {
      const res = await apiClient.login(email, password);

      if (res.success && res.token) {
        apiClient.setToken(res.token);
        window.location.href = '/';
      } else {
        showError(res.message || 'Login gagal');
      }
    } catch (err) {
      showError(err.message || 'Terjadi kesalahan. Coba lagi.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Masuk';
    }
  });

  function showError(msg) {
    errorDiv.textContent = msg;
    errorDiv.classList.remove('hidden');
  }
});
