'use client';

import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkIsDesktop = () => {
      setIsDesktop(window.innerWidth > 900);
    };
    
    checkIsDesktop();
    window.addEventListener('resize', checkIsDesktop);
    return () => window.removeEventListener('resize', checkIsDesktop);
  }, []);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#050505' }}>
      <Navbar onMenuClick={toggleSidebar} />
      <div style={{ display: 'flex', flex: 1, paddingTop: '70px' }}>
        <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
        <main 
          className="main-content" 
          style={{ 
            flex: 1, 
            transition: 'all 0.3s ease-in-out',
            marginLeft: isDesktop && isSidebarOpen ? '280px' : '0',
            width: '100%',
            minHeight: 'calc(100vh - 70px)'
          }}
        >
          {children}
          <Footer />
        </main>
      </div>
    </div>
  );
}
