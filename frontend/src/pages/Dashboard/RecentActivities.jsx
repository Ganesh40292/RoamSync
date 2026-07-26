import React from 'react';

export default function RecentActivities({ activities = [] }) {
  const defaultActivities = [
    { text: 'You created trip Mysore Palace Tour 🏰', time: '2 hours ago' },
    { text: 'Sarah added a shared expense: Filter Coffee ☕', time: '5 hours ago' },
    { text: 'System generated AI smart itineraries for Hampi Ruins 🛕', time: '1 day ago' },
  ];

  const list = activities.length > 0 ? activities : defaultActivities;

  return (
    <div className="section-card glass-card">
      <div className="section-header">
        <h2>Live Group Activities</h2>
      </div>

      <div className="activities-list">
        {list.map((act, idx) => (
          <div key={idx} className="activity-item animate-fade-in">
            <div className="activity-indicator animate-pulse-glow" />
            <div className="activity-details">
              <span className="activity-text">{act.text}</span>
              <span className="activity-time">{act.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
