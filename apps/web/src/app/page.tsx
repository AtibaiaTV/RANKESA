import Image from 'next/image'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { TrendingUp, ShieldCheck, CalendarDays, MapPin, Target, Coins, ArrowRight } from 'lucide-react'
import {
  TennisIcon, TableTennisIcon, BadmintonIcon,
  SoccerIcon, BasketballIcon, VolleyballIcon,
} from '@/components/icons/sport-icons'

const sports = [
  { Icon: TennisIcon,      name: 'Tênis',        slug: 'tennis',       sub: 'Simples · Duplas · Misto' },
  { Icon: TableTennisIcon, name: 'Tênis de Mesa', slug: 'table_tennis', sub: 'Individual · Duplas' },
  { Icon: BadmintonIcon,   name: 'Badminton',     slug: 'badminton',    sub: 'Simples · Duplas · Misto' },
  { Icon: SoccerIcon,      name: 'Futebol',       slug: 'soccer',       sub: 'Fut 5 · 7 · 11' },
  { Icon: BasketballIcon,  name: 'Basquete',      slug: 'basketball',   sub: '3×3 · 5×5' },
  { Icon: VolleyballIcon,  name: 'Vôlei',         slug: 'volleyball',   sub: 'Quadra · Praia' },
]

const features = [
  { Icon: TrendingUp,   title: 'Ranking de Rating justo',     desc: 'Quanto mais forte o adversário, maior a recompensa. O sistema de Rating reflete o nível real de cada atleta.' },
  { Icon: ShieldCheck,  title: 'Resultados verificados', desc: 'O adversário confirma o placar ou solicita revisão. Confiabilidade em cada partida registrada.' },
  { Icon: CalendarDays, title: 'Agenda de partidas',     desc: 'Marque desafios, encontre adversários na sua cidade e organize torneios informais.' },
  { Icon: MapPin,       title: 'Ranking por localidade', desc: 'Filtre por cidade, estado, clube ou complexo esportivo. Seja referência no seu território.' },
  { Icon: Target,       title: 'Nível por esporte',      desc: 'Iniciante, intermediário ou avançado. Encontre adversários no ritmo certo de evolução.' },
  { Icon: Coins,        title: 'Boletas & apostas',      desc: 'Aposte boletas em partidas e duplique seus ganhos acertando o vencedor.' },
]

