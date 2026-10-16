import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { api, getErrorMessage } from '../../lib/api'
import { useNavigate } from 'react-router-dom'
import { Loader2, ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { useRoleTheme } from '../../hooks/useRoleTheme'

const schema = z.object({
  title: z.string().min(5, 'El título debe tener al menos 5 caracteres'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  category: z.enum(['hardware', 'software', 'network', 'infrastructure', 'safety', 'other']),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  location: z.string().optional(),
})
type FormData = z.infer<typeof schema>

export default function NewIncidentPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const theme = useRoleTheme()
  const [error, setError] = useState('')

  const inputStyle = {
    background: 'rgba(255,255,255,0.04)',
    border: `1px solid ${theme.accent}25`,
    color: '#e2e8f0',
  }
  const focusStyle = `focus:outline-none focus:ring-2`

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { priority: 'medium', category: 'other' },
  })

  const mutation = useMutation({
    mutationFn: (data: FormData) => api.post('/incidents', data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['incidents'] }); navigate('/incidents') },
    onError: (e) => setError(getErrorMessage(e)),
  })

  return (
    <div className="p-6 max-w-xl mx-auto">
      <button onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 mb-4">
        <ArrowLeft size={16} /> Volver
      </button>

      <div className="flex items-center gap-2 mb-1">
        <div className="w-1.5 h-1.5 rounded-full" style={{ background: theme.accent }} />
        <span className="text-xs uppercase tracking-widest font-semibold" style={{ color: theme.accent }}>Nueva incidencia</span>
      </div>
      <h1 className="text-2xl font-bold text-white mb-6">Reportar un problema</h1>

      <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-4 rounded-xl p-6"
        style={{ background: theme.cardBg, backdropFilter: 'blur(10px)', border: `1px solid ${theme.accent}18` }}>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Título</label>
          <input {...register('title')} placeholder="Describe brevemente el problema"
            className={`w-full px-3 py-2.5 rounded-lg text-sm placeholder-slate-600 ${focusStyle}`}
            style={{ ...inputStyle, ['--tw-ring-color' as string]: theme.accent }} />
          {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Descripción detallada</label>
          <textarea {...register('description')} rows={3} placeholder="Explica el problema con el mayor detalle posible"
            className={`w-full px-3 py-2.5 rounded-lg text-sm placeholder-slate-600 ${focusStyle}`}
            style={inputStyle} />
          {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Categoría</label>
            <select {...register('category')}
              className={`w-full px-3 py-2.5 rounded-lg text-sm ${focusStyle}`}
              style={inputStyle}>
              <option value="hardware" className="bg-slate-900">Hardware</option>
              <option value="software" className="bg-slate-900">Software</option>
              <option value="network" className="bg-slate-900">Red</option>
              <option value="infrastructure" className="bg-slate-900">Infraestructura</option>
              <option value="safety" className="bg-slate-900">Seguridad</option>
              <option value="other" className="bg-slate-900">Otro</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Prioridad</label>
            <select {...register('priority')}
              className={`w-full px-3 py-2.5 rounded-lg text-sm ${focusStyle}`}
              style={inputStyle}>
              <option value="low" className="bg-slate-900">Baja</option>
              <option value="medium" className="bg-slate-900">Media</option>
              <option value="high" className="bg-slate-900">Alta</option>
              <option value="critical" className="bg-slate-900">Crítica</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Ubicación (opcional)</label>
          <input {...register('location')} placeholder="Ej: Aula Cosmos, Laboratorio Skilab"
            className={`w-full px-3 py-2.5 rounded-lg text-sm placeholder-slate-600 ${focusStyle}`}
            style={inputStyle} />
        </div>

        {error && (
          <div className="rounded-lg px-3 py-2.5 border border-red-500/20" style={{ background: 'rgba(239,68,68,0.08)' }}>
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <button type="submit" disabled={isSubmitting}
          className="w-full font-medium py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 text-white"
          style={{ background: theme.gradient, boxShadow: `0 4px 16px ${theme.accentGlow}` }}>
          {isSubmitting ? <><Loader2 size={16} className="animate-spin" />Enviando...</> : 'Reportar incidencia'}
        </button>
      </form>
    </div>
  )
}
