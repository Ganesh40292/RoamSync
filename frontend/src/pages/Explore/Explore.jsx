import React, { useState } from 'react';
import { Compass, Search, MapPin, CloudSun, Star, Thermometer, Maximize2 } from 'lucide-react';
import ImageLightboxModal from '../../components/Modals/ImageLightboxModal';

const CATEGORIES = ['ALL', 'HERITAGE', 'SCENIC', 'COASTAL', 'WILDLIFE', 'URBAN'];

const DEFAULT_FALLBACK = 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=800&q=80';

export default function Explore() {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [unit, setUnit] = useState('C'); // 'C' or 'F'
  const [lightboxImage, setLightboxImage] = useState(null);
  const [lightboxTitle, setLightboxTitle] = useState('');

  const spots = [
    {
      name: 'Mysore Palace, Mysore',
      type: 'HERITAGE',
      rating: 4.9,
      tempC: 26,
      image: 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=800&q=80',
      fallbackImage: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=800&q=80',
      desc: 'The magnificent palace residency of the Wadiyar dynasty in Mysore, world-famous for its illuminated golden architecture.',
    },
    {
      name: 'Hampi Stone Chariot & Ruins',
      type: 'HERITAGE',
      rating: 4.9,
      tempC: 31,
      image: 'https://images.unsplash.com/photo-1600100397608-f010e42ed97c?auto=format&fit=crop&w=800&q=80',
      fallbackImage: 'https://images.unsplash.com/photo-1600100397608-f010e42ed97c?auto=format&fit=crop&w=800&q=80',
      desc: 'UNESCO World Heritage site featuring the famous stone chariot, Virupaksha temple, and boulder-strewn hills.',
    },
    {
      name: 'Coorg Coffee Hills & Abbey Falls',
      type: 'SCENIC',
      rating: 4.9,
      tempC: 21,
      image: 'https://images.unsplash.com/photo-1588598126702-86927bf49a0d?auto=format&fit=crop&w=800&q=80',
      fallbackImage: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
      desc: 'Misty hill station surrounded by sprawling coffee plantations, Abbey Falls, and scenic trekking routes in Kodagu.',
    },
    {
      name: 'Chikmagalur & Mullayanagiri Peak',
      type: 'SCENIC',
      rating: 4.8,
      tempC: 19,
      image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
      fallbackImage: 'https://images.unsplash.com/photo-1588598126702-86927bf49a0d?auto=format&fit=crop&w=800&q=80',
      desc: 'Western Ghats peak landscape, Mullayanagiri, lush coffee estates, and Hebbe Falls in Chikmagalur.',
    },
    {
      name: 'Gokarna Om Beach & Coast',
      type: 'COASTAL',
      rating: 4.8,
      tempC: 28,
      image: 'https://images.unsplash.com/photo-1590050752117-238cb0612b1b?auto=format&fit=crop&w=800&q=80',
      fallbackImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
      desc: 'Pristine Om-shaped beach, tranquil Arabian sea waters, cliff walks, and Mahabaleshwar temple.',
    },
    {
      name: 'Murudeshwar Shiva Statue',
      type: 'COASTAL',
      rating: 4.9,
      tempC: 29,
      image: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=800&q=80',
      fallbackImage: 'https://images.unsplash.com/photo-1590050752117-238cb0612b1b?auto=format&fit=crop&w=800&q=80',
      desc: 'World’s second-tallest Lord Shiva statue standing tall on Kanduka Hill overlooking the sea.',
    },
    {
      name: 'Jog Falls, Shimoga',
      type: 'SCENIC',
      rating: 4.8,
      tempC: 23,
      image: 'https://images.unsplash.com/photo-1598462038597-d86b62719c8d?auto=format&fit=crop&w=800&q=80',
      fallbackImage: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
      desc: 'Spectacular 253-meter plunge waterfall on the Sharavathi river surrounded by dense evergreen rainforest.',
    },
    {
      name: 'Bandipur & Kabini Wildlife Safari',
      type: 'WILDLIFE',
      rating: 4.8,
      tempC: 27,
      image: 'https://images.unsplash.com/photo-1534567153574-2b12153a87f0?auto=format&fit=crop&w=800&q=80',
      fallbackImage: 'https://images.unsplash.com/photo-1588598126702-86927bf49a0d?auto=format&fit=crop&w=800&q=80',
      desc: 'Tiger reserve and wildlife sanctuary offering boat safaris, wild elephant sightings, and natural flora.',
    },
    {
      name: 'Badami Sandstone Cave Temples',
      type: 'HERITAGE',
      rating: 4.7,
      tempC: 30,
      image: 'https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=800&q=80',
      fallbackImage: 'https://images.unsplash.com/photo-1600100397608-f010e42ed97c?auto=format&fit=crop&w=800&q=80',
      desc: 'Sixth-century Chalukyan rock-cut sandstone cave temples cut into red sandstone cliffs above Agastya Lake.',
    },
    {
      name: 'Bangalore Palace, Bengaluru',
      type: 'URBAN',
      rating: 4.7,
      tempC: 24,
      image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=800&q=80',
      fallbackImage: 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=800&q=80',
      desc: 'Tudor-style royal estate in the heart of Bengaluru city with wooden carvings and lush grounds.',
    },
    {
      name: 'St. Mary’s Island, Udupi',
      type: 'COASTAL',
      rating: 4.8,
      tempC: 28,
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
      fallbackImage: 'https://images.unsplash.com/photo-1590050752117-238cb0612b1b?auto=format&fit=crop&w=800&q=80',
      desc: 'Geological monument featuring unique hexagonal basaltic rock formations and crystal clear waters.',
    },
  ];

  const formatTemp = (celsius) => {
    if (unit === 'F') {
      const f = Math.round((celsius * 9) / 5 + 32);
      return `${f}°F`;
    }
    return `${celsius}°C`;
  };

  const handleImgError = (e, fallback) => {
    e.target.src = fallback || DEFAULT_FALLBACK;
  };

  const filtered = spots.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(query.toLowerCase()) || s.desc.toLowerCase().includes(query.toLowerCase());
    if (activeCategory === 'ALL') return matchesSearch;
    return matchesSearch && s.type === activeCategory;
  });

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>Explore Karnataka</span> 📸
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Browse top travel destinations in Karnataka with real travel photography
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => setUnit(unit === 'C' ? 'F' : 'C')}
            className="btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
          >
            <Thermometer size={14} style={{ color: 'var(--secondary-color)' }} /> Unit: °{unit}
          </button>

          <div style={{ position: 'relative', width: '100%', maxWidth: '280px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '36px', width: '100%', fontSize: '0.85rem' }}
              placeholder="Search Mysore, Hampi, Coorg..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Category Filters Bar */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={`btn-secondary ${activeCategory === cat ? 'animate-pulse-glow' : ''}`}
            style={{
              padding: '0.4rem 0.98rem',
              fontSize: '0.78rem',
              border: activeCategory === cat ? '1px solid var(--primary-color)' : '1px solid var(--border-color)',
              background: activeCategory === cat ? 'rgba(124, 58, 237, 0.15)' : 'rgba(255, 255, 255, 0.02)',
              color: activeCategory === cat ? '#fff' : 'var(--text-secondary)',
              fontWeight: activeCategory === cat ? '600' : 'normal',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {filtered.map((spot, idx) => (
          <div key={idx} className="glass-card animate-slide-up" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div
              onClick={() => {
                setLightboxImage(spot.image);
                setLightboxTitle(spot.name);
              }}
              style={{ height: '170px', position: 'relative', width: '100%', background: 'rgba(255,255,255,0.03)', cursor: 'pointer' }}
            >
              <img
                src={spot.image}
                alt={spot.name}
                onError={(e) => handleImgError(e, spot.fallbackImage)}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <span style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', padding: '0.2rem 0.5rem', borderRadius: '12px', fontSize: '0.75rem', color: '#fcd34d', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                <Star size={12} fill="#fcd34d" /> {spot.rating}
              </span>
              <span style={{ position: 'absolute', bottom: '10px', right: '10px', background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', padding: '0.25rem', borderRadius: '50%', color: '#fff' }}>
                <Maximize2 size={14} />
              </span>
            </div>

            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', flexGrow: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--primary-color)', fontWeight: 600, textTransform: 'uppercase' }}>{spot.type}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--secondary-color)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                  <CloudSun size={12} /> {formatTemp(spot.tempC)}
                </span>
              </div>

              <h3 style={{ fontSize: '1.1rem' }}>{spot.name}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.4 }}>{spot.desc}</p>
              
              <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--text-muted)', paddingTop: '0.5rem' }}>
                <MapPin size={12} style={{ color: 'var(--secondary-color)' }} />
                <span>Karnataka Destination</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <ImageLightboxModal
        isOpen={!!lightboxImage}
        onClose={() => setLightboxImage(null)}
        imageUrl={lightboxImage}
        title={lightboxTitle}
      />
    </div>
  );
}
