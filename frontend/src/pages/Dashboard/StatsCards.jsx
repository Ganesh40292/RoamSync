import React, { useState, useEffect } from 'react';
import { Compass, DollarSign, Users, Award } from 'lucide-react';

function useAnimatedCounter(endValue, duration = 1000) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseFloat(endValue) || 0;
    if (end === 0) {
      setCount(0);
      return;
    }

    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3); // Ease-out cubic
      setCount(start + (end - start) * easeProgress);

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    requestAnimationFrame(update);
  }, [endValue, duration]);

  return count;
}

export default function StatsCards({ tripsCount = 0, expensesSum = 0, membersCount = 0 }) {
  const animatedTrips = useAnimatedCounter(tripsCount);
  const animatedExpenses = useAnimatedCounter(expensesSum);
  const animatedMembers = useAnimatedCounter(membersCount);

  const stats = [
    {
      label: 'Total Trips',
      value: Math.round(animatedTrips),
      icon: Compass,
      color: 'rgba(124, 58, 237, 0.1)',
      iconColor: 'var(--primary-color)',
    },
    {
      label: 'Shared Expenses',
      value: `$${animatedExpenses.toFixed(2)}`,
      icon: DollarSign,
      color: 'rgba(6, 182, 212, 0.1)',
      iconColor: 'var(--secondary-color)',
    },
    {
      label: 'Co-travellers',
      value: Math.round(animatedMembers),
      icon: Users,
      color: 'rgba(16, 185, 129, 0.1)',
      iconColor: 'var(--success)',
    },
    {
      label: 'Travel Rank',
      value: 'Explorer 🟡🔴',
      icon: Award,
      color: 'rgba(245, 158, 11, 0.1)',
      iconColor: 'var(--warning)',
    },
  ];

  return (
    <div className="stats-grid">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div key={idx} className="stat-card glass-card animate-fade-in">
            <div className="stat-icon" style={{ backgroundColor: stat.color, color: stat.iconColor }}>
              <Icon size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-value">{stat.value}</span>
              <span className="stat-label">{stat.label}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
