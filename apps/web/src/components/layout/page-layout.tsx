'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { BarChart2, BookOpen, Calendar, Coins, LayoutDashboard, LogOut, Plus } from 'lucide-react'
import { RankesaLogo } from '@/components/ui/rankesa-logo'

const NAV = [
  { href: '/ranking',   label: 'Ranking',  icon: BarChart2 },
  { href: '/schedule',  label: 'Partidas', icon: Calendar },
  { href: '/dashboard', label: 'Painel',   icon: LayoutDashboard, authOnly: true },
  { href: '/boletas',   label: 'Boletas',  icon: Coins },
  { href: '/regras',    label: 'Regras',   icon: BookOpen },
]

const TEAL = '#00BFA5'

export function PageLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, player, logout } = useAuth()
  const pathname = usePathname()

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#0D1117' }}>

      {/* ── Sidebar desktop ── */}
      <div className="hidden lg:flex" style={{
        width: 220, flexShrink: 0, flexDirection: 'column',
        background: '#0D1117', borderRight: '1px solid #1C2333',
        position: 'sticky', top: 0, height: '100vh', overflow: 'hidden',
      }}>
        <div style={{ padding: '24px 20px 20px' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <RankesaLogo size={28} />
          </Link>
        </div>

        <nav style={{ flex: 1, padding: '4px 12px' }}>
          {NAV.filter(n => !n.authOnly || isAuthenticated).map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link key={href} href={href}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px', borderRadius: 8, marginBottom: 2,
                  fontSize: 14, fontWeight: active ? 600 : 500,
                  color: active ? TEAL : '#6B7A8D',
                  background: active ? 'rgba(0,191,165,0.08)' : 'transparent',
                  textDecoration: 'none', transition: 'color .15s, background .15s',
                }}
              >
                <Icon size={15} />
                {label}
              </Link>
            )
          })}

          {isAuthenticated && (
            <Link href="/matches/new"
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', borderRadius: 8, marginTop: 16,
                fontSize: 14, fontWeight: 600, color: TEAL,
                background: 'rgba(0,191,165,0.08)', border: '1px solid rgba(0,191,165,0.15)',
                textDecoration: 'none',
              }}
            >
              <Plus size={14} /> Registrar partida
            </Link>
          )}
        </nav>

        <div style={{ padding: '16px 20px 24px', borderTop: '1px solid #1C2333' }}>
          {isAuthenticated ? (
            <div>
              <p style={{ color: '#4A5A6A', fontSize: 12, marginBottom: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {player?.name}
              </p>
              <button onClick={logout}
                style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#4A5A6A', fontSize: 12, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                onMouseEnter={e => (e.currentTarget.style.color = '#F87171')}
                onMouseLeave={e => (e.currentTarget.style.color = '#4A5A6A')}
              >
                <LogOut size={12} /> Sair
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Link href="/login"
                style={{ display: 'block', textAlign: 'center', fontSize: 13, fontWeight: 700, color: '#0D1117', background: TEAL, padding: '10px 0', borderRadius: 8, textDecoration: 'none' }}>
                Entrar
              </Link>
              <Link href="/login"
                style={{ display: 'block', textAlign: 'center', fontSize: 12, color: '#4A5A6A', textDecoration: 'none' }}>
                Criar conta grátis
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, background: '#0D1117' }}>

        {/* Mobile header */}
        <header className="lg:hidden" style={{
          background: '#0D1117', borderBottom: '1px solid #1C2333',
          position: 'sticky', top: 0, zIndex: 50,
        }}>
          <div style={{ padding: '0 20px', height: 54, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <RankesaLogo size={22} />
            </Link>
            <nav style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              {NAV.filter(n => !n.authOnly || isAuthenticated).map(({ href, label }) => (
                <Link key={href} href={href}
                  style={{
                    fontSize: 13, textDecoration: 'none',
                    color: pathname === href ? TEAL : '#6B7A8D',
                    fontWeight: pathname === href ? 600 : 400,
                  }}
                >
                  {label}
                </Link>
              ))}
              {isAuthenticated && (
                <button onClick={logout}
                  style={{ fontSize: 13, color: '#6B7A8D', background: 'none', border: 'none', cursor: 'pointer' }}>
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
