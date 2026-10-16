import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../features/auth/AuthContext'
import RoleBackground from './RoleBackground'
import AiChat from '../features/ai/AiChat'
import { getTheme } from '../lib/roleTheme'
import {
  LayoutDashboard, CalendarCheck, Package, AlertTriangle,
  Users, BookOpen, LogOut, Menu, X, Rocket, ClipboardList,
} from 'lucide-react'

const navItems = [
  { to: '/',             label: 'Dashboard',   icon: LayoutDashboard, roles: ['student','admin'] },
  { to: '/spaces',       label: 'Espacios',    icon: Rocket,          roles: ['student','admin'] },
  { to: '/reservations', label: 'Reservas',    icon: CalendarCheck,   roles: ['student','admin'] },
  { to: '/equipment',    label: 'Inventario',  icon: Package,         roles: ['student','admin'] },
  { to: '/loans',        label: 'Préstamos',   icon: ClipboardList,   roles: ['student','admin'] },
  { to: '/incidents',    label: 'Incidencias', icon: AlertTriangle,   roles: ['student','admin'] },
  { to: '/users',        label: 'Usuarios',    icon: Users,           roles: ['admin'] },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const role = user?.role ?? 'student'
  const theme = getTheme(role)

  const handleLogout = () => { logout(); navigate('/login') }
  const filteredNav = navItems.filter(item => user && item.roles.includes(user.role))

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5" style={{ borderBottom: `1px solid ${theme.sidebarBorder}` }}>
        <img src="/images/logo.png" alt="CampusFlow" className="h-8 w-auto object-contain" />
        <div>
          <p className="font-bold text-white text-sm tracking-wide">CampusFlow</p>
          <p className="text-xs" style={{ color: theme.accentLight, opacity: 0.7 }}>{theme.greeting}</p>
        </div>
      </div>

      {/* Role badge */}
      <div className="px-4 py-3" style={{ borderBottom: `1px solid ${theme.sidebarBorder}` }}>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: theme.badgeBg }}>
          <div className="w-2 h-2 rounded-full" style={{ background: theme.accent, boxShadow: `0 0 6px ${theme.accent}` }} />
          <span className="text-xs font-semibold tracking-wide uppercase" style={{ color: theme.badgeColor }}>
            {theme.roleLabel}
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {filteredNav.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive ? 'active-nav-link' : 'inactive-nav-link'
              }`
            }
            style={({ isActive }) => isActive ? {
              background: theme.activeLinkBg,
              color: theme.activeLinkColor,
              border: `1px solid ${theme.accent}20`,
              boxShadow: `0 0 12px ${theme.accentGlow}`,
            } : {
              color: 'rgba(148,163,184,1)',
              border: '1px solid transparent',
            }}
          >
            <item.icon size={17} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User info */}
      <div className="px-3 py-4" style={{ borderTop: `1px solid ${theme.sidebarBorder}` }}>
        <div className="flex items-center gap-3 px-2 py-2 mb-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: theme.badgeBg, border: `1px solid ${theme.accent}30` }}>
            <span className="font-bold text-sm" style={{ color: theme.accentLight }}>
              {user?.full_name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-200 truncate">{user?.full_name}</p>
            <p className="text-xs truncate" style={{ color: theme.accentLight, opacity: 0.6 }}>{user?.email}</p>
          </div>
        </div>
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-500 hover:text-red-400 rounded-lg transition-colors"
          style={{ background: 'transparent' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.08)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          <LogOut size={15} />
          Cerrar sesión
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#050b18' }}>
      <RoleBackground role={role} />

      {/* Sidebar desktop */}
      <aside className="relative z-10 hidden lg:flex flex-col w-56 flex-shrink-0"
        style={{
          background: theme.sidebarBg,
          backdropFilter: 'blur(16px)',
          borderRight: `1px solid ${theme.sidebarBorder}`,
          boxShadow: `4px 0 24px rgba(0,0,0,0.3)`,
        }}>
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 z-50"
            style={{ background: theme.sidebarBg, backdropFilter: 'blur(16px)', borderRight: `1px solid ${theme.sidebarBorder}` }}>
            <button className="absolute top-4 right-4 text-slate-500 hover:text-slate-300" onClick={() => setSidebarOpen(false)}>
              <X size={20} />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="relative z-10 flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header mobile */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3"
          style={{
            background: theme.sidebarBg,
            backdropFilter: 'blur(12px)',
            borderBottom: `1px solid ${theme.sidebarBorder}`,
          }}>
          <button onClick={() => setSidebarOpen(true)} className="text-slate-400">
            <Menu size={22} />
          </button>
          <img src="/images/logo.png" alt="CampusFlow" className="h-7 w-auto object-contain" />
          <span className="font-bold text-white text-sm">CampusFlow</span>
          <div className="ml-auto px-2 py-0.5 rounded-full text-xs font-semibold"
            style={{ background: theme.badgeBg, color: theme.badgeColor }}>
            {theme.roleLabel}
          </div>
        </header>

        {/* Barra de acento superior */}
        <div style={{
          height: 2,
          background: `linear-gradient(90deg, transparent, ${theme.accent}, ${theme.accentDark}, transparent)`,
          opacity: 0.6,
        }} />

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Chat IA flotante — disponible en todas las páginas */}
      <AiChat />
    </div>
  )
}
