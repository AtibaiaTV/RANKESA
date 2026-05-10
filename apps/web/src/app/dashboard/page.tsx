'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/auth-context'
import { getMatches } from '@/lib/api/matches'
import { confirmMatch, disputeMatch } from '@/lib/api/matches'
import { Match, MatchStatus } from '@tennis-rank/shared'
import { Header } from '@/components/layout/header'

export default function DashboardPage() {
  const { player, token, isAuthenticated } = useAuth()
  const router = useRouter()
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    if (!player) return

    getMatches({ playerId: player._id, limit: 20 })
      .then((r) => setMatches(r.data))
      .finally(() => setLoading(false))
  }, [isAuthenticated, player, router])

  async function handleConfirm(matchId: string) {
    if (!token) return
    await confirmMatch(token, matchId)
    setMatches((prev) =>
      prev.map((m) =>
        m._id === matchId ? { ...m, status: MatchStatus.CONFIRMED } : m,
      ),
    )
  }

  async function handleDispute(matchId: string) {
    const reason = prompt('Motivo da disputa:')
    if (!reason || !token) return
    await disputeMatch(token, matchId, reason)
    setMatches((prev) =>
      prev.map((m) =>
        m._id === matchId ? { ...m, status: MatchStatus.DISPUTED } : m,
      ),
    )
  }

  const pending = matches.filter(
    (m) =>
      m.status === MatchStatus.PENDING_REVIEW &&
      typeof m.registeredBy === 'object' &&
      m.registeredBy._id !== player?._id,
  )

  return (
    <>
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Meu Painel</h1>
          <Link
            href="/matches/new"
            className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700"
          >
            + Registrar partida
          </Link>
        </div>

        {player && (
          <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-3xl font-bold text-green-600">{player.elo}</p>
                <p className="text-xs text-gray-500 mt-1">ELO</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-800">{player.wins}</p>
                <p className="text-xs text-gray-500 mt-1">Vitórias</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-800">{player.losses}</p>
                <p className="text-xs text-gray-500 mt-1">Derrotas</p>
              </div>
            </div>
          </div>
        )}

        {pending.length > 0 && (
          <div className="mb-6">
            <h2 className="text-base font-semibold text-orange-600 mb-3">
              ⚠️ Aguardando sua confirmação ({pending.length})
            </h2>
            <div className="space-y-3">
              {pending.map((m) => {
                const opponent =
                  typeof m.player1 === 'object' && m.player1._id !== player?._id
                    ? m.player1
                    : typeof m.player2 === 'object'
                      ? m.player2
                      : null

                return (
                  <div
                    key={m._id}
                    className="bg-orange-50 border border-orange-200 rounded-xl p-4"
                  >
                    <p className="font-medium text-gray-900">
                      {opponent?.name ?? 'Adversário'} registrou: {m.score}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(m.date).toLocaleDateString('pt-BR')}
                    </p>
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleConfirm(m._id)}
                        className="flex-1 bg-green-600 text-white text-sm py-1.5 rounded-lg hover:bg-green-700"
                      >
                        Confirmar
                      </button>
                      <button
                        onClick={() => handleDispute(m._id)}
                        className="flex-1 border border-red-300 text-red-600 text-sm py-1.5 rounded-lg hover:bg-red-50"
                      >
                        Disputar
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <h2 className="text-base font-semibold text-gray-900 mb-3">Histórico de partidas</h2>
        {loading ? (
          <p className="text-center text-gray-400 py-8">Carregando...</p>
        ) : (
          <div className="space-y-2">
            {matches.map((m) => {
              const winner = typeof m.winner === 'object' ? m.winner : null
              const isWinner = winner?._id === player?._id
              const p1 = typeof m.player1 === 'object' ? m.player1 : null
              const p2 = typeof m.player2 === 'object' ? m.player2 : null

              return (
                <Link
                  key={m._id}
                  href={`/matches/${m._id}`}
                  className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-3 hover:bg-gray-50"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {p1?.name ?? '—'} vs {p2?.name ?? '—'}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{m.score}</p>
                  </div>
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full ${
                      m.status === MatchStatus.CONFIRMED
                        ? isWinner
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                        : m.status === MatchStatus.DISPUTED
                          ? 'bg-red-100 text-red-600'
                          : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {m.status === MatchStatus.CONFIRMED
                      ? isWinner
                        ? 'Vitória'
                        : 'Derrota'
                      : m.status === MatchStatus.DISPUTED
                        ? 'Em disputa'
                        : 'Aguardando'}
                  </span>
                </Link>
              )
            })}
            {matches.length === 0 && (
              <p className="text-center text-gray-400 py-8">Nenhuma partida ainda</p>
            )}
          </div>
        )}
      </main>
    </>
  )
}
