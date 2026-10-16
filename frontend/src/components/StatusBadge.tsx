const configs: Record<string, { label: string; className: string }> = {
  // Reservas
  pending:     { label: 'Pendiente',   className: 'bg-yellow-100 text-yellow-700' },
  approved:    { label: 'Aprobada',    className: 'bg-green-100 text-green-700' },
  rejected:    { label: 'Rechazada',   className: 'bg-red-100 text-red-700' },
  cancelled:   { label: 'Cancelada',   className: 'bg-gray-100 text-gray-600' },
  finished:    { label: 'Finalizada',  className: 'bg-blue-100 text-blue-700' },
  // Equipos
  available:   { label: 'Disponible',  className: 'bg-green-100 text-green-700' },
  loaned:      { label: 'Prestado',    className: 'bg-orange-100 text-orange-700' },
  maintenance: { label: 'Mantenim.',   className: 'bg-yellow-100 text-yellow-700' },
  retired:     { label: 'Retirado',    className: 'bg-gray-100 text-gray-500' },
  // Préstamos
  delivered:   { label: 'Entregado',   className: 'bg-blue-100 text-blue-700' },
  returned:    { label: 'Devuelto',    className: 'bg-green-100 text-green-700' },
  overdue:     { label: 'Atrasado',    className: 'bg-red-100 text-red-700' },
  // Incidencias
  open:        { label: 'Abierta',     className: 'bg-red-100 text-red-700' },
  assigned:    { label: 'Asignada',    className: 'bg-orange-100 text-orange-700' },
  in_progress: { label: 'En proceso',  className: 'bg-blue-100 text-blue-700' },
  resolved:    { label: 'Resuelta',    className: 'bg-green-100 text-green-700' },
  closed:      { label: 'Cerrada',     className: 'bg-gray-100 text-gray-500' },
  // Prioridades
  low:         { label: 'Baja',        className: 'bg-gray-100 text-gray-600' },
  medium:      { label: 'Media',       className: 'bg-yellow-100 text-yellow-700' },
  high:        { label: 'Alta',        className: 'bg-orange-100 text-orange-700' },
  critical:    { label: 'Crítica',     className: 'bg-red-100 text-red-700' },
}

export default function StatusBadge({ status }: { status: string }) {
  const cfg = configs[status] ?? { label: status, className: 'bg-gray-100 text-gray-600' }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cfg.className}`}>
      {cfg.label}
    </span>
  )
}
