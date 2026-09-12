import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import './Auth.css';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setError('Invalid or missing password reset token. Please request a new link.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await axios.post('/api/auth/reset-password', {
        token,
        newPassword: password,
      });

      setSubmitted(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to reset password. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card glass-card animate-slide-up">
        <div className="auth-header">
          <h1>Reset Password</h1>
          <p>Create a secure new password</p>
        </div>

        {error && <div className="error-message" style={{ marginBottom: '1rem' }}>{error}</div>}
        {submitted && (
          <div style={{ color: 'var(--success)', textAlign: 'center', marginBottom: '1rem' }}>
            Password successfully reset! Redirecting to login...
          </div>
        )}

        {!token && (
          <div style={{ textAlign: 'center', margin: '1rem 0' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              No reset token detected in URL. Please use the link provided in your email.
            </p>
            <Link to="/forgot-password" className="btn-secondary" style={{ display: 'inline-block', marginTop: '1rem' }}>
              Request New Link
            </Link>
          </div>
        )}

        {token && !submitted && (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="input-group">
              <label className="input-label">New Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">Confirm New Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Updating Password...' : 'Update Password'}
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
