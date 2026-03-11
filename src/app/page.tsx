import Link from 'next/link';
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";
import styles from './page.module.css';

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <div className={styles.main}>
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroGlow}></div>
        <div className={`container ${styles.heroContent}`}>
          <h1 className={`${styles.title} animate-fade-in`}>
            Shop <span className="text-gradient">Hiusonn</span> Uy Tín Nhất
          </h1>
          <h2 className={`${styles.subtitle} animate-fade-in`} style={{ animationDelay: '0.2s', fontSize: '1.2rem', fontWeight: 'normal', color: 'rgba(255,255,255,0.7)' }}>
            Hệ thống nạp Robux tự động, giá rẻ, chiết khấu cao. Trải nghiệm ngay để nhận nhiều ưu đãi hấp dẫn!
          </h2>
          <div className={`${styles.ctaGroup} animate-fade-in`} style={{ animationDelay: '0.4s' }}>
            <Link href="/robux/gamepass" className="btn btn-primary" style={{ padding: '0.8rem 2rem', fontSize: '1.1rem' }}>
              Nạp Robux Ngay
            </Link>
            {!session ? (
              <Link href="/register" className="btn btn-secondary" style={{ padding: '0.8rem 2rem', fontSize: '1.1rem' }}>
                Tạo Tài Khoản
              </Link>
            ) : (
              <Link href="/dashboard" className="btn btn-secondary" style={{ padding: '0.8rem 2rem', fontSize: '1.1rem' }}>
                Vào Dashboard
              </Link>
            )}
          </div>
          
          <div className={`${styles.statsGrid} animate-fade-in`} style={{ animationDelay: '0.6s' }}>
            <div className={`${styles.statCard} glass-panel`}>
              <h3>100k+</h3>
              <p>Khách hàng tin dùng</p>
            </div>
            <div className={`${styles.statCard} glass-panel`}>
              <h3>5s</h3>
              <p>Giao dịch trung bình</p>
            </div>
            <div className={`${styles.statCard} glass-panel`}>
              <h3>24/7</h3>
              <p>Hỗ trợ trực tuyến</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className={`container ${styles.servicesSection}`}>
        <div className={styles.sectionHeader}>
          <h2>Dịch Vụ Nổi Bật</h2>
          <p>Các gói dịch vụ nạp Robux đa dạng với giá tốt nhất thị trường</p>
        </div>

        <div className={styles.servicesGrid}>
          {/* Card 1 */}
          <div className={`${styles.serviceCard} glass-panel`}>
            <div className={styles.cardHeader}>
              <div className={styles.cardIconGlow}>💎</div>
              <h3>Robux Gamepass (120H)</h3>
            </div>
            <p className={styles.cardDesc}>Tỉ lệ siêu rẻ, nhận robux sau 120h an toàn 100%.</p>
            <div className={styles.cardAction}>
              <Link href="/robux/gamepass" className="btn btn-primary">Mua Ngay</Link>
            </div>
          </div>

          {/* Card 2 */}
          <div className={`${styles.serviceCard} glass-panel`}>
            <div className={styles.cardHeader}>
              <div className={styles.cardIconGlow} style={{ filter: 'drop-shadow(0 0 10px var(--color-warning))' }}>🤝</div>
              <h3>Robux Group (Fast)</h3>
            </div>
            <p className={styles.cardDesc}>Nhận ngay lập tức qua Group 14 ngày.</p>
            <div className={styles.cardAction}>
              <Link href="/robux/group" className="btn btn-secondary">Mua Ngay</Link>
            </div>
          </div>

          {/* Card 3 */}
          <div className={`${styles.serviceCard} glass-panel`}>
            <div className={styles.cardHeader}>
              <div className={styles.cardIconGlow} style={{ filter: 'drop-shadow(0 0 10px var(--color-success))' }}>⭐</div>
              <h3>Roblox Premium</h3>
            </div>
            <p className={styles.cardDesc}>Nâng cấp Premium hàng tháng giá rẻ nhận Robux mỗi tháng.</p>
            <div className={styles.cardAction}>
              <button className="btn btn-secondary" disabled style={{ opacity: 0.6, cursor: 'not-allowed' }}>Chưa hoạt động</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
