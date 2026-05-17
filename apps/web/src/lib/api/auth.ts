import { apiFetch } from './client'
import { Player } from '@rank-app/shared'

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
  phone: string
  sport?: string
  level?: string
  gender?: string
  avatar?: string
}) {
  return apiFetch<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function getMe(token: string) {
  return apiFetch<Player>('/auth/me', { token })
}

export function forgotPassword(email: string) {
  return apiFetch<void>('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  })
}

export function resetPassword(token: string, newPassword: string) {
  return apiFetch<void>('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, newPassword }),
  })
}
