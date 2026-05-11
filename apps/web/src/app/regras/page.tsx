'use client'

export const dynamic = 'force-dynamic'

import { PageLayout } from '@/components/layout/page-layout'
import {
  Crown, Users, Pencil, UserX, Trash2, ShieldCheck,
  Swords, Flag, Coins, AlertTriangle, BookOpen,
} from 'lucide-react'

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="mb-12">
      <div className="flex items-center gap-3 mb-5">
        <Icon size={16} className="text-brand" />
        <h2 className="text-lg font-black text-gray-900 tracking-tight">{title}</h2>
      </div>
      {children}
    </div>
  )
}

function Rule({
  number,
  title,
  body,
  highlight,
}: {
  number: number
  title: string
  body: string
  highlight?: string
}) {
  return (
    <div className="flex gap-4 mb-4 last:mb-0">
      <div className="w-7 h-7 bg-brand text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
        {number}
      </div>
      <div>
        <p className="font-bold text-gray-900 text-sm mb-0.5">{title}</p>
        <p className="text-sm text-gray-500 leading-relaxed">{body}</p>
        {highlight && (
          <p className="text-xs font-bold text-orange-500 mt-1">{highlight}</p>
        )}
      </div>
    </div>
  )
}

function InfoBox({
  icon: Icon,
  color,
  title,
  items,
}: {
  icon: React.ElementType
  color: string
  title: string
  items: string[]
}) {
  return (
    <div className={`border ${color} p-5`}>
      <div className="flex items-center gap-2 mb-3">
        <Icon size={14} className="shrink-0" />
        <p className="text-xs font-black tracking-widest uppercase">{title}</p>
      </div>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm">
            <span className="text-brand font-bold mt-0.5 shrink-0">·</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function RegrasPage() {
  return (
    <PageLayout>
      <main className="max-w-3xl mx-auto px-6 py-14">

        {/* Hero */}
        <div className="mb-14">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen size={14} className="text-accent" />
            <p className="text-xs font-black tracking-[0.3em] uppercase text-accent">
              Regras de Utilização
            </p>
          </div>
          <h1 className="text-4xl font-black text-gray-900 leading-tight mb-4">
            Regras da plataforma
          </h1>
          <p className="text-gray-500 text-base leading-relaxed max-w-xl">
            Para manter a competição justa e respeitosa, todos os usuários devem seguir
            estas regras. O descumprimento pode resultar em penalidades de boletas,
            suspensão ou banimento da plataforma.
          </p>
        </div>

        {/* 1. Organizador de Partida */}
        <Section icon={Crown} title="Direitos do Organizador de Partida">
          <p className="text-sm text-gray-500 mb-5 leading-relaxed">
            Quem cria um agendamento de partida torna-se automaticamente seu{' '}
            <strong className="text-gray-700">organizador</strong> e possui autoridade exclusiva
            sobre aquele evento durante toda a sua vigência.
          </p>

          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            <InfoBox
              icon={Crown}
              color="border-brand/20 text-brand/70"
              title="Pode fazer"
              items={[
                'Editar título, descrição, data, horário e local',
                'Aumentar ou reduzir o número de vagas',
                'Remover qualquer participante da partida',
                'Cancelar o agendamento a qualquer momento',
                'Registrar o resultado da partida após a data',
              ]}
            />
            <InfoBox
              icon={ShieldCheck}
              color="border-gray-200 text-gray-500"
              title="Responsabilidades"
              items={[
                'Registrar o resultado após a partida acontecer',
                'Comunicar alterações com antecedência',
                'Cancelamentos tardios geram −15 boletas',
                'Não registrar resultado: −10 boletas após 48h',
                'Só o organizador responde pela gestão do evento',
              ]}
            />
          </div>

          <div className="border border-brand/15 bg-brand/5 px-5 py-4 mb-2">
            <p className="text-xs font-black text-brand tracking-widest uppercase mb-2">
              Como funciona o controle de participantes
            </p>
            <p className="text-sm text-gray-600 leading-relaxed">
              Qualquer jogador pode solicitar participação em uma partida aberta.
              O organizador pode{' '}
              <strong>remover qualquer participante</strong> até o início da partida —
              clicando no ícone <span className="inline-flex items-center gap-1 text-red-500 font-semibold"><UserX size={12} />remover</span>{' '}
              ao lado do nome na lista de participantes. Após o início (data passada),
              a lista é considerada definitiva para fins de registro de resultado.
            </p>
          </div>
        </Section>

        {/* 2. Registro de Resultados */}
        <Section icon={Swords} title="Registro de Resultados">
          <div className="border border-gray-100 divide-y divide-gray-100">
            {[
              {
                number: 1,
                title: 'Quem registra é responsável pela veracidade',
                body: 'O jogador que registra um resultado declara que as informações são corretas. Resultados falsos são considerados fraude.',
              },
              {
                number: 2,
                title: 'O adversário tem 48h para confirmar ou disputar',
                body: 'Após o registro, o adversário recebe notificação e pode confirmar ou abrir uma disputa. Sem resposta em 48h, o resultado é confirmado automaticamente.',
              },
              {
                number: 3,
                title: 'Disputas são resolvidas pelo administrador',
                body: 'Em caso de disputa, o administrador analisará as evidências e decidirá o resultado correto. A decisão é final.',
              },
              {
                number: 4,
                title: 'Resultado falso: penalidade severa',
                body: 'Se o administrador corrigir o resultado, o responsável pelo registro incorreto recebe −50 boletas + suspensão progressiva.',
                highlight: '1ª vez: 7 dias · 2ª vez: 14 dias · 3ª vez: 30 dias + análise de banimento',
              },
            ].map(r => (
              <div key={r.number} className="p-5">
                <Rule {...r} />
              </div>
            ))}
          </div>
        </Section>

        {/* 3. Conduta */}
        <Section icon={Flag} title="Conduta Desportiva">
          <p className="text-sm text-gray-500 mb-5 leading-relaxed">
            O RANK preza pelo fair play. Comportamentos inadequados dentro ou fora das quadras,
            quando relatados e confirmados, são punidos da mesma forma que fraude de resultados.
          </p>

          <div className="border border-gray-100 p-5 space-y-4">
            {[
              {
                number: 1,
                title: 'Qualquer participante pode reportar má conduta',
                body: 'Após uma partida confirmada, os jogadores têm a opção de reportar comportamento inadequado do adversário.',
              },
              {
                number: 2,
                title: 'O administrador analisa todas as denúncias',
                body: 'Todas as denúncias são registradas e revisadas. Denúncias infundadas ou de má-fé também podem ser penalizadas.',
              },
              {
                number: 3,
                title: 'Punições progressivas',
                body: 'Má conduta confirmada resulta em −50 boletas + suspensão progressiva, idêntica às penalidades por resultado falso.',
              },
            ].map(r => <Rule key={r.number} {...r} />)}
          </div>
        </Section>

        {/* 4. Suspensões */}
        <Section icon={AlertTriangle} title="Sistema de Suspensão">
          <div className="grid sm:grid-cols-3 gap-3 mb-5">
            {[
              { n: '1ª infração', days: '7 dias', cls: 'border-yellow-200 bg-yellow-50 text-yellow-700' },
              { n: '2ª infração', days: '14 dias', cls: 'border-orange-200 bg-orange-50 text-orange-700' },
              { n: '3ª infração', days: '30 dias', cls: 'border-red-200 bg-red-50 text-red-700' },
            ].map(s => (
              <div key={s.n} className={`border ${s.cls} p-4 text-center`}>
                <p className="text-xs font-black tracking-wide uppercase mb-1">{s.n}</p>
                <p className="text-2xl font-black">{s.days}</p>
                <p className="text-xs mt-1 opacity-70">de suspensão</p>
              </div>
            ))}
          </div>
          <div className="border border-red-100 bg-red-50 px-5 py-4">
            <p className="text-sm text-red-600 leading-relaxed">
              <strong>A partir da 3ª infração</strong>, a conta é marcada para análise de banimento permanente.
              O administrador pode encerrar a conta sem aviso prévio.
            </p>
          </div>
        </Section>

        {/* 5. Boletas */}
        <Section icon={Coins} title="Boletas — Resumo Rápido">
          <div className="border border-gray-100 divide-y divide-gray-100 text-sm">
            {[
              { action: 'Cadastrar-se na plataforma',    value: '+100 boletas', cls: 'text-accent' },
              { action: 'Registrar uma partida',          value: '+5 boletas',  cls: 'text-accent' },
              { action: 'Confirmar partida do adversário',value: '+10 boletas', cls: 'text-accent' },
              { action: 'Vencer uma partida',             value: '+20 boletas', cls: 'text-accent' },
              { action: 'Cancelar agendamento',           value: '−15 boletas', cls: 'text-red-500' },
              { action: 'Não registrar resultado em 48h', value: '−10 boletas', cls: 'text-red-500' },
              { action: 'Resultado falso / má conduta',   value: '−50 boletas + suspensão', cls: 'text-red-600 font-semibold' },
            ].map((row, i) => (
              <div key={i} className="flex items-center justify-between px-5 py-3.5">
                <span className="text-gray-600">{row.action}</span>
                <span className={`font-bold shrink-0 ml-4 ${row.cls}`}>{row.value}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-3">
            Para entender apostas e regras detalhadas de boletas,{' '}
            <a href="/boletas" className="text-brand hover:underline font-medium">acesse a página de Boletas</a>.
          </p>
        </Section>

        {/* 6. Candidatura e Participação */}
        <Section icon={Users} title="Candidatura e Participação">
          <p className="text-sm text-gray-500 mb-5 leading-relaxed">
            As partidas agendadas seguem um fluxo de <strong>candidatura e aprovação</strong>:
            qualquer jogador cadastrado no esporte pode solicitar participação, e o organizador
            decide quem entra.
          </p>

          <div className="border border-brand/10 bg-brand/3 px-5 py-4 mb-6">
            <p className="text-xs font-black text-brand tracking-widest uppercase mb-3">
              Fluxo de participação
            </p>
            <ol className="space-y-2">
              {[
                'Jogador clica em "Solicitar participação" → candidatura fica pendente',
                'Organizador vê a fila de candidatos e aprova ou rejeita cada um',
                'Candidato aprovado recebe confirmação e entra na lista de confirmados',
                'Candidato rejeitado pode tentar novamente em outra partida',
                'Confirmado que não comparecer fica sujeito às penalidades da plataforma',
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                  <span className="w-5 h-5 bg-brand text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          <div className="border border-gray-100 divide-y divide-gray-100">
            {[
              {
                number: 1,
                title: 'Só pode criar partidas no esporte cadastrado',
                body: 'O organizador só pode criar agendamentos para o esporte em que se cadastrou na plataforma.',
              },
              {
                number: 2,
                title: 'Jogadores suspensos não podem participar',
                body: 'Durante o período de suspensão, não é possível criar ou entrar em agendamentos, registrar partidas ou fazer apostas.',
              },
              {
                number: 3,
                title: 'O organizador tem poder total de aceitar e recusar',
                body: 'O organizador pode aprovar ou rejeitar qualquer candidato sem necessidade de justificativa. Candidatos rejeitados não são penalizados.',
              },
              {
                number: 4,
                title: 'Comprometimento é essencial',
                body: 'Ao ser aprovado em uma partida, o jogador se compromete a comparecer. Ausências injustificadas podem ser reportadas e acarretam penalidades.',
              },
              {
                number: 5,
                title: 'Respeito obrigatório',
                body: 'Linguagem ofensiva, ameaças ou qualquer forma de desrespeito — dentro da plataforma ou nas partidas — são motivo de punição imediata.',
              },
            ].map(r => (
              <div key={r.number} className="p-5">
                <Rule {...r} />
              </div>
            ))}
          </div>
        </Section>

        {/* 7. Edição */}
        <Section icon={Pencil} title="Edição de Agendamentos">
          <p className="text-sm text-gray-500 mb-5 leading-relaxed">
            O organizador pode editar os detalhes do agendamento enquanto o status for{' '}
            <strong>Aberto</strong> ou <strong>Lotado</strong>.
          </p>
          <div className="border border-gray-100 divide-y divide-gray-100">
            {[
              {
                number: 1,
                title: 'Campos editáveis',
                body: 'Título, descrição, data, horário, local, cidade e número máximo de vagas podem ser alterados a qualquer momento antes do início.',
              },
              {
                number: 2,
                title: 'Não é possível reduzir vagas abaixo do total de confirmados',
                body: 'Se já há 4 jogadores confirmados, o mínimo de vagas passa a ser 4. Isso garante que nenhum jogador seja removido involuntariamente pela redução de vagas.',
              },
              {
                number: 3,
                title: 'Agendamentos cancelados ou concluídos não podem ser editados',
                body: 'Após cancelamento ou conclusão, os dados do agendamento são preservados para histórico e não podem ser alterados.',
              },
            ].map(r => (
              <div key={r.number} className="p-5">
                <Rule {...r} />
              </div>
            ))}
          </div>
        </Section>

        {/* 8. MVP */}
        <Section icon={Crown} title="Eleição do MVP">
          <p className="text-sm text-gray-500 mb-5 leading-relaxed">
            Em partidas com <strong>3 ou mais participantes</strong>, cada jogador aprovado pode
            votar no melhor da partida após a data de realização.
          </p>
          <div className="border border-gray-100 divide-y divide-gray-100">
            {[
              {
                number: 1,
                title: 'Votação disponível após a data da partida',
                body: 'O botão de votação aparece automaticamente depois que a data/hora da partida passou.',
              },
              {
                number: 2,
                title: 'Cada participante vota uma vez',
                body: 'Não é possível alterar o voto após a confirmação. Votar em si mesmo não é permitido.',
              },
              {
                number: 3,
                title: 'O MVP recebe +10 boletas',
                body: 'O jogador com mais votos é declarado MVP. Em caso de empate, o primeiro a atingir o máximo de votos vence.',
              },
              {
                number: 4,
                title: 'Não obrigatório',
                body: 'A votação é opcional. Se nem todos votarem, a plataforma aguarda as votações. O resultado é exibido na página da partida.',
              },
            ].map(r => (
              <div key={r.number} className="p-5">
                <Rule {...r} />
              </div>
            ))}
          </div>
        </Section>

        {/* Footer */}
        <div className="border-t border-gray-100 pt-8 mt-4">
          <p className="text-xs text-gray-400 leading-relaxed">
            Estas regras podem ser atualizadas a qualquer momento. O uso contínuo da
            plataforma implica concordância com as regras vigentes.
            Dúvidas ou reportes de abuso:{' '}
            <a href="mailto:contato@rank.app" className="text-brand hover:underline">
              contato@rank.app
            </a>
          </p>
        </div>
      </main>
    </PageLayout>
  )
}
