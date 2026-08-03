import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useUI } from '../providers/UIProvider';
import { useAuth } from '../context/AuthContext';
import {
  FiLogOut, FiSettings, FiUser, FiZap, FiChevronDown,
  FiChevronLeft, FiSearch, FiBell, FiSun, FiMoon
} from 'react-icons/fi';
import WorkspaceSwitcher from '../features/workspaces/components/WorkspaceSwitcher';
import AiAssistantSidebar from '../features/ai/components/AiAssistantSidebar';
import SmartSearchModal from '../features/ai/components/SmartSearchModal';
import NotificationCenterModal from '../features/notifications/components/NotificationCenterModal';
import OnlineAvatars from '../features/realtime/components/OnlineAvatars';
import ConnectionStatus from '../features/realtime/components/ConnectionStatus';

export default function AppLayout() {
  const { sidebarCollapsed, toggleSidebar, theme, toggleTheme } = useUI();
  const { user, membership, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [aiSidebarOpen, setAiSidebarOpen] = useState(false);
  const [smartSearchOpen, setSmartSearchOpen] = useState(false);
  const [notifModalOpen, setNotifModalOpen] = useState(false);
  const [reportsOpen, setReportsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  /* ── Navigation Items ── */
  const mainNavItems = [
    { name: 'Dashboard', path: '/', icon: '📊' },
    { name: 'Projects', path: '/projects', icon: '📁' },
    { name: 'Tasks', path: '/board', icon: '✅' },
    { name: 'Sprints', path: '/sprints', icon: '🏃' },
    { name: 'Calendar', path: '/calendar', icon: '📅' },
    { name: 'AI Assistant', path: '/ai-audit', icon: '⚡', badge: 'New' },
  ];

  const reportsSubItems = [
    { name: 'Analytics', path: '/analytics', icon: '📈' },
    { name: 'Reports', path: '/reports', icon: '📄' },
  ];

  const secondaryNavItems = [
    { name: 'Teams', path: '/members', icon: '👥' },
    { name: 'Workspaces', path: '/workspaces', icon: '🏢' },
    { name: 'Billing', path: '/billing', icon: '💳' },
  ];

  const settingsSubItems = [
    { name: 'General', path: '/settings', icon: '⚙️' },
    { name: 'Integrations', path: '/settings?tab=integrations', icon: '🔌' },
    { name: 'Notifications', path: '/settings/notifications', icon: '🔔' },
  ];

  const bottomNavItems = [];

  const formatRole = (role) => {
    if (!role) return '';
    return role.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
  };

  const checkActive = (path) => {
    if (path === '/') return location.pathname === '/';
    if (path === '/board') return location.pathname === '/board' || location.pathname.endsWith('/board');
    if (path === '/sprints') return location.pathname === '/sprints' || location.pathname.endsWith('/sprints');
    if (path === '/projects') {
      return (
        location.pathname === '/projects' ||
        (location.pathname.startsWith('/projects/') &&
          !location.pathname.includes('/sprints') &&
          !location.pathname.includes('/board'))
      );
    }
    return location.pathname.startsWith(path);
  };

  /* ── Render a single nav item (uses sidebar-* CSS vars) ── */
  const renderNavItem = (item) => {
    const active = checkActive(item.path);
    const isAiItem = item.name === 'AI Assistant';

    const content = (
      <div
        onClick={isAiItem ? () => setAiSidebarOpen(true) : undefined}
        className={`flex items-center gap-3.5 px-4 py-2.5 rounded-xl transition-all duration-200 relative group cursor-pointer`}
        style={{
          color: active ? 'var(--sidebar-text-active)' : 'var(--sidebar-text)',
          backgroundColor: active ? 'var(--sidebar-active-bg)' : 'transparent',
        }}
        onMouseEnter={(e) => { if (!active) e.currentTarget.style.backgroundColor = 'var(--sidebar-hover)'; }}
        onMouseLeave={(e) => { if (!active) e.currentTarget.style.backgroundColor = 'transparent'; }}
      >
        {active && (
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full"
            style={{ backgroundColor: 'var(--sidebar-accent)' }}
          />
        )}
        <span className="text-lg w-6 text-center shrink-0">{item.icon}</span>
        {!sidebarCollapsed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
            className={`text-[13px] flex-1 ${active ? 'font-semibold' : 'font-medium'}`}
          >
            {item.name}
          </motion.span>
        )}
        {!sidebarCollapsed && item.badge && (
          <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-md bg-brand-500 text-white leading-none">
            {item.badge}
          </span>
        )}
      </div>
    );

    if (isAiItem) {
      return <div key={item.name}>{content}</div>;
    }

    return <Link key={item.name} to={item.path}>{content}</Link>;
  };

  /* ── Render a collapsible group ── */
  const renderCollapsible = (label, icon, isOpen, toggle, subItems) => (
    <div>
      <button
        onClick={toggle}
        className="w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl transition-all duration-200 cursor-pointer"
        style={{ color: 'var(--sidebar-text)' }}
        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--sidebar-hover)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
      >
        <span className="text-lg w-6 text-center shrink-0">{icon}</span>
        {!sidebarCollapsed && (
          <>
            <span className="text-[13px] font-medium flex-1 text-left">{label}</span>
            <FiChevronDown
              size={14}
              className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            />
          </>
        )}
      </button>
      <AnimatePresence>
        {isOpen && !sidebarCollapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden ml-4 pl-4 space-y-0.5 mt-0.5"
            style={{ borderLeft: '1px solid var(--sidebar-border)' }}
          >
            {subItems.map((sub) => {
              const active = checkActive(sub.path);
              return (
                <Link key={sub.name} to={sub.path}>
                  <div
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-[12px] transition-all duration-200"
                    style={{
                      color: active ? 'var(--sidebar-text-active)' : 'var(--sidebar-text-muted)',
                      backgroundColor: active ? 'var(--sidebar-active-bg)' : 'transparent',
                      fontWeight: active ? 600 : 400,
                    }}
                    onMouseEnter={(e) => { if (!active) { e.currentTarget.style.backgroundColor = 'var(--sidebar-hover)'; e.currentTarget.style.color = 'var(--sidebar-text)'; } }}
                    onMouseLeave={(e) => { if (!active) { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--sidebar-text-muted)'; } }}
                  >
                    <span className="text-sm">{sub.icon}</span>
                    <span>{sub.name}</span>
                  </div>
                </Link>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-bg-primary text-text-primary font-sans relative transition-colors duration-300 ambient-bg noise-overlay cyber-grid-bg">
      {/* ── 1. SIDEBAR ── */}
      <motion.aside
        animate={{ width: sidebarCollapsed ? '72px' : '260px' }}
        transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1.0] }}
        className="relative flex flex-col h-full z-20 transition-colors duration-300"
        style={{
          background: 'var(--sidebar-bg)',
          backgroundColor: 'var(--sidebar-bg-solid)',
          borderRight: '1px solid var(--sidebar-border)',
        }}
      >
        {/* Brand */}
        <div
          className="flex items-center h-16 px-5 shrink-0"
          style={{ borderBottom: '1px solid var(--sidebar-border)' }}
        >
          <Link to="/" className="flex items-center gap-3 group cursor-pointer">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-white/20 shadow-lg text-white font-extrabold text-lg group-hover:scale-105 transition-transform">
              N
            </div>
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <span className="font-bold text-lg tracking-tight" style={{ color: 'var(--sidebar-text-active)' }}>
                  Nexora<span style={{ color: 'var(--sidebar-accent)' }}>.ai</span>
                </span>
                <p className="text-[9px] -mt-0.5 tracking-wider" style={{ color: 'var(--sidebar-text-muted)' }}>
                  AI-Powered Project Intelligence
                </p>
              </motion.div>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-0.5 scrollbar-thin">
          {mainNavItems.map(renderNavItem)}

          {renderCollapsible('Reports', '📊', reportsOpen, () => setReportsOpen(!reportsOpen), reportsSubItems)}

          {/* Divider */}
          <div className="mx-3 my-3" style={{ height: '1px', backgroundColor: 'var(--sidebar-border)' }} />

          {secondaryNavItems.map(renderNavItem)}

          {renderCollapsible('Settings', '⚙️', settingsOpen, () => setSettingsOpen(!settingsOpen), settingsSubItems)}

          {bottomNavItems.map(renderNavItem)}
        </nav>

        {/* Collapse Toggle */}
        <div className="px-3 py-3 shrink-0" style={{ borderTop: '1px solid var(--sidebar-border)' }}>
          <button
            onClick={toggleSidebar}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-xl transition-all text-[13px] font-medium cursor-pointer"
            style={{ color: 'var(--sidebar-text)' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--sidebar-hover)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            <span className={`transition-transform duration-200 ${sidebarCollapsed ? 'rotate-180' : ''}`}>
              <FiChevronLeft size={16} />
            </span>
            {!sidebarCollapsed && <span>Collapse</span>}
          </button>
        </div>
      </motion.aside>

      {/* ── 2. MAIN CONTENT AREA ── */}
      <div className="flex flex-col flex-1 h-full min-w-0 overflow-hidden z-[2] relative">
        {/* Top Header Bar */}
        <header className="flex items-center justify-between h-14 px-6 border-b border-border-primary bg-bg-secondary/95 backdrop-blur-xl z-[100] relative shrink-0 transition-colors duration-300">
          {/* Left: Back arrow */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-colors cursor-pointer"
            >
              <FiChevronLeft size={18} />
            </button>
          </div>

          {/* Center: Search bar */}
          <div className="hidden md:flex items-center cursor-pointer" onClick={() => setSmartSearchOpen(true)}>
            <div className="flex items-center gap-3 px-4 py-1.5 rounded-xl border border-border-primary bg-bg-tertiary/50 hover:border-brand-500/30 transition-all min-w-[340px]">
              <FiSearch size={14} className="text-text-tertiary" />
              <span className="text-xs text-text-tertiary flex-1">Search anything...</span>
              <span className="flex items-center gap-0.5 text-[10px] font-mono text-text-tertiary bg-bg-primary/60 px-2 py-0.5 rounded-md border border-border-primary">
                ⌘ K
              </span>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAiSidebarOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white text-xs font-semibold shadow-md shadow-brand-500/20 transition-all cursor-pointer mr-1"
            >
              <FiZap size={13} />
              <span>Ask AI</span>
            </button>

            <button onClick={toggleTheme} className="w-8 h-8 rounded-lg flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-colors cursor-pointer">
              {theme === 'dark' ? <FiSun size={16} /> : <FiMoon size={16} />}
            </button>

            <button onClick={() => setNotifModalOpen((prev) => !prev)} className="w-8 h-8 rounded-lg flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-colors cursor-pointer relative">
              <FiBell size={16} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-500 ring-2 ring-bg-secondary" />
            </button>

            <div className="w-px h-6 bg-border-primary mx-1" />

            {/* Live Presence: online users + connection status */}
            <div className="hidden sm:flex items-center gap-2">
              <OnlineAvatars maxDisplay={3} />
              <ConnectionStatus />
            </div>

            <div className="w-px h-6 bg-border-primary mx-1" />

            {/* User Avatar + Dropdown */}
            <div className="relative z-[100]">
              <button onClick={() => setDropdownOpen((prev) => !prev)} className="flex items-center gap-2.5 cursor-pointer select-none group outline-none pl-2">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover ring-2 ring-brand-500/20 group-hover:ring-brand-500/40 transition-all" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 via-purple-500 to-pink-500 ring-2 ring-brand-500/20 group-hover:ring-brand-500/40 transition-all flex items-center justify-center text-white text-[11px] font-bold">
                    {getInitials(user?.name)}
                  </div>
                )}
                <div className="hidden xl:block text-left">
                  <p className="text-xs font-semibold text-text-primary leading-tight group-hover:text-brand-400 transition-colors">{user?.name || 'User'}</p>
                  <p className="text-[10px] text-text-tertiary">{formatRole(membership?.role) || 'Member'}</p>
                </div>
              </button>

              <AnimatePresence>
                {dropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-[9998] bg-transparent" onClick={() => setDropdownOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-12 w-60 rounded-2xl border border-border-primary bg-bg-secondary shadow-2xl z-[9999] p-2 overflow-hidden"
                      style={{ backgroundColor: 'var(--bg-secondary)', opacity: 1 }}
                    >
                      <div className="px-3 py-2.5 border-b border-border-primary/50">
                        <p className="text-xs font-bold text-text-primary truncate">{user?.name}</p>
                        <p className="text-[10px] text-text-tertiary truncate">{user?.email}</p>
                      </div>
                      <div className="py-1">
                        <Link to="/settings" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2.5 px-3 py-2 text-xs text-text-secondary hover:text-text-primary hover:bg-bg-tertiary rounded-lg transition-colors">
                          <FiSettings size={13} /><span>Settings</span>
                        </Link>
                        <Link to="/settings?tab=profile" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2.5 px-3 py-2 text-xs text-text-secondary hover:text-text-primary hover:bg-bg-tertiary rounded-lg transition-colors">
                          <FiUser size={13} /><span>My Profile</span>
                        </Link>
                      </div>
                      <div className="pt-1 border-t border-border-primary/50">
                        <button onClick={() => { setDropdownOpen(false); logout(); }} className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-red-500 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer text-left font-medium">
                          <FiLogOut size={13} /><span>Sign Out</span>
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 bg-transparent">
          <Outlet />
        </main>

        {/* Modals & Drawers */}
        <AiAssistantSidebar isOpen={aiSidebarOpen} onClose={() => setAiSidebarOpen(false)} />
        <SmartSearchModal isOpen={smartSearchOpen} onClose={() => setSmartSearchOpen(false)} />
        <NotificationCenterModal isOpen={notifModalOpen} onClose={() => setNotifModalOpen(false)} />
      </div>
    </div>
  );
}
