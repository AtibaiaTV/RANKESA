'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import {
  getSchedule, applySchedule, withdrawSchedule, cancelSchedule,
  updateSchedule, kickPlayer, approvePlayer, rejectPlayer, voteMvp,
} from '@/lib/api/schedules'
import { ScheduledMatch, ScheduleStatus } from '@rank-app/shared'
import type { Player } from '@rank-app/shared'
import { GENDER_TYPE_LABEL, MATCH_TYPE_LABEL, SPORT_LABEL } from '@/lib/sports'
import { PageLayout } from '@/components/layout/page-layout'
import {
  ArrowLeft, MapPin, Clock, Users, Swords, AlertTriangle,
  Pencil, UserX, Crown, X, Check, UserCheck, UserMinus, Star, Trophy,
  ClipboardList, Hourglass, MessageCircle, ChevronDown, ChevronUp, Smartphone,
  Banknote, Copy, CheckCheck,
} from 'lucide-react'
import { getPlayers } from '@/lib/api/players'
import Link from 'next/link'

function buildWhatsAppLink(phone: string, message: string) {
  // Strip everything except digits and leading +
  const digits = phone.replace(/\D/g, '')
  // If Brazilian number without country code (10-11 digits), prepend 55
  const international = digits.length <= 11 ? `55${digits}` : digits
  return `https://wa.me/${international}?text=${encodeURIComponent(message)}`
}

const STATUS_CONFIG = {
  'OPEN':      { label: 'Aberto',    cls: 'text-accent font-semibold' },
  'FULL':      { label: 'Lotado',    cls: 'text-orange-500 font-semibold' },
  'CANCELLED': { label: 'Cancelado', cls: 'text-gray-300 font-medium' },
  'COMPLETED': { label: 'Concluído', cls: 'text-gray-400 font-medium' },
} as Record<ScheduleStatus, { label: string; cls: string }>

const inputCls = 'w-full border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:border-brand transition-colors bg-white'

function PlayerAvatar({ name, isOrg }: { name: string; isOrg?: boolean }) {
  return (
    <div className={`w-8 h-8 flex items-center justify-center font-semibold text-xs shrink-0 rounded-full ${
      isOrg ? 'bg-brand text-white' : 'bg-brand/10 text-brand'
    }`}>
      {name.charAt(0).toUpperCase()}
    </div>
  )
}

