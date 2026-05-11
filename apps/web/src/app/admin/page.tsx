'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { getMatches, adminResolve } from '@/lib/api/matches'
import { getReports, resolveReport } from '@/lib/api/reports'
import { adminGetPurchases, adminResolvePurchase } from '@/lib/api/boletas-purchases'
import type {
  Match, Report, BoletasPurchase, BoletasPurchaseStatus,
} from '@rank-app/shared'
import { MatchStatus, ReportStatus, SystemRole } from '@rank-app/shared'

const PKG_INFO: Record<string, { price: number; boletas: number }> = {
  PACK_100:  { boletas: 100,  price: 10 },
  PACK_600:  { boletas: 600,  price: 50 },
  PACK_1500: { boletas: 1500, price: 100 },
}
import { PageLayout } from '@/components/layout/page-layout'
import { AlertTriangle, Flag, ShieldAlert, CheckCircle2, XCircle, Ban, Coins, CheckCheck } from 'lucide-react'

const CATEGORY_LABEL: Record<string, string> = {
  FAKE_RESULT: 'Resultado falso',
  BAD_CONDUCT: 'Má conduta desportiva',
}

const CATEGORY_CLS: Record<string, string> = {
  FAKE_RESULT: 'text-red-500 bg-red-50 border-red-100',
  BAD_CONDUCT: 'text-orange-500 bg-orange-50 border-orange-100',
}

const PACKAGE_LABEL: Record<string, string> = {
  PACK_100:  '100 boletas — R$ 10,00',
  PACK_600:  '600 boletas — R$ 50,00',
  PACK_1500: '1500 boletas — R$ 100,00',
}

