import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { ArrowRight, CheckCircle2, Sparkles, Check, Loader2 } from 'lucide-react';
import expenseService from '../../services/expenseService';
import { formatCurrency } from '../../utils/currency';

export default function DebtSettlementWidget({ tripId, currency = 'USD', onSettlementUpdated }) {
  const { user } = useSelector((state) => state.auth);
  const [settlements, setSettlements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [settlingId, setSettlingId] = useState(null);

  const fetchSettlements = async () => {
    try {
      if (!tripId) return;
      const data = await expenseService.getSettlements(tripId);
      setSettlements(data || []);
    } catch (err) {
      console.error('Failed to fetch debt settlements:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettlements();
  }, [tripId]);

  const handleMarkSettled = async (settlementId) => {
    if (!settlementId) return;
    setSettlingId(settlementId);
    try {
      await expenseService.settleSettlement(tripId, settlementId);
      await fetchSettlements();
      if (onSettlementUpdated) {
        onSettlementUpdated();
      }
    } catch (err) {
      console.error('Failed to settle debt:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to mark debt as settled.';
      alert(msg);
    } finally {
      setSettlingId(null);
    }
  };

  if (isLoading) return null;

  const pendingSettlements = settlements.filter((s) => s.status !== 'SETTLED');
  const settledSettlements = settlements.filter((s) => s.status === 'SETTLED');

  return (
    <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles size={18} style={{ color: 'var(--secondary-color)' }} />
          <h4 style={{ fontSize: '1rem' }}>Splitwise Minimized Debt Settlement</h4>
        </div>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          {pendingSettlements.length} active {pendingSettlements.length === 1 ? 'transfer' : 'transfers'} needed
        </span>
      </div>

      {pendingSettlements.length === 0 && settledSettlements.length === 0 ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', fontSize: '0.85rem' }}>
          <CheckCircle2 size={16} /> All group expenses are fully settled up!
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {pendingSettlements.map((st) => {
            const isUserDebtor = st.fromUser === user?.username;
            const isUserCreditor = st.toUser === user?.username;
            const canSettle = isUserDebtor || isUserCreditor;

            return (
              <div
                key={st.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.6rem 0.8rem',
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.85rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <strong style={{ color: 'var(--primary-color)' }}>@{st.fromUser}</strong>
                  <ArrowRight size={14} style={{ color: 'var(--text-muted)' }} />
                  <strong style={{ color: 'var(--secondary-color)' }}>@{st.toUser}</strong>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  <span style={{ fontWeight: '600', color: '#f9fafb' }}>
                    {formatCurrency(st.amount, currency)}
                  </span>

                  {canSettle && (
                    <button
                      onClick={() => handleMarkSettled(st.id)}
                      disabled={settlingId === st.id}
                      className="btn-primary"
                      style={{
                        padding: '0.25rem 0.6rem',
                        fontSize: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                      }}
                      title="Confirm this transfer has taken place"
                    >
                      {settlingId === st.id ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <Check size={12} />
                      )}
                      Mark Settled
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {settledSettlements.length > 0 && (
            <details style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <summary style={{ cursor: 'pointer', marginBottom: '0.4rem' }}>
                View {settledSettlements.length} completed {settledSettlements.length === 1 ? 'settlement' : 'settlements'}
              </summary>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.4rem' }}>
                {settledSettlements.map((st) => (
                  <div
                    key={st.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.4rem 0.6rem',
                      background: 'rgba(16, 185, 129, 0.05)',
                      borderRadius: '4px',
                      border: '1px solid rgba(16, 185, 129, 0.2)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <CheckCircle2 size={12} style={{ color: '#10b981' }} />
                      <span>@{st.fromUser} paid @{st.toUser}</span>
                    </div>
                    <span style={{ color: '#10b981', fontWeight: '500' }}>
                      {formatCurrency(st.amount, currency)}
                    </span>
                  </div>
                ))}
              </div>
            </details>
          )}
        </div>
      )}
    </div>
  );
}
