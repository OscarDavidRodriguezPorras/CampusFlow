import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, getErrorMessage } from '../../lib/api'
import type { Loan } from '../../types'
import StatusBadge from '../../components/StatusBadge'
import { useAuth } from '../auth/AuthContext'
import { Package, Loader2, Plus, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useState } from 'react'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function LoansPage() {
  const { user } = useAuth()
  const qc = useQueryClient()
  const isStudent = user?.role === 'student'
  const [error, setError] = useState('')

  const { data: loans, isLoading } = useQuery({
    queryKey: ['loans', isStudent ? 'me' : 'all'],
    queryFn: () => api.get<Loan[]>(isStudent ? '/loans/me' : '/loans').then(r => r.data),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, status, return_notes }: { id: number; status: string; return_notes?: string }) =>
      api.patch(`/loans/${id}`, { status, return_notes }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['loans'] })
      qc.invalidateQueries({ queryKey: ['equipment'] })
    },
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
          <h1 className="text-2xl font-bold text-gray-900">Préstamos</h1>
          <p className="text-gray-500 text-sm mt-1">{loans?.length ?? 0} préstamos en total</p>
        </div>
        <Link to="/loans/new"
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          <Plus size={16} /> Solicitar préstamo
        </Link>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex items-center justify-between">
          <p className="text-red-600 text-sm">{error}</p>
          <button onClick={() => setError('')}><X size={16} className="text-red-400" /></button>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loans?.length === 0 ? (
          <div className="py-16 text-center">
            <Package className="mx-auto text-gray-300 mb-3" size={40} />
            <p className="text-gray-500">No hay préstamos registrados</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Equipo ID</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Devolución</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Estado</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loans?.map(loan => (
                <tr key={loan.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">Equipo #{loan.equipment_id}</p>
                    {loan.purpose && <p className="text-xs text-gray-400">{loan.purpose}</p>}
                  </td>
                  <td className="px-4 py-3 text-gray-600 hidden md:table-cell">
                    {formatDate(loan.requested_return_date)}
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={loan.status} /></td>
                  <td className="px-4 py-3 text-right">
                    {!isStudent && (
                      <div className="flex items-center justify-end gap-2">
                        {loan.status === 'pending' && (
                          <button onClick={() => updateMutation.mutate({ id: loan.id, status: 'approved' })}
                            className="text-xs bg-green-50 hover:bg-green-100 text-green-700 px-2 py-1 rounded-lg font-medium">
                            Aprobar
                          </button>
                        )}
                        {loan.status === 'approved' && (
                          <button onClick={() => updateMutation.mutate({ id: loan.id, status: 'delivered' })}
                            className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-2 py-1 rounded-lg font-medium">
                            Entregar
                          </button>
                        )}
                        {loan.status === 'delivered' && (
                          <button onClick={() => updateMutation.mutate({ id: loan.id, status: 'returned' })}
                            className="text-xs bg-purple-50 hover:bg-purple-100 text-purple-700 px-2 py-1 rounded-lg font-medium">
                            Registrar devolución
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
