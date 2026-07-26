import React, { useState, useCallback } from 'react';
import { ToastContext } from './useToast';

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', zIndex: 9999, pointerEvents: 'none' }}>
        {toasts.map((t) => {
          const colors = {
            success: { bg: 'rgba(16,185,129,0.95)', border: '#10b981', icon: '✅' },
            error: { bg: 'rgba(239,68,68,0.95)', border: '#ef4444', icon: '❌' },
            info: { bg: 'rgba(124,58,237,0.95)', border: '#7c3aed', icon: '💡' },
            warning: { bg: 'rgba(245,158,11,0.95)', border: '#f59e0b', icon: '⚠️' },
            celebration: { bg: 'rgba(236,72,153,0.95)', border: '#ec4899', icon: '🎉' },
          };
          const c = colors[t.type] || colors.success;
          return (
            <div
              key={t.id}
              onClick={() => removeToast(t.id)}
              style={{
                background: c.bg,
                border: `1px solid ${c.border}`,
                color: '#fff',
                padding: '0.75rem 1.25rem',
                borderRadius: '10px',
                fontSize: '0.85rem',
                fontWeight: 500,
                backdropFilter: 'blur(12px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                animation: 'slideInRight 0.3s ease-out',
                pointerEvents: 'auto',
                cursor: 'pointer',
                maxWidth: '360px',
              }}
            >
              <span>{c.icon}</span>
              <span>{t.message}</span>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export default ToastProvider;
