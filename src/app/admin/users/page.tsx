'use client';

import { useEffect, useState } from 'react';
import styles from '../admin.module.css';

interface User {
  _id: string;
  username: string;
  balance: number;
  role: string;
  status: string;
  createdAt: string;
}

export default function UsersManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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

  const handleEditBalance = async (id: string, currentBalance: number) => {
    const newBalance = prompt('Nhập số dư mới:', currentBalance.toString());
    if (newBalance === null || isNaN(Number(newBalance))) return;

    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ balance: Number(newBalance) }),
      });
      if (res.ok) {
        setUsers(users.map(u => u._id === id ? { ...u, balance: Number(newBalance) } : u));
        alert('Cập nhật số dư thành công!');
      } else {
        const errorData = await res.json();
        alert('Lỗi: ' + (errorData.message || 'Không thể cập nhật số dư'));
      }
    } catch (err) {
      console.error(err);
      alert('Lỗi kết nối máy chủ khi cập nhật số dư');
    }
  };

  const handleToggleRole = async (id: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    if (!confirm(`Bạn có chắc chắn muốn chuyển tài khoản này sang quyền ${newRole.toUpperCase()}?`)) return;

    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        setUsers(users.map(u => u._id === id ? { ...u, role: newRole } : u));
        alert('Cập nhật quyền hạn thành công!');
      } else {
        const data = await res.json();
        alert('Lỗi: ' + (data.message || 'Không thể cập nhật quyền'));
      }
    } catch (err) {
      alert('Lỗi kết nối máy chủ');
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'blocked' : 'active';
    if (!confirm(`Bạn có chắc chắn muốn ${newStatus === 'blocked' ? 'Khóa' : 'Mở khóa'} tài khoản này?`)) return;

    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setUsers(users.map(u => u._id === id ? { ...u, status: newStatus } : u));
        alert('Cập nhật trạng thái thành công!');
      } else {
        const data = await res.json();
        alert('Lỗi: ' + (data.message || 'Không thể cập nhật trạng thái'));
      }
    } catch (err) {
      alert('Lỗi kết nối máy chủ');
    }
  };

  return (
    <div>
      <header className={styles.header}>
        <h1>Quản lý người dùng</h1>
        <p>Xem và chỉnh sửa thông tin người dùng hệ thống.</p>
      </header>

      <div className={styles.searchContainer}>
        <input 
          type="text" 
          placeholder="Tìm tên người dùng..." 
          className={styles.searchInput}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

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
                <th>Trạng thái</th>
                <th>Ngày gia nhập</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {users
                .filter(user => user.username.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((user) => (
                <tr key={user._id}>
                  <td>{user.username}</td>
                  <td>{user.balance.toLocaleString()}đ</td>
                  <td>
                    <span className={`${styles.statusBadge} ${user.role === 'admin' ? styles.statusSuccess : ''}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <span className={`${styles.statusBadge} ${user.status === 'active' ? styles.statusSuccess : styles.statusPending}`} style={user.status === 'blocked' ? { backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' } : {}}>
                      {user.status === 'active' ? 'Hoạt động' : 'Đã khóa'}
                    </span>
                  </td>
                  <td>{new Date(user.createdAt).toLocaleDateString('vi-VN')}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        className={`${styles.actionBtn} ${styles.editBtn}`}
                        onClick={() => handleEditBalance(user._id, user.balance)}
                      >
                        Sửa
                      </button>
                      <button 
                        className={`${styles.actionBtn}`}
                        style={{ backgroundColor: '#6366f1' }}
                        onClick={() => handleToggleRole(user._id, user.role)}
                      >
                        Quyền
                      </button>
                      <button 
                        className={`${styles.actionBtn} ${styles.deleteBtn}`}
                        onClick={() => handleToggleStatus(user._id, user.status || 'active')}
                      >
                        {user.status === 'blocked' ? 'Mở khóa' : 'Khóa'}
                      </button>
                    </div>
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
