import Link from 'next/link'
import { getSchedules } from '@/lib/api/schedules'
import { Header } from '@/components/layout/header'
import { GenderType, MatchType, ScheduleStatus, Sport } from '@tennis-rank/shared'
import {
  GENDER_TYPE_LABEL,
  MATCH_TYPE_LABEL,
  SPORT_LABEL,
  SPORT_OPTIONS,
} from '@/lib/sports'

const STATUS_STYLE: Record<ScheduleStatus, string> = {
  [ScheduleStatus.OPEN]: 'bg-green-100 text-green-700',
  [ScheduleStatus.FULL]: 'bg-orange-100 text-orange-700',
  [ScheduleStatus.CANCELLED]: 'bg-gray-100 text-gray-500',
  [ScheduleStatus.COMPLETED]: 'bg-blue-100 text-blue-700',
}

const STATUS_LABEL: Record<ScheduleStatus, string> = {
  [ScheduleStatus.OPEN]: 'Aberto',
  [ScheduleStatus.FULL]: 'Lotado',
  [ScheduleStatus.CANCELLED]: 'Cancelado',
  [ScheduleStatus.COMPLETED]: 'Concluído',
}

export default async function SchedulePage({
  searchParams,
}: {
  searchParams: Promise<{ sport?: string; matchType?: string; genderType?: string; page?: string }>
}) {
  const params = await searchParams
  const page = Number(params.page ?? 1)

  const { data: schedules, total } = await getSchedules({
    sport: params.sport as Sport | undefined,
    matchType: params.matchType as MatchType | undefined,
    genderType: params.genderType as GenderType | undefined,
    page,
  })

  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Partidas Agendadas</h1>
            <p className="text-sm text-gray-500 mt-1">{total} partida(s) encontrada(s)</p>
          </div>
          <Link
            href="/schedule/new"
            className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700"
          >
            + Criar partida
          </Link>
        </div>

        {/* Filtros de esporte */}
        <div className="flex gap-2 mb-3 flex-wrap">
          <Link
            href="/schedule"
            className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
              !params.sport ? 'bg-green-600 text-white border-green-600' : 'border-gray-300 text-gray-600 hover:border-green-400'
            }`}
          >
            Todos
          </Link>
          {SPORT_OPTIONS.map((o) => (
            <Link
              key={o.value}
              href={`/schedule?sport=${o.value}${params.matchType ? `&matchType=${params.matchType}` : ''}${params.genderType ? `&genderType=${params.genderType}` : ''}`}
              className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                params.sport === o.value
                  ? 'bg-green-600 text-white border-green-600'
                  : 'border-gray-300 text-gray-600 hover:border-green-400'
              }`}
            >
              {o.label}
            </Link>
          ))}
        </div>

        {/* Filtros de modalidade e gênero */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {(['', MatchType.INDIVIDUAL, MatchType.DOUBLES, MatchType.TEAM] as const).map((mt) => (
            <Link
              key={mt || 'all-mt'}
              href={`/schedule?${params.sport ? `sport=${params.sport}&` : ''}${mt ? `matchType=${mt}` : ''}${params.genderType ? `&genderType=${params.genderType}` : ''}`}
              className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                (params.matchType === mt || (!params.matchType && !mt))
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'border-gray-300 text-gray-600 hover:border-blue-400'
              }`}
            >
              {mt ? MATCH_TYPE_LABEL[mt] : 'Qualquer formato'}
            </Link>
          ))}
          {['', GenderType.MIXED, GenderType.MALE, GenderType.FEMALE].map((gt) => (
            <Link
              key={gt || 'all-gt'}
              href={`/schedule?${params.sport ? `sport=${params.sport}&` : ''}${params.matchType ? `matchType=${params.matchType}&` : ''}${gt ? `genderType=${gt}` : ''}`}
              className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                (params.genderType === gt || (!params.genderType && !gt))
                  ? 'bg-purple-600 text-white border-purple-600'
                  : 'border-gray-300 text-gray-600 hover:border-purple-400'
              }`}
            >
              {gt ? GENDER_TYPE_LABEL[gt as GenderType] : 'Qualquer gênero'}
            </Link>
          ))}
        </div>

        {schedules.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">📅</p>
            <p>Nenhuma partida agendada</p>
            <Link href="/schedule/new" className="text-green-600 text-sm mt-2 inline-block hover:underline">
              Criar a primeira
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {schedules.map((s) => {
              const organizer = typeof s.organizer === 'object' ? s.organizer : null
              const spotsLeft = s.maxPlayers - s.players.length
              return (
                <Link
                  key={s._id}
                  href={`/schedule/${s._id}`}
                  className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-gray-900">{s.title}</p>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {SPORT_LABEL[s.sport]} · {MATCH_TYPE_LABEL[s.matchType]}
                      </p>
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full shrink-0 ml-2 ${STATUS_STYLE[s.status]}`}>
                      {STATUS_LABEL[s.status]}
                    </span>
                  </div>

                  <div className="text-sm text-gray-600 space-y-1">
                    <p>📅 {new Date(s.date).toLocaleDateString('pt-BR')} às {s.time}</p>
                    <p>📍 {s.location}, {s.city}</p>
                    <p>
                      {GENDER_TYPE_LABEL[s.genderType]} ·{' '}
                      <span className={spotsLeft === 0 ? 'text-orange-600 font-medium' : 'text-green-600'}>
                        {s.players.length}/{s.maxPlayers} confirmados
                      </span>
                    </p>
                  </div>

                  <p className="text-xs text-gray-400 mt-3">
                    Organizado por {organizer?.name ?? '—'}
                  </p>
                </Link>
              )
            })}
          </div>
        )}
      </main>
    </>
  )
}
