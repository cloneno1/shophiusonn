'use client';

import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import styles from './admin.module.css';
import { useEffect } from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === 'unauthenticated' || (status === 'authenticated' && session.user?.role !== 'admin')) {
      // Redirect if not admin, but we'll show a message instead of just redirecting
    }
  }, [status, session, router]);

  if (status === 'loading') {
    return <div className="container" style={{ padding: '5rem', textAlign: 'center' }}>Đang tải...</div>;
  }

  if (!session || session.user?.role !== 'admin') {
    return (
      <div className={`container ${styles.unauthorized}`}>
        <h1>403</h1>
        <p>Bạn không có quyền truy cập trang này.</p>
        <Link href="/" className="btn btn-primary" style={{ marginTop: '2rem' }}>
          Về Trang Chủ
        </Link>
      </div>
    );
  }

  const navItems = [
    { name: 'Tổng quan', href: '/admin' },
    { name: 'Người dùng', href: '/admin/users' },
    { name: 'Đơn hàng', href: '/admin/orders' },
    { name: 'Giao dịch', href: '/admin/transactions' },
    { name: 'Cài đặt', href: '/admin/settings' },
  ];

  return (
    <div className={styles.adminContainer}>
      <aside className={styles.sidebar}>
        <h2 className={styles.sidebarTitle}>Quản Trị Viên</h2>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navItem} ${pathname === item.href ? styles.activeItem : ''}`}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </aside>
      <main className={styles.mainContent}>
        {children}
      </main>
    </div>
  );
}
