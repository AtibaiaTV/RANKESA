'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { Player } from '@rank-app/shared'

interface AuthContextValue {
  player: Player | null
  token: string | null
  login: (player: Player, token: string) => void
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [player, setPlayer] = useState<Player | null>(null)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('tennis_token')
    const storedPlayer = localStorage.getItem('tennis_player')
    if (stored && storedPlayer) {
      setToken(stored)
      setPlayer(JSON.parse(storedPlayer) as Player)
    }
  }, [])

  const login = useCallback((p: Player, t: string) => {
    setPlayer(p)
    setToken(t)
    localStorage.setItem('tennis_token', t)
    localStorage.setItem('tennis_player', JSON.stringify(p))
  }, [])

  const logout = useCallback(() => {
    setPlayer(null)
    setToken(null)
    localStorage.removeItem('tennis_token')
    localStorage.removeItem('tennis_player')
  }, [])

  return (
    <AuthContext.Provider value={{ player, token, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
