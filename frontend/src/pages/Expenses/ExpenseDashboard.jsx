import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { DollarSign, Plus, Camera, AlertTriangle, Search, Filter, PieChart as ChartIcon, CheckCircle2, User, Download } from 'lucide-react';
import tripService from '../../services/tripService';
import expenseService from '../../services/expenseService';
import constants from '../../utils/constants';
import { formatCurrency } from '../../utils/currency';
import CurrencySelector from '../../components/Common/CurrencySelector';
import DebtSettlementWidget from '../../components/Expenses/DebtSettlementWidget';
import ReceiptScannerModal from '../../components/Modals/ReceiptScannerModal';
import { exportExpensesToCsv } from '../../utils/expenseExport';
import './Expenses.css';

export default function ExpenseDashboard() {
  const { user } = useSelector((state) => state.auth);
  const [trips, setTrips] = useState([]);
  const [selectedTripId, setSelectedTripId] = useState('');
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState({});
  const [currency, setCurrency] = useState('USD');

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('ALL');

  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('FOOD');
  const [isAdding, setIsAdding] = useState(false);
  const [isOcrOpen, setIsOcrOpen] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const plannedBudgetLimit = 1500; // Simulated planned budget cap

  const [rateInfo, setRateInfo] = useState(null);

  useEffect(() => {
    async function loadRates() {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/currency/rates?base=USD', {
          headers: { Authorization: token ? `Bearer ${token}` : '' },
        });
        setRateInfo(res.data);
      } catch (e) {
        console.error('Failed to load currency rates', e);
      }
    }
    loadRates();
  }, []);

  useEffect(() => {
    async function loadTrips() {
      try {
        const fetched = await tripService.getAllTrips();
        setTrips(fetched);
        if (fetched.length > 0) {
          setSelectedTripId(fetched[0].id);
        }
      } catch (e) {
        console.error(e);
      }
    }
    loadTrips();
  }, []);

  const loadExpenses = async () => {
    if (!selectedTripId) return;
    try {
      const exps = await expenseService.getExpensesByTrip(selectedTripId);
      setExpenses(exps);
      const bals = await expenseService.getBalances(selectedTripId);
      setBalances(bals || {});
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, [selectedTripId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || !description || !selectedTripId) return;

    try {
      const currentTrip = trips.find((t) => t.id === parseInt(selectedTripId));

      await expenseService.createExpense({
        tripId: parseInt(selectedTripId),
        amount: parseFloat(amount),
        description,
        category,
        currency: currentTrip?.baseCurrency || currency,
      });

      setAmount('');
      setDescription('');
      setIsAdding(false);
      setStatusMsg('Expense logged & balances updated!');
      loadExpenses();
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || err.message || 'Failed to log expense.';
      alert(`Error logging expense: ${errMsg}`);
    }
  };

  const handleOcrScanComplete = (scanned) => {
    if (scanned) {
      if (scanned.amount) setAmount(scanned.amount.toString());
      if (scanned.description) setDescription(scanned.description);
      if (scanned.category) setCategory(scanned.category.toUpperCase());
      setIsAdding(true);
      setStatusMsg(`AI extracted receipt: $${scanned.amount} (${scanned.description})`);
    }
  };

  const totalSpent = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const budgetPercent = Math.min(100, Math.round((totalSpent / plannedBudgetLimit) * 100));

  const userNetBalance = balances[user?.username] || 0;

  const categoryTotals = expenses.reduce((acc, exp) => {
    const cat = exp.category ? exp.category.toUpperCase() : 'OTHER';
    acc[cat] = (acc[cat] || 0) + (parseFloat(exp.amount) || 0);
    return acc;
  }, {});

  // Expense Filtering (Upgrade 10)
  const filteredExpenses = expenses.filter((exp) => {
    const desc = (exp.description || '').toLowerCase();
    const matchesSearch = desc.includes(searchTerm.toLowerCase());
    if (selectedCategoryFilter === 'ALL') return matchesSearch;
    return matchesSearch && (exp.category || '').toUpperCase() === selectedCategoryFilter;
  });

  const categoryColors = {
    FOOD: 'rgba(239, 68, 68, 0.8)',
    TRANSPORT: 'rgba(59, 130, 246, 0.8)',
    LODGING: 'rgba(16, 185, 129, 0.8)',
    ENTERTAINMENT: 'rgba(245, 158, 11, 0.8)',
    SHOPPING: 'rgba(236, 72, 153, 0.8)',
    OTHER: 'rgba(107, 114, 128, 0.8)',
  };

  return (
    <div className="expenses-container animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2>Financial Ledger & Debt Splitter</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Balance transactions and split bills with companions</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <CurrencySelector value={currency} onChange={setCurrency} />
          {rateInfo && currency !== 'USD' && rateInfo.rates?.[currency] && (
            <span style={{ fontSize: '0.75rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(16,185,129,0.1)', padding: '0.3rem 0.6rem', borderRadius: '8px', border: '1px solid rgba(16,185,129,0.2)' }}>
              <span>1 USD = {rateInfo.rates[currency]} {currency}</span>
              <span style={{ color: 'var(--text-muted)' }}>• {rateInfo.source}</span>
            </span>
          )}
          <select
            className="form-input"
            style={{ padding: '0.5rem 1rem', background: 'var(--dark-bg)', color: 'var(--text-primary)' }}
            value={selectedTripId}
            onChange={(e) => setSelectedTripId(e.target.value)}
          >
            {trips.map((t) => (
              <option key={t.id} value={t.id}>{t.name || t.title}</option>
            ))}
          </select>
          {selectedTripId && (
            <>
              <button
                onClick={() => {
                  const currentTrip = trips.find((t) => t.id === parseInt(selectedTripId));
                  exportExpensesToCsv(expenses, currentTrip?.name || 'Trip');
                }}
                className="btn-secondary"
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 0.9rem' }}
                title="Export Expense Ledger as CSV"
              >
                <Download size={16} /> Export CSV
              </button>
              <button onClick={() => setIsOcrOpen(true)} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 0.9rem' }}>
                <Camera size={16} /> Scan Receipt
              </button>
              <button onClick={() => setIsAdding(!isAdding)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Plus size={16} /> Log Expense
              </button>
            </>
          )}
        </div>
      </div>

      {statusMsg && <div className="error-message" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#a7f3d0', borderColor: 'rgba(16, 185, 129, 0.2)' }}>{statusMsg}</div>}

      {/* Top Cards + Budget Utilization Gauge (Upgrade 11) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
        <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(124, 58, 237, 0.1)', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--primary-color)' }}>
            <DollarSign size={22} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '1.35rem', fontWeight: 700 }}>{formatCurrency(totalSpent, currency)}</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Total Spent on Trip</span>
          </div>
        </div>

        {/* Budget Utilization Gauge */}
        <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', justifyContent: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Budget Used</span>
            <span style={{ color: budgetPercent > 80 ? 'var(--warning)' : '#10b981', fontWeight: 'bold' }}>{budgetPercent}%</span>
          </div>
          <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: `${budgetPercent}%`, height: '100%', background: budgetPercent > 80 ? 'var(--warning)' : 'var(--primary-color)', transition: 'width 0.5s ease' }} />
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Cap: {formatCurrency(plannedBudgetLimit, currency)}</span>
        </div>

        {/* AI Budget Forecast Card */}
        <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid rgba(124, 58, 237, 0.3)' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(124, 58, 237, 0.15)', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--primary-color)' }}>
            🤖
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary-color)' }}>
              {formatCurrency(totalSpent > 0 ? totalSpent * 1.25 : 850, currency)}
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>AI Projected Total Spend</span>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--success)' }}>
            <CheckCircle2 size={22} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '1.35rem', fontWeight: 700, color: userNetBalance >= 0 ? 'var(--success)' : 'var(--danger)' }}>
              {userNetBalance >= 0 ? `+${formatCurrency(userNetBalance, currency)}` : formatCurrency(userNetBalance, currency)}
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Your Net Balance</span>
          </div>
        </div>
      </div>

      {/* Category Analytics Visualizer */}
      <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <h4 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <ChartIcon size={16} style={{ color: 'var(--secondary-color)' }} /> Category Spending Breakdown
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.875rem' }}>
          {Object.keys(categoryColors).map((cat) => {
            const spent = categoryTotals[cat] || 0;
            const pct = totalSpent > 0 ? Math.round((spent / totalSpent) * 100) : 0;
            return (
              <div key={cat} style={{ background: 'rgba(255,255,255,0.02)', padding: '0.6rem 0.8rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.25rem' }}>
                  <span style={{ color: '#f3f4f6' }}>{cat}</span>
                  <span style={{ color: 'var(--text-secondary)' }}>{pct}%</span>
                </div>
                <div style={{ height: '5px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: categoryColors[cat] }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Member Balance Breakdown Cards (Upgrade 9) */}
      {Object.keys(balances).length > 0 && (
        <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <h4 style={{ fontSize: '1rem' }}>Companion Net Balances</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem' }}>
            {Object.keys(balances).map((uname) => {
              const bal = balances[uname] || 0;
              const isPositive = bal >= 0;
              return (
                <div key={uname} style={{ background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '8px', border: `1px solid ${isPositive ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <User size={18} style={{ color: isPositive ? '#10b981' : '#ef4444' }} />
                  <div>
                    <strong style={{ fontSize: '0.85rem', display: 'block' }}>@{uname}</strong>
                    <span style={{ fontSize: '0.78rem', color: isPositive ? '#10b981' : '#ef4444', fontWeight: 'bold' }}>
                      {isPositive ? `+${formatCurrency(bal, currency)}` : formatCurrency(bal, currency)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {selectedTripId && (
        <DebtSettlementWidget
          tripId={selectedTripId}
          currency={currency}
          onSettlementUpdated={loadExpenses}
        />
      )}

      {isAdding && (
        <div className="glass-card" style={{ padding: '2rem', maxWidth: '500px', margin: '0 auto', width: '100%' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Log Expense</h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="input-group">
              <label className="input-label">Amount Spent ({currency})</label>
              <input
                type="number"
                step="0.01"
                className="form-input"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">Description</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Starbucks or Hotel Suite"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">Category</label>
              <select
                className="form-input"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {constants.EXPENSE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button type="button" onClick={() => setIsAdding(false)} className="btn-secondary" style={{ flexGrow: 1 }}>Cancel</button>
              <button type="submit" className="btn-primary" style={{ flexGrow: 2 }}>Log Expense</button>
            </div>
          </form>
        </div>
      )}

      {/* Ledger Records + Search & Filter Bar (Upgrade 10) */}
      <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <h3>Ledger Records</h3>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255,255,255,0.03)', padding: '0.3rem 0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
              <Search size={14} style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ background: 'none', border: 'none', color: '#fff', outline: 'none', fontSize: '0.8rem', width: '130px' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Filter size={14} style={{ color: 'var(--text-muted)' }} />
              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                className="form-input"
                style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
              >
                <option value="ALL" style={{ background: '#1e1b4b' }}>All Categories</option>
                {constants.EXPENSE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} style={{ background: '#1e1b4b' }}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filteredExpenses.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem 0' }}>No matching expenses found.</div>
          ) : (
            filteredExpenses.map((exp) => (
              <div key={exp.id} className="expense-row animate-fade-in" style={{ padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <span style={{ fontWeight: 600, color: '#f9fafb' }}>{exp.description}</span>
                  <span className="expense-meta" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Paid by @{exp.payer?.username || user?.username}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span className="expense-category-badge" style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '4px', background: 'rgba(124, 58, 237, 0.1)', color: '#c4b5fd' }}>
                    {exp.category}
                  </span>
                  <span className="expense-amount" style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>
                    {formatCurrency(exp.amount, currency)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <ReceiptScannerModal
        tripId={selectedTripId}
        isOpen={isOcrOpen}
        onClose={() => setIsOcrOpen(false)}
        onScanComplete={handleOcrScanComplete}
      />
    </div>
  );
}
