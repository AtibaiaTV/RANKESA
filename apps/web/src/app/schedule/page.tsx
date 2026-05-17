'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { getSchedules } from '@/lib/api/schedules'
import { PageLayout } from '@/components/layout/page-layout'
import { Player, ScheduledMatch, ScheduleStatus, Sport } from '@rank-app/shared'
import { SPORT_LABEL, SPORT_OPTIONS } from '@/lib/sports'
import { Plus, MapPin, Calendar, Users, ChevronDown, BarChart2, CheckCircle, Globe, Clock } from 'lucide-react'
import { PlayerAvatar } from '@/components/ui/player-avatar'

const TEAL   = '#00BFA5'
const SURF   = '#161B22'
const BORDER = '#30363D'
const MUTED  = '#8B949E'

const SPORT_COLOR: Partial<Record<Sport, string>> = {
  [Sport.TENNIS]:           '#22C55E',
  [Sport.PADEL]:            '#3B82F6',
  [Sport.BEACH_TENNIS]:     '#F97316',
  [Sport.SQUASH]:           '#10B981',
  [Sport.BADMINTON]:        '#06B6D4',
  [Sport.TABLE_TENNIS]:     '#60A5FA',
  [Sport.VOLLEYBALL]:       '#EAB308',
  [Sport.BEACH_VOLLEYBALL]: '#FB923C',
  [Sport.FUTSAL]:           '#2563EB',
  [Sport.BASKETBALL]:       '#F97316',
  [Sport.FOOTBALL]:         '#22C55E',
  [Sport.HANDBALL]:         '#EF4444',
  [Sport.FOOTVOLLEY]:       '#10B981',
  [Sport.CHESS]:            '#A16207',
}

const SPORT_EMOJI: Partial<Record<Sport, string>> = {
  [Sport.TENNIS]:           '🎾',
  [Sport.PADEL]:            '🏓',
  [Sport.BEACH_TENNIS]:     '🏸',
  [Sport.SQUASH]:           '🎾',
  [Sport.BADMINTON]:        '🏸',
  [Sport.TABLE_TENNIS]:     '🏓',
  [Sport.VOLLEYBALL]:       '🏐',
  [Sport.BEACH_VOLLEYBALL]: '🏐',
  [Sport.FUTSAL]:           '⚽',
  [Sport.BASKETBALL]:       '🏀',
  [Sport.FOOTBALL]:         '⚽',
  [Sport.HANDBALL]:         '🤾',
  [Sport.FOOTVOLLEY]:       '🏐',
  [Sport.CHESS]:            '♟️',
}

type StatusInfo = { label: string; color: string; bg: string }
const STATUS_CONFIG: Record<ScheduleStatus, StatusInfo> = {
  [ScheduleStatus.OPEN]:      { label: 'Aberta',     color: '#22C55E', bg: 'transparent'              },
  [ScheduleStatus.FULL]:      { label: 'Confirmada', color: TEAL,      bg: 'rgba(0,191,165,0.15)'     },
  [ScheduleStatus.CANCELLED]: { label: 'Cancelado',  color: MUTED,     bg: 'rgba(139,148,158,0.12)'   },
  [ScheduleStatus.COMPLETED]: { label: 'Concluído',  color: MUTED,     bg: 'rgba(139,148,158,0.12)'   },
}

function fmtDate(dateStr: string, time: string) {
  const d = new Date(dateStr)
  const day = d.getDate()
  const month = d.toLocaleDateString('pt-BR', { month: 'short' })
    .replace('.', '').replace(/^(.)/, c => c.toUpperCase())
  return `${day} ${month}  ${time}`
}

function FilterSelect({
  icon, value, onChange, children, placeholder,
}: {
  icon: React.ReactNode
  value: string
  onChange?: (v: string) => void
  children: React.ReactNode
  placeholder: string
}) {
  return (
    <div style={{ position: 'relative', flex: 1 }}>
      <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: MUTED, display: 'flex', pointerEvents: 'none' }}>
        {icon}
      </div>
      <select
        value={value}
        onChange={e => onChange?.(e.target.value)}
        style={{
          width: '100%', background: SURF, border: `1px solid ${BORDER}`, borderRadius: 10,
          padding: '12px 38px 12px 40px', fontSize: 14, color: value ? '#E6EDF3' : MUTED,
          appearance: 'none', cursor: 'pointer', outline: 'none',
        }}
      >
        <option value="">{placeholder}</option>
        {children}
      </select>
      <ChevronDown size={14} style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', color: MUTED, pointerEvents: 'none' }} />
    </div>
  )
}

