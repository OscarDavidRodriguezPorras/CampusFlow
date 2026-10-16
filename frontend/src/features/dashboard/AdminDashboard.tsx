import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../auth/AuthContext'
import { api } from '../../lib/api'
import type { Reservation, Loan, Incident, User, Equipment } from '../../types'
import StatusBadge from '../../components/StatusBadge'
import { Loader2, Users, Package, CalendarCheck, AlertTriangle, TrendingUp, Shield, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useState } from 'react'

const card = { background: 'rgba(15,10,30,0.78)', backdropFilter: 'blur(12px)', border: '1px solid rgba(245,158,11,0.1)' }

type ModalType = 'users' | 'reservations' | 'loans' | 'incidents' | null

// ── Modal con tabla de datos ──────────────────────────────────────────────────
function DataModal({ type, onClose, users, reservations, loans, incidents }: {
  type: ModalType
  onClose: () => void
  users: User[]
  reservations: Reservation[]
  loans: Loan[]
  incidents: Incident[]
}) {
  if (!type) return null

  const titles: Record<string, string> = {
    users: '👥 Usuarios del sistema',
    reservations: '📅 Todas las reservas',
    loans: '📦 Todos los préstamos',
    incidents: '⚠️ Todas las incidencias',
  }

  const roleLabel: Record<string, string> = { student: 'Estudiante', admin: 'Administrador' }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}>
      <div className="w-full max-w-4xl max-h-[80vh] flex flex-col rounded-2xl overflow-hidden"
        style={{ background: 'rgba(10,8,25,0.98)', border: '1px solid rgba(245,158,11,0.2)' }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(245,158,11,0.1)', background: 'rgba(245,158,11,0.05)' }}>
          <h2 className="font-bold text-white text-lg">{titles[type]}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1.5 rounded-lg"
            style={{ background: 'rgba(255,255,255,0.05)' }}>
            <X size={18} />
          </button>
        </div>

        {/* Tabla */}
        <div className="overflow-auto flex-1">

          {/* USUARIOS */}
          {type === 'users' && (
            <table className="w-full text-sm">
              <thead style={{ background: 'rgba(245,158,11,0.06)' }}>
                <tr>
                  {['ID', 'Nombre', 'Correo', 'Rol', 'Estado', 'Registro'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="border-t border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 text-slate-500 font-mono text-xs">#{u.id}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                          style={{ background: 'rgba(245,158,11,0.15)', color: '#fcd34d' }}>
                          {u.full_name.charAt(0)}
                        </div>
                        <span className="text-slate-200 font-medium">{u.full_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-400 font-mono text-xs">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-0.5 rounded-full"
                        style={{ background: u.role === 'admin' ? 'rgba(245,158,11,0.15)' : 'rgba(59,130,246,0.15)', color: u.role === 'admin' ? '#fcd34d' : '#93c5fd' }}>
                        {roleLabel[u.role] ?? u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${u.is_active ? 'bg-emerald-900/40 text-emerald-300' : 'bg-slate-800 text-slate-500'}`}>
                        {u.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">
                      {new Date(u.created_at).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* RESERVAS */}
          {type === 'reservations' && (
            <table className="w-full text-sm">
              <thead style={{ background: 'rgba(245,158,11,0.06)' }}>
                <tr>
                  {['ID', 'Título', 'Espacio', 'Asistentes', 'Inicio', 'Estado'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reservations.map(r => (
                  <tr key={r.id} className="border-t border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 text-slate-500 font-mono text-xs">#{r.id}</td>
                    <td className="px-4 py-3 text-slate-200 font-medium">{r.title}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs">Espacio #{r.space_id}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{r.attendees_count}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs">
                      {new Date(r.start_time).toLocaleString('es-CO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* PRÉSTAMOS */}
          {type === 'loans' && (
            <table className="w-full text-sm">
              <thead style={{ background: 'rgba(245,158,11,0.06)' }}>
                <tr>
                  {['ID', 'Usuario', 'Equipo', 'Propósito', 'Devolución', 'Estado'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loans.map(l => (
                  <tr key={l.id} className="border-t border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 text-slate-500 font-mono text-xs">#{l.id}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs">Usuario #{l.user_id}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs">Equipo #{l.equipment_id}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs max-w-32 truncate">{l.purpose ?? '—'}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs">
                      {new Date(l.requested_return_date).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })}
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={l.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* INCIDENCIAS */}
          {type === 'incidents' && (
            <table className="w-full text-sm">
              <thead style={{ background: 'rgba(245,158,11,0.06)' }}>
                <tr>
                  {['ID', 'Título', 'Categoría', 'Prioridad', 'Ubicación', 'Estado'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {incidents.map(i => (
                  <tr key={i.id} className="border-t border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 text-slate-500 font-mono text-xs">#{i.id}</td>
                    <td className="px-4 py-3 text-slate-200 font-medium max-w-40 truncate">{i.title}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs capitalize">{i.category}</td>
                    <td className="px-4 py-3"><StatusBadge status={i.priority} /></td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{i.location ?? '—'}</td>
                    <td className="px-4 py-3"><StatusBadge status={i.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 flex-shrink-0 text-xs text-slate-500"
          style={{ borderTop: '1px solid rgba(245,158,11,0.08)' }}>
          {type === 'users' && `${users.length} usuarios en total`}
          {type === 'reservations' && `${reservations.length} reservas en total`}
          {type === 'loans' && `${loans.length} préstamos en total`}
          {type === 'incidents' && `${incidents.length} incidencias en total`}
        </div>
      </div>
    </div>
  )
}

// ── Métrica clickeable ────────────────────────────────────────────────────────
function MetricCard({ label, value, icon: Icon, accent, sub, onClick }: {
  label: string; value: number; icon: React.ElementType
  accent: string; sub?: string; onClick: () => void
}) {
  return (
    <button onClick={onClick}
      className="rounded-xl p-5 relative overflow-hidden text-left transition-all hover:scale-[1.02] hover:-translate-y-0.5 w-full"
      style={{ ...card, cursor: 'pointer' }}
      onMouseEnter={e => (e.currentTarget.style.border = `1px solid ${accent}40`)}
      onMouseLeave={e => (e.currentTarget.style.border = '1px solid rgba(245,158,11,0.1)')}>
      <div className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-5"
        style={{ background: accent, transform: 'translate(30%,-30%)' }} />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-widest mb-2">{label}</p>
          <p className="text-4xl font-black" style={{ color: accent }}>{value}</p>
          {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
        </div>
        <div className="p-2.5 rounded-xl" style={{ background: `${accent}15` }}>
          <Icon size={20} style={{ color: accent }} />
        </div>
      </div>
      <p className="text-xs mt-3 font-medium" style={{ color: `${accent}80` }}>
        Ver detalles →
      </p>
    </button>
  )
}

// ── Dashboard Admin ───────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { user } = useAuth()
  const [modal, setModal] = useState<ModalType>(null)

  const { data: reservations = [], isLoading: r1 } = useQuery({
    queryKey: ['reservations', 'all'],
    queryFn: () => api.get<Reservation[]>('/reservations').then(r => r.data),
  })
  const { data: loans = [], isLoading: r2 } = useQuery({
    queryKey: ['loans', 'all'],
    queryFn: () => api.get<Loan[]>('/loans').then(r => r.data),
  })
  const { data: incidents = [], isLoading: r3 } = useQuery({
    queryKey: ['incidents', 'all'],
    queryFn: () => api.get<Incident[]>('/incidents').then(r => r.data),
  })
  const { data: users = [], isLoading: r4 } = useQuery({
    queryKey: ['users'],
    queryFn: () => api.get<User[]>('/users').then(r => r.data),
  })
  const { data: equipment = [], isLoading: r5 } = useQuery({
    queryKey: ['equipment'],
    queryFn: () => api.get<Equipment[]>('/equipment').then(r => r.data),
  })

  if (r1 || r2 || r3 || r4 || r5) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="animate-spin text-yellow-400" size={32} />
    </div>
  )

  const pending = reservations.filter(r => r.status === 'pending')
  const approved = reservations.filter(r => r.status === 'approved')
  const activeLoans = loans.filter(l => ['delivered', 'approved'].includes(l.status))
  const openIncidents = incidents.filter(i => !['resolved', 'closed'].includes(i.status))
  const criticalIncidents = incidents.filter(i => i.priority === 'critical' && !['resolved', 'closed'].includes(i.status))
  const availableEquipment = equipment.filter(e => e.status === 'available')
  const studentCount = users.filter(u => u.role === 'student').length

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Modal */}
      <DataModal
        type={modal}
        onClose={() => setModal(null)}
        users={users}
        reservations={reservations}
        loans={loans}
        incidents={incidents}
      />

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <Shield size={14} className="text-yellow-400" />
          <span className="text-xs text-yellow-400 tracking-widest uppercase font-semibold">Centro de control</span>
        </div>
        <h1 className="text-3xl font-bold text-white">Vista general del sistema</h1>
        <p className="text-slate-400 text-sm mt-1">
          {user?.full_name} · {new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Métricas clickeables */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          label="Usuarios activos"
          value={users.filter(u => u.is_active).length}
          icon={Users} accent="#f59e0b"
          sub={`${studentCount} est. · ${users.filter(u => u.role === 'admin').length} admin`}
          onClick={() => setModal('users')}
        />
        <MetricCard
          label="Reservas totales"
          value={reservations.length}
          icon={CalendarCheck} accent="#3b82f6"
          sub={`${pending.length} pendientes`}
          onClick={() => setModal('reservations')}
        />
        <MetricCard
          label="Préstamos activos"
          value={activeLoans.length}
          icon={Package} accent="#10b981"
          sub={`${availableEquipment.length} equipos libres`}
          onClick={() => setModal('loans')}
        />
        <MetricCard
          label="Incidencias"
          value={openIncidents.length}
          icon={AlertTriangle}
          accent={criticalIncidents.length > 0 ? '#ef4444' : '#f59e0b'}
          sub={criticalIncidents.length > 0 ? `⚠️ ${criticalIncidents.length} críticas` : 'Sin críticas'}
          onClick={() => setModal('incidents')}
        />
      </div>

      {/* Alerta crítica */}
      {criticalIncidents.length > 0 && (
        <div className="mb-6 rounded-xl px-5 py-4 flex items-center gap-4 cursor-pointer"
          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}
          onClick={() => setModal('incidents')}>
          <AlertTriangle size={20} className="text-red-400 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-red-300 font-semibold text-sm">
              {criticalIncidents.length} incidencia{criticalIncidents.length > 1 ? 's' : ''} crítica{criticalIncidents.length > 1 ? 's' : ''} sin resolver
            </p>
            <p className="text-red-400/70 text-xs">{criticalIncidents.map(i => i.title).join(' · ')}</p>
          </div>
          <span className="text-xs text-red-300">Ver →</span>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Actividad reciente */}
        <div className="lg:col-span-2 rounded-xl overflow-hidden" style={card}>
          <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(245,158,11,0.1)' }}>
            <h2 className="font-semibold text-white flex items-center gap-2">
              <TrendingUp size={16} className="text-yellow-400" /> Actividad reciente
            </h2>
            <button onClick={() => setModal('reservations')} className="text-xs text-yellow-400 hover:text-yellow-300">
              Ver todas →
            </button>
          </div>
          <div className="divide-y divide-white/5">
            {reservations.slice(0, 6).map(r => (
              <div key={r.id} className="px-5 py-3 flex items-center justify-between hover:bg-white/5 transition-colors">
                <div>
                  <p className="text-sm font-medium text-slate-200">{r.title}</p>
                  <p className="text-xs text-slate-500">
                    {new Date(r.created_at).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })} · {r.attendees_count} personas
                  </p>
                </div>
                <StatusBadge status={r.status} />
              </div>
            ))}
            {reservations.length === 0 && (
              <div className="py-10 text-center">
                <p className="text-slate-500 text-sm">Sin actividad registrada</p>
              </div>
            )}
          </div>
        </div>

        {/* Panel derecho */}
        <div className="space-y-4">
          {/* Distribución usuarios */}
          <div className="rounded-xl p-5" style={card}>
            <h3 className="font-semibold text-white text-sm mb-4 flex items-center gap-2">
              <Users size={15} className="text-yellow-400" /> Distribución de usuarios
            </h3>
            {[
              { label: 'Estudiantes', count: studentCount, color: '#3b82f6', pct: users.length ? studentCount / users.length : 0 },
              { label: 'Admins', count: users.filter(u => u.role === 'admin').length, color: '#f59e0b', pct: users.length ? users.filter(u => u.role === 'admin').length / users.length : 0 },
            ].map(row => (
              <div key={row.label} className="mb-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">{row.label}</span>
                  <span style={{ color: row.color }} className="font-semibold">{row.count}</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/5">
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${row.pct * 100}%`, background: row.color }} />
                </div>
              </div>
            ))}
          </div>

          {/* Accesos rápidos */}
          <div className="rounded-xl p-5" style={card}>
            <h3 className="font-semibold text-white text-sm mb-3 flex items-center gap-2">
              <Shield size={15} className="text-yellow-400" /> Gestión rápida
            </h3>
            <div className="space-y-2">
              {[
                { to: '/users',     label: 'Gestionar usuarios',  icon: '👥' },
                { to: '/spaces',    label: 'Administrar espacios', icon: '🏫' },
                { to: '/equipment', label: 'Control inventario',   icon: '📦' },
                { to: '/incidents', label: 'Revisar incidencias',  icon: '🔧' },
              ].map(l => (
                <Link key={l.to} to={l.to}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-white transition-all"
                  style={{ background: 'rgba(255,255,255,0.03)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(245,158,11,0.08)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}>
                  <span>{l.icon}</span> {l.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
