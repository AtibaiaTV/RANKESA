import { apiFetch } from './client'
import { Player, PaginatedResponse, Gender, PlayerLevel, Sport } from '@rank-app/shared'

export function getPlayers(params?: {
  sport?: Sport | string
  city?: string
  venue?: string
  region?: string
  state?: string
  country?: string
  level?: PlayerLevel | string
  gender?: Gender | string
  minAge?: number
  maxAge?: number
  page?: number
  limit?: number
}) {
  const qs = new URLSearchParams(
    Object.entries(params ?? {})
      .filter(([, v]) => v !== undefined && v !== '')
      .map(([k, v]) => [k, String(v)]),
  ).toString()
  return apiFetch<PaginatedResponse<Player>>(`/players${qs ? `?${qs}` : ''}`)
}

export function getPlayer(id: string) {
  return apiFetch<Player>(`/players/${id}`)
}

export function updateMe(token: string, data: Partial<Player>) {
  return apiFetch<Player>('/players/me', {
    method: 'PATCH',
    token,
    body: JSON.stringify(data),
  })
}
