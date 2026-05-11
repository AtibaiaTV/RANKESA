import type { GenderType, MatchType, Sport } from '@rank-app/shared'

export const SPORT_OPTIONS: { value: Sport; label: string }[] = [
  { value: 'TENNIS' as Sport,           label: 'Tênis' },
  { value: 'PADEL' as Sport,            label: 'Padel' },
  { value: 'BEACH_TENNIS' as Sport,     label: 'Beach Tennis' },
  { value: 'SQUASH' as Sport,           label: 'Squash' },
  { value: 'BADMINTON' as Sport,        label: 'Badminton' },
  { value: 'TABLE_TENNIS' as Sport,     label: 'Tênis de Mesa' },
  { value: 'VOLLEYBALL' as Sport,       label: 'Vôlei' },
  { value: 'BEACH_VOLLEYBALL' as Sport, label: 'Vôlei de Areia' },
  { value: 'FOOTVOLLEY' as Sport,       label: 'Futevôlei' },
  { value: 'FUTSAL' as Sport,           label: 'Futsal' },
  { value: 'BASKETBALL' as Sport,       label: 'Basquete' },
  { value: 'FOOTBALL' as Sport,         label: 'Futebol' },
  { value: 'HANDBALL' as Sport,         label: 'Handebol' },
  { value: 'CHESS' as Sport,            label: 'Xadrez' },
]

export const SPORT_LABEL: Record<string, string> = Object.fromEntries(
  SPORT_OPTIONS.map((o) => [o.value, o.label]),
)

export const MATCH_TYPE_OPTIONS: { value: MatchType; label: string }[] = [
  { value: 'INDIVIDUAL' as MatchType, label: 'Individual (1v1)' },
  { value: 'DOUBLES' as MatchType,    label: 'Duplas (2v2)' },
  { value: 'TEAM' as MatchType,       label: 'Times (NvN)' },
]

export const MATCH_TYPE_LABEL: Record<string, string> = {
  'INDIVIDUAL': 'Individual',
  'DOUBLES':    'Duplas',
  'TEAM':       'Times',
}

export const GENDER_TYPE_OPTIONS: { value: GenderType; label: string }[] = [
  { value: 'MIXED' as GenderType,  label: 'Misto' },
  { value: 'MALE' as GenderType,   label: 'Masculino' },
  { value: 'FEMALE' as GenderType, label: 'Feminino' },
]

export const GENDER_TYPE_LABEL: Record<string, string> = {
  'MIXED':  'Misto',
  'MALE':   'Masculino',
  'FEMALE': 'Feminino',
}

export const TEAM_SPORTS = new Set<Sport>([
  'VOLLEYBALL' as Sport,
  'BEACH_VOLLEYBALL' as Sport,
  'FOOTVOLLEY' as Sport,
  'FUTSAL' as Sport,
  'BASKETBALL' as Sport,
  'FOOTBALL' as Sport,
  'HANDBALL' as Sport,
])

export function defaultMaxPlayers(sport: Sport, matchType: MatchType): number {
  if (matchType === ('INDIVIDUAL' as MatchType)) return 2
  if (matchType === ('DOUBLES' as MatchType)) return 4
  const teamDefaults: Partial<Record<string, number>> = {
    'VOLLEYBALL':       12,
    'BEACH_VOLLEYBALL':  4,
    'FOOTVOLLEY':        4,
    'FUTSAL':           10,
    'BASKETBALL':       10,
    'FOOTBALL':         22,
    'HANDBALL':         14,
  }
  return teamDefaults[sport as string] ?? 10
}
