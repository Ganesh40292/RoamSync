import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/slices/authSlice';
import { Compass, Calendar, DollarSign, MessageSquare, User, LogOut, Grid, Search, Keyboard } from 'lucide-react';
import ThemeToggle from '../components/Common/ThemeToggle';
import ColorThemePicker from '../components/Common/ColorThemePicker';
import ParticleBackground from '../components/Common/ParticleBackground';
import FloatingDock from '../components/Common/FloatingDock';
import PageTransition from '../components/Common/PageTransition';
import KeyboardShortcutsModal from '../components/Modals/KeyboardShortcutsModal';
import NotificationCenter from '../components/Notifications/NotificationCenter';
import './Layout.css';

export default function MainLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        // Ignore if user is typing in an input
        if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) return;
        e.preventDefault();
        setIsShortcutsOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: Grid },
    { name: 'Trips', path: '/trips', icon: Calendar },
    { name: 'Expenses', path: '/expenses', icon: DollarSign },
    { name: 'Chat', path: '/chat', icon: MessageSquare },
    { name: 'Explore', path: '/explore', icon: Compass },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <div className="layout-container" style={{ position: 'relative' }}>
      {/* Interactive Constellation Particle Canvas */}
      <ParticleBackground />

      {/* Sidebar Navigation */}
      <aside className="sidebar glass-card" style={{ zIndex: 10 }}>
        <div className="sidebar-brand">
          <h2>RoamMate 🌍</h2>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link ${isActive ? 'active' : ''}`}
              >
                <Icon size={20} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          {user && (
            <div className="user-badge">
              <img
                src={user.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                alt="Avatar"
                className="user-avatar"
              />
              <div className="user-details hide-on-mobile">
                <span className="user-name">{user.fullName || user.username}</span>
                <span className="user-role">{user.role || 'Traveller'}</span>
              </div>
            </div>
          )}
          <button onClick={handleLogout} className="logout-btn">
            <LogOut size={20} />
            <span className="hide-on-mobile">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content" style={{ zIndex: 10, paddingBottom: '5rem' }}>
        {!isOnline && (
          <div style={{ background: '#b45309', color: '#fef3c7', padding: '0.45rem 1rem', borderRadius: '10px', marginBottom: '1rem', fontSize: '0.8rem', textAlign: 'center', fontWeight: 600, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
            <span>📡 Offline Mode — showing cached app shell. Some trip data may be unavailable until reconnected.</span>
          </div>
        )}
        <header className="content-header glass-card" style={{ position: 'relative', zIndex: 100, overflow: 'visible' }}>
          <h1>{navItems.find((n) => location.pathname.startsWith(n.path))?.name || 'Welcome'}</h1>
          <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', position: 'relative', zIndex: 101 }}>
            <span className="current-date">{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
            
            {/* Keyboard Shortcuts Trigger Button */}
            <button
              onClick={() => setIsShortcutsOpen(true)}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.2rem', display: 'flex', alignItems: 'center' }}
              title="Keyboard Shortcuts Cheatsheet (?)"
            >
              <Keyboard size={18} />
            </button>

            {/* Cmd+K Quick Search Badge */}
            <div
              onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--border-color)',
                padding: '0.35rem 0.65rem',
                borderRadius: '8px',
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                cursor: 'pointer',
              }}
              title="Open Command Palette (Ctrl+K)"
            >
              <Search size={14} />
              <span>Search</span>
              <kbd style={{ fontSize: '0.65rem', background: 'rgba(255,255,255,0.1)', padding: '0.1rem 0.3rem', borderRadius: '4px', marginLeft: '4px' }}>Ctrl+K</kbd>
            </div>

            {/* Custom Color Accent Picker */}
            <ColorThemePicker />

            {/* Dark/Light Theme Switcher */}
            <ThemeToggle />

            {/* Real-time Notification Center Bell */}
            <NotificationCenter />
          </div>
        </header>

        <div className="content-body">
          <PageTransition key={location.pathname}>
            {children}
          </PageTransition>
        </div>
      </main>

      {/* macOS / Vercel Floating Quick Actions Dock */}
      <FloatingDock />

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal isOpen={isShortcutsOpen} onClose={() => setIsShortcutsOpen(false)} />
    </div>
  );
}
