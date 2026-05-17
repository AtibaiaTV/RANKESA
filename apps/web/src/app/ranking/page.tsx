import Link from 'next/link'
export const dynamic = 'force-dynamic'
import { getPlayers } from '@/lib/api/players'
import { PageLayout } from '@/components/layout/page-layout'
import { PlayerAvatar } from '@/components/ui/player-avatar'
import { Gender, PlayerLevel, Sport } from '@rank-app/shared'
import { SPORT_OPTIONS, SPORT_LABEL } from '@/lib/sports'
import { ChevronDown, TrendingUp } from 'lucide-react'

const TEAL   = '#00BFA5'
const SURF   = '#161B22'
const BORDER = '#30363D'
const MUTED  = '#8B949E'

const LEVEL_LABELS: Record<PlayerLevel, string> = {
  [PlayerLevel.BEGINNER]:     'Iniciante',
  [PlayerLevel.INTERMEDIATE]: 'Intermediário',
  [PlayerLevel.ADVANCED]:     'Avançado',
}

const TOP_TABS = SPORT_OPTIONS.slice(0, 5)

export default async function RankingPage({
  searchParams,
}: {
  searchParams: Promise<{
    sport?: string; level?: string; gender?: string
    city?: string; state?: string; page?: string
  }>
}) {
  const params = await searchParams
  const page   = Number(params.page ?? 1)

  const { data: players, total } = await getPlayers({
    sport:  params.sport  as Sport        | undefined,
    level:  params.level  as PlayerLevel  | undefined,
    gender: params.gender as Gender       | undefined,
    city:   params.city,
    state:  params.state,
    page, limit: 20,
  })

  function buildUrl(overrides: Record<string, string | undefined>) {
    const merged = { ...params, ...overrides, page: undefined }
    const qs = new URLSearchParams(
      Object.entries(merged).filter(([, v]) => v !== undefined && v !== '') as [string, string][],
    ).toString()
    return `/ranking${qs ? `?${qs}` : ''}`
  }

  const activeSport = params.sport ?? ''
  const top3  = page === 1 ? players.slice(0, 3) : []
  const rest  = page === 1 ? players.slice(3)    : players

  return (
    <PageLayout>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#0D1117', minHeight: '100vh', padding: '32px 40px' }}>

        {/* Title */}
        <h1 style={{ fontSize: 36, fontWeight: 900, color: '#E6EDF3', margin: '0 0 24px', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 12 }}>
          <TrendingUp size={30} style={{ color: TEAL }} />
          Ranking
        </h1>

        {/* Sport tabs + level filter */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', borderBottom: `1px solid ${BORDER}`, marginBottom: 36 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 0, overflowX: 'auto' }}>
            {/* All tab */}
            <Link href={buildUrl({ sport: undefined })}
              style={{
                padding: '10px 20px', fontSize: 14, fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap',
                color: !activeSport ? TEAL : MUTED,
                borderBottom: !activeSport ? `2px solid ${TEAL}` : '2px solid transparent',
                marginBottom: -1,
              }}>
              Todos
            </Link>
            {TOP_TABS.map(s => (
              <Link key={s.value} href={buildUrl({ sport: s.value })}
                style={{
                  padding: '10px 20px', fontSize: 14, fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap',
                  color: activeSport === s.value ? TEAL : MUTED,
                  borderBottom: activeSport === s.value ? `2px solid ${TEAL}` : '2px solid transparent',
                  marginBottom: -1,
                }}>
                {s.label}
              </Link>
            ))}
            {SPORT_OPTIONS.length > 5 && (
              <span style={{ padding: '10px 20px', fontSize: 14, color: MUTED, cursor: 'default' }}>
                + mais
              </span>
            )}
          </div>

          {/* Level filter */}
          <form method="get" action="/ranking" style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 8, flexShrink: 0 }}>
            {params.sport  && <input type="hidden" name="sport"  value={params.sport}  />}
            {params.gender && <input type="hidden" name="gender" value={params.gender} />}
            <div style={{ position: 'relative' }}>
              <select name="level" defaultValue={params.level ?? ''}
                style={{
                  background: SURF, border: `1px solid ${BORDER}`, borderRadius: 8,
                  padding: '8px 36px 8px 14px', fontSize: 13, color: '#E6EDF3',
                  appearance: 'none', cursor: 'pointer', outline: 'none',
                }}>
                <option value="">Nível: Todos os níveis</option>
                <option value={PlayerLevel.BEGINNER}>Iniciante</option>
                <option value={PlayerLevel.INTERMEDIATE}>Intermediário</option>
                <option value={PlayerLevel.ADVANCED}>Avançado</option>
              </select>
              <ChevronDown size={13} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: MUTED, pointerEvents: 'none' }} />
            </div>
            <button type="submit"
              style={{ marginLeft: 8, background: TEAL, color: '#0D1117', fontSize: 13, fontWeight: 700, padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer' }}>
              Filtrar
            </button>
          </form>
        </div>

        {/* ── Pódio top 3 ── */}
        {top3.length >= 3 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 12, marginBottom: 48 }}>

            {/* 2nd place */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, maxWidth: 200 }}>
              <div style={{ position: 'relative', marginBottom: 12 }}>
                <div style={{ width: 80, height: 80, borderRadius: '50%', border: '3px solid #9CA3AF', overflow: 'hidden' }}>
                  <PlayerAvatar name={top3[1].name} avatar={top3[1].avatar} size="lg" ring="none" />
                </div>
                <div style={{ position: 'absolute', top: -6, left: -6, width: 26, height: 26, borderRadius: '50%', background: '#6B7280', border: '2px solid #0D1117', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900, color: '#fff' }}>
                  2
                </div>
              </div>
              <p style={{ fontSize: 15, fontWeight: 700, color: '#E6EDF3', margin: '0 0 2px', textAlign: 'center' }}>{top3[1].name}</p>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#9CA3AF', margin: '0 0 16px' }}>{top3[1].elo.toLocaleString('pt-BR')} pts</p>
              <div style={{ width: '100%', height: 90, background: 'linear-gradient(180deg, #9CA3AF 0%, #4B5563 100%)', borderRadius: '10px 10px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 36, fontWeight: 900, color: 'rgba(255,255,255,0.25)', lineHeight: 1 }}>2</span>
              </div>
            </div>

            {/* 1st place */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, maxWidth: 220 }}>
              <div style={{ position: 'relative', marginBottom: 12 }}>
                <div style={{ width: 96, height: 96, borderRadius: '50%', border: '3px solid #F0B429', overflow: 'hidden' }}>
                  <PlayerAvatar name={top3[0].name} avatar={top3[0].avatar} size="xl" ring="none" />
                </div>
                <div style={{ position: 'absolute', top: -8, left: -8, width: 30, height: 30, borderRadius: '50%', background: '#F0B429', border: '2px solid #0D1117', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 900, color: '#0D1117' }}>
                  1
                </div>
              </div>
              <p style={{ fontSize: 17, fontWeight: 900, color: '#E6EDF3', margin: '0 0 2px', textAlign: 'center' }}>{top3[0].name}</p>
              <p style={{ fontSize: 15, fontWeight: 700, color: '#F0B429', margin: '0 0 16px' }}>{top3[0].elo.toLocaleString('pt-BR')} pts</p>
              <div style={{ width: '100%', height: 120, background: 'linear-gradient(180deg, #D97706 0%, #92400E 100%)', borderRadius: '10px 10px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 52, fontWeight: 900, color: 'rgba(255,255,255,0.2)', lineHeight: 1 }}>1</span>
              </div>
            </div>

            {/* 3rd place */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, maxWidth: 200 }}>
              <div style={{ position: 'relative', marginBottom: 12 }}>
                <div style={{ width: 72, height: 72, borderRadius: '50%', border: '3px solid #CD7C2F', overflow: 'hidden' }}>
                  <PlayerAvatar name={top3[2].name} avatar={top3[2].avatar} size="md" ring="none" />
                </div>
                <div style={{ position: 'absolute', top: -6, left: -6, width: 24, height: 24, borderRadius: '50%', background: '#CD7C2F', border: '2px solid #0D1117', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 900, color: '#fff' }}>
                  3
                </div>
              </div>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#E6EDF3', margin: '0 0 2px', textAlign: 'center' }}>{top3[2].name}</p>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#CD7C2F', margin: '0 0 16px' }}>{top3[2].elo.toLocaleString('pt-BR')} pts</p>
              <div style={{ width: '100%', height: 68, background: 'linear-gradient(180deg, #CD7C2F 0%, #78350F 100%)', borderRadius: '10px 10px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 28, fontWeight: 900, color: 'rgba(255,255,255,0.25)', lineHeight: 1 }}>3</span>
              </div>
            </div>

          </div>
        )}

        {/* ── Tabela ── */}
        <div style={{ background: SURF, border: `1px solid ${BORDER}`, borderRadius: 12, overflow: 'hidden' }}>

          {/* Header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '56px 1fr 140px 90px 90px 130px',
            padding: '12px 20px',
            borderBottom: `1px solid ${BORDER}`,
            background: '#0D1117',
          }}>
            {['Posição', 'Jogador', 'Esporte', 'Vitórias', 'Derrotas', 'Pontos'].map(h => (
              <span key={h} style={{ fontSize: 11, fontWeight: 700, color: '#4A5A6A', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                {h}
              </span>
            ))}
          </div>

          {rest.length === 0 && top3.length === 0 ? (
            <div style={{ padding: '48px 20px', textAlign: 'center' }}>
              <p style={{ color: MUTED, fontSize: 14, margin: '0 0 8px' }}>Nenhum atleta encontrado</p>
              <Link href="/ranking" style={{ color: TEAL, fontSize: 13, textDecoration: 'none' }}>Limpar filtros</Link>
            </div>
          ) : (
            rest.map((player, index) => {
              const pos = (page - 1) * 20 + index + (page === 1 ? 4 : 1)
              return (
                <Link key={player._id} href={`/players/${player._id}`}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '56px 1fr 140px 90px 90px 130px',
                    padding: '14px 20px',
                    textDecoration: 'none',
                    borderBottom: `1px solid ${BORDER}`,
                    borderLeft: '3px solid transparent',
                    transition: 'background .15s',
                  }}
                  onMouseEnter={undefined}
                >
                  {/* Pos */}
                  <span style={{ fontSize: 14, fontWeight: 600, color: MUTED, alignSelf: 'center' }}>
                    {pos}
                  </span>

                  {/* Player */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <PlayerAvatar name={player.name} avatar={player.avatar} size="sm" ring="none" />
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 700, color: '#E6EDF3', margin: 0 }}>{player.name}</p>
                      {player.city && (
                        <p style={{ fontSize: 11, color: '#4A5A6A', margin: 0, marginTop: 1 }}>
                          {player.city}{player.state ? `, ${player.state}` : ''}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Sport */}
                  <span style={{ fontSize: 13, color: MUTED, alignSelf: 'center' }}>
                    {SPORT_LABEL[player.sport]}
                  </span>

                  {/* Wins */}
                  <span style={{ fontSize: 14, fontWeight: 700, color: TEAL, alignSelf: 'center' }}>
                    {player.wins}
                  </span>

                  {/* Losses */}
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#F87171', alignSelf: 'center' }}>
                    {player.losses}
                  </span>

                  {/* Points */}
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#E6EDF3', alignSelf: 'center' }}>
                    {player.elo.toLocaleString('pt-BR')} pts
                  </span>
                </Link>
              )
            })
          )}
        </div>

        {/* ── Paginação ── */}
        {total > 20 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 }}>
            {page > 1 ? (
              <Link href={buildUrl({ page: String(page - 1) })}
                style={{ fontSize: 13, fontWeight: 600, color: TEAL, textDecoration: 'none' }}>
                ← Anterior
              </Link>
            ) : <span />}
            <span style={{ fontSize: 12, color: MUTED }}>{page} de {Math.ceil(total / 20)}</span>
            {page < Math.ceil(total / 20) && (
              <Link href={buildUrl({ page: String(page + 1) })}
                style={{ fontSize: 13, fontWeight: 600, color: TEAL, textDecoration: 'none' }}>
                Próxima →
              </Link>
            )}
          </div>
        )}

      </div>
    </PageLayout>
  )
}
