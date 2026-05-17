'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/auth-context'
import { createPurchase, getMyPurchases, cancelPurchase } from '@/lib/api/boletas-purchases'
import type { BoletasPackage, BoletasPurchase } from '@rank-app/shared'
import { PageLayout } from '@/components/layout/page-layout'
import {
  Coins, UserPlus, Swords, CheckCircle2, Trophy, TrendingUp, TrendingDown,
  AlertCircle, Ban, RefreshCcw, XCircle, CalendarX, ShieldAlert,
  Banknote, Copy, CheckCheck, Check, X, Sparkles, ChevronRight, Plus, Zap,
} from 'lucide-react'

const TEAL   = '#00BFA5'
const SURF   = '#161B22'
const BORDER = '#30363D'
const MUTED  = '#8B949E'

const PIX_KEY     = '11137332000139'
const PIX_BANK    = 'SICREDI'
const PIX_COMPANY = 'Empresa Jornalística Dia a Dia Ltda.'

const HOW_TO_EARN = [
  { icon: UserPlus,     label: 'Cadastro',                    amount: '+100', once: true },
  { icon: Swords,       label: 'Registrar partida',            amount: '+5'              },
  { icon: CheckCircle2, label: 'Confirmar partida adversário', amount: '+10'             },
  { icon: Trophy,       label: 'Vencer partida',               amount: '+20'             },
]

const HOW_TO_LOSE = [
  { icon: XCircle,     label: 'Cancelamento',           amount: '−15',  extra: ''            },
  { icon: CalendarX,   label: 'Não registrar resultado', amount: '−10',  extra: ''            },
  { icon: ShieldAlert, label: 'Resultado falso',          amount: '−50',  extra: '+ suspensão' },
]

const PACKAGES: { key: BoletasPackage; boletas: number; price: number; highlight?: boolean }[] = [
  { key: 'PACK_100'  as BoletasPackage, boletas: 100,  price: 10               },
  { key: 'PACK_600'  as BoletasPackage, boletas: 600,  price: 50, highlight: true },
  { key: 'PACK_1500' as BoletasPackage, boletas: 1500, price: 100              },
]

