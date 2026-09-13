import React, { useState, useEffect } from 'react';
import { Luggage, Check, CloudSun, Shirt, ShieldAlert, Cpu, Sparkles, CheckCircle2, Wand2, Loader2, X } from 'lucide-react';
import axios from 'axios';
import aiService from '../../services/aiService';

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
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [selectedAiItems, setSelectedAiItems] = useState({});
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  const handleFetchAiSuggestions = async () => {
    if (!tripId) return;
    setIsAiLoading(true);
    setAiError('');
    try {
      const data = await aiService.getAiPackingSuggestions(tripId);
      if (data?.categories) {
        setAiSuggestions(data.categories);
        // Pre-select all suggestions by default
        const initialSelected = {};
        Object.values(data.categories).flat().forEach((item) => {
          initialSelected[item] = true;
        });
        setSelectedAiItems(initialSelected);
      }
    } catch (err) {
      console.error('Failed to get packing suggestions', err);
      setAiError(err.response?.data?.message || 'Rate limit reached (max 3/hour) or backend unavailable.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleAddSelected = () => {
    if (!aiSuggestions) return;
    const selected = Object.keys(selectedAiItems).filter((k) => selectedAiItems[k]);
    if (selected.length === 0) {
      setAiSuggestions(null);
      return;
    }

    setPackingData((prev) => ({
      ...prev,
      essentials: [...new Set([...(prev.essentials || []), ...selected.slice(0, 3)])],
      weatherGear: [...new Set([...(prev.weatherGear || []), ...selected.slice(3)])],
    }));
    setAiSuggestions(null);
  };

  const handleAddAll = () => {
    if (!aiSuggestions) return;
    const all = Object.values(aiSuggestions).flat();
    setPackingData((prev) => ({
      ...prev,
      essentials: [...new Set([...(prev.essentials || []), ...all.slice(0, 4)])],
      weatherGear: [...new Set([...(prev.weatherGear || []), ...all.slice(4)])],
    }));
    setAiSuggestions(null);
  };

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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={handleFetchAiSuggestions}
            disabled={isAiLoading}
            className="btn-secondary"
            style={{ padding: '0.3rem 0.75rem', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#06b6d4', borderColor: 'rgba(6,182,212,0.3)' }}
          >
            {isAiLoading ? <Loader2 size={13} className="animate-spin" /> : <Wand2 size={13} />}
            <span>{isAiLoading ? 'Analyzing Climate...' : '🪄 AI Smart Pack'}</span>
          </button>
          <span style={{ fontSize: '0.75rem', background: 'rgba(6,182,212,0.1)', color: 'var(--secondary-color)', padding: '0.2rem 0.6rem', borderRadius: '12px' }}>
            <CloudSun size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
            {packingData.weatherCondition} • {packingData.temperature}
          </span>
        </div>
      </div>

      {aiError && (
        <div style={{ padding: '0.6rem 0.8rem', borderRadius: '8px', background: 'rgba(239,68,68,0.1)', color: 'var(--danger)', fontSize: '0.8rem', border: '1px solid var(--danger)' }}>
          ⚠️ {aiError}
        </div>
      )}

      {aiSuggestions && (
        <div style={{ padding: '1.25rem', borderRadius: '12px', background: 'rgba(6,182,212,0.06)', border: '1px solid rgba(6,182,212,0.3)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <strong style={{ fontSize: '0.9rem', color: '#06b6d4' }}>✨ Gemini AI Climate-Aware Suggestions</strong>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                Select items to append to your checklist (zero silent modifications):
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={handleAddSelected}
                className="btn-primary"
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', background: '#06b6d4', borderColor: '#06b6d4' }}
              >
                Add Selected Items
              </button>
              <button
                type="button"
                onClick={handleAddAll}
                className="btn-secondary"
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
              >
                Add All Suggestions
              </button>
              <button
                type="button"
                onClick={() => setAiSuggestions(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.2rem' }}
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
            {Object.entries(aiSuggestions).map(([category, items]) => (
              <div key={category} style={{ background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#f3f4f6', display: 'block', marginBottom: '0.4rem' }}>
                  {category}
                </span>
                {items.map((item) => (
                  <label key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: 'var(--text-secondary)', cursor: 'pointer', marginBottom: '0.25rem' }}>
                    <input
                      type="checkbox"
                      checked={!!selectedAiItems[item]}
                      onChange={() => setSelectedAiItems((p) => ({ ...p, [item]: !p[item] }))}
                    />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

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