export default function ScheduleDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { player, token } = useAuth()
  const router = useRouter()

  const [schedule, setSchedule]           = useState<ScheduledMatch | null>(null)
  const [loading, setLoading]             = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError]                 = useState('')

  // PIX copy feedback
  const [copiedPix, setCopiedPix] = useState(false)

  // Invite panel state
  const [inviteOpen, setInviteOpen]             = useState(false)
  const [invitePlayers, setInvitePlayers]       = useState<Player[]>([])
  const [inviteLoading, setInviteLoading]       = useState(false)

  // Edit modal state
  const [editOpen, setEditOpen]           = useState(false)
  const [editForm, setEditForm]           = useState({
    title: '', description: '', date: '', time: '', location: '', city: '', maxPlayers: 2,
    costPerPlayer: '' as string | number, pixKey: '', costDescription: '',
  })
  const [editLoading, setEditLoading]     = useState(false)
  const [editError, setEditError]         = useState('')

  useEffect(() => {
    getSchedule(id)
      .then((s) => {
        setSchedule(s)
        setEditForm({
          title:           s.title,
          description:     s.description ?? '',
          date:            new Date(s.date).toISOString().split('T')[0],
          time:            s.time,
          location:        s.location,
          city:            s.city,
          maxPlayers:      s.maxPlayers,
          costPerPlayer:   s.costPerPlayer ?? '',
          pixKey:          s.pixKey ?? '',
          costDescription: s.costDescription ?? '',
        })
      })
      .catch(() => router.push('/schedule'))
      .finally(() => setLoading(false))
  }, [id, router])

  async function withAction(fn: () => Promise<ScheduledMatch | void>) {
    setActionLoading(true)
    setError('')
    try { const res = await fn(); if (res) setSchedule(res as ScheduledMatch) }
    catch (err) { setError(err instanceof Error ? err.message : 'Ocorreu um erro') }
    finally { setActionLoading(false) }
  }

  async function handleApply() {
    if (!token) return router.push('/login')
    await withAction(() => applySchedule(token, id))
  }

  async function handleWithdraw() {
    if (!token) return
    await withAction(() => withdrawSchedule(token, id))
  }

  async function handleCancel() {
    if (!token || !confirm('Cancelar este agendamento? Você perderá 15 boletas.')) return
    setActionLoading(true)
    try { await cancelSchedule(token, id); router.push('/schedule') }
    catch (err) { setError(err instanceof Error ? err.message : 'Erro ao cancelar') }
    finally { setActionLoading(false) }
  }

  async function handleKick(playerId: string, playerName: string) {
    if (!token || !confirm(`Remover ${playerName} deste agendamento?`)) return
    await withAction(() => kickPlayer(token, id, playerId))
  }

  async function handleApprove(playerId: string) {
    if (!token) return
    await withAction(() => approvePlayer(token, id, playerId))
  }

  async function handleReject(playerId: string, playerName: string) {
    if (!token || !confirm(`Rejeitar a candidatura de ${playerName}?`)) return
    await withAction(() => rejectPlayer(token, id, playerId))
  }

  async function handleVoteMvp(nomineeId: string, nomineeName: string) {
    if (!token || !confirm(`Votar em ${nomineeName} como MVP desta partida?`)) return
    await withAction(() => voteMvp(token, id, nomineeId))
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!token) return
    setEditLoading(true)
    setEditError('')
    try {
      const updated = await updateSchedule(token, id, {
        ...editForm,
        maxPlayers:    Number(editForm.maxPlayers),
        costPerPlayer: editForm.costPerPlayer !== '' ? Number(editForm.costPerPlayer) : 0,
        pixKey:        editForm.pixKey || undefined,
        costDescription: editForm.costDescription || undefined,
      })
      setSchedule(updated)
      setEditOpen(false)
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Erro ao salvar alterações')
    } finally {
      setEditLoading(false)
    }
  }

  function handleCopyPix(key: string) {
    navigator.clipboard.writeText(key).then(() => {
      setCopiedPix(true)
      setTimeout(() => setCopiedPix(false), 2000)
    })
  }

  async function handleToggleInvite() {
    if (inviteOpen) { setInviteOpen(false); return }
    if (invitePlayers.length > 0) { setInviteOpen(true); return }
    setInviteLoading(true)
    try {
      const res = await getPlayers({ sport: schedule?.sport, limit: 50 })
      setInvitePlayers(res.data)
      setInviteOpen(true)
    } catch {
      // ignore
    } finally {
      setInviteLoading(false)
    }
  }

  if (loading) {
    return (
      <PageLayout>
        <div className="max-w-4xl mx-auto px-6 py-8 text-center">
          <p className="text-gray-300 text-sm">Carregando...</p>
        </div>
      </PageLayout>
    )
  }
  if (!schedule) return null

  const organizer       = typeof schedule.organizer === 'object' ? schedule.organizer as Player : null
  const approvedPlayers = schedule.players.map((p) => (typeof p === 'object' ? p as Player : null)).filter(Boolean)
  const pendingPlayers  = (schedule.pendingPlayers ?? []).map((p) => (typeof p === 'object' ? p as Player : null)).filter(Boolean)
  const mvpWinner       = schedule.mvpWinner && typeof schedule.mvpWinner === 'object' ? schedule.mvpWinner as Player : null

  const isOrganizer       = !!(player && organizer?._id === player._id)
  const isApproved        = !!(player && approvedPlayers.some((p) => p?._id === player._id))
  const isPending         = !!(player && pendingPlayers.some((p) => p?._id === player._id))
  const spotsLeft         = schedule.maxPlayers - approvedPlayers.length
  const canApply          = !!player && !isApproved && !isPending && !isOrganizer && spotsLeft > 0 && schedule.status === ('OPEN' as ScheduleStatus)
  const status            = STATUS_CONFIG[schedule.status]
  const isPastDate        = new Date(schedule.date) < new Date()
  const canEdit           = isOrganizer && schedule.status !== ('CANCELLED' as ScheduleStatus) && schedule.status !== ('COMPLETED' as ScheduleStatus)
  const canRegisterResult = isOrganizer && isPastDate && !schedule.resultRegistered && schedule.status !== ('CANCELLED' as ScheduleStatus)

  // MVP voting: only after match date, for 3+ players, if approved non-organizer and hasn't voted
  const myMvpVote        = player ? (schedule.mvpVotes ?? []).find((v) => v.voter === player._id) : undefined
  const canVoteMvp       = isApproved && !isOrganizer && isPastDate && approvedPlayers.length >= 3 && !myMvpVote && !schedule.mvpWinner

  return (
    <PageLayout>
      <main className="max-w-4xl mx-auto px-6 py-8">

        <Link href="/schedule"
          className="inline-flex items-center gap-2 text-xs text-gray-400 hover:text-brand transition-colors mb-6">
          <ArrowLeft size={12} /> Partidas
        </Link>

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-400 mb-1">
              {SPORT_LABEL[schedule.sport]} · {MATCH_TYPE_LABEL[schedule.matchType]} · {GENDER_TYPE_LABEL[schedule.genderType]}
            </p>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-gray-900 truncate">{schedule.title}</h1>
              {canEdit && (
                <button
                  onClick={() => setEditOpen(true)}
                  title="Editar agendamento"
                  className="text-gray-300 hover:text-brand transition-colors shrink-0"
                >
                  <Pencil size={14} />
                </button>
              )}
            </div>
          </div>
          <span className={`text-xs shrink-0 mt-1 ml-4 ${status.cls}`}>{status.label}</span>
        </div>

        {/* Organizer badge */}
        {isOrganizer && (
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand/70 bg-brand/8 px-3 py-1.5 mb-5">
            <Crown size={11} />
            Você é o organizador desta partida
          </div>
        )}

        {/* Pending candidacy badge */}
        {isPending && (
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 bg-orange-50 border border-orange-100 px-3 py-1.5 mb-5">
            <Hourglass size={11} />
            Sua candidatura está aguardando aprovação
          </div>
        )}

        {/* MVP winner banner */}
        {mvpWinner && (
          <div className="flex items-center gap-3 border border-yellow-200 bg-yellow-50 px-4 py-3 mb-5">
            <Trophy size={16} className="text-yellow-500 shrink-0" />
            <p className="text-sm text-yellow-700">
              <strong>{mvpWinner.name}</strong> foi eleito o MVP desta partida!
            </p>
          </div>
        )}

        <div className="grid md:grid-cols-[1fr_300px] gap-8">

          {/* Main */}
          <div>
            {/* Info */}
            <div className="border border-gray-100 p-6 mb-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Clock size={14} className="text-gray-300 shrink-0" />
                  <span className="text-sm text-gray-700">
                    {new Date(schedule.date).toLocaleDateString('pt-BR', {
                      weekday: 'long', day: 'numeric', month: 'long',
                    })} às {schedule.time}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin size={14} className="text-gray-300 shrink-0" />
                  <span className="text-sm text-gray-700">{schedule.location}, {schedule.city}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Users size={14} className="text-gray-300 shrink-0" />
                  <span className={`text-sm ${spotsLeft === 0 ? 'text-orange-500 font-semibold' : 'text-gray-700'}`}>
                    {approvedPlayers.length}/{schedule.maxPlayers} confirmados
                    {spotsLeft > 0 && (
                      <span className="text-gray-400 font-normal">
                        {' '}· {spotsLeft} vaga{spotsLeft !== 1 ? 's' : ''}
                      </span>
                    )}
                    {pendingPlayers.length > 0 && (
                      <span className="text-orange-400 font-normal">
                        {' '}· {pendingPlayers.length} candidatura{pendingPlayers.length !== 1 ? 's' : ''} pendente{pendingPlayers.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </span>
                </div>
              </div>

              {schedule.description && (
                <p className="text-sm text-gray-500 mt-5 pt-5 border-t border-gray-100 leading-relaxed">
                  {schedule.description}
                </p>
              )}

              <p className="text-xs text-gray-300 mt-5 pt-5 border-t border-gray-100">
                Organizado por{' '}
                <span className="text-gray-500 font-medium">{organizer?.name ?? '—'}</span>
              </p>
            </div>

            {/* ── Custeio compartilhado ── */}
            {!!schedule.costPerPlayer && schedule.costPerPlayer > 0 && (
              <div className="border border-green-100 bg-green-50 rounded-lg px-5 py-4 mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <Banknote size={15} className="text-green-600 shrink-0" />
                  <p className="text-sm font-bold text-green-800">Custeio compartilhado</p>
                </div>

                <div className="flex items-baseline gap-1.5 mb-2">
                  <span className="text-2xl font-black text-green-700">
                    R$ {schedule.costPerPlayer.toFixed(2).replace('.', ',')}
                  </span>
                  <span className="text-xs text-green-600">por jogador</span>
                </div>

                {schedule.costDescription && (
                  <p className="text-xs text-green-700 mb-3">
                    <span className="font-medium">Destinação:</span> {schedule.costDescription}
                  </p>
                )}

                {schedule.pixKey && (
                  <div className="bg-white border border-green-200 rounded-lg px-3 py-2.5 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold text-green-600 uppercase tracking-wide mb-0.5">Chave PIX</p>
                      <p className="text-sm font-mono text-gray-800 truncate">{schedule.pixKey}</p>
                    </div>
                    <button
                      onClick={() => handleCopyPix(schedule.pixKey!)}
                      title="Copiar chave PIX"
                      className={`shrink-0 flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-md transition-colors ${
                        copiedPix
                          ? 'bg-green-500 text-white'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {copiedPix
                        ? <><CheckCheck size={12} /> Copiado!</>
                        : <><Copy size={12} /> Copiar</>}
                    </button>
                  </div>
                )}

                <p className="text-[10px] text-green-600/70 mt-3 leading-relaxed">
                  O pagamento é combinado diretamente com o organizador. O app não processa transações.
                </p>
              </div>
            )}

            {error && (
              <p className="text-red-500 text-sm border border-red-100 bg-red-50 px-4 py-3 mb-4">
                {error}
              </p>
            )}

            {/* MVP voting section */}
            {canVoteMvp && (
              <div className="border border-yellow-100 bg-yellow-50 p-5 mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <Star size={14} className="text-yellow-500" />
                  <p className="text-sm font-bold text-yellow-700">Eleja o MVP da partida</p>
                </div>
                <p className="text-xs text-yellow-600 mb-4">
                  Vote no melhor jogador. O MVP eleito ganha <strong>+10 boletas</strong>.
                </p>
                <div className="space-y-2">
                  {approvedPlayers
                    .filter((p) => p?._id !== player?._id)
                    .map((p) => (
                      <button
                        key={p!._id}
                        onClick={() => handleVoteMvp(p!._id, p!.name)}
                        disabled={actionLoading}
                        className="w-full flex items-center gap-3 px-4 py-3 border border-yellow-200 bg-white hover:bg-yellow-50 hover:border-yellow-400 disabled:opacity-50 transition-colors text-left"
                      >
                        <PlayerAvatar name={p!.name} isOrg={p!._id === organizer?._id} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{p!.name}</p>
                          <p className="text-xs text-gray-400">{p!.city}</p>
                        </div>
                        <Star size={14} className="text-yellow-400 shrink-0" />
                      </button>
                    ))}
                </div>
              </div>
            )}

            {/* Already voted */}
            {myMvpVote && !schedule.mvpWinner && (
              <div className="flex items-center gap-2 border border-yellow-100 bg-yellow-50 px-4 py-3 mb-4">
                <Check size={13} className="text-yellow-500 shrink-0" />
                <p className="text-xs text-yellow-700">Você já votou no MVP. Aguardando os outros jogadores.</p>
              </div>
            )}

            {/* Aviso de penalidade ao cancelar */}
            {isOrganizer && schedule.status !== ('CANCELLED' as ScheduleStatus) && !isPastDate && (
              <div className="flex items-start gap-2 border border-orange-100 bg-orange-50 px-4 py-3 mb-4">
                <AlertTriangle size={13} className="text-orange-400 mt-0.5 shrink-0" />
                <p className="text-xs text-orange-600 leading-relaxed">
                  Cancelar este agendamento resulta em penalidade de <strong>−15 boletas</strong>.
                </p>
              </div>
            )}

            {/* Aviso de resultado não registrado */}
            {canRegisterResult && (
              <div className="flex items-start gap-2 border border-red-100 bg-red-50 px-4 py-3 mb-4">
                <AlertTriangle size={13} className="text-red-400 mt-0.5 shrink-0" />
                <p className="text-xs text-red-600 leading-relaxed">
                  A data desta partida já passou. Registre o resultado para evitar penalidade de{' '}
                  <strong>−10 boletas</strong>.
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 flex-wrap">
              {canApply && (
                <button onClick={handleApply} disabled={actionLoading}
                  className="flex-1 flex items-center justify-center gap-2 bg-brand text-white text-sm font-bold py-3 hover:bg-brand-dark disabled:opacity-50 transition-colors">
                  <UserCheck size={14} /> Solicitar participação
                </button>
              )}
              {isPending && (
                <button onClick={handleWithdraw} disabled={actionLoading}
                  className="flex-1 flex items-center justify-center gap-2 border border-orange-200 text-orange-500 text-sm font-medium py-3 hover:border-orange-400 disabled:opacity-50 transition-colors">
                  <UserMinus size={14} /> Cancelar candidatura
                </button>
              )}
              {canRegisterResult && (
                <Link href={`/matches/new?scheduleId=${id}`}
                  className="flex-1 flex items-center justify-center gap-2 bg-accent text-brand text-sm font-bold py-3 hover:bg-accent-dark transition-colors">
                  <Swords size={14} /> Registrar resultado
                </Link>
              )}
              {isApproved && !isOrganizer && schedule.status !== ('CANCELLED' as ScheduleStatus) && (
                <button onClick={handleWithdraw} disabled={actionLoading}
                  className="flex-1 border border-red-200 text-red-500 text-sm font-medium py-3 hover:border-red-400 disabled:opacity-50 transition-colors">
                  Sair da partida
                </button>
              )}
              {isOrganizer && schedule.status !== ('CANCELLED' as ScheduleStatus) && (
                <button onClick={handleCancel} disabled={actionLoading}
                  className="flex-1 border border-red-200 text-red-500 text-sm font-medium py-3 hover:border-red-400 disabled:opacity-50 transition-colors">
                  Cancelar agendamento
                </button>
              )}
              {!player && (
                <Link href="/login"
                  className="flex-1 bg-brand text-white text-sm font-bold py-3 hover:bg-brand-dark transition-colors text-center">
                  Entrar para participar
                </Link>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {/* Participantes confirmados */}
            <div>
              <p className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wide">
                Confirmados ({approvedPlayers.length})
              </p>

              {approvedPlayers.length === 0 ? (
                <div className="border border-gray-100 py-8 text-center">
                  <p className="text-gray-300 text-sm">Nenhum participante ainda</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 border border-gray-100">
                  {approvedPlayers.map((p) => {
                    const isOrg = organizer?._id === p!._id
                    return (
                      <div key={p!._id} className="flex items-center gap-3 px-4 py-3.5 group">
                        <Link href={`/players/${p!._id}`} className="flex items-center gap-3 flex-1 min-w-0">
                          <PlayerAvatar name={p!.name} isOrg={isOrg} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 group-hover:text-brand transition-colors truncate flex items-center gap-1.5">
                              {p!.name}
                              {isOrg && <Crown size={10} className="text-brand/60 shrink-0" />}
                              {mvpWinner?._id === p!._id && <Trophy size={10} className="text-yellow-500 shrink-0" />}
                            </p>
                            <p className="text-xs text-gray-400">{p!.city} · ELO {p!.elo}</p>
                          </div>
                        </Link>

                        {/* Remove approved player — organizer only, not self */}
                        {isOrganizer && !isOrg && canEdit && (
                          <button
                            onClick={() => handleKick(p!._id, p!.name)}
                            disabled={actionLoading}
                            title={`Remover ${p!.name}`}
                            className="text-gray-200 hover:text-red-500 disabled:opacity-30 transition-colors shrink-0"
                          >
                            <UserX size={14} />
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Convidar jogadores — visible to organizer only, while schedule is open */}
            {isOrganizer && schedule.status === ('OPEN' as ScheduleStatus) && spotsLeft > 0 && (
              <div>
                <button
                  onClick={handleToggleInvite}
                  disabled={inviteLoading}
                  className="w-full flex items-center justify-between px-4 py-3 border border-brand/20 bg-brand/5 hover:bg-brand/10 transition-colors disabled:opacity-50"
                >
                  <span className="flex items-center gap-2 text-sm font-bold text-brand">
                    <MessageCircle size={14} />
                    {inviteLoading ? 'Carregando...' : 'Convidar jogadores'}
                  </span>
                  {inviteOpen ? <ChevronUp size={13} className="text-brand/50" /> : <ChevronDown size={13} className="text-brand/50" />}
                </button>

                {inviteOpen && (() => {
                  // Exclude already confirmed + pending + organizer
                  const confirmedIds = new Set(approvedPlayers.map(p => p!._id))
                  const pendingIds   = new Set(pendingPlayers.map(p => p!._id))
                  const eligible = invitePlayers.filter(
                    p => !confirmedIds.has(p._id) && !pendingIds.has(p._id) && p._id !== organizer?._id
                  )

                  const matchDate = new Date(schedule.date).toLocaleDateString('pt-BR', {
                    weekday: 'long', day: 'numeric', month: 'long',
                  })
                  const appUrl = typeof window !== 'undefined' ? window.location.origin : ''

                  if (eligible.length === 0) {
                    return (
                      <div className="border border-t-0 border-brand/10 px-4 py-4 text-center">
                        <p className="text-xs text-gray-400">Todos os jogadores cadastrados já fazem parte desta partida.</p>
                      </div>
                    )
                  }

                  return (
                    <div className="border border-t-0 border-brand/10 divide-y divide-gray-50 max-h-72 overflow-y-auto">
                      {eligible.map(p => {
                        const message = `Olá ${p.name}! Você foi convidado para uma partida de ${SPORT_LABEL[schedule.sport]}.\n\n📌 ${schedule.title}\n📅 ${matchDate} às ${schedule.time}\n📍 ${schedule.location}, ${schedule.city}\n\nAcesse: ${appUrl}/schedule/${schedule._id}`
                        return (
                          <div key={p._id} className="flex items-center gap-3 px-4 py-3">
                            <div className="w-8 h-8 flex items-center justify-center font-semibold text-xs shrink-0 rounded-full bg-brand/10 text-brand">
                              {p.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                              <p className="text-xs text-gray-400">{p.city} · ELO {p.elo}</p>
                            </div>
                            {p.phone ? (
                              <a
                                href={buildWhatsAppLink(p.phone, message)}
                                target="_blank"
                                rel="noopener noreferrer"
                                title={`Convidar ${p.name} via WhatsApp`}
                                className="w-8 h-8 flex items-center justify-center bg-green-500 hover:bg-green-600 text-white transition-colors shrink-0 rounded-full"
                              >
                                <MessageCircle size={14} />
                              </a>
                            ) : (
                              <span title="Sem WhatsApp cadastrado" className="w-8 h-8 flex items-center justify-center text-gray-200 shrink-0">
                                <Smartphone size={14} />
                              </span>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )
                })()}
              </div>
            )}

            {/* Candidaturas pendentes — visible to organizer only */}
            {isOrganizer && pendingPlayers.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <ClipboardList size={12} className="text-orange-400" />
                  <p className="text-xs font-semibold text-orange-500 uppercase tracking-wide">
                    Candidaturas ({pendingPlayers.length})
                  </p>
                </div>
                <div className="divide-y divide-orange-50 border border-orange-100">
                  {pendingPlayers.map((p) => (
                    <div key={p!._id} className="flex items-center gap-3 px-4 py-3.5">
                      <Link href={`/players/${p!._id}`} className="flex items-center gap-3 flex-1 min-w-0">
                        <PlayerAvatar name={p!.name} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{p!.name}</p>
                          <p className="text-xs text-gray-400">{p!.city} · ELO {p!.elo}</p>
                        </div>
                      </Link>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleApprove(p!._id)}
                          disabled={actionLoading || schedule.status === ('FULL' as ScheduleStatus)}
                          title="Aprovar candidatura"
                          className="w-7 h-7 flex items-center justify-center text-white bg-accent hover:bg-green-600 disabled:opacity-30 disabled:bg-gray-200 disabled:text-gray-400 transition-colors"
                        >
                          <Check size={12} />
                        </button>
                        <button
                          onClick={() => handleReject(p!._id, p!.name)}
                          disabled={actionLoading}
                          title="Rejeitar candidatura"
                          className="w-7 h-7 flex items-center justify-center text-red-500 border border-red-100 hover:bg-red-50 disabled:opacity-30 transition-colors"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ── Modal de edição ── */}
      {editOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
          <div className="bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900 flex items-center gap-2">
                <Pencil size={14} className="text-brand" /> Editar agendamento
              </h2>
              <button onClick={() => setEditOpen(false)} className="text-gray-300 hover:text-gray-600 transition-colors">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEdit} className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Título</label>
                <input
                  required
                  value={editForm.title}
                  onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
                  className={inputCls}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Descrição (opcional)</label>
                <textarea
                  rows={3}
                  value={editForm.description}
                  onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                  className={`${inputCls} resize-none`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Data</label>
                  <input
                    type="date"
                    required
                    value={editForm.date}
                    onChange={e => setEditForm(f => ({ ...f, date: e.target.value }))}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Horário</label>
                  <input
                    type="time"
                    required
                    value={editForm.time}
                    onChange={e => setEditForm(f => ({ ...f, time: e.target.value }))}
                    className={inputCls}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Local</label>
                <input
                  required
                  value={editForm.location}
                  onChange={e => setEditForm(f => ({ ...f, location: e.target.value }))}
                  className={inputCls}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Cidade</label>
                  <input
                    required
                    value={editForm.city}
                    onChange={e => setEditForm(f => ({ ...f, city: e.target.value }))}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">
                    Vagas (mín. {approvedPlayers.length})
                  </label>
                  <input
                    type="number"
                    required
                    min={approvedPlayers.length}
                    max={50}
                    value={editForm.maxPlayers}
                    onChange={e => setEditForm(f => ({ ...f, maxPlayers: Number(e.target.value) }))}
                    className={inputCls}
                  />
                </div>
              </div>

              {/* ── Custeio ── */}
              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                  <Banknote size={12} /> Custeio compartilhado <span className="font-normal text-gray-300">(opcional)</span>
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">
                      R$ por jogador
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">R$</span>
                      <input
                        type="number"
                        min={0}
                        max={10000}
                        step={0.01}
                        placeholder="0,00"
                        value={editForm.costPerPlayer}
                        onChange={e => setEditForm(f => ({ ...f, costPerPlayer: e.target.value }))}
                        className={`${inputCls} pl-8`}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Chave PIX</label>
                    <input
                      type="text"
                      placeholder="CPF, e-mail, celular..."
                      value={editForm.pixKey}
                      onChange={e => setEditForm(f => ({ ...f, pixKey: e.target.value }))}
                      className={inputCls}
                    />
                  </div>
                </div>
                <div className="mt-3">
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Destinação dos recursos</label>
                  <input
                    type="text"
                    placeholder="Ex: Locação, arbitragem, catador de bolas..."
                    value={editForm.costDescription}
                    onChange={e => setEditForm(f => ({ ...f, costDescription: e.target.value }))}
                    className={inputCls}
                  />
                </div>
              </div>

              {editError && (
                <p className="text-red-500 text-sm bg-red-50 px-4 py-3">{editError}</p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={editLoading}
                  className="flex-1 flex items-center justify-center gap-2 bg-brand text-white text-sm font-bold py-3 hover:bg-brand-dark disabled:opacity-50 transition-colors"
                >
                  <Check size={14} /> {editLoading ? 'Salvando...' : 'Salvar alterações'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditOpen(false)}
                  className="border border-gray-200 text-gray-500 text-sm font-medium px-5 py-3 hover:border-gray-300 transition-colors"
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
