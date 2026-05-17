'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/auth-context'
import { createSchedule } from '@/lib/api/schedules'
import { GENDER_TYPE_OPTIONS, MATCH_TYPE_OPTIONS, SPORT_OPTIONS, TEAM_SPORTS, defaultMaxPlayers } from '@/lib/sports'
import { GenderType, MatchType, Sport } from '@rank-app/shared'
import { PageLayout } from '@/components/layout/page-layout'
import { ArrowLeft, Coins, ChevronDown, ChevronUp, Banknote, X, MapPin, Calendar, Clock, Users, FileText, AlignLeft } from 'lucide-react'

const SCHEDULE_CREATE_REWARD = 10

const TEAL   = '#00BFA5'
const SURF   = '#161B22'
const SURF2  = '#1C2333'
const BORDER = '#30363D'
const MUTED  = '#8B949E'

const COST_ITEMS = [
  { id: 'locacao',     label: 'Locação do espaço'    },
  { id: 'arbitragem',  label: 'Arbitragem'            },
  { id: 'catador',     label: 'Catador de bolas'      },
  { id: 'iluminacao',  label: 'Iluminação'            },
  { id: 'alimentacao', label: 'Alimentação/hidratação'},
  { id: 'outros',      label: 'Outros'                },
]

const inputStyle: React.CSSProperties = {
  width: '100%', background: SURF2, border: `1px solid ${BORDER}`, borderRadius: 10,
  padding: '12px 14px', fontSize: 14, color: '#E6EDF3', outline: 'none',
  boxSizing: 'border-box', transition: 'border-color .15s',
}

const selectStyle: React.CSSProperties = {
  ...inputStyle, appearance: 'none', cursor: 'pointer', paddingRight: 36,
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 13, fontWeight: 600, color: '#C9D1D9', marginBottom: 6,
}

function Field({ label, required, children, hint }: {
  label: string; required?: boolean; children: React.ReactNode; hint?: string
}) {
  return (
    <div>
      <label style={labelStyle}>
        {label}{' '}
        {required && <span style={{ color: '#F87171' }}>*</span>}
      </label>
      {children}
      {hint && <p style={{ fontSize: 11, color: MUTED, marginTop: 5 }}>{hint}</p>}
    </div>
  )
}

