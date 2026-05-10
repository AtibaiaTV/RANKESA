import { apiFetch } from './client'
import { Bet } from '@rank-app/shared'

export function getBetsForMatch(matchId: string) {
  return apiFetch<Bet[]>(`/matches/${matchId}/bets`)
}

export function placeBet(token: string, matchId: string, predictedWinnerId: string, amount: number) {
  return apiFetch<Bet>(`/matches/${matchId}/bets`, {
    method: 'POST',
    token,
    body: JSON.stringify({ predictedWinnerId, amount }),
  })
}

export function getMyBets(token: string) {
  return apiFetch<Bet[]>('/bets/me', { token })
}
