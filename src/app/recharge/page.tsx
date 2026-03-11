'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import styles from './recharge.module.css';

export default function RechargePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    telco: 'VIETTEL',
    amount: '10000',
    serial: '',
    code: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  if (status === 'loading') return <div className="container" style={{ padding: '4rem', textAlign: 'center' }}>Đang tải...</div>;
  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await fetch('/api/recharge/card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, username: session?.user?.name }),
      });
      const data = await res.json();

      if (data.status === 99) {
        setMessage({ type: 'success', text: 'Gửi thẻ thành công! Vui lòng đợi hệ thống kiểm tra.' });
        setFormData({ ...formData, serial: '', code: '' });
      } else {
        setMessage({ type: 'error', text: data.message || 'Lỗi gửi thẻ. Vui lòng kiểm tra lại.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Lỗi kết nối server.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      <div className={styles.rechargeGrid}>
        {/* Cột 1: Nạp thẻ cào */}
        <div className={`${styles.rechargeCard} glass-panel animate-fade-in`} style={{ margin: 0, maxWidth: '100%' }}>
          <h2 className={styles.title}>Nạp Thẻ Cào Tự Động</h2>
          <p className={styles.subtitle}>Chiết khấu cực thấp, duyệt thẻ nhanh trong 30 giây</p>

          {message.text && (
            <div className={`${styles.alert} ${message.type === 'success' ? styles.alertSuccess : styles.alertError}`}>
              {message.text}
            </div>
          )}

          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label>Loại thẻ</label>
                <select 
                  value={formData.telco}
                  onChange={(e) => setFormData({...formData, telco: e.target.value})}
                >
                  <option value="VIETTEL">Viettel</option>
                  <option value="VINAPHONE">Vinaphone</option>
                  <option value="MOBIFONE">Mobifone</option>
                  <option value="ZING">Zing</option>
                  <option value="GARENA">Garena</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Mệnh giá</label>
                <select
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                >
                  <option value="10000">10,000 VNĐ</option>
                  <option value="20000">20,000 VNĐ</option>
                  <option value="50000">50,000 VNĐ</option>
                  <option value="100000">100,000 VNĐ</option>
                  <option value="200000">200,000 VNĐ</option>
                  <option value="500000">500,000 VNĐ</option>
                </select>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Số Seri</label>
              <input 
                type="text" 
                placeholder="Nhập số seri in trên thẻ" 
                required
                value={formData.serial}
                onChange={(e) => setFormData({...formData, serial: e.target.value})}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Mã thẻ</label>
              <input 
                type="text" 
                placeholder="Nhập mã cào sau lớp bạc" 
                required
                value={formData.code}
                onChange={(e) => setFormData({...formData, code: e.target.value})}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }} disabled={loading}>
              {loading ? 'Đang gửi thẻ...' : 'Nạp Thẻ Ngay'}
            </button>
          </form>

          <div className={styles.note}>
            <p><strong>Lưu ý:</strong></p>
            <ul>
              <li>Chọn sai mệnh giá sẽ mất thẻ.</li>
              <li>Thẻ cào đã nạp không thể xóa hay chỉnh sửa.</li>
              <li>Nếu thẻ đúng, tiền sẽ được cộng vào tài khoản sau 1-3 phút.</li>
            </ul>
          </div>
        </div>

        {/* Cột 2: Chuyển khoản ngân hàng */}
        <div className={`${styles.rechargeCard} glass-panel animate-fade-in`} style={{ margin: 0, maxWidth: '100%' }}>
          <h2 className={styles.title}>Chuyển Khoản / Ví Điện Tử <span style={{ color: 'var(--color-success)', fontSize: '0.9rem', verticalAlign: 'middle' }}>(+5% TIỀN)</span></h2>
          <p className={styles.subtitle}>Sẽ được Admin xử lý nhanh chóng sau khi chuyển khoản</p>

          <div className={styles.bankInfo}>
            <div className={styles.bankItem}>
              <span className={styles.bankLabel}>CHỦ TÀI KHOẢN</span>
              <span className={styles.bankValue}>NGUYEN HIEU SON</span>
            </div>
            <div className={styles.bankItem}>
              <span className={styles.bankLabel}>SỐ TÀI KHOẢN</span>
              <span className={styles.bankValue}>0334445502</span>
            </div>
            <div className={styles.bankItem}>
              <span className={styles.bankLabel}>NGÂN HÀNG</span>
              <span className={styles.bankValue}>MB BANK (Ngân hàng Quân Đội)</span>
            </div>
            <div className={styles.bankItem}>
              <span className={styles.bankLabel}>NỘI DUNG CHUYỂN KHOẢN</span>
              <span className={styles.bankValue}>shophiusonn {session?.user?.name || 'Username'}</span>
            </div>
          </div>

          <div className={styles.qrContainer}>
            <img src="/qr-bank.png" alt="MB Bank QR Code" className={styles.qrImage} />
            <p style={{ marginTop: '1rem', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
              Vui lòng chuyển đúng nội dung để được xử lý nhanh nhất
            </p>
          </div>

          <div className={styles.note}>
            <p><strong>Lưu ý:</strong></p>
            <ul>
              <li>Vui lòng nhập đúng nội dung chuyển khoản.</li>
              <li>Nạp tối thiểu 10,000 VNĐ.</li>
              <li>Admin sẽ kiểm tra và cộng tiền trong vài phút.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
