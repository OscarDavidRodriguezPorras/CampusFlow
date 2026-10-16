import { useQuery } from '@tanstack/react-query'
import { api } from '../../lib/api'
import type { Space } from '../../types'
import { MapPin, Users, Loader2, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

const typeLabel: Record<string, string> = {
  classroom: 'Aula', cubicle: 'Cubículo', lab: 'Laboratorio', meeting_room: 'Sala de reuniones',
}
const typeColor: Record<string, string> = {
  classroom: 'bg-blue-900/50 text-blue-300', cubicle: 'bg-emerald-900/50 text-emerald-300',
  lab: 'bg-violet-900/50 text-violet-300', meeting_room: 'bg-orange-900/50 text-orange-300',
}
const cardStyle = { background: 'rgba(15,20,45,0.7)', backdropFilter: 'blur(8px)' }

export default function SpacesPage() {
  const { user } = useAuth()
  const { data: spaces, isLoading } = useQuery({
    queryKey: ['spaces'],
    queryFn: () => api.get<Space[]>('/spaces').then(r => r.data),
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
          <h1 className="text-2xl font-bold text-white">Espacios</h1>
          <p className="text-slate-400 text-sm mt-1">{spaces?.length ?? 0} espacios disponibles</p>
        </div>
        {user?.role === 'admin' && (
          <Link to="/spaces/new"
            className="flex items-center gap-2 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            style={{ background: 'linear-gradient(135deg, #1d4ed8, #1e3a8a)' }}>
            <Plus size={16} /> Nuevo espacio
          </Link>
        )}
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {spaces?.map(space => (
          <div key={space.id} className="rounded-xl border border-white/5 p-5 hover:border-blue-500/20 transition-all"
            style={cardStyle}>
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-semibold text-white">{space.name}</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeColor[space.space_type]}`}>
                {typeLabel[space.space_type]}
              </span>
            </div>
            {space.description && <p className="text-sm text-slate-400 mb-3">{space.description}</p>}
            <div className="space-y-1.5 mb-4">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <MapPin size={13} className="text-slate-500" /> {space.location}
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Users size={13} className="text-slate-500" /> Capacidad: {space.capacity} personas
              </div>
            </div>
            {space.amenities && (
              <div className="flex flex-wrap gap-1 mb-4">
                {space.amenities.split(',').map(a => (
                  <span key={a} className="text-xs bg-white/5 text-slate-400 px-2 py-0.5 rounded-full border border-white/5">
                    {a.trim()}
                  </span>
                ))}
              </div>
            )}
            <Link to={`/reservations/new?space_id=${space.id}`}
              className="block w-full text-center text-blue-300 text-sm font-medium py-2 rounded-lg transition-colors"
              style={{ background: 'rgba(29,78,216,0.15)', border: '1px solid rgba(29,78,216,0.2)' }}>
              🚀 Reservar este espacio
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
