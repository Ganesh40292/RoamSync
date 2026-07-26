import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Auth.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card glass-card animate-slide-up">
        <div className="auth-header">
          <h1>Forgot Password</h1>
          <p>We'll send you reset instructions</p>
        </div>

        {submitted ? (
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <p style={{ color: 'var(--success)', fontWeight: 500 }}>
              Reset link sent! Please check your email inbox at {email}.
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
            <button type="submit" className="btn-primary">Send Verification Code</button>
          </form>
        )}

        <div className="auth-footer">
          Remember your password? <Link to="/login">Login</Link>
        </div>
      </div>
    </div>
  );
}
