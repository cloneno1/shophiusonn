import { useEffect, useState } from 'react';
import styles from './admin.module.css';

interface StatData {
  totalUsers: number;
  ordersToday: number;
  monthlyRevenue: number;
  systemBalance: number;
}

interface Order {
  _id: string;
  username: string;
  type: string;
  price: number;
  status: string;
}

export default function AdminDashboard() {
  const [data, setData] = useState<{ stats: StatData, recentOrders: Order[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading || !data) {
    return <div className="container" style={{ padding: '2rem' }}>Đang tải dữ liệu thực tế...</div>;
  }

  const { stats, recentOrders } = data;

  const statCards = [
    { label: 'Tổng người dùng', value: stats.totalUsers.toLocaleString() },
    { label: 'Đơn hàng hôm nay', value: stats.ordersToday.toLocaleString() },
    { label: 'Doanh thu tháng', value: `${stats.monthlyRevenue.toLocaleString()}đ` },
    { label: 'Số dư hệ thống', value: `${stats.systemBalance.toLocaleString()}đ` },
  ];

  return (
    <div>
      <header className={styles.header}>
        <h1>Bảng điều khiển</h1>
        <p>Chào mừng bạn quay lại trang quản trị (Dữ liệu thực tế).</p>
      </header>

      <div className={styles.statsGrid}>
        {statCards.map((stat, index) => (
          <div key={index} className={styles.statCard}>
            <div className={styles.statValue}>{stat.value}</div>
            <div className={styles.statLabel}>{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h2 style={{ marginBottom: '1rem', fontFamily: 'var(--font-outfit)' }}>Đơn hàng mới nhất</h2>
        <table className={styles.adminTable}>
          <thead>
            <tr>
              <th>ID Đơn</th>
              <th>Người dùng</th>
              <th>Dịch vụ</th>
              <th>Giá trị</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <tr key={order._id}>
                  <td>#{order._id.slice(-6).toUpperCase()}</td>
                  <td>{order.username}</td>
                  <td style={{ textTransform: 'capitalize' }}>{order.type}</td>
                  <td>{order.price.toLocaleString()}đ</td>
                  <td>
                    <span className={`${styles.statusBadge} ${
                      order.status === 'Completed' ? styles.statusSuccess : 
                      order.status === 'Cancelled' ? '' : styles.statusPending
                    }`} style={order.status === 'Cancelled' ? { backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' } : {}}>
                      {order.status}
                    </span>
                  </td>
                  <td>
                    <button className={`${styles.actionBtn} ${styles.editBtn}`}>Xử lý</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>Chưa có đơn hàng nào trong database</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
