'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/auth-context'
import { getMatch, confirmMatch, disputeMatch } from '@/lib/api/matches'
import { getBetsForMatch, placeBet } from '@/lib/api/bets'
import { Bet, BetStatus, Match, MatchStatus, Sport } from '@tennis-rank/shared'
import { Header } from '@/components/layout/header'

const STATUS_LABELS: Record<MatchStatus, string> = {
  [MatchStatus.PENDING_REVIEW]: 'Aguardando confirmação',
  [MatchStatus.CONFIRMED]: 'Confirmada',
  [MatchStatus.DISPUTED]: 'Em disputa',
}

const BET_STATUS_LABELS: Record<BetStatus, { label: string; cls: string }> = {
  [BetStatus.PENDING]: { label: 'Pendente', cls: 'bg-yellow-100 text-yellow-700' },
  [BetStatus.WON]: { label: 'Ganhou', cls: 'bg-green-100 text-green-700' },
  [BetStatus.LOST]: { label: 'Perdeu', cls: 'bg-red-100 text-red-600' },
  [BetStatus.CANCELLED]: { label: 'Cancelada', cls: 'bg-gray-100 text-gray-500' },
}

export const SPORT_EMOJIS: Record<Sport, string> = {
  [Sport.TENNIS]: '🎾',
  [Sport.PADEL]: '🏓',
  [Sport.SQUASH]: '🟡',
  [Sport.BADMINTON]: '🏸',
  [Sport.TABLE_TENNIS]: '🏓',
  [Sport.BEACH_TENNIS]: '🏖️',
  [Sport.VOLLEYBALL]: '🏐',
  [Sport.BASKETBALL]: '🏀',
  [Sport.FOOTBALL]: '⚽',
  [Sport.CHESS]: '♟️',
}

