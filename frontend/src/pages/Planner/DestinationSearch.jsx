import React, { useState } from 'react';
import { Search } from 'lucide-react';

export default function DestinationSearch({ onSearch }) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim() && onSearch) {
      onSearch(query.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ position: 'relative', width: '100%' }}>
      <Search size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
      <input
        type="text"
        className="form-input"
        style={{ paddingLeft: '40px', width: '100%' }}
        placeholder="Search destination city..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
    </form>
  );
}
