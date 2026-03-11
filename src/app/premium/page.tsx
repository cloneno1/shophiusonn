'use client';

import Link from 'next/link';
import styles from './premium.module.css';
import RecentActivity from '@/components/RecentActivity';

export default function PremiumPage() {
  const plans = [
    { id: 1, name: 'Premium 450', robux: 450, price: 95000, desc: 'Nhận 450 Robux mỗi tháng & đặc quyền Premium.' },
    { id: 2, name: 'Premium 1000', robux: 1000, price: 195000, desc: 'Nhận 1000 Robux mỗi tháng & đặc quyền Premium.' },
    { id: 3, name: 'Premium 2200', robux: 2200, price: 395000, desc: 'Nhận 2200 Robux mỗi tháng & đặc quyền Premium.' },
  ];

  return (
    <div className={`container ${styles.premiumContainer} animate-fade-in`}>
      <div className={styles.premiumHeader}>
        <div className={styles.premiumIcon}>👑</div>
        <h1 className={styles.premiumTitle}>Nâng cấp <span className="text-gradient">Roblox Premium</span></h1>
        <p className={styles.premiumDesc}>
          Giá rẻ hơn 50% so với mua trực tiếp trên Roblox. Nhận Robux định kỳ, giao dịch mượt mà!
        </p>
      </div>

      <div className="glass-panel" style={{ padding: '4rem 2rem', textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', fontFamily: 'var(--font-outfit)' }}>Dịch Vụ Hiện Đang Bảo Trì</h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem', marginBottom: '2rem' }}>
          Hiện tại tính năng nâng cấp Roblox Premium đang tạm đóng để cập nhật hệ thống. Quý khách vui lòng quay lại sau.
        </p>
        <div style={{ display: 'inline-block', padding: '1rem 2.5rem', borderRadius: '50px', backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--color-warning)', fontWeight: '600', border: '1px solid rgba(255,122,0,0.3)' }}>
          ⚠️ Trạng thái: Chưa hoạt động
        </div>
        <div style={{ marginTop: '2rem' }}>
          <Link href="/" className="btn btn-primary">Quay lại trang chủ</Link>
        </div>
      </div>

      <div style={{ maxWidth: '800px', margin: '3rem auto 0' }}>
        <RecentActivity />
      </div>
    </div>
  );
}
