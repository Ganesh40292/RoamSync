import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { PlusCircle, DollarSign, MessageSquare, Compass } from 'lucide-react';
import StatsCards from './StatsCards';
import UpcomingTrips from './UpcomingTrips';
import RecentActivities from './RecentActivities';
import tripService from '../../services/tripService';
import expenseService from '../../services/expenseService';
import './Dashboard.css';

export default function Dashboard() {
  const { user } = useSelector((state) => state.auth);
  const [trips, setTrips] = useState([]);
  const [expensesSum, setExpensesSum] = useState(0);
  const [coTravellers, setCoTravellers] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const fetchedTrips = await tripService.getAllTrips();
        setTrips(fetchedTrips);

        let expenseTotal = 0;
        const seenMembers = new Set();

        for (const trip of fetchedTrips) {
          try {
            const exps = await expenseService.getExpensesByTrip(trip.id);
            expenseTotal += exps.reduce((acc, curr) => acc + curr.amount, 0);
          } catch (e) {
            console.error('Error fetching expenses for trip', trip.id, e);
          }

          if (trip.members) {
            trip.members.forEach((m) => {
              if (m.username !== user?.username) {
                seenMembers.add(m.username);
              }
            });
          }
        }

        setExpensesSum(expenseTotal);
        setCoTravellers(seenMembers.size);
      } catch (err) {
        console.error('Error loading dashboard metrics', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [user]);

  if (isLoading) {
    return <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '4rem' }}>Synchronizing Travel Data...</div>;
  }

  const quickActions = [
    { label: 'Plan New Trip', desc: 'Create a custom trip schedule', icon: PlusCircle, path: '/trips/create', color: 'rgba(124, 58, 237, 0.1)', border: 'rgba(124, 58, 237, 0.3)' },
    { label: 'Split Expenses', desc: 'Log and calculate ledger balances', icon: DollarSign, path: '/trips', color: 'rgba(6, 182, 212, 0.1)', border: 'rgba(6, 182, 212, 0.3)' },
    { label: 'Group Chats', desc: 'Chat in real-time with STOMP', icon: MessageSquare, path: '/chat', color: 'rgba(16, 185, 129, 0.1)', border: 'rgba(16, 185, 129, 0.3)' },
    { label: 'Explore Karnataka', desc: 'Find places and monuments', icon: Compass, path: '/explore', color: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.3)' },
  ];

  return (
    <div className="dashboard-container animate-fade-in">
      <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <h2 style={{ fontSize: '1.75rem', background: 'linear-gradient(135deg, #fff, var(--text-secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Welcome back, {user?.fullName || user?.username}! 🌍
        </h2>
        <p style={{ color: 'var(--text-secondary)' }}>Simplify your planning and explore Karnataka's beautiful landscapes with your collaborative travel partners.</p>
      </div>

      <StatsCards
        tripsCount={trips.length}
        expensesSum={expensesSum}
        membersCount={coTravellers}
      />

      {/* Quick Action Cards Section */}
      <div>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', fontWeight: 600 }}>Quick Actions</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
          {quickActions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <Link to={action.path} key={idx} className="glass-card action-card-item" style={{ padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center', textDecoration: 'none', transition: 'var(--transition-normal)' }}>
                <div style={{ padding: '0.75rem', borderRadius: '12px', background: action.color, color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <Icon size={24} style={{ color: action.border.replace('0.3', '1') }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '1rem' }}>{action.label}</span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>{action.desc}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="dashboard-sections grid-2-col">
        <UpcomingTrips trips={trips} />
        <RecentActivities />
      </div>
    </div>
  );
}
