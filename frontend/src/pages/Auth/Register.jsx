import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../redux/slices/authSlice';
import authService from '../../services/authService';
import validators from '../../utils/validators';
import './Auth.css';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const isFormValid = acceptedTerms && acceptedPrivacy;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!acceptedTerms || !acceptedPrivacy) {
      setError('You must accept both the Terms of Service and Privacy Policy to register.');
      return;
    }

    if (!username || !email || !fullName || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (!validators.isValidEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!validators.isValidPassword(password)) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const data = await authService.register({ username, email, fullName, password });
      dispatch(setCredentials(data));
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Registration failed. Try a different username or email.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card glass-card animate-slide-up">
        <div className="auth-header">
          <h1>Get Started</h1>
          <p>Create an account to plan with friends</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <label className="input-label">Username</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. johndoe"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Email</label>
            <input
              type="email"
              className="form-input"
              placeholder="e.g. john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Full Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Confirm Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          {/* Mandatory Legal Checkboxes */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginTop: '0.5rem', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                style={{ marginTop: '2px', cursor: 'pointer', accentColor: 'var(--primary-color)' }}
              />
              <span>
                I agree to the <Link to="/terms" target="_blank" style={{ color: 'var(--primary-color)', fontWeight: 600, textDecoration: 'underline' }}>Terms of Service</Link>
              </span>
            </label>

            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={acceptedPrivacy}
                onChange={(e) => setAcceptedPrivacy(e.target.checked)}
                style={{ marginTop: '2px', cursor: 'pointer', accentColor: 'var(--secondary-color)' }}
              />
              <span>
                I agree to the <Link to="/privacy" target="_blank" style={{ color: 'var(--secondary-color)', fontWeight: 600, textDecoration: 'underline' }}>Privacy Policy</Link>
              </span>
            </label>
          </div>

          <button
            type="submit"
            className="btn-primary animate-pulse-glow"
            disabled={isLoading || !isFormValid}
            style={{
              opacity: isFormValid ? 1 : 0.5,
              cursor: isFormValid ? 'pointer' : 'not-allowed',
              marginTop: '0.5rem',
            }}
            title={!isFormValid ? 'Please accept both Terms of Service and Privacy Policy to register' : 'Click to register'}
          >
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Login</Link>
        </div>
      </div>
    </div>
  );
}
