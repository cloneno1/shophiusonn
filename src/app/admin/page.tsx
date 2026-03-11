'use client';

import styles from './admin.module.css';

export default function AdminDashboard() {
  // In a real app, these would come from an API
  const stats = [
    { label: 'Tổng người dùng', value: '1,240' },
    { label: 'Đơn hàng hôm nay', value: '45' },
    { label: 'Doanh thu tháng', value: '12,500,000đ' },
    { label: 'Số dư hệ thống', value: '5,000,000' },
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
            <tr>
              <td>#ORD-1234</td>
              <td>hiusonn_99</td>
              <td>Robux Gamepass</td>
              <td>50,000đ</td>
              <td><span className={`${styles.statusBadge} ${styles.statusSuccess}`}>Thành công</span></td>
              <td>
                <button className={`${styles.actionBtn} ${styles.editBtn}`}>Xem</button>
              </td>
            </tr>
            <tr>
              <td>#ORD-1235</td>
              <td>game thủ_01</td>
              <td>Thuê Premium</td>
              <td>100,000đ</td>
              <td><span className={`${styles.statusBadge} ${styles.statusPending}`}>Chờ xử lý</span></td>
              <td>
                <button className={`${styles.actionBtn} ${styles.editBtn}`}>Xử lý</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
