'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/auth-context'
import { getMatches, confirmMatch, disputeMatch } from '@/lib/api/matches'
import { getMyBets } from '@/lib/api/bets'
import { getSchedules } from '@/lib/api/schedules'
import { updateMe } from '@/lib/api/players'
import { Bet, BetStatus, Match, MatchStatus, ScheduledMatch, SubscriptionStatus } from '@rank-app/shared'
import { PageLayout } from '@/components/layout/page-layout'
import { PlayerAvatar } from '@/components/ui/player-avatar'
import { TrialBanner } from '@/components/ui/trial-banner'
import { SPORT_LABEL } from '@/lib/sports'
import {
  Plus, AlertTriangle, Coins, TrendingUp, Trophy, Swords, ChevronRight,
  Zap, CalendarDays, MapPin, Pencil, X, Check, Smartphone,
} from 'lucide-react'

const TEAL   = '#00BFA5'
const SURF   = '#161B22'
const SURF2  = '#1C2333'
const BORDER = '#30363D'
const MUTED  = '#8B949E'

const BET_STATUS_MAP: Record<BetStatus, { label: (a: number) => string; color: string }> = {
  [BetStatus.PENDING]:   { label: () => 'Pendente',       color: MUTED },
  [BetStatus.WON]:       { label: (a) => `+${a} boletas`, color: TEAL },
  [BetStatus.LOST]:      { label: (a) => `-${a} boletas`, color: '#F87171' },
  [BetStatus.CANCELLED]: { label: () => 'Cancelada',      color: '#4A5A6A' },
}

function SectionHeader({ icon: Icon, title, badge, action }: {
  icon: React.ElementType; title: string; badge?: string | number
  action?: React.ReactNode
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Icon size={14} style={{ color: MUTED }} />
        <span style={{ fontSize: 14, fontWeight: 700, color: '#E6EDF3' }}>{title}</span>
        {badge !== undefined && (
          <span style={{ fontSize: 11, fontWeight: 700, color: TEAL, background: 'rgba(0,191,165,0.1)', padding: '2px 8px', borderRadius: 999 }}>
            {badge}
          </span>
        )}
      </div>
      {action}
    </div>
  )
}

