'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/auth-context'
import { createSchedule } from '@/lib/api/schedules'
import {
  GENDER_TYPE_OPTIONS,
  MATCH_TYPE_OPTIONS,
  SPORT_OPTIONS,
  TEAM_SPORTS,
  defaultMaxPlayers,
} from '@/lib/sports'
import { GenderType, MatchType, Sport } from '@tennis-rank/shared'
import { Header } from '@/components/layout/header'

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
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) router.push('/login')
  }, [isAuthenticated, router])

  // Atualiza maxPlayers sugerido quando sport ou matchType mudam
  useEffect(() => {
    setForm((f) => ({
      ...f,
      maxPlayers: defaultMaxPlayers(f.sport, f.matchType),
    }))
  }, [form.sport, form.matchType])

  // Esportes coletivos forçam tipo TEAM por padrão
  function handleSportChange(sport: Sport) {
    setForm((f) => ({
      ...f,
      sport,
      matchType: TEAM_SPORTS.has(sport) ? MatchType.TEAM : MatchType.INDIVIDUAL,
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!token) return
    setError('')
    setLoading(true)
    try {
      const schedule = await createSchedule(token, form)
      router.push(`/schedule/${schedule._id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar agendamento')
    } finally {
      setLoading(false)
    }
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <>
      <Header />
      <main className="max-w-lg mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/schedule" className="text-gray-400 hover:text-gray-600">←</Link>
          <h1 className="text-xl font-bold text-gray-900">Criar Partida</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          {/* Esporte */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Esporte</label>
            <select
              required
              value={form.sport}
              onChange={(e) => handleSportChange(e.target.value as Sport)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {SPORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* Formato e gênero lado a lado */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Formato</label>
              <select
                required
                value={form.matchType}
                onChange={(e) => setForm((f) => ({ ...f, matchType: e.target.value as MatchType }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {MATCH_TYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gênero</label>
              <select
                required
                value={form.genderType}
                onChange={(e) => setForm((f) => ({ ...f, genderType: e.target.value as GenderType }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {GENDER_TYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Título */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
            <input
              type="text"
              required
              placeholder="Ex: Vôlei de Areia sábado manhã"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição <span className="text-gray-400 font-normal">(opcional)</span>
            </label>
            <textarea
              rows={2}
              placeholder="Nível exigido, regras, observações..."
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
            />
          </div>

          {/* Data e hora */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
              <input
                type="date"
                required
                min={today}
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Horário</label>
              <input
                type="time"
                required
                value={form.time}
                onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          {/* Local e cidade */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Local</label>
            <input
              type="text"
              required
              placeholder="Ex: Quadra da Associação Atlética, Praia do Futuro"
              value={form.location}
              onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
            <input
              type="text"
              required
              value={form.city}
              onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Vagas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Número máximo de participantes
            </label>
            <input
              type="number"
              required
              min={2}
              max={50}
              value={form.maxPlayers}
              onChange={(e) => setForm((f) => ({ ...f, maxPlayers: Number(e.target.value) }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <p className="text-xs text-gray-400 mt-1">Você já conta como 1 participante</p>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white rounded-lg py-2.5 font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Criando...' : 'Criar partida'}
          </button>
        </form>
      </main>
    </>
  )
}
