'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { getMatches, adminResolve } from '@/lib/api/matches'
import { Match, MatchStatus, SystemRole } from '@rank-app/shared'
import { Header } from '@/components/layout/header'

export default function AdminPage() {
  const { player, token, isAuthenticated } = useAuth()
  const router = useRouter()
  const [disputes, setDisputes] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    if (player && player.role !== SystemRole.ADMIN) {
      router.push('/')
      return
    }

    getMatches({ status: MatchStatus.DISPUTED, limit: 50 })
      .then((r) => setDisputes(r.data))
      .finally(() => setLoading(false))
  }, [isAuthenticated, player, router])

  async function handleResolve(matchId: string, winnerId: string) {
    if (!token) return
    await adminResolve(token, matchId, winnerId)
    setDisputes((prev) => prev.filter((m) => m._id !== matchId))
  }

  return (
    <>
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Admin — Disputas ({disputes.length})
        </h1>

        {loading ? (
          <p className="text-center text-gray-400 py-8">Carregando...</p>
        ) : disputes.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">✅</p>
            <p>Nenhuma disputa pendente</p>
          </div>
        ) : (
          <div className="space-y-4">
            {disputes.map((m) => {
              const p1 = typeof m.player1 === 'object' ? m.player1 : null
              const p2 = typeof m.player2 === 'object' ? m.player2 : null
              const disputedBy = typeof m.disputedBy === 'object' ? m.disputedBy : null

              return (
                <div key={m._id} className="bg-white border border-red-200 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-semibold text-gray-900">
                      {p1?.name ?? '—'} vs {p2?.name ?? '—'}
                    </p>
                    <span className="text-sm text-gray-500">{m.score}</span>
                  </div>

                  <p className="text-sm text-gray-600 mb-1">
                    <span className="font-medium">Disputado por:</span> {disputedBy?.name ?? '—'}
                  </p>
                  <p className="text-sm text-red-600 bg-red-50 rounded p-2 mb-4">
                    {m.disputeReason}
                  </p>

                  <p className="text-xs text-gray-500 mb-3 font-medium">
                    Definir vencedor correto:
                  </p>
                  <div className="flex gap-3">
                    {p1 && (
                      <button
                        onClick={() => handleResolve(m._id, p1._id)}
                        className="flex-1 border border-brand text-brand py-2 rounded-lg text-sm hover:bg-brand-light"
                      >
                        {p1.name}
                      </button>
                    )}
                    {p2 && (
                      <button
                        onClick={() => handleResolve(m._id, p2._id)}
                        className="flex-1 border border-brand text-brand py-2 rounded-lg text-sm hover:bg-brand-light"
                      >
                        {p2.name}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </>
  )
}
