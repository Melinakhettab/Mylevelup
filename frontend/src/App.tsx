import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import Welcome from './pages/Welcome'
import Register from './pages/Register'
import Login from './pages/Login'
import Onboarding from './pages/Onboarding'
import Dashboard from './pages/Dashboard'
import Program from './pages/Program'
import Nutrition from './pages/Nutrition'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

function GuestRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, hasProfile } = useAuthStore()
  if (isAuthenticated && hasProfile) return <Navigate to="/dashboard" replace />
  if (isAuthenticated && !hasProfile) return <Navigate to="/onboarding" replace />
  return <>{children}</>
}

export default function App() {
  const hydrate = useAuthStore((s) => s.hydrate)

  useEffect(() => {
    hydrate()
  }, [hydrate])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
        <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/program" element={<ProtectedRoute><Program /></ProtectedRoute>} />
        <Route path="/nutrition" element={<ProtectedRoute><Nutrition /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
