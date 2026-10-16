import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { api, getErrorMessage } from '../../lib/api'
import { useNavigate } from 'react-router-dom'
import { Loader2, ArrowLeft } from 'lucide-react'
import { useState } from 'react'

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
  const [error, setError] = useState('')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { priority: 'medium', category: 'other' },
  })

  const mutation = useMutation({
    mutationFn: (data: FormData) => api.post('/incidents', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['incidents'] })
      navigate('/incidents')
    },
    onError: (e) => setError(getErrorMessage(e)),
  })

  return (
    <div className="p-6 max-w-xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft size={16} /> Volver
      </button>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Reportar incidencia</h1>

      <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-4 bg-white rounded-xl border border-gray-200 p-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
          <input {...register('title')} placeholder="Describe brevemente el problema"
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descripción detallada</label>
          <textarea {...register('description')} rows={3} placeholder="Explica el problema con el mayor detalle posible"
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
            <select {...register('category')}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="hardware">Hardware</option>
              <option value="software">Software</option>
              <option value="network">Red</option>
              <option value="infrastructure">Infraestructura</option>
              <option value="safety">Seguridad</option>
              <option value="other">Otro</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prioridad</label>
            <select {...register('priority')}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="low">Baja</option>
              <option value="medium">Media</option>
              <option value="high">Alta</option>
              <option value="critical">Crítica</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación (opcional)</label>
          <input {...register('location')} placeholder="Ej: Aula 101, Laboratorio 2"
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </div>

        {error && <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
          <p className="text-red-600 text-sm">{error}</p>
        </div>}

        <button type="submit" disabled={isSubmitting}
          className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2">
          {isSubmitting ? <><Loader2 size={16} className="animate-spin" /> Enviando...</> : 'Reportar incidencia'}
        </button>
      </form>
    </div>
  )
}
