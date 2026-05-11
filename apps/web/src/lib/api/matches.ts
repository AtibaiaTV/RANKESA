import { apiFetch } from './client'
import { Match, MatchComment, PaginatedResponse } from '@rank-app/shared'

export function getMatches(params?: { playerId?: string; status?: string; page?: number; limit?: number }) {
  const qs = new URLSearchParams(
    Object.entries(params ?? {})
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => [k, String(v)]),
  ).toString()
  return apiFetch<PaginatedResponse<Match>>(`/matches${qs ? `?${qs}` : ''}`)
}

export function getMatch(id: string) {
  return apiFetch<Match>(`/matches/${id}`)
}

export function createMatch(
  token: string,
  data: { sport?: string; opponentId: string; winnerId: string; score: string; date: string; scheduledMatchId?: string },
) {
  return apiFetch<Match>('/matches', {
    method: 'POST',
    token,
    body: JSON.stringify(data),
  })
}

export function confirmMatch(token: string, id: string) {
  return apiFetch<Match>(`/matches/${id}/confirm`, { method: 'POST', token })
}

export function disputeMatch(token: string, id: string, reason: string) {
  return apiFetch<Match>(`/matches/${id}/dispute`, {
    method: 'POST',
    token,
    body: JSON.stringify({ reason }),
  })
}

export function adminResolve(token: string, id: string, winnerId: string) {
  return apiFetch<Match>(`/matches/${id}/admin-resolve`, {
    method: 'POST',
    token,
    body: JSON.stringify({ winnerId }),
  })
}

export function getMatchComments(token: string, id: string) {
  return apiFetch<MatchComment[]>(`/matches/${id}/comments`, { token })
}

export function addMatchComment(token: string, id: string, content: string) {
  return apiFetch<MatchComment>(`/matches/${id}/comments`, {
    method: 'POST',
    token,
    body: JSON.stringify({ content }),
  })
}
