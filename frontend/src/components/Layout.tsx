import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../features/auth/AuthContext'
import SpaceBackground from './SpaceBackground'
import {
  LayoutDashboard, CalendarCheck, Package, AlertTriangle,
  Users, BookOpen, LogOut, Menu, X, Rocket
} from 'lucide-react'

const navItems = [
  { to: '/',             label: 'Dashboard',   icon: LayoutDashboard, roles: ['student','staff','admin'] },
  { to: '/spaces',       label: 'Espacios',    icon: Rocket,          roles: ['student','staff','admin'] },
  { to: '/reservations', label: 'Reservas',    icon: CalendarCheck,   roles: ['student','staff','admin'] },
  { to: '/equipment',    label: 'Inventario',  icon: Package,         roles: ['student','staff','admin'] },
  { to: '/loans',        label: 'Préstamos',   icon: Package,         roles: ['student','staff','admin'] },
  { to: '/incidents',    label: 'Incidencias', icon: AlertTriangle,   roles: ['student','staff','admin'] },
  { to: '/users',        label: 'Usuarios',    icon: Users,           roles: ['admin'] },
]

const roleLabel: Record<string, string> = {
  student: 'Estudiante', staff: 'Personal', admin: 'Administrador',
}
const roleBadge: Record<string, string> = {
  student: 'bg-blue-900/60 text-blue-300',
  staff:   'bg-emerald-900/60 text-emerald-300',
  admin:   'bg-violet-900/60 text-violet-300',
}

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => { logout(); navigate('/login') }
  const filteredNav = navItems.filter(item => user && item.roles.includes(user.role))

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/5">
        <img src="/images/logo.png" alt="CampusFlow" className="h-8 w-auto object-contain" />
        <div>
          <p className="font-bold text-white text-sm tracking-wide">CampusFlow</p>
          <p className="text-xs text-blue-400/70">Gestión del campus</p>
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
                isActive
                  ? 'bg-blue-600/20 text-blue-300 border border-blue-500/20'
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
              }`
            }
          >
            <item.icon size={17} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t border-white/5">
        <div className="flex items-center gap-3 px-2 py-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-blue-700/50 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
            <span className="text-blue-200 font-semibold text-sm">
              {user?.full_name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-200 truncate">{user?.full_name}</p>
            <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${roleBadge[user?.role ?? 'student']}`}>
              {roleLabel[user?.role ?? 'student']}
            </span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-500 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition-colors"
        >
          <LogOut size={15} />
          Cerrar sesión
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#050b18' }}>
      <SpaceBackground />

      {/* Sidebar desktop */}
      <aside className="relative z-10 hidden lg:flex flex-col w-56 flex-shrink-0"
        style={{ background: 'rgba(8,14,30,0.85)', backdropFilter: 'blur(12px)', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 z-50"
            style={{ background: 'rgba(8,14,30,0.97)', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
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
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-white/5"
          style={{ background: 'rgba(8,14,30,0.85)', backdropFilter: 'blur(10px)' }}>
          <button onClick={() => setSidebarOpen(true)} className="text-slate-400">
            <Menu size={22} />
          </button>
          <img src="/images/logo.png" alt="CampusFlow" className="h-7 w-auto object-contain" />
          <span className="font-bold text-white text-sm">CampusFlow</span>
        </header>

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
