import { useQuery } from '@tanstack/react-query'
import { api } from '../../lib/api'
import type { Equipment } from '../../types'
import StatusBadge from '../../components/StatusBadge'
import { Package, Loader2, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

const categoryLabel: Record<string, string> = {
  laptop: 'Laptop', tablet: 'Tableta', projector: 'Proyector',
  camera: 'Cámara', cable: 'Cable/Adaptador', other: 'Otro',
}

export default function EquipmentPage() {
  const { user } = useAuth()
  const { data: equipment, isLoading } = useQuery({
    queryKey: ['equipment'],
    queryFn: () => api.get<Equipment[]>('/equipment').then(r => r.data),
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
          <h1 className="text-2xl font-bold text-gray-900">Inventario</h1>
          <p className="text-gray-500 text-sm mt-1">{equipment?.length ?? 0} equipos registrados</p>
        </div>
        {user?.role === 'admin' && (
          <Link to="/equipment/new"
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
            <Plus size={16} /> Nuevo equipo
          </Link>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {equipment?.length === 0 ? (
          <div className="py-16 text-center">
            <Package className="mx-auto text-gray-300 mb-3" size={40} />
            <p className="text-gray-500">No hay equipos registrados</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Código</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Nombre</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Categoría</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Estado</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {equipment?.map(eq => (
                <tr key={eq.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{eq.inventory_code}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{eq.name}</p>
                    {eq.description && <p className="text-xs text-gray-400">{eq.description}</p>}
                  </td>
                  <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{categoryLabel[eq.category]}</td>
                  <td className="px-4 py-3"><StatusBadge status={eq.status} /></td>
                  <td className="px-4 py-3 text-right">
                    {eq.status === 'available' && (
                      <Link to={`/loans/new?equipment_id=${eq.id}`}
                        className="text-xs bg-primary-50 hover:bg-primary-100 text-primary-700 px-3 py-1.5 rounded-lg font-medium">
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
