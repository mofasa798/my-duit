document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('categories-container');
  const form = document.getElementById('category-form');
  const inputName = document.getElementById('cat-name');
  const inputType = document.getElementById('cat-type');

  const load = async () => {
    try {
      container.innerHTML = 'Loading...';
      const res = await apiClient.getCategories();
      const categories = res.data;
      if (!categories || categories.length === 0) {
        container.innerHTML = '<p class="text-slate-400">No categories yet.</p>';
        return;
      }

      container.innerHTML = `<table class="w-full table-auto">
        <thead class="text-slate-300">
          <tr><th class="px-2 py-2 text-left">Name</th><th class="px-2 py-2 text-left">Type</th><th class="px-2 py-2">Actions</th></tr>
        </thead>
        <tbody>${categories.map(c => `
          <tr class="border-t border-slate-700">
            <td class="px-2 py-2">${c.name}</td>
            <td class="px-2 py-2">${c.type}</td>
            <td class="px-2 py-2 text-center">
              <button data-id="${c.id}" class="edit-btn px-2 py-1 bg-yellow-500 text-black rounded mr-2">Edit</button>
              <button data-id="${c.id}" class="del-btn px-2 py-1 bg-red-600 rounded">Delete</button>
            </td>
          </tr>`).join('')}
        </tbody>
      </table>`;

      // attach events
      document.querySelectorAll('.del-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const id = e.target.dataset.id;
          if (!confirm('Delete this category?')) return;
          try {
            await apiClient.deleteCategory(id);
            await load();
          } catch (err) {
            alert('Cannot delete category. It may be used by transactions.');
          }
        });
      });

      document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const id = e.target.dataset.id;
          const name = prompt('New category name');
          if (!name) return;
          const type = prompt('Type (income/expense)', 'expense') || 'expense';
          try {
            await apiClient.updateCategory(id, name, type);
            await load();
          } catch (err) {
            alert('Update failed');
          }
        });
      });

    } catch (err) {
      container.innerHTML = '<p class="text-red-400">Failed to load categories</p>';
    }
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = inputName.value.trim();
    const type = inputType.value;
    if (!name) return alert('Name is required');
    try {
      await apiClient.createCategory(name, type);
      inputName.value = '';
      await load();
    } catch (err) {
      alert('Create failed');
    }
  });

  await load();
});
