import React, { useState } from 'react';
import { Image, Upload, X } from 'lucide-react';

export default function PhotoVaultGrid({ trip }) {
  const [photos, setPhotos] = useState([
    { id: 1, url: 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=800&q=80', caption: 'Illuminated Mysore Palace' },
    { id: 2, url: 'https://images.unsplash.com/photo-1600100397608-f010e42ed97c?auto=format&fit=crop&w=800&q=80', caption: 'Hampi Vijayanagara Stone Ruins' },
    { id: 3, url: 'https://images.unsplash.com/photo-1588598126702-86927bf49a0d?auto=format&fit=crop&w=800&q=80', caption: 'Coorg Coffee Estates & Hills' },
    { id: 4, url: 'https://images.unsplash.com/photo-1590050752117-238cb0612b1b?auto=format&fit=crop&w=800&q=80', caption: 'Gokarna Om Beach Sunset' },
  ]);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const newPhoto = {
        id: Date.now(),
        url: URL.createObjectURL(file),
        caption: `${file.name} [Local Preview Only]`,
      };
      setPhotos([newPhoto, ...photos]);
    }
  };

  return (
    <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Image size={20} style={{ color: 'var(--primary-color)' }} />
          <h4 style={{ fontSize: '1rem' }}>Shared Trip Photo Vault <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>[Local Preview Only]</span></h4>
        </div>
        <label className="btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer' }}>
          <Upload size={14} /> Upload Memory
          <input type="file" accept="image/*" onChange={handleUpload} style={{ display: 'none' }} />
        </label>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.75rem' }}>
        {photos.map((p) => (
          <div key={p.id} onClick={() => setSelectedPhoto(p)} style={{ position: 'relative', height: '100px', borderRadius: '8px', overflow: 'hidden', cursor: 'pointer', border: '1px solid var(--border-color)' }}>
            <img src={p.url} alt={p.caption} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        ))}
      </div>

      {selectedPhoto && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
          <div style={{ position: 'relative', maxWidth: '80vw', maxHeight: '80vh', textAlign: 'center' }}>
            <button onClick={() => setSelectedPhoto(null)} style={{ position: 'absolute', top: '-2.5rem', right: 0, background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
              <X size={24} />
            </button>
            <img src={selectedPhoto.url} alt={selectedPhoto.caption} style={{ maxWidth: '100%', maxHeight: '75vh', borderRadius: '8px', border: '2px solid var(--primary-color)' }} />
            <p style={{ color: '#fff', marginTop: '0.5rem', fontSize: '0.9rem' }}>{selectedPhoto.caption}</p>
          </div>
        </div>
      )}
    </div>
  );
}
