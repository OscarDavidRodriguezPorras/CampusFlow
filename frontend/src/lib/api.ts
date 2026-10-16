import axios from 'axios'

export const api = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
})

// Adjunta el token en cada petición
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cf_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Manejo global de errores de autenticación
api.interceptors.response.use(
  (res) => res,
  (error) => {
    // Solo redirigir al login si el 401 NO viene del propio endpoint de login
    if (error.response?.status === 401 && !error.config?.url?.includes('/auth/login')) {
      localStorage.removeItem('cf_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.detail ?? 'Error de conexión con el servidor'
  }
  return 'Error inesperado'
}
