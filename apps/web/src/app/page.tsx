'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { TrendingUp, ShieldCheck, CalendarDays, MapPin, Target, Coins, ArrowRight, ChevronRight } from 'lucide-react'
import {
  TennisIcon, TableTennisIcon, BadmintonIcon,
  SoccerIcon, BasketballIcon, VolleyballIcon,
} from '@/components/icons/sport-icons'

const TEAL = '#00BFA5'

const PHOTOS = [
  { src: '/sports/athlete-1.jpg', pos: 'center 15%' },
  { src: '/sports/athlete-2.jpg', pos: 'center 30%' },
  { src: '/sports/athlete-3.jpg', pos: 'center center' },
  { src: '/sports/athlete-4.jpg', pos: 'center 20%' },
]

const sports = [
  { Icon: TennisIcon,      name: 'Tênis',        slug: 'tennis',       sub: 'Simples · Duplas · Misto' },
  { Icon: TableTennisIcon, name: 'Tênis de Mesa', slug: 'table_tennis', sub: 'Individual · Duplas' },
  { Icon: BadmintonIcon,   name: 'Badminton',     slug: 'badminton',    sub: 'Simples · Duplas · Misto' },
  { Icon: SoccerIcon,      name: 'Futebol',       slug: 'soccer',       sub: 'Fut 5 · 7 · 11' },
  { Icon: BasketballIcon,  name: 'Basquete',      slug: 'basketball',   sub: '3×3 · 5×5' },
  { Icon: VolleyballIcon,  name: 'Vôlei',         slug: 'volleyball',   sub: 'Quadra · Praia' },
]

const features = [
  { Icon: TrendingUp,   title: 'Rating justo',           desc: 'Quanto mais forte o adversário, maior a recompensa. ELO reflete o nível real.' },
  { Icon: ShieldCheck,  title: 'Resultados verificados', desc: 'O adversário confirma o placar ou solicita revisão. Confiabilidade em cada partida.' },
  { Icon: CalendarDays, title: 'Agenda de partidas',     desc: 'Marque desafios, encontre adversários na sua cidade e organize torneios.' },
  { Icon: MapPin,       title: 'Ranking por localidade', desc: 'Filtre por cidade, estado ou clube. Seja referência no seu território.' },
  { Icon: Target,       title: 'Nível por esporte',      desc: 'Iniciante, intermediário ou avançado. Encontre adversários no ritmo certo.' },
  { Icon: Coins,        title: 'Boletas & apostas',      desc: 'Aposte boletas em partidas e duplique seus ganhos acertando o vencedor.' },
]

const steps = [
  { n: '01', title: 'Cadastre-se', desc: 'Escolha seu esporte e defina seu nível de jogo.' },
  { n: '02', title: 'Jogue',       desc: 'Dispute partidas contra atletas da sua cidade.' },
  { n: '03', title: 'Registre',    desc: 'Lance o resultado. O adversário confirma em 48h.' },
  { n: '04', title: 'Evolua',      desc: 'Seu Rating sobe ou cai. O ranking nunca mente.' },
]

const stats = [
  { value: '10k+', label: 'Atletas' },
  { value: '50k+', label: 'Partidas' },
  { value: '12',   label: 'Esportes' },
  { value: '200+', label: 'Cidades' },
]

