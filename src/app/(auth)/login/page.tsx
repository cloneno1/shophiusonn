'use client';

import { useState } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import styles from '../auth.module.css';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await signIn('credentials', {
      redirect: false,
      username,
      password,
    });

    if (result?.error) {
      setError('Tên đăng nhập hoặc mật khẩu không đúng');
      setLoading(false);
    } else {
      router.push('/dashboard');
      router.refresh();
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authGlow}></div>
      <div className={`${styles.authCard} glass-panel animate-fade-in`}>
        <div className={styles.authHeader}>
          <h1 className={styles.authTitle}>Đăng Nhập</h1>
          <p className={styles.authSubtitle}>Chào mừng bạn quay lại Shop Hiusonn!</p>
        </div>

        <form className={styles.authForm} onSubmit={handleSubmit}>
          {error && <div style={{ color: '#ff4d4d', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

          <div className={styles.formGroup}>
            <label htmlFor="username">Tên đăng nhập</label>
            <input 
              type="text" 
              id="username" 
              placeholder="Nhập tên đăng nhập" 
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
          
          <button 
            type="submit" 
            className={`btn btn-primary ${styles.submitBtn}`}
            disabled={loading}
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
          </button>
        </form>

        <div className={styles.authFooter}>
          Chưa có tài khoản?
          <Link href="/register" className={styles.authLink}>Đăng ký ngay</Link>
        </div>
      </div>
    </div>
  );
}
