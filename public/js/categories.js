/**
 * public/js/categories.js
 *
 * Logic halaman Categories:
 * - Load & render daftar kategori
 * - Add kategori baru
 * - Inline edit (bukan prompt)
 * - Delete kategori
 */

document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('categories-container');
  const form = document.getElementById('category-form');
  const inputName = document.getElementById('cat-name');
  const inputType = document.getElementById('cat-type');
  const feedback = document.getElementById('cat-feedback');

  // ===== Helpers =====

  const showFeedback = (message, type = 'success') => {
    const styles = {
      success:
        'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300',
      error: 'bg-red-500/10 border border-red-500/30 text-red-300',
    };
    feedback.className = `status-bar rounded-xl px-4 py-3 text-sm ${styles[type]}`;
    feedback.textContent = message;
    setTimeout(() => {
      feedback.className = 'status-bar hidden-fade';
      feedback.textContent = '';
    }, 4000);
  };

  // ===== Load & render =====

  const load = async () => {
    try {
      container.innerHTML =
        '<p class="text-slate-400 text-sm animate-pulse">Memuat kategori...</p>';
      const res = await apiClient.getCategories();
      const cats = res.data || [];

      if (cats.length === 0) {
        container.innerHTML =
          '<p class="text-slate-400 text-sm text-center py-6">Belum ada kategori.</p>';
        return;
      }

      container.innerHTML = `
        <div class="overflow-x-auto">
          <table class="w-full text-sm" id="cat-table">
            <thead>
              <tr class="text-slate-400 text-xs uppercase tracking-wide border-b border-slate-800">
                <th class="px-4 py-3 text-left font-medium">Nama</th>
                <th class="px-4 py-3 text-left font-medium">Tipe</th>
                <th class="px-4 py-3 text-center font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              ${cats.map((c) => renderRow(c)).join('')}
            </tbody>
          </table>
        </div>
      `;

      attachEvents();
    } catch (err) {
      container.innerHTML =
        '<p class="text-red-400 text-sm text-center py-6">Gagal memuat kategori.</p>';
    }
  };

  // ===== Render satu baris (mode view) =====

  const renderRow = (c) => `
    <tr class="border-b border-slate-800 hover:bg-slate-800/40 transition-colors" data-id="${c.id}">
      <td class="px-4 py-3 text-slate-200 font-medium">${escHtml(c.name)}</td>
      <td class="px-4 py-3">
        <span class="${c.type === 'income' ? 'badge-income' : 'badge-expense'}">
          ${c.type === 'income' ? '💰 Income' : '💸 Expense'}
        </span>
      </td>
      <td class="px-4 py-3 flex justify-center gap-2">
        <button class="edit-btn px-2.5 py-1 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg text-xs text-slate-300 transition-colors" data-id="${c.id}" data-name="${escAttr(c.name)}" data-type="${c.type}">
          ✏️ Edit
        </button>
        <button class="del-btn px-2.5 py-1 bg-red-900/40 hover:bg-red-700 border border-red-800 rounded-lg text-xs text-red-300 transition-colors" data-id="${c.id}">
          Hapus
        </button>
      </td>
    </tr>
  `;

  // ===== Render baris edit inline =====

  const renderEditRow = (c) => `
    <tr class="border-b border-slate-800 bg-slate-800/60" data-id="${c.id}">
      <td class="px-4 py-2">
        <input class="edit-name w-full p-1.5 rounded-lg bg-slate-700 border border-emerald-600 text-sm focus:outline-none"
               value="${escAttr(c.name)}" />
      </td>
      <td class="px-4 py-2">
        <select class="edit-type p-1.5 rounded-lg bg-slate-700 border border-slate-600 text-sm focus:outline-none">
          <option value="expense" ${c.type === 'expense' ? 'selected' : ''}>💸 Expense</option>
          <option value="income"  ${c.type === 'income' ? 'selected' : ''}>💰 Income</option>
        </select>
      </td>
      <td class="px-4 py-2 flex justify-center gap-2">
        <button class="save-btn px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-xs font-semibold text-white transition-colors" data-id="${c.id}">
          Simpan
        </button>
        <button class="cancel-btn px-2.5 py-1 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg text-xs text-slate-300 transition-colors">
          Batal
        </button>
      </td>
    </tr>
  `;

  // ===== Attach events =====

  const attachEvents = () => {
    // Delete
    document.querySelectorAll('.del-btn').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.dataset.id;
        if (
          !confirm(
            'Hapus kategori ini? Kategori yang dipakai transaksi tidak bisa dihapus.'
          )
        )
          return;
        try {
          await apiClient.deleteCategory(id);
          showFeedback('Kategori berhasil dihapus.');
          await load();
        } catch (err) {
          showFeedback(
            'Gagal menghapus. Kategori mungkin masih dipakai transaksi.',
            'error'
          );
        }
      });
    });

    // Edit — masuk mode inline
    document.querySelectorAll('.edit-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const { id, name, type } = e.currentTarget.dataset;
        const row = document.querySelector(`tr[data-id="${id}"]`);
        if (!row) return;
        row.outerHTML = renderEditRow({ id, name, type });
        attachInlineEditEvents(id);
      });
    });
  };

  // ===== Inline edit events =====

  const attachInlineEditEvents = (id) => {
    const row = document.querySelector(`tr[data-id="${id}"]`);
    if (!row) return;

    // Cancel → reload
    row.querySelector('.cancel-btn').addEventListener('click', () => load());

    // Save
    row.querySelector('.save-btn').addEventListener('click', async () => {
      const newName = row.querySelector('.edit-name').value.trim();
      const newType = row.querySelector('.edit-type').value;
      if (!newName)
        return showFeedback('Nama kategori tidak boleh kosong.', 'error');
      try {
        await apiClient.updateCategory(id, newName, newType);
        showFeedback('Kategori berhasil diperbarui.');
        await load();
      } catch (err) {
        showFeedback('Gagal memperbarui kategori.', 'error');
      }
    });
  };

  // ===== Add category =====

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = inputName.value.trim();
    const type = inputType.value;
    if (!name)
      return showFeedback('Nama kategori tidak boleh kosong.', 'error');
    try {
      await apiClient.createCategory(name, type);
      inputName.value = '';
      showFeedback(`✓ Kategori "${name}" berhasil ditambahkan.`);
      await load();
    } catch (err) {
      showFeedback('Gagal menambahkan kategori.', 'error');
    }
  });

  // ===== Escape helpers =====

  const escHtml = (s) =>
    String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  const escAttr = (s) => String(s).replace(/"/g, '&quot;');

  // ===== Init =====
  await load();
});
