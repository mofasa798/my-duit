/**
 * public/js/dashboard.js
 * 
 * Frontend logic untuk dashboard
 * Handles:
 * - Load data dari API
 * - Render dashboard UI
 * - Handle user interactions
 */

class Dashboard {
  constructor() {
    this.appStatus = document.getElementById('app-status');
    this.dashboard = document.getElementById('dashboard');
    this.transactionsTable = document.getElementById('transactions-table');
  }

  async init() {
    try {
      this.setStatus('Loading dashboard...', 'info');
      
      // Load dashboard data
      const dashboardData = await apiClient.getDashboard();
      
      // Render dashboard
      this.renderDashboard(dashboardData);
      this.renderTransactions(dashboardData.transactions);
      
      this.setStatus('Dashboard loaded successfully ✓', 'success');
    } catch (error) {
      this.setStatus(`Error loading dashboard: ${error.message}`, 'error');
    }
  }

  renderDashboard(data) {
    const { totalIncome, totalExpense, balance } = data;

    this.dashboard.innerHTML = `
      <div class="bg-slate-700 rounded-lg border border-slate-600 p-6">
        <p class="text-slate-400 text-sm mb-2">Total Income</p>
        <p class="text-3xl font-bold text-green-400">
          +${(totalIncome || 0).toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}
        </p>
      </div>

      <div class="bg-slate-700 rounded-lg border border-slate-600 p-6">
        <p class="text-slate-400 text-sm mb-2">Total Expense</p>
        <p class="text-3xl font-bold text-red-400">
          -${(totalExpense || 0).toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}
        </p>
      </div>

      <div class="bg-slate-700 rounded-lg border border-slate-600 p-6">
        <p class="text-slate-400 text-sm mb-2">Current Balance</p>
        <p class="text-3xl font-bold ${balance >= 0 ? 'text-blue-400' : 'text-red-400'}">
          ${(balance || 0).toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}
        </p>
      </div>

      <div class="bg-slate-700 rounded-lg border border-slate-600 p-6">
        <p class="text-slate-400 text-sm mb-2">Savings Rate</p>
        <p class="text-3xl font-bold text-purple-400">
          ${totalIncome > 0 ? ((balance / totalIncome * 100).toFixed(1)) : 0}%
        </p>
      </div>
    `;
  }

  renderTransactions(transactions) {
    if (!transactions || transactions.length === 0) {
      this.transactionsTable.innerHTML = `
        <p class="text-slate-400 text-center py-8">
          No transactions yet. Add your first transaction!
        </p>
      `;
      return;
    }

    const rows = transactions.map(t => `
      <tr class="border-b border-slate-700 hover:bg-slate-700/50">
        <td class="px-4 py-3 text-white">${t.date}</td>
        <td class="px-4 py-3 text-slate-300">${t.category}</td>
        <td class="px-4 py-3 text-slate-300">${t.description}</td>
        <td class="px-4 py-3 text-right ${t.type === 'income' ? 'text-green-400' : 'text-red-400'}">
          ${t.type === 'income' ? '+' : '-'}${(t.amount).toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}
        </td>
      </tr>
    `).join('');

    this.transactionsTable.innerHTML = `
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-slate-700">
            <tr>
              <th class="px-4 py-3 text-left text-slate-300 font-semibold">Date</th>
              <th class="px-4 py-3 text-left text-slate-300 font-semibold">Category</th>
              <th class="px-4 py-3 text-left text-slate-300 font-semibold">Description</th>
              <th class="px-4 py-3 text-right text-slate-300 font-semibold">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </div>
    `;
  }

  setStatus(message, type = 'info') {
    const statusClass = {
      info: 'bg-blue-500/20 border-blue-500 text-blue-300',
      success: 'bg-green-500/20 border-green-500 text-green-300',
      error: 'bg-red-500/20 border-red-500 text-red-300'
    }[type];

    this.appStatus.innerHTML = `
      <div class="border rounded-lg p-4 ${statusClass}">
        ${message}
      </div>
    `;
  }
}

// Initialize dashboard when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const dashboard = new Dashboard();
  dashboard.init();
});
