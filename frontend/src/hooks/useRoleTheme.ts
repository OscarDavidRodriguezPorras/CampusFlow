import { useAuth } from '../features/auth/AuthContext'
import { getTheme } from '../lib/roleTheme'

export function useRoleTheme() {
  const { user } = useAuth()
  return getTheme(user?.role ?? 'student')
}
