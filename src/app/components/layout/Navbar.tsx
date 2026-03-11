'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <header className={`${styles.header} glass-panel`}>
      <div className={`container ${styles.navContainer}`}>
        <Link href="/" className={styles.logo}>
          Shop <span className="text-gradient">Hiusonn</span>
        </Link>
        <nav className={styles.navLinks}>
          <Link href="/robux/gamepass" className={styles.navLink}>Mua Robux Gamepass</Link>
          <Link href="/robux/group" className={styles.navLink}>Mua Robux Group</Link>
          <Link href="/premium" className={styles.navLink}>Thuê Premium</Link>
        </nav>
        <div className={styles.authActions}>
          {session ? (
            <Link href="/dashboard" className="btn btn-secondary">
              Hi, {session.user?.name}
            </Link>
          ) : (
            <>
              <Link href="/login" className="btn btn-secondary">Đăng Nhập</Link>
              <Link href="/register" className="btn btn-primary">Đăng Ký</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
