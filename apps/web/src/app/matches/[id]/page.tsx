'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/auth-context'
import { getMatch, confirmMatch, disputeMatch, getMatchComments, addMatchComment } from '@/lib/api/matches'
import { getBetsForMatch, placeBet } from '@/lib/api/bets'
import { createReport } from '@/lib/api/reports'
import { Bet, BetStatus, Match, MatchComment, MatchStatus, ReportCategory, SystemRole } from '@rank-app/shared'
import { PageLayout } from '@/components/layout/page-layout'
import { SPORT_LABEL } from '@/lib/sports'
import { ArrowLeft, Coins, Flag, MessageSquare, Send, ShieldCheck } from 'lucide-react'

const STATUS_CONFIG: Record<MatchStatus, { label: string; cls: string }> = {
  [MatchStatus.PENDING_REVIEW]: { label: 'Aguardando confirmação', cls: 'text-orange-500' },
  [MatchStatus.CONFIRMED]:      { label: 'Confirmada',             cls: 'text-accent' },
  [MatchStatus.DISPUTED]:       { label: 'Em disputa',             cls: 'text-red-500' },
}

const BET_STATUS_CONFIG: Record<BetStatus, { label: string; cls: string }> = {
  [BetStatus.PENDING]:   { label: 'Pendente',  cls: 'text-gray-400' },
  [BetStatus.WON]:       { label: 'Ganhou',    cls: 'text-accent font-black' },
  [BetStatus.LOST]:      { label: 'Perdeu',    cls: 'text-red-500 font-black' },
  [BetStatus.CANCELLED]: { label: 'Cancelada', cls: 'text-gray-300' },
}

