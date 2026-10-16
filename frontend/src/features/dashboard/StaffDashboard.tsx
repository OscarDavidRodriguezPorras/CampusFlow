import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../auth/AuthContext'
import { api } from '../../lib/api'
import type { Reservation, Loan, Incident } from '../../types'
import StatusBadge from '../../components/StatusBadge'
import { CalendarCheck, Package, AlertTriangle, Loader2, CheckCircle, XCircle, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

const card = { background: 'rgba(5,20,15,0.75)', backdropFilter: 'blur(10px)', border: '1px solid rgba(16,185,129,0.1)' }

function KpiCard({ label, value, sub, color }: { label: string; value: number; sub: string; color: string }) {
  return (
    <div className="rounded-xl p-5" style={card}>
      <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-3xl font-bold" style={{ color }}>{value}</p>
      <p className="text-xs text-slate-500 mt-1">{sub}</p>
    </div>
  )
}

export default function StaffDashboard() {
  const { user } = useAuth()
  const qc = useQueryClient()

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

  const updateReservation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => api.patch(`/reservations/${id}`, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reservations'] }),
  })
  const updateLoan = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => api.patch(`/loans/${id}`, { status }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['loans'] }); qc.invalidateQueries({ queryKey: ['equipment'] }) },
  })

  const pendingReservations = reservations.filter(r => r.status === 'pending')
  const pendingLoans = loans.filter(l => l.status === 'pending')
  const openIncidents = incidents.filter(i => ['open', 'assigned'].includes(i.status))
  const deliveredLoans = loans.filter(l => l.status === 'delivered')

  if (r1 || r2 || r3) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="animate-spin text-emerald-400" size={32} />
    </div>
  )

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-emerald-400 tracking-widest uppercase font-semibold">Panel operativo</span>
        </div>
        <h1 className="text-3xl font-bold text-white">
          Panel de operaciones
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          {user?.full_name} · {new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <KpiCard label="Reservas pendientes" value={pendingReservations.length} sub="requieren aprobación" color="#fbbf24" />
        <KpiCard label="Préstamos pendientes" value={pendingLoans.length} sub="por aprobar" color="#60a5fa" />
        <KpiCard label="Equipos en campo" value={deliveredLoans.length} sub="actualmente prestados" color="#34d399" />
        <KpiCard label="Incidencias abiertas" value={openIncidents.length} sub="sin asignar" color="#f87171" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Cola de reservas pendientes */}
        <div className="rounded-xl overflow-hidden" style={card}>
          <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(16,185,129,0.1)' }}>
            <h2 className="font-semibold text-white flex items-center gap-2">
              <CalendarCheck size={16} className="text-emerald-400" /> Reservas por aprobar
              {pendingReservations.length > 0 && (
                <span className="bg-yellow-500/20 text-yellow-300 text-xs px-2 py-0.5 rounded-full">{pendingReservations.length}</span>
              )}
            </h2>
            <Link to="/reservations" className="text-xs text-emerald-400 hover:text-emerald-300">Ver todas →</Link>
          </div>
          {pendingReservations.length === 0 ? (
            <div className="py-10 text-center">
              <CheckCircle size={28} className="mx-auto text-emerald-700 mb-2" />
              <p className="text-slate-500 text-sm">Todo al día ✓</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {pendingReservations.slice(0, 4).map(r => (
                <div key={r.id} className="px-5 py-3 flex items-center justify-between gap-3 hover:bg-white/5">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-200 truncate">{r.title}</p>
                    <p className="text-xs text-slate-500">{r.attendees_count} personas · Espacio #{r.space_id}</p>
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0">
                    <button onClick={() => updateReservation.mutate({ id: r.id, status: 'approved' })}
                      className="p-1.5 rounded-lg transition-colors text-emerald-400 hover:bg-emerald-900/40">
                      <CheckCircle size={16} />
                    </button>
                    <button onClick={() => updateReservation.mutate({ id: r.id, status: 'rejected' })}
                      className="p-1.5 rounded-lg transition-colors text-red-400 hover:bg-red-900/40">
                      <XCircle size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Incidencias abiertas */}
        <div className="rounded-xl overflow-hidden" style={card}>
          <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(16,185,129,0.1)' }}>
            <h2 className="font-semibold text-white flex items-center gap-2">
              <AlertTriangle size={16} className="text-red-400" /> Incidencias abiertas
              {openIncidents.length > 0 && (
                <span className="bg-red-500/20 text-red-300 text-xs px-2 py-0.5 rounded-full">{openIncidents.length}</span>
              )}
            </h2>
            <Link to="/incidents" className="text-xs text-emerald-400 hover:text-emerald-300">Ver todas →</Link>
          </div>
          {openIncidents.length === 0 ? (
            <div className="py-10 text-center">
              <CheckCircle size={28} className="mx-auto text-emerald-700 mb-2" />
              <p className="text-slate-500 text-sm">Sin incidencias pendientes ✓</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {openIncidents.slice(0, 4).map(inc => (
                <div key={inc.id} className="px-5 py-3 flex items-center justify-between hover:bg-white/5">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-200 truncate">{inc.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <StatusBadge status={inc.priority} />
                      {inc.location && <span className="text-xs text-slate-500">📍 {inc.location}</span>}
                    </div>
                  </div>
                  <StatusBadge status={inc.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
