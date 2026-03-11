'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import styles from '../dashboard.module.css';
import Link from 'next/link';

export default function AffiliatePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState({
    referralCount: 0,
    totalEarnings: 0,
    currentBalance: 0,
    affiliateCode: '',
    referrals: []
  });
  const [loading, setLoading] = useState(true);
  const [withdrawing, setWithdrawing] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
    if (status === 'authenticated') {
      fetchStats();
    }
  }, [status, router]);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/user/affiliate/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch affiliate stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (stats.currentBalance < 10000) {
      alert('Số dư hoa hồng tối thiểu để rút là 10.000đ');
      return;
    }

    if (!confirm(`Bạn có muốn rút ${new Intl.NumberFormat('vi-VN').format(stats.currentBalance)}đ về số dư tài khoản chính?`)) return;

    setWithdrawing(true);
    try {
      const res = await fetch('/api/user/affiliate/withdraw', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        alert('Rút tiền thành công! Bạn có thể sử dụng số dư này để mua Robux.');
        fetchStats();
      } else {
        alert(data.message || 'Có lỗi xảy ra khi rút tiền');
      }
    } catch (error) {
      alert('Lỗi kết nối máy chủ');
    } finally {
      setWithdrawing(false);
    }
  };

  const referralLink = typeof window !== 'undefined' 
    ? `${window.location.origin}/register?ref=${stats.affiliateCode || session?.user?.affiliateCode}` 
    : '';

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (status === 'loading' || loading) {
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
          <Link href="/dashboard" className={styles.navItem}>Lịch sử giao dịch</Link>
          <Link href="/recharge" className={styles.navItem}>Nạp tiền</Link>
          <Link href="/dashboard/affiliate" className={`${styles.navItem} ${styles.active}`}>Kiếm tiền Affiliate</Link>
          <button onClick={() => signOut({ callbackUrl: '/' })} className={styles.navItemLogout} style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', padding: '12px 1rem' }}>Đăng xuất</button>
        </nav>
      </div>

      <div className={styles.mainContent}>
        <div className={`${styles.header} glass-panel`}>
          <h2>Chương Trình Cộng Tác Viên (Affiliate)</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
            Giới thiệu người dùng mới và nhận <span style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>35% lợi nhuận</span> trên mỗi đơn hàng hoàn tất.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Số người giới thiệu</p>
            <h3 style={{ fontSize: '2rem', marginTop: '0.5rem' }}>{stats.referralCount}</h3>
          </div>
          <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Hoa hồng khả dụng</p>
            <h3 style={{ fontSize: '2rem', marginTop: '0.5rem', color: '#10b981' }}>{new Intl.NumberFormat('vi-VN').format(stats.currentBalance)}đ</h3>
            <button 
              className="btn btn-primary" 
              style={{ padding: '0.3rem 1rem', fontSize: '0.8rem', marginTop: '1rem' }}
              onClick={handleWithdraw}
              disabled={withdrawing || stats.currentBalance < 10000}
            >
              {withdrawing ? 'Đang rút...' : 'Rút về ví chính'}
            </button>
          </div>
          <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Tổng thu nhập</p>
            <h3 style={{ fontSize: '2rem', marginTop: '0.5rem', color: 'var(--primary-color)' }}>{new Intl.NumberFormat('vi-VN').format(stats.totalEarnings)}đ</h3>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Link Giới Thiệu Của Bạn</h3>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input 
              type="text" 
              readOnly 
              value={referralLink}
              style={{ 
                flex: 1, 
                padding: '12px', 
                borderRadius: '8px', 
                backgroundColor: '#0d0d12', 
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#fff'
              }}
            />
            <button 
              className="btn btn-primary" 
              onClick={handleCopy}
              style={{ whiteSpace: 'nowrap' }}
            >
              {copied ? 'Đã copy!' : 'Copy Link'}
            </button>
          </div>
          <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
            * Chia sẻ link này cho bạn bè. Khi họ đăng ký và mua Robux, bạn sẽ nhận được hoa hồng tự động.
          </p>
        </div>

        <div className={`${styles.tableContainer} glass-panel`}>
          <div style={{ padding: '1.5rem 1.5rem 0' }}>
            <h3>Thành viên đã giới thiệu</h3>
          </div>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Tên Người Dùng</th>
                <th>Ngày Tham Gia</th>
                <th>Đơn Hàng</th>
                <th>Hoa Hồng Nhận Được</th>
              </tr>
            </thead>
            <tbody>
              {stats.referrals.map((ref: any, idx) => (
                <tr key={idx}>
                  <td>{ref.username}</td>
                  <td>{new Date(ref.createdAt).toLocaleDateString('vi-VN')}</td>
                  <td>{ref.orderCount} đơn</td>
                  <td style={{ color: '#10b981', fontWeight: 'bold' }}>+{new Intl.NumberFormat('vi-VN').format(ref.totalCommission)}đ</td>
                </tr>
              ))}
            </tbody>
          </table>
          {stats.referrals.length === 0 && (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
              <p>Bạn chưa giới thiệu thành viên nào.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
