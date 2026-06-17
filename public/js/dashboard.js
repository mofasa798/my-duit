/**
 * public/js/dashboard.js
 *
 * Frontend logic untuk Dashboard:
 * - Load data dari API
 * - Render summary cards dan tabel riwayat transaksi
 * - Auto-hide status bar setelah sukses
 */

class Dashboard {
  constructor() {
    this.appStatus = document.getElementById('app-status');
    this.dashboard = document.getElementById('dashboard');
    this.transactionsTable = document.getElementById('transactions-table');
  }

  async init() {
    try {
      this.setStatus('Memuat dashboard...', 'info');

      const response = await apiClient.getDashboard();
      const dashboardData = response.data;

      this.renderDashboard(dashboardData);
      this.renderTransactions(dashboardData.transactions);

      this.setStatus('Dashboard berhasil dimuat ✓', 'success');

      // Auto-hide status bar setelah 3 detik
      setTimeout(() => {
        this.appStatus.classList.add('hidden-fade');
      }, 3000);
    } catch (error) {
      this.setStatus(`Gagal memuat dashboard: ${error.message}`, 'error');
    }
  }

  renderDashboard(data) {
    const { totalIncome = 0, totalExpense = 0, balance = 0 } = data || {};
    const savingsRate =
      totalIncome > 0 ? ((balance / totalIncome) * 100).toFixed(1) : '0.0';

    const cards = [
      {
        icon: '💰',
        label: 'Total Income',
        value: this.formatIDR(totalIncome),
        color: 'text-emerald-400',
        border: 'border-emerald-900/50',
        bg: 'bg-emerald-900/10',
      },
      {
        icon: '💸',
        label: 'Total Expense',
        value: this.formatIDR(totalExpense),
        color: 'text-red-400',
        border: 'border-red-900/50',
        bg: 'bg-red-900/10',
      },
      {
        icon: '🏦',
        label: 'Current Balance',
        value: this.formatIDR(balance),
        color: balance >= 0 ? 'text-blue-400' : 'text-red-400',
        border: 'border-blue-900/50',
        bg: 'bg-blue-900/10',
      },
      {
        icon: '📈',
        label: 'Savings Rate',
        value: `${savingsRate}%`,
        color: 'text-purple-400',
        border: 'border-purple-900/50',
        bg: 'bg-purple-900/10',
      },
    ];

    this.dashboard.innerHTML = cards
      .map(
        (c) => `
      <div class="card-hover rounded-xl border ${c.border} ${c.bg} p-5 flex flex-col gap-3">
        <div class="flex items-center justify-between">
          <span class="text-slate-400 text-sm font-medium">${c.label}</span>
          <span class="text-2xl">${c.icon}</span>
        </div>
        <p class="text-2xl font-bold ${c.color}">${c.value}</p>
      </div>
    `
      )
      .join('');
  }

  renderTransactions(transactions) {
    if (!transactions || transactions.length === 0) {
      this.transactionsTable.innerHTML = `
        <p class="text-slate-400 text-center py-8 text-sm">
          Belum ada transaksi. <a href="/html/transactions.html" class="text-emerald-400 hover:underline">Tambah transaksi pertama Anda!</a>
        </p>
      `;
      return;
    }

    const rows = transactions
      .map(
        (t) => `
      <tr class="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
        <td class="px-4 py-3 text-slate-300 text-sm">${t.date}</td>
        <td class="px-4 py-3 text-slate-300 text-sm">${t.category}</td>
        <td class="px-4 py-3 text-slate-400 text-sm">${t.description || '—'}</td>
        <td class="px-4 py-3 text-right">
          <span class="${t.type === 'income' ? 'badge-income' : 'badge-expense'}">
            ${t.type === 'income' ? '+' : '−'}${this.formatIDR(t.amount)}
          </span>
        </td>
      </tr>
    `
      )
      .join('');

    this.transactionsTable.innerHTML = `
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-slate-400 text-xs uppercase tracking-wide border-b border-slate-800">
              <th class="px-4 py-3 text-left font-medium">Tanggal</th>
              <th class="px-4 py-3 text-left font-medium">Kategori</th>
              <th class="px-4 py-3 text-left font-medium">Keterangan</th>
              <th class="px-4 py-3 text-right font-medium">Jumlah</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    `;
  }

  formatIDR(amount) {
    return (amount || 0).toLocaleString('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    });
  }

  setStatus(message, type = 'info') {
    const styles = {
      info: 'bg-blue-500/10 border border-blue-500/30 text-blue-300',
      success:
        'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300',
      error: 'bg-red-500/10 border border-red-500/30 text-red-300',
    };
    this.appStatus.className = `status-bar mb-6 rounded-xl px-4 py-3 text-sm ${styles[type] || styles.info}`;
    this.appStatus.textContent = message;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const dashboard = new Dashboard();
  dashboard.init();
});
