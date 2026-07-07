import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { canAccessRoute } from '../auth/permissions'
import { AccessDeniedPage } from '../pages/AccessDeniedPage'
import { useAuthStore } from '../store/useAuthStore'

export function ProtectedRoute() {
  const location = useLocation()
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn)
  const user = useAuthStore((state) => state.user)

  if (!isLoggedIn) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (!canAccessRoute(location.pathname, user)) {
    return <AccessDeniedPage />
  }

  return <Outlet />
}
