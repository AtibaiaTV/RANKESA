'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/auth-context'
import { createMatch } from '@/lib/api/matches'
import { getPlayers } from '@/lib/api/players'
import { Player, Sport } from '@rank-app/shared'
import { Header } from '@/components/layout/header'

export default function NewMatchPage() {
  const { player, token, isAuthenticated } = useAuth()
  const router = useRouter()
  const [players, setPlayers] = useState<Player[]>([])
  const SPORT_OPTIONS = [
    { value: Sport.TENNIS, label: '🎾 Tênis' },
    { value: Sport.PADEL, label: '🏓 Padel' },
    { value: Sport.BEACH_TENNIS, label: '🏖️ Beach Tennis' },
    { value: Sport.SQUASH, label: '🟡 Squash' },
    { value: Sport.BADMINTON, label: '🏸 Badminton' },
    { value: Sport.TABLE_TENNIS, label: '🏓 Tênis de Mesa' },
    { value: Sport.VOLLEYBALL, label: '🏐 Vôlei' },
    { value: Sport.BEACH_VOLLEYBALL, label: '🏖️ Vôlei de Areia' },
    { value: Sport.FOOTVOLLEY, label: '🦶 Futevôlei' },
    { value: Sport.FUTSAL, label: '👟 Futsal' },
    { value: Sport.BASKETBALL, label: '🏀 Basquete' },
    { value: Sport.FOOTBALL, label: '⚽ Futebol' },
    { value: Sport.HANDBALL, label: '🤾 Handebol' },
    { value: Sport.CHESS, label: '♟️ Xadrez' },
  ]

  const [form, setForm] = useState({
    sport: Sport.TENNIS,
    opponentId: '',
    winnerId: '',
    score: '',
    date: new Date().toISOString().split('T')[0],
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    getPlayers({ limit: 100 }).then((r) =>
      setPlayers(r.data.filter((p) => p._id !== player?._id)),
    )
  }, [isAuthenticated, player, router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!token) return
    setError('')
    setLoading(true)
    try {
      await createMatch(token, form)
      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao registrar partida')
    } finally {
      setLoading(false)
    }
  }

  const opponentSelected = players.find((p) => p._id === form.opponentId)

  return (
    <>
      <Header />
      <main className="max-w-md mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/dashboard" className="text-gray-400 hover:text-gray-600">
            ← Voltar
          </Link>
          <h1 className="text-xl font-bold text-gray-900">Registrar Partida</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Esporte</label>
            <select
              required
              value={form.sport}
              onChange={(e) => setForm((f) => ({ ...f, sport: e.target.value as Sport }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            >
              {SPORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Adversário</label>
            <select
              required
              value={form.opponentId}
              onChange={(e) => setForm((f) => ({ ...f, opponentId: e.target.value, winnerId: '' }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            >
              <option value="">Selecionar adversário...</option>
              {players.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name} ({p.city}) — ELO {p.elo}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vencedor</label>
            <select
              required
              value={form.winnerId}
              onChange={(e) => setForm((f) => ({ ...f, winnerId: e.target.value }))}
              disabled={!form.opponentId}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand disabled:bg-gray-50"
            >
              <option value="">Selecionar vencedor...</option>
              {player && <option value={player._id}>{player.name} (Eu)</option>}
              {opponentSelected && (
                <option value={opponentSelected._id}>{opponentSelected.name}</option>
              )}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Placar (ex: 6-3 6-4)
            </label>
            <input
              type="text"
              required
              placeholder="6-3 6-4"
              value={form.score}
              onChange={(e) => setForm((f) => ({ ...f, score: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data da partida</label>
            <input
              type="date"
              required
              value={form.date}
              max={new Date().toISOString().split('T')[0]}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand text-white rounded-lg py-2.5 font-medium hover:bg-brand-dark disabled:opacity-50 transition-colors"
          >
            {loading ? 'Registrando...' : 'Registrar resultado'}
          </button>
        </form>
      </main>
    </>
  )
}
