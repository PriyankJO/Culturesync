import React, { useState, useEffect } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../store/slices/authSlice'
import { toggleNotifPanel, closeNotifPanel, toggleSidebar } from '../store/slices/uiSlice'
import { buildEventNotifications, buildResultNotifications } from '../utils/notifications'
import { buildCompetitionNotifications } from '../utils/competitions'
import NotifPanel from './NotifPanel'
import GlobalSearch from './GlobalSearch'
import s from './Layout.module.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faHouse,
  faCalendar,
  faTrophy,
  faClipboardList,
  faBell,
  faUsers,
  faScaleBalanced,
  faMedal,
  faGraduationCap,
  faClockRotateLeft,
  faGear,
  faBars,
  faChartLine
} from '@fortawesome/free-solid-svg-icons'

const NAV_ITEMS = [
  { to: '/dashboard',        icon: <FontAwesomeIcon icon={faHouse} />, label: 'Dashboard',          section: 'main'  },
  { to: '/events',           icon: <FontAwesomeIcon icon={faCalendar} />, label: 'Events',  badge: 3,   section: 'main'  },
  { to: '/competitions',     icon: <FontAwesomeIcon icon={faTrophy} />, label: 'Competitions',       section: 'main'  },
  { to: '/my-registrations', icon: <FontAwesomeIcon icon={faClipboardList} />, label: 'My Registrations',   section: 'main', studentOnly: true },
  { to: '/notice-board',     icon: <FontAwesomeIcon icon={faBell} />, label: 'Notice Board',      section: 'main'  },
  { to: '/students',         icon: <FontAwesomeIcon icon={faUsers} />, label: 'Students', adminOnly: true, section: 'admin' },
  { to: '/judges',           icon: <FontAwesomeIcon icon={faScaleBalanced} />, label: 'Judges', adminOnly: true, section: 'admin' },
  { to: '/results',          icon: <FontAwesomeIcon icon={faMedal} />, label: 'Results',            section: 'admin' },
  { to: '/certificates',    icon: <FontAwesomeIcon icon={faGraduationCap} />, label: 'Certificates',       section: 'admin' },
  { to: '/event-history',   icon: <FontAwesomeIcon icon={faClockRotateLeft} />, label: 'Event History',      section: 'admin' },
  { to: '/reports',          icon: <FontAwesomeIcon icon={faChartLine} />, label: 'Transaction Report', adminOnly: true, section: 'admin' },
  { to: '/settings',         icon: <FontAwesomeIcon icon={faGear} />, label: 'Settings',           section: 'admin' },
]

const PAGE_TITLES = {
  '/dashboard':        'Dashboard',
  '/events':           'Events',
  '/competitions':     'Competitions',
  '/my-registrations': 'My Registrations',
  '/notice-board':     'Notice Board',
  '/students':         'Students',
  '/judges':           'Judges',
  '/results':          'Results',
  '/certificates':     'Certificates',
  '/reports':          'Transaction Report',
  '/settings':         'Settings',
}

