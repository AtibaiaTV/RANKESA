import { apiFetch } from './client'
import { PaginatedResponse, ScheduledMatch } from '@rank-app/shared'

export function getSchedules(params?: {
  sport?: string
  matchType?: string
  genderType?: string
  city?: string
  playerId?: string
  page?: number
  limit?: number
}) {
  const qs = new URLSearchParams(
    Object.entries(params ?? {})
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => [k, String(v)]),
  ).toString()
  return apiFetch<PaginatedResponse<ScheduledMatch>>(`/schedules${qs ? `?${qs}` : ''}`)
}

export function getSchedule(id: string) {
  return apiFetch<ScheduledMatch>(`/schedules/${id}`)
}

export function createSchedule(token: string, data: object) {
  return apiFetch<ScheduledMatch>('/schedules', {
    method: 'POST',
    token,
    body: JSON.stringify(data),
  })
}

/** Player applies to join a schedule (candidacy) */
export function applySchedule(token: string, id: string) {
  return apiFetch<ScheduledMatch>(`/schedules/${id}/apply`, { method: 'POST', token })
}

/** Player withdraws their candidacy or leaves if already approved */
export function withdrawSchedule(token: string, id: string) {
  return apiFetch<ScheduledMatch>(`/schedules/${id}/withdraw`, { method: 'POST', token })
}

/** Organizer approves a pending candidate */
export function approvePlayer(token: string, id: string, playerId: string) {
  return apiFetch<ScheduledMatch>(`/schedules/${id}/approve/${playerId}`, { method: 'POST', token })
}

/** Organizer rejects a pending candidate */
export function rejectPlayer(token: string, id: string, playerId: string) {
  return apiFetch<ScheduledMatch>(`/schedules/${id}/reject/${playerId}`, { method: 'POST', token })
}

/** Approved participant votes for MVP */
export function voteMvp(token: string, id: string, nomineeId: string) {
  return apiFetch<ScheduledMatch>(`/schedules/${id}/vote-mvp/${nomineeId}`, { method: 'POST', token })
}

export function cancelSchedule(token: string, id: string) {
  return apiFetch<ScheduledMatch>(`/schedules/${id}`, { method: 'DELETE', token })
}

export function updateSchedule(token: string, id: string, data: Partial<{
  title: string; description: string; date: string; time: string
  location: string; city: string; maxPlayers: number
  sport: string; matchType: string; genderType: string
  costPerPlayer: number; pixKey: string | undefined; costDescription: string | undefined
}>) {
  return apiFetch<ScheduledMatch>(`/schedules/${id}`, {
    method: 'PATCH',
    token,
    body: JSON.stringify(data),
  })
}

export function kickPlayer(token: string, id: string, playerId: string) {
  return apiFetch<ScheduledMatch>(`/schedules/${id}/kick/${playerId}`, { method: 'POST', token })
}
