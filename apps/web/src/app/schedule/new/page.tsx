'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/auth-context'
import { createSchedule } from '@/lib/api/schedules'
import { GENDER_TYPE_OPTIONS, MATCH_TYPE_OPTIONS, SPORT_OPTIONS, TEAM_SPORTS, defaultMaxPlayers } from '@/lib/sports'
import { GenderType, MatchType, Sport } from '@rank-app/shared'

const SCHEDULE_CREATE_REWARD = 10 // BOLETAS_REWARDS.SCHEDULE_CREATE
import { PageLayout } from '@/components/layout/page-layout'
import { ArrowLeft, Coins, ChevronDown, ChevronUp, Banknote, X } from 'lucide-react'

const inputCls = 'w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-brand transition-colors bg-white'
const labelCls = 'block text-sm text-gray-500 mb-1.5'

const COST_ITEMS = [
  { id: 'locacao',     label: 'Locação do espaço' },
  { id: 'arbitragem',  label: 'Arbitragem' },
  { id: 'catador',     label: 'Catador de bolas' },
  { id: 'iluminacao',  label: 'Iluminação' },
  { id: 'alimentacao', label: 'Alimentação/hidratação' },
  { id: 'outros',      label: 'Outros' },
]

export default function NewSchedulePage() {
  const { token, isAuthenticated, player } = useAuth()
  const router = useRouter()

  const [form, setForm] = useState({
    sport: Sport.TENNIS,
    matchType: MatchType.INDIVIDUAL,
    genderType: GenderType.MIXED,
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    city: player?.city ?? '',
    maxPlayers: 2,
  })

  // Cost-sharing state (optional section)
  const [hasCost, setHasCost]                 = useState(false)
  const [costPerPlayer, setCostPerPlayer]     = useState<string>('')
  const [pixKey, setPixKey]                   = useState('')
  const [selectedItems, setSelectedItems]     = useState<Set<string>>(new Set())
  const [costOtherText, setCostOtherText]     = useState('')
  const [costSectionOpen, setCostSectionOpen] = useState(false)

  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) router.push('/login')
    if (player?.sport) {
      setForm((f) => ({
        ...f,
        sport: player.sport as Sport,
        city: player.city ?? f.city,
        matchType: TEAM_SPORTS.has(player.sport as Sport) ? MatchType.TEAM : MatchType.INDIVIDUAL,
      }))
    }
  }, [isAuthenticated, router, player])

  useEffect(() => {
    setForm((f) => ({ ...f, maxPlayers: defaultMaxPlayers(f.sport, f.matchType) }))
  }, [form.sport, form.matchType])

  function handleSportChange(sport: Sport) {
    setForm((f) => ({
      ...f,
      sport,
      matchType: TEAM_SPORTS.has(sport) ? MatchType.TEAM : MatchType.INDIVIDUAL,
    }))
  }

  function toggleCostItem(id: string) {
    setSelectedItems(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function buildCostDescription(): string {
    const labels = COST_ITEMS
      .filter(i => selectedItems.has(i.id) && i.id !== 'outros')
      .map(i => i.label)
    if (selectedItems.has('outros') && costOtherText.trim()) {
      labels.push(costOtherText.trim())
    }
    return labels.join(', ')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!token) return
    if (hasCost && (!costPerPlayer || Number(costPerPlayer) <= 0)) {
      setError('Informe o valor do custeio por jogador')
      return
    }
    if (hasCost && !pixKey.trim()) {
      setError('Informe a chave PIX para receber o custeio')
      return
    }
    setError('')
    setLoading(true)
    try {
      const payload: Record<string, unknown> = { ...form }
      if (hasCost) {
        payload.costPerPlayer  = Number(costPerPlayer)
        payload.pixKey         = pixKey.trim()
        payload.costDescription = buildCostDescription() || undefined
      }
      const schedule = await createSchedule(token, payload)
      router.push(`/schedule/${schedule._id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar agendamento')
    } finally {
      setLoading(false)
    }
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <PageLayout>
      <main className="max-w-xl mx-auto px-6 py-8">

        <Link href="/schedule"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-brand transition-colors mb-6">
          <ArrowLeft size={14} /> Voltar
        </Link>

        <div className="mb-6">
          <p className="text-xs text-gray-400 mb-1">Agenda</p>
          <h1 className="text-xl font-bold text-gray-900">Criar partida</h1>
        </div>

        {/* Boletas incentive */}
        <div className="flex items-center gap-3 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 mb-4">
          <div className="w-9 h-9 rounded-full bg-yellow-100 flex items-center justify-center shrink-0">
            <Coins size={18} className="text-yellow-500" />
          </div>
          <div>
            <p className="text-sm font-bold text-yellow-800">
              +{SCHEDULE_CREATE_REWARD} boletas ao criar uma partida!
            </p>
            <p className="text-xs text-yellow-600 mt-0.5">
              Tome a iniciativa e ganhe boletas para apostar.
            </p>
          </div>
        </div>

        <div className="border border-gray-100 rounded-xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Sport restriction note */}
            {player?.sport && (
              <div className="bg-brand/5 border border-brand/10 rounded-lg px-4 py-3 text-xs text-brand/70">
                Você só pode criar partidas de{' '}
                <strong>{SPORT_OPTIONS.find(o => o.value === player.sport)?.label ?? player.sport}</strong>,
                conforme seu esporte cadastrado.
              </div>
            )}

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className={labelCls}>Esporte</label>
                <select required value={form.sport}
                  disabled={!!player?.sport}
                  onChange={(e) => handleSportChange(e.target.value as Sport)}
                  className={`${inputCls} ${player?.sport ? 'opacity-60 cursor-not-allowed bg-gray-50' : ''}`}>
                  {SPORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Formato</label>
                <select required value={form.matchType}
                  onChange={(e) => setForm((f) => ({ ...f, matchType: e.target.value as MatchType }))}
                  className={inputCls}>
                  {MATCH_TYPE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Gênero</label>
                <select required value={form.genderType}
                  onChange={(e) => setForm((f) => ({ ...f, genderType: e.target.value as GenderType }))}
                  className={inputCls}>
                  {GENDER_TYPE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className={labelCls}>Título <span className="text-red-400">*</span></label>
              <input type="text" required placeholder="Ex: Tênis simples sábado manhã"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className={inputCls} />
            </div>

            <div>
              <label className={labelCls}>
                Descrição <span className="text-gray-300">(opcional)</span>
              </label>
              <textarea rows={2} placeholder="Nível exigido, regras, observações..."
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className={`${inputCls} resize-none`} />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className={labelCls}>Data <span className="text-red-400">*</span></label>
                <input type="date" required min={today} value={form.date}
                  onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                  className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Horário <span className="text-red-400">*</span></label>
                <input type="time" required value={form.time}
                  onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
                  className={inputCls} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Local <span className="text-red-400">*</span></label>
                <input type="text" required placeholder="Quadra, complexo, praia..."
                  value={form.location}
                  onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                  className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Cidade <span className="text-red-400">*</span></label>
                <input type="text" required value={form.city}
                  onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                  className={inputCls} />
              </div>
            </div>

            <div>
              <label className={labelCls}>Máx. participantes</label>
              <input type="number" required min={2} max={50} value={form.maxPlayers}
                onChange={(e) => setForm((f) => ({ ...f, maxPlayers: Number(e.target.value) }))}
                className={inputCls} />
              <p className="text-xs text-gray-300 mt-1">Você já conta como 1 participante</p>
            </div>

            {/* ── Custeio compartilhado ── */}
            <div className="border border-gray-100 rounded-lg overflow-hidden">
              {/* Toggle header */}
              <button
                type="button"
                onClick={() => {
                  if (!hasCost) { setHasCost(true); setCostSectionOpen(true) }
                  else setCostSectionOpen(o => !o)
                }}
                className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Banknote size={15} className={hasCost ? 'text-green-600' : 'text-gray-400'} />
                  <span className={`text-sm font-medium ${hasCost ? 'text-gray-900' : 'text-gray-500'}`}>
                    {hasCost
                      ? `Custeio: R$ ${costPerPlayer || '—'} por jogador`
                      : 'Adicionar custeio compartilhado'}
                  </span>
                  {!hasCost && (
                    <span className="text-xs text-gray-400">(opcional)</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {hasCost && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setHasCost(false); setCostSectionOpen(false) }}
                      className="text-gray-300 hover:text-red-400 transition-colors p-0.5"
                      title="Remover custeio"
                    >
                      <X size={13} />
                    </button>
                  )}
                  {costSectionOpen
                    ? <ChevronUp size={14} className="text-gray-400" />
                    : <ChevronDown size={14} className="text-gray-400" />}
                </div>
              </button>

              {/* Cost fields */}
              {hasCost && costSectionOpen && (
                <div className="px-4 py-4 space-y-4 border-t border-gray-100">

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>
                        Valor por jogador <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">R$</span>
                        <input
                          type="number"
                          min={1}
                          max={10000}
                          step={0.01}
                          placeholder="0,00"
                          value={costPerPlayer}
                          onChange={e => setCostPerPlayer(e.target.value)}
                          className={`${inputCls} pl-9`}
                        />
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>
                        Chave PIX <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="CPF, e-mail, celular ou chave"
                        value={pixKey}
                        onChange={e => setPixKey(e.target.value)}
                        className={inputCls}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelCls}>
                      Destinação dos recursos{' '}
                      <span className="text-gray-300">(opcional)</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {COST_ITEMS.map(item => (
                        <label
                          key={item.id}
                          className={`flex items-center gap-2.5 px-3 py-2.5 border rounded-lg cursor-pointer transition-colors text-sm ${
                            selectedItems.has(item.id)
                              ? 'border-brand/40 bg-brand/5 text-brand font-medium'
                              : 'border-gray-200 text-gray-600 hover:border-gray-300'
                          }`}
                        >
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={selectedItems.has(item.id)}
                            onChange={() => toggleCostItem(item.id)}
                          />
                          <span className={`w-3.5 h-3.5 rounded border-2 flex items-center justify-center shrink-0 ${
                            selectedItems.has(item.id) ? 'border-brand bg-brand' : 'border-gray-300'
                          }`}>
                            {selectedItems.has(item.id) && (
                              <svg viewBox="0 0 8 6" fill="none" className="w-2 h-2">
                                <path d="M1 3l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            )}
                          </span>
                          {item.label}
                        </label>
                      ))}
                    </div>
                    {selectedItems.has('outros') && (
                      <input
                        type="text"
                        placeholder="Especifique..."
                        value={costOtherText}
                        onChange={e => setCostOtherText(e.target.value)}
                        className={`${inputCls} mt-2`}
                      />
                    )}
                  </div>

                  <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2.5">
                    <Banknote size={13} className="text-blue-400 mt-0.5 shrink-0" />
                    <p className="text-xs text-blue-600 leading-relaxed">
                      Os participantes verão o valor e a chave PIX ao acessar a partida. O pagamento é feito diretamente entre os jogadores — o app não processa transações.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {error && (
              <p className="text-red-500 text-sm bg-red-50 rounded-lg px-3 py-2">{error}</p>
            )}

            <div className="flex gap-3 pt-1">
              <Link href="/schedule"
                className="flex-1 border border-gray-200 text-gray-500 text-sm font-medium py-2.5 rounded-lg text-center hover:bg-gray-50 transition-colors">
                Cancelar
              </Link>
              <button type="submit" disabled={loading}
                className="flex-1 bg-brand text-white text-sm font-medium py-2.5 rounded-lg hover:bg-brand-dark disabled:opacity-50 transition-colors">
                {loading ? 'Criando...' : 'Criar partida'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </PageLayout>
  )
}
