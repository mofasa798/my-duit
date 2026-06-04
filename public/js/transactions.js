/**
 * public/js/transactions.js
 *
 * Logic halaman Transactions:
 * - Load daftar transaksi dari API
 * - Add transaksi baru dengan calculator support di field Amount
 * - Feedback visual (bukan alert)
 * - Delete transaksi
 */

document.addEventListener('DOMContentLoaded', async () => {
  const container   = document.getElementById('transactions-container');
  const form        = document.getElementById('transaction-form');
  const selCategory = document.getElementById('txn-category');
  const inputAmount = document.getElementById('txn-amount');
  const inputDate   = document.getElementById('txn-date');
  const inputDesc   = document.getElementById('txn-desc');
  const feedback    = document.getElementById('txn-feedback');

  // ===== Helpers =====

  const formatIDR = (amount) =>
    (amount || 0).toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });

  const evalAmount = (raw) => {
    const expr = raw.replace(/[^0-9+\-*/().]/g, '');
    if (!expr) return NaN;
    try { return Number(new Function('return ' + expr)()); } catch { return NaN; }
  };

  const showFeedback = (message, type = 'success') => {
    const styles = {
      success: 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300',
      error:   'bg-red-500/10 border border-red-500/30 text-red-300',
    };
    feedback.className = `status-bar rounded-xl px-4 py-3 text-sm ${styles[type] || styles.success}`;
    feedback.textContent = message;
    setTimeout(() => {
      feedback.className = 'status-bar hidden-fade';
      feedback.textContent = '';
    }, 4000);
  };

  const resetForm = () => {
    inputAmount.value = '';
    inputDesc.value   = '';
    inputDate.value   = '';
    // Biarkan category tetap (lebih ergonomis saat input beberapa transaksi sekaligus)
  };

  // ===== Load categories =====

  const loadCategories = async () => {
    try {
      const res  = await apiClient.getCategories();
      const cats = res.data || [];
      selCategory.innerHTML = cats.map(c =>
        `<option value="${c.id}">${c.name} (${c.type})</option>`
      ).join('');
    } catch (err) {
      selCategory.innerHTML = '<option value="">Gagal memuat kategori</option>';
    }
  };

  // ===== Load & render transactions =====

  const loadTransactions = async () => {
    try {
      container.innerHTML = '<p class="text-slate-400 text-sm animate-pulse">Memuat transaksi...</p>';
      const res  = await apiClient.getTransactions();
      const txns = res.data || [];

      if (txns.length === 0) {
        container.innerHTML = '<p class="text-slate-400 text-sm text-center py-6">Belum ada transaksi.</p>';
        return;
      }

      const rows = txns.map(t => `
        <tr class="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
          <td class="px-4 py-3 text-slate-300 text-sm">${t.date}</td>
          <td class="px-4 py-3 text-sm">
            <span class="${t.type === 'income' ? 'badge-income' : 'badge-expense'}">${t.category}</span>
          </td>
          <td class="px-4 py-3 text-slate-400 text-sm">${t.description || '—'}</td>
          <td class="px-4 py-3 text-right text-sm font-mono ${t.type === 'income' ? 'text-emerald-400' : 'text-red-400'}">
            ${t.type === 'income' ? '+' : '−'}${formatIDR(t.amount)}
          </td>
          <td class="px-4 py-3 text-center">
            <button data-id="${t.id}"
                    class="del-btn px-2.5 py-1 bg-red-900/40 hover:bg-red-700 border border-red-800 rounded-lg text-xs text-red-300 transition-colors">
              Hapus
            </button>
          </td>
        </tr>
      `).join('');

      container.innerHTML = `
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-slate-400 text-xs uppercase tracking-wide border-b border-slate-800">
                <th class="px-4 py-3 text-left font-medium">Tanggal</th>
                <th class="px-4 py-3 text-left font-medium">Kategori</th>
                <th class="px-4 py-3 text-left font-medium">Keterangan</th>
                <th class="px-4 py-3 text-right font-medium">Jumlah</th>
                <th class="px-4 py-3 text-center font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      `;

      // Delete event
      document.querySelectorAll('.del-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const id = e.currentTarget.dataset.id;
          if (!confirm('Hapus transaksi ini?')) return;
          try {
            await apiClient.deleteTransaction(id);
            showFeedback('Transaksi berhasil dihapus.');
            await loadTransactions();
          } catch (err) {
            showFeedback('Gagal menghapus transaksi.', 'error');
          }
        });
      });

    } catch (err) {
      container.innerHTML = '<p class="text-red-400 text-sm text-center py-6">Gagal memuat transaksi.</p>';
    }
  };

  // ===== Calculator on blur =====

  inputAmount.addEventListener('blur', () => {
    const val = evalAmount(inputAmount.value);
    if (!isNaN(val) && inputAmount.value.trim()) {
      inputAmount.value = val;
    }
  });

  // ===== Submit =====

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const category_id = selCategory.value;
    const amount      = evalAmount(inputAmount.value);
    const transaction_date = inputDate.value;
    const description = inputDesc.value.trim();

    if (!category_id) return showFeedback('Pilih kategori terlebih dahulu.', 'error');
    if (isNaN(amount) || amount <= 0) return showFeedback('Jumlah tidak valid atau bernilai 0.', 'error');
    if (!transaction_date) return showFeedback('Tanggal wajib diisi.', 'error');

    const submitBtn = document.getElementById('txn-submit');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Menyimpan...';

    try {
      await apiClient.createTransaction(category_id, amount, description, transaction_date);
      resetForm();
      showFeedback('✓ Transaksi berhasil disimpan!');
      await loadTransactions();
    } catch (err) {
      showFeedback('Gagal menyimpan transaksi.', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Simpan Transaksi';
    }
  });

  // ===== Export & Print =====

  const btnExport = document.getElementById('btn-export-csv');
  if (btnExport) btnExport.addEventListener('click', () => apiClient.exportTransactionsCSV());

  const btnPrint = document.getElementById('btn-print-preview');
  if (btnPrint) btnPrint.addEventListener('click', () => window.open('/html/print.html?type=transactions', '_blank'));

  // ===== Init =====
  await loadCategories();
  await loadTransactions();
});
