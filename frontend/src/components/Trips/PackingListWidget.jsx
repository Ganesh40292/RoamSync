import React, { useState, useEffect } from 'react';
import { Luggage, Check, CloudSun, Shirt, ShieldAlert, Cpu, Sparkles, CheckCircle2 } from 'lucide-react';
import axios from 'axios';

const PRESET_PACKING = {
  weatherCondition: 'Sunny 28°C',
  temperature: 'Karnataka Pleasant',
  essentials: ['Passport / National ID', 'Booking Confirmation PDFs', 'Wallet & Travel Cards', 'Emergency Contacts'],
  weatherGear: ['UV Sunglasses 😎', 'High SPF Sunscreen 🧴', 'Lightweight Umbrella ☔', 'Reusable Water Bottle 💧'],
  clothing: ['Breathable Cotton Shirts 👕', 'Trek Shoes / Sandals 👟', 'Evening Jacket 🧥', 'Rain Poncho 🌧️'],
  karnatakaGear: ['Gokarna Beach Towel 🏖️', 'Coorg Trekking Pole 🧗‍♂️', 'Filter Coffee Thermos ☕', 'Power Bank 20000mAh ⚡'],
};

export default function PackingListWidget({ tripId }) {
  const [packingData, setPackingData] = useState(PRESET_PACKING);
  const [checkedItems, setCheckedItems] = useState({});

  useEffect(() => {
    const fetchPackingList = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`/api/trips/${tripId}/packing-list`, {
          headers: { Authorization: token ? `Bearer ${token}` : '' },
        });
        if (res.data && res.data.essentials) setPackingData(res.data);
      } catch (err) {
        console.error('Using fallback preset packing data', err);
      }
    };
    if (tripId) fetchPackingList();
  }, [tripId]);

  const toggleItem = (item) => {
    setCheckedItems((prev) => ({ ...prev, [item]: !prev[item] }));
  };

  const allItems = [
    ...(packingData.essentials || []),
    ...(packingData.weatherGear || []),
    ...(packingData.clothing || []),
    ...(packingData.karnatakaGear || []),
  ];

  const packedCount = allItems.filter((i) => checkedItems[i]).length;
  const progressPercent = allItems.length > 0 ? Math.round((packedCount / allItems.length) * 100) : 0;

  return (
    <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Luggage size={20} style={{ color: 'var(--secondary-color)' }} />
          <h4 style={{ fontSize: '1.1rem' }}>Smart Weather-Aware Packing Checklist</h4>
        </div>
        <span style={{ fontSize: '0.75rem', background: 'rgba(6,182,212,0.1)', color: 'var(--secondary-color)', padding: '0.2rem 0.6rem', borderRadius: '12px' }}>
          <CloudSun size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
          {packingData.weatherCondition} • {packingData.temperature}
        </span>
      </div>

      {/* Progress Bar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Packing Readiness</span>
          <span style={{ color: progressPercent === 100 ? 'var(--success)' : 'var(--primary-color)', fontWeight: 'bold' }}>
            {packedCount} / {allItems.length} ({progressPercent}%)
          </span>
        </div>
        <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ width: `${progressPercent}%`, height: '100%', background: progressPercent === 100 ? 'var(--success)' : 'var(--primary-color)', transition: 'width 0.4s ease' }} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        {/* Essentials */}
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', borderLeft: '3px solid var(--primary-color)' }}>
          <strong style={{ fontSize: '0.85rem', color: '#f3f4f6', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
            <ShieldAlert size={14} style={{ color: 'var(--primary-color)' }} /> Essentials & Docs
          </strong>
          {packingData.essentials?.map((item) => (
            <label key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: checkedItems[item] ? 'var(--text-muted)' : 'var(--text-secondary)', textDecoration: checkedItems[item] ? 'line-through' : 'none', cursor: 'pointer', marginBottom: '0.35rem' }}>
              <input type="checkbox" checked={!!checkedItems[item]} onChange={() => toggleItem(item)} />
              {item}
            </label>
          ))}
        </div>

        {/* Weather Specific */}
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', borderLeft: '3px solid var(--secondary-color)' }}>
          <strong style={{ fontSize: '0.85rem', color: '#f3f4f6', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
            <CloudSun size={14} style={{ color: 'var(--secondary-color)' }} /> Weather Specific
          </strong>
          {packingData.weatherGear?.map((item) => (
            <label key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: checkedItems[item] ? 'var(--text-muted)' : 'var(--text-secondary)', textDecoration: checkedItems[item] ? 'line-through' : 'none', cursor: 'pointer', marginBottom: '0.35rem' }}>
              <input type="checkbox" checked={!!checkedItems[item]} onChange={() => toggleItem(item)} />
              {item}
            </label>
          ))}
        </div>

        {/* Clothing */}
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', borderLeft: '3px solid #10b981' }}>
          <strong style={{ fontSize: '0.85rem', color: '#f3f4f6', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
            <Shirt size={14} style={{ color: '#10b981' }} /> Clothing & Shoes
          </strong>
          {packingData.clothing?.map((item) => (
            <label key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: checkedItems[item] ? 'var(--text-muted)' : 'var(--text-secondary)', textDecoration: checkedItems[item] ? 'line-through' : 'none', cursor: 'pointer', marginBottom: '0.35rem' }}>
              <input type="checkbox" checked={!!checkedItems[item]} onChange={() => toggleItem(item)} />
              {item}
            </label>
          ))}
        </div>

        {/* Karnataka Presets */}
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', borderLeft: '3px solid #f59e0b' }}>
          <strong style={{ fontSize: '0.85rem', color: '#f3f4f6', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
            <Sparkles size={14} style={{ color: '#f59e0b' }} /> Karnataka Special
          </strong>
          {packingData.karnatakaGear?.map((item) => (
            <label key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: checkedItems[item] ? 'var(--text-muted)' : 'var(--text-secondary)', textDecoration: checkedItems[item] ? 'line-through' : 'none', cursor: 'pointer', marginBottom: '0.35rem' }}>
              <input type="checkbox" checked={!!checkedItems[item]} onChange={() => toggleItem(item)} />
              {item}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
