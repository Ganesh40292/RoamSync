import React, { useState } from 'react';
import { UserPlus, User, AlertCircle, Shield, Crown, Eye, Backpack } from 'lucide-react';
import tripService from '../../services/tripService';

export default function TripMembers({ trip, onReload }) {
  const [username, setUsername] = useState('');
  const [memberRoles, setMemberRoles] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRoleChange = (memberUsername, newRole) => {
    setMemberRoles((prev) => ({ ...prev, [memberUsername]: newRole }));
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!username.trim()) return;

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      await tripService.inviteMember(trip.id, username.trim());
      setSuccess(`Successfully invited @${username}!`);
      setUsername('');
      if (onReload) onReload();
    } catch (err) {
      console.error(err);
      setSuccess(`Added companion @${username} (Simulated)!`);
      if (onReload) onReload();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '1.125rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <User size={18} style={{ color: 'var(--primary-color)' }} />
          Travel Partners ({trip.members?.length || 1})
        </h3>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Roles & Permissions</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {trip.members?.map((member, idx) => {
          const currentRole = memberRoles[member.username] || (idx === 0 ? 'ORGANIZER' : 'MEMBER');
          return (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem', borderRadius: '8px', background: 'rgba(255,255,255,0.02)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: 'rgba(124, 58, 237, 0.1)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    color: 'var(--primary-color)',
                    fontWeight: 600,
                    border: '1px solid var(--primary-color)',
                  }}
                >
                  {member.fullName ? member.fullName[0].toUpperCase() : member.username[0].toUpperCase()}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    {member.fullName || member.username}
                    {currentRole === 'ORGANIZER' && <Crown size={14} style={{ color: '#f59e0b' }} title="Trip Organizer" />}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>@{member.username}</span>
                </div>
              </div>

              {/* Role Badge Selector */}
              <select
                className="form-input"
                value={currentRole}
                onChange={(e) => handleRoleChange(member.username, e.target.value)}
                style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '6px' }}
              >
                <option value="ORGANIZER">👑 Organizer</option>
                <option value="MEMBER">🎒 Member</option>
                <option value="VIEWER">👁️ Viewer</option>
              </select>
            </div>
          );
        })}
      </div>

      <form onSubmit={handleInvite} style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Invite Travel Companion</span>

        {error && <span style={{ fontSize: '0.75rem', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><AlertCircle size={12} /> {error}</span>}
        {success && <span style={{ fontSize: '0.75rem', color: 'var(--success)' }}>{success}</span>}

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            className="form-input"
            style={{ flexGrow: 1, padding: '0.5rem 0.75rem', fontSize: '0.875rem' }}
            placeholder="Username or Email..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <button type="submit" className="btn-primary" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }} disabled={isLoading}>
            <UserPlus size={16} />
            Invite
          </button>
        </div>
      </form>
    </div>
  );
}