export default function AdminPage() {
  const { player, token, isAuthenticated } = useAuth()
  const router = useRouter()
  const [disputes, setDisputes]     = useState<Match[]>([])
  const [reports, setReports]       = useState<Report[]>([])
  const [purchases, setPurchases]   = useState<BoletasPurchase[]>([])
  const [loading, setLoading]       = useState(true)
  const [activeTab, setActiveTab]   = useState<'disputes' | 'reports' | 'pix'>('disputes')
  const [resolveNotes, setResolveNotes]       = useState<Record<string, string>>({})
  const [purchaseNotes, setPurchaseNotes]     = useState<Record<string, string>>({})
  const [resolvingPurchase, setResolvingPurchase] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return }
    if (player && player.role !== SystemRole.ADMIN) { router.push('/'); return }

    Promise.all([
      getMatches({ status: MatchStatus.DISPUTED, limit: 50 }),
      token ? getReports(token, 'PENDING' as ReportStatus) : Promise.resolve([]),
      token ? adminGetPurchases(token, 'PENDING' as BoletasPurchaseStatus) : Promise.resolve([]),
    ])
      .then(([d, r, p]) => { setDisputes(d.data); setReports(r); setPurchases(p) })
      .finally(() => setLoading(false))
  }, [isAuthenticated, player, router, token])

  async function handleResolveDispute(matchId: string, winnerId: string) {
    if (!token) return
    await adminResolve(token, matchId, winnerId)
    setDisputes((prev) => prev.filter((m) => m._id !== matchId))
  }

  async function handleReport(reportId: string, status: 'ACTED' | 'DISMISSED') {
    if (!token) return
    const notes = resolveNotes[reportId]
    await resolveReport(token, reportId, { status: status as ReportStatus, adminNotes: notes })
    setReports((prev) => prev.filter((r) => r._id !== reportId))
  }

  async function handlePurchase(
    purchaseId: string,
    status: 'APPROVED' | 'REJECTED',
  ) {
    if (!token) return
    setResolvingPurchase((prev) => ({ ...prev, [purchaseId]: true }))
    try {
      await adminResolvePurchase(token, purchaseId, {
        status: status as unknown as BoletasPurchaseStatus,
        adminNotes: purchaseNotes[purchaseId],
      })
      setPurchases((prev) => prev.filter((p) => p._id !== purchaseId))
    } finally {
      setResolvingPurchase((prev) => ({ ...prev, [purchaseId]: false }))
    }
  }

  const tabCls = (active: boolean) =>
    `px-5 py-3 text-sm font-bold border-b-2 transition-colors ${
      active ? 'border-brand text-brand' : 'border-transparent text-gray-400 hover:text-gray-600'
    }`

  return (
    <PageLayout>
      <main className="max-w-3xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <ShieldAlert size={20} className="text-brand" />
          <h1 className="text-xl font-black text-gray-900">Painel do Administrador</h1>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 mb-6">
          <button className={tabCls(activeTab === 'disputes')} onClick={() => setActiveTab('disputes')}>
            <span className="flex items-center gap-2">
              <AlertTriangle size={13} />
              Disputas
              {disputes.length > 0 && (
                <span className="bg-red-400 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                  {disputes.length}
                </span>
              )}
            </span>
          </button>
          <button className={tabCls(activeTab === 'reports')} onClick={() => setActiveTab('reports')}>
            <span className="flex items-center gap-2">
              <Flag size={13} />
              Denúncias
              {reports.length > 0 && (
                <span className="bg-orange-400 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                  {reports.length}
                </span>
              )}
            </span>
          </button>
          <button className={tabCls(activeTab === 'pix')} onClick={() => setActiveTab('pix')}>
            <span className="flex items-center gap-2">
              <Coins size={13} />
              Compras PIX
              {purchases.length > 0 && (
                <span className="bg-green-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                  {purchases.length}
                </span>
              )}
            </span>
          </button>
        </div>

        {loading ? (
          <div className="py-16 text-center">
            <div className="w-6 h-6 border-2 border-brand/20 border-t-brand rounded-full animate-spin mx-auto" />
          </div>
        ) : (
          <>
            {/* ── Disputas ── */}
            {activeTab === 'disputes' && (
              disputes.length === 0 ? (
                <div className="text-center py-16 text-gray-300">
                  <CheckCircle2 size={40} className="mx-auto mb-3" />
                  <p className="text-sm">Nenhuma disputa pendente</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {disputes.map((m) => {
                    const p1 = typeof m.player1 === 'object' ? m.player1 : null
                    const p2 = typeof m.player2 === 'object' ? m.player2 : null
                    const disputedBy = typeof m.disputedBy === 'object' ? m.disputedBy : null
                    return (
                      <div key={m._id} className="bg-white border border-red-100 p-5">
                        <div className="flex items-center justify-between mb-3">
                          <p className="font-bold text-gray-900">
                            {p1?.name ?? '—'} <span className="text-gray-300">vs</span> {p2?.name ?? '—'}
                          </p>
                          <span className="text-sm font-bold text-gray-500">{m.score}</span>
                        </div>
                        <p className="text-xs text-gray-500 mb-1">
                          <span className="font-bold">Disputado por:</span> {disputedBy?.name ?? '—'}
                        </p>
                        <p className="text-sm text-red-600 bg-red-50 border border-red-100 px-3 py-2 mb-4 text-xs">
                          {m.disputeReason}
                        </p>
                        <p className="text-xs text-gray-500 mb-3 font-bold">Definir vencedor correto:</p>
                        <div className="flex gap-3">
                          {p1 && (
                            <button onClick={() => handleResolveDispute(m._id, p1._id)}
                              className="flex-1 border border-brand text-brand py-2.5 text-sm font-bold hover:bg-brand hover:text-white transition-colors">
                              {p1.name}
                            </button>
                          )}
                          {p2 && (
                            <button onClick={() => handleResolveDispute(m._id, p2._id)}
                              className="flex-1 border border-brand text-brand py-2.5 text-sm font-bold hover:bg-brand hover:text-white transition-colors">
                              {p2.name}
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            )}

            {/* ── Compras PIX ── */}
            {activeTab === 'pix' && (
              purchases.length === 0 ? (
                <div className="text-center py-16 text-gray-300">
                  <CheckCircle2 size={40} className="mx-auto mb-3" />
                  <p className="text-sm">Nenhuma compra pendente</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {purchases.map((p) => {
                    const playerObj = typeof p.player === 'object' ? p.player : null
                    const isResolving = resolvingPurchase[p._id]
                    const pkg = PKG_INFO[p.package as string]
                    return (
                      <div key={p._id} className="bg-white border border-green-100 p-5">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="font-black text-gray-900">{playerObj?.name ?? '—'}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{playerObj?.email ?? ''}</p>
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-widest bg-green-50 text-green-700 border border-green-200 px-2.5 py-1">
                            PENDENTE
                          </span>
                        </div>

                        {/* Package info */}
                        <div className="bg-gray-50 border border-gray-100 px-4 py-3 mb-4 flex items-center justify-between">
                          <div>
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-0.5">Pacote</p>
                            <p className="font-black text-gray-900 text-sm">
                              {PACKAGE_LABEL[p.package] ?? p.package}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-0.5">Valor</p>
                            <p className="font-black text-brand text-lg">
                              R$ {pkg ? pkg.price.toFixed(2).replace('.', ',') : '—'}
                            </p>
                          </div>
                        </div>

                        {/* Transaction ref */}
                        {p.transactionRef && (
                          <div className="mb-4">
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">
                              Ref. da transação / comprovante
                            </p>
                            <p className="text-sm text-gray-700 bg-blue-50 border border-blue-100 px-3 py-2 font-mono break-all">
                              {p.transactionRef}
                            </p>
                          </div>
                        )}

                        {/* Date */}
                        <p className="text-xs text-gray-400 mb-4">
                          Solicitado em{' '}
                          {new Date(p.createdAt).toLocaleString('pt-BR', {
                            day: '2-digit', month: '2-digit', year: 'numeric',
                            hour: '2-digit', minute: '2-digit',
                          })}
                        </p>

                        {/* Admin notes */}
                        <textarea
                          placeholder="Notas do admin (opcional)..."
                          rows={2}
                          value={purchaseNotes[p._id] ?? ''}
                          onChange={(e) => setPurchaseNotes((prev) => ({ ...prev, [p._id]: e.target.value }))}
                          className="w-full border border-gray-200 px-3 py-2 text-xs text-gray-700 focus:outline-none focus:border-brand transition-colors mb-3 resize-none"
                        />

                        {/* Actions */}
                        <div className="flex gap-3">
                          <button
                            onClick={() => handlePurchase(p._id, 'APPROVED')}
                            disabled={isResolving}
                            className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white text-xs font-black py-3 hover:bg-green-700 transition-colors disabled:opacity-50"
                          >
                            <CheckCheck size={13} />
                            Aprovar — creditar {pkg?.boletas ?? p.boletas} boletas
                          </button>
                          <button
                            onClick={() => handlePurchase(p._id, 'REJECTED')}
                            disabled={isResolving}
                            className="flex items-center justify-center gap-2 border border-gray-200 text-gray-500 text-xs font-medium px-4 py-3 hover:border-gray-400 transition-colors disabled:opacity-50"
                          >
                            <XCircle size={12} /> Rejeitar
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            )}

            {/* ── Denúncias ── */}
            {activeTab === 'reports' && (
              reports.length === 0 ? (
                <div className="text-center py-16 text-gray-300">
                  <CheckCircle2 size={40} className="mx-auto mb-3" />
                  <p className="text-sm">Nenhuma denúncia pendente</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reports.map((r) => {
                    const reporter = typeof r.reporter === 'object' ? r.reporter : null
                    const reported = typeof r.reportedPlayer === 'object' ? r.reportedPlayer : null
                    const catCls = CATEGORY_CLS[r.category]
                    return (
                      <div key={r._id} className="bg-white border border-orange-100 p-5">

                        {/* Categoria */}
                        <div className="flex items-start justify-between mb-3">
                          <span className={`text-[11px] font-black uppercase tracking-widest border px-2.5 py-1 ${catCls}`}>
                            {CATEGORY_LABEL[r.category]}
                          </span>
                          <span className="text-xs text-gray-400">
                            {new Date(r.createdAt).toLocaleDateString('pt-BR')}
                          </span>
                        </div>

                        {/* Partes */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Denunciante</p>
                            <p className="font-bold text-gray-900 text-sm">{reporter?.name ?? '—'}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Denunciado</p>
                            <p className="font-bold text-gray-900 text-sm">{reported?.name ?? '—'}</p>
                            {(reported as { suspensionCount?: number })?.suspensionCount !== undefined && (
                              <p className="text-[10px] text-orange-500 mt-0.5">
                                {(reported as { suspensionCount: number }).suspensionCount} infração(ões) anterior(es)
                                {(reported as { flaggedForBan?: boolean })?.flaggedForBan && (
                                  <span className="ml-1 text-red-500 font-black">⚠ FLAGGED PARA BANIMENTO</span>
                                )}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Motivo */}
                        <p className="text-sm text-gray-700 bg-gray-50 border border-gray-100 px-3 py-2.5 mb-4 leading-relaxed">
                          {r.reason}
                        </p>

                        {/* Notas do admin */}
                        <textarea
                          placeholder="Notas do admin (opcional)..."
                          rows={2}
                          value={resolveNotes[r._id] ?? ''}
                          onChange={(e) => setResolveNotes((prev) => ({ ...prev, [r._id]: e.target.value }))}
                          className="w-full border border-gray-200 px-3 py-2 text-xs text-gray-700 focus:outline-none focus:border-brand transition-colors mb-3 resize-none"
                        />

                        {/* Ações */}
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleReport(r._id, 'ACTED')}
                            className="flex-1 flex items-center justify-center gap-2 bg-red-500 text-white text-xs font-black py-2.5 hover:bg-red-600 transition-colors"
                          >
                            <Ban size={12} /> Agir (−50 bol. + suspensão)
                          </button>
                          <button
                            onClick={() => handleReport(r._id, 'DISMISSED')}
                            className="flex items-center justify-center gap-2 border border-gray-200 text-gray-500 text-xs font-medium px-4 py-2.5 hover:border-gray-400 transition-colors"
                          >
                            <XCircle size={12} /> Rejeitar
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            )}
          </>
        )}
      </main>
    </PageLayout>
  )
}