export default function MatchDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { player, token } = useAuth()
  const router = useRouter()
  const [match, setMatch] = useState<Match | null>(null)
  const [bets, setBets] = useState<Bet[]>([])
  const [betAmount, setBetAmount] = useState(10)
  const [betWinnerId, setBetWinnerId] = useState('')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState('')
  const [betError, setBetError] = useState('')

  useEffect(() => {
    Promise.all([
      getMatch(id).catch(() => null),
      getBetsForMatch(id).catch(() => []),
    ])
      .then(([m, b]) => {
        if (!m) { router.push('/'); return }
        setMatch(m)
        setBets(b)
      })
      .finally(() => setLoading(false))
  }, [id, router])

  async function handleConfirm() {
    if (!token) return
    setActionLoading(true)
    try {
      const updated = await confirmMatch(token, id)
      setMatch(updated)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao confirmar')
    } finally {
      setActionLoading(false)
    }
  }

  async function handleDispute() {
    const reason = prompt('Informe o motivo da disputa:')
    if (!reason || !token) return
    setActionLoading(true)
    try {
      const updated = await disputeMatch(token, id, reason)
      setMatch(updated)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao disputar')
    } finally {
      setActionLoading(false)
    }
  }

  async function handleBet(e: React.FormEvent) {
    e.preventDefault()
    if (!token || !betWinnerId) return
    setBetError('')
    setActionLoading(true)
    try {
      const bet = await placeBet(token, id, betWinnerId, betAmount)
      setBets((prev) => [...prev, bet])
      setBetWinnerId('')
    } catch (err) {
      setBetError(err instanceof Error ? err.message : 'Erro ao apostar')
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) return <div className="p-8 text-center text-gray-400">Carregando...</div>
  if (!match) return null

  const p1 = typeof match.player1 === 'object' ? match.player1 : null
  const p2 = typeof match.player2 === 'object' ? match.player2 : null
  const winner = typeof match.winner === 'object' ? match.winner : null
  const registeredBy = typeof match.registeredBy === 'object' ? match.registeredBy : null

  const isParticipant = player && (p1?._id === player._id || p2?._id === player._id)
  const isOpponent = isParticipant && registeredBy?._id !== player?._id
  const canAct = isOpponent && match.status === MatchStatus.PENDING_REVIEW
  const canBet = token && !isParticipant && match.status === MatchStatus.PENDING_REVIEW
  const myBet = bets.find((b) => typeof b.bettor === 'object' && b.bettor._id === player?._id)

  return (
    <>
      <Header />
      <main className="max-w-md mx-auto px-4 py-8">
        <Link href="/dashboard" className="text-gray-400 text-sm hover:text-gray-600 mb-4 inline-block">
          ← Voltar
        </Link>

        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">{SPORT_EMOJIS[match.sport]}</span>
              <h1 className="text-lg font-bold text-gray-900">Partida</h1>
            </div>
            <span
              className={`text-xs font-medium px-2 py-1 rounded-full ${
                match.status === MatchStatus.CONFIRMED
                  ? 'bg-green-100 text-green-700'
                  : match.status === MatchStatus.DISPUTED
                    ? 'bg-red-100 text-red-600'
                    : 'bg-yellow-100 text-yellow-700'
              }`}
            >
              {STATUS_LABELS[match.status]}
            </span>
          </div>

          <div className="flex items-center justify-around py-4 border-y border-gray-100 mb-4">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center font-bold text-green-700 mx-auto mb-1">
                {p1?.name?.charAt(0) ?? '?'}
              </div>
              <p className="text-sm font-medium">{p1?.name ?? '—'}</p>
              <p className="text-xs text-gray-400">ELO {p1?.elo}</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-gray-700">{match.score}</p>
              <p className="text-xs text-gray-400 mt-1">
                {new Date(match.date).toLocaleDateString('pt-BR')}
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700 mx-auto mb-1">
                {p2?.name?.charAt(0) ?? '?'}
              </div>
              <p className="text-sm font-medium">{p2?.name ?? '—'}</p>
              <p className="text-xs text-gray-400">ELO {p2?.elo}</p>
            </div>
          </div>

          <p className="text-sm text-gray-500 mb-1">
            Vencedor registrado: <strong>{winner?.name ?? '—'}</strong>
          </p>
          <p className="text-xs text-gray-400">Registrado por: {registeredBy?.name ?? '—'}</p>

          {match.disputeReason && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-3">
              <p className="text-sm font-medium text-red-700">Motivo da disputa:</p>
              <p className="text-sm text-red-600 mt-1">{match.disputeReason}</p>
            </div>
          )}

          {error && <p className="text-red-500 text-sm mt-3">{error}</p>}

          {canAct && (
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleConfirm}
                disabled={actionLoading}
                className="flex-1 bg-green-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
              >
                Confirmar
              </button>
              <button
                onClick={handleDispute}
                disabled={actionLoading}
                className="flex-1 border border-red-300 text-red-600 py-2.5 rounded-lg text-sm font-medium hover:bg-red-50 disabled:opacity-50"
              >
                Disputar
              </button>
            </div>
          )}
        </div>

        {/* Apostas */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">
            🪙 Apostas ({bets.length})
          </h2>

          {canBet && !myBet && (
            <form onSubmit={handleBet} className="mb-5 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-3">Fazer aposta</p>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Quem vai ganhar?</label>
                  <select
                    required
                    value={betWinnerId}
                    onChange={(e) => setBetWinnerId(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  >
                    <option value="">Selecionar...</option>
                    {p1 && <option value={p1._id}>{p1.name}</option>}
                    {p2 && <option value={p2._id}>{p2.name}</option>}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Quantidade de moedas (saldo: {player?.coins ?? 0})
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={player?.coins ?? 0}
                    required
                    value={betAmount}
                    onChange={(e) => setBetAmount(Number(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                  <p className="text-xs text-gray-400 mt-1">Ganhe o dobro se acertar</p>
                </div>
                {betError && <p className="text-red-500 text-xs">{betError}</p>}
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="w-full bg-yellow-500 text-white rounded-lg py-2 text-sm font-medium hover:bg-yellow-600 disabled:opacity-50"
                >
                  Apostar
                </button>
              </div>
            </form>
          )}

          {myBet && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
              <p className="font-medium text-blue-800">Sua aposta</p>
              <p className="text-blue-600 mt-1">
                {typeof myBet.predictedWinner === 'object' ? myBet.predictedWinner.name : '—'} ·{' '}
                {myBet.amount} moedas
              </p>
              <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${BET_STATUS_LABELS[myBet.status].cls}`}>
                {BET_STATUS_LABELS[myBet.status].label}
              </span>
            </div>
          )}

          {bets.length === 0 ? (
            <p className="text-center text-gray-400 py-4 text-sm">
              {canBet ? 'Seja o primeiro a apostar!' : 'Nenhuma aposta ainda'}
            </p>
          ) : (
            <div className="space-y-2">
              {bets.map((bet) => {
                const bettor = typeof bet.bettor === 'object' ? bet.bettor : null
                const predicted = typeof bet.predictedWinner === 'object' ? bet.predictedWinner : null
                return (
                  <div key={bet._id} className="flex items-center justify-between text-sm py-2 border-b border-gray-50 last:border-0">
                    <div>
                      <span className="font-medium text-gray-700">{bettor?.name ?? '—'}</span>
                      <span className="text-gray-400"> apostou em </span>
                      <span className="font-medium text-gray-700">{predicted?.name ?? '—'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-600 font-medium">{bet.amount}🪙</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${BET_STATUS_LABELS[bet.status].cls}`}>
                        {BET_STATUS_LABELS[bet.status].label}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </>
  )
}
