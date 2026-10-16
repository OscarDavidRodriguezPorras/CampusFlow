import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, getErrorMessage } from '../../lib/api'
import type { User } from '../../types'
import { useRoleTheme } from '../../hooks/useRoleTheme'
import { Users, Loader2, Shield, UserCheck, GraduationCap } from 'lucide-react'
import { useState } from 'react'

const roleLabel: Record<string, string> = { student: 'Estudiante', staff: 'Personal', admin: 'Administrador' }
const roleIcon: Record<string, React.ElementType> = { student: GraduationCap, staff: UserCheck, admin: Shield }
const roleColor: Record<string, string> = {
  student: '#3b82f6', staff: '#10b981', admin: '#f59e0b',
}

export default function UsersPage() {
  const theme = useRoleTheme()
  const qc = useQueryClient()
  const [error, setError] = useState('')

  const card = { background: theme.cardBg, backdropFilter: 'blur(10px)', border: `1px solid ${theme.accent}18` }

  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => api.get<User[]>('/users').then(r => r.data),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, role }: { id: number; role: string }) => api.patch(`/users/${id}`, { role }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
    onError: (e) => setError(getErrorMessage(e)),
  })

  const toggleMutation = useMutation({
    mutationFn: ({ id, is_active }: { id: number; is_active: boolean }) => api.patch(`/users/${id}`, { is_active }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
    onError: (e) => setError(getErrorMessage(e)),
  })

  if (isLoading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="animate-spin" size={32} style={{ color: theme.accent }} />
    </div>
  )

  const counts = {
    student: users?.filter(u => u.role === 'student').length ?? 0,
    staff: users?.filter(u => u.role === 'staff').length ?? 0,
    admin: users?.filter(u => u.role === 'admin').length ?? 0,
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: theme.accent }} />
          <span className="text-xs uppercase tracking-widest font-semibold" style={{ color: theme.accent }}>Gestión de usuarios</span>
        </div>
        <h1 className="text-2xl font-bold text-white">Usuarios del sistema</h1>
        <p className="text-slate-400 text-sm mt-0.5">{users?.length ?? 0} usuarios registrados</p>
      </div>

      {/* Resumen por rol */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {(['student', 'staff', 'admin'] as const).map(r => {
          const Icon = roleIcon[r]
          return (
            <div key={r} className="rounded-xl p-4 flex items-center gap-4" style={card}>
              <div className="p-2.5 rounded-xl" style={{ background: `${roleColor[r]}15` }}>
                <Icon size={18} style={{ color: roleColor[r] }} />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{counts[r]}</p>
                <p className="text-xs text-slate-500">{roleLabel[r]}s</p>
              </div>
            </div>
          )
        })}
      </div>

      {error && (
        <div className="mb-4 rounded-lg px-4 py-3 border border-red-500/20" style={{ background: 'rgba(239,68,68,0.08)' }}>
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <div className="rounded-xl overflow-hidden" style={card}>
        <table className="w-full text-sm">
          <thead style={{ borderBottom: `1px solid ${theme.accent}15` }}>
            <tr style={{ background: `${theme.accent}08` }}>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Usuario</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Correo</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Rol</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Estado</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users?.map(u => {
              const Icon = roleIcon[u.role]
              return (
                <tr key={u.id} style={{ borderBottom: `1px solid ${theme.accent}08` }}
                  onMouseEnter={e => (e.currentTarget.style.background = `${theme.accent}06`)}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: `${roleColor[u.role]}15` }}>
                        <span className="text-sm font-bold" style={{ color: roleColor[u.role] }}>
                          {u.full_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <p className="font-medium text-slate-200">{u.full_name}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-400 hidden md:table-cell font-mono text-xs">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-full font-medium"
                      style={{ background: `${roleColor[u.role]}15`, color: roleColor[u.role] }}>
                      <Icon size={11} /> {roleLabel[u.role]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.is_active
                      ? 'bg-emerald-900/40 text-emerald-300'
                      : 'bg-slate-800/60 text-slate-500'}`}>
                      {u.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {/* Cambiar rol */}
                      <select
                        value={u.role}
                        onChange={e => updateMutation.mutate({ id: u.id, role: e.target.value })}
                        className="text-xs px-2 py-1 rounded-lg"
                        style={{ background: `${theme.accent}12`, color: theme.accentLight, border: `1px solid ${theme.accent}25` }}>
                        <option value="student" className="bg-slate-900">Estudiante</option>
                        <option value="staff" className="bg-slate-900">Personal</option>
                        <option value="admin" className="bg-slate-900">Admin</option>
                      </select>
                      {/* Activar / desactivar */}
                      <button
                        onClick={() => toggleMutation.mutate({ id: u.id, is_active: !u.is_active })}
                        className="text-xs px-2 py-1 rounded-lg font-medium"
                        style={u.is_active
                          ? { background: 'rgba(239,68,68,0.12)', color: '#fca5a5' }
                          : { background: 'rgba(16,185,129,0.12)', color: '#6ee7b7' }}>
                        {u.is_active ? 'Desactivar' : 'Activar'}
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
