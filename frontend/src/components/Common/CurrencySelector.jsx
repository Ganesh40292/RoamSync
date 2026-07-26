import React from 'react';
import { CURRENCIES } from '../../utils/currency';

export default function CurrencySelector({ value, onChange }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="form-input"
      style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', width: 'auto', background: 'rgba(255,255,255,0.05)', color: '#f3f4f6' }}
    >
      {CURRENCIES.map((c) => (
        <option key={c.code} value={c.code} style={{ background: '#1e1b4b', color: '#fff' }}>
          {c.symbol} {c.code} - {c.name}
        </option>
      ))}
    </select>
  );
}
