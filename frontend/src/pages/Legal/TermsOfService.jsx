import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowLeft, FileText, CheckCircle2, AlertTriangle, Scale, Lock } from 'lucide-react';

export default function TermsOfService() {
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
            <FileText size={28} style={{ color: 'var(--primary-color)' }} />
            <div>
              <h1 style={{ fontSize: '1.75rem', margin: 0 }}>Terms of Service</h1>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Last Updated: July 26, 2026 • Effective Date: Immediately</span>
            </div>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5, margin: 0 }}>
            Welcome to <strong>TripSync AI</strong>. Please carefully read these Terms of Service before accessing or using our collaborative travel planning, expense tracking, AI concierge, and chat services.
          </p>
        </div>

        {/* Legal Sections */}
        <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.75rem', lineHeight: 1.6, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          
          <section>
            <h3 style={{ color: 'var(--text-primary)', fontSize: '1.2rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Scale size={18} style={{ color: 'var(--primary-color)' }} /> 1. Acceptance of Terms
            </h3>
            <p>
              By creating an account, checking the mandatory acceptance boxes during registration, or accessing the TripSync AI platform, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to all terms, you are prohibited from using the platform.
            </p>
          </section>

          <section>
            <h3 style={{ color: 'var(--text-primary)', fontSize: '1.2rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Lock size={18} style={{ color: 'var(--secondary-color)' }} /> 2. User Account Security & Eligibility
            </h3>
            <p>
              You must be at least 18 years old or the age of legal majority in your jurisdiction to create an account. You are responsible for maintaining the confidentiality of your account password and for all activities that occur under your account. You agree to notify TripSync AI immediately of any unauthorized access.
            </p>
          </section>

          <section>
            <h3 style={{ color: 'var(--text-primary)', fontSize: '1.2rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={18} style={{ color: '#10b981' }} /> 3. Trip Planning & Collaborative Expense Ledger
            </h3>
            <p>
              TripSync AI provides collaborative travel management tools, including shared itineraries, group chat rooms, and financial debt calculation ledgers. Users are solely responsible for verifying the accuracy of shared expense logs and financial settlements agreed upon with travel partners. TripSync AI is not a banking institution or payment processor.
            </p>
          </section>

          <section>
            <h3 style={{ color: 'var(--text-primary)', fontSize: '1.2rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Shield size={18} style={{ color: '#f59e0b' }} /> 4. AI Concierge & Content Disclaimer
            </h3>
            <p>
              Our AI Concierge service utilizes artificial intelligence models (including Google Gemini AI) to generate travel itineraries, local recommendations, and budget projections. All AI-generated suggestions are provided for informational and planning purposes only. TripSync AI does not guarantee venue availability, operating hours, ticket prices, or safety conditions of recommended destinations.
            </p>
          </section>

          <section>
            <h3 style={{ color: 'var(--text-primary)', fontSize: '1.2rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertTriangle size={18} style={{ color: '#ef4444' }} /> 5. Acceptable Use & Prohibited Conduct
            </h3>
            <p>
              You agree not to upload, post, or transmit any content that is unlawful, defamatory, abusive, invasive of privacy, or infringes intellectual property rights. Unauthorized automated scraping, reverse engineering, or disruption of WebSocket connections is strictly prohibited.
            </p>
          </section>

          <section>
            <h3 style={{ color: 'var(--text-primary)', fontSize: '1.2rem', marginBottom: '0.5rem' }}>
              6. Limitation of Liability
            </h3>
            <p>
              To the maximum extent permitted by law, TripSync AI, its officers, employees, and suppliers shall not be liable for any direct, indirect, incidental, or consequential damages resulting from travel cancellations, venue closures, financial disputes between travel partners, or service interruptions.
            </p>
          </section>

          <section>
            <h3 style={{ color: 'var(--text-primary)', fontSize: '1.2rem', marginBottom: '0.5rem' }}>
              7. Governing Law & Modifications
            </h3>
            <p>
              These Terms shall be governed by and construed in accordance with applicable laws. We reserve the right to modify these Terms at any time. Continued use of the platform following published changes constitutes your binding acceptance.
            </p>
          </section>

        </div>

        {/* Footer Navigation */}
        <div style={{ textAlign: 'center', padding: '1rem 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          © 2026 TripSync AI. All Rights Reserved. • <Link to="/privacy" style={{ color: 'var(--primary-color)' }}>Privacy Policy</Link>
        </div>

      </div>
    </div>
  );
}
