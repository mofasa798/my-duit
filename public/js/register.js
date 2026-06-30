/**
 * public/js/register.js
 *
 * Handle form registrasi.
 * - Validasi input (email, password, confirm password)
 * - Kirim request ke API
 * - Redirect ke halaman login
 */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('register-form');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const confirmInput = document.getElementById('confirm-password');
  const errorDiv = document.getElementById('register-error');
  const submitBtn = document.getElementById('register-btn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const confirm = confirmInput.value;

    // Validasi
    if (!email || !password || !confirm) {
      showError('Semua field wajib diisi');
      return;
    }

    if (password !== confirm) {
      showError('Password dan konfirmasi password tidak cocok');
      return;
    }

    if (password.length < 6) {
      showError('Password minimal 6 karakter');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Memproses...';
    errorDiv.classList.add('hidden');

    try {
      const res = await apiClient.register(email, password);

      if (res.success) {
        // Redirect ke halaman login
        window.location.href = '/html/login.html?registered=1';
      } else {
        showError(res.message || 'Registrasi gagal');
      }
    } catch (err) {
      showError(err.message || 'Terjadi kesalahan. Coba lagi.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Daftar';
    }
  });

  function showError(msg) {
    errorDiv.textContent = msg;
    errorDiv.classList.remove('hidden');
  }
});
