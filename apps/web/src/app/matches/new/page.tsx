'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/auth-context'
import { createMatch } from '@/lib/api/matches'
import { getPlayers } from '@/lib/api/players'
import { Player, Sport } from '@rank-app/shared'

// Inline rewards — avoids module-level SSR evaluation issues
const MATCH_REGISTER_REWARD = 5   // BOLETAS_REWARDS.MATCH_REGISTER
const MATCH_CONFIRM_REWARD  = 10  // BOLETAS_REWARDS.MATCH_CONFIRM
const MATCH_WIN_REWARD      = 20  // BOLETAS_REWARDS.MATCH_WIN
import { PageLayout } from '@/components/layout/page-layout'
import { SPORT_OPTIONS } from '@/lib/sports'
import { ArrowLeft, Calendar, Coins, Trophy, CheckCircle, Swords } from 'lucide-react'

const inputCls = 'w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-brand transition-colors bg-white'
const labelCls = 'block text-sm text-gray-500 mb-1.5'

function NewMatchForm() {
  const { player, token, isAuthenticated } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const scheduleId = searchParams.get('scheduleId') ?? undefined

  const [players, setPlayers] = useState<Player[]>([])
  const [form, setForm] = useState({
    sport: Sport.TENNIS,
    opponentId: '',
    winnerId: '',
    score: '',
    date: new Date().toISOString().split('T')[0],
  })
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return }
    if (player?.sport) setForm((f) => ({ ...f, sport: player.sport as Sport }))
    getPlayers({ sport: player?.sport as Sport | undefined, limit: 100 }).then((r) =>
      setPlayers(r.data.filter((p) => p._id !== player?._id)),
    )
  }, [isAuthenticated, player, router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!token) return
    setError('')
    setLoading(true)
    try {
      await createMatch(token, { ...form, ...(scheduleId && { scheduledMatchId: scheduleId }) })
      router.push(scheduleId ? `/schedule/${scheduleId}` : '/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao registrar partida')
    } finally {
      setLoading(false)
    }
  }

  const opponentSelected = players.find((p) => p._id === form.opponentId)

  return (
    <PageLayout>
      <main className="max-w-xl mx-auto px-6 py-8">

        <Link
          href={scheduleId ? `/schedule/${scheduleId}` : '/dashboard'}
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-brand transition-colors mb-6"
        >
          <ArrowLeft size={14} /> Voltar
        </Link>

        <div className="mb-6">
          <p className="text-xs text-gray-400 mb-1">Resultado</p>
          <h1 className="text-xl font-bold text-gray-900">Registrar partida</h1>
          {scheduleId && (
            <div className="flex items-center gap-2 mt-2 text-xs text-accent font-medium">
              <Calendar size={12} /> Vinculado a um agendamento
            </div>
          )}
        </div>

        {/* ── Boletas incentive ── */}
        <div className="bg-brand/5 border border-brand/10 rounded-xl px-4 py-3.5 mb-4">
          <p className="text-xs font-bold text-brand/70 uppercase tracking-wide mb-2.5 flex items-center gap-1.5">
            <Coins size={12} /> Boletas que você pode ganhar
          </p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { icon: Swords,       label: 'Registrar',  value: `+${MATCH_REGISTER_REWARD}`, cls: 'text-brand' },
              { icon: CheckCircle,  label: 'Confirmada', value: `+${MATCH_CONFIRM_REWARD}`,  cls: 'text-accent' },
              { icon: Trophy,       label: 'Vencer',     value: `+${MATCH_WIN_REWARD}`,      cls: 'text-yellow-500' },
            ].map(({ icon: Icon, label, value, cls }) => (
              <div key={label} className="flex flex-col items-center gap-1 bg-white border border-brand/10 rounded-lg py-2.5">
                <Icon size={14} className={cls} />
                <span className={`text-base font-black ${cls}`}>{value}</span>
                <span className="text-[10px] text-gray-400">{label}</span>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-brand/50 mt-2.5 leading-relaxed">
            +{MATCH_REGISTER_REWARD} ao registrar · +{MATCH_CONFIRM_REWARD} quando o adversário confirmar · +{MATCH_WIN_REWARD} se você vencer
          </p>
        </div>

        <div className="border border-gray-100 rounded-xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Sport restriction note */}
            {player?.sport && (
              <div className="bg-brand/5 border border-brand/10 rounded-lg px-4 py-3 text-xs text-brand/70">
                Você só pode registrar partidas de{' '}
                <strong>
                  {SPORT_OPTIONS.find(o => o.value === player.sport)?.label ?? player.sport}
                </strong>
                , conforme seu esporte cadastrado.
              </div>
            )}

            <div>
              <label className={labelCls}>Esporte</label>
              <select
                required
                value={form.sport}
                disabled={!!player?.sport}
                onChange={(e) => setForm((f) => ({ ...f, sport: e.target.value as Sport }))}
                className={`${inputCls} ${player?.sport ? 'opacity-60 cursor-not-allowed bg-gray-50' : ''}`}
              >
                {SPORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelCls}>Adversário <span className="text-red-400">*</span></label>
              <select
                required
                value={form.opponentId}
                onChange={(e) => setForm((f) => ({ ...f, opponentId: e.target.value, winnerId: '' }))}
                className={inputCls}
              >
                <option value="">Selecionar adversário...</option>
                {players.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} ({p.city}) — Rating {p.elo}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelCls}>Vencedor <span className="text-red-400">*</span></label>
              <select
                required
                value={form.winnerId}
                onChange={(e) => setForm((f) => ({ ...f, winnerId: e.target.value }))}
                disabled={!form.opponentId}
                className={`${inputCls} disabled:bg-gray-50 disabled:text-gray-300`}
              >
                <option value="">Selecionar vencedor...</option>
                {player && <option value={player._id}>{player.name} (Eu)</option>}
                {opponentSelected && (
                  <option value={opponentSelected._id}>{opponentSelected.name}</option>
                )}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>
                  Placar <span className="text-gray-300">(ex: 6-3 6-4)</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="6-3 6-4"
                  value={form.score}
                  onChange={(e) => setForm((f) => ({ ...f, score: e.target.value }))}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Data da partida</label>
                <input
                  type="date"
                  required
                  value={form.date}
                  max={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                  className={inputCls}
                />
              </div>
            </div>

            {error && (
              <p className="text-red-500 text-sm bg-red-50 rounded-lg px-3 py-2">{error}</p>
            )}

            <div className="flex gap-3 pt-1">
              <Link
                href={scheduleId ? `/schedule/${scheduleId}` : '/dashboard'}
                className="flex-1 border border-gray-200 text-gray-500 text-sm font-medium py-2.5 rounded-lg text-center hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-brand text-white text-sm font-medium py-2.5 rounded-lg hover:bg-brand-dark disabled:opacity-50 transition-colors"
              >
                {loading ? 'Registrando...' : 'Registrar resultado'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </PageLayout>
  )
}

export default function NewMatchPage() {
  return (
    <Suspense fallback={
      <PageLayout>
        <div className="max-w-xl mx-auto px-6 py-8 text-center">
          <p className="text-gray-300 text-sm">Carregando...</p>
        </div>
      </PageLayout>
    }>
      <NewMatchForm />
    </Suspense>
  )
}
