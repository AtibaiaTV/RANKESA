import { apiFetch } from './client'
import { Player, PaginatedResponse } from '@tennis-rank/shared'

export function getPlayers(params?: { city?: string; level?: string; page?: number; limit?: number }) {
  const qs = new URLSearchParams(
    Object.entries(params ?? {})
      .filter(([, v]) => v !== undefined)
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
