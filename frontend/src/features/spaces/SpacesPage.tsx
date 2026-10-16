import { useQuery } from '@tanstack/react-query'
import { api } from '../../lib/api'
import type { Space } from '../../types'
import { MapPin, Users, Loader2, Plus, Calendar } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { useRoleTheme } from '../../hooks/useRoleTheme'

const typeLabel: Record<string, string> = {
  classroom: 'Aula',
  cubicle: 'Cubículo',
  lab: 'Laboratorio',
  meeting_room: 'Sala de reuniones',
}

const typeColor: Record<string, string> = {
  classroom:    '#3b82f6',
  cubicle:      '#10b981',
  lab:          '#8b5cf6',
  meeting_room: '#f59e0b',
}

// Mapa de imágenes por nombre del espacio
// Guarda tus imágenes en /public/images/spaces/ con estos nombres exactos
const spaceImages: Record<string, string> = {
  'Auditorio':       '/images/spaces/auditorio.png',
  'Cosmos':          '/images/spaces/cosmos.png',
  'Skilab':          '/images/spaces/skilab.png',
  'Spooki':          '/images/spaces/spooki.png',
  'Apolo':           '/images/spaces/apolo.png',
  'Blanca':          '/images/spaces/blanca.png',
  'Azul':            '/images/spaces/azul.png',
  'Amarillas Verdes':'/images/spaces/amarillas-verdes.png',
  'Artemis':         '/images/spaces/artemis.png',
}

// Gradientes de fallback cuando no hay imagen
const fallbackGradients: Record<string, string> = {
  classroom:    'linear-gradient(135deg,#1e3a5f 0%,#1e40af 50%,#1d4ed8 100%)',
  cubicle:      'linear-gradient(135deg,#064e3b 0%,#065f46 50%,#059669 100%)',
  lab:          'linear-gradient(135deg,#2e1065 0%,#4c1d95 50%,#6d28d9 100%)',
  meeting_room: 'linear-gradient(135deg,#451a03 0%,#78350f 50%,#d97706 100%)',
}

function SpaceCard({ space }: { space: Space }) {
  const theme = useRoleTheme()
  const imgSrc = spaceImages[space.name]
  const accent = typeColor[space.space_type]
  const fallback = fallbackGradients[space.space_type]

  return (
    <div className="rounded-2xl overflow-hidden flex flex-col transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1"
      style={{
        background: 'rgba(10,16,40,0.85)',
        border: `1px solid ${accent}25`,
        backdropFilter: 'blur(12px)',
        boxShadow: `0 4px 24px rgba(0,0,0,0.4), 0 0 0 0 ${accent}`,
      }}
      onMouseEnter={e => (e.currentTarget.style.boxShadow = `0 8px 32px rgba(0,0,0,0.5), 0 0 20px ${accent}20`)}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = `0 4px 24px rgba(0,0,0,0.4), 0 0 0 0 ${accent}`)}>

      {/* ── Banner ── */}
      <div className="relative overflow-hidden" style={{ height: 160 }}>
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={space.name}
            className="w-full h-full object-cover"
            onError={e => {
              // Si la imagen no carga, muestra el gradiente
              e.currentTarget.style.display = 'none'
              e.currentTarget.parentElement!.style.background = fallback
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: fallback }}>
            <span className="text-5xl opacity-40">
              {space.space_type === 'classroom' ? '🏫'
                : space.space_type === 'lab' ? '💻'
                : space.space_type === 'meeting_room' ? '🤝'
                : '🪑'}
            </span>
          </div>
        )}

        {/* Degradado sobre la imagen */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg,rgba(0,0,0,0.1) 0%,rgba(0,0,0,0.6) 100%)',
        }}/>

        {/* Badge tipo espacio */}
        <div className="absolute top-3 right-3">
          <span className="text-xs px-2.5 py-1 rounded-full font-semibold"
            style={{ background: `${accent}cc`, color: 'white', backdropFilter: 'blur(4px)' }}>
            {typeLabel[space.space_type]}
          </span>
        </div>

        {/* Nombre sobre la imagen */}
        <div className="absolute bottom-3 left-4">
          <h3 className="text-xl font-bold text-white drop-shadow-lg">{space.name}</h3>
        </div>

        {/* Capacidad en banner */}
        <div className="absolute bottom-3 right-4">
          <span className="flex items-center gap-1 text-xs text-white/80 font-medium">
            <Users size={12} /> {space.capacity}
          </span>
        </div>
      </div>

      {/* ── Contenido ── */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        {space.description && (
          <p className="text-sm text-slate-400 leading-snug line-clamp-2">{space.description}</p>
        )}

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <MapPin size={12} style={{ color: accent }} className="flex-shrink-0" />
          {space.location}
        </div>

        {/* Amenidades */}
        {space.amenities && (
          <div className="flex flex-wrap gap-1.5">
            {space.amenities.split(',').map(a => (
              <span key={a} className="text-xs px-2 py-0.5 rounded-full"
                style={{ background: `${accent}12`, color: accent, border: `1px solid ${accent}20` }}>
                {a.trim()}
              </span>
            ))}
          </div>
        )}

        {/* Botón */}
        <div className="mt-auto pt-2">
          <Link
            to={`/reservations/new?space_id=${space.id}`}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: `linear-gradient(135deg, ${accent}cc, ${accent}88)`,
              color: 'white',
              boxShadow: `0 4px 14px ${accent}40`,
            }}
            onMouseEnter={e => (e.currentTarget.style.boxShadow = `0 6px 20px ${accent}60`)}
            onMouseLeave={e => (e.currentTarget.style.boxShadow = `0 4px 14px ${accent}40`)}>
            <Calendar size={15} />
            Reservar este espacio
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function SpacesPage() {
  const { user } = useAuth()
  const theme = useRoleTheme()

  const { data: spaces, isLoading } = useQuery({
    queryKey: ['spaces'],
    queryFn: () => api.get<Space[]>('/spaces').then(r => r.data),
  })

  if (isLoading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="animate-spin" size={32} style={{ color: theme.accent }} />
    </div>
  )

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: theme.accent }} />
            <span className="text-xs uppercase tracking-widest font-semibold" style={{ color: theme.accent }}>
              Espacios del campus
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white">Espacios disponibles</h1>
          <p className="text-slate-400 text-sm mt-0.5">{spaces?.length ?? 0} espacios registrados</p>
        </div>
        {user?.role === 'admin' && (
          <Link to="/spaces/new"
            className="flex items-center gap-2 text-white text-sm font-medium px-4 py-2 rounded-lg"
            style={{ background: theme.gradient, boxShadow: `0 4px 16px ${theme.accentGlow}` }}>
            <Plus size={16} /> Nuevo espacio
          </Link>
        )}
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
        {spaces?.map(space => (
          <SpaceCard key={space.id} space={space} />
        ))}
      </div>
    </div>
  )
}
