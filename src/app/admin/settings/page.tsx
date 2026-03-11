'use client';

import { useState, useEffect } from 'react';
import styles from '../admin.module.css';

export default function SettingsManagement() {
  const [config, setConfig] = useState({
    siteName: 'Shop Hiusonn',
    bankStk: '0334445502',
    bankCtk: 'NGUYEN HIEU SON',
    robuxRate120h: 140,
    robuxRateGroup: 160,
    linkFacebook: '',
    linkDiscord: '',
    linkYoutube: '',
    maintenance: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(res => res.json())
      .then(data => {
        setConfig(prev => ({ ...prev, ...data }));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (res.ok) {
        alert('Đã lưu cấu hình hệ thống thành công!');
      } else {
        alert('Lỗi khi lưu cấu hình');
      }
    } catch (err) {
      alert('Lỗi kết nối API');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setConfig(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value)
    }));
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Đang tải cài đặt...</div>;

  return (
    <div>
      <header className={styles.header}>
        <h1>Cài đặt hệ thống</h1>
        <p>Tùy chỉnh các thông số hoạt động của website.</p>
      </header>

      <div className="glass-panel" style={{ padding: '2rem', maxWidth: '800px' }}>
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          <div className={styles.formGroup}>
            <label style={{ color: 'var(--color-text-muted)', marginBottom: '0.5rem', display: 'block' }}>Tên website</label>
            <input 
              type="text" 
              name="siteName"
              value={config.siteName} 
              onChange={handleChange}
              style={{ width: '100%', padding: '12px', backgroundColor: '#0d0d12', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className={styles.formGroup}>
              <label style={{ color: 'var(--color-text-muted)', marginBottom: '0.5rem', display: 'block' }}>Số tài khoản MB</label>
              <input 
                type="text" 
                name="bankStk"
                value={config.bankStk} 
                onChange={handleChange}
                style={{ width: '100%', padding: '12px', backgroundColor: '#0d0d12', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px' }}
              />
            </div>
            <div className={styles.formGroup}>
              <label style={{ color: 'var(--color-text-muted)', marginBottom: '0.5rem', display: 'block' }}>Chủ tài khoản</label>
              <input 
                type="text" 
                name="bankCtk"
                value={config.bankCtk} 
                onChange={handleChange}
                style={{ width: '100%', padding: '12px', backgroundColor: '#0d0d12', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className={styles.formGroup}>
              <label style={{ color: 'var(--color-text-muted)', marginBottom: '0.5rem', display: 'block' }}>Tỉ giá 120H (1 R$ = ? VNĐ)</label>
              <input 
                type="number" 
                name="robuxRate120h"
                value={config.robuxRate120h} 
                onChange={handleChange}
                style={{ width: '100%', padding: '12px', backgroundColor: '#0d0d12', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px' }}
              />
            </div>
            <div className={styles.formGroup}>
              <label style={{ color: 'var(--color-text-muted)', marginBottom: '0.5rem', display: 'block' }}>Tỉ giá Group (1 R$ = ? VNĐ)</label>
              <input 
                type="number" 
                name="robuxRateGroup"
                value={config.robuxRateGroup} 
                onChange={handleChange}
                style={{ width: '100%', padding: '12px', backgroundColor: '#0d0d12', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px' }}
              />
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', color: 'var(--primary-color)' }}>Liên kết mạng xã hội</h3>
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div className={styles.formGroup}>
                <label style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Link Fanpage Facebook</label>
                <input type="text" name="linkFacebook" value={config.linkFacebook} onChange={handleChange} style={{ width: '100%', padding: '10px', backgroundColor: '#0d0d12', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px' }} />
              </div>
              <div className={styles.formGroup}>
                <label style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Link Discord</label>
                <input type="text" name="linkDiscord" value={config.linkDiscord} onChange={handleChange} style={{ width: '100%', padding: '10px', backgroundColor: '#0d0d12', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px' }} />
              </div>
              <div className={styles.formGroup}>
                <label style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Link Youtube</label>
                <input type="text" name="linkYoutube" value={config.linkYoutube} onChange={handleChange} style={{ width: '100%', padding: '10px', backgroundColor: '#0d0d12', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px' }} />
              </div>
            </div>
          </div>

          <div className={styles.formGroup} style={{ display: 'flex', alignItems: 'center', gap: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.05)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            <input 
              type="checkbox" 
              id="maintenance"
              name="maintenance"
              checked={config.maintenance}
              onChange={handleChange}
              style={{ width: '20px', height: '20px' }}
            />
            <label htmlFor="maintenance" style={{ color: '#ef4444', fontWeight: 'bold' }}>Chế độ bảo trì (Tắt toàn bộ dịch vụ mua hàng)</label>
          </div>

          <div style={{ marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
            <button className="btn btn-primary" style={{ padding: '0.8rem 2.5rem', minWidth: '200px' }} onClick={handleSave} disabled={saving}>
              {saving ? 'Đang lưu...' : 'Lưu tất cả cấu hình'}
            </button>
          </div>
        </div>
      </div>


    </div>
  );
}
