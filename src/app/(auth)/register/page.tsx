'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from '../auth.module.css';

function RegisterForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const refCode = searchParams.get('ref');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, refCode }),
      });

      const data = await res.json();

      if (res.ok) {
        alert('Đăng ký thành công! Hãy đăng nhập.');
        router.push('/login');
      } else {
        setError(data.message || 'Có lỗi xảy ra');
      }
    } catch (err) {
      setError('Lỗi kết nối server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authGlow}></div>
      <div className={`${styles.authCard} glass-panel animate-fade-in`}>
        <div className={styles.authHeader}>
          <h1 className={styles.authTitle}>Tạo Tài Khoản</h1>
          <p className={styles.authSubtitle}>Tham gia mua Robux với ưu đãi khủng nhất!</p>
        </div>

        <form className={styles.authForm} onSubmit={handleSubmit}>
          {error && <div style={{ color: '#ff4d4d', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
          
          <div className={styles.formGroup}>
            <label htmlFor="username">Tên đăng nhập</label>
            <input 
              type="text" 
              id="username" 
              placeholder="Ví dụ: tranvanA" 
              required 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="password">Mật khẩu</label>
            <input 
              type="password" 
              id="password" 
              placeholder="Nhập mật khẩu" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword">Nhập lại mật khẩu</label>
            <input 
              type="password" 
              id="confirmPassword" 
              placeholder="Xác nhận mật khẩu" 
              required 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          
          <button 
            type="submit" 
            className={`btn btn-primary ${styles.submitBtn}`}
            disabled={loading}
          >
            {loading ? 'Đang xử lý...' : 'Tạo Tài Khoản'}
          </button>
        </form>

        <div className={styles.authFooter}>
          Đã có tài khoản?
          <Link href="/login" className={styles.authLink}>Đăng nhập</Link>
        </div>
      </div>
    </div>
  );
}

export default function Register() {
  return (
    <Suspense fallback={<div className="container" style={{ padding: '4rem', textAlign: 'center' }}>Đang tải...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
