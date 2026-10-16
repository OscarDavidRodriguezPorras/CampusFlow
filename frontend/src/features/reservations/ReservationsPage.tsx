import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, getErrorMessage } from '../../lib/api'
import type { Reservation } from '../../types'
import StatusBadge from '../../components/StatusBadge'
import { useAuth } from '../auth/AuthContext'
import { useRoleTheme } from '../../hooks/useRoleTheme'
import { Plus, Loader2, Clock, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useState } from 'react'

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('es-CO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function ReservationsPage() {
  const { user } = useAuth()
  const theme = useRoleTheme()
  const qc = useQueryClient()
  const isStudent = user?.role === 'student'
  const [error, setError] = useState('')

  const card = { background: theme.cardBg, backdropFilter: 'blur(10px)', border: `1px solid ${theme.accent}18` }

  const { data: reservations, isLoading } = useQuery({
    queryKey: ['reservations', isStudent ? 'me' : 'all'],
    queryFn: () => api.get<Reservation[]>(isStudent ? '/reservations/me' : '/reservations').then(r => r.data),
  })

  const cancelMutation = useMutation({
    mutationFn: (id: number) => api.patch(`/reservations/${id}/cancel`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['reservations'] }); setError('') },
    onError: (e) => setError(getErrorMessage(e)),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, status, rejection_reason }: { id: number; status: string; rejection_reason?: string }) =>
      api.patch(`/reservations/${id}`, { status, rejection_reason }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reservations'] }),
    onError: (e) => setError(getErrorMessage(e)),
  })

  if (isLoading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="animate-spin" size={32} style={{ color: theme.accent }} />
    </div>
  )

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: theme.accent }} />
            <span className="text-xs uppercase tracking-widest font-semibold" style={{ color: theme.accent }}>Reservas</span>
          </div>
          <h1 className="text-2xl font-bold text-white">
            {isStudent ? 'Mis reservas' : 'Gestión de reservas'}
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">{reservations?.length ?? 0} reservas en total</p>
        </div>
        <Link to="/reservations/new"
          className="flex items-center gap-2 text-white text-sm font-medium px-4 py-2 rounded-lg"
          style={{ background: theme.gradient, boxShadow: `0 4px 16px ${theme.accentGlow}` }}>
          <Plus size={16} /> Nueva reserva
        </Link>
      </div>

      {error && (
        <div className="mb-4 rounded-lg px-4 py-3 flex items-center justify-between border border-red-500/20"
          style={{ background: 'rgba(239,68,68,0.08)' }}>
          <p className="text-red-400 text-sm">{error}</p>
          <button onClick={() => setError('')}><X size={16} className="text-red-400" /></button>
        </div>
      )}

      <div className="rounded-xl overflow-hidden" style={card}>
        {reservations?.length === 0 ? (
          <div className="py-16 text-center">
            <Clock size={36} className="mx-auto mb-3" style={{ color: `${theme.accent}40` }} />
            <p className="text-slate-500 font-medium">No hay reservas registradas</p>
            <Link to="/reservations/new" className="text-sm hover:underline mt-1 inline-block" style={{ color: theme.accent }}>
              Crear primera reserva
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead style={{ borderBottom: `1px solid ${theme.accent}15` }}>
              <tr style={{ background: `${theme.accent}08` }}>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Título</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Inicio</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Fin</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Estado</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {reservations?.map(r => (
                <tr key={r.id} className="transition-colors" style={{ borderBottom: `1px solid ${theme.accent}08` }}
                  onMouseEnter={e => (e.currentTarget.style.background = `${theme.accent}06`)}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-200">{r.title}</p>
                    <p className="text-xs text-slate-500">{r.attendees_count} asistentes</p>
                  </td>
                  <td className="px-4 py-3 text-slate-400 hidden md:table-cell">{formatDate(r.start_time)}</td>
                  <td className="px-4 py-3 text-slate-400 hidden md:table-cell">{formatDate(r.end_time)}</td>
                  <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {!isStudent && r.status === 'pending' && (
                        <>
                          <button onClick={() => updateMutation.mutate({ id: r.id, status: 'approved' })}
                            className="text-xs px-2 py-1 rounded-lg font-medium"
                            style={{ background: 'rgba(16,185,129,0.15)', color: '#6ee7b7' }}>
                            Aprobar
                          </button>
                          <button onClick={() => updateMutation.mutate({ id: r.id, status: 'rejected', rejection_reason: 'No disponible' })}
                            className="text-xs px-2 py-1 rounded-lg font-medium"
                            style={{ background: 'rgba(239,68,68,0.15)', color: '#fca5a5' }}>
                            Rechazar
                          </button>
                        </>
                      )}
                      {['pending', 'approved'].includes(r.status) && (isStudent ? r.user_id === user?.id : true) && (
                        <button onClick={() => cancelMutation.mutate(r.id)} disabled={cancelMutation.isPending}
                          className="text-xs px-2 py-1 rounded-lg font-medium"
                          style={{ background: 'rgba(255,255,255,0.05)', color: '#94a3b8' }}>
                          Cancelar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
