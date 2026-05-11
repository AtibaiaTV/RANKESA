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
import { Bet, BetStatus, Match, MatchStatus, ScheduledMatch, ScheduleStatus, SubscriptionStatus } from '@rank-app/shared'
import { PageLayout } from '@/components/layout/page-layout'
import { PlayerAvatar } from '@/components/ui/player-avatar'
import { TrialBanner } from '@/components/ui/trial-banner'
import { SPORT_LABEL } from '@/lib/sports'
import {
  Plus, AlertTriangle, Coins, TrendingUp, Trophy, Swords, ChevronRight,
  Zap, HelpCircle, CalendarDays, MapPin, Pencil, X, Check, Smartphone,
} from 'lucide-react'

const BET_STATUS_MAP: Record<BetStatus, { label: (amount: number) => string; cls: string }> = {
  [BetStatus.PENDING]:   { label: () => 'Pendente',       cls: 'text-gray-400' },
  [BetStatus.WON]:       { label: (a) => `+${a} boletas`, cls: 'text-accent font-semibold' },
  [BetStatus.LOST]:      { label: (a) => `-${a} boletas`, cls: 'text-red-500 font-semibold' },
  [BetStatus.CANCELLED]: { label: () => 'Cancelada',      cls: 'text-gray-300' },
}

