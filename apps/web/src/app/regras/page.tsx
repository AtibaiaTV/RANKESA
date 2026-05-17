'use client'
export const dynamic = 'force-dynamic'

import { useState, Fragment } from 'react'
import Link from 'next/link'
import { PageLayout } from '@/components/layout/page-layout'
import {
  ShieldCheck, ChevronDown, ChevronUp,
  CheckCircle2, AlertTriangle, ClipboardList,
  Handshake, Users, Gavel, Coins, Plus,
  Crown, Pencil, AlertCircle, X,
} from 'lucide-react'

const TEAL   = '#00BFA5'
const SURF   = '#161B22'
const SURF2  = '#1C2333'
const BORDER = '#30363D'
const MUTED  = '#8B949E'
const AMBER  = '#F59E0B'
const RED    = '#F87171'

// ── Accordion section data ──────────────────────────────────────────────────
const SECTIONS = [
  {
    id: 1,
    icon: ShieldCheck,
    title: 'Direitos do Organizador',
    content: 'organizer',
  },
  {
    id: 2,
    icon: ClipboardList,
    title: 'Registro de Resultados',
    content: 'results',
  },
  {
    id: 3,
    icon: Handshake,
    title: 'Conduta Desportiva',
    content: 'conduct',
  },
  {
    id: 4,
    icon: Users,
    title: 'Candidatura e Participação',
    content: 'candidacy',
  },
  {
    id: 5,
    icon: Crown,
    title: 'Eleição do MVP',
    content: 'mvp',
  },
  {
    id: 6,
    icon: Pencil,
    title: 'Edição de Agendamentos',
    content: 'editing',
  },
]

const PUNISHMENTS = [
  {
    icon: AlertCircle,
    label: 'Desrespeito / Ofensas',
    p1: { text: 'Advertência',       color: AMBER },
    p2: { text: 'Suspensão 1 partida', color: '#F97316' },
    p3: { text: 'Suspensão 3 partidas', color: RED },
  },
  {
    icon: X,
    label: 'Conduta Antidesportiva',
    p1: { text: 'Advertência',        color: AMBER },
    p2: { text: 'Suspensão 1 partida', color: '#F97316' },
    p3: { text: 'Suspensão 3 partidas', color: RED },
  },
  {
    icon: ClipboardList,
    label: 'Informações Falsas',
    p1: { text: 'Suspensão 1 partida', color: '#F97316' },
    p2: { text: 'Suspensão 3 partidas', color: RED },
    p3: { text: 'Suspensão 6 partidas', color: '#DC2626' },
  },
  {
    icon: Users,
    label: 'W.O. / Ausência',
    p1: { text: 'Derrota por W.O.',    color: AMBER },
    p2: { text: 'Suspensão 1 partida', color: '#F97316' },
    p3: { text: 'Suspensão 3 partidas', color: RED },
  },
]

function PunishmentBadge({ text, color }: { text: string; color: string }) {
  return (
    <span style={{ display: 'inline-block', fontSize: 11, fontWeight: 700, color, background: color + '18', border: `1px solid ${color}40`, borderRadius: 6, padding: '3px 8px', lineHeight: 1.4, whiteSpace: 'nowrap' }}>
      {text}
    </span>
  )
}

