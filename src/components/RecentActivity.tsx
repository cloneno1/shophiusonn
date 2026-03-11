'use client';

import React, { useEffect, useState } from 'react';

interface Activity {
  id: string;
  user: string;
  time: string;
  amount: number;
  type: string;
}

export default function RecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const res = await fetch('/api/orders/recent');
        if (res.ok) {
          const data = await res.json();
          setActivities(data);
        }
      } catch (error) {
        console.error('Failed to fetch recent activity:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
    // Refresh every 30 seconds
    const interval = setInterval(fetchActivities, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading && activities.length === 0) {
    return (
      <div className="recent-activity-card">
        <h2 className="recent-activity-title">Hoạt Động Gần Đây</h2>
        <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--color-text-muted)' }}>Đang tải...</div>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="recent-activity-card">
        <h2 className="recent-activity-title">Hoạt Động Gần Đây</h2>
        <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
          Chưa có giao dịch nào gần đây. Hãy là người đầu tiên!
        </div>
      </div>
    );
  }

  return (
    <div className="recent-activity-card">
      <h2 className="recent-activity-title">Hoạt Động Gần Đây</h2>
      <div className="activity-list">
        {activities.map((activity) => (
          <div key={activity.id} className="activity-item">
            <span className="activity-user">{activity.user}</span>
            <span className="activity-time">{activity.time}</span>
            <div className="activity-amount">
              <div className="robux-icon">R$</div>
              <span>{activity.type} {activity.amount.toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
