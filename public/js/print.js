/**
 * public/js/print.js
 */

document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const type = urlParams.get('type');

  const docTitle = document.getElementById('doc-title');
  const docDate = document.getElementById('doc-date');
  const content = document.getElementById('content');

  docDate.textContent = `Printed: ${new Date().toLocaleString('id-ID')}`;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(amount);
  };

  try {
    if (type === 'transactions') {
      docTitle.textContent = 'Transactions Report';
      const response = await apiClient.getTransactions();

      if (!response.data || response.data.length === 0) {
        content.innerHTML =
          '<div class="status-msg">No transactions found.</div>';
        return;
      }

      let html = `
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Category</th>
              <th>Description</th>
              <th>Type</th>
              <th class="text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
      `;

      response.data.forEach((txn) => {
        const typeStyle =
          txn.type === 'income' ? 'color: #006600' : 'color: #cc0000';
        html += `
          <tr>
            <td>${txn.transaction_date}</td>
            <td>${txn.category_name || '-'}</td>
            <td>${txn.description || '-'}</td>
            <td style="${typeStyle}">${txn.type}</td>
            <td class="text-right">${formatCurrency(txn.amount)}</td>
          </tr>
        `;
      });

      html += `</tbody></table>`;
      content.innerHTML = html;
    } else if (type === 'reports') {
      docTitle.textContent = 'Financial Reports History';
      const response = await apiClient.getReports();

      if (!response.data || response.data.length === 0) {
        content.innerHTML = '<div class="status-msg">No reports found.</div>';
        return;
      }

      let html = `
        <table>
          <thead>
            <tr>
              <th>Period</th>
              <th>Type</th>
              <th class="text-right">Income</th>
              <th class="text-right">Expense</th>
              <th class="text-right">Net Savings</th>
              <th>Generated At</th>
            </tr>
          </thead>
          <tbody>
      `;

      response.data.forEach((report) => {
        const periodStr =
          report.period_start && report.period_end
            ? `${report.period_start} to ${report.period_end}`
            : report.period_start;
        html += `
          <tr>
            <td>${periodStr}</td>
            <td style="text-transform: capitalize">${report.report_type}</td>
            <td class="text-right" style="color: #006600">${formatCurrency(report.total_income)}</td>
            <td class="text-right" style="color: #cc0000">${formatCurrency(report.total_expense)}</td>
            <td class="text-right font-weight: bold">${formatCurrency(report.net_savings)}</td>
            <td>${new Date(report.generated_at).toLocaleString('id-ID')}</td>
          </tr>
        `;
      });

      html += `</tbody></table>`;
      content.innerHTML = html;
    } else {
      content.innerHTML =
        '<div class="status-msg">Invalid report type specified.</div>';
      return;
    }

    // Auto-trigger print dialog after a brief delay to ensure rendering
    setTimeout(() => {
      window.print();
    }, 500);
  } catch (error) {
    console.error(error);
    content.innerHTML = `<div class="status-msg" style="color: red">Error loading data: ${error.message}</div>`;
  }
});
