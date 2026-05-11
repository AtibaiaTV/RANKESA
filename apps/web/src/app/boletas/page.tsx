'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/auth-context'
import { createPurchase, getMyPurchases, cancelPurchase } from '@/lib/api/boletas-purchases'
import type {
  BoletasPackage, BoletasPurchase, BoletasPurchaseStatus,
} from '@rank-app/shared'

// Avoid module-level enum access — use string literals matching enum values
const PIX_KEY     = '11137332000139'
const PIX_BANK    = 'SICREDI'
const PIX_COMPANY = 'Empresa Jornalística Dia a Dia Ltda.'
import { PageLayout } from '@/components/layout/page-layout'
import {
  Coins, UserPlus, Swords, CheckCircle2, Trophy, TrendingUp,
  HelpCircle, ChevronRight, AlertCircle, Ban, RefreshCcw,
  XCircle, CalendarX, ShieldAlert, Flag, Banknote, Copy,
  CheckCheck, Clock, Check, X, Sparkles,
} from 'lucide-react'

// ── Static data ────────────────────────────────────────────────────────────

const REWARDS = [
  { icon: UserPlus,    color: 'text-brand',    bg: 'bg-brand/8',    border: 'border-brand/15',   label: 'Cadastro',          amount: '+100', description: 'Boletas de boas-vindas ao criar sua conta.', once: true,  penalty: false },
  { icon: Swords,      color: 'text-blue-500', bg: 'bg-blue-50',    border: 'border-blue-100',   label: 'Registrar partida', amount: '+5',   description: 'Toda vez que você registrar um resultado de partida.', once: false, penalty: false },
  { icon: CheckCircle2,color: 'text-accent',   bg: 'bg-accent/8',   border: 'border-accent/15',  label: 'Confirmar partida', amount: '+10',  description: 'Quando você confirma o resultado de uma partida registrada pelo adversário.', once: false, penalty: false },
  { icon: Trophy,      color: 'text-yellow-500',bg: 'bg-yellow-50', border: 'border-yellow-100', label: 'Vencer partida',    amount: '+20',  description: 'Toda vez que uma partida confirmada registrar você como vencedor.', once: false, penalty: false },
  { icon: TrendingUp,  color: 'text-purple-500',bg: 'bg-purple-50', border: 'border-purple-100', label: 'Apostar e acertar', amount: '×2',   description: 'Se você apostar e o vencedor que você previu for o correto, recebe o dobro do que apostou.', once: false, penalty: false },
]

