const generateCSV = (data, columns) => {
  if (!data || data.length === 0) {
    // If no data, just return headers
    return columns.map(col => `"${col.label}"`).join(',');
  }

  const headerLine = columns.map(col => `"${col.label}"`).join(',');

  const rows = data.map(row => {
    return columns.map(col => {
      let val = row[col.key];
      if (val === null || val === undefined) val = '';
      
      // Convert to string and escape double quotes
      const strVal = String(val).replace(/"/g, '""');
      return `"${strVal}"`;
    }).join(',');
  });

  return [headerLine, ...rows].join('\n');
};

const exportTransactionsCSV = (transactions) => {
  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'transaction_date', label: 'Date' },
    { key: 'category_name', label: 'Category' },
    { key: 'type', label: 'Type' },
    { key: 'amount', label: 'Amount' },
    { key: 'description', label: 'Description' },
    { key: 'created_at', label: 'Created At' }
  ];
  return generateCSV(transactions, columns);
};

const exportReportsCSV = (reports) => {
  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'report_type', label: 'Type' },
    { key: 'period_start', label: 'Period Start' },
    { key: 'period_end', label: 'Period End' },
    { key: 'total_income', label: 'Total Income' },
    { key: 'total_expense', label: 'Total Expense' },
    { key: 'balance', label: 'Balance' },
    { key: 'generated_at', label: 'Generated At' }
  ];
  return generateCSV(reports, columns);
};

module.exports = {
  exportTransactionsCSV,
  exportReportsCSV
};
