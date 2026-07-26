import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Compass, Sparkles, Share2, DollarSign } from 'lucide-react';
import IntroAnimation from '../../components/IntroAnimation';
import './Home.css';

const COOL_LINES = [
  "The mountains are calling, and your sync group is answering.",
  "Collaborating today, wandering tomorrow, remembering forever.",
  "Syncing budgets, sharing dreams, mapping paths with precision.",
  "Unveiling Karnataka’s hidden jewels, one coordinated pin at a time.",
  "Where artificial intelligence meets real-world adventure.",
  "Leave the logistics to our AI, keep the wonder for yourself.",
  "Your ultimate canvas for group expeditions, fully synced.",
  "Discover the heritage, beaches, and mist-covered hills of Karnataka."
];

export default function Home() {
  const [tagline, setTagline] = useState("");
  const [showIntro, setShowIntro] = useState(() => {
    // Play intro only once per session
    return sessionStorage.getItem('hasSeenIntro') !== 'true';
  });

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * COOL_LINES.length);
    setTagline(COOL_LINES[randomIndex]);
  }, []);

  const handleIntroComplete = () => {
    sessionStorage.setItem('hasSeenIntro', 'true');
    setShowIntro(false);
  };

  return (
    <div className="home-container animate-fade-in">
      {showIntro && <IntroAnimation onComplete={handleIntroComplete} />}
      
      {/* 3D Aurora Background elements */}
      <div className="aurora-wrapper">
        <div className="aurora-blob aurora-1"></div>
        <div className="aurora-blob aurora-2"></div>
        <div className="aurora-blob aurora-3"></div>
      </div>

      <header style={{ padding: '1.5rem 2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
          <Compass size={24} style={{ color: 'var(--primary-color)' }} />
          <span>TripSync AI 🌍</span>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link to="/login" className="btn-secondary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem' }}>Login</Link>
          <Link to="/register" className="btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem' }}>Sign Up</Link>
        </div>
      </header>

      <section className="hero-section" style={{ position: 'relative', zIndex: 10 }}>
        <h1 className="hero-title animate-slide-up">
          Smart Collaborative <br />
          <span style={{ color: 'var(--primary-color)' }}>Travel Planning Platform</span>
        </h1>
        
        {/* Dynamic tagline container */}
        <p className="hero-subtitle animate-slide-up cool-tagline">
          "{tagline}"
        </p>

        <p className="hero-subtitle animate-slide-up" style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>
          Map customized day routines, synchronize shared budgets with automatic split calculations, generate intelligent itineraries using AI, and chat with friends in real time.
        </p>

        <div className="cta-group animate-slide-up">
          <Link to="/register" className="btn-primary animate-pulse-glow" style={{ padding: '0.75rem 2rem' }}>Get Started Free</Link>
          <Link to="/login" className="btn-secondary" style={{ padding: '0.75rem 2rem' }}>Explore Platform</Link>
        </div>
      </section>

      <section style={{ padding: '4rem 2.5rem', maxWidth: '1200px', margin: '0 auto', width: '100%', position: 'relative', zIndex: 10 }}>
        <h2 style={{ textAlign: 'center', marginBottom: '3rem', fontSize: '2rem' }}>Features Crafted For Seamless Journeys</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
          {[
            {
              title: 'AI Smart Itinerary',
              desc: 'Resolve coordinates, select styles, choose interests, and request rich schedules from Spring AI instantly.',
              icon: Sparkles,
            },
            {
              title: 'Collaborative Groups',
              desc: 'Invite friends, coordinate days, and chat inside active STOMP channels over live WebSockets.',
              icon: Share2,
            },
            {
              title: 'Ledger Split Calc',
              desc: 'Log expenses, view visual category charts, and balance transactions instantly.',
              icon: DollarSign,
            },
          ].map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div key={idx} className="glass-card feature-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '8px', background: 'rgba(124, 58, 237, 0.1)', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--primary-color)' }}>
                  <Icon size={20} />
                </div>
                <h3 style={{ fontSize: '1.25rem' }}>{feat.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.5 }}>{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      <footer style={{ marginTop: 'auto', borderTop: '1px solid var(--border-color)', padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem', position: 'relative', zIndex: 10 }}>
        &copy; {new Date().getFullYear()} TripSync AI. Crafted for pair travelers worldwide.
      </footer>
    </div>
  );
}
