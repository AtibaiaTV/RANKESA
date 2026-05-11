'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { BarChart2, BookOpen, Calendar, Coins, LayoutDashboard, LogOut, Plus } from 'lucide-react'
import Image from 'next/image'

const NAV = [
  { href: '/ranking',   label: 'Ranking',  icon: BarChart2 },
  { href: '/schedule',  label: 'Partidas', icon: Calendar },
  { href: '/dashboard', label: 'Painel',   icon: LayoutDashboard, authOnly: true },
  { href: '/boletas',   label: 'Boletas',  icon: Coins },
  { href: '/regras',    label: 'Regras',   icon: BookOpen },
]

export function PageLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, player, logout } = useAuth()
  const pathname = usePathname()

  return (
    <div className="min-h-screen flex">

      {/* ── Sidebar esquerda — fundo navy do logo ── */}
      <div className="hidden lg:flex w-56 shrink-0 flex-col bg-navy sticky top-0 h-screen overflow-hidden">

        {/* Detalhe decorativo */}
        <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/[0.02] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white/[0.02] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

        {/* Logo */}
        <div className="relative z-10 px-4 pt-6 pb-4">
          <Link href="/">
            <Image
              src="/logo-dark.png"
              alt="RANK"
              width={400}
              height={216}
              style={{ width: '100%', height: 'auto' }}
              priority
            />
          </Link>
        </div>

        {/* Navegação */}
        <nav className="relative z-10 flex-1 px-3">
          {NAV.filter(n => !n.authOnly || isAuthenticated).map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link key={href} href={href}
                className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all mb-0.5 ${
                  active
                    ? 'bg-white/10 text-white'
                    : 'text-white/40 hover:text-white/70 hover:bg-white/5'
                }`}>
                <Icon size={14} />
                {label}
              </Link>
            )
          })}

          {isAuthenticated && (
            <Link href="/matches/new"
              className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-accent hover:text-accent-dark transition-all mt-4">
              <Plus size={14} />
              Registrar partida
            </Link>
          )}
        </nav>

        {/* Rodapé da sidebar — usuário */}
        <div className="relative z-10 px-4 pb-6 pt-4 border-t border-white/10">
          {isAuthenticated ? (
            <div>
              <p className="text-white/50 text-xs px-2 mb-2 truncate">{player?.name}</p>
              <button onClick={logout}
                className="flex items-center gap-2 text-white/30 hover:text-red-300 text-xs px-2 py-1.5 w-full transition-colors">
                <LogOut size={11} />
                Sair
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <Link href="/login"
                className="block text-center text-sm font-bold text-brand bg-accent py-2.5 hover:bg-accent-dark transition-colors w-full">
                Entrar
              </Link>
              <Link href="/login"
                className="block text-center text-xs text-white/30 hover:text-white/50 py-1 transition-colors">
                Criar conta grátis
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ── Conteúdo direito ── */}
      <div className="flex-1 flex flex-col min-w-0 bg-gray-50">

        {/* Header mobile */}
        <header className="lg:hidden bg-white border-b border-gray-100 sticky top-0 z-50">
          <div className="px-6 h-14 flex items-center justify-between">
            <Link href="/" className="text-xl font-black text-brand tracking-wider">RANK</Link>
            <nav className="flex items-center gap-4">
              {NAV.filter(n => !n.authOnly || isAuthenticated).map(({ href, label }) => (
                <Link key={href} href={href}
                  className={`text-sm transition-colors ${
                    pathname === href ? 'text-brand font-semibold' : 'text-gray-400 hover:text-gray-700'
                  }`}>
                  {label}
                </Link>
              ))}
              {isAuthenticated && (
                <button onClick={logout}
                  className="text-sm text-gray-400 hover:text-red-400 transition-colors">
                  Sair
                </button>
              )}
            </nav>
          </div>
        </header>

        {children}
      </div>
    </div>
  )
}
