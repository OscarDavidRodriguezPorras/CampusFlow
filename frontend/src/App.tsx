import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './features/auth/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import LoginPage from './features/auth/LoginPage'
import DashboardPage from './features/dashboard/DashboardPage'
import SpacesPage from './features/spaces/SpacesPage'
import ReservationsPage from './features/reservations/ReservationsPage'
import NewReservationPage from './features/reservations/NewReservationPage'
import EquipmentPage from './features/equipment/EquipmentPage'
import LoansPage from './features/loans/LoansPage'
import NewLoanPage from './features/loans/NewLoanPage'
import IncidentsPage from './features/incidents/IncidentsPage'
import NewIncidentPage from './features/incidents/NewIncidentPage'
import UsersPage from './features/users/UsersPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<DashboardPage />} />
              <Route path="spaces" element={<SpacesPage />} />
              <Route path="reservations" element={<ReservationsPage />} />
              <Route path="reservations/new" element={<NewReservationPage />} />
              <Route path="equipment" element={<EquipmentPage />} />
              <Route path="loans" element={<LoansPage />} />
              <Route path="loans/new" element={<NewLoanPage />} />
              <Route path="incidents" element={<IncidentsPage />} />
              <Route path="incidents/new" element={<NewIncidentPage />} />
              <Route path="users" element={
                <ProtectedRoute roles={['admin']}>
                  <UsersPage />
                </ProtectedRoute>
              } />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}
