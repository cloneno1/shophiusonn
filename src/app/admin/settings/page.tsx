'use client';

import { useState } from 'react';
import styles from '../admin.module.css';

export default function SettingsManagement() {
  const [siteName, setSiteName] = useState('Shop Hiusonn');
  const [bankStk, setBankStk] = useState('0334445502');
  const [bankCtk, setBankCtk] = useState('NGUYEN HIEU SON');
  const [gamepassRate, setGamepassRate] = useState('140');
  const [groupRate, setGroupRate] = useState('140');
  const [fbLink, setFbLink] = useState('https://facebook.com/');
  const [discordLink, setDiscordLink] = useState('https://discord.gg/');
  const [mcLink, setMcLink] = useState('mc.hiusonn.com');
  const [maintenance, setMaintenance] = useState(false);

  const handleSave = () => {
    alert('Đã lưu cấu hình hệ thống! (Tính năng đang phát triển API)');
  };

  return (
    <div>
      <header className={styles.header}>
        <h1>Cài đặt hệ thống</h1>
        <p>Tùy chỉnh các thông số hoạt động của website.</p>
      </header>

      <div className="glass-panel" style={{ padding: '2rem', maxWidth: '900px' }}>
        <div style={{ display: 'grid', gap: '2rem' }}>
          {/* Cấu hình cơ bản */}
          <section>
            <h3 style={{ marginBottom: '1.2rem', color: 'var(--primary-color)' }}>Cấu hình cơ bản</h3>
            <div className={styles.formGroup}>
              <label style={{ color: 'var(--color-text-muted)', marginBottom: '0.4rem', display: 'block' }}>Tên website</label>
              <input 
                type="text" 
                value={siteName} 
                onChange={(e) => setSiteName(e.target.value)}
                style={{ width: '100%', padding: '10px', backgroundColor: '#1a1a24', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px' }}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
              <div className={styles.formGroup}>
                <label style={{ color: 'var(--color-text-muted)', marginBottom: '0.4rem', display: 'block' }}>Số tài khoản MB</label>
                <input 
                  type="text" 
                  value={bankStk} 
                  onChange={(e) => setBankStk(e.target.value)}
                  style={{ width: '100%', padding: '10px', backgroundColor: '#1a1a24', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px' }}
                />
              </div>
              <div className={styles.formGroup}>
                <label style={{ color: 'var(--color-text-muted)', marginBottom: '0.4rem', display: 'block' }}>Chủ tài khoản</label>
                <input 
                  type="text" 
                  value={bankCtk} 
                  onChange={(e) => setBankCtk(e.target.value)}
                  style={{ width: '100%', padding: '10px', backgroundColor: '#1a1a24', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px' }}
                />
              </div>
            </div>
          </section>

          {/* Tỉ giá Robux */}
          <section>
            <h3 style={{ marginBottom: '1.2rem', color: 'var(--primary-color)' }}>Tỉ giá Robux (VNĐ cho 1 R$)</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className={styles.formGroup}>
                <label style={{ color: 'var(--color-text-muted)', marginBottom: '0.4rem', display: 'block' }}>Robux Gamepass (120H)</label>
                <input 
                  type="number" 
                  value={gamepassRate} 
                  onChange={(e) => setGamepassRate(e.target.value)}
                  style={{ width: '100%', padding: '10px', backgroundColor: '#1a1a24', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px' }}
                />
              </div>
              <div className={styles.formGroup}>
                <label style={{ color: 'var(--color-text-muted)', marginBottom: '0.4rem', display: 'block' }}>Robux Group (Fast)</label>
                <input 
                  type="number" 
                  value={groupRate} 
                  onChange={(e) => setGroupRate(e.target.value)}
                  style={{ width: '100%', padding: '10px', backgroundColor: '#1a1a24', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px' }}
                />
              </div>
            </div>
          </section>

          {/* Liên kết mạng xã hội */}
          <section>
            <h3 style={{ marginBottom: '1.2rem', color: 'var(--primary-color)' }}>Liên kết (Social Links)</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className={styles.formGroup}>
                <label style={{ color: 'var(--color-text-muted)', marginBottom: '0.4rem', display: 'block' }}>Facebook Page</label>
                <input 
                  type="text" 
                  value={fbLink} 
                  onChange={(e) => setFbLink(e.target.value)}
                  placeholder="https://facebook.com/..."
                  style={{ width: '100%', padding: '10px', backgroundColor: '#1a1a24', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px' }}
                />
              </div>
              <div className={styles.formGroup}>
                <label style={{ color: 'var(--color-text-muted)', marginBottom: '0.4rem', display: 'block' }}>Discord Server</label>
                <input 
                  type="text" 
                  value={discordLink} 
                  onChange={(e) => setDiscordLink(e.target.value)}
                  placeholder="https://discord.gg/..."
                  style={{ width: '100%', padding: '10px', backgroundColor: '#1a1a24', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px' }}
                />
              </div>
              <div className={styles.formGroup}>
                <label style={{ color: 'var(--color-text-muted)', marginBottom: '0.4rem', display: 'block' }}>Server Minecraft (IP)</label>
                <input 
                  type="text" 
                  value={mcLink} 
                  onChange={(e) => setMcLink(e.target.value)}
                  placeholder="mc.hiusonn.com"
                  style={{ width: '100%', padding: '10px', backgroundColor: '#1a1a24', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px' }}
                />
              </div>
            </div>
          </section>

          <footer style={{ marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className={styles.formGroup} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <input 
                type="checkbox" 
                id="maintenance"
                checked={maintenance}
                onChange={(e) => setMaintenance(e.target.checked)}
                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
              />
              <label htmlFor="maintenance" style={{ cursor: 'pointer' }}>Chế độ bảo trì hệ thống</label>
            </div>
            <button className="btn btn-primary" style={{ padding: '1rem 3rem', fontSize: '1rem' }} onClick={handleSave}>
              Lưu Thay Đổi
            </button>
          </footer>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem', marginTop: '2rem', borderLeft: '4px solid var(--primary-color)' }}>
        <h3 style={{ marginBottom: '0.5rem', fontFamily: 'var(--font-outfit)' }}>💡 Ý tưởng tính năng</h3>
        <ul style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', paddingLeft: '1.2rem' }}>
          <li>Tích hợp Webhook Discord để báo đơn hàng mới.</li>
          <li>Kết nối API nạp thẻ tự động (Thesieure, Doithe1s...).</li>
          <li>Quản lý danh sách đối tác cung cấp Robux.</li>
          <li>Chỉnh sửa nội dung các trang Chính sách & Điều khoản.</li>
        </ul>
      </div>
    </div>
  );
}