const STATUS_CFG: Record<string, { label: string; color: string }> = {
  PENDING:  { label: 'Aguardando', color: '#F59E0B' },
  APPROVED: { label: 'Aprovada',   color: TEAL      },
  REJECTED: { label: 'Rejeitada',  color: '#F87171' },
}

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
    setSelected(pkg); setSubmitError(''); setShowModal(true)
  }

  const selectedPkg = selected ? PACKAGES.find(p => p.key === selected) : null

  const totalGanho  = purchases.filter(p => p.status === 'APPROVED').reduce((a, p) => a + p.boletas, 0)
  const totalPerdido = 0

  return (
    <PageLayout>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#0D1117', minHeight: '100vh', padding: '32px 40px' }}>

        {/* ── Title ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: `${TEAL}20`, border: `2px solid ${TEAL}40`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Coins size={24} style={{ color: TEAL }} />
          </div>
          <h1 style={{ fontSize: 42, fontWeight: 900, color: '#E6EDF3', margin: 0, letterSpacing: '-0.02em' }}>
            Boletas
          </h1>
        </div>

        {/* ── Balance hero ── */}
        <div style={{
          background: 'linear-gradient(135deg, #0D2B2A 0%, #0F2020 45%, #0D1117 100%)',
          border: `1px solid ${TEAL}25`,
          borderRadius: 16, padding: '28px 32px', marginBottom: 28,
          display: 'flex', alignItems: 'center', gap: 32,
        }}>
          {/* Left: icon + balance */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, flex: 1 }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: `${TEAL}15`, border: `2px solid ${TEAL}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Coins size={34} style={{ color: TEAL }} />
            </div>
            <div>
              <p style={{ fontSize: 13, color: MUTED, fontWeight: 600, margin: '0 0 4px', letterSpacing: '0.04em' }}>
                Seu Saldo Atual
              </p>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
                <p style={{ fontSize: 56, fontWeight: 900, color: '#E6EDF3', lineHeight: 1, margin: 0 }}>
                  {isAuthenticated ? (player?.boletas ?? 0).toLocaleString('pt-BR') : '—'}
                </p>
                <p style={{ fontSize: 16, color: MUTED, marginBottom: 6, fontWeight: 500 }}>boletas</p>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div style={{ width: 1, height: 70, background: `${TEAL}20`, flexShrink: 0 }} />

          {/* Right: stats */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#22C55E20', border: '1px solid #22C55E30', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TrendingUp size={18} style={{ color: '#22C55E' }} />
              </div>
              <div>
                <p style={{ fontSize: 12, color: MUTED, margin: '0 0 2px' }}>Total Ganho:</p>
                <p style={{ fontSize: 22, fontWeight: 900, color: '#22C55E', margin: 0 }}>
                  +{totalGanho.toLocaleString('pt-BR')}
                </p>
              </div>
            </div>
            <div style={{ width: '100%', height: 1, background: BORDER }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#F8717120', border: '1px solid #F8717130', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TrendingDown size={18} style={{ color: '#F87171' }} />
              </div>
              <div>
                <p style={{ fontSize: 12, color: MUTED, margin: '0 0 2px' }}>Total Perdido:</p>
                <p style={{ fontSize: 22, fontWeight: 900, color: '#F87171', margin: 0 }}>
                  -{totalPerdido.toLocaleString('pt-BR')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Buy boletas (if authenticated) ── */}
        {isAuthenticated && (
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <Zap size={14} style={{ color: TEAL }} />
              <p style={{ fontSize: 14, fontWeight: 700, color: '#E6EDF3', margin: 0 }}>Comprar Boletas</p>
              <p style={{ fontSize: 12, color: MUTED, margin: 0 }}>via PIX · confirmação em até 24h</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              {PACKAGES.map(pkg => (
                <button key={pkg.key} onClick={() => openModal(pkg.key)} style={{
                  position: 'relative', display: 'flex', alignItems: 'center', gap: 14,
                  background: SURF, border: `1px solid ${pkg.highlight ? TEAL + '50' : BORDER}`,
                  borderRadius: 12, padding: '16px 18px', cursor: 'pointer', textAlign: 'left',
                  boxShadow: pkg.highlight ? `0 0 0 1px ${TEAL}20` : 'none',
                }}>
                  {pkg.highlight && (
                    <span style={{ position: 'absolute', top: -10, right: 12, background: TEAL, color: '#0D1117', fontSize: 9, fontWeight: 900, padding: '2px 8px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Sparkles size={8} /> POPULAR
                    </span>
                  )}
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: pkg.highlight ? `${TEAL}15` : '#ffffff0a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Coins size={20} style={{ color: pkg.highlight ? TEAL : '#F59E0B' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 20, fontWeight: 900, color: '#E6EDF3', margin: '0 0 2px', lineHeight: 1 }}>
                      {pkg.boletas.toLocaleString('pt-BR')}
                      <span style={{ fontSize: 12, fontWeight: 400, color: MUTED, marginLeft: 6 }}>boletas</span>
                    </p>
                    <p style={{ fontSize: 15, fontWeight: 900, color: pkg.highlight ? TEAL : '#00BFA5', margin: 0 }}>
                      R$ {pkg.price},00
                    </p>
                  </div>
                  <Plus size={14} style={{ color: MUTED, flexShrink: 0 }} />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Two columns ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, marginBottom: 20 }}>

          {/* LEFT: Transaction history */}
          <div style={{ background: SURF, border: `1px solid ${BORDER}`, borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '16px 20px', borderBottom: `1px solid ${BORDER}` }}>
              <TrendingUp size={14} style={{ color: TEAL }} />
              <p style={{ fontSize: 15, fontWeight: 700, color: '#E6EDF3', margin: 0 }}>Histórico de Transações</p>
            </div>

            {!isAuthenticated ? (
              <div style={{ padding: '48px 20px', textAlign: 'center' }}>
                <Coins size={28} style={{ color: BORDER, margin: '0 auto 12px', display: 'block' }} />
                <p style={{ color: MUTED, fontSize: 13, margin: '0 0 12px' }}>Entre para ver seu histórico</p>
                <Link href="/login" style={{ color: TEAL, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>Fazer login →</Link>
              </div>
            ) : histLoading ? (
              <div style={{ padding: '48px 20px', textAlign: 'center' }}>
                <p style={{ color: MUTED, fontSize: 13 }}>Carregando...</p>
              </div>
            ) : purchases.length === 0 ? (
              <div style={{ padding: '48px 20px', textAlign: 'center' }}>
                <Coins size={28} style={{ color: BORDER, margin: '0 auto 12px', display: 'block' }} />
                <p style={{ color: MUTED, fontSize: 13, margin: '0 0 4px' }}>Nenhuma transação ainda</p>
                <p style={{ color: '#4A5A6A', fontSize: 12, margin: 0 }}>Jogue partidas para ganhar boletas!</p>
              </div>
            ) : (
              <div style={{ maxHeight: 360, overflowY: 'auto' }}>
                {/* Header row */}
                <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr 80px', padding: '10px 20px', borderBottom: `1px solid ${BORDER}`, background: '#0D1117' }}>
                  {['Data', 'Descrição', 'Boletas'].map(h => (
                    <span key={h} style={{ fontSize: 11, fontWeight: 700, color: '#4A5A6A', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{h}</span>
                  ))}
                </div>
                {purchases.map(p => {
                  const s = STATUS_CFG[p.status] ?? STATUS_CFG.PENDING
                  const isApproved = p.status === 'APPROVED'
                  return (
                    <div key={p._id} style={{ display: 'grid', gridTemplateColumns: '110px 1fr 80px', alignItems: 'center', padding: '13px 20px', borderBottom: `1px solid ${BORDER}` }}>
                      <span style={{ fontSize: 13, color: MUTED }}>
                        {new Date(p.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </span>
                      <div>
                        <span style={{ fontSize: 13, color: '#E6EDF3', fontWeight: 500 }}>Compra de boletas</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                          <div style={{ width: 5, height: 5, borderRadius: '50%', background: s.color }} />
                          <span style={{ fontSize: 11, color: s.color, fontWeight: 600 }}>{s.label}</span>
                          {p.status === 'PENDING' && (
                            <button onClick={() => handleCancel(p._id)} disabled={cancelling === p._id}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: MUTED, padding: '0 0 0 4px', display: 'flex' }}>
                              <X size={11} />
                            </button>
                          )}
                        </div>
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 900, color: isApproved ? TEAL : MUTED, textAlign: 'right' }}>
                        {isApproved ? '+' : ''}{p.boletas.toLocaleString('pt-BR')}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* RIGHT: Como Ganhar + Como Perder */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Como Ganhar */}
            <div style={{ background: SURF, border: `1px solid ${BORDER}`, borderRadius: 12, overflow: 'hidden', flex: 1 }}>
              <p style={{ fontSize: 15, fontWeight: 700, color: '#E6EDF3', margin: 0, padding: '14px 18px', borderBottom: `1px solid ${BORDER}` }}>
                Como Ganhar Boletas
              </p>
              {/* column headers */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 64px', padding: '8px 18px', background: '#0D1117', borderBottom: `1px solid ${BORDER}` }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#4A5A6A', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Ação</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#4A5A6A', letterSpacing: '0.06em', textTransform: 'uppercase', textAlign: 'right' }}>Boletas</span>
              </div>
              {HOW_TO_EARN.map(r => {
                const Icon = r.icon
                return (
                  <div key={r.label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 18px', borderBottom: `1px solid ${BORDER}` }}>
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: `${TEAL}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={13} style={{ color: TEAL }} />
                    </div>
                    <span style={{ flex: 1, fontSize: 13, color: '#C9D1D9' }}>{r.label}</span>
                    <span style={{ fontSize: 14, fontWeight: 900, color: TEAL, minWidth: 44, textAlign: 'right' }}>{r.amount}</span>
                  </div>
                )
              })}
            </div>

            {/* Como Perder */}
            <div style={{ background: SURF, border: `1px solid ${BORDER}`, borderRadius: 12, overflow: 'hidden' }}>
              <p style={{ fontSize: 15, fontWeight: 700, color: '#E6EDF3', margin: 0, padding: '14px 18px', borderBottom: `1px solid ${BORDER}` }}>
                Como Perder Boletas
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 64px', padding: '8px 18px', background: '#0D1117', borderBottom: `1px solid ${BORDER}` }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#4A5A6A', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Ação</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#4A5A6A', letterSpacing: '0.06em', textTransform: 'uppercase', textAlign: 'right' }}>Boletas</span>
              </div>
              {HOW_TO_LOSE.map(r => {
                const Icon = r.icon
                return (
                  <div key={r.label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 18px', borderBottom: `1px solid ${BORDER}` }}>
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: '#F8717118', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={13} style={{ color: '#F87171' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: 13, color: '#C9D1D9', display: 'block' }}>{r.label}</span>
                      {r.extra && <span style={{ fontSize: 11, color: '#F87171', fontWeight: 600 }}>{r.extra}</span>}
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 900, color: '#F87171', minWidth: 44, textAlign: 'right' }}>{r.amount}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* ── CTA ── */}
        <div style={{ background: SURF, border: `1px solid ${TEAL}30`, borderRadius: 12, padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          {isAuthenticated ? (
            <>
              <div>
                <p style={{ fontSize: 15, fontWeight: 900, color: '#E6EDF3', margin: '0 0 3px' }}>Pronto para apostar?</p>
                <p style={{ fontSize: 12, color: MUTED, margin: 0 }}>
                  Você tem <span style={{ color: TEAL, fontWeight: 700 }}>{(player?.boletas ?? 0).toLocaleString('pt-BR')} boletas</span> disponíveis.
                </p>
              </div>
              <Link href="/schedule" style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: TEAL, color: '#0D1117', fontSize: 13, fontWeight: 700,
                padding: '10px 18px', borderRadius: 10, textDecoration: 'none', flexShrink: 0,
              }}>
                Ver partidas <ChevronRight size={14} />
              </Link>
            </>
          ) : (
            <>
              <div>
                <p style={{ fontSize: 15, fontWeight: 900, color: '#E6EDF3', margin: '0 0 3px' }}>Comece com 100 boletas grátis</p>
                <p style={{ fontSize: 12, color: MUTED, margin: 0 }}>Crie sua conta e comece a jogar agora.</p>
              </div>
              <Link href="/register" style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: TEAL, color: '#0D1117', fontSize: 13, fontWeight: 700,
                padding: '10px 18px', borderRadius: 10, textDecoration: 'none', flexShrink: 0,
              }}>
                Criar conta <ChevronRight size={14} />
              </Link>
            </>
          )}
        </div>
      </div>

      {/* ── PIX Purchase Modal ── */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px', backdropFilter: 'blur(4px)' }}>
          <div style={{ background: SURF, border: `1px solid ${BORDER}`, width: '100%', maxWidth: 440, borderRadius: 16, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
            {/* Modal header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: `1px solid ${BORDER}` }}>
              <h2 style={{ fontSize: 15, fontWeight: 900, color: '#E6EDF3', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Coins size={16} style={{ color: TEAL }} /> Comprar Boletas
              </h2>
              <button onClick={() => { setShowModal(false); setSelected(null); setSubmitError('') }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: MUTED, display: 'flex', padding: 4 }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
              {submitted ? (
                <div style={{ textAlign: 'center', padding: '16px 0' }}>
                  <div style={{ width: 56, height: 56, borderRadius: '50%', background: `${TEAL}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <Check size={26} style={{ color: TEAL }} />
                  </div>
                  <p style={{ fontSize: 18, fontWeight: 900, color: '#E6EDF3', margin: '0 0 8px' }}>Solicitação registrada!</p>
                  <p style={{ fontSize: 13, color: MUTED, margin: '0 0 20px' }}>
                    Confirmamos seu pagamento e creditamos as boletas em até 24h.
                  </p>
                  <button onClick={() => { setSubmitted(false); setShowModal(false) }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: TEAL, fontSize: 13, fontWeight: 600 }}>
                    Fechar
                  </button>
                </div>
              ) : (
                <>
                  {/* Package selector */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                    {PACKAGES.map(pkg => (
                      <button key={pkg.key} onClick={() => setSelected(pkg.key)}
                        style={{
                          position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                          background: selected === pkg.key ? `${TEAL}15` : '#0D1117',
                          border: `1px solid ${selected === pkg.key ? TEAL : BORDER}`,
                          borderRadius: 12, padding: '14px 10px', cursor: 'pointer',
                          outline: pkg.highlight ? `1px solid ${TEAL}30` : 'none',
                        }}>
                        {pkg.highlight && (
                          <span style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', background: TEAL, color: '#0D1117', fontSize: 9, fontWeight: 900, padding: '2px 8px', borderRadius: 20, whiteSpace: 'nowrap' }}>
                            POPULAR
                          </span>
                        )}
                        <Coins size={16} style={{ color: '#F59E0B' }} />
                        <p style={{ fontSize: 18, fontWeight: 900, color: '#E6EDF3', margin: 0 }}>{pkg.boletas.toLocaleString('pt-BR')}</p>
                        <p style={{ fontSize: 10, color: MUTED, margin: 0 }}>boletas</p>
                        <p style={{ fontSize: 14, fontWeight: 900, color: TEAL, margin: 0 }}>R$ {pkg.price},00</p>
                        {selected === pkg.key && (
                          <div style={{ position: 'absolute', top: 8, right: 8, width: 16, height: 16, borderRadius: '50%', background: TEAL, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Check size={9} style={{ color: '#0D1117' }} />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* PIX details */}
                  {selected && selectedPkg && (
                    <div style={{ background: '#0D1117', border: `1px solid ${BORDER}`, borderRadius: 12, overflow: 'hidden' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', background: '#0a2e1a', borderBottom: '1px solid #22C55E20' }}>
                        <Banknote size={13} style={{ color: '#22C55E' }} />
                        <p style={{ fontSize: 13, fontWeight: 700, color: '#86EFAC', margin: 0 }}>
                          Pague R$ {selectedPkg.price},00 via PIX
                        </p>
                      </div>
                      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div>
                          <p style={{ fontSize: 10, fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 6px' }}>Chave PIX</p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#ffffff08', border: `1px solid ${BORDER}`, borderRadius: 8, padding: '10px 12px' }}>
                            <p style={{ flex: 1, fontFamily: 'monospace', fontSize: 13, fontWeight: 700, color: '#E6EDF3', margin: 0 }}>{PIX_KEY}</p>
                            <button onClick={handleCopyPix}
                              style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, padding: '5px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', background: copiedPix ? TEAL : `${TEAL}25`, color: copiedPix ? '#0D1117' : TEAL, transition: 'all .2s' }}>
                              {copiedPix ? <><CheckCheck size={11} /> Copiado!</> : <><Copy size={11} /> Copiar</>}
                            </button>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 24 }}>
                          <div>
                            <p style={{ fontSize: 10, fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 3px' }}>Banco</p>
                            <p style={{ fontSize: 12, color: '#C9D1D9', margin: 0, fontWeight: 600 }}>{PIX_BANK}</p>
                          </div>
                          <div>
                            <p style={{ fontSize: 10, fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 3px' }}>Favorecido</p>
                            <p style={{ fontSize: 12, color: '#C9D1D9', margin: 0, fontWeight: 600, lineHeight: 1.3 }}>{PIX_COMPANY}</p>
                          </div>
                        </div>
                        <input
                          type="text"
                          placeholder="ID do comprovante PIX (opcional)"
                          value={txRef}
                          onChange={e => setTxRef(e.target.value)}
                          style={{ width: '100%', background: '#ffffff06', border: `1px solid ${BORDER}`, borderRadius: 8, padding: '10px 12px', fontSize: 13, color: '#E6EDF3', outline: 'none', boxSizing: 'border-box' }}
                        />
                        {submitError && (
                          <p style={{ fontSize: 12, color: '#F87171', background: '#F8717115', border: '1px solid #F8717130', borderRadius: 8, padding: '10px 12px', margin: 0 }}>
                            {submitError}
                          </p>
                        )}
                        <button onClick={handleSubmit} disabled={submitting}
                          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: TEAL, color: '#0D1117', fontSize: 13, fontWeight: 700, padding: '12px', borderRadius: 10, border: 'none', cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.6 : 1 }}>
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
