'use client';

import { useEffect, useState } from 'react';
import styles from '../admin.module.css';

interface Order {
  _id: string;
  username: string;
  type: string;
  amount: number;
  price: number;
  status: string;
  details: {
    gamepassUrl?: string;
    image?: string;
    note?: string;
  };
  createdAt: string;
}

export default function OrdersManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/admin/orders');
      const data = await res.json();
      if (Array.isArray(data)) {
        setOrders(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setOrders(orders.map(o => o._id === id ? { ...o, status: newStatus } : o));
      }
    } catch (err) {
      alert('Lỗi cập nhật trạng thái đơn hàng');
    }
  };

  return (
    <div>
      <header className={styles.header}>
        <h1>Quản lý đơn hàng</h1>
        <p>Theo dõi và xử lý các đơn hàng dịch vụ của khách.</p>
      </header>

      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        {loading ? (
          <p>Đang tải danh sách...</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className={styles.adminTable}>
              <thead>
                <tr>
                  <th>Khách hàng</th>
                  <th>Dịch vụ</th>
                  <th>Số lượng</th>
                  <th>Giá</th>
                  <th>Chi tiết</th>
                  <th>Trạng thái</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td>{order.username}</td>
                    <td style={{ textTransform: 'capitalize' }}>{order.type}</td>
                    <td>{order.amount.toLocaleString()} R$</td>
                    <td>{order.price.toLocaleString()}đ</td>
                    <td>
                      <div style={{ fontSize: '0.8rem' }}>
                        {order.details.gamepassUrl && <a href={order.details.gamepassUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--primary-color)', display: 'block' }}>Link Gamepass</a>}
                        {order.details.image && <a href={order.details.image} target="_blank" rel="noreferrer" style={{ color: '#3b82f6', display: 'block' }}>Xem ảnh đính kèm</a>}
                        {order.details.note && <p>Ghi chú: {order.details.note}</p>}
                      </div>
                    </td>
                    <td>
                      <span className={`${styles.statusBadge} ${
                        order.status === 'Completed' ? styles.statusSuccess : 
                        order.status === 'Cancelled' ? '' : styles.statusPending
                      }`} style={order.status === 'Cancelled' ? { backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' } : {}}>
                        {order.status}
                      </span>
                    </td>
                    <td>
                      <select 
                        value={order.status} 
                        onChange={(e) => handleUpdateStatus(order._id, e.target.value)}
                        style={{ padding: '0.3rem', borderRadius: '4px', backgroundColor: '#1a1a24', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}
                      >
                        <option value="Pending">Chờ</option>
                        <option value="Processing">Đang xử lý</option>
                        <option value="Completed">Xong</option>
                        <option value="Cancelled">Hủy</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