export default function DashboardPage() {
  const { player, token, isAuthenticated, updatePlayer } = useAuth()
  const router = useRouter()
  const [matches, setMatches]     = useState<Match[]>([])
  const [myBets, setMyBets]       = useState<Bet[]>([])
  const [schedules, setSchedules] = useState<ScheduledMatch[]>([])
  const [loading, setLoading]     = useState(true)

  const [profileOpen, setProfileOpen]     = useState(false)
  const [phoneForm, setPhoneForm]         = useState('')
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileError, setProfileError]   = useState('')

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return }
    if (!player) return
    setPhoneForm(player.phone ?? '')
    Promise.all([
      getMatches({ playerId: player._id, limit: 20 }),
      token ? getMyBets(token) : Promise.resolve([]),
      getSchedules({ playerId: player._id, limit: 20 }),
    ])
      .then(([matchesData, betsData, schedulesData]) => {
        setMatches(matchesData.data)
        setMyBets(betsData)
        setSchedules(schedulesData.data)
      })
      .finally(() => setLoading(false))
  }, [isAuthenticated, player, router, token])

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    if (!token || !player) return
    setProfileSaving(true); setProfileError('')
    try {
      const updated = await updateMe(token, { phone: phoneForm.trim() || undefined })
      updatePlayer({ ...player, phone: updated.phone })
      setProfileOpen(false)
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : 'Erro ao salvar perfil')
    } finally { setProfileSaving(false) }
  }

  async function handleConfirm(matchId: string) {
    if (!token) return
    await confirmMatch(token, matchId)
    setMatches(prev => prev.map(m => m._id === matchId ? { ...m, status: MatchStatus.CONFIRMED } : m))
  }

  async function handleDispute(matchId: string) {
    const reason = prompt('Motivo da disputa:')
    if (!reason || !token) return
    await disputeMatch(token, matchId, reason)
    setMatches(prev => prev.map(m => m._id === matchId ? { ...m, status: MatchStatus.DISPUTED } : m))
  }

  const pending = matches.filter(
    m => m.status === MatchStatus.PENDING_REVIEW &&
         typeof m.registeredBy === 'object' &&
         m.registeredBy._id !== player?._id,
  )

  const confirmed = matches.filter(m => m.status === MatchStatus.CONFIRMED)
  const winRate = confirmed.length > 0
    ? Math.round((confirmed.filter(m => typeof m.winner === 'object' && m.winner._id === player?._id).length / confirmed.length) * 100)
    : 0

  return (
    <PageLayout>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#0D1117' }}>

        {/* ── Hero card ── */}
        {player && (
          <div style={{ background: SURF, borderBottom: `1px solid ${BORDER}`, padding: '24px 32px 0' }}>
            {/* Top row: avatar + info + rating */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, paddingBottom: 20 }}>
              <PlayerAvatar name={player.name} avatar={player.avatar} size="lg"
                ring="accent" className="border-2 border-accent/50" />

              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ color: MUTED, fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', marginBottom: 3 }}>
                  {player.sport ? SPORT_LABEL[player.sport] : 'ATLETA'}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <h1 style={{ fontSize: 20, fontWeight: 900, color: '#E6EDF3', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {player.name}
                  </h1>
                  <button onClick={() => { setPhoneForm(player.phone ?? ''); setProfileOpen(true) }}
                    style={{ color: '#4A5A6A', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', flexShrink: 0 }}
                    onMouseEnter={e => (e.currentTarget.style.color = MUTED)}
                    onMouseLeave={e => (e.currentTarget.style.color = '#4A5A6A')}
                  >
                    <Pencil size={13} />
                  </button>
                </div>
                {!player.phone && (
                  <button onClick={() => { setPhoneForm(''); setProfileOpen(true) }}
                    style={{ fontSize: 10, color: '#B8860B', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 4, marginTop: 3 }}
                  >
                    <Smartphone size={9} /> Adicionar WhatsApp
                  </button>
                )}
              </div>

              {/* Rating */}
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <p style={{ fontSize: 44, fontWeight: 900, color: TEAL, lineHeight: 1, margin: 0, fontVariantNumeric: 'tabular-nums' }}>
                  {player.elo}
                </p>
                <p style={{ color: '#4A5A6A', fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', marginTop: 4 }}>
                  RATING
                </p>
              </div>
            </div>

            {/* Stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', borderTop: `1px solid ${BORDER}` }}>
              {[
                { icon: Trophy, value: player.wins,    label: 'Vitórias', color: TEAL,       href: undefined },
                { icon: Swords, value: player.losses,  label: 'Derrotas', color: '#F87171',  href: undefined },
                { icon: Coins,  value: player.boletas, label: 'Boletas',  color: '#F0B429',  href: '/boletas' },
              ].map(({ icon: Icon, value, label, color, href }, i) => {
                const inner = (
                  <>
                    <Icon size={14} style={{ color: BORDER, flexShrink: 0 }} />
                    <div>
                      <p style={{ fontSize: 22, fontWeight: 900, color, lineHeight: 1, margin: 0 }}>{value}</p>
                      <p style={{ fontSize: 10, color: '#4A5A6A', marginTop: 3 }}>{label}</p>
                    </div>
                  </>
                )
                const baseStyle: React.CSSProperties = {
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '14px 24px',
                  borderLeft: i > 0 ? `1px solid ${BORDER}` : 'none',
                  textDecoration: 'none',
                }
                return href ? (
                  <Link key={label} href={href} style={{ ...baseStyle, color: 'inherit' }}>
                    {inner}
                  </Link>
                ) : (
                  <div key={label} style={baseStyle}>{inner}</div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Trial banner ── */}
        {player && (
          <TrialBanner
            subscriptionStatus={player.subscriptionStatus ?? SubscriptionStatus.TRIAL}
            trialEndsAt={player.trialEndsAt}
          />
        )}

        <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* ── Próximas partidas ── */}
          <div>
            <SectionHeader
              icon={CalendarDays} title="Próximas partidas"
              badge={schedules.length > 0 ? schedules.length : undefined}
              action={
                <Link href="/schedule/new"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: TEAL, border: `1px solid rgba(0,191,165,0.3)`, borderRadius: 8, padding: '6px 14px', textDecoration: 'none', background: 'rgba(0,191,165,0.05)' }}>
                  <Plus size={12} /> Criar partida
                </Link>
              }
            />

            {loading ? null : schedules.length === 0 ? (
              <div style={{ border: `1px dashed ${BORDER}`, borderRadius: 12, padding: '24px', textAlign: 'center' }}>
                <CalendarDays size={24} style={{ color: BORDER, margin: '0 auto 8px' }} />
                <p style={{ fontSize: 13, color: MUTED }}>Você não tem partidas agendadas</p>
                <Link href="/schedule" style={{ fontSize: 12, color: TEAL, textDecoration: 'none', marginTop: 4, display: 'inline-block' }}>
                  Ver agenda →
                </Link>
              </div>
            ) : (
              <div style={{ background: SURF, border: `1px solid ${BORDER}`, borderRadius: 12, overflow: 'hidden' }}>
                {schedules.slice(0, 5).map((s, idx) => {
                  const organizer = typeof s.organizer === 'object' ? s.organizer : null
                  const isOrganizer = organizer?._id === player?._id
                  const matchDate = new Date(`${s.date}T${s.time ?? '00:00'}`)
                  const isPast = matchDate < new Date()
                  const statusColor: Record<string, string> = {
                    OPEN: TEAL, FULL: '#F0B429', CANCELLED: '#F87171', COMPLETED: MUTED,
                  }
                  const statusLabel: Record<string, string> = {
                    OPEN: 'Aberta', FULL: 'Lotada', CANCELLED: 'Cancelada', COMPLETED: 'Concluída',
                  }
                  return (
                    <Link key={s._id} href={`/schedule/${s._id}`}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '14px 20px', textDecoration: 'none',
                        borderTop: idx > 0 ? `1px solid ${BORDER}` : 'none',
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                          <p style={{ fontSize: 14, fontWeight: 700, color: '#E6EDF3', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {s.title}
                          </p>
                          {isOrganizer && (
                            <span style={{ fontSize: 10, fontWeight: 700, color: TEAL, background: 'rgba(0,191,165,0.1)', padding: '2px 6px', borderRadius: 4, flexShrink: 0 }}>
                              Organizador
                            </span>
                          )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, color: MUTED }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <CalendarDays size={11} />
                            {isPast ? 'Passou · ' : ''}{matchDate.toLocaleDateString('pt-BR')} {s.time}
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <MapPin size={11} /> {s.location}
                          </span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, marginLeft: 12 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: statusColor[s.status] ?? MUTED }}>
                          {statusLabel[s.status] ?? s.status}
                        </span>
                        <ChevronRight size={13} style={{ color: BORDER }} />
                      </div>
                    </Link>
                  )
                })}
                {schedules.length > 5 && (
                  <Link href="/schedule"
                    style={{ display: 'block', padding: '12px 20px', textAlign: 'center', fontSize: 12, color: TEAL, textDecoration: 'none', borderTop: `1px solid ${BORDER}` }}>
                    Ver todas ({schedules.length}) →
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* ── Confirmações pendentes ── */}
          {pending.length > 0 && (
            <div style={{ background: 'rgba(251,146,60,0.06)', border: '1px solid rgba(251,146,60,0.2)', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 20px', borderBottom: '1px solid rgba(251,146,60,0.15)', background: 'rgba(251,146,60,0.04)' }}>
                <AlertTriangle size={13} style={{ color: '#FB923C' }} />
                <p style={{ fontSize: 13, fontWeight: 700, color: '#FB923C', margin: 0 }}>
                  {pending.length} resultado{pending.length > 1 ? 's' : ''} aguardando confirmação
                </p>
              </div>
              {pending.map((m, idx) => {
                const opponent =
                  typeof m.player1 === 'object' && m.player1._id !== player?._id ? m.player1
                  : typeof m.player2 === 'object' ? m.player2 : null
                return (
                  <div key={m._id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '16px 20px', borderTop: idx > 0 ? '1px solid rgba(251,146,60,0.1)' : 'none',
                  }}>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 700, color: '#E6EDF3', margin: '0 0 2px' }}>
                        {opponent?.name ?? 'Adversário'} registrou um resultado
                      </p>
                      <p style={{ fontSize: 13, color: MUTED, margin: '0 0 2px' }}>{m.score}</p>
                      <p style={{ fontSize: 12, color: '#4A5A6A', margin: 0 }}>
                        {new Date(m.date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                      <button onClick={() => handleConfirm(m._id)}
                        style={{ background: TEAL, color: '#0D1117', fontSize: 12, fontWeight: 700, padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer' }}>
                        Confirmar
                      </button>
                      <button onClick={() => handleDispute(m._id)}
                        style={{ background: 'transparent', color: '#F87171', fontSize: 12, fontWeight: 600, padding: '8px 16px', borderRadius: 8, border: '1px solid rgba(248,113,113,0.3)', cursor: 'pointer' }}>
                        Disputar
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* ── Histórico ── */}
          <div>
            <SectionHeader
              icon={TrendingUp} title="Meu histórico"
              badge={winRate > 0 ? `${winRate}% aproveitamento` : undefined}
              action={
                <Link href="/matches/new"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: '#0D1117', background: TEAL, borderRadius: 8, padding: '7px 14px', textDecoration: 'none' }}>
                  <Plus size={12} /> Registrar partida
                </Link>
              }
            />

            {loading ? (
              <div style={{ padding: '48px 0', textAlign: 'center' }}>
                <div style={{ width: 28, height: 28, border: `2px solid rgba(0,191,165,0.15)`, borderTopColor: TEAL, borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
              </div>
            ) : matches.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 0', textAlign: 'center' }}>
                <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(0,191,165,0.05)', border: '1px solid rgba(0,191,165,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  <Zap size={28} style={{ color: 'rgba(0,191,165,0.3)' }} />
                </div>
                <p style={{ fontSize: 16, fontWeight: 900, color: '#E6EDF3', margin: '0 0 6px' }}>Nenhuma partida ainda</p>
                <p style={{ fontSize: 13, color: MUTED, marginBottom: 20, maxWidth: 280 }}>
                  Registre sua primeira partida e comece a subir no ranking!
                </p>
                <Link href="/matches/new"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: TEAL, color: '#0D1117', fontWeight: 700, fontSize: 14, padding: '12px 24px', borderRadius: 10, textDecoration: 'none' }}>
                  <Plus size={15} /> Registrar primeira partida
                </Link>
              </div>
            ) : (
              <div style={{ background: SURF, border: `1px solid ${BORDER}`, borderRadius: 12, overflow: 'hidden' }}>
                {matches.map((m, idx) => {
                  const winner   = typeof m.winner  === 'object' ? m.winner  : null
                  const p1       = typeof m.player1 === 'object' ? m.player1 : null
                  const p2       = typeof m.player2 === 'object' ? m.player2 : null
                  const isWinner = winner?._id === player?._id

                  let leftBorder = '#4A5A6A'
                  let badge: React.ReactNode = null

                  if (m.status === MatchStatus.CONFIRMED) {
                    leftBorder = isWinner ? TEAL : '#F87171'
                    badge = (
                      <span style={{ fontSize: 11, fontWeight: 700, color: isWinner ? TEAL : '#F87171', background: isWinner ? 'rgba(0,191,165,0.1)' : 'rgba(248,113,113,0.1)', padding: '3px 10px', borderRadius: 6 }}>
                        {isWinner ? 'Vitória' : 'Derrota'}
                      </span>
                    )
                  } else if (m.status === MatchStatus.DISPUTED) {
                    leftBorder = '#FB923C'
                    badge = <span style={{ fontSize: 11, fontWeight: 600, color: '#FB923C' }}>Em disputa</span>
                  } else {
                    badge = <span style={{ fontSize: 11, color: '#4A5A6A' }}>Aguardando</span>
                  }

                  return (
                    <Link key={m._id} href={`/matches/${m._id}`}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '14px 20px', textDecoration: 'none',
                        borderTop: idx > 0 ? `1px solid ${BORDER}` : 'none',
                        borderLeft: `3px solid ${leftBorder}`,
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 14, fontWeight: 700, color: '#E6EDF3', margin: '0 0 3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {p1?.name ?? '—'} <span style={{ color: BORDER, fontWeight: 400 }}>vs</span> {p2?.name ?? '—'}
                        </p>
                        <p style={{ fontSize: 12, color: MUTED, margin: 0 }}>
                          {m.score} · {new Date(m.date).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, marginLeft: 16 }}>
                        {badge}
                        <ChevronRight size={13} style={{ color: BORDER }} />
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>

          {/* ── Apostas ── */}
          {myBets.length > 0 && (
            <div>
              <SectionHeader icon={Coins} title="Minhas apostas" />
              <div style={{ background: SURF, border: `1px solid ${BORDER}`, borderRadius: 12, overflow: 'hidden' }}>
                {myBets.map((bet, idx) => {
                  const matchData = typeof bet.match === 'object' ? bet.match : null
                  const predicted = typeof bet.predictedWinner === 'object' ? bet.predictedWinner : null
                  const s = BET_STATUS_MAP[bet.status]
                  return (
                    <div key={bet._id}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderTop: idx > 0 ? `1px solid ${BORDER}` : 'none' }}>
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 700, color: '#E6EDF3', margin: '0 0 3px' }}>
                          {predicted?.name ?? '—'}
                        </p>
                        <p style={{ fontSize: 12, color: MUTED, margin: 0 }}>
                          {matchData ? new Date(matchData.date).toLocaleDateString('pt-BR') : ''}
                        </p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                        <span style={{ fontSize: 13, color: MUTED, fontWeight: 500 }}>{bet.amount} bol.</span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: s.color }}>{s.label(bet.amount)}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ── Profile modal ── */}
      {profileOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px' }}>
          <div style={{ background: SURF2, border: `1px solid ${BORDER}`, borderRadius: 16, width: '100%', maxWidth: 400 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: `1px solid ${BORDER}` }}>
              <h2 style={{ fontSize: 14, fontWeight: 700, color: '#E6EDF3', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Smartphone size={14} style={{ color: TEAL }} /> WhatsApp para convites
              </h2>
              <button onClick={() => setProfileOpen(false)}
                style={{ color: MUTED, background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveProfile} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: MUTED, marginBottom: 8, letterSpacing: '0.1em' }}>
                  NÚMERO DO WHATSAPP
                </label>
                <input type="tel" placeholder="Ex: +55 11 99999-9999" value={phoneForm}
                  onChange={e => setPhoneForm(e.target.value)}
                  style={{ width: '100%', background: '#111823', border: `1px solid ${BORDER}`, borderRadius: 10, padding: '12px 14px', fontSize: 14, color: '#E6EDF3', outline: 'none' }}
                  onFocus={e => { e.currentTarget.style.borderColor = TEAL }}
                  onBlur={e  => { e.currentTarget.style.borderColor = BORDER }}
                />
                <p style={{ fontSize: 12, color: MUTED, marginTop: 6 }}>
                  Inclua o DDD e o código do país (+55 para Brasil).
                </p>
              </div>
              {profileError && (
                <p style={{ fontSize: 12, color: '#F87171', background: 'rgba(248,113,113,0.07)', border: '1px solid rgba(248,113,113,0.18)', borderRadius: 8, padding: '8px 12px', margin: 0 }}>
                  {profileError}
                </p>
              )}
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" disabled={profileSaving}
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: TEAL, color: '#0D1117', fontSize: 14, fontWeight: 700, padding: '11px 0', borderRadius: 10, border: 'none', cursor: 'pointer', opacity: profileSaving ? 0.6 : 1 }}>
                  <Check size={14} /> {profileSaving ? 'Salvando...' : 'Salvar'}
                </button>
                <button type="button" onClick={() => setProfileOpen(false)}
                  style={{ border: `1px solid ${BORDER}`, color: MUTED, fontSize: 14, padding: '11px 20px', borderRadius: 10, background: 'transparent', cursor: 'pointer' }}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageLayout>
  )
}
