import Link from 'next/link'
import { Header } from '@/components/layout/header'

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="mb-2">
          <span className="text-5xl font-black tracking-tight text-brand">RANK</span>
          <span className="inline-block w-3 h-3 rounded-full bg-accent ml-1 mb-1" />
        </div>
        <p className="text-sm font-semibold tracking-widest text-accent uppercase mb-4">
          JOGUE, CONECTE, EVOLUA.
        </p>
        <p className="text-xl text-gray-600 mb-8 max-w-xl mx-auto">
          Ranking esportivo da sua cidade. Registre partidas, suba no ELO e conecte-se com outros atletas.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            href="/ranking"
            className="bg-brand text-white px-6 py-3 rounded-lg font-medium hover:bg-brand-dark transition-colors"
          >
            Ver Ranking
          </Link>
          <Link
            href="/register"
            className="border border-brand text-brand px-6 py-3 rounded-lg font-medium hover:bg-brand-light transition-colors"
          >
            Cadastre-se
          </Link>
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="text-3xl mb-3">🏆</div>
            <h3 className="font-semibold text-gray-900 mb-2">Ranking ELO</h3>
            <p className="text-gray-600 text-sm">
              Sistema ELO justo — seu ranking reflete o nível real dos adversários que você venceu.
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="text-3xl mb-3">📅</div>
            <h3 className="font-semibold text-gray-900 mb-2">Agende Partidas</h3>
            <p className="text-gray-600 text-sm">
              Organize partidas individuais, duplas ou coletivas e encontre adversários na sua cidade.
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="text-3xl mb-3">✅</div>
            <h3 className="font-semibold text-gray-900 mb-2">Resultados Verificados</h3>
            <p className="text-gray-600 text-sm">
              Adversário confirma o resultado ou pode solicitar revisão. Resultados confiáveis.
            </p>
          </div>
        </div>
      </main>
    </>
  )
}
