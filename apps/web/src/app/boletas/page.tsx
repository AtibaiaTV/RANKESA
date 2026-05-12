'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/auth-context'
import { createPurchase, getMyPurchases, cancelPurchase } from '@/lib/api/boletas-purchases'
import type { BoletasPackage, BoletasPurchase } from '@rank-app/shared'
import { PageLayout } from '@/components/layout/page-layout'
import {
  Coins, UserPlus, Swords, CheckCircle2, Trophy, TrendingUp,
  AlertCircle, Ban, RefreshCcw, XCircle, CalendarX, ShieldAlert,
  Banknote, Copy, CheckCheck, Check, X, Sparkles,
  ChevronRight, ArrowUpRight, ArrowDownRight, Plus, Zap,
} from 'lucide-react'

const PIX_KEY     = '11137332000139'
const PIX_BANK    = 'SICREDI'
const PIX_COMPANY = 'Empresa Jornalística Dia a Dia Ltda.'

// ── Static data ────────────────────────────────────────────────────────────
const HOW_TO_EARN = [
  { icon: UserPlus,     label: 'Cadastro',                   amount: '+100', once: true  },
  { icon: Swords,       label: 'Registrar partida',           amount: '+5'               },
  { icon: CheckCircle2, label: 'Confirmar partida adversário', amount: '+10'              },
  { icon: Trophy,       label: 'Vencer partida',              amount: '+20'              },
]

const HOW_TO_LOSE = [
  { icon: XCircle,     label: 'Cancelamento',          amount: '−15'                      },
  { icon: CalendarX,   label: 'Não registrar resultado', amount: '−10'                     },
  { icon: ShieldAlert, label: 'Resultado falso',         amount: '−50', extra: '+ suspensão' },
]

const PACKAGES: { key: BoletasPackage; boletas: number; price: number; highlight?: boolean }[] = [
  { key: 'PACK_100'  as BoletasPackage, boletas: 100,  price: 10               },
  { key: 'PACK_600'  as BoletasPackage, boletas: 600,  price: 50, highlight: true },
  { key: 'PACK_1500' as BoletasPackage, boletas: 1500, price: 100              },
]

const STATUS_CFG: Record<string, { label: string; color: string; dot: string }> = {
  PENDING:  { label: 'Aguardando', color: 'text-yellow-400', dot: 'bg-yellow-400' },
  APPROVED: { label: 'Aprovada',   color: 'text-accent',     dot: 'bg-accent'     },
  REJECTED: { label: 'Rejeitada',  color: 'text-red-400',    dot: 'bg-red-400'    },
}

const BET_RULES = [
  { icon: CheckCircle2, color: 'text-accent',     title: 'Quando apostar',               text: 'Só é possível apostar enquanto a partida está "Aguardando confirmação".' },
  { icon: Coins,        color: 'text-yellow-400', title: 'Valor mínimo',                 text: 'Qualquer quantidade de boletas, desde que você tenha saldo. O desconto é imediato.' },
  { icon: Ban,          color: 'text-white/30',   title: 'Uma aposta por partida',        text: 'Cada jogador pode apostar apenas uma vez em cada confronto.' },
  { icon: Trophy,       color: 'text-yellow-400', title: 'Aposta vencedora',             text: 'Acertou o vencedor? Recebe o dobro de volta. 50 apostados → 100 recebidos.' },
  { icon: AlertCircle,  color: 'text-red-400',    title: 'Aposta perdedora',             text: 'Errou o vencedor? As boletas apostadas são perdidas.' },
  { icon: RefreshCcw,   color: 'text-blue-400',   title: 'Partida disputada/cancelada',  text: 'Todas as apostas pendentes são estornadas automaticamente.' },
]

