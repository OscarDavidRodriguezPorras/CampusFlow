import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, getErrorMessage } from '../../lib/api'
import type { Incident } from '../../types'
import StatusBadge from '../../components/StatusBadge'
import { useAuth } from '../auth/AuthContext'
import { AlertTriangle, Loader2, Plus, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useState } from 'react'

const categoryLabel: Record<string, string> = {
  hardware: 'Hardware', software: 'Software', network: 'Red',
  infrastructure: 'Infraestructura', safety: 'Seguridad', other: 'Otro',
}
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
}
const cardStyle = { background: 'rgba(15,20,45,0.7)', backdropFilter: 'blur(8px)' }

export default function IncidentsPage() {
  const { user } = useAuth()
  const qc = useQueryClient()
  const isStudent = user?.role === 'student'
  const [error, setError] = useState('')

  const { data: incidents, isLoading } = useQuery({
    queryKey: ['incidents', isStudent ? 'me' : 'all'],
    queryFn: () => api.get<Incident[]>(isStudent ? '/incidents/me' : '/incidents').then(r => r.data),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      api.patch(`/incidents/${id}`, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['incidents'] }),
    onError: (e) => setError(getErrorMessage(e)),
  })

  if (isLoading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="animate-spin text-blue-400" size={32} />
    </div>
  )

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Incidencias</h1>
          <p className="text-slate-400 text-sm mt-1">{incidents?.length ?? 0} incidencias registradas</p>
        </div>
        <Link to="/incidents/new"
          className="flex items-center gap-2 text-white text-sm font-medium px-4 py-2 rounded-lg"
          style={{ background: 'linear-gradient(135deg, #1d4ed8, #1e3a8a)' }}>
          <Plus size={16} /> Reportar incidencia
        </Link>
      </div>

      {error && (
        <div className="mb-4 rounded-lg px-4 py-3 flex items-center justify-between border border-red-500/20"
          style={{ background: 'rgba(239,68,68,0.1)' }}>
          <p className="text-red-400 text-sm">{error}</p>
          <button onClick={() => setError('')}><X size={16} className="text-red-400" /></button>
        </div>
      )}

      <div className="space-y-3">
        {incidents?.length === 0 ? (
          <div className="rounded-xl border border-white/5 py-16 text-center" style={cardStyle}>
            <AlertTriangle className="mx-auto text-slate-700 mb-3" size={40} />
            <p className="text-slate-500">No hay incidencias registradas</p>
          </div>
        ) : (
          incidents?.map(inc => (
            <div key={inc.id} className="rounded-xl border border-white/5 p-5 hover:border-blue-500/10 transition-all"
              style={cardStyle}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-semibold text-white">{inc.title}</h3>
                    <StatusBadge status={inc.priority} />
                    {inc.ai_suggested_priority && inc.ai_suggested_priority !== inc.priority && (
                      <span className="text-xs bg-violet-900/40 text-violet-300 px-2 py-0.5 rounded-full border border-violet-500/20">
                        🤖 IA sugiere: {inc.ai_suggested_priority}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-400 mb-2">{inc.description}</p>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-xs text-slate-500">{categoryLabel[inc.category]}</span>
                    {inc.location && <span className="text-xs text-slate-500">📍 {inc.location}</span>}
                    <span className="text-xs text-slate-500">{formatDate(inc.created_at)}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <StatusBadge status={inc.status} />
                  {!isStudent && inc.status !== 'closed' && inc.status !== 'resolved' && (
                    <div className="flex gap-1.5">
                      {inc.status === 'open' && (
                        <button onClick={() => updateMutation.mutate({ id: inc.id, status: 'in_progress' })}
                          className="text-xs bg-blue-900/40 hover:bg-blue-900/60 text-blue-300 px-2 py-1 rounded-lg font-medium border border-blue-500/20">
                          En proceso
                        </button>
                      )}
                      {['open','assigned','in_progress'].includes(inc.status) && (
                        <button onClick={() => updateMutation.mutate({ id: inc.id, status: 'resolved' })}
                          className="text-xs bg-emerald-900/40 hover:bg-emerald-900/60 text-emerald-300 px-2 py-1 rounded-lg font-medium border border-emerald-500/20">
                          Resolver
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
