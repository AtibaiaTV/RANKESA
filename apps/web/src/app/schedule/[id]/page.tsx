'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/auth-context'
import { getSchedule, joinSchedule, leaveSchedule, cancelSchedule } from '@/lib/api/schedules'
import { ScheduledMatch, ScheduleStatus } from '@rank-app/shared'
import { GENDER_TYPE_LABEL, MATCH_TYPE_LABEL, SPORT_LABEL } from '@/lib/sports'
import { Header } from '@/components/layout/header'

const STATUS_STYLE: Record<ScheduleStatus, string> = {
  [ScheduleStatus.OPEN]: 'bg-green-100 text-green-700',
  [ScheduleStatus.FULL]: 'bg-orange-100 text-orange-700',
  [ScheduleStatus.CANCELLED]: 'bg-gray-100 text-gray-500',
  [ScheduleStatus.COMPLETED]: 'bg-blue-100 text-blue-700',
}

const STATUS_LABEL: Record<ScheduleStatus, string> = {
  [ScheduleStatus.OPEN]: 'Aberto',
  [ScheduleStatus.FULL]: 'Lotado',
  [ScheduleStatus.CANCELLED]: 'Cancelado',
  [ScheduleStatus.COMPLETED]: 'Concluído',
}

export default function ScheduleDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { player, token } = useAuth()
  const router = useRouter()
  const [schedule, setSchedule] = useState<ScheduledMatch | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    getSchedule(id)
      .then(setSchedule)
      .catch(() => router.push('/schedule'))
      .finally(() => setLoading(false))
  }, [id, router])

  async function handleJoin() {
    if (!token) return router.push('/login')
    setActionLoading(true)
    try {
      const updated = await joinSchedule(token, id)
      setSchedule(updated)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao confirmar presença')
    } finally {
      setActionLoading(false)
    }
  }

  async function handleLeave() {
    if (!token) return
    setActionLoading(true)
    try {
      const updated = await leaveSchedule(token, id)
      setSchedule(updated)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao sair da partida')
    } finally {
      setActionLoading(false)
    }
  }

  async function handleCancel() {
    if (!token || !confirm('Cancelar este agendamento?')) return
    setActionLoading(true)
    try {
      await cancelSchedule(token, id)
      router.push('/schedule')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao cancelar')
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) return <div className="p-8 text-center text-gray-400">Carregando...</div>
  if (!schedule) return null

  const organizer = typeof schedule.organizer === 'object' ? schedule.organizer : null
  const players = schedule.players.map((p) => (typeof p === 'object' ? p : null)).filter(Boolean)
  const isOrganizer = player && organizer?._id === player._id
  const isJoined = player && players.some((p) => p?._id === player._id)
  const spotsLeft = schedule.maxPlayers - players.length
  const canJoin =
    !isJoined &&
    !isOrganizer &&
    spotsLeft > 0 &&
    schedule.status === ScheduleStatus.OPEN

  return (
    <>
      <Header />
      <main className="max-w-lg mx-auto px-4 py-8">
        <Link href="/schedule" className="text-gray-400 text-sm hover:text-gray-600 mb-4 inline-block">
          ← Voltar
        </Link>

        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{schedule.title}</h1>
              <p className="text-sm text-gray-500 mt-1">
                {SPORT_LABEL[schedule.sport]} · {MATCH_TYPE_LABEL[schedule.matchType]} · {GENDER_TYPE_LABEL[schedule.genderType]}
              </p>
            </div>
            <span className={`text-xs font-medium px-2 py-1 rounded-full shrink-0 ml-2 ${STATUS_STYLE[schedule.status]}`}>
              {STATUS_LABEL[schedule.status]}
            </span>
          </div>

          {schedule.description && (
            <p className="text-sm text-gray-600 mb-4 bg-gray-50 rounded-lg p-3">
              {schedule.description}
            </p>
          )}

          <div className="space-y-2 text-sm text-gray-700 mb-5">
            <p>📅 <strong>{new Date(schedule.date).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</strong> às {schedule.time}</p>
            <p>📍 {schedule.location}, {schedule.city}</p>
            <p>
              👥{' '}
              <span className={spotsLeft === 0 ? 'text-orange-600 font-semibold' : 'text-accent font-semibold'}>
                {players.length}/{schedule.maxPlayers} participantes
              </span>
              {spotsLeft > 0 && <span className="text-gray-400"> · {spotsLeft} vaga(s)</span>}
            </p>
            <p>🎯 Organizado por <strong>{organizer?.name ?? '—'}</strong></p>
          </div>

          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

          <div className="flex gap-3">
            {canJoin && (
              <button
                onClick={handleJoin}
                disabled={actionLoading}
                className="flex-1 bg-brand text-white py-2.5 rounded-lg text-sm font-medium hover:bg-brand-dark disabled:opacity-50"
              >
                Confirmar presença
              </button>
            )}
            {isJoined && !isOrganizer && schedule.status !== ScheduleStatus.CANCELLED && (
              <button
                onClick={handleLeave}
                disabled={actionLoading}
                className="flex-1 border border-red-300 text-red-600 py-2.5 rounded-lg text-sm font-medium hover:bg-red-50 disabled:opacity-50"
              >
                Sair da partida
              </button>
            )}
            {isOrganizer && schedule.status !== ScheduleStatus.CANCELLED && (
              <button
                onClick={handleCancel}
                disabled={actionLoading}
                className="flex-1 border border-red-300 text-red-600 py-2.5 rounded-lg text-sm font-medium hover:bg-red-50 disabled:opacity-50"
              >
                Cancelar agendamento
              </button>
            )}
            {!player && (
              <Link
                href="/login"
                className="flex-1 bg-brand text-white py-2.5 rounded-lg text-sm font-medium hover:bg-brand-dark text-center"
              >
                Entrar para participar
              </Link>
            )}
          </div>
        </div>

        {/* Lista de participantes */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">
            Participantes ({players.length})
          </h2>
          {players.length === 0 ? (
            <p className="text-center text-gray-400 py-4 text-sm">Nenhum participante ainda</p>
          ) : (
            <div className="space-y-3">
              {players.map((p) => (
                <Link
                  key={p!._id}
                  href={`/players/${p!._id}`}
                  className="flex items-center gap-3 hover:bg-gray-50 rounded-lg p-2 -mx-2 transition-colors"
                >
                  <div className="w-9 h-9 rounded-full bg-brand-light flex items-center justify-center font-semibold text-brand text-sm shrink-0">
                    {p!.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {p!.name}
                      {organizer?._id === p!._id && (
                        <span className="ml-2 text-xs text-orange-500">(organizador)</span>
                      )}
                    </p>
                    <p className="text-xs text-gray-400">{p!.city} · ELO {p!.elo}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  )
}
