import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { User, Mail, Shield, Lock, KeyRound, ShieldAlert, CheckCircle, RefreshCw, Compass, Award, Calendar, DollarSign, Phone, FileText } from 'lucide-react';
import AchievementBadges from '../../components/Profile/AchievementBadges';
import { useToast } from '../../components/Common/useToast';
import './Profile.css';

const AVATARS = ['✈️', '⛰️', '🏝️', '🧳', '🏕️', '🏰', '🚀', '⛵', '🌅', '🏛️'];

export default function UserProfile() {
  const { user } = useSelector((state) => state.auth);
  const { addToast } = useToast() || {};
  
  const [selectedAvatar, setSelectedAvatar] = useState('✈️');
  const [fullName, setFullName] = useState(user?.fullName || 'Alex Traveler');
  const [email, setEmail] = useState(user?.email || 'alex.traveler@tripsync.ai');
  const [phone, setPhone] = useState(user?.phone || '+1 (555) 234-5678');
  const [bio, setBio] = useState('Passionate solo & group traveler exploring world cultures and hidden gems!');
  const [profileStatus, setProfileStatus] = useState(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState(null);

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    setProfileStatus({ type: 'success', message: 'Profile details saved successfully!' });
    if (addToast) addToast('Profile details updated successfully!', 'success');
    setTimeout(() => setProfileStatus(null), 4000);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (!currentPassword) {
      setPasswordStatus({ type: 'error', message: 'Please enter your current password.' });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordStatus({ type: 'error', message: 'New password must be at least 6 characters long.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordStatus({ type: 'error', message: 'New passwords do not match.' });
      return;
    }

    setPasswordStatus({ type: 'success', message: 'Password updated successfully!' });
    if (addToast) addToast('Password changed successfully!', 'success');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setPasswordStatus(null), 4000);
  };

  return (
    <div className="profile-layout-container animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 1. Header Banner & Traveler Stats Counter */}
      <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', boxShadow: '0 0 20px rgba(124, 58, 237, 0.4)' }}>
            {selectedAvatar}
          </div>
          <div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{fullName || user?.username || 'Traveler'}</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>@{user?.username || 'username'} • {bio}</p>
            <span className="profile-badge" style={{ marginTop: '0.5rem', display: 'inline-block' }}>{user?.role || 'ROLE_USER'}</span>
          </div>
        </div>

        {/* Avatar Customization Selector */}
        <div>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>Select Custom Avatar Emoji</label>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {AVATARS.map((av) => (
              <button
                key={av}
                type="button"
                onClick={() => setSelectedAvatar(av)}
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '8px',
                  border: selectedAvatar === av ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
                  background: selectedAvatar === av ? 'rgba(124, 58, 237, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                  fontSize: '1.25rem',
                  cursor: 'pointer',
                }}
              >
                {av}
              </button>
            ))}
          </div>
        </div>

        {/* Live Traveler Stats Counter Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.875rem', borderRadius: '8px', textAlign: 'center' }}>
            <span style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--primary-color)', display: 'block' }}>3</span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Trips Planned</span>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.875rem', borderRadius: '8px', textAlign: 'center' }}>
            <span style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--secondary-color)', display: 'block' }}>$1,240.50</span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Expenses Logged</span>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.875rem', borderRadius: '8px', textAlign: 'center' }}>
            <span style={{ fontSize: '1.35rem', fontWeight: 700, color: '#10b981', display: 'block' }}>14</span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Days Traveled</span>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.875rem', borderRadius: '8px', textAlign: 'center' }}>
            <span style={{ fontSize: '1.35rem', fontWeight: 700, color: '#f59e0b', display: 'block' }}>8</span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Places Pinned</span>
          </div>
        </div>
      </div>

      {/* Gamification Travel Badges Component */}
      <AchievementBadges />

      {/* 2. Side-by-side Action Grids */}
      <div className="profile-grid-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        
        {/* Card A: Account Details */}
        <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Account Profile</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Manage your personal details and app settings</p>
          </div>

          {profileStatus && (
            <div className={`status-alert ${profileStatus.type === 'success' ? 'status-success' : 'status-error'}`}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle size={16} />
                <span>{profileStatus.message}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleProfileSubmit} className="profile-form-section" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="input-group">
              <label className="input-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">Phone Number</label>
              <input
                type="text"
                className="form-input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Traveler Bio</label>
              <textarea
                className="form-input"
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>

            <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem' }}>Save Profile Changes</button>
          </form>
        </div>

        {/* Card B: Security & Password Options */}
        <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Security Settings</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Modify password options to keep your account safe</p>
          </div>

          {passwordStatus && (
            <div className={`status-alert ${passwordStatus.type === 'success' ? 'status-success' : 'status-error'}`}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {passwordStatus.type === 'success' ? <CheckCircle size={16} /> : <ShieldAlert size={16} />}
                <span>{passwordStatus.message}</span>
              </div>
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="profile-form-section" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="input-group">
              <label className="input-label">Current Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">New Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="At least 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">Confirm New Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn-primary" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
              <RefreshCw size={16} />
              Update Password
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
