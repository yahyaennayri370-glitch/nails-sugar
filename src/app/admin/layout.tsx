'use client';

import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import {
  LayoutDashboard, CalendarCheck, Scissors, Clock, Ban,
  Image as ImageIcon, Users, Settings, LogOut, ExternalLink, Menu, X
} from 'lucide-react';
import './admin.css';

const navItems = [
  { key: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard, href: '/admin' },
  { key: 'appointments', label: 'Rendez-vous', icon: CalendarCheck, href: '/admin/appointments' },
  { key: 'calendar', label: 'Calendrier', icon: CalendarCheck, href: '/admin/calendar' },
  { key: 'services', label: 'Prestations', icon: Scissors, href: '/admin/services' },
  { key: 'availability', label: 'Horaires', icon: Clock, href: '/admin/availability' },
  { key: 'blocked', label: 'Dates bloquées', icon: Ban, href: '/admin/blocked' },
  { key: 'gallery', label: 'Galerie', icon: ImageIcon, href: '/admin/gallery' },
  { key: 'customers', label: 'Clients', icon: Users, href: '/admin/customers' },
  { key: 'settings', label: 'Paramètres', icon: Settings, href: '/admin/settings' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Skip auth check for login page
  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (!isLoginPage && status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, isLoginPage, router]);

  // Login page renders without sidebar
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Loading state
  if (status === 'loading') {
    return (
      <div className="loading" style={{ minHeight: '100vh' }}>
        <div className="loading__spinner" />
      </div>
    );
  }

  // Not authenticated
  if (!session) {
    return null;
  }

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar__header">
          <a href="/" className="sidebar__logo">Nails Sugar</a>
          <span className="sidebar__badge">Admin</span>
        </div>
        <nav className="sidebar__nav">
          {navItems.map(item => {
            const isActive = pathname === item.href || 
              (item.href !== '/admin' && pathname?.startsWith(item.href));
            return (
              <a
                key={item.key}
                href={item.href}
                className={`sidebar__link ${isActive ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </a>
            );
          })}
        </nav>
        <div className="sidebar__footer">
          <a href="/" target="_blank" rel="noopener noreferrer" className="sidebar__link">
            <ExternalLink size={18} />
            <span>Voir le site</span>
          </a>
          <button
            className="sidebar__link sidebar__link--logout"
            onClick={() => signOut({ callbackUrl: '/admin/login' })}
          >
            <LogOut size={18} />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="sidebar__overlay active" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Admin Content Area */}
      <div className="admin__content">
        {/* Mobile header */}
        <div className="admin__mobile-header">
          <button className="admin__menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Menu">
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <span className="admin__mobile-title">Nails Sugar</span>
          <a href="/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-brown)', marginLeft: 'auto' }}>
            <ExternalLink size={18} />
          </a>
        </div>

        {/* Main content */}
        <main className="admin__main">
          {children}
        </main>
      </div>
    </div>
  );
}
