'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/auth-context'

export function Header() {
  const { isAuthenticated, player, logout } = useAuth()

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-1.5">
          <span className="font-black text-xl tracking-tight text-brand">RANK</span>
          <span className="w-2 h-2 rounded-full bg-accent" />
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/ranking" className="text-gray-600 hover:text-brand">
            Ranking
          </Link>
          <Link href="/schedule" className="text-gray-600 hover:text-brand">
            Partidas
          </Link>
          {isAuthenticated ? (
            <>
              <Link href="/dashboard" className="text-gray-600 hover:text-brand">
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
              <Link href="/login" className="text-gray-600 hover:text-brand">
                Entrar
              </Link>
              <Link
                href="/register"
                className="bg-brand text-white px-3 py-1.5 rounded-md hover:bg-brand-dark"
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
