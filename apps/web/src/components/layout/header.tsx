'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useAuth } from '@/contexts/auth-context'
import { usePathname } from 'next/navigation'

export function Header() {
  const { isAuthenticated, player, logout } = useAuth()
  const pathname = usePathname()

  const navLink = (href: string, label: string) => {
    const active = pathname === href || pathname.startsWith(href + '/')
    return (
      <Link href={href} className={`text-sm transition-colors ${
        active ? 'text-gray-900 font-semibold' : 'text-gray-400 hover:text-gray-700'
      }`}>
        {label}
      </Link>
    )
  }

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/">
            <Image src="/logo-rank.png" alt="RANK" width={96} height={36} priority style={{ objectFit: 'contain' }} />
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            {navLink('/ranking', 'Ranking')}
            {navLink('/schedule', 'Partidas')}
            {isAuthenticated && navLink('/dashboard', 'Painel')}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <span className="hidden md:block text-sm text-gray-500">{player?.name}</span>
              <button onClick={logout}
                className="text-sm text-gray-400 hover:text-red-400 transition-colors">
                Sair
              </button>
            </>
          ) : (
            <>
              <Link href="/login"
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
                Entrar
              </Link>
              <Link href="/login"
                className="text-sm font-semibold bg-brand text-white px-4 py-1.5 rounded-full hover:bg-brand-dark transition-colors">
                Cadastrar
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