// ═══════════════════════════════════════════════════════════════════════════
export default function BoletasPage() {
  const { player, token, isAuthenticated } = useAuth()

  const [selected,    setSelected]    = useState<BoletasPackage | null>(null)
  const [txRef,       setTxRef]       = useState('')
  const [submitting,  setSubmitting]  = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submitted,   setSubmitted]   = useState(false)
  const [copiedPix,   setCopiedPix]   = useState(false)
  const [purchases,   setPurchases]   = useState<BoletasPurchase[]>([])
  const [histLoading, setHistLoading] = useState(false)
  const [cancelling,  setCancelling]  = useState<string | null>(null)
  const [showModal,   setShowModal]   = useState(false)

  useEffect(() => {
    if (!isAuthenticated || !token) return
    setHistLoading(true)
    getMyPurchases(token).then(setPurchases).finally(() => setHistLoading(false))
  }, [isAuthenticated, token, submitted])

  function handleCopyPix() {
    navigator.clipboard.writeText(PIX_KEY).then(() => {
      setCopiedPix(true)
      setTimeout(() => setCopiedPix(false), 2000)
    })
  }

  async function handleSubmit() {
    if (!token || !selected) return
    setSubmitting(true); setSubmitError('')
    try {
      await createPurchase(token, { package: selected, transactionRef: txRef.trim() || undefined })
      setSubmitted(true); setSelected(null); setTxRef(''); setShowModal(false)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Erro ao registrar solicitação')
    } finally { setSubmitting(false) }
  }

  async function handleCancel(id: string) {
    if (!token || !confirm('Cancelar esta solicitação?')) return
    setCancelling(id)
    try {
      await cancelPurchase(token, id)
      setPurchases(prev => prev.filter(p => p._id !== id))
    } finally { setCancelling(null) }
  }

  function openModal(pkg: BoletasPackage) {
    setSelected(pkg)
    setSubmitError('')
    setShowModal(true)
  }

  const selectedPkg = selected ? PACKAGES.find(p => p.key === selected) : null

  const totalPurchased = purchases
    .filter(p => p.status === 'APPROVED')
    .reduce((acc, p) => acc + p.boletas, 0)

  return (
    <PageLayout>
      <div className="min-h-screen bg-navy">
        <div className="max-w-5xl mx-auto px-6 py-8">

          {/* ── Header ── */}
          <div className="mb-8">
            <p className="text-xs text-white/30 uppercase tracking-widest mb-1">Economia</p>
            <h1 className="text-2xl font-black text-white">Boletas</h1>
          </div>

          {/* ── Balance Hero Card ── */}
          <div
            className="relative rounded-2xl overflow-hidden mb-8"
            style={{ background: 'linear-gradient(135deg, #1a3a39 0%, #0f2423 40%, #0B0C10 100%)' }}
          >
            {/* Decorative glow */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-0 w-64 h-64 rounded-full bg-brand/10 -translate-x-1/2 -translate-y-1/2 blur-3xl" />
              <div className="absolute bottom-0 right-16 w-48 h-48 rounded-full bg-accent/5 translate-y-1/2 blur-2xl" />
            </div>

            <div className="relative z-10 p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center gap-6">

                {/* Icon + balance */}
                <div className="flex items-center gap-5 flex-1">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0 backdrop-blur-sm">
                    <Coins size={32} className="text-accent" />
                  </div>
                  <div>
                    <p className="text-xs text-white/40 uppercase tracking-widest font-semibold mb-1">Seu Saldo</p>
                    <div className="flex items-end gap-2">
                      <p className="text-5xl sm:text-6xl font-black text-white tabular-nums leading-none">
                        {isAuthenticated ? (player?.boletas ?? 0).toLocaleString('pt-BR') : '—'}
                      </p>
                      <p className="text-white/30 text-sm mb-1.5 font-medium">boletas</p>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                {isAuthenticated && (
                  <div className="flex sm:flex-col gap-6 sm:gap-3 sm:border-l sm:border-white/[0.08] sm:pl-8 shrink-0">
                    <div className="flex items-center gap-2 sm:justify-end">
                      <ArrowUpRight size={14} className="text-accent" />
                      <div className="text-right">
                        <p className="text-lg font-black text-accent tabular-nums">
                          +{totalPurchased > 0 ? totalPurchased.toLocaleString('pt-BR') : ((player?.wins ?? 0) * 20 + (player?.boletas ?? 0)).toLocaleString('pt-BR')}
                        </p>
                        <p className="text-[10px] text-white/30 font-semibold uppercase tracking-wide">Total ganho</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:justify-end">
                      <ArrowDownRight size={14} className="text-red-400" />
                      <div className="text-right">
                        <p className="text-lg font-black text-red-400 tabular-nums">−0</p>
                        <p className="text-[10px] text-white/30 font-semibold uppercase tracking-wide">Total perdido</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Unauthenticated prompt */}
              {!isAuthenticated && (
                <div className="mt-5 pt-5 border-t border-white/[0.06] flex items-center gap-4">
                  <p className="text-sm text-white/40 flex-1">Faça login para ver seu saldo e histórico</p>
                  <Link href="/login"
                    className="flex items-center gap-1.5 bg-brand text-navy text-sm font-bold px-4 py-2 rounded-xl hover:bg-brand-dark transition-colors shrink-0">
                    Entrar <ChevronRight size={13} />
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* ── Packages (inline) ── */}
          {isAuthenticated && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Zap size={14} className="text-brand" />
                <p className="text-sm font-bold text-white">Comprar Boletas</p>
                <p className="text-xs text-white/30 ml-1">via PIX · confirmação em até 24h</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {PACKAGES.map(pkg => (
                  <button
                    key={pkg.key}
                    onClick={() => openModal(pkg.key)}
                    className={`relative flex items-center gap-4 p-4 rounded-2xl border transition-all text-left group hover:border-brand/40 hover:bg-brand/5 ${
                      pkg.highlight
                        ? 'border-accent/30 bg-accent/5 ring-1 ring-accent/15'
                        : 'border-white/[0.07] bg-surface'
                    }`}
                  >
                    {pkg.highlight && (
                      <span className="absolute -top-2.5 right-4 bg-accent text-navy text-[9px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-0.5">
                        <Sparkles size={8} /> POPULAR
                      </span>
                    )}

                    {/* Coin icon */}
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                      pkg.highlight ? 'bg-accent/15' : 'bg-white/5'
                    }`}>
                      <Coins size={20} className={pkg.highlight ? 'text-accent' : 'text-yellow-400'} />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xl font-black text-white tabular-nums leading-tight">
                        {pkg.boletas.toLocaleString('pt-BR')}
                        <span className="text-xs text-white/30 font-normal ml-1">boletas</span>
                      </p>
                      <p className={`text-base font-black tabular-nums mt-0.5 ${
                        pkg.highlight ? 'text-accent' : 'text-brand'
                      }`}>
                        R$ {pkg.price},00
                      </p>
                    </div>

                    {/* Arrow */}
                    <Plus size={14} className="text-white/15 group-hover:text-brand transition-colors shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Two columns: Transaction history + Earn/Lose ── */}
          <div className="grid lg:grid-cols-[1fr_300px] gap-6 mb-8">

            {/* LEFT: Transaction history */}
            <div className="bg-surface border border-white/[0.07] rounded-2xl overflow-hidden flex flex-col">
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06] shrink-0">
                <div className="flex items-center gap-2">
                  <TrendingUp size={14} className="text-brand" />
                  <p className="text-sm font-bold text-white">Histórico de Compras</p>
                </div>
                {purchases.length > 0 && (
                  <span className="text-[10px] font-bold text-white/25 bg-white/5 px-2 py-0.5 rounded-full">
                    {purchases.length}
                  </span>
                )}
              </div>

              {!isAuthenticated ? (
                <div className="py-12 text-center flex-1">
                  <Coins size={28} className="text-white/10 mx-auto mb-3" />
                  <p className="text-sm text-white/30 mb-4">Entre para ver seu histórico</p>
                  <Link href="/login" className="text-sm text-brand font-semibold hover:text-accent transition-colors">
                    Fazer login →
                  </Link>
                </div>
              ) : histLoading ? (
                <div className="py-12 flex items-center justify-center flex-1">
                  <div className="w-6 h-6 border-2 border-brand/20 border-t-brand rounded-full animate-spin" />
                </div>
              ) : purchases.length === 0 ? (
                <div className="py-12 text-center flex-1">
                  <Coins size={28} className="text-white/10 mx-auto mb-3" />
                  <p className="text-sm text-white/30">Nenhuma compra ainda</p>
                  <p className="text-xs text-white/20 mt-1">Jogue partidas para ganhar boletas gratuitamente!</p>
                </div>
              ) : (
                <div className="divide-y divide-white/[0.04] overflow-y-auto max-h-80">
                  {purchases.map(p => {
                    const s = STATUS_CFG[p.status] ?? STATUS_CFG.PENDING
                    const isApproved = p.status === 'APPROVED'
                    return (
                      <div key={p._id} className="flex items-center gap-3 px-5 py-3.5">
                        {/* Status dot + icon */}
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          isApproved ? 'bg-accent/10' : 'bg-white/[0.04]'
                        }`}>
                          <Coins size={16} className={isApproved ? 'text-accent' : 'text-white/20'} />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white leading-tight">Compra de boletas</p>
                          <p className="text-[11px] text-white/30 mt-0.5">
                            {new Date(p.createdAt).toLocaleDateString('pt-BR', {
                              day: '2-digit', month: 'short', year: 'numeric',
                            })} · R$ {p.price},00
                          </p>
                        </div>

                        {/* Amount + status */}
                        <div className="text-right shrink-0">
                          <p className={`text-sm font-black tabular-nums ${isApproved ? 'text-accent' : 'text-white/30'}`}>
                            {isApproved ? '+' : ''}{p.boletas.toLocaleString('pt-BR')}
                          </p>
                          <div className={`flex items-center justify-end gap-1 mt-0.5`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                            <p className={`text-[10px] font-bold ${s.color}`}>{s.label}</p>
                          </div>
                        </div>

                        {/* Cancel */}
                        {p.status === 'PENDING' && (
                          <button
                            onClick={() => handleCancel(p._id)}
                            disabled={cancelling === p._id}
                            className="text-white/15 hover:text-red-400 transition-colors ml-1 disabled:opacity-30 shrink-0"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* RIGHT: Earn / Lose */}
            <div className="space-y-4">

              {/* Como Ganhar */}
              <div className="bg-surface border border-white/[0.07] rounded-2xl overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3.5 border-b border-white/[0.06]">
                  <div className="w-2 h-2 rounded-full bg-accent" />
                  <p className="text-sm font-bold text-white">Como Ganhar</p>
                </div>
                <div className="divide-y divide-white/[0.04]">
                  {HOW_TO_EARN.map(r => {
                    const Icon = r.icon
                    return (
                      <div key={r.label} className="flex items-center gap-3 px-4 py-3">
                        <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                          <Icon size={12} className="text-accent" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-white/60 leading-tight">{r.label}</p>
                          {r.once && (
                            <p className="text-[9px] text-white/25 mt-0.5">apenas uma vez</p>
                          )}
                        </div>
                        <span className="text-sm font-black text-accent tabular-nums shrink-0">{r.amount}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Como Perder */}
              <div className="bg-surface border border-white/[0.07] rounded-2xl overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3.5 border-b border-white/[0.06]">
                  <div className="w-2 h-2 rounded-full bg-red-400" />
                  <p className="text-sm font-bold text-white">Como Perder</p>
                </div>
                <div className="divide-y divide-white/[0.04]">
                  {HOW_TO_LOSE.map(r => {
                    const Icon = r.icon
                    return (
                      <div key={r.label} className="flex items-center gap-3 px-4 py-3">
                        <div className="w-7 h-7 rounded-lg bg-red-400/10 flex items-center justify-center shrink-0">
                          <Icon size={12} className="text-red-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-white/60 leading-tight">{r.label}</p>
                          {r.extra && (
                            <p className="text-[9px] text-red-400/60 font-semibold mt-0.5">{r.extra}</p>
                          )}
                        </div>
                        <span className="text-sm font-black text-red-400 tabular-nums shrink-0">{r.amount}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* ── Bet rules ── */}
          <div className="bg-surface border border-white/[0.07] rounded-2xl overflow-hidden mb-6">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-white/[0.06]">
              <div className="w-2 h-2 rounded-full bg-brand" />
              <p className="text-sm font-bold text-white">Regras das Apostas</p>
            </div>
            <div className="grid sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-white/[0.04]">
              {BET_RULES.map((rule, i) => {
                const Icon = rule.icon
                return (
                  <div
                    key={rule.title}
                    className={`flex items-start gap-3 px-5 py-4 ${i >= 2 ? 'border-t border-white/[0.04]' : ''}`}
                  >
                    <Icon size={14} className={`${rule.color} mt-0.5 shrink-0`} />
                    <div>
                      <p className="text-sm font-semibold text-white leading-tight">{rule.title}</p>
                      <p className="text-xs text-white/35 mt-1 leading-relaxed">{rule.text}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* ── CTA ── */}
          {isAuthenticated ? (
            <div className="bg-surface-2 border border-brand/20 rounded-2xl p-5 flex items-center justify-between gap-4">
              <div>
                <p className="font-black text-white text-base">Pronto para apostar?</p>
                <p className="text-white/40 text-xs mt-0.5">
                  Você tem <span className="text-accent font-bold">{(player?.boletas ?? 0).toLocaleString('pt-BR')} boletas</span> disponíveis.
                </p>
              </div>
              <Link
                href="/schedule"
                className="flex items-center gap-2 bg-brand text-navy font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-brand-dark transition-colors shrink-0"
              >
                Ver partidas <ChevronRight size={14} />
              </Link>
            </div>
          ) : (
            <div className="bg-surface-2 border border-brand/20 rounded-2xl p-5 flex items-center justify-between gap-4">
              <div>
                <p className="font-black text-white text-base">Comece com 100 boletas grátis</p>
                <p className="text-white/40 text-xs mt-0.5">Crie sua conta e comece a jogar agora.</p>
              </div>
              <Link
                href="/register"
                className="flex items-center gap-2 bg-brand text-navy font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-brand-dark transition-colors shrink-0"
              >
                Criar conta <ChevronRight size={14} />
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ── PIX Purchase Modal ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4 backdrop-blur-sm">
          <div className="bg-surface border border-white/10 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.07]">
              <h2 className="font-black text-white text-base flex items-center gap-2">
                <Coins size={16} className="text-accent" /> Comprar Boletas
              </h2>
              <button
                onClick={() => { setShowModal(false); setSelected(null); setSubmitError('') }}
                className="text-white/20 hover:text-white/60 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {submitted ? (
                /* Success state */
                <div className="text-center py-4">
                  <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                    <Check size={26} className="text-accent" />
                  </div>
                  <p className="font-black text-white text-lg mb-2">Solicitação registrada!</p>
                  <p className="text-sm text-white/40 mb-5">
                    Confirmamos seu pagamento e creditamos as boletas em até 24h.
                  </p>
                  <button
                    onClick={() => { setSubmitted(false); setShowModal(false) }}
                    className="text-sm text-brand font-semibold hover:text-accent transition-colors"
                  >
                    Fechar
                  </button>
                </div>
              ) : (
                <>
                  {/* Package selector */}
                  <div className="grid grid-cols-3 gap-2">
                    {PACKAGES.map(pkg => (
                      <button
                        key={pkg.key}
                        onClick={() => setSelected(pkg.key)}
                        className={`relative flex flex-col items-center gap-1.5 border rounded-xl p-3.5 transition-all ${
                          selected === pkg.key
                            ? 'border-brand bg-brand/10'
                            : 'border-white/10 bg-navy hover:border-white/20'
                        } ${pkg.highlight ? 'ring-1 ring-accent/30' : ''}`}
                      >
                        {pkg.highlight && (
                          <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-accent text-navy text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-0.5 whitespace-nowrap">
                            <Sparkles size={7} /> POPULAR
                          </span>
                        )}
                        <Coins size={16} className="text-yellow-400" />
                        <p className="text-lg font-black text-white tabular-nums">{pkg.boletas.toLocaleString('pt-BR')}</p>
                        <p className="text-[10px] text-white/30">boletas</p>
                        <p className="text-sm font-black text-brand">R$ {pkg.price},00</p>
                        {selected === pkg.key && (
                          <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-brand flex items-center justify-center">
                            <Check size={9} className="text-navy" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* PIX details */}
                  {selected && selectedPkg && (
                    <div className="bg-navy border border-white/[0.07] rounded-xl overflow-hidden">
                      <div className="flex items-center gap-2 px-4 py-3 bg-green-500/10 border-b border-green-500/10">
                        <Banknote size={13} className="text-green-400" />
                        <p className="text-sm font-bold text-green-300">
                          Pague R$ {selectedPkg.price},00 via PIX
                        </p>
                      </div>
                      <div className="px-4 py-4 space-y-3">
                        <div>
                          <p className="text-[10px] font-bold text-white/25 uppercase tracking-wide mb-1.5">Chave PIX</p>
                          <div className="flex items-center gap-2 bg-white/[0.05] border border-white/[0.07] rounded-lg px-3 py-2.5">
                            <p className="flex-1 font-mono text-sm font-bold text-white select-all">{PIX_KEY}</p>
                            <button
                              onClick={handleCopyPix}
                              className={`shrink-0 flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-md transition-colors ${
                                copiedPix ? 'bg-accent text-navy' : 'bg-brand/15 text-brand hover:bg-brand/25'
                              }`}
                            >
                              {copiedPix ? <><CheckCheck size={11} /> Copiado!</> : <><Copy size={11} /> Copiar</>}
                            </button>
                          </div>
                        </div>
                        <div className="flex gap-6 text-xs">
                          <div>
                            <p className="text-white/25 font-bold uppercase tracking-wide text-[10px] mb-0.5">Banco</p>
                            <p className="text-white/60 font-semibold">{PIX_BANK}</p>
                          </div>
                          <div>
                            <p className="text-white/25 font-bold uppercase tracking-wide text-[10px] mb-0.5">Favorecido</p>
                            <p className="text-white/60 font-semibold leading-tight">{PIX_COMPANY}</p>
                          </div>
                        </div>
                        <input
                          type="text"
                          placeholder="ID do comprovante PIX (opcional)"
                          value={txRef}
                          onChange={e => setTxRef(e.target.value)}
                          className="w-full bg-white/[0.04] border border-white/[0.07] rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-brand transition-colors"
                        />
                        {submitError && (
                          <p className="text-red-400 text-xs bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                            {submitError}
                          </p>
                        )}
                        <button
                          onClick={handleSubmit}
                          disabled={submitting}
                          className="w-full flex items-center justify-center gap-2 bg-brand text-navy font-bold text-sm py-3 rounded-xl hover:bg-brand-dark disabled:opacity-50 transition-colors"
                        >
                          <Check size={14} />
                          {submitting ? 'Registrando...' : 'Já efetuei o pagamento'}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  )
}