export default function HomePage() {
  const [slide, setSlide] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setSlide(s => (s + 1) % PHOTOS.length), 4500)
    return () => clearInterval(t)
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: '#0B1520', color: '#E6EDF3' }}>
      <Header />

      {/* ══ HERO ══ */}
      <section style={{ position: 'relative', overflow: 'hidden', minHeight: '92vh', display: 'flex', alignItems: 'center' }}>

        {/* Athlete photo carousel — full background */}
        {PHOTOS.map(({ src, pos }, i) => (
          <div key={i} style={{
            position: 'absolute', inset: 0,
            backgroundImage: `url('${src}')`,
            backgroundSize: 'cover',
            backgroundPosition: pos,
            filter: 'brightness(0.35) saturate(0.7)',
            opacity: i === slide ? 1 : 0,
            transition: 'opacity 1.4s ease-in-out',
          }} />
        ))}

        {/* Gradient overlay */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'linear-gradient(105deg, rgba(11,21,32,0.92) 0%, rgba(11,21,32,0.65) 50%, rgba(11,21,32,0.30) 100%)',
        }} />

        {/* Bottom fade */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 180, pointerEvents: 'none',
          background: 'linear-gradient(to bottom, transparent, #0B1520)',
        }} />

        {/* Slide indicators */}
        <div style={{ position: 'absolute', bottom: 32, right: 40, display: 'flex', gap: 8, zIndex: 10 }}>
          {PHOTOS.map((_, i) => (
            <button key={i} onClick={() => setSlide(i)} style={{
              width: i === slide ? 24 : 8, height: 8,
              borderRadius: 4, border: 'none', cursor: 'pointer',
              background: i === slide ? TEAL : 'rgba(255,255,255,0.25)',
              transition: 'all 0.4s',
              padding: 0,
            }} />
          ))}
        </div>

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 10, maxWidth: 1120, margin: '0 auto', padding: '0 32px', width: '100%' }}>
          <div style={{ maxWidth: 620 }}>
            <p style={{ color: TEAL, fontWeight: 600, fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 20 }}>
              Ranking esportivo urbano
            </p>
            <h1 style={{ fontSize: 'clamp(3rem, 6vw, 5rem)', fontWeight: 900, lineHeight: 1.05, marginBottom: 24, color: '#fff' }}>
              JOGUE.<br />CONECTE.<br />
              <span style={{ color: TEAL }}>EVOLUA.</span>
            </h1>
            <p style={{ color: 'rgba(230,237,243,0.55)', fontSize: 16, lineHeight: 1.7, marginBottom: 40, maxWidth: 460 }}>
              Registre partidas, suba no ranking e mostre quem manda na sua cidade.
              Mais de 10 mil atletas já competem na plataforma.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              <Link href="/login" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: TEAL, color: '#0B1520', fontWeight: 700,
                padding: '14px 28px', borderRadius: 10, fontSize: 14,
                textDecoration: 'none', transition: 'opacity .2s',
              }}>
                Criar conta grátis <ArrowRight size={15} />
              </Link>
              <Link href="/ranking" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                border: '1px solid rgba(230,237,243,0.2)', color: 'rgba(230,237,243,0.7)',
                fontWeight: 500, padding: '14px 28px', borderRadius: 10, fontSize: 14,
                textDecoration: 'none', transition: 'border-color .2s',
              }}>
                Ver ranking <ChevronRight size={15} />
              </Link>
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, marginTop: 72 }}>
            {stats.map(stat => (
              <div key={stat.label}>
                <p style={{ fontSize: 28, fontWeight: 900, color: TEAL, lineHeight: 1 }}>{stat.value}</p>
                <p style={{ fontSize: 11, color: 'rgba(230,237,243,0.35)', textTransform: 'uppercase', letterSpacing: '0.14em', marginTop: 4 }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ ESPORTES ══ */}
      <section style={{ padding: '96px 32px', maxWidth: 1120, margin: '0 auto' }}>
        <p style={{ color: TEAL, fontWeight: 600, fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 8 }}>Modalidades</p>
        <h2 style={{ fontSize: 28, fontWeight: 800, color: '#E6EDF3', marginBottom: 40 }}>Escolha seu esporte</h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
          {sports.map(({ Icon, name, slug, sub }) => (
            <Link key={slug} href={`/ranking?sport=${slug}`} style={{
              display: 'block', padding: '28px 24px',
              background: '#101C2C', border: '1px solid #1E2D40',
              borderRadius: 14, textDecoration: 'none',
              transition: 'border-color .2s, background .2s',
            }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = TEAL
                ;(e.currentTarget as HTMLElement).style.background = '#0D1825'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = '#1E2D40'
                ;(e.currentTarget as HTMLElement).style.background = '#101C2C'
              }}
            >
              <Icon size={26} color={TEAL} style={{ marginBottom: 14, opacity: 0.7 }} />
              <h3 style={{ fontWeight: 700, color: '#E6EDF3', fontSize: 15, marginBottom: 4 }}>{name}</h3>
              <p style={{ fontSize: 12, color: 'rgba(230,237,243,0.35)', marginBottom: 16 }}>{sub}</p>
              <span style={{ fontSize: 11, fontWeight: 700, color: TEAL, letterSpacing: '0.1em', textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                Ranking <ArrowRight size={10} />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ══ COMO FUNCIONA ══ */}
      <section style={{ background: '#0D1825', padding: '96px 32px' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <p style={{ color: TEAL, fontWeight: 600, fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 8 }}>Simples assim</p>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: '#E6EDF3', marginBottom: 48 }}>Como funciona</h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
            {steps.map((step, i) => (
              <div key={step.n} style={{
                padding: '36px 28px',
                background: i === 0 ? TEAL : '#101C2C',
                border: `1px solid ${i === 0 ? TEAL : '#1E2D40'}`,
                borderRadius: 14,
              }}>
                <p style={{ fontSize: 52, fontWeight: 900, lineHeight: 1, marginBottom: 20, color: i === 0 ? 'rgba(11,21,32,0.15)' : 'rgba(230,237,243,0.06)' }}>
                  {step.n}
                </p>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10, color: i === 0 ? '#0B1520' : '#E6EDF3' }}>{step.title}</h3>
                <p style={{ fontSize: 13, lineHeight: 1.6, color: i === 0 ? 'rgba(11,21,32,0.6)' : 'rgba(230,237,243,0.4)' }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ RECURSOS ══ */}
      <section style={{ padding: '96px 32px', maxWidth: 1120, margin: '0 auto' }}>
        <p style={{ color: TEAL, fontWeight: 600, fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 8 }}>Recursos</p>
        <h2 style={{ fontSize: 28, fontWeight: 800, color: '#E6EDF3', marginBottom: 48 }}>Tudo que você precisa</h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {features.map(({ Icon, title, desc }) => (
            <div key={title} style={{
              padding: '28px 24px',
              background: '#101C2C', border: '1px solid #1E2D40',
              borderRadius: 14,
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                border: `1px solid #1E2D40`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 20,
              }}>
                <Icon size={16} color={TEAL} strokeWidth={1.5} />
              </div>
              <h3 style={{ fontWeight: 700, color: '#E6EDF3', fontSize: 14, marginBottom: 8 }}>{title}</h3>
              <p style={{ fontSize: 13, color: 'rgba(230,237,243,0.4)', lineHeight: 1.65 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══ CTA ══ */}
      <section style={{ background: '#0D1825', borderTop: '1px solid #1E2D40', padding: '80px 32px' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 32 }}>
          <div>
            <h2 style={{ fontSize: 30, fontWeight: 900, color: '#E6EDF3', marginBottom: 8 }}>
              Pronto para subir no ranking?
            </h2>
            <p style={{ color: 'rgba(230,237,243,0.4)', fontSize: 14 }}>Cadastre-se agora. É gratuito por 3 meses.</p>
          </div>
          <Link href="/login" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: TEAL, color: '#0B1520', fontWeight: 700,
            padding: '16px 36px', borderRadius: 10, fontSize: 14,
            textDecoration: 'none', whiteSpace: 'nowrap',
          }}>
            Criar conta grátis <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer style={{ background: '#080F1A', borderTop: '1px solid #1E2D40', padding: '64px 32px 40px' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 40, marginBottom: 48 }}>
            <div style={{ gridColumn: 'span 2' }}>
              <p style={{ fontWeight: 900, fontSize: 20, letterSpacing: '0.15em', color: '#E6EDF3', marginBottom: 12 }}>RANKESA</p>
              <p style={{ color: 'rgba(230,237,243,0.25)', fontSize: 13, lineHeight: 1.7, maxWidth: 280 }}>
                O ranking esportivo da sua cidade. Registre, compita e evolua com atletas do seu nível.
              </p>
            </div>
            <div>
              <p style={{ fontWeight: 700, fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 20, color: TEAL }}>Plataforma</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[['Ranking', '/ranking'], ['Partidas', '/schedule'], ['Boletas', '/boletas'], ['Entrar', '/login']].map(([l, h]) => (
                  <li key={h}>
                    <Link href={h} style={{ color: 'rgba(230,237,243,0.3)', fontSize: 13, textDecoration: 'none' }}>{l}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p style={{ fontWeight: 700, fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 20, color: TEAL }}>Esportes</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {sports.slice(0, 4).map(s => (
                  <li key={s.slug}>
                    <Link href={`/ranking?sport=${s.slug}`} style={{ color: 'rgba(230,237,243,0.3)', fontSize: 13, textDecoration: 'none' }}>{s.name}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div style={{ borderTop: '1px solid #1E2D40', paddingTop: 24, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 }}>
            <p style={{ color: 'rgba(230,237,243,0.15)', fontSize: 12 }}>© 2026 RANKESA. Todos os direitos reservados.</p>
            <p style={{ color: 'rgba(230,237,243,0.15)', fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Jogue · Conecte · Evolua</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
