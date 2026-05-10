import Link from 'next/link'
import { Header } from '@/components/layout/header'

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          🎾 Tennis Rank
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-xl mx-auto">
          Descubra sua posição no ranking local, registre partidas e evolua seu ELO na cidade.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            href="/ranking"
            className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            Ver Ranking
          </Link>
          <Link
            href="/register"
            className="border border-green-600 text-green-600 px-6 py-3 rounded-lg font-medium hover:bg-green-50 transition-colors"
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
            <div className="text-3xl mb-3">📊</div>
            <h3 className="font-semibold text-gray-900 mb-2">Histórico Completo</h3>
            <p className="text-gray-600 text-sm">
              Acompanhe todas as suas partidas, evolução do ELO e estatísticas de vitórias.
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
