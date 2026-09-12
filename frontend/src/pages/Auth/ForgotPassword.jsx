import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Auth.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError('');
    try {
      const res = await axios.post('/api/auth/forgot-password', { email: email.trim() });
      setMessage(res.data?.message || 'If this email is registered, a password reset link has been sent.');
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to request password reset. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card glass-card animate-slide-up">
        <div className="auth-header">
          <h1>Forgot Password</h1>
          <p>We'll send you reset instructions</p>
        </div>

        {error && <div className="error-message" style={{ marginBottom: '1rem' }}>{error}</div>}

        {submitted ? (
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <p style={{ color: 'var(--success)', fontWeight: 500 }}>
              {message}
            </p>
            <Link to="/login" className="btn-primary">Return to Sign In</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="input-group">
              <label className="input-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                placeholder="Enter registered email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Sending Request...' : 'Send Reset Link'}
            </button>
          </form>
        )}

        <div className="auth-footer">
          Remember your password? <Link to="/login">Login</Link>
        </div>
      </div>
    </div>
  );
}
