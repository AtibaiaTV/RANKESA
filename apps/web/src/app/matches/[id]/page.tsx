'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/auth-context'
import { getMatch, confirmMatch, disputeMatch } from '@/lib/api/matches'
import { Match, MatchStatus } from '@tennis-rank/shared'
import { Header } from '@/components/layout/header'

const STATUS_LABELS: Record<MatchStatus, string> = {
  [MatchStatus.PENDING_REVIEW]: 'Aguardando confirmação',
  [MatchStatus.CONFIRMED]: 'Confirmada',
  [MatchStatus.DISPUTED]: 'Em disputa',
}

export default function MatchDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { player, token } = useAuth()
  const router = useRouter()
  const [match, setMatch] = useState<Match | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    getMatch(id)
      .then(setMatch)
      .catch(() => router.push('/'))
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

  if (loading) return <div className="p-8 text-center text-gray-400">Carregando...</div>
  if (!match) return null

  const p1 = typeof match.player1 === 'object' ? match.player1 : null
  const p2 = typeof match.player2 === 'object' ? match.player2 : null
  const winner = typeof match.winner === 'object' ? match.winner : null
  const registeredBy = typeof match.registeredBy === 'object' ? match.registeredBy : null

  const isParticipant =
    player && (p1?._id === player._id || p2?._id === player._id)
  const isOpponent =
    isParticipant && registeredBy?._id !== player?._id
  const canAct = isOpponent && match.status === MatchStatus.PENDING_REVIEW

  return (
    <>
      <Header />
      <main className="max-w-md mx-auto px-4 py-8">
        <Link href="/dashboard" className="text-gray-400 text-sm hover:text-gray-600 mb-4 inline-block">
          ← Voltar
        </Link>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-lg font-bold text-gray-900">Partida</h1>
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

          <p className="text-sm text-gray-500 mb-4">
            Vencedor: <strong>{winner?.name ?? '—'}</strong>
          </p>
          <p className="text-xs text-gray-400 mb-4">
            Registrado por: {registeredBy?.name ?? '—'}
          </p>

          {match.disputeReason && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-sm font-medium text-red-700">Motivo da disputa:</p>
              <p className="text-sm text-red-600 mt-1">{match.disputeReason}</p>
            </div>
          )}

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          {canAct && (
            <div className="flex gap-3">
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
      </main>
    </>
  )
}
