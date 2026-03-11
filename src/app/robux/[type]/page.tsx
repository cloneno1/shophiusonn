'use client';

import { useState, use, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import styles from '../robux.module.css';
import RecentActivity from '@/components/RecentActivity';

export default function RobuxPage({ params }: { params: Promise<{ type: string }> }) {
  const resolvedParams = use(params);
  const type = resolvedParams.type;

  const [robuxAmount, setRobuxAmount] = useState<number | ''>('');
  const [username, setUsername] = useState('');
  const [gamepassUrl, setGamepassUrl] = useState('');
  const [note, setNote] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [price, setPrice] = useState(0);
  const [rates, setRates] = useState({ robuxRate120h: 140, robuxRateGroup: 160 });
  const [currentRate, setCurrentRate] = useState(140);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const isGroup = type === 'group';
  const title = isGroup ? 'Mua Robux Group (Tức Thì)' : 'Mua Robux Gamepass (120H)';
  const description = isGroup
    ? 'Đây là robux không có thuế, bạn mua bao nhiêu thì sẽ vào acc bạn bấy nhiêu. Hệ thống tự động chuyển Robux vào tài khoản qua Group 14 ngày. An toàn 100%, có ngay sau 1s.'
    : 'Nạp Robux thông qua Gamepass, đợi 120H (5 ngày) để Robux về tài khoản. Giá cực siêu rẻ.';

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(res => res.json())
      .then(data => {
        setRates(data);
        setCurrentRate(type === 'group' ? data.robuxRateGroup : data.robuxRate120h);
      });
  }, [type]);

  useEffect(() => {
    if (typeof robuxAmount === 'number') {
      setPrice(robuxAmount * currentRate);
    } else {
      setPrice(0);
    }
  }, [robuxAmount, currentRate]);

  const packages = [
    { id: 1, robux: 100, price: 100 * currentRate },
    { id: 2, robux: 500, price: 500 * currentRate },
    { id: 3, robux: 1000, price: 1000 * currentRate },
    { id: 4, robux: 2000, price: 2000 * currentRate },
    { id: 5, robux: 5000, price: 5000 * currentRate },
    { id: 6, robux: 10000, price: 10000 * currentRate },
  ];

  const handlePackageSelect = (robux: number) => {
    setRobuxAmount(robux);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Ảnh quá lớn, vui lòng chọn ảnh dưới 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImage(base64String);
        setImagePreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!robuxAmount || !username) {
      alert('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          type: isGroup ? 'group' : 'gamepass',
          amount: robuxAmount,
          price,
          details: {
            gamepassUrl,
            image,
            note
          }
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert('Đặt hàng thành công!');
        router.push('/dashboard');
      } else {
        alert(data.message || 'Có lỗi xảy ra');
      }
    } catch (err) {
      alert('Lỗi kết nối server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`container ${styles.productContainer} animate-fade-in`}>
      <div className={styles.productHeader}>
        <h1 className={styles.productTitle} style={{ color: 'var(--color-primary)', background: 'none', WebkitTextFillColor: 'initial' }}>{title}</h1>
        <p className={styles.productDesc}>{description}</p>
      </div>

      <div className={styles.contentGrid}>
        {/* Left Col: Packages & Custom Input */}
        <div className={styles.packagesSection}>
          <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
            <h2 className={styles.sectionTitle}>Nhập số lượng Robux</h2>
            <div className={styles.formGroup}>
              <div className={styles.inputWithIcon} style={{ position: 'relative' }}>
                <input 
                  type="number" 
                  value={robuxAmount} 
                  onChange={(e) => setRobuxAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="Ví dụ: 1000"
                  className={styles.customRobuxInput}
                  min="10"
                />
                <span style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', fontWeight: 'bold', color: 'var(--color-primary)' }}>R$</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
                * Tỷ giá hiện tại: 1 Robux = {currentRate} VNĐ
              </p>
            </div>
          </div>

          <h2 className={styles.sectionTitle}>Hoặc chọn gói nhanh</h2>
          <div className={styles.packagesGrid}>
            {packages.map((pkg) => (
              <div 
                key={pkg.id} 
                className={`${styles.packageCard} glass-panel cursor-pointer ${robuxAmount === pkg.robux ? styles.activePackage : ''}`}
                onClick={() => handlePackageSelect(pkg.robux)}
              >
                <div className={styles.cardContent}>
                  <div className={styles.robuxAmount}>
                    <span className="text-gradient font-bold">{pkg.robux}</span> R$
                  </div>
                  <div className={styles.robuxPrice}>
                    {pkg.price.toLocaleString('vi-VN')} VNĐ
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Right Col: Checkout / Input */}
        <div className={styles.checkoutSection}>
          <div className={`${styles.checkoutCard} glass-panel`}>
            <h3>Thông tin đơn hàng</h3>
            <form className={styles.orderForm}>
              <div className={styles.formGroup}>
                <label htmlFor="username">Tên nhân vật Roblox (Username)</label>
                <input 
                  type="text" 
                  id="username" 
                  placeholder="Nhập chính xác username..." 
                  required 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              
              {!isGroup && (
                <div className={styles.formGroup}>
                  <label htmlFor="gamepassUrl">Link Gamepass</label>
                  <input 
                    type="url" 
                    id="gamepassUrl" 
                    placeholder="https://www.roblox.com/game-pass/..." 
                    required 
                    value={gamepassUrl}
                    onChange={(e) => setGamepassUrl(e.target.value)}
                  />
                </div>
              )}

              <div className={styles.formGroup}>
                <label htmlFor="note">Ghi chú (Tài khoản/Mật khẩu hoặc yêu cầu khác)</label>
                <textarea 
                  id="note" 
                  placeholder="Nếu mua gamepass cần login thì để lại thông tin tại đây..." 
                  rows={3}
                  className={styles.textarea}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  style={{ 
                    width: '100%', 
                    padding: '12px', 
                    borderRadius: '8px', 
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-bg-surface)',
                    color: 'var(--color-text-main)',
                    fontFamily: 'inherit'
                  }}
                ></textarea>
              </div>

              <div className={styles.formGroup}>
                <label>Tải ảnh đính kèm (Không bắt buộc)</label>
                <div style={{ 
                  border: '2px dashed var(--color-border)', 
                  padding: '1rem', 
                  borderRadius: '12px', 
                  textAlign: 'center',
                  backgroundColor: 'rgba(255,255,255,0.02)',
                  position: 'relative'
                }}>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageChange}
                    style={{ 
                      position: 'absolute', 
                      top: 0, 
                      left: 0, 
                      width: '100%', 
                      height: '100%', 
                      opacity: 0, 
                      cursor: 'pointer' 
                    }}
                  />
                  {imagePreview ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                      <img src={imagePreview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '150px', borderRadius: '8px' }} />
                      <button type="button" onClick={() => { setImage(null); setImagePreview(null); }} style={{ color: '#ef4444', fontSize: '0.8rem', background: 'none', border: 'none', cursor: 'pointer' }}>Xóa ảnh</button>
                    </div>
                  ) : (
                    <div style={{ color: 'var(--color-text-muted)' }}>
                      <p style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📸</p>
                      <p style={{ fontSize: '0.85rem' }}>Bấm để chọn ảnh hoặc kéo thả vào đây</p>
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.summary}>
                <div className={styles.summaryRow}>
                  <span>Số lượng:</span>
                  <span className={styles.highlight}>{robuxAmount || 0} R$</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>Tổng thanh toán:</span>
                  <span className={styles.highlightPrice}>{(price).toLocaleString('vi-VN')} VNĐ</span>
                </div>
              </div>

               <button 
                type="button" 
                className={`btn btn-primary ${styles.buyBtn}`} 
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? 'Đang xử lý...' : 'Thanh Toán Ngay'}
              </button>
            </form>
            <div className={styles.trustBadges}>
              <span>✓ Giao dịch tự động</span>
              <span>✓ An toàn 100%</span>
              <span>✓ Hỗ trợ 24/7</span>
            </div>
          </div>
        </div>
      </div>
      
      <div style={{ marginTop: '3rem' }}>
        <RecentActivity />
      </div>
    </div>
  );
}
