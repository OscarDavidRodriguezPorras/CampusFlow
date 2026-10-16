const configs: Record<string, { label: string; className: string }> = {
  pending:     { label: 'Pendiente',   className: 'bg-yellow-900/40 text-yellow-300 border border-yellow-500/20' },
  approved:    { label: 'Aprobada',    className: 'bg-emerald-900/40 text-emerald-300 border border-emerald-500/20' },
  rejected:    { label: 'Rechazada',   className: 'bg-red-900/40 text-red-300 border border-red-500/20' },
  cancelled:   { label: 'Cancelada',   className: 'bg-slate-800/60 text-slate-400 border border-slate-600/20' },
  finished:    { label: 'Finalizada',  className: 'bg-blue-900/40 text-blue-300 border border-blue-500/20' },
  available:   { label: 'Disponible',  className: 'bg-emerald-900/40 text-emerald-300 border border-emerald-500/20' },
  loaned:      { label: 'Prestado',    className: 'bg-orange-900/40 text-orange-300 border border-orange-500/20' },
  maintenance: { label: 'Mantenim.',   className: 'bg-yellow-900/40 text-yellow-300 border border-yellow-500/20' },
  retired:     { label: 'Retirado',    className: 'bg-slate-800/60 text-slate-500 border border-slate-600/20' },
  delivered:   { label: 'Entregado',   className: 'bg-blue-900/40 text-blue-300 border border-blue-500/20' },
  returned:    { label: 'Devuelto',    className: 'bg-emerald-900/40 text-emerald-300 border border-emerald-500/20' },
  overdue:     { label: 'Atrasado',    className: 'bg-red-900/40 text-red-300 border border-red-500/20' },
  open:        { label: 'Abierta',     className: 'bg-red-900/40 text-red-300 border border-red-500/20' },
  assigned:    { label: 'Asignada',    className: 'bg-orange-900/40 text-orange-300 border border-orange-500/20' },
  in_progress: { label: 'En proceso',  className: 'bg-blue-900/40 text-blue-300 border border-blue-500/20' },
  resolved:    { label: 'Resuelta',    className: 'bg-emerald-900/40 text-emerald-300 border border-emerald-500/20' },
  closed:      { label: 'Cerrada',     className: 'bg-slate-800/60 text-slate-500 border border-slate-600/20' },
  low:         { label: 'Baja',        className: 'bg-slate-800/60 text-slate-400 border border-slate-600/20' },
  medium:      { label: 'Media',       className: 'bg-yellow-900/40 text-yellow-300 border border-yellow-500/20' },
  high:        { label: 'Alta',        className: 'bg-orange-900/40 text-orange-300 border border-orange-500/20' },
  critical:    { label: 'Crítica',     className: 'bg-red-900/40 text-red-300 border border-red-500/20' },
}

export default function StatusBadge({ status }: { status: string }) {
  const cfg = configs[status] ?? { label: status, className: 'bg-slate-800/60 text-slate-400 border border-slate-600/20' }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cfg.className}`}>
      {cfg.label}
    </span>
  )
}
