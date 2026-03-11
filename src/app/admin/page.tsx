import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './admin.module.css';

interface StatData {
  totalUsers: number;
  ordersToday: number;
  totalRevenue: number;
  systemBalance: number;
  recentOrders: any[];
}

export default function AdminDashboard() {
  const [data, setData] = useState<StatData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Đang tải thống kê...</div>;
  }

  const stats = [
    { label: 'Tổng người dùng', value: data.totalUsers.toLocaleString() },
    { label: 'Đơn hàng hôm nay', value: data.ordersToday.toLocaleString() },
    { label: 'Tổng doanh thu', value: data.totalRevenue.toLocaleString() + 'đ' },
    { label: 'Số dư hệ thống', value: data.systemBalance.toLocaleString() + 'đ' },
  ];

  return (
    <div>
      <header className={styles.header}>
        <h1>Bảng điều khiển</h1>
        <p>Chào mừng bạn quay lại trang quản trị.</p>
      </header>

      <div className={styles.statsGrid}>
        {stats.map((stat, index) => (
          <div key={index} className={styles.statCard}>
            <div className={styles.statValue}>{stat.value}</div>
            <div className={styles.statLabel}>{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h2 style={{ marginBottom: '1rem', fontFamily: 'var(--font-outfit)' }}>Đơn hàng mới nhất</h2>
        <div style={{ overflowX: 'auto' }}>
          <table className={styles.adminTable}>
            <thead>
              <tr>
                <th>Người dùng</th>
                <th>Dịch vụ</th>
                <th>Giá trị</th>
                <th>Trạng thái</th>
                <th>Thời gian</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {data.recentOrders.length > 0 ? (
                data.recentOrders.map((order: any) => (
                  <tr key={order._id}>
                    <td>{order.username}</td>
                    <td style={{ textTransform: 'capitalize' }}>{order.type}</td>
                    <td>{order.price.toLocaleString()}đ</td>
                    <td>
                      <span className={`${styles.statusBadge} ${
                        order.status === 'Completed' ? styles.statusSuccess : 
                        order.status === 'Cancelled' ? '' : styles.statusPending
                      }`} style={order.status === 'Cancelled' ? { backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' } : {}}>
                        {order.status === 'Completed' ? 'Thành công' : order.status === 'Pending' ? 'Chờ xử lý' : order.status}
                      </span>
                    </td>
                    <td>{new Date(order.createdAt).toLocaleTimeString('vi-VN')}</td>
                    <td>
                      <Link href="/admin/orders" className={`${styles.actionBtn} ${styles.editBtn}`} style={{ textDecoration: 'none', display: 'inline-block' }}>
                        Xem
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>Chưa có đơn hàng nào</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
