import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowLeft, Lock, Eye, Database, Cpu, UserCheck } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--dark-bg, #09090b)', color: 'var(--text-primary)', padding: '2rem 1rem', display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '850px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Top Back Link */}
        <Link to="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary-color)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>
          <ArrowLeft size={16} /> Back to Registration
        </Link>

        {/* Header Banner */}
        <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Shield size={28} style={{ color: 'var(--secondary-color)' }} />
            <div>
              <h1 style={{ fontSize: '1.75rem', margin: 0 }}>Privacy Policy</h1>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Last Updated: July 26, 2026 • Effective Date: Immediately</span>
            </div>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5, margin: 0 }}>
            At <strong>TripSync AI</strong>, your privacy and data security are our highest priorities. This Privacy Policy details how we collect, process, store, and protect your personal information when using our application.
          </p>
        </div>

        {/* Legal Sections */}
        <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.75rem', lineHeight: 1.6, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          
          <section>
            <h3 style={{ color: 'var(--text-primary)', fontSize: '1.2rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Eye size={18} style={{ color: 'var(--secondary-color)' }} /> 1. Information We Collect
            </h3>
            <p>We collect personal information necessary to deliver seamless travel planning services, including:</p>
            <ul style={{ paddingLeft: '1.25rem', marginTop: '0.4rem' }}>
              <li><strong>Account Credentials:</strong> Full name, username, email address, phone number, and hashed passwords.</li>
              <li><strong>Trip & Travel Data:</strong> Itinerary details, travel dates, pinned locations, landmark preferences, and member lists.</li>
              <li><strong>Financial Logs:</strong> Shared expense records, payment splits, and receipt scan data.</li>
              <li><strong>Chat & Communication:</strong> Group chat messages, direct 1-on-1 messages, voice note audio files, and shared attachments.</li>
            </ul>
          </section>

          <section>
            <h3 style={{ color: 'var(--text-primary)', fontSize: '1.2rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Cpu size={18} style={{ color: 'var(--primary-color)' }} /> 2. Third-Party AI & Map Data Processing
            </h3>
            <p>
              When you interact with our AI Concierge, destination prompts are securely processed using AI providers (including Google Gemini AI API) to generate personalized travel recommendations. We do not sell your personal data or chat logs to third-party advertisers. Map rendering is powered by OpenStreetMap & Leaflet.
            </p>
          </section>

          <section>
            <h3 style={{ color: 'var(--text-primary)', fontSize: '1.2rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Database size={18} style={{ color: '#10b981' }} /> 3. Local Storage & Security Safeguards
            </h3>
            <p>
              We employ industry-standard encryption protocols (JWT authentication, HTTPS/TLS data in transit, and BCrypt password hashing) to protect your account. Preferences such as dark/light theme, custom color accents, and authentication tokens are stored securely in browser `localStorage`.
            </p>
          </section>

          <section>
            <h3 style={{ color: 'var(--text-primary)', fontSize: '1.2rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <UserCheck size={18} style={{ color: '#f59e0b' }} /> 4. Data Retention & User Rights
            </h3>
            <p>
              You maintain full control over your personal information. You have the right to inspect, update, or request permanent deletion of your account, trip history, and uploaded media attachments at any time by visiting your Profile settings.
            </p>
          </section>

          <section>
            <h3 style={{ color: 'var(--text-primary)', fontSize: '1.2rem', marginBottom: '0.5rem' }}>
              5. Contact Information
            </h3>
            <p>
              If you have any questions or privacy concerns regarding this policy, please reach out to our privacy compliance team at <strong>privacy@tripsync.ai</strong>.
            </p>
          </section>

        </div>

        {/* Footer Navigation */}
        <div style={{ textAlign: 'center', padding: '1rem 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          © 2026 TripSync AI. All Rights Reserved. • <Link to="/terms" style={{ color: 'var(--primary-color)' }}>Terms of Service</Link>
        </div>

      </div>
    </div>
  );
}
