import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.footerGrid}`}>
        <div className={styles.brandSection}>
          <Link href="/" className={styles.logo}>
            Robux<span className="text-gradient">Việt</span>
          </Link>
          <p className={styles.description}>
            Hệ thống bán Robux uy tín, tự động và an toàn nhất Việt Nam. Được hàng ngàn game thủ tin dùng mỗi ngày.
          </p>
        </div>
        <div className={styles.linksSection}>
          <h3>Dịch Vụ</h3>
          <ul>
            <li><Link href="/robux/gamepass">Robux Gamepass</Link></li>
            <li><Link href="/robux/group">Robux Group</Link></li>
            <li><Link href="/premium">Thuê Premium</Link></li>
          </ul>
        </div>
        <div className={styles.linksSection}>
          <h3>Hỗ Trợ</h3>
          <ul>
            <li><Link href="/policy">Chính sách bảo mật</Link></li>
            <li><Link href="/terms">Điều khoản sử dụng</Link></li>
            <li><Link href="#">Liên hệ CSKH</Link></li>
          </ul>
        </div>
      </div>
      <div className={styles.bottomBar}>
        <p>&copy; {new Date().getFullYear()} Shop Robux Việt. All rights reserved.</p>
      </div>
    </footer>
  );
}
