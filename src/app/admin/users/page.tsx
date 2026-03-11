'use client';

import { useEffect, useState } from 'react';
import styles from '../admin.module.css';

interface User {
  _id: string;
  username: string;
  balance: number;
  role: string;
  createdAt: string;
}

export default function UsersManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/users')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setUsers(data);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div>
      <header className={styles.header}>
        <h1>Quản lý người dùng</h1>
        <p>Xem và chỉnh sửa thông tin người dùng hệ thống.</p>
      </header>

      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        {loading ? (
          <p>Đang tải danh sách...</p>
        ) : (
          <table className={styles.adminTable}>
            <thead>
              <tr>
                <th>Username</th>
                <th>Số dư</th>
                <th>Quyền</th>
                <th>Ngày gia nhập</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td>{user.username}</td>
                  <td>{user.balance.toLocaleString()}đ</td>
                  <td>
                    <span className={`${styles.statusBadge} ${user.role === 'admin' ? styles.statusSuccess : ''}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>{new Date(user.createdAt).toLocaleDateString('vi-VN')}</td>
                  <td>
                    <button className={`${styles.actionBtn} ${styles.editBtn}`}>Sửa</button>
                    <button className={`${styles.actionBtn} ${styles.deleteBtn}`}>Khóa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
