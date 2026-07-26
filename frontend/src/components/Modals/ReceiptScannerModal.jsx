import React, { useState } from 'react';
import { Camera, Upload, Check, X, Sparkles, Loader2 } from 'lucide-react';
import axios from 'axios';

export default function ReceiptScannerModal({ tripId, isOpen, onClose, onScanComplete }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isScanning, setIsScanning] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleScan = async () => {
    if (!file) return;
    setIsScanning(true);

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', file);

      const res = await axios.post(`/api/trips/${tripId}/expenses/ocr`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: token ? `Bearer ${token}` : '',
        },
      });

      if (onScanComplete) {
        onScanComplete(res.data);
      }
      onClose();
    } catch (err) {
      console.error('OCR Error:', err);
      alert('Failed to scan receipt. Please check file format.');
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div className="glass-card" style={{ padding: '2rem', width: '90%', maxWidth: '480px', display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Camera size={22} style={{ color: 'var(--primary-color)' }} />
          <h3 style={{ fontSize: '1.25rem' }}>Receipt AI OCR Scanner</h3>
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Snap or upload a receipt photo. Google Gemini AI will extract the amount, description, and expense category.
        </p>

        <div style={{ border: '2px dashed var(--border-color)', borderRadius: '12px', padding: '1.5rem', textAligned: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
          {preview ? (
            <img src={preview} alt="Receipt preview" style={{ maxHeight: '180px', borderRadius: '8px', objectFit: 'contain' }} />
          ) : (
            <>
              <Upload size={32} style={{ color: 'var(--secondary-color)' }} />
              <span style={{ fontSize: '0.875rem' }}>Click or drop receipt image here</span>
            </>
          )}
          <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} id="receipt-upload" />
          <label htmlFor="receipt-upload" className="btn-secondary" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>
            Choose File
          </label>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button onClick={onClose} className="btn-secondary" style={{ padding: '0.6rem 1rem' }}>Cancel</button>
          <button onClick={handleScan} className="btn-primary" disabled={!file || isScanning} style={{ padding: '0.6rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {isScanning ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            {isScanning ? 'Extracting...' : 'Scan Receipt with AI'}
          </button>
        </div>
      </div>
    </div>
  );
}
