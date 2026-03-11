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

      <div className={styles.plansGrid}>
        {plans.map((plan) => (
          <div key={plan.id} className={`${styles.planCard} glass-panel`}>
            <div className={styles.planBadge}>{plan.name}</div>
            <h2 className={styles.planRobux}>
              <span className="text-gradient">{plan.robux}</span> R$
              <span className={styles.perMonth}>/ tháng</span>
            </h2>
            <div className={styles.planPrice}>{plan.price.toLocaleString('vi-VN')} đ</div>
            <p className={styles.planDesc}>{plan.desc}</p>
            <form className={styles.planForm}>
               <input type="text" placeholder="Tên nhân vật Roblox..." required className={styles.inputField} />
               <input type="password" placeholder="Mật khẩu Roblox (Yêu cầu để nâng cấp)..." required className={styles.inputField} />
               <button type="submit" className="btn btn-primary w-full">Đăng Ký Gói</button>
            </form>
          </div>
        ))}
      </div>

      <div style={{ maxWidth: '800px', margin: '3rem auto 0' }}>
        <RecentActivity />
      </div>
    </div>
  );
}
