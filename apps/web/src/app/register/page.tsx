'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { register } from '@/lib/api/auth'
import { useAuth } from '@/contexts/auth-context'
import { Gender, PlayerLevel, Sport } from '@rank-app/shared'
import { SPORT_OPTIONS } from '@/lib/sports'
import { BRAZIL_STATES, BRAZIL_REGIONS } from '@/lib/brazil'

const LEVEL_OPTIONS = [
  { value: PlayerLevel.BEGINNER, label: 'Iniciante' },
  { value: PlayerLevel.INTERMEDIATE, label: 'Intermediário' },
  { value: PlayerLevel.ADVANCED, label: 'Avançado' },
]

const GENDER_OPTIONS = [
  { value: '', label: 'Prefiro não informar' },
  { value: Gender.MALE, label: 'Masculino' },
  { value: Gender.FEMALE, label: 'Feminino' },
]

export default function RegisterPage() {
  const router = useRouter()
  const { login: setAuth } = useAuth()
  const [step, setStep] = useState<1 | 2>(1)
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    sport: '' as Sport | '',
    level: PlayerLevel.BEGINNER,
    gender: '' as Gender | '',
    birthDate: '',
    city: '',
    state: '',
    region: '',
    country: 'Brasil',
    venue: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function set(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function handleStateChange(state: string) {
    const stateEntry = BRAZIL_STATES.find((s) => s.value === state)
    if (!stateEntry) { set('state', state); return }
    const regionMap: Record<string, string> = {
      AC: 'Norte', AM: 'Norte', AP: 'Norte', PA: 'Norte', RO: 'Norte', RR: 'Norte', TO: 'Norte',
      AL: 'Nordeste', BA: 'Nordeste', CE: 'Nordeste', MA: 'Nordeste', PB: 'Nordeste',
      PE: 'Nordeste', PI: 'Nordeste', RN: 'Nordeste', SE: 'Nordeste',
      DF: 'Centro-Oeste', GO: 'Centro-Oeste', MS: 'Centro-Oeste', MT: 'Centro-Oeste',
      ES: 'Sudeste', MG: 'Sudeste', RJ: 'Sudeste', SP: 'Sudeste',
      PR: 'Sul', RS: 'Sul', SC: 'Sul',
    }
    setForm((f) => ({ ...f, state, region: regionMap[state] ?? f.region }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.sport) { setError('Selecione um esporte'); return }
    setError('')
    setLoading(true)
    try {
      const payload = {
        ...form,
        sport: form.sport as Sport,
        gender: form.gender || undefined,
        birthDate: form.birthDate || undefined,
        venue: form.venue || undefined,
        state: form.state || undefined,
        region: form.region || undefined,
      }
      const { accessToken, player } = await register(payload)
      setAuth(player, accessToken)
      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao cadastrar')
      setStep(1)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-xl border border-gray-200 p-8">
        <div className="text-center mb-6">
          <span className="font-black text-2xl text-brand">RANK</span>
          <span className="inline-block w-2 h-2 rounded-full bg-accent ml-1 mb-1" />
          <p className="text-sm text-gray-500 mt-1">Criar conta</p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-6">
          <div className={`flex-1 h-1.5 rounded-full ${step >= 1 ? 'bg-brand' : 'bg-gray-200'}`} />
          <div className={`flex-1 h-1.5 rounded-full ${step >= 2 ? 'bg-brand' : 'bg-gray-200'}`} />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {step === 1 && (
            <>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                Etapa 1 — Seu esporte e perfil
              </p>

              {/* Sport selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Qual é o seu esporte? <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {SPORT_OPTIONS.map((o) => (
                    <button
                      key={o.value}
                      type="button"
                      onClick={() => set('sport', o.value)}
                      className={`text-left px-3 py-2 rounded-lg border text-sm transition-colors ${
                        form.sport === o.value
                          ? 'border-brand bg-brand-light text-brand font-medium'
                          : 'border-gray-200 text-gray-700 hover:border-brand/50'
                      }`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nível</label>
                  <select
                    value={form.level}
                    onChange={(e) => set('level', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                  >
                    {LEVEL_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gênero</label>
                  <select
                    value={form.gender}
                    onChange={(e) => set('gender', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                  >
                    {GENDER_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data de nascimento <span className="text-gray-400 font-normal">(opcional)</span>
                </label>
                <input
                  type="date"
                  value={form.birthDate}
                  onChange={(e) => set('birthDate', e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>

              <button
                type="button"
                disabled={!form.sport}
                onClick={() => setStep(2)}
                className="w-full bg-brand text-white rounded-lg py-2.5 font-medium hover:bg-brand-dark disabled:opacity-40 transition-colors"
              >
                Próximo →
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                Etapa 2 — Dados de acesso e localização
              </p>

              {[
                { key: 'name', label: 'Nome completo', type: 'text', required: true },
                { key: 'email', label: 'E-mail', type: 'email', required: true },
                { key: 'password', label: 'Senha (mín. 6 caracteres)', type: 'password', required: true },
              ].map(({ key, label, type, required }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label} {required && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type={type}
                    required={required}
                    value={form[key as keyof typeof form]}
                    onChange={(e) => set(key, e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                  />
                </div>
              ))}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estado <span className="text-gray-400 font-normal">(opcional)</span>
                  </label>
                  <select
                    value={form.state}
                    onChange={(e) => handleStateChange(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                  >
                    <option value="">Selecionar...</option>
                    {BRAZIL_STATES.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cidade <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.city}
                    onChange={(e) => set('city', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Clube / Complexo esportivo <span className="text-gray-400 font-normal">(opcional)</span>
                </label>
                <input
                  type="text"
                  placeholder="Ex: Arena Tênis Club, Complexo Aquático..."
                  value={form.venue}
                  onChange={(e) => set('venue', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 border border-gray-300 text-gray-600 rounded-lg py-2.5 font-medium hover:bg-gray-50 transition-colors"
                >
                  ← Voltar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-brand text-white rounded-lg py-2.5 font-medium hover:bg-brand-dark disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Cadastrando...' : 'Criar conta'}
                </button>
              </div>
            </>
          )}
        </form>

        <p className="mt-4 text-center text-sm text-gray-500">
          Já tem conta?{' '}
          <Link href="/login" className="text-brand font-medium hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  )
}
