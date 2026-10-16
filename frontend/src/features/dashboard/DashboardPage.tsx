import { useAuth } from '../auth/AuthContext'
import StudentDashboard from './StudentDashboard'
import AdminDashboard from './AdminDashboard'

export default function DashboardPage() {
  const { user } = useAuth()
  if (user?.role === 'admin') return <AdminDashboard />
  return <StudentDashboard />
}
