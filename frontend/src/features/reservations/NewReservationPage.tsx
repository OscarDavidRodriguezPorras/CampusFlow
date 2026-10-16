import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { api, getErrorMessage } from '../../lib/api'
import type { Space } from '../../types'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Loader2, ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { useRoleTheme } from '../../hooks/useRoleTheme'

const schema = z.object({
  space_id: z.coerce.number().min(1, 'Selecciona un espacio'),
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  purpose: z.string().optional(),
  attendees_count: z.coerce.number().min(1, 'Mínimo 1 asistente'),
  start_time: z.string().min(1, 'Selecciona fecha de inicio'),
  end_time: z.string().min(1, 'Selecciona fecha de fin'),
}).refine(d => new Date(d.start_time) < new Date(d.end_time), {
  message: 'La hora de inicio debe ser anterior a la hora de fin',
  path: ['end_time'],
})
type FormData = z.infer<typeof schema>

export default function NewReservationPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [searchParams] = useSearchParams()
  const [error, setError] = useState('')
  const theme = useRoleTheme()

  const inputStyle = {
    background: 'rgba(255,255,255,0.04)',
    border: `1px solid ${theme.accent}25`,
    color: '#e2e8f0',
  }

  const { data: spaces } = useQuery({
    queryKey: ['spaces'],
    queryFn: () => api.get<Space[]>('/spaces').then(r => r.data),
  })

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { space_id: Number(searchParams.get('space_id')) || 0, attendees_count: 1 },
  })

  const mutation = useMutation({
    mutationFn: (data: FormData) => api.post('/reservations', {
      ...data,
      start_time: new Date(data.start_time).toISOString(),
      end_time: new Date(data.end_time).toISOString(),
    }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['reservations'] }); navigate('/reservations') },
    onError: (e) => setError(getErrorMessage(e)),
  })

  return (
    <div className="p-6 max-w-xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 mb-4">
        <ArrowLeft size={16} /> Volver
      </button>

      <div className="flex items-center gap-2 mb-1">
        <div className="w-1.5 h-1.5 rounded-full" style={{ background: theme.accent }} />
        <span className="text-xs uppercase tracking-widest font-semibold" style={{ color: theme.accent }}>Nueva reserva</span>
      </div>
      <h1 className="text-2xl font-bold text-white mb-6">Reservar un espacio</h1>

      <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-4 rounded-xl p-6"
        style={{ background: theme.cardBg, backdropFilter: 'blur(10px)', border: `1px solid ${theme.accent}18` }}>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Espacio</label>
          <select {...register('space_id')} className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none"
            style={inputStyle}>
            <option value={0} className="bg-slate-900">Selecciona un espacio</option>
            {spaces?.map(s => (
              <option key={s.id} value={s.id} className="bg-slate-900">
                {s.name} — cap. {s.capacity}
              </option>
            ))}
          </select>
          {errors.space_id && <p className="text-red-400 text-xs mt-1">{errors.space_id.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Título</label>
          <input {...register('title')} placeholder="Ej: Sesión de estudio"
            className="w-full px-3 py-2.5 rounded-lg text-sm placeholder-slate-600 focus:outline-none"
            style={inputStyle} />
          {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Propósito (opcional)</label>
          <textarea {...register('purpose')} rows={2} placeholder="Describe el propósito de la reserva"
            className="w-full px-3 py-2.5 rounded-lg text-sm placeholder-slate-600 focus:outline-none"
            style={inputStyle} />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Número de asistentes</label>
          <input {...register('attendees_count')} type="number" min={1}
            className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none"
            style={inputStyle} />
          {errors.attendees_count && <p className="text-red-400 text-xs mt-1">{errors.attendees_count.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Inicio</label>
            <input {...register('start_time')} type="datetime-local"
              className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none"
              style={{ ...inputStyle, colorScheme: 'dark' }} />
            {errors.start_time && <p className="text-red-400 text-xs mt-1">{errors.start_time.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Fin</label>
            <input {...register('end_time')} type="datetime-local"
              className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none"
              style={{ ...inputStyle, colorScheme: 'dark' }} />
            {errors.end_time && <p className="text-red-400 text-xs mt-1">{errors.end_time.message}</p>}
          </div>
        </div>

        {error && (
          <div className="rounded-lg px-3 py-2.5 border border-red-500/20" style={{ background: 'rgba(239,68,68,0.08)' }}>
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <button type="submit" disabled={isSubmitting}
          className="w-full font-medium py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 text-white"
          style={{ background: theme.gradient, boxShadow: `0 4px 16px ${theme.accentGlow}` }}>
          {isSubmitting ? <><Loader2 size={16} className="animate-spin" />Creando...</> : 'Crear reserva'}
        </button>
      </form>
    </div>
  )
}
