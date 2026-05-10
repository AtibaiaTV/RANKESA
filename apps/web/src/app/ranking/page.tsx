import Link from 'next/link'
import { getPlayers } from '@/lib/api/players'
import { Header } from '@/components/layout/header'
import { PlayerLevel } from '@tennis-rank/shared'

const LEVEL_LABELS: Record<PlayerLevel, string> = {
  [PlayerLevel.BEGINNER]: 'Iniciante',
  [PlayerLevel.INTERMEDIATE]: 'Intermediário',
  [PlayerLevel.ADVANCED]: 'Avançado',
}

export default async function RankingPage({
  searchParams,
}: {
  searchParams: Promise<{ level?: string; city?: string; page?: string }>
}) {
  const params = await searchParams
  const page = Number(params.page ?? 1)
  const { data: players, total } = await getPlayers({
    level: params.level as PlayerLevel | undefined,
    city: params.city,
    page,
    limit: 20,
  })

  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Ranking</h1>
          <span className="text-sm text-gray-500">{total} jogadores</span>
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          {(['', PlayerLevel.BEGINNER, PlayerLevel.INTERMEDIATE, PlayerLevel.ADVANCED] as const).map(
            (lvl) => (
              <Link
                key={lvl || 'all'}
                href={`/ranking${lvl ? `?level=${lvl}` : ''}`}
                className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                  params.level === lvl || (!params.level && !lvl)
                    ? 'bg-green-600 text-white border-green-600'
                    : 'border-gray-300 text-gray-600 hover:border-green-400'
                }`}
              >
                {lvl ? LEVEL_LABELS[lvl] : 'Todos'}
              </Link>
            ),
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {players.map((player, index) => (
            <Link
              key={player._id}
              href={`/players/${player._id}`}
              className="flex items-center gap-4 px-5 py-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors"
            >
              <span className="w-8 text-center font-bold text-gray-400 text-sm">
                {(page - 1) * 20 + index + 1}
              </span>
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center font-semibold text-green-700 flex-shrink-0">
                {player.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{player.name}</p>
                <p className="text-sm text-gray-500">
                  {player.city} · {LEVEL_LABELS[player.level]}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-green-600 text-lg">{player.elo}</p>
                <p className="text-xs text-gray-400">{player.wins}V {player.losses}D</p>
              </div>
            </Link>
          ))}
          {players.length === 0 && (
            <div className="py-16 text-center text-gray-400">Nenhum jogador encontrado</div>
          )}
        </div>
      </main>
    </>
  )
}
