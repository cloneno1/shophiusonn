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
  adminNote?: string;
  _originalAdminNote?: string;
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
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/admin/orders');
      const data = await res.json();
      if (Array.isArray(data)) {
        setOrders(data.map((order: any) => ({ ...order, _originalAdminNote: order.adminNote })));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id: string, newStatus: string, adminNote?: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, adminNote }),
      });
      if (res.ok) {
        setOrders(orders.map(o => o._id === id ? { ...o, status: newStatus, adminNote, _originalAdminNote: adminNote } : o));
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
                  <th>Thời gian</th>
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
                    <td style={{ fontSize: '0.85rem' }}>{new Date(order.createdAt).toLocaleString('vi-VN')}</td>
                    <td>
                      <div style={{ fontSize: '0.8rem' }}>
                        {order.details.gamepassUrl && <a href={order.details.gamepassUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--primary-color)', display: 'block' }}>Link Gamepass</a>}
                        {order.details.image && (
                          <button 
                            onClick={() => setSelectedImage(order.details.image!)}
                            style={{ color: '#3b82f6', display: 'block', background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: '0.8rem', textDecoration: 'underline' }}
                          >
                            Xem ảnh đính kèm
                          </button>
                        )}
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
                        onChange={(e) => handleUpdate(order._id, e.target.value, order.adminNote)}
                        style={{ padding: '0.3rem', borderRadius: '4px', backgroundColor: '#1a1a24', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}
                      >
                        <option value="Pending">Chờ</option>
                        <option value="Processing">Đang xử lý</option>
                        <option value="Completed">Xong</option>
                        <option value="Cancelled">Hủy</option>
                      </select>
                      <div style={{ marginTop: '0.5rem' }}>
                        <input 
                          type="text"
                          placeholder="Nhập ghi chú (nếu có)"
                          value={order.adminNote || ''}
                          onChange={(e) => {
                            setOrders(orders.map(o => o._id === order._id ? { ...o, adminNote: e.target.value } : o));
                          }}
                          onBlur={(e) => {
                            if (e.target.value !== (orders.find(o => o._id === order._id)?._originalAdminNote)) {
                               handleUpdate(order._id, order.status, e.target.value);
                            }
                          }}
                          style={{
                            width: '100%',
                            padding: '0.4rem',
                            borderRadius: '4px',
                            backgroundColor: '#1a1a24',
                            color: '#fff',
                            border: '1px solid rgba(255,255,255,0.1)',
                            fontSize: '0.8rem'
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '2rem'
          }}
          onClick={() => setSelectedImage(null)}
        >
          <div style={{ position: 'relative', maxWidth: '100%', maxHeight: '100%' }}>
            <img 
              src={selectedImage} 
              alt="Attached content" 
              style={{ maxWidth: '100%', maxHeight: '90vh', borderRadius: '8px', border: '2px solid rgba(255,255,255,0.1)' }} 
            />
            <button 
              onClick={() => setSelectedImage(null)}
              style={{
                position: 'absolute',
                top: '-40px',
                right: '0',
                color: '#fff',
                fontSize: '1.5rem',
                background: 'none',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              ✕ Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
