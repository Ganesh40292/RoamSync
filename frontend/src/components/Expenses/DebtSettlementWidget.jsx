import React, { useState, useEffect } from 'react';
import { ArrowRight, CheckCircle2, DollarSign, Sparkles } from 'lucide-react';
import axios from 'axios';
import { formatCurrency } from '../../utils/currency';

export default function DebtSettlementWidget({ tripId, currency = 'USD' }) {
  const [settlements, setSettlements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSettlements = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`/api/trips/${tripId}/expenses/settlements`, {
          headers: { Authorization: token ? `Bearer ${token}` : '' },
        });
        setSettlements(res.data);
      } catch (err) {
        console.error('Failed to fetch debt settlements:', err);
      } finally {
        setIsLoading(false);
      }
    };
    if (tripId) fetchSettlements();
  }, [tripId]);

  if (isLoading) return null;

  return (
    <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles size={18} style={{ color: 'var(--secondary-color)' }} />
          <h4 style={{ fontSize: '1rem' }}>Splitwise Minimized Debt Settlement</h4>
        </div>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          {settlements.length} direct transfers needed
        </span>
      </div>

      {settlements.length === 0 ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', fontSize: '0.85rem' }}>
          <CheckCircle2 size={16} /> All group expenses are fully settled up!
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {settlements.map((st, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 0.8rem', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <strong style={{ color: 'var(--primary-color)' }}>{st.fromUser}</strong>
                <ArrowRight size={14} style={{ color: 'var(--text-muted)' }} />
                <strong style={{ color: 'var(--secondary-color)' }}>{st.toUser}</strong>
              </div>
              <span style={{ fontWeight: '600', color: '#f9fafb' }}>
                {formatCurrency(st.amount, currency)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
