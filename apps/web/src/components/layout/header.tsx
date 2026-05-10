'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/auth-context'

export function Header() {
  const { isAuthenticated, player, logout } = useAuth()

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-bold text-green-600 text-lg">
          🎾 Tennis Rank
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/ranking" className="text-gray-600 hover:text-green-600">
            Ranking
          </Link>
          {isAuthenticated ? (
            <>
              <Link href="/dashboard" className="text-gray-600 hover:text-green-600">
                Painel
              </Link>
              <span className="text-gray-400">|</span>
              <span className="text-gray-700 font-medium">{player?.name}</span>
              <button
                onClick={logout}
                className="text-red-500 hover:text-red-700"
              >
                Sair
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-gray-600 hover:text-green-600">
                Entrar
              </Link>
              <Link
                href="/register"
                className="bg-green-600 text-white px-3 py-1.5 rounded-md hover:bg-green-700"
              >
                Cadastrar
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