function MatchCard({ match }: { match: ScheduledMatch }) {
  const sportColor   = SPORT_COLOR[match.sport] ?? TEAL
  const emoji        = SPORT_EMOJI[match.sport] ?? '🏅'
  const st           = STATUS_CONFIG[match.status]
  const resolved     = match.players.filter((p): p is Player => typeof p === 'object')
  const avatars      = resolved.slice(0, 3)
  const extra        = match.players.length - avatars.length

  return (
    <Link
      href={`/schedule/${match._id}`}
      style={{
        textDecoration: 'none', display: 'block',
        background: SURF, border: `1px solid ${BORDER}`, borderRadius: 14,
        padding: '20px 20px 18px', transition: 'border-color .15s',
      }}
    >
      {/* Sport + status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <div style={{
          width: 52, height: 52, borderRadius: '50%', flexShrink: 0,
          background: sportColor + '20', border: `2px solid ${sportColor}40`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
        }}>
          {emoji}
        </div>

        <p style={{ fontSize: 20, fontWeight: 900, color: '#E6EDF3', flex: 1, margin: 0 }}>
          {SPORT_LABEL[match.sport]}
        </p>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0,
          background: st.bg, borderRadius: 20, padding: '4px 10px',
          border: st.bg === 'transparent' ? 'none' : `1px solid ${st.color}30`,
        }}>
          {match.status === ScheduleStatus.OPEN && (
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: st.color }} />
          )}
          {match.status === ScheduleStatus.FULL && (
            <CheckCircle size={11} style={{ color: st.color }} />
          )}
          {(match.status === ScheduleStatus.CANCELLED || match.status === ScheduleStatus.COMPLETED) && (
            <Clock size={11} style={{ color: st.color }} />
          )}
          <span style={{ fontSize: 12, fontWeight: 700, color: st.color }}>{st.label}</span>
        </div>
      </div>

      {/* Date */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
        <Calendar size={14} style={{ color: TEAL }} />
        <span style={{ fontSize: 14, color: TEAL, fontWeight: 600 }}>{fmtDate(match.date, match.time)}</span>
      </div>

      {/* Location */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 7, marginBottom: 18 }}>
        <MapPin size={14} style={{ color: MUTED, marginTop: 2, flexShrink: 0 }} />
        <div>
          <p style={{ fontSize: 14, fontWeight: 600, color: '#E6EDF3', margin: 0 }}>{match.location}</p>
          <p style={{ fontSize: 12, color: MUTED, margin: '2px 0 0' }}>{match.city}</p>
        </div>
      </div>

      {/* Players */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {avatars.length === 0 ? (
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#1C2333', border: `2px dashed ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={13} style={{ color: MUTED }} />
            </div>
          ) : (
            avatars.map((p, i) => (
              <div key={p._id} style={{ marginLeft: i === 0 ? 0 : -10, borderRadius: '50%', border: `2px solid ${SURF}`, overflow: 'hidden', zIndex: avatars.length - i, position: 'relative' }}>
                <PlayerAvatar name={p.name} avatar={p.avatar} size="sm" ring="none" />
              </div>
            ))
          )}
          {extra > 0 && (
            <div style={{ marginLeft: -10, width: 32, height: 32, borderRadius: '50%', background: '#1C2333', border: `2px solid ${SURF}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: MUTED, position: 'relative', zIndex: 0 }}>
              +{extra}
            </div>
          )}
        </div>
        <span style={{ fontSize: 13, color: MUTED, fontWeight: 600 }}>
          {match.players.length}/{match.maxPlayers} jogadores
        </span>
      </div>
    </Link>
  )
}

function ScheduleContent() {
  const searchParams = useSearchParams()
  const router       = useRouter()

  const sport  = (searchParams.get('sport')  as Sport         | null) ?? undefined
  const status = (searchParams.get('status') as ScheduleStatus | null) ?? undefined
  const page   = Number(searchParams.get('page') ?? 1)

  const [schedules, setSchedules] = useState<ScheduledMatch[]>([])
  const [total,     setTotal]     = useState(0)
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    setLoading(true)
    getSchedules({ sport, page })
      .then(r => { setSchedules(r.data); setTotal(r.total) })
      .catch(() => setSchedules([]))
      .finally(() => setLoading(false))
  }, [sport, page])

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

  const displayed = status ? schedules.filter(s => s.status === status) : schedules

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#0D1117', minHeight: '100vh', padding: '32px 40px', position: 'relative' }}>

      {/* Title */}
      <h1 style={{ fontSize: 42, fontWeight: 900, color: '#E6EDF3', margin: '0 0 28px', letterSpacing: '-0.02em' }}>
        Partidas
      </h1>

      {/* Filter bar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 32 }}>
        <FilterSelect
          icon={<Globe size={15} />}
          value={sport ?? ''}
          onChange={v => router.push(buildUrl({ sport: v || undefined }))}
          placeholder="Todos os Esportes"
        >
          {SPORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </FilterSelect>

        <FilterSelect icon={<Calendar size={15} />} value="" placeholder="Data">
          {null}
        </FilterSelect>

        <FilterSelect icon={<BarChart2 size={15} />} value="" placeholder="Nível">
          <option value="BEGINNER">Iniciante</option>
          <option value="INTERMEDIATE">Intermediário</option>
          <option value="ADVANCED">Avançado</option>
        </FilterSelect>

        <FilterSelect
          icon={<CheckCircle size={15} />}
          value={status ?? ''}
          onChange={v => router.push(buildUrl({ status: v || undefined }))}
          placeholder="Status"
        >
          <option value={ScheduleStatus.OPEN}>Aberta</option>
          <option value={ScheduleStatus.FULL}>Confirmada</option>
          <option value={ScheduleStatus.CANCELLED}>Cancelada</option>
          <option value={ScheduleStatus.COMPLETED}>Concluída</option>
        </FilterSelect>
      </div>

      {/* Cards */}
      {loading ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: MUTED, fontSize: 14 }}>Carregando...</p>
        </div>
      ) : displayed.length === 0 ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <p style={{ color: MUTED, fontSize: 15 }}>Nenhuma partida encontrada</p>
          <Link href="/schedule/new" style={{ color: TEAL, fontSize: 13, textDecoration: 'none', fontWeight: 600 }}>
            Criar a primeira partida
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {displayed.map(m => <MatchCard key={m._id} match={m} />)}
        </div>
      )}

      {/* Pagination */}
      {total > 20 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24 }}>
          {page > 1 ? (
            <Link href={buildUrl({ page: String(page - 1) })} style={{ fontSize: 13, fontWeight: 600, color: TEAL, textDecoration: 'none' }}>← Anterior</Link>
          ) : <span />}
          <span style={{ fontSize: 12, color: MUTED }}>{page} de {Math.ceil(total / 20)}</span>
          {page < Math.ceil(total / 20) && (
            <Link href={buildUrl({ page: String(page + 1) })} style={{ fontSize: 13, fontWeight: 600, color: TEAL, textDecoration: 'none' }}>Próxima →</Link>
          )}
        </div>
      )}

      {/* FAB */}
      <div style={{ position: 'fixed', bottom: 32, right: 32, display: 'flex', alignItems: 'center', gap: 10, zIndex: 50 }}>
        <span style={{ background: '#161B22', color: '#E6EDF3', fontSize: 13, fontWeight: 600, padding: '7px 14px', borderRadius: 8, border: `1px solid ${BORDER}`, whiteSpace: 'nowrap' }}>
          Nova Partida
        </span>
        <Link
          href="/schedule/new"
          style={{ width: 52, height: 52, borderRadius: '50%', background: TEAL, display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', boxShadow: '0 4px 20px rgba(0,191,165,0.4)', flexShrink: 0 }}
        >
          <Plus size={22} style={{ color: '#0D1117' }} />
        </Link>
      </div>
    </div>
  )
}

export default function SchedulePage() {
  return (
    <PageLayout>
      <Suspense fallback={
        <div style={{ flex: 1, background: '#0D1117', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: '#8B949E', fontSize: 14 }}>Carregando...</p>
        </div>
      }>
        <ScheduleContent />
      </Suspense>
    </PageLayout>
  )
}
