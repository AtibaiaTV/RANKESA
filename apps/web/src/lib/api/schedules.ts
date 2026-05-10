import { apiFetch } from './client'
import { PaginatedResponse, ScheduledMatch } from '@rank-app/shared'

export function getSchedules(params?: {
  sport?: string
  matchType?: string
  genderType?: string
  city?: string
  page?: number
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

export function joinSchedule(token: string, id: string) {
  return apiFetch<ScheduledMatch>(`/schedules/${id}/join`, { method: 'POST', token })
}

export function leaveSchedule(token: string, id: string) {
  return apiFetch<ScheduledMatch>(`/schedules/${id}/leave`, { method: 'POST', token })
}

export function cancelSchedule(token: string, id: string) {
  return apiFetch<ScheduledMatch>(`/schedules/${id}`, { method: 'DELETE', token })
}
