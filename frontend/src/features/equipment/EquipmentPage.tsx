import { useQuery } from '@tanstack/react-query'
import { api } from '../../lib/api'
import type { Equipment } from '../../types'
import StatusBadge from '../../components/StatusBadge'
import { Package, Loader2, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { useRoleTheme } from '../../hooks/useRoleTheme'

const categoryLabel: Record<string, string> = {
  laptop: 'Laptop', tablet: 'Tableta', projector: 'Proyector',
  camera: 'Cámara', cable: 'Cable/Adaptador', other: 'Otro',
}

export default function EquipmentPage() {
  const { user } = useAuth()
  const theme = useRoleTheme()
  const { data: equipment, isLoading } = useQuery({
    queryKey: ['equipment'],
    queryFn: () => api.get<Equipment[]>('/equipment').then(r => r.data),
  })

  const card = { background: theme.cardBg, backdropFilter: 'blur(10px)', border: `1px solid ${theme.accent}18` }

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
            <span className="text-xs uppercase tracking-widest font-semibold" style={{ color: theme.accent }}>Inventario</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Equipos del campus</h1>
          <p className="text-slate-400 text-sm mt-0.5">{equipment?.length ?? 0} equipos registrados</p>
        </div>
        {user?.role === 'admin' && (
          <Link to="/equipment/new"
            className="flex items-center gap-2 text-white text-sm font-medium px-4 py-2 rounded-lg"
            style={{ background: theme.gradient, boxShadow: `0 4px 16px ${theme.accentGlow}` }}>
            <Plus size={16} /> Nuevo equipo
          </Link>
        )}
      </div>

      <div className="rounded-xl overflow-hidden" style={card}>
        {equipment?.length === 0 ? (
          <div className="py-16 text-center">
            <Package size={36} className="mx-auto mb-3" style={{ color: `${theme.accent}40` }} />
            <p className="text-slate-500">No hay equipos registrados</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead style={{ borderBottom: `1px solid ${theme.accent}15` }}>
              <tr style={{ background: `${theme.accent}08` }}>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Código</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Nombre</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Categoría</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Estado</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Acción</th>
              </tr>
            </thead>
            <tbody>
              {equipment?.map(eq => (
                <tr key={eq.id} style={{ borderBottom: `1px solid ${theme.accent}08` }}
                  onMouseEnter={e => (e.currentTarget.style.background = `${theme.accent}06`)}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">{eq.inventory_code}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-200">{eq.name}</p>
                    {eq.description && <p className="text-xs text-slate-500">{eq.description}</p>}
                  </td>
                  <td className="px-4 py-3 text-slate-400 hidden md:table-cell">{categoryLabel[eq.category]}</td>
                  <td className="px-4 py-3"><StatusBadge status={eq.status} /></td>
                  <td className="px-4 py-3 text-right">
                    {eq.status === 'available' && (
                      <Link to={`/loans/new?equipment_id=${eq.id}`}
                        className="text-xs px-3 py-1.5 rounded-lg font-medium"
                        style={{ background: `${theme.accent}18`, color: theme.accentLight, border: `1px solid ${theme.accent}25` }}>
                        Solicitar préstamo
                      </Link>
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