const steps = [
  { n: '01', title: 'Cadastre-se', desc: 'Escolha seu esporte e defina seu nível de jogo.' },
  { n: '02', title: 'Jogue',       desc: 'Dispute partidas contra atletas da sua cidade.' },
  { n: '03', title: 'Registre',    desc: 'Lance o resultado. O adversário confirma em 48h.' },
  { n: '04', title: 'Evolua',      desc: 'Seu Rating sobe ou cai. O ranking nunca mente.' },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* HERO */}
      <section className="bg-brand relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 55% 70% at 85% 50%, rgba(132,194,0,0.10) 0%, transparent 70%)' }} />
        <div className="relative max-w-5xl mx-auto px-8 py-16 md:py-20 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-accent font-semibold text-xs tracking-widest uppercase mb-4">
              Ranking esportivo urbano
            </p>
            <h1 className="text-4xl md:text-5xl font-black text-white leading-tight mb-5">
              JOGUE.<br />CONECTE.<br />
              <span className="text-accent">EVOLUA.</span>
            </h1>
            <p className="text-white/50 text-sm leading-relaxed mb-8 max-w-sm">
              Registre partidas, suba no ranking e mostre quem manda na sua cidade.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/login"
                className="inline-flex items-center gap-2 bg-accent text-brand font-bold px-6 py-3 text-sm hover:bg-accent-dark transition-colors">
                Comece agora <ArrowRight size={14} />
              </Link>
              <Link href="/ranking"
                className="inline-flex items-center gap-2 border border-white/20 text-white/70 font-medium px-6 py-3 text-sm rounded-lg hover:border-white/50 hover:text-white transition-colors">
                Ver ranking
              </Link>
            </div>
          </div>

          <div className="hidden md:grid grid-cols-2 gap-3">
            {[
              { label: 'Atletas',  value: '10k+' },
              { label: 'Partidas', value: '50k+' },
              { label: 'Esportes', value: '12'   },
              { label: 'Cidades',  value: '200+' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/5 border border-white/10 rounded-xl px-6 py-8">
                <p className="text-3xl font-black text-accent leading-none mb-2">{stat.value}</p>
                <p className="text-white/30 text-xs tracking-wide uppercase">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="bg-accent h-0.5" />

      {/* ESPORTES */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-8">
          <p className="text-accent font-semibold text-xs tracking-widest uppercase mb-2">Modalidades</p>
          <h2 className="text-2xl font-bold text-brand mb-8">Escolha seu esporte</h2>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {sports.map(({ Icon, name, slug, sub }) => (
              <Link key={slug} href={`/ranking?sport=${slug}`}
                className="group p-6 bg-gray-50 hover:bg-brand border border-gray-100 hover:border-brand rounded-xl transition-all duration-300">
                <Icon size={28} color="#d1d5db"
                  className="group-hover:opacity-25 transition-opacity mb-4" />
                <h3 className="text-base font-semibold text-gray-900 group-hover:text-white mb-1 transition-colors">
                  {name}
                </h3>
                <p className="text-xs text-gray-400 group-hover:text-white/40 mb-4 transition-colors">
                  {sub}
                </p>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent tracking-wide">
                  Ranking <ArrowRight size={11} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-8">
          <p className="text-accent font-semibold text-xs tracking-widest uppercase mb-2">Simples assim</p>
          <h2 className="text-2xl font-bold text-brand mb-8">Como funciona</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {steps.map((step, i) => (
              <div key={step.n} className={`px-6 py-8 rounded-xl ${i === 0 ? 'bg-brand' : 'bg-white border border-gray-100'}`}>
                <p className={`text-5xl font-black leading-none mb-5 ${i === 0 ? 'text-white/10' : 'text-gray-100'}`}>
                  {step.n}
                </p>
                <h3 className={`text-base font-semibold mb-2 ${i === 0 ? 'text-white' : 'text-gray-900'}`}>
                  {step.title}
                </h3>
                <p className={`text-sm leading-relaxed ${i === 0 ? 'text-white/40' : 'text-gray-400'}`}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-8">
          <p className="text-accent font-semibold text-xs tracking-widest uppercase mb-2">Recursos</p>
          <h2 className="text-2xl font-bold text-brand mb-8">Tudo que você precisa</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {features.map(({ Icon, title, desc }) => (
              <div key={title} className="group p-6 bg-gray-50 border border-gray-100 hover:border-brand/20 hover:bg-white rounded-xl transition-all">
                <div className="w-9 h-9 border border-gray-200 rounded-lg flex items-center justify-center mb-5
                  group-hover:border-brand group-hover:bg-brand transition-all">
                  <Icon size={15} className="text-gray-300 group-hover:text-white transition-colors" strokeWidth={1.5} />
                </div>
                <h3 className="font-semibold text-gray-900 text-sm mb-2">{title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-accent py-14">
        <div className="max-w-5xl mx-auto px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-brand mb-1">
              Pronto para subir no ranking?
            </h2>
            <p className="text-brand/50 text-sm">Cadastre-se agora. É gratuito.</p>
          </div>
          <Link href="/login"
            className="inline-flex items-center gap-2 bg-brand text-white font-bold px-8 py-3 hover:bg-brand-dark transition-colors text-sm whitespace-nowrap">
            Criar conta grátis <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-brand-dark py-12">
        <div className="max-w-5xl mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
            <div className="md:col-span-2">
              <p className="text-white font-black text-xl tracking-widest mb-4">RANK</p>
              <p className="text-white/25 text-sm leading-loose max-w-xs">
                O ranking esportivo da sua cidade. Registre, compete e evolua com atletas do seu nível.
              </p>
            </div>
            <div>
              <p className="font-semibold text-xs tracking-widest uppercase mb-4 text-accent">Plataforma</p>
              <ul className="space-y-3 text-sm text-white/25">
                {[['Ranking', '/ranking'], ['Partidas', '/schedule'], ['Entrar', '/login']].map(([l, h]) => (
                  <li key={h}><Link href={h} className="hover:text-white transition-colors">{l}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-semibold text-xs tracking-widest uppercase mb-4 text-accent">Esportes</p>
              <ul className="space-y-3 text-sm text-white/25">
                {sports.slice(0, 4).map((s) => (
                  <li key={s.slug}>
                    <Link href={`/ranking?sport=${s.slug}`} className="hover:text-white transition-colors">{s.name}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row justify-between items-center gap-3">
            <p className="text-white/15 text-xs">© 2026 RANK. Todos os direitos reservados.</p>
            <p className="text-white/15 text-xs tracking-widest uppercase">Jogue · Conecte · Evolua</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
