import { notFound } from 'next/navigation'
export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { getPlayer } from '@/lib/api/players'
import { getMatches } from '@/lib/api/matches'
import { PageLayout } from '@/components/layout/page-layout'
import { PlayerAvatar } from '@/components/ui/player-avatar'
import { PlayerLevel, MatchStatus } from '@rank-app/shared'
import { SPORT_LABEL } from '@/lib/sports'
import { ArrowLeft, Trophy, Swords } from 'lucide-react'

const LEVEL_LABELS: Record<PlayerLevel, string> = {
  [PlayerLevel.BEGINNER]: 'Iniciante',
  [PlayerLevel.INTERMEDIATE]: 'Intermediário',
  [PlayerLevel.ADVANCED]: 'Avançado',
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
  const winRate = player.wins + player.losses > 0
    ? Math.round((player.wins / (player.wins + player.losses)) * 100)
    : 0

  return (
    <PageLayout>
      <div className="flex-1 flex flex-col bg-gray-50 min-h-screen">

        {/* ── Hero banner ── */}
        <div className="bg-brand relative overflow-hidden shrink-0">
          <div className="absolute inset-0 bg-gradient-to-br from-brand to-[#2C0090]" />
          <div className="absolute right-0 top-0 h-full w-72 bg-white/[0.03] [clip-path:polygon(25%_0,100%_0,100%_100%,0%_100%)]" />

          <div className="relative z-10 px-8 py-6">
            <Link href="/ranking"
              className="inline-flex items-center gap-1.5 text-white/40 hover:text-white/70 text-xs transition-colors mb-5">
              <ArrowLeft size={12} /> Ranking
            </Link>

            <div className="flex items-center gap-5">
              <PlayerAvatar
                name={player.name}
                avatar={player.avatar}
                size="lg"
                ring="accent"
                className="border-2 border-accent/50"
              />
              <div className="min-w-0 flex-1">
                <p className="text-white/40 text-[10px] uppercase tracking-[0.2em] font-semibold mb-0.5">
                  {SPORT_LABEL[player.sport]} · {LEVEL_LABELS[player.level]}
                  {player.city && ` · ${player.city}`}{player.state && `, ${player.state}`}
                </p>
                <h1 className="text-xl font-black text-white leading-tight truncate">{player.name}</h1>
              </div>
              <div className="shrink-0 text-right ml-auto">
                <p className="text-[42px] font-black text-accent leading-none tabular-nums">{player.elo}</p>
                <p className="text-white/30 text-[9px] uppercase tracking-[0.2em] mt-1">Rating</p>
              </div>
            </div>
          </div>

          {/* Stats bar */}
          <div className="relative z-10 grid grid-cols-3 border-t border-white/10 divide-x divide-white/10">
            {[
              { icon: Trophy,  value: player.wins,    label: 'Vitórias',  cls: 'text-accent' },
              { icon: Swords,  value: player.losses,  label: 'Derrotas',  cls: 'text-red-400' },
              { icon: Trophy,  value: `${winRate}%`,  label: 'Aproveit.', cls: 'text-white' },
            ].map(({ icon: Icon, value, label, cls }) => (
              <div key={label} className="flex items-center gap-3 px-6 py-4">
                <Icon size={14} className="text-white/20 shrink-0" />
                <div>
                  <p className={`text-xl font-black ${cls} leading-none`}>{value}</p>
                  <p className="text-white/30 text-[10px] mt-0.5">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <main className="px-8 py-6 flex-1">

          {/* Match history */}
          <div>
            <p className="text-sm font-bold text-gray-700 mb-3">Últimas partidas</p>

            {matches.length === 0 ? (
              <div className="py-14 text-center bg-white border border-gray-100">
                <p className="text-gray-300 text-4xl mb-3">—</p>
                <p className="text-gray-400 text-sm">Nenhuma partida registrada</p>
              </div>
            ) : (
              <div className="bg-white border border-gray-100 overflow-hidden">
                {matches.map((match) => {
                  const p1 = typeof match.player1 === 'object' ? match.player1 : null
                  const p2 = typeof match.player2 === 'object' ? match.player2 : null
                  const winner = typeof match.winner === 'object' ? match.winner : null
                  const isWinner = winner?._id === player._id

                  let borderCls = 'border-l-gray-200'
                  let statusLabel = ''
                  let statusCls = ''
                  if (match.status === MatchStatus.CONFIRMED) {
                    borderCls = isWinner ? 'border-l-accent' : 'border-l-red-400'
                    statusLabel = isWinner ? 'Vitória' : 'Derrota'
                    statusCls = isWinner ? 'text-accent font-bold' : 'text-red-500 font-bold'
                  } else if (match.status === MatchStatus.DISPUTED) {
                    borderCls = 'border-l-orange-400'
                    statusLabel = 'Em disputa'
                    statusCls = 'text-orange-500 font-medium'
                  } else {
                    statusLabel = 'Aguardando'
                    statusCls = 'text-gray-400 font-medium'
                  }

                  return (
                    <div key={match._id}
                      className={`flex items-center justify-between px-5 py-4 border-l-4 ${borderCls} border-b border-gray-50 last:border-b-0`}>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">
                          {p1?.name ?? '—'} <span className="font-normal text-gray-300">vs</span> {p2?.name ?? '—'}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {new Date(match.date).toLocaleDateString('pt-BR')} · {match.score}
                        </p>
                      </div>
                      <span className={`text-xs shrink-0 ml-6 ${statusCls}`}>
                        {statusLabel}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </main>

      </div>
    </PageLayout>
  )
}
