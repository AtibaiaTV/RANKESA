import { GenderType, MatchType, Sport } from '@rank-app/shared'

export const SPORT_OPTIONS = [
  { value: Sport.TENNIS, label: '🎾 Tênis' },
  { value: Sport.PADEL, label: '🎾 Padel' },
  { value: Sport.BEACH_TENNIS, label: '🏖️ Beach Tennis' },
  { value: Sport.SQUASH, label: '🟡 Squash' },
  { value: Sport.BADMINTON, label: '🏸 Badminton' },
  { value: Sport.TABLE_TENNIS, label: '🏓 Tênis de Mesa' },
  { value: Sport.VOLLEYBALL, label: '🏐 Vôlei' },
  { value: Sport.BEACH_VOLLEYBALL, label: '🏖️ Vôlei de Areia' },
  { value: Sport.FOOTVOLLEY, label: '🦶 Futevôlei' },
  { value: Sport.FUTSAL, label: '👟 Futsal' },
  { value: Sport.BASKETBALL, label: '🏀 Basquete' },
  { value: Sport.FOOTBALL, label: '⚽ Futebol' },
  { value: Sport.HANDBALL, label: '🤾 Handebol' },
  { value: Sport.CHESS, label: '♟️ Xadrez' },
]

export const SPORT_LABEL: Record<Sport, string> = Object.fromEntries(
  SPORT_OPTIONS.map((o) => [o.value, o.label]),
) as Record<Sport, string>

export const MATCH_TYPE_OPTIONS = [
  { value: MatchType.INDIVIDUAL, label: 'Individual (1v1)' },
  { value: MatchType.DOUBLES, label: 'Duplas (2v2)' },
  { value: MatchType.TEAM, label: 'Times (NvN)' },
]

export const MATCH_TYPE_LABEL: Record<MatchType, string> = {
  [MatchType.INDIVIDUAL]: 'Individual',
  [MatchType.DOUBLES]: 'Duplas',
  [MatchType.TEAM]: 'Times',
}

export const GENDER_TYPE_OPTIONS = [
  { value: GenderType.MIXED, label: '🤝 Misto' },
  { value: GenderType.MALE, label: '👨 Masculino' },
  { value: GenderType.FEMALE, label: '👩 Feminino' },
]

export const GENDER_TYPE_LABEL: Record<GenderType, string> = {
  [GenderType.MIXED]: 'Misto',
  [GenderType.MALE]: 'Masculino',
  [GenderType.FEMALE]: 'Feminino',
}

// Esportes que fazem sentido como coletivo (time)
export const TEAM_SPORTS = new Set<Sport>([
  Sport.VOLLEYBALL,
  Sport.BEACH_VOLLEYBALL,
  Sport.FOOTVOLLEY,
  Sport.FUTSAL,
  Sport.BASKETBALL,
  Sport.FOOTBALL,
  Sport.HANDBALL,
])

export function defaultMaxPlayers(sport: Sport, matchType: MatchType): number {
  if (matchType === MatchType.INDIVIDUAL) return 2
  if (matchType === MatchType.DOUBLES) return 4
  const teamDefaults: Partial<Record<Sport, number>> = {
    [Sport.VOLLEYBALL]: 12,
    [Sport.BEACH_VOLLEYBALL]: 4,
    [Sport.FOOTVOLLEY]: 4,
    [Sport.FUTSAL]: 10,
    [Sport.BASKETBALL]: 10,
    [Sport.FOOTBALL]: 22,
    [Sport.HANDBALL]: 14,
  }
  return teamDefaults[sport] ?? 10
}
