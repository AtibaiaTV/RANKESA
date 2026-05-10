import Link from 'next/link'
import { getPlayers } from '@/lib/api/players'
import { Header } from '@/components/layout/header'
import { Gender, PlayerLevel, Sport } from '@rank-app/shared'
import { SPORT_OPTIONS, SPORT_LABEL } from '@/lib/sports'
import { BRAZIL_STATES, BRAZIL_REGIONS } from '@/lib/brazil'

const LEVEL_LABELS: Record<PlayerLevel, string> = {
  [PlayerLevel.BEGINNER]: 'Iniciante',
  [PlayerLevel.INTERMEDIATE]: 'Intermediário',
  [PlayerLevel.ADVANCED]: 'Avançado',
}

const GENDER_LABELS: Record<Gender, string> = {
  [Gender.MALE]: 'Masculino',
  [Gender.FEMALE]: 'Feminino',
  [Gender.PREFER_NOT_TO_SAY]: 'Outro',
}

const AGE_GROUPS = [
  { label: 'Sub-18', minAge: undefined, maxAge: 17 },
  { label: '18–29', minAge: 18, maxAge: 29 },
  { label: '30–39', minAge: 30, maxAge: 39 },
  { label: '40–49', minAge: 40, maxAge: 49 },
  { label: '50+', minAge: 50, maxAge: undefined },
]

