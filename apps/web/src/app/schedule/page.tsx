'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { getSchedules } from '@/lib/api/schedules'
import { Header } from '@/components/layout/header'
import { GenderType, MatchType, ScheduledMatch, ScheduleStatus, Sport } from '@rank-app/shared'
import { useAuth } from '@/contexts/auth-context'
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

export default function SchedulePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { player, isAuthenticated } = useAuth()

  const sport = (searchParams.get('sport') as Sport | null) ?? undefined
  const matchType = (searchParams.get('matchType') as MatchType | null) ?? undefined
  const genderType = (searchParams.get('genderType') as GenderType | null) ?? undefined
  const page = Number(searchParams.get('page') ?? 1)

  const [schedules, setSchedules] = useState<ScheduledMatch[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  // Auto-filter to player's sport on first load when no sport param is set
  useEffect(() => {
    if (isAuthenticated && player?.sport && !searchParams.get('sport')) {
      const params = new URLSearchParams(searchParams.toString())
      params.set('sport', player.sport)
      router.replace(`/schedule?${params.toString()}`)
    }
  }, [isAuthenticated, player?.sport, searchParams, router])

  useEffect(() => {
    setLoading(true)
    getSchedules({ sport, matchType, genderType, page })
      .then((r) => { setSchedules(r.data); setTotal(r.total) })
      .finally(() => setLoading(false))
  }, [sport, matchType, genderType, page])

  function buildUrl(overrides: Record<string, string | undefined>) {
    const merged: Record<string, string> = {}
    searchParams.forEach((v, k) => { merged[k] = v })
    Object.entries(overrides).forEach(([k, v]) => {
      if (v === undefined) delete merged[k]
      else merged[k] = v
    })
    delete merged.page
    const qs = new URLSearchParams(merged).toString()
    return `/schedule${qs ? `?${qs}` : ''}`
  }

  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Partidas Agendadas</h1>
            {isAuthenticated && player?.sport && !searchParams.get('sport') ? null : (
              <p className="text-sm text-gray-500 mt-1">{total} partida(s) encontrada(s)</p>
            )}
          </div>
          <Link
            href="/schedule/new"
            className="bg-brand text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-dark"
          >
            + Criar partida
          </Link>
        </div>

        {/* Sport context banner for logged-in users */}
        {isAuthenticated && player?.sport && (
          <div className="flex items-center gap-2 mb-4 text-sm text-gray-500">
            <span>
              Mostrando:{' '}
              <strong className="text-brand">
                {sport ? SPORT_LABEL[sport] : SPORT_LABEL[player.sport]}
              </strong>
            </span>
            {sport !== undefined && (
              <Link href="/schedule" className="text-xs text-brand hover:underline">
                (ver todos os esportes)
              </Link>
            )}
          </div>
        )}

        {/* Sport filter */}
        <div className="flex gap-1.5 mb-3 flex-wrap">
          <Link
            href={buildUrl({ sport: undefined })}
            className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
              !sport ? 'bg-brand text-white border-brand' : 'border-gray-300 text-gray-600 hover:border-brand'
            }`}
          >
            Todos
          </Link>
          {SPORT_OPTIONS.map((o) => (
            <Link
              key={o.value}
              href={buildUrl({ sport: o.value })}
              className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                sport === o.value
                  ? 'bg-brand text-white border-brand'
                  : 'border-gray-300 text-gray-600 hover:border-brand'
              }`}
            >
              {o.label}
            </Link>
          ))}
        </div>

        {/* Format + gender filter */}
        <div className="flex gap-1.5 mb-6 flex-wrap">
          {(['', MatchType.INDIVIDUAL, MatchType.DOUBLES, MatchType.TEAM] as const).map((mt) => (
            <Link
              key={mt || 'all-mt'}
              href={buildUrl({ matchType: mt || undefined })}
              className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                (matchType === mt || (!matchType && !mt))
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'border-gray-300 text-gray-600 hover:border-blue-400'
              }`}
            >
              {mt ? MATCH_TYPE_LABEL[mt] : 'Qualquer formato'}
            </Link>
          ))}
          {(['' , GenderType.MIXED, GenderType.MALE, GenderType.FEMALE] as const).map((gt) => (
            <Link
              key={gt || 'all-gt'}
              href={buildUrl({ genderType: gt || undefined })}
              className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                (genderType === gt || (!genderType && !gt))
                  ? 'bg-purple-600 text-white border-purple-600'
                  : 'border-gray-300 text-gray-600 hover:border-purple-400'
              }`}
            >
              {gt ? GENDER_TYPE_LABEL[gt as GenderType] : 'Qualquer gênero'}
            </Link>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-400">Carregando...</div>
        ) : schedules.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">📅</p>
            <p>Nenhuma partida agendada</p>
            <Link href="/schedule/new" className="text-brand text-sm mt-2 inline-block hover:underline">
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
                      <span className={spotsLeft === 0 ? 'text-orange-600 font-medium' : 'text-accent'}>
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
