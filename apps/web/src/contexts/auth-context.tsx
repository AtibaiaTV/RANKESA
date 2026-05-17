'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { Player } from '@rank-app/shared'

interface AuthContextValue {
  player: Player | null
  token: string | null
  login: (player: Player, token: string) => void
  logout: () => void
  updatePlayer: (player: Player) => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [player, setPlayer] = useState<Player | null>(null)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('rank_token')
    const storedPlayer = localStorage.getItem('rank_player')
    if (stored && storedPlayer) {
      setToken(stored)
      setPlayer(JSON.parse(storedPlayer) as Player)
    }
  }, [])

  const login = useCallback((p: Player, t: string) => {
    setPlayer(p)
    setToken(t)
    localStorage.setItem('rank_token', t)
    localStorage.setItem('rank_player', JSON.stringify(p))
  }, [])

  const logout = useCallback(() => {
    setPlayer(null)
    setToken(null)
    localStorage.removeItem('rank_token')
    localStorage.removeItem('rank_player')
  }, [])

  const updatePlayer = useCallback((updated: Player) => {
    setPlayer(updated)
    localStorage.setItem('rank_player', JSON.stringify(updated))
  }, [])

  return (
    <AuthContext.Provider value={{ player, token, login, logout, updatePlayer, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
