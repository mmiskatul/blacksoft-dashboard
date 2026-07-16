'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import styles from './layout.module.css';
import { apiRequest, clearAuthToken, getAuthToken } from '../utils/apiClient';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '';
  const router = useRouter();
  const isAuthPage = pathname === '/login' || pathname === '/forgot-password' || pathname === '/reset-password';
  const [checkingSession, setCheckingSession] = React.useState(!isAuthPage);

  React.useEffect(() => {
    if (isAuthPage) return;
    setCheckingSession(true);
    if (!getAuthToken()) {
      router.replace('/login');
      return;
    }
    void apiRequest('/auth/me')
      .catch(() => {
        clearAuthToken();
        router.replace('/login');
      })
      .finally(() => setCheckingSession(false));
  }, [isAuthPage, router]);

  if (isAuthPage) return <>{children}</>;
  if (checkingSession) return (
    <div className={styles.sessionLoading}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          border: '3px solid rgba(99, 102, 241, 0.15)',
          borderTopColor: '#6366f1',
          animation: 'spin 1s linear infinite'
        }} />
        <div style={{
          fontSize: '0.85rem',
          fontWeight: 600,
          letterSpacing: '0.05em',
          color: '#c7c4d8',
          animation: 'pulseActive 2s infinite'
        }}>SECURELY LOGGING IN...</div>
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    </div>
  );

  const getBreadcrumbs = () => {
    const isOverview = pathname === '/';
    const current = pathname.split('/').filter(Boolean).pop() || 'overview';
    const label = isOverview ? 'Overview' : current.split('-').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
    return (
      <span>
        <span>Dashboard</span>
        <span>/</span>
        <span>{label}</span>
      </span>
    );
  };

  return (
    <div className={styles.dashboardContainer}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <Link href="/" className={styles.logo}>
            Blacksoft Hub
          </Link>
        </div>
        <nav className={styles.sidebarNav}>
          <div className={styles.navGroup}>
            <span className={styles.groupLabel}>Core</span>
            <Link
              href="/"
              className={`${styles.navLink} ${pathname === '/' ? styles.activeLink : ''}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.icon}>
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <line x1="9" y1="3" x2="9" y2="21" />
              </svg>
              Overview
            </Link>
            <Link
              href="/trusted-by-global-innovators"
              className={`${styles.navLink} ${pathname.startsWith('/trusted-by-global-innovators') ? styles.activeLink : ''}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.icon}>
                <path d="M12 20l-6.5 3 1.7-7.1L1 10.4l7.2-.6L12 3l3.8 6.8 7.2.6-6.2 5.5 1.7 7.1z" />
              </svg>
              Trusted Innovators
            </Link>
            <Link
              href="/what-we-do"
              className={`${styles.navLink} ${pathname.startsWith('/what-we-do') ? styles.activeLink : ''}`}
            >
              <span className={styles.icon} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', width: '16px', height: '16px' }}>💼</span>
              What We Do
            </Link>
            <Link
              href="/who-we-are"
              className={`${styles.navLink} ${pathname.startsWith('/who-we-are') ? styles.activeLink : ''}`}
            >
              <span className={styles.icon} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', width: '16px', height: '16px' }}>👥</span>
              Who We Are
            </Link>
            <Link
              href="/why-us"
              className={`${styles.navLink} ${pathname.startsWith('/why-us') ? styles.activeLink : ''}`}
            >
              <span className={styles.icon} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', width: '16px', height: '16px' }}>💡</span>
              Why Us
            </Link>
            <Link
              href="/architecting-intelligence"
              className={`${styles.navLink} ${pathname.startsWith('/architecting-intelligence') ? styles.activeLink : ''}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.icon}>
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <path d="M8 12h8" />
                <path d="M12 8v8" />
              </svg>
              Architecting Intelligence
            </Link>
            <Link
              href="/ecommerce"
              className={`${styles.navLink} ${pathname.startsWith('/ecommerce') ? styles.activeLink : ''}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.icon}>
                <path d="M6 6h15l-1.5 9h-12z" />
                <path d="M6 6 5 3H2" />
                <circle cx="9" cy="19" r="1" />
                <circle cx="18" cy="19" r="1" />
              </svg>
              E-commerce
            </Link>
            <Link
              href="/app-websites"
              className={`${styles.navLink} ${pathname.startsWith('/app-websites') ? styles.activeLink : ''}`}
            >
              <span className={styles.icon}>W</span>
              App & Website
            </Link>
            <Link
              href="/ai-solutions"
              className={`${styles.navLink} ${pathname.startsWith('/ai-solutions') ? styles.activeLink : ''}`}
            >
              <span className={styles.icon}>AI</span>
              AI Solutions
            </Link>
            <Link
              href="/technology-stack"
              className={`${styles.navLink} ${pathname.startsWith('/technology-stack') ? styles.activeLink : ''}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.icon}>
                <path d="M4 7h16" />
                <path d="M4 12h10" />
                <path d="M4 17h13" />
                <circle cx="18" cy="12" r="2" />
              </svg>
              Technology Stack
            </Link>
            <Link
              href="/team-members"
              className={`${styles.navLink} ${pathname.startsWith('/team-members') ? styles.activeLink : ''}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.icon}>
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              Team Members
            </Link>
            <Link
              href="/book-a-call"
              className={`${styles.navLink} ${pathname.startsWith('/book-a-call') ? styles.activeLink : ''}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.icon}>
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.58 3.44 2 2 0 0 1 3.55 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.13 6.13l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              Book a Call
            </Link>
          </div>
        </nav>
      </aside>

      <div className={styles.contentArea}>
        <header className={styles.topBar}>
          <div className={styles.breadcrumbs}>
            {getBreadcrumbs()}
          </div>

          <div className={styles.topActions}>
            <div className={styles.searchBox}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.searchIcon}>
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input type="text" placeholder="Quick search..." className={styles.searchInput} />
            </div>

            <button className={styles.notificationBtn} aria-label="Notifications">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '16px', height: '16px' }}>
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <div className={styles.notifBadge}></div>
            </button>

            <div className={styles.profileChip}>
              <div className={styles.avatar}>A</div>
              <span className={styles.profileName}>Admin</span>
            </div>
            <button type="button" className={styles.logoutButton} onClick={() => { clearAuthToken(); router.replace('/login'); }}>Log out</button>
          </div>
        </header>

        <nav className={styles.mobileNav} aria-label="Dashboard sections">
          <Link href="/">Overview</Link>
          <Link href="/what-we-do">What We Do</Link>
          <Link href="/who-we-are">Who We Are</Link>
          <Link href="/why-us">Why Us</Link>
          <Link href="/architecting-intelligence">Capabilities</Link>
          <Link href="/ecommerce">Commerce</Link>
          <Link href="/app-websites">Websites</Link>
          <Link href="/ai-solutions">AI solutions</Link>
          <Link href="/team-members">Team</Link>
        </nav>

        <main className={styles.mainContent}>
          {children}
        </main>
      </div>
    </div>
  );
}
