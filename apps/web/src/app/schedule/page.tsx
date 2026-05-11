'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { getSchedules } from '@/lib/api/schedules'
import { PageLayout } from '@/components/layout/page-layout'
import { GenderType, MatchType, ScheduledMatch, ScheduleStatus, Sport } from '@rank-app/shared'
import { useAuth } from '@/contexts/auth-context'
import { GENDER_TYPE_LABEL, MATCH_TYPE_LABEL, SPORT_LABEL, SPORT_OPTIONS } from '@/lib/sports'
import { Plus, MapPin, Clock, Users } from 'lucide-react'

const STATUS_CONFIG: Record<ScheduleStatus, { label: string; cls: string }> = {
  [ScheduleStatus.OPEN]:      { label: 'Aberto',    cls: 'text-accent font-semibold' },
  [ScheduleStatus.FULL]:      { label: 'Lotado',    cls: 'text-orange-500 font-semibold' },
  [ScheduleStatus.CANCELLED]: { label: 'Cancelado', cls: 'text-gray-300 font-medium' },
  [ScheduleStatus.COMPLETED]: { label: 'Concluído', cls: 'text-gray-400 font-medium' },
}

const pill = (active: boolean) =>
  `px-3 py-2 text-sm transition-colors border-l-2 ${
    active
      ? 'border-brand text-brand font-semibold bg-brand/5'
      : 'border-transparent text-gray-400 hover:text-gray-700 font-normal'
  }`

const inputCls = 'w-full border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:border-brand transition-colors bg-white text-gray-700'

function ScheduleContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { player, isAuthenticated } = useAuth()

  const sport      = (searchParams.get('sport')      as Sport      | null) ?? undefined
  const matchType  = (searchParams.get('matchType')  as MatchType  | null) ?? undefined
  const genderType = (searchParams.get('genderType') as GenderType | null) ?? undefined
  const page       = Number(searchParams.get('page') ?? 1)

  const [schedules, setSchedules] = useState<ScheduledMatch[]>([])
  const [total, setTotal]         = useState(0)
  const [loading, setLoading]     = useState(true)

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

  function navTo(url: string) { router.push(url) }

  return (
    <main className="max-w-5xl mx-auto px-6 py-8">

        {/* Título */}
        <div className="mb-6">
          <p className="text-xs text-gray-400 mb-1">Agenda</p>
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">Partidas</h1>
            <Link href="/schedule/new"
              className="inline-flex items-center gap-2 bg-brand text-white text-sm font-bold px-4 py-2 hover:bg-brand-dark transition-colors">
              <Plus size={14} /> Criar partida
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-[220px_1fr] gap-8">

          {/* Sidebar */}
          <aside className="space-y-5">

            {/* Esporte */}
            <div>
              <p className="text-xs font-semibold text-gray-400 mb-2">Esporte</p>
              <select
                value={sport ?? ''}
                onChange={(e) => navTo(buildUrl({ sport: e.target.value || undefined }))}
                className={inputCls}
              >
                <option value="">Todos os esportes</option>
                {SPORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            {/* Formato */}
            <div>
              <p className="text-xs font-semibold text-gray-400 mb-2">Formato</p>
              <div className="flex flex-col gap-2">
                {([
                  { value: undefined, label: 'Todos' },
                  { value: MatchType.INDIVIDUAL, label: 'Individual' },
                  { value: MatchType.DOUBLES,    label: 'Duplas' },
                  { value: MatchType.TEAM,       label: 'Times' },
                ] as const).map(({ value, label }) => (
                  <Link key={label} href={buildUrl({ matchType: value })}
                    className={pill(!value ? !matchType : matchType === value)}>
                    {label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Gênero */}
            <div>
              <p className="text-xs font-semibold text-gray-400 mb-2">Gênero</p>
              <div className="flex flex-col gap-2">
                {([
                  { value: undefined,          label: 'Todos' },
                  { value: GenderType.MIXED,   label: 'Misto' },
                  { value: GenderType.MALE,    label: 'Masculino' },
                  { value: GenderType.FEMALE,  label: 'Feminino' },
                ] as const).map(({ value, label }) => (
                  <Link key={label} href={buildUrl({ genderType: value })}
                    className={pill(!value ? !genderType : genderType === value)}>
                    {label}
                  </Link>
                ))}
              </div>
            </div>

            {(sport || matchType || genderType) && (
              <Link href="/schedule"
                className="block text-xs text-gray-400 hover:text-red-400 transition-colors">
                ✕ Limpar filtros
              </Link>
            )}
          </aside>

          {/* Lista */}
          <div>
            <p className="text-xs text-gray-400 mb-6">
              {total} partida{total !== 1 ? 's' : ''} encontrada{total !== 1 ? 's' : ''}
            </p>

            {loading ? (
              <div className="py-20 text-center border border-gray-100">
                <p className="text-gray-300 text-xs font-bold tracking-widest uppercase">Carregando...</p>
              </div>
            ) : schedules.length === 0 ? (
              <div className="py-24 text-center border border-gray-100">
                <p className="text-gray-300 text-5xl font-black mb-4">—</p>
                <p className="text-gray-400 text-sm">Nenhuma partida agendada</p>
                <Link href="/schedule/new"
                  className="text-brand text-sm font-medium mt-4 inline-block hover:underline">
                  Criar a primeira
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 border border-gray-100">
                {schedules.map((s) => {
                  const organizer = typeof s.organizer === 'object' ? s.organizer : null
                  const spotsLeft = s.maxPlayers - s.players.length
                  const status = STATUS_CONFIG[s.status]

                  return (
                    <Link key={s._id} href={`/schedule/${s._id}`}
                      className="flex items-center gap-6 px-6 py-5 hover:bg-gray-50 transition-colors group">

                      {/* Data */}
                      <div className="text-center shrink-0 w-12">
                        <p className="text-xl font-black text-brand leading-none">
                          {new Date(s.date).getDate()}
                        </p>
                        <p className="text-xs text-gray-300 uppercase tracking-wide mt-0.5">
                          {new Date(s.date).toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}
                        </p>
                      </div>

                      <div className="w-px h-10 bg-gray-100 shrink-0" />

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 group-hover:text-brand transition-colors truncate">
                          {s.title}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {SPORT_LABEL[s.sport]} · {MATCH_TYPE_LABEL[s.matchType]}
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="flex items-center gap-1.5 text-xs text-gray-400">
                            <Clock size={10} /> {s.time}
                          </span>
                          <span className="flex items-center gap-1.5 text-xs text-gray-400">
                            <MapPin size={10} /> {s.city}
                          </span>
                          <span className="flex items-center gap-1.5 text-xs text-gray-400">
                            <Users size={10} />
                            <span className={spotsLeft === 0 ? 'text-orange-500 font-bold' : ''}>
                              {s.players.length}/{s.maxPlayers}
                            </span>
                          </span>
                        </div>
                      </div>

                      {/* Status */}
                      <div className="text-right shrink-0">
                        <span className={`text-xs ${status.cls}`}>{status.label}</span>
                        <p className="text-xs text-gray-300 mt-1">{organizer?.name ?? '—'}</p>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </main>
  )
}

export default function SchedulePage() {
  return (
    <PageLayout>
      <Suspense fallback={
        <div className="max-w-6xl mx-auto px-8 py-14">
          <p className="text-gray-300 text-xs font-bold tracking-widest uppercase">Carregando...</p>
        </div>
      }>
        <ScheduleContent />
      </Suspense>
    </PageLayout>
  )
}
