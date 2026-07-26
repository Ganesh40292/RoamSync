import React from 'react';
import { X, Download, ZoomIn, ZoomOut } from 'lucide-react';

export default function ImageLightboxModal({ isOpen, onClose, imageUrl, title = 'Photo Preview' }) {
  const [zoom, setZoom] = React.useState(1);

  if (!isOpen || !imageUrl) return null;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `${title.replace(/\s+/g, '_')}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.9)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1rem',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          maxWidth: '90vw',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem',
        }}
      >
        {/* Controls Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(12px)',
            padding: '0.5rem 1rem',
            borderRadius: '20px',
            color: '#fff',
          }}
        >
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{title}</span>
          <div style={{ width: '1px', height: '16px', background: 'rgba(255,255,255,0.2)' }} />
          <button onClick={() => setZoom((z) => Math.min(2.5, z + 0.25))} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }} title="Zoom In">
            <ZoomIn size={18} />
          </button>
          <button onClick={() => setZoom((z) => Math.max(0.75, z - 0.25))} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }} title="Zoom Out">
            <ZoomOut size={18} />
          </button>
          <button onClick={handleDownload} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }} title="Download Photo">
            <Download size={18} />
          </button>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }} title="Close">
            <X size={18} />
          </button>
        </div>

        {/* Image Display */}
        <img
          src={imageUrl}
          alt={title}
          style={{
            maxWidth: '100%',
            maxHeight: '75vh',
            borderRadius: '12px',
            objectFit: 'contain',
            transform: `scale(${zoom})`,
            transition: 'transform 0.25s ease',
            boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
          }}
        />
      </div>
    </div>
  );
}
