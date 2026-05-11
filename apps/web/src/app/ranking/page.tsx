import Link from 'next/link'
export const dynamic = 'force-dynamic'
import { getPlayers } from '@/lib/api/players'
import { PageLayout } from '@/components/layout/page-layout'
import { PlayerAvatar } from '@/components/ui/player-avatar'
import { Gender, PlayerLevel, Sport } from '@rank-app/shared'
import { SPORT_OPTIONS, SPORT_LABEL } from '@/lib/sports'
import { BRAZIL_STATES } from '@/lib/brazil'
import { Trophy, Medal, ChevronRight, Search } from 'lucide-react'

const LEVEL_LABELS: Record<PlayerLevel, string> = {
  [PlayerLevel.BEGINNER]:     'Iniciante',
  [PlayerLevel.INTERMEDIATE]: 'Intermediário',
  [PlayerLevel.ADVANCED]:     'Avançado',
}

const selectCls = 'border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/20 transition-all cursor-pointer'
const inputCls  = 'border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/20 transition-all w-36'

export default async function RankingPage({
  searchParams,
}: {
  searchParams: Promise<{
    sport?: string; level?: string; gender?: string
    city?: string; state?: string; minAge?: string; maxAge?: string; page?: string
  }>
}) {
  const params = await searchParams
  const page   = Number(params.page ?? 1)

  const { data: players, total } = await getPlayers({
    sport:  params.sport  as Sport       | undefined,
    level:  params.level  as PlayerLevel | undefined,
    gender: params.gender as Gender      | undefined,
    city:   params.city,
    state:  params.state,
    minAge: params.minAge ? Number(params.minAge) : undefined,
    maxAge: params.maxAge ? Number(params.maxAge) : undefined,
    page, limit: 20,
  })

  function buildUrl(overrides: Record<string, string | undefined>) {
    const merged = { ...params, ...overrides, page: undefined }
    const qs = new URLSearchParams(
      Object.entries(merged).filter(([, v]) => v !== undefined && v !== '') as [string, string][],
    ).toString()
    return `/ranking${qs ? `?${qs}` : ''}`
  }

  const hasFilters = !!(params.sport || params.level || params.gender || params.city || params.state || params.minAge)
  const top3 = players.slice(0, 3)

  return (
    <PageLayout>
      <div className="flex-1 flex flex-col bg-gray-50 min-h-screen">

        {/* ── Hero do ranking ── */}
        <div className="bg-brand relative overflow-hidden shrink-0">
          <div className="absolute inset-0 bg-gradient-to-br from-brand to-[#2C0090]" />
          <div className="absolute right-0 top-0 h-full w-80 bg-white/[0.03] [clip-path:polygon(30%_0,100%_0,100%_100%,0%_100%)]" />

          <div className="relative z-10 px-8 py-7">
            <p className="text-white/40 text-[10px] uppercase tracking-[0.25em] font-semibold mb-1">
              Leaderboard
            </p>
            <div className="flex items-end justify-between">
              <div>
                <h1 className="text-3xl font-black text-white flex items-center gap-3">
                  <Trophy size={28} className="text-accent" />
                  Ranking
                </h1>
                <p className="text-white/40 text-sm mt-1">
                  {total} atleta{total !== 1 ? 's' : ''} competindo
                </p>
              </div>

              {/* Pódio top 3 */}
              {top3.length >= 3 && (
                <div className="hidden md:flex items-end gap-1 text-center">
                  {/* 2º */}
                  <div className="flex flex-col items-center">
                    <PlayerAvatar name={top3[1].name} avatar={top3[1].avatar} size="sm"
                      className="mb-1 opacity-70" />
                    <div className="bg-white/10 w-14 h-8 flex items-center justify-center">
                      <span className="text-white/60 text-xs font-bold">2º</span>
                    </div>
                  </div>
                  {/* 1º */}
                  <div className="flex flex-col items-center">
                    <Trophy size={16} className="text-accent mb-1" />
                    <PlayerAvatar name={top3[0].name} avatar={top3[0].avatar} size="md"
                      ring="accent" className="mb-1" />
                    <div className="bg-accent/20 w-14 h-12 flex items-center justify-center">
                      <span className="text-accent text-xs font-black">1º</span>
                    </div>
                  </div>
                  {/* 3º */}
                  <div className="flex flex-col items-center">
                    <PlayerAvatar name={top3[2].name} avatar={top3[2].avatar} size="sm"
                      className="mb-1 opacity-60" />
                    <div className="bg-white/10 w-14 h-6 flex items-center justify-center">
                      <span className="text-white/60 text-xs font-bold">3º</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Filtros ── */}
        <div className="bg-white border-b border-gray-100 px-8 py-4 shrink-0">
          <form method="get" action="/ranking" className="flex flex-wrap gap-2 items-center">
            <div className="flex items-center gap-2 text-gray-400 mr-1">
              <Search size={14} />
              <span className="text-xs font-medium text-gray-400">Filtrar:</span>
            </div>
            <select name="sport"  defaultValue={params.sport  ?? ''} className={selectCls}>
              <option value="">Todos os esportes</option>
              {SPORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <select name="gender" defaultValue={params.gender ?? ''} className={selectCls}>
              <option value="">Todos gêneros</option>
              <option value={Gender.MALE}>Masculino</option>
              <option value={Gender.FEMALE}>Feminino</option>
            </select>
            <select name="level"  defaultValue={params.level  ?? ''} className={selectCls}>
              <option value="">Todos os níveis</option>
              <option value={PlayerLevel.BEGINNER}>Iniciante</option>
              <option value={PlayerLevel.INTERMEDIATE}>Intermediário</option>
              <option value={PlayerLevel.ADVANCED}>Avançado</option>
            </select>
            <select name="state"  defaultValue={params.state  ?? ''} className={selectCls}>
              <option value="">Estado</option>
              {BRAZIL_STATES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            <input name="city" type="text" placeholder="Cidade..." defaultValue={params.city ?? ''} className={inputCls} />
            <button type="submit"
              className="bg-brand text-white text-sm font-bold px-4 py-2.5 hover:bg-brand-dark transition-colors">
              Buscar
            </button>
            {hasFilters && (
              <Link href="/ranking" className="text-xs text-gray-400 hover:text-red-400 transition-colors">
                Limpar
              </Link>
            )}
          </form>
        </div>

        {/* ── Lista de jogadores ── */}
        <div className="px-8 py-6 flex-1">
          {players.length === 0 ? (
            <div className="py-20 text-center bg-white border border-gray-100">
              <Trophy size={40} className="text-gray-200 mx-auto mb-4" />
              <p className="text-gray-400 text-sm">Nenhum atleta encontrado</p>
              <Link href="/ranking" className="text-brand text-sm font-bold mt-3 inline-block hover:underline">
                Limpar filtros
              </Link>
            </div>
          ) : (
            <div className="bg-white border border-gray-100 overflow-hidden">
              {players.map((player, index) => {
                const pos = (page - 1) * 20 + index + 1
                const isFirst  = pos === 1
                const isTop3   = pos <= 3

                return (
                  <Link key={player._id} href={`/players/${player._id}`}
                    className={`flex items-center gap-4 px-5 py-4 border-b border-gray-50 last:border-b-0 hover:bg-gray-50 transition-colors group ${
                      isFirst ? 'bg-accent/5 border-l-4 border-l-accent' :
                      isTop3  ? 'border-l-4 border-l-brand/30' :
                      'border-l-4 border-l-transparent'
                    }`}>

                    {/* Posição */}
                    <div className="w-8 shrink-0 text-right">
                      {isFirst ? (
                        <Trophy size={16} className="text-accent ml-auto" />
                      ) : isTop3 ? (
                        <Medal size={16} className="text-brand/50 ml-auto" />
                      ) : (
                        <span className="text-sm tabular-nums text-gray-300 font-medium">{pos}</span>
                      )}
                    </div>

                    {/* Avatar */}
                    <PlayerAvatar
                      name={player.name}
                      avatar={player.avatar}
                      size="sm"
                      ring={isFirst ? 'accent' : isTop3 ? 'brand' : 'none'}
                    />

                    {/* Nome + info */}
                    <div className="flex-1 min-w-0">
                      <p className={`font-bold truncate group-hover:text-brand transition-colors ${
                        isFirst ? 'text-gray-900' : 'text-gray-800'
                      }`}>
                        {player.name}
                      </p>
                      <p className="text-xs text-gray-400 truncate mt-0.5">
                        {SPORT_LABEL[player.sport]}
                        {player.city && ` · ${player.city}`}
                        {player.state && `, ${player.state}`}
                        {' · '}{LEVEL_LABELS[player.level]}
                      </p>
                    </div>

                    {/* W/L */}
                    <div className="hidden sm:flex items-center gap-1 shrink-0">
                      <span className="text-xs text-accent font-semibold tabular-nums">{player.wins}V</span>
                      <span className="text-gray-200 text-xs">·</span>
                      <span className="text-xs text-red-400 font-semibold tabular-nums">{player.losses}D</span>
                    </div>

                    {/* Rating */}
                    <div className={`shrink-0 text-right ${isFirst ? 'min-w-[72px]' : 'min-w-[60px]'}`}>
                      <p className={`font-black tabular-nums ${
                        isFirst ? 'text-accent text-xl' :
                        isTop3  ? 'text-brand text-base' :
                        'text-gray-700 text-sm'
                      }`}>
                        {player.elo}
                      </p>
                      <p className="text-[9px] text-gray-300 uppercase tracking-wide">Rating</p>
                    </div>

                    <ChevronRight size={13} className="text-gray-200 group-hover:text-brand transition-colors shrink-0" />
                  </Link>
                )
              })}
            </div>
          )}

          {/* Paginação */}
          {total > 20 && (
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100">
              {page > 1 ? (
                <Link href={buildUrl({ page: String(page - 1) })}
                  className="text-sm font-medium text-gray-400 hover:text-brand transition-colors">
                  ← Anterior
                </Link>
              ) : <span />}
              <span className="text-xs text-gray-300">{page} de {Math.ceil(total / 20)}</span>
              {page < Math.ceil(total / 20) && (
                <Link href={buildUrl({ page: String(page + 1) })}
                  className="text-sm font-medium text-gray-400 hover:text-brand transition-colors">
                  Próxima →
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  )
}
