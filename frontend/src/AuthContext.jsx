// ---------------------------------------------------------------------------
// Holds "who is logged in" for the whole app.
//
// Any component can read it with:   const { user, login, logout } = useAuth()
// ---------------------------------------------------------------------------

import { createContext, useContext, useState } from 'react'
import { auth, saveSession, clearSession, loadUser } from './api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  // Start from whatever is already in localStorage, so a page refresh does not
  // log the user out.
  const [user, setUser] = useState(() => loadUser())

  async function login(phone, password) {
    const data = await auth.login(phone, password)
    saveSession(data)
    setUser({ user_id: data.user_id, username: data.username })
    return data
  }

  function logout() {
    // This backend has no logout endpoint, so "logging out" just means
    // throwing away the token we saved. The token stays technically valid
    // on the server until it expires.
    clearSession()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoggedIn: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
