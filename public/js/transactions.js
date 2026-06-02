document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('transactions-container');
  const form = document.getElementById('transaction-form');
  const selCategory = document.getElementById('txn-category');
  const inputAmount = document.getElementById('txn-amount');
  const inputDate = document.getElementById('txn-date');
  const inputDesc = document.getElementById('txn-desc');

  const loadCategories = async () => {
    try {
      const res = await apiClient.getCategories();
      const cats = res.data || [];
      selCategory.innerHTML = cats.map(c => `<option value="${c.id}">${c.name} (${c.type})</option>`).join('');
    } catch (err) {
      selCategory.innerHTML = '<option value="">Failed to load</option>';
    }
  };

  const loadTransactions = async () => {
    try {
      container.innerHTML = 'Loading...';
      const res = await apiClient.getTransactions();
      const txns = res.data || [];
      if (txns.length === 0) {
        container.innerHTML = '<p class="text-slate-400">No transactions yet.</p>';
        return;
      }

      container.innerHTML = `<table class="w-full">
        <thead class="text-slate-300">
          <tr>
            <th class="px-2 py-2 text-left">Date</th>
            <th class="px-2 py-2 text-left">Category</th>
            <th class="px-2 py-2 text-left">Description</th>
            <th class="px-2 py-2 text-right">Amount</th>
            <th class="px-2 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          ${txns.map(t => `
            <tr class="border-t border-slate-700">
              <td class="px-2 py-2">${t.date}</td>
              <td class="px-2 py-2">${t.category}</td>
              <td class="px-2 py-2">${t.description}</td>
              <td class="px-2 py-2 text-right">${(t.amount).toLocaleString('id-ID')}</td>
              <td class="px-2 py-2 text-center">
                <button data-id="${t.id}" class="del-btn px-2 py-1 bg-red-600 rounded">Delete</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>`;

      document.querySelectorAll('.del-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const id = e.target.dataset.id;
          if (!confirm('Delete this transaction?')) return;
          try {
            await apiClient.deleteTransaction(id);
            await loadTransactions();
          } catch (err) {
            alert('Delete failed');
          }
        });
      });

    } catch (err) {
      container.innerHTML = '<p class="text-red-400">Failed to load transactions</p>';
    }
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const category_id = selCategory.value;
    const amount = Number(inputAmount.value);
    const transaction_date = inputDate.value;
    const description = inputDesc.value.trim();
    if (!category_id || !amount || !transaction_date) return alert('Please fill all required fields');
    try {
      await apiClient.createTransaction(category_id, amount, description, transaction_date);
      inputAmount.value = '';
      inputDesc.value = '';
      await loadTransactions();
    } catch (err) {
      alert('Create transaction failed');
    }
  });

  await loadCategories();
  await loadTransactions();
});
