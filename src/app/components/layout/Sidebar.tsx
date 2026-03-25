'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  Gift, 
  Link as LinkIcon, 
  ShoppingCart, 
  Store, 
  DollarSign, 
  FileText, 
  MessageSquare, 
  ChevronRight,
  ExternalLink,
  Menu,
  X
} from 'lucide-react';
import styles from './Sidebar.module.css';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MenuItem {
  name: string;
  icon: any;
  href: string;
  active?: boolean;
  hasChevron?: boolean;
}

interface MenuSection {
  section: string;
  items: MenuItem[];
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();
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

  const menuItems: MenuSection[] = [
    {
      section: "MAIN",
      items: [
        { name: "Trang chủ", icon: Home, href: "/", active: pathname === "/" }
      ]
    },
    {
      section: "CHỨC NĂNG CHÍNH",
      items: [
        { name: "Robux 120H", icon: TrendingUp, href: "/robux/gamepass", active: pathname === "/robux/gamepass" },
        { name: "Ingame Gamepasses", icon: ShoppingBag, href: "/robux/gamepass" },
        { name: "Robux Group", icon: Users, href: "/robux/group", active: pathname === "/robux/group" },
        { name: "Gift Card", icon: Gift, href: "/robux/giftcard", active: pathname === "/robux/giftcard" },
        { name: "Tài Khoản Robux", icon: LinkIcon, href: "/robux/account", active: pathname === "/robux/account" },
      ]
    },
    {
      section: "LỊCH SỬ MUA HÀNG",
      items: [
        { name: "Lịch sử mua hàng", icon: ShoppingCart, href: "/dashboard", hasChevron: true, active: pathname === "/dashboard" },
        { name: "Thương gia", icon: Store, href: "/dashboard/merchant", active: pathname === "/dashboard/merchant" },
      ]
    },
    {
      section: "QUẢN LÝ TÀI KHOẢN",
      items: [
        { name: "Nạp tiền", icon: DollarSign, href: "/recharge", hasChevron: true, active: pathname === "/recharge" },
        { name: "Biến động số dư", icon: FileText, href: "/dashboard", active: false },
      ]
    }
  ];

  return (
    <>
      {/* Overlay for mobile */}
      <div 
        className={`${styles.overlay} ${isOpen ? styles.overlayActive : ''}`} 
        onClick={onClose}
      />
      
      <div className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.logoArea}>
          <div className="text-gradient" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Home size={24} />
            <span className={styles.logoName}>HIU <span style={{ color: '#fff' }}>SONN</span></span>
          </div>
          <button className="md-hidden" onClick={onClose} style={{ marginLeft: 'auto', color: '#fff' }}>
             <X size={24} />
          </button>
        </div>

        {menuItems.map((section, idx) => (
          <div key={idx} className={styles.section}>
            <div className={styles.sectionTitle}>{section.section}</div>
            <div className={styles.navGroup}>
              {section.items.map((item, idy) => (
                <Link 
                  key={idy} 
                  href={item.href} 
                  className={`${styles.navItem} ${item.active ? styles.active : ''}`}
                  onClick={() => { if (window.innerWidth < 900) onClose(); }}
                >
                  <div className={styles.navItemContent}>
                    <item.icon size={20} className={item.active ? styles.activeIcon : ''} />
                    <span>{item.name}</span>
                  </div>
                  {item.hasChevron && <ChevronRight size={16} className={styles.chevron} />}
                </Link>
              ))}
            </div>
          </div>
        ))}

        <a 
          href={links.linkDiscord} 
          target="_blank" 
          rel="noreferrer" 
          className={styles.discordButton}
        >
          <div className={styles.navItemContent}>
            <MessageSquare size={20} />
            <span>Liên kết Discord</span>
          </div>
          <ExternalLink size={16} />
        </a>
      </div>
    </>
  );
};

export default Sidebar;