export default function MatchDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { player, token } = useAuth()
  const router = useRouter()
  const [match, setMatch] = useState<Match | null>(null)
  const [bets, setBets] = useState<Bet[]>([])
  const [betAmount, setBetAmount] = useState(10)
  const [betWinnerId, setBetWinnerId] = useState('')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState('')
  const [betError, setBetError] = useState('')
  const [reportOpen, setReportOpen] = useState(false)
  const [reportReason, setReportReason] = useState('')
  const [reportCategory, setReportCategory] = useState<ReportCategory>('BAD_CONDUCT' as ReportCategory)
  const [reportSent, setReportSent] = useState(false)
  const [comments, setComments] = useState<MatchComment[]>([])
  const [commentText, setCommentText] = useState('')
  const [commentLoading, setCommentLoading] = useState(false)
  const [commentError, setCommentError] = useState('')

  useEffect(() => {
    Promise.all([
      getMatch(id).catch(() => null),
      getBetsForMatch(id).catch(() => []),
      token ? getMatchComments(token, id).catch(() => []) : Promise.resolve([]),
    ])
      .then(([m, b, c]) => {
        if (!m) { router.push('/'); return }
        setMatch(m)
        setBets(b)
        setComments(c)
      })
      .finally(() => setLoading(false))
  }, [id, router, token])

  async function handleConfirm() {
    if (!token) return
    setActionLoading(true)
    try { setMatch(await confirmMatch(token, id)) }
    catch (err) { setError(err instanceof Error ? err.message : 'Erro ao confirmar') }
    finally { setActionLoading(false) }
  }

  async function handleDispute() {
    const reason = prompt('Informe o motivo da disputa:')
    if (!reason || !token) return
    setActionLoading(true)
    try { setMatch(await disputeMatch(token, id, reason)) }
    catch (err) { setError(err instanceof Error ? err.message : 'Erro ao disputar') }
    finally { setActionLoading(false) }
  }

  async function handleReport(e: React.FormEvent) {
    e.preventDefault()
    if (!token || !match) return
    const opponent = p1?._id === player?._id ? p2 : p1
    if (!opponent) return
    setActionLoading(true)
    try {
      await createReport(token, {
        reportedPlayerId: opponent._id,
        matchId: id,
        category: reportCategory,
        reason: reportReason,
      })
      setReportSent(true)
      setReportOpen(false)
      setReportReason('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar denúncia')
    } finally { setActionLoading(false) }
  }

  async function handleComment(e: React.FormEvent) {
    e.preventDefault()
    if (!token || !commentText.trim()) return
    setCommentLoading(true)
    setCommentError('')
    try {
      const newComment = await addMatchComment(token, id, commentText.trim())
      setComments((prev) => [...prev, newComment])
      setCommentText('')
    } catch (err) {
      setCommentError(err instanceof Error ? err.message : 'Erro ao enviar mensagem')
    } finally {
      setCommentLoading(false)
    }
  }

  async function handleBet(e: React.FormEvent) {
    e.preventDefault()
    if (!token || !betWinnerId) return
    setBetError('')
    setActionLoading(true)
    try {
      const bet = await placeBet(token, id, betWinnerId, betAmount)
      setBets((prev) => [...prev, bet])
      setBetWinnerId('')
    } catch (err) {
      setBetError(err instanceof Error ? err.message : 'Erro ao apostar')
    } finally { setActionLoading(false) }
  }

  if (loading) {
    return (
      <PageLayout>
        <div className="max-w-4xl mx-auto px-8 py-14 text-center">
          <p className="text-gray-300 font-bold tracking-widest uppercase text-xs">Carregando...</p>
        </div>
      </PageLayout>
    )
  }
  if (!match) return null

  const p1 = typeof match.player1 === 'object' ? match.player1 : null
  const p2 = typeof match.player2 === 'object' ? match.player2 : null
  const winner = typeof match.winner === 'object' ? match.winner : null
  const registeredBy = typeof match.registeredBy === 'object' ? match.registeredBy : null

  const isParticipant = player && (p1?._id === player._id || p2?._id === player._id)
  const isOpponent = isParticipant && registeredBy?._id !== player?._id
  const canAct = isOpponent && match.status === MatchStatus.PENDING_REVIEW
  const canBet = token && !isParticipant && match.status === MatchStatus.PENDING_REVIEW
  const myBet = bets.find((b) => typeof b.bettor === 'object' && b.bettor._id === player?._id)
  const isAdmin = player?.role === ('ADMIN' as SystemRole)
  const canComment = token && (isParticipant || isAdmin)

  const statusConfig = STATUS_CONFIG[match.status]

  return (
    <PageLayout>
      <main className="max-w-4xl mx-auto px-8 py-14">

        <Link href="/dashboard"
          className="inline-flex items-center gap-2 text-xs font-bold text-gray-400 tracking-widest uppercase hover:text-brand transition-colors mb-10">
          <ArrowLeft size={12} /> Voltar
        </Link>

        <div className="mb-10">
          <p className="text-accent font-bold tracking-[0.3em] text-xs uppercase mb-3">
            {SPORT_LABEL[match.sport]}
          </p>
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-black text-brand">Partida</h1>
            <span className={`text-xs font-black tracking-widest uppercase ${statusConfig.cls}`}>
              {statusConfig.label}
            </span>
          </div>
        </div>

        {/* Players vs card */}
        <div className="border border-gray-100 mb-8">
          <div className="grid grid-cols-[1fr_auto_1fr]">
            {[p1, p2].map((p, i) => (
              <div key={i} className={`px-10 py-10 text-center ${i === 0 ? 'border-r border-gray-100' : ''}`}>
                <div className={`w-14 h-14 flex items-center justify-center font-black text-2xl mx-auto mb-4 ${
                  winner?._id === p?._id ? 'bg-brand text-white' : 'bg-gray-100 text-gray-400'
                }`}>
                  {p?.name?.charAt(0) ?? '?'}
                </div>
                <p className="font-black text-gray-900 mb-1">{p?.name ?? '—'}</p>
                <p className="text-xs text-gray-400">Rating {p?.elo ?? '—'}</p>
                {winner?._id === p?._id && (
                  <p className="text-accent text-xs font-black tracking-widest uppercase mt-3">Vencedor</p>
                )}
              </div>
            ))}
            <div className="px-8 py-10 text-center flex flex-col items-center justify-center">
              <p className="text-3xl font-black text-gray-800 mb-2">{match.score}</p>
              <p className="text-xs text-gray-400">
                {new Date(match.date).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
        </div>

        <div className="text-xs text-gray-400 mb-8">
          Registrado por: <span className="font-bold text-gray-600">{registeredBy?.name ?? '—'}</span>
        </div>

        {match.disputeReason && (
          <div className="border border-red-100 bg-red-50 px-6 py-5 mb-8">
            <p className="text-xs font-black text-red-400 tracking-[0.2em] uppercase mb-2">Motivo da disputa</p>
            <p className="text-sm text-red-600">{match.disputeReason}</p>
          </div>
        )}

        {error && (
          <p className="text-red-500 text-xs font-bold tracking-wide border border-red-100 bg-red-50 px-4 py-3 mb-8">
            {error}
          </p>
        )}

        {canAct && (
          <div className="flex gap-4 mb-10">
            <button
              onClick={handleConfirm}
              disabled={actionLoading}
              className="flex-1 bg-brand text-white text-xs font-black tracking-widest uppercase py-4 hover:bg-brand-dark disabled:opacity-50 transition-colors"
            >
              Confirmar resultado
            </button>
            <button
              onClick={handleDispute}
              disabled={actionLoading}
              className="flex-1 border border-red-200 text-red-500 text-xs font-black tracking-widest uppercase py-4 hover:border-red-400 disabled:opacity-50 transition-colors"
            >
              Disputar
            </button>
          </div>
        )}

        {/* ── Reportar má conduta ── */}
        {isParticipant && match.status === MatchStatus.CONFIRMED && !reportSent && (
          <div className="mb-10">
            {!reportOpen ? (
              <button
                onClick={() => setReportOpen(true)}
                className="flex items-center gap-2 text-xs text-gray-400 hover:text-orange-500 transition-colors"
              >
                <Flag size={12} /> Reportar má conduta desportiva
              </button>
            ) : (
              <div className="border border-orange-100 bg-orange-50/50 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Flag size={13} className="text-orange-500" />
                  <p className="text-xs font-black text-orange-600 tracking-widest uppercase">
                    Reportar comportamento inadequado
                  </p>
                </div>
                <form onSubmit={handleReport} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1.5">Tipo de ocorrência</label>
                    <select
                      value={reportCategory}
                      onChange={(e) => setReportCategory(e.target.value as ReportCategory)}
                      className="w-full border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:border-brand transition-colors bg-white"
                    >
                      <option value="BAD_CONDUCT">Má conduta desportiva</option>
                      <option value="FAKE_RESULT">Resultado registrado errado</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1.5">
                      Descreva o ocorrido <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      required
                      rows={3}
                      maxLength={500}
                      placeholder="Descreva com detalhes o comportamento inadequado..."
                      value={reportReason}
                      onChange={(e) => setReportReason(e.target.value)}
                      className="w-full border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:border-brand transition-colors resize-none"
                    />
                    <p className="text-[10px] text-gray-400 mt-1">{reportReason.length}/500</p>
                  </div>
                  <div className="flex gap-3">
                    <button type="submit" disabled={actionLoading || !reportReason}
                      className="flex items-center gap-2 bg-orange-500 text-white text-xs font-black px-4 py-2.5 hover:bg-orange-600 disabled:opacity-50 transition-colors">
                      <Flag size={11} /> Enviar denúncia
                    </button>
                    <button type="button" onClick={() => setReportOpen(false)}
                      className="text-xs text-gray-400 hover:text-gray-600 transition-colors px-2">
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {reportSent && (
          <div className="border border-accent/20 bg-accent/5 px-5 py-4 mb-10 flex items-center gap-3">
            <Flag size={14} className="text-accent shrink-0" />
            <p className="text-sm text-accent font-medium">
              Denúncia enviada. O administrador irá analisar em breve.
            </p>
          </div>
        )}

        {/* ── Canal de comunicação ── */}
        {(canComment || comments.length > 0) && (
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-5">
              <MessageSquare size={14} className="text-gray-400" />
              <p className="text-xs font-black text-gray-400 tracking-[0.25em] uppercase">
                Canal da partida ({comments.length})
              </p>
              {isAdmin && (
                <span className="inline-flex items-center gap-1 text-[10px] font-black tracking-widest uppercase bg-brand/10 text-brand px-2 py-0.5">
                  <ShieldCheck size={9} /> Admin
                </span>
              )}
            </div>

            {/* Thread */}
            {comments.length > 0 ? (
              <div className="border border-gray-100 divide-y divide-gray-100 mb-4">
                {comments.map((c) => {
                  const author = typeof c.author === 'object' ? c.author : null
                  const isMe = author?._id === player?._id
                  const adminMsg = c.isAdminMessage
                  return (
                    <div key={c._id} className={`px-5 py-4 ${adminMsg ? 'bg-brand/5' : ''}`}>
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 shrink-0 flex items-center justify-center font-black text-sm ${
                          adminMsg ? 'bg-brand text-white' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {author?.name?.charAt(0) ?? '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs font-black ${isMe ? 'text-brand' : 'text-gray-700'}`}>
                              {isMe ? 'Você' : (author?.name ?? '—')}
                            </span>
                            {adminMsg && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-black tracking-widest uppercase text-brand/70">
                                <ShieldCheck size={9} /> Admin
                              </span>
                            )}
                            <span className="text-[10px] text-gray-300 ml-auto shrink-0">
                              {new Date(c.createdAt).toLocaleString('pt-BR', {
                                day: '2-digit', month: '2-digit',
                                hour: '2-digit', minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed break-words">{c.content}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="border border-gray-100 py-8 text-center mb-4">
                <MessageSquare size={18} className="text-gray-200 mx-auto mb-2" />
                <p className="text-gray-300 text-sm">Nenhuma mensagem ainda.</p>
                <p className="text-gray-300 text-xs mt-1">Só os jogadores e o admin podem escrever aqui.</p>
              </div>
            )}

            {/* Input */}
            {canComment && (
              <form onSubmit={handleComment} className="flex gap-3 items-start">
                <textarea
                  rows={2}
                  maxLength={600}
                  placeholder="Escreva uma observação sobre a partida..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="flex-1 border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-brand transition-colors resize-none"
                />
                <button
                  type="submit"
                  disabled={commentLoading || !commentText.trim()}
                  className="bg-brand text-white p-3 hover:bg-brand-dark disabled:opacity-40 transition-colors shrink-0"
                  title="Enviar"
                >
                  <Send size={16} />
                </button>
              </form>
            )}
            {commentError && (
              <p className="text-red-500 text-xs font-bold mt-2">{commentError}</p>
            )}
          </div>
        )}

        {/* Bets section */}
        <div>
          <div className="flex items-center gap-3 mb-5">
            <Coins size={14} className="text-gray-400" />
            <p className="text-xs font-black text-gray-400 tracking-[0.25em] uppercase">
              Apostas ({bets.length})
            </p>
          </div>

          {canBet && !myBet && (
            <div className="border border-gray-100 p-6 mb-6">
              <p className="text-xs font-black text-gray-400 tracking-[0.2em] uppercase mb-5">
                Fazer aposta
              </p>
              <form onSubmit={handleBet} className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-gray-400 tracking-[0.2em] uppercase mb-2">
                    Quem vai ganhar?
                  </label>
                  <select
                    required
                    value={betWinnerId}
                    onChange={(e) => setBetWinnerId(e.target.value)}
                    className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-brand transition-colors"
                  >
                    <option value="">Selecionar...</option>
                    {p1 && <option value={p1._id}>{p1.name}</option>}
                    {p2 && <option value={p2._id}>{p2.name}</option>}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 tracking-[0.2em] uppercase mb-2">
                    Boletas a apostar (saldo: {player?.boletas ?? 0})
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={player?.boletas ?? 0}
                    required
                    value={betAmount}
                    onChange={(e) => setBetAmount(Number(e.target.value))}
                    className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-brand transition-colors"
                  />
                  <p className="text-xs text-gray-400 mt-2">Ganhe o dobro se acertar</p>
                </div>
                {betError && (
                  <p className="text-red-500 text-xs font-bold">{betError}</p>
                )}
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="w-full bg-accent text-brand text-xs font-black tracking-widest uppercase py-4 hover:bg-accent-dark disabled:opacity-50 transition-colors"
                >
                  Apostar boletas
                </button>
              </form>
            </div>
          )}

          {myBet && (
            <div className="border border-brand/20 bg-brand-light px-6 py-5 mb-6">
              <p className="text-xs font-black text-brand/50 tracking-[0.2em] uppercase mb-2">Sua aposta</p>
              <p className="font-black text-brand">
                {typeof myBet.predictedWinner === 'object' ? myBet.predictedWinner.name : '—'}
                <span className="font-normal text-brand/50 ml-2">· {myBet.amount} boletas</span>
              </p>
              <p className={`text-xs mt-1 ${BET_STATUS_CONFIG[myBet.status].cls}`}>
                {BET_STATUS_CONFIG[myBet.status].label}
              </p>
            </div>
          )}

          {bets.length === 0 ? (
            <div className="py-10 text-center border border-gray-100">
              <p className="text-gray-300 text-sm">
                {canBet ? 'Seja o primeiro a apostar!' : 'Nenhuma aposta ainda'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 border border-gray-100">
              {bets.map((bet) => {
                const bettor = typeof bet.bettor === 'object' ? bet.bettor : null
                const predicted = typeof bet.predictedWinner === 'object' ? bet.predictedWinner : null
                const s = BET_STATUS_CONFIG[bet.status]
                return (
                  <div key={bet._id} className="flex items-center justify-between px-6 py-4">
                    <div>
                      <span className="font-bold text-gray-900 text-sm">{bettor?.name ?? '—'}</span>
                      <span className="text-gray-400 text-sm"> apostou em </span>
                      <span className="font-bold text-gray-900 text-sm">{predicted?.name ?? '—'}</span>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <span className="text-sm font-black text-gray-600">{bet.amount} bol.</span>
                      <span className={`text-xs ${s.cls}`}>{s.label}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </PageLayout>
  )
}
