'use client';

import { useEffect, useState } from 'react';
import styles from '../admin.module.css';

interface Transaction {
  _id: string;
  username: string;
  amount: number;
  method: string;
  telco?: string;
  serial?: string;
  code?: string;
  status: string;
  adminNote?: string;
  _originalAdminNote?: string;
  createdAt: string;
}

export default function TransactionsManagement() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const res = await fetch('/api/admin/transactions');
      const data = await res.json();
      if (Array.isArray(data)) {
        setTransactions(data.map((tx: any) => ({ ...tx, _originalAdminNote: tx.adminNote })));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id: string, newStatus: string, adminNote?: string) => {
    try {
      const res = await fetch(`/api/admin/transactions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, adminNote }),
      });
      if (res.ok) {
        setTransactions(transactions.map(t => t._id === id ? { ...t, status: newStatus, adminNote, _originalAdminNote: adminNote } : t));
      } else {
        alert('Lỗi cập nhật giao dịch');
      }
    } catch (err) {
      alert('Lỗi kết nối API');
    }
  };

  return (
    <div>
      <header className={styles.header}>
        <h1>Quản lý giao dịch</h1>
        <p>Thống kê và kiểm tra lịch sử nạp tiền của người dùng.</p>
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
                  <th>Phương thức</th>
                  <th>Mệnh giá</th>
                  <th>Chi tiết (Thẻ)</th>
                  <th>Thời gian</th>
                  <th>Trạng thái</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx._id}>
                    <td>{tx.username}</td>
                    <td>
                      <span className={`${styles.statusBadge}`} style={tx.method === 'bank' ? { backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' } : { backgroundColor: 'rgba(255, 122, 0, 0.1)', color: 'var(--primary-color)' }}>
                        {tx.method === 'bank' ? 'Bank' : 'Thẻ cào'}
                      </span>
                    </td>
                    <td>{tx.amount.toLocaleString()}đ</td>
                    <td>
                      {tx.method === 'card' ? (
                        <div style={{ fontSize: '0.8rem' }}>
                          <p>Loại: {tx.telco}</p>
                          <p>Seri: {tx.serial}</p>
                          <p>Mã: {tx.code}</p>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--color-text-muted)' }}>-</span>
                      )}
                    </td>
                    <td>{new Date(tx.createdAt).toLocaleString('vi-VN')}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${
                        tx.status === 'Success' ? styles.statusSuccess : 
                        tx.status === 'Failed' ? '' : styles.statusPending
                      }`} style={tx.status === 'Failed' ? { backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' } : {}}>
                        {tx.status}
                      </span>
                    </td>
                    <td>
                      <select 
                        value={tx.status} 
                        onChange={(e) => handleUpdate(tx._id, e.target.value, tx.adminNote)}
                        style={{ padding: '0.3rem', borderRadius: '4px', backgroundColor: '#1a1a24', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}
                      >
                        <option value="Pending">Chờ</option>
                        <option value="Success">Thành công</option>
                        <option value="Failed">Thất bại</option>
                      </select>
                      <div style={{ marginTop: '0.5rem' }}>
                        <input 
                          type="text"
                          placeholder="Ghi chú phản hồi"
                          value={tx.adminNote || ''}
                          onChange={(e) => setTransactions(transactions.map(t => t._id === tx._id ? { ...t, adminNote: e.target.value } : t))}
                          onBlur={(e) => {
                             if (e.target.value !== (transactions.find(t => t._id === tx._id)?._originalAdminNote)) {
                                handleUpdate(tx._id, tx.status, e.target.value);
                             }
                          }}
                          style={{
                            width: '100%',
                            padding: '0.3rem',
                            borderRadius: '4px',
                            backgroundColor: '#1a1a24',
                            color: '#fff',
                            border: '1px solid rgba(255,255,255,0.1)',
                            fontSize: '0.75rem'
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
    </div>
  );
}