export default async function RankingPage({
  searchParams,
}: {
  searchParams: Promise<{
    sport?: string
    level?: string
    gender?: string
    city?: string
    venue?: string
    region?: string
    state?: string
    country?: string
    minAge?: string
    maxAge?: string
    page?: string
  }>
}) {
  const params = await searchParams
  const page = Number(params.page ?? 1)

  const { data: players, total } = await getPlayers({
    sport: params.sport as Sport | undefined,
    level: params.level as PlayerLevel | undefined,
    gender: params.gender as Gender | undefined,
    city: params.city,
    venue: params.venue,
    region: params.region,
    state: params.state,
    country: params.country,
    minAge: params.minAge ? Number(params.minAge) : undefined,
    maxAge: params.maxAge ? Number(params.maxAge) : undefined,
    page,
    limit: 20,
  })

  function buildUrl(overrides: Record<string, string | undefined>) {
    const merged = { ...params, ...overrides, page: undefined }
    const qs = new URLSearchParams(
      Object.entries(merged).filter(([, v]) => v !== undefined && v !== '') as [string, string][],
    ).toString()
    return `/ranking${qs ? `?${qs}` : ''}`
  }

  const currentMinAge = params.minAge ? Number(params.minAge) : undefined
  const currentMaxAge = params.maxAge ? Number(params.maxAge) : undefined

  return (
    <>
      <Header />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Ranking</h1>
            <p className="text-sm text-gray-500 mt-0.5">{total} atleta(s)</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 space-y-4">

          {/* Esporte */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Esporte</p>
            <div className="flex gap-1.5 flex-wrap">
              <Link
                href={buildUrl({ sport: undefined })}
                className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                  !params.sport ? 'bg-brand text-white border-brand' : 'border-gray-300 text-gray-600 hover:border-brand'
                }`}
              >
                Todos
              </Link>
              {SPORT_OPTIONS.map((o) => (
                <Link
                  key={o.value}
                  href={buildUrl({ sport: o.value })}
                  className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                    params.sport === o.value
                      ? 'bg-brand text-white border-brand'
                      : 'border-gray-300 text-gray-600 hover:border-brand'
                  }`}
                >
                  {o.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Localização */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Localização</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
              {/* País */}
              <input
                key={`country-${params.country}`}
                type="text"
                placeholder="País"
                defaultValue={params.country ?? ''}
                form="filter-form"
                name="country"
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand"
              />
              {/* Estado */}
              <select
                key={`state-${params.state}`}
                defaultValue={params.state ?? ''}
                form="filter-form"
                name="state"
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand"
              >
                <option value="">Estado</option>
                {BRAZIL_STATES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
              {/* Região */}
              <select
                key={`region-${params.region}`}
                defaultValue={params.region ?? ''}
                form="filter-form"
                name="region"
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand"
              >
                <option value="">Região</option>
                {BRAZIL_REGIONS.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
              {/* Cidade */}
              <input
                key={`city-${params.city}`}
                type="text"
                placeholder="Cidade"
                defaultValue={params.city ?? ''}
                form="filter-form"
                name="city"
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand"
              />
              {/* Clube / espaço */}
              <input
                key={`venue-${params.venue}`}
                type="text"
                placeholder="Clube / Espaço"
                defaultValue={params.venue ?? ''}
                form="filter-form"
                name="venue"
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>
            {/* Hidden form that submits location fields */}
            <form id="filter-form" method="get" action="/ranking" className="mt-2 flex items-center gap-2">
              {params.sport && <input type="hidden" name="sport" value={params.sport} />}
              {params.level && <input type="hidden" name="level" value={params.level} />}
              {params.gender && <input type="hidden" name="gender" value={params.gender} />}
              {params.minAge && <input type="hidden" name="minAge" value={params.minAge} />}
              {params.maxAge && <input type="hidden" name="maxAge" value={params.maxAge} />}
              <button
                type="submit"
                className="bg-brand text-white px-4 py-1.5 rounded-lg text-xs font-medium hover:bg-brand-dark"
              >
                Filtrar
              </button>
              {(params.city || params.venue || params.region || params.state || params.country) && (
                <Link
                  href={buildUrl({ city: undefined, venue: undefined, region: undefined, state: undefined, country: undefined })}
                  className="text-xs text-gray-400 hover:text-gray-600"
                >
                  Limpar localização
                </Link>
              )}
            </form>
          </div>

          {/* Gênero */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Gênero</p>
            <div className="flex gap-1.5 flex-wrap">
              <Link
                href={buildUrl({ gender: undefined })}
                className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                  !params.gender ? 'bg-brand text-white border-brand' : 'border-gray-300 text-gray-600 hover:border-brand'
                }`}
              >
                Todos
              </Link>
              {([Gender.MALE, Gender.FEMALE] as Gender[]).map((g) => (
                <Link
                  key={g}
                  href={buildUrl({ gender: g })}
                  className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                    params.gender === g
                      ? 'bg-brand text-white border-brand'
                      : 'border-gray-300 text-gray-600 hover:border-brand'
                  }`}
                >
                  {GENDER_LABELS[g]}
                </Link>
              ))}
            </div>
          </div>

          {/* Faixa etária */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Faixa etária</p>
            <div className="flex gap-1.5 flex-wrap">
              <Link
                href={buildUrl({ minAge: undefined, maxAge: undefined })}
                className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                  !params.minAge && !params.maxAge ? 'bg-brand text-white border-brand' : 'border-gray-300 text-gray-600 hover:border-brand'
                }`}
              >
                Todas
              </Link>
              {AGE_GROUPS.map((ag) => {
                const active =
                  String(currentMinAge ?? '') === String(ag.minAge ?? '') &&
                  String(currentMaxAge ?? '') === String(ag.maxAge ?? '')
                return (
                  <Link
                    key={ag.label}
                    href={buildUrl({
                      minAge: ag.minAge !== undefined ? String(ag.minAge) : undefined,
                      maxAge: ag.maxAge !== undefined ? String(ag.maxAge) : undefined,
                    })}
                    className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                      active
                        ? 'bg-brand text-white border-brand'
                        : 'border-gray-300 text-gray-600 hover:border-brand'
                    }`}
                  >
                    {ag.label}
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Nível */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Nível</p>
            <div className="flex gap-1.5 flex-wrap">
              <Link
                href={buildUrl({ level: undefined })}
                className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                  !params.level ? 'bg-brand text-white border-brand' : 'border-gray-300 text-gray-600 hover:border-brand'
                }`}
              >
                Todos
              </Link>
              {([PlayerLevel.BEGINNER, PlayerLevel.INTERMEDIATE, PlayerLevel.ADVANCED] as PlayerLevel[]).map((lvl) => (
                <Link
                  key={lvl}
                  href={buildUrl({ level: lvl })}
                  className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                    params.level === lvl
                      ? 'bg-brand text-white border-brand'
                      : 'border-gray-300 text-gray-600 hover:border-brand'
                  }`}
                >
                  {LEVEL_LABELS[lvl]}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
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
              <div className="w-10 h-10 rounded-full bg-brand-light flex items-center justify-center font-semibold text-brand flex-shrink-0">
                {player.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{player.name}</p>
                <p className="text-sm text-gray-500 truncate">
                  {SPORT_LABEL[player.sport]} · {player.city}
                  {player.state && `, ${player.state}`}
                  {player.venue && ` · ${player.venue}`}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-bold text-brand text-lg">{player.elo}</p>
                <p className="text-xs text-gray-400">{player.wins}V {player.losses}D</p>
              </div>
            </Link>
          ))}
          {players.length === 0 && (
            <div className="py-16 text-center text-gray-400">
              <p className="text-3xl mb-3">🔍</p>
              <p>Nenhum atleta encontrado com esses filtros</p>
              <Link href="/ranking" className="text-brand text-sm mt-2 inline-block hover:underline">
                Limpar filtros
              </Link>
            </div>
          )}
        </div>

        {/* Pagination */}
        {total > 20 && (
          <div className="flex justify-center gap-2 mt-6">
            {page > 1 && (
              <Link
                href={buildUrl({ page: String(page - 1) })}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:border-brand"
              >
                ← Anterior
              </Link>
            )}
            <span className="px-4 py-2 text-sm text-gray-500">
              Página {page} de {Math.ceil(total / 20)}
            </span>
            {page < Math.ceil(total / 20) && (
              <Link
                href={buildUrl({ page: String(page + 1) })}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:border-brand"
              >
                Próxima →
              </Link>
            )}
          </div>
        )}
      </main>
    </>
  )
}
