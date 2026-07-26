export function exportExpensesToCsv(expenses = [], tripName = 'Trip') {
  if (!expenses || expenses.length === 0) {
    alert('No expense records available to export.');
    return;
  }

  const headers = ['ID', 'Description', 'Amount', 'Category', 'Paid By', 'Date'];
  const rows = expenses.map((exp) => [
    exp.id || '',
    `"${(exp.description || '').replace(/"/g, '""')}"`,
    exp.amount ? exp.amount.toFixed(2) : '0.00',
    exp.category || 'OTHER',
    exp.payer?.username || exp.paidBy || 'Companion',
    exp.createdDate || new Date().toLocaleDateString(),
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${tripName.replace(/\s+/g, '_')}_Expense_Ledger.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
