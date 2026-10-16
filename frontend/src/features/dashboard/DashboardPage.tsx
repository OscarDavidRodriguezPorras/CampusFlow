import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../auth/AuthContext'
import { api } from '../../lib/api'
import type { Reservation, Loan, Incident } from '../../types'
import StatusBadge from '../../components/StatusBadge'
import { CalendarCheck, Package, AlertTriangle, Clock, Loader2 } from 'lucide-react'
import { Link } from 'react-router-dom'

function StatCard({ icon: Icon, label, value, color, to }: {
  icon: React.ElementType; label: string; value: number; color: string; to: string
}) {
  return (
    <Link to={to} className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </Link>
  )
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('es-CO', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
  })
}

export default function DashboardPage() {
  const { user } = useAuth()
  const isStudent = user?.role === 'student'

  const reservationsQuery = useQuery({
    queryKey: ['reservations', isStudent ? 'me' : 'all'],
    queryFn: () => api.get<Reservation[]>(isStudent ? '/reservations/me' : '/reservations').then(r => r.data),
  })

  const loansQuery = useQuery({
    queryKey: ['loans', isStudent ? 'me' : 'all'],
    queryFn: () => api.get<Loan[]>(isStudent ? '/loans/me' : '/loans').then(r => r.data),
  })

  const incidentsQuery = useQuery({
    queryKey: ['incidents', isStudent ? 'me' : 'all'],
    queryFn: () => api.get<Incident[]>(isStudent ? '/incidents/me' : '/incidents').then(r => r.data),
  })

  const reservations = reservationsQuery.data ?? []
  const loans = loansQuery.data ?? []
  const incidents = incidentsQuery.data ?? []

  const pendingReservations = reservations.filter(r => r.status === 'pending')
  const activeLoans = loans.filter(l => ['pending', 'approved', 'delivered'].includes(l.status))
  const openIncidents = incidents.filter(i => ['open', 'assigned', 'in_progress'].includes(i.status))
  const upcoming = reservations.filter(r => r.status === 'approved' && new Date(r.start_time) > new Date())

  const isLoading = reservationsQuery.isLoading || loansQuery.isLoading || incidentsQuery.isLoading

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Hola, {user?.full_name.split(' ')[0]} 👋
        </h1>
        <p className="text-gray-500 text-sm mt-1">Aquí tienes un resumen de hoy</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-primary-600" size={32} />
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard icon={CalendarCheck} label="Reservas pendientes" value={pendingReservations.length}
              color="bg-yellow-500" to="/reservations" />
            <StatCard icon={CalendarCheck} label="Próximas reservas" value={upcoming.length}
              color="bg-primary-600" to="/reservations" />
            <StatCard icon={Package} label="Préstamos activos" value={activeLoans.length}
              color="bg-orange-500" to="/loans" />
            <StatCard icon={AlertTriangle} label="Incidencias abiertas" value={openIncidents.length}
              color="bg-red-500" to="/incidents" />
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Próximas reservas */}
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">Próximas reservas</h2>
                <Link to="/reservations" className="text-xs text-primary-600 hover:underline">Ver todas</Link>
              </div>
              <div className="divide-y divide-gray-50">
                {upcoming.length === 0 ? (
                  <div className="px-5 py-8 text-center">
                    <CalendarCheck className="mx-auto text-gray-300 mb-2" size={32} />
                    <p className="text-sm text-gray-400">No tienes reservas próximas</p>
                    <Link to="/spaces" className="text-xs text-primary-600 hover:underline mt-1 inline-block">
                      Reservar un espacio
                    </Link>
                  </div>
                ) : (
                  upcoming.slice(0, 4).map(r => (
                    <div key={r.id} className="px-5 py-3 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{r.title}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Clock size={12} className="text-gray-400" />
                          <p className="text-xs text-gray-400">{formatDate(r.start_time)}</p>
                        </div>
                      </div>
                      <StatusBadge status={r.status} />
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Incidencias recientes */}
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">Incidencias recientes</h2>
                <Link to="/incidents" className="text-xs text-primary-600 hover:underline">Ver todas</Link>
              </div>
              <div className="divide-y divide-gray-50">
                {incidents.length === 0 ? (
                  <div className="px-5 py-8 text-center">
                    <AlertTriangle className="mx-auto text-gray-300 mb-2" size={32} />
                    <p className="text-sm text-gray-400">No hay incidencias registradas</p>
                    <Link to="/incidents/new" className="text-xs text-primary-600 hover:underline mt-1 inline-block">
                      Reportar una incidencia
                    </Link>
                  </div>
                ) : (
                  incidents.slice(0, 4).map(inc => (
                    <div key={inc.id} className="px-5 py-3 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">{inc.title}</p>
                        <StatusBadge status={inc.priority} />
                      </div>
                      <StatusBadge status={inc.status} />
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
