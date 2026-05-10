import { apiFetch } from './client'
import { Player } from '@tennis-rank/shared'

interface AuthResponse {
  accessToken: string
  player: Player
}

export function login(email: string, password: string) {
  return apiFetch<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export function register(data: {
  name: string
  email: string
  password: string
  city: string
  level?: string
}) {
  return apiFetch<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function getMe(token: string) {
  return apiFetch<Player>('/auth/me', { token })
}