export default function DashboardPage() {
  const { player, token, isAuthenticated } = useAuth()
  const router = useRouter()
  const [matches, setMatches]     = useState<Match[]>([])
  const [myBets, setMyBets]       = useState<Bet[]>([])
  const [schedules, setSchedules] = useState<ScheduledMatch[]>([])
  const [loading, setLoading]     = useState(true)

  // Profile edit modal
  const [profileOpen, setProfileOpen]   = useState(false)
  const [phoneForm, setPhoneForm]       = useState('')
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileError, setProfileError]  = useState('')

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
    if (!token) return
    setProfileSaving(true)
    setProfileError('')
    try {
      await updateMe(token, { phone: phoneForm.trim() || undefined })
      setProfileOpen(false)
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : 'Erro ao salvar perfil')
    } finally {
      setProfileSaving(false)
    }
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
      <div className="flex-1 flex flex-col min-h-screen bg-gray-50">

        {/* ── Hero banner ── */}
        {player && (
          <div className="bg-brand relative overflow-hidden shrink-0">
            {/* Decoração geométrica */}
            <div className="absolute inset-0 bg-gradient-to-br from-brand via-brand to-[#2C0090]" />
            <div className="absolute right-0 top-0 h-full w-72 bg-white/[0.03] [clip-path:polygon(25%_0,100%_0,100%_100%,0%_100%)]" />
            <div className="absolute left-1/2 top-0 h-full w-px bg-white/5" />

            <div className="relative z-10 px-8 py-7 flex items-center gap-5">
              {/* Avatar */}
              <PlayerAvatar
                name={player.name}
                avatar={player.avatar}
                size="lg"
                ring="accent"
                className="border-2 border-accent/50"
              />

              {/* Nome + esporte */}
              <div className="min-w-0">
                <p className="text-white/50 text-[10px] uppercase tracking-[0.2em] font-semibold mb-0.5">
                  {player.sport ? SPORT_LABEL[player.sport] : 'Atleta'}
                </p>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-black text-white leading-tight truncate">
                    {player.name}
                  </h1>
                  <button
                    onClick={() => { setPhoneForm(player.phone ?? ''); setProfileOpen(true) }}
                    title="Editar perfil"
                    className="text-white/30 hover:text-white/70 transition-colors shrink-0"
                  >
                    <Pencil size={13} />
                  </button>
                </div>
                {!player.phone && (
                  <button
                    onClick={() => { setPhoneForm(''); setProfileOpen(true) }}
                    className="text-[10px] text-yellow-300/70 hover:text-yellow-300 transition-colors flex items-center gap-1 mt-0.5"
                  >
                    <Smartphone size={9} /> Adicionar WhatsApp
                  </button>
                )}
              </div>

              {/* Rating em destaque */}
              <div className="ml-auto shrink-0 text-right">
                <p className="text-[42px] font-black text-accent leading-none tabular-nums">
                  {player.elo}
                </p>
                <p className="text-white/30 text-[9px] uppercase tracking-[0.2em] mt-1">
                  Rating
                </p>
              </div>
            </div>

            {/* Stats rápidos dentro do banner */}
            <div className="relative z-10 grid grid-cols-3 border-t border-white/10 divide-x divide-white/10">
              {[
                { icon: Trophy, value: player.wins,    label: 'Vitórias', cls: 'text-accent',        href: undefined },
                { icon: Swords, value: player.losses,  label: 'Derrotas', cls: 'text-red-400',       href: undefined },
                { icon: Coins,  value: player.boletas, label: 'Boletas',  cls: 'text-yellow-300',    href: '/boletas' },
              ].map(({ icon: Icon, value, label, cls, href }) => {
                const inner = (
                  <>
                    <Icon size={14} className="text-white/20 shrink-0" />
                    <div>
                      <p className={`text-xl font-black ${cls} leading-none`}>{value}</p>
                      <p className="text-white/30 text-[10px] mt-0.5">{label}</p>
                    </div>
                    {href && <HelpCircle size={11} className="ml-auto text-white/15" />}
                  </>
                )
                return href ? (
                  <Link key={label} href={href} className="flex items-center gap-3 px-6 py-4 hover:bg-white/5 transition-colors">
                    {inner}
                  </Link>
                ) : (
                  <div key={label} className="flex items-center gap-3 px-6 py-4">
                    {inner}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Trial / assinatura ── */}
        {player && (
          <TrialBanner
            subscriptionStatus={player.subscriptionStatus ?? SubscriptionStatus.TRIAL}
            trialEndsAt={player.trialEndsAt}
          />
        )}

        {/* ── Próximas partidas agendadas ── */}
        <div className="px-8 pt-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <CalendarDays size={14} className="text-gray-400" />
              <p className="text-sm font-bold text-gray-700">Próximas partidas</p>
              {schedules.length > 0 && (
                <span className="text-xs bg-brand/10 text-brand font-semibold px-2 py-0.5 rounded-full">
                  {schedules.length}
                </span>
              )}
            </div>
            <Link
              href="/schedule/new"
              className="inline-flex items-center gap-2 border border-brand text-brand text-xs font-bold px-4 py-2 hover:bg-brand hover:text-white transition-colors rounded-lg"
            >
              <Plus size={13} /> Criar partida
            </Link>
          </div>

          {loading ? null : schedules.length === 0 ? (
            <div className="border border-dashed border-gray-200 rounded-xl px-5 py-6 text-center mb-4">
              <CalendarDays size={24} className="text-gray-200 mx-auto mb-2" />
              <p className="text-sm text-gray-400">Você não tem partidas agendadas</p>
              <Link href="/schedule" className="text-xs text-brand font-medium mt-1 inline-block hover:underline">
                Ver agenda →
              </Link>
            </div>
          ) : (
            <div className="bg-white border border-gray-100 rounded-xl overflow-hidden divide-y divide-gray-50 mb-4">
              {schedules.slice(0, 5).map(s => {
                const organizer = typeof s.organizer === 'object' ? s.organizer : null
                const isOrganizer = organizer?._id === player?._id
                const matchDate = new Date(`${s.date}T${s.time ?? '00:00'}`)
                const isPast = matchDate < new Date()
                const statusCls: Record<string, string> = {
                  OPEN: 'bg-green-50 text-green-600',
                  FULL: 'bg-brand/10 text-brand',
                  CANCELLED: 'bg-red-50 text-red-500',
                  COMPLETED: 'bg-gray-100 text-gray-400',
                }
                const statusLabel: Record<string, string> = {
                  OPEN: 'Aberta', FULL: 'Lotada', CANCELLED: 'Cancelada', COMPLETED: 'Concluída',
                }
                return (
                  <Link key={s._id} href={`/schedule/${s._id}`}
                    className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors group">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="font-bold text-gray-900 text-sm group-hover:text-brand transition-colors truncate">
                          {s.title}
                        </p>
                        {isOrganizer && (
                          <span className="text-[10px] bg-brand/10 text-brand px-1.5 py-0.5 rounded font-semibold shrink-0">
                            Organizador
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <CalendarDays size={11} />
                          {isPast ? 'Passou · ' : ''}{matchDate.toLocaleDateString('pt-BR')} {s.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin size={11} /> {s.location}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusCls[s.status] ?? 'bg-gray-100 text-gray-400'}`}>
                        {statusLabel[s.status] ?? s.status}
                      </span>
                      <ChevronRight size={13} className="text-gray-200 group-hover:text-brand transition-colors" />
                    </div>
                  </Link>
                )
              })}
              {schedules.length > 5 && (
                <Link href="/schedule" className="block px-5 py-3 text-center text-xs text-brand font-medium hover:bg-gray-50 transition-colors">
                  Ver todas ({schedules.length}) →
                </Link>
              )}
            </div>
          )}
        </div>

        {/* ── Botão registrar partida ── */}
        <div className="px-8 pt-2 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp size={14} className="text-gray-400" />
            <p className="text-sm font-bold text-gray-700">Meu histórico</p>
            {winRate > 0 && (
              <span className="text-xs bg-accent/10 text-accent font-semibold px-2 py-0.5 rounded-full">
                {winRate}% aproveitamento
              </span>
            )}
          </div>
          <Link
            href="/matches/new"
            className="inline-flex items-center gap-2 bg-brand text-white text-xs font-bold px-4 py-2.5 hover:bg-brand-dark transition-colors"
          >
            <Plus size={13} /> Registrar partida
          </Link>
        </div>

        {/* ── Confirmações pendentes ── */}
        {pending.length > 0 && (
          <div className="px-8 py-3">
            <div className="bg-orange-50 border border-orange-200 overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-3 border-b border-orange-100 bg-orange-100/60">
                <AlertTriangle size={13} className="text-orange-500" />
                <p className="text-sm font-bold text-orange-700">
                  {pending.length} resultado{pending.length > 1 ? 's' : ''} aguardando confirmação
                </p>
              </div>
              {pending.map(m => {
                const opponent =
                  typeof m.player1 === 'object' && m.player1._id !== player?._id ? m.player1
                  : typeof m.player2 === 'object' ? m.player2 : null
                return (
                  <div key={m._id} className="flex items-center justify-between px-5 py-4 bg-white">
                    <div>
                      <p className="font-bold text-gray-900 text-sm">
                        {opponent?.name ?? 'Adversário'} registrou um resultado
                      </p>
                      <p className="text-sm text-gray-500 mt-0.5">{m.score}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(m.date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => handleConfirm(m._id)}
                        className="bg-brand text-white text-xs font-bold px-4 py-2 hover:bg-brand-dark transition-colors">
                        Confirmar
                      </button>
                      <button onClick={() => handleDispute(m._id)}
                        className="border border-red-200 text-red-500 text-xs font-medium px-4 py-2 hover:border-red-400 transition-colors">
                        Disputar
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Histórico de partidas ── */}
        <div className="px-8 pb-8 flex-1">
          {loading ? (
            <div className="py-16 text-center">
              <div className="w-8 h-8 border-2 border-brand/20 border-t-brand rounded-full animate-spin mx-auto" />
            </div>
          ) : matches.length === 0 ? (
            /* Empty state com energia */
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-20 h-20 rounded-full bg-brand/8 border border-brand/10 flex items-center justify-center mb-5">
                <Zap size={32} className="text-brand/40" />
              </div>
              <p className="text-lg font-black text-gray-800 mb-1">Nenhuma partida ainda</p>
              <p className="text-sm text-gray-400 mb-6 max-w-xs">
                Registre sua primeira partida e comece a subir no ranking!
              </p>
              <Link href="/matches/new"
                className="inline-flex items-center gap-2 bg-brand text-white font-bold text-sm px-6 py-3 hover:bg-brand-dark transition-colors">
                <Plus size={15} /> Registrar primeira partida
              </Link>
            </div>
          ) : (
            <div className="bg-white border border-gray-100 overflow-hidden">
              {matches.map(m => {
                const winner   = typeof m.winner   === 'object' ? m.winner   : null
                const p1       = typeof m.player1  === 'object' ? m.player1  : null
                const p2       = typeof m.player2  === 'object' ? m.player2  : null
                const isWinner = winner?._id === player?._id

                let borderCls = 'border-l-gray-200'
                let labelEl: React.ReactNode = null

                if (m.status === MatchStatus.CONFIRMED) {
                  borderCls = isWinner ? 'border-l-accent' : 'border-l-red-400'
                  labelEl = (
                    <span className={`text-xs font-bold px-2.5 py-1 ${
                      isWinner
                        ? 'bg-accent/10 text-accent'
                        : 'bg-red-50 text-red-500'
                    }`}>
                      {isWinner ? 'Vitória' : 'Derrota'}
                    </span>
                  )
                } else if (m.status === MatchStatus.DISPUTED) {
                  borderCls = 'border-l-orange-400'
                  labelEl = <span className="text-xs font-medium px-2.5 py-1 bg-orange-50 text-orange-500">Em disputa</span>
                } else {
                  borderCls = 'border-l-gray-200'
                  labelEl = <span className="text-xs font-medium text-gray-400">Aguardando</span>
                }

                return (
                  <Link key={m._id} href={`/matches/${m._id}`}
                    className={`flex items-center justify-between px-5 py-4 border-l-4 ${borderCls} border-b border-gray-50 last:border-b-0 hover:bg-gray-50 transition-colors group`}>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 text-sm group-hover:text-brand transition-colors truncate">
                        {p1?.name ?? '—'} <span className="text-gray-300 font-normal">vs</span> {p2?.name ?? '—'}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {m.score} · {new Date(m.date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-4">
                      {labelEl}
                      <ChevronRight size={13} className="text-gray-200 group-hover:text-brand transition-colors" />
                    </div>
                  </Link>
                )
              })}
            </div>
          )}

          {/* ── Apostas ── */}
          {myBets.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center gap-2 mb-3">
                <Coins size={13} className="text-yellow-500" />
                <p className="text-sm font-bold text-gray-700">Minhas apostas</p>
              </div>
              <div className="bg-white border border-gray-100 overflow-hidden divide-y divide-gray-50">
                {myBets.map(bet => {
                  const matchData  = typeof bet.match          === 'object' ? bet.match          : null
                  const predicted  = typeof bet.predictedWinner === 'object' ? bet.predictedWinner : null
                  const s = BET_STATUS_MAP[bet.status]
                  return (
                    <div key={bet._id} className="flex items-center justify-between px-5 py-4">
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{predicted?.name ?? '—'}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {matchData ? new Date(matchData.date).toLocaleDateString('pt-BR') : ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-sm text-gray-600 font-medium">{bet.amount} bol.</span>
                        <span className={`text-xs ${s.cls}`}>{s.label(bet.amount)}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Profile edit modal ── */}
      {profileOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
          <div className="bg-white w-full max-w-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                <Smartphone size={14} className="text-brand" /> WhatsApp para convites
              </h2>
              <button onClick={() => setProfileOpen(false)} className="text-gray-300 hover:text-gray-600 transition-colors">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveProfile} className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">
                  Número do WhatsApp
                </label>
                <input
                  type="tel"
                  placeholder="Ex: +55 11 99999-9999"
                  value={phoneForm}
                  onChange={e => setPhoneForm(e.target.value)}
                  className="w-full border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:border-brand transition-colors bg-white"
                />
                <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
                  Organizadores poderão te convidar para partidas via WhatsApp. Inclua o DDD e o código do país (+55 para Brasil).
                </p>
              </div>
              {profileError && (
                <p className="text-red-500 text-xs bg-red-50 px-3 py-2">{profileError}</p>
              )}
              <div className="flex gap-3 pt-1">
                <button
                  type="submit"
                  disabled={profileSaving}
                  className="flex-1 flex items-center justify-center gap-2 bg-brand text-white text-sm font-bold py-2.5 hover:bg-brand-dark disabled:opacity-50 transition-colors"
                >
                  <Check size={13} /> {profileSaving ? 'Salvando...' : 'Salvar'}
                </button>
                <button
                  type="button"
                  onClick={() => setProfileOpen(false)}
                  className="border border-gray-200 text-gray-500 text-sm px-5 py-2.5 hover:border-gray-300 transition-colors"
                >
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
