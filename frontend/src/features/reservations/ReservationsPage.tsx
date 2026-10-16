import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, getErrorMessage } from '../../lib/api'
import type { Reservation } from '../../types'
import StatusBadge from '../../components/StatusBadge'
import { useAuth } from '../auth/AuthContext'
import { Plus, Loader2, Clock, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useState } from 'react'

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('es-CO', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

export default function ReservationsPage() {
  const { user } = useAuth()
  const qc = useQueryClient()
  const isStudent = user?.role === 'student'
  const [error, setError] = useState('')

  const { data: reservations, isLoading } = useQuery({
    queryKey: ['reservations', isStudent ? 'me' : 'all'],
    queryFn: () => api.get<Reservation[]>(isStudent ? '/reservations/me' : '/reservations').then(r => r.data),
  })

  const cancelMutation = useMutation({
    mutationFn: (id: number) => api.patch(`/reservations/${id}/cancel`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reservations'] })
      setError('')
    },
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
      <Loader2 className="animate-spin text-primary-600" size={32} />
    </div>
  )

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reservas</h1>
          <p className="text-gray-500 text-sm mt-1">{reservations?.length ?? 0} reservas en total</p>
        </div>
        <Link to="/reservations/new"
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          <Plus size={16} /> Nueva reserva
        </Link>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex items-center justify-between">
          <p className="text-red-600 text-sm">{error}</p>
          <button onClick={() => setError('')}><X size={16} className="text-red-400" /></button>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {reservations?.length === 0 ? (
          <div className="py-16 text-center">
            <Clock className="mx-auto text-gray-300 mb-3" size={40} />
            <p className="text-gray-500 font-medium">No hay reservas registradas</p>
            <Link to="/reservations/new" className="text-sm text-primary-600 hover:underline mt-1 inline-block">
              Crear primera reserva
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Título</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Inicio</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Fin</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Estado</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {reservations?.map(r => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{r.title}</p>
                    <p className="text-xs text-gray-400">{r.attendees_count} asistentes</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{formatDate(r.start_time)}</td>
                  <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{formatDate(r.end_time)}</td>
                  <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {/* Staff/Admin: aprobar o rechazar pendientes */}
                      {!isStudent && r.status === 'pending' && (
                        <>
                          <button
                            onClick={() => updateMutation.mutate({ id: r.id, status: 'approved' })}
                            className="text-xs bg-green-50 hover:bg-green-100 text-green-700 px-2 py-1 rounded-lg font-medium"
                          >Aprobar</button>
                          <button
                            onClick={() => updateMutation.mutate({ id: r.id, status: 'rejected', rejection_reason: 'No disponible' })}
                            className="text-xs bg-red-50 hover:bg-red-100 text-red-700 px-2 py-1 rounded-lg font-medium"
                          >Rechazar</button>
                        </>
                      )}
                      {/* Cancelar: dueño o staff */}
                      {['pending', 'approved'].includes(r.status) && (
                        (isStudent ? r.user_id === user?.id : true) && (
                          <button
                            onClick={() => cancelMutation.mutate(r.id)}
                            disabled={cancelMutation.isPending}
                            className="text-xs bg-gray-50 hover:bg-gray-100 text-gray-600 px-2 py-1 rounded-lg font-medium"
                          >Cancelar</button>
                        )
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