const PENALTIES = [
  { icon: XCircle,    color: 'text-red-500',    bg: 'bg-red-50',    border: 'border-red-100',    label: 'Cancelar agendamento',    amount: '−15', extra: null as string | null, description: 'Se você cancelar uma partida que criou na agenda, perde boletas pelo transtorno causado aos participantes.' },
  { icon: CalendarX,  color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-100', label: 'Não registrar resultado', amount: '−10', extra: null, description: 'Se uma partida agendada acontecer e o organizador não registrar o resultado em até 48 horas, a penalidade é automática.' },
  { icon: ShieldAlert,color: 'text-red-600',    bg: 'bg-red-50',    border: 'border-red-100',    label: 'Resultado falso',         amount: '−50', extra: '+ Suspensão', description: 'Se o administrador corrigir o vencedor em uma disputa, quem registrou o resultado errado perde 50 boletas e é suspenso progressivamente.' },
  { icon: Flag,       color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100', label: 'Má conduta desportiva',   amount: '−50', extra: '+ Suspensão', description: 'Se um adversário reportar má conduta e o admin confirmar, o jogador perde 50 boletas e é suspenso progressivamente.' },
]

const BET_RULES = [
  { icon: CheckCircle2, color: 'text-accent',       title: 'Quando apostar',              text: 'Só é possível apostar enquanto a partida está com status "Aguardando confirmação". Após confirmada ou disputada, as apostas são encerradas.' },
  { icon: Coins,        color: 'text-yellow-500',   title: 'Valor mínimo',                text: 'Você pode apostar qualquer quantidade de boletas, desde que tenha saldo suficiente. O desconto é imediato.' },
  { icon: Ban,          color: 'text-gray-400',     title: 'Uma aposta por partida',      text: 'Cada jogador pode apostar apenas uma vez em cada partida. Não é possível apostar duas vezes no mesmo confronto.' },
  { icon: Trophy,       color: 'text-yellow-500',   title: 'Aposta vencedora',            text: 'Se você acertar o vencedor, recebe de volta o dobro do valor apostado. Apostou 50 boletas → recebe 100.' },
  { icon: AlertCircle,  color: 'text-red-400',      title: 'Aposta perdedora',            text: 'Se você errar o vencedor, as boletas apostadas são perdidas.' },
  { icon: RefreshCcw,   color: 'text-blue-400',     title: 'Partida disputada/cancelada', text: 'Se a partida entrar em disputa ou for cancelada, todas as apostas pendentes são estornadas.' },
]

const FAQ = [
  { q: 'Meu saldo de boletas pode ficar negativo?',          a: 'O sistema não permite apostar mais boletas do que você possui. Penalidades podem ser aplicadas mesmo com saldo baixo — o saldo pode ir a zero, mas não abaixo disso.' },
  { q: 'Posso apostar em uma partida que eu mesmo joguei?',  a: 'Sim! Você pode apostar na sua própria partida — mas não pode ser o mesmo jogador que registrou e confirmar ela.' },
  { q: 'Quanto tempo tenho para registrar o resultado?',     a: 'O organizador tem 48 horas após a data da partida agendada para registrar o resultado. Após esse prazo, a penalidade de −10 boletas é aplicada automaticamente.' },
  { q: 'As boletas expiram?',                                a: 'Não. Seu saldo de boletas não expira e fica guardado indefinidamente na sua conta.' },
  { q: 'Quanto tempo leva para minha compra ser aprovada?',  a: 'As compras via PIX são aprovadas manualmente pelo administrador, geralmente em até 24 horas após o pagamento ser identificado.' },
]

// ── PIX packages ───────────────────────────────────────────────────────────

const PACKAGES: { key: BoletasPackage; boletas: number; price: number; highlight?: boolean }[] = [
  { key: 'PACK_100'  as BoletasPackage, boletas: 100,  price: 10 },
  { key: 'PACK_600'  as BoletasPackage, boletas: 600,  price: 50,  highlight: true },
  { key: 'PACK_1500' as BoletasPackage, boletas: 1500, price: 100 },
]

const STATUS_CFG: Record<string, { label: string; cls: string }> = {
  PENDING:  { label: 'Aguardando',  cls: 'text-orange-500 bg-orange-50 border-orange-100' },
  APPROVED: { label: 'Aprovada',    cls: 'text-accent bg-accent/8 border-accent/20' },
  REJECTED: { label: 'Rejeitada',   cls: 'text-red-500 bg-red-50 border-red-100' },
}

// ── Component ──────────────────────────────────────────────────────────────

export default function BoletasPage() {
  const { player, token, isAuthenticated } = useAuth()

  // Purchase flow state
  const [selected, setSelected]         = useState<BoletasPackage | null>(null)
  const [txRef, setTxRef]               = useState('')
  const [submitting, setSubmitting]     = useState(false)
  const [submitError, setSubmitError]   = useState('')
  const [submitted, setSubmitted]       = useState(false)
  const [copiedPix, setCopiedPix]       = useState(false)

  // Purchase history
  const [purchases, setPurchases]       = useState<BoletasPurchase[]>([])
  const [histLoading, setHistLoading]   = useState(false)
  const [cancelling, setCancelling]     = useState<string | null>(null)

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
    setSubmitting(true)
    setSubmitError('')
    try {
      await createPurchase(token, { package: selected, transactionRef: txRef.trim() || undefined })
      setSubmitted(true)
      setSelected(null)
      setTxRef('')
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Erro ao registrar solicitação')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleCancel(id: string) {
    if (!token || !confirm('Cancelar esta solicitação?')) return
    setCancelling(id)
    try {
      await cancelPurchase(token, id)
      setPurchases(prev => prev.filter(p => p._id !== id))
    } finally {
      setCancelling(null)
    }
  }

  const selectedPkg = selected ? PACKAGES.find(p => p.key === selected) : null

  return (
    <PageLayout>
      <div className="flex-1 flex flex-col min-h-screen bg-gray-50">

        {/* ── Hero ── */}
        <div className="bg-brand relative overflow-hidden shrink-0">
          <div className="absolute inset-0 bg-gradient-to-br from-brand via-brand to-[#2C0090]" />
          <div className="absolute right-0 top-0 h-full w-72 bg-white/[0.03] [clip-path:polygon(25%_0,100%_0,100%_100%,0%_100%)]" />

          <div className="relative z-10 px-8 py-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-full bg-yellow-400/20 border border-yellow-400/30 flex items-center justify-center shrink-0">
                <Coins size={26} className="text-yellow-300" />
              </div>
              <div>
                <p className="text-white/40 text-[10px] uppercase tracking-[0.2em] font-semibold mb-0.5">Manual</p>
                <h1 className="text-2xl font-black text-white leading-tight">Boletas</h1>
              </div>
              {isAuthenticated && player && (
                <div className="ml-auto shrink-0 text-right">
                  <p className="text-[38px] font-black text-yellow-300 leading-none tabular-nums">{player.boletas}</p>
                  <p className="text-white/30 text-[9px] uppercase tracking-[0.2em] mt-1">Seu saldo</p>
                </div>
              )}
            </div>
            <p className="text-white/50 text-sm leading-relaxed max-w-md">
              Boletas são a moeda do RANK. Você ganha jogando e confirmando partidas — e usa para apostar nos resultados da comunidade.
            </p>
          </div>
        </div>

        <div className="px-8 py-8 space-y-10 max-w-2xl">

          {/* ── Comprar boletas via PIX ── */}
          {isAuthenticated && (
            <section>
              <div className="flex items-center gap-2 mb-5">
                <div className="w-1 h-5 bg-green-500 rounded-full" />
                <h2 className="text-base font-black text-gray-900 uppercase tracking-wide">
                  Comprar boletas
                </h2>
              </div>

              {submitted ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                    <Check size={22} className="text-green-600" />
                  </div>
                  <p className="font-black text-green-800 text-base mb-1">Solicitação registrada!</p>
                  <p className="text-sm text-green-700 mb-4">
                    Após confirmarmos o pagamento, as boletas serão creditadas em até 24h.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="text-sm text-green-700 underline hover:text-green-900"
                  >
                    Fazer outra solicitação
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Packages */}
                  <div className="grid grid-cols-3 gap-3">
                    {PACKAGES.map(pkg => (
                      <button
                        key={pkg.key}
                        onClick={() => setSelected(selected === pkg.key ? null : pkg.key)}
                        className={`relative flex flex-col items-center gap-1.5 border-2 rounded-xl p-4 transition-all ${
                          selected === pkg.key
                            ? 'border-brand bg-brand/5 shadow-sm'
                            : 'border-gray-200 bg-white hover:border-brand/40'
                        } ${pkg.highlight ? 'ring-2 ring-accent/40' : ''}`}
                      >
                        {pkg.highlight && (
                          <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-accent text-brand text-[9px] font-black px-2 py-0.5 rounded-full whitespace-nowrap flex items-center gap-0.5">
                            <Sparkles size={8} /> POPULAR
                          </span>
                        )}
                        <Coins size={20} className="text-yellow-500" />
                        <p className="text-xl font-black text-gray-900 tabular-nums">{pkg.boletas.toLocaleString('pt-BR')}</p>
                        <p className="text-[10px] text-gray-400">boletas</p>
                        <p className="text-sm font-black text-brand mt-1">R$ {pkg.price},00</p>
                        <p className="text-[9px] text-gray-400">
                          R$ {(pkg.price / pkg.boletas * 100).toFixed(1)} / 100 bol.
                        </p>
                        {selected === pkg.key && (
                          <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-brand flex items-center justify-center">
                            <Check size={10} className="text-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* PIX payment details */}
                  {selected && selectedPkg && (
                    <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
                      {/* Header */}
                      <div className="px-5 py-3.5 bg-green-50 border-b border-green-100 flex items-center gap-2">
                        <Banknote size={14} className="text-green-600" />
                        <p className="text-sm font-bold text-green-800">
                          Pague R$ {selectedPkg.price},00 via PIX
                        </p>
                      </div>

                      <div className="px-5 py-4 space-y-3">
                        {/* PIX key */}
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Chave PIX</p>
                          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5">
                            <p className="flex-1 font-mono text-sm font-bold text-gray-900 select-all">
                              {PIX_KEY}
                            </p>
                            <button
                              onClick={handleCopyPix}
                              className={`shrink-0 flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-md transition-colors ${
                                copiedPix ? 'bg-green-500 text-white' : 'bg-brand/10 text-brand hover:bg-brand/20'
                              }`}
                            >
                              {copiedPix ? <><CheckCheck size={12} /> Copiado!</> : <><Copy size={12} /> Copiar</>}
                            </button>
                          </div>
                        </div>

                        {/* Bank info */}
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <p className="text-gray-400 font-bold uppercase tracking-wide text-[10px] mb-0.5">Banco</p>
                            <p className="text-gray-800 font-semibold">{PIX_BANK}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 font-bold uppercase tracking-wide text-[10px] mb-0.5">Favorecido</p>
                            <p className="text-gray-800 font-semibold leading-tight">{PIX_COMPANY}</p>
                          </div>
                        </div>

                        {/* Amount highlight */}
                        <div className="flex items-center justify-between bg-brand/5 border border-brand/10 rounded-lg px-4 py-3">
                          <span className="text-sm font-bold text-brand">Total a pagar</span>
                          <div className="text-right">
                            <p className="text-xl font-black text-brand">R$ {selectedPkg.price},00</p>
                            <p className="text-[10px] text-brand/60">{selectedPkg.boletas.toLocaleString('pt-BR')} boletas</p>
                          </div>
                        </div>

                        {/* Transaction ref (optional) */}
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">
                            ID / Comprovante do PIX <span className="font-normal text-gray-300">(opcional, agiliza aprovação)</span>
                          </label>
                          <input
                            type="text"
                            placeholder="Cole aqui o ID da transação..."
                            value={txRef}
                            onChange={e => setTxRef(e.target.value)}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand transition-colors"
                          />
                        </div>

                        {submitError && (
                          <p className="text-red-500 text-xs bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                            {submitError}
                          </p>
                        )}

                        <button
                          onClick={handleSubmit}
                          disabled={submitting}
                          className="w-full flex items-center justify-center gap-2 bg-brand text-white font-bold text-sm py-3 rounded-lg hover:bg-brand-dark disabled:opacity-50 transition-colors"
                        >
                          <Check size={14} />
                          {submitting ? 'Registrando...' : 'Já efetuei o pagamento'}
                        </button>

                        <p className="text-[10px] text-gray-400 text-center leading-relaxed">
                          Após registrar, seu pedido será analisado em até 24h. As boletas são creditadas automaticamente após a aprovação.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Purchase history */}
              {(purchases.length > 0 || histLoading) && (
                <div className="mt-5">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">
                    Histórico de compras
                  </p>
                  {histLoading ? (
                    <div className="py-4 text-center">
                      <div className="w-5 h-5 border-2 border-brand/20 border-t-brand rounded-full animate-spin mx-auto" />
                    </div>
                  ) : (
                    <div className="bg-white border border-gray-100 rounded-xl overflow-hidden divide-y divide-gray-50">
                      {purchases.map(p => {
                        const s = STATUS_CFG[p.status]
                        return (
                          <div key={p._id} className="flex items-center gap-4 px-4 py-3.5">
                            <Coins size={16} className="text-yellow-400 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-gray-900">
                                {p.boletas.toLocaleString('pt-BR')} boletas
                              </p>
                              <p className="text-xs text-gray-400 mt-0.5">
                                R$ {p.price},00 · {new Date(p.createdAt).toLocaleDateString('pt-BR')}
                              </p>
                              {p.adminNotes && (
                                <p className="text-xs text-gray-500 italic mt-0.5">{p.adminNotes}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className={`text-[10px] font-bold px-2 py-0.5 border rounded-full ${s.cls}`}>
                                {s.label}
                              </span>
                              {p.status === 'PENDING' as BoletasPurchaseStatus && (
                                <button
                                  onClick={() => handleCancel(p._id)}
                                  disabled={cancelling === p._id}
                                  title="Cancelar solicitação"
                                  className="text-gray-300 hover:text-red-400 transition-colors disabled:opacity-30"
                                >
                                  <X size={14} />
                                </button>
                              )}
                              {p.status === 'APPROVED' as BoletasPurchaseStatus && (
                                <Check size={14} className="text-accent" />
                              )}
                              {p.status === 'PENDING' as BoletasPurchaseStatus && (
                                <Clock size={12} className="text-orange-400" />
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </section>
          )}

          {/* ── Como ganhar boletas ── */}
          <section>
            <div className="flex items-center gap-2 mb-5">
              <div className="w-1 h-5 bg-accent rounded-full" />
              <h2 className="text-base font-black text-gray-900 uppercase tracking-wide">Como ganhar boletas</h2>
            </div>
            <div className="space-y-3">
              {REWARDS.map((r) => {
                const Icon = r.icon
                return (
                  <div key={r.label} className={`flex items-start gap-4 p-4 border ${r.border} bg-white`}>
                    <div className={`w-10 h-10 rounded-full ${r.bg} flex items-center justify-center shrink-0`}>
                      <Icon size={18} className={r.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-bold text-gray-900 text-sm">{r.label}</p>
                        <div className="flex items-center gap-2 shrink-0">
                          {r.once && <span className="text-[10px] font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">1 vez</span>}
                          <span className={`text-lg font-black tabular-nums ${r.color}`}>{r.amount}</span>
                          <Coins size={13} className="text-yellow-400" />
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{r.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          {/* ── Penalidades ── */}
          <section>
            <div className="flex items-center gap-2 mb-5">
              <div className="w-1 h-5 bg-red-400 rounded-full" />
              <h2 className="text-base font-black text-gray-900 uppercase tracking-wide">Penalidades</h2>
            </div>
            <div className="space-y-3">
              {PENALTIES.map((r) => {
                const Icon = r.icon
                return (
                  <div key={r.label} className={`flex items-start gap-4 p-4 border ${r.border} bg-white`}>
                    <div className={`w-10 h-10 rounded-full ${r.bg} flex items-center justify-center shrink-0`}>
                      <Icon size={18} className={r.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-bold text-gray-900 text-sm">{r.label}</p>
                        <div className="flex flex-col items-end shrink-0 gap-1">
                          <div className="flex items-center gap-1.5">
                            <span className={`text-lg font-black tabular-nums ${r.color}`}>{r.amount}</span>
                            <Coins size={13} className="text-red-300" />
                          </div>
                          {r.extra && <span className="text-[10px] font-black text-red-500 bg-red-50 border border-red-100 px-2 py-0.5">{r.extra}</span>}
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{r.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          {/* ── Regras das apostas ── */}
          <section>
            <div className="flex items-center gap-2 mb-5">
              <div className="w-1 h-5 bg-brand rounded-full" />
              <h2 className="text-base font-black text-gray-900 uppercase tracking-wide">Regras das apostas</h2>
            </div>
            <div className="bg-white border border-gray-100 overflow-hidden divide-y divide-gray-50">
              {BET_RULES.map((rule) => {
                const Icon = rule.icon
                return (
                  <div key={rule.title} className="flex items-start gap-4 px-5 py-4">
                    <Icon size={16} className={`${rule.color} mt-0.5 shrink-0`} />
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{rule.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{rule.text}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          {/* ── Resumo rápido ── */}
          <section>
            <div className="flex items-center gap-2 mb-5">
              <div className="w-1 h-5 bg-yellow-400 rounded-full" />
              <h2 className="text-base font-black text-gray-900 uppercase tracking-wide">Resumo rápido</h2>
            </div>
            <div className="bg-white border border-gray-100 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Ação</th>
                    <th className="text-right px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Boletas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {[
                    { action: 'Cadastro na plataforma',       val: '+100', cls: 'text-brand font-bold' },
                    { action: 'Registrar uma partida',        val: '+5',   cls: 'text-blue-500 font-bold' },
                    { action: 'Confirmar uma partida',        val: '+10',  cls: 'text-accent font-bold' },
                    { action: 'Vencer uma partida confirmada',val: '+20',  cls: 'text-yellow-500 font-bold' },
                    { action: 'Apostar e acertar',            val: '×2 do apostado',   cls: 'text-purple-500 font-bold' },
                    { action: 'Apostar e errar',              val: '−apostado',         cls: 'text-red-400 font-bold' },
                    { action: '—', val: '', cls: '' },
                    { action: 'Cancelar agendamento',         val: '−15',  cls: 'text-red-500 font-bold' },
                    { action: 'Não registrar resultado (48h)',val: '−10',  cls: 'text-orange-500 font-bold' },
                    { action: 'Resultado falso (1ª infração)',val: '−50 + 7 dias',      cls: 'text-red-600 font-bold' },
                    { action: 'Resultado falso (2ª infração)',val: '−50 + 14 dias',     cls: 'text-red-600 font-bold' },
                    { action: 'Resultado falso (3ª+)',        val: '−50 + 30 dias',     cls: 'text-red-700 font-bold' },
                    { action: 'Má conduta (admin confirma)',  val: '−50 + Suspensão',   cls: 'text-orange-600 font-bold' },
                    { action: '—', val: '', cls: '' },
                    { action: 'Compra 100 boletas',           val: 'R$ 10,00',  cls: 'text-green-600 font-bold' },
                    { action: 'Compra 600 boletas',           val: 'R$ 50,00',  cls: 'text-green-600 font-bold' },
                    { action: 'Compra 1.500 boletas',         val: 'R$ 100,00', cls: 'text-green-600 font-bold' },
                  ].map(({ action, val, cls }) =>
                    action === '—' ? (
                      <tr key={val || Math.random()}><td colSpan={2} className="px-5 py-1"><div className="border-t border-gray-100" /></td></tr>
                    ) : (
                      <tr key={action} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-3.5 text-gray-700">{action}</td>
                        <td className={`px-5 py-3.5 text-right tabular-nums ${cls}`}>{val}</td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* ── FAQ ── */}
          <section>
            <div className="flex items-center gap-2 mb-5">
              <div className="w-1 h-5 bg-gray-300 rounded-full" />
              <h2 className="text-base font-black text-gray-900 uppercase tracking-wide">Perguntas frequentes</h2>
            </div>
            <div className="space-y-3">
              {FAQ.map(({ q, a }) => (
                <div key={q} className="bg-white border border-gray-100 p-5">
                  <div className="flex items-start gap-3">
                    <HelpCircle size={15} className="text-brand/40 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-bold text-gray-900 text-sm mb-1.5">{q}</p>
                      <p className="text-xs text-gray-500 leading-relaxed">{a}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── CTA ── */}
          {isAuthenticated ? (
            <div className="bg-brand border border-brand/20 p-6 flex items-center justify-between gap-4">
              <div>
                <p className="font-black text-white text-base">Pronto para apostar?</p>
                <p className="text-white/50 text-xs mt-1">
                  Você tem <span className="text-yellow-300 font-bold">{player?.boletas ?? 0} boletas</span> disponíveis.
                </p>
              </div>
              <Link href="/ranking" className="flex items-center gap-2 bg-accent text-brand font-bold text-sm px-5 py-2.5 hover:bg-accent-dark transition-colors shrink-0">
                Ver partidas <ChevronRight size={14} />
              </Link>
            </div>
          ) : (
            <div className="bg-brand border border-brand/20 p-6 flex items-center justify-between gap-4">
              <div>
                <p className="font-black text-white text-base">Comece com 100 boletas grátis</p>
                <p className="text-white/50 text-xs mt-1">Crie sua conta e comece a jogar agora.</p>
              </div>
              <Link href="/register" className="flex items-center gap-2 bg-accent text-brand font-bold text-sm px-5 py-2.5 hover:bg-accent-dark transition-colors shrink-0">
                Criar conta <ChevronRight size={14} />
              </Link>
            </div>
          )}

        </div>
      </div>
    </PageLayout>
  )
}