export default function Layout({ children }) {
  const dispatch = useDispatch()
  const location = useLocation()
  const { user, role } = useSelector(s => s.auth)
  const notifOpen    = useSelector(s => s.ui.notifPanelOpen)
  const collapsed    = useSelector(s => s.ui.sidebarCollapsed)
  const events       = useSelector(s => s.events.list)
  const results      = useSelector(s => s.results.list)
  const competitions = useSelector(s => s.competitions.list)
  const registrationsList = useSelector(s => s.registrations.list)
  const readIds      = useSelector(s => s.notifications.readIds)
  const [searchOpen, setSearchOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const notifCount = [
    ...buildResultNotifications(results),
    ...buildEventNotifications(events),
    ...buildCompetitionNotifications(competitions, events, registrationsList),
  ].filter(n => !readIds.includes(n.id)).length

  // Cmd/Ctrl + K to open global search
  useEffect(() => {
    function onKey(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(v => !v)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const navItems = NAV_ITEMS.filter(n => (!n.adminOnly || role === 'admin') && (!n.studentOnly || role !== 'admin'))
  const mainItems  = navItems.filter(n => n.section === 'main')
  const adminItems = navItems.filter(n => n.section === 'admin')
  const pageTitle  = PAGE_TITLES[location.pathname]
    || (location.pathname.startsWith('/competitions/') ? 'Competition Invitation' : 'Dashboard')

  return (
    <div
      className={`${s.shell} ${collapsed ? s.collapsed : ''}`}
      onClick={() => notifOpen && dispatch(closeNotifPanel())}
    >
      {/* ── MOBILE OVERLAY ──────────────────────────── */}
      {mobileMenuOpen && (
        <div className={s.mobileOverlay} onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* ── SIDEBAR ─────────────────────────────── */}
      <aside className={`${s.sidebar} ${mobileMenuOpen ? s.sidebarMobileOpen : ''}`}>
        <div className={s.sidebarInner}>

          {/* Logo */}
          <div className={s.logo}>
            <div className={s.logoMark}>
              <span className={s.logoIcon}>🎭</span>
            </div>
            {!collapsed && (
              <div className={s.logoText}>
                <span className={s.logoTitle}>CultureSync</span>
                <span className={s.logoSub}>Sri Parasakthi College</span>
              </div>
            )}
          </div>

          <div className={s.goldLine} />

          {/* Nav */}
          <nav className={s.nav}>
            <div className={s.navGroup}>
              {!collapsed && <span className={s.navGroupLabel}>Navigation</span>}
              {mainItems.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => `${s.navItem} ${isActive ? s.active : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className={s.navIcon}>{item.icon}</span>
                  {!collapsed && <span className={s.navLabel}>{item.label}</span>}
                  {!collapsed && item.to === '/notice-board' && notifCount > 0 && (
                    <span className={s.navBadge}>{notifCount}</span>
                  )}
                  {!collapsed && item.to !== '/notice-board' && item.badge && (
                    <span className={s.navBadge}>{item.badge}</span>
                  )}
                  <div className={s.navGlow} />
                </NavLink>
              ))}
            </div>

            {adminItems.length > 0 && (
              <div className={s.navGroup}>
                {!collapsed && <span className={s.navGroupLabel}>Management</span>}
                {adminItems.map(item => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) => `${s.navItem} ${isActive ? s.active : ''}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className={s.navIcon}>{item.icon}</span>
                    {!collapsed && <span className={s.navLabel}>{item.label}</span>}
                    <div className={s.navGlow} />
                  </NavLink>
                ))}
              </div>
            )}
          </nav>

          {/* User footer */}
          <div className={s.sidebarFooter}>
            <div className={s.goldLine} />
            <div className={s.userCard}>
              <div
                className={s.userAvatar}
                style={{ background: `linear-gradient(135deg, ${user?.color || '#c9a84c'}44, ${user?.color || '#c9a84c'}22)`, color: user?.color || '#c9a84c' }}
              >
                {user?.avatar
                  ? <img src={user.avatar} alt="" className={s.userAvatarImg} />
                  : user?.initials}
              </div>
              {!collapsed && (
                <div className={s.userInfo}>
                  <span className={s.userName}>{user?.name}</span>
                  <span className={s.userDept}>{user?.department}</span>
                </div>
              )}
            </div>
            {!collapsed && (
              <button className={s.logoutBtn} onClick={() => dispatch(logout())}>
                <span>↪</span> Sign out
              </button>
            )}
          </div>
        </div>

        {/* Collapse toggle */}
        <button
          className={s.collapseBtn}
          onClick={e => { e.stopPropagation(); dispatch(toggleSidebar()) }}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? '›' : '‹'}
        </button>
      </aside>

      {/* ── MAIN AREA ────────────────────────────── */}
      <div className={s.main}>
        {/* Topbar */}
        <header className={s.topbar}>
          <div className={s.topLeft}>
            <button 
              className={s.hamburgerBtn}
              onClick={(e) => { e.stopPropagation(); setMobileMenuOpen(true); }}
            >
              <FontAwesomeIcon icon={faBars} />
            </button>
            <div className={s.pageTitle}>
              <span className={s.pageTitleText}>{pageTitle}</span>
              <span className={s.pageTitleLine} />
            </div>
          </div>

          <div className={s.topRight}>
            <div className={s.searchWrap} onClick={() => setSearchOpen(true)} style={{ cursor: 'pointer' }}>
              <span className={s.searchIcon}>⌕</span>
              <span className={s.searchInput} style={{ color: 'var(--muted)', userSelect: 'none' }}>
                Search events, students…
              </span>
              <kbd className={s.searchKbd}>⌘K</kbd>
            </div>

            <button
              className={s.iconBtn}
              onClick={e => { e.stopPropagation(); dispatch(toggleNotifPanel()) }}
            >
              <span><FontAwesomeIcon icon={faBell}/></span>
              {notifCount > 0 && <span className={`${s.notifDot} pulse`} />}
            </button>

            <div className={s.topUserChip}>
              <div 
                className={s.topAvatar}
                style={{ background: `linear-gradient(135deg, ${user?.color || '#c9a84c'}44, ${user?.color || '#c9a84c'}22)`, color: user?.color || '#c9a84c' }}
              >
                {user?.avatar
                  ? <img src={user.avatar} alt="" className={s.topAvatarImg} />
                  : user?.initials}
              </div>
              <span className={s.topRole}>{role}</span>
            </div>
          </div>
        </header>

        {/* Notification panel */}
        <NotifPanel />

        {/* Global search */}
        <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />

        {/* Page content */}
        <main className={s.content}>
          {children}
        </main>
      </div>
    </div>
  )
}