function SelectWrap({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ position: 'relative', ...style }}>
      {children}
      <ChevronDown size={13} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: MUTED, pointerEvents: 'none' }} />
    </div>
  )
}

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

  const [hasCost, setHasCost]             = useState(false)
  const [costPerPlayer, setCostPerPlayer] = useState<string>('')
  const [pixKey, setPixKey]               = useState('')
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [costOtherText, setCostOtherText] = useState('')
  const [costSectionOpen, setCostSectionOpen] = useState(false)
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) router.push('/login')
    if (player?.sport) {
      setForm(f => ({
        ...f,
        sport:    player.sport as Sport,
        city:     player.city ?? f.city,
        matchType: TEAM_SPORTS.has(player.sport as Sport) ? MatchType.TEAM : MatchType.INDIVIDUAL,
      }))
    }
  }, [isAuthenticated, router, player])

  useEffect(() => {
    setForm(f => ({ ...f, maxPlayers: defaultMaxPlayers(f.sport, f.matchType) }))
  }, [form.sport, form.matchType])

  function handleSportChange(sport: Sport) {
    setForm(f => ({ ...f, sport, matchType: TEAM_SPORTS.has(sport) ? MatchType.TEAM : MatchType.INDIVIDUAL }))
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
    if (selectedItems.has('outros') && costOtherText.trim()) labels.push(costOtherText.trim())
    return labels.join(', ')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!token) return
    if (hasCost && (!costPerPlayer || Number(costPerPlayer) <= 0)) {
      setError('Informe o valor do custeio por jogador'); return
    }
    if (hasCost && !pixKey.trim()) {
      setError('Informe a chave PIX para receber o custeio'); return
    }
    setError(''); setLoading(true)
    try {
      const payload: Record<string, unknown> = { ...form }
      if (hasCost) {
        payload.costPerPlayer   = Number(costPerPlayer)
        payload.pixKey          = pixKey.trim()
        payload.costDescription = buildCostDescription() || undefined
      }
      const schedule = await createSchedule(token, payload)
      router.push(`/schedule/${schedule._id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar agendamento')
    } finally { setLoading(false) }
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <PageLayout>
      <div style={{ flex: 1, background: '#0D1117', minHeight: '100vh', padding: '32px 40px', maxWidth: 680, width: '100%' }}>

        {/* Back */}
        <Link href="/schedule" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: MUTED, textDecoration: 'none', marginBottom: 24, fontWeight: 500 }}>
          <ArrowLeft size={14} /> Voltar para Partidas
        </Link>

        {/* Title */}
        <h1 style={{ fontSize: 32, fontWeight: 900, color: '#E6EDF3', margin: '0 0 24px', letterSpacing: '-0.02em' }}>
          Criar Partida
        </h1>

        {/* Boletas incentive */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: `${TEAL}12`, border: `1px solid ${TEAL}30`, borderRadius: 12, padding: '12px 16px', marginBottom: 24 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: `${TEAL}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Coins size={18} style={{ color: TEAL }} />
          </div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: TEAL, margin: '0 0 2px' }}>
              +{SCHEDULE_CREATE_REWARD} boletas ao criar uma partida!
            </p>
            <p style={{ fontSize: 12, color: `${TEAL}99`, margin: 0 }}>
              Tome a iniciativa e ganhe boletas para apostar.
            </p>
          </div>
        </div>

        {/* Form card */}
        <div style={{ background: SURF, border: `1px solid ${BORDER}`, borderRadius: 16, padding: '28px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Sport restriction note */}
          {player?.sport && (
            <div style={{ background: `${TEAL}0D`, border: `1px solid ${TEAL}25`, borderRadius: 8, padding: '10px 14px', fontSize: 12, color: `${TEAL}CC` }}>
              Você só pode criar partidas de{' '}
              <strong style={{ color: TEAL }}>{SPORT_OPTIONS.find(o => o.value === player.sport)?.label ?? player.sport}</strong>,
              conforme seu esporte cadastrado.
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

            {/* Sport / Format / Gender */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <Field label="Esporte">
                <SelectWrap>
                  <select required value={form.sport}
                    disabled={!!player?.sport}
                    onChange={e => handleSportChange(e.target.value as Sport)}
                    style={{ ...selectStyle, opacity: player?.sport ? 0.5 : 1, cursor: player?.sport ? 'not-allowed' : 'pointer' }}>
                    {SPORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </SelectWrap>
              </Field>
              <Field label="Formato">
                <SelectWrap>
                  <select required value={form.matchType}
                    onChange={e => setForm(f => ({ ...f, matchType: e.target.value as MatchType }))}
                    style={selectStyle}>
                    {MATCH_TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </SelectWrap>
              </Field>
              <Field label="Gênero">
                <SelectWrap>
                  <select required value={form.genderType}
                    onChange={e => setForm(f => ({ ...f, genderType: e.target.value as GenderType }))}
                    style={selectStyle}>
                    {GENDER_TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </SelectWrap>
              </Field>
            </div>

            {/* Title */}
            <Field label="Título" required>
              <div style={{ position: 'relative' }}>
                <FileText size={14} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: MUTED }} />
                <input type="text" required placeholder="Ex: Tênis simples sábado manhã"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  style={{ ...inputStyle, paddingLeft: 38 }} />
              </div>
            </Field>

            {/* Description */}
            <Field label="Descrição" >
              <div style={{ position: 'relative' }}>
                <AlignLeft size={14} style={{ position: 'absolute', left: 13, top: 14, color: MUTED }} />
                <textarea rows={2} placeholder="Nível exigido, regras, observações..."
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  style={{ ...inputStyle, paddingLeft: 38, resize: 'none', lineHeight: 1.5 }} />
              </div>
            </Field>

            {/* Date / Time */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 160px', gap: 12 }}>
              <Field label="Data" required>
                <div style={{ position: 'relative' }}>
                  <Calendar size={14} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: MUTED }} />
                  <input type="date" required min={today} value={form.date}
                    onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                    style={{ ...inputStyle, paddingLeft: 38, colorScheme: 'dark' }} />
                </div>
              </Field>
              <Field label="Horário" required>
                <div style={{ position: 'relative' }}>
                  <Clock size={14} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: MUTED }} />
                  <input type="time" required value={form.time}
                    onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
                    style={{ ...inputStyle, paddingLeft: 38, colorScheme: 'dark' }} />
                </div>
              </Field>
            </div>

            {/* Location / City */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Local" required>
                <div style={{ position: 'relative' }}>
                  <MapPin size={14} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: MUTED }} />
                  <input type="text" required placeholder="Quadra, complexo, praia..."
                    value={form.location}
                    onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                    style={{ ...inputStyle, paddingLeft: 38 }} />
                </div>
              </Field>
              <Field label="Cidade" required>
                <input type="text" required value={form.city}
                  onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                  style={inputStyle} />
              </Field>
            </div>

            {/* Max players */}
            <Field label="Máx. participantes" hint="Você já conta como 1 participante">
              <div style={{ position: 'relative' }}>
                <Users size={14} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: MUTED }} />
                <input type="number" required min={2} max={50} value={form.maxPlayers}
                  onChange={e => setForm(f => ({ ...f, maxPlayers: Number(e.target.value) }))}
                  style={{ ...inputStyle, paddingLeft: 38 }} />
              </div>
            </Field>

            {/* Cost sharing toggle */}
            <div style={{ border: `1px solid ${BORDER}`, borderRadius: 10, overflow: 'hidden' }}>
              <button type="button"
                onClick={() => {
                  if (!hasCost) { setHasCost(true); setCostSectionOpen(true) }
                  else setCostSectionOpen(o => !o)
                }}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 16px', background: SURF2, border: 'none', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Banknote size={15} style={{ color: hasCost ? '#22C55E' : MUTED }} />
                  <span style={{ fontSize: 13, fontWeight: 500, color: hasCost ? '#E6EDF3' : MUTED }}>
                    {hasCost ? `Custeio: R$ ${costPerPlayer || '—'} por jogador` : 'Adicionar custeio compartilhado'}
                  </span>
                  {!hasCost && <span style={{ fontSize: 12, color: '#4A5A6A' }}>(opcional)</span>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {hasCost && (
                    <button type="button"
                      onClick={e => { e.stopPropagation(); setHasCost(false); setCostSectionOpen(false) }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: MUTED, display: 'flex', padding: 2 }}>
                      <X size={13} />
                    </button>
                  )}
                  {costSectionOpen
                    ? <ChevronUp size={14} style={{ color: MUTED }} />
                    : <ChevronDown size={14} style={{ color: MUTED }} />}
                </div>
              </button>

              {hasCost && costSectionOpen && (
                <div style={{ padding: '18px 16px', borderTop: `1px solid ${BORDER}`, display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <Field label="Valor por jogador" required>
                      <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: MUTED, fontWeight: 600 }}>R$</span>
                        <input type="number" min={1} max={10000} step={0.01} placeholder="0,00"
                          value={costPerPlayer}
                          onChange={e => setCostPerPlayer(e.target.value)}
                          style={{ ...inputStyle, paddingLeft: 38 }} />
                      </div>
                    </Field>
                    <Field label="Chave PIX" required>
                      <input type="text" placeholder="CPF, e-mail, celular ou chave"
                        value={pixKey}
                        onChange={e => setPixKey(e.target.value)}
                        style={inputStyle} />
                    </Field>
                  </div>

                  <div>
                    <p style={{ ...labelStyle, marginBottom: 10 }}>
                      Destinação dos recursos <span style={{ color: MUTED, fontWeight: 400 }}>(opcional)</span>
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      {COST_ITEMS.map(item => (
                        <label key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', border: `1px solid ${selectedItems.has(item.id) ? TEAL + '60' : BORDER}`, borderRadius: 8, cursor: 'pointer', background: selectedItems.has(item.id) ? `${TEAL}10` : 'transparent', transition: 'all .15s' }}>
                          <input type="checkbox" className="sr-only"
                            checked={selectedItems.has(item.id)}
                            onChange={() => toggleCostItem(item.id)} />
                          <span style={{ width: 14, height: 14, borderRadius: 4, border: `2px solid ${selectedItems.has(item.id) ? TEAL : BORDER}`, background: selectedItems.has(item.id) ? TEAL : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {selectedItems.has(item.id) && (
                              <svg viewBox="0 0 8 6" fill="none" style={{ width: 8, height: 8 }}>
                                <path d="M1 3l2 2 4-4" stroke="#0D1117" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            )}
                          </span>
                          <span style={{ fontSize: 12, color: selectedItems.has(item.id) ? TEAL : '#C9D1D9', fontWeight: selectedItems.has(item.id) ? 600 : 400 }}>{item.label}</span>
                        </label>
                      ))}
                    </div>
                    {selectedItems.has('outros') && (
                      <input type="text" placeholder="Especifique..."
                        value={costOtherText}
                        onChange={e => setCostOtherText(e.target.value)}
                        style={{ ...inputStyle, marginTop: 8 }} />
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, background: '#0D2340', border: '1px solid #1E4080', borderRadius: 8, padding: '10px 12px' }}>
                    <Banknote size={13} style={{ color: '#60A5FA', marginTop: 1, flexShrink: 0 }} />
                    <p style={{ fontSize: 11, color: '#93C5FD', lineHeight: 1.5, margin: 0 }}>
                      Os participantes verão o valor e a chave PIX ao acessar a partida. O pagamento é feito diretamente entre os jogadores — o app não processa transações.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Error */}
            {error && (
              <div style={{ background: '#F8717115', border: '1px solid #F8717130', borderRadius: 8, padding: '10px 14px' }}>
                <p style={{ fontSize: 13, color: '#F87171', margin: 0 }}>{error}</p>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, paddingTop: 4 }}>
              <Link href="/schedule" style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'transparent', border: `1px solid ${BORDER}`,
                color: '#C9D1D9', fontSize: 14, fontWeight: 700,
                padding: '13px', borderRadius: 10, textDecoration: 'none',
                transition: 'border-color .15s',
              }}>
                Cancelar
              </Link>
              <button type="submit" disabled={loading} style={{
                background: TEAL, border: 'none', color: '#0D1117',
                fontSize: 14, fontWeight: 700, padding: '13px',
                borderRadius: 10, cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1, transition: 'opacity .15s',
              }}>
                {loading ? 'Criando...' : 'Criar partida'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </PageLayout>
  )
}
