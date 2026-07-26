import React from 'react';

export default function PageTransition({ children }) {
  return (
    <div className="page-transition-wrapper">
      {children}
      <style>{`
        .page-transition-wrapper {
          animation: pageSlideFade 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes pageSlideFade {
          0% {
            opacity: 0;
            transform: translateY(12px) scale(0.99);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
