'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Menu } from 'lucide-react';
import styles from './Navbar.module.css';

interface NavbarProps {
  onMenuClick?: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const { data: session } = useSession();
  const [links, setLinks] = useState({
    linkFacebook: '',
    linkDiscord: '',
    linkYoutube: '',
  });

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(res => res.json())
      .then(data => {
        setLinks({
          linkFacebook: data.linkFacebook || '',
          linkDiscord: data.linkDiscord || '',
          linkYoutube: data.linkYoutube || '',
        });
      })
      .catch(() => {});
  }, []);

  return (
    <header className={`${styles.header} glass-panel`}>
      <div className={`container ${styles.navContainer}`}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button className={styles.menuButton} onClick={onMenuClick}>
            <Menu size={24} />
          </button>
          <Link href="/" className={styles.logo}>
            Shop <span className="text-gradient">Hiusonn</span>
          </Link>
        </div>
        
        <nav className={`${styles.navLinks} md-visible`}>
          <Link href="/robux/gamepass" className={styles.navLink}>Mua Robux Gamepass</Link>
          <Link href="/robux/group" className={styles.navLink}>Mua Robux Group</Link>
          <Link href="/premium" className={styles.navLink}>Thuê Premium</Link>
          <Link href="/recharge" className={styles.navLink}>Nạp Tiền</Link>
          
          <div className={`${styles.navLink} ${styles.dropdown}`}>
            Liên Kết <span style={{ fontSize: '0.7rem' }}>▼</span>
            <div className={styles.dropdownContent}>
              <a href={links.linkFacebook} target="_blank" rel="noreferrer" className={styles.dropdownItem}>Page Facebook</a>
              <a href={links.linkDiscord} target="_blank" rel="noreferrer" className={styles.dropdownItem}>Discord</a>
              <a href={links.linkYoutube} target="_blank" rel="noreferrer" className={styles.dropdownItem}>Kênh Youtube</a>
            </div>
          </div>
        </nav>
        <div className={styles.authActions}>
          {session ? (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {session.user?.role === 'admin' && (
                <Link href="/admin" className="btn btn-primary md-visible" style={{ background: '#ef4444' }}>
                  Admin
                </Link>
              )}
              <Link href="/dashboard" className="btn btn-secondary">
                <span className="md-visible">Hi, {session.user?.name}</span>
                <span className="md-hidden">Cá nhân</span>
              </Link>
            </div>
          ) : (
            <>
              <Link href="/login" className="btn btn-secondary">Đăng Nhập</Link>
              <Link href="/register" className="btn btn-primary md-visible">Đăng Ký</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
