import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { api, getErrorMessage } from '../../lib/api'
import type { Equipment } from '../../types'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Loader2, ArrowLeft } from 'lucide-react'
import { useState } from 'react'

const schema = z.object({
  equipment_id: z.coerce.number().min(1, 'Selecciona un equipo'),
  purpose: z.string().optional(),
  requested_return_date: z.string().min(1, 'Selecciona fecha de devolución'),
})
type FormData = z.infer<typeof schema>

export default function NewLoanPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [searchParams] = useSearchParams()
  const [error, setError] = useState('')

  const { data: equipment } = useQuery({
    queryKey: ['equipment'],
    queryFn: () => api.get<Equipment[]>('/equipment').then(r => r.data),
  })

  const availableEquipment = equipment?.filter(e => e.status === 'available') ?? []

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { equipment_id: Number(searchParams.get('equipment_id')) || 0 },
  })

  const mutation = useMutation({
    mutationFn: (data: FormData) => api.post('/loans', {
      ...data,
      requested_return_date: new Date(data.requested_return_date).toISOString(),
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['loans'] })
      navigate('/loans')
    },
    onError: (e) => setError(getErrorMessage(e)),
  })

  return (
    <div className="p-6 max-w-xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft size={16} /> Volver
      </button>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Solicitar préstamo</h1>

      <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-4 bg-white rounded-xl border border-gray-200 p-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Equipo disponible</label>
          <select {...register('equipment_id')}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
            <option value={0}>Selecciona un equipo</option>
            {availableEquipment.map(e => (
              <option key={e.id} value={e.id}>{e.name} ({e.inventory_code})</option>
            ))}
          </select>
          {errors.equipment_id && <p className="text-red-500 text-xs mt-1">{errors.equipment_id.message}</p>}
          {availableEquipment.length === 0 && (
            <p className="text-yellow-600 text-xs mt-1">No hay equipos disponibles en este momento</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Propósito (opcional)</label>
          <textarea {...register('purpose')} rows={2} placeholder="¿Para qué necesitas el equipo?"
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de devolución</label>
          <input {...register('requested_return_date')} type="datetime-local"
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          {errors.requested_return_date && <p className="text-red-500 text-xs mt-1">{errors.requested_return_date.message}</p>}
        </div>

        {error && <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
          <p className="text-red-600 text-sm">{error}</p>
        </div>}

        <button type="submit" disabled={isSubmitting}
          className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2">
          {isSubmitting ? <><Loader2 size={16} className="animate-spin" /> Enviando...</> : 'Solicitar préstamo'}
        </button>
      </form>
    </div>
  )
}
