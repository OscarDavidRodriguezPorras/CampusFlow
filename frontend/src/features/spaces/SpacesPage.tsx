import { useQuery } from '@tanstack/react-query'
import { api } from '../../lib/api'
import type { Space } from '../../types'
import { MapPin, Users, Loader2, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

const typeLabel: Record<string, string> = {
  classroom: 'Aula',
  cubicle: 'Cubículo',
  lab: 'Laboratorio',
  meeting_room: 'Sala de reuniones',
}

const typeColor: Record<string, string> = {
  classroom: 'bg-blue-100 text-blue-700',
  cubicle: 'bg-green-100 text-green-700',
  lab: 'bg-purple-100 text-purple-700',
  meeting_room: 'bg-orange-100 text-orange-700',
}

export default function SpacesPage() {
  const { user } = useAuth()
  const { data: spaces, isLoading } = useQuery({
    queryKey: ['spaces'],
    queryFn: () => api.get<Space[]>('/spaces').then(r => r.data),
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
          <h1 className="text-2xl font-bold text-gray-900">Espacios</h1>
          <p className="text-gray-500 text-sm mt-1">{spaces?.length ?? 0} espacios disponibles</p>
        </div>
        {user?.role === 'admin' && (
          <Link to="/spaces/new"
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
            <Plus size={16} /> Nuevo espacio
          </Link>
        )}
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {spaces?.map(space => (
          <div key={space.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-semibold text-gray-900">{space.name}</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeColor[space.space_type]}`}>
                {typeLabel[space.space_type]}
              </span>
            </div>

            {space.description && (
              <p className="text-sm text-gray-500 mb-3">{space.description}</p>
            )}

            <div className="space-y-1.5 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin size={14} className="text-gray-400" />
                {space.location}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users size={14} className="text-gray-400" />
                Capacidad: {space.capacity} personas
              </div>
            </div>

            {space.amenities && (
              <div className="flex flex-wrap gap-1 mb-4">
                {space.amenities.split(',').map(a => (
                  <span key={a} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                    {a.trim()}
                  </span>
                ))}
              </div>
            )}

            <Link
              to={`/reservations/new?space_id=${space.id}`}
              className="block w-full text-center bg-primary-50 hover:bg-primary-100 text-primary-700 text-sm font-medium py-2 rounded-lg transition-colors"
            >
              Reservar
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
