import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../auth/AuthContext'
import { api } from '../../lib/api'
import type { Reservation, Loan, Incident } from '../../types'
import StatusBadge from '../../components/StatusBadge'
import { CalendarCheck, Package, AlertTriangle, Clock, Loader2, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'

const card = { background: 'rgba(10,20,50,0.7)', backdropFilter: 'blur(10px)', border: '1px solid rgba(59,130,246,0.1)' }

export default function StudentDashboard() {
  const { user } = useAuth()

  const { data: reservations = [], isLoading: r1 } = useQuery({
    queryKey: ['reservations', 'me'],
    queryFn: () => api.get<Reservation[]>('/reservations/me').then(r => r.data),
  })
  const { data: loans = [], isLoading: r2 } = useQuery({
    queryKey: ['loans', 'me'],
    queryFn: () => api.get<Loan[]>('/loans/me').then(r => r.data),
  })
  const { data: incidents = [], isLoading: r3 } = useQuery({
    queryKey: ['incidents', 'me'],
    queryFn: () => api.get<Incident[]>('/incidents/me').then(r => r.data),
  })

  const upcoming = reservations.filter(r => r.status === 'approved' && new Date(r.start_time) > new Date())
  const activeLoans = loans.filter(l => ['delivered', 'approved'].includes(l.status))
  const openIncidents = incidents.filter(i => !['resolved', 'closed'].includes(i.status))
  const pending = reservations.filter(r => r.status === 'pending')

  if (r1 || r2 || r3) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="animate-spin text-blue-400" size={32} />
    </div>
  )

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
          <span className="text-xs text-blue-400 tracking-widest uppercase font-semibold">Portal estudiantil</span>
        </div>
        <h1 className="text-3xl font-bold text-white">
          Hola, {user?.full_name.split(' ')[0]} 👋
        </h1>
        <p className="text-slate-400 text-sm mt-1">¿Qué quieres hacer hoy?</p>
      </div>

      {/* Accesos rápidos */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {[
          {
            to: '/spaces',
            icon: <CalendarCheck size={26} className="text-white" />,
            label: 'Reservar un espacio',
            sub: 'Aulas, labs y cubículos',
            gradient: 'linear-gradient(135deg,#1d4ed8 0%,#7c3aed 100%)',
            glow: 'rgba(99,102,241,0.35)',
          },
          {
            to: '/loans/new',
            icon: <Package size={26} className="text-white" />,
            label: 'Solicitar un préstamo',
            sub: 'Laptops, proyectores y más',
            gradient: 'linear-gradient(135deg,#059669 0%,#0891b2 100%)',
            glow: 'rgba(16,185,129,0.35)',
          },
          {
            to: '/incidents/new',
            icon: <AlertTriangle size={26} className="text-white" />,
            label: 'Reportar incidencia',
            sub: 'Problemas técnicos o daños',
            gradient: 'linear-gradient(135deg,#dc2626 0%,#f97316 100%)',
            glow: 'rgba(239,68,68,0.35)',
          },
        ].map(a => (
          <Link key={a.to} to={a.to}
            className="flex flex-col items-center gap-2 p-5 rounded-2xl transition-all hover:scale-[1.03] hover:-translate-y-1 text-center"
            style={{
              background: a.gradient,
              boxShadow: `0 4px 20px ${a.glow}`,
              border: '1px solid rgba(255,255,255,0.1)',
            }}
            onMouseEnter={e => (e.currentTarget.style.boxShadow = `0 8px 28px ${a.glow}`)}
            onMouseLeave={e => (e.currentTarget.style.boxShadow = `0 4px 20px ${a.glow}`)}>
            <div className="bg-white/15 p-3 rounded-xl mb-1">
              {a.icon}
            </div>
            <span className="text-sm text-white font-bold leading-tight">{a.label}</span>
            <span className="text-xs text-white/60">{a.sub}</span>
          </Link>
        ))}
      </div>

      {/* Próximas reservas */}
      <div className="rounded-xl overflow-hidden mb-4" style={card}>
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(59,130,246,0.1)' }}>
          <h2 className="font-semibold text-white flex items-center gap-2">
            <CalendarCheck size={16} className="text-blue-400" /> Mis próximas reservas
          </h2>
          <Link to="/reservations" className="text-xs text-blue-400 hover:text-blue-300">Ver todas →</Link>
        </div>
        {upcoming.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-slate-500 text-sm">No tienes reservas próximas</p>
            <Link to="/spaces" className="text-xs text-blue-400 hover:underline mt-1 inline-block">Explorar espacios</Link>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {upcoming.slice(0, 3).map(r => (
              <div key={r.id} className="px-5 py-3 flex items-center justify-between hover:bg-white/5 transition-colors">
                <div>
                  <p className="text-sm font-medium text-slate-200">{r.title}</p>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <Clock size={10} /> {new Date(r.start_time).toLocaleString('es-CO', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' })}
                  </p>
                </div>
                <StatusBadge status={r.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
