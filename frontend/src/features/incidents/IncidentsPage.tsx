import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, getErrorMessage } from '../../lib/api'
import type { Incident } from '../../types'
import StatusBadge from '../../components/StatusBadge'
import { useAuth } from '../auth/AuthContext'
import { useRoleTheme } from '../../hooks/useRoleTheme'
import { AlertTriangle, Loader2, Plus, X, CheckCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useState } from 'react'

const categoryLabel: Record<string, string> = {
  hardware: 'Hardware', software: 'Software', network: 'Red',
  infrastructure: 'Infraestructura', safety: 'Seguridad', other: 'Otro',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function IncidentsPage() {
  const { user } = useAuth()
  const theme = useRoleTheme()
  const qc = useQueryClient()
  const isStudent = user?.role === 'student'
  const [error, setError] = useState('')

  const card = { background: theme.cardBg, backdropFilter: 'blur(10px)', border: `1px solid ${theme.accent}18` }

  const { data: incidents, isLoading } = useQuery({
    queryKey: ['incidents', isStudent ? 'me' : 'all'],
    queryFn: () => api.get<Incident[]>(isStudent ? '/incidents/me' : '/incidents').then(r => r.data),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => api.patch(`/incidents/${id}`, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['incidents'] }),
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
            <span className="text-xs uppercase tracking-widest font-semibold" style={{ color: theme.accent }}>Incidencias</span>
          </div>
          <h1 className="text-2xl font-bold text-white">
            {isStudent ? 'Mis reportes' : 'Gestión de incidencias'}
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">{incidents?.length ?? 0} incidencias registradas</p>
        </div>
        <Link to="/incidents/new"
          className="flex items-center gap-2 text-white text-sm font-medium px-4 py-2 rounded-lg"
          style={{ background: theme.gradient, boxShadow: `0 4px 16px ${theme.accentGlow}` }}>
          <Plus size={16} /> Reportar incidencia
        </Link>
      </div>

      {error && (
        <div className="mb-4 rounded-lg px-4 py-3 flex items-center justify-between border border-red-500/20"
          style={{ background: 'rgba(239,68,68,0.08)' }}>
          <p className="text-red-400 text-sm">{error}</p>
          <button onClick={() => setError('')}><X size={16} className="text-red-400" /></button>
        </div>
      )}

      <div className="space-y-3">
        {incidents?.length === 0 ? (
          <div className="rounded-xl py-16 text-center" style={card}>
            <AlertTriangle size={36} className="mx-auto mb-3" style={{ color: `${theme.accent}40` }} />
            <p className="text-slate-500">No hay incidencias registradas</p>
          </div>
        ) : (
          incidents?.map(inc => (
            <div key={inc.id} className="rounded-xl p-5 transition-all"
              style={{ ...card, boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = `${theme.accent}30`)}
              onMouseLeave={e => (e.currentTarget.style.borderColor = `${theme.accent}18`)}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-semibold text-white">{inc.title}</h3>
                    <StatusBadge status={inc.priority} />
                    {inc.ai_suggested_priority && inc.ai_suggested_priority !== inc.priority && (
                      <span className="text-xs px-2 py-0.5 rounded-full border"
                        style={{ background: 'rgba(124,58,237,0.15)', color: '#c4b5fd', borderColor: 'rgba(124,58,237,0.3)' }}>
                        🤖 IA: {inc.ai_suggested_priority}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-400 mb-2">{inc.description}</p>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: `${theme.accent}12`, color: theme.accentLight }}>
                      {categoryLabel[inc.category]}
                    </span>
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
                          className="text-xs px-2 py-1 rounded-lg font-medium"
                          style={{ background: `${theme.accent}15`, color: theme.accentLight }}>
                          En proceso
                        </button>
                      )}
                      {['open', 'assigned', 'in_progress'].includes(inc.status) && (
                        <button onClick={() => updateMutation.mutate({ id: inc.id, status: 'resolved' })}
                          className="text-xs px-2 py-1 rounded-lg font-medium flex items-center gap-1"
                          style={{ background: 'rgba(16,185,129,0.15)', color: '#6ee7b7' }}>
                          <CheckCircle size={11} /> Resolver
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
