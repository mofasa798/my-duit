/**
 * public/js/reports.js
 */

document.addEventListener('DOMContentLoaded', () => {
  const reportsContainer = document.getElementById('reports-container');
  const btnRunWeekly = document.getElementById('btn-run-weekly');
  const btnRunMonthly = document.getElementById('btn-run-monthly');

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(amount);
  };

  const loadReports = async () => {
    try {
      reportsContainer.innerHTML =
        '<div class="p-6 text-center text-slate-400">Loading reports...</div>';
      const response = await apiClient.getReports();

      if (!response.data || response.data.length === 0) {
        reportsContainer.innerHTML =
          '<div class="p-6 text-center text-slate-400">No reports generated yet.</div>';
        return;
      }

      let html =
        '<table class="w-full text-left border-collapse text-sm whitespace-nowrap">';
      html += `
        <thead>
          <tr class="bg-slate-900/50 text-slate-300">
            <th class="p-4 font-medium border-b border-slate-700">Period</th>
            <th class="p-4 font-medium border-b border-slate-700">Type</th>
            <th class="p-4 font-medium border-b border-slate-700 text-right">Income</th>
            <th class="p-4 font-medium border-b border-slate-700 text-right">Expense</th>
            <th class="p-4 font-medium border-b border-slate-700 text-right">Balance</th>
            <th class="p-4 font-medium border-b border-slate-700">Generated At</th>
          </tr>
        </thead>
        <tbody>
      `;

      response.data.forEach((report) => {
        const periodStr =
          report.period_start && report.period_end
            ? `${report.period_start} to ${report.period_end}`
            : report.period_start;
        html += `<tr class="border-b border-slate-700 hover:bg-slate-700/50 transition-colors">
          <td class="p-4 text-slate-300">${periodStr}</td>
          <td class="p-4 capitalize">
            <span class="${report.report_type === 'weekly' ? 'bg-blue-900/50 text-blue-300 border-blue-800' : 'bg-emerald-900/50 text-emerald-300 border-emerald-800'} px-2 py-1 rounded text-xs border">
              ${report.report_type}
            </span>
          </td>
          <td class="p-4 text-right text-emerald-400">${formatCurrency(report.total_income)}</td>
          <td class="p-4 text-right text-rose-400">${formatCurrency(report.total_expense)}</td>
          <td class="p-4 text-right font-medium ${(report.net_savings ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}">${formatCurrency(report.net_savings ?? 0)}</td>
          <td class="p-4 text-slate-400 text-xs">${new Date(report.generated_at).toLocaleString('id-ID')}</td>
        </tr>`;
      });

      html += '</tbody></table>';
      reportsContainer.innerHTML = html;
    } catch (error) {
      console.error(error);
      reportsContainer.innerHTML = `<div class="p-6 text-center text-rose-500">Failed to load reports: ${error.message}</div>`;
    }
  };

  const handleRunReport = async (btn, apiCall, defaultText) => {
    try {
      btn.disabled = true;
      btn.innerHTML = `<span class="opacity-75">Running...</span>`;
      btn.classList.add('cursor-not-allowed', 'opacity-80');

      const result = await apiCall();
      alert(`Success! Report generated successfully.`);
      loadReports();
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      btn.disabled = false;
      btn.innerHTML = defaultText;
      btn.classList.remove('cursor-not-allowed', 'opacity-80');
    }
  };

  btnRunWeekly.addEventListener('click', () => {
    const periodStart = document.getElementById('weekly-start').value;
    const periodEnd = document.getElementById('weekly-end').value;
    const data = periodStart && periodEnd ? { periodStart, periodEnd } : null;

    handleRunReport(
      btnRunWeekly,
      () => apiClient.runWeeklyReport(data),
      'Run Weekly Report'
    );
  });

  btnRunMonthly.addEventListener('click', () => {
    const periodStart = document.getElementById('monthly-start').value;
    const periodEnd = document.getElementById('monthly-end').value;
    const data = periodStart && periodEnd ? { periodStart, periodEnd } : null;

    handleRunReport(
      btnRunMonthly,
      () => apiClient.runMonthlyReport(data),
      'Run Monthly Report'
    );
  });

  const btnExport = document.getElementById('btn-export-csv');
  if (btnExport) {
    btnExport.addEventListener('click', () => {
      apiClient.exportReportsCSV();
    });
  }

  const btnPrint = document.getElementById('btn-print-preview');
  if (btnPrint) {
    btnPrint.addEventListener('click', () => {
      window.open('/html/print.html?type=reports', '_blank');
    });
  }

  // Initial load
  loadReports();
});