function RuleItem({ number, title, body, highlight }: { number: number; title: string; body: string; highlight?: string }) {
  return (
    <div style={{ display: 'flex', gap: 14, padding: '14px 0', borderBottom: `1px solid ${BORDER}` }}>
      <div style={{ width: 26, height: 26, borderRadius: 6, background: `${TEAL}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 12, fontWeight: 900, color: TEAL }}>
        {number}
      </div>
      <div>
        <p style={{ fontSize: 13, fontWeight: 700, color: '#E6EDF3', margin: '0 0 4px' }}>{title}</p>
        <p style={{ fontSize: 12, color: MUTED, lineHeight: 1.6, margin: 0 }}>{body}</p>
        {highlight && <p style={{ fontSize: 11, fontWeight: 700, color: AMBER, marginTop: 4 }}>{highlight}</p>}
      </div>
    </div>
  )
}

function SectionContent({ id }: { id: string }) {
  if (id === 'organizer') return (
    <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {/* Pode Fazer */}
        <div style={{ background: SURF2, border: `1px solid ${TEAL}30`, borderRadius: 10, padding: '14px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <CheckCircle2 size={14} style={{ color: TEAL }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: TEAL }}>Pode Fazer</span>
          </div>
          {[
            'Criar e gerenciar competições',
            'Definir regras e formato dos torneios',
            'Validar ou anular partidas',
            'Aplicar punições conforme as regras',
            'Gerenciar inscrições e participantes',
            'Atualizar resultados e classificações',
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
              <CheckCircle2 size={12} style={{ color: TEAL, marginTop: 2, flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: '#C9D1D9', lineHeight: 1.4 }}>{item}</span>
            </div>
          ))}
        </div>

        {/* Responsabilidades */}
        <div style={{ background: SURF2, border: `1px solid ${AMBER}30`, borderRadius: 10, padding: '14px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <AlertTriangle size={14} style={{ color: AMBER }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: AMBER }}>Responsabilidades</span>
          </div>
          {[
            'Agir com imparcialidade e respeito',
            'Garantir condições justas de jogo',
            'Comunicar decisões com clareza',
            'Registrar resultados corretamente',
            'Proteger os dados dos usuários',
            'Zelar pela integridade da competição',
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
              <AlertTriangle size={12} style={{ color: AMBER, marginTop: 2, flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: '#C9D1D9', lineHeight: 1.4 }}>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  if (id === 'results') return (
    <div style={{ padding: '18px 20px' }}>
      {[
        { number: 1, title: 'Quem registra é responsável pela veracidade', body: 'O jogador que registra um resultado declara que as informações são corretas. Resultados falsos são considerados fraude.' },
        { number: 2, title: 'O adversário tem 48h para confirmar ou disputar', body: 'Após o registro, o adversário pode confirmar ou abrir uma disputa. Sem resposta em 48h, o resultado é confirmado automaticamente.' },
        { number: 3, title: 'Disputas são resolvidas pelo administrador', body: 'Em caso de disputa, o administrador analisará as evidências e decidirá o resultado correto. A decisão é final.' },
        { number: 4, title: 'Resultado falso: penalidade severa', body: 'Se o administrador corrigir o resultado, o responsável recebe −50 boletas + suspensão progressiva.', highlight: '1ª vez: 7 dias · 2ª vez: 14 dias · 3ª vez: 30 dias + análise de banimento' },
      ].map(r => <RuleItem key={r.number} {...r} />)}
    </div>
  )

  if (id === 'conduct') return (
    <div style={{ padding: '18px 20px' }}>
      <p style={{ fontSize: 12, color: MUTED, lineHeight: 1.6, margin: '0 0 14px' }}>
        A plataforma preza pelo fair play. Comportamentos inadequados, quando relatados e confirmados, são punidos da mesma forma que fraude de resultados.
      </p>
      {[
        { number: 1, title: 'Qualquer participante pode reportar má conduta', body: 'Após uma partida confirmada, os jogadores podem reportar comportamento inadequado do adversário.' },
        { number: 2, title: 'O administrador analisa todas as denúncias', body: 'Todas as denúncias são registradas e revisadas. Denúncias infundadas também podem ser penalizadas.' },
        { number: 3, title: 'Punições progressivas', body: 'Má conduta confirmada resulta em −50 boletas + suspensão progressiva.' },
      ].map(r => <RuleItem key={r.number} {...r} />)}
    </div>
  )

  if (id === 'candidacy') return (
    <div style={{ padding: '18px 20px' }}>
      {[
        { number: 1, title: 'Só pode criar partidas no esporte cadastrado', body: 'O organizador só pode criar agendamentos para o esporte em que se cadastrou na plataforma.' },
        { number: 2, title: 'Jogadores suspensos não podem participar', body: 'Durante o período de suspensão, não é possível criar ou entrar em agendamentos, registrar partidas ou fazer apostas.' },
        { number: 3, title: 'O organizador tem poder total de aceitar e recusar', body: 'O organizador pode aprovar ou rejeitar qualquer candidato sem necessidade de justificativa.' },
        { number: 4, title: 'Comprometimento é essencial', body: 'Ao ser aprovado em uma partida, o jogador se compromete a comparecer. Ausências injustificadas podem ser reportadas.' },
        { number: 5, title: 'Respeito obrigatório', body: 'Linguagem ofensiva ou ameaças, dentro da plataforma ou nas partidas, são motivo de punição imediata.' },
      ].map(r => <RuleItem key={r.number} {...r} />)}
    </div>
  )

  if (id === 'mvp') return (
    <div style={{ padding: '18px 20px' }}>
      {[
        { number: 1, title: 'Votação disponível após a data da partida', body: 'O botão de votação aparece automaticamente depois que a data/hora da partida passou.' },
        { number: 2, title: 'Cada participante vota uma vez', body: 'Não é possível alterar o voto após a confirmação. Votar em si mesmo não é permitido.' },
        { number: 3, title: 'O MVP recebe +10 boletas', body: 'O jogador com mais votos é declarado MVP. Em caso de empate, o primeiro a atingir o máximo de votos vence.' },
        { number: 4, title: 'Não obrigatório', body: 'A votação é opcional. O resultado é exibido na página da partida.' },
      ].map(r => <RuleItem key={r.number} {...r} />)}
    </div>
  )

  if (id === 'editing') return (
    <div style={{ padding: '18px 20px' }}>
      {[
        { number: 1, title: 'Campos editáveis', body: 'Título, descrição, data, horário, local, cidade e número máximo de vagas podem ser alterados antes do início da partida.' },
        { number: 2, title: 'Não é possível reduzir vagas abaixo do total de confirmados', body: 'Se já há 4 jogadores confirmados, o mínimo de vagas passa a ser 4.' },
        { number: 3, title: 'Agendamentos cancelados ou concluídos não podem ser editados', body: 'Após cancelamento ou conclusão, os dados são preservados para histórico.' },
      ].map(r => <RuleItem key={r.number} {...r} />)}
    </div>
  )

  return null
}

export default function RegrasPage() {
  const [openSections, setOpenSections] = useState<Set<number>>(new Set([1]))

  function toggle(id: number) {
    setOpenSections(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <PageLayout>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#0D1117', minHeight: '100vh', padding: '32px 40px', position: 'relative' }}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 18, marginBottom: 36 }}>
          <div style={{ width: 60, height: 60, borderRadius: 14, background: `${TEAL}15`, border: `2px solid ${TEAL}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 4 }}>
            <ShieldCheck size={28} style={{ color: TEAL }} />
          </div>
          <div>
            <h1 style={{ fontSize: 42, fontWeight: 900, color: '#E6EDF3', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
              Regras da Plataforma
            </h1>
            <p style={{ fontSize: 14, color: TEAL, margin: 0, fontWeight: 500 }}>
              Para manter a competição justa e respeitosa, todos os usuários devem seguir estas regras
            </p>
          </div>
        </div>

        {/* ── Two-column layout ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20, alignItems: 'start' }}>

          {/* LEFT: Accordion sections */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {SECTIONS.map(sec => {
              const Icon = sec.icon
              const isOpen = openSections.has(sec.id)
              return (
                <div key={sec.id} style={{ background: SURF, border: `1px solid ${isOpen ? TEAL + '40' : BORDER}`, borderRadius: 12, overflow: 'hidden', transition: 'border-color .2s' }}>
                  <button
                    onClick={() => toggle(sec.id)}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                  >
                    <div style={{ width: 38, height: 38, borderRadius: 9, background: isOpen ? `${TEAL}20` : SURF2, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background .2s' }}>
                      <Icon size={16} style={{ color: isOpen ? TEAL : MUTED }} />
                    </div>
                    <span style={{ fontSize: 16, fontWeight: 700, color: '#E6EDF3', flex: 1 }}>
                      {sec.id}. {sec.title}
                    </span>
                    {isOpen
                      ? <ChevronUp size={16} style={{ color: MUTED, flexShrink: 0 }} />
                      : <ChevronDown size={16} style={{ color: MUTED, flexShrink: 0 }} />}
                  </button>

                  {isOpen && (
                    <div style={{ borderTop: `1px solid ${BORDER}` }}>
                      <SectionContent id={sec.content} />
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* RIGHT: Punishments + Boletas summary */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Sistema de Punições */}
            <div style={{ background: SURF, border: `1px solid ${BORDER}`, borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 18px', borderBottom: `1px solid ${BORDER}` }}>
                <div style={{ width: 34, height: 34, borderRadius: 8, background: SURF2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Gavel size={15} style={{ color: MUTED }} />
                </div>
                <p style={{ fontSize: 15, fontWeight: 700, color: '#E6EDF3', margin: 0 }}>Sistema de Punições</p>
              </div>

              {/* Table header */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 90px 90px', padding: '9px 16px', background: '#0D1117', borderBottom: `1px solid ${BORDER}` }}>
                {['Infração', '1ª Ocorr.', '2ª Ocorr.', '3ª Ocorr.'].map(h => (
                  <span key={h} style={{ fontSize: 10, fontWeight: 700, color: '#4A5A6A', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{h}</span>
                ))}
              </div>

              {PUNISHMENTS.map((row, i) => {
                const Icon = row.icon
                return (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 90px 90px', alignItems: 'center', gap: 4, padding: '10px 16px', borderBottom: `1px solid ${BORDER}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <div style={{ width: 26, height: 26, borderRadius: 6, background: SURF2, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Icon size={11} style={{ color: MUTED }} />
                      </div>
                      <span style={{ fontSize: 11, color: '#C9D1D9', fontWeight: 500, lineHeight: 1.3 }}>{row.label}</span>
                    </div>
                    <PunishmentBadge text={row.p1.text} color={row.p1.color} />
                    <PunishmentBadge text={row.p2.text} color={row.p2.color} />
                    <PunishmentBadge text={row.p3.text} color={row.p3.color} />
                  </div>
                )
              })}
            </div>

            {/* Resumo de Boletas */}
            <div style={{ background: SURF, border: `1px solid ${BORDER}`, borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 18px', borderBottom: `1px solid ${BORDER}` }}>
                <div style={{ width: 34, height: 34, borderRadius: 8, background: SURF2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Coins size={15} style={{ color: MUTED }} />
                </div>
                <p style={{ fontSize: 15, fontWeight: 700, color: '#E6EDF3', margin: 0 }}>Resumo de Boletas</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
                {/* Ganhos */}
                <div style={{ padding: '14px 16px', borderRight: `1px solid ${BORDER}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: `${TEAL}20`, border: `1px solid ${TEAL}40`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: 10 }}>✓</span>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: TEAL }}>Ganhos</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '6px 10px', alignItems: 'center' }}>
                    {[['Boleta', 'Significado'], ['1', 'Vitória'], ['2', 'W.O. a Favor'], ['3', 'Vantagem Técnica']].map(([b, s], i) => (
                      <Fragment key={i}>
                        <span style={{ fontSize: i === 0 ? 10 : 12, fontWeight: i === 0 ? 700 : 900, color: i === 0 ? '#4A5A6A' : TEAL, textTransform: i === 0 ? 'uppercase' : undefined, letterSpacing: i === 0 ? '0.06em' : undefined }}>{b}</span>
                        <span style={{ fontSize: i === 0 ? 10 : 12, fontWeight: i === 0 ? 700 : 400, color: i === 0 ? '#4A5A6A' : '#C9D1D9', textTransform: i === 0 ? 'uppercase' : undefined, letterSpacing: i === 0 ? '0.06em' : undefined }}>{s}</span>
                      </Fragment>
                    ))}
                  </div>
                </div>

                {/* Perdas */}
                <div style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: `${RED}20`, border: `1px solid ${RED}40`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: 10 }}>✕</span>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: RED }}>Perdas</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '6px 10px', alignItems: 'center' }}>
                    {[['Boleta', 'Significado'], ['-1', 'Derrota'], ['-2', 'W.O. Contra'], ['-3', 'Vant. Técnica Contra']].map(([b, s], i) => (
                      <Fragment key={i}>
                        <span style={{ fontSize: i === 0 ? 10 : 12, fontWeight: i === 0 ? 700 : 900, color: i === 0 ? '#4A5A6A' : RED, textTransform: i === 0 ? 'uppercase' : undefined, letterSpacing: i === 0 ? '0.06em' : undefined }}>{b}</span>
                        <span style={{ fontSize: i === 0 ? 10 : 12, fontWeight: i === 0 ? 700 : 400, color: i === 0 ? '#4A5A6A' : '#C9D1D9', textTransform: i === 0 ? 'uppercase' : undefined, letterSpacing: i === 0 ? '0.06em' : undefined }}>{s}</span>
                      </Fragment>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer note */}
            <p style={{ fontSize: 11, color: '#4A5A6A', lineHeight: 1.5, margin: 0 }}>
              Estas regras podem ser atualizadas a qualquer momento. Dúvidas:{' '}
              <a href="mailto:contato@rank.app" style={{ color: TEAL, textDecoration: 'none' }}>contato@rank.app</a>
            </p>
          </div>
        </div>

        {/* ── FAB ── */}
        <div style={{ position: 'fixed', bottom: 32, right: 32, zIndex: 50 }}>
          <Link href="/schedule/new" style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: TEAL, color: '#0D1117', fontSize: 14, fontWeight: 700,
            padding: '13px 20px', borderRadius: 40, textDecoration: 'none',
            boxShadow: `0 4px 24px rgba(0,191,165,0.4)`,
          }}>
            <div style={{ width: 26, height: 26, borderRadius: '50%', border: '2px solid rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Plus size={14} style={{ color: '#0D1117' }} />
            </div>
            Registrar Partida
          </Link>
        </div>
      </div>
    </PageLayout>
  )
}
