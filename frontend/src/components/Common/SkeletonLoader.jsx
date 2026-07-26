import React from 'react';

export default function SkeletonLoader({ count = 3, type = 'card' }) {
  const items = Array.from({ length: count });

  if (type === 'list') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
        {items.map((_, i) => (
          <div
            key={i}
            className="skeleton-pulse"
            style={{
              height: '52px',
              borderRadius: '8px',
              background: 'linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 75%)',
              backgroundSize: '200% 100%',
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem', width: '100%' }}>
      {items.map((_, i) => (
        <div
          key={i}
          className="glass-card"
          style={{ height: '240px', borderRadius: '14px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}
        >
          <div
            className="skeleton-pulse"
            style={{
              height: '110px',
              borderRadius: '10px',
              background: 'linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 75%)',
              backgroundSize: '200% 100%',
            }}
          />
          <div
            className="skeleton-pulse"
            style={{
              height: '18px',
              width: '60%',
              borderRadius: '4px',
              background: 'linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 75%)',
              backgroundSize: '200% 100%',
            }}
          />
          <div
            className="skeleton-pulse"
            style={{
              height: '14px',
              width: '85%',
              borderRadius: '4px',
              background: 'linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 75%)',
              backgroundSize: '200% 100%',
            }}
          />
        </div>
      ))}
    </div>
  );
}
