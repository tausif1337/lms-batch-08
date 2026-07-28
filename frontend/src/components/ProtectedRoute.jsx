// Wraps the private part of the app. No token means you get sent to /login.

import { Navigate } from 'react-router-dom'
import { useAuth } from '../AuthContext'

export default function ProtectedRoute({ children }) {
  const { isLoggedIn } = useAuth()

  if (!isLoggedIn) {
    // `replace` stops the browser Back button from bouncing between
    // the login page and the page that just rejected you.
    return <Navigate to="/login" replace />
  }

  return children
}
