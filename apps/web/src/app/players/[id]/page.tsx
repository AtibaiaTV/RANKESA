import { notFound } from 'next/navigation'
import { getPlayer } from '@/lib/api/players'
import { getMatches } from '@/lib/api/matches'
import { Header } from '@/components/layout/header'
import { PlayerLevel, MatchStatus } from '@rank-app/shared'
import { SPORT_LABEL } from '@/lib/sports'

const LEVEL_LABELS: Record<PlayerLevel, string> = {
  [PlayerLevel.BEGINNER]: 'Iniciante',
  [PlayerLevel.INTERMEDIATE]: 'Intermediário',
  [PlayerLevel.ADVANCED]: 'Avançado',
}

const STATUS_LABELS: Record<MatchStatus, string> = {
  [MatchStatus.PENDING_REVIEW]: 'Aguardando confirmação',
  [MatchStatus.CONFIRMED]: 'Confirmada',
  [MatchStatus.DISPUTED]: 'Em disputa',
}

export default async function PlayerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [player, matchesData] = await Promise.all([
    getPlayer(id).catch(() => null),
    getMatches({ playerId: id, limit: 10 } as Parameters<typeof getMatches>[0]).catch(() => null),
  ])

  if (!player) notFound()

  const matches = matchesData?.data ?? []

  return (
    <>
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-brand-light flex items-center justify-center text-2xl font-bold text-brand">
              {player.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{player.name}</h1>
              <p className="text-brand font-medium text-sm">{SPORT_LABEL[player.sport]}</p>
              <p className="text-gray-500 text-sm">
                {player.city}{player.state && `, ${player.state}`}
                {' · '}{LEVEL_LABELS[player.level]}
                {player.venue && <span className="text-gray-400"> · {player.venue}</span>}
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-4 text-center">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-2xl font-bold text-brand">{player.elo}</p>
              <p className="text-xs text-gray-500 mt-1">ELO</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-2xl font-bold text-gray-800">{player.wins}</p>
              <p className="text-xs text-gray-500 mt-1">Vitórias</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-2xl font-bold text-gray-800">{player.losses}</p>
              <p className="text-xs text-gray-500 mt-1">Derrotas</p>
            </div>
          </div>
        </div>

        <h2 className="text-lg font-semibold text-gray-900 mb-3">Últimas partidas</h2>
        <div className="space-y-3">
          {matches.map((match) => {
            const p1 = typeof match.player1 === 'object' ? match.player1 : null
            const p2 = typeof match.player2 === 'object' ? match.player2 : null
            const winner = typeof match.winner === 'object' ? match.winner : null
            const isWinner = winner?._id === player._id

            return (
              <div
                key={match._id}
                className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between"
              >
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {p1?.name ?? '—'} vs {p2?.name ?? '—'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(match.date).toLocaleDateString('pt-BR')} · {match.score}
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full ${
                      match.status === MatchStatus.CONFIRMED
                        ? isWinner
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {match.status === MatchStatus.CONFIRMED
                      ? isWinner
                        ? 'Vitória'
                        : 'Derrota'
                      : STATUS_LABELS[match.status]}
                  </span>
                </div>
              </div>
            )
          })}
          {matches.length === 0 && (
            <p className="text-center text-gray-400 py-8">Nenhuma partida registrada</p>
          )}
        </div>
      </main>
    </>
  )
}
