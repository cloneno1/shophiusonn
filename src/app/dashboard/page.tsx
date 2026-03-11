'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import styles from './dashboard.module.css';
import Link from 'next/link';

interface Transaction {
  id: string;
  date: string;
  service: string;
  amount: string;
  price: string;
  status: string;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<'transactions' | 'password'>('transactions');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Password form states
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formMsg, setFormMsg] = useState({ type: '', text: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
    
    if (status === 'authenticated' && activeTab === 'transactions') {
      fetchTransactions();
    }
  }, [status, router, activeTab]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/user/transactions');
      if (res.ok) {
        const data = await res.json();
        setTransactions(data);
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormMsg({ type: '', text: '' });

    if (newPassword !== confirmPassword) {
      setFormMsg({ type: 'error', text: 'Mật khẩu xác nhận không khớp' });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      const data = await res.json();
      
      if (res.ok) {
        setFormMsg({ type: 'success', text: 'Đổi mật khẩu thành công!' });
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setFormMsg({ type: 'error', text: data.error || 'Có lỗi xảy ra' });
      }
    } catch (error) {
      setFormMsg({ type: 'error', text: 'Lỗi kết nối máy chủ' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === 'loading') {
    return <div className="container" style={{ padding: '4rem', textAlign: 'center' }}>Đang tải...</div>;
  }

  if (!session) return null;

  return (
    <div className={`container ${styles.dashboardContainer} animate-fade-in`}>
      <div className={styles.sidebar}>
        <div className={styles.userProfile}>
          <div className={styles.avatar}>{session.user?.name?.[0].toUpperCase() || 'U'}</div>
          <div>
            <h3>{session.user?.name}</h3>
            <p className={styles.userBalance}>Số dư: <span className="text-gradient font-bold">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(session.user?.balance || 0)}</span></p>
          </div>
        </div>
        <nav className={styles.sideNav}>
          <button 
            onClick={() => setActiveTab('transactions')} 
            className={`${styles.navItem} ${activeTab === 'transactions' ? styles.active : ''}`}
            style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            Lịch sử giao dịch
          </button>
          <Link href="/recharge" className={styles.navItem}>Nạp tiền</Link>
          <button 
            onClick={() => setActiveTab('password')} 
            className={`${styles.navItem} ${activeTab === 'password' ? styles.active : ''}`}
            style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            Đổi mật khẩu
          </button>
          <button onClick={() => signOut({ callbackUrl: '/' })} className={styles.navItemLogout} style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', padding: '12px 1rem' }}>Đăng xuất</button>
        </nav>
      </div>

      <div className={styles.mainContent}>
        {activeTab === 'transactions' ? (
          <>
            <div className={`${styles.header} glass-panel`}>
              <h2>Lịch Sử Giao Dịch</h2>
            </div>

            <div className={`${styles.tableContainer} glass-panel`}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Mã GD</th>
                    <th>Thời Gian</th>
                    <th>Dịch Vụ</th>
                    <th>Số Lượng</th>
                    <th>Thanh Toán</th>
                    <th>Trạng Thái</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx, idx) => (
                    <tr key={tx.id + idx}>
                      <td className={styles.codeCell}>{tx.id}</td>
                      <td>{tx.date}</td>
                      <td>{tx.service}</td>
                      <td className={styles.amountCell}>{tx.amount}</td>
                      <td>{tx.price}</td>
                      <td>
                        <span className={`${styles.statusBadge} ${tx.status === 'Hoàn Thành' ? styles.statusSuccess : tx.status === 'Thất Bại' ? styles.statusFailed : styles.statusPending}`}>
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!loading && transactions.length === 0 && (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📜</div>
                  <p>Bạn chưa có giao dịch nào.</p>
                  <Link href="/robux/gamepass" className="btn btn-primary" style={{ marginTop: '1rem' }}>Mua ngay</Link>
                </div>
              )}
              {loading && (
                 <div style={{ padding: '2rem', textAlign: 'center' }}>Đang tải lịch sử...</div>
              )}
            </div>
          </>
        ) : (
          <>
            <div className={`${styles.header} glass-panel`}>
              <h2>Đổi Mật Khẩu</h2>
            </div>
            
            <div className={`${styles.tableContainer} glass-panel`} style={{ padding: '2rem' }}>
              <form onSubmit={handlePasswordChange} style={{ maxWidth: '400px', margin: '0 auto' }}>
                {formMsg.text && (
                  <div style={{ 
                    padding: '10px', 
                    borderRadius: '8px', 
                    marginBottom: '1rem',
                    textAlign: 'center',
                    fontSize: '0.9rem',
                    backgroundColor: formMsg.type === 'success' ? 'var(--color-success)' : 'var(--color-danger)',
                    color: '#fff'
                  }}>
                    {formMsg.text}
                  </div>
                )}
                
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Mật khẩu hiện tại</label>
                  <input 
                    type="password" 
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    required 
                    style={{ 
                      width: '100%', 
                      padding: '12px', 
                      borderRadius: '8px', 
                      border: '1px solid var(--color-border)',
                      backgroundColor: 'var(--color-bg-surface)',
                      color: 'var(--color-text-main)'
                    }} 
                  />
                </div>
                
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Mật khẩu mới</label>
                  <input 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required 
                    style={{ 
                      width: '100%', 
                      padding: '12px', 
                      borderRadius: '8px', 
                      border: '1px solid var(--color-border)',
                      backgroundColor: 'var(--color-bg-surface)',
                      color: 'var(--color-text-main)'
                    }} 
                  />
                </div>
                
                <div style={{ marginBottom: '2rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Xác nhận mật khẩu mới</label>
                  <input 
                    type="password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required 
                    style={{ 
                      width: '100%', 
                      padding: '12px', 
                      borderRadius: '8px', 
                      border: '1px solid var(--color-border)',
                      backgroundColor: 'var(--color-bg-surface)',
                      color: 'var(--color-text-main)'
                    }} 
                  />
                </div>
                
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  disabled={isSubmitting}
                  style={{ width: '100%', padding: '14px' }}
                >
                  {isSubmitting ? 'Đang xử lý...' : 'Cập Nhật Mật Khẩu'}
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
