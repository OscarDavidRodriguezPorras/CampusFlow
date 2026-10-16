import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, getErrorMessage } from '../../lib/api'
import type { Loan } from '../../types'
import StatusBadge from '../../components/StatusBadge'
import { useAuth } from '../auth/AuthContext'
import { useRoleTheme } from '../../hooks/useRoleTheme'
import { Package, Loader2, Plus, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useState } from 'react'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function LoansPage() {
  const { user } = useAuth()
  const theme = useRoleTheme()
  const qc = useQueryClient()
  const isStudent = user?.role === 'student'
  const [error, setError] = useState('')

  const card = { background: theme.cardBg, backdropFilter: 'blur(10px)', border: `1px solid ${theme.accent}18` }

  const { data: loans, isLoading } = useQuery({
    queryKey: ['loans', isStudent ? 'me' : 'all'],
    queryFn: () => api.get<Loan[]>(isStudent ? '/loans/me' : '/loans').then(r => r.data),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => api.patch(`/loans/${id}`, { status }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['loans'] }); qc.invalidateQueries({ queryKey: ['equipment'] }) },
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
            <span className="text-xs uppercase tracking-widest font-semibold" style={{ color: theme.accent }}>Préstamos</span>
          </div>
          <h1 className="text-2xl font-bold text-white">
            {isStudent ? 'Mis préstamos' : 'Gestión de préstamos'}
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">{loans?.length ?? 0} préstamos en total</p>
        </div>
        <Link to="/loans/new"
          className="flex items-center gap-2 text-white text-sm font-medium px-4 py-2 rounded-lg"
          style={{ background: theme.gradient, boxShadow: `0 4px 16px ${theme.accentGlow}` }}>
          <Plus size={16} /> Solicitar préstamo
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
        {loans?.length === 0 ? (
          <div className="py-16 text-center">
            <Package size={36} className="mx-auto mb-3" style={{ color: `${theme.accent}40` }} />
            <p className="text-slate-500">No hay préstamos registrados</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead style={{ borderBottom: `1px solid ${theme.accent}15` }}>
              <tr style={{ background: `${theme.accent}08` }}>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Equipo</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Devolución</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Estado</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loans?.map(loan => (
                <tr key={loan.id} style={{ borderBottom: `1px solid ${theme.accent}08` }}
                  onMouseEnter={e => (e.currentTarget.style.background = `${theme.accent}06`)}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-200">Equipo #{loan.equipment_id}</p>
                    {loan.purpose && <p className="text-xs text-slate-500">{loan.purpose}</p>}
                  </td>
                  <td className="px-4 py-3 text-slate-400 hidden md:table-cell">{formatDate(loan.requested_return_date)}</td>
                  <td className="px-4 py-3"><StatusBadge status={loan.status} /></td>
                  <td className="px-4 py-3 text-right">
                    {!isStudent && (
                      <div className="flex items-center justify-end gap-2">
                        {loan.status === 'pending' && (
                          <button onClick={() => updateMutation.mutate({ id: loan.id, status: 'approved' })}
                            className="text-xs px-2 py-1 rounded-lg font-medium"
                            style={{ background: 'rgba(16,185,129,0.15)', color: '#6ee7b7' }}>
                            Aprobar
                          </button>
                        )}
                        {loan.status === 'approved' && (
                          <button onClick={() => updateMutation.mutate({ id: loan.id, status: 'delivered' })}
                            className="text-xs px-2 py-1 rounded-lg font-medium"
                            style={{ background: `${theme.accent}20`, color: theme.accentLight }}>
                            Entregar
                          </button>
                        )}
                        {loan.status === 'delivered' && (
                          <button onClick={() => updateMutation.mutate({ id: loan.id, status: 'returned' })}
                            className="text-xs px-2 py-1 rounded-lg font-medium"
                            style={{ background: 'rgba(124,58,237,0.15)', color: '#c4b5fd' }}>
                            Devuelto
                          </button>
                        )}
                      </div>
                    )}
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
